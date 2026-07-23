import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool)
});

async function main() {
  console.log("🔄 Fetching live R.O.L.L. user progress from Neon database...");
  
  // 1. Get the admin user
  const user = await prisma.user.findFirst({
    where: { email: "nathanw@gmail.com" }
  });
  
  if (!user) {
    console.error("❌ Admin user nathanw@gmail.com not found in database.");
    return;
  }
  
  console.log(`👤 Found user: ${user.username} (${user.id})`);
  
  // 1.5 Get active dataset version
  const dataset = await prisma.datasetVersion.findFirst({
    where: { isActive: true }
  });
  if (!dataset) {
    console.error("❌ Active dataset version not found in database.");
    return;
  }

  // 2. Fetch both user progress and baseline tables to replicate frontend merge logic
  const [progressList, baselineList] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId: user.id, effectTier: { datasetVersionId: dataset.id } },
      include: {
        effectTier: {
          include: {
            effect: true,
            tier: true
          }
        }
      }
    }),
    prisma.userImportBaseline.findMany({
      where: { userId: user.id, unlocked: true, effectTier: { datasetVersionId: dataset.id } },
      include: {
        effectTier: {
          include: {
            effect: true,
            tier: true
          }
        }
      }
    })
  ]);

  // Map of effectTierId to progress unlocked status
  const progressMap = new Map<string, boolean>();
  progressList.forEach((p) => {
    progressMap.set(p.effectTierId, p.unlocked);
  });

  const unlockedKeys = new Set<string>();

  // Helper to add to set
  const addUnlockedKey = (effectTier: { tier: { label: string }; effect: { name: string } }) => {
    const tierLabel = effectTier.tier.label.trim().toLowerCase(); // e.g. "1 star"
    const effectName = effectTier.effect.name.trim().toLowerCase(); // e.g. "adrenal"
    unlockedKeys.add(`${tierLabel}:${effectName}`);
  };

  // Process progress records
  progressList.forEach((p) => {
    if (p.unlocked) {
      addUnlockedKey(p.effectTier);
    }
  });

  // Process baseline records (only if no progress override exists)
  baselineList.forEach((b) => {
    if (!progressMap.has(b.effectTierId)) {
      addUnlockedKey(b.effectTier);
    }
  });

  console.log(`📈 Found ${unlockedKeys.size} unlocked legendary mods in live database (merged progress + baseline).`);
  
  // 3. Read the local Fallout76 Tracker Personal - All Tiers.txt
  const allTiersPath = path.join(process.cwd(), "data", "Fallout76 Tracker Personal - All Tiers.txt");
  if (!fs.existsSync(allTiersPath)) {
    console.error(`❌ Local file not found: ${allTiersPath}`);
    return;
  }
  
  const content = fs.readFileSync(allTiersPath, "utf8");
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) {
    console.error("❌ File is empty.");
    return;
  }
  
  const updatedLines: string[] = [lines[0]];
  const stillNeedRows: string[] = [lines[0]];
  
  let updatedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 7) {
      updatedLines.push(line);
      continue;
    }
    
    const tier = parts[0].trim();
    const effectName = parts[1].trim();
    const key = `${tier.toLowerCase()}:${effectName.toLowerCase()}`;
    
    let isUnlocked = parts[6].trim().toLowerCase() === "yes";
    
    // Check if the live database says this mod is unlocked
    if (unlockedKeys.has(key)) {
      if (!isUnlocked) {
        parts[6] = "Yes";
        updatedCount++;
      }
      isUnlocked = true;
    } else {
      if (isUnlocked) {
        parts[6] = "No";
        updatedCount++;
      }
      isUnlocked = false;
    }
    
    const updatedLine = parts.join('\t');
    updatedLines.push(updatedLine);
    
    if (!isUnlocked) {
      stillNeedRows.push(updatedLine);
    }
  }
  
  // 4. Write back updated All Tiers file
  fs.writeFileSync(allTiersPath, updatedLines.join('\n'), "utf8");
  console.log(`💾 Saved updated All Tiers file. Synchronized ${updatedCount} mod status changes.`);
  
  // 5. Write back updated Still Need file
  const stillNeedPath = path.join(process.cwd(), "data", "Fallout76 Tracker Personal - Still Need.txt");
  fs.writeFileSync(stillNeedPath, stillNeedRows.join('\n'), "utf8");
  console.log(`💾 Regenerated Still Need tracker with ${stillNeedRows.length - 1} remaining mods.`);
  console.log("✅ Sync complete!");
}

main()
  .catch((e) => console.error("❌ Sync Error:", e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
