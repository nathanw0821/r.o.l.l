"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, Boxes, Target, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/filter-context";
import { useProgressHistory } from "@/components/progress-history-provider";
import { useLocalProgress } from "@/components/use-local-progress";
import { applyFilters, collectOriginOptions, type SelectionSource } from "@/lib/filter-utils";
import { shapeExportRows } from "@/lib/export-utils";
import { subscribeProgressChange, emitProgressChange } from "@/lib/progress-events";
import { formatTierStarsWithLabel } from "@/lib/tier-format";
import { updateProgress } from "@/actions/progress";
import { BuilderBetaGate, useBuilderBetaAccess } from "@/components/builder/builder-beta-gate";

export type SummaryRow = {
  id: string;
  effect: { name: string };
  tier?: { label?: string } | null;
  unlocked: boolean;
  isSeeking: boolean;
  modCount: number;
  unlockedBy: string[];
  selectionSource?: SelectionSource;
  notes?: string | null;
  origins?: string[];
  categories: { category: { name: string } }[];
  description?: string | null;
  extraComponent?: string | null;
};

const tierOrder = ["1 Star", "2 Star", "3 Star", "4 Star"] as const;
const SUMMARY_LOCK_KEY = "roll.summary.locked";
const MOBILE_SIDEBAR_SUPPRESS_KEY = "roll.mobile.sidebar.suppress";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function exportXlsx(rows: SummaryRow[], filename: string) {
  const ExcelJS = (await import("exceljs")).default;
  const data = shapeExportRows(rows);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Effects");
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  if (headers.length > 0) {
    worksheet.columns = headers.map((header) => ({ header, key: header }));
    worksheet.addRows(data);
  }
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    filename
  );
}

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  if (raw.includes("\"") || raw.includes(",") || raw.includes("\n")) {
    return `"${raw.replace(/\"/g, "\"\"")}"`;
  }
  return raw;
}

