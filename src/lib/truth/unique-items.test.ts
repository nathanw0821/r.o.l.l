import { describe, expect, it } from "vitest";
import OFFICIAL_P70 from "@/data/truth/unique-items-official-p70.json";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { WEAPON_ALIASES, WEAPON_COMBAT_BASE_CATALOG } from "@/lib/builder/combat-firepower-catalog";
import {
  UNIQUE_ITEMS,
  getModelledUniqueItems,
  getUniqueEffectModel,
  getUniqueItemByBaseId,
  getUniqueItems,
  getUniqueItemsByBaseId,
  resolveUniqueForBuilderId,
} from "./unique-items";

describe("unique-items truth pack", () => {
  // The Patch 70 weapon list supplied for this dataset has 83 rows (the release
  // notes headline says 85; two names could not be sourced and were not invented).
  // Plus two builder uniques that are not in that table (Cold Shoulder, V63 Zweihänder, added
  // 2026-10-12 with their client-data text so the gear card and engine resolve them).
  it("has 83 official weapons, 2 builder-only weapons and 8 armor pieces", () => {
    const weapons = getUniqueItems("weapon");
    expect(weapons.filter((item) => !item.notInOfficialTable)).toHaveLength(83);
    expect(weapons.filter((item) => item.notInOfficialTable).map((item) => item.id).sort()).toEqual(["cold-shoulder", "v63-zweihander"]);
    expect(getUniqueItems("armor")).toHaveLength(8);
    expect(UNIQUE_ITEMS).toHaveLength(93);
  });

  it("has unique kebab-case ids and non-empty effects", () => {
    const ids = UNIQUE_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of UNIQUE_ITEMS) {
      expect(item.id, item.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(item.name.trim().length, item.id).toBeGreaterThan(0);
      expect(item.innateEffect.trim().length, item.id).toBeGreaterThan(0);
      expect(item.sourceNotes.trim().length, item.id).toBeGreaterThan(0);
      expect(item.moddable).toBe(true);
      expect(item.fourthStar).toBe(true);
    }
  });

  it("stamps introducedIn 70 on weapons and 66 on armor", () => {
    for (const item of UNIQUE_ITEMS) {
      expect(item.introducedIn, item.id).toBe(item.kind === "weapon" ? 70 : 66);
    }
    for (const armor of getUniqueItems("armor")) {
      expect(armor.legendaryMods, armor.id).toHaveLength(3);
      expect(armor.slot, armor.id).toBeTruthy();
    }
  });

  it("marks the thirteen Patch 70 Daily Ops rare rewards", () => {
    const dailyOps = UNIQUE_ITEMS.filter((item) => item.sourceNotes === "Daily Ops rare reward (Patch 70)");
    expect(dailyOps.map((item) => item.name).sort()).toEqual(
      [
        "Acceptable Overkill", "Commander's Charge", "Crushing Blow", "Kingfisher", "Mind Over Matter", "Night Light",
        "Old Guard", "Resolute Veteran", "Salt of the Earth", "The Action Hero", "The Farmhand", "The Guarantee", "The Quick Fix",
      ].sort()
    );
  });

  it("every weapon's innate matches the official Patch 70 release-notes table (Bethesda's typos normalised)", () => {
    const official = new Map(OFFICIAL_P70.weapons.map((row) => [row.name, row.effect]));
    // The pack corrects these typos in the official text; anything else must match word for word.
    const normalised: Record<string, string> = {
      "Cultist Piercer": "+50% Armor Penetration vs Cryptids",
      Peacemaker: "Bonus Explosive Damage Based on CHA",
      Pyrolyzer: "Burning Enemies Burst into a Fiery Mess Based on Luck",
      "The V.A.T.S. Unknown": "V.A.T.S. Criticals Deal Between 20% and 200% Damage",
      Stimpike: "Attacks Heal Friendly Targets by 10% Health",
      "Foundation's Vengeance": "+5 Bullet Storm Stacks While Under 25% HP",
      "Resolve Breaker": "Fires Cryogenic Grenades",
    };
    // Compared on letters and digits only (case, spacing, apostrophes and punctuation differ between
    // Bethesda's table and the pack's house style); the wording itself must match.
    const fold = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "");
    expect(official.size).toBe(83);
    for (const item of getUniqueItems("weapon")) {
      if (item.notInOfficialTable) {
        expect(official.has(item.name), item.name).toBe(false);
        continue;
      }
      const expected = normalised[item.name] ?? official.get(item.name);
      expect(expected, `${item.name} is not in the official table`).toBeDefined();
      expect(fold(item.innateEffect), item.name).toBe(fold(expected!));
    }
  });

  it("every non-null baseItemId exists in base-gear or the firepower catalog", () => {
    const known = new Set<string>([
      ...BASE_GEAR_PIECES.map((piece) => piece.id),
      ...Object.keys(WEAPON_COMBAT_BASE_CATALOG),
      ...Object.keys(WEAPON_ALIASES),
    ]);
    for (const item of UNIQUE_ITEMS) {
      if (item.baseItemId === null) continue;
      expect(known.has(item.baseItemId), `${item.id} -> ${item.baseItemId}`).toBe(true);
    }
  });

  it("looks items up by base id", () => {
    expect(getUniqueItemByBaseId("ticket-to-revenge")?.name).toBe("Ticket to Revenge");
    expect(getUniqueItemByBaseId("railway")?.name).toBe("Lickety-Split");
    expect(getUniqueItemsByBaseId("baseball-bat").map((item) => item.name).sort()).toEqual(["Camden Whacker", "Molerat Bat"]);
    expect(getUniqueItemByBaseId("armor-set-secret-service")?.name).toBe("Bulwark");
    expect(getUniqueItemByBaseId("no-such-item")).toBeUndefined();
  });
});

