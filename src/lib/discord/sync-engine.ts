import {
  fetchNukeCodes,
  buildNukeDiscordEmbed,
  getMinervaSchedule,
  buildMinervaDiscordEmbed,
} from "./vault-intel";

export const VAULT_CHANNELS = {
  ENTRANCE: "1546472794970390540",
  DIRECTIVES: "1546472798216650795",
  RADIO: "1546472800733237298",
  ENCLAVE: "1546472826868072529",
} as const;

const DISCORD_API = "https://discord.com/api/v10";

interface DiscordMessage {
  id: string;
  type: number;
  content?: string;
  embeds?: Array<{
    title?: string;
    url?: string;
    description?: string;
    fields?: Array<{ name: string; value: string }>;
  }>;
  pinned?: boolean;
}

async function discordFetch<T = unknown>(
  endpoint: string,
  botToken: string,
  options: RequestInit = {}
): Promise<T | null> {
  const res = await fetch(`${DISCORD_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Discord API Error [${res.status} ${res.statusText}] on ${endpoint}: ${errorText}`);
  }

  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

async function getChannelMessages(channelId: string, botToken: string, limit = 50): Promise<DiscordMessage[]> {
  try {
    const msgs = await discordFetch<DiscordMessage[]>(`/channels/${channelId}/messages?limit=${limit}`, botToken);
    return msgs || [];
  } catch (err) {
    console.warn(`Could not retrieve messages for channel ${channelId}:`, err);
    return [];
  }
}

async function cleanPinSystemNotifications(channelId: string, botToken: string) {
  const msgs = await getChannelMessages(channelId, botToken, 25);
  for (const m of msgs) {
    if (m.type === 6) {
      try {
        await discordFetch(`/channels/${channelId}/messages/${m.id}`, botToken, { method: "DELETE" });
        await new Promise((r) => setTimeout(r, 200));
      } catch {
        // ignore
      }
    }
  }
}

async function syncPinnedCard(
  channelId: string,
  embedPayload: Record<string, unknown>,
  titleKeyword: string,
  botToken: string
): Promise<{ id: string; action: "created" | "updated" }> {
  const messages = await getChannelMessages(channelId, botToken, 50);
  const matching = messages.filter((m) =>
    m.embeds?.some((e) => e.title && e.title.toLowerCase().includes(titleKeyword.toLowerCase()))
  );

  let targetId: string;
  let action: "created" | "updated";

  if (matching.length > 0) {
    const primary = matching[0];
    targetId = primary.id;
    action = "updated";

    await discordFetch(`/channels/${channelId}/messages/${targetId}`, botToken, {
      method: "PATCH",
      body: JSON.stringify({ embeds: [embedPayload] }),
    });

    if (!primary.pinned) {
      try {
        await discordFetch(`/channels/${channelId}/pins/${targetId}`, botToken, { method: "PUT" });
      } catch (e) {
        console.warn(`Could not pin message ${targetId}:`, e);
      }
    }

    if (matching.length > 1) {
      for (let i = 1; i < matching.length; i++) {
        try {
          await discordFetch(`/channels/${channelId}/messages/${matching[i].id}`, botToken, { method: "DELETE" });
          await new Promise((r) => setTimeout(r, 250));
        } catch {
          // ignore
        }
      }
    }
  } else {
    action = "created";
    const created = (await discordFetch<{ id: string }>(`/channels/${channelId}/messages`, botToken, {
      method: "POST",
      body: JSON.stringify({ embeds: [embedPayload] }),
    })) as { id: string };

    targetId = created.id;
    try {
      await discordFetch(`/channels/${channelId}/pins/${targetId}`, botToken, { method: "PUT" });
    } catch {
      // ignore
    }
  }

  await cleanPinSystemNotifications(channelId, botToken);
  return { id: targetId, action };
}

interface SteamNewsItem {
  url: string;
  title: string;
  contents?: string;
  date: number;
}

interface SteamNewsResponse {
  appnews?: {
    newsitems?: SteamNewsItem[];
  };
}

async function fetchSteamOfficialNews(): Promise<SteamNewsItem[]> {
  try {
    const res = await fetch(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=1151340&count=5&feeds=steam_community_announcements&format=json"
    );
    const data = (await res.json()) as SteamNewsResponse;
    return data?.appnews?.newsitems || [];
  } catch (e) {
    console.error("Error fetching Steam news:", e);
    return [];
  }
}

