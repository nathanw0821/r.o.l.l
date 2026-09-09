/**
 * Authoritative Fallout 76 Weapon Innate Workbench Modifications Catalog
 * 
 * Provides authentic, weapon-specific attachment option pools per workbench slot:
 * - Ballistic Rifles & SMGs (Receivers, Aligned/Forceful/Perforating/Reflex/Suppressor)
 * - Railway Rifle (Automatic Piston, Long Barrel, Recoil Stock, Reflex, Bayonet — NO mag/suppressor)
 * - Flamer & Holy Fire (Napalm Tank, Huge Propellant, Vaporization Nozzle — NO sights/suppressor)
 * - Cremator (Slow-Burning/Napalm Tank, Quad/Heavy Barrel, Huge Propellant Tank)
 * - Tesla Rifle (Automatic/Charging Shotgun Assembly, Reflex Stock, Reflex Sight)
 * - Double-Barrel & Cold Shoulder (Hardened/Prime, Extended Double Barrel, Forceful Stock, Beads/Muzzle Brake — NO mag)
 * - Combat & Pump Shotguns (Hardened/Auto, Aligned Barrel, Drum/Perforating Mag, Suppressor)
 * - Archery (Compound Bow, Bow, Crossbow: Explosive/Plasma/Cryo/Flaming/Poison/Ultracite Frames, Glow Sights)
 * - Energy Weapons (Laser, Plasma, Enclave Plasma Flamer, Gatling Plasma, Gatling Laser)
 * - Heavy Ballistic (.50 Cal, Minigun Shredder, LMG, Gatling Gun Speedy, Pepper Shaker)
 * - Pistols & Revolvers (10mm Auto/Perforating, Crusader Elemental, .44 / Western / Single Action Bull Barrels)
 * - Auto-Melee (Chainsaw Dual Bar / Flamer, Auto-Axe Turbo Bar / Electrified)
 * - Unarmed (Deathclaw Extra Claw, Power Fist Puncturing / Heating Coil, Bear Arm Heavy)
 * - 1H & 2H Melee (Super Sledge Rockets, Searing Sharp, All Star Bats, Serrated Blades, War Glaive Elemental)
 */

import { getBaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderWeaponInnateCrafting } from "@/lib/builder/types";

export type WeaponInnateSlotKey =
  | "receiver"
  | "barrel"
  | "stock"
  | "magazine"
  | "sight"
  | "muzzle";

export interface WeaponInnateModOption {
  id: string;
  label: string;
  slot: WeaponInnateSlotKey;
  description: string;
  effectMath: {
    damagePct?: number;
    fireRatePct?: number;
    apCostPct?: number;
    armorPenetrationPct?: number;
    magCapacityPct?: number;
    magCapacityBonus?: number;
    critDamagePct?: number;
    isAutomatic?: boolean;
    isSuppressed?: boolean;
    durabilityPct?: number;
  };
}

export type WeaponModArchetype =
  | "ballistic-rifle"
  | "railway"
  | "black-powder"
  | "laser"
  | "plasma"
  | "tesla"
  | "flamer"
  | "cremator"
  | "double-barrel"
  | "combat-shotgun"
  | "bow"
  | "heavy-ballistic"
  | "gatling-plasma"
  | "gatling-laser"
  | "pistol-auto"
  | "revolver"
  | "auto-melee"
  | "unarmed"
  | "melee-blunt-blade"
  | "heavy-explosive";

export function resolveWeaponArchetype(weaponPieceId: string): WeaponModArchetype {
  const normalized = (weaponPieceId || "").toLowerCase().trim();

  // 1. Auto-Melee
  if (
    normalized.includes("chainsaw") ||
    normalized.includes("auto-axe") ||
    normalized.includes("buzz-blade") ||
    normalized.includes("drill") ||
    normalized.includes("ripper")
  ) {
    return "auto-melee";
  }

  // 2. Unarmed
  if (
    normalized.includes("dc-gauntlet") ||
    normalized.includes("deathclaw") ||
    normalized.includes("unstoppable-monster") ||
    normalized.includes("power-fist") ||
    normalized.includes("face-breaker") ||
    normalized.includes("bear-arm") ||
    normalized.includes("gauntlet") ||
    normalized.includes("meat-hook") ||
    normalized.includes("mole-miner") ||
    normalized.includes("boxing-glove") ||
    normalized.includes("knuckles")
  ) {
    return "unarmed";
  }

  // 3. Other Melee (Blades & Blunt)
  const basePiece = getBaseGearPiece(weaponPieceId);
  if (basePiece?.weaponSub === "melee") {
    return "melee-blunt-blade";
  }

  // 4. Railway Rifle
  if (normalized.includes("railway") || normalized.includes("ticket-to-revenge")) {
    return "railway";
  }

  // 5. Black Powder & The Dragon
  if (normalized.includes("dragon") || normalized.includes("black-powder")) {
    return "black-powder";
  }

  // 6. Cremator
  if (normalized.includes("cremator")) {
    return "cremator";
  }

  // 7. Flamer & Holy Fire
  if (normalized.includes("holy-fire") || normalized.includes("flamer")) {
    return "flamer";
  }

  // 8. Tesla Rifle
  if (normalized.includes("tesla") || normalized.includes("bertha") || normalized.includes("night-light")) {
    return "tesla";
  }

  // 9. Gatling Plasma & Plasma Caster
  if (normalized.includes("gatling-plasma") || normalized.includes("plasma-caster")) {
    return "gatling-plasma";
  }

  // 10. Gatling Laser & Ultracite Gatling Laser
  if (normalized.includes("gatling-laser") || normalized.includes("helga")) {
    return "gatling-laser";
  }

  // 11. Plasma Guns
  if (normalized.includes("plasma")) {
    return "plasma";
  }

  // 12. Laser Guns
  if (normalized.includes("laser") || normalized.includes("olga")) {
    return "laser";
  }

  // 13. Archery (Bows & Crossbows)
  if (normalized.includes("bow") || normalized.includes("crossbow")) {
    return "bow";
  }

  // 14. Double-Barrel & Cold Shoulder
  if (normalized.includes("double-barrel") || normalized.includes("cold-shoulder")) {
    return "double-barrel";
  }

  // 15. Combat Shotgun, Pump, Gauss Shotgun
  if (
    normalized.includes("shotgun") ||
    normalized.includes("crowd-control") ||
    normalized.includes("kabloom")
  ) {
    return "combat-shotgun";
  }

  // 16. Heavy Explosive
  if (
    normalized.includes("fat-man") ||
    normalized.includes("overkill") ||
    normalized.includes("missile") ||
    normalized.includes("boomstick") ||
    normalized.includes("broadsider") ||
    normalized.includes("grand-finale") ||
    normalized.includes("grenade") ||
    normalized.includes("harpoon")
  ) {
    return "heavy-explosive";
  }

  // 17. Heavy Ballistic
  if (
    normalized.includes("cal50") ||
    normalized.includes("action-hero") ||
    normalized.includes("minigun") ||
    normalized.includes("lmg") ||
    normalized.includes("red-terror") ||
    normalized.includes("gatling-gun") ||
    normalized.includes("resolute-veteran") ||
    normalized.includes("pepper-shaker")
  ) {
    return "heavy-ballistic";
  }

  // 18. Revolvers
  if (
    normalized.includes("revolver") ||
    normalized.includes("single-action") ||
    normalized.includes("44-pistol") ||
    normalized.includes("fact-finder") ||
    normalized.includes("medical-malpractice") ||
    normalized.includes("gunther")
  ) {
    return "revolver";
  }

  // 19. Semi/Auto Pistols
  if (
    normalized.includes("pistol") ||
    normalized.includes("blaster") ||
    normalized.includes("gamma")
  ) {
    return "pistol-auto";
  }

  // Default: Ballistic Rifle
  return "ballistic-rifle";
}

export type WeaponSlotDescriptor = {
  key: WeaponInnateSlotKey;
  label: string;
  icon: string;
};

