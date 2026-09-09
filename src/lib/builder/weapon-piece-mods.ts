/**
 * Authoritative Fallout 76 Weapon Innate Workbench Modifications Catalog
 * 
 * Provides authentic weapon attachment options per workbench slot:
 * - Receiver / Core (Automatic conversion, damage scaling, critical hit multipliers)
 * - Barrel (V.A.T.S. AP reduction, hip-fire spread, range)
 * - Stock / Grip (Durability condition boost, V.A.T.S. AP reduction, recoil)
 * - Magazine (Armor Penetration, ammo capacity, reload speed)
 * - Sights / Scope (Reflex sight -15% AP reduction, reconnaissance tracking, scopes)
 * - Muzzle (Suppressor sneak attack synergy, recoil compensation, bayonet bash)
 * Plus specialized Melee & Archery mod options.
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

// ==========================================
// 1. RECEIVERS (Ranged & Heavy)
// ==========================================
export const WEAPON_RECEIVER_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-receiver",
    label: "Standard Receiver",
    slot: "receiver",
    description: "Standard factory configuration.",
    effectMath: {}
  },
  {
    id: "hardened-receiver",
    label: "Hardened Receiver",
    slot: "receiver",
    description: "Superior ballistic damage (+25% Damage).",
    effectMath: { damagePct: 0.25 }
  },
  {
    id: "powerful-auto-receiver",
    label: "Powerful Automatic Receiver",
    slot: "receiver",
    description: "Converts weapon to fully automatic. Superior rate of fire, reduced V.A.T.S. AP cost.",
    effectMath: { isAutomatic: true, fireRatePct: 0.40, apCostPct: -0.10, damagePct: -0.15 }
  },
  {
    id: "tweaked-auto-receiver",
    label: "Tweaked Automatic Receiver",
    slot: "receiver",
    description: "Fully automatic fire with improved critical hit damage (+50% Crit) and high rate of fire.",
    effectMath: { isAutomatic: true, fireRatePct: 0.40, critDamagePct: 0.50, apCostPct: -0.10, damagePct: -0.15 }
  },
  {
    id: "prime-receiver",
    label: "Prime Receiver",
    slot: "receiver",
    description: "Exceptional damage (+35% Damage) and bonus damage against Scorched and Scorchbeasts. Uses Ultracite ammo.",
    effectMath: { damagePct: 0.35 }
  },
  {
    id: "prime-auto-receiver",
    label: "Prime Automatic Receiver",
    slot: "receiver",
    description: "Fully automatic fire with exceptional damage against Scorched. Uses Ultracite ammo.",
    effectMath: { isAutomatic: true, fireRatePct: 0.40, damagePct: 0.05, apCostPct: -0.10 }
  },
  {
    id: "calibrated-receiver",
    label: "Calibrated Receiver",
    slot: "receiver",
    description: "Superior critical hit damage (+100% Critical Damage bonus).",
    effectMath: { critDamagePct: 1.0, damagePct: 0.10 }
  },
  {
    id: "severe-beta-wave-receiver",
    label: "Severe Beta Wave Tuner",
    slot: "receiver",
    description: "Adds burning fire damage over time and +50% bonus critical hit damage.",
    effectMath: { damagePct: 0.10, critDamagePct: 0.50 }
  },
  {
    id: "hair-trigger-receiver",
    label: "Hair Trigger Receiver",
    slot: "receiver",
    description: "More responsive trigger allows rapid semi-automatic cycling (+30% Fire Rate).",
    effectMath: { fireRatePct: 0.30, apCostPct: -0.05 }
  }
];

// ==========================================
// 2. BARRELS (Ranged & Heavy)
// ==========================================
export const WEAPON_BARREL_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-barrel",
    label: "Standard Barrel",
    slot: "barrel",
    description: "Standard factory barrel length.",
    effectMath: {}
  },
  {
    id: "aligned-long-barrel",
    label: "Aligned Long Barrel",
    slot: "barrel",
    description: "Superior range and reduced V.A.T.S. AP cost (-5% AP Cost).",
    effectMath: { apCostPct: -0.05 }
  },
  {
    id: "true-long-barrel",
    label: "True Long Barrel",
    slot: "barrel",
    description: "Superior range and improved hip-fire accuracy.",
    effectMath: {}
  },
  {
    id: "stabilized-long-barrel",
    label: "Stabilized Long Barrel",
    slot: "barrel",
    description: "Superior range and significantly improved recoil control.",
    effectMath: {}
  },
  {
    id: "aligned-short-barrel",
    label: "Aligned Short Barrel",
    slot: "barrel",
    description: "Faster handling and reduced V.A.T.S. AP cost (-5% AP Cost).",
    effectMath: { apCostPct: -0.05 }
  },
  {
    id: "flamer-barrel",
    label: "Aligned Flamer Barrel",
    slot: "barrel",
    description: "Converts energy weapon into continuous plasma/laser flamer stream.",
    effectMath: { isAutomatic: true, fireRatePct: 1.2, apCostPct: 0.20 }
  },
  {
    id: "accelerated-barrel",
    label: "Accelerated Barrel",
    slot: "barrel",
    description: "High-speed cycling motor delivers blistering rate of fire (+25% Fire Rate).",
    effectMath: { fireRatePct: 0.25 }
  },
  {
    id: "tri-barrel",
    label: "Tri-Barrel",
    slot: "barrel",
    description: "Triple rotating barrel cluster maximizes ballistic damage and barrel stabilization.",
    effectMath: { damagePct: 0.15, fireRatePct: -0.15 }
  }
];

// ==========================================
// 3. STOCKS & GRIPS
// ==========================================
export const WEAPON_STOCK_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-stock",
    label: "Standard Stock",
    slot: "stock",
    description: "Standard factory stock.",
    effectMath: {}
  },
  {
    id: "forceful-stock",
    label: "Forceful Stock",
    slot: "stock",
    description: "Reinforced composite stock significantly increases weapon condition bar by +50%, reducing repair frequency. Moderate V.A.T.S. AP reduction.",
    effectMath: { durabilityPct: 0.50, apCostPct: -0.05 }
  },
  {
    id: "aligned-stock",
    label: "Aligned Stock",
    slot: "stock",
    description: "Optimized ergonomic balance delivers superior recoil control and reduced V.A.T.S. AP cost (-5% AP Cost).",
    effectMath: { apCostPct: -0.05 }
  },
  {
    id: "true-stock",
    label: "True Stock",
    slot: "stock",
    description: "Ergonomic stock configured for maximum hip-fire accuracy.",
    effectMath: {}
  },
  {
    id: "stabilized-stock",
    label: "Stabilized Stock",
    slot: "stock",
    description: "Counter-weighted stock delivers maximum sustained automatic fire stability.",
    effectMath: {}
  },
  {
    id: "bruising-grip",
    label: "Bruising Grip",
    slot: "stock",
    description: "Tactical pistol grip improves weapon bash damage and V.A.T.S. handling.",
    effectMath: { apCostPct: -0.05 }
  }
];

// ==========================================
// 4. MAGAZINES
// ==========================================
export const WEAPON_MAGAZINE_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-magazine",
    label: "Standard Magazine",
    slot: "magazine",
    description: "Standard capacity magazine.",
    effectMath: {}
  },
  {
    id: "perforating-magazine",
    label: "Perforating Magazine",
    slot: "magazine",
    description: "Heavy tungsten-core feeding system grants +40% Armor Penetration.",
    effectMath: { armorPenetrationPct: 40 }
  },
  {
    id: "piercing-magazine",
    label: "Piercing Magazine",
    slot: "magazine",
    description: "Armor-piercing rounds grant +20% Armor Penetration with improved reload speed.",
    effectMath: { armorPenetrationPct: 20 }
  },
  {
    id: "stinging-magazine",
    label: "Stinging Magazine",
    slot: "magazine",
    description: "Extended armor-piercing magazine grants +20% Armor Penetration and +20% Ammo Capacity.",
    effectMath: { armorPenetrationPct: 20, magCapacityPct: 0.20 }
  },
  {
    id: "quick-magazine",
    label: "Quick Magazine",
    slot: "magazine",
    description: "Lightweight magazine provides lightning-fast tactical reloads and reduced AP cost.",
    effectMath: { apCostPct: -0.05 }
  },
  {
    id: "large-magazine",
    label: "Large Magazine / Drum",
    slot: "magazine",
    description: "High-capacity drum expands ammo reservoir by +50%.",
    effectMath: { magCapacityPct: 0.50 }
  }
];

// ==========================================
// 5. SIGHTS & OPTICS
// ==========================================
export const WEAPON_SIGHT_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-sights",
    label: "Standard / Iron Sights",
    slot: "sight",
    description: "Factory iron sights.",
    effectMath: {}
  },
  {
    id: "reflex-sight-dot",
    label: "Reflex Sight (Dot)",
    slot: "sight",
    description: "Non-magnified illuminated holographic sight. Authoritative -15% V.A.T.S. Action Point Cost reduction.",
    effectMath: { apCostPct: -0.15 }
  },
  {
    id: "reflex-sight-circle",
    label: "Reflex Sight (Circle)",
    slot: "sight",
    description: "Circle reticle reflex optic. Authoritative -15% V.A.T.S. Action Point Cost reduction.",
    effectMath: { apCostPct: -0.15 }
  },
  {
    id: "short-recon-scope",
    label: "Short Recon Scope",
    slot: "sight",
    description: "Tracks and illuminates targets with tactical HUD diamond indicators.",
    effectMath: {}
  },
  {
    id: "medium-scope",
    label: "Medium Scope",
    slot: "sight",
    description: "4x magnification precision hunting optic.",
    effectMath: { apCostPct: 0.10 }
  },
  {
    id: "night-vision-scope",
    label: "Night Vision Scope",
    slot: "sight",
    description: "Active infrared night vision optic reveals targets in deep darkness.",
    effectMath: { apCostPct: 0.10 }
  }
];

// ==========================================
// 6. MUZZLES & ACCESSORIES
// ==========================================
export const WEAPON_MUZZLE_MODS: WeaponInnateModOption[] = [
  {
    id: "none-muzzle",
    label: "No Muzzle Attachment",
    slot: "muzzle",
    description: "Unsuppressed barrel crown.",
    effectMath: {}
  },
  {
    id: "suppressor",
    label: "Suppressor",
    slot: "muzzle",
    description: "Silences weapon fire, completely masking player location. Activates Mister Sandman and Covert Operative sneak attack multipliers.",
    effectMath: { isSuppressed: true }
  },
  {
    id: "compensator",
    label: "Compensator",
    slot: "muzzle",
    description: "Ported muzzle compensator reduces vertical and horizontal shot climb.",
    effectMath: {}
  },
  {
    id: "muzzle-brake",
    label: "Muzzle Brake",
    slot: "muzzle",
    description: "Vented gas redirection provides superior continuous recoil control.",
    effectMath: {}
  },
  {
    id: "large-bayonet",
    label: "Large Bayonet",
    slot: "muzzle",
    description: "Fixed serrated blade enables deadly melee bash strikes (ideal for The Dragon & Black Powder weapons).",
    effectMath: { damagePct: 0.05 }
  }
];

// ==========================================
// 7. MELEE & SPECIALIZED WEAPON MODS
// ==========================================
export const MELEE_BLADE_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-head",
    label: "Standard Head / Blade",
    slot: "barrel",
    description: "Standard factory striking surface.",
    effectMath: {}
  },
  {
    id: "puncturing-mod",
    label: "Puncturing Mod",
    slot: "barrel",
    description: "Hardened armor-piercing spikes grant +30% Armor Penetration.",
    effectMath: { armorPenetrationPct: 30 }
  },
  {
    id: "extra-claw",
    label: "Extra Claw",
    slot: "barrel",
    description: "Adds a third razor-sharp taloned claw dealing +20% damage and increased limb damage.",
    effectMath: { damagePct: 0.20 }
  },
  {
    id: "searing-heating-coil",
    label: "Searing / Heating Coil",
    slot: "barrel",
    description: "Electrified superheated coils inflict intense ongoing fire burn damage.",
    effectMath: { damagePct: 0.20 }
  },
  {
    id: "electrified-shocks",
    label: "Electrified / Shocking",
    slot: "barrel",
    description: "High-voltage capacitors deal electrical energy damage on impact.",
    effectMath: { damagePct: 0.15 }
  },
  {
    id: "serrated-blade",
    label: "Serrated Bleeding Blade",
    slot: "barrel",
    description: "Jagged carbide teeth cause severe arterial bleeding damage.",
    effectMath: { damagePct: 0.15 }
  },
  {
    id: "dual-bar",
    label: "Dual Bar (Auto Melee)",
    slot: "barrel",
    description: "Twin grinding guide bars maximize continuous chainsaw/auto-axe tearing power.",
    effectMath: { damagePct: 0.30 }
  }
];

export const MELEE_GRIP_MODS: WeaponInnateModOption[] = [
  {
    id: "standard-grip",
    label: "Standard Grip",
    slot: "stock",
    description: "Standard factory shaft/grip.",
    effectMath: {}
  },
  {
    id: "weighted-grip",
    label: "Weighted / Heavy Grip",
    slot: "stock",
    description: "Counter-weighted shaft increases stagger and limb crippling chance.",
    effectMath: { damagePct: 0.10 }
  },
  {
    id: "comfort-grip",
    label: "Comfort Grip",
    slot: "stock",
    description: "Ergonomic shock-absorbing wrap reduces V.A.T.S. and Power Attack AP costs (-10% AP Cost).",
    effectMath: { apCostPct: -0.10 }
  }
];

// ==========================================
// 8. HELPERS & SELECTORS
// ==========================================

export function listWeaponInnateModOptions(
  weaponPieceId: string,
  slot: WeaponInnateSlotKey
): WeaponInnateModOption[] {
  const piece = getBaseGearPiece(weaponPieceId);
  const isMelee = piece?.weaponSub === "melee";

  if (isMelee) {
    if (slot === "barrel" || slot === "receiver") return MELEE_BLADE_MODS;
    if (slot === "stock") return MELEE_GRIP_MODS;
    return [];
  }

  // Specialized weapon handling (e.g. The Dragon / Black Powder Rifle)
  if (weaponPieceId === "the-dragon" || weaponPieceId.includes("black-powder")) {
    if (slot === "receiver") {
      return [
        { id: "standard-receiver", label: "Standard Black Powder Breech", slot: "receiver", description: "Standard quadruple-barrel black powder ignition.", effectMath: {} },
        { id: "prime-receiver", label: "Prime Black Powder Breech", slot: "receiver", description: "Exceptional damage vs Scorched. Uses Ultracite .50 Caliber Balls.", effectMath: { damagePct: 0.35 } }
      ];
    }
    if (slot === "barrel") {
      return [
        { id: "standard-barrel", label: "Quadruple Rifle Barrel", slot: "barrel", description: "Authentic quad-bore muzzle-loading barrel arrangement.", effectMath: {} }
      ];
    }
    if (slot === "stock") {
      return [
        { id: "standard-stock", label: "Standard Hardwood Stock", slot: "stock", description: "Antique Appalachian walnut stock.", effectMath: {} },
        { id: "forceful-stock", label: "Forceful Walnut Stock", slot: "stock", description: "+50% Weapon Condition bar, reducing frequent Black Powder repair needs.", effectMath: { durabilityPct: 0.50, apCostPct: -0.05 } },
        { id: "aligned-stock", label: "Aligned Walnut Stock", slot: "stock", description: "Improved V.A.T.S. AP efficiency (-5% AP Cost).", effectMath: { apCostPct: -0.05 } }
      ];
    }
    if (slot === "magazine") {
      return [
        { id: "standard-magazine", label: "4-Ball Muzzle Load", slot: "magazine", description: "Standard 4-round volley capacity.", effectMath: {} }
      ];
    }
    if (slot === "sight") {
      return [
        { id: "standard-sights", label: "Brass Bead Sight", slot: "sight", description: "Period-accurate brass front post bead.", effectMath: {} }
      ];
    }
    if (slot === "muzzle") {
      return [
        { id: "none-muzzle", label: "Open Muzzle Flange", slot: "muzzle", description: "Unobstructed powder flash.", effectMath: {} },
        { id: "large-bayonet", label: "Large Antique Bayonet", slot: "muzzle", description: "Lethal steel bayonet blade deals high melee bash damage.", effectMath: { damagePct: 0.05 } }
      ];
    }
  }

  // Standard Ranged Weapons (The Fixer, Handmade, Railway, Shotguns, Heavy, etc.)
  switch (slot) {
    case "receiver":
      return WEAPON_RECEIVER_MODS;
    case "barrel":
      return WEAPON_BARREL_MODS;
    case "stock":
      return WEAPON_STOCK_MODS;
    case "magazine":
      return WEAPON_MAGAZINE_MODS;
    case "sight":
      return WEAPON_SIGHT_MODS;
    case "muzzle":
      return WEAPON_MUZZLE_MODS;
  }
}

export function defaultWeaponInnateCrafting(weaponPieceId: string): BuilderWeaponInnateCrafting {
  const piece = getBaseGearPiece(weaponPieceId);
  const isMelee = piece?.weaponSub === "melee";

  if (isMelee) {
    return {
      barrelId: "standard-head",
      stockId: "standard-grip"
    };
  }

  if (weaponPieceId === "the-dragon" || weaponPieceId.includes("black-powder")) {
    return {
      receiverId: "standard-receiver",
      barrelId: "standard-barrel",
      stockId: "standard-stock",
      magazineId: "standard-magazine",
      sightId: "standard-sights",
      muzzleId: "large-bayonet"
    };
  }

  // Default meta loadout for commando/rifle weapons (e.g. The Fixer, Handmade)
  if (weaponPieceId === "the-fixer" || weaponPieceId === "handmade-rifle" || weaponPieceId === "railway-rifle") {
    return {
      receiverId: "powerful-auto-receiver",
      barrelId: "aligned-long-barrel",
      stockId: "forceful-stock",
      magazineId: "perforating-magazine",
      sightId: "reflex-sight-dot",
      muzzleId: "suppressor"
    };
  }

  return {
    receiverId: "standard-receiver",
    barrelId: "standard-barrel",
    stockId: "standard-stock",
    magazineId: "standard-magazine",
    sightId: "standard-sights",
    muzzleId: "none-muzzle"
  };
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

  const slots: WeaponInnateSlotKey[] = ["receiver", "barrel", "stock", "magazine", "sight", "muzzle"];

  for (const slot of slots) {
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