describe("unique-items innate models", () => {
  // Schema mirror of the loader's validation: a model may only use these kinds,
  // and each kind must carry exactly the numbers the engine reads for it.
  const REQUIRED_FIELDS: Record<string, readonly string[]> = {
    "damage-per-crippled-limb": ["perUnit", "maxUnits", "cap"],
    "armor-pen-per-onslaught-stack": ["perUnit", "maxUnits"],
    "crit-damage-per-onslaught-stack": ["perUnit", "maxUnits"],
    "power-attack-damage-per-onslaught-stack": ["perUnit", "maxUnits"],
    "attack-speed-multiplier": ["value"],
    "swing-speed-per-addiction": ["perUnit", "cap"],
    "grants-perk-rank": ["perkId", "perkRank"],
    "bullet-storm-min-stacks": ["value"],
    "bullet-storm-bonus-stacks-below-health": ["value", "healthThreshold"],
    "flat-action-points": ["value"],
    "weak-spot-damage": ["value"],
    "weak-spot-damage-while-aiming": ["value"],
    "weak-spot-per-kill-streak": ["perUnit", "maxUnits"],
    "extra-projectiles": ["value"],
    "conditional-damage-buff": ["value"],
  };
  const NUMERIC_FIELDS = ["value", "perUnit", "maxUnits", "cap", "healthThreshold", "perkRank", "durationSeconds"] as const;
  const CONFIDENCE = ["verified", "datamined", "approximate"];

  it("validates every model against the schema", () => {
    for (const item of UNIQUE_ITEMS) {
      if (item.model == null) continue;
      const model = item.model;
      expect(Object.keys(REQUIRED_FIELDS), item.id).toContain(model.kind);
      expect(model.condition.trim().length, item.id).toBeGreaterThan(0);
      expect(CONFIDENCE, item.id).toContain(model.confidence);
      expect(model.source.trim().length, item.id).toBeGreaterThan(0);
      for (const field of NUMERIC_FIELDS) {
        const value = model[field];
        if (value === undefined) continue;
        expect(Number.isFinite(value), `${item.id}.${field}`).toBe(true);
      }
      for (const field of REQUIRED_FIELDS[model.kind]) {
        expect(model[field as keyof typeof model], `${item.id}.${field}`).toBeDefined();
      }
    }
  });

  it("models at least eight innate effects and names them", () => {
    const modelled = getModelledUniqueItems();
    expect(modelled.length).toBeGreaterThanOrEqual(8);
    expect(modelled.map((item) => item.id).sort()).toEqual(
      [
        "boomstick",
        "civil-unrest",
        "crushing-blow",
        "disorderly-conduct",
        "elders-mark",
        "face-breaker",
        "foundations-vengeance",
        "love-tap",
        "resolute-veteran",
        "sole-survivor",
        "the-fact-finder",
        "the-guarantee",
        "the-quick-fix",
        "ticket-to-revenge",
        "western-spirit",
        "whacker-smacker",
      ].sort()
    );
  });

  it("pins the modelled numbers the engine reads", () => {
    expect(getUniqueEffectModel("crushing-blow")).toMatchObject({ perUnit: 0.1, maxUnits: 4, cap: 0.4 });
    // Onslaught uniques: the game cap (100); the engine counts only the stacks the build holds.
    expect(getUniqueEffectModel("ticket-to-revenge")).toMatchObject({ perUnit: 3, maxUnits: 100 });
    expect(getUniqueEffectModel("elders-mark")).toMatchObject({ perUnit: 0.02, maxUnits: 100 });
    expect(getUniqueEffectModel("whacker-smacker")).toMatchObject({ perUnit: 0.05, maxUnits: 100 });
    expect(getUniqueEffectModel("boomstick")).toMatchObject({ kind: "extra-projectiles", value: 2 });
    expect(getUniqueEffectModel("love-tap")).toMatchObject({ kind: "conditional-damage-buff", value: 0.3, durationSeconds: 30 });
    expect(getUniqueEffectModel("western-spirit")).toMatchObject({ kind: "grants-perk-rank", perkId: "gunslinger-master", perkRank: 1 });
    expect(getUniqueEffectModel("the-guarantee")).toMatchObject({ perkId: "demolition-expert", perkRank: 3 });
    expect(getUniqueEffectModel("disorderly-conduct")).toMatchObject({ value: 1.2 });
    expect(getUniqueEffectModel("the-quick-fix")).toMatchObject({ perUnit: 0.05, cap: 1 });
    expect(getUniqueEffectModel("resolute-veteran")).toMatchObject({ value: 5 });
    expect(getUniqueEffectModel("foundations-vengeance")).toMatchObject({ value: 5, healthThreshold: 0.25 });
    expect(getUniqueEffectModel("civil-unrest")).toMatchObject({ value: 50 });
    expect(getUniqueEffectModel("face-breaker")).toMatchObject({ kind: "weak-spot-damage", value: 0.1 });
    expect(getUniqueEffectModel("the-fact-finder")).toMatchObject({ kind: "weak-spot-damage-while-aiming", value: 0.15 });
    expect(getUniqueEffectModel("sole-survivor")).toMatchObject({ kind: "weak-spot-per-kill-streak", perUnit: 0.03, maxUnits: 10 });
  });

  it("explains every reference-only innate that was considered", () => {
    const considered = UNIQUE_ITEMS.filter((item) => "model" in item && item.model === null);
    expect(considered.length).toBeGreaterThan(0);
    for (const item of considered) {
      expect(item.modelNote?.trim().length, item.id).toBeGreaterThan(0);
    }
    // Spot-check the reasons a numeric innate can still be reference-only. (Weak-point innates
    // stopped being reference-only on 2026-09-28: the engine now has a weak-spot input.)
    expect(UNIQUE_ITEMS.find((item) => item.id === "face-breaker")?.model?.kind).toBe("weak-spot-damage");
    expect(UNIQUE_ITEMS.find((item) => item.id === "cryptid-jawbone-knife")?.modelNote).toContain("target-type");
    expect(UNIQUE_ITEMS.find((item) => item.id === "old-guard")?.modelNote).toContain("defensive-perks.json");
  });

  it("resolves builder ids to the unique itself, never to a shared chassis", () => {
    expect(resolveUniqueForBuilderId("whacker-smacker")?.name).toBe("Whacker Smacker");
    expect(resolveUniqueForBuilderId("Crushing_Blow")?.name).toBe("Crushing Blow");
    // Molerat Bat is built on the Baseball Bat; equipping the plain bat must not inherit its innate.
    expect(resolveUniqueForBuilderId("baseball-bat")).toBeUndefined();
    // The Kabloom's pack id is its builder id since 2026-10-12 (it was "kabloom").
    expect(resolveUniqueForBuilderId("the-kabloom")?.name).toBe("Kabloom");
    expect(resolveUniqueForBuilderId("cold-shoulder")?.name).toBe("Cold Shoulder");
    expect(resolveUniqueForBuilderId("v63-zweihander")?.name).toBe("V63 Zweihänder");
    expect(getUniqueEffectModel("the-fixer")).toBeNull();
    expect(getUniqueEffectModel("molerat-bat")).toBeNull();
  });
});
