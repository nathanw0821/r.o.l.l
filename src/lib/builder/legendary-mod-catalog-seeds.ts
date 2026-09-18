import type { BuilderModDTO } from "@/lib/builder/types";
/**
 * Expanded Fallout 76–style legendary catalog for the loadout builder.
 * Sourced directly from the authoritative legendary effects in `FALLBACK_LEGENDARY_EFFECTS`
 * (148 Patch 69 effects + Severing from Patch 70 "The Slasher"; the count is asserted in legendary-catalog-integrity.test.ts).
 * Star ranks follow canonical 4-star bench grouping (1–4).
 * `effectMath` models the active simulation sandbox subset (damage, resists, SPECIAL, AP regen).
 */

import { FALLBACK_LEGENDARY_EFFECTS, type StaticEffectRow } from "@/lib/static-fallback-catalog";
import { getCatalogEffectMath } from "@/lib/truth/legendary-effect-model";

export type BuilderLegendarySeedRow = {
  slug: string;
  name: string;
  starRank: 1 | 2 | 3 | 4;
  category: "Armor" | "Weapon" | "Universal";
  subCategory: string | null;
  description: string;
  effectMath: Record<string, number>;
  allowedOnPowerArmor: boolean;
  allowedOnArmor: boolean;
  allowedOnWeapon: boolean;
  fifthStarEligible: boolean;
  ghoulSpecialCap: number | null;
};

/**
 * `effectMath` per slug, derived from `src/data/truth/legendary-effect-model.json`.
 * Effects with no `catalogMath` block in the pack seed as `{}`.
 *
 * Not in the pack on purpose:
 *  - aristocrats (armor): 10% damage reflect at 40K caps since Patch 66; no flat resists.
 *  - bolstering / vanguards / mutants / sentinels / hardy: multiplicative damage
 *    reducers since Patch 66, modelled from defensive-perks.json in perk-defensive-layer.ts.
 */
const SPECIAL_MATH_LOOKUP: Record<string, Record<string, number>> = getCatalogEffectMath();

const SPECIAL_STAT_SLUGS = ["strength", "perception", "endurance", "charisma", "intelligence", "agility", "luck"];

/** Star rank of a fallback catalog row (1–4), read from its tier label. */
export function deriveSeedStar(row: StaticEffectRow): 1 | 2 | 3 | 4 {
  return parseInt(row.tier.label.replace(/\D/g, ""), 10) as 1 | 2 | 3 | 4;
}

/**
 * Catalog slug of a fallback catalog row. SPECIAL effects exist at two star
 * ranks under one name, so they carry their star (e.g. `strength-3`).
 */
export function deriveSeedSlug(row: StaticEffectRow): string {
  const slug = row.id.replace(/^effect-\d+star-/, "").replace(/\./g, "");
  return SPECIAL_STAT_SLUGS.includes(slug) ? `${slug}-${deriveSeedStar(row)}` : slug;
}

export const EXTENDED_LEGENDARY_MOD_SEEDS: BuilderLegendarySeedRow[] = FALLBACK_LEGENDARY_EFFECTS.map((row) => {
  const star = deriveSeedStar(row);
  const catStr = typeof row.categories === "string" ? row.categories.toLowerCase() : "";
  const hasWeapon = catStr.includes("weapon");
  const hasPA = catStr.includes("power armor");
  const hasRegularArmor = catStr.split("•").some((c) => {
    const t = c.trim();
    return t === "armor" || (t.includes("armor") && !t.includes("power") && !t.includes("underarmor"));
  });

  let category: "Armor" | "Weapon" | "Universal" = "Universal";
  if (hasWeapon && !hasRegularArmor && !hasPA) {
    category = "Weapon";
  } else if (!hasWeapon && (hasRegularArmor || hasPA)) {
    category = "Armor";
  } else {
    category = "Universal";
  }

  let subCategory: string | null = null;
  if (hasWeapon) {
    const isMelee = catStr.includes("weapon: melee") || catStr.includes("melee");
    const isRanged = catStr.includes("weapon: ranged") || catStr.includes("ranged");
    if (isMelee && !isRanged) subCategory = "Melee";
    else if (isRanged && !isMelee) subCategory = "Ranged";
  }

  const slug = deriveSeedSlug(row);

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

/** Seed rows shaped as BuilderModDTOs so the builder renders before the catalog API responds. */
export const INITIAL_BUILDER_MODS: BuilderModDTO[] = EXTENDED_LEGENDARY_MOD_SEEDS.map((r) => ({
  id: `seed-${r.slug}`,
  slug: r.slug,
  name: r.name,
  starRank: r.starRank,
  category: r.category,
  subCategory: r.subCategory,
  description: r.description,
  effectMath: r.effectMath ?? {},
  craftingCost: {},
  allowedOnPowerArmor: r.allowedOnPowerArmor,
  allowedOnArmor: r.allowedOnArmor,
  allowedOnWeapon: r.allowedOnWeapon,
  infestationOnly: false,
  fifthStarEligible: r.fifthStarEligible,
  ghoulSpecialCap: r.ghoulSpecialCap,
  trackerUnlock: "unknown"
}));