export function listWeaponAvailableSlots(weaponPieceId: string): WeaponSlotDescriptor[] {
  const archetype = resolveWeaponArchetype(weaponPieceId);

  switch (archetype) {
    case "auto-melee":
      return [
        { key: "barrel", label: "Bar / Blade Assembly", icon: "🪚" },
        { key: "receiver", label: "Flamer / Elemental Mod", icon: "🔥" }
      ];
    case "unarmed":
      return [
        { key: "barrel", label: "Claw / Fist / Head Mod", icon: "🥊" },
        { key: "stock", label: "Grip / Handle Mod", icon: "✋" }
      ];
    case "melee-blunt-blade":
      return [
        { key: "barrel", label: "Blade / Head / Rocket Mod", icon: "⚔️" },
        { key: "stock", label: "Grip / Handle Mod", icon: "✋" }
      ];
    case "bow":
      return [
        { key: "receiver", label: "Arrow Frame / Mod", icon: "🏹" },
        { key: "sight", label: "Optics / Sight", icon: "👁️" }
      ];
    case "railway":
      return [
        { key: "receiver", label: "Piston Receiver", icon: "🚂" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "stock", label: "Stock / Recoil System", icon: "🛡️" },
        { key: "sight", label: "Sights / Optics", icon: "👁️" },
        { key: "muzzle", label: "Bayonet / Muzzle", icon: "🗡️" }
      ];
    case "flamer":
      return [
        { key: "receiver", label: "Fuel Tank", icon: "🔥" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "magazine", label: "Propellant Tank", icon: "⛽" },
        { key: "muzzle", label: "Flame Nozzle", icon: "💨" }
      ];
    case "cremator":
      return [
        { key: "receiver", label: "Combustion Tank", icon: "💥" },
        { key: "barrel", label: "Barrel Manifold", icon: "🎯" },
        { key: "magazine", label: "Propellant Tank", icon: "⛽" }
      ];
    case "tesla":
      return [
        { key: "receiver", label: "Charging Assembly", icon: "⚡" },
        { key: "stock", label: "Stock / Grip", icon: "🛡️" },
        { key: "sight", label: "Sights / Optics", icon: "👁️" }
      ];
    case "double-barrel":
      return [
        { key: "receiver", label: "Breech / Receiver", icon: "⚡" },
        { key: "barrel", label: "Double Barrel Assembly", icon: "🎯" },
        { key: "stock", label: "Stock / Grip", icon: "🛡️" },
        { key: "sight", label: "Sights / Beads", icon: "👁️" },
        { key: "muzzle", label: "Muzzle Brake / Choke", icon: "🛑" }
      ];
    case "revolver":
      return [
        { key: "receiver", label: "Cylinder / Receiver", icon: "⚡" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "stock", label: "Grip / Handle", icon: "✋" },
        { key: "sight", label: "Sights / Optics", icon: "👁️" }
      ];
    case "plasma":
      return [
        { key: "receiver", label: "Capacitor / Core", icon: "⚡" },
        { key: "barrel", label: "Barrel Assembly (Flamer/Auto)", icon: "🎯" },
        { key: "stock", label: "Stock / Grip", icon: "🛡️" },
        { key: "sight", label: "Sights / Reflex", icon: "👁️" }
      ];
    case "laser":
      return [
        { key: "receiver", label: "Capacitor / Core", icon: "⚡" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "stock", label: "Stock / Grip", icon: "🛡️" },
        { key: "sight", label: "Sights / Optics", icon: "👁️" },
        { key: "muzzle", label: "Beam Focuser / Splitter", icon: "🔆" }
      ];
    case "gatling-plasma":
      return [
        { key: "receiver", label: "Beta Wave Tuner", icon: "⚡" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "magazine", label: "Core Receptacle", icon: "🔋" },
        { key: "sight", label: "Reflex Sight", icon: "👁️" },
        { key: "muzzle", label: "Beam Splitter / Focuser", icon: "🔆" }
      ];
    case "gatling-laser":
      return [
        { key: "receiver", label: "Capacitor Tuner", icon: "⚡" },
        { key: "barrel", label: "Charging / Long Barrel", icon: "🎯" },
        { key: "sight", label: "Reflex Sight", icon: "👁️" },
        { key: "muzzle", label: "Beam Focuser", icon: "🔆" }
      ];
    case "heavy-ballistic":
      return [
        { key: "receiver", label: "Receiver / Breech", icon: "⚡" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "magazine", label: "Magazine / Ammo Feed", icon: "🔋" },
        { key: "sight", label: "Gunner / Ring Sight", icon: "👁️" },
        { key: "muzzle", label: "Muzzle / Shredder", icon: "⚙️" }
      ];
    case "heavy-explosive":
      return [
        { key: "receiver", label: "Breech Assembly", icon: "⚡" },
        { key: "barrel", label: "Barrel Tubes / Launcher", icon: "🎯" },
        { key: "sight", label: "Targeting Computer / Sight", icon: "👁️" },
        { key: "muzzle", label: "Muzzle / Bayonet", icon: "🗡️" }
      ];
    case "pistol-auto":
    case "combat-shotgun":
    case "ballistic-rifle":
    case "black-powder":
    default:
      return [
        { key: "receiver", label: "Receiver / Breech", icon: "⚡" },
        { key: "barrel", label: "Barrel Assembly", icon: "🎯" },
        { key: "stock", label: "Stock / Grip", icon: "🛡️" },
        { key: "magazine", label: "Magazine / Ammo", icon: "🔋" },
        { key: "sight", label: "Sights / Optics", icon: "👁️" },
        { key: "muzzle", label: "Muzzle / Tip", icon: "🔇" }
      ];
  }
}

// ==========================================
// 1. BALLISTIC RIFLES (Fixer, Handmade, etc.)
// ==========================================
export const BALLISTIC_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "standard-receiver", label: "Standard Receiver", slot: "receiver", description: "Standard factory configuration.", effectMath: {} },
  { id: "hardened-receiver", label: "Hardened Receiver", slot: "receiver", description: "Superior ballistic damage (+25% Damage).", effectMath: { damagePct: 0.25 } },
  { id: "powerful-auto-receiver", label: "Powerful Automatic Receiver", slot: "receiver", description: "Converts weapon to fully automatic. Superior rate of fire, reduced V.A.T.S. AP cost.", effectMath: { isAutomatic: true, fireRatePct: 0.40, apCostPct: -0.10, damagePct: -0.15 } },
  { id: "tweaked-auto-receiver", label: "Tweaked Automatic Receiver", slot: "receiver", description: "Fully automatic fire with improved critical hit damage (+50% Crit) and high rate of fire.", effectMath: { isAutomatic: true, fireRatePct: 0.40, critDamagePct: 0.50, apCostPct: -0.10, damagePct: -0.15 } },
  { id: "prime-receiver", label: "Prime Receiver", slot: "receiver", description: "Exceptional damage (+35% Damage) and bonus damage vs Scorched. Uses Ultracite ammo.", effectMath: { damagePct: 0.35 } },
  { id: "prime-auto-receiver", label: "Prime Automatic Receiver", slot: "receiver", description: "Fully automatic fire with exceptional damage against Scorched. Uses Ultracite ammo.", effectMath: { isAutomatic: true, fireRatePct: 0.40, damagePct: 0.05, apCostPct: -0.10 } },
  { id: "calibrated-receiver", label: "Calibrated Receiver", slot: "receiver", description: "Superior critical hit damage (+100% Critical Damage bonus).", effectMath: { critDamagePct: 1.0, damagePct: 0.10 } },
  { id: "severe-beta-wave-receiver", label: "Severe Beta Wave Tuner", slot: "receiver", description: "Adds burning fire damage and +50% critical damage multiplier.", effectMath: { damagePct: 0.15, critDamagePct: 0.50 } },
  { id: "hair-trigger-receiver", label: "Hair Trigger Receiver", slot: "receiver", description: "Superior rate of fire (+25% Fire Rate, -10% AP Cost).", effectMath: { fireRatePct: 0.25, apCostPct: -0.10 } }
];

export const BALLISTIC_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "standard-barrel", label: "Standard Long Barrel", slot: "barrel", description: "Standard factory barrel length.", effectMath: {} },
  { id: "aligned-long-barrel", label: "Aligned Long Barrel", slot: "barrel", description: "Superior recoil recovery and -5% V.A.T.S. AP cost reduction. Meta standard for Commando builds.", effectMath: { apCostPct: -0.05 } },
  { id: "true-long-barrel", label: "True Long Barrel", slot: "barrel", description: "Superior hip-fire accuracy and extended range.", effectMath: {} },
  { id: "stabilized-long-barrel", label: "Stabilized Long Barrel", slot: "barrel", description: "Superior recoil control during sustained fire.", effectMath: {} },
  { id: "aligned-short-barrel", label: "Aligned Short Barrel", slot: "barrel", description: "Lightweight barrel with -5% V.A.T.S. AP cost and improved weapon draw speed.", effectMath: { apCostPct: -0.05 } }
];

