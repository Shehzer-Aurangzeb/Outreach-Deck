import type { Category, Role } from "@prisma/client";

import type { SearchAngle } from "@/features/search/lib/daily-search-generator";

export interface UserProfile {
  name: string;
  role: string;
  location: string;
  stack: string;
  experience: string;
  education: string;
  summary?: string | null;
  // Recruiter-specific fields
  workAuth?: string | null;
  availability?: string | null;
  openToContract?: boolean;
  openToRelocation?: boolean;
}

const DEFAULT_WORK_AUTH = "Authorized to work in Canada, no sponsorship required";

/**
 * Rules that apply to every generated message regardless of category or mode.
 * Kept in one place so the banned list and the voice rules cannot drift apart
 * between the connection-note path and the DM path.
 */
const SHARED_VOICE_RULES = `Voice, non-negotiable:
- Write in complete sentences that a person would actually say out loud.
- NEVER open a paragraph with a job-title fragment. "Frontend Engineer with 3.5 years experience in React, Next.js, TypeScript and GraphQL" is a CV header pasted into a chat window. Recruiters skim straight past it. Say it as a sentence instead.
- No bullet points, no line-separated attribute lists, no colon-delimited label/value pairs. It is a message, not a profile.
- No em dashes. Use commas, periods, or "and".
- No filler openers and no sign-off flourishes.`;

const BANNED_PHRASES = `BANNED phrases and shapes: "I hope this finds you well", "I came across your profile", "I'm impressed by", "I'd love to", "would love to", "on your radar", "caught my eye", "lines up closely", "a couple of things that map to", "exactly where I do my best work", "saw your post", "your stack is basically mine", "reach out", "circle back", "passionate about", "Looking forward to hearing from you", generic flattery, buzzwords.`;

export function searchAngleToCategory(angle: SearchAngle): Category {
  switch (angle) {
    case "ALUM":
      return "ALUMNI";
    case "STACK":
      return "STACK_MATCH";
    case "RECRUITER":
      return "RECRUITER_AGENCY";
  }
}

export function isRecruiterCategory(category: Category): boolean {
  return (
    category === "RECRUITER_EMBEDDED" ||
    category === "RECRUITER_AGENCY" ||
    category === "RECRUITER_VENDOR"
  );
}

/**
 * Facts a recruiter needs in order to pitch you to a client.
 *
 * These are supplied as facts to weave, never as a block to reproduce. Ordering
 * here is deliberate: the fields most likely to disqualify you if unknown come
 * first, and work authorization is marked optional at first touch because it
 * costs a sentence and rarely changes whether someone replies.
 */
function buildRecruiterFixedFields(
  profile: UserProfile,
  mode: "connection_note" | "first_dm",
  includeTaxTerm: boolean
): string {
  const workAuth = profile.workAuth?.trim() || DEFAULT_WORK_AUTH;

  if (mode === "connection_note") {
    // 200 char cap. Only what survives the squeeze.
    return `Facts available to weave in if they fit (not a template, not a checklist): based in ${profile.location}. ${workAuth}. At this length, stack and availability matter more than work authorization. Drop anything that does not fit.`;
  }

  const required = [
    `Based in ${profile.location}`,
    profile.availability?.trim() || "Available now",
    profile.openToContract ? "Open to contract or permanent" : "Open to permanent roles",
  ];

  if (profile.openToRelocation) {
    required.push("Open to relocation anywhere in Canada");
  }

  const optional = [workAuth];

  if (includeTaxTerm) {
    optional.push("Preference: T4 or permanent");
  }

  return `Facts to weave into natural sentences, never as a list:
${required.join("\n")}

Lower priority, include only if it sits comfortably in an existing sentence rather than needing its own:
${optional.join("\n")}`;
}

export function extractSchoolName(education: string): string | null {
  if (!education || education.trim().length === 0) return null;

  // Prefer the full institution name when the known school appears as part of one,
  // so "Concordia University" does not get truncated to "Concordia".
  const knownSchools =
    /(?:MIT|Stanford|Harvard|Berkeley|Waterloo|Concordia|McGill|UBC|Toronto)(?:\s+University|\s+College)?/i;
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

  // No recognizable school found. Return null so callers can degrade gracefully.
  return null;
}

