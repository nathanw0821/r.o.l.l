/**
 * Filtering, ordering and paging behind GET /api/wiki/search. Pure, so it is unit tested
 * (search-wiki-articles.test.ts) and the route stays a thin adapter.
 *
 * Steps 0-5 are the route's original rules, moved here unchanged. Additions:
 *  - `source` (exact source name) and `hideStubs` (drop `stub` entries);
 *  - the second update-keyword rule that /wiki used to apply client-side to the first 100
 *    results (title/content/category must contain the chip's term); applying it here keeps
 *    the same result set now that the page pages through the API instead;
 *  - `offset` for paging; the total before slicing is returned alongside.
 */

interface SearchableArticle {
  id: number | string;
  source: string;
  title: string;
  snippet: string;
  content: string;
  category: string;
  archived?: boolean;
  stub?: boolean;
}

export interface WikiSearchOptions {
  q?: string;
  category?: string;
  sort?: string;
  update?: string;
  includeArchive?: boolean;
  source?: string | null;
  hideStubs?: boolean;
  offset?: number;
  limit?: number;
}

export interface WikiSearchResult<T> {
  total: number;
  items: T[];
}

/** The route's keyword for an update chip id (step 3). */
export function updateKeyword(update: string): string {
  let kw = update.toLowerCase().replace(/-/g, " ");
  if (kw.includes("pitt")) kw = "pitt";
  if (kw.includes("atlantic")) kw = "atlantic";
  if (kw.includes("skyline")) kw = "skyline";
  if (kw.includes("milepost")) kw = "milepost";
  if (kw.includes("backwood")) kw = "backwood";
  if (kw.includes("burning")) kw = "burning";
  if (kw.includes("nuka")) kw = "nuka";
  if (kw.includes("invader")) kw = "invader";
  if (kw.includes("slasher")) kw = "slasher";
  return kw;
}

/** The term the /wiki page used to re-filter update results with (formerly client-side). */
export function updatePageMatchTerm(update: string): string {
  const targetKw = update.toLowerCase().replace(/-/g, " ");
  return targetKw.includes("burning")
    ? "burning"
    : targetKw.includes("backwood")
    ? "backwood"
    : targetKw.includes("milepost")
    ? "milepost"
    : targetKw.includes("atlantic")
    ? "atlantic"
    : targetKw.includes("skyline")
    ? "skyline"
    : targetKw;
}

export function searchWikiArticles<T extends SearchableArticle>(
  articles: ReadonlyArray<T>,
  options: WikiSearchOptions = {},
): WikiSearchResult<T> {
  const q = (options.q || "").trim().toLowerCase();
  const category = options.category || "all";
  const sort = options.sort || "newest";
  const updateFilter = options.update || "all";
  const offset = Math.max(0, Math.floor(options.offset ?? 0) || 0);
  const limit = options.limit;

  let list = [...articles];

  // 0. Archive filter (time-bound series posts; opt in with archive=1)
  if (!options.includeArchive) {
    list = list.filter((a) => !a.archived);
  }

  // 0b. Source and stub filters (new, both opt-in)
  if (options.source) {
    const source = options.source;
    list = list.filter((a) => a.source === source);
  }
  if (options.hideStubs) {
    list = list.filter((a) => !a.stub);
  }

  // 1. Category filter
  if (category && category.toLowerCase() !== "all") {
    const prefix = category.toLowerCase().split(" ")[0].split("&")[0].trim();
    list = list.filter((a) => (a.category || "").toLowerCase().includes(prefix));
  }

  // 2. Query search filter
  if (q.length > 0) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q),
    );
  }

  // 3. Patch / update keyword filter, then the page's former client-side rule
  if (updateFilter && updateFilter.toLowerCase() !== "all") {
    const kw = updateKeyword(updateFilter);
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(kw) ||
        a.snippet.toLowerCase().includes(kw) ||
        (a.category || "").toLowerCase().includes(kw),
    );
    const term = updatePageMatchTerm(updateFilter);
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.content.toLowerCase().includes(term) ||
        (a.category || "").toLowerCase().includes(term),
    );
  }

  // 4. Sorting & relevance ranking
  if (q.length > 0 && (!sort || sort === "newest" || sort === "relevance")) {
    list.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aScore = aTitle === q ? 100 : aTitle.startsWith(q) ? 50 : aTitle.includes(q) ? 20 : 5;
      const bScore = bTitle === q ? 100 : bTitle.startsWith(q) ? 50 : bTitle.includes(q) ? 20 : 5;
      if (aScore !== bScore) return bScore - aScore;
      return String(b.id).localeCompare(String(a.id));
    });
  } else if (sort === "oldest") {
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  } else if (sort === "title-asc") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "title-desc") {
    list.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    // "newest" or default
    list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }

  // 5. Stubs (cleaned body under 300 characters) always rank last.
  list = [...list.filter((a) => !a.stub), ...list.filter((a) => a.stub)];

  const end = limit === undefined || !Number.isFinite(limit) ? undefined : offset + Math.max(0, limit);
  return { total: list.length, items: list.slice(offset, end) };
}
