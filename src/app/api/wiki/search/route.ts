import { NextResponse } from "next/server";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import { cleanSnippet } from "@/lib/wiki/clean-text";
import { searchWikiArticles } from "@/lib/wiki/search-wiki-articles";
import { readSource } from "@/lib/wiki/guide-list-state";

const DEFAULT_LIMIT = 500;

function readNonNegativeInt(raw: string | null, fallback: number): number {
  if (raw === null || !/^\d+$/.test(raw.trim())) return fallback;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isSafeInteger(n) ? n : fallback;
}

/**
 * Guide search. Response body: a JSON array of guides (unchanged shape). The number of matches
 * before paging is sent in the `X-Total-Count` header.
 *
 * Params: q, category, sort, update, archive=1 (existing); source=<name>, stubs=hide,
 * offset=<n> (default 0), limit=<n> (default 500); id=<guide id> returns that
 * one guide regardless of the other filters (used by the /wiki?id= deep link).
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

  const { total, items } = searchWikiArticles(FALLBACK_WIKI_ARTICLES, {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "all",
    sort: searchParams.get("sort") || "newest",
    update: searchParams.get("update") || "all",
    includeArchive: searchParams.get("archive") === "1",
    source: readSource(searchParams.get("source")),
    hideStubs: searchParams.get("stubs") === "hide",
    offset: readNonNegativeInt(searchParams.get("offset"), 0),
    limit: readNonNegativeInt(searchParams.get("limit"), DEFAULT_LIMIT),
  });

  // Render-time safety net: the corpus is cleaned by scripts/truth/clean-wiki-corpus.ts, but a
  // future dirty import must not be able to leak scraped markup into a result row.
  const payload = items.map((a) => ({
    ...a,
    snippet: cleanSnippet(a.snippet, a.title),
  }));

  return NextResponse.json(payload, {
    headers: { ...cacheHeaders, "X-Total-Count": String(total) },
  });
}
