import { describe, expect, it } from "vitest";

import craftingEconomy from "@/data/truth/crafting-economy.json";
import defensivePerks from "@/data/truth/defensive-perks.json";
import legendaryPerkCosts from "@/data/truth/legendary-perk-costs.json";
import perkCurves from "@/data/truth/perk-curves-p70.json";

const curves = perkCurves.curves as unknown as Record<string, [number, number][]>;

function at(name: string, x: number): number {
  const curve = curves[name];
  if (!curve) throw new Error(`no curve ${name}`);
  const hit = curve.find(([cx]) => cx === x);
  if (!hit) throw new Error(`${name} has no control point at x=${x}`);
  return hit[1];
}

describe("perk and player curves (Patch 70 client data)", () => {
  it("is stamped with the build it was read from", () => {
    expect(perkCurves.source.patch).toBe(70);
    expect(perkCurves.source.build).toBe("1.7.26.13");
  });

  it("stores well-formed curves: two or more points, x strictly ascending", () => {
    for (const [name, curve] of Object.entries(curves)) {
      expect(curve.length, name).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < curve.length; i += 1) {
        expect(curve[i][0], `${name} x[${i}]`).toBeGreaterThan(curve[i - 1][0]);
      }
    }
  });

  it("reproduces the legendary perk economy R.O.L.L. already holds", () => {
    // Slot unlock levels 50 / 75 / 100 / 150 / 200 / 300.
    const unlock = [1, 2, 3, 4, 5, 6].map((i) => at("legendaryperks/legendaryperks_ranks", i));
    expect(unlock).toEqual(legendaryPerkCosts.slotUnlockLevels);
    // Rank-up costs 50 / 100 / 150 coins for ranks 2 / 3 / 4.
    const cost = [0, 1, 2].map((i) => at("legendaryperks/legendaryperks_upgrades", i));
    expect([legendaryPerkCosts.rankUpCostCoins["2"], legendaryPerkCosts.rankUpCostCoins["3"], legendaryPerkCosts.rankUpCostCoins["4"]]).toEqual(
      cost
    );
  });

  it("reproduces the Patch 70 Scrip scrap and sale values from the official notes", () => {
    const stars = ["1", "2", "3", "4"] as const;
    for (const kind of ["armor", "powerarmor", "weapons_melee", "weapons_ranged"]) {
      const scrap = stars.map((s) => at(`legendary/legendary_scrapvalues_${kind}`, Number(s)));
      const sell = stars.map((s) => at(`legendary/legendary_sellvalues_${kind}`, Number(s)));
      expect(scrap, kind).toEqual(stars.map((s) => craftingEconomy.scrappingScripByStar[s]));
      expect(sell, kind).toEqual(stars.map((s) => craftingEconomy.scripSaleValueByStar[s]));
    }
  });

  it("agrees with the perk minimums R.O.L.L. already models at the lowest stat", () => {
    const perks = defensivePerks.perks as unknown as Record<string, { min?: number }>;
    expect(at("perks/barbarianbonus", 1)).toBe(perks["barbarian"].min);
    expect(at("perks/evasivebonus", 1)).toBe(perks["evasive"].min);
    // Lone Wanderer is a damage multiplier: 0.99 at Charisma 1 is the 1% minimum reduction.
    expect(at("perks/lonewandererdrbonus", 1)).toBe(0.99);
    expect(perks["lone-wanderer"].min).toBe(1);
  });

  it("pins the exact SPECIAL-scaled perk values at the normal maximum stat of 15", () => {
    expect(at("perks/barbarianbonus", 15)).toBe(61);
    expect(at("perks/refractorbonus", 15)).toBe(61);
    expect(at("perks/radresistantbonus", 15)).toBe(61);
    expect(at("perks/evasivebonus", 15)).toBe(6);
    expect(at("perks/lonewandererdrbonus", 15)).toBe(0.9);
    expect(at("perks/lifegiverbonus", 15)).toBe(120);
    // The curves only reach their ceiling at x = 100.
    expect(at("perks/barbarianbonus", 100)).toBe(175);
    expect(at("perks/evasivebonus", 100)).toBe(14);
    expect(at("perks/lonewandererdrbonus", 100)).toBe(0.8);
  });

  it("pins the disease-chance, barter and quest-reward curves", () => {
    expect(at("player/surv_scalediseasechance_endurance", 1)).toBe(2);
    expect(at("player/surv_scalediseasechance_endurance", 12)).toBe(1);
    expect(at("player/surv_scalediseasechance_endurance", 15)).toBe(0.85);
    expect(at("vendors/chr_barterbuycurve", 1)).toBe(2.5);
    expect(at("vendors/chr_barterbuycurve", 100)).toBe(1.5);
    expect(at("vendors/chr_bartersellcurve", 1)).toBe(0.1);
    expect(at("vendors/chr_bartersellcurve", 100)).toBe(0.3);
    expect(at("quests/chr_questcapscurve", 25)).toBe(2.2);
    expect(at("special/perkcardsharecost", 5)).toBe(15);
  });
});