function buildConnectionSystemPrompt(
  profile: UserProfile,
  category: Category,
  company: string,
  schoolName: string | null
): string {
  const primaryStack = profile.stack.split(",")[0]?.trim() || "your stack";

  const categoryGuidance =
    category === "ALUMNI"
      ? `ALUMNI, a fellow ${schoolName || "school"} grad. The sanctioned personalization hook is the SHARED SCHOOL, since it is in both profiles and is always safe and true. Lead warmly on it, then ask how they got into ${company} or what they would focus on to land a role there. Humble and curious.`
      : category === "STACK_MATCH"
        ? `STACK_MATCH, an engineer already inside ${company}. The sanctioned hook is that they work on ${primaryStack}-adjacent things at ${company}. Reference it lightly as the REASON for reaching out, then ask something concrete: how they found the process of getting in, what the interview was like, or whether there are openings for someone with ${profile.name}'s background. Do NOT recite their stack back to them. A one-touch reference to what they build is fine, a recital is filler.`
        : category === "HIRING_MANAGER"
          ? `HIRING_MANAGER, engineering leadership at ${company}. Ask a concrete question about what they look for in candidates or whether the team is growing. Do NOT pitch directly, the profile speaks for qualifications.`
          : category === "RECRUITER_EMBEDDED"
            ? `RECRUITER_EMBEDDED. No standing req list, so being memorable matters more than being catalogued. Question first, credentials underneath if at all. Conversational, no hard sell, do not lead with the stack. Give them something they would enjoy answering.

CRITICAL, personalization source: only personalize from a detail explicitly present in the contact's profile text, or a true detail about ${profile.name}. Do NOT state any fact about ${company} that is not in the provided profile text.`
            : category === "RECRUITER_AGENCY"
              ? `RECRUITER_AGENCY. They have live roles and a quota, and they skim. Efficient, no warm-up, no education, no "about me".

Order matters. ONE short question about what they are seeing for someone at ${profile.name}'s level and stack, then the facts underneath in one or two sentences. The question first means they can answer without reading the rest, which is what gets a reply.

State ${profile.name}'s stack and years plainly inside a sentence, for example "3.5 years in React, TypeScript and Node". Never as a standing headline.

${buildRecruiterFixedFields(profile, "connection_note", false)}`
              : category === "RECRUITER_VENDOR"
                ? `RECRUITER_VENDOR. They work from a resume database and will skim. Maximum four short sentences, pure facts, no conversation, no question. This is the one category where a flat factual message is correct.

State ${profile.name}'s stack and experience briefly.

${buildRecruiterFixedFields(profile, "connection_note", true)}`
                : `UNKNOWN, their role is unclear. Keep it professional and light. Ask a general question about the company or their experience there. Humble and curious.`;

  return `You write a LinkedIn connection-request note AS ${profile.name}: a ${profile.role} based in ${profile.location} (${profile.stack}), ${profile.experience}, ${profile.education}, job-searching in Canada.

State ${profile.name}'s education as a completed fact. NEVER speculate about graduation timing, being a current student, or finishing soon unless the profile explicitly says so.

This is a FIRST-TOUCH note on a connection request, a light opener with ONE simple, easy-to-answer ask. It is NOT a pitch, NOT a list of qualifications, and NOT the place to ask for a referral. The only job is to start a real conversation.

The framing depends on the category:
${categoryGuidance}

${SHARED_VOICE_RULES}

Hard rules:
- Output ONLY the message text. No preamble, no quotes.
- Target ~180 characters. 200 is an absolute ceiling. Shorter is better.
- Open with one specific, true detail, but ONLY from the contact's provided profile text or the sender's own profile above. NEVER state a fact about ${company} (clients, offices, products, projects, history) that is not in the provided profile text. Those come from model memory and are frequently wrong. If no verifiable detail is available, a warm honest opener with no specifics is REQUIRED over a specific-sounding but unconfirmed claim.
- For ALUMNI and STACK_MATCH: ask a CONCRETE question (how they got in, what the interview process was like, whether there are openings).
- For RECRUITER_EMBEDDED and RECRUITER_AGENCY: the question comes before any credentials.
- For RECRUITER_VENDOR: no question at all.
- NEVER use vague openers like "how's the team", "what's it like there", or "what's the experience been". Those get dead-end replies.
- Humble and curious. ${profile.name} is starting a conversation, not proving themselves.
- Do NOT ask for a referral. Do NOT stack multiple asks. ONE light ask.
- Do NOT ask technical-architecture questions about their work.
- Address them by first name.
- ${BANNED_PHRASES}`;
}

export interface ConnectionNoteInput {
  profileText: string;
  company: string;
  category: Category;
  userProfile: UserProfile;
}

