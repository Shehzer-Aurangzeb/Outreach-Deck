"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";

import { createCompanySchema, updateCompanySchema } from "../schema";
import type { Company, CreateCompanyInput, UpdateCompanyInput } from "../types";

export async function getCompanies(): Promise<Company[]> {
  const user = await requireUser();

  return prisma.company.findMany({
    where: { userId: user.id },
    orderBy: [{ tier: "asc" }, { name: "asc" }],
  });
}

export async function createCompany(
  input: CreateCompanyInput
): Promise<Company> {
  const user = await requireUser();
  const parsed = createCompanySchema.parse(input);

  const company = await prisma.company.create({
    data: {
      ...parsed,
      userId: user.id,
    },
  });

  revalidatePath("/companies");
  return company;
}

export async function updateCompany(
  id: string,
  input: UpdateCompanyInput
): Promise<Company> {
  const user = await requireUser();
  const parsed = updateCompanySchema.parse(input);

  const existing = await prisma.company.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Company not found");
  }

  const company = await prisma.company.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/companies");
  return company;
}

export async function deleteCompany(id: string): Promise<void> {
  const user = await requireUser();

  const existing = await prisma.company.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Company not found");
  }

  await prisma.company.delete({
    where: { id },
  });

  revalidatePath("/companies");
}

export async function bulkCreateCompanies(
  inputs: CreateCompanyInput[]
): Promise<{ created: number; skipped: number }> {
  const user = await requireUser();

  const existingCompanies = await prisma.company.findMany({
    where: { userId: user.id },
    select: { name: true },
  });
  const existingNames = new Set(existingCompanies.map((c) => c.name.toLowerCase()));

  const newCompanies = inputs.filter(
    (input) => !existingNames.has(input.name.toLowerCase())
  );

  if (newCompanies.length > 0) {
    await prisma.company.createMany({
      data: newCompanies.map((input) => {
        const parsed = createCompanySchema.parse(input);
        return { ...parsed, userId: user.id };
      }),
    });
  }

  revalidatePath("/companies");
  return { created: newCompanies.length, skipped: inputs.length - newCompanies.length };
}
