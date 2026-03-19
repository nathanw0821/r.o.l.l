"use client";

import * as React from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/filter-context";
import { applyFilters, collectOriginOptions, type SelectionSource } from "@/lib/filter-utils";
import { shapeExportRows } from "@/lib/export-utils";

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


export default function SummaryClient({ rows }: { rows: SummaryRow[] }) {
  const {
    query,
    sourceFilters,
    statusFilters,
    originFilters,
    categoryFilters,
    setOriginOptions
  } = useFilters();
  const [exportMode, setExportMode] = React.useState<"filtered" | "all">("filtered");

  React.useEffect(() => {
    setOriginOptions(collectOriginOptions(rows));
  }, [rows, setOriginOptions]);

  const filteredRows = React.useMemo(
    () =>
      applyFilters(rows, {
        query,
        sources: sourceFilters,
        status: statusFilters,
        origins: originFilters,
        categories: categoryFilters
      }),
    [rows, query, sourceFilters, statusFilters, originFilters, categoryFilters]
  );


  async function handleExport(kind: "xlsx" | "csv" | "json") {
    const exportRows = exportMode === "filtered" ? filteredRows : rows;
    const stamp = new Date().toISOString().slice(0, 10);
    if (kind === "xlsx") await exportXlsx(exportRows, `roll-export-${stamp}.xlsx`);
    if (kind === "csv") exportCsv(exportRows, `roll-export-${stamp}.csv`);
    if (kind === "json") exportJson(exportRows, `roll-export-${stamp}.json`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius)] border border-border bg-panel p-4 text-xs text-foreground/60">
        Use the Command Hub to search and filter the summary view.
      </div>

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
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("xlsx")}>Export Excel</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("csv")}>Export CSV</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("json")}>Export JSON</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tierOrder.map((tierLabel) => {
          const items = filteredRows.filter((row) => row.tier?.label === tierLabel);
          if (items.length === 0) return null;
          return (
            <div key={tierLabel} className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-sm font-semibold">{tierLabel}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((row) => (
                  <div
                    key={row.id}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-semibold status-pill"
                    )}
                    data-status={row.unlocked ? "unlocked" : "locked"}
                  >
                    {row.effect.name} | {row.unlocked ? "UNLOCKED" : "LOCKED"}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
