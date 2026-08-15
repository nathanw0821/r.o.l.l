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

  if (cleanId.includes("melee") || cleanId.includes("axe") || cleanId.includes("sledge") || cleanId.includes("sword") || cleanId.includes("baton") || cleanId.includes("fist") || cleanId.includes("gauntlet")) {
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

export type CombatFirepowerCalculationInput = {
  weaponId: string;
  equippedMods: (Partial<BuilderModDTO> | { slug: string } | null | undefined)[];
  equippedPerks: { cardId: string; rank: number }[];
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
  };
};

export type CombatFirepowerResult = {
  baseStats: WeaponCombatBaseStats;
  damagePerShot: {
    normal: number;
    critical: number;
    explosiveBonus: number;
    totalPerShot: number;
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
    breakdown: { source: string; value: string }[];
  };
  vats: {
    apCostPerShot: number;
    maxShotsInPool: number;
    totalApPool: number;
    breakdown: { source: string; value: string }[];
  };
  critCycle: {
    everySecondShotReady: boolean;
    currentLuck: number;
    requiredLuck: number;
    fillCostPct: number;
    fillPerShotPct: number;
    hasCriticalSavvy: boolean;
    hasLucky15Fill: boolean;
  };
  armorPenetration: {
    effectiveArmorPenetrationPct: number;
    breakdown: { source: string; value: string }[];
  };
};

/**
 * Calculates complete Live Weapon Firepower, Damage per Shot, Burst/Sustained DPS,
 * and V.A.T.S. AP Cost in strict adherence to Fallout 76 live patch mechanics.
 */
