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

/** Chassis resists applied whenever the builder uses a power-armor frame (wiki: adds 60/60/60 to armor-only totals). */
export const POWER_ARMOR_CHASSIS_STATS: ArmorSetStats = {
  dr: 60,
  er: 60,
  fr: 0,
  cr: 0,
  pr: 0,
  rr: 60
};

/** Ballistic DR, energy resist, radiation resist (FO76 convention). */
export function paResist(dr: number, er: number, rr: number): ArmorSetStats {
  return { dr, er, fr: 0, cr: 0, pr: 0, rr };
}

export type PowerArmorFramePieces = {
  helmet: ArmorSetStats;
  torso: ArmorSetStats;
  /** Left and right arms use the same max-tier row. */
  arm: ArmorSetStats;
  /** Left and right legs use the same max-tier row. */
  leg: ArmorSetStats;
};

/** Max-tier piece stats keyed by `powerArmorFrameFromPieceId` frame id. */
export const POWER_ARMOR_FRAME_PIECES: Record<string, PowerArmorFramePieces> = {
  "raider-pa": {
    helmet: paResist(51, 51, 51),
    torso: paResist(86, 86, 86),
    arm: paResist(51, 51, 51),
    leg: paResist(51, 51, 51)
  },
  t45: {
    helmet: paResist(54, 54, 54),
    torso: paResist(90, 90, 90),
    arm: paResist(54, 54, 54),
    leg: paResist(54, 54, 54)
  },
  t51: {
    helmet: paResist(68, 68, 49),
    torso: paResist(114, 114, 65),
    arm: paResist(68, 68, 49),
    leg: paResist(68, 68, 49)
  },
  t60: {
    helmet: paResist(60, 55, 60),
    torso: paResist(100, 95, 115),
    arm: paResist(60, 55, 60),
    leg: paResist(60, 55, 60)
  },
  t65: {
    helmet: paResist(438, 313, 399),
    torso: paResist(732, 504, 667),
    arm: paResist(438, 313, 399),
    leg: paResist(438, 313, 399)
  },
  excavator: {
    helmet: paResist(36, 36, 55),
    torso: paResist(60, 60, 91),
    arm: paResist(36, 36, 55),
    leg: paResist(36, 36, 55)
  },
  x01: {
    helmet: paResist(313, 362, 362),
    torso: paResist(504, 607, 607),
    arm: paResist(313, 362, 362),
    leg: paResist(313, 362, 362)
  },
  ultracite: {
    helmet: paResist(68, 59, 59),
    torso: paResist(113, 98, 98),
    arm: paResist(68, 59, 59),
    leg: paResist(68, 59, 59)
  },
  "strangler-heart": {
    helmet: paResist(58, 69, 75),
    torso: paResist(115, 96, 125),
    arm: paResist(70, 57, 75),
    leg: paResist(70, 57, 75)
  },
  hellcat: {
    helmet: paResist(68, 48, 48),
    torso: paResist(96, 80, 80),
    arm: paResist(68, 48, 48),
    leg: paResist(68, 48, 48)
  },
  "union-pa": {
    helmet: paResist(74, 44, 40),
    torso: paResist(115, 75, 65),
    arm: paResist(74, 44, 40),
    leg: paResist(74, 44, 40)
  },
  /** Stand-in: Nukapedia has no sourced piece table; matches T-60 level 50 until replaced. */
  "hellfire-prototype": {
    helmet: paResist(60, 55, 60),
    torso: paResist(100, 95, 115),
    arm: paResist(60, 55, 60),
    leg: paResist(60, 55, 60)
  },
  vulcan: {
    helmet: paResist(85, 90, 30),
    torso: paResist(136, 150, 50),
    arm: paResist(85, 90, 30),
    leg: paResist(85, 90, 30)
  }
};
