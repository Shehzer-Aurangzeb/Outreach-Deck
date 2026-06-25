import { describe, expect, it } from "vitest";

import { parsedCvSchema } from "./schema";

describe("parsedCvSchema", () => {
  it("accepts all fields as non-empty strings", () => {
    const result = parsedCvSchema.safeParse({
      name: "John Doe",
      role: "Software Engineer",
      location: "Montreal, Canada",
      stack: "React, TypeScript, Node.js",
      experience: "~4 years",
      education: "M.S. Computer Science, Concordia",
      summary: "Full-stack developer focused on web applications",
    });

    expect(result.success).toBe(true);
  });

  it("accepts empty strings for all fields (parser must never infer)", () => {
    // This is critical: the CV parser must be able to return empty strings
    // when data is not explicitly present in the CV text. The user fills gaps
    // in the review form, not the model.
    const result = parsedCvSchema.safeParse({
      name: "",
      role: "",
      location: "",
      stack: "",
      experience: "",
      education: "",
      summary: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("");
      expect(result.data.role).toBe("");
      expect(result.data.location).toBe("");
      expect(result.data.stack).toBe("");
      expect(result.data.experience).toBe("");
      expect(result.data.education).toBe("");
      expect(result.data.summary).toBe("");
    }
  });

  it("treats missing summary as empty string", () => {
    const result = parsedCvSchema.safeParse({
      name: "Jane",
      role: "Engineer",
      location: "Toronto",
      stack: "Python",
      experience: "3 years",
      education: "B.S. CS",
      // summary intentionally omitted
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe("");
    }
  });
});
