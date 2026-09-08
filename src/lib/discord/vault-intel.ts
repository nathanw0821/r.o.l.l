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

export interface DailyResetTimers {
  noonResetUnix: number;
  eveningResetUnix: number;
  resetUtcHour: number;
}

export function getEasternParts(d: Date) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = dtf.formatToParts(d);
  const p: Record<string, string> = {};
  for (const part of parts) {
    p[part.type] = part.value;
  }
  return {
    year: parseInt(p.year, 10),
    month: parseInt(p.month, 10),
    day: parseInt(p.day, 10),
    hour: parseInt(p.hour === "24" ? "0" : p.hour, 10),
    minute: parseInt(p.minute, 10),
    second: parseInt(p.second, 10),
  };
}

export function easternToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0
): Date {
  let guess = new Date(Date.UTC(year, month - 1, day, hour + 4, minute, second));
  for (let i = 0; i < 3; i++) {
    const p = getEasternParts(guess);
    const targetMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const actualMs = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const diff = targetMs - actualMs;
    if (diff === 0) break;
    guess = new Date(guess.getTime() + diff);
  }
  return guess;
}

export function getDailyResetTimers(now = new Date()): DailyResetTimers {
  const p = getEasternParts(now);
  const todayNoonUtc = easternToUtc(p.year, p.month, p.day, 12, 0, 0);

  let nextNoonUtc: Date;
  if (now.getTime() >= todayNoonUtc.getTime()) {
    const tomorrow = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
    nextNoonUtc = easternToUtc(
      tomorrow.getUTCFullYear(),
      tomorrow.getUTCMonth() + 1,
      tomorrow.getUTCDate(),
      12,
      0,
      0
    );
  } else {
    nextNoonUtc = todayNoonUtc;
  }

  const resetUtcHour = nextNoonUtc.getUTCHours();
  const noonResetUnix = Math.floor(nextNoonUtc.getTime() / 1000);

  // 00:00 UTC (8:00 PM EST) Faction & Personal Daily Quests Reset
  const nextEveningReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  if (now.getTime() >= nextEveningReset.getTime()) {
    nextEveningReset.setUTCDate(nextEveningReset.getUTCDate() + 1);
  }
  const eveningResetUnix = Math.floor(nextEveningReset.getTime() / 1000);

  return { noonResetUnix, eveningResetUnix, resetUtcHour };
}

const SALE_DAYS = new Set([0, 1, 7, 8, 14, 15, 24, 25, 26, 27]);
const LOCATIONS = ["Foundation", "The Crater", "Fort Atlas", "The Whitespring Resort"];

