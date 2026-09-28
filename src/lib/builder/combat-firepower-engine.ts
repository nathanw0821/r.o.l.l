import type { BuilderModDTO, BuilderWeaponInnateCrafting } from "@/lib/builder/types";
import { calculateWeaponInnateAggregate } from "@/lib/builder/weapon-piece-mods";
import {
  calculateCritFrequency,
  calculateEffectiveArmor,
  calculateMitigatedDamage,
  calculatePaperDamage
} from "@/lib/calculator/creation-engine-math";
import { requireEffectNumber } from "@/lib/truth/legendary-effect-model";
import { normalizeActiveBuffs } from "@/lib/builder/buff-id-normalize";
import { getWeaponInnateModOption } from "@/lib/builder/weapon-piece-mods";
import weakSpotTruth from "@/data/truth/weak-spot.json";
import combatConditionsTruth from "@/data/truth/combat-conditions.json";
import characterStats from "@/data/truth/character-stats.json";
import { lerpSpecial } from "@/lib/builder/perk-defensive-layer";
import {
  resolveUniqueForBuilderId,
  type UniqueEffectKind,
  type UniqueEffectModel,
  type UniqueItem,
} from "@/lib/truth/unique-items";
import {
  TARGET_DUMMY_CATALOG,
  WEAPON_ALIASES,
  WEAPON_COMBAT_BASE_CATALOG,
  type BossTargetDummy,
  type TargetDummyTag,
  type WeaponCombatBaseStats,
  type WeaponDamageType
} from "./combat-firepower-catalog";

/**
 * Every legendary-effect number this engine uses comes from the truth pack
 * `src/data/truth/legendary-effect-model.json` (loader: `@/lib/truth/legendary-effect-model`).
 * Nothing below is a second copy of a game value — change the pack, not this file,
 * and regenerate `__fixtures__/firepower/goldens.json` on purpose when a number moves.
 *
 * Perk, consumable, mutation and sneak-attack numbers are NOT legendary effects
 * and stay in this file until they get packs of their own.
 *
 * Unique-weapon innates come from the truth pack `src/data/truth/unique-items.json`
 * (loader: `@/lib/truth/unique-items`). The engine applies the `model` block of
 * the equipped unique and nothing else; a unique whose innate is reference-only
 * (`model: null`) is shown as text on the gear card and never touches a number.
 */
const LEG = {
  bloodiedCap: requireEffectNumber("bloodied", "cap"),
  bloodiedCapAtMissingHealth: requireEffectNumber("bloodied", "capAtMissingHealth"),
  antiArmorPenPct: requireEffectNumber("anti-armor", "value"),
  aristocratsMax: requireEffectNumber("aristocrats", "value"),
  aristocratsCapAtCaps: requireEffectNumber("aristocrats", "capThreshold"),
  twoShot: requireEffectNumber("two-shot", "value"),
  quadMagMultiplier: requireEffectNumber("quad", "value"),
  rapidFireRateMultiplier: requireEffectNumber("rapid", "value"),
  explosiveBaseFraction: requireEffectNumber("explosive", "value"),
  vitalCrit: requireEffectNumber("vital", "value"),
  vatsOptimizedApMultiplier: requireEffectNumber("vats-optimized", "value"),
  nocturnal: requireEffectNumber("nocturnal", "value"),
  stalkers: requireEffectNumber("stalkers", "value"),
  hitmans: requireEffectNumber("hitmans", "value"),
  heavyHitters: requireEffectNumber("heavy-hitters", "value"),
  steady: requireEffectNumber("steady", "value"),
  junkiesPerAddiction: requireEffectNumber("junkies", "perUnit"),
  junkiesCap: requireEffectNumber("junkies", "cap"),
  juggernautsCap: requireEffectNumber("juggernauts", "cap"),
  juggernautsThreshold: requireEffectNumber("juggernauts", "threshold"),
  juggernautsSlope: requireEffectNumber("juggernauts", "perUnit"),
  gourmandsPerState: requireEffectNumber("gourmands", "perUnit"),
  mutantsPerMutation: requireEffectNumber("mutants", "perUnit"),
  mutantsMaxMutations: requireEffectNumber("mutants", "maxStacks"),
  lucid: requireEffectNumber("lucid", "value"),
  lucidThreshold: requireEffectNumber("lucid", "threshold"),
  furiousPerStack: requireEffectNumber("furious", "perUnit"),
  furiousMaxStacks: requireEffectNumber("furious", "maxStacks"),
  poundersPerStack: requireEffectNumber("pounders", "perUnit"),
  poundersMaxStacks: requireEffectNumber("pounders", "maxStacks"),
  adrenalPerKill: requireEffectNumber("adrenal", "perUnit"),
  adrenalMaxKills: requireEffectNumber("adrenal", "maxStacks"),
  severing: requireEffectNumber("severing", "value"),
  pyromaniacs: requireEffectNumber("pyromaniacs", "value"),
  vipers: requireEffectNumber("vipers", "value"),
  bullysPerLimb: requireEffectNumber("bullys", "perUnit"),
  bullysCap: requireEffectNumber("bullys", "cap"),
} as const;

export {
  TARGET_DUMMY_CATALOG,
  TARGET_DUMMY_LIST,
  WEAPON_ALIASES,
  WEAPON_COMBAT_BASE_CATALOG,
  type BossTargetDummy,
  type TargetDummyTag,
  type WeaponClassCategory,
  type WeaponCombatBaseStats,
  type WeaponDamageType
} from "./combat-firepower-catalog";

/**
 * Fallback baseline stats for generic weapons when not explicitly cataloged.
 */
export function getWeaponCombatBaseStats(weaponId: string): WeaponCombatBaseStats {
  const cleanId = weaponId.toLowerCase().trim();
  if (WEAPON_COMBAT_BASE_CATALOG[cleanId]) {
    return WEAPON_COMBAT_BASE_CATALOG[cleanId];
  }

  const alias = WEAPON_ALIASES[cleanId];
  if (alias && WEAPON_COMBAT_BASE_CATALOG[alias]) {
    return WEAPON_COMBAT_BASE_CATALOG[alias];
  }

  // Fallback heuristics based on weapon ID naming
  if (cleanId.includes("heavy") || cleanId.includes("gatling") || cleanId.includes("flamer") || cleanId.includes("lmg") || cleanId.includes("minigun")) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 45,
      damageType: cleanId.includes("flamer") ? "fire" : cleanId.includes("plasma") || cleanId.includes("laser") ? "energy" : "ballistic",
      fireRate: 9.1,
      baseVatsApCost: 30,
      magazineSize: 100,
      weaponClass: "heavy",
      isAutomatic: true,
      isRanged: true,
      isEnergy: cleanId.includes("plasma") || cleanId.includes("laser") || cleanId.includes("flamer"),
    };
  }

  if (cleanId.includes("fist") || cleanId.includes("gauntlet") || cleanId.includes("unarmed")) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 60,
      damageType: "physical",
      fireRate: 2.0,
      baseVatsApCost: 20,
      magazineSize: 1,
      weaponClass: "unarmed",
      isAutomatic: false,
      isRanged: false,
      isEnergy: false,
    };
  }

  if (cleanId.includes("melee") || cleanId.includes("axe") || cleanId.includes("sledge") || cleanId.includes("sword") || cleanId.includes("baton")) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 75,
      damageType: "physical",
      fireRate: 1.8,
      baseVatsApCost: 25,
      magazineSize: 1,
      weaponClass: "melee",
      isAutomatic: false,
      isRanged: false,
      isEnergy: false,
    };
  }

  if (cleanId.includes("bow") || cleanId.includes("crossbow")) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 90,
      damageType: "physical",
      fireRate: 1.0,
      baseVatsApCost: 22,
      magazineSize: 1,
      weaponClass: "bow",
      isAutomatic: false,
      isRanged: true,
      isEnergy: false,
    };
  }

  if (cleanId.includes("shotgun")) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 90,
      damageType: "ballistic",
      fireRate: 3.0,
      baseVatsApCost: 26,
      magazineSize: 8,
      weaponClass: "shotgunner",
      isAutomatic: false,
      isRanged: true,
      isEnergy: false,
    };
  }

  if ((cleanId.includes("auto") || cleanId.includes("automatic")) && (cleanId.includes("pistol") || cleanId.includes("10mm"))) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 30,
      damageType: "ballistic",
      fireRate: 9.1,
      baseVatsApCost: 15,
      magazineSize: 24,
      weaponClass: "guerrilla",
      isAutomatic: true,
      isRanged: true,
      isEnergy: false,
    };
  }

  if (cleanId.includes("pistol") || cleanId.includes("revolver")) {
    return {
      id: cleanId,
      label: weaponId,
      maxLevel: 50,
      baseDamage: 40,
      damageType: "ballistic",
      fireRate: 5.5,
      baseVatsApCost: 18,
      magazineSize: 12,
      weaponClass: "gunslinger",
      isAutomatic: false,
      isRanged: true,
      isEnergy: false,
    };
  }

  // Default Standard Rifle (Commando/Rifleman template)
  return {
    id: cleanId,
    label: weaponId,
    maxLevel: 50,
    baseDamage: 45,
    damageType: "ballistic",
    fireRate: 9.1,
    baseVatsApCost: 25,
    magazineSize: 25,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  };
}

/**
 * Returns canonical max level for a weapon (Level 50 or 45 in Fallout 76).
 */
export function getWeaponMaxLevel(weaponId: string): 50 | 45 {
  const stats = getWeaponCombatBaseStats(weaponId);
  return stats?.maxLevel ?? 50;
}


export type CombatFiringMode = "hip_fire" | "aiming_ads" | "vats_standard" | "vats_crit_cycle";

/** Where the shot lands (src/data/truth/combat-conditions.json `hitLocations`). */
export type CombatHitLocation = "body" | "torso" | "weakSpot";
/** How far the target is (combat-conditions.json `targetRanges`); "mid" means no range perk applies. */
export type CombatTargetRange = "close" | "mid" | "far";

/**
 * Condition-gated perk numbers (Patch 70 card texts). Typed here so a missing key is a compile
 * error, like the weak-spot pack.
 */
const CC = combatConditionsTruth as {
  perks: {
    "center-masochist": { byRank: number[] };
    guerrilla: { byRank: number[] };
    "guerrilla-master": { perUnit: number };
    "down-ranger": { byRank: number[] };
    "glow-sight": { byRank: number[] };
    exterminator: { byRank: number[] };
    "easy-target": { byRank: number[] };
    tormentor: { perUnit: number };
    "shotgun-champ": { perUnit: number; defaultShotgunProjectiles: number };
    "number-cruncher": { perUnit: number };
    "martial-artist": { byRank: number[] };
    "tightly-wound": { byRank: number[] };
    "pyro-technician": { damageType: WeaponDamageType; byInt: number[][] };
    cryologist: { damageType: WeaponDamageType; byInt: number[][] };
    "glowing-criticals": { byRank: number[] };
    "mad-scientist": { byRank: number[] };
    "radiation-power": { byRank: number[] };
    "radioactive-strength": { byRank: number[] };
    "science-monster": { byRank: number[] };
  };
  glow: { highThresholdPct: number };
};
const byRank = (ranks: number[], rank: number): number => ranks[Math.min(ranks.length, Math.max(0, rank)) - 1] ?? 0;

/**
 * Piecewise-linear read of a `[[special, fraction], …]` table (combat-conditions.json `byInt`,
 * the fallout.wiki scaling rows), clamped to the table's first and last row.
 */
export function interpolateByInt(rows: number[][], special: number): number {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return 0;
  const s = Number.isFinite(special) ? special : first[0];
  if (s <= first[0]) return first[1];
  for (let i = 1; i < rows.length; i++) {
    const [x1, y1] = rows[i];
    if (s <= x1) {
      const [x0, y0] = rows[i - 1];
      return y0 + ((y1 - y0) * (s - x0)) / (x1 - x0);
    }
  }
  return last[1];
}

