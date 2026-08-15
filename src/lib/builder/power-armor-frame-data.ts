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

export type PowerArmorFrameComparisonRow = {
  key: string;
  label: string;
  stats: ArmorSetStats;
  setBonus: string;
  notes?: string;
};

export const POWER_ARMOR_FRAME_COMPARISON_ROWS: PowerArmorFrameComparisonRow[] = [
  {
    key: "hellcat",
    label: "Hellcat Power Armor",
    setBonus: "+12% Flat Ballistic Damage Reduction (Stacks to 54% total Ballistic DR)",
    notes: "Steel Reign questline reward. Best-in-slot for raw physical tanking.",
    stats: {
      dr: 6 + 7 + 10 + 7*2 + 7*2, // 51
      er: 6 + 5 + 8 + 5*2 + 5*2,  // 39
      rr: 6 + 120 + 180 + 120*2 + 120*2, // 786
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "union-pa",
    label: "Union Power Armor",
    setBonus: "+150 Poison Resistance & +75 Max Carry Weight",
    notes: "Expeditions / Stamps reward. Complete immunity to poison clouds.",
    stats: {
      dr: 6 + 7 + 12 + 7*2 + 7*2, // 53
      er: 6 + 4 + 8 + 4*2 + 4*2,  // 34
      rr: 6 + 100 + 150 + 100*2 + 100*2, // 656
      fr: 0,
      cr: 0,
      pr: 50 + 150 + 50*2 + 50*2 // 350
    }
  },
  {
    key: "excavator",
    label: "Excavator Power Armor",
    setBonus: "+100 Max Carry Weight & 4x Ore Mining Yield",
    notes: "Miner Miracles quest. Standard utility & mining workhorse.",
    stats: {
      dr: 6 + 4 + 6 + 4*2 + 4*2, // 28
      er: 6 + 4 + 6 + 4*2 + 4*2, // 28
      rr: 6 + 300 + 500 + 300*2 + 300*2, // 2006
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "t65",
    label: "T-65 Power Armor",
    setBonus: "Highest Raw Ballistic & Energy Resists in the Game",
    notes: "Vault 79 Gold Bullion. Secret Service heavy armor chassis.",
    stats: {
      dr: 6 + 44 + 73 + 44*2 + 44*2, // 299
      er: 6 + 45 + 75 + 45*2 + 45*2, // 306
      rr: 6 + 500 + 850 + 500*2 + 500*2, // 3356
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "strangler-heart",
    label: "Strangler Heart Power Armor",
    setBonus: "Acid Damage Aura on nearby targets & +Acid Poison to weapon attacks",
    notes: "Vault 94 / Gold Bullion. Ultracite frame overgrown with Strangler flora.",
    stats: {
      dr: 6 + 6 + 12 + 7*2 + 7*2, // 50
      er: 6 + 7 + 10 + 6*2 + 6*2, // 47
      rr: 6 + 600 + 1000 + 600*2 + 600*2, // 4006
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "t51",
    label: "T-51b Power Armor",
    setBonus: "High Balanced Ballistic/Energy + 230 Cryo Resistance",
    notes: "Classic pre-war military standard. Excellent cryo mitigation.",
    stats: {
      dr: 6 + 7 + 11 + 7*2 + 7*2, // 52
      er: 6 + 7 + 11 + 7*2 + 7*2, // 52
      rr: 6 + 100 + 150 + 100*2 + 100*2, // 656
      fr: 0,
      cr: 40 + 70 + 40*2 + 40*2, // 230
      pr: 0
    }
  },
  {
    key: "x01",
    label: "X-01 Power Armor",
    setBonus: "Enclave Prototype: Exceptional Energy & Radiation Defense",
    notes: "Whitespring Bunker Enclave terminal schematics.",
    stats: {
      dr: 6 + 31 + 50 + 31*2 + 31*2, // 211
      er: 6 + 40 + 65 + 40*2 + 40*2, // 271
      rr: 6 + 450 + 750 + 450*2 + 450*2, // 3006
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "ultracite",
    label: "Ultracite Power Armor",
    setBonus: "High Physical Protection against Scorchbeasts",
    notes: "Brotherhood of Steel Fort Defiance reward.",
    stats: {
      dr: 6 + 7 + 11 + 7*2 + 7*2, // 52
      er: 6 + 6 + 10 + 6*2 + 6*2, // 46
      rr: 6 + 150 + 250 + 150*2 + 150*2, // 1006
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "t60",
    label: "T-60 Power Armor",
    setBonus: "Most Cost-Effective Power Armor to Repair & Maintain",
    notes: "Brotherhood of Steel standard issue.",
    stats: {
      dr: 6 + 6 + 10 + 6*2 + 6*2, // 46
      er: 6 + 6 + 10 + 6*2 + 6*2, // 46
      rr: 6 + 150 + 250 + 150*2 + 150*2, // 1006
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "t45",
    label: "T-45 Power Armor",
    setBonus: "Standard Wasteland Frame: Readily Available",
    notes: "First generation post-war military model.",
    stats: {
      dr: 6 + 5 + 9 + 5*2 + 5*2, // 40
      er: 6 + 5 + 9 + 5*2 + 5*2, // 40
      rr: 6 + 120 + 180 + 120*2 + 120*2, // 786
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "raider-pa",
    label: "Raider Power Armor",
    setBonus: "Lowest Level Requirement (Level 15)",
    notes: "Salvaged scrap frame made by Appalachian raider gangs.",
    stats: {
      dr: 6 + 5 + 9 + 5*2 + 5*2, // 40
      er: 6 + 5 + 9 + 5*2 + 5*2, // 40
      rr: 6 + 100 + 150 + 100*2 + 100*2, // 656
      fr: 0,
      cr: 0,
      pr: 0
    }
  },
  {
    key: "vulcan",
    label: "Vulcan Power Armor",
    setBonus: "Gleaming Depths Raid Exclusive PA Frame",
    notes: "Top-tier end-game raid reward.",
    stats: {
      dr: 6 + 9 + 14 + 9*2 + 9*2, // 65
      er: 6 + 9 + 15 + 9*2 + 9*2, // 66
      rr: 6 + 100 + 150 + 100*2 + 100*2, // 656
      fr: 0,
      cr: 0,
      pr: 0
    }
  }
];

