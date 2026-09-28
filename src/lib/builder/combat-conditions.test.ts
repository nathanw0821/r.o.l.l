import { describe, it, expect } from "vitest";
import { calculateCombatFirepower, interpolateByInt, WEAPON_COMBAT_BASE_CATALOG, type CombatFirepowerCalculationInput } from "./combat-firepower-engine";
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

// ---------------------------------------------------------------------------------------------
// 2026-09-28 additions: melee swing speed, weapon damage type, Ghoul Glow cards.
// ---------------------------------------------------------------------------------------------

const GLOW_PERKS = ["glowing-criticals", "mad-scientist", "radiation-power", "radioactive-strength", "science-monster"] as const;

describe("combat-conditions.json mirrors the Patch 70 card texts (swing speed, damage type, Glow)", () => {
  it.each(GLOW_PERKS)("%s byRank", (id) => {
    expect(truth.perks[id].byRank).toEqual(cardPercents(id));
  });
  it("Martial Artist reads the swing-speed number, not the weight number, of each rank", () => {
    const card = (perkCards as { id: string; ranks: { description: string }[] }[]).find((c) => c.id === "martial-artist")!;
    const swing = card.ranks.map((r) => Number.parseInt(/swing them (\d+)% faster/.exec(r.description)![1], 10) / 100);
    expect(truth.perks["martial-artist"].byRank).toEqual(swing);
    expect(swing).toEqual([0.1, 0.2, 0.3]);
  });
  it("Tightly Wound is a single-rank, note-only 60 %", () => {
    expect(truth.perks["tightly-wound"].byRank).toEqual(cardPercents("tightly-wound"));
    expect(truth.perks["tightly-wound"].byRank).toEqual([0.6]);
    expect(truth.perks["tightly-wound"].model).toBe("note-only");
  });
  it("Pyro-Technician and Cryologist carry the fallout.wiki INT table (5 % at INT 1, 50 % cap at INT 100)", () => {
    for (const id of ["pyro-technician", "cryologist"] as const) {
      const rows = truth.perks[id].byInt;
      expect(rows[0]).toEqual([1, 0.05]);
      expect(rows[rows.length - 1]).toEqual([100, 0.5]);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i][0]).toBeGreaterThan(rows[i - 1][0]);
        expect(rows[i][1]).toBeGreaterThan(rows[i - 1][1]);
      }
      expect(truth.perks[id].confidence).toBe("approximate");
      expect(truth.perks[id].source).toMatch(/fallout\.wiki/);
    }
    expect(truth.perks["pyro-technician"].damageType).toBe("fire");
    expect(truth.perks.cryologist.damageType).toBe("cryo");
  });
  it("Glow high is 80 % (approximate, shared with the vitals sheet)", () => {
    expect(truth.glow.highThresholdPct).toBe(80);
    expect(truth.glow.confidence).toBe("approximate");
  });
});

