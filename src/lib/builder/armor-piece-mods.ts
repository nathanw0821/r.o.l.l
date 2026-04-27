/**
 * Craft-bench style options per armor piece (material line + misc).
 * Values are sandbox hints per piece (stack ×5 for a full set) — not a full FO76 mod sim.
 */

import { getBaseGearPiece } from "@/lib/builder/base-gear";
import { armorSetKeyFromBasePieceId } from "@/lib/builder/armor-sets";
import type { BuilderArmorPieceCrafting } from "@/lib/builder/types";

export type ArmorPieceModOption = {
  id: string;
  label: string;
  /** Numeric hints merged into builder totals (same keys as legendary `effectMath`). */
  effectMath: Record<string, number>;
};

/** Damage / energy resist focus (Welded → Buttressed style progression). */
export const ARMOR_MATERIAL_MODS: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "welded", label: "Welded", effectMath: { dr: 5, er: 3 } },
  { id: "tempered", label: "Tempered", effectMath: { dr: 8, er: 5 } },
  { id: "hardened", label: "Hardened", effectMath: { dr: 11, er: 7 } },
  { id: "toughened", label: "Toughened", effectMath: { dr: 14, er: 9 } },
  { id: "buttressed", label: "Buttressed", effectMath: { dr: 17, er: 11, fr: 1, cr: 1, pr: 1, rr: 1 } }
];

/** Second misc slot: weight / carry / utility (sandbox numbers). */
export const ARMOR_MISC_MODS: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "ultra-light", label: "Ultra-light build", effectMath: { apRegen: 0.05 } },
  { id: "deep-pocketed", label: "Deep pocketed", effectMath: { carryWeight: 10 } },
  { id: "leaded", label: "Leaded", effectMath: { rr: 10 } },
  { id: "padded", label: "Padded", effectMath: { dr: 5 } },
  { id: "sleek", label: "Sleek", effectMath: { er: 5 } },
  { id: "custom-fitted", label: "Custom fitted", effectMath: { hp: 5 } }
];

/** Power armor material options (wiki: mostly standard / legacy painted resists). */
export const PA_MATERIAL_MODS: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "standard", label: "Standard", effectMath: {} }
];

export const PA_MISC_MODS_HELMET: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "internal-database", label: "Internal database", effectMath: { int: 2 } },
  { id: "sensor-array", label: "Sensor array", effectMath: { per: 2 } },
  { id: "targeting-hud", label: "Targeting HUD", effectMath: {} }
];

export const PA_MISC_MODS_TORSO: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "jetpack", label: "Jet pack", effectMath: {} },
  { id: "emergency-protocols", label: "Emergency protocols", effectMath: { dr: 15 } },
  { id: "core-assembly", label: "Core assembly", effectMath: { apRegen: 0.15 } },
  { id: "kinetic-dynamo", label: "Kinetic dynamo", effectMath: { apRegen: 0.05 } },
  { id: "blood-cleanser", label: "Blood cleanser", effectMath: {} }
];

export const PA_MISC_MODS_ARMS: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "optimized-bracers", label: "Optimized bracers", effectMath: {} },
  { id: "rusty-knuckles", label: "Rusty knuckles", effectMath: {} },
  { id: "hydraulic-bracers", label: "Hydraulic bracers", effectMath: {} }
];

export const PA_MISC_MODS_LEGS: ArmorPieceModOption[] = [
  { id: "none", label: "None", effectMath: {} },
  { id: "calibrated-shocks", label: "Calibrated shocks", effectMath: { carryWeight: 50 } },
  { id: "kinetic-servos", label: "Kinetic servos", effectMath: { apRegen: 0.1 } },
  { id: "optimized-servos", label: "Optimized servos", effectMath: {} }
];

/**
 * Armor sets whose **chest** can take a jet pack misc mod in FO76 (Secret Service, Recon, Civil Engineer, scout lines).
 * Power armor torsos use the same jet pack row via `listArmorMiscModOptions(..., { powerArmorTorso: true })`.
 */
export const ARMOR_SET_KEYS_WITH_CHEST_JETPACK = new Set([
  "secret-service",
  "civil-engineer",
  "bos-recon",
  "covert-scout",
  "urban-scout",
  "forest-scout"
]);

/** Chest-only jet pack (no sandbox stat bump — mobility slot). */
export const ARMOR_MISC_MOD_JETPACK: ArmorPieceModOption = {
  id: "jetpack",
  label: "Jet pack",
  effectMath: {}
};

