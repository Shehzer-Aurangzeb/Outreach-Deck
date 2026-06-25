import { z } from "zod";

/**
 * Schema for profile form input
 */
export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().min(1, "Location is required"),
  stack: z.string().min(1, "Stack/skills is required"),
  experience: z.string().min(1, "Experience is required"),
  education: z.string().min(1, "Education is required"),
  summary: z.string().optional(),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

/**
 * Schema for CV text input (to the parse endpoint)
 */
export const cvParseInputSchema = z.object({
  cvText: z.string().min(50, "CV text must be at least 50 characters"),
});

export type CvParseInput = z.infer<typeof cvParseInputSchema>;

/**
 * Schema for the parsed CV response from Claude
 * All fields accept empty strings - the user fills gaps in the review form
 */
export const parsedCvSchema = z.object({
  name: z.string(), // Empty string is valid
  role: z.string(),
  location: z.string(),
  stack: z.string(),
  experience: z.string(),
  education: z.string(),
  summary: z.string().optional().default(""),
});

export type ParsedCv = z.infer<typeof parsedCvSchema>;
