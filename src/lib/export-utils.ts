export type ExportRow = {
  tier: string;
  effect: string;
  categories: string;
  status: string;
  source: string;
  notes: string;
  origins: string;
};

export function shapeExportRows(rows: {
  effect: { name: string };
  tier?: { label?: string } | null;
  unlocked: boolean;
  selectionSource?: "default" | "imported" | "edited";
  notes?: string | null;
  origins?: string[];
  categories?: { category: { name: string } }[];
}[]): ExportRow[] {
  return rows.map((row) => ({
    tier: row.tier?.label ?? "",
    effect: row.effect.name,
    categories: row.categories?.map((item) => item.category.name).join(" | ") ?? "",
    status: row.unlocked ? "Unlocked" : "Locked",
    source: row.selectionSource ?? "default",
    notes: row.notes ?? "",
    origins: row.origins?.join(" | ") ?? ""
  }));
}
