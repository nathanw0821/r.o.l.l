import { ARMOR_SET_ROWS, basePieceIdForArmorSet } from "@/lib/builder/armor-sets";
import { defaultHelmetIdForTorsoPieceId } from "@/lib/builder/power-armor-stats";
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
  /**
   * Power armor only: torso/chest rows use legendary stars + optional paired helmet; helmet bases are misc-only.
   * Omit for non–power-armor; omit or `torso` for PA torso/chest entries.
   */
  powerArmorSlot?: "torso" | "helmet";
};

const ARMOR_SET_PIECES: BaseGearPiece[] = ARMOR_SET_ROWS.map((row) => ({
  id: basePieceIdForArmorSet(row.key),
  label: `${row.label} (full set)`,
  kind: "armor" as const,
  armorSetKey: row.key
}));

/**
 * Torso/chest representatives per frame + matching helmets (FO76: PA helmets have no legendary stars; misc + material still apply).
 * IDs are stable builder keys, not form IDs.
 */
export const POWER_ARMOR_TORSO_PIECES: BaseGearPiece[] = [
  { id: "raider-pa-torso", label: "Raider power armor (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "t45-torso", label: "T-45 (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "t51-torso", label: "T-51b (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "t60-torso", label: "T-60 (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "t65-torso", label: "T-65 (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "excavator-torso", label: "Excavator (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "x01-torso", label: "X-01 (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "ultracite-torso", label: "Ultracite (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "strangler-heart-chest", label: "Strangler Heart (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "hellcat-torso", label: "Hellcat (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "union-pa-torso", label: "Union Power Armor (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "hellfire-prototype-torso", label: "Hellfire prototype (full set)", kind: "powerArmor", powerArmorSlot: "torso" },
  { id: "vulcan-torso", label: "Vulcan (full set) · Gleaming Depths", kind: "powerArmor", powerArmorSlot: "torso" }
];

export const POWER_ARMOR_HELMET_PIECES: BaseGearPiece[] = [
  { id: "raider-pa-helm", label: "Raider power armor helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "t45-helm", label: "T-45 helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "t51-helm", label: "T-51b helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "t60-helm", label: "T-60 helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "t65-helm", label: "T-65 helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "excavator-helm", label: "Excavator helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "x01-helm", label: "X-01 helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "ultracite-helm", label: "Ultracite helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "strangler-heart-helm", label: "Strangler Heart helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "hellcat-helm", label: "Hellcat helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "union-pa-helm", label: "Union Power Armor helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "hellfire-prototype-helm", label: "Hellfire prototype helmet", kind: "powerArmor", powerArmorSlot: "helmet" },
  { id: "vulcan-helm", label: "Vulcan helmet (Gleaming Depths raid)", kind: "powerArmor", powerArmorSlot: "helmet" }
];

export const WEAPON_BASE_PIECES: BaseGearPiece[] = [
  // --- NAMED UNIQUE WEAPONS ---
  { id: "elders-mark", label: "Elder's Mark (Submachine Gun · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "holy-fire", label: "Holy Fire (Flamer · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "anchorage-ace", label: "Anchorage Ace (10mm SMG · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "cold-shoulder", label: "Cold Shoulder (Double-Barrel · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "red-terror", label: "Red Terror (LMG · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "v63-bertha", label: "V63 Bertha (Tesla Rifle · Unique)", kind: "weapon", weaponSub: "energy" },
  { id: "v63-helga", label: "V63 Helga (Gatling Laser · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "v63-olga", label: "V63 Olga (Laser Rifle · Unique)", kind: "weapon", weaponSub: "energy" },
  { id: "v63-zweihander", label: "V63 Zweihänder (Super Sledge · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "v63-shock-baton", label: "V63 Shock Baton (Security Baton · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "ticket-to-revenge", label: "Ticket to Revenge (Railway Rifle · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "shattered-grounds", label: "Shattered Grounds (Handmade · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "love-tap", label: "Love Tap (Submachine Gun · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "western-spirit", label: "Western Spirit (Lever Action · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "gunthers-big-iron", label: "Gunther's Big Iron (Single Action · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "the-fact-finder", label: "The Fact Finder (.44 Pistol · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "the-kabloom", label: "The Kabloom (Pump Shotgun · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "grand-finale", label: "Grand Finale (Broadsider · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "boomstick", label: "Boomstick (Missile Launcher · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "overkill", label: "Overkill (Fat Man · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "sole-survivor", label: "Sole Survivor (Lever Action · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "face-breaker", label: "Face Breaker (Power Fist · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "unstoppable-monster", label: "Unstoppable Monster (Deathclaw Gauntlet · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "the-gutter", label: "The Gutter (Chinese Officer Sword · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "whacker-smacker", label: "Whacker Smacker (Super Sledge · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "crowd-control", label: "Crowd Control (Combat Shotgun · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "medical-malpractice", label: "Medical Malpractice (.44 Pistol · Unique)", kind: "weapon", weaponSub: "ranged" },
  { id: "mechanics-best-friend", label: "Mechanic's Best Friend (Pipe Wrench · Unique)", kind: "weapon", weaponSub: "melee" },
  { id: "the-action-hero", label: "The Action Hero (.50 Cal · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "resolute-veteran", label: "Resolute Veteran (Gatling Gun · Unique)", kind: "weapon", weaponSub: "heavy" },
  { id: "night-light", label: "Night Light (Tesla Rifle · Unique)", kind: "weapon", weaponSub: "energy" },
  { id: "doctors-orders", label: "Doctor's Orders (Hunting Rifle · Unique)", kind: "weapon", weaponSub: "ranged" },

  // --- STANDARD RIFLES & COMMANDO ---
  { id: "fixer", label: "The Fixer", kind: "weapon", weaponSub: "ranged" },
  { id: "handmade", label: "Handmade Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "railway", label: "Railway Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "combat-rifle", label: "Combat Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "assault-rifle", label: "Assault Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "hunting-rifle", label: "Hunting Rifle / Sniper", kind: "weapon", weaponSub: "ranged" },
  { id: "lever-action", label: "Lever Action Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "gauss-rifle", label: "Gauss Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "radium-rifle", label: "Radium Rifle", kind: "weapon", weaponSub: "energy" },
  { id: "submachine-gun", label: "Submachine Gun (.45)", kind: "weapon", weaponSub: "ranged" },
  { id: "10mm-smg", label: "10mm Submachine Gun", kind: "weapon", weaponSub: "ranged" },
  { id: "pipe-gun", label: "Pipe Gun / Bolt-Action", kind: "weapon", weaponSub: "ranged" },

  // --- HEAVY ORDNANCE ---
  { id: "cremator", label: "Cremator", kind: "weapon", weaponSub: "heavy" },
  { id: "flamer", label: "Flamer", kind: "weapon", weaponSub: "heavy" },
  { id: "gatling-plasma", label: "Gatling Plasma", kind: "weapon", weaponSub: "heavy" },
  { id: "gatling-laser", label: "Gatling Laser / Ultracite", kind: "weapon", weaponSub: "heavy" },
  { id: "plasma-caster", label: "Plasma Caster", kind: "weapon", weaponSub: "heavy" },
  { id: "gauss-minigun", label: "Gauss Minigun", kind: "weapon", weaponSub: "heavy" },
  { id: "minigun", label: "Minigun", kind: "weapon", weaponSub: "heavy" },
  { id: "cal50", label: ".50 Cal Machine Gun", kind: "weapon", weaponSub: "heavy" },
  { id: "lmg", label: "Light Machine Gun (LMG)", kind: "weapon", weaponSub: "heavy" },
  { id: "gatling-gun", label: "Gatling Gun (5mm)", kind: "weapon", weaponSub: "heavy" },
  { id: "pepper-shaker", label: "Pepper Shaker", kind: "weapon", weaponSub: "heavy" },
  { id: "harpoon-gun", label: "Harpoon Gun", kind: "weapon", weaponSub: "heavy" },
  { id: "broadsider", label: "Broadsider", kind: "weapon", weaponSub: "heavy" },
  { id: "missile-launcher", label: "Missile Launcher", kind: "weapon", weaponSub: "heavy" },
  { id: "fat-man", label: "Fat Man / Mini Nuke", kind: "weapon", weaponSub: "heavy" },
  { id: "auto-grenade-launcher", label: "Auto Grenade Launcher", kind: "weapon", weaponSub: "heavy" },
  { id: "m79-grenade", label: "M79 Grenade Launcher", kind: "weapon", weaponSub: "heavy" },

  // --- ENERGY WEAPONS ---
  { id: "alien-disintegrator", label: "Alien Disintegrator", kind: "weapon", weaponSub: "energy" },
  { id: "enclave-plasma", label: "Enclave Plasma Gun", kind: "weapon", weaponSub: "energy" },
  { id: "plasma-flamer", label: "Plasma Flamer", kind: "weapon", weaponSub: "energy" },
  { id: "plasma-gun", label: "Plasma Gun", kind: "weapon", weaponSub: "energy" },
  { id: "laser-rifle", label: "Laser Rifle / Pistol", kind: "weapon", weaponSub: "energy" },
  { id: "ultracite-laser", label: "Ultracite Laser Rifle", kind: "weapon", weaponSub: "energy" },
  { id: "tesla", label: "Tesla Rifle", kind: "weapon", weaponSub: "energy" },
  { id: "gamma-gun", label: "Gamma Gun", kind: "weapon", weaponSub: "energy" },
  { id: "alien-blaster", label: "Alien Blaster", kind: "weapon", weaponSub: "energy" },
  { id: "laser-musket", label: "Laser Musket", kind: "weapon", weaponSub: "energy" },

  // --- SHOTGUNS ---
  { id: "gauss-shotgun", label: "Gauss Shotgun", kind: "weapon", weaponSub: "ranged" },
  { id: "combat-shotgun", label: "Combat Shotgun", kind: "weapon", weaponSub: "ranged" },
  { id: "pump-shotgun", label: "Pump Action Shotgun", kind: "weapon", weaponSub: "ranged" },
  { id: "double-barrel", label: "Double-Barrel Shotgun", kind: "weapon", weaponSub: "ranged" },

  // --- PISTOLS & GUERRILLA ---
  { id: "crusader-pistol", label: "Crusader Pistol", kind: "weapon", weaponSub: "ranged" },
  { id: "10mm-pistol", label: "10mm Pistol", kind: "weapon", weaponSub: "ranged" },
  { id: "western-revolver", label: "Western Revolver", kind: "weapon", weaponSub: "ranged" },
  { id: "44-pistol", label: ".44 Pistol", kind: "weapon", weaponSub: "ranged" },
  { id: "single-action", label: "Single Action Revolver", kind: "weapon", weaponSub: "ranged" },
  { id: "black-powder-pistol", label: "Black Powder Pistol / Rifle", kind: "weapon", weaponSub: "ranged" },
  { id: "the-dragon", label: "The Dragon", kind: "weapon", weaponSub: "ranged" },

  // --- ARCHERY & SPECIAL ---
  { id: "compound-bow", label: "Compound Bow", kind: "weapon", weaponSub: "ranged" },
  { id: "bow", label: "Hunting Bow", kind: "weapon", weaponSub: "ranged" },
  { id: "crossbow", label: "Crossbow", kind: "weapon", weaponSub: "ranged" },

  // --- MELEE & UNARMED ---
  { id: "chainsaw", label: "Chainsaw", kind: "weapon", weaponSub: "melee" },
  { id: "auto-axe", label: "Auto Axe", kind: "weapon", weaponSub: "melee" },
  { id: "mr-handy-buzz-blade", label: "Mr. Handy Buzz Blade", kind: "weapon", weaponSub: "melee" },
  { id: "drill", label: "Drill", kind: "weapon", weaponSub: "melee" },
  { id: "ripper", label: "The Ripper", kind: "weapon", weaponSub: "melee" },
  { id: "power-fist", label: "Power Fist", kind: "weapon", weaponSub: "melee" },
  { id: "dc-gauntlet", label: "Deathclaw Gauntlet", kind: "weapon", weaponSub: "melee" },
  { id: "gauntlet", label: "Gauntlet (Settlers)", kind: "weapon", weaponSub: "melee" },
  { id: "bear-arm", label: "Bear Arm", kind: "weapon", weaponSub: "melee" },
  { id: "meat-hook", label: "Meat Hook", kind: "weapon", weaponSub: "melee" },
  { id: "mole-miner-gauntlet", label: "Mole Miner Gauntlet", kind: "weapon", weaponSub: "melee" },
  { id: "boxing-glove", label: "Boxing Glove", kind: "weapon", weaponSub: "melee" },
  { id: "knuckles", label: "Knuckles", kind: "weapon", weaponSub: "melee" },
  { id: "war-glaive", label: "War Glaive", kind: "weapon", weaponSub: "melee" },
  { id: "plasma-cutter", label: "Plasma Cutter", kind: "weapon", weaponSub: "melee" },
  { id: "super-sledge", label: "Super Sledge", kind: "weapon", weaponSub: "melee" },
  { id: "sledgehammer", label: "Sledgehammer", kind: "weapon", weaponSub: "melee" },
  { id: "grognak-axe", label: "Grognak's Axe", kind: "weapon", weaponSub: "melee" },
  { id: "fire-axe", label: "Fire Axe", kind: "weapon", weaponSub: "melee" },
  { id: "tenderizer", label: "The Tenderizer", kind: "weapon", weaponSub: "melee" },
  { id: "sheepsquatch-staff", label: "Sheepsquatch Staff", kind: "weapon", weaponSub: "melee" },
  { id: "sheepsquatch-club", label: "Sheepsquatch Club", kind: "weapon", weaponSub: "melee" },
  { id: "baseball-bat", label: "Baseball Bat", kind: "weapon", weaponSub: "melee" },
  { id: "combat-knife", label: "Combat Knife / Bowie", kind: "weapon", weaponSub: "melee" },
  { id: "switchblade", label: "Switchblade", kind: "weapon", weaponSub: "melee" },
  { id: "pipe-wrench", label: "Pipe Wrench", kind: "weapon", weaponSub: "melee" },
  { id: "shishkebab", label: "Shishkebab", kind: "weapon", weaponSub: "melee" },
  { id: "cultist-dagger", label: "Cultist Dagger / Blade", kind: "weapon", weaponSub: "melee" },
  { id: "cattleprod", label: "Cattle Prod", kind: "weapon", weaponSub: "melee" },
];

/** @deprecated Use `POWER_ARMOR_TORSO_PIECES` — helmets are paired, not separate base rows. */
export const POWER_ARMOR_BASE_PIECES: BaseGearPiece[] = [...POWER_ARMOR_TORSO_PIECES];

export function isPowerArmorTorsoBasePiece(piece: BaseGearPiece): boolean {
  return piece.kind === "powerArmor" && piece.powerArmorSlot !== "helmet";
}

export function isPowerArmorHelmetBasePiece(piece: BaseGearPiece): boolean {
  return piece.kind === "powerArmor" && piece.powerArmorSlot === "helmet";
}

/** Preset bases for the builder (full armor sets, power armor, weapons, underarmor). */
export const BASE_GEAR_PIECES: BaseGearPiece[] = [
  ...ARMOR_SET_PIECES,

  ...POWER_ARMOR_TORSO_PIECES,

  ...WEAPON_BASE_PIECES,

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

export const BASE_GEAR_GROUP_LABEL: Record<string, string> = {
  armor: "Armor Sets (5-piece)",
  powerArmor: "Power Armor (Frame + 5 pieces)",
  weapon: "Weapons (Sandbox)",
  underarmor: "Underarmor (Lining / Stats)"
};

export const BASE_GEAR_GROUP_ORDER = [
  "armor",
  "powerArmor",
  "weapon",
  "underarmor"
] as const;

export function getBaseGearPiece(id: string): BaseGearPiece | undefined {
  return BASE_GEAR_PIECES.find((p) => p.id === id);
}

export function isTrackableBasePieceId(id: string): boolean {
  return BASE_GEAR_PIECES.some((p) => p.id === id);
}

export function pairedPowerArmorHelmetId(torsoBaseId: string): string | null {
  return defaultHelmetIdForTorsoPieceId(torsoBaseId);
}

export function isPowerArmorTorsoRowLearned(
  torsoPieceId: string,
  learnedSet: Set<string>
): boolean {
  if (!learnedSet.has(torsoPieceId)) return false;
  const helmId = pairedPowerArmorHelmetId(torsoPieceId);
  return helmId ? learnedSet.has(helmId) : true;
}

export function canonicalBasePieceId(id: string | null | undefined): string {
  if (!id) return "armor-set-civil-engineer";
  const piece = getBaseGearPiece(id);
  return piece ? piece.id : id;
}
