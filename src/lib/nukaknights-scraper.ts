export type ScrapedModRow = {
  tier: string;
  effectName: string;
  categories?: string;
  description?: string;
  extraComponent?: string;
  legendaryModules?: number;
  notes?: string;
  sourceName: string;
  sourceUrl?: string | null;
};

const STAR_MAP: Record<string, string> = {
  "1st Star": "1 Star",
  "2nd Star": "2 Star",
  "3rd Star": "3 Star",
  "4th Star": "4 Star"
};

const MODULE_COSTS: Record<string, number> = {
  "1 Star": 15,
  "2 Star": 30,
  "3 Star": 60,
  "4 Star": 120
};

export async function fetchAndParseNukaKnights(
  articleUrl = "https://nukaknights.com/articles/legendary-mods-all-descriptions-and-usages.html"
): Promise<ScrapedModRow[]> {
  const response = await fetch(articleUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 R.O.L.L-AutoPull/1.0"
    },
    signal: AbortSignal.timeout(25000)
  });

  if (!response.ok) {
    throw new Error(`NukaKnights fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const rows: ScrapedModRow[] = [];

  // Split HTML into blocks by container: mod_fallout76rewards_legendarymods
  const blocks = html.split(/<div[^>]*class=["'][^"']*mod_fallout76rewards_legendarymods/i);

  for (let b = 1; b < blocks.length; b += 1) {
    const block = blocks[b];
    const titleMatch = /data-listtitle=["']([^"']+)["']/i.exec(block);
    if (!titleMatch) continue;

    const rawTitle = titleMatch[1].trim();
    const tierLabel = STAR_MAP[rawTitle] ?? rawTitle;
    const defaultModules = MODULE_COSTS[tierLabel] ?? 15;

    // Find all mod rows inside this section
    const rowSegments = block.split(/<div[^>]*class=["'][^"']*\bmod_name\b[^"']*["']/i);

    for (let i = 1; i < rowSegments.length; i += 1) {
      const seg = rowSegments[i];

      // Extract mod_name
      const nameEnd = seg.indexOf("</div>");
      if (nameEnd === -1) continue;
      const rawName = seg.slice(0, nameEnd).replace(/<[^>]+>/g, "").replace(/^>+\s*/, "").trim();

      // Extract mod_desc
      const descStartMatch = /<div[^>]*class=["'][^"']*\bmod_desc\b[^"']*["'][^>]*>/i.exec(seg);
      if (!descStartMatch) continue;

      const descStartIndex = descStartMatch.index + descStartMatch[0].length;
      const descEndIndex = seg.indexOf("</div>", descStartIndex);
      if (descEndIndex === -1) continue;

      const desc = seg.slice(descStartIndex, descEndIndex).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      // Extract mod_addon
      let addon: string | undefined;
      const addonStartMatch = /<div[^>]*class=["'][^"']*\bmod_addon\b[^"']*["'][^>]*>/i.exec(seg);
      if (addonStartMatch) {
        const addonStartIndex = addonStartMatch.index + addonStartMatch[0].length;
        const addonEndIndex = seg.indexOf("</div>", addonStartIndex);
        if (addonEndIndex !== -1) {
          const rawAddon = seg.slice(addonStartIndex, addonEndIndex).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (rawAddon) addon = rawAddon;
        }
      }

      // Extract categories from mod_rel img titles
      const categoryTitles: string[] = [];
      const relStartMatch = /<div[^>]*class=["'][^"']*\bmod_rel\b[^"']*["'][^>]*>/i.exec(seg);
      if (relStartMatch) {
        const relStartIndex = relStartMatch.index + relStartMatch[0].length;
        const relEndIndex = seg.indexOf("</div>", relStartIndex);
        if (relEndIndex !== -1) {
          const relChunk = seg.slice(relStartIndex, relEndIndex);
          const imgTitleRegex = /title=["']([^"']+)["']/g;
          let imgMatch: RegExpExecArray | null;
          while ((imgMatch = imgTitleRegex.exec(relChunk)) !== null) {
            categoryTitles.push(imgMatch[1].trim());
          }
        }
      }

      if (rawName && desc) {
        rows.push({
          tier: tierLabel,
          effectName: rawName,
          description: desc,
          extraComponent: addon,
          categories: categoryTitles.length > 0 ? categoryTitles.join(" • ") : undefined,
          legendaryModules: defaultModules,
          sourceName: "NukaKnights",
          sourceUrl: articleUrl
        });
      }
    }
  }

  if (rows.length < 140) {
    throw new Error(`Scraper validation failed: only extracted ${rows.length} rows (expected >= 140)`);
  }

  return rows;
}
