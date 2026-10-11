import { describe, expect, it } from "vitest";
import { calculateAggregatedBuffSpecial } from "./buff-stacking-engine";

describe("calculateAggregatedBuffSpecial", () => {
  it("deduplicates CAMP furniture taking only the single highest bonus per stat", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: ["camp-telescope", "camp-glove-box"], // both give +2 PER
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
    });
    // Should NOT be 4, should be exactly 2
    expect(res.totals.per).toBe(2);
    expect(res.breakdown.filter((b) => b.stat === "per").length).toBe(1);
  });

  it("stacks CAMP stations whose stats differ and counts a shared stat once", () => {
    const res = calculateAggregatedBuffSpecial({
      // Pinball +2 AGI/+2 PER, claw machine +2 LCK/+2 PER, weight bench +2 STR
      activeCampBuffs: ["camp-pinball-machine", "camp-claw-machine", "camp-weight-bench"],
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
    });
    expect(res.totals).toMatchObject({ str: 2, per: 2, agi: 2, lck: 2, cha: 0, end: 0, int: 0 });
    expect(res.breakdown.filter((b) => b.stat === "per").length).toBe(1);
  });

  it("carries the wiki-sourced station corrections (arm wrestle is Charisma, phoropter has no SPECIAL)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: ["camp-arm-wrestling", "camp-phoropter"],
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
    });
    expect(res.totals).toMatchObject({ str: 0, per: 0, cha: 2 });
  });

  it("applies Herbivore + SiN 2.5x scaling to plant foods (Brain Bombs -> +8 INT)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["plant-brain-bombs"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: ["herbivore"],
      hasStrangeInNumbers: true,
    });
    expect(res.totals.int).toBe(8);
  });

  it("applies Herbivore without SiN 2.0x scaling to plant foods (Brain Bombs -> +6 INT)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["plant-brain-bombs"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: ["herbivore"],
      hasStrangeInNumbers: false,
    });
    expect(res.totals.int).toBe(6);
  });

  it("applies unmutated base 1.0x scaling to plant foods (Brain Bombs -> +3 INT)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["plant-brain-bombs"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: [],
      hasStrangeInNumbers: false,
    });
    expect(res.totals.int).toBe(3);
  });

  it("grants 0 benefit from meat dishes when Herbivore is active (Deathclaw Steak -> 0 STR)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["meat-deathclaw-steak"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: ["herbivore"],
      hasStrangeInNumbers: true,
    });
    expect(res.totals.str).toBe(0);
    expect(res.breakdown.length).toBe(0);
  });

  it("applies Carnivore + SiN 2.5x scaling to meat dishes (Deathclaw Steak -> +5 STR)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["meat-deathclaw-steak"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: ["carnivore"],
      hasStrangeInNumbers: true,
    });
    expect(res.totals.str).toBe(5);
  });

  it("applies Carnivore without SiN 2.0x scaling to meat dishes (Deathclaw Steak -> +4 STR)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["meat-deathclaw-steak"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: ["carnivore"],
      hasStrangeInNumbers: false,
    });
    expect(res.totals.str).toBe(4);
  });

  it("grants 0 benefit from plant foods/teas when Carnivore is active (Brain Bombs -> 0 INT)", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: null,
      activeFoods: ["plant-brain-bombs"],
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeMutations: ["carnivore"],
      hasStrangeInNumbers: true,
    });
    expect(res.totals.int).toBe(0);
    expect(res.breakdown.length).toBe(0);
  });

  it("correctly aggregates chems, alcohol, bobblehead, and companion", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: [],
      activeDrug: "chem-psychobuff", // +3 STR, +3 END
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: "brew-whiskey", // +6 STR with Party Boy
      activeNukaCola: null,
      activeCompanion: "comp-yasmin", // +2 STR, +2 END
      activeMutations: [],
    });
    expect(res.totals.str).toBe(11); // 3 + 6 + 2
    expect(res.totals.end).toBe(5); // 3 + 2
  });
});

describe("Nuka-Cola slot", () => {
  const base = {
    activeCampBuffs: [] as string[],
    activeDrug: null,
    activeBobblehead: null,
    activeMagazine: null,
    activeAlcohol: null,
    activeCompanion: null,
  };

  it("applies the active Nuka-Cola through the breakdown (Cranberry = +2% XP, no SPECIAL)", () => {
    const res = calculateAggregatedBuffSpecial({ ...base, activeNukaCola: "nuka-cranberry" });
    expect(res.breakdown.some((b) => b.source.startsWith("Nuka-Cola ("))).toBe(false);
    expect(Object.values(res.totals).every((v) => v === 0)).toBe(true);
  });

  it("counts Nuka-Dark's SPECIAL once and ignores unknown ids", () => {
    const dark = calculateAggregatedBuffSpecial({ ...base, activeNukaCola: "nuka-dark" });
    expect(dark.totals.str).toBe(6);
    expect(dark.breakdown.filter((b) => b.source.startsWith("Nuka-Cola (")).length).toBe(2);
    const none = calculateAggregatedBuffSpecial({ ...base, activeNukaCola: "nuka-does-not-exist" });
    expect(Object.values(none.totals).every((v) => v === 0)).toBe(true);
  });
});
