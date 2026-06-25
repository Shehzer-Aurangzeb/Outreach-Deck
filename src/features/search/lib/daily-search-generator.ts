import type { Tier } from "@prisma/client";

export type Angle = "ALUM" | "STACK" | "RECRUITER";

export interface Company {
  id: string;
  name: string;
  tier: Tier;
}

/**
 * Profile fields needed for search query generation.
 * Subset of the full UserProfile — only what's interpolated into queries.
 */
export interface SearchProfile {
  role: string;
  stack: string;
  education: string;
}

export interface DailySearch {
  company: Company;
  angle: Angle;
  query: string;
  linkedinUrl: string;
}

export interface AdHocSearch {
  companyName: string;
  angle: Angle;
  query: string;
  linkedinUrl: string;
}

const ANGLES: Angle[] = ["ALUM", "STACK", "RECRUITER"];

/**
 * Extract the primary school name from education for LinkedIn search.
 * Returns a short, searchable name (e.g., "Concordia", "Waterloo", "MIT").
 */
function extractSchoolForSearch(education: string): string | null {
  if (!education || education.trim().length === 0) return null;

  const shortNames = [
    "MIT", "Stanford", "Harvard", "Berkeley", "Waterloo", "Concordia",
    "McGill", "UBC", "Toronto", "Yale", "Princeton", "Columbia",
    "Carnegie Mellon", "Georgia Tech", "UCLA", "UIUC",
  ];

  for (const name of shortNames) {
    if (education.toLowerCase().includes(name.toLowerCase())) {
      return name;
    }
  }

  const patterns = [
    /University\s+of\s+(\w+)/i,
    /(\w+)\s+University/i,
    /(\w+)\s+College/i,
  ];

  for (const pattern of patterns) {
    const match = education.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract key stack terms for LinkedIn search (2-3 technologies).
 */
function extractStackTerms(stack: string): string {
  if (!stack || stack.trim().length === 0) return "software engineer";

  const terms = stack.split(/[,\/\s]+/).filter((t) => t.length > 1);
  const topTerms = terms.slice(0, 3).join(" ");
  return topTerms || "software engineer";
}

type AngleTemplates = Record<
  Angle,
  { template: (company: string, profile: SearchProfile) => string; rationale: (profile: SearchProfile) => string }
>;

const ANGLE_TEMPLATES: AngleTemplates = {
  ALUM: {
    template: (company, profile) => {
      const school = extractSchoolForSearch(profile.education);
      return school
        ? `${company} software engineer ${school}`
        : `${company} ${profile.role || "software engineer"}`;
    },
    rationale: (profile) => {
      const school = extractSchoolForSearch(profile.education);
      return school
        ? `Fellow ${school} alum = highest reply rate`
        : "Shared background = warmer opener";
    },
  },
  STACK: {
    template: (company, profile) => {
      const stackTerms = extractStackTerms(profile.stack);
      return `${company} ${stackTerms}`;
    },
    rationale: (profile) => `Dev on ${profile.stack || "your stack"}; remembers the process`,
  },
  RECRUITER: {
    template: (company) => `${company} technical recruiter talent acquisition`,
    rationale: () => "Replies reliably; gives real pipeline info",
  },
};

export function buildLinkedInUrl(query: string): string {
  const encoded = encodeURIComponent(query);
  return `https://www.linkedin.com/search/results/people/?keywords=${encoded}`;
}

export function buildSearchQuery(companyName: string, angle: Angle, profile: SearchProfile): string {
  return ANGLE_TEMPLATES[angle].template(companyName, profile);
}

export function generateAdHocSearches(companyName: string, profile: SearchProfile): AdHocSearch[] {
  return ANGLES.map((angle) => {
    const query = buildSearchQuery(companyName, angle, profile);
    return {
      companyName,
      angle,
      query,
      linkedinUrl: buildLinkedInUrl(query),
    };
  });
}

/** Seeded PRNG (mulberry32) for deterministic sequences */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(date: Date, offset: number = 0): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return year * 10000 + month * 100 + day + offset * 1000000;
}

/** Weighted shuffle: 80% MID/CONSULTANCY, 20% LARGE */
function weightedShuffle(
  companies: Company[],
  random: () => number
): Company[] {
  const preferred = companies.filter(
    (c) => c.tier === "MID" || c.tier === "CONSULTANCY"
  );
  const stretch = companies.filter((c) => c.tier === "LARGE");

  const shuffleArray = <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  };

  const shuffledPreferred = shuffleArray(preferred);
  const shuffledStretch = shuffleArray(stretch);

  const result: Company[] = [];
  let prefIdx = 0;
  let stretchIdx = 0;

  while (
    result.length < companies.length &&
    (prefIdx < shuffledPreferred.length || stretchIdx < shuffledStretch.length)
  ) {
    const pickPreferred = random() < 0.8;

    if (pickPreferred && prefIdx < shuffledPreferred.length) {
      result.push(shuffledPreferred[prefIdx]!);
      prefIdx++;
    } else if (stretchIdx < shuffledStretch.length) {
      result.push(shuffledStretch[stretchIdx]!);
      stretchIdx++;
    } else if (prefIdx < shuffledPreferred.length) {
      result.push(shuffledPreferred[prefIdx]!);
      prefIdx++;
    }
  }

  return result;
}

/**
 * Deterministic daily search generator.
 * Same (companies, date, offset, profile) = same output.
 * Profile is used for query interpolation (school, stack), not for seeding.
 */
export function generateDailySearches(
  companies: Company[],
  date: Date,
  profile: SearchProfile,
  offset: number = 0
): DailySearch[] {
  if (companies.length === 0) return [];

  const seed = dateToSeed(date, offset);
  const random = seededRandom(seed);
  const shuffled = weightedShuffle(companies, random);
  const selected = shuffled.slice(0, Math.min(3, shuffled.length));

  const shuffledAngles = [...ANGLES];
  for (let i = shuffledAngles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffledAngles[i], shuffledAngles[j]] = [
      shuffledAngles[j]!,
      shuffledAngles[i]!,
    ];
  }

  return selected.map((company, index) => {
    const angle = shuffledAngles[index % shuffledAngles.length]!;
    const query = buildSearchQuery(company.name, angle, profile);

    return {
      company,
      angle,
      query,
      linkedinUrl: buildLinkedInUrl(query),
    };
  });
}

export function getAngleRationale(angle: Angle, profile: SearchProfile): string {
  return ANGLE_TEMPLATES[angle].rationale(profile);
}
