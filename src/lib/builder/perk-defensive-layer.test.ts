import { describe, it, expect } from "vitest";
import {
  calculateDamageTaken,
  calculateDefensiveProfile,
  calculatePerkDeckDefensiveLayer,
  lerpSpecial,
  selectApplicableReducers,
} from "./perk-defensive-layer";
import { calculateMitigatedDamage } from "@/lib/calculator/creation-engine-math";
import defensiveTruth from "@/data/truth/defensive-perks.json";

const SPECIAL_ALL = (v: number) => ({ str: v, per: v, end: v, cha: v, int: v, agi: v, lck: v });

describe("calculatePerkDeckDefensiveLayer (legacy flat layer)", () => {
  it("returns null when no perks are equipped", () => {
    expect(calculatePerkDeckDefensiveLayer([], { isPowerArmor: false })).toBeNull();
    expect(calculatePerkDeckDefensiveLayer(null, { isPowerArmor: false })).toBeNull();
  });

  it("keeps the dr/er/fr/cr/pr/rr shape and honours the legacy strVal option", () => {
    const result = calculatePerkDeckDefensiveLayer([{ cardId: "barbarian", rank: 1 }], {
      isPowerArmor: false,
      strVal: 15,
    });
    expect(result).toEqual({ dr: 175, er: 0, fr: 0, cr: 0, pr: 0, rr: 0 });
  });

  it("no longer models Fireproof: Hardy has no fire resistance", () => {
    const result = calculatePerkDeckDefensiveLayer(
      [{ cardId: "fireproof", rank: 3 }, { cardId: "hardy", rank: 3 }],
      { isPowerArmor: false },
    );
    expect(result?.fr).toBe(0);
  });
});