export const BALLISTIC_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "standard-stock", label: "Standard Stock", slot: "stock", description: "Standard wooden or polymer stock.", effectMath: {} },
  { id: "forceful-stock", label: "Forceful Stock", slot: "stock", description: "+50% Weapon Condition/Durability bar and -5% V.A.T.S. AP cost. Meta durability standard.", effectMath: { durabilityPct: 0.50, apCostPct: -0.05 } },
  { id: "aligned-stock", label: "Aligned Stock", slot: "stock", description: "Superior recoil and -5% V.A.T.S. AP cost reduction.", effectMath: { apCostPct: -0.05 } },
  { id: "true-stock", label: "True Stock", slot: "stock", description: "Superior hip-fire accuracy.", effectMath: {} },
  { id: "stabilized-stock", label: "Stabilized Stock", slot: "stock", description: "Superior recoil control for automatic spray patterns.", effectMath: {} },
  { id: "bruising-grip", label: "Bruising Grip / Stock", slot: "stock", description: "Heavy combat grip with superior bash damage.", effectMath: { damagePct: 0.05 } }
];

export const BALLISTIC_MAGAZINE_MODS: WeaponInnateModOption[] = [
  { id: "standard-magazine", label: "Standard Magazine", slot: "magazine", description: "Standard ammunition capacity.", effectMath: {} },
  { id: "perforating-magazine", label: "Perforating Magazine", slot: "magazine", description: "+40% Armor Penetration. Highest anti-armor multiplier in slot.", effectMath: { armorPenetrationPct: 40 } },
  { id: "piercing-magazine", label: "Piercing Magazine", slot: "magazine", description: "+20% Armor Penetration and improved reload speed.", effectMath: { armorPenetrationPct: 20, apCostPct: -0.05 } },
  { id: "stinging-magazine", label: "Stinging Magazine", slot: "magazine", description: "+20% Armor Penetration and +20% Ammo Capacity.", effectMath: { armorPenetrationPct: 20, magCapacityPct: 0.20 } },
  { id: "swift-magazine", label: "Swift Magazine", slot: "magazine", description: "Rapid reload speed and -5% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.05 } },
  { id: "drum-magazine", label: "Drum Magazine", slot: "magazine", description: "+50% Ammo Capacity.", effectMath: { magCapacityPct: 0.50, apCostPct: 0.05 } }
];

export const BALLISTIC_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "standard-sights", label: "Standard Iron Sights", slot: "sight", description: "Standard factory open sights.", effectMath: {} },
  { id: "reflex-sight-dot", label: "Reflex Sight (Dot)", slot: "sight", description: "Quick target acquisition with -15% V.A.T.S. AP Cost reduction. Essential for Commando.", effectMath: { apCostPct: -0.15 } },
  { id: "reflex-sight-circle", label: "Reflex Sight (Circle)", slot: "sight", description: "Circular reticle with -15% V.A.T.S. AP Cost reduction.", effectMath: { apCostPct: -0.15 } },
  { id: "short-recon-scope", label: "Short Recon Scope", slot: "sight", description: "Marks targets on the HUD with enhanced magnification.", effectMath: { apCostPct: 0.10 } },
  { id: "medium-scope", label: "Medium Scope", slot: "sight", description: "Mid-range magnification optic.", effectMath: { apCostPct: 0.10 } },
  { id: "night-vision-scope", label: "Night Vision Scope", slot: "sight", description: "Illuminates dark targets with night vision optics.", effectMath: { apCostPct: 0.15 } }
];

export const BALLISTIC_MUZZLE_MODS: WeaponInnateModOption[] = [
  { id: "none-muzzle", label: "No Muzzle Attachment", slot: "muzzle", description: "Bare muzzle crown.", effectMath: {} },
  { id: "suppressor", label: "Suppressor", slot: "muzzle", description: "Silences weapon fire, prevents detection, and enables Mister Sandman / Covert Operative stealth attack multipliers.", effectMath: { isSuppressed: true } },
  { id: "compensator", label: "Compensator", slot: "muzzle", description: "Reduces per-shot muzzle climb.", effectMath: {} },
  { id: "muzzle-brake", label: "Muzzle Brake", slot: "muzzle", description: "Superior recoil reduction and muzzle rise mitigation.", effectMath: {} },
  { id: "large-bayonet", label: "Large Bayonet", slot: "muzzle", description: "Affixes heavy blade for devastating melee bash strikes.", effectMath: { damagePct: 0.05 } }
];

// ==========================================
// 2. RAILWAY RIFLE (No Mag, No Suppressor)
// ==========================================
export const RAILWAY_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "auto-piston-receiver", label: "Automatic Piston Receiver", slot: "receiver", description: "Converts Railway Rifle into full-auto spike barrage. Extremely high DPS.", effectMath: { isAutomatic: true, fireRatePct: 0.75, apCostPct: -0.10, damagePct: -0.10 } },
  { id: "prime-receiver", label: "Prime Receiver", slot: "receiver", description: "Heavy single-shot spike blast with bonus damage vs Scorched. Uses Ultracite Railway Spikes.", effectMath: { damagePct: 0.35 } },
  { id: "standard-receiver", label: "Standard Piston Receiver", slot: "receiver", description: "Standard semi-automatic pneumatic piston mechanism.", effectMath: {} },
  { id: "hardened-receiver", label: "Hardened Receiver", slot: "receiver", description: "+25% Ballistic Spike Impact Damage.", effectMath: { damagePct: 0.25 } }
];

export const RAILWAY_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "railway-long-barrel", label: "Long Barrel", slot: "barrel", description: "Superior range and reduced V.A.T.S. spike drop-off.", effectMath: {} },
  { id: "railway-standard-barrel", label: "Standard Barrel", slot: "barrel", description: "Standard factory steam pipe barrel.", effectMath: {} }
];

export const RAILWAY_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "railway-recoil-stock", label: "Recoil Compensating Stock", slot: "stock", description: "Heavy shock absorbers mitigate ferocious railway spike recoil. +40% Durability.", effectMath: { durabilityPct: 0.40, apCostPct: -0.05 } },
  { id: "railway-standard-stock", label: "Standard Stock", slot: "stock", description: "Basic wood-and-steel welded buttstock.", effectMath: {} }
];

export const RAILWAY_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "railway-reflex-sight", label: "Reflex Sight", slot: "sight", description: "Compact dot sight with -15% V.A.T.S. AP cost reduction. Essential for spike spam.", effectMath: { apCostPct: -0.15 } },
  { id: "railway-recon-scope", label: "Long Recon Scope", slot: "sight", description: "High magnification target-tracking optic.", effectMath: { apCostPct: 0.10 } },
  { id: "railway-standard-sights", label: "Iron Sights", slot: "sight", description: "Machined iron post sights.", effectMath: {} }
];

export const RAILWAY_MUZZLE_MODS: WeaponInnateModOption[] = [
  { id: "railway-none-muzzle", label: "Open Steam Vent", slot: "muzzle", description: "Standard open steam ejection.", effectMath: {} },
  { id: "railway-large-bayonet", label: "Large Bayonet", slot: "muzzle", description: "Lethal spiked bayonet for brutal close-quarters bash strikes.", effectMath: { damagePct: 0.05 } }
];

// ==========================================
// 3. FLAMER & HOLY FIRE (No Sights, No Silencer)
// ==========================================
export const FLAMER_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "flamer-napalm-tank", label: "Napalm Tank", slot: "receiver", description: "Infuses fuel with gelatinous Napalm for massive fire & energy damage (+30% Damage).", effectMath: { damagePct: 0.30 } },
  { id: "flamer-standard-tank", label: "Standard Fuel Tank", slot: "receiver", description: "Standard pressurized kerosene fuel tank.", effectMath: {} }
];

export const FLAMER_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "flamer-long-barrel", label: "Long Barrel", slot: "barrel", description: "Extended flamer nozzle dramatically increases flame stream range.", effectMath: {} },
  { id: "flamer-compression-barrel", label: "Compression Barrel", slot: "barrel", description: "Focused nozzle stream for improved reach and stability.", effectMath: {} },
  { id: "flamer-standard-barrel", label: "Standard Barrel", slot: "barrel", description: "Standard flamer assembly.", effectMath: {} }
];

export const FLAMER_MAGAZINE_MODS: WeaponInnateModOption[] = [
  { id: "flamer-huge-tank", label: "Huge Propellant Tank", slot: "magazine", description: "Expands fuel capacity to 200 fuel units (+100% capacity). Meta standard.", effectMath: { magCapacityPct: 1.0 } },
  { id: "flamer-large-tank", label: "Large Propellant Tank", slot: "magazine", description: "Expands fuel capacity to 150 fuel units.", effectMath: { magCapacityPct: 0.50 } },
  { id: "flamer-standard-tank-mag", label: "Standard Propellant Tank", slot: "magazine", description: "100 units capacity.", effectMath: {} }
];