export function calculateCombatFirepower(
  input: CombatFirepowerCalculationInput
): CombatFirepowerResult {
  const base = getWeaponCombatBaseStats(input.weaponId);
  const healthPct = input.playerStats.healthPct ?? 0.2; // Default to 20% for Bloodied testing
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
    const h1 = perkRanks.get("heavy-gunner") || 0;
    const h2 = perkRanks.get("expert-heavy-gunner") || 0;
    const h3 = perkRanks.get("master-heavy-gunner") || 0;
    const total = (h1 > 0 ? 0.1 + (h1 - 1) * 0.05 : 0) + (h2 > 0 ? 0.1 + (h2 - 1) * 0.05 : 0) + (h3 > 0 ? 0.1 + (h3 - 1) * 0.05 : 0);
    if (total > 0) {
      additiveDamagePct += total;
      breakdown.push({ source: "Heavy Gunner Perks", value: `+${Math.round(total * 100)}%` });
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
    const m1 = perkRanks.get("gladiator") || perkRanks.get("slugger") || 0;
    const m2 = perkRanks.get("expert-gladiator") || perkRanks.get("expert-slugger") || 0;
    const m3 = perkRanks.get("master-gladiator") || perkRanks.get("master-slugger") || 0;
    const total = (m1 > 0 ? 0.1 + (m1 - 1) * 0.05 : 0) + (m2 > 0 ? 0.1 + (m2 - 1) * 0.05 : 0) + (m3 > 0 ? 0.1 + (m3 - 1) * 0.05 : 0);
    // Add strength bonus (5% per STR point)
    const strBonus = input.playerStats.strength * 0.05;
    additiveDamagePct += total + strBonus;
    if (total > 0) breakdown.push({ source: "Melee Perks", value: `+${Math.round(total * 100)}%` });
    if (strBonus > 0) breakdown.push({ source: `Strength (${input.playerStats.strength})`, value: `+${Math.round(strBonus * 100)}%` });
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
    const bm = bloodyMessRank * 0.05;
    additiveDamagePct += bm;
    breakdown.push({ source: `Bloody Mess (Rank ${bloodyMessRank})`, value: `+${Math.round(bm * 100)}%` });
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
    } else if (slug === "vats-optimized" || slug.includes("25-less-vats-action-point-cost")) {
      hasVatsOptimized = true;
    } else if (slug === "lucky" || slug.includes("15-critical-charge") || slug.includes("15-crit-fill")) {
      hasLucky15Fill = true;
    }
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
    } else if (buffs.activeBobblehead === "melee" && base.weaponClass === "melee") {
      additiveDamagePct += 0.2;
      breakdown.push({ source: "Melee Bobblehead", value: "+20%" });
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
    if (allFoods.includes("blight-soup") || allFoods.includes("sweet-mutfruit-tea")) {
      const foodCrit = hasSIN ? 1.25 : 1.0; // Herbivore + SiN
      critBonusPct += foodCrit;
      breakdown.push({ source: `Blight Soup${hasSIN ? " (Herbivore + SiN)" : ""}`, value: `+${Math.round(foodCrit * 100)}% Crit` });
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

  // 8. Critical Fill & Every-2nd-Shot Status
  // In FO76: Crit Fill per shot = (Luck × 1.5) + (Lucky 15% Fill ? 15 : 0) + 5
  // Crit Cost = Critical Savvy Rank 3 = 55% fill needed per crit (45% refunded)
  const critSavvyRank = perkRanks.get("critical-savvy") || 0;
  const critCostPct = critSavvyRank === 3 ? 55 : critSavvyRank === 2 ? 60 : critSavvyRank === 1 ? 70 : 100;
  const fillPerShotPct = Math.round(input.playerStats.luck * 1.5 + (hasLucky15Fill ? 15 : 0) + 5);

  const requiredLuck = hasLucky15Fill
    ? (critSavvyRank === 3 ? 23 : 30)
    : (critSavvyRank === 3 ? 33 : 40);

  const everySecondShotReady = input.playerStats.luck >= requiredLuck && critSavvyRank === 3;

  // 9. True Armor Penetration Compounding
  // Anti-Armor (50%) + Tank Killer (36%) or Stabilized (45% in PA)
  let penRemaining = 1.0;
  if (hasAntiArmor) {
    penRemaining *= 0.5;
    apBreakdown.push({ source: "Anti-Armor 1★", value: "50% Penetration" });
  }

  const tankKillerRank = perkRanks.get("tank-killer") || 0;
  if (tankKillerRank > 0 && !isPA) {
    const tkPen = tankKillerRank === 3 ? 0.36 : tankKillerRank === 2 ? 0.24 : 0.12;
    penRemaining *= 1 - tkPen;
    apBreakdown.push({ source: `Tank Killer (Rank ${tankKillerRank})`, value: `${Math.round(tkPen * 100)}% Penetration` });
  }

  const stabilizedRank = perkRanks.get("stabilized") || 0;
  if (stabilizedRank > 0 && isPA && base.weaponClass === "heavy") {
    const stabPen = stabilizedRank === 3 ? 0.45 : stabilizedRank === 2 ? 0.3 : 0.15;
    penRemaining *= 1 - stabPen;
    apBreakdown.push({ source: `Stabilized in PA (Rank ${stabilizedRank})`, value: `${Math.round(stabPen * 100)}% Penetration` });
  }

  const effectiveArmorPenetrationPct = Math.round((1 - penRemaining) * 100);

  return {
    baseStats: base,
    damagePerShot: {
      normal: normalDamage,
      critical: criticalDamage,
      explosiveBonus: explosiveDamage,
      totalPerShot: normalDamage + explosiveDamage,
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
      breakdown: dpsBreakdown,
    },
    vats: {
      apCostPerShot: vatsApCost,
      maxShotsInPool,
      totalApPool,
      breakdown: vatsBreakdown,
    },
    critCycle: {
      everySecondShotReady,
      currentLuck: input.playerStats.luck,
      requiredLuck,
      fillCostPct: critCostPct,
      fillPerShotPct,
      hasCriticalSavvy: critSavvyRank === 3,
      hasLucky15Fill,
    },
    armorPenetration: {
      effectiveArmorPenetrationPct,
      breakdown: apBreakdown,
    },
  };
}