export type VatsCritQualification = {
  everySecondShotReady: boolean;
  currentLuck: number;
  requiredLuck: number;
  missingLuck: number;
  fillCostPct: number;
  fillPerShotPct: number;
  critSavvyRank: number;
  hasCriticalSavvy: boolean;
  hasLucky15Fill: boolean;
  hasVatsOptimized: boolean;
  hasFourLeafClover?: boolean;
  fourLeafCloverRank?: number;
  summary: string;
  recommendation: string;
};

export type TargetDummyCalculation = {
  dummy: BossTargetDummy;
  effectiveDR: number;
  armorMitigationPct: number; // Percentage of damage mitigated by armor
  mitigationRatio: number; // Ratio penetrating armor (e.g. 0.45)
  normalLanded: number;
  criticalLanded: number;
  burstDPSLanded: number;
  criticalCycleDPSLanded: number;
  activeDPSLanded?: number;
};

export type CombatFirepowerCalculationInput = {
  weaponId: string;
  equippedMods: (Partial<BuilderModDTO> | { slug: string } | null | undefined)[];
  weaponCrafting?: BuilderWeaponInnateCrafting | null;
  equippedPerks: { cardId: string; rank: number }[];
  targetDummyId?: string;
  activeBuffs?: {
    activeDrug?: string | null;
    activeFood?: string | null;
    activeFoods?: string[];
    activeBobblehead?: string | null;
    activeMagazine?: string | null;
    activeAlcohol?: string | null;
    activeMutations?: string[];
  };
  playerStats: {
    agility: number;
    luck: number;
    strength: number;
    /** Live Endurance; Thirst Quencher adds END-scaled max AP to the pool when given. */
    endurance?: number;
    isDiseased?: boolean;
    healthPct?: number; // 0.2 for 20% bloodied
    caps?: number; // for Aristocrat's
    isPowerArmor?: boolean;
    hasStrangeInNumbers?: boolean;
    isCrouched?: boolean;
    isSneaking?: boolean;
    isAiming?: boolean;
    isPowerAttacking?: boolean;
    isSprinting?: boolean;
    isStationary?: boolean;
    isInVats?: boolean;
    vatsCritEveryOtherShot?: boolean;
    timeOfDay?: "day" | "night";
    addictionsCount?: number;
    adrenalineStacks?: number;
    bulletStormStacks?: number;
    onslaughtStacks?: number;
    killStreak?: number;
    tenderizerStacks?: number;
    targetBleeding?: boolean;
    targetBurning?: boolean;
    targetPoisoned?: boolean;
    targetCrippledLimbs?: number;
    feralPct?: number;
    /** Live Intelligence; Pyro-Technician / Cryologist scale fire / cryo weapon damage by it (combat-conditions.json). */
    intelligence?: number;
    /** Playable Ghoul: the Glow cards (Glowing Criticals, Mad Scientist, Radiation Power, Radioactive Strength, Science Monster) need it. */
    isGhoul?: boolean;
    /** Ghoul Glow meter 0–100; "high" is combat-conditions.json `glow.highThresholdPct`. */
    glowPct?: number;
    /** Stances toggle: the attack spends Glow (Mad Scientist, Radiation Power, Radioactive Strength). */
    isSpendingGlow?: boolean;
    /** Stances toggle: hit in the last 10 s (Science Monster). */
    wasHitRecently?: boolean;
    foodState?: string;
    thirstState?: string;
    /**
     * @deprecated Alias kept for one release so saved switchboard state still loads; read as
     * `hitLocation: "weakSpot"` only when `hitLocation` is absent.
     */
    isTargetingWeakSpot?: boolean;
    /** Biometrics hit location: body (default), torso (Center Masochist) or weak spot (head multiplier). */
    hitLocation?: CombatHitLocation;
    /** Biometrics target range: close (Guerrilla, Guerrilla Master), mid (default) or far (Down Ranger). */
    targetRange?: CombatTargetRange;
    /** Target-type overrides; when absent the target dummy's `tags` decide (none of the shipped dummies has one). */
    targetIsGlowing?: boolean;
    targetIsInsect?: boolean;
  };
};

export type CombatFirepowerResult = {
  baseStats: WeaponCombatBaseStats;
  firingMode: CombatFiringMode;
  firingModeLabel: string;
  damagePerShot: {
    normal: number;
    critical: number;
    explosiveBonus: number;
    totalPerShot: number;
    activeShotDamage: number;
    breakdown: { source: string; value: string }[];
  };
  fireRate: {
    rps: number;
    rpm: number;
    isAutomatic: boolean;
    fireRateMultiplier: number;
  };
  magazineCapacity: {
    base: number;
    effective: number;
    isQuad: boolean;
  };
  dps: {
    burstDPS: number;
    criticalCycleDPS: number;
    activeDPS: number;
    breakdown: { source: string; value: string }[];
  };
  vats: {
    apCostPerShot: number;
    maxShotsInPool: number;
    totalApPool: number;
    breakdown: { source: string; value: string }[];
  };
  critCycle: VatsCritQualification;
  /** Body-part multiplier state (src/data/truth/weak-spot.json); `multiplier` is 1 when not targeting. */
  weakSpot: {
    targeting: boolean;
    baseMultiplier: number | null;
    part: string;
    bonusPct: number;
    multiplier: number;
    breakdown: { source: string; value: string }[];
  };
  armorPenetration: {
    effectiveArmorPenetrationPct: number;
    breakdown: { source: string; value: string }[];
  };
  targetDummy: TargetDummyCalculation;
  /**
   * Ghoul Glow cards that contributed to this result (combat tab chip). Present only when at
   * least one did, so non-ghoul results (and their goldens) are untouched.
   */
  glow?: { cards: string[] };
};

/**
 * Authoritative Fallout 76 Luck & Critical Savvy chart evaluation.
 * Evaluates whether a build qualifies for alternating 1:1 Critical Hits every 2nd shot.
 */
export function calculateVatsCritQualification(params: {
  luck: number;
  critSavvyRank: number;
  hasLucky15Fill: boolean;
  hasVatsOptimized?: boolean;
  fourLeafCloverRank?: number;
}): VatsCritQualification {
  const { luck, critSavvyRank, hasLucky15Fill, hasVatsOptimized = false, fourLeafCloverRank = 0 } = params;

  // Meter cost per crit in Fallout 76 (Critical Savvy: 15/30/45% less meter used):
  // Rank 3 = 55%, Rank 2 = 70%, Rank 1 = 85%, None (0) = 100%.
  // Crit fill per shot comes from creation-engine-math (rounded half-up, +15 with the
  // 3★ Lucky Hit legendary); fillCostPct is 100 − meterPreservedPct.
  const critFill = calculateCritFrequency(luck, critSavvyRank, hasLucky15Fill);
  const fillCostPct = 100 - critFill.meterPreservedPct;
  const fillPerShotPct = critFill.fillPerShotPct;

  // Canonical FO76 Luck Thresholds for 1:1 Crit-Every-Other-Shot (kept as the
  // authoritative table because the UI needs requiredLuck / missingLuck):
  // Rank 3 (55% cost): 33 Luck, 23 Luck with Lucky Hit  (game-verified)
  // Rank 2 (70% cost): 43 Luck, 33 Luck with Lucky Hit
  // Rank 1 (85% cost): 53 Luck, 43 Luck with Lucky Hit
  // Rank 0 (100% cost): 63 Luck, 53 Luck with Lucky Hit
  let requiredLuck = 63;
  if (critSavvyRank >= 3) {
    requiredLuck = hasLucky15Fill ? 23 : 33;
  } else if (critSavvyRank === 2) {
    requiredLuck = hasLucky15Fill ? 33 : 43;
  } else if (critSavvyRank === 1) {
    requiredLuck = hasLucky15Fill ? 43 : 53;
  } else {
    requiredLuck = hasLucky15Fill ? 53 : 63;
  }

  const everySecondShotReady = luck >= requiredLuck;
  const missingLuck = Math.max(0, requiredLuck - luck);

  let summary = "";
  let recommendation = "";

  if (everySecondShotReady) {
    summary = `QUALIFIED: 1:1 Crit Cycle active (${luck}/${requiredLuck} Luck with ${
      critSavvyRank > 0 ? `Crit Savvy R${critSavvyRank}` : "No Crit Savvy"
    }${hasLucky15Fill ? " + 3★ Lucky Hit" : ""}).`;
    recommendation = "Optimal 1:1 crit loop achieved! Critical hits alternate every second shot.";
  } else {
    summary = `LOCKED: Need ${requiredLuck} Luck (Current: ${luck}, Missing: +${missingLuck}).`;
    if (critSavvyRank < 3 && !hasLucky15Fill) {
      recommendation = `Equip Critical Savvy Rank 3 to lower Luck threshold from ${requiredLuck} down to 33, or add a 3★ Lucky Hit weapon to drop it to 23.`;
    } else if (critSavvyRank >= 3 && !hasLucky15Fill) {
      recommendation = `Add +${missingLuck} Luck (via Unyielding armor, Legendary Luck, or buffs) or add a 3★ Lucky Hit weapon mod (-10 Luck requirement).`;
    } else {
      recommendation = `Add +${missingLuck} Luck (via Unyielding armor, Legendary Luck perk, Underarmor, or Herd Mentality).`;
    }
  }

  return {
    everySecondShotReady,
    currentLuck: luck,
    requiredLuck,
    missingLuck,
    fillCostPct,
    fillPerShotPct,
    critSavvyRank,
    hasCriticalSavvy: critSavvyRank >= 3,
    hasLucky15Fill,
    hasVatsOptimized,
    hasFourLeafClover: fourLeafCloverRank > 0,
    fourLeafCloverRank,
    summary,
    recommendation,
  };
}

/**
 * Integer VATS AP cost per shot. Same model as calculateVatsApCost in
 * creation-engine-math: attachments reduce base AP additively (floored at 10% of
 * base) and the V.A.T.S. Optimized star (-35% AP cost) multiplies by 0.65.
 *
 * Deliberately NOT delegated to the calculator: it rounds to one decimal before
 * this function rounds to a whole number, and that double rounding flips 7 of the
 * 384 catalog contract points (e.g. 18 AP x 0.85 x 0.75 = 11.475 -> 11.5 -> 12
 * instead of 11). The ap-fuzz fixture pins this formula; keep the two in step by
 * hand if the model ever changes.
 */
export function resolveVatsApCost(baseVatsApCost: number, innateApCostPct: number, hasVatsOptimized: boolean): number {
  let apMultiplier = 1.0;
  if (hasVatsOptimized) {
    apMultiplier *= LEG.vatsOptimizedApMultiplier;
  }
  apMultiplier *= Math.max(0.1, 1.0 + innateApCostPct);
  return Math.max(2, Math.round(baseVatsApCost * apMultiplier));
}

/**
 * The equipped unique's innate model when it is of the asked-for kind, else null.
 * Every unique branch below goes through this, so an innate can only ever do
 * what its pack entry says it does.
 */
function uniqueModelOfKind(item: UniqueItem | undefined, kind: UniqueEffectKind): UniqueEffectModel | null {
  const model = item?.model ?? null;
  return model && model.kind === kind ? model : null;
}

/**
 * Calculates complete Live Weapon Firepower, Damage per Shot, Burst/Sustained DPS,
 * and V.A.T.S. AP Cost in strict adherence to Fallout 76 live patch mechanics.
 */
