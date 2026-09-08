export interface NukeCodes {
  alpha: string;
  bravo: string;
  charlie: string;
  resetUnix: number;
  source: string;
}

export interface MinervaIntel {
  status: "active_emporium" | "active_big_sale" | "traveling";
  statusText: string;
  location: string;
  saleType: string;
  listNumber: number;
  nextEventUnix: number;
  nextEventLabel: string;
}

export function getNextNukeReset(): number {
  const now = new Date();
  const nextTuesday = new Date(now);
  const currentDay = now.getUTCDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ...
  let daysUntilTuesday = (2 - currentDay + 7) % 7;
  // If today is Tuesday and past 00:00 UTC, next reset is in 7 days
  if (daysUntilTuesday === 0 && (now.getUTCHours() > 0 || now.getUTCMinutes() > 0)) {
    daysUntilTuesday = 7;
  }
  nextTuesday.setUTCDate(nextTuesday.getUTCDate() + daysUntilTuesday);
  nextTuesday.setUTCHours(0, 0, 0, 0);
  return Math.floor(nextTuesday.getTime() / 1000);
}

export async function fetchNukeCodes(): Promise<NukeCodes> {
  const resetUnix = getNextNukeReset();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch("https://www.falloutbuilds.com/fo76/nuke-codes/", {
      signal: controller.signal,
      headers: {
        "User-Agent": "ROLL-Appalachian-Vault-Bot/1.0 (+https://fallout76.wiki)",
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const alphaMatch = html.match(/<small>ALPHA<\/small><br>([0-9\s]+)<\/div>/i);
      const bravoMatch = html.match(/<small>BRAVO<\/small><br>([0-9\s]+)<\/div>/i);
      const charlieMatch = html.match(/<small>CHARLIE<\/small><br>([0-9\s]+)<\/div>/i);

      if (alphaMatch && bravoMatch && charlieMatch) {
        return {
          alpha: alphaMatch[1].trim(),
          bravo: bravoMatch[1].trim(),
          charlie: charlieMatch[1].trim(),
          resetUnix,
          source: "Appalachia Decrypted Recon",
        };
      }
    }
  } catch (err) {
    console.warn("[vault-intel] Could not fetch live nuke codes:", err);
  }

  // Fallback if network scrape fails
  return {
    alpha: "349 59 739",
    bravo: "337 01 503",
    charlie: "984 69 385",
    resetUnix,
    source: "Fallback Field Holotape",
  };
}

export function getDailyResetTimers() {
  const now = new Date();

  // 16:00 UTC (12:00 PM EST) Economy & Vendor Pool Reset
  const nextNoonReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16, 0, 0));
  if (now.getTime() >= nextNoonReset.getTime()) {
    nextNoonReset.setUTCDate(nextNoonReset.getUTCDate() + 1);
  }
  const noonResetUnix = Math.floor(nextNoonReset.getTime() / 1000);

  // 00:00 UTC (8:00 PM EST) Faction & Personal Daily Quests Reset
  const nextEveningReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  if (now.getTime() >= nextEveningReset.getTime()) {
    nextEveningReset.setUTCDate(nextEveningReset.getUTCDate() + 1);
  }
  const eveningResetUnix = Math.floor(nextEveningReset.getTime() / 1000);

  return { noonResetUnix, eveningResetUnix };
}

