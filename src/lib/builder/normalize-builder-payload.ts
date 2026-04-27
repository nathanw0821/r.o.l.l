import { basePieceIdForArmorSet } from "@/lib/builder/armor-sets";
import { defaultArmorPieceCrafting, sanitizeArmorPieceCraftingJetpack } from "@/lib/builder/armor-piece-mods";
import { canonicalBasePieceId, getBaseGearPiece, isPowerArmorHelmetBasePiece } from "@/lib/builder/base-gear";
import {
  isKnownPowerArmorHelmetPieceId,
  sanitizePowerArmorPiecesEquipped
} from "@/lib/builder/power-armor-stats";
import { sanitizeSandboxMutationIds } from "@/lib/builder/sandbox-mutations";
import type {
  BuilderArmorPieceCrafting,
  BuilderPayload,
  BuilderPowerArmorHelmetCrafting,
  BuilderUnderarmor
} from "@/lib/builder/types";

const STAR_SLOTS = 4;
const EMPTY_STAR_ROW: (string | null)[] = Array.from({ length: STAR_SLOTS }, () => null);

export function emptyArmorLegendaryGrid(isPA?: boolean): (string | null)[][] {
  const count = isPA ? 6 : 5;
  return Array.from({ length: count }, () => [...EMPTY_STAR_ROW]);
}

function padLegendaryRow(row: unknown): (string | null)[] {
  const arr = Array.isArray(row) ? row : [];
  const out = [...EMPTY_STAR_ROW];
  for (let i = 0; i < STAR_SLOTS; i++) {
    const v = arr[i];
    out[i] = typeof v === "string" ? v : null;
  }
  return out;
}

function padArmorGrid(raw: unknown, isPA?: boolean): (string | null)[][] {
  const grid = emptyArmorLegendaryGrid(isPA);
  if (!Array.isArray(raw)) return grid;
  const count = isPA ? 6 : 5;
  for (let p = 0; p < count; p++) {
    grid[p] = padLegendaryRow(raw[p]);
  }
  return grid;
}

/**
 * v3 and earlier stored rows as: LL, RL, LA, RA, chest.
 * v4 canonical order: chest, LA, RA, LL, RL (see `ARMOR_SET_SLOT_LABELS`).
 */
const LEGACY_ROW_INDEX_TO_V4 = [4, 2, 3, 0, 1] as const;

function remapArmorSlotsFromLegacyLegsFirst(
  grid: (string | null)[][],
  crafting: BuilderArmorPieceCrafting[]
): { armorLegendaryModIds: (string | null)[][]; armorPieceCrafting: BuilderArmorPieceCrafting[] } {
  return {
    armorLegendaryModIds: LEGACY_ROW_INDEX_TO_V4.map((legacyIdx) => [...grid[legacyIdx]!]),
    armorPieceCrafting: LEGACY_ROW_INDEX_TO_V4.map((legacyIdx) => ({ ...crafting[legacyIdx]! }))
  };
}

/** Old single-piece armor ids → armor set key (mods were on legacy chest row index 4). */
const LEGACY_ARMOR_PIECE_TO_SET_KEY: Record<string, string> = {
  "ss-chest": "secret-service",
  "ss-helm": "secret-service",
  "covert-scout-leg": "covert-scout",
  "forest-scout-chest": "forest-scout",
  "urban-scout-chest": "urban-scout",
  "bos-recon-chest": "bos-recon",
  "marine-torso": "marine",
  "combat-chest": "heavy-combat",
  "leather-chest": "light-leather"
};

function isEquipmentKind(x: unknown): x is BuilderPayload["equipmentKind"] {
  return x === "armor" || x === "powerArmor" || x === "weapon" || x === "underarmor";
}

function isWeaponSub(x: unknown): x is NonNullable<BuilderPayload["weaponSub"]> {
  return x === "melee" || x === "ranged" || x === "energy";
}

function readUnderarmor(raw: Record<string, unknown>): BuilderUnderarmor {
  const u = raw.underarmor;
  if (!u || typeof u !== "object") {
    return { shellId: "casual", liningId: null, styleId: null };
  }
  const o = u as Record<string, unknown>;
  return {
    shellId: typeof o.shellId === "string" ? o.shellId : "casual",
    liningId: typeof o.liningId === "string" || o.liningId === null ? (o.liningId as string | null) : null,
    styleId: typeof o.styleId === "string" || o.styleId === null ? (o.styleId as string | null) : null
  };
}

function readArmorPieceCrafting(raw: unknown, isPA?: boolean): BuilderArmorPieceCrafting[] {
  const count = isPA ? 6 : 5;
  const base = defaultArmorPieceCrafting(isPA);
  if (!Array.isArray(raw)) return base;
  for (let i = 0; i < count; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    base[i] = {
      materialModId: typeof o.materialModId === "string" ? o.materialModId : "none",
      miscModId: typeof o.miscModId === "string" ? o.miscModId : "none"
    };
  }
  return base;
}

