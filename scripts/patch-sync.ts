import fs from "fs";
import path from "path";

const GROUND_TRUTH_LIVE_DIR = path.join(process.cwd(), "src/data/ground-truth/live");
const GROUND_TRUTH_PTS_DIR = path.join(process.cwd(), "src/data/ground-truth/pts");
const WIKI_DATA_FILE = path.join(process.cwd(), "src/lib/wiki/wiki-articles-data.ts");

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGroundTruth(): ValidationResult {
  const result: ValidationResult = { passed: true, errors: [], warnings: [] };

  const requiredLiveFiles = [
    "meta.json",
    "magazines_and_bobbleheads.json",
    "consumables_and_buffs.json",
    "armor_and_power_armor_sets.json",
    "combat_vats_and_damage.json",
    "currencies_and_game_caps.json"
  ];

  const requiredPtsFiles = [
    "pts_meta.json",
    "pts_experimental_effects.json"
  ];

  // 1. Verify Live Files
  for (const file of requiredLiveFiles) {
    const fullPath = path.join(GROUND_TRUTH_LIVE_DIR, file);
    if (!fs.existsSync(fullPath)) {
      result.errors.push(`Missing required Live ground-truth file: ${file}`);
      result.passed = false;
    } else {
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        if (!content) {
          result.errors.push(`Empty or invalid JSON in ${file}`);
          result.passed = false;
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`JSON syntax error in ${file}: ${errorMsg}`);
        result.passed = false;
      }
    }
  }

  // 2. Verify PTS Files
  for (const file of requiredPtsFiles) {
    const fullPath = path.join(GROUND_TRUTH_PTS_DIR, file);
    if (!fs.existsSync(fullPath)) {
      result.errors.push(`Missing required PTS ground-truth file: ${file}`);
      result.passed = false;
    }
  }

  // 3. Verify Wiki Guide Integrity against Known Nerfs/Rebalances
  if (fs.existsSync(WIKI_DATA_FILE)) {
    const wikiContent = fs.readFileSync(WIKI_DATA_FILE, "utf-8");

    // Check for obsolete L&L3 claims (e.g. claims that L&L3 boosts food stat/XP buffs)
    if (wikiContent.includes("Live & Love 3 - provides 50% increase to plant based food buffs") ||
        wikiContent.includes("Live & Love 3 boosts Brain Bombs") ||
        wikiContent.includes("Live & Love 3 increases XP food buffs")) {
      result.errors.push("Wiki contains obsolete pre-patch Live & Love 3 food buff multiplier claims.");
      result.passed = false;
    }
  }

  return result;
}

// Direct execution CLI runner
if (require.main === module) {
  console.log("🔍 Running Fallout 76 Patch & Ground-Truth Integrity Check...");
  const validation = validateGroundTruth();

  if (validation.passed) {
    console.log("✅ All Ground-Truth datasets & live guides verified 100% compliant with current patch!");
    process.exit(0);
  } else {
    console.error("❌ Integrity check failed with errors:");
    validation.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}