describe("calculateDefensiveProfile", () => {
  it("Ironclad rank 3 adds 25% of worn armor DR/ER, doubled to 50% with a matching set", () => {
    const base = { isPowerArmor: false, baseArmor: { dr: 200, er: 100 } };
    const single = calculateDefensiveProfile([{ cardId: "ironclad", rank: 3 }], base);
    expect(single.flat.dr).toBe(50);
    expect(single.flat.er).toBe(25);

    const matching = calculateDefensiveProfile([{ cardId: "ironclad", rank: 3 }], { ...base, matchingSet: true });
    expect(matching.flat.dr).toBe(100);
    expect(matching.flat.er).toBe(50);

    const rank1 = calculateDefensiveProfile([{ cardId: "ironclad", rank: 1 }], base);
    expect(rank1.flat.dr).toBe(30);
  });

  it("Ironclad still applies in Power Armor (no PA exclusion since Patch 62)", () => {
    const pa = calculateDefensiveProfile([{ cardId: "ironclad", rank: 2 }], {
      isPowerArmor: true,
      baseArmor: { dr: 400, er: 400 },
      matchingSet: true,
    });
    expect(pa.flat.dr).toBe(160);
  });

  it("Hardy is an explosion-only reducer (15/30/45%) with no fire resistance", () => {
    const p = calculateDefensiveProfile([{ cardId: "hardy", rank: 2 }], { isPowerArmor: false });
    expect(p.flat.fr).toBe(0);
    expect(p.reducers).toEqual([{ id: "hardy", label: "Hardy", pct: 30, condition: "explosion" }]);
    expect(selectApplicableReducers(p.reducers, "ballistic")).toHaveLength(0);
    expect(selectApplicableReducers(p.reducers, "explosion")).toHaveLength(1);
  });

  it("Thick Skin is a ballistic-only 4/6/10% reducer and does nothing in Power Armor", () => {
    const human = calculateDefensiveProfile([{ cardId: "thick-skin", rank: 3 }], { isPowerArmor: false });
    expect(human.reducers).toEqual([{ id: "thick-skin", label: "Thick Skin", pct: 10, condition: "ballistic" }]);
    expect(selectApplicableReducers(human.reducers, "energy")).toHaveLength(0);

    const pa = calculateDefensiveProfile([{ cardId: "thick-skin", rank: 3 }], { isPowerArmor: true });
    expect(pa.reducers).toHaveLength(0);
    expect(pa.notes.some((n) => n.includes("Thick Skin") && n.includes("Power Armor"))).toBe(true);
  });

  it("Barbarian scales DR linearly from +18 at STR 1 to +175 at STR 15 and doubles unarmored", () => {
    const str1 = calculateDefensiveProfile([{ cardId: "barbarian", rank: 1 }], { isPowerArmor: false, special: { str: 1 } });
    expect(str1.flat.dr).toBe(18);
    const str15 = calculateDefensiveProfile([{ cardId: "barbarian", rank: 1 }], { isPowerArmor: false, special: { str: 15 } });
    expect(str15.flat.dr).toBe(175);
    const str8 = calculateDefensiveProfile([{ cardId: "barbarian", rank: 1 }], { isPowerArmor: false, special: { str: 8 } });
    expect(str8.flat.dr).toBe(97); // 18 + 157 * 7/14 = 96.5 rounded
    const naked = calculateDefensiveProfile([{ cardId: "barbarian", rank: 1 }], {
      isPowerArmor: false,
      special: { str: 15 },
      wearingNoArmor: true,
    });
    expect(naked.flat.dr).toBe(350);
    expect(naked.notes.some((n) => n.includes("approx."))).toBe(true);
  });

  it("clamps SPECIAL-scaled perks at the published SPECIAL 15 ceiling", () => {
    expect(lerpSpecial(30, 18, 175)).toBe(175);
    expect(lerpSpecial(0, 18, 175)).toBe(18);
  });

  it("Evasive gives 2% Evade at AGI 1 and 14% at AGI 15; off in PA or over-encumbered", () => {
    expect(calculateDefensiveProfile([{ cardId: "evasive", rank: 1 }], { isPowerArmor: false, special: { agi: 1 } }).evadeChance).toBe(2);
    expect(calculateDefensiveProfile([{ cardId: "evasive", rank: 1 }], { isPowerArmor: false, special: { agi: 15 } }).evadeChance).toBe(14);
    expect(calculateDefensiveProfile([{ cardId: "evasive", rank: 1 }], { isPowerArmor: true, special: { agi: 15 } }).evadeChance).toBe(0);
    expect(
      calculateDefensiveProfile([{ cardId: "evasive", rank: 1 }], { isPowerArmor: false, special: { agi: 15 }, isOverEncumbered: true }).evadeChance,
    ).toBe(0);
  });

  it("Moving Target adds 5/10/15% Evade only while sprinting and never in PA", () => {
    const cards = [{ cardId: "moving-target", rank: 3 }];
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, isSprinting: true }).evadeChance).toBe(15);
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, isSprinting: false }).evadeChance).toBe(0);
    expect(calculateDefensiveProfile(cards, { isPowerArmor: true, isSprinting: true }).evadeChance).toBe(0);
  });

  it("Dodgy adds a flat +5% Evade", () => {
    expect(calculateDefensiveProfile([{ cardId: "dodgy", rank: 1 }], { isPowerArmor: false }).evadeChance).toBe(5);
  });

  it("Serendipity only counts below 30% HP and is labelled approximate", () => {
    const cards = [{ cardId: "serendipity", rank: 1 }];
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, special: { lck: 15 }, healthPct: 50 }).evadeChance).toBe(0);
    const low = calculateDefensiveProfile(cards, { isPowerArmor: false, special: { lck: 15 }, healthPct: 20 });
    expect(low.evadeChance).toBe(15);
    expect(low.notes.some((n) => n.startsWith("Serendipity (approx.)"))).toBe(true);
  });

  it("Lone Wanderer is a solo-only reducer: x0.80 at CHA 15, x0.99 at CHA 1, none on a team", () => {
    const cards = [{ cardId: "lone-wanderer", rank: 1 }];
    const cha15 = calculateDefensiveProfile(cards, { isPowerArmor: false, special: { cha: 15 }, isOnTeam: false });
    expect(cha15.reducers).toHaveLength(1);
    expect(cha15.reducers[0]).toMatchObject({ id: "lone-wanderer", pct: 20, condition: "solo" });
    const cha1 = calculateDefensiveProfile(cards, { isPowerArmor: false, special: { cha: 1 }, isOnTeam: false });
    expect(cha1.reducers[0].pct).toBe(1);
    const team = calculateDefensiveProfile(cards, { isPowerArmor: false, special: { cha: 15 }, isOnTeam: true });
    expect(team.reducers).toHaveLength(0);
  });

  it("Bullet Shield grants 5/10/15% Deflect only while firing a heavy gun; x1.5 in Power Armor", () => {
    const cards = [{ cardId: "bullet-shield", rank: 3 }];
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, isFiringHeavyGun: true }).deflectChance).toBe(15);
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, isFiringHeavyGun: false }).deflectChance).toBe(0);
    expect(calculateDefensiveProfile(cards, { isPowerArmor: true, isFiringHeavyGun: true }).deflectChance).toBe(22.5);
  });

  it("Bodyguards uses the old 6..12 per teammate curve (approximate), max 3 teammates, team only", () => {
    const cards = [{ cardId: "bodyguards", rank: 1 }];
    const full = calculateDefensiveProfile(cards, { isPowerArmor: false, special: { cha: 15 }, isOnTeam: true, teammates: 3 });
    expect(full.flat.dr).toBe(36);
    expect(full.flat.er).toBe(36);
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, special: { cha: 15 }, isOnTeam: false }).flat.dr).toBe(0);
    expect(calculateDefensiveProfile(cards, { isPowerArmor: false, special: { cha: 1 }, isOnTeam: true, teammates: 5 }).flat.dr).toBe(18);
  });

  it("Refractor / Rad Resistant / Junk Shield / Lifegiver interpolate their approximate ranges", () => {
    const p = calculateDefensiveProfile(
      [
        { cardId: "refractor", rank: 1 },
        { cardId: "rad-resistant", rank: 1 },
        { cardId: "junk-shield", rank: 1 },
        { cardId: "lifegiver", rank: 1 },
      ],
      { isPowerArmor: false, special: SPECIAL_ALL(15) },
    );
    expect(p.flat.er).toBe(40 + 30);
    expect(p.flat.rr).toBe(40);
    expect(p.flat.dr).toBe(30);
    expect(p.maxHpPct).toBe(45);
    const noJunk = calculateDefensiveProfile([{ cardId: "junk-shield", rank: 1 }], { isPowerArmor: false, special: SPECIAL_ALL(15), holdingJunk: false });
    expect(noJunk.flat.dr).toBe(0);
  });

  it("Blocker raises the 60% base block to 85% at rank 3 (+25); Nerd Rage grants no DR", () => {
    const p = calculateDefensiveProfile([{ cardId: "blocker", rank: 3 }, { cardId: "nerd-rage", rank: 1 }], { isPowerArmor: false });
    expect(p.blockPct).toBe(85);
    expect(p.flat.dr).toBe(0);
    expect(p.notes.some((n) => n.includes("Nerd Rage"))).toBe(true);
  });

  it("legendary reducers: Vanguard's full at 100% HP, Bolstering full at 5% HP, Mutant's 1%/mutation to 5", () => {
    const slugs = ["vanguards", "bolstering", "mutants"];
    const fullHp = calculateDefensiveProfile([], { isPowerArmor: false, equippedModSlugs: slugs, healthPct: 100, mutationCount: 7 });
    expect(fullHp.reducers.find((r) => r.id === "vanguards")?.pct).toBe(10);
    expect(fullHp.reducers.find((r) => r.id === "bolstering")).toBeUndefined();
    expect(fullHp.reducers.find((r) => r.id === "mutants")?.pct).toBe(5);

    const lowHp = calculateDefensiveProfile([], { isPowerArmor: false, equippedModSlugs: slugs, healthPct: 5, mutationCount: 2 });
    expect(lowHp.reducers.find((r) => r.id === "vanguards")?.pct).toBe(0.5);
    expect(lowHp.reducers.find((r) => r.id === "bolstering")?.pct).toBe(10);
    expect(lowHp.reducers.find((r) => r.id === "mutants")?.pct).toBe(2);

    const halfHp = calculateDefensiveProfile([], { isPowerArmor: false, equippedModSlugs: ["bolstering"], healthPct: 52.5 });
    expect(halfHp.reducers[0].pct).toBe(5);
    expect(halfHp.reducers[0].label).toContain("approx.");
  });

  it("Cavalier's 10% only while sprinting, Sentinel's 5% only while stationary", () => {
    const slugs = ["cavaliers", "sentinels"];
    const sprint = calculateDefensiveProfile([], { isPowerArmor: false, equippedModSlugs: slugs, isSprinting: true });
    expect(sprint.reducers).toEqual([{ id: "cavaliers", label: "Cavalier's", pct: 10, condition: "sprinting" }]);
    const still = calculateDefensiveProfile([], { isPowerArmor: false, equippedModSlugs: slugs, isStationary: true });
    expect(still.reducers).toEqual([{ id: "sentinels", label: "Sentinel's", pct: 5, condition: "stationary" }]);
  });

  it("Reflex adds 2% Evade per piece; Last Stand converts Evade x0.5 into a reducer and zeroes Evade", () => {
    const reflex = calculateDefensiveProfile([{ cardId: "dodgy", rank: 1 }], { isPowerArmor: false, equippedModSlugs: ["reflex", "reflex", "reflex"] });
    expect(reflex.evadeChance).toBe(11);
    const lastStand = calculateDefensiveProfile([{ cardId: "dodgy", rank: 1 }], {
      isPowerArmor: false,
      equippedModSlugs: ["reflex", "reflex", "reflex", "last-stand"],
    });
    expect(lastStand.evadeChance).toBe(0);
    expect(lastStand.reducers.find((r) => r.id === "last-stand")?.pct).toBe(5.5);
  });

  it("Power Armor innate reduction stays at 0 unless the unverified toggle supplies a value", () => {
    const off = calculateDefensiveProfile([], { isPowerArmor: true });
    expect(off.reducers).toHaveLength(0);
    const on = calculateDefensiveProfile([], { isPowerArmor: true, powerArmorInnatePct: 7, armorPieceCount: 6 });
    expect(on.reducers[0]).toMatchObject({ id: "power-armor-innate", pct: 42, approximate: true });
    expect(on.reducers[0].label).toContain("unverified");
  });
});