/** `pieceIndex` matches `ARMOR_SET_SLOT_LABELS` (0 = chest). */
export function chestSlotSupportsJetpack(
  armorSetKey: string | null | undefined,
  pieceIndex: number
): boolean {
  // 0 is chest for armor, 1 is torso for PA (Helmet is 0).
  // But wait, the set logic for armor uses 0=chest.
  // We'll handle PA torso specifically in listArmorMiscModOptions.
  return pieceIndex === 0 && Boolean(armorSetKey && ARMOR_SET_KEYS_WITH_CHEST_JETPACK.has(armorSetKey));
}

export type ListArmorMiscModOptionsContext = {
  /** Power armor frame selected — uses PA specific mods for each slot. */
  powerArmor?: boolean;
};

/** Misc dropdown options for one body row of a full armor set (or PA row). */
export function listArmorMiscModOptions(
  armorSetKey: string | null | undefined,
  pieceIndex: number,
  ctx?: ListArmorMiscModOptionsContext
): ArmorPieceModOption[] {
  if (ctx?.powerArmor) {
    if (pieceIndex === 0) return [...PA_MISC_MODS_HELMET];
    if (pieceIndex === 1) return [...PA_MISC_MODS_TORSO];
    if (pieceIndex === 2 || pieceIndex === 3) return [...PA_MISC_MODS_ARMS];
    if (pieceIndex === 4 || pieceIndex === 5) return [...PA_MISC_MODS_LEGS];
    return [{ id: "none", label: "None", effectMath: {} }];
  }

  const jetpackHere = chestSlotSupportsJetpack(armorSetKey, pieceIndex);
  if (!jetpackHere) {
    return [...ARMOR_MISC_MODS];
  }
  const noneOpt = ARMOR_MISC_MODS.find((o) => o.id === "none");
  const rest = ARMOR_MISC_MODS.filter((o) => o.id !== "none");
  return [noneOpt ?? ARMOR_MISC_MODS[0]!, ARMOR_MISC_MOD_JETPACK, ...rest];
}

/** Strip invalid jet pack rows (wrong set, non-chest, non–PA-torso, etc.). */
export function sanitizeArmorPieceCraftingJetpack(
  basePieceId: string,
  rows: BuilderArmorPieceCrafting[]
): BuilderArmorPieceCrafting[] {
  const key = armorSetKeyFromBasePieceId(basePieceId);
  const piece = getBaseGearPiece(basePieceId);
  const isPA = piece?.kind === "powerArmor";

  return rows.map((row, pieceIndex) => {
    if (row.miscModId !== ARMOR_MISC_MOD_JETPACK.id) return row;
    if (chestSlotSupportsJetpack(key, pieceIndex)) return row;
    if (isPA && pieceIndex === 1) return row; // Torso is index 1 in PA
    return { ...row, miscModId: "none" };
  });
}

export function findArmorMaterialMod(id: string, isPA?: boolean): ArmorPieceModOption | undefined {
  if (isPA) return PA_MATERIAL_MODS.find((o) => o.id === id);
  return ARMOR_MATERIAL_MODS.find((o) => o.id === id);
}

export function findArmorMiscMod(id: string, isPA?: boolean, pieceIndex?: number): ArmorPieceModOption | undefined {
  if (id === ARMOR_MISC_MOD_JETPACK.id) return ARMOR_MISC_MOD_JETPACK;
  if (isPA) {
    const list = listArmorMiscModOptions(undefined, pieceIndex ?? 1, { powerArmor: true });
    return list.find((o) => o.id === id);
  }
  return ARMOR_MISC_MODS.find((o) => o.id === id);
}

export function defaultArmorPieceCrafting(isPA?: boolean): BuilderArmorPieceCrafting[] {
  return Array.from({ length: isPA ? 6 : 5 }, () => ({ materialModId: "none", miscModId: "none" }));
}

/** Flatten each piece's material + misc into effect layers for `aggregateEffectMath`. */
export function armorCraftingEffectLayers(
  rows: BuilderArmorPieceCrafting[],
  isPA?: boolean
): Record<string, number>[] {
  const layers: Record<string, number>[] = [];
  rows.forEach((row, pieceIndex) => {
    const mat = findArmorMaterialMod(row.materialModId, isPA);
    const misc = findArmorMiscMod(row.miscModId, isPA, pieceIndex);
    if (mat?.effectMath && Object.keys(mat.effectMath).length) layers.push(mat.effectMath);
    if (misc?.effectMath && Object.keys(misc.effectMath).length) layers.push(misc.effectMath);
  });
  return layers;
}
