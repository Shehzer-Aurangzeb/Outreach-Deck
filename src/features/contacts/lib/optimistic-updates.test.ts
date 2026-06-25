import { describe, expect, it } from "vitest";

import {
  applyMessageAppend,
  applyStageMove,
  rollbackMessageAppend,
  rollbackStageMove,
  type ContactWithMessages,
} from "./optimistic-updates";

// Helper to create test contacts
function createContact(
  id: string,
  stage: "CONTACTED" | "REPLIED" | "TALKING" | "CLOSED",
  messages: Array<{ id: string; role: "YOU" | "THEM"; text: string }> = []
): ContactWithMessages {
  return {
    id,
    userId: "user-1",
    name: `Contact ${id}`,
    company: "Test Co",
    angle: "STACK",
    stage,
    linkedinUrl: null,
    profileText: null,
    nextStep: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    messages: messages.map((m) => ({
      ...m,
      contactId: id,
      createdAt: new Date("2024-01-01"),
    })),
  };
}

describe("applyStageMove", () => {
  it("updates the stage of the specified contact", () => {
    const contacts = [
      createContact("1", "CONTACTED"),
      createContact("2", "REPLIED"),
    ];

    const result = applyStageMove(contacts, "1", "REPLIED");

    expect(result[0]!.stage).toBe("REPLIED");
    expect(result[1]!.stage).toBe("REPLIED"); // unchanged
  });

  it("does not mutate the original array", () => {
    const contacts = [createContact("1", "CONTACTED")];
    const original = contacts[0]!;

    const result = applyStageMove(contacts, "1", "REPLIED");

    expect(contacts[0]!.stage).toBe("CONTACTED"); // original unchanged
    expect(result[0]!.stage).toBe("REPLIED");
    expect(result[0]).not.toBe(original);
  });

  it("updates the updatedAt timestamp", () => {
    const contacts = [createContact("1", "CONTACTED")];
    const originalUpdatedAt = contacts[0]!.updatedAt;

    const result = applyStageMove(contacts, "1", "REPLIED");

    expect(result[0]!.updatedAt.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime()
    );
  });

  it("leaves other contacts unchanged", () => {
    const contacts = [
      createContact("1", "CONTACTED"),
      createContact("2", "REPLIED"),
      createContact("3", "TALKING"),
    ];

    const result = applyStageMove(contacts, "2", "TALKING");

    expect(result[0]).toEqual(contacts[0]);
    expect(result[2]).toEqual(contacts[2]);
    expect(result[1]!.stage).toBe("TALKING");
  });
});

describe("rollbackStageMove", () => {
  it("restores the previous state exactly", () => {
    const original = [
      createContact("1", "CONTACTED"),
      createContact("2", "REPLIED"),
    ];

    const modified = applyStageMove(original, "1", "REPLIED");
    const rolledBack = rollbackStageMove(original);

    expect(rolledBack).toEqual(original);
    expect(rolledBack).toBe(original); // Same reference
    expect(modified[0]!.stage).toBe("REPLIED"); // modified was changed
  });
});

describe("applyMessageAppend", () => {
  it("adds a message to the specified contact", () => {
    const contacts = [
      createContact("1", "CONTACTED", [
        { id: "msg-1", role: "YOU", text: "Hi there!" },
      ]),
    ];

    const result = applyMessageAppend(contacts, "1", {
      contactId: "1",
      role: "THEM",
      text: "Thanks for reaching out!",
    });

    expect(result[0]!.messages).toHaveLength(2);
    expect(result[0]!.messages[1]!.role).toBe("THEM");
    expect(result[0]!.messages[1]!.text).toBe("Thanks for reaching out!");
  });

  it("assigns an optimistic ID to the new message", () => {
    const contacts = [createContact("1", "CONTACTED")];

    const result = applyMessageAppend(contacts, "1", {
      contactId: "1",
      role: "YOU",
      text: "Hello!",
    });

    expect(result[0]!.messages[0]!.id).toMatch(/^optimistic-\d+$/);
  });

  it("does not mutate the original array", () => {
    const contacts = [createContact("1", "CONTACTED")];

    const result = applyMessageAppend(contacts, "1", {
      contactId: "1",
      role: "YOU",
      text: "Hello!",
    });

    expect(contacts[0]!.messages).toHaveLength(0);
    expect(result[0]!.messages).toHaveLength(1);
  });

  it("preserves existing messages", () => {
    const contacts = [
      createContact("1", "CONTACTED", [
        { id: "msg-1", role: "YOU", text: "First message" },
        { id: "msg-2", role: "THEM", text: "Reply" },
      ]),
    ];

    const result = applyMessageAppend(contacts, "1", {
      contactId: "1",
      role: "YOU",
      text: "New message",
    });

    expect(result[0]!.messages).toHaveLength(3);
    expect(result[0]!.messages[0]!.text).toBe("First message");
    expect(result[0]!.messages[1]!.text).toBe("Reply");
    expect(result[0]!.messages[2]!.text).toBe("New message");
  });
});

describe("rollbackMessageAppend", () => {
  it("restores the previous state exactly", () => {
    const original = [
      createContact("1", "CONTACTED", [
        { id: "msg-1", role: "YOU", text: "Original" },
      ]),
    ];

    const modified = applyMessageAppend(original, "1", {
      contactId: "1",
      role: "THEM",
      text: "New message",
    });

    const rolledBack = rollbackMessageAppend(original);

    expect(rolledBack).toEqual(original);
    expect(rolledBack[0]!.messages).toHaveLength(1);
    expect(modified[0]!.messages).toHaveLength(2);
  });
});
