"use client";

import * as React from "react";
import { findLocalProgressEntry } from "@/lib/progress-lookup";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createLinkPlanState, linkifyToNodes } from "@/components/linkified-text";
import { cn } from "@/lib/utils";
import { builderModHref, starFromTierLabel } from "@/lib/links/cross-links";
import { Target, Plus, Minus, Check, Bookmark, Search, Sparkles, ChevronDown } from "lucide-react";
import { useFilters } from "@/components/filter-context";
import { useProgressHistory } from "@/components/progress-history-provider";
import { useLocalProgress } from "@/components/use-local-progress";
import { useThemeSettings } from "@/components/theme-provider";
import { applyFilters, collectOriginOptions, isNewMod, type SelectionSource } from "@/lib/filter-utils";
import { getCraftComponentKind } from "@/lib/legendary-mod-sources";
import { subscribeProgressChange, emitProgressChange } from "@/lib/progress-events";
import { formatTierStarsWithLabel } from "@/lib/tier-format";
import { updateProgress } from "@/actions/progress";
import {
  formatLearnedOf,
  formatMatchCount,
  groupRowsByTier,
  learnedPercent,
  parseCollapsedTiers,
  serializeCollapsedTiers,
  shouldGroupByTier,
  TRACKER_COLLAPSED_STORAGE_KEY,
  type TierGroup
} from "@/lib/tracker-tier-groups";

export type EffectTierRow = {
  id: string;
  effect: { name: string };
  tier: { label?: string } | null;
  categories: { category: { name: string } }[];
  description?: string | null;
  extraComponent?: string | null;
  legendaryModules?: number | null;
  notes?: string | null;
  unlocked: boolean;
  isSeeking: boolean;
  modCount: number;
  unlockedBy: string[];
  selectionSource?: SelectionSource;
  origins?: string[];
};

import { sanitizeTitle } from "@/lib/utils/clean-formatting";

function cleanEffectName(name: string): string {
  return sanitizeTitle(name);
}

/**
 * `linkify` links game terms in the plain-text parts (first occurrence per description, never to
 * `currentPath`). Only used where the surrounding element is not itself clickable.
 */
function renderInlineMarkdown(
  text: string | null | undefined,
  linkify?: { currentPath: string | null }
): React.ReactNode {
  if (!text) return "-";
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;
  const linkState = linkify ? createLinkPlanState() : null;
  const pushPlain = (plain: string) => {
    if (!linkify || !linkState) {
      parts.push(plain);
      return;
    }
    parts.push(
      ...linkifyToNodes(plain, { currentPath: linkify.currentPath, state: linkState, keyPrefix: `lk${keyIdx++}` })
    );
  };
  const pattern = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g;
  let match;
  let lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(text.substring(lastIndex, match.index));
    }
    const matchedStr = match[0];
    if (matchedStr.startsWith("***") && matchedStr.endsWith("***")) {
      parts.push(<strong key={keyIdx++} className="font-bold italic text-amber-300">{matchedStr.slice(3, -3)}</strong>);
    } else if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      parts.push(<strong key={keyIdx++} className="font-bold text-amber-300">{matchedStr.slice(2, -2)}</strong>);
    } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      parts.push(<em key={keyIdx++} className="italic text-emerald-300">{matchedStr.slice(1, -1)}</em>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    pushPlain(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

/**
 * Deep link `?q=<term>` (e.g. /all-effects?q=Severing): puts the term in the search box once the
 * stored filters have been restored, and again whenever the URL's q changes. Typing afterwards is
 * not written back to the URL. Rendered inside its own Suspense boundary so reading search params
 * never forces the surrounding table out of static/streamed rendering.
 */
function TrackerUrlQuerySync({ ready, onQuery }: { ready: boolean; onQuery: (q: string) => void }) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("q")?.trim() ?? "";
  const appliedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!ready || !urlQuery || appliedRef.current === urlQuery) return;
    appliedRef.current = urlQuery;
    onQuery(urlQuery);
  }, [ready, urlQuery, onQuery]);
  return null;
}

