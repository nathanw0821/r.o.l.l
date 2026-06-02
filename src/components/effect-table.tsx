"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Target, Plus, Minus } from "lucide-react";
import { useFilters } from "@/components/filter-context";
import { useProgressHistory } from "@/components/progress-history-provider";
import ProgressToggle from "@/components/progress-toggle";
import { useLocalProgress } from "@/components/use-local-progress";
import { applyFilters, collectOriginOptions, isNewMod, type SelectionSource } from "@/lib/filter-utils";
import { getCraftComponentKind } from "@/lib/legendary-mod-sources";
import { subscribeProgressChange, emitProgressChange } from "@/lib/progress-events";
import { formatTierStarsWithLabel } from "@/lib/tier-format";
import { updateProgress } from "@/actions/progress";
import { InfoTooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

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

export default function EffectTable({
  rows,
  canEdit,
  focusId = null,
  showChrome = true,
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
  const [isCompactDensity, setIsCompactDensity] = React.useState(false);
  const handledFocusRef = React.useRef<string | null>(null);
  const { query, sourceFilters, statusFilters, originFilters, categoryFilters, setOriginOptions, clearFilters } = useFilters();
  const { map: localProgress, setEntry: setLocalEntry } = useLocalProgress(!canEdit);
  const { commitEntries } = useProgressHistory();

  React.useEffect(() => {
    const merged: EffectTierRow[] = rows.map((row) => {
      const entry = localProgress[row.id];
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

  React.useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      setIsCompactDensity(root.getAttribute("data-density") === "compact");
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-density"] });
    return () => observer.disconnect();
  }, []);

  const filteredRows = React.useMemo(
    () =>
      applyFilters(localRows, {
        query,
        sources: sourceFilters,
        status: statusFilters,
        origins: originFilters,
        categories: categoryFilters
      }),
    [localRows, query, sourceFilters, statusFilters, originFilters, categoryFilters]
  );

  React.useEffect(() => {
    if (!focusId) return;
    if (handledFocusRef.current === focusId) return;

    const existsInDataset = localRows.some((row) => row.id === focusId);
    if (!existsInDataset) return;

    const inFiltered = filteredRows.some((row) => row.id === focusId);
    if (!inFiltered) {
      clearFilters();
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
  }, [focusId, localRows, filteredRows, clearFilters]);

  React.useEffect(() => {
    const updateDensity = () => {
      const isCompact = document.documentElement.getAttribute("data-density") === "compact";
      setIsCompactDensity(isCompact);
    };

    updateDensity();
    const observer = new MutationObserver(updateDensity);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-density"] });
    return () => observer.disconnect();
  }, []);

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
    } else {
      setLocalRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, unlocked: row.unlocked, selectionSource: row.selectionSource }
            : item
        )
      );
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
    if (canEdit) {
      await updateProgress({ effectTierId: row.id, unlocked: row.unlocked, isSeeking: nextSeeking });
    } else {
      setLocalEntry(row.id, { unlocked: row.unlocked, isSeeking: nextSeeking });
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
    if (canEdit) {
      await updateProgress({ effectTierId: row.id, unlocked: row.unlocked, modCount: clamped });
    } else {
      setLocalEntry(row.id, { unlocked: row.unlocked, modCount: clamped });
    }
    emitProgressChange([{ effectTierId: row.id, unlocked: row.unlocked, modCount: clamped }]);
  }

  function renderModules(value?: number | null) {
    if (value === null || value === undefined) return "-";
    return (
      <span className="craft-badge craft-badge--modules">
        {value} modules
      </span>
    );
  }

  function renderComponent(value?: string | null) {
    if (!value) return "-";
    return (
      <span className="craft-badge" data-kind={getCraftComponentKind(value)}>
        {value}
      </span>
    );
  }

  const totalCount = localRows.length;
  const unlockedCount = localRows.filter((row) => row.unlocked).length;
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {title && (
        <Card className="primary-page-header">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {title}
              </h2>
              {description && <p className="text-sm text-foreground/60">{description}</p>}
            </div>
            
            <div className="flex flex-col gap-2 min-w-[200px] md:min-w-[280px]">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground/70">Completion Progress</span>
                <span className="text-accent font-mono">{percent}% ({unlockedCount}/{totalCount})</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40">
                <div 
                  className="h-full bg-accent transition-all duration-500 rounded-full" 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
      {showChrome ? (
        <>
          <div className="text-xs text-foreground/60">
            Use the Command Hub to search and filter results.
          </div>
          {!canEdit ? (
            <div className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
              Changes are saved locally in this browser. Sign in to sync them to your account.
            </div>
          ) : null}
          <div className="effect-table-header hidden text-xs font-semibold uppercase text-foreground/60 md:grid table-grid">
            <div className="flex items-center gap-1.5">Effect <InfoTooltip content="The name of the legendary effect and its tier (1-4 stars)." /></div>
            <div className="flex items-center gap-1.5">Categories <InfoTooltip content="Weapon/Armor categories this effect applies to." /></div>
            <div className="flex items-center gap-1.5">Description <InfoTooltip content="The in-game effect description." /></div>
            <div className="flex items-center gap-1.5">Extra Component <InfoTooltip content="Additional materials required for crafting (e.g., Bobbleheads, Chemicals)." /></div>
            <div className="flex items-center gap-1.5">Modules <InfoTooltip content="The number of Legendary Modules required to craft this mod." /></div>
            <div className="flex items-center gap-1.5">Status <InfoTooltip content="Whether you have unlocked this mod, are seeking it, or how many you own." /></div>
            <div className="flex items-center gap-1.5">Notes <InfoTooltip content="Additional community or development notes." /></div>
          </div>
        </>
      ) : null}
      {!isCompactDensity ? (
      <div className="effect-table-list">
        {filteredRows.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-6 text-sm text-foreground/70">
            No effects match your filters yet.
          </div>
        ) : null}
        {filteredRows.map((row) => {
          const categoryList = row.categories.map((c) => c.category.name).filter(Boolean);
          const isPending = pendingId === row.id;
          const tierDisplay = formatTierStarsWithLabel(row.tier?.label ?? null);
          const sourceLabel =
            row.selectionSource === "imported"
              ? "Imported"
              : row.selectionSource === "edited"
                ? "Edited"
                : "Default";
          return (
            <div
              key={row.id}
              id={`effect-${row.id}`}
              data-effect-id={row.id}
              data-status={row.isSeeking && !row.unlocked ? "seeking" : row.unlocked ? "unlocked" : "locked"}
              className={cn(
                "effect-table-row summary-status-card rounded-[var(--radius)] border",
                "grid items-start gap-3 table-grid"
              )}
            >
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-1.5 flex-wrap min-w-0 w-full">
                  <span className="break-words">{row.effect.name}</span>
                  {isNewMod(row.effect.name) && (
                    <span className="rounded border border-accent/40 bg-accent/30 px-1.5 py-0.5 text-[0.78rem] uppercase tracking-wider text-accent font-black animate-pulse">
                      New
                    </span>
                  )}
                </div>
                {tierDisplay.stars ? (
                  <div className="mt-1 text-lg font-semibold leading-none tracking-[0.16em] text-foreground/70" title={tierDisplay.label}>
                    {tierDisplay.stars}
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 text-sm text-foreground/80">
                {categoryList.length === 0 ? (
                  "-"
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {categoryList.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-border px-2 py-0.5 text-[0.84rem] text-foreground/70"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="min-w-0 text-sm text-foreground/80">{row.description || "-"}</div>
              <div className="min-w-0 text-sm text-foreground/80">{renderComponent(row.extraComponent)}</div>
              <div className="min-w-0 text-sm text-foreground/80 tabular-nums">
                {renderModules(row.legendaryModules)}
              </div>
              <div className="min-w-0">
                <ProgressToggle unlocked={row.unlocked} onToggle={() => toggleRow(row)} disabled={isPending} className="w-full justify-center" />
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="source-pill w-fit" data-source={row.selectionSource ?? "default"}>
                      {sourceLabel}
                    </div>
                    {row.isSeeking && !row.unlocked && (
                      <span className="text-[0.78rem] font-bold text-accent uppercase tracking-wider">Seeking</span>
                    )}
                  </div>
                  {row.unlockedBy.length > 0 && (
                    <div className="text-[0.78rem] text-foreground/50 leading-tight">
                      <span className="font-semibold text-foreground/40 uppercase">By:</span> {row.unlockedBy.join(", ")}
                    </div>
                  )}
                  <div className="summary-status-card__controls summary-status-card__controls--inline mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        title={row.isSeeking ? "Remove from Seeking" : "Add to Seeking"}
                        onClick={() => updateSeeking(row, !row.isSeeking)}
                        data-active={row.isSeeking}
                        className="summary-status-card__seeking-btn h-7 w-7"
                      >
                        <Target className="h-3.5 w-3.5" />
                      </button>
                      <div className="summary-status-card__count h-7 px-1.5">
                        <button
                          onClick={() => updateCount(row, row.modCount - 1)}
                          className="summary-status-card__count-btn h-5 w-5 shrink-0"
                        >
                          <Minus className="h-2 w-2" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={row.modCount === 0 ? "" : row.modCount}
                          onChange={(e) => updateCount(row, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="min-w-[1.5rem] w-6 text-center text-xs font-bold bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => updateCount(row, row.modCount + 1)}
                          className="summary-status-card__count-btn h-5 w-5 shrink-0"
                        >
                          <Plus className="h-2 w-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-w-0 text-sm text-foreground/80 break-words">{row.notes || "-"}</div>
            </div>
          );
        })}
      </div>
      ) : null}
      {isCompactDensity ? (
      <div className="effect-table-tiles">
        {filteredRows.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-6 text-sm text-foreground/70">
            No effects match your filters yet.
          </div>
        ) : null}
        {filteredRows.map((row) => {
          const categoryList = row.categories.map((c) => c.category.name).filter(Boolean);
          const sourceLabel =
            row.selectionSource === "imported"
              ? "Imported"
              : row.selectionSource === "edited"
                ? "Edited"
                : "Default";
          const isPending = pendingId === row.id;
          const tierDisplay = formatTierStarsWithLabel(row.tier?.label ?? null);
          return (
            <button
              key={`tile-${row.id}`}
              id={`effect-${row.id}-tile`}
              data-effect-id={row.id}
              type="button"
              onClick={() => toggleRow(row)}
              disabled={isPending}
              aria-pressed={row.unlocked}
              data-status={row.isSeeking && !row.unlocked ? "seeking" : row.unlocked ? "unlocked" : "locked"}
              className={cn("effect-tile effect-tile--button summary-status-card", isPending && "opacity-60")}
            >
              <div className="effect-tile__header">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold flex items-center gap-1.5 flex-wrap min-w-0 w-full">
                    <span className="break-words">{row.effect.name}</span>
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
                    onClick={() => updateCount(row, row.modCount - 1)}
                    className="summary-status-card__count-btn shrink-0"
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={row.modCount === 0 ? "" : row.modCount}
                    onChange={(e) => updateCount(row, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="min-w-[1.8rem] w-8 text-center font-bold bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => updateCount(row, row.modCount + 1)}
                    className="summary-status-card__count-btn shrink-0"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>
                <button
                  title={row.isSeeking ? "Remove from Seeking" : "Add to Seeking"}
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
              <div className="effect-tile__costs">
                {row.legendaryModules !== null && row.legendaryModules !== undefined ? renderModules(row.legendaryModules) : null}
                {row.extraComponent ? renderComponent(row.extraComponent) : null}
              </div>
              <div className="effect-tile__row">
                <span>Source</span>
                <span>{sourceLabel}</span>
              </div>
              {row.unlockedBy.length > 0 && (
                <div className="effect-tile__row">
                  <span>Unlocked By</span>
                  <span className="truncate">{row.unlockedBy.join(", ")}</span>
                </div>
              )}
              <div className="effect-tile__notes">
                {row.notes || "No notes"}
              </div>
            </button>
          );
        })}
      </div>
      ) : null}
      </div>
    </div>
  );
}