export function calculateCombatFirepower(
  input: CombatFirepowerCalculationInput
): CombatFirepowerResult {
  const base = getWeaponCombatBaseStats(input.weaponId);
  const innateMods = calculateWeaponInnateAggregate(input.weaponId, input.weaponCrafting);
  // The switchboard stores catalog ids (chem-psychotats, bobble-small-guns, mag-gb3, brew-…);
  // the rules below use the short names. Accept both.
  const activeBuffs = normalizeActiveBuffs(input.activeBuffs);
  const effectiveIsAutomatic = innateMods.isAutomatic || base.isAutomatic;
  const rawHealth = input.playerStats.healthPct ?? 0.2;
  const healthPct = rawHealth > 1 ? rawHealth / 100 : rawHealth; // Seamlessly handles 0.2 and 20% format
  const caps = input.playerStats.caps ?? 30000; // Default max caps for Aristocrat's
  const hasSIN = Boolean(input.playerStats.hasStrangeInNumbers);
  const isPA = Boolean(input.playerStats.isPowerArmor);

  const breakdown: { source: string; value: string }[] = [];
  const dpsBreakdown: { source: string; value: string }[] = [];
  const vatsBreakdown: { source: string; value: string }[] = [];
  const apBreakdown: { source: string; value: string }[] = [];

  breakdown.push({ source: `Base Weapon Damage (Lvl ${base.maxLevel || 50})`, value: `${base.baseDamage}` });

  // 1. Additive Damage Modifiers Pool
  let additiveDamagePct = 0;

  if (innateMods.damagePct !== 0) {
    additiveDamagePct += innateMods.damagePct;
    breakdown.push({
      source: "Weapon Innate Mods (Receiver/Attachments)",
      value: `${innateMods.damagePct > 0 ? "+" : ""}${Math.round(innateMods.damagePct * 100)}%`,
    });
  }

  // Perk Card Scaling
  const perkRanks = new Map<string, number>();
  for (const p of input.equippedPerks) {
    perkRanks.set(p.cardId.toLowerCase().trim(), p.rank);
  }

  // Combat conditions (Biometrics → Stances & V.A.T.S., Target impairments). `isTargetingWeakSpot`
  // is the pre-2026-09-28 boolean and only counts when `hitLocation` is absent.
  const hitLocation: CombatHitLocation =
    input.playerStats.hitLocation ?? (input.playerStats.isTargetingWeakSpot ? "weakSpot" : "body");
  const targetRange: CombatTargetRange = input.playerStats.targetRange ?? "mid";
  const targetDummyForTags = TARGET_DUMMY_CATALOG[input.targetDummyId || "scorchbeast-queen"];
  const dummyTags: TargetDummyTag[] = targetDummyForTags?.tags ?? [];
  const targetIsGlowing = input.playerStats.targetIsGlowing ?? dummyTags.includes("glowing");
  const targetIsInsect = input.playerStats.targetIsInsect ?? dummyTags.includes("insect");

  // Unique innate effects (src/data/truth/unique-items.json). Only the equipped
  // weapon's own row counts; a shared chassis id never inherits a unique.
  const uniqueItem = resolveUniqueForBuilderId(input.weaponId);
  const uniqueName = uniqueItem?.name ?? "";

  // Bullet Storm stack grants: Resolute Veteran raises the floor, Foundation's
  // Vengeance adds stacks while the player is under its health threshold.
  const minStacksModel = uniqueModelOfKind(uniqueItem, "bullet-storm-min-stacks");
  const uniqueMinBulletStormStacks = minStacksModel?.value ?? 0;
  const bonusStacksModel = uniqueModelOfKind(uniqueItem, "bullet-storm-bonus-stacks-below-health");
  const uniqueBonusBulletStormStacks =
    bonusStacksModel && healthPct < (bonusStacksModel.healthThreshold ?? 0) ? (bonusStacksModel.value ?? 0) : 0;
  if (uniqueBonusBulletStormStacks > 0 && bonusStacksModel) {
    breakdown.push({
      source: `${uniqueName} (under ${Math.round((bonusStacksModel.healthThreshold ?? 0) * 100)}% HP)`,
      value: `+${uniqueBonusBulletStormStacks} Bullet Storm Stacks`,
    });
  }

  // Weapon Class Perks
  if (base.weaponClass === "commando" && effectiveIsAutomatic) {
    const c1 = perkRanks.get("commando") || 0;
    const c2 = perkRanks.get("expert-commando") || 0;
    const c3 = perkRanks.get("master-commando") || 0;
    const total = (c1 > 0 ? 0.1 + (c1 - 1) * 0.05 : 0) + (c2 > 0 ? 0.1 + (c2 - 1) * 0.05 : 0) + (c3 > 0 ? 0.1 + (c3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Commando Perks", value: `+${Math.round(total * 100)}%` });
    }
  } else if (base.weaponClass === "rifleman" || (!effectiveIsAutomatic && base.weaponClass === "commando")) {
    const r1 = perkRanks.get("rifleman") || 0;
    const r2 = perkRanks.get("expert-rifleman") || 0;
    const r3 = perkRanks.get("master-rifleman") || 0;
    const total = (r1 > 0 ? 0.1 + (r1 - 1) * 0.05 : 0) + (r2 > 0 ? 0.1 + (r2 - 1) * 0.05 : 0) + (r3 > 0 ? 0.1 + (r3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Rifleman Perks", value: `+${Math.round(total * 100)}%` });
    }
  } else if (base.weaponClass === "heavy") {
    const bulletStormRank = perkRanks.get("bullet-storm") || 0;
    const hasBigGuns = (perkRanks.get("bringing-the-big-guns") || 0) > 0;
    const h1 = perkRanks.get("heavy-gunner") || 0;
    const h2 = perkRanks.get("expert-heavy-gunner") || 0;
    const h3 = perkRanks.get("master-heavy-gunner") || 0;
    const legacyTotal = (h1 > 0 ? 0.1 + (h1 - 1) * 0.05 : 0) + (h2 > 0 ? 0.1 + (h2 - 1) * 0.05 : 0) + (h3 > 0 ? 0.1 + (h3 - 1) * 0.05 : 0);

    // Bullet Storm: 3%/6%/9% per 30 rounds fired, 10 max stacks (doubled to 20 with Bringing the Big Guns)
    // Modeled as mid-combat sustained bonus (60% of max stacks) when not explicitly provided
    const maxStacks = hasBigGuns ? 20 : 10;
    const minStacks = uniqueMinBulletStormStacks;
    const rawStacks = (input.playerStats.bulletStormStacks !== undefined
      ? input.playerStats.bulletStormStacks
      : (maxStacks * 0.6)) + uniqueBonusBulletStormStacks;
    const activeStacks = Math.max(minStacks, Math.min(maxStacks, rawStacks));
    const bulletStormBonus = bulletStormRank > 0 ? (bulletStormRank * 0.03) * activeStacks : 0;

    const total = bulletStormBonus > 0 ? bulletStormBonus : legacyTotal;
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({
        source: bulletStormBonus > 0
          ? (input.playerStats.bulletStormStacks !== undefined ? `Bullet Storm (${activeStacks} Stacks)` : "Bullet Storm (Heavy Sustained)")
          : "Heavy Gunner Perks (Legacy)",
        value: `+${Math.round(total * 100)}%`,
      });
    }
  } else if (base.weaponClass === "shotgunner") {
    const s1 = perkRanks.get("shotgunner") || 0;
    const s2 = perkRanks.get("expert-shotgunner") || 0;
    const s3 = perkRanks.get("master-shotgunner") || 0;
    const total = (s1 > 0 ? 0.1 + (s1 - 1) * 0.05 : 0) + (s2 > 0 ? 0.1 + (s2 - 1) * 0.05 : 0) + (s3 > 0 ? 0.1 + (s3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Shotgunner Perks", value: `+${Math.round(total * 100)}%` });
    }
  } else if (base.weaponClass === "melee") {
    // 1-Handed Gladiator Perks
    const g1 = perkRanks.get("gladiator") || 0;
    const g2 = perkRanks.get("expert-gladiator") || 0;
    const g3 = perkRanks.get("master-gladiator") || 0;
    const gladTotal = (g1 > 0 ? 0.1 + (g1 - 1) * 0.05 : 0) + (g2 > 0 ? 0.1 + (g2 - 1) * 0.05 : 0) + (g3 > 0 ? 0.1 + (g3 - 1) * 0.05 : 0);

    // 2-Handed Slugger (Patch 62+ Rework: bonus damage against crippled targets: +10%/+20%/+30%)
    const sluggerRank = perkRanks.get("slugger") || 0;
    const sluggerActive = input.playerStats.targetCrippledLimbs !== undefined
      ? input.playerStats.targetCrippledLimbs > 0
      : true;
    const sluggerBonus = (sluggerRank > 0 && sluggerActive) ? sluggerRank * 0.10 : 0;

    // Legacy Slugger support (Expert & Master Slugger if equipped in legacy loadouts)
    const legS2 = perkRanks.get("expert-slugger") || 0;
    const legS3 = perkRanks.get("master-slugger") || 0;
    const legacySluggerTotal = (legS2 > 0 ? 0.1 + (legS2 - 1) * 0.05 : 0) + (legS3 > 0 ? 0.1 + (legS3 - 1) * 0.05 : 0);

    // Modern Rework Perks: Heavy Hitter & Knee-Capper
    const heavyHitterRank = perkRanks.get("heavy-hitter") || 0;
    const kneeCapperRank = perkRanks.get("knee-capper") || 0;

    const totalMeleePerks = gladTotal + sluggerBonus + legacySluggerTotal;
    // Strength bonus: 5% per point of STR
    const strBonus = input.playerStats.strength * 0.05;
    additiveDamagePct += totalMeleePerks + strBonus;

    if (gladTotal > 0) breakdown.push({ source: "Gladiator Perks", value: `+${Math.round(gladTotal * 100)}%` });
    if (sluggerBonus > 0) breakdown.push({ source: `Slugger (Rank ${sluggerRank} vs Crippled)`, value: `+${Math.round(sluggerBonus * 100)}%` });
    if (legacySluggerTotal > 0) breakdown.push({ source: "Legacy Slugger Perks", value: `+${Math.round(legacySluggerTotal * 100)}%` });
    if (heavyHitterRank > 0) breakdown.push({ source: "Heavy Hitter", value: "+25% Power Attack Dmg" });
    if (kneeCapperRank > 0) breakdown.push({ source: "Knee-Capper", value: "+50% Limb Dmg" });
    if (strBonus > 0) breakdown.push({ source: `Strength (${input.playerStats.strength})`, value: `+${Math.round(strBonus * 100)}%` });
  } else if (base.weaponClass === "unarmed") {
    const ifRank = perkRanks.get("iron-fist") || 0;
    const ifBonus = ifRank > 0 ? 0.1 + (ifRank - 1) * 0.05 : 0;
    // Unarmed attacks uniquely scale at +10% base damage per point of Strength (double standard melee +5%)
    const strBonus = input.playerStats.strength * 0.10;
    additiveDamagePct += ifBonus + strBonus;

    if (ifBonus > 0) breakdown.push({ source: `Iron Fist (Rank ${ifRank})`, value: `+${Math.round(ifBonus * 100)}%` });
    if (strBonus > 0) breakdown.push({ source: `Unarmed Strength 10% (${input.playerStats.strength})`, value: `+${Math.round(strBonus * 100)}%` });
  } else if (base.weaponClass === "gunslinger") {
    // Since the Patch 62 rework Gunslinger is weak-spot damage (+6/9/12%), not flat pistol
    // damage: it is applied in the weak-spot block below and only when a weak spot is targeted.
    if ((perkRanks.get("gunslinger") || 0) > 0) {
      breakdown.push({ source: "Gunslinger Perks", value: "weak-spot damage only (see Weak spot)" });
    }
  } else if (base.weaponClass === "bow") {
    const a1 = perkRanks.get("archer") || 0;
    const a2 = perkRanks.get("expert-archer") || 0;
    const a3 = perkRanks.get("master-archer") || 0;
    const total = (a1 > 0 ? 0.1 + (a1 - 1) * 0.05 : 0) + (a2 > 0 ? 0.1 + (a2 - 1) * 0.05 : 0) + (a3 > 0 ? 0.1 + (a3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Archer Perks", value: `+${Math.round(total * 100)}%` });
    }
  }

  // Energy Science Perks
  if (base.isEnergy) {
    const sc1 = perkRanks.get("science") || 0;
    const sc2 = perkRanks.get("expert-science") || 0;
    const sc3 = perkRanks.get("master-science") || 0;
    const total = (sc1 > 0 ? 0.05 + sc1 * 0.05 : 0) + (sc2 > 0 ? 0.05 + sc2 * 0.05 : 0) + (sc3 > 0 ? 0.05 + sc3 * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Science Energy Perks", value: `+${Math.round(total * 100)}%` });
    }
  }

  // Universal Perks
  const bloodyMessRank = perkRanks.get("bloody-mess") || 0;
  if (bloodyMessRank > 0) {
    // In Patch 69, Bloody Mess no longer gives flat additive damage; it causes bleeding enemies killed to explode based on LCK
    breakdown.push({ source: `Bloody Mess (Rank ${bloodyMessRank})`, value: "Bleed Corpse Explosion (LCK Scaled)" });
  }

  // Nerd Rage! (single rank since the Patch 62 rework): damage scales from 0 to +80% as
  // health falls below 20% (Nukes & Dragons range; exact curve unpublished, modelled linearly).
  const nerdRageRank = perkRanks.get("nerd-rage") || 0;
  if (nerdRageRank > 0 && healthPct <= 0.2) {
    // Floor +20% at the 20% line (matches the pre-rework top rank), rising to +80% at 0 HP.
    const nr = 0.2 + 0.6 * Math.min(1, Math.max(0, (0.2 - healthPct) / 0.2));
    additiveDamagePct += nr;
    breakdown.push({ source: `Nerd Rage (<20% HP)`, value: `+${Math.round(nr * 100)}%` });
  }

  // Kill Streak (Burning Springs): Adrenaline perk (single rank) and the Adrenal 1★ weapon mod each
  // give +10% damage per kill while on a Kill Streak, max 10 kills. A streak alone gives nothing.
  const rawAdrenalineKills = input.playerStats.killStreak ?? input.playerStats.adrenalineStacks;
  const killStreakKills = Math.min(LEG.adrenalMaxKills, Math.max(0, rawAdrenalineKills ?? 0));
  const hasAdrenalMod = (input.equippedMods || []).some((m) => m && typeof m.slug === "string" && m.slug.toLowerCase() === "adrenal");
  if (killStreakKills > 0 && (perkRanks.get("adrenaline") || 0) > 0) {
    additiveDamagePct += killStreakKills * 0.10;
    breakdown.push({ source: `Adrenaline (${killStreakKills} kills)`, value: `+${killStreakKills * 10}%` });
  }
  if (killStreakKills > 0 && hasAdrenalMod) {
    additiveDamagePct += killStreakKills * LEG.adrenalPerKill;
    breakdown.push({ source: `Adrenal 1★ (${killStreakKills} kills)`, value: `+${Math.round(killStreakKills * LEG.adrenalPerKill * 100)}%` });
  }

  // 2. Legendary Stars Analysis
  const modSlugs = (input.equippedMods || [])
    .filter((m): m is { slug: string } => Boolean(m && typeof m.slug === "string"))
    .map((m) => m.slug.toLowerCase().replace(/[^a-z0-9-]/g, ""));

  let hasAntiArmor = false;
  let hasQuad = false;
  let hasRapid = false;
  let hasExplosive = false;
  let hasVitalCrit = false;
  let hasVatsOptimized = false;
  let hasLucky15Fill = false;

  for (const slug of modSlugs) {
    if (slug === "bloodied") {
      // Bloodied: up to +130% as health decreases (cap reached at 5% HP; verified in game 2026-09-18,
      // Patch 60 rebalance). Linear in missing health, scaled so 5% HP hits the cap.
      const bloodiedBonus = Math.min(
        LEG.bloodiedCap,
        Math.max(0, (1 - healthPct) * (LEG.bloodiedCap / LEG.bloodiedCapAtMissingHealth))
      );
      additiveDamagePct += bloodiedBonus;
      breakdown.push({ source: `Bloodied (${Math.round((1 - healthPct) * 100)}% Missing HP)`, value: `+${Math.round(bloodiedBonus * 100)}%` });
    } else if (slug === "anti-armor" || slug === "anti_armor") {
      hasAntiArmor = true;
    } else if (slug === "aristocrats" || slug === "aristocrat-s") {
      const aristoBonus = caps >= LEG.aristocratsCapAtCaps
        ? LEG.aristocratsMax
        : (caps / LEG.aristocratsCapAtCaps) * LEG.aristocratsMax;
      additiveDamagePct += aristoBonus;
      breakdown.push({ source: "Aristocrat's (29k+ Caps)", value: `+${Math.round(aristoBonus * 100)}%` });
    } else if (slug === "two-shot" || slug === "two_shot") {
      additiveDamagePct += LEG.twoShot;
      breakdown.push({ source: "Two Shot (+75% Base, Patch 60)", value: `+${Math.round(LEG.twoShot * 100)}%` });
    } else if (slug === "quad") {
      hasQuad = true;
    } else if (slug === "rapid" || slug.includes("25-weapon-speed") || slug.includes("faster-fire-rate")) {
      hasRapid = true;
    } else if (slug === "explosive") {
      hasExplosive = true;
    } else if (slug === "vital" || slug.includes("50-critical-damage")) {
      hasVitalCrit = true;
    } else if (slug === "vats-optimized" || slug.includes("vats-optimized") || slug.includes("25-less-vats-action-point-cost") || slug.includes("35-less-vats-action-point-cost") || slug.includes("vats-cost")) {
      hasVatsOptimized = true;
    } else if (slug === "lucky-hit" || slug === "lucky" || slug.includes("lucky-hit") || slug.includes("15-critical-charge") || slug.includes("15-crit-fill")) {
      hasLucky15Fill = true;
    } else if (slug === "nocturnal" || slug === "nocturnal-weapon") {
      const isNight = input.playerStats.timeOfDay === "night";
      const isCrouched = Boolean(input.playerStats.isCrouched || input.playerStats.isSneaking);
      if (isNight || isCrouched) {
        additiveDamagePct += LEG.nocturnal;
        breakdown.push({
          source: isCrouched ? "Nocturnal (Crouched / Stealthed)" : "Nocturnal (Nighttime)",
          value: `+${Math.round(LEG.nocturnal * 100)}%`
        });
      }
    } else if (slug === "stalkers" || slug === "stalker-s") {
      const isCrouched = Boolean(input.playerStats.isCrouched || input.playerStats.isSneaking);
      if (isCrouched) {
        additiveDamagePct += LEG.stalkers;
        breakdown.push({ source: "Stalker's (Crouched / Stealthed)", value: `+${Math.round(LEG.stalkers * 100)}% Sneak Attack` });
      }
    } else if (slug === "hitmans" || slug === "hitman-s" || slug.includes("damage-while-aiming")) {
      const isInVats = Boolean(input.playerStats.isInVats);
      if (input.playerStats.isAiming && !isInVats) {
        additiveDamagePct += LEG.hitmans;
        breakdown.push({ source: "Hitman's 2★ (Aiming Down Sights)", value: `+${Math.round(LEG.hitmans * 100)}%` });
      }
    } else if (slug === "heavy-hitters" || slug === "heavy-hitter-s" || slug.includes("power-attack-damage")) {
      if (input.playerStats.isPowerAttacking) {
        additiveDamagePct += LEG.heavyHitters;
        breakdown.push({ source: "Heavy Hitter's 2★ (Power Attack)", value: `+${Math.round(LEG.heavyHitters * 100)}%` });
      }
    } else if (slug === "steady" || slug.includes("damage-while-not-moving")) {
      if (!input.playerStats.isSprinting) {
        additiveDamagePct += LEG.steady;
        breakdown.push({ source: "Steady 2★ (Stationary / Not Moving)", value: `+${Math.round(LEG.steady * 100)}%` });
      }
    } else if (slug === "junkies" || slug === "junkie-s") {
      const addictions = input.playerStats.addictionsCount || 0;
      // Junkie's: +10% per addiction, up to +100% at 10 addictions (Patch 60 rebalance)
      const jBonus = Math.min(LEG.junkiesCap, addictions * LEG.junkiesPerAddiction);
      if (jBonus > 0) {
        additiveDamagePct += jBonus;
        breakdown.push({ source: `Junkie's (${addictions} Addictions)`, value: `+${Math.round(jBonus * 100)}%` });
      }
    } else if (slug === "juggernauts" || slug === "juggernaut-s") {
      if (healthPct >= LEG.juggernautsThreshold) {
        const juggBonus = Math.min(LEG.juggernautsCap, (healthPct - LEG.juggernautsThreshold) * LEG.juggernautsSlope);
        if (juggBonus > 0) {
          additiveDamagePct += juggBonus;
          breakdown.push({ source: `Juggernaut's (${Math.round(healthPct * 100)}% HP)`, value: `+${Math.round(juggBonus * 100)}%` });
        }
      }
    } else if (slug === "gourmands" || slug === "gourmand-s") {
      const isWellFed = input.playerStats.foodState === "well_fed" || input.playerStats.foodState === "fully_fed";
      const isWellHydrated = input.playerStats.thirstState === "well_hydrated" || input.playerStats.thirstState === "fully_hydrated";
      const gourmandBonus = (isWellFed ? LEG.gourmandsPerState : 0) + (isWellHydrated ? LEG.gourmandsPerState : 0);
      if (gourmandBonus > 0) {
        additiveDamagePct += gourmandBonus;
        breakdown.push({ source: "Gourmand's (Fed & Hydrated)", value: `+${Math.round(gourmandBonus * 100)}%` });
      }
    } else if (slug === "mutants" || slug === "mutant-s") {
      const mutationCount = Math.min(LEG.mutantsMaxMutations, activeBuffs?.activeMutations?.length || 0);
      const mutBonus = mutationCount * LEG.mutantsPerMutation;
      if (mutBonus > 0) {
        additiveDamagePct += mutBonus;
        breakdown.push({ source: `Mutant's (${mutationCount} Mutations)`, value: `+${Math.round(mutBonus * 100)}%` });
      }
    } else if (slug === "lucid") {
      const feral = input.playerStats.feralPct ?? 100;
      if (feral >= LEG.lucidThreshold) {
        additiveDamagePct += LEG.lucid;
        breakdown.push({ source: "Lucid (High Lucidity 80%+)", value: `+${Math.round(LEG.lucid * 100)}%` });
      }
    }
  }

  // Sneak Attack Multiplier (when Crouched / Stealthed)
  const isCrouched = Boolean(input.playerStats.isCrouched || input.playerStats.isSneaking);
  if (isCrouched) {
    const ninjaRank = perkRanks.get("ninja") || 0;
    const covertRank = perkRanks.get("covert-operative") || 0;
    const sandmanRank = perkRanks.get("mister-sandman") || 0;
    const isNight = input.playerStats.timeOfDay === "night";
    const isSuppressed = innateMods.isSuppressed;

    let sneakMultiplier = 2.0;
    if (base.weaponClass === "melee" || base.weaponClass === "unarmed") {
      sneakMultiplier = ninjaRank > 0 ? 3.0 : 2.0;
    } else {
      if (covertRank > 0) sneakMultiplier = 2.5;
      if (isNight && sandmanRank > 0 && isSuppressed) {
        sneakMultiplier += sandmanRank * 0.25;
      }
    }

    additiveDamagePct += (sneakMultiplier - 1.0);
    breakdown.push({
      source: `Sneak Attack (${isNight && sandmanRank > 0 && isSuppressed ? "Mister Sandman (Silenced) " : ""}${sneakMultiplier}× Multiplier)`,
      value: `+${Math.round((sneakMultiplier - 1.0) * 100)}%`
    });
  }

  // Ghoul Apex Feral Bloodlust (Feral Meter 0-20%)
  if (input.playerStats.feralPct !== undefined && input.playerStats.feralPct <= 20) {
    if (base.weaponClass === "melee" || base.weaponClass === "unarmed") {
      additiveDamagePct += 0.50;
      breakdown.push({ source: "Apex Feral Bloodlust (0–20% Lucidity)", value: "+50% Melee" });
    }
  }

  // Onslaught stacks only matter through the effects that spend them (Gleaming Depths rework):
  // Furious 1★ +5% per stack (max 9), Pounder's 4★ melee +10% per stack (max 10),
  // Guerrilla Master +5% ranged damage to close enemies per stack (max 5).
  const onslaughtStacks = Math.max(0, input.playerStats.onslaughtStacks || 0);
  const onslaughtModSlugs = new Set(
    (input.equippedMods || []).filter((m) => m && typeof m.slug === "string").map((m) => (m as { slug: string }).slug.toLowerCase())
  );
  if (onslaughtStacks > 0) {
    if (onslaughtModSlugs.has("furious")) {
      const st = Math.min(LEG.furiousMaxStacks, onslaughtStacks);
      additiveDamagePct += st * LEG.furiousPerStack;
      breakdown.push({ source: `Furious 1★ (${st} Onslaught stacks)`, value: `+${Math.round(st * LEG.furiousPerStack * 100)}%` });
    }
    if (onslaughtModSlugs.has("pounders") && (base.weaponClass === "melee" || base.weaponClass === "unarmed")) {
      const st = Math.min(LEG.poundersMaxStacks, onslaughtStacks);
      additiveDamagePct += st * LEG.poundersPerStack;
      breakdown.push({ source: `Pounder's 4★ (${st} Onslaught stacks)`, value: `+${Math.round(st * LEG.poundersPerStack * 100)}%` });
    }
    // Guerrilla Master (combat-conditions.json): ranged damage to close enemies per stack. Like
    // Guerrilla it needs the target-range state; the pre-existing 5-stack cap is kept (unverified).
    if ((perkRanks.get("master-guerrilla") || perkRanks.get("guerrilla-master") || 0) > 0 && base.isRanged && targetRange === "close") {
      const st = Math.min(5, onslaughtStacks);
      const gm = st * CC.perks["guerrilla-master"].perUnit;
      additiveDamagePct += gm;
      breakdown.push({ source: `Guerrilla Master (${st} Onslaught stacks, close range)`, value: `+${Math.round(gm * 100)}%` });
    }

    // Unique innate: power-attack damage per Onslaught stack (Whacker Smacker).
    const powerAttackModel = uniqueModelOfKind(uniqueItem, "power-attack-damage-per-onslaught-stack");
    if (powerAttackModel && input.playerStats.isPowerAttacking) {
      const st = Math.min(powerAttackModel.maxUnits ?? onslaughtStacks, onslaughtStacks);
      const bonus = st * (powerAttackModel.perUnit ?? 0);
      if (bonus > 0) {
        additiveDamagePct += bonus;
        breakdown.push({
          source: `${uniqueName} (${st} Onslaught stacks, Power Attack)`,
          value: `+${Math.round(bonus * 100)}%`,
        });
      }
    }
  }

  // Tenderizer (single rank): the target takes +0.1% more damage per hit, stacking to +100%,
  // no expiry, not in PvP. A target debuff, so it multiplies the total instead of joining the base pool.
  const tenderizerHits = Math.max(0, input.playerStats.tenderizerStacks || 0);
  const tenderizerMultiplier = (perkRanks.get("tenderizer") || 0) > 0 && tenderizerHits > 0 ? 1 + Math.min(1.0, tenderizerHits * 0.001) : 1;
  if (tenderizerMultiplier > 1) {
    breakdown.push({
      source: `Tenderizer (${tenderizerHits} hits)`,
      value: `×${tenderizerMultiplier.toFixed(3)} target debuff`,
    });
  }

  // Target Impairments (Enemy Conditions) & Dependent Perks/Mods
  const targetBleeding = Boolean(input.playerStats.targetBleeding);
  const targetBurning = Boolean(input.playerStats.targetBurning);
  const targetPoisoned = Boolean(input.playerStats.targetPoisoned);
  const targetCrippledLimbs = input.playerStats.targetCrippledLimbs ?? 0;

  // Severing 4★: +50% damage against bleeding targets
  if (targetBleeding && modSlugs.includes("severing")) {
    additiveDamagePct += LEG.severing;
    breakdown.push({ source: "Severing 4★ (vs Bleeding)", value: `+${Math.round(LEG.severing * 100)}%` });
  }

  // Wound Salter Perk: +10%/+20%/+30% damage against bleeding targets
  const woundSalterRank = perkRanks.get("wound-salter") || 0;
  if (targetBleeding && woundSalterRank > 0) {
    const wsBonus = woundSalterRank * 0.10;
    additiveDamagePct += wsBonus;
    breakdown.push({
      source: `Wound Salter (Rank ${woundSalterRank} vs Bleeding)`,
      value: `+${Math.round(wsBonus * 100)}%`,
    });
  }

  // Pyromaniac's 4★: +50% damage against burning targets
  if (targetBurning && (modSlugs.includes("pyromaniacs") || modSlugs.includes("pyromaniac-s"))) {
    additiveDamagePct += LEG.pyromaniacs;
    breakdown.push({ source: "Pyromaniac's 4★ (vs Burning)", value: `+${Math.round(LEG.pyromaniacs * 100)}%` });
  }

  // Viper's 4★: +50% damage against poisoned targets
  if (targetPoisoned && (modSlugs.includes("vipers") || modSlugs.includes("viper-s"))) {
    additiveDamagePct += LEG.vipers;
    breakdown.push({ source: "Viper's 4★ (vs Poisoned)", value: `+${Math.round(LEG.vipers * 100)}%` });
  }

  // Bully's 4★: +25% damage per crippled limb the target has (max 4 limbs = +100%)
  if (targetCrippledLimbs > 0 && (modSlugs.includes("bullys") || modSlugs.includes("bully-s"))) {
    const bullyBonus = Math.min(LEG.bullysCap, targetCrippledLimbs * LEG.bullysPerLimb);
    additiveDamagePct += bullyBonus;
    breakdown.push({
      source: `Bully's 4★ (${targetCrippledLimbs} Crippled Limbs)`,
      value: `+${Math.round(bullyBonus * 100)}%`,
    });
  }

  // Unique innate: damage per crippled limb the target has (Crushing Blow, +10% each, max 40%).
  const crippledLimbModel = uniqueModelOfKind(uniqueItem, "damage-per-crippled-limb");
  if (targetCrippledLimbs > 0 && crippledLimbModel) {
    const limbs = Math.min(crippledLimbModel.maxUnits ?? targetCrippledLimbs, targetCrippledLimbs);
    const cbBonus = Math.min(crippledLimbModel.cap ?? Number.POSITIVE_INFINITY, limbs * (crippledLimbModel.perUnit ?? 0));
    additiveDamagePct += cbBonus;
    breakdown.push({
      source: `${uniqueName} Innate (${targetCrippledLimbs} Crippled Limbs)`,
      value: `+${Math.round(cbBonus * 100)}%`,
    });
  }

  // Deal Sealer Perk: +10% damage for each impairment your target has (bleeding, burning, poisoned, crippled)
  const dealSealerRank = perkRanks.get("deal-sealer") || 0;
  if (dealSealerRank > 0) {
    const impairmentsCount = [
      targetBleeding,
      targetBurning,
      targetPoisoned,
      targetCrippledLimbs > 0,
    ].filter(Boolean).length;
    if (impairmentsCount > 0) {
      const dsBonus = impairmentsCount * 0.10;
      additiveDamagePct += dsBonus;
      breakdown.push({
        source: `Deal Sealer (${impairmentsCount} Impairments)`,
        value: `+${Math.round(dsBonus * 100)}%`,
      });
    }
  }

  // 3. Consumable Buffs
  const buffs = activeBuffs;
  if (buffs) {
    if (buffs.activeDrug === "psychotats" || buffs.activeDrug === "psychobuff") {
      additiveDamagePct += 0.25;
      breakdown.push({ source: "Psychotats / Psychobuff", value: "+25%" });
    } else if (buffs.activeDrug === "overdrive") {
      additiveDamagePct += 0.15;
      breakdown.push({ source: "Overdrive Chem", value: "+15%" });
    }

    if (buffs.activeAlcohol === "ballistic-bock" && !base.isEnergy) {
      additiveDamagePct += 0.15;
      breakdown.push({ source: "Ballistic Bock", value: "+15%" });
    } else if (buffs.activeAlcohol === "high-voltage-hefe" && base.isEnergy) {
      additiveDamagePct += 0.15;
      breakdown.push({ source: "High Voltage Hefe", value: "+15%" });
    }

    if (buffs.activeBobblehead === "small-guns" && base.weaponClass === "commando") {
      additiveDamagePct += 0.2;
      breakdown.push({ source: "Small Guns Bobblehead", value: "+20%" });
    } else if (buffs.activeBobblehead === "big-guns" && base.weaponClass === "heavy") {
      additiveDamagePct += 0.2;
      breakdown.push({ source: "Big Guns Bobblehead", value: "+20%" });
    } else if (buffs.activeBobblehead === "energy-weapons" && base.isEnergy) {
      additiveDamagePct += 0.2;
      breakdown.push({ source: "Energy Weapons Bobblehead", value: "+20%" });
    } else if (buffs.activeBobblehead === "melee" && (base.weaponClass === "melee" || base.weaponClass === "unarmed")) {
      additiveDamagePct += 0.2;
      breakdown.push({ source: "Melee Bobblehead", value: "+20%" });
    }

    // Melee foods: Glowing Meat Steak (+20% base, +40% Carnivore, +50% Carnivore + SiN), Yao Guai Roast (+15% base, +30% Carnivore, +37.5% Carnivore + SiN)
    if (base.weaponClass === "melee" || base.weaponClass === "unarmed") {
      const isCarnivore = Boolean(buffs.activeMutations?.includes("carnivore"));
      const isHerbivore = Boolean(buffs.activeMutations?.includes("herbivore"));
      if (!isHerbivore) {
        const allFoods = [...(buffs.activeFoods || []), buffs.activeFood].filter(Boolean) as string[];
        const hasGlowingSteak = allFoods.some((f) => f.includes("glowing-steak"));
        const hasYaoGuai = allFoods.some((f) => f.includes("yao-guai-roast"));
        let meleeFoodPct = 0;
        if (hasGlowingSteak) {
          meleeFoodPct += isCarnivore ? (hasSIN ? 0.50 : 0.40) : 0.20;
        }
        if (hasYaoGuai) {
          meleeFoodPct += isCarnivore ? (hasSIN ? 0.375 : 0.30) : 0.15;
        }
        if (meleeFoodPct > 0) {
          additiveDamagePct += meleeFoodPct;
          const tag = isCarnivore ? (hasSIN ? " (Carnivore + SiN)" : " (Carnivore)") : " (Base)";
          breakdown.push({ source: `Melee Food Buffs${tag}`, value: `+${Math.round(meleeFoodPct * 100)}%` });
        }
      }
    }

    // Mutations (Adrenal Reaction)
    if (buffs.activeMutations?.includes("adrenal-reaction") && healthPct <= 0.2) {
      const adrMutBonus = hasSIN ? 0.63 : 0.5;
      additiveDamagePct += adrMutBonus;
      breakdown.push({ source: `Adrenal Reaction Mutation${hasSIN ? " (SiN 2.5x)" : ""}`, value: `+${Math.round(adrMutBonus * 100)}%` });
    }
  }

  // 3b. Condition-gated perks, src/data/truth/combat-conditions.json (Patch 70 card texts).
  // Hit location, target range and target type come from the Biometrics switchboard; the
  // crippled-limb count is the same one Bully's and Deal Sealer read above.
  const centerMasochistRank = perkRanks.get("center-masochist") || 0;
  if (centerMasochistRank > 0 && base.isRanged && hitLocation === "torso") {
    const v = byRank(CC.perks["center-masochist"].byRank, centerMasochistRank);
    additiveDamagePct += v;
    breakdown.push({ source: `Center Masochist (Rank ${centerMasochistRank}, torso)`, value: `+${Math.round(v * 100)}%` });
  }
  const guerrillaRank = perkRanks.get("guerrilla") || 0;
  if (guerrillaRank > 0 && base.isRanged) {
    if (targetRange === "close") {
      const v = byRank(CC.perks.guerrilla.byRank, guerrillaRank);
      additiveDamagePct += v;
      breakdown.push({ source: `Guerrilla (Rank ${guerrillaRank}, close range)`, value: `+${Math.round(v * 100)}%` });
    } else {
      breakdown.push({ source: "Guerrilla", value: `close range only (target at ${targetRange} range)` });
    }
  }
  const downRangerRank = perkRanks.get("down-ranger") || 0;
  if (downRangerRank > 0 && base.isRanged) {
    if (targetRange === "far") {
      const v = byRank(CC.perks["down-ranger"].byRank, downRangerRank);
      additiveDamagePct += v;
      breakdown.push({ source: `Down Ranger (Rank ${downRangerRank}, far range)`, value: `+${Math.round(v * 100)}%` });
    } else {
      breakdown.push({ source: "Down Ranger", value: `far range only (target at ${targetRange} range)` });
    }
  }
  const glowSightRank = perkRanks.get("glow-sight") || 0;
  if (glowSightRank > 0 && targetIsGlowing) {
    const v = byRank(CC.perks["glow-sight"].byRank, glowSightRank);
    additiveDamagePct += v;
    breakdown.push({ source: `Glow Sight (Rank ${glowSightRank}, glowing target)`, value: `+${Math.round(v * 100)}%` });
  }
  const easyTargetRank = perkRanks.get("easy-target") || 0;
  if (easyTargetRank > 0 && base.isRanged && targetCrippledLimbs > 0) {
    const v = byRank(CC.perks["easy-target"].byRank, easyTargetRank);
    additiveDamagePct += v;
    breakdown.push({ source: `Easy Target (Rank ${easyTargetRank}, crippled target)`, value: `+${Math.round(v * 100)}%` });
  }
  if ((perkRanks.get("tormentor") || 0) > 0 && targetCrippledLimbs > 0) {
    const v = targetCrippledLimbs * CC.perks.tormentor.perUnit;
    additiveDamagePct += v;
    breakdown.push({ source: `Tormentor (${targetCrippledLimbs} Crippled Limbs)`, value: `+${Math.round(v * 100)}%` });
  }
  if ((perkRanks.get("shotgun-champ") || 0) > 0 && targetCrippledLimbs > 0) {
    // The catalog has no projectile counts yet: shotgunner-class weapons are assumed to fire the
    // pack's default (8), every other weapon gets nothing rather than an invented count.
    const projectiles = base.projectiles ?? (base.weaponClass === "shotgunner" ? CC.perks["shotgun-champ"].defaultShotgunProjectiles : null);
    if (projectiles) {
      const v = projectiles * CC.perks["shotgun-champ"].perUnit;
      additiveDamagePct += v;
      breakdown.push({
        source: `Shotgun Champ (${projectiles} projectiles${base.projectiles === undefined ? ", assumed" : ""}, crippled target)`,
        value: `+${Math.round(v * 100)}%`,
      });
    } else {
      breakdown.push({ source: "Shotgun Champ", value: "projectile count unknown for this weapon" });
    }
  }
  // Number Cruncher needs the resolved V.A.T.S. AP cost per shot, so §7's cost is computed here
  // (it depends only on the base weapon, the attachments and the V.A.T.S. Optimized star, all
  // known by now); §7 reuses the same value for the AP pool.
  const vatsApCost = resolveVatsApCost(base.baseVatsApCost, innateMods.apCostPct, hasVatsOptimized);
  if ((perkRanks.get("number-cruncher") || 0) > 0) {
    const v = vatsApCost * CC.perks["number-cruncher"].perUnit;
    additiveDamagePct += v;
    breakdown.push({ source: `Number Cruncher (${vatsApCost} AP per shot)`, value: `+${Math.round(v * 100)}%` });
  }

  // Damage type (Pyro-Technician, Cryologist): INT-scaled bonus to the weapon's primary damage
  // type, read off the fallout.wiki rows in combat-conditions.json. The engine carries one damage
  // number per weapon, so a matching secondary type (Shishkebab fire, Cold Shoulder cryo) earns a
  // note and no number.
  for (const id of ["pyro-technician", "cryologist"] as const) {
    if ((perkRanks.get(id) || 0) === 0) continue;
    const model = CC.perks[id];
    const label = id === "pyro-technician" ? "Pyro-Technician" : "Cryologist";
    if (base.damageType === model.damageType) {
      const int = input.playerStats.intelligence;
      if (int === undefined) {
        breakdown.push({ source: label, value: "needs Intelligence" });
      } else {
        const v = interpolateByInt(model.byInt, int);
        additiveDamagePct += v;
        breakdown.push({ source: `${label} (INT ${int}, approx.)`, value: `+${Math.round(v * 1000) / 10}% ${model.damageType}` });
      }
    } else if (base.secondaryDamageType === model.damageType) {
      breakdown.push({ source: label, value: `secondary ${model.damageType} damage not modelled` });
    } else {
      breakdown.push({ source: label, value: `${model.damageType} weapons only` });
    }
  }

  // Ghoul Glow cards (combat-conditions.json `glow`): "spending Glow" and "hit in the last 10 s"
  // are Stances toggles, "Glow high" is the meter at or above the pack's threshold. Ghouls only.
  const isGhoul = Boolean(input.playerStats.isGhoul);
  const glowPct = Math.max(0, Math.min(100, input.playerStats.glowPct ?? 0));
  const glowHigh = glowPct >= CC.glow.highThresholdPct;
  const spendingGlow = Boolean(input.playerStats.isSpendingGlow);
  const glowCards: string[] = [];
  if (isGhoul) {
    const madScientistRank = perkRanks.get("mad-scientist") || 0;
    if (madScientistRank > 0 && base.isEnergy) {
      if (spendingGlow) {
        const v = byRank(CC.perks["mad-scientist"].byRank, madScientistRank);
        additiveDamagePct += v;
        glowCards.push("Mad Scientist");
        breakdown.push({ source: `Mad Scientist (Rank ${madScientistRank}, spending Glow)`, value: `+${Math.round(v * 100)}%` });
      } else {
        breakdown.push({ source: "Mad Scientist", value: "spending Glow only" });
      }
    }
    const radiationPowerRank = perkRanks.get("radiation-power") || 0;
    if (radiationPowerRank > 0) {
      if (spendingGlow) {
        const v = byRank(CC.perks["radiation-power"].byRank, radiationPowerRank);
        additiveDamagePct += v;
        glowCards.push("Radiation Power");
        breakdown.push({ source: `Radiation Power (Rank ${radiationPowerRank}, spending Glow)`, value: `+${Math.round(v * 100)}%` });
      } else {
        breakdown.push({ source: "Radiation Power", value: "spending Glow only" });
      }
    }
    const radioactiveStrengthRank = perkRanks.get("radioactive-strength") || 0;
    if (radioactiveStrengthRank > 0) {
      if (spendingGlow && input.playerStats.isPowerAttacking) {
        const v = byRank(CC.perks["radioactive-strength"].byRank, radioactiveStrengthRank);
        additiveDamagePct += v;
        glowCards.push("Radioactive Strength");
        breakdown.push({ source: `Radioactive Strength (Rank ${radioactiveStrengthRank}, power attack, spending Glow)`, value: `+${Math.round(v * 100)}%` });
      } else {
        breakdown.push({ source: "Radioactive Strength", value: "power attack while spending Glow only (bash not modelled)" });
      }
    }
    const scienceMonsterRank = perkRanks.get("science-monster") || 0;
    if (scienceMonsterRank > 0) {
      if (glowPct > 0 && input.playerStats.wasHitRecently) {
        const v = byRank(CC.perks["science-monster"].byRank, scienceMonsterRank);
        additiveDamagePct += v;
        glowCards.push("Science Monster");
        breakdown.push({ source: `Science Monster (Rank ${scienceMonsterRank}, hit in last 10 s, Glow ${glowPct}%)`, value: `+${Math.round(v * 100)}%` });
      } else {
        breakdown.push({ source: "Science Monster", value: glowPct > 0 ? "hit in the last 10 s only" : "needs Glow above 0" });
      }
    }
  }

  // Weak spot (body-part multiplier), src/data/truth/weak-spot.json. Bonuses add together, then
  // the creature's head multiplier is scaled by them; the whole thing multiplies the hit.
  const WS = weakSpotTruth as {
    dummies: Record<string, { multiplier: number | null; part: string }>;
    perks: {
      gunslinger: { byRank: number[] };
      "gunslinger-expert": { perUnit: number };
      "smart-shot": { value: number };
      "faulty-spots": { value: number };
    };
  };
  const targetingWeakSpot = hitLocation === "weakSpot";
  const weakSpotDummy = WS.dummies[input.targetDummyId || "scorchbeast-queen"] ?? null;
  const weakSpotBreakdown: { source: string; value: string }[] = [];
  let weakSpotBonusPct = 0;
  const wsAiming = Boolean(input.playerStats.isAiming) && !Boolean(input.playerStats.isInVats);
  const gunslingerRank = Math.min(3, perkRanks.get("gunslinger") || 0);
  if (base.isRanged && gunslingerRank > 0) {
    const v = WS.perks.gunslinger.byRank[gunslingerRank - 1] ?? 0;
    weakSpotBonusPct += v;
    weakSpotBreakdown.push({ source: `Gunslinger (Rank ${gunslingerRank})`, value: `+${Math.round(v * 100)}%` });
  }
  const gunslingerExpertRank = perkRanks.get("gunslinger-expert") || 0;
  const wsOnslaught = Math.max(0, input.playerStats.onslaughtStacks || 0);
  if (base.isRanged && gunslingerExpertRank > 0 && wsOnslaught > 0) {
    const v = wsOnslaught * WS.perks["gunslinger-expert"].perUnit;
    weakSpotBonusPct += v;
    weakSpotBreakdown.push({ source: `Gunslinger Expert (${wsOnslaught} Onslaught)`, value: `+${Math.round(v * 100)}%` });
  }
  const smartShotRank = perkRanks.get("smart-shot") || 0;
  const sightOption = getWeaponInnateModOption(input.weaponId, "sight", input.weaponCrafting?.sightId);
  const hasScopedSight = /scope/i.test(`${sightOption?.id ?? ""} ${sightOption?.label ?? ""}`);
  if (smartShotRank > 0 && wsAiming && hasScopedSight) {
    weakSpotBonusPct += WS.perks["smart-shot"].value;
    weakSpotBreakdown.push({ source: "Smart Shot (aiming a scope)", value: `+${Math.round(WS.perks["smart-shot"].value * 100)}%` });
  }
  if ((perkRanks.get("faulty-spots") || 0) > 0) {
    weakSpotBonusPct += WS.perks["faulty-spots"].value;
    weakSpotBreakdown.push({ source: "Faulty Spots", value: `+${Math.round(WS.perks["faulty-spots"].value * 100)}%` });
  }
  const wsFlatModel = uniqueModelOfKind(uniqueItem, "weak-spot-damage");
  if (wsFlatModel?.value) {
    weakSpotBonusPct += wsFlatModel.value;
    weakSpotBreakdown.push({ source: `${uniqueName} (Innate)`, value: `+${Math.round(wsFlatModel.value * 100)}%` });
  }
  const wsAimModel = uniqueModelOfKind(uniqueItem, "weak-spot-damage-while-aiming");
  if (wsAimModel?.value && wsAiming) {
    weakSpotBonusPct += wsAimModel.value;
    weakSpotBreakdown.push({ source: `${uniqueName} (Innate, aiming)`, value: `+${Math.round(wsAimModel.value * 100)}%` });
  }
  const wsKillModel = uniqueModelOfKind(uniqueItem, "weak-spot-per-kill-streak");
  const wsKillStreak = Math.max(0, input.playerStats.killStreak || 0);
  if (wsKillModel && wsKillStreak > 0) {
    const kills = Math.min(wsKillModel.maxUnits ?? wsKillStreak, wsKillStreak);
    const v = kills * (wsKillModel.perUnit ?? 0);
    weakSpotBonusPct += v;
    weakSpotBreakdown.push({ source: `${uniqueName} (${kills} Kill Streak)`, value: `+${Math.round(v * 100)}%` });
  }
  const weakSpotBase = weakSpotDummy?.multiplier ?? null;
  const weakSpotMultiplier = targetingWeakSpot && weakSpotBase ? weakSpotBase * (1 + weakSpotBonusPct) : 1;
  if (targetingWeakSpot) {
    breakdown.push({
      source: weakSpotBase ? `Weak spot: ${weakSpotDummy?.part}` : "Weak spot: no multiplier data for this target",
      value: weakSpotBase ? `×${weakSpotMultiplier.toFixed(2)}` : "×1.00",
    });
  }

  // Normal Damage Per Shot Calculation
  // Post-Patch 22 rule via creation-engine-math: every perk, chem, mutation and legendary
  // primary in this engine adds to BASE (additiveDamagePct is a fraction; the calculator takes
  // percent). The multiplicative list is intentionally empty: sneak attack, Nocturnal and
  // Stalker's stay linearised into the additive pool for parity (tracked as a follow-up).
  const normalDamage = Math.round(
    calculatePaperDamage(base.baseDamage, additiveDamagePct * 100, [
      ...(tenderizerMultiplier > 1 ? [(tenderizerMultiplier - 1) * 100] : []),
      ...(weakSpotMultiplier !== 1 ? [(weakSpotMultiplier - 1) * 100] : []),
    ])
  );

  // Explosive Area Damage
  let explosiveDamage = 0;
  if (hasExplosive || base.isExplosiveInherent) {
    // Unique innate: a granted perk rank (The Guarantee grants Demolition Expert 3).
    const grantModel = uniqueModelOfKind(uniqueItem, "grants-perk-rank");
    const grantedDemoRank = grantModel?.perkId === "demolition-expert" ? (grantModel.perkRank ?? 0) : 0;
    const equippedDemoRank = perkRanks.get("demolition-expert") || 0;
    const demoRank = Math.max(equippedDemoRank, grantedDemoRank);
    const demoScale = 1 + (demoRank > 0 ? 0.2 + (demoRank - 1) * 0.1 : 0);
    explosiveDamage = Math.round(base.baseDamage * LEG.explosiveBaseFraction * demoScale);
    breakdown.push({
      source: grantedDemoRank > 0 && equippedDemoRank < grantedDemoRank
        ? `Explosive Impact (${uniqueName}: Demo Exp Rank ${grantedDemoRank})`
        : `Explosive Impact (Demo Exp Rank ${demoRank})`,
      value: `+${explosiveDamage}`,
    });
  }

  // 4. Critical Damage Multiplier Pool
  // Base Crit = +100% of Base Damage
  let critBonusPct = 1.0;

  // Unique innate: V.A.T.S. critical damage per Onslaught stack (Elder's Mark, +2% each).
  const critStackModel = uniqueModelOfKind(uniqueItem, "crit-damage-per-onslaught-stack");
  if (critStackModel && onslaughtStacks > 0) {
    const st = Math.min(critStackModel.maxUnits ?? onslaughtStacks, onslaughtStacks);
    const emBonus = st * (critStackModel.perUnit ?? 0);
    critBonusPct += emBonus;
    breakdown.push({ source: `${uniqueName} (${st} Onslaught stacks)`, value: `+${Math.round(emBonus * 100)}% Crit` });
  }

  if (innateMods.critDamagePct !== 0) {
    critBonusPct += innateMods.critDamagePct;
    breakdown.push({
      source: "Receiver / Attachments (+Crit)",
      value: `+${Math.round(innateMods.critDamagePct * 100)}% Crit`,
    });
  }

  const betterCritsRank = perkRanks.get("better-criticals") || 0;
  if (betterCritsRank > 0) {
    const bc = betterCritsRank === 1 ? 0.5 : betterCritsRank === 2 ? 0.75 : 1.0;
    critBonusPct += bc;
    breakdown.push({ source: `Better Criticals (Rank ${betterCritsRank})`, value: `+${Math.round(bc * 100)}% Crit` });
  }

  // Glowing Criticals (combat-conditions.json): Ghoul V.A.T.S. crit damage while Glow is high.
  const glowingCriticalsRank = perkRanks.get("glowing-criticals") || 0;
  if (isGhoul && glowingCriticalsRank > 0) {
    if (glowHigh) {
      const gc = byRank(CC.perks["glowing-criticals"].byRank, glowingCriticalsRank);
      critBonusPct += gc;
      glowCards.push("Glowing Criticals");
      breakdown.push({ source: `Glowing Criticals (Rank ${glowingCriticalsRank}, Glow ${glowPct}%)`, value: `+${Math.round(gc * 100)}% Crit` });
    } else {
      breakdown.push({ source: "Glowing Criticals", value: `Glow high only (≥ ${CC.glow.highThresholdPct}%, at ${glowPct}%)` });
    }
  }

  if (hasVitalCrit) {
    critBonusPct += LEG.vitalCrit;
    breakdown.push({ source: "Vital 2★ (+50% Crit)", value: `+${Math.round(LEG.vitalCrit * 100)}% Crit` });
  }

  if (buffs) {
    const allFoods = [...(buffs.activeFoods || []), buffs.activeFood].filter(Boolean) as string[];
    const hasCritFood = allFoods.some((f) => f.includes("blight-soup") || f.includes("sweet-mutfruit-tea"));
    if (hasCritFood) {
      const isCarnivore = Boolean(buffs.activeMutations?.includes("carnivore"));
      const isHerbivore = Boolean(buffs.activeMutations?.includes("herbivore"));
      if (!isCarnivore) {
        const foodCrit = isHerbivore ? (hasSIN ? 1.25 : 1.0) : 0.50;
        critBonusPct += foodCrit;
        const tag = isHerbivore ? (hasSIN ? " (Herbivore + SiN)" : " (Herbivore)") : " (Base)";
        breakdown.push({ source: `Blight Soup / Steeped Tea${tag}`, value: `+${Math.round(foodCrit * 100)}% Crit` });
      }
    }

    if (buffs.activeMagazine === "guns-and-bullets-3" && !base.isEnergy) {
      critBonusPct += 1.0;
      breakdown.push({ source: "Guns and Bullets #3", value: "+100% Ballistic Crit" });
    } else if (buffs.activeMagazine === "tesla-science-7" && base.isEnergy) {
      critBonusPct += 1.0;
      breakdown.push({ source: "Tesla Science #7", value: "+100% Energy Crit" });
    } else if (buffs.activeMagazine === "tesla-science-8") {
      critBonusPct += 0.5;
      breakdown.push({ source: "Tesla Science #8", value: "+50% Crit" });
    }

    if (buffs.activeDrug === "overdrive") {
      critBonusPct += 0.15;
      breakdown.push({ source: "Overdrive (+15% Crit)", value: "+15% Crit" });
    }

    if (buffs.activeMutations?.includes("eagle-eyes")) {
      const eagleBonus = hasSIN ? 0.625 : 0.5;
      critBonusPct += eagleBonus;
      breakdown.push({ source: `Eagle Eyes Mutation${hasSIN ? " (SiN)" : ""}`, value: `+${Math.round(eagleBonus * 100)}% Crit` });
    }
  }

  // The body-part multiplier applies to the whole hit, so the crit bonus is scaled by it too;
  // explosive splash is area damage and takes no body-part multiplier.
  const criticalDamage = normalDamage + Math.round(base.baseDamage * critBonusPct * weakSpotMultiplier) + explosiveDamage;

  // 5. Fire Rate & DPS
  const innateFireRateFactor = 1.0 + innateMods.fireRatePct;
  let fireRateMultiplier = (hasRapid ? LEG.rapidFireRateMultiplier : 1.0) * Math.max(0.2, innateFireRateFactor);

  // Unique innate: flat attack-speed multiplier (Disorderly Conduct, ×1.20).
  const attackSpeedModel = uniqueModelOfKind(uniqueItem, "attack-speed-multiplier");
  if (attackSpeedModel) {
    const multiplier = attackSpeedModel.value ?? 1;
    fireRateMultiplier *= multiplier;
    const pct = Math.round((multiplier - 1) * 100);
    dpsBreakdown.push({ source: `${uniqueName} (+${pct}% Attack Speed)`, value: `+${pct}% Fire Rate` });
  }

  // Unique innate: swing speed per addiction (The Quick Fix, +5% each, capped at +100%).
  const swingSpeedModel = uniqueModelOfKind(uniqueItem, "swing-speed-per-addiction");
  if (swingSpeedModel) {
    const addictions = Math.max(0, input.playerStats.addictionsCount || 0);
    const bonus = Math.min(swingSpeedModel.cap ?? Number.POSITIVE_INFINITY, addictions * (swingSpeedModel.perUnit ?? 0));
    if (bonus > 0) {
      fireRateMultiplier *= 1 + bonus;
      dpsBreakdown.push({
        source: `${uniqueName} (${addictions} Addictions)`,
        value: `+${Math.round(bonus * 100)}% Swing Speed`,
      });
    }
  }

  // Martial Artist (combat-conditions.json): melee / unarmed swing speed by rank, counted before the cap.
  const martialArtistRank = perkRanks.get("martial-artist") || 0;
  if (martialArtistRank > 0 && (base.weaponClass === "melee" || base.weaponClass === "unarmed")) {
    const ma = byRank(CC.perks["martial-artist"].byRank, martialArtistRank);
    fireRateMultiplier *= 1 + ma;
    dpsBreakdown.push({ source: `Martial Artist (Rank ${martialArtistRank})`, value: `+${Math.round(ma * 100)}% Swing Speed` });
  }

  // Melee & Unarmed swing speed cap: +100% max (multiplier capped at 2.0x) since Patch 70
  if (base.weaponClass === "melee" || base.weaponClass === "unarmed") {
    if (fireRateMultiplier > 2.0) {
      fireRateMultiplier = 2.0;
      dpsBreakdown.push({ source: "Melee Swing Speed Cap (Patch 70)", value: "Capped at +100% (2.0× max)" });
    }
  }

  // Tightly Wound (note-only in combat-conditions.json): the engine has no spin-up model, so the
  // line touches no number.
  if ((perkRanks.get("tightly-wound") || 0) > 0 && base.weaponClass === "heavy") {
    dpsBreakdown.push({ source: "Tightly Wound", value: `spin-up ${Math.round(CC.perks["tightly-wound"].byRank[0] * 100)}% faster (not modelled)` });
  }

  const effectiveRPS = base.fireRate * fireRateMultiplier;
  const effectiveRPM = Math.round(effectiveRPS * 60);

  if (hasRapid) {
    dpsBreakdown.push({ source: "Rapid 2★ Weapon Speed", value: `+${Math.round((LEG.rapidFireRateMultiplier - 1) * 100)}% Fire Rate` });
  }
  if (innateMods.fireRatePct !== 0) {
    dpsBreakdown.push({
      source: "Innate Receiver / Barrel Speed",
      value: `${innateMods.fireRatePct > 0 ? "+" : ""}${Math.round(innateMods.fireRatePct * 100)}% Fire Rate`,
    });
  }

  const burstDPS = Math.round((normalDamage + explosiveDamage) * effectiveRPS);

  // Critical Cycle DPS (Average of Normal + Crit per alternating cycle)
  const criticalCycleDPS = Math.round(
    ((normalDamage + explosiveDamage + criticalDamage) / 2) * effectiveRPS
  );

  dpsBreakdown.push({ source: "Base Fire Rate", value: `${base.fireRate.toFixed(1)} rps (${Math.round(base.fireRate * 60)} rpm)` });
  dpsBreakdown.push({ source: "Effective Fire Rate", value: `${effectiveRPS.toFixed(1)} rps (${effectiveRPM} rpm)` });

  // 6. Magazine Capacity
  let baseMag = base.magazineSize;
  if (innateMods.magCapacityPct !== 0) {
    baseMag = Math.max(1, Math.round(baseMag * (1.0 + innateMods.magCapacityPct)));
  }
  const effectiveMag = hasQuad ? baseMag * LEG.quadMagMultiplier : baseMag;

  // 7. VATS AP Cost per Shot
  if (hasVatsOptimized) {
    vatsBreakdown.push({ source: "V.A.T.S. Optimized 3★ (-35% AP)", value: `×${LEG.vatsOptimizedApMultiplier}` });
  }
  if (innateMods.apCostPct !== 0) {
    vatsBreakdown.push({
      source: "Attachments (Reflex / Stock / Barrel AP)",
      value: `${innateMods.apCostPct > 0 ? "+" : ""}${Math.round(innateMods.apCostPct * 100)}% AP`,
    });
  }

  // Unique innate: flat action points added to the pool (Civil Unrest, +50 AP).
  const apPoolModel = uniqueModelOfKind(uniqueItem, "flat-action-points");
  const uniqueApPoolBonus = apPoolModel?.value ?? 0;

  // `vatsApCost` was resolved in §3b (Number Cruncher reads it).
  // Thirst Quencher: END-scaled max AP (approximate range, character-stats.json), not while diseased.
  const thirstQuencherAp =
    (perkRanks.get("thirst-quencher") || 0) > 0 && input.playerStats.endurance !== undefined && !input.playerStats.isDiseased
      ? Math.round(lerpSpecial(input.playerStats.endurance, characterStats.perks["thirst-quencher"].min, characterStats.perks["thirst-quencher"].max))
      : 0;
  const totalApPool = characterStats.ap.base + input.playerStats.agility * characterStats.ap.perAgility + uniqueApPoolBonus + thirstQuencherAp;
  if (thirstQuencherAp > 0) {
    vatsBreakdown.push({ source: `Thirst Quencher (END ${input.playerStats.endurance}, approx.)`, value: `+${thirstQuencherAp} AP` });
  }
  const maxShotsInPool = Math.floor(totalApPool / vatsApCost);

  vatsBreakdown.push({ source: "Base VATS AP Cost", value: `${base.baseVatsApCost} AP` });
  vatsBreakdown.push({ source: "Total Action Points", value: `${totalApPool} AP (${input.playerStats.agility} AGI)` });
  if (uniqueApPoolBonus > 0) {
    vatsBreakdown.push({ source: `${uniqueName} (Innate)`, value: `+${uniqueApPoolBonus} AP` });
  }

  // 8. Critical Fill & Every-2nd-Shot Status (FO76 Luck & Critical Savvy Chart)
  const critSavvyRank = perkRanks.get("critical-savvy") || 0;
  const fourLeafCloverRank = perkRanks.get("four-leaf-clover") || 0;

  const critCycle = calculateVatsCritQualification({
    luck: input.playerStats.luck,
    critSavvyRank,
    hasLucky15Fill,
    hasVatsOptimized,
    fourLeafCloverRank,
  });

  if (fourLeafCloverRank > 0) {
    const cloverChance = fourLeafCloverRank === 3 ? 13.5 : fourLeafCloverRank === 2 ? 10.5 : 7.5;
    vatsBreakdown.push({
      source: `Four Leaf Clover (Rank ${fourLeafCloverRank})`,
      value: `~${cloverChance}% Instant Crit Refill on Hit`,
    });
  }

  // 9. True Armor Penetration Compounding
  // Anti-Armor (50%) + Tank Killer (36%) or Stabilized (45% in PA).
  // Sources stack multiplicatively and the total is capped at the 90% engine limit
  // by calculateEffectiveArmor (creation-engine-math is the source of truth).
  const penetrationSourcesPct: number[] = [];
  if (hasAntiArmor) {
    penetrationSourcesPct.push(LEG.antiArmorPenPct);
    apBreakdown.push({ source: "Anti-Armor 1★", value: `${LEG.antiArmorPenPct}% Penetration` });
  }

  if (innateMods.armorPenetrationPct > 0) {
    const innatePen = Math.min(0.9, innateMods.armorPenetrationPct / 100);
    penetrationSourcesPct.push(innatePen * 100);
    apBreakdown.push({
      source: "Magazine Penetration (Perforating/Piercing)",
      value: `${Math.round(innatePen * 100)}% Penetration`,
    });
  }

  // Unique innate: armor penetration per Onslaught stack (Ticket to Revenge, +3 points each).
  const penStackModel = uniqueModelOfKind(uniqueItem, "armor-pen-per-onslaught-stack");
  if (penStackModel && onslaughtStacks > 0) {
    const st = Math.min(penStackModel.maxUnits ?? onslaughtStacks, onslaughtStacks);
    const ttrPen = st * (penStackModel.perUnit ?? 0);
    penetrationSourcesPct.push(ttrPen);
    apBreakdown.push({ source: `${uniqueName} (${st} Onslaught stacks)`, value: `${ttrPen}% Penetration` });
  }

  const tankKillerRank = perkRanks.get("tank-killer") || 0;
  if (tankKillerRank > 0 && !isPA && (base.weaponClass === "rifleman" || base.weaponClass === "commando" || base.weaponClass === "gunslinger" || base.weaponClass === "guerrilla")) {
    const tkPen = tankKillerRank === 3 ? 0.36 : tankKillerRank === 2 ? 0.24 : 0.12;
    penetrationSourcesPct.push(tkPen * 100);
    apBreakdown.push({ source: `Tank Killer (Rank ${tankKillerRank})`, value: `${Math.round(tkPen * 100)}% Penetration` });
  }

  const bowBeforeMeRank = perkRanks.get("bow-before-me") || 0;
  if (bowBeforeMeRank > 0 && base.weaponClass === "bow") {
    const bowPen = bowBeforeMeRank === 3 ? 0.36 : bowBeforeMeRank === 2 ? 0.24 : 0.12;
    penetrationSourcesPct.push(bowPen * 100);
    apBreakdown.push({ source: `Bow Before Me (Rank ${bowBeforeMeRank})`, value: `${Math.round(bowPen * 100)}% Penetration` });
  }

  const stabilizedRank = perkRanks.get("stabilized") || 0;
  if (stabilizedRank > 0 && isPA && base.weaponClass === "heavy") {
    const stabPen = stabilizedRank === 3 ? 0.45 : stabilizedRank === 2 ? 0.3 : 0.15;
    penetrationSourcesPct.push(stabPen * 100);
    apBreakdown.push({ source: `Stabilized in PA (Rank ${stabilizedRank})`, value: `${Math.round(stabPen * 100)}% Penetration` });
  }

  const exterminatorRank = perkRanks.get("exterminator") || 0;
  if (exterminatorRank > 0 && targetIsInsect) {
    const exPen = byRank(CC.perks.exterminator.byRank, exterminatorRank);
    penetrationSourcesPct.push(exPen);
    apBreakdown.push({ source: `Exterminator (Rank ${exterminatorRank}, insect)`, value: `${exPen}% Penetration` });
  }

  const incisorRank = perkRanks.get("incisor") || 0;
  if (incisorRank > 0 && (base.weaponClass === "melee" || base.weaponClass === "unarmed")) {
    const incisorPen = incisorRank === 3 ? 0.75 : incisorRank === 2 ? 0.5 : 0.25;
    penetrationSourcesPct.push(incisorPen * 100);
    apBreakdown.push({ source: `Incisor (Rank ${incisorRank})`, value: `${Math.round(incisorPen * 100)}% Penetration` });
  }

  // Nominal 100 DR so totalPenetrationPct is the capped headline percentage.
  const effectiveArmorPenetrationPct = Math.round(
    calculateEffectiveArmor(100, penetrationSourcesPct).totalPenetrationPct
  );

  // 10. Resolve Combat Firing Mode & Active DPS
  const isInVats = Boolean(input.playerStats.isInVats);
  const vatsCritEveryOtherShot = Boolean(input.playerStats.vatsCritEveryOtherShot);

  let firingMode: CombatFiringMode = "hip_fire";
  let firingModeLabel = "Hip Fire (Standard Spread)";

  if (isInVats) {
    if (vatsCritEveryOtherShot && critCycle.everySecondShotReady) {
      firingMode = "vats_crit_cycle";
      firingModeLabel = "V.A.T.S. (1:1 Crit Every 2nd Shot)";
    } else {
      firingMode = "vats_standard";
      firingModeLabel = "V.A.T.S. (Standard Target Lock)";
    }
  } else if (input.playerStats.isAiming) {
    firingMode = "aiming_ads";
    firingModeLabel = "Aiming Down Sights (ADS)";
  }

  const activeShotDamage =
    firingMode === "vats_crit_cycle"
      ? Math.round((normalDamage + explosiveDamage + criticalDamage) / 2)
      : normalDamage + explosiveDamage;

  const activeDPS =
    firingMode === "vats_crit_cycle" ? criticalCycleDPS : burstDPS;

  const intermediateFirepower = {
    baseStats: base,
    firingMode,
    firingModeLabel,
    damagePerShot: {
      normal: normalDamage,
      critical: criticalDamage,
      explosiveBonus: explosiveDamage,
      totalPerShot: normalDamage + explosiveDamage,
      activeShotDamage,
      breakdown,
    },
    fireRate: {
      rps: effectiveRPS,
      rpm: effectiveRPM,
      isAutomatic: effectiveIsAutomatic,
      fireRateMultiplier,
    },
    magazineCapacity: {
      base: base.magazineSize,
      effective: effectiveMag,
      isQuad: hasQuad,
    },
    dps: {
      burstDPS,
      criticalCycleDPS,
      activeDPS,
      breakdown: dpsBreakdown,
    },
    vats: {
      apCostPerShot: vatsApCost,
      maxShotsInPool,
      totalApPool,
      breakdown: vatsBreakdown,
    },
    critCycle,
    weakSpot: {
      targeting: targetingWeakSpot,
      baseMultiplier: weakSpotBase,
      part: weakSpotDummy?.part ?? "Not in the wiki table",
      bonusPct: Math.round(weakSpotBonusPct * 1000) / 1000,
      multiplier: Math.round(weakSpotMultiplier * 1000) / 1000,
      breakdown: weakSpotBreakdown,
    },
    armorPenetration: {
      effectiveArmorPenetrationPct,
      breakdown: apBreakdown,
    },
  };

  const targetDummy = calculateTargetMitigation(
    intermediateFirepower,
    input.targetDummyId ?? "scorchbeast-queen"
  );
  targetDummy.activeDPSLanded =
    firingMode === "vats_crit_cycle"
      ? targetDummy.criticalCycleDPSLanded
      : targetDummy.burstDPSLanded;

  return {
    ...intermediateFirepower,
    targetDummy,
    ...(glowCards.length > 0 ? { glow: { cards: glowCards } } : {}),
  };
}

/**
 * Calculates landed damage and DPS against a specific target dummy
 * using authentic Fallout 76 damage mitigation formulas and boss flat reductions.
 */
export function calculateTargetMitigation(
  firepower: Pick<CombatFirepowerResult, "damagePerShot" | "armorPenetration" | "fireRate" | "baseStats">,
  dummyId?: string
): TargetDummyCalculation {
  const dummy = TARGET_DUMMY_CATALOG[dummyId || "scorchbeast-queen"] || TARGET_DUMMY_CATALOG["scorchbeast-queen"];
  const baseDR = firepower.baseStats.isEnergy ? dummy.energyResistance : dummy.damageResistance;
  const effectiveDR = Math.max(
    0,
    Math.round(calculateEffectiveArmor(baseDR, [firepower.armorPenetration.effectiveArmorPenetrationPct]).effectiveDr)
  );

  const rawNormal = firepower.damagePerShot.totalPerShot;
  const rawCrit = firepower.damagePerShot.critical;

  // Canonical continuous Creation Engine curve, coeff = min(0.99, ((dmg * 0.15) / DR) ^ 0.365),
  // owned by creation-engine-math. Zero DR lands the 0.99 cap (the curve's limit), and the
  // dummy's flat boss reduction (stored as a fraction) applies after the curve. The engine
  // keeps whole-number landed damage with a floor of 1.
  const flatReductionPct = dummy.flatDamageReductionPct * 100;
  const normalHit = calculateMitigatedDamage(rawNormal, effectiveDR, flatReductionPct);
  const critHit = calculateMitigatedDamage(rawCrit, effectiveDR, flatReductionPct);

  const normalMitigationRatio = rawNormal > 0 ? normalHit.damageCoefficientPct / 100 : 1.0;

  const normalLanded = Math.max(1, Math.round(normalHit.finalDamage));
  const criticalLanded = Math.max(1, Math.round(critHit.finalDamage));

  const burstDPSLanded = Math.round(normalLanded * firepower.fireRate.rps);
  const criticalCycleDPSLanded = Math.round(((normalLanded + criticalLanded) / 2) * firepower.fireRate.rps);

  const armorMitigationPct = Math.round((1 - normalMitigationRatio) * 100);

  return {
    dummy,
    effectiveDR,
    armorMitigationPct,
    mitigationRatio: normalMitigationRatio,
    normalLanded,
    criticalLanded,
    burstDPSLanded,
    criticalCycleDPSLanded,
  };
}
