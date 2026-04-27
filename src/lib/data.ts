import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { GUEST_PROGRESS_SUMMARY_TAG, ROLL_CATALOG_CACHE_TAG } from "@/lib/cache-tags";
import { extractOriginsFromNotes, normalizeDisplayNotes } from "@/lib/import-normalize";
import { appendLegendaryModSourceNotes } from "@/lib/legendary-mod-sources";
import { applyImportedProfileIfNeeded, getImportedBaselineMap } from "@/lib/profile";
import { getActiveCharacterId } from "@/lib/character";

async function ensureProfileApplied(userId?: string) {
  if (!userId) return;
  try {
    await applyImportedProfileIfNeeded(userId);
  } catch {
    // Do not block data reads if profile application fails.
  }
}

type SelectionSource = "default" | "imported" | "edited";

function resolveSelectionSource(params: {
  characterId?: string;
  baseline?: boolean;
  progress?: boolean;
}): SelectionSource {
  if (!params.characterId) return "default";
  if (params.progress === undefined && params.baseline === undefined) return "default";
  if (params.progress === undefined && params.baseline !== undefined) return "imported";
  if (params.baseline === undefined) return "edited";
  return params.progress === params.baseline ? "imported" : "edited";
}

export const effectTierCatalogSelect = {
  id: true,
  description: true,
  extraComponent: true,
  legendaryModules: true,
  notes: true,
  effect: { select: { name: true } },
  tier: { select: { label: true } },
  categories: { select: { category: { select: { name: true } } } }
} satisfies Prisma.EffectTierSelect;

export type EffectTierCatalogRow = Prisma.EffectTierGetPayload<{ select: typeof effectTierCatalogSelect }>;

export type MergedEffectTierRow = Omit<EffectTierCatalogRow, \"notes\"> & {
  notes: string | null;
  origins: string[];
  unlocked: boolean;
  unlockedBy: string[];
  selectionSource: SelectionSource;
};

function getCatalogEffectTiersCached(datasetVersionId: string) {
  const loader = unstable_cache(
    async () =>
      prisma.effectTier.findMany({
        where: { datasetVersionId },
        select: effectTierCatalogSelect,
        orderBy: [{ tierId: "asc" }, { effect: { name: "asc" } }]
      }),
    ["roll-catalog-effect-tiers", datasetVersionId],
    { tags: [ROLL_CATALOG_CACHE_TAG] }
  );
  return loader();
}

async function fetchUserProgressMap(characterId: string, datasetVersionId: string) {
  const rows = await prisma.userProgress.findMany({
    where: { characterId, effectTier: { datasetVersionId } },
    select: { effectTierId: true, unlocked: true }
  });
  return new Map(rows.map((row) => [row.effectTierId, row.unlocked]));
}

async function fetchGlobalProgressMap(userId: string, datasetVersionId: string) {
  const rows = await prisma.userProgress.findMany({
    where: { userId, effectTier: { datasetVersionId }, unlocked: true },
    select: { effectTierId: true, character: { select: { name: true } } }
  });
  
  const map = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.character) continue;
    const list = map.get(row.effectTierId) || [];
    list.push(row.character.name);
    map.set(row.effectTierId, list);
  }
  return map;
}

function mergeCatalogWithUserState(
  catalog: EffectTierCatalogRow[],
  characterId: string | undefined,
  baselineMap: Map<string, boolean>,
  progressMap: Map<string, boolean>,
  globalProgressMap: Map<string, string[]>
): MergedEffectTierRow[] {
  return catalog.map((item) => {
    const baseline = characterId ? baselineMap.get(item.id) : undefined;
    const hasProgress = characterId ? progressMap.has(item.id) : false;
    const progressUnlocked = hasProgress ? progressMap.get(item.id)! : undefined;
    const unlocked = characterId ? (hasProgress ? progressUnlocked! : baseline ?? false) : false;
    const unlockedBy = globalProgressMap.get(item.id) || [];
    
    const origins = extractOriginsFromNotes(item.notes);
    const displayNotes = normalizeDisplayNotes(item.notes, origins);
    const displayWithSources =
      appendLegendaryModSourceNotes(displayNotes, item.effect.name, item.tier?.label) ?? null;
    return {
      ...item,
      notes: displayWithSources,
      origins,
      unlocked,
      unlockedBy,
      selectionSource: resolveSelectionSource({
        characterId,
        baseline,
        progress: hasProgress ? progressUnlocked : undefined
      })
    };
  });
}

