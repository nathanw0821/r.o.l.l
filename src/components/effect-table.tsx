"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/filter-context";
import { useProgressHistory } from "@/components/progress-history-provider";
import ProgressToggle from "@/components/progress-toggle";
import { useLocalProgress } from "@/components/use-local-progress";
import { applyFilters, collectOriginOptions, type SelectionSource } from "@/lib/filter-utils";
import { subscribeProgressChange } from "@/lib/progress-events";
import { formatTierStarsWithLabel } from "@/lib/tier-format";

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
  selectionSource?: SelectionSource;
  origins?: string[];
};

export default function EffectTable({
  rows,
  canEdit
}: {
  rows: EffectTierRow[];
  canEdit: boolean;
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [localRows, setLocalRows] = React.useState(rows);
  const { query, sourceFilters, statusFilters, originFilters, categoryFilters, setOriginOptions } = useFilters();
  const { map: localProgress } = useLocalProgress(!canEdit);
  const { commitEntries } = useProgressHistory();

  React.useEffect(() => {
    const merged: EffectTierRow[] = rows.map((row) => {
      const localValue = localProgress[row.id];
      if (localValue === undefined) return row;
      return {
        ...row,
        unlocked: localValue,
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
            selectionSource: entry.selectionSource ?? row.selectionSource
          };
        })
      );
    });
  }, []);

  React.useEffect(() => {
    setOriginOptions(collectOriginOptions(localRows));
  }, [localRows, setOriginOptions]);

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
    if (!saved) {
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

  return (
    <div className="space-y-2">
      <div className="text-xs text-foreground/60">
        Use the Command Hub to search and filter results.
      </div>
      {!canEdit ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
          Changes are saved locally in this browser. Sign in to sync them to your account.
        </div>
      ) : null}
      <div className="hidden text-xs font-semibold uppercase text-foreground/60 md:grid table-grid">
        <div>Effect</div>
        <div>Categories</div>
        <div>Description</div>
        <div>Extra Component</div>
        <div>Modules</div>
        <div>Status</div>
        <div>Notes</div>
      </div>
      <div className="space-y-3 effect-table-list">
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
          const sourceClass =
            row.selectionSource === "imported"
              ? "border-emerald-500/60 text-emerald-200"
              : row.selectionSource === "edited"
                ? "border-sky-500/60 text-sky-200"
                : "border-border text-foreground/60";
          return (
            <div
              key={row.id}
              className={cn(
                "rounded-[var(--radius)] border border-border bg-panel p-4",
                "md:grid md:items-start md:gap-3 table-grid"
              )}
            >
              <div className="min-w-0">
                <div className="font-semibold">{row.effect.name}</div>
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
                        className="rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground/70"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="min-w-0 text-sm text-foreground/80">{row.description || "-"}</div>
              <div className="min-w-0 text-sm text-foreground/80">{row.extraComponent || "-"}</div>
              <div className="min-w-0 text-sm text-foreground/80 tabular-nums">
                {row.legendaryModules ?? "-"}
              </div>
              <div className="min-w-0">
                <ProgressToggle unlocked={row.unlocked} onToggle={() => toggleRow(row)} disabled={isPending} className="w-full justify-center" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px]", sourceClass)}>
                    {sourceLabel}
                  </div>
                </div>
              </div>
              <div className="min-w-0 text-sm text-foreground/80 break-words">{row.notes || "-"}</div>
            </div>
          );
        })}
      </div>
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
            <div key={`tile-${row.id}`} className="effect-tile">
              <div className="effect-tile__header">
                <div>
                  <div className="font-semibold">{row.effect.name}</div>
                  {tierDisplay.stars ? (
                    <div className="mt-1 text-base font-semibold leading-none tracking-[0.14em] text-foreground/65" title={tierDisplay.label}>
                      {tierDisplay.stars}
                    </div>
                  ) : null}
                </div>
                <div className="text-right text-xs text-foreground/60">
                  {row.unlocked ? "Unlocked" : "Locked"}
                </div>
              </div>
              <ProgressToggle unlocked={row.unlocked} onToggle={() => toggleRow(row)} disabled={isPending} className="w-full justify-center" />
              {categoryList.length > 0 ? (
                <div className="effect-tile__chips">
                  {categoryList.slice(0, 4).map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground/70"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="effect-tile__row">
                <span>Modules</span>
                <span className="tabular-nums">{row.legendaryModules ?? "-"}</span>
              </div>
              {row.extraComponent ? (
                <div className="effect-tile__row">
                  <span>Extra</span>
                  <span>{row.extraComponent}</span>
                </div>
              ) : null}
              <div className="effect-tile__row">
                <span>Source</span>
                <span>{sourceLabel}</span>
              </div>
              <div className="effect-tile__notes">
                {row.notes || "No notes"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
