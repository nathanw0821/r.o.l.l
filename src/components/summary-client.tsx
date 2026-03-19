"use client";

import * as React from "react";
import ExcelJS from "exceljs";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/filter-context";
import { useProgressHistory } from "@/components/progress-history-provider";
import { useLocalProgress } from "@/components/use-local-progress";
import { applyFilters, collectOriginOptions, type SelectionSource } from "@/lib/filter-utils";
import { shapeExportRows } from "@/lib/export-utils";
import { subscribeProgressChange } from "@/lib/progress-events";
import { formatTierStarsWithLabel } from "@/lib/tier-format";

export type SummaryRow = {
  id: string;
  effect: { name: string };
  tier?: { label?: string } | null;
  unlocked: boolean;
  selectionSource?: SelectionSource;
  notes?: string | null;
  origins?: string[];
  categories: { category: { name: string } }[];
  description?: string | null;
  extraComponent?: string | null;
};

const tierOrder = ["1 Star", "2 Star", "3 Star", "4 Star"] as const;

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
  summary
}: {
  rows: SummaryRow[];
  summary: { total: number; unlocked: number; percent: number };
}) {
  const { data: session } = useSession();
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
  const { map: localProgress } = useLocalProgress(!session);
  const { commitEntries } = useProgressHistory();
  const [exportMode, setExportMode] = React.useState<"filtered" | "all">("filtered");

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
            selectionSource: entry.selectionSource ?? row.selectionSource
          };
        })
      );
    });
  }, []);

  const displayRows = React.useMemo<SummaryRow[]>(() => {
    if (session) return localRows;
    return localRows;
  }, [localRows, session]);

  React.useEffect(() => {
    setOriginOptions(collectOriginOptions(displayRows));
  }, [displayRows, setOriginOptions]);

  const filteredRows = React.useMemo<SummaryRow[]>(
    () =>
      applyFilters(displayRows, {
        query,
        sources: sourceFilters,
        status: statusFilters,
        origins: originFilters,
        categories: categoryFilters
      }),
    [displayRows, query, sourceFilters, statusFilters, originFilters, categoryFilters]
  );

  const displaySummary = React.useMemo(() => {
    const total = displayRows.length;
    const unlocked = displayRows.filter((row) => row.unlocked).length;
    const percent = total === 0 ? summary.percent : Math.round((unlocked / total) * 100);
    return { total, unlocked, percent };
  }, [displayRows, summary.percent]);

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

  async function handleExport(kind: "xlsx" | "csv" | "json") {
    const exportRows = exportMode === "filtered" ? filteredRows : displayRows;
    const stamp = new Date().toISOString().slice(0, 10);
    if (kind === "xlsx") await exportXlsx(exportRows, `roll-export-${stamp}.xlsx`);
    if (kind === "csv") exportCsv(exportRows, `roll-export-${stamp}.csv`);
    if (kind === "json") exportJson(exportRows, `roll-export-${stamp}.json`);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Track legendary crafting unlocks across tiers with a compact, high-signal view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Total Effects</div>
              <div className="text-2xl font-semibold">{displaySummary.total}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Unlocked</div>
              <div className="text-2xl font-semibold">{displaySummary.unlocked}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Completion</div>
              <div className="text-2xl font-semibold">{displaySummary.percent}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:text-left text-center">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Export Data</div>
            <div className="text-xs text-foreground/60">Includes tier, effect, status, source, notes, and origins.</div>
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
              <div className="text-sm font-semibold" title={tierDisplay.label}>
                {tierDisplay.stars || tierLabel}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => toggleRow(row)}
                    disabled={pendingId === row.id}
                    aria-pressed={row.unlocked}
                    data-status={row.unlocked ? "unlocked" : "locked"}
                    className={cn(
                      "summary-status-card rounded-[var(--radius)] border text-left transition",
                      "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      pendingId === row.id && "opacity-60"
                    )}
                  >
                    <div>
                      <div className="text-sm font-semibold">{row.effect.name}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                        {pendingId === row.id ? "Saving..." : row.unlocked ? "Unlocked" : "Locked"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
