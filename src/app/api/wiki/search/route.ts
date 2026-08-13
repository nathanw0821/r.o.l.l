import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/static-fallback-catalog";

function filterFallbackArticles(q: string, category: string, limit: number) {
  let list = FALLBACK_WIKI_ARTICLES;
  if (category && category.toLowerCase() !== "all") {
    const normCat = category.toLowerCase().split(" ")[0];
    list = list.filter((a) => a.category.toLowerCase().includes(normCat));
  }
  if (q && q.trim().length > 0) {
    const normQ = q.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(normQ) ||
        a.content.toLowerCase().includes(normQ) ||
        a.snippet.toLowerCase().includes(normQ)
    );
  }
  return list.slice(0, limit);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const updateFilter = searchParams.get("update") || "all";
  const limit = parseInt(searchParams.get("limit") || "500", 10);

  let list = [...FALLBACK_WIKI_ARTICLES];

  // 1. Category Filter
  if (category && category.toLowerCase() !== "all") {
    const prefix = category.toLowerCase().split(" ")[0].split("&")[0].trim();
    list = list.filter((a) => (a.category || "").toLowerCase().includes(prefix));
  }

  // 2. Query Search Filter
  if (q.length > 0) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q)
    );
  }

  // 3. Patch / Update Keyword Filter
  if (updateFilter && updateFilter.toLowerCase() !== "all") {
    let kw = updateFilter.toLowerCase().replace(/-/g, " ");
    if (kw.includes("pitt")) kw = "pitt";
    if (kw.includes("atlantic")) kw = "atlantic";
    if (kw.includes("skyline")) kw = "skyline";
    if (kw.includes("milepost")) kw = "milepost";
    if (kw.includes("backwood")) kw = "backwood";
    if (kw.includes("burning")) kw = "burning";
    if (kw.includes("nuka")) kw = "nuka";
    if (kw.includes("invader")) kw = "invader";

    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(kw) ||
        a.content.toLowerCase().includes(kw) ||
        (a.category || "").toLowerCase().includes(kw)
    );
  }

  // 4. Sorting
  if (sort === "oldest") {
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  } else if (sort === "title-asc") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "title-desc") {
    list.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    // "newest" or default
    list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }

  return NextResponse.json(list.slice(0, limit));
}
