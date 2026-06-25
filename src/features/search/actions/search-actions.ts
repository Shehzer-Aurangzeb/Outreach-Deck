"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

import type { Company } from "../lib/daily-search-generator";

export async function getCompaniesForSearches(): Promise<Company[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const companies = await prisma.company.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, tier: true },
    orderBy: { id: "asc" },
  });

  return companies;
}