export const FLAMER_MUZZLE_MODS: WeaponInnateModOption[] = [
  { id: "flamer-vaporization-nozzle", label: "Vaporization Nozzle", slot: "muzzle", description: "Vaporizes fuel mist for devastating close-quarters damage (+40% Damage, reduced range).", effectMath: { damagePct: 0.40 } },
  { id: "flamer-compression-nozzle", label: "Compression Nozzle", slot: "muzzle", description: "Balances flame spread with extended reach.", effectMath: { damagePct: 0.15 } },
  { id: "flamer-standard-nozzle", label: "Standard Nozzle", slot: "muzzle", description: "Standard open flare tip.", effectMath: {} }
];

// ==========================================
// 4. CREMATOR (Slow Burn, Quad Barrel, Propellant)
// ==========================================
export const CREMATOR_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "cremator-slow-burn-tank", label: "Slow-Burning Tank", slot: "receiver", description: "Lethal meta tank: Inflicts massive damage-over-time fire burn that melts mobs over 12 seconds.", effectMath: { damagePct: 0.50 } },
  { id: "cremator-napalm-tank", label: "Napalm Tank", slot: "receiver", description: "High direct impact blast fire damage.", effectMath: { damagePct: 0.35 } },
  { id: "cremator-chemical-tank", label: "Chemical Tank", slot: "receiver", description: "Toxic chemical combustion inflicts poisonous corrosive damage.", effectMath: { damagePct: 0.25 } },
  { id: "cremator-standard-tank", label: "Standard Tank", slot: "receiver", description: "Standard fuel configuration.", effectMath: {} }
];

export const CREMATOR_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "cremator-quad-barrel", label: "Quad Barrel", slot: "barrel", description: "Launches 4 fiery plasma orbs simultaneously in a shotgun spread. Unmatched room clearing.", effectMath: { damagePct: 0.25, fireRatePct: 0.20 } },
  { id: "cremator-heavy-barrel", label: "Heavy Barrel", slot: "barrel", description: "Concentrates immense blast pressure into single devastating artillery projectiles.", effectMath: { damagePct: 0.40 } },
  { id: "cremator-multi-shot-barrel", label: "Multi-Shot Barrel", slot: "barrel", description: "Twin-nozzle configuration launching 2 fiery globes per volley.", effectMath: { damagePct: 0.15 } },
  { id: "cremator-standard-barrel", label: "Standard Barrel", slot: "barrel", description: "Single-tube combustion barrel.", effectMath: {} }
];

export const CREMATOR_MAGAZINE_MODS: WeaponInnateModOption[] = [
  { id: "cremator-huge-tank", label: "Huge Propellant Tank", slot: "magazine", description: "High-pressure tank expanding capacity to 90 fuel shots.", effectMath: { magCapacityPct: 0.80 } },
  { id: "cremator-fast-tank", label: "Fast Propellant Tank", slot: "magazine", description: "Quick-connect valves grant lightning-fast reloads.", effectMath: { apCostPct: -0.10 } },
  { id: "cremator-standard-propellant", label: "Standard Propellant Tank", slot: "magazine", description: "Standard 50 fuel capacity.", effectMath: {} }
];

// ==========================================
// 5. TESLA RIFLE (V63 Bertha, Chain Lightning)
// ==========================================
export const TESLA_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "tesla-automatic-barrel", label: "Automatic Barrel", slot: "receiver", description: "Full-auto high-voltage arc lightning that chains between multiple surrounding targets.", effectMath: { isAutomatic: true, fireRatePct: 0.60, damagePct: -0.20, apCostPct: -0.10 } },
  { id: "tesla-charging-shotgun", label: "Charging Shotgun Barrel", slot: "receiver", description: "Charges multi-beam electrical burst with high staggering impact.", effectMath: { damagePct: 0.40 } },
  { id: "tesla-charging-barrel", label: "Charging Barrel", slot: "receiver", description: "Charges single high-voltage lightning bolt for burst damage.", effectMath: { damagePct: 0.30 } },
  { id: "tesla-semi-auto", label: "Semi-Automatic Barrel", slot: "receiver", description: "Standard single-fire electrical capacitor.", effectMath: {} }
];

export const TESLA_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "tesla-reflex-stock", label: "Reflex Stock", slot: "stock", description: "Reduces recoil and -5% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.05 } },
  { id: "tesla-forceful-stock", label: "Forceful Stock", slot: "stock", description: "+50% Weapon Durability condition bar.", effectMath: { durabilityPct: 0.50 } },
  { id: "tesla-standard-stock", label: "Standard Stock", slot: "stock", description: "Standard insulated stock.", effectMath: {} }
];

export const TESLA_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "tesla-reflex-sight", label: "Reflex Sight", slot: "sight", description: "Quick acquisition sight with -15% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.15 } },
  { id: "tesla-standard-sights", label: "Standard Sights", slot: "sight", description: "Iron post bead.", effectMath: {} }
];

// ==========================================
// 6. DOUBLE-BARREL & COLD SHOULDER (No Mag, No Silencer)
// ==========================================
export const DOUBLE_BARREL_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "db-hardened-receiver", label: "Hardened Receiver", slot: "receiver", description: "+25% Raw Shotgun Pellet Damage.", effectMath: { damagePct: 0.25 } },
  { id: "db-prime-receiver", label: "Prime Receiver", slot: "receiver", description: "+35% Damage with bonus vs Scorched. Uses Ultracite Shotgun Shells.", effectMath: { damagePct: 0.35 } },
  { id: "db-hair-trigger-receiver", label: "Hair Trigger Receiver", slot: "receiver", description: "Instant hammer trip for rapid 2-shot burst volley.", effectMath: { fireRatePct: 0.30 } },
  { id: "db-calibrated-receiver", label: "Calibrated Receiver", slot: "receiver", description: "+100% Critical Hit damage bonus.", effectMath: { critDamagePct: 1.0, damagePct: 0.10 } },
  { id: "db-standard-receiver", label: "Standard Receiver", slot: "receiver", description: "Standard side-by-side break action.", effectMath: {} }
];

export const DOUBLE_BARREL_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "db-extended-barrel", label: "Extended Double Barrel", slot: "barrel", description: "Superior range and tighter pellet spread pattern.", effectMath: {} },
  { id: "db-sawed-off-barrel", label: "Sawed-Off Short Barrel", slot: "barrel", description: "Extremely wide close-range spread, -10% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.10 } },
  { id: "db-standard-barrel", label: "Standard Long Barrel", slot: "barrel", description: "Standard side-by-side twin tubes.", effectMath: {} }
];

export const DOUBLE_BARREL_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "db-forceful-stock", label: "Forceful Stock", slot: "stock", description: "+50% Weapon Durability bar and improved recoil control.", effectMath: { durabilityPct: 0.50 } },
  { id: "db-aligned-stock", label: "Aligned Stock", slot: "stock", description: "-5% V.A.T.S. AP cost and superior hip-fire recovery.", effectMath: { apCostPct: -0.05 } },
  { id: "db-standard-stock", label: "Standard Walnut Stock", slot: "stock", description: "Standard Appalachian hardwood stock.", effectMath: {} }
];

export const DOUBLE_BARREL_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "db-reflex-sight", label: "Reflex Sight", slot: "sight", description: "Compact illuminated dot sight, -15% V.A.T.S. AP Cost.", effectMath: { apCostPct: -0.15 } },
  { id: "db-front-bead", label: "Front Bead Sight", slot: "sight", description: "Brass front bead post.", effectMath: {} }
];

export const DOUBLE_BARREL_MUZZLE_MODS: WeaponInnateModOption[] = [
  { id: "db-muzzle-brake", label: "Muzzle Brake", slot: "muzzle", description: "Ports muzzle gas to substantially suppress heavy 12-gauge kick.", effectMath: {} },
  { id: "db-compensator", label: "Compensator", slot: "muzzle", description: "Mitigates vertical muzzle climb.", effectMath: {} },
  { id: "db-none-muzzle", label: "Open Crown Muzzle", slot: "muzzle", description: "Standard open barrels.", effectMath: {} }
];

// ==========================================
// 7. ARCHERY (Bows, Compound Bow, Crossbow - Frame & Sight ONLY)
// ==========================================
export const ARCHERY_FRAME_MODS: WeaponInnateModOption[] = [
  { id: "bow-plasma-arrows", label: "Plasma Arrow Frame", slot: "receiver", description: "Arrows explode with superheated plasma on impact, dealing physical + energy damage.", effectMath: { damagePct: 0.30 } },
  { id: "bow-explosive-arrows", label: "Explosive Arrow Frame", slot: "receiver", description: "Arrows detonate on impact for 20% area-of-effect explosive damage. Meta tagger.", effectMath: { damagePct: 0.20 } },
  { id: "bow-cryo-arrows", label: "Cryo Arrow Frame", slot: "receiver", description: "Freezes targets on hit, dealing cryo damage and dramatically slowing enemy movement/attacks.", effectMath: { damagePct: 0.25 } },
  { id: "bow-flaming-arrows", label: "Flaming Arrow Frame", slot: "receiver", description: "Ignites enemies with lingering burn damage. Synergizes with Friendly Fire.", effectMath: { damagePct: 0.25 } },
  { id: "bow-poison-arrows", label: "Poison Arrow Frame", slot: "receiver", description: "Drenches arrowheads in potent venom for lingering toxic damage.", effectMath: { damagePct: 0.20 } },
  { id: "bow-ultracite-arrows", label: "Ultracite Arrow Frame", slot: "receiver", description: "Crystalline Ultracite arrowheads deal +35% damage vs Scorched beasts.", effectMath: { damagePct: 0.35 } },
  { id: "bow-standard-frame", label: "Standard Arrow Frame", slot: "receiver", description: "Standard broadhead arrows.", effectMath: {} }
];

