import type { MergedEffectTierRow } from "@/lib/data";

export type TrackerUnlock = "unlocked" | "locked" | "unknown";

/** Match builder mod names to tracker `Effect.name` (case / spacing / apostrophe tolerant). */
export function normalizeLegendaryMatchKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[''`]/g, "'");
}

/** First digit group in tier label → star rank (e.g. "1 Star", "4★"). */
export function tierStarRankFromTierLabel(label: string | null | undefined): number | null {
  if (!label) return null;
  const m = label.match(/(\d+)/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return n >= 1 && n <= 5 ? n : null;
}

/**
 * Map each `LegendaryMod` id to tracker unlock state using the merged catalog (`getAllEffectTiers`).
 * `unknown` = no matching effect tier row for this name + star rank in the active dataset.
 */
export function computeLegendaryTrackerUnlockByModId(
  mods: { id: string; name: string; starRank: number }[],
  mergedTiers: MergedEffectTierRow[]
): Record<string, TrackerUnlock> {
  const indexed = mergedTiers.map((row) => ({
    id: row.id,
    unlocked: row.unlocked,
    key: normalizeLegendaryMatchKey(row.effect.name),
    star: tierStarRankFromTierLabel(row.tier?.label)
  }));

  const out: Record<string, TrackerUnlock> = {};
  for (const mod of mods) {
    const key = normalizeLegendaryMatchKey(mod.name);
    const candidates = indexed.filter((r) => r.key === key && r.star === mod.starRank);
    if (candidates.length === 0) {
      out[mod.id] = "unknown";
      continue;
    }
    out[mod.id] = candidates.some((c) => c.unlocked) ? "unlocked" : "locked";
  }
  return out;
}
