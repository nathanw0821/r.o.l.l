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
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`NukaKnights fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const rows: ScrapedModRow[] = [];

  // Match container blocks: data-listtitle="1st Star"
  const containerRegex =
    /<div[^>]*class=["'][^"']*mod_fallout76rewards_legendarymods[^"']*["'][^>]*data-listtitle=["']([^"']+)["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

  // Match rows inside container
  const rowRegex = /<div[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;

  let containerMatch: RegExpExecArray | null;
  while ((containerMatch = containerRegex.exec(html)) !== null) {
    const rawTitle = containerMatch[1].trim();
    const tierLabel = STAR_MAP[rawTitle] ?? rawTitle;
    const containerInner = containerMatch[2];
    const defaultModules = MODULE_COSTS[tierLabel] ?? 15;

    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(containerInner)) !== null) {
      const rowHtml = rowMatch[1];

      const nameMatch = /<div[^>]*class=["'][^"']*\bmod_name\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/.exec(rowHtml);
      const descMatch = /<div[^>]*class=["'][^"']*\bmod_desc\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/.exec(rowHtml);
      const addonMatch = /<div[^>]*class=["'][^"']*\bmod_addon\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/.exec(rowHtml);
      const relMatch = /<div[^>]*class=["'][^"']*\bmod_rel\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/.exec(rowHtml);

      if (nameMatch && descMatch) {
        const name = nameMatch[1].replace(/<[^>]+>/g, "").trim();
        const desc = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const addon = addonMatch ? addonMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : undefined;

        const categoryTitles: string[] = [];
        if (relMatch) {
          const imgTitleRegex = /title=["']([^"']+)["']/g;
          let imgMatch: RegExpExecArray | null;
          while ((imgMatch = imgTitleRegex.exec(relMatch[1])) !== null) {
            categoryTitles.push(imgMatch[1].trim());
          }
        }

        if (name && desc) {
          rows.push({
            tier: tierLabel,
            effectName: name,
            description: desc,
            extraComponent: addon || undefined,
            categories: categoryTitles.length > 0 ? categoryTitles.join(" • ") : undefined,
            legendaryModules: defaultModules,
            sourceName: "NukaKnights",
            sourceUrl: articleUrl
          });
        }
      }
    }
  }

  return rows;
}
