/** Client ↔ API payload for the sandbox builder and shared `/l/[slug]` pages. */
export type BuilderEquipmentKind = "armor" | "powerArmor" | "weapon" | "underarmor";

export type BuilderWeaponSub = "melee" | "ranged" | "energy";

export type BuilderUnderarmor = {
  shellId: string;
  liningId: string | null;
  styleId: string | null;
};

/** Per body slot when using a full armor set (chest → arms → legs in payload order). */
export type BuilderArmorPieceCrafting = {
  materialModId: string;
  miscModId: string;
};

/** Material + misc for paired power armor helmet (torso bases only). */
export type BuilderPowerArmorHelmetCrafting = {
  materialModId: string;
  miscModId: string;
};

export type BuilderPayload = {
  version: 4;
  basePieceId: string;
  equipmentKind: BuilderEquipmentKind;
  weaponSub: BuilderWeaponSub | null;
  /**
   * Single item (weapon, power armor): four star slots (5th-star bench not modeled yet).
   * For a full armor set base, keep empty and use `armorLegendaryModIds`.
   */
  legendaryModIds: (string | null)[];
  /** Five body slots × four stars — full armor set only (20 legendary picks). */
  armorLegendaryModIds: (string | null)[][];
  /**
   * Material + misc craft choice per body slot (full armor set).
   * Ignored for non–armor-set bases; still stored as five `none` rows.
   */
  armorPieceCrafting: BuilderArmorPieceCrafting[];
  /**
   * When base is a PA torso/chest, optional helmet row for sandbox resists + helmet crafting.
   * Null when no helmet selected or when base is not a PA torso.
   */
  powerArmorHelmetId: string | null;
  powerArmorHelmetCrafting: BuilderPowerArmorHelmetCrafting;
  ghoul: boolean;
  underarmor: BuilderUnderarmor;
};

/** Matched against active tracker rows (`Effect` name + tier star); `unknown` if not found in dataset. */
export type BuilderModTrackerUnlock = "unlocked" | "locked" | "unknown";

export type BuilderModDTO = {
  id: string;
  slug: string;
  name: string;
  starRank: number;
  category: string;
  subCategory: string | null;
  description: string;
  effectMath: Record<string, unknown>;
  craftingCost: Record<string, unknown>;
  allowedOnPowerArmor: boolean;
  allowedOnArmor: boolean;
  allowedOnWeapon: boolean;
  infestationOnly: boolean;
  fifthStarEligible: boolean;
  ghoulSpecialCap: number | null;
  trackerUnlock: BuilderModTrackerUnlock;
};