describe("calculateDamageTaken (Patch 66 order of operations)", () => {
  it("1000 raw vs 300 DR with Lone Wanderer CHA 15 solo + Vanguard's at full HP", () => {
    const profile = calculateDefensiveProfile([{ cardId: "lone-wanderer", rank: 1 }], {
      isPowerArmor: false,
      special: { cha: 15 },
      isOnTeam: false,
      equippedModSlugs: ["vanguards"],
      healthPct: 100,
    });
    const result = calculateDamageTaken(1000, 300, 0, profile.reducers, "ballistic");

    // Curve: coeff = (1000 * 0.15 / 300) ^ 0.365 = 0.5 ^ 0.365 = 0.77647 -> 776.47
    const curve = calculateMitigatedDamage(1000, 300, 0);
    expect(result.afterCurve).toBe(curve.finalDamage);
    expect(result.afterCurve).toBeCloseTo(776.47, 2);
    // Then x (1 - 0.20) x (1 - 0.10) = x0.72
    expect(result.delivered).toBeCloseTo(559.06, 2);
    expect(result.totalReducerPct).toBe(28);
    expect(result.appliedReducers.map((r) => r.id)).toEqual(["lone-wanderer", "vanguards"]);
  });

  it("applies the boss flat reduction inside the curve step, before reducers", () => {
    const reducers = [{ id: "hardy", label: "Hardy", pct: 45, condition: "explosion" as const }];
    const explosion = calculateDamageTaken(1000, 300, 80, reducers, "explosion");
    expect(explosion.afterCurve).toBeCloseTo(776.47 * 0.2, 1);
    expect(explosion.delivered).toBeCloseTo(776.47 * 0.2 * 0.55, 1);
    const ballistic = calculateDamageTaken(1000, 300, 80, reducers, "ballistic");
    expect(ballistic.delivered).toBe(ballistic.afterCurve);
    expect(ballistic.appliedReducers).toHaveLength(0);
  });
});

describe("truth file", () => {
  it("pins the verified Patch 62/66/70 values used by the layer", () => {
    expect(defensiveTruth.perks.ironclad.values).toEqual([15, 20, 25]);
    expect(defensiveTruth.perks.hardy.values).toEqual([15, 30, 45]);
    expect(defensiveTruth.perks["thick-skin"].values).toEqual([4, 6, 10]);
    expect(defensiveTruth.perks.barbarian).toMatchObject({ min: 18, max: 175, confidence: "approximate" });
    expect(defensiveTruth.perks["lone-wanderer"]).toMatchObject({ min: 1, max: 20 });
    expect(defensiveTruth.legendaryMods.cavaliers.pct).toBe(10);
    expect(defensiveTruth.legendaryMods.sentinels.pct).toBe(5);
    expect(defensiveTruth.powerArmorInnate.perPiecePct).toBe(0);
  });
});
