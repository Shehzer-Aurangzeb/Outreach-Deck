import { z } from "zod";

export const companyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().nullable().optional(),
  tier: z.enum(["MID", "CONSULTANCY", "LARGE"]),
});

export const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().nullable().optional(),
  tier: z.enum(["MID", "CONSULTANCY", "LARGE"]).default("MID"),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  city: z.string().nullable().optional(),
  tier: z.enum(["MID", "CONSULTANCY", "LARGE"]).optional(),
});

export const deleteCompanySchema = z.object({
  id: z.string().min(1),
});
