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
      ? `ALUM — fellow ${schoolName || "school"} grad. The sanctioned personalization hook is the SHARED SCHOOL (it's in both profiles — always safe and true). Lead warmly on it, then ask how they got into ${company} or what they'd focus on to land a role there. Humble and curious.`
      : angle === "STACK"
        ? `STACK — they're an engineer already inside ${company}. The sanctioned hook is the fact that they work on ${profile.stack.split(",")[0]?.trim() || "your stack"}-adjacent work at ${company} — reference it lightly as the REASON you're reaching out, then ask something concrete: how they found the process of getting in, what the interview was like, or whether there are openings for someone with ${profile.name}'s background. Do NOT recite their full stack back to them ("I see you work with React, Redux, TypeScript...") — that's filler; a light one-touch reference to what they build is fine, a recital is not.`
        : `RECRUITER — they hold the actual openings. The ask is soft: "connect so I'm on your radar for ${profile.role} roles at ${company} — now or down the line," framed so it's easy to say yes to EVEN IF nothing is open today. Do NOT ask a closed "are you hiring right now?" yes/no question — it dead-ends the moment the answer is no.

CRITICAL — personalization source: You may ONLY personalize using (a) a detail explicitly present in the contact's profile text provided below, or (b) a true detail about ${profile.name} from the profile above. You must NOT state any fact about ${company} that is not in the provided profile text — no client names, office locations, products, projects, or history pulled from memory. You do not know these and will get them wrong. If nothing specific and verifiable is available to open with, DO NOT invent one — just open naturally with the role interest and the soft radar ask. A clean, honest, generic-but-warm opener beats a specific-sounding but unverifiable claim.`;

  return `You write a LinkedIn connection-request note AS ${profile.name}: a ${profile.role} based in ${profile.location} (${profile.stack}), ${profile.experience}, ${profile.education}, job-searching in Canada.

State ${profile.name}'s education as a completed fact. NEVER speculate about graduation timing, being a current student, or "finishing soon" unless the profile explicitly says so.

This is a FIRST-TOUCH note on a connection request — a warm, light opener. ONE simple, easy-to-answer ask. It is NOT a pitch, NOT a list of qualifications, and NOT the place to ask for a referral yet. The only job is to start a genuine conversation; everything else comes later once they reply.

The framing depends on the angle:
${angleGuidance}

Hard rules:
- Output ONLY the message text — no preamble, no quotes.
- Target ~180 characters. 200 is an absolute ceiling. Shorter is better.
- Open with one specific, true detail — but ONLY from the contact's provided profile text or the sender's own profile above. NEVER state a fact about ${company} (clients, offices, products, projects, history) that isn't in the provided profile text; those come from the model's memory and are frequently wrong. If no verifiable specific detail is available, a warm honest opener with no invented specifics is REQUIRED over a specific-sounding but unconfirmed claim.
- For ALUM/STACK: ask a CONCRETE, useful question (how they got in, what the interview process was like, whether there are openings). For RECRUITER: use the soft radar/connect framing above, not a question that can be answered "no" and closed.
- NEVER use vague openers like "how's the team", "what's it like there", or "what's the experience been" — those get dead-end replies.
- Humble and curious — ${profile.name} is starting a conversation, not proving themselves or making demands.
- Do NOT ask for a referral in this first note. Do NOT stack multiple questions/asks. ONE light ask.
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
      return `ALUM — fellow ${schoolName || "school"} grad. Lead warmly on the shared school, then ask how they got into ${company} or what they'd focus on to land a role there. Humble and curious.`;
    case "STACK":
      return `STACK — they're an engineer already inside ${company}. The sanctioned hook is that they build at ${company} on work adjacent to what you do — reference it lightly as the reason you reached out, don't recite their full stack. You want their honest read on getting in: what the hiring process was like, what interviews looked like, or whether there are openings for someone like you. Do NOT mention your own years/stack as a credential — they can see your profile.`;
    case "RECRUITER":
      return `RECRUITER — they hold the actual openings. Ask them to keep you in mind for ${role} roles at ${company} — now or in the future — and, naturally, what they tend to look for in candidates for those roles. Keep it open-ended so it's worth replying to even if nothing is open today. Do NOT reduce it to a closed "are you hiring right now?" yes/no. Direct and professional.

CRITICAL — personalization source: Only personalize from a detail explicitly present in the contact's profile text, or a true detail about the sender's own profile. Do NOT state any fact about ${company} (clients, offices, products, projects, history) that is not in the provided profile text — you do not know these and will get them wrong. If nothing verifiable is available, open naturally with the role interest and the ask rather than inventing a specific-sounding claim.`;
  }
}

export function buildFirstDMPrompt(input: FirstDMInput): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
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
- Thank them for connecting, briefly explain why you reached out, land ONE clear ask.
- Humble and curious, asking for guidance. NOT proving expertise or sparring as a peer.

Hard rules:
- Output ONLY the message text — no preamble, no quotes.
- Address them by their first name. If no name is available, open without a salutation — never "[First Name]" or "there".
- You may reference one true, specific detail about them or the company to personalize — but it must SERVE the ask.
- Do NOT pitch or restate ${profile.name}'s own stack, experience, or qualifications as a selling point. They can see your profile. Lead with genuine curiosity about THEM or the company, not a summary of you.
- For ALUM/STACK: ask a CONCRETE, useful question (hiring process, what interviews are like, whether there are openings). For RECRUITER: use the open "keep me in mind + what you look for" framing, not a closed "are you hiring right now?" that can be answered "no" and closed.
- Avoid vague questions about "team dynamic", "culture", or "what it's like" — those get dead-end replies.
- State ${profile.name}'s experience and background ONLY as given in the profile — never approximate, round, or invent numbers. If you don't need to state a number, don't.
- BANNED: "I hope this finds you well", "I came across your profile", "I'm impressed by", generic flattery, buzzwords.`;

  const userContent = `Contact name: ${input.contactName}
Company: ${input.company}
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