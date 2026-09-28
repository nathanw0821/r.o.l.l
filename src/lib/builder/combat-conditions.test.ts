import { describe, it, expect } from "vitest";
import { calculateCombatFirepower, type CombatFirepowerCalculationInput } from "./combat-firepower-engine";
import truth from "@/data/truth/combat-conditions.json";
import perkCards from "@/data/perk-cards.json";

type Stats = CombatFirepowerCalculationInput["playerStats"];
const STATS: Stats = { agility: 10, luck: 10, strength: 5, healthPct: 1 };

const input = (over: Partial<CombatFirepowerCalculationInput> = {}, stats: Partial<Stats> = {}): CombatFirepowerCalculationInput => ({
  weaponId: "fixer",
  equippedMods: [],
  equippedPerks: [],
  targetDummyId: "raw-unarmored",
  ...over,
  playerStats: { ...STATS, ...stats },
});

const normal = (i: CombatFirepowerCalculationInput) => calculateCombatFirepower(i).damagePerShot.normal;
const sources = (i: CombatFirepowerCalculationInput) => calculateCombatFirepower(i).damagePerShot.breakdown.map((b) => b.source);
const baseDamage = (weaponId: string) => calculateCombatFirepower(input({ weaponId })).baseStats.baseDamage;

/** Expected sheet damage when the only additive bonus is `pct` (raw dummy, no mitigation). */
const expectPlusPct = (i: CombatFirepowerCalculationInput, pct: number) => {
  const base = baseDamage(i.weaponId);
  expect(normal(i)).toBe(Math.round(base * (1 + pct)));
};

/** Pulls "+NN%" numbers out of a Patch 70 card's rank texts, so the pack cannot drift from the card. */
const cardPercents = (id: string): number[] => {
  const card = (perkCards as { id: string; ranks: { description: string }[] }[]).find((c) => c.id === id);
  if (!card) throw new Error(`card ${id} missing`);
  return card.ranks.map((r) => Number.parseInt(/\+?(\d+)%/.exec(r.description)?.[1] ?? "NaN", 10) / 100);
};

describe("combat-conditions.json mirrors the Patch 70 card texts", () => {
  it.each(["center-masochist", "guerrilla", "down-ranger", "glow-sight", "easy-target"] as const)("%s byRank", (id) => {
    expect(truth.perks[id].byRank).toEqual(cardPercents(id));
  });
  it("exterminator, tormentor, shotgun-champ, number-cruncher, guerrilla-master", () => {
    expect(truth.perks.exterminator.byRank.map((v) => v / 100)).toEqual(cardPercents("exterminator"));
    expect(truth.perks.tormentor.perUnit).toBe(cardPercents("tormentor")[0]);
    expect(truth.perks["shotgun-champ"].perUnit).toBe(cardPercents("shotgun-champ")[0]);
    expect(truth.perks["number-cruncher"].perUnit).toBe(cardPercents("number-cruncher")[0]);
    expect(truth.perks["guerrilla-master"].perUnit).toBe(cardPercents("guerrilla-master")[0]);
  });
  it("every entry names its source", () => {
    for (const entry of Object.values(truth.perks)) {
      expect(entry.source).toMatch(/Card text \(Patch 70\)/);
    }
  });
});

