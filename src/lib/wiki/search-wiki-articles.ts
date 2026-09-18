/**
 * Filtering, ordering and paging behind GET /api/wiki/search. Pure, so it is unit tested
 * (search-wiki-articles.test.ts) and the route stays a thin adapter.
 *
 * Steps 0-5 are the route's original rules, moved here unchanged. Additions:
 *  - `source` (exact source name) and `hideStubs` (drop `stub` entries);
 *  - `hidePossiblyOutdated` (drop guides with a supersede note or a hand-written outdated flag);
 *  - the second update-keyword rule that /wiki used to apply client-side to the first 100
 *    results (title/content/category must contain the chip's term); applying it here keeps
 *    the same result set now that the page pages through the API instead;
 *  - `offset` for paging; the total before slicing is returned alongside.
 *
 * Search quality (Guides UI/UX step c, `WS5_UX_DESIGN_PLAN.md` "Guides UI/UX upgrade" item 4):
 *  - Matching is punctuation- and apostrophe-tolerant (`normalizeSearchText`): "overeaters" finds
 *    "Overeater's", "vats" finds "V.A.T.S.", "t51b" and "t 51b" find "T-51b". The old raw substring
 *    match is kept, so every guide the literal query used to find is still found.
 *  - A query also matches when all of its words start words in the title, or in title + snippet.
 *  - Player shorthand from `src/data/truth/search-synonyms.json` ("aa", "25lvc", "wwr", "sbq"...)
 *    adds alternatives (OR); the literal query is always searched too.
 *  - With a query and the default sort ("newest"/"relevance"), results are ranked: title equal to
 *    an entity name the query (or a synonym) names; exact title; title starts with the query;
 *    title contains it; all words in the title; words in the snippet; any other match. The literal
 *    query outranks a synonym at the same tier. Ties keep the default order (id descending).
 *    Explicit sorts (oldest, title-asc, title-desc) keep their order over the same match set.
 *  - Stubs still rank last and archived guides stay out unless `includeArchive`.
 */

import searchSynonyms from "@/data/truth/search-synonyms.json";
import { ENTITY_LINKS, getEntityLink } from "@/lib/links/entity-links";
import { getArticleOutdatedStatus } from "./outdated-articles";
import { isPossiblyOutdated } from "./supersede";

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
  /** `current=1`: drop guides flagged "May be out of date" (supersede-index.json) or "Outdated" (outdated-articles.ts, title rules as the list shows them). */
  hidePossiblyOutdated?: boolean;
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

// ---------------------------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------------------------

/**
 * Lower case, accents folded, typographic quotes folded, apostrophes and dots dropped (a dot
 * between two digits becomes a space, so "1.7.11" stays three numbers), every other run of
 * non-alphanumerics becomes one space. "Overeater's" -> "overeaters", "V.A.T.S." -> "vats",
 * "T-51b" -> "t 51b".
 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019`\u00b4]/g, "'")
    .replace(/(\d)\.(?=\d)/g, "$1 ")
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const compact = (normalized: string) => normalized.replace(/ /g, "");

/** Compact (space-free) matches are only trusted from this length; "aa" would hit "piranha armor". */
const MIN_COMPACT_MATCH = 4;

// ---------------------------------------------------------------------------------------------
// Synonyms
// ---------------------------------------------------------------------------------------------

export interface SearchSynonymEntry {
  terms: string[];
  expandsTo: string[];
  note: string;
}

export const SEARCH_SYNONYMS: readonly SearchSynonymEntry[] = (searchSynonyms as { entries: SearchSynonymEntry[] }).entries;

/** normalised term -> expansions as written (for entity lookup) */
const SYNONYM_MAP: ReadonlyMap<string, readonly string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const entry of SEARCH_SYNONYMS) {
    for (const term of entry.terms) {
      const key = normalizeSearchText(term);
      if (!key) continue;
      const list = map.get(key) ?? [];
      for (const target of entry.expandsTo) if (!list.includes(target)) list.push(target);
      map.set(key, list);
    }
  }
  return map;
})();

