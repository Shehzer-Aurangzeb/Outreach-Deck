import { z } from "zod";

/**
 * Schema for ad-hoc company search input
 */
export const adHocSearchSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name too long"),
});

export type AdHocSearchInput = z.infer<typeof adHocSearchSchema>;
