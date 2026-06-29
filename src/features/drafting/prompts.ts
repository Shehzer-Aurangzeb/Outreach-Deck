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

  // Known schools first (exact matches, most reliable)
  const knownSchools = /(?:MIT|Stanford|Harvard|Berkeley|Waterloo|Concordia|McGill|UBC|Toronto)/i;
  const knownMatch = education.match(knownSchools);
  if (knownMatch) return knownMatch[0].trim();

  // Patterns with bounded word capture (1-3 words before suffix) to avoid greedy matching
  const universityPatterns = [
    /University\s+of\s+(?:\w+(?:\s+\w+){0,2})/i,
    /(?:\w+(?:\s+\w+){0,2})\s+University/i,
    /(?:\w+(?:\s+\w+){0,2})\s+College/i,
    /(?:\w+(?:\s+\w+){0,2})\s+Institute\s+of\s+Technology/i,
  ];

  for (const pattern of universityPatterns) {
    const match = education.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  // No recognizable school found — return null so callers can degrade gracefully
  return null;
}

function buildConnectionSystemPrompt(
  profile: UserProfile,
  angle: Angle,
  company: string,
  schoolName: string | null
): string {
  const angleGuidance =
    angle === "ALUM"
      ? `ALUM — fellow ${schoolName || "school"} grad. Lead warmly on the shared school, then ask simply how they got into ${company} or what they'd focus on to land a role there. Humble, curious, peer-to-peer.`
      : angle === "STACK"
        ? `STACK — a fellow engineer on a similar stack. Do NOT ask whether your stack is used there (you already know it is — that's why you're reaching out). Connect peer-to-peer and ask simply how they found their experience getting into ${company}, or what the team is like. Keep it light; openings/process come later.`
        : `RECRUITER — they hold the actual openings. Briefly note genuine interest in ${company}, and ask simply whether they're hiring for roles like ${profile.role} right now. Direct and professional; they appreciate clarity.`;

  return `You write a LinkedIn connection-request note AS ${profile.name}: a ${profile.role} based in ${profile.location} (${profile.stack}), ${profile.experience}, ${profile.education}, job-searching in Canada.

State ${profile.name}'s education as a completed fact. NEVER speculate about graduation timing, being a current student, or "finishing soon" unless the profile explicitly says so.

This is a FIRST-TOUCH note on a connection request — a warm, light opener. ONE simple, easy-to-answer question. It is NOT a pitch, NOT a list of qualifications, and NOT the place to ask for a referral or openings yet. The only job is to start a genuine conversation; everything else comes later once they reply.

The question depends on the angle:
${angleGuidance}

Hard rules:
- Output ONLY the message text — no preamble, no quotes.
- Target ~180 characters. 200 is an absolute ceiling. Shorter is better.
- Open with one specific, true detail about them or a genuine point of connection. Never generic.
- Humble and curious — ${profile.name} is starting a conversation, not proving themselves or making demands.
- Do NOT ask for a referral in this first note. Do NOT stack multiple questions. ONE light ask.
- Do NOT ask technical-architecture questions about their work.
- BANNED: "I hope this finds you well", "I came across your profile", "I'm impressed by", generic flattery, buzzwords.
- Address them by first name.`;
};

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
  const schoolName = extractSchoolName(profile.education);

  const system = buildConnectionSystemPrompt(profile, input.angle, input.company, schoolName);

  const userContent = `Company: ${input.company}
Angle: ${input.angle}

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
  intent?: string;
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

  const system = `You draft ${profile.name}'s next message in an ongoing LinkedIn conversation. Write AS ${profile.name}: a ${profile.role} in ${profile.location} (${profile.stack}), ${profile.experience}, ${profile.education}, job-searching in Canada.

State education as a completed fact. NEVER speculate about graduation timing or current-student status unless the profile says so.

CRITICAL — reason about the WHOLE conversation, not just their last message:
- Read the entire thread first. Understand the arc: how warm is this person, how much have they engaged, what has already been asked and answered, and what is the natural next step a real person would take.
- Your reply must make sense as the next beat in THAT specific conversation — it should feel like a human who has been paying attention, not a bot reacting to the last line in isolation.

THE UNDERLYING GOAL (pursue it patiently across turns, never force it):
${profile.name} ultimately wants useful help — intel on the hiring process, what interviews are like, whether there are openings, and eventually a referral if it's appropriate. But this unfolds gradually:
1. Early / first reply: keep it light. Thank them for the specific thing they said, ask one natural follow-up. Build rapport. Do NOT ask for a referral or jump to openings yet.
2. As they engage and warm up: it becomes appropriate to ask the more useful questions — what the interview process was like, what the team values, whether there are openings for someone like ${profile.name}.
3. Only once they've been genuinely helpful across a couple of exchanges AND it feels natural: gently raise whether they'd be open to referring ${profile.name} or pointing them to the right person.

