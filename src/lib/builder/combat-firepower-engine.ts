import type { BuilderModDTO } from "@/lib/builder/types";

export type WeaponDamageType =
  | "ballistic"
  | "energy"
  | "fire"
  | "cryo"
  | "poison"
  | "radiation"
  | "physical";

export type WeaponClassCategory =
  | "commando"
  | "rifleman"
  | "heavy"
  | "shotgunner"
  | "melee"
  | "unarmed"
  | "gunslinger"
  | "guerrilla"
  | "bow";

export type WeaponCombatBaseStats = {
  id: string;
  label: string;
  baseDamage: number;
  secondaryDamage?: number;
  damageType: WeaponDamageType;
  secondaryDamageType?: WeaponDamageType;
  fireRate: number; // rounds per second (RPS)
  baseVatsApCost: number;
  magazineSize: number;
  weaponClass: WeaponClassCategory;
  isAutomatic: boolean;
  isRanged: boolean;
  isEnergy: boolean;
  isExplosiveInherent?: boolean;
};

/**
 * Authoritative baseline combat stats for Fallout 76 weapons.
 */
export const WEAPON_COMBAT_BASE_CATALOG: Record<string, WeaponCombatBaseStats> = {
  // --- NAMED UNIQUE WEAPONS ---
  "the-fixer": {
    id: "the-fixer",
    label: "The Fixer (Combat Rifle · Sneak)",
    baseDamage: 48,
    damageType: "ballistic",
    fireRate: 9.1, // Auto Receiver
    baseVatsApCost: 25,
    magazineSize: 25,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "railway-rifle": {
    id: "railway-rifle",
    label: "Railway Rifle",
    baseDamage: 95,
    damageType: "ballistic",
    fireRate: 10.0, // Automatic Piston
    baseVatsApCost: 20,
    magazineSize: 10,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "handmade-rifle": {
    id: "handmade-rifle",
    label: "Handmade Rifle",
    baseDamage: 45,
    damageType: "ballistic",
    fireRate: 9.1,
    baseVatsApCost: 25,
    magazineSize: 25,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "elders-mark": {
    id: "elders-mark",
    label: "Elder's Mark (Submachine Gun · Unique)",
    baseDamage: 38,
    damageType: "ballistic",
    fireRate: 13.5, // Rapid native FFR
    baseVatsApCost: 18,
    magazineSize: 50,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "holy-fire": {
    id: "holy-fire",
    label: "Holy Fire (Flamer · Unique)",
    baseDamage: 58,
    damageType: "fire",
    fireRate: 9.1,
    baseVatsApCost: 30,
    magazineSize: 200,
    weaponClass: "heavy",
    isAutomatic: true,
    isRanged: true,
    isEnergy: true,
  },
  "anchorage-ace": {
    id: "anchorage-ace",
    label: "Anchorage Ace (10mm SMG · Unique)",
    baseDamage: 36,
    damageType: "ballistic",
    fireRate: 10.5,
    baseVatsApCost: 15,
    magazineSize: 30,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "cold-shoulder": {
    id: "cold-shoulder",
    label: "Cold Shoulder (Double-Barrel · Unique)",
    baseDamage: 115,
    secondaryDamage: 75,
    damageType: "ballistic",
    secondaryDamageType: "cryo",
    fireRate: 4.0,
    baseVatsApCost: 28,
    magazineSize: 8,
    weaponClass: "shotgunner",
    isAutomatic: false,
    isRanged: true,
    isEnergy: false,
  },
  "red-terror": {
    id: "red-terror",
    label: "Red Terror (LMG · Unique)",
    baseDamage: 42,
    damageType: "ballistic",
    fireRate: 15.9,
    baseVatsApCost: 35,
    magazineSize: 150, // Double capacity
    weaponClass: "heavy",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "v63-bertha": {
    id: "v63-bertha",
    label: "V63 Bertha (Tesla Rifle · Unique)",
    baseDamage: 78,
    damageType: "energy",
    fireRate: 8.3,
    baseVatsApCost: 28,
    magazineSize: 30,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: true,
  },
  "v63-helga": {
    id: "v63-helga",
    label: "V63 Helga (Gatling Laser · Unique)",
    baseDamage: 35,
    damageType: "energy",
    fireRate: 18.2,
    baseVatsApCost: 30,
    magazineSize: 500,
    weaponClass: "heavy",
    isAutomatic: true,
    isRanged: true,
    isEnergy: true,
  },
  "v63-olga": {
    id: "v63-olga",
    label: "V63 Olga (Laser Rifle · Unique)",
    baseDamage: 52,
    damageType: "energy",
    fireRate: 9.1,
    baseVatsApCost: 22,
    magazineSize: 30,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: true,
  },
  "v63-zweihander": {
    id: "v63-zweihander",
    label: "V63 Zweihänder (Super Sledge · Unique)",
    baseDamage: 125,
    secondaryDamage: 40,
    damageType: "physical",
    secondaryDamageType: "energy",
    fireRate: 1.2,
    baseVatsApCost: 35,
    magazineSize: 1,
    weaponClass: "melee",
    isAutomatic: false,
    isRanged: false,
    isEnergy: false,
  },
  "v63-shock-baton": {
    id: "v63-shock-baton",
    label: "V63 Shock Baton (Security Baton · Unique)",
    baseDamage: 65,
    secondaryDamage: 30,
    damageType: "physical",
    secondaryDamageType: "energy",
    fireRate: 2.2,
    baseVatsApCost: 20,
    magazineSize: 1,
    weaponClass: "melee",
    isAutomatic: false,
    isRanged: false,
    isEnergy: false,
  },
  "ticket-to-revenge": {
    id: "ticket-to-revenge",
    label: "Ticket to Revenge (Railway Rifle · Unique)",
    baseDamage: 95,
    damageType: "ballistic",
    fireRate: 10.0,
    baseVatsApCost: 20,
    magazineSize: 20,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "shattered-grounds": {
    id: "shattered-grounds",
    label: "Shattered Grounds (Handmade · Unique)",
    baseDamage: 45,
    damageType: "ballistic",
    fireRate: 9.1,
    baseVatsApCost: 25,
    magazineSize: 25,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "cremator": {
    id: "cremator",
    label: "Cremator (Heavy DoT Launcher)",
    baseDamage: 80,
    secondaryDamage: 140, // Fire DoT
    damageType: "fire",
    secondaryDamageType: "fire",
    fireRate: 1.5,
    baseVatsApCost: 35,
    magazineSize: 12,
    weaponClass: "heavy",
    isAutomatic: false,
    isRanged: true,
    isEnergy: true,
    isExplosiveInherent: true,
  },
  "plasma-caster": {
    id: "plasma-caster",
    label: "Plasma Caster (Heavy Energy)",
    baseDamage: 76,
    secondaryDamage: 76,
    damageType: "ballistic",
    secondaryDamageType: "energy",
    fireRate: 3.3,
    baseVatsApCost: 30,
    magazineSize: 20,
    weaponClass: "heavy",
    isAutomatic: false,
    isRanged: true,
    isEnergy: true,
  },
  "gatling-plasma": {
    id: "gatling-plasma",
    label: "Gatling Plasma",
    baseDamage: 58,
    secondaryDamage: 58,
    damageType: "ballistic",
    secondaryDamageType: "energy",
    fireRate: 9.1,
    baseVatsApCost: 30,
    magazineSize: 250,
    weaponClass: "heavy",
    isAutomatic: true,
    isRanged: true,
    isEnergy: true,
  },
  "50-cal-machine-gun": {
    id: "50-cal-machine-gun",
    label: ".50 Cal Machine Gun",
    baseDamage: 42,
    damageType: "ballistic",
    fireRate: 9.1,
    baseVatsApCost: 30,
    magazineSize: 250,
    weaponClass: "heavy",
    isAutomatic: true,
    isRanged: true,
    isEnergy: false,
  },
  "auto-axe": {
    id: "auto-axe",
    label: "Auto Axe (Very Fast Melee)",
    baseDamage: 42,
    damageType: "physical",
    fireRate: 8.0, // High continuous ticks
    baseVatsApCost: 15,
    magazineSize: 1,
    weaponClass: "melee",
    isAutomatic: true,
    isRanged: false,
    isEnergy: false,
  },
  chainsaw: {
    id: "chainsaw",
    label: "Chainsaw (Very Fast Melee)",
    baseDamage: 38,
    damageType: "physical",
    fireRate: 8.0,
    baseVatsApCost: 15,
    magazineSize: 1,
    weaponClass: "melee",
    isAutomatic: true,
    isRanged: false,
    isEnergy: false,
  },
  "gauss-rifle": {
    id: "gauss-rifle",
    label: "Gauss Rifle",
    baseDamage: 140,
    damageType: "energy",
    fireRate: 2.0,
    baseVatsApCost: 28,
    magazineSize: 5,
    weaponClass: "rifleman",
    isAutomatic: false,
    isRanged: true,
    isEnergy: true,
    isExplosiveInherent: true,
  },
  "enclave-plasma-rifle": {
    id: "enclave-plasma-rifle",
    label: "Enclave Plasma Rifle (Flamer/Auto)",
    baseDamage: 48,
    secondaryDamage: 48,
    damageType: "ballistic",
    secondaryDamageType: "energy",
    fireRate: 9.1,
    baseVatsApCost: 28,
    magazineSize: 30,
    weaponClass: "commando",
    isAutomatic: true,
    isRanged: true,
    isEnergy: true,
  },
  "alien-blaster": {
    id: "alien-blaster",
    label: "Alien Blaster (Cryo/Poison)",
    baseDamage: 32,
    damageType: "energy",
    fireRate: 6.0,
    baseVatsApCost: 15,
    magazineSize: 42,
    weaponClass: "gunslinger",
    isAutomatic: false,
    isRanged: true,
    isEnergy: true,
  },
  "crusader-pistol": {
    id: "crusader-pistol",
    label: "Crusader Pistol (Brotherhood Small Arms)",
    baseDamage: 45,
    damageType: "ballistic",
    fireRate: 4.5,
    baseVatsApCost: 18,
    magazineSize: 12,
    weaponClass: "gunslinger",
    isAutomatic: false,
    isRanged: true,
    isEnergy: false,
  },
  "compound-bow": {
    id: "compound-bow",
    label: "Compound Bow",
    baseDamage: 110,
    damageType: "physical",
    fireRate: 0.8,
    baseVatsApCost: 22,
    magazineSize: 1,
    weaponClass: "bow",
    isAutomatic: false,
    isRanged: true,
    isEnergy: false,
  },
  "power-fist": {
    id: "power-fist",
    label: "Power Fist (Unarmed)",
    baseDamage: 58,
    damageType: "physical",
    fireRate: 1.8,
    baseVatsApCost: 20,
    magazineSize: 1,
    weaponClass: "unarmed",
    isAutomatic: false,
    isRanged: false,
    isEnergy: false,
  },
  "deathclaw-gauntlet": {
    id: "deathclaw-gauntlet",
    label: "Deathclaw Gauntlet (Unarmed)",
    baseDamage: 55,
    damageType: "physical",
    fireRate: 2.0,
    baseVatsApCost: 20,
    magazineSize: 1,
    weaponClass: "unarmed",
    isAutomatic: false,
    isRanged: false,
    isEnergy: false,
  },
};

/**
 * Fallback baseline stats for generic weapons when not explicitly cataloged.
 */
export function getWeaponCombatBaseStats(weaponId: string): WeaponCombatBaseStats {
  const cleanId = weaponId.toLowerCase().trim();
  if (WEAPON_COMBAT_BASE_CATALOG[cleanId]) {
    return WEAPON_COMBAT_BASE_CATALOG[cleanId];
  }

  // Fallback heuristics based on weapon ID naming
  if (cleanId.includes("heavy") || cleanId.includes("gatling") || cleanId.includes("flamer") || cleanId.includes("lmg") || cleanId.includes("minigun")) {
    return {
      id: cleanId,
      label: weaponId,
      baseDamage: 45,
      damageType: cleanId.includes("plasma") || cleanId.includes("laser") ? "energy" : "ballistic",
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
      baseDamage: 95,
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
      baseDamage: 90,
      damageType: "ballistic",
      fireRate: 3.5,
      baseVatsApCost: 28,
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

export type BossTargetDummy = {
  id: string;
  name: string;
  shortName: string;
  category: "boss" | "standard" | "sheet";
  damageResistance: number;
  energyResistance: number;
  flatDamageReductionPct: number; // e.g. 0.70 for Queen (70% flat reduction)
  description: string;
};

export const TARGET_DUMMY_CATALOG: Record<string, BossTargetDummy> = {
  "scorchbeast-queen": {
    id: "scorchbeast-queen",
    name: "Scorchbeast Queen",
    shortName: "SBQ",
    category: "boss",
    damageResistance: 300,
    energyResistance: 300,
    flatDamageReductionPct: 0.70,
    description: "Endgame Nuke Boss (300 DR, 70% flat damage reduction)",
  },
  "earle-williams": {
    id: "earle-williams",
    name: "Earle Williams (Colossal Problem)",
    shortName: "Earle",
    category: "boss",
    damageResistance: 400,
    energyResistance: 400,
    flatDamageReductionPct: 0.80,
    description: "Deep Mine Colossus Boss (400 DR, 80% flat damage reduction)",
  },
  "ultracite-titan": {
    id: "ultracite-titan",
    name: "Ultracite Titan (Seismic Activity)",
    shortName: "Titan",
    category: "boss",
    damageResistance: 350,
    energyResistance: 350,
    flatDamageReductionPct: 0.75,
    description: "Ash Heap Behemoth Boss (350 DR, 75% flat damage reduction)",
  },
  "level-100-super-mutant": {
    id: "level-100-super-mutant",
    name: "Level 100 Super Mutant Behemoth",
    shortName: "Mutant L100",
    category: "standard",
    damageResistance: 210,
    energyResistance: 210,
    flatDamageReductionPct: 0.0,
    description: "High-tier Appalachian standard target (210 DR, 0% flat reduction)",
  },
  "raw-unarmored": {
    id: "raw-unarmored",
    name: "Unarmored / Raw Sheet DPS",
    shortName: "Raw Sheet",
    category: "sheet",
    damageResistance: 0,
    energyResistance: 0,
    flatDamageReductionPct: 0.0,
    description: "Unmitigated baseline benchmark dummy (0 DR, 0% reduction)",
  },
};

export const TARGET_DUMMY_LIST: BossTargetDummy[] = Object.values(TARGET_DUMMY_CATALOG);

export type CombatFiringMode = "hip_fire" | "aiming_ads" | "vats_standard" | "vats_crit_cycle";

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
    feralPct?: number;
    foodState?: string;
    thirstState?: string;
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
  armorPenetration: {
    effectiveArmorPenetrationPct: number;
    breakdown: { source: string; value: string }[];
  };
  targetDummy: TargetDummyCalculation;
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

  // Meter cost per crit in Fallout 76:
  // Rank 3 = 55%, Rank 2 = 70%, Rank 1 = 85%, None (0) = 100%
  const fillCostPct =
    critSavvyRank >= 3 ? 55 : critSavvyRank === 2 ? 70 : critSavvyRank === 1 ? 85 : 100;

  // Fill per shot: (Luck * 1.5) + 5 + (Lucky 15% ? 15 : 0)
  const fillPerShotPct = Math.round(luck * 1.5 + (hasLucky15Fill ? 15 : 0) + 5);

  // Canonical FO76 Luck Thresholds for 1:1 Crit-Every-Other-Shot:
  // Rank 3 (55% cost): 33 Luck without Lucky, 23 Luck with Lucky
  // Rank 2 (70% cost): 44 Luck without Lucky, 34 Luck with Lucky
  // Rank 1 (85% cost): 54 Luck without Lucky, 44 Luck with Lucky
  // Rank 0 (100% cost): 64 Luck without Lucky, 54 Luck with Lucky
  let requiredLuck = 64;
  if (critSavvyRank >= 3) {
    requiredLuck = hasLucky15Fill ? 23 : 33;
  } else if (critSavvyRank === 2) {
    requiredLuck = hasLucky15Fill ? 34 : 44;
  } else if (critSavvyRank === 1) {
    requiredLuck = hasLucky15Fill ? 44 : 54;
  } else {
    requiredLuck = hasLucky15Fill ? 54 : 64;
  }

  const everySecondShotReady = luck >= requiredLuck;
  const missingLuck = Math.max(0, requiredLuck - luck);

  let summary = "";
  let recommendation = "";

  if (everySecondShotReady) {
    summary = `QUALIFIED: 1:1 Crit Cycle active (${luck}/${requiredLuck} Luck with ${
      critSavvyRank > 0 ? `Crit Savvy R${critSavvyRank}` : "No Crit Savvy"
    }${hasLucky15Fill ? " + 3★ Lucky" : ""}).`;
    recommendation = "Optimal 1:1 crit loop achieved! Critical hits alternate every second shot.";
  } else {
    summary = `LOCKED: Need ${requiredLuck} Luck (Current: ${luck}, Missing: +${missingLuck}).`;
    if (critSavvyRank < 3 && !hasLucky15Fill) {
      recommendation = `Equip Critical Savvy Rank 3 to lower Luck threshold from ${requiredLuck} down to 33, or add a 3★ Lucky weapon to drop it to 23.`;
    } else if (critSavvyRank >= 3 && !hasLucky15Fill) {
      recommendation = `Add +${missingLuck} Luck (via Unyielding armor, Legendary Luck, or buffs) or add 3★ Lucky weapon mod (-10 Luck requirement).`;
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
 * Calculates complete Live Weapon Firepower, Damage per Shot, Burst/Sustained DPS,
 * and V.A.T.S. AP Cost in strict adherence to Fallout 76 live patch mechanics.
 */
export function calculateCombatFirepower(
  input: CombatFirepowerCalculationInput
): CombatFirepowerResult {
  const base = getWeaponCombatBaseStats(input.weaponId);
  const rawHealth = input.playerStats.healthPct ?? 0.2;
  const healthPct = rawHealth > 1 ? rawHealth / 100 : rawHealth; // Seamlessly handles 0.2 and 20% format
  const caps = input.playerStats.caps ?? 30000; // Default max caps for Aristocrat's
  const hasSIN = Boolean(input.playerStats.hasStrangeInNumbers);
  const isPA = Boolean(input.playerStats.isPowerArmor);

  const breakdown: { source: string; value: string }[] = [];
  const dpsBreakdown: { source: string; value: string }[] = [];
  const vatsBreakdown: { source: string; value: string }[] = [];
  const apBreakdown: { source: string; value: string }[] = [];

  breakdown.push({ source: "Base Weapon Damage", value: `${base.baseDamage}` });

  // 1. Additive Damage Modifiers Pool
  let additiveDamagePct = 0;

  // Perk Card Scaling
  const perkRanks = new Map<string, number>();
  for (const p of input.equippedPerks) {
    perkRanks.set(p.cardId.toLowerCase().trim(), p.rank);
  }

  // Weapon Class Perks
  if (base.weaponClass === "commando" && base.isAutomatic) {
    const c1 = perkRanks.get("commando") || 0;
    const c2 = perkRanks.get("expert-commando") || 0;
    const c3 = perkRanks.get("master-commando") || 0;
    const total = (c1 > 0 ? 0.1 + (c1 - 1) * 0.05 : 0) + (c2 > 0 ? 0.1 + (c2 - 1) * 0.05 : 0) + (c3 > 0 ? 0.1 + (c3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Commando Perks", value: `+${Math.round(total * 100)}%` });
    }
  } else if (base.weaponClass === "rifleman" || (!base.isAutomatic && base.weaponClass === "commando")) {
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
    // Modeled as mid-combat sustained bonus (60% of max stacks)
    const maxStacks = hasBigGuns ? 20 : 10;
    const bulletStormBonus = bulletStormRank > 0 ? (bulletStormRank * 0.03) * (maxStacks * 0.6) : 0;

    const total = bulletStormBonus > 0 ? bulletStormBonus : legacyTotal;
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({
        source: bulletStormBonus > 0 ? "Bullet Storm (Heavy Sustained)" : "Heavy Gunner Perks (Legacy)",
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
    const sluggerBonus = sluggerRank > 0 ? sluggerRank * 0.10 : 0;

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
    const g1 = perkRanks.get("gunslinger") || 0;
    const g2 = perkRanks.get("expert-gunslinger") || 0;
    const g3 = perkRanks.get("master-gunslinger") || 0;
    const total = (g1 > 0 ? 0.1 + (g1 - 1) * 0.05 : 0) + (g2 > 0 ? 0.1 + (g2 - 1) * 0.05 : 0) + (g3 > 0 ? 0.1 + (g3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Gunslinger Perks", value: `+${Math.round(total * 100)}%` });
    }
  } else if (base.weaponClass === "guerrilla") {
    const g1 = perkRanks.get("guerrilla") || 0;
    const g2 = perkRanks.get("expert-guerrilla") || 0;
    const g3 = perkRanks.get("master-guerrilla") || 0;
    const total = (g1 > 0 ? 0.1 + (g1 - 1) * 0.05 : 0) + (g2 > 0 ? 0.1 + (g2 - 1) * 0.05 : 0) + (g3 > 0 ? 0.1 + (g3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Guerrilla Perks", value: `+${Math.round(total * 100)}%` });
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

  const nerdRageRank = perkRanks.get("nerd-rage") || 0;
  if (nerdRageRank > 0 && healthPct <= 0.2) {
    const nr = nerdRageRank === 1 ? 0.1 : nerdRageRank === 2 ? 0.15 : 0.2;
    additiveDamagePct += nr;
    breakdown.push({ source: `Nerd Rage (<20% HP)`, value: `+${Math.round(nr * 100)}%` });
  }

  const adrenalineRank = perkRanks.get("adrenaline") || 0;
  if (adrenalineRank > 0) {
    const adr = adrenalineRank === 1 ? 0.36 : adrenalineRank === 2 ? 0.42 : adrenalineRank === 3 ? 0.48 : adrenalineRank === 4 ? 0.54 : 0.6;
    additiveDamagePct += adr;
    breakdown.push({ source: `Adrenaline (Max Stacks)`, value: `+${Math.round(adr * 100)}%` });
  }

  // 2. Legendary Stars Analysis
  const modSlugs = (input.equippedMods || [])
    .filter((m): m is { slug: string } => Boolean(m && typeof m.slug === "string"))
    .map((m) => m.slug.toLowerCase());

  let hasAntiArmor = false;
  let hasQuad = false;
  let hasRapid = false;
  let hasExplosive = false;
  let hasVitalCrit = false;
  let hasVatsOptimized = false;
  let hasLucky15Fill = false;

  for (const slug of modSlugs) {
    if (slug === "bloodied") {
      // Bloodied gives up to +95% (80% at 20% HP)
      const bloodiedBonus = Math.min(0.95, Math.max(0, (1 - healthPct) * 1.0));
      additiveDamagePct += bloodiedBonus;
      breakdown.push({ source: `Bloodied (${Math.round((1 - healthPct) * 100)}% Missing HP)`, value: `+${Math.round(bloodiedBonus * 100)}%` });
    } else if (slug === "anti-armor" || slug === "anti_armor") {
      hasAntiArmor = true;
    } else if (slug === "aristocrats" || slug === "aristocrat-s") {
      const aristoBonus = caps >= 29000 ? 0.5 : (caps / 29000) * 0.5;
      additiveDamagePct += aristoBonus;
      breakdown.push({ source: "Aristocrat's (29k+ Caps)", value: `+${Math.round(aristoBonus * 100)}%` });
    } else if (slug === "two-shot" || slug === "two_shot") {
      additiveDamagePct += 0.25;
      breakdown.push({ source: "Two Shot (+25% Base)", value: "+25%" });
    } else if (slug === "quad") {
      hasQuad = true;
    } else if (slug === "rapid" || slug.includes("25-weapon-speed") || slug.includes("faster-fire-rate")) {
      hasRapid = true;
    } else if (slug === "explosive") {
      hasExplosive = true;
    } else if (slug === "vital" || slug.includes("50-critical-damage")) {
      hasVitalCrit = true;
    } else if (slug === "vats-optimized" || slug.includes("25-less-vats-action-point-cost") || slug.includes("35-less-vats-action-point-cost") || slug.includes("vats-cost")) {
      hasVatsOptimized = true;
    } else if (slug === "lucky" || slug.includes("15-critical-charge") || slug.includes("15-crit-fill")) {
      hasLucky15Fill = true;
    } else if (slug === "nocturnal" || slug === "nocturnal-weapon") {
      const isNight = input.playerStats.timeOfDay === "night";
      const isCrouched = Boolean(input.playerStats.isCrouched || input.playerStats.isSneaking);
      if (isNight || isCrouched) {
        additiveDamagePct += 0.50;
        breakdown.push({
          source: isCrouched ? "Nocturnal (Crouched / Stealthed)" : "Nocturnal (Nighttime)",
          value: "+50%"
        });
      }
    } else if (slug === "stalkers" || slug === "stalker-s") {
      const isCrouched = Boolean(input.playerStats.isCrouched || input.playerStats.isSneaking);
      if (isCrouched) {
        additiveDamagePct += 1.0;
        breakdown.push({ source: "Stalker's (Crouched / Stealthed)", value: "+100% Sneak Attack" });
      }
    } else if (slug === "hitmans" || slug === "hitman-s" || slug.includes("damage-while-aiming")) {
      const isInVats = Boolean(input.playerStats.isInVats);
      if (input.playerStats.isAiming && !isInVats) {
        additiveDamagePct += 0.25;
        breakdown.push({ source: "Hitman's 2★ (Aiming Down Sights)", value: "+25%" });
      }
    } else if (slug === "heavy-hitters" || slug === "heavy-hitter-s" || slug.includes("power-attack-damage")) {
      if (input.playerStats.isPowerAttacking) {
        additiveDamagePct += 0.40;
        breakdown.push({ source: "Heavy Hitter's 2★ (Power Attack)", value: "+40%" });
      }
    } else if (slug === "steady" || slug.includes("damage-while-not-moving")) {
      if (!input.playerStats.isSprinting) {
        additiveDamagePct += 0.25;
        breakdown.push({ source: "Steady 2★ (Stationary / Not Moving)", value: "+25%" });
      }
    } else if (slug === "junkies" || slug === "junkie-s") {
      const addictions = input.playerStats.addictionsCount || 0;
      const jBonus = Math.min(0.50, addictions * 0.10);
      if (jBonus > 0) {
        additiveDamagePct += jBonus;
        breakdown.push({ source: `Junkie's (${addictions} Addictions)`, value: `+${Math.round(jBonus * 100)}%` });
      }
    } else if (slug === "juggernauts" || slug === "juggernaut-s") {
      if (healthPct >= 0.75) {
        const juggBonus = Math.min(0.25, (healthPct - 0.75) * 1.0);
        if (juggBonus > 0) {
          additiveDamagePct += juggBonus;
          breakdown.push({ source: `Juggernaut's (${Math.round(healthPct * 100)}% HP)`, value: `+${Math.round(juggBonus * 100)}%` });
        }
      }
    } else if (slug === "gourmands" || slug === "gourmand-s") {
      const isWellFed = input.playerStats.foodState === "well_fed" || input.playerStats.foodState === "fully_fed";
      const isWellHydrated = input.playerStats.thirstState === "well_hydrated" || input.playerStats.thirstState === "fully_hydrated";
      const gourmandBonus = (isWellFed ? 0.12 : 0) + (isWellHydrated ? 0.12 : 0);
      if (gourmandBonus > 0) {
        additiveDamagePct += gourmandBonus;
        breakdown.push({ source: "Gourmand's (Fed & Hydrated)", value: `+${Math.round(gourmandBonus * 100)}%` });
      }
    } else if (slug === "mutants" || slug === "mutant-s") {
      const mutationCount = Math.min(5, input.activeBuffs?.activeMutations?.length || 0);
      const mutBonus = mutationCount * 0.05;
      if (mutBonus > 0) {
        additiveDamagePct += mutBonus;
        breakdown.push({ source: `Mutant's (${mutationCount} Mutations)`, value: `+${Math.round(mutBonus * 100)}%` });
      }
    } else if (slug === "lucid") {
      const feral = input.playerStats.feralPct ?? 100;
      if (feral >= 80) {
        additiveDamagePct += 0.40;
        breakdown.push({ source: "Lucid (High Lucidity 80%+)", value: "+40%" });
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

    let sneakMultiplier = 2.0;
    if (base.weaponClass === "melee" || base.weaponClass === "unarmed") {
      sneakMultiplier = ninjaRank > 0 ? 3.0 : 2.0;
    } else {
      if (covertRank > 0) sneakMultiplier = 2.5;
      if (isNight && sandmanRank > 0) sneakMultiplier += sandmanRank * 0.25;
    }

    additiveDamagePct += (sneakMultiplier - 1.0);
    breakdown.push({
      source: `Sneak Attack (${isNight && sandmanRank > 0 ? "Mister Sandman " : ""}${sneakMultiplier}× Multiplier)`,
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

  // Dynamic Adrenaline Kill Streak scaling (if provided directly via switchboard)
  if (input.playerStats.adrenalineStacks !== undefined && input.playerStats.adrenalineStacks > 0 && adrenalineRank === 0) {
    const adrKillsBonus = input.playerStats.adrenalineStacks * 0.10;
    additiveDamagePct += adrKillsBonus;
    breakdown.push({ source: `Adrenaline (${input.playerStats.adrenalineStacks} Kills)`, value: `+${Math.round(adrKillsBonus * 100)}%` });
  }

  // 3. Consumable Buffs
  const buffs = input.activeBuffs;
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

  // Normal Damage Per Shot Calculation
  const normalDamage = Math.round(base.baseDamage * (1 + additiveDamagePct));

  // Explosive Area Damage
  let explosiveDamage = 0;
  if (hasExplosive || base.isExplosiveInherent) {
    const demoRank = perkRanks.get("demolition-expert") || 0;
    const demoScale = 1 + (demoRank > 0 ? 0.2 + (demoRank - 1) * 0.1 : 0);
    explosiveDamage = Math.round(base.baseDamage * 0.2 * demoScale);
    breakdown.push({ source: `Explosive Impact (Demo Exp Rank ${demoRank})`, value: `+${explosiveDamage}` });
  }

  // 4. Critical Damage Multiplier Pool
  // Base Crit = +100% of Base Damage
  let critBonusPct = 1.0;

  const betterCritsRank = perkRanks.get("better-criticals") || 0;
  if (betterCritsRank > 0) {
    const bc = betterCritsRank === 1 ? 0.5 : betterCritsRank === 2 ? 0.75 : 1.0;
    critBonusPct += bc;
    breakdown.push({ source: `Better Criticals (Rank ${betterCritsRank})`, value: `+${Math.round(bc * 100)}% Crit` });
  }

  if (hasVitalCrit) {
    critBonusPct += 0.5;
    breakdown.push({ source: "Vital 2★ (+50% Crit)", value: "+50% Crit" });
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

  const criticalDamage = normalDamage + Math.round(base.baseDamage * critBonusPct) + explosiveDamage;

  // 5. Fire Rate & DPS
  const fireRateMultiplier = hasRapid ? 1.25 : 1.0;
  const effectiveRPS = base.fireRate * fireRateMultiplier;
  const effectiveRPM = Math.round(effectiveRPS * 60);

  if (hasRapid) {
    dpsBreakdown.push({ source: "Rapid 2★ Weapon Speed", value: "+25% Fire Rate" });
  }

  const burstDPS = Math.round((normalDamage + explosiveDamage) * effectiveRPS);

  // Critical Cycle DPS (Average of Normal + Crit per alternating cycle)
  const criticalCycleDPS = Math.round(
    ((normalDamage + explosiveDamage + criticalDamage) / 2) * effectiveRPS
  );

  dpsBreakdown.push({ source: "Base Fire Rate", value: `${base.fireRate.toFixed(1)} rps (${Math.round(base.fireRate * 60)} rpm)` });
  dpsBreakdown.push({ source: "Effective Fire Rate", value: `${effectiveRPS.toFixed(1)} rps (${effectiveRPM} rpm)` });

  // 6. Magazine Capacity
  const effectiveMag = hasQuad ? base.magazineSize * 4 : base.magazineSize;

  // 7. VATS AP Cost per Shot
  let apMultiplier = 1.0;
  if (hasVatsOptimized) {
    apMultiplier *= 0.75;
    vatsBreakdown.push({ source: "VATS Optimized 3★ (-25% AP)", value: "×0.75" });
  }

  const vatsApCost = Math.max(2, Math.round(base.baseVatsApCost * apMultiplier));
  const totalApPool = 100 + input.playerStats.agility * 10;
  const maxShotsInPool = Math.floor(totalApPool / vatsApCost);

  vatsBreakdown.push({ source: "Base VATS AP Cost", value: `${base.baseVatsApCost} AP` });
  vatsBreakdown.push({ source: "Total Action Points", value: `${totalApPool} AP (${input.playerStats.agility} AGI)` });

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
  // Anti-Armor (50%) + Tank Killer (36%) or Stabilized (45% in PA)
  let penRemaining = 1.0;
  if (hasAntiArmor) {
    penRemaining *= 0.5;
    apBreakdown.push({ source: "Anti-Armor 1★", value: "50% Penetration" });
  }

  const tankKillerRank = perkRanks.get("tank-killer") || 0;
  if (tankKillerRank > 0 && !isPA && (base.weaponClass === "rifleman" || base.weaponClass === "commando" || base.weaponClass === "gunslinger" || base.weaponClass === "guerrilla")) {
    const tkPen = tankKillerRank === 3 ? 0.36 : tankKillerRank === 2 ? 0.24 : 0.12;
    penRemaining *= 1 - tkPen;
    apBreakdown.push({ source: `Tank Killer (Rank ${tankKillerRank})`, value: `${Math.round(tkPen * 100)}% Penetration` });
  }

  const bowBeforeMeRank = perkRanks.get("bow-before-me") || 0;
  if (bowBeforeMeRank > 0 && base.weaponClass === "bow") {
    const bowPen = bowBeforeMeRank === 3 ? 0.36 : bowBeforeMeRank === 2 ? 0.24 : 0.12;
    penRemaining *= 1 - bowPen;
    apBreakdown.push({ source: `Bow Before Me (Rank ${bowBeforeMeRank})`, value: `${Math.round(bowPen * 100)}% Penetration` });
  }

  const stabilizedRank = perkRanks.get("stabilized") || 0;
  if (stabilizedRank > 0 && isPA && base.weaponClass === "heavy") {
    const stabPen = stabilizedRank === 3 ? 0.45 : stabilizedRank === 2 ? 0.3 : 0.15;
    penRemaining *= 1 - stabPen;
    apBreakdown.push({ source: `Stabilized in PA (Rank ${stabilizedRank})`, value: `${Math.round(stabPen * 100)}% Penetration` });
  }

  const incisorRank = perkRanks.get("incisor") || 0;
  if (incisorRank > 0 && (base.weaponClass === "melee" || base.weaponClass === "unarmed")) {
    const incisorPen = incisorRank === 3 ? 0.75 : incisorRank === 2 ? 0.5 : 0.25;
    penRemaining *= 1 - incisorPen;
    apBreakdown.push({ source: `Incisor (Rank ${incisorRank})`, value: `${Math.round(incisorPen * 100)}% Penetration` });
  }

  const effectiveArmorPenetrationPct = Math.round((1 - penRemaining) * 100);

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
      isAutomatic: base.isAutomatic,
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
  const apFactor = Math.min(1, Math.max(0, firepower.armorPenetration.effectiveArmorPenetrationPct / 100));
  const effectiveDR = Math.max(0, Math.round(baseDR * (1 - apFactor)));

  const rawNormal = firepower.damagePerShot.totalPerShot;
  const rawCrit = firepower.damagePerShot.critical;

  let normalMitigationRatio = 1.0;
  let critMitigationRatio = 1.0;

  if (effectiveDR > 0) {
    if (rawNormal > 0) {
      const ratioNormal = rawNormal / effectiveDR;
      normalMitigationRatio = Math.min(0.99, Math.max(0.01, 0.5 * Math.pow(ratioNormal, 0.365)));
    }
    if (rawCrit > 0) {
      const ratioCrit = rawCrit / effectiveDR;
      critMitigationRatio = Math.min(0.99, Math.max(0.01, 0.5 * Math.pow(ratioCrit, 0.365)));
    }
  }

  const flatMult = 1 - dummy.flatDamageReductionPct;

  const normalLanded = Math.max(1, Math.round(rawNormal * normalMitigationRatio * flatMult));
  const criticalLanded = Math.max(1, Math.round(rawCrit * critMitigationRatio * flatMult));

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
