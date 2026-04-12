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
  return pieceIndex === 0 && Boolean(armorSetKey && ARMOR_SET_KEYS_WITH_CHEST_JETPACK.has(armorSetKey));
}

export type ListArmorMiscModOptionsContext = {
  /** Chest row of a power armor torso base — jet pack is a torso misc in FO76. */
  powerArmorTorso?: boolean;
};

/** Misc dropdown options for one body row of a full armor set (or PA torso row). */
export function listArmorMiscModOptions(
  armorSetKey: string | null | undefined,
  pieceIndex: number,
  ctx?: ListArmorMiscModOptionsContext
): ArmorPieceModOption[] {
  const jetpackHere =
    chestSlotSupportsJetpack(armorSetKey, pieceIndex) ||
    (Boolean(ctx?.powerArmorTorso) && pieceIndex === 0);
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
  const paTorsoJetpackOk =
    piece?.kind === "powerArmor" && piece.powerArmorSlot !== "helmet";
  return rows.map((row, pieceIndex) => {
    if (row.miscModId !== ARMOR_MISC_MOD_JETPACK.id) return row;
    if (chestSlotSupportsJetpack(key, pieceIndex)) return row;
    if (paTorsoJetpackOk && pieceIndex === 0) return row;
    return { ...row, miscModId: "none" };
  });
}

export function findArmorMaterialMod(id: string): ArmorPieceModOption | undefined {
  return ARMOR_MATERIAL_MODS.find((o) => o.id === id);
}

export function findArmorMiscMod(id: string): ArmorPieceModOption | undefined {
  if (id === ARMOR_MISC_MOD_JETPACK.id) return ARMOR_MISC_MOD_JETPACK;
  return ARMOR_MISC_MODS.find((o) => o.id === id);
}

export function defaultArmorPieceCrafting(): BuilderArmorPieceCrafting[] {
  return Array.from({ length: 5 }, () => ({ materialModId: "none", miscModId: "none" }));
}

/** Flatten each piece's material + misc into effect layers for `aggregateEffectMath`. */
export function armorCraftingEffectLayers(rows: BuilderArmorPieceCrafting[]): Record<string, number>[] {
  const layers: Record<string, number>[] = [];
  for (const row of rows) {
    const mat = findArmorMaterialMod(row.materialModId);
    const misc = findArmorMiscMod(row.miscModId);
    if (mat?.effectMath && Object.keys(mat.effectMath).length) layers.push(mat.effectMath);
    if (misc?.effectMath && Object.keys(misc.effectMath).length) layers.push(misc.effectMath);
  }
  return layers;
}
