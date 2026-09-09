import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BUILDER_MODS_CACHE_TAG, ROLL_CATALOG_CACHE_TAG } from "@/lib/cache-tags";
import { getActiveDatasetVersion, effectTierCatalogSelect, type EffectTierCatalogRow } from "@/lib/data";
import {
  mergeLegendaryModsWithEffectTiers,
  modCatalogSelect,
  type BuilderLegendaryCatalogRow
} from "@/lib/builder/merge-legendary-effect-catalog";

export type BuilderModCatalogRow = BuilderLegendaryCatalogRow;

import { EXTENDED_LEGENDARY_MOD_SEEDS } from "@/lib/builder/legendary-mod-catalog-seeds";

import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";

function getFallbackEffectTierRows(): EffectTierCatalogRow[] {
  return FALLBACK_LEGENDARY_EFFECTS.map((r) => ({
    id: r.id,
    description: r.description,
    extraComponent: r.extraComponent,
    legendaryModules: r.legendaryModules,
    notes: r.notes,
    effect: { name: r.effect.name },
    tier: { label: r.tier.label },
    categories:
      r.categoriesRel && r.categoriesRel.length > 0
        ? r.categoriesRel
        : typeof r.categories === "string"
          ? r.categories.split("•").map((name) => ({ category: { name: name.trim() } }))
          : []
  }));
}

function getStaticFallbackModCatalog(): BuilderModCatalogRow[] {
  const seedRows: BuilderModCatalogRow[] = EXTENDED_LEGENDARY_MOD_SEEDS.map((r) => ({
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
    ghoulSpecialCap: r.ghoulSpecialCap
  }));

  const fallbackTiers = getFallbackEffectTierRows();
  const merged = mergeLegendaryModsWithEffectTiers(seedRows, fallbackTiers);
  merged.sort((a, b) => a.starRank - b.starRank || a.name.localeCompare(b.name));
  return merged;
}

async function loadBuilderModCatalogUncached() {
  try {
    const [dataset, legendary] = await Promise.all([
      getActiveDatasetVersion().catch(() => null),
      prisma.legendaryMod.findMany({
        select: modCatalogSelect,
        orderBy: [{ starRank: "asc" }, { name: "asc" }]
      }).catch(() => [])
    ]);

    const validSeedSlugs = new Set(EXTENDED_LEGENDARY_MOD_SEEDS.map((s) => s.slug));
    const cleanLegendary = legendary.filter((m) => {
      if (!validSeedSlugs.has(m.slug)) return false;
      const desc = (m.description || "").toLowerCase();
      const name = (m.name || "").toLowerCase();
      if (desc.includes("placeholder") || desc.includes("demo")) return false;
      if (name.startsWith("+") || name.includes("echo") || name.includes("demo")) return false;
      return true;
    });

    const seedMap = new Map(
      EXTENDED_LEGENDARY_MOD_SEEDS.map((r) => [
        r.slug,
        {
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
          ghoulSpecialCap: r.ghoulSpecialCap
        } as BuilderModCatalogRow
      ])
    );

    for (const row of cleanLegendary) {
      seedMap.set(row.slug, row);
    }

    const baseLegendary: BuilderModCatalogRow[] = Array.from(seedMap.values());

    let effectTiers: EffectTierCatalogRow[] = [];
    if (dataset?.id) {
      effectTiers = await prisma.effectTier
        .findMany({
          where: { datasetVersionId: dataset.id },
          select: effectTierCatalogSelect
        })
        .catch(() => []);
    }

    if (effectTiers.length === 0) {
      effectTiers = getFallbackEffectTierRows();
    }

    const merged = mergeLegendaryModsWithEffectTiers(baseLegendary, effectTiers);
    merged.sort((a, b) => a.starRank - b.starRank || a.name.localeCompare(b.name));
    return merged.length > 0 ? merged : getStaticFallbackModCatalog();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[loadBuilderModCatalogUncached]", error);
    }
    return getStaticFallbackModCatalog();
  }
}

export { getStaticFallbackModCatalog, loadBuilderModCatalogUncached };

/** Keeps `/api/builder/mods` off Neon except on cold cache; merges live effect tiers like site category filters. */
export async function getCachedBuilderModCatalog() {
  if (process.env.NODE_ENV === "test" || !process.env.NEXT_RUNTIME) {
    return loadBuilderModCatalogUncached();
  }
  try {
    const loader = unstable_cache(loadBuilderModCatalogUncached, ["builder-mod-catalog", "v6-patch69-canonical"], {
      revalidate: 3600,
      tags: [BUILDER_MODS_CACHE_TAG, ROLL_CATALOG_CACHE_TAG]
    });
    return await loader();
  } catch {
    return loadBuilderModCatalogUncached();
  }
}
