/**
 * URL state for the /wiki guide list. The URL is the state: every filter, the query and the
 * page live in the query string so reload, share and back/forward restore them.
 *
 * Params (all optional; unknown or invalid values are ignored):
 *   q (alias query)   search text
 *   category          one of WIKI_CATEGORY_IDS (default "all")
 *   update            one of UPDATE_PATCH_IDS (default "all")
 *   archive=1         include archived series posts
 *   source            one of WIKI_SOURCES
 *   stubs=hide        hide stub guides (body under 300 characters)
 *   current=1         hide guides flagged "May be out of date" or "Outdated"
 *   sort              one of GUIDE_SORTS (default "newest", omitted from the URL)
 *   page              1-based page number (default 1)
 * `id` / `article` (open one guide in the reader) are deep links handled by the page, not list state.
 */
import { WIKI_CATEGORY_IDS } from "./wiki-category-counts";
import { UPDATE_PATCHES, UPDATE_PATCH_IDS } from "./update-patches";

export const GUIDES_PER_PAGE = 25;

/** Distinct `source` values in the corpus (pinned against the corpus by guide-list-state.test.ts). */
export const WIKI_SOURCES = [
  "Fallout Wiki",
  "NukaKnights",
  "TheDuchessFlame",
  "Fallout Fandom",
  "Bethesda Official",
] as const;
export type WikiSource = (typeof WIKI_SOURCES)[number];

/** Result orders the list offers (`/api/wiki/search` understands each). "newest" is the default. */
export const GUIDE_SORTS = ["newest", "oldest", "title-asc", "title-desc"] as const;
export type GuideSort = (typeof GUIDE_SORTS)[number];
export const DEFAULT_GUIDE_SORT: GuideSort = "newest";

const SORT_SET: ReadonlySet<string> = new Set(GUIDE_SORTS);
const CATEGORY_SET: ReadonlySet<string> = new Set(WIKI_CATEGORY_IDS);
const SOURCE_SET: ReadonlySet<string> = new Set(WIKI_SOURCES);

export interface GuideListState {
  q: string;
  category: string;
  update: string;
  archive: boolean;
  source: WikiSource | null;
  hideStubs: boolean;
  /** `current=1`: hide possibly outdated guides. */
  hideOutdated: boolean;
  /** Result order. Not a filter: no chip, not counted, and "Clear all" keeps it. */
  sort: GuideSort;
  page: number;
}

export const DEFAULT_GUIDE_LIST_STATE: GuideListState = {
  q: "",
  category: "all",
  update: "all",
  archive: false,
  source: null,
  hideStubs: false,
  hideOutdated: false,
  sort: DEFAULT_GUIDE_SORT,
  page: 1,
};

interface ParamReader {
  get(name: string): string | null;
}

export function readCategory(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  return value && CATEGORY_SET.has(value) ? value : null;
}

export function readUpdate(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase();
  return value && UPDATE_PATCH_IDS.has(value) ? value : null;
}

export function readSource(raw: string | null | undefined): WikiSource | null {
  const value = raw?.trim();
  return value && SOURCE_SET.has(value) ? (value as WikiSource) : null;
}

export function readSort(raw: string | null | undefined): GuideSort | null {
  const value = raw?.trim().toLowerCase();
  return value && SORT_SET.has(value) ? (value as GuideSort) : null;
}

/** Positive integer page, else 1. */
export function readPage(raw: string | null | undefined): number {
  if (!raw || !/^\d+$/.test(raw.trim())) return 1;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isSafeInteger(n) && n >= 1 ? n : 1;
}

export function parseGuideListState(params: ParamReader | null | undefined): GuideListState {
  if (!params) return { ...DEFAULT_GUIDE_LIST_STATE };
  return {
    q: params.get("q") || params.get("query") || "",
    category: readCategory(params.get("category")) ?? "all",
    update: readUpdate(params.get("update")) ?? "all",
    archive: params.get("archive") === "1",
    source: readSource(params.get("source")),
    hideStubs: params.get("stubs") === "hide",
    hideOutdated: params.get("current") === "1",
    sort: readSort(params.get("sort")) ?? DEFAULT_GUIDE_SORT,
    page: readPage(params.get("page")),
  };
}

