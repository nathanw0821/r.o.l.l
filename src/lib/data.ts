import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ACTIVE_DATASET_VERSION_TAG } from "@/lib/cache-tags";
import { getImportedBaselineMap } from "@/lib/profile";

type SelectionSource = "default" | "imported" | "edited";

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

export type MergedEffectTierRow = Omit<EffectTierCatalogRow, "notes"> & {
  notes: string | null;
  origins: string[];
  unlocked: boolean;
  isSeeking: boolean;
  modCount: number;
  unlockedBy: string[];
  selectionSource: SelectionSource;
  tierLabel?: string;
};

async function fetchUserProgressMap(userId: string) {
  const rows = await prisma.userProgress.findMany({
    where: { userId },
    select: { 
      effectTierId: true, 
      unlocked: true,
      isSeeking: true,
      modCount: true,
      effectTier: {
        select: {
          effect: { select: { name: true } },
          tier: { select: { label: true } }
        }
      }
    }
  });
  
  const map = new Map<string, { unlocked: boolean; isSeeking: boolean; modCount: number }>();
  for (const row of rows) {
    const data = {
      unlocked: row.unlocked,
      isSeeking: row.isSeeking,
      modCount: row.modCount
    };
    map.set(row.effectTierId, data);
    
    const effectName = row.effectTier?.effect?.name?.toLowerCase().trim();
    if (effectName) {
      map.set(effectName, data);
      const cleanName = effectName.replace(/[^a-z0-9]/g, "");
      map.set(cleanName, data);
    }
    
    const tierLabel = row.effectTier?.tier?.label || "";
    const starNum = (tierLabel.match(/\d/) || [""])[0];
    if (effectName && starNum) {
      const slugName = effectName.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      map.set(`effect-${starNum}star-${slugName}`, data);
      map.set(`${starNum}star-${slugName}`, data);
    }
  }
  return map;
}

async function fetchGlobalProgressMap(userId: string) {
  const rows = await prisma.userProgress.findMany({
    where: { userId, unlocked: true },
    select: { 
      effectTierId: true, 
      character: { 
        select: { 
          name: true, 
          gameAccount: { select: { name: true } } 
        } 
      } 
    }
  });
  
  const map = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.character) continue;
    const list = map.get(row.effectTierId) || [];
    const accountName = row.character.gameAccount?.name;
    const displayName = accountName 
      ? `${row.character.name} (${accountName})` 
      : row.character.name;
    list.push(displayName);
    map.set(row.effectTierId, list);
  }
  return map;
}

import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";

function normalizeFallbackList(list: typeof FALLBACK_LEGENDARY_EFFECTS): MergedEffectTierRow[] {
  return list.map((item) => {
    const rawCategories = item.categoriesRel || (typeof item.categories === "string"
      ? item.categories.split("•").map((name) => ({ category: { name: name.trim() } }))
      : []);
    return {
      ...item,
      categories: rawCategories,
      notes: item.notes || null,
      origins: item.origins || [],
      unlocked: item.unlocked ?? false,
      isSeeking: item.isSeeking ?? false,
      modCount: item.modCount ?? 0,
      unlockedBy: item.unlockedBy || [],
      selectionSource: item.selectionSource || "default"
    } as unknown as MergedEffectTierRow;
  });
}

async function loadMergedEffectTiersUncached(userId?: string, tierLabel?: string): Promise<MergedEffectTierRow[]> {
  const baseList = tierLabel
    ? FALLBACK_LEGENDARY_EFFECTS.filter((r) => r.tierLabel === tierLabel)
    : FALLBACK_LEGENDARY_EFFECTS;
  const normalized = normalizeFallbackList(baseList);

  if (!userId) return normalized;

  try {
    const [progressMap, globalProgressMap, baselineMap] = await Promise.all([
      fetchUserProgressMap(userId).catch(() => new Map()),
      fetchGlobalProgressMap(userId).catch(() => new Map()),
      getImportedBaselineMap(userId).catch(() => new Map())
    ]);

    return normalized.map((item) => {
      const effectName = item.effect?.name?.toLowerCase().trim() || "";
      const cleanName = effectName.replace(/[^a-z0-9]/g, "");
      const progress = progressMap.get(item.id) || progressMap.get(effectName) || progressMap.get(cleanName);
      const baselineUnlocked = baselineMap.get(item.id) || (effectName ? baselineMap.get(effectName) : undefined) || (cleanName ? baselineMap.get(cleanName) : undefined);
      const unlockedBy = globalProgressMap.get(item.id) || globalProgressMap.get(effectName) || [];
      
      const isUnlocked = progress 
        ? progress.unlocked 
        : (baselineUnlocked ?? item.unlocked);

      return {
        ...item,
        unlocked: Boolean(isUnlocked),
        isSeeking: progress ? progress.isSeeking : item.isSeeking,
        modCount: progress ? progress.modCount : item.modCount,
        unlockedBy
      };
    });
  } catch {
    return normalized;
  }
}

/** One merged catalog load per request per `(userId, tierLabel)` — dedupes e.g. `getStillNeed` + `getTierProgressSummary`. */
const loadMergedEffectTiers = cache(loadMergedEffectTiersUncached);

export async function getGlobalProgressSummary(userId: string) {
  const all = await loadMergedEffectTiers(userId);
  const total = all.length;
  const unlocked = all.filter((r) => r.unlocked).length;
  const percent = total === 0 ? 0 : Math.round((unlocked / total) * 100);
  return { total, unlocked, percent };
}

const getActiveDatasetVersionCached = unstable_cache(
  async () =>
    prisma.datasetVersion.findFirst({
      where: { isActive: true },
      orderBy: { importedAt: "desc" }
    }),
  ["active-dataset-version"],
  { tags: [ACTIVE_DATASET_VERSION_TAG] }
);

export async function getActiveDatasetVersion() {
  return getActiveDatasetVersionCached();
}

export type LightweightProgressRow = {
  id: string;
  tierLabel: string;
  categories: string[];
  unlocked: boolean;
};

export async function getLightweightProgress(userId: string): Promise<LightweightProgressRow[]> {
  const all = await loadMergedEffectTiers(userId);
  return all.map((item) => ({
    id: item.id,
    tierLabel: item.tier?.label ?? item.tierLabel ?? "Unknown",
    categories: Array.isArray(item.categories)
      ? (item.categories as Array<string | { category: { name: string } }>)
          .map((c) => (typeof c === "string" ? c : c.category?.name))
          .filter(Boolean) as string[]
      : [],
    unlocked: Boolean(item.unlocked)
  }));
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

export async function getSeeking(userId?: string) {
  const rows = await loadMergedEffectTiers(userId);
  return rows.filter((row) => row.isSeeking);
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
    const tierLabel = row.tier?.label ?? row.tierLabel ?? "Unknown";
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

  return Array.from(tierMap.values()).map((summary) => ({
    ...summary,
    percent: summary.total === 0 ? 0 : Math.round((summary.unlocked / summary.total) * 100)
  }));
}

export async function getUserProgressSummary(userId?: string) {
  if (!userId) {
    const total = FALLBACK_LEGENDARY_EFFECTS.length;
    return { total, unlocked: 0, percent: 0 };
  }
  return getGlobalProgressSummary(userId);
}

export async function getProgressSummary(userId?: string) {
  if (!userId) {
    const total = FALLBACK_LEGENDARY_EFFECTS.length;
    return { total, unlocked: 0, percent: 0 };
  }
  return getGlobalProgressSummary(userId);
}
