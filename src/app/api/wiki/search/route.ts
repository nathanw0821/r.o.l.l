import { NextResponse } from "next/server";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import { cleanSnippet } from "@/lib/wiki/clean-text";
import { prepareWikiSearchIndex, searchWikiArticles, suggestWikiCategories } from "@/lib/wiki/search-wiki-articles";
import { readSource } from "@/lib/wiki/guide-list-state";
import wikiCategoryCounts from "@/lib/wiki/wiki-category-counts.json";

const DEFAULT_LIMIT = 500;
/** Upper bound for `limit` so one request cannot ask for the whole corpus at once. */
const MAX_LIMIT = 1000;

/** Category ids (the `?category=` values) in the page's order; the counts file also holds totals. */
const CATEGORY_IDS = Object.keys(wikiCategoryCounts).filter((k) => !["all", "archived", "stub"].includes(k));

// Normalise every title/snippet once per server instance, not once per request.
prepareWikiSearchIndex(FALLBACK_WIKI_ARTICLES);

function readNonNegativeInt(raw: string | null, fallback: number): number {
  if (raw === null || !/^\d+$/.test(raw.trim())) return fallback;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isSafeInteger(n) ? n : fallback;
}

/**
 * Guide search. Response body: a JSON array of guides (unchanged shape). The number of matches
 * before paging is sent in the `X-Total-Count` header.
 *
 * Params: q, category, sort, update, archive=1 (existing); source=<name>, stubs=hide, current=1,
 * offset=<n> (default 0), limit=<n> (default 500); id=<guide id> returns that
 * one guide regardless of the other filters (used by the /wiki?id= deep link).
 *
 * When a non-empty `q` matches nothing, `X-Suggestions` carries up to 3 comma-separated,
 * URI-encoded category ids that have guides matching any single word of the query.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  };

  const id = searchParams.get("id");
  if (id !== null && id.trim()) {
    const match = FALLBACK_WIKI_ARTICLES.find((a) => String(a.id) === id.trim());
    const payload = match ? [{ ...match, snippet: cleanSnippet(match.snippet, match.title) }] : [];
    return NextResponse.json(payload, {
      headers: { ...cacheHeaders, "X-Total-Count": String(payload.length) },
    });
  }

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const includeArchive = searchParams.get("archive") === "1";
  const { total, items } = searchWikiArticles(FALLBACK_WIKI_ARTICLES, {
    q,
    category,
    sort: searchParams.get("sort") || "newest",
    update: searchParams.get("update") || "all",
    includeArchive,
    source: readSource(searchParams.get("source")),
    hideStubs: searchParams.get("stubs") === "hide",
    hidePossiblyOutdated: searchParams.get("current") === "1",
    offset: readNonNegativeInt(searchParams.get("offset"), 0),
    limit: Math.min(readNonNegativeInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT),
  });

  // Render-time safety net: the corpus is cleaned by scripts/truth/clean-wiki-corpus.ts, but a
  // future dirty import must not be able to leak scraped markup into a result row.
  const payload = items.map((a) => ({
    ...a,
    snippet: cleanSnippet(a.snippet, a.title),
  }));

  const headers: Record<string, string> = { ...cacheHeaders, "X-Total-Count": String(total) };
  if (total === 0 && q.trim()) {
    const suggestions = suggestWikiCategories(FALLBACK_WIKI_ARTICLES, { q, includeArchive, category }, CATEGORY_IDS);
    if (suggestions.length > 0) headers["X-Suggestions"] = suggestions.map(encodeURIComponent).join(",");
  }

  return NextResponse.json(payload, { headers });
}