export const ARCHERY_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "bow-glow-sights", label: "Glow Sights", slot: "sight", description: "Tritium fiber-optic pins grant superior low-light accuracy and -10% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.10 } },
  { id: "bow-iron-sights", label: "Standard Sights", slot: "sight", description: "Standard bow alignment marks.", effectMath: {} }
];

// ==========================================
// 8. PLASMA & ENCLAVE PLASMA (Aligned Flamer, Severe Beta Wave)
// ==========================================
export const PLASMA_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "plasma-calibrated-capacitor", label: "Calibrated Capacitor", slot: "receiver", description: "Devastating V.A.T.S. critical multiplier (+100% Critical Hit Damage). Meta Enclave.", effectMath: { critDamagePct: 1.0, damagePct: 0.10 } },
  { id: "plasma-severe-beta-wave", label: "Severe Beta Wave Tuner", slot: "receiver", description: "Adds burning fire damage and +50% critical damage multiplier.", effectMath: { damagePct: 0.15, critDamagePct: 0.50 } },
  { id: "plasma-prime-capacitor", label: "Prime Capacitor", slot: "receiver", description: "Superior energy damage (+35%) and bonus vs Scorched. Uses Ultracite Plasma Cartridges.", effectMath: { damagePct: 0.35 } },
  { id: "plasma-standard-capacitor", label: "Standard Capacitor", slot: "receiver", description: "Standard plasma core chamber.", effectMath: {} }
];

export const PLASMA_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "plasma-aligned-flamer", label: "Aligned Flamer Barrel", slot: "barrel", description: "Legendary Enclave Flamer barrel: Shoots continuous stream of melting plasma. Insane boss DPS.", effectMath: { isAutomatic: true, fireRatePct: 0.80, apCostPct: -0.05, damagePct: 0.25 } },
  { id: "plasma-aligned-auto", label: "Aligned Automatic Barrel", slot: "barrel", description: "Full-auto plasma pulses with -5% V.A.T.S. AP cost reduction. Meta rifleman/commando.", effectMath: { isAutomatic: true, fireRatePct: 0.40, apCostPct: -0.05 } },
  { id: "plasma-aligned-sniper", label: "Aligned Sniper Barrel", slot: "barrel", description: "High-accuracy long-range semi-automatic plasma charges.", effectMath: { damagePct: 0.30 } },
  { id: "plasma-true-splitter", label: "True Splitter Barrel", slot: "barrel", description: "Splits plasma bolts into multiple shotgun pellets.", effectMath: { damagePct: 0.15 } },
  { id: "plasma-standard-barrel", label: "Standard Barrel", slot: "barrel", description: "Standard plasma emitter barrel.", effectMath: {} }
];

export const PLASMA_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "plasma-forceful-stock", label: "Forceful Stock", slot: "stock", description: "Extremely rare Enclave mod: +50% Weapon Durability bar and -5% AP cost.", effectMath: { durabilityPct: 0.50, apCostPct: -0.05 } },
  { id: "plasma-aligned-stock", label: "Aligned Stock", slot: "stock", description: "Improved recoil and -5% V.A.T.S. AP cost reduction.", effectMath: { apCostPct: -0.05 } },
  { id: "plasma-stabilized-stock", label: "Stabilized Stock", slot: "stock", description: "Superior recoil stability.", effectMath: {} },
  { id: "plasma-standard-stock", label: "Standard Stock", slot: "stock", description: "Standard polymer rifle stock.", effectMath: {} }
];

export const PLASMA_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "plasma-reflex-sight", label: "Reflex Sight", slot: "sight", description: "Dot reticle with -15% V.A.T.S. AP Cost. Highly sought after for Enclave Plasma.", effectMath: { apCostPct: -0.15 } },
  { id: "plasma-recon-scope", label: "Long Recon Scope", slot: "sight", description: "Reconnaissance tracking optic.", effectMath: { apCostPct: 0.10 } },
  { id: "plasma-standard-sights", label: "Standard Sights", slot: "sight", description: "Standard iron post sight.", effectMath: {} }
];

// ==========================================
// 9. AUTO-MELEE (Chainsaw, Auto-Axe, Ripper)
// ==========================================
export const AUTO_MELEE_BAR_MODS: WeaponInnateModOption[] = [
  { id: "chainsaw-dual-bar", label: "Dual Bar", slot: "barrel", description: "Twin spinning chainsaw guide bars double teeth contact points for astronomical melee DPS.", effectMath: { damagePct: 0.50, apCostPct: -0.10 } },
  { id: "chainsaw-bow-bar", label: "Bow Bar", slot: "barrel", description: "Heavy bow-curved bar grants +35% Armor Penetration on continuous strikes.", effectMath: { armorPenetrationPct: 35 } },
  { id: "chainsaw-long-bar", label: "Long Bar", slot: "barrel", description: "Extended reach and improved hit registration.", effectMath: { damagePct: 0.20 } },
  { id: "auto-axe-turbo-bar", label: "Turbo Bar", slot: "barrel", description: "Spins Auto-Axe blades at supersonic velocity (+35% Attack Speed).", effectMath: { fireRatePct: 0.35, damagePct: 0.15 } },
  { id: "auto-melee-standard-bar", label: "Standard Guide Bar", slot: "barrel", description: "Standard single factory chainsaw guide bar.", effectMath: {} }
];

export const AUTO_MELEE_ELEMENTAL_MODS: WeaponInnateModOption[] = [
  { id: "chainsaw-flamer", label: "Flamer Mod", slot: "receiver", description: "Ignites chainsaw teeth in roaring flames. Adds heavy fire/burn damage and triggers Friendly Fire healing.", effectMath: { damagePct: 0.35 } },
  { id: "auto-axe-electrified", label: "Electrified Mod", slot: "receiver", description: "Electrifies spinning blades with high-voltage arcing shocks (+40% Energy Damage). Meta Auto-Axe.", effectMath: { damagePct: 0.40 } },
  { id: "auto-axe-burning", label: "Burning Mod", slot: "receiver", description: "Heated thermal elements deliver intense fire damage.", effectMath: { damagePct: 0.25 } },
  { id: "auto-axe-poisoned", label: "Poisoned Mod", slot: "receiver", description: "Coats spinning teeth in toxic acid for corrosive DoT.", effectMath: { damagePct: 0.25 } },
  { id: "auto-melee-standard-teeth", label: "Standard Steel Teeth", slot: "receiver", description: "Standard factory cutting chain.", effectMath: {} }
];

// ==========================================
// 10. UNARMED (Deathclaw Gauntlet, Power Fist, Bear Arm)
// ==========================================
export const UNARMED_HEAD_MODS: WeaponInnateModOption[] = [
  { id: "extra-claw", label: "Extra Claw", slot: "barrel", description: "Adds a third razor-sharp Deathclaw talon, increasing damage and bleed (+35% Damage).", effectMath: { damagePct: 0.35 } },
  { id: "power-fist-puncturing", label: "Puncturing Mod", slot: "barrel", description: "Pneumatic spikes pierce armor (+40% Armor Penetration, +20% Damage).", effectMath: { armorPenetrationPct: 40, damagePct: 0.20 } },
  { id: "power-fist-heating-coil", label: "Heating Coil", slot: "barrel", description: "Superheats striking plate to deliver heavy energy/fire damage (+35% Damage).", effectMath: { damagePct: 0.35 } },
  { id: "bear-arm-puncturing", label: "Puncturing Mod (Bear Arm)", slot: "barrel", description: "Steel puncturing fangs penetrate enemy armor (+40% Armor Pen).", effectMath: { armorPenetrationPct: 40, damagePct: 0.15 } },
  { id: "bear-arm-heavy", label: "Heavy Mod (Bear Arm)", slot: "barrel", description: "Lead-weighted Yao Guai skull grants massive concussive blunt force (+35% Damage).", effectMath: { damagePct: 0.35 } },
  { id: "gauntlet-shock-pads", label: "Shock Pads (Gauntlet)", slot: "barrel", description: "High-voltage stun coils deliver powerful electric shock bursts (+40% Damage).", effectMath: { damagePct: 0.40 } },
  { id: "mole-miner-extra-blade", label: "Extra Blade", slot: "barrel", description: "Adds a third steel cutting blade to the gauntlet (+25% Damage).", effectMath: { damagePct: 0.25 } },
  { id: "standard-unarmed-head", label: "Standard Fist Head", slot: "barrel", description: "Standard factory configuration.", effectMath: {} }
];

