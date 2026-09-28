import { describe, it, expect } from "vitest";
import { calculateVitalsSheet, type VitalsInput } from "./vitals-sheet";

const base = (over: Partial<VitalsInput> = {}): VitalsInput => ({
  special: { str: 1, per: 1, end: 1, cha: 1, int: 1, agi: 1, lck: 1 },
  perkCards: [],
  totals: { hp: 0, apRegen: 0, carryWeight: 0 },
  lifegiverMaxHpPct: 0,
  engineApPool: null,
  isGhoul: false,
  isPowerArmor: false,
  timeOfDay: "day",
  foodState: "content",
  thirstState: "hydrated",
  isOnTeam: false,
  hasWellTunedFurniture: false,
  overeatersPieces: 0,
  rangedWeaponEquipped: true,
  ...over,
});

describe("calculateVitalsSheet", () => {
  it("uses the wiki base formulas at SPECIAL 1 and 15", () => {
    const low = calculateVitalsSheet(base());
    expect(low.maxHp).toBe(250);
    expect(low.carryWeight).toBe(155);
    expect(low.maxAp).toBe(110);
    expect(low.apRegenPerSecond).toBe(6);
    const high = calculateVitalsSheet(base({ special: { str: 15, per: 1, end: 15, cha: 1, int: 1, agi: 15, lck: 1 } }));
    expect(high.maxHp).toBe(320);
    expect(high.carryWeight).toBe(225);
    expect(high.maxAp).toBe(250);
  });

  it("adds the HP sources with their conditions", () => {
    const night = calculateVitalsSheet(base({
      perkCards: [{ cardId: "nocturnal-fortitude", rank: 2 }, { cardId: "photosynthetic", rank: 2 }],
      timeOfDay: "night",
      foodState: "fully_fed",
      overeatersPieces: 5,
      lifegiverMaxHpPct: 20,
      totals: { hp: 40, apRegen: 0, carryWeight: 0 },
    }));
    // 250 + 20 % Lifegiver (50) + 100 Nocturnal + 35 Fully Fed + 200 Overeater's + 40 totals
    expect(night.maxHp).toBe(675);
    expect(night.hpRegenPerSecond).toBe(0); // Photosynthetic is daytime only
    expect(night.lines.maxHp.map((l) => l.source)).toEqual(expect.arrayContaining([expect.stringContaining("Nocturnal Fortitude")]));
    const day = calculateVitalsSheet(base({ perkCards: [{ cardId: "photosynthetic", rank: 1 }, { cardId: "battle-genes", rank: 2 }] }));
    expect(day.hpRegenPerSecond).toBe(7);
  });

  it("prefers the engine's AP pool and stacks AP regen sources", () => {
    const r = calculateVitalsSheet(base({
      engineApPool: 160,
      perkCards: [{ cardId: "action-boy", rank: 3 }],
      thirstState: "fully_hydrated",
      hasWellTunedFurniture: true,
      totals: { hp: 0, apRegen: -0.2, carryWeight: 0 },
    }));
    expect(r.maxAp).toBe(160);
    // 6 × (1 + 0.45 + 0.35 + 0.25 − 0.20) = 11.1
    expect(r.apRegenPerSecond).toBe(11.1);
    const noEngine = calculateVitalsSheet(base({ perkCards: [{ cardId: "thirst-quencher", rank: 1 }], special: { str: 1, per: 1, end: 15, cha: 1, int: 1, agi: 1, lck: 1 } }));
    expect(noEngine.maxAp).toBe(110 + 90);
  });

  it("carry weight and movement speed follow the perks and their conditions", () => {
    const r = calculateVitalsSheet(base({
      special: { str: 15, per: 1, end: 1, cha: 1, int: 1, agi: 1, lck: 1 },
      perkCards: [{ cardId: "strong-back", rank: 1 }, { cardId: "gun-runner", rank: 2 }, { cardId: "squad-maneuvers", rank: 2 }, { cardId: "portable-power", rank: 3 }],
      totals: { hp: 0, apRegen: 0, carryWeight: 20 },
      isOnTeam: true,
      isPowerArmor: false,
    }));
    expect(r.carryWeight).toBe(225 + 40 + 20);
    expect(r.moveSpeedPct).toBe(40); // Gun Runner 20 + Squad 20; Portable Power needs power armor
  });
});
