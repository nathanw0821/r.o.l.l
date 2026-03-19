"use client";

import * as React from "react";
import { Lock, LockOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProgress } from "@/actions/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/components/filter-context";
import { applyFilters, collectOriginOptions, type SelectionSource } from "@/lib/filter-utils";

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
  const router = useRouter();

  React.useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

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
    if (!canEdit) return;
    const nextUnlocked = !row.unlocked;
    setPendingId(row.id);
    setLocalRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, unlocked: nextUnlocked, selectionSource: "edited" }
          : item
      )
    );
    try {
      await updateProgress({ effectTierId: row.id, unlocked: nextUnlocked });
      router.refresh();
    } catch (error) {
      setLocalRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, unlocked: row.unlocked, selectionSource: row.selectionSource }
            : item
        )
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-foreground/60">
        Use the Command Hub to search and filter results.
      </div>
      {!canEdit ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
          Public data is visible. Sign in to apply your imported profile and edit unlocks.
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
                {row.tier?.label ? (
                  <div className="text-xs text-foreground/60">{row.tier.label}</div>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleRow(row)}
                  disabled={!canEdit || isPending}
                  data-status={row.unlocked ? "unlocked" : "locked"}
                  className={cn(
                    "w-full justify-center gap-2 text-center status-button",
                    !canEdit && "opacity-70"
                  )}
                >
                  {row.unlocked ? (
                    <>
                      <LockOpen className="h-3 w-3" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" /> Locked
                    </>
                  )}
                </Button>
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
          return (
            <div key={`tile-${row.id}`} className="effect-tile">
              <div className="effect-tile__header">
                <div>
                  <div className="font-semibold">{row.effect.name}</div>
                  {row.tier?.label ? <div className="effect-tile__meta">{row.tier.label}</div> : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleRow(row)}
                  disabled={!canEdit || isPending}
                  data-status={row.unlocked ? "unlocked" : "locked"}
                  className={cn(
                    "gap-1 px-2 py-1 text-xs status-button",
                    !canEdit && "opacity-70"
                  )}
                >
                  {row.unlocked ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {row.unlocked ? "Unlocked" : "Locked"}
                </Button>
              </div>
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
