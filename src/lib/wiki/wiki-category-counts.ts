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
  "Patch notes & news",
  "Atomic Shop archive",
] as const;

export type WikiCategoryId = (typeof WIKI_CATEGORY_IDS)[number];

/** Same rule as src/app/api/wiki/search/route.ts: match on the id's first word. */
export function wikiCategoryPrefix(id: string): string {
  return id.toLowerCase().split(" ")[0].split("&")[0].trim();
}

interface CountableArticle {
  category?: string | null;
  archived?: boolean;
  stub?: boolean;
}

/**
 * Counts per category card, plus two extras the page needs:
 *  - `all`: the whole corpus, archive included (what the hero line reports);
 *  - `archived` / `stub`: how many entries carry those flags.
 *
 * Per-category counts EXCLUDE archived entries, because that is what a visitor sees
 * when they click the card with the archive toggle off.
 */
export function computeWikiCategoryCounts(
  articles: ReadonlyArray<CountableArticle>,
  ids: ReadonlyArray<string> = WIKI_CATEGORY_IDS,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of ids) {
    if (id === "all") {
      counts[id] = articles.length;
      continue;
    }
    const prefix = wikiCategoryPrefix(id);
    counts[id] = articles.filter(
      (a) => !a.archived && (a.category || "").toLowerCase().includes(prefix),
    ).length;
  }
  counts.archived = articles.filter((a) => a.archived).length;
  counts.stub = articles.filter((a) => a.stub).length;
  return counts;
}
