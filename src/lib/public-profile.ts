import { prisma } from "@/lib/prisma";
import { getActiveDatasetVersion, effectTierCatalogSelect } from "@/lib/data";

/**
 * Fetches a public profile (Crafting Resume) by username.
 * Aggregates verified learned mods across imported baselines & progress overrides.
 */
export async function getPublicCraftingResume(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      createdAt: true
    }
  });

  if (!user) return null;

  const activeDataset = await getActiveDatasetVersion();
  if (!activeDataset) return null;

  const catalog = await prisma.effectTier.findMany({
    where: { datasetVersionId: activeDataset.id },
    select: effectTierCatalogSelect,
    orderBy: [{ tierId: "asc" }, { effect: { name: "asc" } }]
  });

  const [baselines, userProgress] = await Promise.all([
    prisma.userImportBaseline.findMany({
      where: { userId: user.id, datasetVersionId: activeDataset.id, unlocked: true },
      select: { effectTierId: true }
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id, effectTier: { datasetVersionId: activeDataset.id } },
      select: { effectTierId: true, unlocked: true }
    })
  ]);

  const unlockedSet = new Set<string>();
  for (const b of baselines) {
    unlockedSet.add(b.effectTierId);
  }
  for (const p of userProgress) {
    if (p.unlocked) {
      unlockedSet.add(p.effectTierId);
    } else {
      unlockedSet.delete(p.effectTierId);
    }
  }

  const learnedMods = catalog.filter((item) => unlockedSet.has(item.id));

  return {
    user: {
      username: user.username,
      displayName: user.name || user.username
    },
    stats: {
      total: catalog.length,
      unlocked: learnedMods.length,
      percent: catalog.length > 0 ? Math.round((learnedMods.length / catalog.length) * 100) : 0
    },
    learnedMods
  };
}
