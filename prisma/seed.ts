/**
 * Default company seed list — Canadian-market tech employers that hire
 * full-stack / frontend engineers. Canada-wide (not Montreal-only).
 *
 * Tiers:
 *  - MID:         realistic product companies, best 1–2 month odds
 *  - CONSULTANCY: fast-hiring services/consulting shops (high volume, quick process,
 *                 and a Canadian-entity paycheck — useful for the PR timeline)
 *  - LARGE:       big names / stretch goals (slower, more competitive)
 *
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient, Tier } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedCompany {
  name: string;
  city: string;
  tier: Tier;
}

const SEED_COMPANIES: SeedCompany[] = [
  // ---------------- MID-TIER PRODUCT COMPANIES ----------------
  // Montreal
  { name: "Coveo", city: "Montreal / Quebec City", tier: "MID" },
  { name: "Lightspeed", city: "Montreal", tier: "MID" },
  { name: "Nuvei", city: "Montreal", tier: "MID" },
  { name: "Genetec", city: "Montreal", tier: "MID" },
  { name: "Hopper", city: "Montreal", tier: "MID" },
  { name: "Workleap (GSoft)", city: "Montreal", tier: "MID" },
  { name: "Plusgrade", city: "Montreal", tier: "MID" },
  { name: "Dialogue", city: "Montreal", tier: "MID" },
  { name: "SSENSE", city: "Montreal", tier: "MID" },
  { name: "Sonder", city: "Montreal / remote", tier: "MID" },
  { name: "Local Logic", city: "Montreal", tier: "MID" },
  { name: "Potloc", city: "Montreal", tier: "MID" },
  { name: "Shakepay", city: "Montreal / remote", tier: "MID" },
  // Toronto / GTA
  { name: "Wealthsimple", city: "Toronto / remote", tier: "MID" },
  { name: "Ada", city: "Toronto / remote", tier: "MID" },
  { name: "Float", city: "Toronto / remote", tier: "MID" },
  { name: "Super.com", city: "Toronto / remote", tier: "MID" },
  { name: "Clutch", city: "Toronto / remote", tier: "MID" },
  { name: "Ashby", city: "Toronto / remote", tier: "MID" },
  { name: "Cohere", city: "Toronto / remote", tier: "MID" },
  { name: "PureFacts", city: "Toronto", tier: "MID" },
  // Waterloo / KW corridor
  { name: "Vidyard", city: "Kitchener-Waterloo / remote", tier: "MID" },
  { name: "ApplyBoard", city: "Waterloo / remote", tier: "MID" },
  { name: "Faire", city: "Kitchener-Waterloo / remote", tier: "MID" },
  { name: "MasterClass (Waterloo eng)", city: "Waterloo", tier: "MID" },
  { name: "Jobber", city: "Edmonton / remote", tier: "MID" },
  // Vancouver / West
  { name: "Clio", city: "Vancouver / remote", tier: "MID" },
  { name: "Klue", city: "Vancouver / Toronto / remote", tier: "MID" },
  { name: "Trulioo", city: "Vancouver", tier: "MID" },
  { name: "AlayaCare", city: "Montreal / Toronto / remote", tier: "MID" },
  { name: "Arctic Wolf", city: "Waterloo / remote", tier: "MID" },

  // ---------------- FAST-HIRING CONSULTANCIES ----------------
  { name: "CGI", city: "Montreal / national", tier: "CONSULTANCY" },
  { name: "Cofomo", city: "Montreal", tier: "CONSULTANCY" },
  { name: "Alithya", city: "Montreal / national", tier: "CONSULTANCY" },
  { name: "Levio", city: "Montreal / Quebec City", tier: "CONSULTANCY" },
  { name: "Talsom", city: "Montreal", tier: "CONSULTANCY" },
  { name: "Nexapp", city: "Quebec City / remote", tier: "CONSULTANCY" },
  { name: "Spiria", city: "Montreal / Gatineau", tier: "CONSULTANCY" },
  { name: "Osedea", city: "Montreal", tier: "CONSULTANCY" },
  { name: "Done Technologies", city: "Montreal", tier: "CONSULTANCY" },
  { name: "EPAM", city: "Toronto / remote", tier: "CONSULTANCY" },

  // ---------------- LARGE / STRETCH ----------------
  { name: "Shopify", city: "remote-Canada", tier: "LARGE" },
  { name: "Google", city: "Montreal / Waterloo / Toronto", tier: "LARGE" },
  { name: "Microsoft", city: "Montreal / Vancouver / Toronto", tier: "LARGE" },
  { name: "Amazon", city: "Toronto / Vancouver", tier: "LARGE" },
  { name: "Intact", city: "Montreal / national", tier: "LARGE" },
  { name: "RBC", city: "Toronto / national", tier: "LARGE" },
  { name: "Autodesk", city: "Montreal / Toronto", tier: "LARGE" },
  { name: "Cisco", city: "Toronto / Ottawa", tier: "LARGE" },
  { name: "Square Enix", city: "Montreal", tier: "LARGE" },
  { name: "Ubisoft", city: "Montreal / Toronto / Quebec City", tier: "LARGE" },
  { name: "Behaviour Interactive", city: "Montreal", tier: "LARGE" },
  { name: "BlackBerry", city: "Waterloo", tier: "LARGE" },
];

async function main() {
  // Get userId from command line or find existing user
  let userId = process.argv[2];

  if (!userId) {
    // Try to find an existing user by looking at any existing company
    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
      userId = existingCompany.userId;
      console.log(`Using existing userId from companies: ${userId}`);
    } else {
      console.error("No userId provided and no existing companies found.");
      console.error("Usage: npx tsx prisma/seed.ts <userId>");
      console.error("You can get your userId from Supabase dashboard or browser console.");
      process.exit(1);
    }
  }

  console.log(`Seeding ${SEED_COMPANIES.length} companies for user ${userId}...`);

  // Get existing company names for this user (case-insensitive dedupe)
  const existingCompanies = await prisma.company.findMany({
    where: { userId },
    select: { name: true },
  });
  const existingNames = new Set(
    existingCompanies.map((c) => c.name.toLowerCase().trim())
  );

  // Filter out duplicates
  const newCompanies = SEED_COMPANIES.filter(
    (c) => !existingNames.has(c.name.toLowerCase().trim())
  );

  if (newCompanies.length === 0) {
    console.log("All companies already exist. Nothing to seed.");
    return;
  }

  console.log(
    `Skipping ${SEED_COMPANIES.length - newCompanies.length} existing companies.`
  );
  console.log(`Creating ${newCompanies.length} new companies...`);

  // Insert in batch
  const result = await prisma.company.createMany({
    data: newCompanies.map((c) => ({
      userId,
      name: c.name,
      city: c.city,
      tier: c.tier,
    })),
  });

  console.log(`✓ Created ${result.count} companies.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
