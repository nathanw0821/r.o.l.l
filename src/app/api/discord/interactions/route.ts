import { NextResponse } from "next/server";
import { getCachedBuilderModCatalog } from "@/lib/builder/get-builder-mod-catalog";
import { getLegendaryScripCost } from "@/lib/builder/crafting-costs";
import { normalizeFuzzySearchString, applyFilters, type FilterableRow } from "@/lib/filter-utils";
import { prisma } from "@/lib/prisma";
import type { BuilderPayload } from "@/lib/builder/types";

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

function formatEffectMath(effectMath: Record<string, unknown> | null | undefined): string {
  if (!effectMath || Object.keys(effectMath).length === 0) return "Standard Legendary Effect";
  const parts: string[] = [];
  if (typeof effectMath.damagePct === "number") parts.push(`+${Math.round(effectMath.damagePct * 100)}% Damage`);
  if (typeof effectMath.dr === "number") parts.push(`+${effectMath.dr} Damage Resistance (DR)`);
  if (typeof effectMath.er === "number") parts.push(`+${effectMath.er} Energy Resistance (ER)`);
  if (typeof effectMath.rr === "number") parts.push(`+${effectMath.rr} Rad Resistance (RR)`);
  if (typeof effectMath.specialBonus === "number") parts.push(`+${effectMath.specialBonus} to all S.P.E.C.I.A.L.`);
  if (typeof effectMath.apRegen === "number") parts.push(`+${Math.round(effectMath.apRegen * 100)}% AP Recovery Rate`);
  if (typeof effectMath.hp === "number") parts.push(`+${effectMath.hp} Max Health`);
  return parts.length > 0 ? parts.join(" · ") : "Standard Legendary Effect";
}

