import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Try to find userId from contacts
  const contact = await prisma.contact.findFirst();
  if (contact) {
    console.log("Found userId from contacts:", contact.userId);
    return;
  }
  
  // Try to find from companies
  const company = await prisma.company.findFirst();
  if (company) {
    console.log("Found userId from company:", company.userId);
    return;
  }

  console.log("No existing user data found in database.");
}

main()
  .finally(() => prisma.$disconnect());
