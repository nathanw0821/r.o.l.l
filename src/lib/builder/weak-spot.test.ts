import { describe, it, expect } from "vitest";
import { calculateCombatFirepower, type CombatFirepowerCalculationInput } from "./combat-firepower-engine";
import weakSpot from "@/data/truth/weak-spot.json";

const base = (over: Partial<CombatFirepowerCalculationInput> = {}): CombatFirepowerCalculationInput => ({
  weaponId: "fixer",
  equippedMods: [],
  equippedPerks: [],
  targetDummyId: "level-100-super-mutant",
  playerStats: { agility: 10, luck: 10, strength: 5, healthPct: 1 },
  ...over,
});

describe("weak spot (Targeting weak spot)", () => {
  it("is ×1 until the biometrics state says the shot lands on a weak spot", () => {
    const off = calculateCombatFirepower(base());
    expect(off.weakSpot).toMatchObject({ targeting: false, multiplier: 1, baseMultiplier: 2 });
    const on = calculateCombatFirepower(base({ playerStats: { agility: 10, luck: 10, strength: 5, healthPct: 1, isTargetingWeakSpot: true } }));
    expect(on.weakSpot).toMatchObject({ targeting: true, baseMultiplier: 2, bonusPct: 0, multiplier: 2 });
    expect(on.damagePerShot.normal).toBe(off.damagePerShot.normal * 2);
    // The crit bonus is scaled by the same multiplier; splash is not.
    expect(on.damagePerShot.critical).toBe(off.damagePerShot.critical * 2);
    expect(on.damagePerShot.breakdown.some((b) => b.source.startsWith("Weak spot"))).toBe(true);
  });

  it("uses the target's own head multiplier and admits missing data", () => {
    const sbq = calculateCombatFirepower(base({ targetDummyId: "scorchbeast-queen", playerStats: { agility: 10, luck: 10, strength: 5, isTargetingWeakSpot: true } }));
    expect(sbq.weakSpot.baseMultiplier).toBe(weakSpot.dummies["scorchbeast-queen"].multiplier);
    const titan = calculateCombatFirepower(base({ targetDummyId: "ultracite-titan", playerStats: { agility: 10, luck: 10, strength: 5, isTargetingWeakSpot: true } }));
    expect(titan.weakSpot).toMatchObject({ targeting: true, baseMultiplier: null, multiplier: 1 });
  });

  it("Gunslinger is weak-spot damage only (Patch 62), stacked with Faulty Spots and Gunslinger Expert", () => {
    const bodyShot = calculateCombatFirepower(base({
      weaponId: "western-revolver",
      equippedPerks: [{ cardId: "gunslinger", rank: 3 }],
    }));
    const noPerk = calculateCombatFirepower(base({ weaponId: "western-revolver" }));
    expect(bodyShot.damagePerShot.normal).toBe(noPerk.damagePerShot.normal);

    const head = calculateCombatFirepower(base({
      weaponId: "western-revolver",
      equippedPerks: [
        { cardId: "gunslinger", rank: 3 },
        { cardId: "gunslinger-expert", rank: 1 },
        { cardId: "faulty-spots", rank: 1 },
      ],
      playerStats: { agility: 10, luck: 10, strength: 5, healthPct: 1, isTargetingWeakSpot: true, onslaughtStacks: 3 },
    }));
    // 2.0 × (1 + 0.12 + 0.03 + 0.15)
    expect(head.weakSpot.bonusPct).toBeCloseTo(0.3, 5);
    expect(head.weakSpot.multiplier).toBeCloseTo(2.6, 5);
    expect(head.weakSpot.breakdown.map((b) => b.source)).toEqual([
      "Gunslinger (Rank 3)",
      "Gunslinger Expert (3 Onslaught)",
      "Faulty Spots",
    ]);
  });

  it("Smart Shot needs a scoped sight and aiming outside V.A.T.S.", () => {
    const stats = { agility: 10, luck: 10, strength: 5, isTargetingWeakSpot: true, isAiming: true };
    const scoped = calculateCombatFirepower(base({
      weaponId: "hunting-rifle",
      weaponCrafting: { sightId: "medium-scope" },
      equippedPerks: [{ cardId: "smart-shot", rank: 1 }],
      playerStats: stats,
    }));
    expect(scoped.weakSpot.bonusPct).toBeCloseTo(0.25, 5);
    const ironSights = calculateCombatFirepower(base({
      weaponId: "hunting-rifle",
      equippedPerks: [{ cardId: "smart-shot", rank: 1 }],
      playerStats: stats,
    }));
    expect(ironSights.weakSpot.bonusPct).toBe(0);
    const inVats = calculateCombatFirepower(base({
      weaponId: "hunting-rifle",
      weaponCrafting: { sightId: "medium-scope" },
      equippedPerks: [{ cardId: "smart-shot", rank: 1 }],
      playerStats: { ...stats, isInVats: true },
    }));
    expect(inVats.weakSpot.bonusPct).toBe(0);
  });

  it("applies the modelled unique weak-point innates", () => {
    const fist = calculateCombatFirepower(base({ weaponId: "face-breaker", playerStats: { agility: 10, luck: 10, strength: 5, isTargetingWeakSpot: true } }));
    expect(fist.weakSpot.bonusPct).toBeCloseTo(0.1, 5);
    const finder = calculateCombatFirepower(base({ weaponId: "the-fact-finder", playerStats: { agility: 10, luck: 10, strength: 5, isTargetingWeakSpot: true, isAiming: true } }));
    expect(finder.weakSpot.breakdown.some((b) => b.source.includes("aiming"))).toBe(true);
    expect(finder.weakSpot.bonusPct).toBeCloseTo(0.15, 5);
    const survivor = calculateCombatFirepower(base({ weaponId: "sole-survivor", playerStats: { agility: 10, luck: 10, strength: 5, isTargetingWeakSpot: true, killStreak: 12 } }));
    expect(survivor.weakSpot.bonusPct).toBeCloseTo(0.3, 5); // capped at 10 kills
  });
});

describe("consumable ids from the switchboard", () => {
  it("catalog ids (chem-…, bobble-…, mag-…, brew-…) apply the same bonuses as the engine's short names", () => {
    const short = calculateCombatFirepower(base({
      activeBuffs: { activeDrug: "psychotats", activeBobblehead: "small-guns", activeMagazine: "guns-and-bullets-3", activeAlcohol: "ballistic-bock" },
    }));
    const catalog = calculateCombatFirepower(base({
      activeBuffs: { activeDrug: "chem-psychotats", activeBobblehead: "bobble-small-guns", activeMagazine: "mag-gb3", activeAlcohol: "brew-ballistic-bock" },
    }));
    const none = calculateCombatFirepower(base());
    expect(catalog.damagePerShot.normal).toBe(short.damagePerShot.normal);
    expect(catalog.damagePerShot.critical).toBe(short.damagePerShot.critical);
    expect(catalog.damagePerShot.normal).toBeGreaterThan(none.damagePerShot.normal);
    expect(catalog.damagePerShot.breakdown.map((b) => b.source)).toEqual(
      expect.arrayContaining(["Psychotats / Psychobuff", "Small Guns Bobblehead", "Ballistic Bock"]),
    );
  });
});
