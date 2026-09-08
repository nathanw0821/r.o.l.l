import { describe, expect, it } from "vitest";
import { calculateAggregatedBuffSpecial } from "./buff-stacking-engine";

describe("calculateAggregatedBuffSpecial", () => {
  it("deduplicates CAMP furniture taking only the single highest bonus per stat", () => {
    const res = calculateAggregatedBuffSpecial({
      activeCampBuffs: ["camp-arm-wrestling", "camp-weight-bench"], // both give +2 STR
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
    });
    // Should NOT be 4, should be exactly 2
    expect(res.totals.str).toBe(2);
    expect(res.breakdown.filter((b) => b.stat === "str").length).toBe(1);
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
