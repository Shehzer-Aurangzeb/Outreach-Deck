import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete the incorrectly seeded companies
  const result = await prisma.company.deleteMany({ 
    where: { userId: "find-user" } 
  });
  console.log("Deleted", result.count, "bad records");

  // Now find a real userId
  const contact = await prisma.contact.findFirst();
  if (contact) {
    console.log("Found userId from contacts:", contact.userId);
    return;
  }

  const company = await prisma.company.findFirst();
  if (company) {
    console.log("Found userId from company:", company.userId);
    return;
  }

  console.log("No existing user data found.");
}

main().finally(() => prisma.$disconnect());
