import {
  ALL_CAMP_APPLIANCES,
  ALL_CHEMS,
  ALL_BOBBLEHEADS,
  ALL_MAGAZINES,
  ALL_PLANT_FOODS,
  ALL_MEAT_FOODS,
  ALL_ALCOHOL,
  ALL_NUKA_COLAS,
  ALL_COMPANIONS,
  Fallout76BuffDef,
} from "@/lib/builder/all-fallout76-buffs";

export type SpecialStatKey = "str" | "per" | "end" | "cha" | "int" | "agi" | "lck";

export type AggregatedBuffSpecial = {
  totals: Record<SpecialStatKey, number>;
  breakdown: Array<{ stat: SpecialStatKey; source: string; val: number }>;
};

/**
 * Aggregates SPECIAL bonuses from active consumables, chems, drinks, and CAMP furniture.
 * ENFORCES FO76 GAME RULE: Duplicate CAMP furniture buffs for the SAME stat do NOT stack;
 * only the SINGLE HIGHEST bonus per stat is applied.
 */
export function calculateAggregatedBuffSpecial(params: {
  activeCampBuffs: string[];
  activeDrug: string | null;
  activeFood?: string | null;
  activeFoods?: Record<string, string> | string[];
  activeBobblehead: string | null;
  activeMagazine: string | null;
  activeAlcohol: string | null;
  activeNukaCola: string | null;
  activeCompanion: string | null;
  activeMutations?: string[];
  hasStrangeInNumbers?: boolean;
}): AggregatedBuffSpecial {
  const {
    activeCampBuffs,
    activeDrug,
    activeFood,
    activeFoods,
    activeBobblehead,
    activeMagazine,
    activeAlcohol,
    activeNukaCola,
    activeCompanion,
    activeMutations = [],
    hasStrangeInNumbers = false,
  } = params;

  const totals: Record<SpecialStatKey, number> = {
    str: 0,
    per: 0,
    end: 0,
    cha: 0,
    int: 0,
    agi: 0,
    lck: 0,
  };

  const breakdown: Array<{ stat: SpecialStatKey; source: string; val: number }> = [];

  const STAT_KEYS: SpecialStatKey[] = ["str", "per", "end", "cha", "int", "agi", "lck"];

  // 1. CAMP FURNITURE DEDUPLICATION RULE: Highest Bonus Per Stat Only
  const selectedCampDefs = ALL_CAMP_APPLIANCES.filter((c) => activeCampBuffs.includes(c.id));

  STAT_KEYS.forEach((stat) => {
    let maxVal = 0;
    let maxSource = "";

    selectedCampDefs.forEach((c) => {
      const val = c.specialBonus?.[stat];
      if (val && val > maxVal) {
        maxVal = val;
        maxSource = `CAMP Furniture (${c.label})`;
      }
    });

    if (maxVal > 0) {
      totals[stat] += maxVal;
      breakdown.push({ stat, source: maxSource, val: maxVal });
    }
  });

  // Helper to add single buff def
  const addBuffDef = (def: Fallout76BuffDef | undefined, prefix: string) => {
    if (!def || !def.specialBonus) return;
    STAT_KEYS.forEach((stat) => {
      const val = def.specialBonus?.[stat];
      if (val && val !== 0) {
        totals[stat] += val;
        breakdown.push({ stat, source: `${prefix} (${def.label})`, val });
      }
    });
  };

  // 2. Active Chem / Drug
  const chemDef = ALL_CHEMS.find((c) => c.id === activeDrug);
  addBuffDef(chemDef, "Chem");

  // 3. Active Foods (Multi-category stacked foods with Herbivore / Carnivore scaling)
  const isHerbivore = activeMutations.includes("herbivore");
  const isCarnivore = activeMutations.includes("carnivore");
  const allFoods = [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS];
  const foodIds = Array.isArray(activeFoods)
    ? activeFoods
    : activeFoods
    ? Object.values(activeFoods)
    : activeFood
    ? [activeFood]
    : [];

  foodIds.forEach((fid) => {
    const fDef = allFoods.find((f) => f.id === fid);
    if (!fDef || !fDef.specialBonus) return;

    const isPlant = ALL_PLANT_FOODS.some((p) => p.id === fid);
    const isMeat = ALL_MEAT_FOODS.some((m) => m.id === fid);

    // Mutual exclusivity & mutation scaling:
    // ALL_PLANT_FOODS and ALL_MEAT_FOODS define values at Herbivore/Carnivore + SiN (2.5x base).
    let foodMult = 1.0;
    let tag = "";

    if (isPlant) {
      if (isCarnivore) {
        // Carnivores receive 0 benefits from plant foods/teas
        foodMult = 0;
      } else if (isHerbivore) {
        if (hasStrangeInNumbers) {
          foodMult = 1.0; // 2.5x
          tag = " (Herbivore + SiN)";
        } else {
          foodMult = 0.8; // 2.0x (2.0 / 2.5)
          tag = " (Herbivore)";
        }
      } else {
        // Unmutated base (1.0x = 1.0 / 2.5 = 0.4)
        foodMult = 0.4;
        tag = " (Base)";
      }
    } else if (isMeat) {
      if (isHerbivore) {
        // Herbivores receive 0 benefits from meat dishes
        foodMult = 0;
      } else if (isCarnivore) {
        if (hasStrangeInNumbers) {
          foodMult = 1.0; // 2.5x
          tag = " (Carnivore + SiN)";
        } else {
          foodMult = 0.8; // 2.0x (2.0 / 2.5)
          tag = " (Carnivore)";
        }
      } else {
        // Unmutated base (1.0x = 1.0 / 2.5 = 0.4)
        foodMult = 0.4;
        tag = " (Base)";
      }
    }

    if (foodMult > 0) {
      STAT_KEYS.forEach((stat) => {
        const rawVal = fDef.specialBonus?.[stat];
        if (rawVal && rawVal !== 0) {
          const scaledVal = Math.round(rawVal * foodMult);
          if (scaledVal !== 0) {
            totals[stat] += scaledVal;
            breakdown.push({
              stat,
              source: `Food/Tea (${fDef.label})${tag}`,
              val: scaledVal,
            });
          }
        }
      });
    }
  });

  // 4. Active Bobblehead
  const bobbleDef = ALL_BOBBLEHEADS.find((b) => b.id === activeBobblehead);
  addBuffDef(bobbleDef, "Bobblehead");

  // 5. Active Magazine
  const magDef = ALL_MAGAZINES.find((m) => m.id === activeMagazine);
  addBuffDef(magDef, "Magazine");

  // 6. Active Alcohol
  const alcDef = ALL_ALCOHOL.find((a) => a.id === activeAlcohol);
  addBuffDef(alcDef, "Alcohol");

  // 7. Active Nuka-Cola
  const nukaDef = ALL_NUKA_COLAS.find((n) => n.id === activeNukaCola);
  addBuffDef(nukaDef, "Nuka-Cola");

  // 8. Active Companion
  const compDef = ALL_COMPANIONS.find((c) => c.id === activeCompanion);
  addBuffDef(compDef, "Companion Ally");

  return { totals, breakdown };
}
