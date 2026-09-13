/**
 * Regenerates the combat firepower golden fixtures.
 *
 *   npx tsx scripts/gen-firepower-goldens.ts
 *
 * Goldens are a contract: regenerate only when a numeric change is intended,
 * and describe the diff in the commit body.
 */
import fs from "fs";
import path from "path";
import {
  calculateCombatFirepower,
  WEAPON_COMBAT_BASE_CATALOG,
  type CombatFirepowerResult
} from "../src/lib/builder/combat-firepower-engine";
import { AP_FUZZ_REDUCTIONS, GOLDEN_BUILDS, GOLDEN_DUMMY_IDS } from "../src/lib/builder/__fixtures__/firepower/builds";

const OUT_DIR = path.join(process.cwd(), "src/lib/builder/__fixtures__/firepower");

const goldens: Record<string, Record<string, CombatFirepowerResult>> = {};
for (const build of GOLDEN_BUILDS) {
  goldens[build.id] = {};
  for (const dummyId of GOLDEN_DUMMY_IDS) {
    goldens[build.id][dummyId] = calculateCombatFirepower({ ...build.input, targetDummyId: dummyId });
  }
}

// Pre-unification VATS AP formula (combat-firepower-engine §7), frozen as the contract
// the calculator adapter must reproduce exactly.
function legacyVatsApCost(baseAp: number, innateApCostPct: number, hasVatsOptimized: boolean): number {
  let apMultiplier = 1.0;
  if (hasVatsOptimized) apMultiplier *= 0.75;
  apMultiplier *= Math.max(0.1, 1.0 + innateApCostPct);
  return Math.max(2, Math.round(baseAp * apMultiplier));
}

const baseAps = [...new Set(Object.values(WEAPON_COMBAT_BASE_CATALOG).map((w) => w.baseVatsApCost))].sort((a, b) => a - b);
const apFuzz: Record<string, number> = {};
for (const baseAp of baseAps) {
  for (const pct of AP_FUZZ_REDUCTIONS) {
    for (const lvc of [false, true]) {
      apFuzz[`${baseAp}|${pct}|${lvc ? "lvc" : "none"}`] = legacyVatsApCost(baseAp, pct, lvc);
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "goldens.json"), JSON.stringify(goldens, null, 2) + "\n");
fs.writeFileSync(path.join(OUT_DIR, "ap-fuzz.json"), JSON.stringify(apFuzz, null, 2) + "\n");
console.log(`Wrote ${GOLDEN_BUILDS.length} builds × ${GOLDEN_DUMMY_IDS.length} dummies and ${Object.keys(apFuzz).length} AP contract points.`);
