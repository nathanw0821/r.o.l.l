/** Client ↔ API payload for the sandbox builder and shared `/l/[slug]` pages. */
export type BuilderEquipmentKind = "armor" | "powerArmor" | "weapon" | "underarmor";

export type BuilderWeaponSub = "melee" | "ranged" | "energy" | "heavy";

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

/** Weapon innate workbench modifications (receiver, barrel, stock, magazine, sights, muzzle). */
export type BuilderWeaponInnateCrafting = {
  receiverId?: string;
  barrelId?: string;
  stockId?: string;
  magazineId?: string;
  sightId?: string;
  muzzleId?: string;
};

/** Material + misc for paired power armor helmet (torso bases only). */
export type BuilderPowerArmorHelmetCrafting = {
  materialModId: string;
  miscModId: string;
};

/** Helmet, torso, left arm, right arm, left leg, right leg — toggles flat resists + PA % DR/RR scaling. */
export type PowerArmorPiecesEquipped = readonly [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

export const DEFAULT_POWER_ARMOR_PIECES_EQUIPPED: PowerArmorPiecesEquipped = [
  true,
  true,
  true,
  true,
  true,
  true
];

export type BuilderPayload = {
  version: 5;
  basePieceId: string;
  /** Active primary weapon piece ID (e.g. 'elders-mark', 'the-dragon', 'fixer') when base is armor or PA, or matches basePieceId if base is weapon. */
  activeWeaponPieceId?: string;
  equipmentKind: BuilderEquipmentKind;
  weaponSub: BuilderWeaponSub | null;
  /**
   * Single item (weapon, power armor): four star slots (5th-star bench not modeled yet).
   * For a full armor set base, keep empty and use `armorLegendaryModIds`.
   */
  legendaryModIds: (string | null)[];
  /** Five (armor) or six (power armor) body slots × four stars — full set only. */
  armorLegendaryModIds: (string | null)[][];
  /**
   * Weapon innate workbench modifications (receiver, barrel, stock, magazine, sights, muzzle).
   */
  weaponCrafting?: BuilderWeaponInnateCrafting;
  /** Material + misc craft choice per body slot (full set).
   * 5 slots for armor sets, 6 slots for power armor (including helmet).
   */
  armorPieceCrafting: BuilderArmorPieceCrafting[];
  /** Optional individual armor set key per slot for mixed-set builds e.g. ["civil-engineer", "secret-service", "heavy-raider", "botsmith", "civil-engineer"]. */
  armorPieceSetKeys?: (string | null)[];
  /**
   * When base is a PA torso/chest, optional helmet row for sandbox resists + helmet crafting.
   * Null when no helmet selected or when base is not a PA torso.
   */
  powerArmorHelmetId: string | null;
  powerArmorHelmetCrafting: BuilderPowerArmorHelmetCrafting;
  /** Six attach points on the frame; all `true` = fully suited for resists + max PA % DR/RR. */
  powerArmorPiecesEquipped: PowerArmorPiecesEquipped;
  ghoul: boolean;
  underarmor: BuilderUnderarmor;
  /**
   * Sandbox-only mutation picks (`src/lib/builder/sandbox-mutations.ts`).
   * Not imported from Nukes & Dragons — orthogonal to N&D URL import.
   */
  mutationIds: string[];
  /** When true, only mutation “benefit” numbers apply (serum-style: no downsides). */
  ignoreMutationPenalties: boolean;
  /** Sandbox SPECIAL stats entered by user (1-15 each). */
  baseSpecial: Record<string, number>;
  /** Selected legendary perk card IDs. */
  legendaryPerkIds: string[];
  /** Equipped regular perk cards with ranks: [{ cardId: "commando", rank: 3 }, ...] */
  equippedPerkCards?: Array<{ cardId: string; rank: number }>;
  /** Biometrics & Stance switchboard settings (health %, food buffs, chems, stance) */
  switchboardState?: Record<string, unknown>;
  /** When true, mutation scaling is increased (Strange in Numbers). */
  hasStrangeInNumbers: boolean;
  /** Optional Nukes & Dragons URL if imported. */
  ndUrl?: string;
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
  extraComponent?: string | null;
  trackerUnlock: BuilderModTrackerUnlock;
};
