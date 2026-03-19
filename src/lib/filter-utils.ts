export type SelectionSource = "default" | "imported" | "edited";

export type FilterState = {
  query: string;
  sources: SelectionSource[];
  status: ("locked" | "unlocked")[];
  origins: string[];
  categories?: string[];
};

export type FilterableRow = {
  effect: { name: string };
  tier?: { label?: string } | null;
  categories: { category: { name: string } }[];
  description?: string | null;
  extraComponent?: string | null;
  notes?: string | null;
  unlocked: boolean;
  selectionSource?: SelectionSource;
  origins?: string[];
};

export function applyFilters<T extends FilterableRow>(rows: T[], state: FilterState) {
  const query = state.query.trim().toLowerCase();
  const sourceSet = new Set(state.sources);
  const statusSet = new Set(state.status);
  const originSet = new Set(state.origins.map((origin) => origin.toLowerCase()));
  const categorySet = new Set((state.categories ?? []).map((category) => normalizeCategory(category)));

  return rows.filter((row) => {
    if (categorySet.size > 0) {
      const rowCategories = row.categories.map((c) => normalizeCategory(c.category.name));
      if (!rowCategories.some((category) => categorySet.has(category))) return false;
    }

    if (query) {
      const categories = row.categories.map((c) => c.category.name).join(" | ");
      const haystack = [
        row.effect.name,
        row.tier?.label ?? "",
        categories,
        row.description ?? "",
        row.extraComponent ?? "",
        row.notes ?? "",
        ...(row.origins ?? [])
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (sourceSet.size > 0) {
      const source = row.selectionSource ?? "default";
      if (!sourceSet.has(source)) return false;
    }

    if (statusSet.size > 0) {
      const statusValue = row.unlocked ? "unlocked" : "locked";
      if (!statusSet.has(statusValue)) return false;
    }

    if (originSet.size > 0) {
      const rowOrigins = (row.origins ?? []).map((origin) => origin.toLowerCase());
      if (!rowOrigins.some((origin) => originSet.has(origin))) return false;
    }

    return true;
  });
}

function normalizeCategory(value: string) {
  return value
    .toLowerCase()
    .replace(/[:/]/g, " ")
    .replace(/[^a-z0-9\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function collectOriginOptions(rows: FilterableRow[]) {
  const set = new Set<string>();
  for (const row of rows) {
    for (const origin of row.origins ?? []) {
      if (origin) set.add(origin);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function toggleSelection<T extends string>(current: T[], value: T) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}