export function defaultPowerArmorHelmetCrafting(): BuilderPowerArmorHelmetCrafting {
  return { materialModId: "none", miscModId: "none" };
}

function readPowerArmorHelmetCrafting(raw: Record<string, unknown>): BuilderPowerArmorHelmetCrafting {
  const row = raw.powerArmorHelmetCrafting;
  if (!row || typeof row !== "object") return defaultPowerArmorHelmetCrafting();
  const o = row as Record<string, unknown>;
  return {
    materialModId: typeof o.materialModId === "string" ? o.materialModId : "none",
    miscModId: typeof o.miscModId === "string" ? o.miscModId : "none"
  };
}

function sanitizePowerArmorHelmetId(basePieceId: string, helmetId: string | null): string | null {
  const base = getBaseGearPiece(basePieceId);
  if (!base || base.kind !== "powerArmor" || isPowerArmorHelmetBasePiece(base)) return null;
  if (!helmetId || !isKnownPowerArmorHelmetPieceId(helmetId)) return null;
  return helmetId;
}

function readBaseSpecial(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const res: Record<string, number> = {};
  if (o.baseSpecial && typeof o.baseSpecial === "object") {
    const bs = o.baseSpecial as Record<string, unknown>;
    for (const [k, v] of Object.entries(bs)) {
      if (typeof v === "number") res[k] = v;
    }
  }
  return res;
}

function readLegendaryPerkIds(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.legendaryPerkIds)) {
    return o.legendaryPerkIds.filter((x): x is string => typeof x === "string");
  }
  return [];
}

function buildPayloadV5(fields: {
  basePieceId: string;
  equipmentKind: BuilderPayload["equipmentKind"];
  weaponSub: BuilderPayload["weaponSub"];
  legendaryModIds: (string | null)[];
  armorLegendaryModIds: (string | null)[][];
  armorPieceCrafting: BuilderArmorPieceCrafting[];
  powerArmorHelmetId: string | null;
  powerArmorHelmetCrafting: BuilderPowerArmorHelmetCrafting;
  powerArmorPiecesEquipped: BuilderPayload["powerArmorPiecesEquipped"];
  ghoul: boolean;
  underarmor: BuilderUnderarmor;
  mutationIds: string[];
  ignoreMutationPenalties: boolean;
  baseSpecial?: Record<string, number>;
  legendaryPerkIds?: string[];
  ndUrl?: string;
}): BuilderPayload {
  return {
    version: 5,
    basePieceId: fields.basePieceId,
    equipmentKind: fields.equipmentKind,
    weaponSub: fields.weaponSub,
    legendaryModIds: fields.legendaryModIds,
    armorLegendaryModIds: fields.armorLegendaryModIds,
    armorPieceCrafting: fields.armorPieceCrafting,
    powerArmorHelmetId: sanitizePowerArmorHelmetId(fields.basePieceId, fields.powerArmorHelmetId),
    powerArmorHelmetCrafting: fields.powerArmorHelmetCrafting,
    powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(fields.powerArmorPiecesEquipped),
    ghoul: fields.ghoul,
    underarmor: fields.underarmor,
    mutationIds: fields.mutationIds,
    ignoreMutationPenalties: fields.ignoreMutationPenalties,
    baseSpecial: fields.baseSpecial ?? {},
    legendaryPerkIds: fields.legendaryPerkIds ?? [],
    ndUrl: fields.ndUrl
  };
}

