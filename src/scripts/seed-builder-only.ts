/**
 * Upsert builder `LegendaryMod` rows without re-running full TSV ingest.
 * Usage: `npx tsx src/scripts/seed-builder-only.ts`
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { seedBuilderCatalog } from "../lib/builder/seed-builder-catalog";
import { normalizeDatabaseUrl } from "../lib/database-url";

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL)
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool)
});

async function main() {
  await seedBuilderCatalog(prisma);
  console.log("Builder catalog seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