async function loadMergedEffectTiersUncached(userId?: string, tierLabel?: string): Promise<MergedEffectTierRow[]> {
  await ensureProfileApplied(userId);
  const dataset = await getActiveDatasetVersion();
  if (!dataset) return [];

  const tier =
    tierLabel === undefined
      ? null
      : await prisma.tier.findUnique({ where: { label: tierLabel }, select: { id: true, label: true } });

  if (tierLabel !== undefined && !tier) return [];

  const characterId = await getActiveCharacterId(userId);

  const [baselineMap, catalog] = await Promise.all([
    characterId ? getImportedBaselineMap(dataset.id, characterId) : Promise.resolve(new Map<string, boolean>()),
    getCatalogEffectTiersCached(dataset.id)
  ]);

  const scoped =
    tierLabel === undefined || !tier
      ? catalog
      : catalog.filter((row) => row.tier?.label === tier.label);

  const [progressMap, globalProgressMap] = await Promise.all([
    characterId && scoped.length > 0
      ? await fetchUserProgressMap(characterId, dataset.id)
      : Promise.resolve(new Map<string, boolean>()),
    userId
      ? await fetchGlobalProgressMap(userId, dataset.id)
      : Promise.resolve(new Map<string, string[]>())
  ]);

  return mergeCatalogWithUserState(scoped, characterId, baselineMap, progressMap, globalProgressMap);
}

/** One merged catalog load per request per `(userId, tierLabel)` — dedupes e.g. `getStillNeed` + `getTierProgressSummary`. */
const loadMergedEffectTiers = cache(loadMergedEffectTiersUncached);

export async function getGlobalProgressSummary(userId: string) {
  const dataset = await getActiveDatasetVersion();
  if (!dataset) return { total: 0, unlocked: 0, percent: 0 };

  const total = await prisma.effectTier.count({
    where: { datasetVersionId: dataset.id }
  });

  // Unique effect tiers unlocked by ANY character of the user
  const unlockedRows = await prisma.userProgress.findMany({
    where: { userId, effectTier: { datasetVersionId: dataset.id }, unlocked: true },
    distinct: ['effectTierId'],
    select: { effectTierId: true }
  });

  const unlocked = unlockedRows.length;
  const percent = total === 0 ? 0 : Math.round((unlocked / total) * 100);

  return { total, unlocked, percent };
}

export async function getActiveDatasetVersion() {
  return prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });
}

export async function getEffectTiersByTierLabel(tierLabel: string, userId?: string) {
  return loadMergedEffectTiers(userId, tierLabel);
}

export async function getAllEffectTiers(userId?: string) {
  return loadMergedEffectTiers(userId);
}

export async function getStillNeed(userId?: string) {
  const rows = await loadMergedEffectTiers(userId);
  return rows.filter((row) => !row.unlocked);
}

export type TierProgressSummary = {
  tierLabel: string;
  total: number;
  unlocked: number;
  percent: number;
  effectTierIds: string[];
};

export async function getTierProgressSummary(userId?: string) {
  const all = await loadMergedEffectTiers(userId);
  const tierMap = new Map<string, TierProgressSummary>();

  for (const row of all) {
    const tierLabel = row.tier?.label ?? "Unknown";
    const existing = tierMap.get(tierLabel);

    if (existing) {
      existing.total += 1;
      if (row.unlocked) existing.unlocked += 1;
      existing.effectTierIds.push(row.id);
      continue;
    }

    tierMap.set(tierLabel, {
      tierLabel,
      total: 1,
      unlocked: row.unlocked ? 1 : 0,
      percent: 0,
      effectTierIds: [row.id]
    });
  }

  return Array.from(tierMap.values())
    .map((tier) => ({
      ...tier,
      percent: tier.total > 0 ? Math.round((tier.unlocked / tier.total) * 100) : 0
    }))
    .sort((a, b) => {
      const left = Number.parseInt(a.tierLabel, 10);
      const right = Number.parseInt(b.tierLabel, 10);
      if (Number.isNaN(left) && Number.isNaN(right)) return a.tierLabel.localeCompare(b.tierLabel);
      if (Number.isNaN(left)) return 1;
      if (Number.isNaN(right)) return -1;
      return left - right;
    });
}

const getGuestProgressSummaryCached = unstable_cache(
  async (datasetVersionId: string) => {
    const total = await prisma.effectTier.count({
      where: { datasetVersionId }
    });
    return { total, unlocked: 0, percent: 0 };
  },
  ["guest-progress-summary"],
  { revalidate: 300, tags: [GUEST_PROGRESS_SUMMARY_TAG] }
);

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

  if (!userId) {
    return getGuestProgressSummaryCached(dataset.id);
  }

  const characterId = await getActiveCharacterId(userId);
  if (!characterId) {
    return { total: 0, unlocked: 0, percent: 0 };
  }

  const total = await prisma.effectTier.count({
    where: { datasetVersionId: dataset.id }
  });

  const baselineMap = await getImportedBaselineMap(dataset.id, characterId);
  const progressRows = await prisma.userProgress.findMany({
    where: { characterId, effectTier: { datasetVersionId: dataset.id } },
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