/** normalised entity name -> entity name, so "overeaters" still finds the "Overeater's" entity. */
const ENTITY_BY_NORMALIZED: ReadonlyMap<string, string> = new Map(
  ENTITY_LINKS.map((e) => [normalizeSearchText(e.name), e.name] as const),
);

interface QueryVariant {
  /** normalised text */
  norm: string;
  compact: string;
  words: string[];
  literal: boolean;
  /** Precomputed probes (built once per query, not per article): " norm ", " norm", " w ", " w". */
  whole: string;
  lead: string;
  wordsWhole: string[];
  wordsLead: string[];
}

function makeVariant(norm: string, literal: boolean): QueryVariant {
  const words = norm.split(" ").filter(Boolean);
  return {
    norm,
    compact: compact(norm),
    words,
    literal,
    whole: ` ${norm} `,
    lead: ` ${norm}`,
    wordsWhole: words.map((w) => ` ${w} `),
    wordsLead: words.map((w) => ` ${w}`),
  };
}

export interface ExpandedQuery {
  /** Lower-cased raw query (the pre-normalisation substring rule). */
  raw: string;
  /** The literal query first, then synonym alternatives. */
  variants: QueryVariant[];
  /** The whole query is a synonym term: word-internal literal hits (e.g. "pa" in "Patch") rank lowest. */
  wholeQueryIsShorthand: boolean;
  /** Normalised entity names the query or one of its synonyms names exactly. */
  pinnedTitles: Set<string>;
}

const MAX_VARIANTS = 12;

/** Expand a query into its literal form and synonym alternatives (exported for tests and the route). */
export function expandSearchQuery(q: string): ExpandedQuery {
  const raw = q.trim().toLowerCase();
  const norm = normalizeSearchText(q);
  const variants: QueryVariant[] = [];
  const seen = new Set<string>();
  const pinnedTitles = new Set<string>();
  const add = (text: string, literal: boolean) => {
    if (!text || seen.has(text) || variants.length >= MAX_VARIANTS) return;
    seen.add(text);
    variants.push(makeVariant(text, literal));
  };
  const pinEntity = (name: string) => {
    const hit = getEntityLink(name)?.name ?? ENTITY_BY_NORMALIZED.get(normalizeSearchText(name));
    if (hit) pinnedTitles.add(normalizeSearchText(hit));
  };

  add(norm, true);
  if (norm) pinEntity(q);

  const whole = SYNONYM_MAP.get(norm) ?? SYNONYM_MAP.get(compact(norm));
  const wholeQueryIsShorthand = Boolean(norm && whole);
  if (whole) {
    for (const target of whole) {
      add(normalizeSearchText(target), false);
      pinEntity(target);
    }
  }

  // Shorthand inside a longer query ("ultracite pa", "aa gatling"): whole-word runs only.
  if (norm.includes(" ")) {
    const padded = ` ${norm} `;
    for (const [term, targets] of SYNONYM_MAP) {
      if (term === norm || !padded.includes(` ${term} `)) continue;
      for (const target of targets) {
        add(padded.replace(` ${term} `, ` ${normalizeSearchText(target)} `).trim(), false);
      }
    }
  }

  return { raw, variants, wholeQueryIsShorthand, pinnedTitles };
}

// ---------------------------------------------------------------------------------------------
// Per-article index (computed once per article object and cached)
// ---------------------------------------------------------------------------------------------

interface PreparedArticle {
  title: string;
  /** " " + title + " " */
  titlePadded: string;
  titleCompact: string;
  snippetPadded: string;
  snippetCompact: string;
  /** " " + title + " " + snippet + " " */
  bothPadded: string;
  /** title and snippet without spaces: a cheap "can this variant match at all" prefilter. */
  bothCompact: string;
  /** Raw lower-cased title, snippet and content joined by newlines (the pre-normalisation rule). */
  raw: string;
}