PACING — balanced:
- Move toward the referral/opening at a reasonable, natural pace — don't stall forever, but don't rush it.
- READ THEIR ENERGY. If they cool off, get brief, or seem busy: back off, keep it light, don't escalate. Protecting the relationship matters more than advancing the ask on any single turn.
- Never sound demanding or transactional. If a message would make them feel pressured or want to end the conversation, soften it.

Voice & length:
- Concise, direct, genuine. 2–4 sentences. It's a DM.
- Match their energy — if they were brief, don't over-write back.
- Humble and appreciative, never entitled.

Handle the situation in their last message:
- Shared something useful → thank them for the SPECIFIC thing, build on it with one natural follow-up that fits where the conversation is.
- Short / cool / noncommittal → keep it light and low-pressure, give them an easy out, do NOT escalate the ask.
- Declined or can't help → thank them graciously, no pressure, leave the door open. Do not push back.
- Asked a direct question → answer it clearly first, then continue.

Output ONLY the message text — no preamble, no quotes.`;

  const intentClause = input.intent?.trim()
    ? `\n\nUser intent for this reply: "${input.intent.trim()}"`
    : "";

  const contextPreamble = `You're replying to ${input.contactName} at ${input.company} (first approached via the ${input.angle} angle).
Their background: ${input.profileText}${intentClause}

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
 * First DM prompt — for REQUESTED contacts after they accept (no 200-char limit).
 * Fuller message than connection note, same process-intel goal.
 */
export interface FirstDMInput {
  contactName: string;
  company: string;
  angle: Angle;
  profileText: string;
  userProfile: UserProfile;
}

function buildFirstDMGoal(angle: Angle, company: string, role: string, schoolName: string | null): string {
  switch (angle) {
    case "ALUM":
      return `ALUM — fellow ${schoolName || "school"} grad. Lead warmly on the shared school, then ask how they got into ${company} or what they'd focus on to land a role there. Humble, curious, peer-to-peer.`;
    case "STACK":
      return `STACK — a fellow engineer on a similar stack. Peer-to-peer — ask what getting into ${company} was like, the team, the interview process. Do NOT ask if your stack is used there (you know it is).`;
    case "RECRUITER":
      return `RECRUITER — they hold the actual openings. Ask whether they're hiring for roles like ${role} right now, and what they look for. Direct and professional. NOT "what should I focus on."`;
  }
}

export function buildFirstDMPrompt(input: FirstDMInput): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  const { userProfile: profile } = input;
  const schoolName = extractSchoolName(profile.education);
  const angleGoal = buildFirstDMGoal(input.angle, input.company, profile.role, schoolName);

  const system = `You write ${profile.name}'s first DM to someone who just accepted a LinkedIn connection. Write AS ${profile.name}: a ${profile.role} in ${profile.location} (${profile.stack}), ${profile.experience} experience, ${profile.education}, job-searching in Canada.

State ${profile.name}'s education as a completed fact. NEVER speculate about graduation timing, being a current student, or "finishing soon" unless the profile explicitly says so.

Context: ${profile.name} sent a bare connection request (no note due to LinkedIn's free-tier limit). Now they've accepted, and this is ${profile.name}'s first actual message to them.

Goal depends on the angle:
${angleGoal}

It is NOT a referral ask yet (too soon — that comes later in replies). It is NOT a technical deep-dive.

Voice & length:
- Warm, concise, genuine. 3–5 sentences max. It's a DM, not an essay.
- Thank them for connecting, briefly explain why you reached out, ask ONE clear question.
- Humble and curious, asking for guidance. NOT proving expertise or sparring as a peer.

Hard rules:
- Output ONLY the message text — no preamble, no quotes.
- Address them by their first name.
- You may reference one true, specific detail about them to personalize — but it must SERVE the ask.
- BANNED: "I hope this finds you well", "I came across your profile", "I'm impressed by", generic flattery, buzzwords.`;

  const userContent = `Company: ${input.company}
Angle: ${input.angle}

Their profile:
${input.profileText}

Draft a first DM now that they've accepted the connection request.`;

  return {
    system,
    messages: [{ role: "user", content: userContent }],
  };
}

/**
 * Validate that a connection note is under the 200 char limit
 */
export function isConnectionNoteValid(note: string): boolean {
  return note.length <= 200;
}
