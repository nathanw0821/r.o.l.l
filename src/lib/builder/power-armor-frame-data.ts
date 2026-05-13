import type { ArmorSetStats } from "@/lib/builder/armor-sets";

/**
 * Max-tier (level 45/50 as applicable) ballistic / energy / radiation resists per piece.
 * Fire, cryo, and poison are not listed on the cited wiki tables; they stay at 0 here.
 *
 * Sources (Fallout Wiki | Fandom and Fallout Wiki where noted, retrieved 2026-04):
 * - T-45, T-51b, T-60, Raider, X-01, Ultracite, Hellcat, Strangler Heart, Union: per-piece “Armor parts” tables.
 * - Excavator: fallout.wiki Excavator Power Armor (max tier row totals 240/240/366).
 * - T-65: Nukapedia T-65 table (totals 2922/2069/2662 DR/ER/RR) — piece rows interpreted as DR/ER/RR columns.
 * - Vulcan: comparison totals 560/600/200 (Power armor (Fallout 76)); per-piece split using X-01 piece ratios to match sums.
 * - Hellfire prototype: no published per-piece table on Nukapedia (cosmetic/historical NW entry); **uses T-60 level 50 piece values** as a stand-in until a sourced table exists.
 *
 * Power armor chassis (always present on an occupied frame): DR 60, ER 60, RR 60 — merged in `getPowerArmorEquippedFlatStats`, not duplicated in each piece.
 * @see https://fallout.fandom.com/wiki/Power_armor_(Fallout_76)
 */

/** Chassis resists (squashed in Backwoods update to provide headroom). */
export const POWER_ARMOR_CHASSIS_STATS: ArmorSetStats = {
  dr: 6,
  er: 6,
  fr: 0,
  cr: 0,
  pr: 0,
  rr: 6
};

/** Ballistic DR, energy resist, radiation resist + optional elements (Season 24 Backwoods overhaul). */
export function paResist(
  dr: number,
  er: number,
  rr: number,
  extras: Partial<Omit<ArmorSetStats, "dr" | "er" | "rr">> = {}
): ArmorSetStats {
  return {
    dr,
    er,
    rr,
    fr: extras.fr ?? 0,
    cr: extras.cr ?? 0,
    pr: extras.pr ?? 0
  };
}

export type PowerArmorFramePieces = {
  helmet: ArmorSetStats;
  torso: ArmorSetStats;
  /** Left and right arms use the same max-tier row. */
  arm: ArmorSetStats;
  /** Left and right legs use the same max-tier row. */
  leg: ArmorSetStats;
};

/** 
 * Max-tier piece stats (Post-Backwoods March 2026 overhaul).
 * Base resists were reduced by ~90% for headroom; Rad reduction was replaced by raw stats.
 */
export const POWER_ARMOR_FRAME_PIECES: Record<string, PowerArmorFramePieces> = {
  "raider-pa": {
    helmet: paResist(5, 5, 100),
    torso: paResist(9, 9, 150),
    arm: paResist(5, 5, 100),
    leg: paResist(5, 5, 100)
  },
  t45: {
    helmet: paResist(5, 5, 120),
    torso: paResist(9, 9, 180),
    arm: paResist(5, 5, 120),
    leg: paResist(5, 5, 120)
  },
  t51: {
    // T-51b: Leans into Cryo Resistance
    helmet: paResist(7, 7, 100, { cr: 40 }),
    torso: paResist(11, 11, 150, { cr: 70 }),
    arm: paResist(7, 7, 100, { cr: 40 }),
    leg: paResist(7, 7, 100, { cr: 40 })
  },
  t60: {
    helmet: paResist(6, 6, 150),
    torso: paResist(10, 10, 250),
    arm: paResist(6, 6, 150),
    leg: paResist(6, 6, 150)
  },
  t65: {
    // T-65: Top-tier for Radiation and Energy
    helmet: paResist(44, 45, 500),
    torso: paResist(73, 75, 850),
    arm: paResist(44, 45, 500),
    leg: paResist(44, 45, 500)
  },
  excavator: {
    helmet: paResist(4, 4, 300),
    torso: paResist(6, 6, 500),
    arm: paResist(4, 4, 300),
    leg: paResist(4, 4, 300)
  },
  x01: {
    helmet: paResist(31, 40, 450),
    torso: paResist(50, 65, 750),
    arm: paResist(31, 40, 450),
    leg: paResist(31, 40, 450)
  },
  ultracite: {
    helmet: paResist(7, 6, 150),
    torso: paResist(11, 10, 250),
    arm: paResist(7, 6, 150),
    leg: paResist(7, 6, 150)
  },
  "strangler-heart": {
    // Strangler Heart: Top-tier Radiation
    helmet: paResist(6, 7, 600),
    torso: paResist(12, 10, 1000),
    arm: paResist(7, 6, 600),
    leg: paResist(7, 6, 600)
  },
  hellcat: {
    helmet: paResist(7, 5, 120),
    torso: paResist(10, 8, 180),
    arm: paResist(7, 5, 120),
    leg: paResist(7, 5, 120)
  },
  "union-pa": {
    helmet: paResist(7, 4, 100, { pr: 50 }),
    torso: paResist(12, 8, 150, { pr: 150 }),
    arm: paResist(7, 4, 100, { pr: 50 }),
    leg: paResist(7, 4, 100, { pr: 50 })
  },
  "hellfire-prototype": {
    helmet: paResist(6, 6, 150),
    torso: paResist(10, 10, 250),
    arm: paResist(6, 6, 150),
    leg: paResist(6, 6, 150)
  },
  vulcan: {
    helmet: paResist(9, 9, 100),
    torso: paResist(14, 15, 150),
    arm: paResist(9, 9, 100),
    leg: paResist(9, 9, 100)
  }
};
