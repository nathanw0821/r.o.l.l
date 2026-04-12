import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BUILDER_MODS_CACHE_TAG } from "@/lib/cache-tags";

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

async function loadBuilderModCatalogUncached() {
  try {
    return await prisma.legendaryMod.findMany({
      select: modCatalogSelect,
      orderBy: [{ starRank: "asc" }, { name: "asc" }]
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[loadBuilderModCatalogUncached]", error);
    }
    return [];
  }
}

export type BuilderModCatalogRow = Prisma.LegendaryModGetPayload<{ select: typeof modCatalogSelect }>;

/** Keeps `/api/builder/mods` off Neon except on cold cache (same idea as `roll-catalog`). */
export function getCachedBuilderModCatalog() {
  const loader = unstable_cache(loadBuilderModCatalogUncached, ["builder-mod-catalog", "v3-extended-legendaries"], {
    revalidate: 3600,
    tags: [BUILDER_MODS_CACHE_TAG]
  });
  return loader();
}
