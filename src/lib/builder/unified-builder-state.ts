import type {
  BuilderArmorPieceCrafting,
  BuilderPowerArmorHelmetCrafting,
  BuilderUnderarmor,
  PowerArmorPiecesEquipped,
  BuilderEquipmentKind,
  BuilderWeaponSub,
} from "@/lib/builder/types";
import { DEFAULT_POWER_ARMOR_PIECES_EQUIPPED } from "@/lib/builder/types";

export type FoodSurvivalState =
  | "starving"
  | "hungry"
  | "content"
  | "well_fed"
  | "fully_fed";

export type ThirstSurvivalState =
  | "parched"
  | "thirsty"
  | "hydrated"
  | "well_hydrated"
  | "fully_hydrated";

export type TeamCategory =
  | "solo"
  | "casual"
  | "event"
  | "roleplay"
  | "daily_ops"
  | "exploration";

export type BiometricsCharacterState = {
  healthPct: number; // 5% to 100%
  radsPct: number; // 0 to 100% (Human)
  glowPct: number; // 0 to 100% (Ghoul Radiation Overshield)
  feralPct: number; // 0 to 100% (Ghoul Feralization Meter)
  foodState: FoodSurvivalState;
  thirstState: ThirstSurvivalState;
  teamState: TeamCategory;
  hasMutatedTeammate: boolean;
  timeOfDay: "day" | "night";
  addictionsCount: number; // 0 to 5
  adrenalineStacks: number; // 0 to 6
  furiousStacks: number; // 0 to 9
  bulletStormStacks: number; // 0 to 50
  combatStance: {
    isSneaking: boolean;
    isSprinting: boolean;
    isAiming: boolean;
    isPowerAttacking: boolean;
  };
  caps: number; // 0 to 40000
};

export type UnifiedMasterBuildState = {
  version: 1;
  // 1. Gear & Armory
  equipmentKind: BuilderEquipmentKind;
  basePieceId: string;
  weaponSub: BuilderWeaponSub | null;
  legendaryModIds: (string | null)[];
  armorPieceCrafting: BuilderArmorPieceCrafting[];
  armorLegendaryModIds: (string | null)[][];
  armorPieceSetKeys?: (string | null)[];
  powerArmorHelmetId: string | null;
  powerArmorHelmetCrafting: BuilderPowerArmorHelmetCrafting;
  powerArmorPiecesEquipped: PowerArmorPiecesEquipped;
  underarmor: BuilderUnderarmor;

  // 2. S.P.E.C.I.A.L. & Perk Deck
  specials: {
    S: number;
    P: number;
    E: number;
    C: number;
    I: number;
    A: number;
    L: number;
  };
  equippedPerkCards: { cardId: string; rank: number }[];
  legendaryPerkIds: string[];
  isGhoul: boolean;
  activePerkSlot: number;

  // 3. Vault-Tec Biometrics & Character State Panel
  characterState: BiometricsCharacterState;

  // 4. Consumables & Mutations
  mutationIds: string[];
  hasStrangeInNumbers: boolean;
  ignoreMutationPenalties: boolean;
  activeDrug: string | null;
  activeFoods: Record<string, string>;
  activeBobblehead: string | null;
  activeMagazine: string | null;
  activeAlcohol: string | null;
  activeCompanion: string | null;
  activeCampBuffs: string[];
};

export const DEFAULT_BIOMETRICS_CHARACTER_STATE: BiometricsCharacterState = {
  healthPct: 100,
  radsPct: 0,
  glowPct: 0,
  feralPct: 100,
  foodState: "fully_fed",
  thirstState: "fully_hydrated",
  teamState: "casual",
  hasMutatedTeammate: true,
  timeOfDay: "day",
  addictionsCount: 0,
  adrenalineStacks: 0,
  furiousStacks: 0,
  bulletStormStacks: 0,
  combatStance: {
    isSneaking: false,
    isSprinting: false,
    isAiming: false,
    isPowerAttacking: false,
  },
  caps: 30000,
};

export const DEFAULT_UNIFIED_MASTER_BUILD: UnifiedMasterBuildState = {
  version: 1,
  equipmentKind: "weapon",
  basePieceId: "the-fixer",
  weaponSub: "ranged",
  legendaryModIds: [null, null, null, null],
  armorPieceCrafting: [
    { materialModId: "buttressed", miscModId: "ultra-light" },
    { materialModId: "buttressed", miscModId: "ultra-light" },
    { materialModId: "buttressed", miscModId: "ultra-light" },
    { materialModId: "buttressed", miscModId: "ultra-light" },
    { materialModId: "buttressed", miscModId: "ultra-light" },
  ],
  armorLegendaryModIds: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ],
  powerArmorHelmetId: null,
  powerArmorHelmetCrafting: { materialModId: "standard", miscModId: "none" },
  powerArmorPiecesEquipped: DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  underarmor: { shellId: "shielded-secret-service", liningId: "shielded", styleId: null },

  specials: { S: 15, P: 15, E: 1, C: 4, I: 5, A: 10, L: 6 },
  equippedPerkCards: [],
  legendaryPerkIds: [],
  isGhoul: false,
  activePerkSlot: 0,

  characterState: DEFAULT_BIOMETRICS_CHARACTER_STATE,

  mutationIds: ["marsupial", "speed-demon", "herbivore"],
  hasStrangeInNumbers: true,
  ignoreMutationPenalties: false,
  activeDrug: null,
  activeFoods: {
    ap_regen: "plant-company-tea",
    crit_damage: "plant-blight-soup",
    int: "plant-brain-bombs",
    xp: "plant-cranberry-relish",
  },
  activeBobblehead: null,
  activeMagazine: null,
  activeAlcohol: null,
  activeCompanion: null,
  activeCampBuffs: [],
};

/**
 * Encodes a unified build state into a URL-safe Base64 string for URL hashes (`#b=...`).
 */
export function encodeUnifiedBuildHash(state: UnifiedMasterBuildState): string {
  try {
    const jsonStr = JSON.stringify(state);
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return encodeURIComponent(window.btoa(jsonStr));
    }
    return encodeURIComponent(Buffer.from(jsonStr, "utf-8").toString("base64"));
  } catch {
    return "";
  }
}

/**
 * Decodes a URL hash string back into a `UnifiedMasterBuildState`.
 */
export function decodeUnifiedBuildHash(hashStr: string): UnifiedMasterBuildState | null {
  if (!hashStr || typeof hashStr !== "string") return null;
  try {
    let clean = hashStr.trim();
    if (clean.startsWith("#")) clean = clean.slice(1);
    if (clean.startsWith("b=")) clean = clean.slice(2);
    clean = decodeURIComponent(clean);

    let decodedJson = "";
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      decodedJson = window.atob(clean);
    } else {
      decodedJson = Buffer.from(clean, "base64").toString("utf-8");
    }

    const parsed = JSON.parse(decodedJson);
    if (parsed && typeof parsed === "object" && parsed.specials) {
      return {
        ...DEFAULT_UNIFIED_MASTER_BUILD,
        ...parsed,
        characterState: {
          ...DEFAULT_BIOMETRICS_CHARACTER_STATE,
          ...(parsed.characterState || {}),
          combatStance: {
            ...DEFAULT_BIOMETRICS_CHARACTER_STATE.combatStance,
            ...(parsed.characterState?.combatStance || {}),
          },
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}
