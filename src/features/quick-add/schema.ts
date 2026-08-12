import { z } from "zod";

export const CATEGORIES = [
  "RECRUITER_EMBEDDED",
  "RECRUITER_AGENCY",
  "RECRUITER_VENDOR",
  "ALUMNI",
  "STACK_MATCH",
  "HIRING_MANAGER",
  "UNKNOWN",
] as const;

export const CONNECTION_STATES = ["CONNECTED", "NOT_CONNECTED", "UNKNOWN_STATE"] as const;
export const MESSAGE_MODES = ["CONNECTION_NOTE", "FIRST_DM"] as const;

export const classifyInputSchema = z.object({
  rawText: z.string().min(10, "Profile text too short"),
  schoolName: z.string().optional(),
  techStack: z.string().optional(),
});

export const classifiedProfileSchema = z.object({
  name: z.string(),
  company: z.string(),
  category: z.enum(CATEGORIES),
  secondaryCategories: z.array(z.enum(CATEGORIES)).default([]),
  connectionState: z.enum(CONNECTION_STATES),
  suggestedMode: z.enum(MESSAGE_MODES).nullable(),
  cleanedProfileText: z.string(),
  vendorEmail: z.string().email().nullable(),
  linkedinUrl: z.string().url().nullable(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});
