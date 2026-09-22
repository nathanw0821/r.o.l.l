/**
 * The compact guide index the browser searches when the network is gone: one row per guide with
 * the fields the search engine and the result list use, and none of the bodies (those are
 * fetched per guide from /data/wiki/<id>.json). Written to public/data/wiki-index.json (outside the
 * bodies folder, which the corpus scripts and tests treat as bodies only) by
 * scripts/truth/build-wiki-counts.ts and pinned by wiki-client-index.test.ts.
 */

export interface WikiClientIndexEntry {
  id: number | string;
  source: string;
  title: string;
  url: string;
  category: string;
  snippet: string;
  archived?: boolean;
  stub?: boolean;
  sourceImages?: boolean;
}

export const WIKI_CLIENT_INDEX_PATH = "/data/wiki-index.json";

type SourceArticle = {
  id: number | string;
  source: string;
  title: string;
  url: string;
  category: string;
  snippet: string;
  archived?: boolean;
  stub?: boolean;
  sourceImages?: boolean;
};

/** The index rows in corpus order; optional flags are only written when set, to keep the file small. */
export function buildWikiClientIndex(articles: ReadonlyArray<SourceArticle>): WikiClientIndexEntry[] {
  return articles.map((a) => {
    const entry: WikiClientIndexEntry = {
      id: a.id,
      source: a.source,
      title: a.title,
      url: a.url,
      category: a.category,
      snippet: a.snippet,
    };
    if (a.archived) entry.archived = true;
    if (a.stub) entry.stub = true;
    if (a.sourceImages) entry.sourceImages = true;
    return entry;
  });
}