/** Query string (no leading "?") holding only non-default values, in a stable order. */
export function serializeGuideListState(state: GuideListState): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q);
  if (state.category !== "all" && CATEGORY_SET.has(state.category)) params.set("category", state.category);
  if (state.update !== "all" && UPDATE_PATCH_IDS.has(state.update)) params.set("update", state.update);
  if (state.archive) params.set("archive", "1");
  if (state.source && SOURCE_SET.has(state.source)) params.set("source", state.source);
  if (state.hideStubs) params.set("stubs", "hide");
  if (state.hideOutdated) params.set("current", "1");
  if (state.sort !== DEFAULT_GUIDE_SORT && SORT_SET.has(state.sort)) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}

export function sameGuideListState(a: GuideListState, b: GuideListState): boolean {
  return serializeGuideListState(a) === serializeGuideListState(b);
}

/** Number of pages for `total` results; at least 1 so "Page 1 of 1" reads right for empty lists. */
export function pageCount(total: number, perPage: number = GUIDES_PER_PAGE): number {
  if (!Number.isFinite(total) || total <= 0) return 1;
  return Math.ceil(total / perPage);
}

export function clampPage(page: number, total: number, perPage: number = GUIDES_PER_PAGE): number {
  return Math.min(Math.max(1, Math.floor(page) || 1), pageCount(total, perPage));
}

export function pageOffset(page: number, perPage: number = GUIDES_PER_PAGE): number {
  return (Math.max(1, Math.floor(page) || 1) - 1) * perPage;
}

/** Filters that narrow the list (the search text is not counted; it has its own field). */
export function countActiveFilters(state: GuideListState): number {
  return (
    (state.category !== "all" ? 1 : 0) +
    (state.source ? 1 : 0) +
    (state.update !== "all" ? 1 : 0) +
    (state.archive ? 1 : 0) +
    (state.hideStubs ? 1 : 0) +
    (state.hideOutdated ? 1 : 0)
  );
}

export type GuideFilterKey = "q" | "category" | "source" | "update" | "archive" | "stubs" | "current";

export interface GuideFilterChip {
  key: GuideFilterKey;
  label: string;
}

const UPDATE_LABELS = new Map(UPDATE_PATCHES.map((p) => [p.id, p.label]));

/** Removable chips for the active filters, in rail order. `categoryLabel` maps an id to its display name. */
export function activeFilterChips(
  state: GuideListState,
  categoryLabel: (id: string) => string = (id) => id,
): GuideFilterChip[] {
  const chips: GuideFilterChip[] = [];
  if (state.q.trim()) chips.push({ key: "q", label: `Search: “${state.q.trim()}”` });
  if (state.category !== "all") chips.push({ key: "category", label: `Category: ${categoryLabel(state.category)}` });
  if (state.source) chips.push({ key: "source", label: `Source: ${state.source}` });
  if (state.update !== "all") chips.push({ key: "update", label: `Update: ${UPDATE_LABELS.get(state.update) ?? state.update}` });
  if (state.archive) chips.push({ key: "archive", label: "Including archive" });
  if (state.hideStubs) chips.push({ key: "stubs", label: "Hiding stubs" });
  if (state.hideOutdated) chips.push({ key: "current", label: "Hiding possibly outdated" });
  return chips;
}

/** State with one filter cleared; any filter change returns to page 1. */
export function removeFilter(state: GuideListState, key: GuideFilterKey): GuideListState {
  const next = { ...state, page: 1 };
  switch (key) {
    case "q":
      next.q = "";
      break;
    case "category":
      next.category = "all";
      break;
    case "source":
      next.source = null;
      break;
    case "update":
      next.update = "all";
      break;
    case "archive":
      next.archive = false;
      break;
    case "stubs":
      next.hideStubs = false;
      break;
    case "current":
      next.hideOutdated = false;
      break;
  }
  return next;
}

/**
 * Everything back to defaults (query included), like the old "Reset all filters & search".
 * The sort order is a view choice, not a filter: pass the current one to keep it.
 */
export function clearAllFilters(sort: GuideSort = DEFAULT_GUIDE_SORT): GuideListState {
  return { ...DEFAULT_GUIDE_LIST_STATE, sort };
}

/**
 * One clean sentence for a result row: strips leftover tags, keeps the first sentence when it
 * is a real one (at least 40 characters), else cuts long text at a word boundary.
 */
export function firstSentence(text: string, max = 180): string {
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const match = clean.match(/^(.+?[.!?])(?=\s|$)/);
  if (match && match[1].length >= 40 && match[1].length <= max) return match[1];
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, "")}…`;
}