const PREPARED = new WeakMap<object, PreparedArticle>();

function prepare(article: SearchableArticle): PreparedArticle {
  let p = PREPARED.get(article);
  if (p) return p;
  const title = normalizeSearchText(article.title || "");
  const snippet = normalizeSearchText(article.snippet || "");
  p = {
    title,
    titlePadded: ` ${title} `,
    titleCompact: compact(title),
    snippetPadded: ` ${snippet} `,
    snippetCompact: compact(snippet),
    bothPadded: ` ${title} ${snippet} `,
    bothCompact: `${compact(title)}\n${compact(snippet)}`,
    raw: `${article.title || ""}\n${article.snippet || ""}\n${article.content || ""}`.toLowerCase(),
  };
  PREPARED.set(article, p);
  return p;
}

/** Warm the per-article cache (the route calls this at module load for the bundled corpus). */
export function prepareWikiSearchIndex(articles: ReadonlyArray<SearchableArticle>): void {
  for (const a of articles) prepare(a);
}

// ---------------------------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------------------------

const TIER_EXACT = 6;
const TIER_STARTS = 5;
const TIER_TITLE_PHRASE = 4;
const TIER_TITLE_WORDS = 3;
const TIER_SNIPPET = 2;
const TIER_OTHER = 1;
const ENTITY_PIN_BONUS = 100;

/** Every word starts a word in `padded` (or is a whole word when `prefix` is false). */
function allWords(padded: string, v: QueryVariant, prefix: boolean): boolean {
  const probes = prefix ? v.wordsLead : v.wordsWhole;
  if (probes.length === 0) return false;
  for (const probe of probes) if (!padded.includes(probe)) return false;
  return true;
}

function variantTier(p: PreparedArticle, v: QueryVariant, prefixOk: boolean): number {
  const { norm } = v;
  if (!norm) return 0;
  // Every tier needs the first word somewhere in the title or snippet (spaces aside).
  if (!p.bothCompact.includes(v.words[0])) return 0;
  const longCompact = v.compact.length >= MIN_COMPACT_MATCH;

  if (p.title === norm || (longCompact && p.titleCompact === v.compact)) return TIER_EXACT;
  if (p.titlePadded.startsWith(v.whole)) return TIER_STARTS;
  if (prefixOk && (p.title.startsWith(norm) || (longCompact && p.titleCompact.startsWith(v.compact)))) {
    return TIER_TITLE_PHRASE; // "fix" -> "Fixer build": starts mid-word, ranks below a whole-word start
  }
  if (p.titlePadded.includes(v.whole)) return TIER_TITLE_PHRASE;
  if (prefixOk && (p.titlePadded.includes(v.lead) || (longCompact && p.titleCompact.includes(v.compact)))) {
    return TIER_TITLE_PHRASE;
  }
  if (allWords(p.titlePadded, v, prefixOk)) return TIER_TITLE_WORDS;
  if (p.snippetPadded.includes(v.whole)) return TIER_SNIPPET;
  if (prefixOk && longCompact && p.snippetCompact.includes(v.compact)) return TIER_SNIPPET;
  if (allWords(p.bothPadded, v, prefixOk)) return TIER_SNIPPET;
  // Word-internal hits count for the literal query only ("ffr" must not find "Rapidan" via "rapid").
  if (v.literal && (p.titlePadded.includes(norm) || p.snippetPadded.includes(norm))) return TIER_OTHER;
  return 0;
}

/** 0 = no match. Higher is better. */
function scoreArticle(article: SearchableArticle, query: ExpandedQuery): number {
  const p = prepare(article);
  let best = 0;
  for (const v of query.variants) {
    const prefixOk = v.literal && !query.wholeQueryIsShorthand;
    const tier = variantTier(p, v, prefixOk);
    if (tier > 0) best = Math.max(best, tier * 2 + (v.literal ? 1 : 0));
  }
  // The pre-normalisation rule: any raw substring hit still matches.
  if (best === 0 && query.raw && !query.raw.includes("\n") && p.raw.includes(query.raw)) {
    best = TIER_OTHER * 2 + 1;
  }
  if (best > 0 && query.pinnedTitles.has(p.title)) best += ENTITY_PIN_BONUS;
  return best;
}