describe("melee swing speed", () => {
  const multiplier = (i: CombatFirepowerCalculationInput) => calculateCombatFirepower(i).fireRate.fireRateMultiplier;

  it("Martial Artist multiplies the swing rate by rank for melee and unarmed weapons", () => {
    for (const weaponId of ["chainsaw", "deathclaw-gauntlet"]) {
      const base = multiplier(input({ weaponId }));
      for (const rank of [1, 2, 3]) {
        const r = calculateCombatFirepower(input({ weaponId, equippedPerks: [{ cardId: "martial-artist", rank }] }));
        expect(r.fireRate.fireRateMultiplier).toBeCloseTo(base * (1 + truth.perks["martial-artist"].byRank[rank - 1]), 10);
        expect(r.dps.breakdown).toContainEqual({ source: `Martial Artist (Rank ${rank})`, value: `+${rank * 10}% Swing Speed` });
      }
    }
  });

  it("does nothing for ranged weapons", () => {
    const r = calculateCombatFirepower(input({ equippedPerks: [{ cardId: "martial-artist", rank: 3 }] }));
    expect(r.fireRate.fireRateMultiplier).toBe(multiplier(input()));
    expect(r.dps.breakdown.some((b) => b.source.startsWith("Martial Artist"))).toBe(false);
  });

  it("the Patch 70 swing-speed cap still holds at 2.0× with Martial Artist on top of The Quick Fix", () => {
    // The Quick Fix alone reaches the +100 % cap at 20+ addictions; Martial Artist 3 must not push past it.
    const capped = calculateCombatFirepower(
      input({ weaponId: "the-quick-fix", equippedPerks: [{ cardId: "martial-artist", rank: 3 }] }, { addictionsCount: 30 }),
    );
    expect(capped.fireRate.fireRateMultiplier).toBe(2.0);
    expect(capped.dps.breakdown).toContainEqual({ source: "Melee Swing Speed Cap (Patch 70)", value: "Capped at +100% (2.0× max)" });
    expect(capped.fireRate.rps).toBeCloseTo(capped.baseStats.fireRate * 2, 10);
    // Below the cap the two sources multiply.
    const under = calculateCombatFirepower(
      input({ weaponId: "the-quick-fix", equippedPerks: [{ cardId: "martial-artist", rank: 3 }] }, { addictionsCount: 4 }),
    );
    expect(under.fireRate.fireRateMultiplier).toBeCloseTo(1.2 * 1.3, 10);
  });

  it("Tightly Wound is a breakdown line on heavy guns and changes no number", () => {
    const plain = calculateCombatFirepower(input({ weaponId: "holy-fire" }));
    const wound = calculateCombatFirepower(input({ weaponId: "holy-fire", equippedPerks: [{ cardId: "tightly-wound", rank: 1 }] }));
    expect(wound.fireRate).toEqual(plain.fireRate);
    expect(wound.dps.burstDPS).toBe(plain.dps.burstDPS);
    expect(wound.dps.breakdown).toContainEqual({ source: "Tightly Wound", value: "spin-up 60% faster (not modelled)" });
    const rifle = calculateCombatFirepower(input({ equippedPerks: [{ cardId: "tightly-wound", rank: 1 }] }));
    expect(rifle.dps.breakdown.some((b) => b.source === "Tightly Wound")).toBe(false);
  });
});

describe("weapon damage type (Pyro-Technician, Cryologist)", () => {
  const rows = truth.perks["pyro-technician"].byInt;

  it("interpolateByInt reads the published rows exactly and interpolates between them", () => {
    expect(interpolateByInt(rows, 1)).toBe(0.05);
    expect(interpolateByInt(rows, 10)).toBe(0.1592);
    expect(interpolateByInt(rows, 100)).toBe(0.5);
    expect(interpolateByInt(rows, 15)).toBeCloseTo((0.1592 + 0.2633) / 2, 10);
    // Clamped to the table's ends.
    expect(interpolateByInt(rows, 0)).toBe(0.05);
    expect(interpolateByInt(rows, 250)).toBe(0.5);
    expect(interpolateByInt(rows, Number.NaN)).toBe(0.05);
  });

  it("Pyro-Technician scales fire weapons by Intelligence", () => {
    const perks = [{ cardId: "pyro-technician", rank: 1 }];
    for (const [int, pct] of [[1, 0.05], [10, 0.1592], [30, 0.35], [100, 0.5]] as const) {
      expectPlusPct(input({ weaponId: "flamer", equippedPerks: perks }, { intelligence: int }), pct);
    }
    expect(sources(input({ weaponId: "flamer", equippedPerks: perks }, { intelligence: 10 }))).toContain("Pyro-Technician (INT 10, approx.)");
    expect(calculateCombatFirepower(input({ weaponId: "flamer", equippedPerks: perks }, { intelligence: 10 })).damagePerShot.breakdown).toContainEqual({
      source: "Pyro-Technician (INT 10, approx.)",
      value: "+15.9% fire",
    });
    // Cremator and Holy Fire are fire weapons too.
    expectPlusPct(input({ weaponId: "holy-fire", equippedPerks: perks }, { intelligence: 1 }), 0.05);
  });

  it("Pyro-Technician needs Intelligence and a fire weapon; a secondary fire type earns only a note", () => {
    const perks = [{ cardId: "pyro-technician", rank: 1 }];
    // No INT given: no number, a note.
    const noInt = calculateCombatFirepower(input({ weaponId: "flamer", equippedPerks: perks }));
    expect(noInt.damagePerShot.normal).toBe(normal(input({ weaponId: "flamer" })));
    expect(noInt.damagePerShot.breakdown).toContainEqual({ source: "Pyro-Technician", value: "needs Intelligence" });
    // Ballistic rifle: nothing.
    const rifle = calculateCombatFirepower(input({ equippedPerks: perks }, { intelligence: 15 }));
    expect(rifle.damagePerShot.normal).toBe(normal(input()));
    expect(rifle.damagePerShot.breakdown).toContainEqual({ source: "Pyro-Technician", value: "fire weapons only" });
    // Shishkebab: physical primary, fire secondary.
    const kebab = calculateCombatFirepower(input({ weaponId: "shishkebab", equippedPerks: perks }, { intelligence: 15 }));
    expect(kebab.damagePerShot.normal).toBe(normal(input({ weaponId: "shishkebab" }, { intelligence: 15 })));
    expect(kebab.damagePerShot.breakdown).toContainEqual({ source: "Pyro-Technician", value: "secondary fire damage not modelled" });
  });

  it("Cryologist: no catalog weapon has cryo as primary damage yet, the Cold Shoulder gets the secondary note", () => {
    const perks = [{ cardId: "cryologist", rank: 1 }];
    const cs = calculateCombatFirepower(input({ weaponId: "cold-shoulder", equippedPerks: perks }, { intelligence: 15 }));
    expect(cs.damagePerShot.normal).toBe(normal(input({ weaponId: "cold-shoulder" })));
    expect(cs.damagePerShot.breakdown).toContainEqual({ source: "Cryologist", value: "secondary cryo damage not modelled" });
    expect(calculateCombatFirepower(input({ weaponId: "flamer", equippedPerks: perks }, { intelligence: 15 })).damagePerShot.breakdown).toContainEqual({
      source: "Cryologist",
      value: "cryo weapons only",
    });
    expect(Object.values(WEAPON_COMBAT_BASE_CATALOG).some((w) => w.damageType === "cryo")).toBe(false);
  });
});

