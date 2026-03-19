import { prisma } from "@/lib/prisma";
import { extractOriginsFromNotes, normalizeDisplayNotes } from "@/lib/import-normalize";
import { applyImportedProfileIfNeeded, getImportedBaselineMap } from "@/lib/profile";

async function ensureProfileApplied(userId?: string) {
  if (!userId) return;
  try {
    await applyImportedProfileIfNeeded(userId);
  } catch (error) {
    // Do not block data reads if profile application fails.
  }
}

type SelectionSource = "default" | "imported" | "edited";

function resolveSelectionSource(params: {
  userId?: string;
  baseline?: boolean;
  progress?: boolean;
}): SelectionSource {
  if (!params.userId) return "default";
  if (params.progress === undefined && params.baseline === undefined) return "default";
  if (params.progress === undefined && params.baseline !== undefined) return "imported";
  if (params.baseline === undefined) return "edited";
  return params.progress === params.baseline ? "imported" : "edited";
}

export async function getActiveDatasetVersion() {
  return prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });
}

export async function getEffectTiersByTierLabel(tierLabel: string, userId?: string) {
  await ensureProfileApplied(userId);
  const dataset = await getActiveDatasetVersion();
  if (!dataset) return [];

  const baselineMap = userId ? await getImportedBaselineMap(dataset.id, userId) : new Map<string, boolean>();
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

  return effectTiers.map((item) => {
    const progress = Array.isArray(item.progress) ? item.progress[0] : undefined;
    const baseline = baselineMap.get(item.id);
    const unlocked = userId ? progress?.unlocked ?? baseline ?? false : false;
    const origins = extractOriginsFromNotes(item.notes);
    return {
      ...item,
      notes: normalizeDisplayNotes(item.notes, origins) ?? undefined,
      origins,
      unlocked,
      selectionSource: resolveSelectionSource({
        userId,
        baseline,
        progress: progress?.unlocked
      })
    };
  });
}

export async function getAllEffectTiers(userId?: string) {
  await ensureProfileApplied(userId);
  const dataset = await getActiveDatasetVersion();
  if (!dataset) return [];

  const baselineMap = userId ? await getImportedBaselineMap(dataset.id, userId) : new Map<string, boolean>();
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

  return effectTiers.map((item) => {
    const progress = Array.isArray(item.progress) ? item.progress[0] : undefined;
    const baseline = baselineMap.get(item.id);
    const unlocked = userId ? progress?.unlocked ?? baseline ?? false : false;
    const origins = extractOriginsFromNotes(item.notes);
    return {
      ...item,
      notes: normalizeDisplayNotes(item.notes, origins) ?? undefined,
      origins,
      unlocked,
      selectionSource: resolveSelectionSource({
        userId,
        baseline,
        progress: progress?.unlocked
      })
    };
  });
}

export async function getStillNeed(userId?: string) {
  await ensureProfileApplied(userId);
  const all = await getAllEffectTiers(userId);
  return all.filter((row) => !row.unlocked);
}

export async function getProgressSummary(userId?: string) {
  await ensureProfileApplied(userId);
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

  const baselineMap = await getImportedBaselineMap(dataset.id, userId);
  const progressRows = await prisma.userProgress.findMany({
    where: { userId, effectTier: { datasetVersionId: dataset.id } },
    select: { effectTierId: true, unlocked: true }
  });

  let unlocked = 0;
  for (const value of baselineMap.values()) {
    if (value) unlocked += 1;
  }

  const baselineById = baselineMap;
  for (const row of progressRows) {
    const baseline = baselineById.get(row.effectTierId);
    if (baseline === undefined) {
      if (row.unlocked) unlocked += 1;
      continue;
    }
    if (baseline === true && row.unlocked === false) unlocked -= 1;
    if (baseline === false && row.unlocked === true) unlocked += 1;
  }

  const percent = total === 0 ? 0 : Math.round((unlocked / total) * 100);

  return { total, unlocked, percent };
}
