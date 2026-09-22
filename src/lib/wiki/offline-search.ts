/**
 * Guide search that keeps working without a connection. The /wiki page asks the server first
 * (/api/wiki/search); when that request fails at the network level it searches the compact client
 * index (public/data/wiki-index.json, cached by the service worker once it has been fetched) with
 * the same engine and the same ranking the server uses. Differences from the server: the index
 * can be one corpus regeneration behind, and the patch-version filter ("update=") cannot look
 * inside guide bodies (the index carries none), so it matches titles and categories only.
 */
import { cleanSnippet } from "./clean-text";
import { pageOffset, readSource, type GuideListState } from "./guide-list-state";
import { prepareWikiSearchIndex, searchWikiArticles, suggestWikiCategories } from "./search-wiki-articles";
import { WIKI_CLIENT_INDEX_PATH, type WikiClientIndexEntry } from "./wiki-client-index";
import wikiCategoryCounts from "./wiki-category-counts.json";

/** The list result the page renders, whichever side produced it. */
export interface GuideListPage<T> {
  items: T[];
  total: number;
  suggestions: string[];
  /** True when the server was unreachable and the client index answered. */
  offline: boolean;
}

const CATEGORY_IDS = Object.keys(wikiCategoryCounts).filter((k) => !["all", "archived", "stub"].includes(k));

/** Mirrors the /api/wiki/search route: filters, sort, paging and the no-match category suggestions. */
export function searchOfflineGuides<T extends WikiClientIndexEntry>(
  index: ReadonlyArray<T>,
  state: GuideListState,
  offset: number,
  limit: number,
): GuideListPage<T> {
  const query = { q: state.q, category: state.category, includeArchive: state.archive };
  const { total, items } = searchWikiArticles(index, {
    ...query,
    sort: state.sort,
    update: state.update,
    source: readSource(state.source ?? null),
    hideStubs: state.hideStubs,
    hidePossiblyOutdated: state.hideOutdated,
    offset,
    limit,
  });
  const cleaned = items.map((a) => ({ ...a, snippet: cleanSnippet(a.snippet, a.title) }) as T);
  const suggestions = total === 0 && state.q.trim() ? suggestWikiCategories(index, query, CATEGORY_IDS) : [];
  return { items: cleaned, total, suggestions, offline: true };
}

/** The `?id=` deep link, offline: the guide row or null. */
export function findOfflineGuide<T extends WikiClientIndexEntry>(index: ReadonlyArray<T>, id: string): T | null {
  const wanted = id.trim();
  const match = index.find((a) => String(a.id) === wanted);
  return match ? { ...match, snippet: cleanSnippet(match.snippet, match.title) } : null;
}

/** A request that never reached a server (offline, DNS, aborted connection): the only case we fall back on. */
export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return false;
  return error instanceof TypeError;
}

let indexPromise: Promise<WikiClientIndexEntry[]> | null = null;

/**
 * The client index, fetched once per page load (the service worker serves it from its cache when
 * offline). Rejects when it is neither cached nor reachable; the promise is dropped so a later
 * call can retry.
 */
export function loadWikiClientIndex(fetchImpl: typeof fetch = fetch): Promise<WikiClientIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetchImpl(WIKI_CLIENT_INDEX_PATH)
      .then(async (res) => {
        if (!res.ok) throw new Error(`client index: HTTP ${res.status}`);
        const rows = (await res.json()) as WikiClientIndexEntry[];
        if (!Array.isArray(rows)) throw new Error("client index: not a list");
        prepareWikiSearchIndex(rows);
        return rows;
      })
      .catch((err) => {
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

/** Fetch the index in the background while online, so it is in the service worker's cache before it is needed. */
export function warmWikiClientIndex(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const run = () => loadWikiClientIndex().catch(() => undefined);
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 10_000 });
  else window.setTimeout(run, 2_000);
}

/** Offset of `state.page` for the list request, re-exported so the page has one import. */
export { pageOffset };
