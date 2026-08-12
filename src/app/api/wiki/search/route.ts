import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const updateFilter = searchParams.get("update") || "all";
  const limit = parseInt(searchParams.get("limit") || "60", 10);

  // 1. Try local Python Truth Bible REST server if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const localResp = await fetch(
      `http://127.0.0.1:8076/api/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&update=${encodeURIComponent(updateFilter)}&limit=${limit}`,
      {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/json" }
      }
    );
    clearTimeout(timeoutId);

    if (localResp.ok) {
      const data = await localResp.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Local server fallback to Prisma
  }

  // 2. Query Prisma database (Neon / Postgres)
  try {
    const where: Record<string, unknown> = {};

    // Category filter
    if (category && category.toLowerCase() !== "all") {
      const prefix = category.split(" ")[0].split("&")[0].trim();
      where.category = { contains: prefix, mode: "insensitive" };
    }

    // Search query filter
    const conditions: Record<string, unknown>[] = [];
    if (q && q.trim().length > 0) {
      conditions.push(
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } }
      );
    }

    // Update / Patch filter keywords
    if (updateFilter && updateFilter.toLowerCase() !== "all") {
      let kw = updateFilter.replace(/-/g, " ");
      if (kw.includes("pitt")) kw = "The Pitt";
      if (kw.includes("atlantic")) kw = "Atlantic City";
      if (kw.includes("skyline")) kw = "Skyline Valley";
      if (kw.includes("milepost")) kw = "Milepost Zero";
      if (kw.includes("backwood")) kw = "Backwoods";
      if (kw.includes("burning")) kw = "Burning Springs";
      if (kw.includes("nuka")) kw = "Nuka World";
      if (kw.includes("invader")) kw = "Invaders";

      where.AND = [
        {
          OR: [
            { title: { contains: kw, mode: "insensitive" } },
            { content: { contains: kw, mode: "insensitive" } }
          ]
        }
      ];
    }

    if (conditions.length > 0) {
      if (Array.isArray(where.AND)) {
        where.AND.push({ OR: conditions });
      } else {
        where.OR = conditions;
      }
    }

    // Ordering logic
    let orderBy: Record<string, string> = { id: "desc" };
    if (sort === "oldest") {
      orderBy = { id: "asc" };
    } else if (sort === "title-asc") {
      orderBy = { title: "asc" };
    } else if (sort === "title-desc") {
      orderBy = { title: "desc" };
    } else if (sort === "updated") {
      orderBy = { updatedAt: "desc" };
    }

    const articles = await prisma.article.findMany({
      where,
      take: limit,
      orderBy
    });

    const formatted = articles.map((a) => ({
      id: a.id,
      source: a.source,
      title: a.title,
      url: a.url,
      content: a.content,
      main_image: a.mainImage,
      category: a.category,
      updatedAt: a.updatedAt,
      snippet: a.content ? a.content.substring(0, 150) + "..." : ""
    }));

    return NextResponse.json(formatted);
  } catch {
    return NextResponse.json([]);
  }
}