describe("hit location", () => {
  it("Center Masochist applies to ranged torso shots only, by rank", () => {
    const perks = (rank: number) => [{ cardId: "center-masochist", rank }];
    expect(normal(input({ equippedPerks: perks(3) }))).toBe(normal(input()));
    expect(normal(input({ equippedPerks: perks(3) }, { hitLocation: "body" }))).toBe(normal(input()));
    expect(normal(input({ equippedPerks: perks(3) }, { hitLocation: "weakSpot" }))).toBe(normal(input({}, { hitLocation: "weakSpot" })));
    for (const rank of [1, 2, 3]) {
      expectPlusPct(input({ equippedPerks: perks(rank) }, { hitLocation: "torso" }), truth.perks["center-masochist"].byRank[rank - 1]);
    }
    expect(sources(input({ equippedPerks: perks(2) }, { hitLocation: "torso" }))).toContain("Center Masochist (Rank 2, torso)");
    // Melee gets nothing on the torso (a ranged-only card).
    const melee = input({ weaponId: "chainsaw", equippedPerks: perks(3) }, { hitLocation: "torso" });
    expect(normal(melee)).toBe(normal(input({ weaponId: "chainsaw" }, { hitLocation: "torso" })));
  });

  it("torso is a ×1.00 body-part shot (no weak-spot multiplier)", () => {
    const torso = calculateCombatFirepower(input({ targetDummyId: "level-100-super-mutant" }, { hitLocation: "torso" }));
    expect(torso.weakSpot).toMatchObject({ targeting: false, multiplier: 1 });
    const head = calculateCombatFirepower(input({ targetDummyId: "level-100-super-mutant" }, { hitLocation: "weakSpot" }));
    expect(head.weakSpot).toMatchObject({ targeting: true, multiplier: 2 });
  });

  it("the deprecated isTargetingWeakSpot alias still reads as a weak-spot shot when hitLocation is absent", () => {
    const legacy = calculateCombatFirepower(input({}, { isTargetingWeakSpot: true }));
    expect(legacy.weakSpot.targeting).toBe(true);
    // An explicit hitLocation wins over the stale alias.
    const explicit = calculateCombatFirepower(input({}, { isTargetingWeakSpot: true, hitLocation: "body" }));
    expect(explicit.weakSpot.targeting).toBe(false);
  });
});

describe("target range", () => {
  it("Guerrilla is ranged damage at close range only (no longer always-on class damage)", () => {
    const perks = (rank: number) => [{ cardId: "guerrilla", rank }];
    // Default range is mid: no bonus, and the breakdown says why.
    expect(normal(input({ equippedPerks: perks(3) }))).toBe(normal(input()));
    expect(calculateCombatFirepower(input({ equippedPerks: perks(3) })).damagePerShot.breakdown).toContainEqual({
      source: "Guerrilla",
      value: "close range only (target at mid range)",
    });
    expect(normal(input({ equippedPerks: perks(3) }, { targetRange: "far" }))).toBe(normal(input()));
    for (const rank of [1, 2, 3]) {
      expectPlusPct(input({ equippedPerks: perks(rank) }, { targetRange: "close" }), truth.perks.guerrilla.byRank[rank - 1]);
    }
    // Any ranged weapon, not only automatic pistols; melee never.
    expectPlusPct(input({ weaponId: "hunting-rifle", equippedPerks: perks(3) }, { targetRange: "close" }), 0.2);
    expect(normal(input({ weaponId: "chainsaw", equippedPerks: perks(3) }, { targetRange: "close" }))).toBe(
      normal(input({ weaponId: "chainsaw" }, { targetRange: "close" })),
    );
  });

  it("Guerrilla Master needs close range, Onslaught stacks and a ranged weapon", () => {
    const perks = [{ cardId: "guerrilla-master", rank: 1 }];
    expect(normal(input({ equippedPerks: perks }, { onslaughtStacks: 4 }))).toBe(normal(input()));
    expectPlusPct(input({ equippedPerks: perks }, { onslaughtStacks: 4, targetRange: "close" }), 4 * truth.perks["guerrilla-master"].perUnit);
    expect(normal(input({ equippedPerks: perks }, { onslaughtStacks: 0, targetRange: "close" }))).toBe(normal(input()));
  });

  it("Down Ranger is ranged damage at far range only, by rank", () => {
    const perks = (rank: number) => [{ cardId: "down-ranger", rank }];
    expect(normal(input({ equippedPerks: perks(3) }))).toBe(normal(input()));
    expect(normal(input({ equippedPerks: perks(3) }, { targetRange: "close" }))).toBe(normal(input()));
    for (const rank of [1, 2, 3]) {
      expectPlusPct(input({ equippedPerks: perks(rank) }, { targetRange: "far" }), truth.perks["down-ranger"].byRank[rank - 1]);
    }
    expect(sources(input({ equippedPerks: perks(1) }, { targetRange: "far" }))).toContain("Down Ranger (Rank 1, far range)");
    expect(normal(input({ weaponId: "chainsaw", equippedPerks: perks(3) }, { targetRange: "far" }))).toBe(
      normal(input({ weaponId: "chainsaw" }, { targetRange: "far" })),
    );
  });
});