function formatCraftingCost(starRank: number, craftingCost: Record<string, unknown> | null | undefined): string {
  const defaultModules = starRank === 1 ? 15 : starRank === 2 ? 30 : starRank === 3 ? 60 : 120;
  let modules = defaultModules;
  const itemsList: string[] = [];

  if (craftingCost && typeof craftingCost === "object") {
    if (typeof craftingCost.legendaryModules === "number") modules = craftingCost.legendaryModules;
    if (Array.isArray(craftingCost.items)) {
      for (const item of craftingCost.items) {
        if (item && typeof item === "object" && typeof item.name === "string" && typeof item.count === "number") {
          itemsList.push(`${item.count}x ${item.name}`);
        }
      }
    }
  }

  const itemsStr = itemsList.length > 0 ? `\n• Extra Components: ${itemsList.join(", ")}` : "";
  return `• ${modules}x Legendary Modules${itemsStr}`;
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
    const catalog = await getCachedBuilderModCatalog();

    // Command 1: /effect <query>
    if (name === "effect") {
      const queryOption = options?.find((o: { name: string; value: string }) => o.name === "query");
      const query = queryOption?.value?.toLowerCase().trim() || "";
      const normQuery = normalizeFuzzySearchString(query);

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
            flags: 64
          }
        });
      }

      const starCount = match.starRank || 1;
      const stars = "★".repeat(starCount);
      const starLabel = `${starCount}-Star (${stars})`;

      const categoriesStr = [match.category, match.subCategory].filter(Boolean).join(" / ") || "All Equipment";
      const mathStr = formatEffectMath(match.effectMath as Record<string, unknown>);
      const craftingStr = formatCraftingCost(starCount, match.craftingCost as Record<string, unknown>);

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
                  name: "Tier Rank & Category",
                  value: `**Rank**: ${starLabel}\n**Category**: ${categoriesStr}`,
                  inline: true
                },
                {
                  name: "Calculated Stat Math",
                  value: mathStr,
                  inline: true
                },
                {
                  name: "Tinkerer's Bench Crafting Recipe",
                  value: craftingStr,
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

    // Command 2: /compare <first> <second>
    if (name === "compare") {
      const firstOpt = options?.find((o: { name: string; value: string }) => o.name === "first")?.value?.trim() || "";
      const secondOpt = options?.find((o: { name: string; value: string }) => o.name === "second")?.value?.trim() || "";

      const findMod = (q: string) => {
        const norm = normalizeFuzzySearchString(q);
        const filterable: FilterableRow[] = catalog.map((m) => ({
          effect: { name: m.name },
          tier: { label: `${m.starRank || 1} Star` },
          categories: [{ category: { name: [m.category, m.subCategory].filter(Boolean).join(" ") } }],
          description: m.description,
          unlocked: true,
          isSeeking: false,
          modCount: 1,
          modObj: m
        }));
        const res = applyFilters(filterable, { query: q, sources: [], status: [], origins: [] });
        let match: (typeof catalog)[0] | undefined = (res[0] as unknown as { modObj: (typeof catalog)[0] })?.modObj;
        if (!match) {
          match = catalog.find((m) => {
            const normName = normalizeFuzzySearchString(m.name);
            return normName === norm || normName.includes(norm) || norm.includes(normName);
          });
        }
        return match;
      };

      const mod1 = findMod(firstOpt);
      const mod2 = findMod(secondOpt);

      if (!mod1 || !mod2) {
        return NextResponse.json({
          type: 4,
          data: {
            content: `⚠️ Could not find both mods for comparison. Searching for "${firstOpt}" (${mod1 ? "✅ Found" : "❌ Not found"}) and "${secondOpt}" (${mod2 ? "✅ Found" : "❌ Not found"}).`,
            flags: 64
          }
        });
      }

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `⚔️ Legendary Mod Comparison: ${mod1.name} vs ${mod2.name}`,
              color: 0x3b82f6,
              fields: [
                {
                  name: `1. ${"★".repeat(mod1.starRank || 1)} ${mod1.name}`,
                  value: `**Category**: ${mod1.category}\n**Description**: ${mod1.description}\n**Stat Math**: ${formatEffectMath(mod1.effectMath as Record<string, unknown>)}\n**Crafting**: ${formatCraftingCost(mod1.starRank || 1, mod1.craftingCost as Record<string, unknown>)}`,
                  inline: false
                },
                {
                  name: `2. ${"★".repeat(mod2.starRank || 1)} ${mod2.name}`,
                  value: `**Category**: ${mod2.category}\n**Description**: ${mod2.description}\n**Stat Math**: ${formatEffectMath(mod2.effectMath as Record<string, unknown>)}\n**Crafting**: ${formatCraftingCost(mod2.starRank || 1, mod2.craftingCost as Record<string, unknown>)}`,
                  inline: false
                }
              ],
              footer: {
                text: "R.O.L.L. Comparison Engine · fallout76.wiki",
                icon_url: "https://fallout76.wiki/favicon-v3.png"
              }
            }
          ]
        }
      });
    }

    // Command 3: /progress <username>
    if (name === "progress") {
      const username = options?.find((o: { name: string; value: string }) => o.name === "username")?.value?.trim() || "";
      if (!username) {
        return NextResponse.json({
          type: 4,
          data: { content: "💡 Enter a R.O.L.L. username to view public tracker progress.", flags: 64 }
        });
      }

      const user = await prisma.user.findFirst({
        where: { name: { equals: username, mode: "insensitive" } },
        include: { progress: true }
      });

      if (!user) {
        return NextResponse.json({
          type: 4,
          data: {
            content: `🔍 No R.O.L.L. account found matching **"${username}"**. Sign up or link your account at **[fallout76.wiki/auth/sign-in](https://fallout76.wiki/auth/sign-in)**!`,
            flags: 64
          }
        });
      }

      const unlockedCount = user.progress.filter((p) => p.unlocked).length;
      const totalCatalog = catalog.length || 148;
      const pct = Math.round((unlockedCount / totalCatalog) * 100);

      const badge = pct >= 90 ? "🏆 Wasteland Master" : pct >= 50 ? "🛠️ Expert Armorer" : pct >= 25 ? "⚡ Veteran Craftsman" : "📻 Wasteland Novice";

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `📻 R.O.L.L. Tracker Progress: ${user.name || username}`,
              color: 0x10b981,
              fields: [
                { name: "Account Rank Badge", value: badge, inline: true },
                { name: "Mods Unlocked", value: `**${unlockedCount}** / ${totalCatalog} (${pct}%)`, inline: true },
                { name: "Tracker Profile Link", value: `[View Full Matrix Tracker](https://fallout76.wiki/summary)`, inline: false }
              ],
              footer: {
                text: "R.O.L.L. Vault Network",
                icon_url: "https://fallout76.wiki/favicon-v3.png"
              }
            }
          ]
        }
      });
    }

    // Command 4: /random [category]
    if (name === "random") {
      const catOpt = options?.find((o: { name: string; value: string }) => o.name === "category")?.value?.toLowerCase();

      const star1Pool = catalog.filter((m) => m.starRank === 1 && (!catOpt || m.category.toLowerCase() === catOpt));
      const star2Pool = catalog.filter((m) => m.starRank === 2 && (!catOpt || m.category.toLowerCase() === catOpt));
      const star3Pool = catalog.filter((m) => m.starRank === 3 && (!catOpt || m.category.toLowerCase() === catOpt));

      const pick = (arr: typeof catalog) => arr[Math.floor(Math.random() * arr.length)];

      const mod1 = pick(star1Pool) || pick(catalog.filter((m) => m.starRank === 1));
      const mod2 = pick(star2Pool) || pick(catalog.filter((m) => m.starRank === 2));
      const mod3 = pick(star3Pool) || pick(catalog.filter((m) => m.starRank === 3));

      const baseItem = catOpt === "armor" ? "Secret Service Armor" : "Fixer / Railway Rifle";

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `🎲 Random God-Roll Challenge: ${mod1.name} ${mod2.name} ${mod3.name} ${baseItem}`,
              color: 0x8b5cf6,
              fields: [
                { name: "★ 1st Star Mod", value: `**${mod1.name}**: ${mod1.description}`, inline: false },
                { name: "★★ 2nd Star Mod", value: `**${mod2.name}**: ${mod2.description}`, inline: false },
                { name: "★★★ 3rd Star Mod", value: `**${mod3.name}**: ${mod3.description}`, inline: false }
              ],
              footer: {
                text: "R.O.L.L. Randomizer Engine · Can you craft this build?",
                icon_url: "https://fallout76.wiki/favicon-v3.png"
              }
            }
          ]
        }
      });
    }

    // Command 5: /scrip <mod_count>
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

    // Command 6: /build <slug>
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

      const buildRecord = await prisma.sharedBuild.findUnique({
        where: { slug: cleanSlug }
      });

      if (!buildRecord) {
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

      const payload = buildRecord.payload as unknown as BuilderPayload;
      const baseSpecial = payload.baseSpecial || {};
      const specialStr = `**S**: ${baseSpecial.S || 1}  **P**: ${baseSpecial.P || 1}  **E**: ${baseSpecial.E || 1}  **C**: ${baseSpecial.C || 1}  **I**: ${baseSpecial.I || 1}  **A**: ${baseSpecial.A || 1}  **L**: ${baseSpecial.L || 1}`;

      const mutationsCount = (payload.mutationIds || []).length;
      const perksCount = (payload.legendaryPerkIds || []).length;

      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: `🛡️ B.U.I.L.D. Transmission: ${buildRecord.title}`,
              url: buildUrl,
              description: buildRecord.description || "Fallout 76 Character Loadout crafted on R.O.L.L.",
              color: 0x3b82f6,
              fields: [
                { name: "S.P.E.C.I.A.L. Base Stats", value: specialStr, inline: false },
                { name: "Loadout Diagnostics", value: `• **Equipment Kind**: ${payload.equipmentKind}\n• **Equipped Mutations**: ${mutationsCount}\n• **Legendary Perks**: ${perksCount}`, inline: true },
                { name: "Interactive Transmission", value: `🔗 **[View Full Interactive Loadout](${buildUrl})**`, inline: false }
              ],
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

