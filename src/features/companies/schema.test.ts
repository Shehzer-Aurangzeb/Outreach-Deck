import { describe, expect, it } from "vitest";

import {
  companyFormSchema,
  createCompanySchema,
  updateCompanySchema,
} from "./schema";

describe("companyFormSchema", () => {
  it("accepts valid input with all fields", () => {
    const input = {
      name: "Coveo",
      city: "Montreal",
      tier: "MID",
    };

    const result = companyFormSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("accepts valid input with null city", () => {
    const input = {
      name: "Shopify",
      city: null,
      tier: "LARGE",
    };

    const result = companyFormSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const input = {
      name: "",
      tier: "MID",
    };

    const result = companyFormSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("name");
    }
  });

  it("rejects invalid tier value", () => {
    const input = {
      name: "TestCo",
      tier: "INVALID",
    };

    const result = companyFormSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("tier");
    }
  });

  it("accepts all valid tier values", () => {
    const tiers = ["MID", "CONSULTANCY", "LARGE"];

    for (const tier of tiers) {
      const result = companyFormSchema.safeParse({ name: "Test", tier });
      expect(result.success).toBe(true);
    }
  });
});

describe("createCompanySchema", () => {
  it("defaults tier to MID when not provided", () => {
    const input = {
      name: "NewCo",
    };

    const result = createCompanySchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tier).toBe("MID");
    }
  });

  it("accepts explicit tier value", () => {
    const input = {
      name: "BigCo",
      tier: "LARGE",
    };

    const result = createCompanySchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tier).toBe("LARGE");
    }
  });
});

describe("updateCompanySchema", () => {
  it("accepts partial updates (name only)", () => {
    const input = {
      name: "Updated Name",
    };

    const result = updateCompanySchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Updated Name");
      expect(result.data.tier).toBeUndefined();
    }
  });

  it("accepts partial updates (tier only)", () => {
    const input = {
      tier: "CONSULTANCY",
    };

    const result = updateCompanySchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tier).toBe("CONSULTANCY");
    }
  });

  it("accepts empty object (no updates)", () => {
    const result = updateCompanySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("rejects empty name when name is provided", () => {
    const input = {
      name: "",
    };

    const result = updateCompanySchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
