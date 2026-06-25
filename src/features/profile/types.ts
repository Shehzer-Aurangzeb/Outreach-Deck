import type { Profile as PrismaProfile } from "@prisma/client";

/**
 * Database Profile type from Prisma
 */
export type Profile = PrismaProfile;

/**
 * Profile shape used in prompts and drafting
 */
export interface UserProfile {
  name: string;
  role: string;
  location: string;
  stack: string;
  experience: string;
  education: string;
  summary?: string | null;
}

/**
 * Convert Prisma Profile to UserProfile for prompts
 */
export function toUserProfile(profile: Profile): UserProfile {
  return {
    name: profile.name,
    role: profile.role,
    location: profile.location,
    stack: profile.stack,
    experience: profile.experience,
    education: profile.education,
    summary: profile.summary,
  };
}