describe("target type", () => {
  it("Glow Sight applies only against a glowing target (override flag; no shipped dummy is tagged)", () => {
    const perks = (rank: number) => [{ cardId: "glow-sight", rank }];
    expect(normal(input({ equippedPerks: perks(3) }))).toBe(normal(input()));
    for (const dummy of ["scorchbeast-queen", "earle-williams", "ultracite-titan", "level-100-super-mutant", "raw-unarmored"]) {
      const r = calculateCombatFirepower(input({ targetDummyId: dummy, equippedPerks: perks(3) }));
      expect(r.damagePerShot.breakdown.some((b) => b.source.startsWith("Glow Sight"))).toBe(false);
    }
    for (const rank of [1, 2, 3]) {
      expectPlusPct(input({ equippedPerks: perks(rank) }, { targetIsGlowing: true }), truth.perks["glow-sight"].byRank[rank - 1]);
    }
    // Any weapon: the card says "damage", not "ranged damage" (STR 0 so the melee Strength bonus stays out).
    expectPlusPct(input({ weaponId: "chainsaw", equippedPerks: perks(2) }, { targetIsGlowing: true, strength: 0 }), 0.4);
  });

  it("Exterminator is an armor-penetration source against insects and shares the 90 % cap", () => {
    const perks = (rank: number) => [{ cardId: "exterminator", rank }];
    const off = calculateCombatFirepower(input({ targetDummyId: "level-100-super-mutant", equippedPerks: perks(3) }));
    expect(off.armorPenetration.effectiveArmorPenetrationPct).toBe(0);
    for (const rank of [1, 2, 3]) {
      const on = calculateCombatFirepower(input({ targetDummyId: "level-100-super-mutant", equippedPerks: perks(rank) }, { targetIsInsect: true }));
      expect(on.armorPenetration.effectiveArmorPenetrationPct).toBe(truth.perks.exterminator.byRank[rank - 1]);
      expect(on.armorPenetration.breakdown).toContainEqual({ source: `Exterminator (Rank ${rank}, insect)`, value: `${truth.perks.exterminator.byRank[rank - 1]}% Penetration` });
      // Sheet damage is untouched; only the landed hit rises.
      expect(on.damagePerShot.normal).toBe(off.damagePerShot.normal);
      expect(on.targetDummy.effectiveDR).toBe(Math.round(210 * (1 - truth.perks.exterminator.byRank[rank - 1] / 100)));
    }
    // Anti-Armor 50% × Exterminator 75% = 87.5%; with Tank Killer 36% it would be ~92% → capped at 90.
    const stacked = calculateCombatFirepower(input({
      targetDummyId: "level-100-super-mutant",
      equippedMods: [{ slug: "anti-armor" }],
      equippedPerks: [...perks(3), { cardId: "tank-killer", rank: 3 }],
    }, { targetIsInsect: true }));
    expect(stacked.armorPenetration.effectiveArmorPenetrationPct).toBe(90);
  });
});

