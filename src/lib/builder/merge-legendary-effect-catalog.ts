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
  const melee = [...names].some((n) => n.includes("melee"));
  const rangedLike = [...names].some((n) =>
    n.includes("ranged") ||
    n.includes("guns") ||
    n.includes("gun") ||
    n.includes("ballistic") ||
    n.includes("heavy") ||
    n.includes("shotgun") ||
    n.includes("energy") ||
    n.includes("explosive") ||
    n.includes("explosives")
  );
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

  const hasWeaponToken = [...names].some((n) =>
    n.split(/\s+/).some((t) => WEAPON_CATEGORY_TOKENS.has(t)) ||
    n.includes("weapon") ||
    n.includes("ranged") ||
    n.includes("melee")
  );
  const hasPowerArmor = [...names].some((n) => n.includes("power armor") || n.includes("powerarmor"));
  const hasRegularArmor = [...names].some((n) => {
    if (n.includes("power")) return false;
    if (n.includes("underarmor")) return false;
    return n === "armor" || n.includes("armor");
  });

  if (!hasWeaponToken && !hasRegularArmor && !hasPowerArmor) return null;

  let category = "Universal";
  if (hasWeaponToken && !hasRegularArmor && !hasPowerArmor) {
    category = "Weapon";
  } else if (!hasWeaponToken && (hasRegularArmor || hasPowerArmor)) {
    category = "Armor";
  } else {
    category = "Universal";
  }

  const rawSlug = row.id.replace(/^effect-\d+star-/, "");
  const cleanSlug = rawSlug.replace(/\./g, "");
  const subCategory = hasWeaponToken ? inferWeaponSubCategory(names) : null;

  const modules = row.legendaryModules ?? (star === 4 ? 120 : star === 3 ? 60 : star === 2 ? 30 : 15);
  const craftingCost: Record<string, unknown> = {
    legendaryModules: modules,
    extraComponent: row.extraComponent ?? null,
    items: [{ name: "Legendary module", count: modules }]
  };
  if (row.extraComponent) {
    (craftingCost.items as Array<{ name: string; count: number | string }>).push({
      name: row.extraComponent,
      count: 1
    });
  }

  return {
    id: row.id,
    slug: cleanSlug || rawSlug,
    name: row.effect.name,
    starRank: star,
    category,
    subCategory,
    description: row.description?.trim() ?? "",
    effectMath: {} as Prisma.JsonValue,
    craftingCost: craftingCost as Prisma.JsonValue,
    allowedOnPowerArmor: hasPowerArmor,
    allowedOnArmor: hasRegularArmor,
    allowedOnWeapon: hasWeaponToken,
    infestationOnly: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  };
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
    const starRank = tierStarRankFromTierLabel(row.tier?.label);
    const key = `${normalizeLegendaryMatchKey(row.effect.name)}|${starRank ?? ""}`;
    if (curatedKeys.has(key)) continue;

    const supplemental = effectTierToSupplementalMod(row);
    if (!supplemental) continue;

    if (seenSlugs.has(supplemental.slug)) {
      supplemental.slug = `${supplemental.slug}-${supplemental.starRank}`;
    }
    if (seenSlugs.has(supplemental.slug)) continue;

    curatedKeys.add(key);
    seenSlugs.add(supplemental.slug);
    out.push(supplemental);
  }

  return out;
}