describe("Ghoul Glow cards", () => {
  const ghoul = (over: Partial<CombatFirepowerCalculationInput>, stats: Partial<Stats> = {}) => input(over, { isGhoul: true, ...stats });
  const glowCards = (i: CombatFirepowerCalculationInput) => calculateCombatFirepower(i).glow?.cards;

  it("nothing applies to a human, whatever the toggles say", () => {
    const perks = GLOW_PERKS.map((cardId) => ({ cardId, rank: 3 }));
    const r = calculateCombatFirepower(
      input({ weaponId: "holy-fire", equippedPerks: perks }, { isGhoul: false, glowPct: 100, isSpendingGlow: true, wasHitRecently: true, isPowerAttacking: true }),
    );
    const plain = calculateCombatFirepower(input({ weaponId: "holy-fire" }, { isPowerAttacking: true }));
    expect(r.damagePerShot).toEqual(plain.damagePerShot);
    expect(r.glow).toBeUndefined();
  });

  it("Mad Scientist: energy weapons while spending Glow, by rank", () => {
    for (const rank of [1, 2, 3]) {
      const perks = [{ cardId: "mad-scientist", rank }];
      expectPlusPct(ghoul({ weaponId: "holy-fire", equippedPerks: perks }, { isSpendingGlow: true }), truth.perks["mad-scientist"].byRank[rank - 1]);
      // Not spending: nothing but a hint.
      const holding = calculateCombatFirepower(ghoul({ weaponId: "holy-fire", equippedPerks: perks }));
      expect(holding.damagePerShot.normal).toBe(normal(input({ weaponId: "holy-fire" })));
      expect(holding.damagePerShot.breakdown).toContainEqual({ source: "Mad Scientist", value: "spending Glow only" });
      expect(holding.glow).toBeUndefined();
      // Ballistic weapon: nothing.
      expect(normal(ghoul({ equippedPerks: perks }, { isSpendingGlow: true }))).toBe(normal(input()));
    }
    expect(glowCards(ghoul({ weaponId: "holy-fire", equippedPerks: [{ cardId: "mad-scientist", rank: 2 }] }, { isSpendingGlow: true }))).toEqual(["Mad Scientist"]);
  });

  it("Radiation Power: any weapon while spending Glow, by rank", () => {
    for (const rank of [1, 2, 3]) {
      const perks = [{ cardId: "radiation-power", rank }];
      expectPlusPct(ghoul({ equippedPerks: perks }, { isSpendingGlow: true }), truth.perks["radiation-power"].byRank[rank - 1]);
      expectPlusPct(ghoul({ weaponId: "chainsaw", equippedPerks: perks }, { isSpendingGlow: true, strength: 0 }), truth.perks["radiation-power"].byRank[rank - 1]);
      expect(normal(ghoul({ equippedPerks: perks }))).toBe(normal(input()));
    }
  });

  it("Radioactive Strength: power attacks while spending Glow, by rank", () => {
    for (const rank of [1, 2, 3]) {
      const perks = [{ cardId: "radioactive-strength", rank }];
      const on = ghoul({ weaponId: "chainsaw", equippedPerks: perks }, { isSpendingGlow: true, isPowerAttacking: true, strength: 0 });
      expectPlusPct(on, truth.perks["radioactive-strength"].byRank[rank - 1]);
      expect(sources(on)).toContain(`Radioactive Strength (Rank ${rank}, power attack, spending Glow)`);
      // Either half missing: nothing.
      const baseline = normal(input({ weaponId: "chainsaw" }, { strength: 0 }));
      expect(normal(ghoul({ weaponId: "chainsaw", equippedPerks: perks }, { isSpendingGlow: true, strength: 0 }))).toBe(baseline);
      expect(normal(ghoul({ weaponId: "chainsaw", equippedPerks: perks }, { isPowerAttacking: true, strength: 0 }))).toBe(baseline);
    }
  });

  it("Science Monster: hit in the last 10 s while holding any Glow, by rank", () => {
    for (const rank of [1, 2, 3]) {
      const perks = [{ cardId: "science-monster", rank }];
      expectPlusPct(ghoul({ equippedPerks: perks }, { glowPct: 1, wasHitRecently: true }), truth.perks["science-monster"].byRank[rank - 1]);
      expectPlusPct(ghoul({ equippedPerks: perks }, { glowPct: 100, wasHitRecently: true }), truth.perks["science-monster"].byRank[rank - 1]);
      const noGlow = calculateCombatFirepower(ghoul({ equippedPerks: perks }, { glowPct: 0, wasHitRecently: true }));
      expect(noGlow.damagePerShot.normal).toBe(normal(input()));
      expect(noGlow.damagePerShot.breakdown).toContainEqual({ source: "Science Monster", value: "needs Glow above 0" });
      const notHit = calculateCombatFirepower(ghoul({ equippedPerks: perks }, { glowPct: 50 }));
      expect(notHit.damagePerShot.normal).toBe(normal(input()));
      expect(notHit.damagePerShot.breakdown).toContainEqual({ source: "Science Monster", value: "hit in the last 10 s only" });
    }
  });

  it("Glowing Criticals: crit damage while Glow is high (≥ 80 %), by rank; normal damage untouched", () => {
    const critBonus = (i: CombatFirepowerCalculationInput) => {
      const r = calculateCombatFirepower(i);
      return r.damagePerShot.critical - r.damagePerShot.normal - r.damagePerShot.explosiveBonus;
    };
    const base = baseDamage("fixer");
    expect(critBonus(input())).toBe(Math.round(base * 1.0));
    for (const rank of [1, 2, 3]) {
      const perks = [{ cardId: "glowing-criticals", rank }];
      const v = truth.perks["glowing-criticals"].byRank[rank - 1];
      const high = ghoul({ equippedPerks: perks }, { glowPct: 80 });
      expect(critBonus(high)).toBe(Math.round(base * (1 + v)));
      expect(normal(high)).toBe(normal(input()));
      expect(glowCards(high)).toEqual(["Glowing Criticals"]);
      // Just under the line, or a human: base crit only.
      const low = ghoul({ equippedPerks: perks }, { glowPct: 79 });
      expect(critBonus(low)).toBe(Math.round(base));
      expect(calculateCombatFirepower(low).damagePerShot.breakdown).toContainEqual({ source: "Glowing Criticals", value: "Glow high only (≥ 80%, at 79%)" });
      expect(critBonus(input({ equippedPerks: perks }, { glowPct: 100 }))).toBe(Math.round(base));
    }
    // Stacks with Better Criticals in the same crit pool.
    const both = ghoul({ equippedPerks: [{ cardId: "glowing-criticals", rank: 3 }, { cardId: "better-criticals", rank: 3 }] }, { glowPct: 100 });
    expect(critBonus(both)).toBe(Math.round(base * (1 + 1.0 + 0.5)));
  });

  it("the result lists every contributing Glow card for the combat tab chip", () => {
    const r = calculateCombatFirepower(
      ghoul(
        { weaponId: "holy-fire", equippedPerks: GLOW_PERKS.map((cardId) => ({ cardId, rank: 1 })) },
        { glowPct: 90, isSpendingGlow: true, wasHitRecently: true, isPowerAttacking: true },
      ),
    );
    expect(r.glow?.cards).toEqual(["Mad Scientist", "Radiation Power", "Radioactive Strength", "Science Monster", "Glowing Criticals"]);
    // Every additive Glow card lands in the same base pool: 10 + 10 + 50 + 5 = +75 %.
    expect(r.damagePerShot.normal).toBe(Math.round(baseDamage("holy-fire") * 1.75));
  });
});