export function buildConnectionNotePrompt(input: ConnectionNoteInput): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  const { userProfile: profile } = input;
  const schoolName = extractSchoolName(profile.education);

  const system = buildConnectionSystemPrompt(profile, input.category, input.company, schoolName);

  const userContent = `Company: ${input.company}
Category: ${input.category}

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
  category: Category;
  profileText: string;
  thread: ThreadMessage[];
  userProfile: UserProfile;
  intent?: string;
}

/**
 * Map a stored thread to Anthropic message turns.
 *
 * The API rejects consecutive turns with the same role, which happens whenever
 * either side sends two messages in a row before the other replies. That is
 * common on LinkedIn, so adjacent same-role turns are merged rather than passed
 * through and left to fail at request time.
 */
export function mapThreadToAnthropicMessages(
  thread: ThreadMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  const mapped = thread.map((msg) => ({
    role: msg.role === "THEM" ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  return mapped.reduce<Array<{ role: "user" | "assistant"; content: string }>>((acc, msg) => {
    const previous = acc[acc.length - 1];
    if (previous && previous.role === msg.role) {
      previous.content = `${previous.content}\n\n${msg.content}`;
      return acc;
    }
    acc.push({ ...msg });
    return acc;
  }, []);
}

export function buildReplyDraftPrompt(input: ReplyDraftInput): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const { userProfile: profile } = input;

  const system = `You draft ${profile.name}'s next message in an ongoing LinkedIn conversation. Write AS ${profile.name}: a ${profile.role} in ${profile.location} (${profile.stack}), ${profile.experience}, ${profile.education}, job-searching in Canada.

State education as a completed fact. NEVER speculate about graduation timing or current-student status unless the profile says so.

CRITICAL, reason about the WHOLE conversation, not just their last message:
- Read the entire thread first. Understand the arc: how warm this person is, how much they have engaged, what has already been asked and answered, and what a real person would naturally do next.
- Your reply must make sense as the next beat in THAT conversation. It should read like someone who has been paying attention, not a bot reacting to the last line in isolation.

THE UNDERLYING GOAL, pursued patiently across turns and never forced:
${profile.name} wants useful help, meaning intel on the hiring process, what interviews are like, whether there are openings, and eventually a referral if it is appropriate. This unfolds gradually:
1. Early or first reply: keep it light. Thank them for the specific thing they said, ask one natural follow-up. Build rapport. Do NOT ask for a referral or jump to openings.
2. As they engage: it becomes appropriate to ask the more useful questions, what the interview process was like, what the team values, whether there are openings for someone like ${profile.name}.
3. Only once they have been genuinely helpful across a couple of exchanges AND it feels natural: gently raise whether they would be open to referring ${profile.name} or pointing them to the right person.

PACING:
- Move toward the referral or opening at a natural pace. Do not stall forever, do not rush.
- READ THEIR ENERGY. If they cool off, get brief, or seem busy, back off and keep it light. Protecting the relationship matters more than advancing the ask on any single turn.
- Never sound demanding or transactional. If a message would make them feel pressured, soften it.

${SHARED_VOICE_RULES}

Length:
- 2 to 4 sentences. It is a DM.
- Match their energy. If they were brief, do not over-write back.
- Humble and appreciative, never entitled.

Handle the situation in their last message:
- Shared something useful, thank them for the SPECIFIC thing and build on it with one natural follow-up.
- Short, cool, or noncommittal, keep it light and low-pressure, give them an easy out, do NOT escalate.
- Declined or cannot help, thank them graciously, no pressure, leave the door open. Do not push back.
- Asked a direct question, answer it clearly first, then continue.

- ${BANNED_PHRASES}

Output ONLY the message text. No preamble, no quotes.`;

  const intentClause = input.intent?.trim()
    ? `\n\nUser intent for this reply: "${input.intent.trim()}"`
    : "";

  const contextPreamble = `You're replying to ${input.contactName} at ${input.company} (category: ${input.category}).
Their background: ${input.profileText}${intentClause}

Continue the conversation below. Your reply comes after their latest message.`;

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
 * First DM prompt, for REQUESTED contacts after they accept. No 200-char limit.
 * Fuller message than the connection note, same process-intel goal.
 */
export interface FirstDMInput {
  contactName: string;
  company: string;
  category: Category;
  profileText: string;
  userProfile: UserProfile;
}

function buildFirstDMGoal(
  category: Category,
  company: string,
  profile: UserProfile,
  schoolName: string | null
): string {
  if (category === "ALUMNI") {
    return `ALUMNI, a fellow ${schoolName || "school"} grad. Lead warmly on the shared school, then ask how they got into ${company} or what they would focus on to land a role there. Humble and curious.`;
  }

  if (category === "STACK_MATCH") {
    return `STACK_MATCH, an engineer already inside ${company}. The sanctioned hook is that they build things at ${company} adjacent to what you do. Reference it lightly as the reason you reached out, do not recite their stack. You want their honest read on getting in: what the hiring process was like, what interviews looked like, or whether there are openings for someone like you. Do NOT state your own years or stack as a credential, they can see your profile.`;
  }

  if (category === "HIRING_MANAGER") {
    return `HIRING_MANAGER, engineering leadership at ${company}. Ask a concrete question about what they look for in candidates or whether the team is growing. Do NOT pitch directly, the profile speaks for qualifications.`;
  }

  if (category === "RECRUITER_EMBEDDED") {
    return `RECRUITER_EMBEDDED. No standing req list, so being memorable matters more than being catalogued. Lead with a question they would enjoy answering, credentials underneath. Conversational, no hard sell, do not lead with the stack.`;
  }

  if (category === "RECRUITER_AGENCY") {
    return `RECRUITER_AGENCY. They have live roles and a quota, and they skim. Efficient and factual, no warm-up.

