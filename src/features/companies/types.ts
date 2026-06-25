import type { Company, Tier } from "@prisma/client";
import { z } from "zod";

import {
  companyFormSchema,
  createCompanySchema,
  updateCompanySchema,
} from "./schema";

export type CompanyFormInput = z.infer<typeof companyFormSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export type { Company, Tier };

export type GroupedCompanies = {
  [key in Tier]?: Company[];
};
