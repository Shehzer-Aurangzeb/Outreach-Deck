import { describe, expect, it } from "vitest";

import {
  generateDailySearches,
  type Angle,
  type Company,
  type SearchProfile,
} from "./daily-search-generator";

// Test data
const createCompany = (
  id: string,
  name: string,
  tier: "MID" | "CONSULTANCY" | "LARGE"
): Company => ({
  id,
  name,
  tier,
});

const testCompanies: Company[] = [
  createCompany("1", "Coveo", "MID"),
  createCompany("2", "Lightspeed", "MID"),
  createCompany("3", "Nuvei", "MID"),
  createCompany("4", "CGI", "CONSULTANCY"),
  createCompany("5", "Shopify", "LARGE"),
  createCompany("6", "Google", "LARGE"),
  createCompany("7", "Genetec", "MID"),
  createCompany("8", "Hopper", "MID"),
];

const testProfile: SearchProfile = {
  role: "full-stack developer",
  stack: "React, TypeScript, Node.js",
  education: "M.S. Computer Science, Concordia University",
};

describe("generateDailySearches", () => {
  it("returns same 3 companies for the same date (deterministic)", () => {
    const date = new Date("2024-06-15");

    const result1 = generateDailySearches(testCompanies, date, testProfile);
    const result2 = generateDailySearches(testCompanies, date, testProfile);

    expect(result1).toEqual(result2);
    expect(result1).toHaveLength(3);
  });

  it("returns same 3 companies for the same date and offset (deterministic)", () => {
    const date = new Date("2024-06-15");

    const result1 = generateDailySearches(testCompanies, date, testProfile, 5);
    const result2 = generateDailySearches(testCompanies, date, testProfile, 5);

    expect(result1).toEqual(result2);
    expect(result1).toHaveLength(3);
  });

  it("returns different companies for different offsets on the same date", () => {
    const date = new Date("2024-06-15");

    const offset0 = generateDailySearches(testCompanies, date, testProfile, 0);
    const offset1 = generateDailySearches(testCompanies, date, testProfile, 1);
    const offset2 = generateDailySearches(testCompanies, date, testProfile, 2);

    // Compare company IDs
    const ids0 = offset0.map((r) => r.company.id).sort().join(",");
    const ids1 = offset1.map((r) => r.company.id).sort().join(",");
    const ids2 = offset2.map((r) => r.company.id).sort().join(",");

    // At least some should differ
    const unique = new Set([ids0, ids1, ids2]);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("returns different companies for different dates (rotation)", () => {
    // Test across multiple date pairs to verify rotation happens
    const dates = [
      new Date("2024-01-01"),
      new Date("2024-03-15"),
      new Date("2024-06-20"),
      new Date("2024-09-10"),
      new Date("2024-12-25"),
    ];

    const results = dates.map((date) =>
      generateDailySearches(testCompanies, date, testProfile)
        .map((r) => r.company.id)
        .sort()
        .join(",")
    );

    // At least some of the results should differ (rotation is working)
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBeGreaterThan(1);
  });

  it("assigns each of the 3 selected companies a distinct angle", () => {
    const date = new Date("2024-06-15");
    const result = generateDailySearches(testCompanies, date, testProfile);

    const angles = result.map((r) => r.angle);
    const uniqueAngles = new Set(angles);

    expect(angles).toHaveLength(3);
    expect(uniqueAngles.size).toBe(3);
  });

  it("assigns distinct angles at every offset", () => {
    const date = new Date("2024-06-15");
    
    // Test multiple offsets
    for (let offset = 0; offset < 10; offset++) {
      const result = generateDailySearches(testCompanies, date, testProfile, offset);
      const angles = result.map((r) => r.angle);
      const uniqueAngles = new Set(angles);

      expect(angles).toHaveLength(3);
      expect(uniqueAngles.size).toBe(3);
    }
  });

  it("interpolates school from profile into ALUM queries", () => {
    const date = new Date("2024-06-15");
    const result = generateDailySearches(testCompanies, date, testProfile);

    const alumSearch = result.find((s) => s.angle === "ALUM");
    expect(alumSearch?.query).toContain("Concordia");
    expect(alumSearch?.query).not.toContain("Waterloo");
  });

  it("interpolates stack from profile into STACK queries", () => {
    const date = new Date("2024-06-15");
    const result = generateDailySearches(testCompanies, date, testProfile);

    const stackSearch = result.find((s) => s.angle === "STACK");
    // Should contain at least some stack terms from the profile
    expect(stackSearch?.query).toMatch(/React|TypeScript|Node/);
  });

  it("uses different school for different profile (no hardcoded Concordia)", () => {
    const date = new Date("2024-06-15");
    const waterlooProfile: SearchProfile = {
      role: "backend developer",
      stack: "Python, Django, PostgreSQL",
      education: "B.S. Computer Science, University of Waterloo",
    };

    const result = generateDailySearches(testCompanies, date, waterlooProfile);
    const alumSearch = result.find((s) => s.angle === "ALUM");

    expect(alumSearch?.query).toContain("Waterloo");
    expect(alumSearch?.query).not.toContain("Concordia");
  });

  it("uses different stack for different profile (no hardcoded React/TypeScript)", () => {
    const date = new Date("2024-06-15");
    const pythonProfile: SearchProfile = {
      role: "backend developer",
      stack: "Python, Django, PostgreSQL",
      education: "B.S. CS, MIT",
    };

    const result = generateDailySearches(testCompanies, date, pythonProfile);
    const stackSearch = result.find((s) => s.angle === "STACK");

    expect(stackSearch?.query).toMatch(/Python|Django|PostgreSQL/);
    expect(stackSearch?.query).not.toContain("React");
  });

  it("falls back gracefully when profile has no school", () => {
    const date = new Date("2024-06-15");
    const noSchoolProfile: SearchProfile = {
      role: "software engineer",
      stack: "JavaScript",
      education: "",
    };

    const result = generateDailySearches(testCompanies, date, noSchoolProfile);
    const alumSearch = result.find((s) => s.angle === "ALUM");

    // Should not contain random school name, should use role instead
    expect(alumSearch?.query).toContain("software engineer");
    expect(alumSearch?.query).not.toContain("Concordia");
    expect(alumSearch?.query).not.toContain("undefined");
  });

  it("builds valid LinkedIn URLs with encoded query", () => {
    const date = new Date("2024-06-15");
    const result = generateDailySearches(testCompanies, date, testProfile);

    const expectedPrefix =
      "https://www.linkedin.com/search/results/people/?keywords=";

    for (const search of result) {
      expect(search.linkedinUrl.startsWith(expectedPrefix)).toBe(true);
      expect(search.linkedinUrl).toContain(encodeURIComponent(search.query));
    }
  });

  it("favors MID and CONSULTANCY tiers over LARGE (tier weighting)", () => {
    // Run many iterations to verify statistical weighting
    const dates = Array.from(
      { length: 100 },
      (_, i) => new Date(`2024-01-${String((i % 28) + 1).padStart(2, "0")}`)
    );

    let midConsultancyCount = 0;
    let largeCount = 0;

    for (const date of dates) {
      const result = generateDailySearches(testCompanies, date, testProfile);
      for (const search of result) {
        if (
          search.company.tier === "MID" ||
          search.company.tier === "CONSULTANCY"
        ) {
          midConsultancyCount++;
        } else {
          largeCount++;
        }
      }
    }

    // With 80/20 weighting, MID+CONSULTANCY should significantly outnumber LARGE
    // Given we have 6 MID/CONSULTANCY and 2 LARGE, with 80/20 weighting
    // the ratio should favor MID/CONSULTANCY heavily
    const ratio = midConsultancyCount / (midConsultancyCount + largeCount);
    expect(ratio).toBeGreaterThan(0.6); // Should be well above 60%
  });

  it("handles empty company list", () => {
    const date = new Date("2024-06-15");
    const result = generateDailySearches([], date, testProfile);

    expect(result).toEqual([]);
  });

  it("handles fewer than 3 companies", () => {
    const date = new Date("2024-06-15");
    const twoCompanies = testCompanies.slice(0, 2);

    const result = generateDailySearches(twoCompanies, date, testProfile);

    expect(result).toHaveLength(2);
  });
});