const byIdDesc = (a: SearchableArticle, b: SearchableArticle) => String(b.id).localeCompare(String(a.id));

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
  if (options.hidePossiblyOutdated) {
    list = list.filter((a) => !isPossiblyOutdated(a.id) && !getArticleOutdatedStatus(a));
  }

  // 1. Category filter
  if (category && category.toLowerCase() !== "all") {
    const prefix = categoryPrefix(category);
    list = list.filter((a) => (a.category || "").toLowerCase().includes(prefix));
  }

  // 2. Query search filter (normalised, synonym-expanded; see the header comment)
  const scores = new Map<T, number>();
  if (q.length > 0) {
    const query = expandSearchQuery(q);
    list = list.filter((a) => {
      const score = scoreArticle(a, query);
      if (score > 0) scores.set(a, score);
      return score > 0;
    });
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
    // Default order first, then a stable sort by score: ties keep the default order.
    list.sort(byIdDesc);
    list.sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));
  } else if (sort === "oldest") {
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  } else if (sort === "title-asc") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "title-desc") {
    list.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    // "newest" or default
    list.sort(byIdDesc);
  }

  // 5. Stubs (cleaned body under 300 characters) always rank last.
  list = [...list.filter((a) => !a.stub), ...list.filter((a) => a.stub)];

  const end = limit === undefined || !Number.isFinite(limit) ? undefined : offset + Math.max(0, limit);
  return { total: list.length, items: list.slice(offset, end) };
}

/** The category filter's rule: first word of the id, before any "&". */
function categoryPrefix(category: string): string {
  return category.toLowerCase().split(" ")[0].split("&")[0].trim();
}

// ---------------------------------------------------------------------------------------------
// Empty-state suggestions
// ---------------------------------------------------------------------------------------------

const SUGGESTION_STOPWORDS: ReadonlySet<string> = new Set([
  "a", "an", "and", "as", "at", "by", "for", "from", "how", "in", "is", "of", "on", "or", "the", "to", "with",
]);

/**
 * Up to `max` category ids (from `categoryIds`, in that order of preference on ties) that contain a
 * guide matching any single word of the query or of its synonyms. Used when a search returns
 * nothing. Only the archive filter is kept; the current category is never suggested.
 */
export function suggestWikiCategories(
  articles: ReadonlyArray<SearchableArticle>,
  options: { q?: string; includeArchive?: boolean; category?: string },
  categoryIds: readonly string[],
  max = 3,
): string[] {
  const q = (options.q || "").trim();
  if (!q) return [];
  const words = new Set<string>();
  for (const v of expandSearchQuery(q).variants) {
    for (const w of v.words) if (!SUGGESTION_STOPWORDS.has(w) && w.length >= 2) words.add(w);
  }
  if (words.size === 0) return [];
  const wordList = [...words];

  const current = (options.category || "all").toLowerCase();
  const candidates = categoryIds
    .filter((id) => id.toLowerCase() !== "all" && id.toLowerCase() !== current)
    .map((id) => ({ id, prefix: categoryPrefix(id), hits: 0 }));

  for (const a of articles) {
    if (!options.includeArchive && a.archived) continue;
    const p = prepare(a);
    // Words of 3+ letters may start a word; shorter ones must be whole words.
    const hit = wordList.some((w) => p.bothPadded.includes(w.length >= 3 ? ` ${w}` : ` ${w} `));
    if (!hit) continue;
    const cat = (a.category || "").toLowerCase();
    for (const c of candidates) if (cat.includes(c.prefix)) c.hits += 1;
  }

  return candidates
    .map((c, index) => ({ ...c, index }))
    .filter((c) => c.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.index - b.index)
    .slice(0, max)
    .map((c) => c.id);
}
