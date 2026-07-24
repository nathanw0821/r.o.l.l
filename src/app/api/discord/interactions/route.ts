import { NextResponse } from "next/server";
import { getCachedBuilderModCatalog } from "@/lib/builder/get-builder-mod-catalog";
import { getLegendaryScripCost } from "@/lib/builder/crafting-costs";
import { normalizeFuzzySearchString, applyFilters, type FilterableRow } from "@/lib/filter-utils";

// Web Crypto Ed25519 signature verification for Discord Webhooks
async function verifyDiscordSignature(
  body: string,
  signature: string | null,
  timestamp: string | null,
  publicKeyHex: string
): Promise<boolean> {
  if (!signature || !timestamp || !publicKeyHex) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      Buffer.from(publicKeyHex, "hex"),
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      "Ed25519",
      key,
      Buffer.from(signature, "hex"),
      Buffer.from(timestamp + body)
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  const rawBody = await req.text();

  // Verify request origin from Discord
  if (publicKey) {
    const isValid = await verifyDiscordSignature(rawBody, signature, timestamp, publicKey);
    if (!isValid) {
      return new NextResponse("Invalid request signature", { status: 401 });
    }
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // Type 1: Discord PING (Webhook Verification)
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Type 2: Application Command (Slash Commands)
  if (interaction.type === 2) {
    const { name, options } = interaction.data;

    // Command: /effect <query>
    if (name === "effect") {
      const queryOption = options?.find((o: { name: string; value: string }) => o.name === "query");
      const query = queryOption?.value?.toLowerCase().trim() || "";

      const catalog = await getCachedBuilderModCatalog();
      const normQuery = normalizeFuzzySearchString(query);

      // 1. Direct or fuzzy search matching via applyFilters
      const filterableCatalog: FilterableRow[] = catalog.map((m) => ({
        effect: { name: m.name },
        tier: { label: `${m.starRank || 1} Star` },
        categories: [{ category: { name: [m.category, m.subCategory].filter(Boolean).join(" ") } }],
        description: m.description,
        unlocked: true,
        isSeeking: false,
        modCount: 1,
        modObj: m
      }));

      const filtered = applyFilters(filterableCatalog, {
        query,
        sources: [],
        status: [],
        origins: []
      });

      let match: (typeof catalog)[0] | undefined = (filtered[0] as unknown as { modObj: (typeof catalog)[0] })?.modObj;

      // 2. Fallback to normalized fuzzy string comparison
      if (!match) {
        match = catalog.find((m) => {
          const normName = normalizeFuzzySearchString(m.name);
          const normSlug = normalizeFuzzySearchString(m.slug);
          return (
            normName === normQuery ||
            normSlug === normQuery ||
            normName.includes(normQuery) ||
            normQuery.includes(normName)
          );
        });
      }

      if (!match) {
        return NextResponse.json({
          type: 4,
          data: {
            content: `⚠️ No legendary mod found matching **"${query}"**. Try searching for *Bloodied*, *Unyielding*, *VATS Optimized*, *Arms Keeper's*, *WWR*, or *25LVC*.`,
            flags: 64 // Ephemeral response
          }
        });
      }

      const starCount = match.starRank || 1;
      const stars = "★".repeat(starCount);
      const starLabel = `${starCount}-Star (${stars})`;

      const categoriesStr = [match.category, match.subCategory].filter(Boolean).join(" / ") || "All Equipment";

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `${stars} ${match.name}`,
              url: `https://fallout76.wiki/all-effects#${match.slug}`,
              description: match.description || "Legendary effect for Fallout 76 weapons & armor.",
              color: 0xf3a24d,
              fields: [
                {
                  name: "Tier Rank",
                  value: starLabel,
                  inline: true
                },
                {
                  name: "Equipment Category",
                  value: categoriesStr,
                  inline: true
                },
                {
                  name: "Crafting Cost / Bench Notes",
                  value: "Modular Crafting / Legendary Scrip Bench",
                  inline: false
                }
              ],
              footer: {
                text: "R.O.L.L. · Record Of Legendary Loadouts",
                icon_url: "https://fallout76.wiki/favicon-v3.png"
              }
            }
          ]
        }
      });
    }

    // Command: /scrip <mod_count>
    if (name === "scrip") {
      const countOption = options?.find((o: { name: string; value: number }) => o.name === "mods");
      const modCount = Math.max(1, Math.min(50, Number(countOption?.value || 1)));

      const scripPerMod = getLegendaryScripCost(modCount - 1);

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `🧪 Scrip & Legendary Module Crafting Cost Calculator`,
              description: `Cost breakdown for attaching **${modCount}** modular legendary mod box(es) at the Tinkerer's Bench:`,
              color: 0x50c878,
              fields: [
                {
                  name: `Modification #${modCount} Scrip Cost`,
                  value: `${scripPerMod} Scrip (Capped at 1,000 Scrip after 21 modifications)`,
                  inline: false
                },
                {
                  name: "Modular Rules",
                  value: "• Mods 1 to 20 scale dynamically from 10 to 960 scrip.\n• Modification #21 onwards stays capped at 1,000 scrip per craft.",
                  inline: false
                }
              ],
              footer: {
                text: "R.O.L.L. B.U.I.L.D. Diagnostic Engine",
                icon_url: "https://fallout76.wiki/favicon-v3.png"
              }
            }
          ]
        }
      });
    }

    // Command: /build <slug>
    if (name === "build") {
      const slugOption = options?.find((o: { name: string; value: string }) => o.name === "slug");
      const slug = slugOption?.value?.trim() || "";

      if (!slug) {
        return NextResponse.json({
          type: 4,
          data: {
            content: "💡 Enter a build loadout slug or link (e.g. `/build b-u-i-l-d-loadout-33ded6`). Build loadouts can be exported directly from **[fallout76.wiki/build](https://fallout76.wiki/build)**!",
            flags: 64
          }
        });
      }

      const cleanSlug = slug.replace(/^https:\/\/fallout76\.wiki\/l\//, "");
      const buildUrl = `https://fallout76.wiki/l/${cleanSlug}`;

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `🛡️ B.U.I.L.D. Character Loadout Transmission`,
              url: buildUrl,
              description: `View complete S.P.E.C.I.A.L. stats, resistance ratings, armor modifications, mutations, and legendary perk cards on R.O.L.L.:\n\n🔗 **[Open Interactive Loadout](${buildUrl})**`,
              color: 0x3b82f6,
              footer: {
                text: "R.O.L.L. Diagnostic Transmission",
                icon_url: "https://fallout76.wiki/favicon-v3.png"
              }
            }
          ]
        }
      });
    }
  }

  return NextResponse.json({ error: "Unknown interaction" }, { status: 400 });
}
