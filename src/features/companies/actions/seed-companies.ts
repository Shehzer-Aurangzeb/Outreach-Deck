"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { DEFAULT_COMPANIES } from "@/lib/seed-data";
import { requireUser } from "@/lib/supabase/server";

export async function seedCompanies(): Promise<{ created: number }> {
  const user = await requireUser();

  const existing = await prisma.company.findMany({
    where: { userId: user.id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

  const toCreate = DEFAULT_COMPANIES.filter(
    (c) => !existingNames.has(c.name.toLowerCase())
  );

  if (toCreate.length === 0) {
    return { created: 0 };
  }

  await prisma.company.createMany({
    data: toCreate.map((c) => ({
      ...c,
      userId: user.id,
    })),
  });

  revalidatePath("/companies");
  return { created: toCreate.length };
}