export const UNARMED_GRIP_MODS: WeaponInnateModOption[] = [
  { id: "comfort-grip", label: "Comfort Grip", slot: "stock", description: "Ergonomic leather-wrapped handle reduces V.A.T.S. AP cost (-10% AP Cost).", effectMath: { apCostPct: -0.10 } },
  { id: "weighted-grip", label: "Weighted Grip / Wrap", slot: "stock", description: "Lead-weighted handle increases stagger and bash impact (+10% Damage).", effectMath: { damagePct: 0.10 } },
  { id: "standard-grip", label: "Standard Grip", slot: "stock", description: "Standard factory grip.", effectMath: {} }
];

// ==========================================
// 11. MELEE BLUNT & BLADES (Super Sledge, Sledgehammer, War Glaive, Bats, Swords)
// ==========================================
export const MELEE_BLADE_MODS: WeaponInnateModOption[] = [
  { id: "super-sledge-heavy-rocket", label: "Heavy Rocket", slot: "barrel", description: "Rocket propulsion rockets the sledgehammer head forward with colossal blunt force (+40% Damage).", effectMath: { damagePct: 0.40 } },
  { id: "super-sledge-heating-coil", label: "Heating Coil", slot: "barrel", description: "Thermal heating coils incinerate targets on impact (+30% Fire Damage).", effectMath: { damagePct: 0.30 } },
  { id: "sledgehammer-searing-sharp-rocket", label: "Searing Sharp Rocket", slot: "barrel", description: "Supreme sledge mod: Rocket-propelled blade delivers fire, bleed, and massive blunt impact (+45% Damage).", effectMath: { damagePct: 0.45 } },
  { id: "war-glaive-shock-blade", label: "Shock Blade", slot: "barrel", description: "Electrifies the massive glaive blade (+35% Energy/Shock Damage).", effectMath: { damagePct: 0.35 } },
  { id: "war-glaive-plasma-blade", label: "Plasma Blade", slot: "barrel", description: "Superheated plasma edge inflicts extreme plasma burn (+35% Plasma Damage).", effectMath: { damagePct: 0.35 } },
  { id: "war-glaive-cryo-blade", label: "Cryo Blade", slot: "barrel", description: "Freezes enemies on strike, chilling movement and attack speed.", effectMath: { damagePct: 0.25 } },
  { id: "war-glaive-flame-blade", label: "Flame Blade", slot: "barrel", description: "Incinerates targets and triggers Friendly Fire team healing.", effectMath: { damagePct: 0.30 } },
  { id: "baseball-bat-all-star", label: "All-Star Aluminum", slot: "barrel", description: "Aircraft-grade aluminum bat delivering superior blunt force (+25% Damage).", effectMath: { damagePct: 0.25 } },
  { id: "baseball-bat-searing-puncturing-rocket", label: "Searing Puncturing Rocket", slot: "barrel", description: "Ultimate bat upgrade: Rocket-propelled spiked head with fire & bleed (+45% Damage).", effectMath: { damagePct: 0.45, armorPenetrationPct: 20 } },
  { id: "combat-knife-stealth-blade", label: "Stealth Blade", slot: "barrel", description: "Non-reflective blackened blade grants massive sneak attack multiplier bonuses.", effectMath: { damagePct: 0.20, critDamagePct: 0.50 } },
  { id: "combat-knife-serrated-blade", label: "Serrated Blade", slot: "barrel", description: "Deep jagged teeth inflict lethal bleeding wounds.", effectMath: { damagePct: 0.25 } },
  { id: "shishkebab-extra-flame-jets", label: "Extra Flame Jets", slot: "barrel", description: "Pressurized gas injectors dramatically amplify sword flame heat (+40% Fire Damage).", effectMath: { damagePct: 0.40 } },
  { id: "standard-head", label: "Standard Head / Blade", slot: "barrel", description: "Standard factory head.", effectMath: {} }
];

export const MELEE_GRIP_MODS: WeaponInnateModOption[] = [
  { id: "comfort-grip", label: "Comfort Grip", slot: "stock", description: "Ergonomic leather-wrapped handle reduces V.A.T.S. AP cost (-10% AP Cost).", effectMath: { apCostPct: -0.10 } },
  { id: "weighted-grip", label: "Weighted Grip / Wrap", slot: "stock", description: "Lead-weighted handle increases stagger and bash impact (+10% Damage).", effectMath: { damagePct: 0.10 } },
  { id: "standard-grip", label: "Standard Grip", slot: "stock", description: "Standard factory grip.", effectMath: {} }
];

// ==========================================
// 12. HEAVY BALLISTIC (.50 Cal, Minigun, LMG, Gatling Gun)
// ==========================================
export const HEAVY_BALLISTIC_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "heavy-prime-receiver", label: "Heavy Prime Receiver", slot: "receiver", description: "+35% Damage and bonus against Scorched. Uses Ultracite heavy rounds.", effectMath: { damagePct: 0.35 } },
  { id: "gatling-speedy-receiver", label: "Speedy Receiver (Gatling Gun)", slot: "receiver", description: "Accelerates hand-crank gear ratio (+25% Rate of Fire). Meta Gatling Gun.", effectMath: { fireRatePct: 0.25 } },
  { id: "heavy-hardened-receiver", label: "Hardened Receiver", slot: "receiver", description: "+25% Heavy Ballistic Impact Damage.", effectMath: { damagePct: 0.25 } },
  { id: "heavy-standard-receiver", label: "Standard Heavy Receiver", slot: "receiver", description: "Standard military breech.", effectMath: {} }
];

export const HEAVY_BALLISTIC_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "heavy-barrel-50cal", label: "Heavy Barrel (.50 Cal)", slot: "barrel", description: "Thick reinforced steel barrel extends effective range and accuracy.", effectMath: { damagePct: 0.10 } },
  { id: "minigun-accelerated-barrel", label: "Accelerated Barrel (Minigun)", slot: "barrel", description: "High-RPM rotary drive spins barrels up to blistering firing rates (+30% Fire Rate).", effectMath: { fireRatePct: 0.30 } },
  { id: "minigun-tri-barrel", label: "Tri-Barrel (Minigun)", slot: "barrel", description: "Three heavy barrels deliver heavier stopping power at a steady firing cadence.", effectMath: { damagePct: 0.25, fireRatePct: -0.15 } },
  { id: "heavy-standard-barrel", label: "Standard Heavy Barrel", slot: "barrel", description: "Standard factory barrel assembly.", effectMath: {} }
];

export const HEAVY_BALLISTIC_MAG_MODS: WeaponInnateModOption[] = [
  { id: "gatling-extra-large-mag", label: "Extra Large Magazine (Gatling Gun)", slot: "magazine", description: "Expands drum magazine to a massive 500 rounds of 5mm ammunition.", effectMath: { magCapacityPct: 1.0 } },
  { id: "heavy-standard-mag", label: "Standard Ammo Feed / Belt", slot: "magazine", description: "Standard factory box or belt hopper.", effectMath: {} }
];

export const HEAVY_BALLISTIC_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "heavy-gunner-sight", label: "Front Gunner Sight / Ring Sight", slot: "sight", description: "Anti-aircraft ring sight aids rapid target acquisition.", effectMath: { apCostPct: -0.05 } },
  { id: "heavy-standard-sights", label: "Standard Sights", slot: "sight", description: "Iron post bead.", effectMath: {} }
];

export const HEAVY_BALLISTIC_MUZZLE_MODS: WeaponInnateModOption[] = [
  { id: "minigun-shredder", label: "Shredder (Minigun)", slot: "muzzle", description: "Deadly spinning rotary bayonet blades grind enemies into dust without using ammo.", effectMath: { damagePct: 0.50 } },
  { id: "heavy-muzzle-brake", label: "Heavy Muzzle Brake", slot: "muzzle", description: "Diverts high-pressure propellant gases to suppress recoil.", effectMath: {} },
  { id: "heavy-none-muzzle", label: "Open Muzzle Crown", slot: "muzzle", description: "Standard bare muzzle.", effectMath: {} }
];

