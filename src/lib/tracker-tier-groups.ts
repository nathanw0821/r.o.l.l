/**
 * Tier grouping for the legendary tracker (`src/components/effect-table.tsx`).
 *
 * Pure helpers only: grouping is a stable partition of the already-filtered rows, so the order
 * inside a section is the order the table showed before grouping. Exports (summary page) never
 * go through this module.
 */

export const TRACKER_TIER_ORDER = ["1 Star", "2 Star", "3 Star", "4 Star"] as const;
export type TrackerTierLabel = (typeof TRACKER_TIER_ORDER)[number];

/** Key used for rows with no (or an unknown) tier label, so no row is ever dropped by grouping. */
export const OTHER_TIER_KEY = "other";

/** localStorage key holding the collapsed section keys as a JSON array. */
export const TRACKER_COLLAPSED_STORAGE_KEY = "roll.tracker.collapsedTiers";

type TierRowLike = {
  unlocked: boolean;
  tier?: { label?: string } | null;
};

export type TierGroup<T> = {
  /** "1 Star" … "4 Star", or OTHER_TIER_KEY. */
  key: string;
  /** Sentence-case section title, e.g. "1-star". */
  title: string;
  /** Filtered rows in this tier, in their incoming order. */
  rows: T[];
  /** All rows in this tier (ignores filters). */
  total: number;
  /** Learned rows in this tier (ignores filters). */
  learned: number;
};

function tierKeyOf(row: TierRowLike): string {
  const label = row.tier?.label;
  return label && (TRACKER_TIER_ORDER as readonly string[]).includes(label) ? label : OTHER_TIER_KEY;
}

/** "1 Star" -> "1-star"; anything else -> "Other". */
export function tierSectionTitle(key: string): string {
  const match = /^([1-4]) Star$/.exec(key);
  return match ? `${match[1]}-star` : "Other";
}

/**
 * Groups `filteredRows` by tier, in 1-star..4-star order (then "Other" if any row has no known
 * tier). Totals and learned counts come from `allRows`, so a section header shows the catalog
 * progress even while filters are active. Tiers with no rows in `allRows` are left out.
 */
export function groupRowsByTier<T extends TierRowLike>(filteredRows: T[], allRows: T[]): TierGroup<T>[] {
  const keys = [...TRACKER_TIER_ORDER, OTHER_TIER_KEY] as string[];
  const groups = new Map<string, TierGroup<T>>(
    keys.map((key) => [key, { key, title: tierSectionTitle(key), rows: [], total: 0, learned: 0 }])
  );
  for (const row of allRows) {
    const group = groups.get(tierKeyOf(row))!;
    group.total += 1;
    if (row.unlocked) group.learned += 1;
  }
  for (const row of filteredRows) {
    groups.get(tierKeyOf(row))!.rows.push(row);
  }
  return keys.map((key) => groups.get(key)!).filter((group) => group.total > 0 || group.rows.length > 0);
}

/** Group only in the "All" tier view of a table that actually spans more than one tier. */
export function shouldGroupByTier(allRows: TierRowLike[], selectedTier: string): boolean {
  if (selectedTier !== "ALL") return false;
  return new Set(allRows.map(tierKeyOf)).size > 1;
}

export function formatLearnedOf(learned: number, total: number): string {
  return `${learned} of ${total} learned`;
}

export function formatMatchCount(count: number): string {
  return `${count} ${count === 1 ? "match" : "matches"}`;
}

export function learnedPercent(learned: number, total: number): number {
  return total > 0 ? Math.round((learned / total) * 100) : 0;
}

/** Parses the stored collapsed-section list; anything malformed reads as "nothing collapsed". */
export function parseCollapsedTiers(raw: string | null | undefined): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    const allowed = new Set<string>([...TRACKER_TIER_ORDER, OTHER_TIER_KEY]);
    return new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)));
  } catch {
    return new Set();
  }
}

export function serializeCollapsedTiers(collapsed: Set<string>): string {
  const order = [...TRACKER_TIER_ORDER, OTHER_TIER_KEY] as string[];
  return JSON.stringify(order.filter((key) => collapsed.has(key)));
}
