import { ARMOR_SET_ROWS, basePieceIdForArmorSet } from "@/lib/builder/armor-sets";
import type { BuilderEquipmentKind, BuilderWeaponSub } from "@/lib/builder/types";

export type BaseGearPiece = {
  id: string;
  label: string;
  kind: BuilderEquipmentKind;
  /** When kind is `weapon`, default bench sub-filter. */
  weaponSub?: BuilderWeaponSub;
  /** When kind is `underarmor`, sync shell picker to this id (matches `UNDERARMOR_SHELLS`). */
  defaultUnderarmorShellId?: string;
  /** When set, builder uses five body slots × five stars (Backwoods full-set resist table). */
  armorSetKey?: string;
};

const ARMOR_SET_PIECES: BaseGearPiece[] = ARMOR_SET_ROWS.map((row) => ({
  id: basePieceIdForArmorSet(row.key),
  label: `${row.label} (full set)`,
  kind: "armor" as const,
  armorSetKey: row.key
}));

/**
 * One representative piece per craftable power armor model in Fallout 76 (wiki “by type” list),
 * including Gleaming Depths Vulcan and Hellfire prototype. IDs are stable builder keys, not form IDs.
 */
export const POWER_ARMOR_BASE_PIECES: BaseGearPiece[] = [
  { id: "raider-pa-torso", label: "Raider power armor torso", kind: "powerArmor" },
  { id: "t45-torso", label: "T-45 torso", kind: "powerArmor" },
  { id: "t51-torso", label: "T-51b torso", kind: "powerArmor" },
  { id: "t60-torso", label: "T-60 torso", kind: "powerArmor" },
  { id: "t65-helm", label: "T-65 Helmet", kind: "powerArmor" },
  { id: "excavator-torso", label: "Excavator Torso", kind: "powerArmor" },
  { id: "x01-torso", label: "X-01 Torso", kind: "powerArmor" },
  { id: "ultracite-torso", label: "Ultracite torso", kind: "powerArmor" },
  { id: "strangler-heart-chest", label: "Strangler Heart Chest", kind: "powerArmor" },
  { id: "hellcat-torso", label: "Hellcat torso", kind: "powerArmor" },
  { id: "union-pa-torso", label: "Union Power Armor Torso", kind: "powerArmor" },
  { id: "hellfire-prototype-torso", label: "Hellfire prototype torso", kind: "powerArmor" },
  { id: "vulcan-torso", label: "Vulcan torso (Gleaming Depths raid)", kind: "powerArmor" }
];

/** Preset bases for the builder (full armor sets, power armor, weapons, underarmor). */
export const BASE_GEAR_PIECES: BaseGearPiece[] = [
  ...ARMOR_SET_PIECES,

  ...POWER_ARMOR_BASE_PIECES,

  { id: "fixer", label: "The Fixer", kind: "weapon", weaponSub: "ranged" },
  { id: "handmade", label: "Handmade", kind: "weapon", weaponSub: "ranged" },
  { id: "railway", label: "Railway Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "lever-action", label: "Lever Action", kind: "weapon", weaponSub: "ranged" },
  { id: "minigun", label: "Minigun", kind: "weapon", weaponSub: "ranged" },
  { id: "chainsaw", label: "Chainsaw", kind: "weapon", weaponSub: "melee" },
  { id: "power-fist", label: "Power Fist", kind: "weapon", weaponSub: "melee" },
  { id: "dc-gauntlet", label: "Deathclaw Gauntlet", kind: "weapon", weaponSub: "melee" },
  { id: "plasma-flamer", label: "Plasma Flamer", kind: "weapon", weaponSub: "energy" },
  { id: "tesla", label: "Tesla Rifle", kind: "weapon", weaponSub: "energy" },
  { id: "enclave-plasma", label: "Enclave Plasma Gun", kind: "weapon", weaponSub: "energy" },
  { id: "gamma-gun", label: "Gamma Gun", kind: "weapon", weaponSub: "energy" },

  {
    id: "ua-casual",
    label: "Casual underarmor (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "casual"
  },
  {
    id: "ua-operative",
    label: "Operative underarmor (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "operative"
  },
  {
    id: "ua-secret-service",
    label: "Secret Service underarmor (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "secret-service"
  },
  {
    id: "ua-raider",
    label: "Raider skivvies (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "raider"
  },
  {
    id: "ua-marine",
    label: "Marine wetsuit (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "marine"
  },
  {
    id: "ua-vault-suit",
    label: "Vault suit (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "vault-suit"
  },
  {
    id: "ua-military-fatigues",
    label: "Military fatigues (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "military-fatigues"
  },
  {
    id: "ua-road-leathers",
    label: "Road leathers (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "road-leathers"
  },
  {
    id: "ua-civil-engineer",
    label: "Civil Engineer underarmor (shell)",
    kind: "underarmor",
    defaultUnderarmorShellId: "civil-engineer"
  }
];

export const BASE_GEAR_GROUP_ORDER: BuilderEquipmentKind[] = ["armor", "powerArmor", "weapon", "underarmor"];

export const BASE_GEAR_GROUP_LABEL: Record<BuilderEquipmentKind, string> = {
  armor: "Armor (full set)",
  powerArmor: "Power armor",
  weapon: "Weapons",
  underarmor: "Underarmor"
};

/** Bases that can be marked “learned” in the tracker (excludes weapons). */
export const TRACKABLE_BASE_GEAR_KINDS: BuilderEquipmentKind[] = ["armor", "powerArmor", "underarmor"];

export const TRACKABLE_BASE_PIECE_IDS: ReadonlySet<string> = new Set(
  BASE_GEAR_PIECES.filter((p) => TRACKABLE_BASE_GEAR_KINDS.includes(p.kind)).map((p) => p.id)
);

export function listTrackableBaseGearByGroup(): { kind: BuilderEquipmentKind; label: string; pieces: BaseGearPiece[] }[] {
  return BASE_GEAR_GROUP_ORDER.filter((kind) => TRACKABLE_BASE_GEAR_KINDS.includes(kind)).map((kind) => ({
    kind,
    label: BASE_GEAR_GROUP_LABEL[kind],
    pieces: BASE_GEAR_PIECES.filter((p) => p.kind === kind)
  }));
}

export function isTrackableBasePieceId(id: string): boolean {
  return TRACKABLE_BASE_PIECE_IDS.has(id);
}

export function getBaseGearPiece(id: string): BaseGearPiece | undefined {
  return BASE_GEAR_PIECES.find((piece) => piece.id === id);
}
