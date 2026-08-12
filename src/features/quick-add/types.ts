import type { z } from "zod";

import type { classifiedProfileSchema, classifyInputSchema } from "./schema";

export type ClassifyInput = z.infer<typeof classifyInputSchema>;
export type ClassifiedProfile = z.infer<typeof classifiedProfileSchema>;
