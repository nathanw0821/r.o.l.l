import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BUILDER_MODS_CACHE_TAG, ROLL_CATALOG_CACHE_TAG } from "@/lib/cache-tags";
import { getActiveDatasetVersion, effectTierCatalogSelect } from "@/lib/data";
import {
  mergeLegendaryModsWithEffectTiers,
  modCatalogSelect,
  type BuilderLegendaryCatalogRow
} from "@/lib/builder/merge-legendary-effect-catalog";

export type BuilderModCatalogRow = BuilderLegendaryCatalogRow;

import { EXTENDED_LEGENDARY_MOD_SEEDS } from "@/lib/builder/legendary-mod-catalog-seeds";

function getStaticFallbackModCatalog(): BuilderModCatalogRow[] {
  return EXTENDED_LEGENDARY_MOD_SEEDS.map((r) => ({
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
}

async function loadBuilderModCatalogUncached() {
  try {
    const [dataset, legendary] = await Promise.all([
      getActiveDatasetVersion(),
      prisma.legendaryMod.findMany({
        select: modCatalogSelect,
        orderBy: [{ starRank: "asc" }, { name: "asc" }]
      })
    ]);

    if (!dataset?.id) {
      return legendary.length > 0 ? legendary : getStaticFallbackModCatalog();
    }

    const effectTiers = await prisma.effectTier.findMany({
      where: { datasetVersionId: dataset.id },
      select: effectTierCatalogSelect
    });

    const merged = mergeLegendaryModsWithEffectTiers(legendary, effectTiers);
    merged.sort((a, b) => a.starRank - b.starRank || a.name.localeCompare(b.name));
    return merged.length > 0 ? merged : getStaticFallbackModCatalog();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[loadBuilderModCatalogUncached]", error);
    }
    return getStaticFallbackModCatalog();
  }
}

/** Keeps `/api/builder/mods` off Neon except on cold cache; merges live effect tiers like site category filters. */
export function getCachedBuilderModCatalog() {
  const loader = unstable_cache(loadBuilderModCatalogUncached, ["builder-mod-catalog", "v4-effect-tier-merge"], {
    revalidate: 3600,
    tags: [BUILDER_MODS_CACHE_TAG, ROLL_CATALOG_CACHE_TAG]
  });
  return loader();
}
