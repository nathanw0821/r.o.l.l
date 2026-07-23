import type { Prisma } from "@prisma/client";
import { normalizeCategory } from "@/lib/filter-utils";
import type { EffectTierCatalogRow } from "@/lib/data";
import { normalizeLegendaryMatchKey, tierStarRankFromTierLabel } from "@/lib/builder/legendary-tracker-unlock";

const modCatalogSelect = {
  id: true,
  slug: true,
  name: true,
  starRank: true,
  category: true,
  subCategory: true,
  description: true,
  effectMath: true,
  craftingCost: true,
  allowedOnPowerArmor: true,
  allowedOnArmor: true,
  allowedOnWeapon: true,
  infestationOnly: true,
  fifthStarEligible: true,
  ghoulSpecialCap: true
} satisfies Prisma.LegendaryModSelect;

export type BuilderLegendaryCatalogRow = Prisma.LegendaryModGetPayload<{ select: typeof modCatalogSelect }>;

export { modCatalogSelect };

function normalizedCategorySet(row: EffectTierCatalogRow): Set<string> {
  return new Set(row.categories.map((c) => normalizeCategory(c.category.name)));
}

const WEAPON_CATEGORY_TOKENS = new Set([
  "melee",
  "ranged",
  "guns",
  "gun",
  "weapons",
  "weapon",
  "ballistic",
  "heavy",
  "shotgun",
  "energy",
  "explosive",
  "explosives"
]);

function inferWeaponSubCategory(names: Set<string>): string | null {
  const melee = names.has("melee");
  const rangedLike =
    names.has("ranged") ||
    names.has("guns") ||
    names.has("gun") ||
    names.has("ballistic") ||
    names.has("heavy") ||
    names.has("shotgun") ||
    names.has("energy") ||
    names.has("explosive") ||
    names.has("explosives");
  if (melee && rangedLike) return null;
  if (melee) return "Melee";
  if (rangedLike) return "Ranged";
  return null;
}

function effectTierToSupplementalMod(row: EffectTierCatalogRow): BuilderLegendaryCatalogRow | null {
  const star = tierStarRankFromTierLabel(row.tier?.label);
  if (!star || star < 1 || star > 4) return null;

  const names = normalizedCategorySet(row);
  if ([...names].some((n) => n.includes("infestation"))) return null;

  const hasWeaponToken = [...names].some((n) => WEAPON_CATEGORY_TOKENS.has(n));
  const hasPowerArmor = names.has("power armor") || [...names].some((n) => n.includes("power armor"));
  const hasRegularArmor =
    names.has("armor") ||
    [...names].some((n) => {
      if (n.includes("power")) return false;
      if (n.includes("underarmor")) return false;
      if (WEAPON_CATEGORY_TOKENS.has(n)) return false;
      return n === "armor" || n.includes("armor");
    });

  if (hasWeaponToken && (hasRegularArmor || hasPowerArmor)) return null;

  if (hasWeaponToken) {
    return {
      id: `et-${row.id}`,
      slug: `et-${row.id}`,
      name: row.effect.name,
      starRank: star,
      category: "Weapon",
      subCategory: inferWeaponSubCategory(names),
      description: row.description?.trim() ?? "",
      effectMath: {},
      craftingCost: {},
      allowedOnPowerArmor: false,
      allowedOnArmor: false,
      allowedOnWeapon: true,
      infestationOnly: false,
      fifthStarEligible: false,
      ghoulSpecialCap: null
    };
  }

  if (hasRegularArmor || hasPowerArmor) {
    return {
      id: `et-${row.id}`,
      slug: `et-${row.id}`,
      name: row.effect.name,
      starRank: star,
      category: "Armor",
      subCategory: null,
      description: row.description?.trim() ?? "",
      effectMath: {},
      craftingCost: {},
      allowedOnPowerArmor: hasPowerArmor,
      allowedOnArmor: hasRegularArmor,
      allowedOnWeapon: false,
      infestationOnly: false,
      fifthStarEligible: false,
      ghoulSpecialCap: null
    };
  }

  return null;
}

/**
 * Union of curated `LegendaryMod` rows and live tracker `EffectTier` rows so pick lists match site categories.
 * Curated rows win on (effect name + star) dedupe — richer `effectMath` / flags stay authoritative.
 */
export function mergeLegendaryModsWithEffectTiers(
  legendary: BuilderLegendaryCatalogRow[],
  effectTiers: EffectTierCatalogRow[]
): BuilderLegendaryCatalogRow[] {
  const curatedKeys = new Set(
    legendary.map((m) => `${normalizeLegendaryMatchKey(m.name)}|${m.starRank}`)
  );

  const out = [...legendary];
  const seenSlugs = new Set(legendary.map((m) => m.slug));

  for (const row of effectTiers) {
    const key = `${normalizeLegendaryMatchKey(row.effect.name)}|${tierStarRankFromTierLabel(row.tier?.label) ?? ""}`;
    if (curatedKeys.has(key)) continue;

    const supplemental = effectTierToSupplementalMod(row);
    if (!supplemental) continue;
    if (seenSlugs.has(supplemental.slug)) continue;

    curatedKeys.add(key);
    seenSlugs.add(supplemental.slug);
    out.push(supplemental);
  }

  return out;
}
