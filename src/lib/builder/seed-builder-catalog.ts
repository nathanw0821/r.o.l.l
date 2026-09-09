import type { Prisma, PrismaClient } from "@prisma/client";
import {
  EXTENDED_LEGENDARY_MOD_SEEDS,
  type BuilderLegendarySeedRow
} from "@/lib/builder/legendary-mod-catalog-seeds";

type SeedMod = {
  slug: string;
  name: string;
  starRank: number;
  category: string;
  subCategory: string | null;
  description: string;
  effectMath: Record<string, number>;
  craftingCost: Record<string, unknown>;
  allowedOnPowerArmor: boolean;
  allowedOnArmor: boolean;
  allowedOnWeapon: boolean;
  fifthStarEligible: boolean;
  ghoulSpecialCap: number | null;
};

function seedRowToMod(r: BuilderLegendarySeedRow): SeedMod {
  const modules = r.starRank === 1 ? 15 : r.starRank === 2 ? 30 : r.starRank === 3 ? 60 : 120;
  return {
    slug: r.slug,
    name: r.name,
    starRank: r.starRank,
    category: r.category,
    subCategory: r.subCategory,
    description: r.description,
    effectMath: r.effectMath ?? {},
    craftingCost: {
      legendaryModules: modules,
      items: [{ name: "Legendary module", count: modules }]
    },
    allowedOnPowerArmor: r.allowedOnPowerArmor,
    allowedOnArmor: r.allowedOnArmor,
    allowedOnWeapon: r.allowedOnWeapon,
    fifthStarEligible: r.fifthStarEligible,
    ghoulSpecialCap: r.ghoulSpecialCap
  };
}

export const SEED_MODS: SeedMod[] = EXTENDED_LEGENDARY_MOD_SEEDS.map(seedRowToMod);

export async function seedBuilderCatalog(prisma: PrismaClient) {
  // Fetch existing effect tiers to get real crafting costs if available
  const dbTiers = await prisma.effectTier.findMany({
    include: { effect: true, tier: true }
  });

  const costLookup = new Map<string, { modules: number; extra: string | null }>();
  for (const et of dbTiers) {
    const key = `${et.effect.name.toLowerCase()}|${et.tier.label.toLowerCase()}`;
    costLookup.set(key, {
      modules: et.legendaryModules ?? 0,
      extra: et.extraComponent || null
    });
  }

  const validSlugs = new Set(SEED_MODS.map((m) => m.slug));

  // Completely purge all obsolete rows from LegendaryMod to guarantee a clean slate
  await prisma.legendaryMod.deleteMany({});

  for (const mod of SEED_MODS) {
    // Try to find real cost from DB tiers
    const starLabel = `${mod.starRank} Star`.toLowerCase();
    const lookupKey = `${mod.name.toLowerCase()}|${starLabel}`;
    const dbCost = costLookup.get(lookupKey);

    let finalModules = mod.starRank === 1 ? 15 : mod.starRank === 2 ? 30 : mod.starRank === 3 ? 60 : 120;
    const finalItems: { name: string; count: number }[] = [];

    if (dbCost) {
      if (dbCost.modules > 0) finalModules = dbCost.modules;
      if (dbCost.extra) {
        // Parse extra component string (e.g. "5 Black Titanium" or "1 Bloodbug Proboscis; 1 Stinging Barb")
        const parts = dbCost.extra.split(";").map(p => p.trim()).filter(Boolean);
        for (const p of parts) {
          const match = p.match(/^(\d+)\s+(.+)$/);
          if (match) {
            finalItems.push({ name: match[2]!, count: parseInt(match[1]!, 10) });
          } else {
            finalItems.push({ name: p, count: 1 });
          }
        }
      }
    }

    const craftingCost = {
      legendaryModules: finalModules,
      items: finalItems.length > 0 ? finalItems : [{ name: "Legendary module", count: finalModules }]
    };

    await prisma.legendaryMod.upsert({
      where: { slug: mod.slug },
      create: {
        slug: mod.slug,
        name: mod.name,
        starRank: mod.starRank,
        category: mod.category,
        subCategory: mod.subCategory,
        description: mod.description,
        effectMath: mod.effectMath as Prisma.InputJsonValue,
        craftingCost: craftingCost as Prisma.InputJsonValue,
        allowedOnPowerArmor: mod.allowedOnPowerArmor,
        allowedOnArmor: mod.allowedOnArmor,
        allowedOnWeapon: mod.allowedOnWeapon,
        infestationOnly: false,
        fifthStarEligible: mod.fifthStarEligible,
        ghoulSpecialCap: mod.ghoulSpecialCap
      },
      update: {
        name: mod.name,
        starRank: mod.starRank,
        category: mod.category,
        subCategory: mod.subCategory,
        description: mod.description,
        effectMath: mod.effectMath as Prisma.InputJsonValue,
        craftingCost: craftingCost as Prisma.InputJsonValue,
        allowedOnPowerArmor: mod.allowedOnPowerArmor,
        allowedOnArmor: mod.allowedOnArmor,
        allowedOnWeapon: mod.allowedOnWeapon,
        infestationOnly: false,
        fifthStarEligible: mod.fifthStarEligible,
        ghoulSpecialCap: mod.ghoulSpecialCap
      }
    });
  }
}