Structure, in this order:
1. "Thanks for connecting, ${"{FirstName}"}." on its own line. No separate "Hi".
2. ONE open question about what they are seeing right now for someone at ${profile.name}'s level and stack.
3. The facts underneath, in one or two plain sentences.

The question goes BEFORE the credentials. A recruiter can answer it without reading anything else, and that is what produces a reply. A message that opens with qualifications reads as a broadcast and gets skimmed.

The credentials sentence must be a sentence. Something a person would say, like "I'm 3.5 years in, mostly React and TypeScript with Node on the back end." Not a headline, not a comma-separated technology dump.

${buildRecruiterFixedFields(profile, "first_dm", false)}

Also:
- Do NOT include education. They do not care about degrees.
- Do NOT approximate years. Use the number from the profile exactly.
- No filler: no "just completed", "recently graduated", "looking forward to".`;
  }

  if (category === "RECRUITER_VENDOR") {
    return `RECRUITER_VENDOR. They work from a resume database and will skim. Maximum four short sentences, pure facts, no conversation, no question. This is the one category where a flat factual message is correct.

State ${profile.name}'s stack and experience as credentials.

${buildRecruiterFixedFields(profile, "first_dm", true)}`;
  }

  return `UNKNOWN, their role is unclear. Keep it professional and light. Ask a general question about the company or their experience there. Humble and curious.`;
}

export function buildFirstDMPrompt(input: FirstDMInput): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const { userProfile: profile } = input;
  const schoolName = extractSchoolName(profile.education);
  const categoryGoal = buildFirstDMGoal(input.category, input.company, profile, schoolName);

  // Scope "don't pitch yourself". Recruiters need credentials, peers do not.
  const pitchRule =
    input.category === "RECRUITER_AGENCY" || input.category === "RECRUITER_VENDOR"
      ? `- For recruiters: DO state ${profile.name}'s stack and experience, they need it to pitch you to clients. State it in sentences, underneath the question, never as an opening headline.`
      : `- Do NOT pitch or restate ${profile.name}'s own stack, experience, or qualifications as a selling point. They can see the profile. Lead with genuine curiosity about THEM or the company.`;

  const system = `You write ${profile.name}'s first DM to someone who just accepted a LinkedIn connection. Write AS ${profile.name}: a ${profile.role} in ${profile.location} (${profile.stack}), ${profile.experience} experience, ${profile.education}, job-searching in Canada.

State ${profile.name}'s education as a completed fact. NEVER speculate about graduation timing, being a current student, or finishing soon unless the profile explicitly says so.

Context: ${profile.name} sent a bare connection request with no note, because of LinkedIn's free-tier limit. They have now accepted, and this is the first actual message.

Goal depends on the category:
${categoryGoal}

This is NOT a referral ask yet, that comes later in replies. It is NOT a technical deep-dive.

${SHARED_VOICE_RULES}

Length:
- 3 to 5 sentences maximum. It is a DM, not an essay.
- Warm, concise, genuine. Humble and curious, asking for guidance, not proving expertise.

Hard rules:
- Output ONLY the message text. No preamble, no quotes.
- Address them by first name. If no name is available, open without a salutation, never "[First Name]" or "there".
- You may reference one true, specific detail about them or the company, but it must SERVE the ask. Never state a fact about ${input.company} that is not in the provided profile text.
${pitchRule}
- For ALUMNI and STACK_MATCH: ask a CONCRETE question (hiring process, what interviews are like, whether there are openings).
- For RECRUITER_EMBEDDED and RECRUITER_AGENCY: the question comes first, credentials underneath.
- For RECRUITER_VENDOR: four sentences maximum, pure facts, no question.
- Avoid vague questions about team dynamic, culture, or what it is like. Those get dead-end replies.
- State experience and background ONLY as given in the profile. Never approximate, round, or invent numbers. If a number is not needed, leave it out.
- ${BANNED_PHRASES}`;

  const userContent = `Contact name: ${input.contactName}
Company: ${input.company}
Category: ${input.category}

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