export function getMinervaSchedule(now = new Date()): MinervaIntel {
  const p = getEasternParts(now);
  const todayNoonUtc = easternToUtc(p.year, p.month, p.day, 12, 0, 0);

  const resetCalendarDate = new Date(Date.UTC(p.year, p.month - 1, p.day));
  if (now.getTime() < todayNoonUtc.getTime()) {
    resetCalendarDate.setUTCDate(resetCalendarDate.getUTCDate() - 1);
  }

  // Anchor: Monday, July 12, 2021 (Day 0, Sale 1 @ Foundation)
  const startCalDate = new Date(Date.UTC(2021, 6, 12));
  const dayIndex = Math.round((resetCalendarDate.getTime() - startCalDate.getTime()) / (86400 * 1000));
  const cycleDay = ((dayIndex % 35) + 35) % 35;
  const cycleIndex = Math.floor(dayIndex / 35);

  const isActive = SALE_DAYS.has(cycleDay);

  const getNoonUtcForDayIndex = (dIdx: number) => {
    const targetCal = new Date(startCalDate.getTime() + dIdx * 86400 * 1000);
    return easternToUtc(targetCal.getUTCFullYear(), targetCal.getUTCMonth() + 1, targetCal.getUTCDate(), 12, 0, 0);
  };

  if (isActive) {
    let blockSaleIndex = 0;
    let endDay = dayIndex;
    let isBigSale = false;

    if (cycleDay <= 1) {
      blockSaleIndex = 0;
      endDay = dayIndex + (2 - cycleDay);
    } else if (cycleDay <= 8) {
      blockSaleIndex = 1;
      endDay = dayIndex + (9 - cycleDay);
    } else if (cycleDay <= 15) {
      blockSaleIndex = 2;
      endDay = dayIndex + (16 - cycleDay);
    } else {
      blockSaleIndex = 3;
      endDay = dayIndex + (28 - cycleDay);
      isBigSale = true;
    }

    const totalSalesBefore = cycleIndex * 4 + blockSaleIndex;
    const listNumber = (totalSalesBefore % 24) + 1;
    const location = LOCATIONS[blockSaleIndex];
    const endUtc = getNoonUtcForDayIndex(endDay);

    return {
      status: isBigSale ? "active_big_sale" : "active_emporium",
      statusText: isBigSale
        ? `🟡 **BIG SALE Active Now at ${location}**`
        : `🟢 **Active Now at ${location}**`,
      location,
      saleType: isBigSale
        ? `Minerva's Super Big Sale (Sale #${listNumber})`
        : `Minerva's Emporium (Sale #${listNumber})`,
      listNumber,
      nextEventUnix: Math.floor(endUtc.getTime() / 1000),
      nextEventLabel: isBigSale ? "Big Sale Concludes" : "Departs Appalachia",
    };
  }

  // Not active: traveling / resting
  let nextCycleDay = 0;
  let nextBlockSaleIndex = 0;
  let isBigSale = false;

  if (cycleDay < 7) {
    nextCycleDay = 7;
    nextBlockSaleIndex = 1;
  } else if (cycleDay < 14) {
    nextCycleDay = 14;
    nextBlockSaleIndex = 2;
  } else if (cycleDay < 24) {
    nextCycleDay = 24;
    nextBlockSaleIndex = 3;
    isBigSale = true;
  } else {
    // 28..34 -> next is Day 35 (Day 0 of next 35-day block)
    nextCycleDay = 35;
    nextBlockSaleIndex = 0;
  }

  const daysUntilNext = nextCycleDay - cycleDay;
  const nextDayIndex = dayIndex + daysUntilNext;
  const nextCycleIndex = Math.floor(nextDayIndex / 35);
  const nextTotalSalesBefore = nextCycleIndex * 4 + nextBlockSaleIndex;
  const nextListNumber = (nextTotalSalesBefore % 24) + 1;
  const nextLocation = LOCATIONS[nextBlockSaleIndex];
  const nextArrivalUtc = getNoonUtcForDayIndex(nextDayIndex);

  return {
    status: "traveling",
    statusText: isBigSale
      ? "🔴 **Traveling & Preparing Big Sale**"
      : "🔴 **Resting & Sourcing Inventory**",
    location: nextLocation,
    saleType: isBigSale
      ? `Upcoming: Minerva's Big Sale #${nextListNumber}`
      : `Upcoming: Minerva's Emporium (Sale #${nextListNumber})`,
    listNumber: nextListNumber,
    nextEventUnix: Math.floor(nextArrivalUtc.getTime() / 1000),
    nextEventLabel: isBigSale ? "Arrives at Whitespring" : `Arrives at ${nextLocation}`,
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
        name: "🧭 Minerva Rotation Schedule",
        value:
          "• **Weeks 1–3**: Mon 12:00 PM ET – Wed 12:00 PM ET (Foundation, Crater, Fort Atlas)\n" +
          "• **Week 4 (Big Sale)**: Thu 12:00 PM ET – Mon 12:00 PM ET (The Whitespring Resort)\n" +
          "• **Week 5**: Off-week (Resting & Sourcing Inventory)\n" +
          "• Full 24-sale rotation spans 30 weeks (6 blocks of 5 weeks).\n" +
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