function cleanBBCode(text: string): string {
  return text
    .replace(/\[b\](.*?)\[\/b\]/gi, "**$1**")
    .replace(/\[i\](.*?)\[\/i\]/gi, "*$1*")
    .replace(/\[p.*?\]/gi, "")
    .replace(/\[\/p\]/gi, "\n\n")
    .replace(/\[list\]/gi, "")
    .replace(/\[\/list\]/gi, "")
    .replace(/\[\*\]/gi, "• ")
    .replace(/\[img\].*?\[\/img\]/gi, "")
    .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "[$2]($1)")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function syncRadioFeed(botToken: string): Promise<number> {
  const existingMessages = await getChannelMessages(VAULT_CHANNELS.RADIO, botToken, 25);
  const existingUrls = new Set<string>();
  const existingTitles = new Set<string>();

  for (const msg of existingMessages) {
    for (const embed of msg.embeds || []) {
      if (embed.url) existingUrls.add(embed.url);
      if (embed.title) existingTitles.add(embed.title.replace(/^📢\s*/, "").trim());
    }
  }

  const steamNews = await fetchSteamOfficialNews();
  const newItems = steamNews.filter(
    (item: { url: string; title: string }) =>
      !existingUrls.has(item.url) && !existingTitles.has(item.title.trim())
  );

  if (newItems.length === 0) return 0;

  for (const item of newItems.reverse()) {
    const rawSnippet = cleanBBCode(item.contents || "");
    const snippet = rawSnippet.length > 350 ? rawSnippet.slice(0, 350) + "…" : rawSnippet;
    const dateFormatted = new Date(item.date * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    await discordFetch(`/channels/${VAULT_CHANNELS.RADIO}/messages`, botToken, {
      method: "POST",
      body: JSON.stringify({
        embeds: [
          {
            title: `📢 ${item.title}`,
            url: item.url,
            description: `${snippet}\n\n[Read Full Announcement on Steam](${item.url})`,
            color: 0x3b82f6,
            fields: [
              { name: "Source", value: "Bethesda Game Studios (Official)", inline: true },
              { name: "Release Date", value: dateFormatted, inline: true },
            ],
            footer: {
              text: "Appalachian Radio · Official Broadcast Network",
              icon_url: "https://fallout76.wiki/favicon-v3.png",
            },
          },
        ],
      }),
    });
    await new Promise((r) => setTimeout(r, 400));
  }

  return newItems.length;
}

export async function reconcileDiscordVault(botToken: string) {
  if (!botToken) {
    throw new Error("Missing bot token for Discord vault reconciliation.");
  }

  // 1. Vault Entrance
  const entranceEmbed = {
    title: "📻 WELCOME TO THE R.O.L.L. APPALACHIAN VAULT",
    url: "https://fallout76.wiki",
    description:
      "Welcome to the official community hub for **R.O.L.L. (Record Of Legendary Loadouts)**!\n\n" +
      "Built for Fallout 76 theorycrafters, min-maxers, and wasteland builders. Here you can plan 1★–4★ legendary crafting box mods, optimize perk card decks, and calculate combat damage resistance.",
    color: 0xf59e0b,
    fields: [
      {
        name: "🌐 Live Platform Terminal Links",
        value:
          "• **Main Frame & Mod Tracker**: [fallout76.wiki](https://fallout76.wiki)\n" +
          "• **B.U.I.L.D. Sandbox Engine**: [fallout76.wiki/build](https://fallout76.wiki/build)\n" +
          "• **P.E.R.K. Deck Deckbuilder**: [fallout76.wiki/perks](https://fallout76.wiki/perks)\n" +
          "• **Combat Firepower Matrix**: [fallout76.wiki/calculator](https://fallout76.wiki/calculator)\n" +
          "• **Truth Wiki Knowledgebase**: [fallout76.wiki/wiki](https://fallout76.wiki/wiki)",
        inline: false,
      },
      {
        name: "📟 Pip-Boy Integrated Slash Commands",
        value:
          "Head to <#1546472822702870558> and type:\n" +
          "`/effect` · Search 148+ legendary effects & star ranks (1★–4★)\n" +
          "`/craft` · Tinkerer's Bench crafting material requirements\n" +
          "`/nuke` · Decrypted weekly nuclear silo launch codes (Alpha, Bravo, Charlie)\n" +
          "`/minerva` · Live Minerva location, sale tier & Gold Bullion discounts\n" +
          "`/daily` · Live Daily Reset & vendor countdowns\n" +
          "`/perk` · Search all 319 official Vault Boy perk cards\n" +
          "`/build` · Transmit interactive character build loadouts\n" +
          "`/wiki` · Search 3,300+ Truth Wiki database guides",
        inline: false,
      },
      {
        name: "🧭 Station Navigation",
        value:
          "1. Review <#1546472798216650795> for vault protocol.\n" +
          "2. Grab a drink and chat at <#1546472804957028394>.\n" +
          "3. Share your loadout codes in <#1546472811563065384>!\n" +
          "4. Drop into voice comms for **Daily Ops**, **Expeditions**, or **Raids**!",
        inline: false,
      },
    ],
    footer: {
      text: "Vault-Tec Approved · Pip-Boy Synchronized · fallout76.wiki",
      icon_url: "https://fallout76.wiki/favicon-v3.png",
    },
  };
  const entrance = await syncPinnedCard(
    VAULT_CHANNELS.ENTRANCE,
    entranceEmbed,
    "WELCOME TO THE R.O.L.L. APPALACHIAN VAULT",
    botToken
  );

  // 2. Overseer Directives
  const directivesEmbed = {
    title: "📜 OVERSEER DIRECTIVES & PROTOCOL",
    description:
      "To maintain peace, order, and high signal across Appalachia, all dwellers must follow these directives:",
    color: 0x10b981,
    fields: [
      {
        name: "Directive 1: Respect Fellow Dwellers",
        value: "No harassment, hate speech, or toxic conduct. Appalachia is dangerous enough without infighting.",
        inline: false,
      },
      {
        name: "Directive 2: Honest Trading at the Rusty Pick",
        value: "Keep all box mod trades in <#1546472814830293043>. Real-money trading (RMT) or scamming will result in an immediate permanent ban.",
        inline: false,
      },
      {
        name: "Directive 3: Organized Radio Channels",
        value: "Use <#1546472811563065384> for builds, <#1546472817246076971> for PC/Linux talk, and <#1546472822702870558> for bot spam.",
        inline: false,
      },
      {
        name: "Directive 4: No Duplication Exploits",
        value: "Discussing verified game mechanics, datamines, and formulas is welcomed; spreading game-breaking dupes is strictly forbidden.",
        inline: false,
      },
      {
        name: "Directive 5: Bethesda Fan Content Notice",
        value: "Fallout 76 and related trademarks are registered to Bethesda Softworks / ZeniMax Media. R.O.L.L. is an independent community fan tool.",
        inline: false,
      },
    ],
    footer: {
      text: "Overseer Directives · Appalachia Reclamation",
      icon_url: "https://fallout76.wiki/favicon-v3.png",
    },
  };
  const directives = await syncPinnedCard(
    VAULT_CHANNELS.DIRECTIVES,
    directivesEmbed,
    "OVERSEER DIRECTIVES & PROTOCOL",
    botToken
  );

  // 3. Appalachian Radio
  const newAnnouncements = await syncRadioFeed(botToken);

  // 4. Enclave Transmissions
  const nukeCodes = await fetchNukeCodes();
  const nukeEmbed = buildNukeDiscordEmbed(nukeCodes);
  const nukeCard = await syncPinnedCard(
    VAULT_CHANNELS.ENCLAVE,
    nukeEmbed,
    "ENCLAVE MISSILE SILO LAUNCH CODES",
    botToken
  );

  const minervaInfo = getMinervaSchedule();
  const minervaEmbed = buildMinervaDiscordEmbed(minervaInfo);
  const minervaCard = await syncPinnedCard(
    VAULT_CHANNELS.ENCLAVE,
    minervaEmbed,
    "MINERVA TRAVELING MERCHANT RADAR",
    botToken
  );

  const datamineEmbed = {
    title: "☢️ GROUND-TRUTH DATAMINE: The Slasher & 4★ Legendary Crafting",
    url: "https://fallout76.wiki/all-effects",
    description:
      "**Verified In-Game Mechanics & Crafting Parameters:**\n\n" +
      "• **Legendary Crafting Star Cap**: Live game crafting allows **1★, 2★, 3★, and 4★** modifications at the Tinkerer's Bench.\n" +
      "• **Modular Scrip Costs**: Standard cost per module is currently **15 modules (1★), 30 modules (2★), 60 modules (3★)**.\n" +
      "• **Deconstruction Learn Chance**: 1% base chance to learn recipe permanently, 1.5% chance to drop box mod on scrap.\n\n" +
      "Check all verified effect tables and recipes live on [fallout76.wiki/all-effects](https://fallout76.wiki/all-effects).",
    color: 0x8b5cf6,
    fields: [
      { name: "Classification", value: "Ground-Truth Datamine", inline: true },
      { name: "Live Patch Status", value: "Active Live Servers (4★ Cap)", inline: true },
    ],
    footer: {
      text: "Enclave Transmission Hub · Ground-Truth Intelligence",
      icon_url: "https://fallout76.wiki/favicon-v3.png",
    },
  };
  const datamineCard = await syncPinnedCard(
    VAULT_CHANNELS.ENCLAVE,
    datamineEmbed,
    "GROUND-TRUTH DATAMINE",
    botToken
  );

  return {
    ok: true,
    timestamp: new Date().toISOString(),
    newAnnouncements,
    cards: {
      entrance: entrance.action,
      directives: directives.action,
      nukeCodes: nukeCard.action,
      minerva: minervaCard.action,
      datamine: datamineCard.action,
    },
  };
}
