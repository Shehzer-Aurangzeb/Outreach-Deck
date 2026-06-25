import type { Angle, Role } from "@prisma/client";

export interface UserProfile {
  name: string;
  role: string;
  location: string;
  stack: string;
  experience: string;
  education: string;
  summary?: string | null;
}

export function extractSchoolName(education: string): string | null {
  if (!education || education.trim().length === 0) return null;

  // Common patterns: "M.S. Computer Science, University of X" or "University of X" or "X University"
  const universityPatterns = [
    /(?:University\s+of\s+[\w\s]+)/i,
    /(?:[\w\s]+\s+University)/i,
    /(?:[\w\s]+\s+College)/i,
    /(?:[\w\s]+\s+Institute\s+of\s+Technology)/i,
    /(?:MIT|Stanford|Harvard|Berkeley|Waterloo|Concordia|McGill|UBC|Toronto)/i,
  ];

  for (const pattern of universityPatterns) {
    const match = education.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  // If no pattern matches, return the education string (might contain school info)
  return education.trim();
}

function buildConnectionSystemPrompt(profile: UserProfile): string {
  return `You write LinkedIn connection-request notes AS ${profile.name}: a ${profile.role} in ${profile.location} (${profile.stack}), ${profile.experience} experience, ${profile.education}, job-searching in Canada.

This is a FIRST-TOUCH note on a connection request. The ONLY goal is PROCESS INTEL: politely ask how this person got into their company and/or what ${profile.name} should focus on over the next 2–3 months to land a role there. It is NOT a referral ask — too much, too soon. It is NOT a technical conversation — do not ask about their company's tech stack, architecture, how they build things, or "their technical direction."

Hard rules:
- Output ONLY the message text — no preamble, no quotes.
- Target ~180 characters. Treat 200 as an absolute ceiling. Shorter is better.
- The note must clearly ask for their advice or how they got in. That ask is the point; everything else is brief context.
- You may reference one true, specific detail about them to make it personal — but it must SERVE the ask, not become a technical observation or a comment on their work. Never lead with ${profile.name}'s own stack as a flex.
- Tone: humble and curious, asking for guidance. ${profile.name} is seeking advice, NOT proving expertise or sparring as a peer.
- BANNED: "I hope this finds you well", "I came across your profile", "I'm impressed by", generic flattery, buzzwords, asking technical questions about their work, and leading with your own tech stack.
- Address them by their first name.`;
};

function getAngleHint(angle: Angle, userProfile: UserProfile): string {
  const school = extractSchoolName(userProfile.education);
  
  switch (angle) {
    case "ALUM":
      return school
        ? `Fellow ${school} alum — lead with the shared school; warmest possible opener.`
        : "Shared educational background — lead with common ground if any; warmest possible opener.";
    case "STACK":
      return `A developer on a similar stack (${userProfile.stack}) — connect peer-to-peer over the technical work, not as an applicant.`;
    case "RECRUITER":
      return "A recruiter — they value directness; fine to be clear about the job search and ask what they look for.";
  }
}

export interface ConnectionNoteInput {
  profileText: string;
  company: string;
  angle: Angle;
  userProfile: UserProfile;
}

export function buildConnectionNotePrompt(input: ConnectionNoteInput): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  const { userProfile: profile } = input;

  const system = buildConnectionSystemPrompt(profile);

  const userContent = `Company: ${input.company}
Angle: ${input.angle} — ${getAngleHint(input.angle, profile)}

Their profile:
${input.profileText}`;

  return {
    system,
    messages: [{ role: "user", content: userContent }],
  };
}

export interface ThreadMessage {
  role: Role;
  text: string;
}

export interface ReplyDraftInput {
  contactName: string;
  company: string;
  angle: Angle;
  profileText: string;
  thread: ThreadMessage[];
  userProfile: UserProfile;
}

export function mapThreadToAnthropicMessages(
  thread: ThreadMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return thread.map((msg) => ({
    role: msg.role === "THEM" ? "user" : "assistant",
    content: msg.text,
  }));
}

export function buildReplyDraftPrompt(input: ReplyDraftInput): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const { userProfile: profile } = input;

  const system = `You draft ${profile.name}'s next message in an ongoing LinkedIn conversation. Write AS ${profile.name}: a ${profile.role} in ${profile.location} (${profile.stack}), ${profile.experience} experience, ${profile.education}, job-searching in Canada.

The original outreach asked for PROCESS INTEL — how they got in, what to focus on. Continue naturally.

Voice & length:
- Concise, direct, genuine. 2–4 sentences. It's a DM.
- Match their energy — if they were brief, don't over-write back.

Read their last message and respond accordingly:
- If they shared something useful: thank them for the SPECIFIC thing (not "thanks for the info") and ask ONE sharp follow-up that moves it forward.
- Raise a referral or intro ONLY if the conversation has genuinely warmed over a couple of helpful exchanges AND it feels natural. NEVER push the ask on a first reply or a lukewarm one — that's the fastest way to get ghosted.
- If they were short, cold, or noncommittal: keep it light, low-pressure, give them an easy out; do not escalate.
- If they declined or can't help: thank them graciously, no pressure, leave the door open. Do not try to change their mind.
- If they asked a direct question: answer it first, clearly.

Output ONLY the message text — no preamble, no quotes.`;

  const contextPreamble = `You're replying to ${input.contactName} at ${input.company} (first approached via the ${input.angle} angle).
Their background: ${input.profileText}

Continue the conversation below — your reply comes after their latest message.`;

  const threadMessages = mapThreadToAnthropicMessages(input.thread);
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (threadMessages.length > 0 && threadMessages[0]!.role === "user") {
    messages.push({
      role: "user",
      content: `${contextPreamble}\n\nTHEM: ${threadMessages[0]!.content}`,
    });
    messages.push(...threadMessages.slice(1));
  } else {
    messages.push({ role: "user", content: contextPreamble });
    messages.push(...threadMessages);
  }

  return { system, messages };
}

/**
 * Validate that a connection note is under the 200 char limit
 */
export function isConnectionNoteValid(note: string): boolean {
  return note.length <= 200;
}