function exportCsv(rows: SummaryRow[], filename: string) {
  const data = shapeExportRows(rows);
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const lines = [headers.join(",")];
  for (const row of data) {
    const values = headers.map((header) => escapeCsvValue((row as Record<string, unknown>)[header]));
    lines.push(values.join(","));
  }
  const csv = lines.join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

function exportJson(rows: SummaryRow[], filename: string) {
  const data = shapeExportRows(rows);
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}


export default function SummaryClient({
  rows,
  isSignedIn,
  isAdmin = false,
  initialTab = "summary"
}: {
  rows: SummaryRow[];
  isSignedIn: boolean;
  isAdmin?: boolean;
  initialTab?: "summary" | "seeking" | "owned" | "still-need";
}) {
  const router = useRouter();
  const {
    query,
    sourceFilters,
    statusFilters,
    originFilters,
    categoryFilters,
    setOriginOptions,
    toggleStatus
  } = useFilters();
  const [localRows, setLocalRows] = React.useState(rows);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const { map: localProgress } = useLocalProgress(!isSignedIn);
  const { commitEntries } = useProgressHistory();
  const [exportMode, setExportMode] = React.useState<"filtered" | "all">("filtered");
  const [summaryLocked, setSummaryLocked] = React.useState(false);
  const longPressTimeoutRef = React.useRef<number | null>(null);
  const longPressTriggeredRef = React.useRef(false);
  const { hasAccess: hasBuilderAccess, accept: acceptBuilderBeta } = useBuilderBetaAccess(isAdmin);
  const [showBetaGate, setShowBetaGate] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"summary" | "seeking" | "owned" | "still-need">(initialTab);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(SUMMARY_LOCK_KEY);
    setSummaryLocked(stored === "1");
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(SUMMARY_LOCK_KEY, summaryLocked ? "1" : "0");
  }, [summaryLocked]);

  React.useEffect(() => {
    const merged = rows.map((row) => {
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
            isSeeking: entry.isSeeking ?? row.isSeeking,
            modCount: entry.modCount ?? row.modCount,
            selectionSource: entry.selectionSource ?? row.selectionSource
          };
        })
      );
    });
  }, []);

  const displayRows = localRows;

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOriginOptions(collectOriginOptions(displayRows));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [displayRows, setOriginOptions]);

  const filteredRows = React.useMemo<SummaryRow[]>(
    () => {
      let base = displayRows;
      if (activeTab === "seeking") {
        base = base.filter((row) => row.isSeeking);
      } else if (activeTab === "owned") {
        base = base.filter((row) => row.modCount > 0);
      } else if (activeTab === "still-need") {
        base = base.filter((row) => !row.unlocked);
      }
      
      return applyFilters(base, {
        query,
        sources: sourceFilters,
        status: statusFilters,
        origins: originFilters,
        categories: categoryFilters
      });
    },
    [displayRows, query, sourceFilters, statusFilters, originFilters, categoryFilters, activeTab]
  );

  async function updateSeeking(row: SummaryRow, nextSeeking: boolean) {
    setLocalRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, isSeeking: nextSeeking }
          : item
      )
    );
    await updateProgress({ effectTierId: row.id, unlocked: row.unlocked, isSeeking: nextSeeking });
    emitProgressChange([{ effectTierId: row.id, unlocked: row.unlocked, isSeeking: nextSeeking }]);
  }

  async function updateCount(row: SummaryRow, nextCount: number) {
    const clamped = Math.max(0, nextCount);
    setLocalRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, modCount: clamped }
          : item
      )
    );
    await updateProgress({ effectTierId: row.id, unlocked: row.unlocked, modCount: clamped });
    emitProgressChange([{ effectTierId: row.id, unlocked: row.unlocked, modCount: clamped }]);
  }

  async function toggleRow(row: SummaryRow) {
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

  async function handleExport(kind: "xlsx" | "csv" | "json") {
    const exportRows = exportMode === "filtered" ? filteredRows : displayRows;
    const stamp = new Date().toISOString().slice(0, 10);
    if (kind === "xlsx") await exportXlsx(exportRows, `roll-export-${stamp}.xlsx`);
    if (kind === "csv") exportCsv(exportRows, `roll-export-${stamp}.csv`);
    if (kind === "json") exportJson(exportRows, `roll-export-${stamp}.json`);
  }

  function navigateToAllEffects(row: SummaryRow) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(MOBILE_SIDEBAR_SUPPRESS_KEY, "1");
    }
    router.push(`/all-effects?focus=${encodeURIComponent(row.id)}#effect-${encodeURIComponent(row.id)}`);
  }

  function clearLongPressTimer() {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }

  function handlePointerDown(row: SummaryRow) {
    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimeoutRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      navigateToAllEffects(row);
    }, 420);
  }

  function handlePointerUp() {
    clearLongPressTimer();
  }

  function handlePointerCancel() {
    clearLongPressTimer();
  }

  async function handleSummaryRowClick(row: SummaryRow) {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    if (summaryLocked) {
      navigateToAllEffects(row);
      return;
    }
    await toggleRow(row);
  }

  return (
    <div className="space-y-6">
      {!hasBuilderAccess && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-[var(--radius)] border border-accent/30 bg-accent/5 p-6 text-center md:flex-row md:text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-accent md:justify-start">
              <Boxes className="h-5 w-5" />
              <span>B.U.I.L.D. Beta Access</span>
            </div>
            <p className="max-w-xl text-sm text-foreground/70">
              Join the beta for our new Battle Utility & Inventory Logistics Diagnostic tool. 
              Create, simulate, and share custom legendary loadouts.
            </p>
          </div>
          <Button 
            className="shrink-0" 
            onClick={() => setShowBetaGate(true)}
          >
            Join the Beta
          </Button>
        </div>
      )}

      <div className="flex gap-2 rounded-[var(--radius)] border border-border bg-panel p-1">
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex-1 rounded-[calc(var(--radius)-4px)] px-4 py-2 text-sm font-semibold transition",
            activeTab === "summary" ? "bg-accent text-white" : "hover:bg-accent/10"
          )}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("seeking")}
          className={cn(
            "flex-1 rounded-[calc(var(--radius)-4px)] px-4 py-2 text-sm font-semibold transition",
            activeTab === "seeking" ? "bg-accent text-white" : "hover:bg-accent/10"
          )}
        >
          Seeking
        </button>
        <button
          onClick={() => setActiveTab("still-need")}
          className={cn(
            "flex-1 rounded-[calc(var(--radius)-4px)] px-4 py-2 text-sm font-semibold transition",
            activeTab === "still-need" ? "bg-accent text-white" : "hover:bg-accent/10"
          )}
        >
          Still Need
        </button>
        <button
          onClick={() => setActiveTab("owned")}
          className={cn(
            "flex-1 rounded-[calc(var(--radius)-4px)] px-4 py-2 text-sm font-semibold transition",
            activeTab === "owned" ? "bg-accent text-white" : "hover:bg-accent/10"
          )}
        >
          Owned Mods
        </button>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:text-left text-center">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Export Data</div>
            <div className="text-xs text-foreground/60">Includes tier, effect, status, source, notes, and origins.</div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSummaryLocked((value) => !value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                  summaryLocked
                    ? "border-[color:var(--color-warning)] text-[color:var(--color-warning)]"
                    : "border-border text-foreground/70 hover:border-accent"
                )}
              >
                {summaryLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {summaryLocked ? "Summary Locked: Click opens All Effects" : "Summary Unlocked: Click toggles status"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExportMode("filtered")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                exportMode === "filtered"
                  ? "border-accent text-foreground"
                  : "border-border text-foreground/60 hover:border-accent"
              )}
            >
              Filtered
            </button>
            <button
              type="button"
              onClick={() => setExportMode("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                exportMode === "all"
                  ? "border-accent text-foreground"
                  : "border-border text-foreground/60 hover:border-accent"
              )}
            >
              All
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-foreground/60">Status filter:</span>
          {(["unlocked", "locked"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              aria-pressed={statusFilters.includes(status)}
              className={cn(
                "rounded-full border px-2 py-1 text-xs capitalize",
                statusFilters.includes(status)
                  ? "border-accent text-foreground"
                  : "border-border text-foreground/60 hover:border-accent"
              )}
            >
              {statusFilters.includes(status) ? `${status} x` : status}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("xlsx")}>Export Excel</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("csv")}>Export CSV</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("json")}>Export JSON</Button>
        </div>
        <div className="mt-3 text-xs text-foreground/60">
          Update any entry here and the same effect will reflect everywhere else in the tracker.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tierOrder.map((tierLabel) => {
          const items = filteredRows.filter((row) => row.tier?.label === tierLabel);
          if (items.length === 0) return null;
          const tierDisplay = formatTierStarsWithLabel(tierLabel);
          return (
            <div key={tierLabel} className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="flex items-center justify-between text-sm font-semibold mb-3">
                <span title={tierDisplay.label}>{tierDisplay.stars || tierLabel}</span>
                <span className="text-[10px] uppercase tracking-widest text-foreground/40">{items.length} items</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => handleSummaryRowClick(row)}
                    onPointerDown={() => handlePointerDown(row)}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerCancel}
                    onPointerCancel={handlePointerCancel}
                    data-status={row.isSeeking && !row.unlocked ? "seeking" : row.unlocked ? "unlocked" : "locked"}
                    className={cn(
                      "summary-status-card summary-status-card--grid rounded-[var(--radius)] border text-left transition cursor-pointer select-none",
                      "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      pendingId === row.id && "opacity-60"
                    )}
                  >
                    <div>
                      <div className="text-sm font-semibold truncate pr-6">{row.effect.name}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                        {pendingId === row.id
                          ? "Saving..."
                          : summaryLocked
                            ? "Open in All Effects"
                            : row.isSeeking && !row.unlocked
                              ? "Seeking"
                              : row.unlocked
                                ? "Unlocked"
                                : "Locked"}
                      </div>
                      {row.unlockedBy.length > 0 && (
                        <div className="mt-1 text-[9px] text-foreground/40 leading-tight">
                          Unlocked by: {row.unlockedBy.join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="summary-status-card__controls" onClick={(e) => e.stopPropagation()}>
                      <button
                        title={row.isSeeking ? "Remove from Seeking" : "Add to Seeking"}
                        onClick={() => updateSeeking(row, !row.isSeeking)}
                        data-active={row.isSeeking}
                        className="summary-status-card__seeking-btn"
                      >
                        <Target className="h-4 w-4" />
                      </button>
                      <div className="summary-status-card__count">
                        <button
                          onClick={() => updateCount(row, row.modCount - 1)}
                          className="summary-status-card__count-btn"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="min-w-[1.2rem] text-center font-bold">{row.modCount}</span>
                        <button
                          onClick={() => updateCount(row, row.modCount + 1)}
                          className="summary-status-card__count-btn"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-[var(--radius)] border border-dashed border-border bg-panel/30">
          <div className="text-lg font-semibold text-foreground/40">No items found</div>
          <p className="mt-1 text-sm text-foreground/30">Try clearing your filters or adding items to your wishlist.</p>
        </div>
      )}

      <BuilderBetaGate 
        open={showBetaGate} 
        title="Access B.U.I.L.D. Beta"
        description="Battle Utility & Inventory Logistics Diagnostic. Create, simulate, and share custom legendary loadouts. This feature is in active development."
        onAccept={() => {
          acceptBuilderBeta();
          setShowBetaGate(false);
        }}
        onCancel={() => setShowBetaGate(false)}
      />
    </div>
  );
}