/** Accept v1–v5 JSON and return canonical v5, or null if invalid. */
export function normalizeBuilderPayload(raw: unknown): BuilderPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const version = v.version;

  if (version === 4 || version === 5) {
    if (typeof v.basePieceId !== "string") return null;
    const basePieceId = canonicalBasePieceId(v.basePieceId);
    if (!basePieceId) return null;
    if (!isEquipmentKind(v.equipmentKind)) return null;
    const weaponSub =
      v.weaponSub === null || v.weaponSub === undefined
        ? null
        : isWeaponSub(v.weaponSub)
          ? v.weaponSub
          : null;
    if (!Array.isArray(v.legendaryModIds)) return null;
    const isPA = v.equipmentKind === "powerArmor";
    const grid = padArmorGrid(v.armorLegendaryModIds, isPA);
    const crafting = sanitizeArmorPieceCraftingJetpack(
      basePieceId,
      readArmorPieceCrafting(v.armorPieceCrafting, isPA)
    );
    const helmetRaw =
      v.powerArmorHelmetId === null || v.powerArmorHelmetId === undefined
        ? null
        : typeof v.powerArmorHelmetId === "string"
          ? v.powerArmorHelmetId
          : null;
    return buildPayloadV5({
      basePieceId,
      equipmentKind: v.equipmentKind,
      weaponSub,
      legendaryModIds: padLegendaryRow(v.legendaryModIds),
      armorLegendaryModIds: grid,
      armorPieceCrafting: crafting,
      powerArmorHelmetId: helmetRaw,
      powerArmorHelmetCrafting: readPowerArmorHelmetCrafting(v),
      powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(v.powerArmorPiecesEquipped),
      ghoul: Boolean(v.ghoul),
      underarmor: readUnderarmor(v),
      mutationIds: sanitizeSandboxMutationIds(v.mutationIds),
      ignoreMutationPenalties: Boolean(v.ignoreMutationPenalties),
      baseSpecial: readBaseSpecial(v),
      legendaryPerkIds: readLegendaryPerkIds(v),
      ndUrl: typeof v.ndUrl === "string" ? v.ndUrl : undefined
    });
  }

  if (version === 2 || version === 3) {
    if (typeof v.basePieceId !== "string") return null;
    const basePieceId = canonicalBasePieceId(v.basePieceId);
    if (!basePieceId) return null;
    if (!isEquipmentKind(v.equipmentKind)) return null;
    const weaponSub =
      v.weaponSub === null || v.weaponSub === undefined
        ? null
        : isWeaponSub(v.weaponSub)
          ? v.weaponSub
          : null;
    if (!Array.isArray(v.legendaryModIds)) return null;
    const grid = padArmorGrid(v.armorLegendaryModIds);
    const crafting = sanitizeArmorPieceCraftingJetpack(
      basePieceId,
      readArmorPieceCrafting(v.armorPieceCrafting)
    );
    const remapped = remapArmorSlotsFromLegacyLegsFirst(grid, crafting);
    const helmetRaw =
      v.powerArmorHelmetId === null || v.powerArmorHelmetId === undefined
        ? null
        : typeof v.powerArmorHelmetId === "string"
          ? v.powerArmorHelmetId
          : null;
    return buildPayloadV5({
      basePieceId,
      equipmentKind: v.equipmentKind,
      weaponSub,
      legendaryModIds: padLegendaryRow(v.legendaryModIds),
      armorLegendaryModIds: remapped.armorLegendaryModIds,
      armorPieceCrafting: remapped.armorPieceCrafting,
      powerArmorHelmetId: helmetRaw,
      powerArmorHelmetCrafting: readPowerArmorHelmetCrafting(v),
      powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(v.powerArmorPiecesEquipped),
      ghoul: Boolean(v.ghoul),
      underarmor: readUnderarmor(v),
      mutationIds: sanitizeSandboxMutationIds(v.mutationIds),
      ignoreMutationPenalties: Boolean(v.ignoreMutationPenalties)
    });
  }

  if (version === 1) {
    if (typeof v.basePieceId !== "string") return null;
    if (!isEquipmentKind(v.equipmentKind)) return null;
    const weaponSub =
      v.weaponSub === null || v.weaponSub === undefined
        ? null
        : isWeaponSub(v.weaponSub)
          ? v.weaponSub
          : null;
    const legendaryModIds = padLegendaryRow(v.legendaryModIds);
    let basePieceId = v.basePieceId;
    const armorLegendaryModIds = emptyArmorLegendaryGrid();

    const legacySet = LEGACY_ARMOR_PIECE_TO_SET_KEY[basePieceId];
    if (legacySet && v.equipmentKind === "armor") {
      basePieceId = basePieceIdForArmorSet(legacySet);
      armorLegendaryModIds[4] = padLegendaryRow(legendaryModIds);
      const crafting = defaultArmorPieceCrafting();
      const remapped = remapArmorSlotsFromLegacyLegsFirst(armorLegendaryModIds, crafting);
      return buildPayloadV5({
        basePieceId,
        equipmentKind: "armor",
        weaponSub: null,
        legendaryModIds: [...EMPTY_STAR_ROW],
        armorLegendaryModIds: remapped.armorLegendaryModIds,
        armorPieceCrafting: sanitizeArmorPieceCraftingJetpack(basePieceId, remapped.armorPieceCrafting),
        powerArmorHelmetId: null,
        powerArmorHelmetCrafting: defaultPowerArmorHelmetCrafting(),
        powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(v.powerArmorPiecesEquipped),
        ghoul: Boolean(v.ghoul),
        underarmor: readUnderarmor(v),
        mutationIds: sanitizeSandboxMutationIds(v.mutationIds),
        ignoreMutationPenalties: Boolean(v.ignoreMutationPenalties)
      });
    }

    const coercedBase = canonicalBasePieceId(basePieceId) ?? basePieceId;
    if (!getBaseGearPiece(coercedBase)) return null;
    return buildPayloadV5({
      basePieceId: coercedBase,
      equipmentKind: v.equipmentKind,
      weaponSub,
      legendaryModIds,
      armorLegendaryModIds,
      armorPieceCrafting: sanitizeArmorPieceCraftingJetpack(coercedBase, defaultArmorPieceCrafting()),
      powerArmorHelmetId: null,
      powerArmorHelmetCrafting: defaultPowerArmorHelmetCrafting(),
      powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(v.powerArmorPiecesEquipped),
      ghoul: Boolean(v.ghoul),
      underarmor: readUnderarmor(v),
      mutationIds: sanitizeSandboxMutationIds(v.mutationIds),
      ignoreMutationPenalties: Boolean(v.ignoreMutationPenalties)
    });
  }

  return null;
}