function tierBodyId(key: string): string {
  return `tracker-tier-${key.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function EffectTable({
  rows,
  canEdit,
  focusId = null,
  title,
  description
}: {
  rows: EffectTierRow[];
  canEdit: boolean;
  focusId?: string | null;
  showChrome?: boolean;
  title?: string;
  description?: string;
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [localRows, setLocalRows] = React.useState(rows);
  const handledFocusRef = React.useRef<string | null>(null);
  const { query, setQuery, sourceFilters, statusFilters, originFilters, categoryFilters, setOriginOptions, clearFilters, filtersHydrated } = useFilters();
  const pathname = usePathname();
  const { map: localProgress, setEntry: setLocalEntry } = useLocalProgress(true);
  const { commitEntries } = useProgressHistory();
  const { uiMode } = useThemeSettings();

  // Local quick filters for the Tactical Armory toolbar
  const [selectedStarTab, setSelectedStarTab] = React.useState<"ALL" | "1 Star" | "2 Star" | "3 Star" | "4 Star">("ALL");
  const [selectedCategoryTab, setSelectedCategoryTab] = React.useState<"ALL" | "Weapon" | "Armor" | "Power Armor">("ALL");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<"ALL" | "learned" | "seeking" | "locked" | "changed">("ALL");

  React.useEffect(() => {
    const merged: EffectTierRow[] = rows.map((row, index) => {
      const effectName = row.effect?.name || (row as unknown as { effectName?: string }).effectName || "";
      const tierLabel = (row as unknown as { tierLabel?: string; starTier?: string }).tierLabel || (row as unknown as { starTier?: string }).starTier || "";
      const entry = findLocalProgressEntry(localProgress, row.id, effectName, tierLabel, index);

      if (entry === undefined) return row;
      return {
        ...row,
        unlocked: entry.unlocked,
        isSeeking: entry.isSeeking ?? row.isSeeking,
        modCount: entry.modCount ?? row.modCount,
        selectionSource: "edited" as const
      };
    });
    setLocalRows(merged);
  }, [rows, localProgress]);

  React.useEffect(() => {
    return subscribeProgressChange((entries) => {
      if (entries.length === 0) return;
      const entryMap = new Map(entries.map((entry) => [entry.effectTierId, entry]));
      setLocalRows((prev) =>
        prev.map((row) => {
          const entry = entryMap.get(row.id);
          if (!entry) return row;
          return {
            ...row,
            unlocked: entry.unlocked,
            isSeeking: entry.isSeeking ?? row.isSeeking,
            modCount: entry.modCount ?? row.modCount,
            selectionSource: entry.selectionSource ?? row.selectionSource
          };
        })
      );
    });
  }, []);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOriginOptions(collectOriginOptions(localRows));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [localRows, setOriginOptions]);

  const filteredRows = React.useMemo(() => {
    let list = applyFilters(localRows, {
      query,
      sources: sourceFilters,
      status: statusFilters,
      origins: originFilters,
      categories: categoryFilters
    });

    if (selectedStarTab !== "ALL") {
      list = list.filter((r) => r.tier?.label === selectedStarTab);
    }
    if (selectedCategoryTab !== "ALL") {
      list = list.filter((r) => {
        const catStr = Array.isArray(r.categories)
          ? r.categories.map((c: unknown) => (typeof c === "string" ? c : (c as { category?: { name?: string } })?.category?.name || "")).join(" ")
          : String(r.categories || "");
        return catStr.toLowerCase().includes(selectedCategoryTab.toLowerCase());
      });
    }
    if (selectedStatusTab === "learned") {
      list = list.filter((r) => r.unlocked);
    } else if (selectedStatusTab === "seeking") {
      list = list.filter((r) => r.isSeeking && !r.unlocked);
    } else if (selectedStatusTab === "locked") {
      list = list.filter((r) => !r.unlocked && !r.isSeeking);
    } else if (selectedStatusTab === "changed") {
      list = list.filter((r) => isNewMod(r.effect.name));
    }

    return list;
  }, [localRows, query, sourceFilters, statusFilters, originFilters, categoryFilters, selectedStarTab, selectedCategoryTab, selectedStatusTab]);

  // ---- Tier sections (All view of a multi-tier table only; single-tier pages and tier tabs are unchanged) ----
  const groupByTier = shouldGroupByTier(localRows, selectedStarTab);
  const tierGroups = React.useMemo(
    () => (groupByTier ? groupRowsByTier(filteredRows, localRows) : []),
    [groupByTier, filteredRows, localRows]
  );
  const searchActive = query.trim().length > 0;
  const filterActive =
    searchActive ||
    sourceFilters.length > 0 ||
    statusFilters.length > 0 ||
    originFilters.length > 0 ||
    categoryFilters.length > 0 ||
    selectedCategoryTab !== "ALL" ||
    selectedStatusTab !== "ALL";
  const visibleTierGroups = filterActive ? tierGroups.filter((group) => group.rows.length > 0) : tierGroups;

  // Saved collapsed sections (localStorage). Read after mount so server and client markup match.
  const [collapsedTiers, setCollapsedTiers] = React.useState<Set<string>>(() => new Set());
  // Set once the saved state has been read (also marks the controls as interactive for tests).
  const [collapsedLoaded, setCollapsedLoaded] = React.useState(false);
  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(TRACKER_COLLAPSED_STORAGE_KEY);
    } catch {
      stored = null;
    }
    const parsed = parseCollapsedTiers(stored);
    if (parsed.size > 0) setCollapsedTiers(parsed);
    setCollapsedLoaded(true);
  }, []);
  // While a search query is present every section starts expanded; collapsing one then only lasts
  // for that query and never touches the saved state.
  const [searchCollapsed, setSearchCollapsed] = React.useState<{ query: string; keys: Set<string> }>(() => ({
    query: "",
    keys: new Set()
  }));
  const searchCollapsedKeys = searchCollapsed.query === query ? searchCollapsed.keys : null;

  const isTierExpanded = React.useCallback(
    (key: string) => (searchActive ? !(searchCollapsedKeys?.has(key) ?? false) : !collapsedTiers.has(key)),
    [searchActive, searchCollapsedKeys, collapsedTiers]
  );

  const setTierKeysCollapsed = React.useCallback(
    (keys: string[], collapse: boolean) => {
      if (searchActive) {
        const next = new Set(searchCollapsedKeys ?? []);
        keys.forEach((key) => (collapse ? next.add(key) : next.delete(key)));
        setSearchCollapsed({ query, keys: next });
        return;
      }
      const next = new Set(collapsedTiers);
      keys.forEach((key) => (collapse ? next.add(key) : next.delete(key)));
      setCollapsedTiers(next);
      try {
        window.localStorage.setItem(TRACKER_COLLAPSED_STORAGE_KEY, serializeCollapsedTiers(next));
      } catch {
        // Storage blocked (private mode etc.): the state still applies for this visit.
      }
    },
    [searchActive, searchCollapsedKeys, query, collapsedTiers]
  );

  React.useEffect(() => {
    if (!focusId) return;
    if (handledFocusRef.current === focusId) return;

    const existsInDataset = localRows.some((row) => row.id === focusId);
    if (!existsInDataset) return;

    const inFiltered = filteredRows.some((row) => row.id === focusId);
    if (!inFiltered) {
      clearFilters();
      setSelectedStarTab("ALL");
      setSelectedCategoryTab("ALL");
      setSelectedStatusTab("ALL");
    }

    // ?focus= on a row inside a collapsed tier section: open that section first (this effect
    // runs again once it has rendered, then scrolls).
    if (groupByTier) {
      // Wait for the saved collapsed state, or a section could close again after scrolling.
      if (!collapsedLoaded) return;
      const focusGroup = tierGroups.find((group) => group.rows.some((row) => row.id === focusId));
      if (focusGroup && !isTierExpanded(focusGroup.key)) {
        setTierKeysCollapsed([focusGroup.key], false);
        return;
      }
    }

    const raf = window.requestAnimationFrame(() => {
      const safeId = typeof CSS !== "undefined" && "escape" in CSS ? CSS.escape(focusId) : focusId;
      const target = document.querySelector<HTMLElement>(`[data-effect-id="${safeId}"]`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("effect-target-pulse");
      window.setTimeout(() => target.classList.remove("effect-target-pulse"), 1400);
      handledFocusRef.current = focusId;
    });

    return () => window.cancelAnimationFrame(raf);
  }, [focusId, localRows, filteredRows, clearFilters, groupByTier, collapsedLoaded, tierGroups, isTierExpanded, setTierKeysCollapsed]);

  async function toggleRow(row: EffectTierRow) {
    const nextUnlocked = !row.unlocked;
    const previousUnlocked = row.selectionSource === "edited" ? row.unlocked : null;
    setPendingId(row.id);
    setLocalRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, unlocked: nextUnlocked, selectionSource: "edited" as const }
          : item
      )
    );
    setLocalEntry(row.id, { unlocked: nextUnlocked, isSeeking: row.isSeeking, modCount: row.modCount });
    
    const saved = await commitEntries([
      {
        effectTierId: row.id,
        previousUnlocked,
        nextUnlocked,
        previousResolvedUnlocked: row.unlocked,
        nextResolvedUnlocked: nextUnlocked,
        previousSelectionSource: row.selectionSource,
        nextSelectionSource: "edited"
      }
    ]);
    if (saved) {
      emitProgressChange([{ effectTierId: row.id, unlocked: nextUnlocked, selectionSource: "edited" }]);
    }
    setPendingId(null);
  }

  async function updateSeeking(row: EffectTierRow, nextSeeking: boolean) {
    setLocalRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, isSeeking: nextSeeking }
          : item
      )
    );
    setLocalEntry(row.id, { unlocked: row.unlocked, isSeeking: nextSeeking, modCount: row.modCount });
    if (canEdit) {
      await updateProgress({ effectTierId: row.id, unlocked: row.unlocked, isSeeking: nextSeeking }).catch(() => {});
    }
    emitProgressChange([{ effectTierId: row.id, unlocked: row.unlocked, isSeeking: nextSeeking }]);
  }

  async function updateCount(row: EffectTierRow, nextCount: number) {
    const clamped = Math.max(0, nextCount);
    setLocalRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, modCount: clamped }
          : item
      )
    );
    setLocalEntry(row.id, { unlocked: row.unlocked, isSeeking: row.isSeeking, modCount: clamped });
    if (canEdit) {
      await updateProgress({ effectTierId: row.id, unlocked: row.unlocked, modCount: clamped }).catch(() => {});
    }
    emitProgressChange([{ effectTierId: row.id, unlocked: row.unlocked, modCount: clamped }]);
  }

  function renderModules(value?: number | null) {
    if (value === null || value === undefined) return "-";
    return (
      <span className="font-bold text-amber-300">
        {value} mod
      </span>
    );
  }

  function renderComponent(value?: string | null) {
    if (!value) return <span className="text-slate-600">-</span>;
    return (
      <Link
        href={`/wiki?q=${encodeURIComponent(value)}`}
        className="text-slate-300 hover:text-amber-400 transition-colors font-mono inline-flex items-center gap-1 group/comp"
        data-kind={getCraftComponentKind(value)}
        title={`Search ${value} in Truth Wiki Codex`}
      >
        <span className="truncate max-w-[130px]">{value}</span>
        <span className="text-2xs text-amber-400/70 group-hover/comp:text-amber-300">↗</span>
      </Link>
    );
  }

  /** Section header button: title, "N of M learned", a thin progress bar and, while filtering, "N matches". */
  function renderTierToggle(group: TierGroup<EffectTierRow>, expanded: boolean, inTable: boolean) {
    const pct = learnedPercent(group.learned, group.total);
    return (
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={tierBodyId(group.key)}
        onClick={() => setTierKeysCollapsed([group.key], expanded)}
        className="block w-full text-left font-mono hover:bg-[#121a24] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-400"
      >
        <span
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5",
            // Inside the horizontally scrolling table, keep the header text in view on phones.
            inTable && "sticky left-0 w-fit max-w-[calc(100vw-2rem)]"
          )}
        >
          <ChevronDown aria-hidden="true" className={cn("h-4 w-4 shrink-0 text-amber-400", !expanded && "-rotate-90")} />
          <span className="text-sm font-bold text-white">{group.title}</span>
          {/* Separators keep the button's accessible name readable ("4-star, 1 match, 0 of 38 learned"). */}
          <span className="sr-only">, </span>
          {filterActive ? (
            <>
              <span className="text-xs text-amber-300" data-tier-matches>
                {formatMatchCount(group.rows.length)}
              </span>
              <span className="sr-only">, </span>
            </>
          ) : null}
          <span className="text-xs text-slate-300" data-tier-progress>
            {formatLearnedOf(group.learned, group.total)}
          </span>
          <span aria-hidden="true" className="block h-1 w-20 overflow-hidden bg-slate-800">
            <span className="block h-full bg-amber-400" style={{ width: `${pct}%` }} />
          </span>
        </span>
      </button>
    );
  }

  function renderTableRow(row: EffectTierRow, hidden = false) {
    let rawCats: string[] = [];
    if (Array.isArray(row.categories)) {
      rawCats = row.categories.map((c: unknown) => (typeof c === "string" ? c : (c as { category?: { name?: string } })?.category?.name || "")).filter(Boolean);
    } else if (typeof row.categories === "string") {
      rawCats = (row.categories as string).split("•").map((s) => s.trim()).filter(Boolean);
    }
    const categoryList = rawCats.length > 0 ? rawCats : ((row as unknown as { categoriesRel?: { category?: { name?: string } }[] }).categoriesRel?.map((c) => c?.category?.name || "").filter(Boolean) || []);
    const tierDisplay = formatTierStarsWithLabel(row.tier?.label ?? null);
    const isPending = pendingId === row.id;

    return (
      <tr
        key={row.id}
        id={`effect-${row.id}`}
        data-effect-id={row.id}
        hidden={hidden || undefined}
        className={`hover:bg-[#121a24] transition group ${
          row.unlocked ? "bg-emerald-950/15" : row.isSeeking ? "bg-amber-950/15" : ""
        } ${isPending ? "opacity-60" : ""}`}
      >
        {/* Tier */}
        <td className="py-2 px-3 text-center">
          <span className="inline-block font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30 text-2xs">
            {tierDisplay.stars || row.tier?.label?.replace(" Star", "★") || "1★"}
          </span>
        </td>

        {/* Mod Name */}
        <td className="py-2 px-4 font-bold text-white group-hover:text-amber-400 transition">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/wiki?q=${encodeURIComponent(cleanEffectName(row.effect.name))}`}
              className="hover:underline flex min-h-6 items-center gap-1"
              title={`Search ${cleanEffectName(row.effect.name)} in Truth Wiki`}
            >
              <span>{cleanEffectName(row.effect.name)}</span>
              <span className="text-2xs text-amber-400/80 font-mono">↗</span>
            </Link>
            {isNewMod(row.effect.name) && (
              <span className="rounded border border-amber-400/50 bg-amber-400/20 px-1 py-0.2 text-3xs uppercase tracking-wider text-amber-300 font-black animate-pulse">
                New
              </span>
            )}
          </div>
          <Link
            href={builderModHref(row.effect.name, starFromTierLabel(row.tier?.label))}
            data-use-in-builder
            className="mt-0.5 inline-flex min-h-6 items-center font-mono text-3xs font-normal text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-amber-300 hover:decoration-amber-400"
            aria-label={`Use in builder: ${cleanEffectName(row.effect.name)}`}
          >
            Use in builder
          </Link>
        </td>

        {/* Equipment Slot */}
        <td className="py-2 px-3 text-slate-400 text-2xs">
          {categoryList.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {categoryList.map((c) => (
                <span key={c} className="bg-[#111720] border border-slate-800 px-1.5 py-0.5 text-3xs text-slate-300">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            "-"
          )}
        </td>

        {/* Tactical Effect */}
        <td className="py-2 px-4 text-slate-300 font-sans text-xs leading-relaxed">
          {renderInlineMarkdown(row.description, { currentPath: pathname })}
          {row.origins && row.origins.length > 0 && (
            <div className="text-3xs text-dim font-mono mt-1">
              <span className="text-amber-500/70 font-bold">Source: </span>
              {row.origins.join(" • ")}
            </div>
          )}
        </td>

        {/* Modules Cost */}
        <td className="py-2 px-3 text-center">
          {renderModules(row.legendaryModules)}
        </td>

        {/* Craft Catalyst */}
        <td className="py-2 px-4 text-slate-400 text-2xs">
          {renderComponent(row.extraComponent)}
        </td>

        {/* Interactive Tracking Action */}
        <td className="py-2 px-3 text-center">
          <div className="inline-flex items-center gap-1.5 justify-center">
            <button
              onClick={() => toggleRow(row)}
              className={`px-2 py-1 touch:min-h-11 text-3xs font-bold border transition flex items-center gap-1 ${
                row.unlocked
                  ? "bg-emerald-500 text-black border-emerald-400 font-black shadow-sm"
                  : "bg-[#111720] text-slate-400 border-slate-700 hover:text-emerald-300 hover:border-emerald-600"
              }`}
              title={row.unlocked ? "Mark as Locked" : "Mark as Learned"}
            >
              <Check className="w-3 h-3" />
              {row.unlocked ? "Learned" : "Mark learned"}
            </button>

            <button
              onClick={() => updateSeeking(row, !row.isSeeking)}
              className={`px-2 py-1 touch:min-h-11 text-3xs font-bold border transition flex items-center gap-1 ${
                row.isSeeking && !row.unlocked
                  ? "bg-amber-400 text-black border-amber-300 font-black shadow-sm"
                  : "bg-[#111720] text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-600"
              }`}
              title={row.isSeeking ? "Remove from Seeking" : "Add to Wishlist"}
            >
              <Bookmark className="w-3 h-3" />
              {row.isSeeking && !row.unlocked ? "Wanted" : "Mark wanted"}
            </button>

            {/* Mod Inventory Counter */}
            <div className="flex items-center border border-slate-800 bg-[#070a0e] px-1 py-0.5 touch:p-0">
              <button
                type="button"
                data-count-step="down"
                aria-label={`Decrease owned count of ${cleanEffectName(row.effect.name)}`}
                onClick={() => updateCount(row, row.modCount - 1)}
                className="flex h-6 w-6 items-center justify-center text-dim hover:text-white touch:h-11 touch:w-11"
              >
                <Minus className="w-2.5 h-2.5 touch:w-4 touch:h-4" aria-hidden="true" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                aria-label={`Owned count of ${cleanEffectName(row.effect.name)}`}
                value={row.modCount === 0 ? "" : row.modCount}
                onChange={(e) => updateCount(row, parseInt(e.target.value) || 0)}
                placeholder="0"
                className="h-6 w-6 touch:h-11 touch:w-9 text-center text-3xs font-bold bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                data-count-step="up"
                aria-label={`Increase owned count of ${cleanEffectName(row.effect.name)}`}
                onClick={() => updateCount(row, row.modCount + 1)}
                className="flex h-6 w-6 items-center justify-center text-dim hover:text-white touch:h-11 touch:w-11"
              >
                <Plus className="w-2.5 h-2.5 touch:w-4 touch:h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  function renderTile(row: EffectTierRow) {
    const categoryList = row.categories.map((c) => (typeof c === "string" ? c : c.category?.name || "")).filter(Boolean);
    const isPending = pendingId === row.id;
    const tierDisplay = formatTierStarsWithLabel(row.tier?.label ?? null);

    return (
      <div
        key={`tile-${row.id}`}
        id={`effect-${row.id}-tile`}
        data-effect-id={row.id}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleRow(row);
          }
        }}
        onClick={() => toggleRow(row)}
        aria-pressed={row.unlocked}
        data-status={row.isSeeking && !row.unlocked ? "seeking" : row.unlocked ? "unlocked" : "locked"}
        className={cn("effect-tile effect-tile--button summary-status-card cursor-pointer", isPending && "opacity-60 pointer-events-none")}
      >
        <div className="effect-tile__header">
          <div className="min-w-0 flex-1">
            <div className="font-semibold flex items-center gap-1.5 flex-wrap min-w-0 w-full">
              <span className="break-words" style={{ overflowWrap: "anywhere" }}>{cleanEffectName(row.effect.name)}</span>
              {isNewMod(row.effect.name) && (
                <span className="rounded border border-accent/40 bg-accent/30 px-1.5 py-0.5 text-[0.78rem] uppercase tracking-wider text-accent font-black animate-pulse">
                  New
                </span>
              )}
            </div>
            {tierDisplay.stars ? (
              <div className="mt-1 text-base font-semibold leading-none tracking-[0.14em] text-foreground/65" title={tierDisplay.label}>
                {tierDisplay.stars}
              </div>
            ) : null}
          </div>
          <div className="effect-tile__status">
            {isPending ? "Saving..." : row.isSeeking && !row.unlocked ? "Seeking" : row.unlocked ? "Unlocked" : "Locked"}
          </div>
        </div>
        <div className="summary-status-card__controls summary-status-card__controls--inline summary-status-card__controls--tile" onClick={(e) => e.stopPropagation()}>
          <div className="summary-status-card__count">
            <button
              type="button"
              data-count-step="down"
              aria-label={`Decrease owned count of ${cleanEffectName(row.effect.name)}`}
              onClick={() => updateCount(row, row.modCount - 1)}
              className="summary-status-card__count-btn shrink-0"
            >
              <Minus className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              aria-label={`Owned count of ${cleanEffectName(row.effect.name)}`}
              min="0"
              value={row.modCount === 0 ? "" : row.modCount}
              onChange={(e) => updateCount(row, parseInt(e.target.value) || 0)}
              placeholder="0"
              className="min-w-[1.8rem] w-8 text-center font-bold bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              data-count-step="up"
              aria-label={`Increase owned count of ${cleanEffectName(row.effect.name)}`}
              onClick={() => updateCount(row, row.modCount + 1)}
              className="summary-status-card__count-btn shrink-0"
            >
              <Plus className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            title={row.isSeeking ? "Remove from Seeking" : "Add to Seeking"}
            aria-label={row.isSeeking ? `Remove ${cleanEffectName(row.effect.name)} from Seeking` : `Add ${cleanEffectName(row.effect.name)} to Seeking`}
            aria-pressed={row.isSeeking}
            onClick={() => updateSeeking(row, !row.isSeeking)}
            data-active={row.isSeeking}
            className="summary-status-card__seeking-btn"
          >
            <Target className="h-4 w-4" />
          </button>
        </div>
        {categoryList.length > 0 ? (
          <div className="effect-tile__chips">
            {categoryList.slice(0, 4).map((category) => (
              <span
                key={category}
                className="rounded-full border border-border px-2 py-0.5 text-[0.84rem] text-foreground/70"
              >
                {category}
              </span>
            ))}
          </div>
        ) : null}

        {/* Tactical Effect Description */}
        {row.description ? (
          <div className="effect-tile__description text-xs text-slate-300 leading-relaxed font-sans mt-1 p-2 rounded bg-black/40 border border-slate-800/80">
            {renderInlineMarkdown(row.description)}
          </div>
        ) : null}

        {/* Crafting Costs & Catalyst */}
        <div className="effect-tile__costs flex flex-wrap items-center gap-2 mt-1">
          {row.legendaryModules !== null && row.legendaryModules !== undefined ? (
            <span className="inline-flex items-center gap-1 text-2xs font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
              {renderModules(row.legendaryModules)}
            </span>
          ) : null}
          {row.extraComponent ? (
            <span className="inline-flex items-center gap-1 text-2xs font-mono px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-slate-300" onClick={(e) => e.stopPropagation()}>
              <span className="text-dim text-3xs uppercase font-bold">Catalyst:</span>
              {renderComponent(row.extraComponent)}
            </span>
          ) : null}
        </div>

        {/* Origins / Scrapping Source */}
        {row.origins && row.origins.length > 0 ? (
          <div className="effect-tile__origins text-3xs text-slate-400 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-400/80 font-bold uppercase text-3xs">Source:</span>
            <span>{row.origins.join(" • ")}</span>
          </div>
        ) : row.notes ? (
          <div className="effect-tile__notes text-3xs text-slate-400 font-mono mt-1">
            {renderInlineMarkdown(row.notes)}
          </div>
        ) : null}
      </div>
    );
  }

  const totalCount = localRows.length;
  const unlockedCount = localRows.filter((row) => row.unlocked).length;
  const seekingCount = localRows.filter((row) => row.isSeeking && !row.unlocked).length;
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const starTierStats = React.useMemo(() => {
    const tiers = ["1 Star", "2 Star", "3 Star", "4 Star"];
    return tiers
      .map((tierLabel) => {
        const tierRows = localRows.filter((r) => r.tier?.label === tierLabel);
        const total = tierRows.length;
        const unlocked = tierRows.filter((r) => r.unlocked).length;
        const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
        return { tierLabel, total, unlocked, pct };
      })
      .filter((t) => t.total > 0);
  }, [localRows]);

  return (
    <div className="space-y-4">
      <React.Suspense fallback={null}>
        <TrackerUrlQuerySync ready={filtersHydrated} onQuery={setQuery} />
      </React.Suspense>
      {/* =========================================================================
          TACTICAL TELEMETRY PROGRESS HUD (CONCEPT 4)
         ========================================================================= */}
      {title && (
        <div className="bg-[#0c121a] border border-slate-800 p-4 space-y-4 shadow-xl font-mono">
          {/* Header Row: Title & Telemetry */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
            <div>
              <div className="text-3xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Legendary mod effects, live catalog</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                {title}
              </h1>
              {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>

            {/* Quick Stat Counters */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="px-3 py-1.5 bg-[#080d13] border border-slate-800 text-left">
                <div className="text-3xs text-slate-400 font-bold uppercase">Total Mods</div>
                <div className="text-sm font-black text-white">{totalCount}</div>
              </div>
              <div className="px-3 py-1.5 bg-[#080d13] border border-slate-800 text-left">
                <div className="text-3xs text-emerald-400 font-bold uppercase">Learned</div>
                <div className="text-sm font-black text-emerald-400">{unlockedCount}</div>
              </div>
              <div className="px-3 py-1.5 bg-[#080d13] border border-slate-800 text-left">
                <div className="text-3xs text-amber-400 font-bold uppercase">Completion</div>
                <div className="text-sm font-black text-amber-400">{percent}%</div>
              </div>
            </div>
          </div>

          {/* Master Segmented Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-2xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 inline-block" /> Learned ({percent}%)
                {seekingCount > 0 && (
                  <span className="flex items-center gap-1.5 ml-2">
                    <span className="w-2.5 h-2.5 bg-amber-400 inline-block" /> Seeking ({seekingCount})
                  </span>
                )}
                <span className="w-2.5 h-2.5 bg-slate-700 inline-block ml-2" /> Locked ({100 - percent}%)
              </span>
              <span className="text-slate-300 font-bold">{unlockedCount}/{totalCount} Unlocked</span>
            </div>

            <div className="h-2.5 w-full bg-[#070a0e] border border-slate-800 flex overflow-hidden">
              <div 
                className="bg-emerald-500 transition-all duration-300" 
                style={{ width: `${percent}%` }}
                title={`Learned: ${unlockedCount} recipes (${percent}%)`}
              />
              <div 
                className="bg-slate-800 flex-1 transition-all duration-300" 
                title={`Locked: ${totalCount - unlockedCount} recipes`}
              />
            </div>
          </div>

          {/* Tier-by-Tier Interactive Micro-Progress Bars */}
          {starTierStats.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {starTierStats.map((st) => (
                <button
                  key={st.tierLabel}
                  onClick={() => setSelectedStarTab(selectedStarTab === st.tierLabel ? "ALL" : st.tierLabel as typeof selectedStarTab)}
                  className={`p-2 border text-left font-mono transition-all ${
                    selectedStarTab === st.tierLabel
                      ? "bg-amber-500/10 border-amber-400"
                      : "bg-[#090e15] border-slate-800/90 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-amber-400">{st.tierLabel}</span>
                    <span className="text-slate-300 text-2xs font-bold">
                      {st.unlocked}/{st.total} <span className="text-dim">({st.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black border border-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${st.pct}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TACTICAL ARMORY QUICK-FILTER TOOLBAR
         ========================================================================= */}
      <div className="bg-[#0b1017] border border-slate-800 p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search mod name, effect, or catalyst..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#080d13] border border-slate-800 pl-8 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-dim text-3xs uppercase font-bold mr-1">Tier:</span>
          {(["ALL", "1 Star", "2 Star", "3 Star", "4 Star"] as const).map((star) => (
            <button
              key={star}
              onClick={() => setSelectedStarTab(star)}
              className={`px-2 py-1 text-xs font-bold border transition ${
                selectedStarTab === star
                  ? "bg-amber-500 text-black border-amber-400 font-black shadow-sm"
                  : "bg-[#080d13] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {star === "ALL" ? "ALL" : star.replace(" Star", "★")}
            </button>
          ))}
        </div>

        {/* Category Slot Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-dim text-3xs uppercase font-bold mr-1">Slot:</span>
          {(["ALL", "Weapon", "Armor", "Power Armor"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryTab(cat)}
              className={`px-2 py-1 text-xs font-bold border transition ${
                selectedCategoryTab === cat
                  ? "bg-slate-200 text-black border-white font-black shadow-sm"
                  : "bg-[#080d13] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {cat === "Power Armor" ? "PA" : cat}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-dim text-3xs uppercase font-bold mr-1">Status:</span>
          {(["ALL", "learned", "seeking", "locked", "changed"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusTab(st)}
              className={`px-2 py-1 text-xs font-bold border transition ${
                selectedStatusTab === st
                  ? st === "learned" 
                    ? "bg-emerald-500 text-black border-emerald-400 font-black"
                    : st === "seeking"
                      ? "bg-amber-400 text-black border-amber-300 font-black"
                      : "bg-slate-300 text-black border-white font-black"
                  : "bg-[#080d13] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All" : st === "learned" ? "Learned" : st === "seeking" ? "Wanted" : st === "locked" ? "Not learned" : "New this patch"}
            </button>
          ))}
        </div>
      </div>

      {groupByTier && visibleTierGroups.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2 font-mono text-xs"
          data-tier-controls={collapsedLoaded ? "ready" : "loading"}
        >
          <button
            type="button"
            onClick={() => setTierKeysCollapsed(tierGroups.map((group) => group.key), false)}
            disabled={visibleTierGroups.every((group) => isTierExpanded(group.key))}
            className="border border-slate-700 bg-[#0b1017] px-2.5 py-1.5 text-slate-200 hover:border-amber-400 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 disabled:cursor-default disabled:opacity-50 disabled:hover:border-slate-700 disabled:hover:text-slate-200"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setTierKeysCollapsed(tierGroups.map((group) => group.key), true)}
            disabled={visibleTierGroups.every((group) => !isTierExpanded(group.key))}
            className="border border-slate-700 bg-[#0b1017] px-2.5 py-1.5 text-slate-200 hover:border-amber-400 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 disabled:cursor-default disabled:opacity-50 disabled:hover:border-slate-700 disabled:hover:text-slate-200"
          >
            Collapse all
          </button>
        </div>
      ) : null}

      {/* =========================================================================
          TACTICAL ARMORY HIGH-DENSITY TABLE (CONCEPT 4)
         ========================================================================= */}
      {uiMode === "tactical" ? (
        <div className="bg-[#090d12] border border-slate-800 overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#10161f] border-b border-slate-800 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2 px-3 w-12 text-center">Tier</th>
                <th className="py-2 px-4 w-44">Mod Name</th>
                <th className="py-2 px-3 w-36">Equipment Slot</th>
                <th className="py-2 px-4">Tactical Effect & Mechanism</th>
                <th className="py-2 px-3 w-20 text-center">Modules</th>
                <th className="py-2 px-4 w-40">Craft Catalyst</th>
                <th className="py-2 px-3 w-40 text-center">Tracking Action</th>
              </tr>
            </thead>
            {groupByTier ? (
              <>
                {filteredRows.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-dim">
                        No legendary mods match your active search and filter criteria.
                      </td>
                    </tr>
                  </tbody>
                ) : null}
                {visibleTierGroups.map((group) => {
                  const expanded = isTierExpanded(group.key);
                  return (
                    <tbody
                      key={group.key}
                      id={tierBodyId(group.key)}
                      data-tier-group={group.key}
                      className="divide-y divide-slate-800/80 border-t border-slate-700"
                    >
                      <tr className="bg-[#0d131b]">
                        <th colSpan={7} scope="rowgroup" className="p-0 text-left font-normal">
                          {renderTierToggle(group, expanded, true)}
                        </th>
                      </tr>
                      {group.rows.map((row) => renderTableRow(row, !expanded))}
                    </tbody>
                  );
                })}
              </>
            ) : (
              <tbody className="divide-y divide-slate-800/80">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-dim">
                      No legendary mods match your active search and filter criteria.
                    </td>
                  </tr>
                ) : null}
                {filteredRows.map((row) => renderTableRow(row))}
              </tbody>
            )}
          </table>
        </div>
      ) : (
        /* Classic Retro / Tile View */
        groupByTier ? (
          <div className="space-y-4">
            {filteredRows.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-6 text-sm text-foreground/70">
                No effects match your filters yet.
              </div>
            ) : null}
            {visibleTierGroups.map((group) => {
              const expanded = isTierExpanded(group.key);
              return (
                <section key={group.key} data-tier-group={group.key}>
                  <h2 className="border border-slate-800 bg-[#0d131b]">{renderTierToggle(group, expanded, false)}</h2>
                  <div id={tierBodyId(group.key)} hidden={!expanded} className="mt-2">
                    <div className="effect-table-tiles">{group.rows.map((row) => renderTile(row))}</div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="effect-table-tiles">
            {filteredRows.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-6 text-sm text-foreground/70">
                No effects match your filters yet.
              </div>
            ) : null}
            {filteredRows.map((row) => renderTile(row))}
          </div>
        )
      )}

      {/* Tactical Footer Telemetry */}
      <div className="bg-[#0a0e14] border border-slate-800 p-3 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs text-slate-400">
        <div>
          Showing <strong className="text-white">{filteredRows.length}</strong> matching mod formulas • Scrapping 1★–3★ gear yields <strong className="text-emerald-400">1.0% Plan</strong> / <strong className="text-amber-400">1.5% Box Mod</strong>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-dim">R.O.L.L. Tactical Telemetry Engine</span>
        </div>
      </div>
    </div>
  );
}