export function getMinervaSchedule(now = new Date()): MinervaIntel {
  // Reference cycle anchor: Monday, Sep 14, 2026 16:00 UTC starts List 1 (Foundation)
  const anchorTime = Date.UTC(2026, 8, 14, 16, 0, 0); // Month is 0-indexed (8 = Sep)
  const msInWeek = 7 * 24 * 60 * 60 * 1000;

  const dayOfWeek = now.getUTCDay();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const nowTime = now.getTime();

  const diffWeeks = Math.floor((nowTime - anchorTime) / msInWeek);
  const cycleWeek = ((diffWeeks % 4) + 4) % 4; // 0 = Week 1, 1 = Week 2, 2 = Week 3, 3 = Week 4 (Big Sale)

  const locations = ["Foundation", "The Crater", "Fort Atlas", "The Whitespring Resort"];

  // Monday 16:00 UTC to Wednesday 16:00 UTC: Emporium (Weeks 0, 1, 2)
  const isEmporiumTime =
    (dayOfWeek === 1 && utcHours >= 16) ||
    dayOfWeek === 2 ||
    (dayOfWeek === 3 && (utcHours < 16 || (utcHours === 16 && utcMinutes === 0)));

  // Thursday 16:00 UTC to Monday 16:00 UTC: Big Sale (Week 3)
  const isBigSaleTime =
    (dayOfWeek === 4 && utcHours >= 16) ||
    dayOfWeek === 5 ||
    dayOfWeek === 6 ||
    dayOfWeek === 0 ||
    (dayOfWeek === 1 && (utcHours < 16 || (utcHours === 16 && utcMinutes === 0)));

  if (cycleWeek < 3 && isEmporiumTime) {
    const listNum = cycleWeek + 1;
    const loc = locations[cycleWeek];
    const end = new Date(now);
    const daysUntilWed = (3 - dayOfWeek + 7) % 7;
    end.setUTCDate(end.getUTCDate() + daysUntilWed);
    end.setUTCHours(16, 0, 0, 0);

    return {
      status: "active_emporium",
      statusText: `🟢 **Active Now at ${loc}**`,
      location: loc,
      saleType: `Minerva's Emporium (Sale #${listNum})`,
      listNumber: listNum,
      nextEventUnix: Math.floor(end.getTime() / 1000),
      nextEventLabel: "Departs Appalachia",
    };
  }

  if (cycleWeek === 3 && isBigSaleTime) {
    const end = new Date(now);
    const daysUntilMon = (1 - dayOfWeek + 7) % 7 || (dayOfWeek === 1 && utcHours < 16 ? 0 : 7);
    end.setUTCDate(end.getUTCDate() + daysUntilMon);
    end.setUTCHours(16, 0, 0, 0);

    return {
      status: "active_big_sale",
      statusText: `🟡 **BIG SALE Active Now at The Whitespring Resort**`,
      location: "The Whitespring Resort",
      saleType: "Minerva's Super Big Sale (Sale #4)",
      listNumber: 4,
      nextEventUnix: Math.floor(end.getTime() / 1000),
      nextEventLabel: "Big Sale Concludes",
    };
  }

  const nextArrival = new Date(now);
  if (cycleWeek === 3 && dayOfWeek < 4) {
    const daysUntilThu = (4 - dayOfWeek + 7) % 7;
    nextArrival.setUTCDate(nextArrival.getUTCDate() + daysUntilThu);
    nextArrival.setUTCHours(16, 0, 0, 0);
    return {
      status: "traveling",
      statusText: `🔴 **Traveling & Preparing Big Sale**`,
      location: "The Whitespring Resort",
      saleType: "Upcoming: Minerva's Big Sale #4",
      listNumber: 4,
      nextEventUnix: Math.floor(nextArrival.getTime() / 1000),
      nextEventLabel: "Arrives at Whitespring",
    };
  }

  const daysUntilMon = (1 - dayOfWeek + 7) % 7 || 7;
  nextArrival.setUTCDate(nextArrival.getUTCDate() + daysUntilMon);
  nextArrival.setUTCHours(16, 0, 0, 0);
  const nextCycleWeek = (cycleWeek + 1) % 4;
  const nextLoc = locations[nextCycleWeek];

  return {
    status: "traveling",
    statusText: `🔴 **Resting & Sourcing Inventory**`,
    location: nextLoc,
    saleType: `Upcoming: Minerva's Emporium (Sale #${nextCycleWeek + 1})`,
    listNumber: nextCycleWeek + 1,
    nextEventUnix: Math.floor(nextArrival.getTime() / 1000),
    nextEventLabel: `Arrives at ${nextLoc}`,
  };
}