describe("crippled target", () => {
  it("Easy Target: ranged damage vs a crippled target, by rank, any limb count ≥ 1", () => {
    const perks = (rank: number) => [{ cardId: "easy-target", rank }];
    expect(normal(input({ equippedPerks: perks(3) }, { targetCrippledLimbs: 0 }))).toBe(normal(input()));
    for (const rank of [1, 2, 3]) {
      expectPlusPct(input({ equippedPerks: perks(rank) }, { targetCrippledLimbs: 1 }), truth.perks["easy-target"].byRank[rank - 1]);
      expectPlusPct(input({ equippedPerks: perks(rank) }, { targetCrippledLimbs: 4 }), truth.perks["easy-target"].byRank[rank - 1]);
    }
    // Melee is excluded (ranged card). The chainsaw baseline needs the same limb count because
    // Slugger-style melee perks are not equipped here, so only the ranged gate is under test.
    expect(normal(input({ weaponId: "chainsaw", equippedPerks: perks(3) }, { targetCrippledLimbs: 2 }))).toBe(
      normal(input({ weaponId: "chainsaw" }, { targetCrippledLimbs: 2 })),
    );
  });

  it("Tormentor: +20 % per crippled limb, any weapon (the card names no class)", () => {
    const perks = [{ cardId: "tormentor", rank: 1 }];
    expect(normal(input({ equippedPerks: perks }))).toBe(normal(input()));
    for (const limbs of [1, 2, 3, 4]) {
      expectPlusPct(input({ equippedPerks: perks }, { targetCrippledLimbs: limbs }), limbs * truth.perks.tormentor.perUnit);
    }
    expect(sources(input({ equippedPerks: perks }, { targetCrippledLimbs: 3 }))).toContain("Tormentor (3 Crippled Limbs)");
    expectPlusPct(input({ weaponId: "chainsaw", equippedPerks: perks }, { targetCrippledLimbs: 2, strength: 0 }), 0.4);
  });

  it("Shotgun Champ: +10 % per projectile vs a crippled target; shotguns assume 8, other weapons get a note", () => {
    const perks = [{ cardId: "shotgun-champ", rank: 1 }];
    const shotgun = input({ weaponId: "combat-shotgun", equippedPerks: perks }, { targetCrippledLimbs: 1 });
    expectPlusPct(shotgun, 8 * truth.perks["shotgun-champ"].perUnit);
    expect(sources(shotgun)).toContain("Shotgun Champ (8 projectiles, assumed, crippled target)");
    expect(normal(input({ weaponId: "combat-shotgun", equippedPerks: perks }))).toBe(normal(input({ weaponId: "combat-shotgun" })));
    // The Fixer has no projectile count in the catalog: nothing is added, the breakdown says so.
    const rifle = input({ equippedPerks: perks }, { targetCrippledLimbs: 2 });
    expect(normal(rifle)).toBe(normal(input()));
    expect(calculateCombatFirepower(rifle).damagePerShot.breakdown).toContainEqual({ source: "Shotgun Champ", value: "projectile count unknown for this weapon" });
  });

  it("stacks with Bully's and Deal Sealer in the same additive pool", () => {
    const r = calculateCombatFirepower(input({
      equippedMods: [{ slug: "bullys" }],
      equippedPerks: [{ cardId: "easy-target", rank: 3 }, { cardId: "tormentor", rank: 1 }, { cardId: "deal-sealer", rank: 1 }],
    }, { targetCrippledLimbs: 2 }));
    // Bully's 2 × 25 % + Easy Target 75 % + Tormentor 2 × 20 % + Deal Sealer 10 % = +175 %
    expect(r.damagePerShot.normal).toBe(Math.round(baseDamage("fixer") * 2.75));
  });
});

describe("Number Cruncher", () => {
  it("adds 2 % per point of the resolved V.A.T.S. AP cost, so V.A.T.S. Optimized lowers it", () => {
    const perks = [{ cardId: "number-cruncher", rank: 1 }];
    const plain = calculateCombatFirepower(input({ equippedPerks: perks }));
    expect(plain.damagePerShot.normal).toBe(Math.round(plain.baseStats.baseDamage * (1 + plain.vats.apCostPerShot * truth.perks["number-cruncher"].perUnit)));
    expect(plain.damagePerShot.breakdown).toContainEqual({
      source: `Number Cruncher (${plain.vats.apCostPerShot} AP per shot)`,
      value: `+${Math.round(plain.vats.apCostPerShot * 2)}%`,
    });
    const optimized = calculateCombatFirepower(input({ equippedPerks: perks, equippedMods: [{ slug: "vats-optimized" }] }));
    expect(optimized.vats.apCostPerShot).toBeLessThan(plain.vats.apCostPerShot);
    expect(optimized.damagePerShot.normal).toBeLessThan(plain.damagePerShot.normal);
    expect(optimized.damagePerShot.normal).toBe(
      Math.round(optimized.baseStats.baseDamage * (1 + optimized.vats.apCostPerShot * truth.perks["number-cruncher"].perUnit)),
    );
    // The AP pool math still uses the same cost.
    expect(optimized.vats.maxShotsInPool).toBe(Math.floor(optimized.vats.totalApPool / optimized.vats.apCostPerShot));
  });

  it("applies to melee too (the card says 'your weapons')", () => {
    const r = calculateCombatFirepower(input({ weaponId: "chainsaw", equippedPerks: [{ cardId: "number-cruncher", rank: 1 }] }));
    const base = calculateCombatFirepower(input({ weaponId: "chainsaw" }));
    expect(r.damagePerShot.normal).toBeGreaterThan(base.damagePerShot.normal);
    expect(r.damagePerShot.breakdown.some((b) => b.source.startsWith("Number Cruncher"))).toBe(true);
  });
});
