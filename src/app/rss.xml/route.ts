import { NextResponse } from "next/server";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  // Fetch recent articles from Prisma database or static catalog fallback
  try {
    const articles = FALLBACK_WIKI_ARTICLES.slice(0, limit);
    const baseUrl = process.env.NEXTAUTH_URL || "https://fallout76.wiki";

    const itemsXml = (articles as Array<{ id: string; title: string; category?: string; updated_at?: string; snippet?: string; url?: string; source?: string }>)
      .map((a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/wiki?id=${a.id}</link>
      <guid isPermaLink="false">${a.id}</guid>
      <category><![CDATA[${a.category || "General"}]]></category>
      <pubDate>${new Date(a.updated_at || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${a.snippet || a.title}]]></description>
      <source url="${a.url}">${a.source}</source>
    </item>`)
      .join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fallout 76 Truth Wiki Feed</title>
    <link>${baseUrl}</link>
    <description>Ground Truth Database for Fallout 76 Patch Notes, Minerva Sales, Builds, and Guides</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch {
    return new NextResponse("<rss version='2.0'><channel><title>Error</title></channel></rss>", {
      headers: { "Content-Type": "application/xml" }
    });
  }
}