// ==========================================
// 13. REVOLVERS (.44, Western, Single Action)
// ==========================================
export const REVOLVER_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "revolver-hardened-receiver", label: "Hardened Receiver", slot: "receiver", description: "+25% Magnum Impact Damage.", effectMath: { damagePct: 0.25 } },
  { id: "revolver-prime-receiver", label: "Prime Receiver", slot: "receiver", description: "+35% Damage with bonus vs Scorched.", effectMath: { damagePct: 0.35 } },
  { id: "revolver-calibrated-receiver", label: "Calibrated Receiver", slot: "receiver", description: "+100% Critical Hit damage bonus.", effectMath: { critDamagePct: 1.0, damagePct: 0.10 } },
  { id: "revolver-hair-trigger", label: "Hair Trigger Receiver", slot: "receiver", description: "Lightened trigger pull (+25% Rate of Fire, -10% AP Cost).", effectMath: { fireRatePct: 0.25, apCostPct: -0.10 } },
  { id: "revolver-standard-receiver", label: "Standard Cylinder & Frame", slot: "receiver", description: "Standard factory revolver action.", effectMath: {} }
];

export const REVOLVER_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "revolver-bull-barrel", label: "Bull Barrel", slot: "barrel", description: "Heavy solid steel barrel mitigates muzzle flip and improves precision.", effectMath: { damagePct: 0.10 } },
  { id: "revolver-long-barrel", label: "Long Barrel", slot: "barrel", description: "Extended barrel for maximum range.", effectMath: {} },
  { id: "revolver-snubbarrel", label: "Snubbarrel", slot: "barrel", description: "Shortened conceal-carry barrel with -10% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.10 } },
  { id: "revolver-standard-barrel", label: "Standard Barrel", slot: "barrel", description: "Standard factory length.", effectMath: {} }
];

export const REVOLVER_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "revolver-ivory-grip", label: "Ivory / Comfort Grip", slot: "stock", description: "Custom smooth grip with -5% V.A.T.S. AP cost and superior recoil recovery.", effectMath: { apCostPct: -0.05 } },
  { id: "revolver-standard-grip", label: "Standard Wood Grip", slot: "stock", description: "Standard walnut grip plates.", effectMath: {} }
];

export const REVOLVER_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "revolver-reflex-sight", label: "Reflex Sight", slot: "sight", description: "Compact illuminated dot optic with -15% V.A.T.S. AP cost.", effectMath: { apCostPct: -0.15 } },
  { id: "revolver-short-scope", label: "Short Scope", slot: "sight", description: "Precision magnified handgun optic.", effectMath: { apCostPct: 0.05 } },
  { id: "revolver-standard-sights", label: "Standard Iron Sights", slot: "sight", description: "Machined notch and blade.", effectMath: {} }
];

// ==========================================
// 14. BLACK POWDER & THE DRAGON
// ==========================================
export const BLACK_POWDER_RECEIVER_MODS: WeaponInnateModOption[] = [
  { id: "prime-receiver", label: "Prime Black Powder Breech", slot: "receiver", description: "Exceptional damage vs Scorched. Uses Ultracite .50 Caliber Balls.", effectMath: { damagePct: 0.35 } },
  { id: "standard-receiver", label: "Standard Black Powder Breech", slot: "receiver", description: "Standard antique flintlock percussion ignition.", effectMath: {} }
];

export const BLACK_POWDER_BARREL_MODS: WeaponInnateModOption[] = [
  { id: "standard-barrel", label: "Quadruple / Long Rifle Barrel", slot: "barrel", description: "Period-accurate long rifled barrel arrangement.", effectMath: {} }
];

export const BLACK_POWDER_STOCK_MODS: WeaponInnateModOption[] = [
  { id: "forceful-stock", label: "Forceful Walnut Stock", slot: "stock", description: "+50% Weapon Condition bar, reducing frequent Black Powder repair needs.", effectMath: { durabilityPct: 0.50, apCostPct: -0.05 } },
  { id: "aligned-stock", label: "Aligned Walnut Stock", slot: "stock", description: "Improved V.A.T.S. AP efficiency (-5% AP Cost).", effectMath: { apCostPct: -0.05 } },
  { id: "standard-stock", label: "Standard Hardwood Stock", slot: "stock", description: "Antique Appalachian walnut stock.", effectMath: {} }
];

export const BLACK_POWDER_MAGAZINE_MODS: WeaponInnateModOption[] = [
  { id: "standard-magazine", label: "Standard Muzzle Load", slot: "magazine", description: "Standard volley capacity.", effectMath: {} }
];

export const BLACK_POWDER_SIGHT_MODS: WeaponInnateModOption[] = [
  { id: "standard-sights", label: "Brass Bead Sight", slot: "sight", description: "Period-accurate brass front post bead.", effectMath: {} }
];

export const BLACK_POWDER_MUZZLE_MODS: WeaponInnateModOption[] = [
  { id: "large-bayonet", label: "Large Antique Bayonet", slot: "muzzle", description: "Lethal steel bayonet blade deals high melee bash damage.", effectMath: { damagePct: 0.05 } },
  { id: "none-muzzle", label: "Open Muzzle Flange", slot: "muzzle", description: "Unobstructed powder flash.", effectMath: {} }
];

// ==========================================
// MASTER DISPATCHER: listWeaponInnateModOptions
// ==========================================
export function listWeaponInnateModOptions(
  weaponPieceId: string,
  slot: WeaponInnateSlotKey
): WeaponInnateModOption[] {
  const archetype = resolveWeaponArchetype(weaponPieceId);

  switch (archetype) {
    case "auto-melee":
      if (slot === "barrel") return AUTO_MELEE_BAR_MODS;
      if (slot === "receiver") return AUTO_MELEE_ELEMENTAL_MODS;
      return [];

    case "unarmed":
      if (slot === "barrel") return UNARMED_HEAD_MODS;
      if (slot === "stock") return UNARMED_GRIP_MODS;
      return [];

    case "melee-blunt-blade":
      if (slot === "barrel" || slot === "receiver") return MELEE_BLADE_MODS;
      if (slot === "stock") return MELEE_GRIP_MODS;
      return [];

    case "bow":
      if (slot === "receiver") return ARCHERY_FRAME_MODS;
      if (slot === "sight") return ARCHERY_SIGHT_MODS;
      return [];

    case "railway":
      if (slot === "receiver") return RAILWAY_RECEIVER_MODS;
      if (slot === "barrel") return RAILWAY_BARREL_MODS;
      if (slot === "stock") return RAILWAY_STOCK_MODS;
      if (slot === "sight") return RAILWAY_SIGHT_MODS;
      if (slot === "muzzle") return RAILWAY_MUZZLE_MODS;
      return [];

    case "flamer":
      if (slot === "receiver") return FLAMER_RECEIVER_MODS;
      if (slot === "barrel") return FLAMER_BARREL_MODS;
      if (slot === "magazine") return FLAMER_MAGAZINE_MODS;
      if (slot === "muzzle") return FLAMER_MUZZLE_MODS;
      return [];

    case "cremator":
      if (slot === "receiver") return CREMATOR_RECEIVER_MODS;
      if (slot === "barrel") return CREMATOR_BARREL_MODS;
      if (slot === "magazine") return CREMATOR_MAGAZINE_MODS;
      return [];

    case "tesla":
      if (slot === "receiver") return TESLA_RECEIVER_MODS;
      if (slot === "stock") return TESLA_STOCK_MODS;
      if (slot === "sight") return TESLA_SIGHT_MODS;
      return [];

    case "double-barrel":
      if (slot === "receiver") return DOUBLE_BARREL_RECEIVER_MODS;
      if (slot === "barrel") return DOUBLE_BARREL_BARREL_MODS;
      if (slot === "stock") return DOUBLE_BARREL_STOCK_MODS;
      if (slot === "sight") return DOUBLE_BARREL_SIGHT_MODS;
      if (slot === "muzzle") return DOUBLE_BARREL_MUZZLE_MODS;
      return [];

    case "plasma":
    case "gatling-plasma":
      if (slot === "receiver") return PLASMA_RECEIVER_MODS;
      if (slot === "barrel") return PLASMA_BARREL_MODS;
      if (slot === "stock") return PLASMA_STOCK_MODS;
      if (slot === "sight") return PLASMA_SIGHT_MODS;
      if (slot === "magazine") return BALLISTIC_MAGAZINE_MODS;
      if (slot === "muzzle") return BALLISTIC_MUZZLE_MODS;
      return [];

    case "laser":
    case "gatling-laser":
      if (slot === "receiver") return BALLISTIC_RECEIVER_MODS;
      if (slot === "barrel") return BALLISTIC_BARREL_MODS;
      if (slot === "stock") return BALLISTIC_STOCK_MODS;
      if (slot === "sight") return BALLISTIC_SIGHT_MODS;
      if (slot === "muzzle") return BALLISTIC_MUZZLE_MODS;
      return [];

    case "heavy-ballistic":
    case "heavy-explosive":
      if (slot === "receiver") return HEAVY_BALLISTIC_RECEIVER_MODS;
      if (slot === "barrel") return HEAVY_BALLISTIC_BARREL_MODS;
      if (slot === "magazine") return HEAVY_BALLISTIC_MAG_MODS;
      if (slot === "sight") return HEAVY_BALLISTIC_SIGHT_MODS;
      if (slot === "muzzle") return HEAVY_BALLISTIC_MUZZLE_MODS;
      return [];

    case "revolver":
      if (slot === "receiver") return REVOLVER_RECEIVER_MODS;
      if (slot === "barrel") return REVOLVER_BARREL_MODS;
      if (slot === "stock") return REVOLVER_STOCK_MODS;
      if (slot === "sight") return REVOLVER_SIGHT_MODS;
      return [];

    case "black-powder":
      if (slot === "receiver") return BLACK_POWDER_RECEIVER_MODS;
      if (slot === "barrel") return BLACK_POWDER_BARREL_MODS;
      if (slot === "stock") return BLACK_POWDER_STOCK_MODS;
      if (slot === "magazine") return BLACK_POWDER_MAGAZINE_MODS;
      if (slot === "sight") return BLACK_POWDER_SIGHT_MODS;
      if (slot === "muzzle") return BLACK_POWDER_MUZZLE_MODS;
      return [];

    case "pistol-auto":
    case "combat-shotgun":
    case "ballistic-rifle":
    default:
      if (slot === "receiver") return BALLISTIC_RECEIVER_MODS;
      if (slot === "barrel") return BALLISTIC_BARREL_MODS;
      if (slot === "stock") return BALLISTIC_STOCK_MODS;
      if (slot === "magazine") return BALLISTIC_MAGAZINE_MODS;
      if (slot === "sight") return BALLISTIC_SIGHT_MODS;
      if (slot === "muzzle") return BALLISTIC_MUZZLE_MODS;
      return [];
  }
}

