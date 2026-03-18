import { prisma } from "@/lib/prisma";

export async function getActiveDatasetVersion() {
  return prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });
}

export async function getEffectTiersByTierLabel(tierLabel: string, userId?: string) {
  const dataset = await getActiveDatasetVersion();
  if (!dataset) return [];

  const tier = await prisma.tier.findUnique({ where: { label: tierLabel } });
  if (!tier) return [];

  const effectTiers = await prisma.effectTier.findMany({
    where: {
      datasetVersionId: dataset.id,
      tierId: tier.id
    },
    include: {
      effect: true,
      tier: true,
      categories: { include: { category: true } },
      progress: userId ? { where: { userId } } : false
    },
    orderBy: { effect: { name: "asc" } }
  });

  return effectTiers.map((item) => ({
    ...item,
    unlocked: userId ? item.progress[0]?.unlocked ?? false : false
  }));
}

export async function getAllEffectTiers(userId?: string) {
  const dataset = await getActiveDatasetVersion();
  if (!dataset) return [];

  const effectTiers = await prisma.effectTier.findMany({
    where: { datasetVersionId: dataset.id },
    include: {
      effect: true,
      tier: true,
      categories: { include: { category: true } },
      progress: userId ? { where: { userId } } : false
    },
    orderBy: [{ tierId: "asc" }, { effect: { name: "asc" } }]
  });

  return effectTiers.map((item) => ({
    ...item,
    unlocked: userId ? item.progress[0]?.unlocked ?? false : false
  }));
}

export async function getStillNeed(userId?: string) {
  const all = await getAllEffectTiers(userId);
  return all.filter((row) => !row.unlocked);
}

export async function getProgressSummary(userId?: string) {
  const dataset = await getActiveDatasetVersion();
  if (!dataset) {
    return {
      total: 0,
      unlocked: 0,
      percent: 0
    };
  }

  const total = await prisma.effectTier.count({
    where: { datasetVersionId: dataset.id }
  });

  if (!userId) {
    return { total, unlocked: 0, percent: 0 };
  }

  const unlocked = await prisma.userProgress.count({
    where: {
      userId,
      unlocked: true,
      effectTier: { datasetVersionId: dataset.id }
    }
  });

  const percent = total === 0 ? 0 : Math.round((unlocked / total) * 100);

  return { total, unlocked, percent };
}