export function buildNukeDiscordEmbed(codes: NukeCodes) {
  return {
    title: "☢️ ENCLAVE MISSILE SILO LAUNCH CODES",
    url: "https://fallout76.wiki",
    description:
      "**Appalachia Nuclear Silo Encryption Clearance:**\n" +
      "Active launch codes decrypted for Site Alpha, Site Bravo, and Site Charlie. Enter these codes at the Launch Control Terminal once the launch prep sequence is verified.\n",
    color: 0x8b5cf6, // Enclave Violet
    fields: [
      {
        name: "🚀 Site Alpha Code",
        value: `\`\`\`css\n[ ${codes.alpha} ]\n\`\`\``,
        inline: true,
      },
      {
        name: "🚀 Site Bravo Code",
        value: `\`\`\`css\n[ ${codes.bravo} ]\n\`\`\``,
        inline: true,
      },
      {
        name: "🚀 Site Charlie Code",
        value: `\`\`\`css\n[ ${codes.charlie} ]\n\`\`\``,
        inline: true,
      },
      {
        name: "⏱️ Weekly Code Expiration",
        value: `Codes rotate: <t:${codes.resetUnix}:R> (<t:${codes.resetUnix}:F>)\nCodes reset every Tuesday at 00:00 UTC (8:00 PM EST Monday).`,
        inline: false,
      },
      {
        name: "🎯 Silo Protocol & Keycards",
        value:
          "• **Nuclear Keycard Required**: 1 keycard consumed per launch attempt.\n" +
          "• **Cooldowns**: 3-hour personal silo lockout, 2-hour server silo cooldown.\n" +
          "• **Nuke Targets**: Fissure Site Prime (Scorchbeast Queen), Monongah Mine (A Colossal Problem), Abandoned Mine Shaft 2 (Seismic Activity), Neurological Warfare (Storm Shed).",
        inline: false,
      },
    ],
    footer: {
      text: `Enclave Defense Network · ${codes.source} · fallout76.wiki`,
      icon_url: "https://fallout76.wiki/favicon-v3.png",
    },
  };
}

export function buildMinervaDiscordEmbed(minerva: MinervaIntel) {
  return {
    title: "🎪 MINERVA TRAVELING MERCHANT RADAR",
    url: "https://fallout76.wiki",
    description:
      "**Minerva Gold Bullion Station Status:**\n" +
      `${minerva.statusText}\n\n` +
      `• **Current Station**: **${minerva.location}**\n` +
      `• **Classification**: **${minerva.saleType}**\n` +
      `• **${minerva.nextEventLabel}**: <t:${minerva.nextEventUnix}:R> (<t:${minerva.nextEventUnix}:F>)`,
    color: 0x10b981, // Emerald Green
    fields: [
      {
        name: "💰 Gold Bullion Economy Discount",
        value:
          "Minerva sells rare plans at a **25% discount** compared to Regs (Vault 79), Samuel (Foundation), or Mortimer (Crater).",
        inline: false,
      },
      {
        name: "📦 Featured Inventory Categories",
        value:
          "• Secret Service Armor & Jet Pack\n" +
          "• Gauss Shotgun, Minigun & Pistol Weapon Mods\n" +
          "• Crusader Pistol & Plasma Caster Mods\n" +
          "• Brotherhood Recon & Thorn/Solar Schematics",
        inline: false,
      },
      {
        name: "🧭 Weekly Rotation Schedule",
        value:
          "• **Weeks 1–3**: Mon 12:00 PM EST – Wed 12:00 PM EST (Standard Emporium)\n" +
          "• **Week 4 (Super Sale)**: Thu 12:00 PM EST – Mon 12:00 PM EST (The Whitespring)\n" +
          "• Run `/daily` or `/minerva` at any time for live countdowns!",
        inline: false,
      },
    ],
    footer: {
      text: "Minerva Merchant Intelligence · fallout76.wiki",
      icon_url: "https://fallout76.wiki/favicon-v3.png",
    },
  };
}
