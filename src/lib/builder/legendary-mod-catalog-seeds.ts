/**
 * Expanded Fallout 76–style legendary catalog for the loadout builder.
 * Sourced directly from the authoritative 148 Patch 69 legendary effects in `FALLBACK_LEGENDARY_EFFECTS`.
 * Star ranks follow canonical 4-star bench grouping (1–4).
 * `effectMath` models the active simulation sandbox subset (damage, resists, SPECIAL, AP regen).
 */

import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";

export type BuilderLegendarySeedRow = {
  slug: string;
  name: string;
  starRank: 1 | 2 | 3 | 4;
  category: "Armor" | "Weapon";
  subCategory: string | null;
  description: string;
  effectMath: Record<string, number>;
  allowedOnPowerArmor: boolean;
  allowedOnArmor: boolean;
  allowedOnWeapon: boolean;
  fifthStarEligible: boolean;
  ghoulSpecialCap: number | null;
};

const SPECIAL_MATH_LOOKUP: Record<string, Record<string, number>> = {
  "anti-armor": { damagePct: 0.12 },
  "aristocrats": { dr: 20, er: 20 },
  "bloodied": { damagePct: 0.25 },
  "bolstering": { dr: 10, er: 10 },
  "mutants": { dr: 10, er: 10 },
  "nocturnal": { dr: 80, er: 80 },
  "overeaters": { dr: 6, er: 6 },
  "two-shot": { damagePct: 0.25 },
  "unyielding": { specialBonus: 3 },
  "vanguards": { dr: 10, er: 10 },
  "powered": { apRegen: 0.05 },
  "poisoners": { pr: 25 },
  "fireproof": { fr: 25 },
  "warming": { cr: 25 },
  "hazmat": { rr: 25 },
  "hardy": { er: 15 },
  "rapid": { damagePct: 0.05 },
  "explosive": { damagePct: 0.2 },
  "sentinels": { dr: 15, er: 15 },
  "strength-2": { str: 2 },
  "perception-2": { per: 2 },
  "endurance-2": { end: 2 },
  "charisma-2": { cha: 2 },
  "intelligence-2": { int: 2 },
  "agility-2": { agi: 2 },
  "luck-2": { lck: 2 },
  "strength-3": { str: 3 },
  "perception-3": { per: 3 },
  "endurance-3": { end: 3 },
  "charisma-3": { cha: 3 },
  "intelligence-3": { int: 3 },
  "agility-3": { agi: 3 },
  "luck-3": { lck: 3 }
};

export const EXTENDED_LEGENDARY_MOD_SEEDS: BuilderLegendarySeedRow[] = FALLBACK_LEGENDARY_EFFECTS.map((row) => {
  const star = parseInt(row.tier.label.replace(/\D/g, ""), 10) as 1 | 2 | 3 | 4;
  const catStr = typeof row.categories === "string" ? row.categories.toLowerCase() : "";
  const hasWeapon = catStr.includes("weapon");
  const hasPA = catStr.includes("power armor");
  const hasRegularArmor = catStr.split("•").some((c) => {
    const t = c.trim();
    return t === "armor" || (t.includes("armor") && !t.includes("power") && !t.includes("underarmor"));
  });

  let category: "Armor" | "Weapon" = "Weapon";
  if (hasWeapon && !hasRegularArmor && !hasPA) {
    category = "Weapon";
  } else if (!hasWeapon && (hasRegularArmor || hasPA)) {
    category = "Armor";
  } else {
    // If dual (universal), default to weapon category for seed typing; allowed flags distinguish equipment
    category = hasWeapon ? "Weapon" : "Armor";
  }

  let subCategory: string | null = null;
  if (hasWeapon) {
    const isMelee = catStr.includes("weapon: melee") || catStr.includes("melee");
    const isRanged = catStr.includes("weapon: ranged") || catStr.includes("ranged");
    if (isMelee && !isRanged) subCategory = "Melee";
    else if (isRanged && !isMelee) subCategory = "Ranged";
  }

  let slug = row.id.replace(/^effect-\d+star-/, "").replace(/\./g, "");
  if (["strength", "perception", "endurance", "charisma", "intelligence", "agility", "luck"].includes(slug)) {
    slug = `${slug}-${star}`;
  }

  const math = SPECIAL_MATH_LOOKUP[slug] || {};
  const ghoulCap = slug === "unyielding" ? 2 : null;

  return {
    slug,
    name: row.effect.name,
    starRank: star,
    category,
    subCategory,
    description: row.description?.trim() ?? "",
    effectMath: math,
    allowedOnPowerArmor: hasPA,
    allowedOnArmor: hasRegularArmor,
    allowedOnWeapon: hasWeapon,
    fifthStarEligible: false,
    ghoulSpecialCap: ghoulCap
  };
});
