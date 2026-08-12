"use server";

import { anthropic, MODELS } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

import { classifiedProfileSchema, classifyInputSchema } from "../schema";
import type { ClassifiedProfile, ClassifyInput } from "../types";

function buildClassifierPrompt(input: ClassifyInput): {
  system: string;
  user: string;
} {
  const system = `You are a LinkedIn profile classifier for a job-seeker's outreach tool.

Given raw pasted text from a LinkedIn profile page, extract and classify the contact.

OUTPUT FORMAT: Respond ONLY with valid JSON matching this schema:
{
  "name": string,           // Their full name
  "company": string,        // Current company (if visible)
  "category": string,       // Primary category - one of: RECRUITER_EMBEDDED, RECRUITER_AGENCY, RECRUITER_VENDOR, ALUMNI, STACK_MATCH, HIRING_MANAGER, UNKNOWN
  "secondaryCategories": string[], // Additional categories that apply (e.g., ALUMNI if they're also from the same school)
  "connectionState": string, // One of: CONNECTED, NOT_CONNECTED, UNKNOWN_STATE
  "suggestedMode": string | null, // "CONNECTION_NOTE" if not connected, "FIRST_DM" if connected, null if unknown
  "cleanedProfileText": string, // Cleaned summary of their profile (title, skills, experience highlights) ~200 chars
  "vendorEmail": string | null, // Email if they're a vendor recruiter and one is visible
  "linkedinUrl": string | null, // LinkedIn URL if found in the text
  "confidence": number,     // 0-1 confidence in classification
  "reasoning": string       // Brief explanation of classification logic
}

CATEGORY RULES:
- RECRUITER_EMBEDDED: Self-employed, freelance, fractional, or embedded talent partner. Works with one or two client companies at a time, no standing req list. Signals: "self-employed", "embedded", "fractional", "talent partner", currently self-employed in the experience section, writes long-form original content about hiring process rather than posting job listings.
- RECRUITER_AGENCY: Employed at a named staffing firm with a live req list. Signals: works at a recognizable staffing firm (S.i. Systems, Robert Half, Randstad, Hays, Procom, Alteo, TEKsystems, Akkodis), posts a recurring structured job board, titles like "Sr. Technical Recruiter".
- RECRUITER_VENDOR: High-volume staffing vendor or implementation partner. Signals (any one is enough): recruiter located in India while recruiting for Canada or the US; headline or About mentions tax terms (W2, C2C, 1099, T4, Corp-to-Corp) or visa/work-authorization expertise; posts are mostly reposts of colleagues' roles rather than original content; posts stuffed with hashtags and a contact email in the body; roles requiring 8-10+ years; subcontracting to large consultancies (TCS, Luxoft, Virtusa, Altimetrik, Hexaware, Coforge, LTIM).
- ALUMNI: They attended the same school as the user${input.schoolName ? ` (${input.schoolName})` : ""} — look for education match
- STACK_MATCH: Software engineer/dev using similar tech stack${input.techStack ? ` (${input.techStack})` : ""}
- HIRING_MANAGER: Engineering leadership at a company that might hire directly (Staff+, Lead, Manager, Director, VP of Engineering).
- UNKNOWN: Can't determine role or category

CONNECTION STATE DETECTION:
- Look for UI indicators: "Message" button alone = CONNECTED, "Connect" button = NOT_CONNECTED
- Text like "1st", "2nd", "3rd" degree connections
- If text says "Following" or shows message history = CONNECTED
- Default to UNKNOWN_STATE if unclear

MESSAGE MODE:
- NOT_CONNECTED → suggestedMode: "CONNECTION_NOTE" (200 char limit request note)
- CONNECTED → suggestedMode: "FIRST_DM" (full DM, no limit)
- UNKNOWN_STATE → suggestedMode: null

PRIORITY (for mixed signals): RECRUITER_* > HIRING_MANAGER > STACK_MATCH > ALUMNI
Alumni is a personalization hook, not a category override.`;

  const user = `Raw pasted LinkedIn profile text:

${input.rawText}`;

  return { system, user };
}

export async function classifyProfile(
  input: ClassifyInput
): Promise<ClassifiedProfile | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = classifyInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { system, user: userContent } = buildClassifierPrompt(parsed.data);

  try {
    const response = await anthropic.messages.create({
      model: MODELS.parse,
      max_tokens: 800,
      system,
      messages: [{ role: "user", content: userContent }],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { error: "No response from classifier" };
    }

    const jsonText = textContent.text.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: "Invalid JSON response from classifier" };
    }

    const rawResult = JSON.parse(jsonMatch[0]);
    const validated = classifiedProfileSchema.safeParse(rawResult);

    if (!validated.success) {
      console.error("Classifier output validation failed:", validated.error);
      return { error: "Classifier returned invalid data structure" };
    }

    return validated.data;
  } catch (err) {
    console.error("Profile classification error:", err);
    return { error: "Failed to classify profile" };
  }
}
