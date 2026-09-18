/** Category card ids used by /wiki; the search API matches articles by the first word of the id. */
export const WIKI_CATEGORY_IDS = [
  "all",
  "Weapons & Mods",
  "Armor & Power Armor",
  "Perks & Mutations",
  "Vendors & Minerva",
  "Events & Expeditions",
  "Build Mechanics & Damage",
  "Crafting & Resources",
] as const;

export type WikiCategoryId = (typeof WIKI_CATEGORY_IDS)[number];

/** Same rule as src/app/api/wiki/search/route.ts: match on the id's first word. */
export function wikiCategoryPrefix(id: string): string {
  return id.toLowerCase().split(" ")[0].split("&")[0].trim();
}

export function computeWikiCategoryCounts(
  articles: ReadonlyArray<{ category?: string | null }>,
  ids: ReadonlyArray<string> = WIKI_CATEGORY_IDS,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of ids) {
    if (id === "all") {
      counts[id] = articles.length;
      continue;
    }
    const prefix = wikiCategoryPrefix(id);
    counts[id] = articles.filter((a) => (a.category || "").toLowerCase().includes(prefix)).length;
  }
  return counts;
}