// Backwards-compatible aliases for legacy imports
export const WEAPON_RECEIVER_MODS = BALLISTIC_RECEIVER_MODS;
export const WEAPON_BARREL_MODS = BALLISTIC_BARREL_MODS;
export const WEAPON_STOCK_MODS = BALLISTIC_STOCK_MODS;
export const WEAPON_MAGAZINE_MODS = BALLISTIC_MAGAZINE_MODS;
export const WEAPON_SIGHT_MODS = BALLISTIC_SIGHT_MODS;
export const WEAPON_MUZZLE_MODS = BALLISTIC_MUZZLE_MODS;

export function defaultWeaponInnateCrafting(weaponPieceId: string): BuilderWeaponInnateCrafting {
  const archetype = resolveWeaponArchetype(weaponPieceId);

  switch (archetype) {
    case "auto-melee":
      return {
        barrelId: "chainsaw-dual-bar",
        receiverId: "chainsaw-flamer"
      };

    case "unarmed":
      return {
        barrelId: weaponPieceId.includes("power-fist") ? "power-fist-puncturing" : "extra-claw",
        stockId: "comfort-grip"
      };

    case "melee-blunt-blade":
      return {
        barrelId: "super-sledge-heavy-rocket",
        stockId: "comfort-grip"
      };

    case "bow":
      return {
        receiverId: "bow-plasma-arrows",
        sightId: "bow-glow-sights"
      };

    case "railway":
      return {
        receiverId: "auto-piston-receiver",
        barrelId: "railway-long-barrel",
        stockId: "railway-recoil-stock",
        sightId: "railway-reflex-sight",
        muzzleId: "railway-none-muzzle"
      };

    case "flamer":
      return {
        receiverId: "flamer-napalm-tank",
        barrelId: "flamer-long-barrel",
        magazineId: "flamer-huge-tank",
        muzzleId: "flamer-vaporization-nozzle"
      };

    case "cremator":
      return {
        receiverId: "cremator-slow-burn-tank",
        barrelId: "cremator-quad-barrel",
        magazineId: "cremator-huge-tank"
      };

    case "tesla":
      return {
        receiverId: "tesla-automatic-barrel",
        stockId: "tesla-reflex-stock",
        sightId: "tesla-reflex-sight"
      };

    case "double-barrel":
      return {
        receiverId: "db-hardened-receiver",
        barrelId: "db-extended-barrel",
        stockId: "db-forceful-stock",
        sightId: "db-reflex-sight",
        muzzleId: "db-muzzle-brake"
      };

    case "plasma":
    case "gatling-plasma":
      return {
        receiverId: "plasma-calibrated-capacitor",
        barrelId: "plasma-aligned-flamer",
        stockId: "plasma-forceful-stock",
        sightId: "plasma-reflex-sight"
      };

    case "revolver":
      return {
        receiverId: "revolver-hardened-receiver",
        barrelId: "revolver-bull-barrel",
        stockId: "revolver-ivory-grip",
        sightId: "revolver-reflex-sight"
      };

    case "black-powder":
      return {
        receiverId: "standard-receiver",
        barrelId: "standard-barrel",
        stockId: "forceful-stock",
        magazineId: "standard-magazine",
        sightId: "standard-sights",
        muzzleId: "large-bayonet"
      };

    case "heavy-ballistic":
    case "heavy-explosive":
      return {
        receiverId: "heavy-hardened-receiver",
        barrelId: "heavy-barrel-50cal",
        magazineId: "heavy-standard-mag",
        sightId: "heavy-gunner-sight",
        muzzleId: "heavy-none-muzzle"
      };

    case "pistol-auto":
    case "combat-shotgun":
    case "ballistic-rifle":
    default:
      return {
        receiverId: "powerful-auto-receiver",
        barrelId: "aligned-long-barrel",
        stockId: "forceful-stock",
        magazineId: "perforating-magazine",
        sightId: "reflex-sight-dot",
        muzzleId: "suppressor"
      };
  }
}

export function getWeaponInnateModOption(
  weaponPieceId: string,
  slot: WeaponInnateSlotKey,
  modId?: string | null
): WeaponInnateModOption | undefined {
  if (!modId) return undefined;
  const options = listWeaponInnateModOptions(weaponPieceId, slot);
  return options.find((o) => o.id === modId);
}

export type WeaponInnateAggregateEffects = {
  damagePct: number;
  fireRatePct: number;
  apCostPct: number;
  armorPenetrationPct: number;
  magCapacityPct: number;
  critDamagePct: number;
  isAutomatic: boolean;
  isSuppressed: boolean;
  durabilityPct: number;
  installedMods: { slot: WeaponInnateSlotKey; label: string; description: string }[];
};

export function calculateWeaponInnateAggregate(
  weaponPieceId: string,
  crafting?: BuilderWeaponInnateCrafting | null
): WeaponInnateAggregateEffects {
  const result: WeaponInnateAggregateEffects = {
    damagePct: 0,
    fireRatePct: 0,
    apCostPct: 0,
    armorPenetrationPct: 0,
    magCapacityPct: 0,
    critDamagePct: 0,
    isAutomatic: false,
    isSuppressed: false,
    durabilityPct: 0,
    installedMods: []
  };

  if (!crafting) return result;

  // Only aggregate mods for slots that physically exist on this weapon archetype
  const availableSlots = listWeaponAvailableSlots(weaponPieceId).map((s) => s.key);

  for (const slot of availableSlots) {
    const modId = crafting[
      slot === "receiver"
        ? "receiverId"
        : slot === "barrel"
        ? "barrelId"
        : slot === "stock"
        ? "stockId"
        : slot === "magazine"
        ? "magazineId"
        : slot === "sight"
        ? "sightId"
        : "muzzleId"
    ];

    const option = getWeaponInnateModOption(weaponPieceId, slot, modId);
    if (!option) continue;

    result.installedMods.push({
      slot,
      label: option.label,
      description: option.description
    });

    const m = option.effectMath;
    if (m.damagePct) result.damagePct += m.damagePct;
    if (m.fireRatePct) result.fireRatePct += m.fireRatePct;
    if (m.apCostPct) result.apCostPct += m.apCostPct;
    if (m.armorPenetrationPct) result.armorPenetrationPct += m.armorPenetrationPct;
    if (m.magCapacityPct) result.magCapacityPct += m.magCapacityPct;
    if (m.critDamagePct) result.critDamagePct += m.critDamagePct;
    if (m.isAutomatic) result.isAutomatic = true;
    if (m.isSuppressed) result.isSuppressed = true;
    if (m.durabilityPct) result.durabilityPct += m.durabilityPct;
  }

  return result;
}
