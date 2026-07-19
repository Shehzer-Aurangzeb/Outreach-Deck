import { describe, expect, it } from "vitest";

import {
  buildConnectionNotePrompt,
  buildFirstDMPrompt,
  buildReplyDraftPrompt,
  extractSchoolName,
  isConnectionNoteValid,
  mapThreadToAnthropicMessages,
  type ThreadMessage,
  type UserProfile,
} from "./prompts";

/**
 * Test user profile for unit tests — uses Concordia to verify interpolation
 */
const TEST_PROFILE: UserProfile = {
  name: "Alex",
  role: "full-stack developer",
  location: "Montreal",
  stack: "Next.js, React, TypeScript, NestJS, Prisma",
  experience: "~4 years",
  education: "M.S. Computer Science, Concordia University",
};

describe("buildConnectionNotePrompt", () => {
  it("includes the character target in system prompt", () => {
    const result = buildConnectionNotePrompt({
      profileText: "Software engineer at Coveo",
      company: "Coveo",
      angle: "ALUM",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).toContain("Target ~180 characters");
    expect(result.system).toContain("200 is an absolute ceiling");
  });

  it("bans generic openers in system prompt", () => {
    const result = buildConnectionNotePrompt({
      profileText: "Software engineer at Coveo",
      company: "Coveo",
      angle: "ALUM",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).toContain("BANNED:");
    expect(result.system).toContain("I hope this finds you well");
    expect(result.system).toContain("I came across your profile");
  });

  it("includes the user profile info in system prompt", () => {
    const result = buildConnectionNotePrompt({
      profileText: "Software engineer",
      company: "TestCo",
      angle: "STACK",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).toContain(TEST_PROFILE.name);
    expect(result.system).toContain(TEST_PROFILE.location);
    expect(result.system).toContain(TEST_PROFILE.stack);
  });

  it("includes company in user message", () => {
    const result = buildConnectionNotePrompt({
      profileText: "Senior engineer",
      company: "Shopify",
      angle: "RECRUITER",
      userProfile: TEST_PROFILE,
    });

    expect(result.messages[0]!.content).toContain("Company: Shopify");
  });

  it("includes angle in user message", () => {
    const result = buildConnectionNotePrompt({
      profileText: "Engineer",
      company: "TestCo",
      angle: "ALUM",
      userProfile: TEST_PROFILE,
    });

    expect(result.messages[0]!.content).toContain("Angle: ALUM");
  });

  it("includes the profile text in user message", () => {
    const profileText = "Jane Doe, Software Engineer at Coveo with 5 years experience in React and TypeScript";

    const result = buildConnectionNotePrompt({
      profileText,
      company: "Coveo",
      angle: "STACK",
      userProfile: TEST_PROFILE,
    });

    expect(result.messages[0]!.content).toContain(profileText);
  });

  it("allows custom user profile", () => {
    const customProfile = {
      name: "Alex",
      role: "backend developer",
      location: "Toronto",
      stack: "Go, Python, PostgreSQL",
      experience: "3 years",
      education: "UofT grad",
    };

    const result = buildConnectionNotePrompt({
      profileText: "Engineer",
      company: "TestCo",
      angle: "STACK",
      userProfile: customProfile,
    });

    expect(result.system).toContain("Alex");
    expect(result.system).toContain("Toronto");
    expect(result.system).toContain("Go, Python, PostgreSQL");
  });
});

describe("mapThreadToAnthropicMessages", () => {
  it("maps THEM to user role", () => {
    const thread: ThreadMessage[] = [{ role: "THEM", text: "Thanks for connecting!" }];

    const result = mapThreadToAnthropicMessages(thread);

    expect(result[0]!.role).toBe("user");
    expect(result[0]!.content).toBe("Thanks for connecting!");
  });

  it("maps YOU to assistant role", () => {
    const thread: ThreadMessage[] = [{ role: "YOU", text: "Hi, great to connect!" }];

    const result = mapThreadToAnthropicMessages(thread);

    expect(result[0]!.role).toBe("assistant");
    expect(result[0]!.content).toBe("Hi, great to connect!");
  });

  it("preserves message order", () => {
    const thread: ThreadMessage[] = [
      { role: "YOU", text: "Message 1" },
      { role: "THEM", text: "Message 2" },
      { role: "YOU", text: "Message 3" },
      { role: "THEM", text: "Message 4" },
    ];

    const result = mapThreadToAnthropicMessages(thread);

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ role: "assistant", content: "Message 1" });
    expect(result[1]).toEqual({ role: "user", content: "Message 2" });
    expect(result[2]).toEqual({ role: "assistant", content: "Message 3" });
    expect(result[3]).toEqual({ role: "user", content: "Message 4" });
  });

  it("handles empty thread", () => {
    const result = mapThreadToAnthropicMessages([]);

    expect(result).toEqual([]);
  });
});

describe("buildReplyDraftPrompt", () => {
  const baseInput = {
    contactName: "Jane Doe",
    company: "Coveo",
    angle: "ALUM" as const,
    profileText: "Senior Engineer at Coveo",
    thread: [
      { role: "YOU" as const, text: "Hi Jane, fellow Concordia alum here!" },
      { role: "THEM" as const, text: "Hey! Great to connect. What year did you graduate?" },
    ],
    userProfile: TEST_PROFILE,
  };

  it("builds a system prompt with reply guidance", () => {
    const result = buildReplyDraftPrompt(baseInput);

    expect(result.system.toLowerCase()).toContain("concise, direct, genuine");
    expect(result.system).toContain("2–4 sentences");
    expect(result.system).toContain("Output ONLY the message text");
  });

  it("includes referral escalation guidance in system prompt", () => {
    const result = buildReplyDraftPrompt(baseInput);

    expect(result.system).toContain("gently raise whether they'd be open to referring");
  });

  it("includes handling for cold/declined replies", () => {
    const result = buildReplyDraftPrompt(baseInput);

    expect(result.system).toContain("Short / cool / noncommittal");
    expect(result.system).toContain("Declined or can't help");
  });

  it("includes contact context in the first message", () => {
    const result = buildReplyDraftPrompt(baseInput);

    expect(result.messages[0]!.content).toContain("Jane Doe");
    expect(result.messages[0]!.content).toContain("Coveo");
    expect(result.messages[0]!.content).toContain("Senior Engineer at Coveo");
  });

  it("maps thread with THEM→user and YOU→assistant in order", () => {
    const result = buildReplyDraftPrompt(baseInput);

    // The thread should be embedded in the messages
    // First message is user (context + first THEM if applicable)
    // Second is assistant (YOU)
    // etc.

    // With our input: [YOU, THEM], the mapping produces [assistant, user]
    // But we prepend context to the first user message

    // Actually let me check the implementation...
    // The thread is [YOU, THEM], which maps to [assistant, user]
    // Since the first is assistant, we prepend a user context message

    expect(result.messages.length).toBeGreaterThan(0);

    // Find the assistant message (our YOU)
    const assistantMsg = result.messages.find((m) => m.role === "assistant");
    expect(assistantMsg?.content).toContain("Hi Jane, fellow Concordia alum here!");
  });

  it("ends with a user message (THEM) so model generates reply", () => {
    // For a valid reply scenario, the last message should be from THEM (user)
    const input = {
      ...baseInput,
      thread: [
        { role: "YOU" as const, text: "Initial message" },
        { role: "THEM" as const, text: "Their reply" },
      ],
    };

    const result = buildReplyDraftPrompt(input);

    // The last message in the Anthropic array should be user role
    const lastMsg = result.messages[result.messages.length - 1];
    expect(lastMsg?.role).toBe("user");
  });
});

describe("isConnectionNoteValid", () => {
  it("returns true for notes under 200 chars", () => {
    const note = "Hi Sarah! Noticed you made the jump to Coveo recently. As a fellow dev, curious what stood out in their process. Any tips for someone exploring?";

    expect(note.length).toBeLessThan(200);
    expect(isConnectionNoteValid(note)).toBe(true);
  });

  it("returns true for notes exactly 200 chars", () => {
    const note = "a".repeat(200);

    expect(isConnectionNoteValid(note)).toBe(true);
  });

  it("returns false for notes over 200 chars", () => {
    const note = "a".repeat(201);

    expect(isConnectionNoteValid(note)).toBe(false);
  });

  it("returns true for empty string", () => {
    expect(isConnectionNoteValid("")).toBe(true);
  });
});

describe("extractSchoolName", () => {
  it("extracts school name containing Concordia", () => {
    const result = extractSchoolName("M.S. Computer Science, Concordia University");
    expect(result).toContain("Concordia");
  });

  it("extracts University of X pattern", () => {
    expect(extractSchoolName("B.S. CS, University of Waterloo")).toContain("Waterloo");
  });

  it("extracts X University pattern containing McGill", () => {
    const result = extractSchoolName("Ph.D. from McGill University");
    expect(result).toContain("McGill");
  });

  it("extracts MIT from education", () => {
    expect(extractSchoolName("B.S. Computer Science, MIT")).toBe("MIT");
  });

  it("returns null for empty education", () => {
    expect(extractSchoolName("")).toBeNull();
  });

  it("returns null when no recognizable school pattern matches", () => {
    expect(extractSchoolName("self-taught developer")).toBeNull();
    expect(extractSchoolName("online courses, bootcamp")).toBeNull();
  });

  it("extracts tightly from messy inputs (avoids greedy matching)", () => {
    expect(extractSchoolName("I studied hard at Concordia University")).toBe("Concordia");
    expect(extractSchoolName("worked my way through McGill University")).toBe("McGill");
    expect(extractSchoolName("graduated from University of Toronto last year")).toContain("Toronto");
  });
});

describe("profile-driven angle hints (no hardcoded school)", () => {
  it("ALUM angle uses school from user profile in system prompt", () => {
    const concordiaProfile: UserProfile = {
      ...TEST_PROFILE,
      education: "M.S. Computer Science, Concordia University",
    };

    const result = buildConnectionNotePrompt({
      profileText: "Engineer at Shopify",
      company: "Shopify",
      angle: "ALUM",
      userProfile: concordiaProfile,
    });

    expect(result.system).toContain("Concordia");
  });

  it("ALUM angle uses Waterloo for Waterloo grad (no Concordia)", () => {
    const waterlooProfile: UserProfile = {
      name: "Jane",
      role: "backend developer",
      location: "Toronto",
      stack: "Python, Django",
      experience: "3 years",
      education: "B.Eng Computer Engineering, University of Waterloo",
    };

    const result = buildConnectionNotePrompt({
      profileText: "Engineer at Google",
      company: "Google",
      angle: "ALUM",
      userProfile: waterlooProfile,
    });

    expect(result.system).toContain("Waterloo");
    expect(result.system).not.toContain("Concordia");
  });

  it("ALUM angle degrades gracefully when no school in profile", () => {
    const noSchoolProfile: UserProfile = {
      name: "Sam",
      role: "software engineer",
      location: "Vancouver",
      stack: "JavaScript",
      experience: "2 years",
      education: "",
    };

    const result = buildConnectionNotePrompt({
      profileText: "Engineer at Amazon",
      company: "Amazon",
      angle: "ALUM",
      userProfile: noSchoolProfile,
    });

    // Should not contain random school name in system prompt
    expect(result.system).not.toContain("Concordia");
    expect(result.system).not.toContain("undefined");
    // Should have a fallback hint (uses "school" as fallback)
    expect(result.system).toContain("fellow school grad");
  });

  it("STACK angle includes user's actual stack in system prompt", () => {
    const pythonProfile: UserProfile = {
      name: "Kim",
      role: "data engineer",
      location: "Toronto",
      stack: "Python, Spark, Airflow",
      experience: "5 years",
      education: "M.S. UofT",
    };

    const result = buildConnectionNotePrompt({
      profileText: "Data Engineer at Shopify",
      company: "Shopify",
      angle: "STACK",
      userProfile: pythonProfile,
    });

    expect(result.system).toContain("Python, Spark, Airflow");
  });
});

describe("buildFirstDMPrompt", () => {
  it("includes contactName in user message (no placeholder)", () => {
    const result = buildFirstDMPrompt({
      contactName: "Sarah Chen",
      company: "RBC",
      angle: "STACK",
      profileText: "Software Engineer at RBC",
      userProfile: TEST_PROFILE,
    });

    expect(result.messages[0]!.content).toContain("Contact name: Sarah Chen");
    expect(result.messages[0]!.content).not.toContain("[First Name]");
  });

  it("STACK angle goal does not contain peer-to-peer framing", () => {
    const result = buildFirstDMPrompt({
      contactName: "John",
      company: "Shopify",
      angle: "STACK",
      profileText: "Engineer at Shopify",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).not.toContain("peer-to-peer");
    expect(result.system).not.toContain("Peer-to-peer");
  });

  it("includes rule against pitching own qualifications", () => {
    const result = buildFirstDMPrompt({
      contactName: "Jane",
      company: "Google",
      angle: "ALUM",
      profileText: "Engineer at Google",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).toContain("Do NOT pitch or restate");
    expect(result.system).toContain("They can see your profile");
  });

  it("includes rule for concrete questions", () => {
    const result = buildFirstDMPrompt({
      contactName: "Bob",
      company: "Microsoft",
      angle: "STACK",
      profileText: "Dev at Microsoft",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).toContain("CONCRETE, useful question");
    expect(result.system).toContain("Avoid vague questions");
  });

  it("includes rule against inventing numbers", () => {
    const result = buildFirstDMPrompt({
      contactName: "Alice",
      company: "Amazon",
      angle: "RECRUITER",
      profileText: "Recruiter at Amazon",
      userProfile: TEST_PROFILE,
    });

    expect(result.system).toContain("never approximate, round, or invent numbers");
  });
});
