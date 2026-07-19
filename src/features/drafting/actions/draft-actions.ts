"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { anthropic, MODELS } from "@/lib/anthropic";
import { MOCK_CONNECTION_DRAFT, MOCK_REPLY_DRAFT, USE_MOCK_DATA } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

import {
  buildConnectionNotePrompt,
  buildFirstDMPrompt,
  buildReplyDraftPrompt,
  type ThreadMessage,
  type UserProfile,
} from "../prompts";

const connectionDraftSchema = z.object({
  profileText: z.string().min(1, "Profile text is required"),
  company: z.string().min(1, "Company is required"),
  angle: z.enum(["ALUM", "STACK", "RECRUITER"]),
});

export type ConnectionDraftInput = z.infer<typeof connectionDraftSchema>;

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return null;
  }

  return {
    name: profile.name,
    role: profile.role,
    location: profile.location,
    stack: profile.stack,
    experience: profile.experience,
    education: profile.education,
    summary: profile.summary,
  };
}

export async function draftConnectionNote(
  input: ConnectionDraftInput
): Promise<{ draft: string } | { error: string }> {
  // Mock mode: return pre-written draft, no auth/DB/Claude
  if (USE_MOCK_DATA) {
    return { draft: MOCK_CONNECTION_DRAFT };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = connectionDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    return { error: "Profile not found. Please complete your profile first." };
  }

  try {
    const prompt = buildConnectionNotePrompt({
      ...parsed.data,
      userProfile,
    });

    let draft = await generateDraft(prompt);

    // Enforce 200-char ceiling: retry once then trim at sentence boundary
    if (draft.length > 200) {
      const retryPrompt = {
        system: prompt.system,
        messages: [
          ...prompt.messages,
          { role: "assistant" as const, content: draft },
          { role: "user" as const, content: `Your draft was ${draft.length} characters. Rewrite it under 180 characters, same intent.` },
        ],
      };

      const shorterDraft = await generateDraft(retryPrompt);
      
      if (shorterDraft.length <= 200) {
        draft = shorterDraft;
      } else {
        draft = trimAtSentenceBoundary(shorterDraft, 200);
      }
    }

    return { draft };
  } catch (err) {
    console.error("Connection draft error:", err);
    return { error: "Failed to generate draft" };
  }
}

async function generateDraft(prompt: { system: string; messages: Array<{ role: "user" | "assistant"; content: string }> }): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODELS.draft,
    max_tokens: 400,
    system: prompt.system,
    messages: prompt.messages,
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

function trimAtSentenceBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? "),
    truncated.lastIndexOf(".")
  );

  if (lastSentenceEnd > maxLength * 0.5) {
    return text.slice(0, lastSentenceEnd + 1).trim();
  }

  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return text.slice(0, lastSpace).trim();
  }

  // Last resort: hard truncate
  return truncated.trim();
}

export async function draftReply(
  contactId: string,
  intent?: string
): Promise<{ draft: string } | { error: string }> {
  // Mock mode: return pre-written draft, no auth/DB/Claude
  if (USE_MOCK_DATA) {
    return { draft: MOCK_REPLY_DRAFT };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    return { error: "Profile not found. Please complete your profile first." };
  }

  try {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!contact) {
      return { error: "Contact not found" };
    }

    if (contact.messages.length === 0) {
      return { error: "No messages in thread" };
    }

    const thread: ThreadMessage[] = contact.messages.map((msg) => ({
      role: msg.role,
      text: msg.text,
    }));

    const prompt = buildReplyDraftPrompt({
      contactName: contact.name,
      company: contact.company,
      angle: contact.angle,
      profileText: contact.profileText ?? "",
      thread,
      userProfile,
      intent,
    });

    const response = await anthropic.messages.create({
      model: MODELS.draft,
      max_tokens: 400,
      system: prompt.system,
      messages: prompt.messages,
    });

    const draft = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return { draft };
  } catch (err) {
    console.error("Reply draft error:", err);
    return { error: "Failed to generate draft" };
  }
}

const parseProfileSchema = z.object({
  rawProfileText: z.string().min(20, "Profile text is too short"),
});

export type ParsedLinkedInProfile = {
  name: string;
  headline: string;
  about: string;
  experience: string;
};

const parsedLinkedInProfileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  about: z.string(),
  experience: z.string(),
});

export async function parseLinkedInProfile(
  rawProfileText: string
): Promise<{ profile: ParsedLinkedInProfile } | { error: string }> {
  // Validate authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate input
  const parsed = parseProfileSchema.safeParse({ rawProfileText });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const response = await anthropic.messages.create({
      model: MODELS.parse,
      max_tokens: 1000,
      system: `You extract structured data from raw LinkedIn profile text a user copied from their browser. You are a parser, not a writer.

Rules:
- Extract ONLY information explicitly present. If a field is absent, return "". NEVER guess or fabricate — especially names, employers, or dates.
- "about": at most 2 sentences, in the person's own framing.
- "experience": current/most-recent role only, as "Role at Company".

Output VALID JSON only — no markdown, no fences, no commentary:
{"name":"","headline":"","about":"","experience":""}`,
      messages: [
        {
          role: "user",
          content: `Parse this LinkedIn profile text:\n\n${parsed.data.rawProfileText}`,
        },
      ],
    });

    let text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    // Strip markdown code blocks if present (```json ... ```)
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    // Parse and validate JSON response
    let rawProfile: unknown;
    try {
      rawProfile = JSON.parse(text);
    } catch {
      return { error: "Could not parse profile. Please try again or copy more text." };
    }

    const validated = parsedLinkedInProfileSchema.safeParse(rawProfile);
    if (!validated.success) {
      return { error: "Could not extract profile fields. Please try again." };
    }

    // Validate we got at least a name
    if (!validated.data.name || validated.data.name.trim().length === 0) {
      return { error: "Could not extract name from profile" };
    }

    return { profile: validated.data };
  } catch (err) {
    console.error("Profile parse error:", err);
    return { error: "Failed to parse profile. Make sure you copied enough text." };
  }
}

/**
 * Draft the first DM for a REQUESTED contact after they accept.
 * Fuller message (no 200-char limit), same process-intel goal.
 */
export async function draftFirstDM(
  contactId: string
): Promise<{ draft: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    return { error: "Profile not found. Please complete your profile first." };
  }

  try {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: user.id },
    });

    if (!contact) {
      return { error: "Contact not found" };
    }

    const prompt = buildFirstDMPrompt({
      contactName: contact.name,
      company: contact.company,
      angle: contact.angle,
      profileText: contact.profileText ?? "",
      userProfile,
    });

    // DEBUG: Log actual values reaching the prompt builder (enable with DEBUG_DRAFTS=true)
    if (process.env.DEBUG_DRAFTS === "true") {
      console.log("[draftFirstDM DEBUG] contact.name:", JSON.stringify(contact.name));
      console.log("[draftFirstDM DEBUG] contact.company:", JSON.stringify(contact.company));
      console.log("[draftFirstDM DEBUG] userProfile.education:", JSON.stringify(userProfile.education));
      console.log("[draftFirstDM DEBUG] userProfile.experience:", JSON.stringify(userProfile.experience));
      console.log("[draftFirstDM DEBUG] userProfile.name:", JSON.stringify(userProfile.name));
    }

    const response = await anthropic.messages.create({
      model: MODELS.draft,
      max_tokens: 400,
      system: prompt.system,
      messages: prompt.messages,
    });

    const draft = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return { draft };
  } catch (err) {
    console.error("First DM draft error:", err);
    return { error: "Failed to generate draft" };
  }
}
