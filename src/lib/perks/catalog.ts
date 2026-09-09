import rawPerkCards from "@/data/perk-cards.json";

export type SpecialCategory = "S" | "P" | "E" | "C" | "I" | "A" | "L" | "LEGENDARY";

export type PerkRank = {
  rank: number;
  cost: number;
  description: string;
  imageUrl?: string;
};

export interface OutdatedPerkMeta {
  isOutdated: true;
  replacedBy: {
    id: string;
    name: string;
    special: SpecialCategory;
    href?: string;
  };
  reason: string;
  patchVersion: string;
  legacyEffect?: string;
  href?: string;
}

export interface ReworkedPerkMeta {
  formerName: string;
  formerId: string;
  patchVersion: string;
  summary: string;
}

export type PerkCard = {
  id: string;
  name: string;
  special: SpecialCategory;
  minLevel: number;
  maxRank: number;
  imageUrl: string;
  ranks: PerkRank[];
  isOutdated?: boolean;
  outdatedMeta?: OutdatedPerkMeta;
  reworkedFrom?: ReworkedPerkMeta;
};


export const GHOUL_PERK_IDS = new Set([
  "action-ghoul",
  "action-diet",
  "arms-of-steel",
  "battle-genes",
  "bomb-scientist",
  "bone-shatterer",
  "breathe-it-in",
  "brick-wall",
  "chem-diet",
  "eye-of-the-hunter",
  "faulty-spots",
  "feral-presence",
  "feral-rage",
  "glowing-criticals",
  "glowing-gut",
  "glowing-hunter",
  "glowing-one",
  "gun-tricks",
  "hyper-reflexes",
  "jaguar-speed",
  "mad-scientist",
  "moral-support",
  "rad-specialist",
  "rad-reaver",
  "radiation-power",
  "radioactive-strength",
  "science-monster",
  "thick-skin",
  "united-ordeal",
  "wild-west-hands"
]);

export function isGhoulPerkCard(cardIdOrName?: string): boolean {
  if (!cardIdOrName) return false;
  const clean = cardIdOrName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const unhyphenated = clean.replace(/-/g, "");
  return GHOUL_PERK_IDS.has(clean) || GHOUL_PERK_IDS.has(unhyphenated);
}

/**
 * Authoritative Patch 62–69 Rework Metadata for modern replacement perks.
 */
export const REWORKED_MODERN_MAP: Record<string, ReworkedPerkMeta> = {
  "bullet-storm": {
    formerName: "Heavy Gunner",
    formerId: "heavy-gunner",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Replaced legacy flat +20% Heavy Gunner with stacking damage per 30 rounds fired.",
  },
  "tightly-wound": {
    formerName: "Expert Heavy Gunner",
    formerId: "expert-heavy-gunner",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Replaced legacy Expert Heavy Gunner with a 60% heavy weapon spin-up speed acceleration.",
  },
  "bringing-the-big-guns": {
    formerName: "Master Heavy Gunner",
    formerId: "master-heavy-gunner",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Replaced legacy Master Heavy Gunner to double the Bullet Storm stack ceiling.",
  },
  "knee-capper": {
    formerName: "Expert Slugger",
    formerId: "expert-slugger",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Replaced legacy Expert Slugger with +50% melee limb damage.",
  },
  "heavy-hitter": {
    formerName: "Master Slugger",
    formerId: "master-slugger",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Replaced legacy Master Slugger with +25% melee power attack damage.",
  },
  "slugger": {
    formerName: "Slugger (Legacy Flat Dmg)",
    formerId: "slugger",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Reworked from flat +20% damage into bonus damage (+10%/+20%/+30%) against crippled targets.",
  },
  "bullet-shield": {
    formerName: "Bullet Shield (Flat DR)",
    formerId: "bullet-shield",
    patchVersion: "Patch 64 (Burning Springs)",
    summary: "Rank 4 removed; reworked from flat DR into 5%/10%/15% projectile Deflect chance.",
  },
  "bear-arms": {
    formerName: "Bear Arms (Heavy Gun Weight)",
    formerId: "bear-arms",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Reworked from -90% heavy gun weight into +5% bash damage per Bullet Storm stack.",
  },
  "thru-hiker": {
    formerName: "Thru-hiker (Agility)",
    formerId: "thru-hiker",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Moved from Agility to Endurance; compressed from 3 ranks to 2 ranks (-45% / -90% food/drink weight).",
  },
  "portable-power": {
    formerName: "Portable Power (Legacy Weight)",
    formerId: "portable-power",
    patchVersion: "Patch 68 (The Backwoods)",
    summary: "Moved from Intelligence to Strength; reworked from PA chassis weight reduction into +10%/+20%/+30% Power Armor movement speed.",
  },
  "tormentor": {
    formerName: "Tormentor (Luck)",
    formerId: "tormentor",
    patchVersion: "Patch 60 (Gone Fission)",
    summary: "Moved from Luck to Perception; converted to a single Rank (Cost 2) perk dealing +20% damage per crippled limb your target has.",
  },
  "good-with-salt": {
    formerName: "Good with Salt (Luck)",
    formerId: "good-with-salt",
    patchVersion: "Patch 62 (CAMP Revamp)",
    summary: "Moved from Luck to Intelligence; compressed from 3 ranks to 2 ranks (-45% / -90% food spoil rate).",
  },
};

/**
 * Canonical Outdated & Removed Perks.
 * Kept in the database with isOutdated: true so search queries resolve deterministically
 * with direct hyperlinked guidance to the live replacement perks.
 */
export const LEGACY_OUTDATED_PERKS: PerkCard[] = [
  {
    id: "heavy-gunner",
    name: "Heavy Gunner",
    special: "S",
    minLevel: 30,
    maxRank: 3,
    imageUrl: "/images/in_game_cards/bullet_storm_r1.png",
    isOutdated: true,
    outdatedMeta: {
      isOutdated: true,
      href: "/perks?q=bullet-storm",
      replacedBy: {
        id: "bullet-storm",
        name: "Bullet Storm",
        special: "S",
        href: "/perks?q=bullet-storm",
      },
      reason: "Replaced in Patch 62 with the dynamic Bullet Storm stacking damage mechanic.",
      patchVersion: "Patch 62 (CAMP Revamp)",
      legacyEffect: "Non-explosive heavy guns deal +10% / +15% / +20% damage.",
    },
    ranks: [
      { rank: 1, cost: 1, description: "OUTDATED: Non-explosive heavy guns do +10% damage. (Replaced by Bullet Storm)" },
      { rank: 2, cost: 2, description: "OUTDATED: Non-explosive heavy guns do +15% damage. (Replaced by Bullet Storm)" },
      { rank: 3, cost: 3, description: "OUTDATED: Non-explosive heavy guns do +20% damage. (Replaced by Bullet Storm)" },
    ],
  },
  {
    id: "expert-heavy-gunner",
    name: "Expert Heavy Gunner",
    special: "S",
    minLevel: 40,
    maxRank: 3,
    imageUrl: "/images/in_game_cards/tightly_wound_r1.png",
    isOutdated: true,
    outdatedMeta: {
      isOutdated: true,
      href: "/perks?q=tightly-wound",
      replacedBy: {
        id: "tightly-wound",
        name: "Tightly Wound",
        special: "S",
        href: "/perks?q=tightly-wound",
      },
      reason: "Replaced in Patch 62 with Tightly Wound (spin-up speed boost).",
      patchVersion: "Patch 62 (CAMP Revamp)",
      legacyEffect: "Non-explosive heavy guns deal +10% / +15% / +20% damage.",
    },
    ranks: [
      { rank: 1, cost: 1, description: "OUTDATED: Non-explosive heavy guns do +10% damage. (Replaced by Tightly Wound)" },
      { rank: 2, cost: 2, description: "OUTDATED: Non-explosive heavy guns do +15% damage. (Replaced by Tightly Wound)" },
      { rank: 3, cost: 3, description: "OUTDATED: Non-explosive heavy guns do +20% damage. (Replaced by Tightly Wound)" },
    ],
  },
  {
    id: "master-heavy-gunner",
    name: "Master Heavy Gunner",
    special: "S",
    minLevel: 50,
    maxRank: 3,
    imageUrl: "/images/in_game_cards/bringing_the_big_guns_r1.png",
    isOutdated: true,
    outdatedMeta: {
      isOutdated: true,
      href: "/perks?q=bringing-the-big-guns",
      replacedBy: {
        id: "bringing-the-big-guns",
        name: "Bringing the Big Guns",
        special: "S",
        href: "/perks?q=bringing-the-big-guns",
      },
      reason: "Replaced in Patch 62 with Bringing the Big Guns (doubled Bullet Storm stack cap).",
      patchVersion: "Patch 62 (CAMP Revamp)",
      legacyEffect: "Non-explosive heavy guns deal +10% / +15% / +20% damage.",
    },
    ranks: [
      { rank: 1, cost: 1, description: "OUTDATED: Non-explosive heavy guns do +10% damage. (Replaced by Bringing the Big Guns)" },
      { rank: 2, cost: 2, description: "OUTDATED: Non-explosive heavy guns do +15% damage. (Replaced by Bringing the Big Guns)" },
      { rank: 3, cost: 3, description: "OUTDATED: Non-explosive heavy guns do +20% damage. (Replaced by Bringing the Big Guns)" },
    ],
  },
  {
    id: "expert-slugger",
    name: "Expert Slugger",
    special: "S",
    minLevel: 24,
    maxRank: 3,
    imageUrl: "/images/in_game_cards/knee_capper_r1.png",
    isOutdated: true,
    outdatedMeta: {
      isOutdated: true,
      href: "/perks?q=knee-capper",
      replacedBy: {
        id: "knee-capper",
        name: "Knee-Capper",
        special: "S",
        href: "/perks?q=knee-capper",
      },
      reason: "Replaced in Patch 62 with Knee-Capper (+50% melee limb damage).",
      patchVersion: "Patch 62 (CAMP Revamp)",
      legacyEffect: "Your two-handed melee weapons now do +10% / +15% / +20% damage.",
    },
    ranks: [
      { rank: 1, cost: 1, description: "OUTDATED: Your two-handed melee weapons do +10% damage. (Replaced by Knee-Capper)" },
      { rank: 2, cost: 2, description: "OUTDATED: Your two-handed melee weapons do +15% damage. (Replaced by Knee-Capper)" },
      { rank: 3, cost: 3, description: "OUTDATED: Your two-handed melee weapons do +20% damage. (Replaced by Knee-Capper)" },
    ],
  },
  {
    id: "master-slugger",
    name: "Master Slugger",
    special: "S",
    minLevel: 48,
    maxRank: 3,
    imageUrl: "/images/in_game_cards/heavy_hitter_r1.png",
    isOutdated: true,
    outdatedMeta: {
      isOutdated: true,
      href: "/perks?q=heavy-hitter",
      replacedBy: {
        id: "heavy-hitter",
        name: "Heavy Hitter",
        special: "S",
        href: "/perks?q=heavy-hitter",
      },
      reason: "Replaced in Patch 62 with Heavy Hitter (+25% power attack damage).",
      patchVersion: "Patch 62 (CAMP Revamp)",
      legacyEffect: "Your two-handed melee weapons now do +10% / +15% / +20% damage.",
    },
    ranks: [
      { rank: 1, cost: 1, description: "OUTDATED: Your two-handed melee weapons do +10% damage. (Replaced by Heavy Hitter)" },
      { rank: 2, cost: 2, description: "OUTDATED: Your two-handed melee weapons do +15% damage. (Replaced by Heavy Hitter)" },
      { rank: 3, cost: 3, description: "OUTDATED: Your two-handed melee weapons do +20% damage. (Replaced by Heavy Hitter)" },
    ],
  },
];

export const PERK_CATALOG: PerkCard[] = (rawPerkCards as PerkCard[])
  .map((card) => {
    const rework = REWORKED_MODERN_MAP[card.id];
    if (rework) {
      return { ...card, reworkedFrom: rework };
    }
    return card;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const PERK_MAP = new Map<string, PerkCard>(
  PERK_CATALOG.map((card) => [card.id, card])
);

const LEGACY_MAP = new Map<string, PerkCard>(
  LEGACY_OUTDATED_PERKS.map((card) => [card.id, card])
);

export function getPerkCardById(id: string): PerkCard | undefined {
  if (!id) return undefined;
  const direct = PERK_MAP.get(id);
  if (direct) return direct;

  const legacyDirect = LEGACY_MAP.get(id);
  if (legacyDirect) return legacyDirect;

  const lower = id.toLowerCase().trim();
  const slug = lower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const clean = lower.replace(/[^a-z0-9]/g, "");

  const foundInCatalog = PERK_CATALOG.find((card) => {
    const cId = card.id.toLowerCase();
    const cSlug = cId.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const cClean = cId.replace(/[^a-z0-9]/g, "");
    const cName = card.name.toLowerCase();
    return cId === lower || cSlug === slug || cClean === clean || cName === lower;
  });
  if (foundInCatalog) return foundInCatalog;

  return LEGACY_OUTDATED_PERKS.find((card) => {
    const cId = card.id.toLowerCase();
    const cSlug = cId.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const cClean = cId.replace(/[^a-z0-9]/g, "");
    const cName = card.name.toLowerCase();
    return cId === lower || cSlug === slug || cClean === clean || cName === lower;
  });
}

export function getGenderedPerkName(name: string, isFemale = false): string {
  if (!name) return name;
  const lower = name.toLowerCase().trim();
  if (isFemale) {
    if (lower === "action boy" || lower === "action-boy" || lower === "actionboy" || lower === "action girl" || lower === "action-girl" || lower === "actiongirl") return "Action Girl";
    if (lower === "aquaboy" || lower === "aqua-boy" || lower === "aquaboy-aquagirl" || lower === "aquagirl" || lower === "aqua-girl") return "Aquagirl";
    if (lower === "party boy" || lower === "party-boy" || lower === "partyboy" || lower === "party girl" || lower === "party-girl" || lower === "partygirl") return "Party Girl";
  } else {
    if (lower === "action boy" || lower === "action-boy" || lower === "actionboy" || lower === "action girl" || lower === "action-girl" || lower === "actiongirl") return "Action Boy";
    if (lower === "aquaboy" || lower === "aqua-boy" || lower === "aquaboy-aquagirl" || lower === "aquagirl" || lower === "aqua-girl") return "Aquaboy";
    if (lower === "party boy" || lower === "party-boy" || lower === "partyboy" || lower === "party girl" || lower === "party-girl" || lower === "partygirl") return "Party Boy";
  }
  return name;
}

export function searchPerkCards(query: string, rank?: number, includeOutdated = true): PerkCard[] {
  const norm = query.toLowerCase().trim();
  const source = includeOutdated ? [...PERK_CATALOG, ...LEGACY_OUTDATED_PERKS] : PERK_CATALOG;
  if (!norm) return source;

  return source.filter((card) => {
    if (!includeOutdated && card.isOutdated) return false;
    const femaleName = getGenderedPerkName(card.name, true).toLowerCase();
    const matchName = card.name.toLowerCase().includes(norm) || femaleName.includes(norm);
    const matchId = card.id.toLowerCase().includes(norm);
    const matchSpecial = card.special.toLowerCase() === norm;
    const matchFormer = card.reworkedFrom?.formerName.toLowerCase().includes(norm) || false;
    const matchLegacyEffect = card.outdatedMeta?.legacyEffect?.toLowerCase().includes(norm) || false;
    const matchRank = rank ? card.ranks.some((r) => r.rank === rank) : true;
    return (matchName || matchId || matchSpecial || matchFormer || matchLegacyEffect) && matchRank;
  }).sort((a, b) => {
    // Keep active live cards prioritized over legacy outdated cards when names tie
    if (a.isOutdated && !b.isOutdated) return 1;
    if (!a.isOutdated && b.isOutdated) return -1;
    return a.name.localeCompare(b.name);
  });
}

export function filterPerksBySpecial(special: SpecialCategory): PerkCard[] {
  return PERK_CATALOG.filter((card) => card.special === special).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function calculateSpecialCapacity(equipped: Array<{ cardId: string; rank: number }>): Record<SpecialCategory, number> {
  const capacity: Record<SpecialCategory, number> = {
    S: 0,
    P: 0,
    E: 0,
    C: 0,
    I: 0,
    A: 0,
    L: 0,
    LEGENDARY: 0
  };

  for (const item of equipped) {
    const card = getPerkCardById(item.cardId);
    if (!card) continue;
    const rankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];
    const cost = rankObj ? rankObj.cost : item.rank;
    capacity[card.special] = (capacity[card.special] || 0) + cost;
  }

  return capacity;
}

export const LEGENDARY_SPECIAL_CARD_MAP: Record<string, "S" | "P" | "E" | "C" | "I" | "A" | "L"> = {
  "legendary-strength": "S",
  "legendary-perception": "P",
  "legendary-endurance": "E",
  "legendary-charisma": "C",
  "legendary-intelligence": "I",
  "legendary-agility": "A",
  "legendary-luck": "L"
};

/**
 * Calculates the extra S.P.E.C.I.A.L. points provided by equipped Legendary S.P.E.C.I.A.L. perk cards.
 * Ranks 1, 2, 3 give +1, +2, +3; Rank 4 gives +5 points.
 */
export function calculateLegendarySpecialBonuses(
  equipped: Array<{ cardId: string; rank: number }>
): Record<"S" | "P" | "E" | "C" | "I" | "A" | "L", number> {
  const bonuses: Record<"S" | "P" | "E" | "C" | "I" | "A" | "L", number> = {
    S: 0,
    P: 0,
    E: 0,
    C: 0,
    I: 0,
    A: 0,
    L: 0
  };

  for (const item of equipped) {
    const card = getPerkCardById(item.cardId);
    if (!card || card.special !== "LEGENDARY") continue;
    const targetStat = LEGENDARY_SPECIAL_CARD_MAP[card.id] || LEGENDARY_SPECIAL_CARD_MAP[card.id.toLowerCase()];
    if (targetStat) {
      const bonus = item.rank === 4 ? 5 : item.rank;
      bonuses[targetStat] += bonus;
    }
  }

  return bonuses;
}

/**
 * Compares two equipped card lists for value equality to prevent redundant re-renders.
 */
export function areEquippedCardsEqual(
  a: Array<{ cardId?: string; id?: string; rank?: number } | string> | null | undefined,
  b: Array<{ cardId?: string; id?: string; rank?: number } | string> | null | undefined
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i];
    const itemB = b[i];
    const idA = typeof itemA === "string" ? itemA : itemA?.cardId || itemA?.id;
    const idB = typeof itemB === "string" ? itemB : itemB?.cardId || itemB?.id;
    const rankA = typeof itemA === "object" ? (itemA?.rank ?? 1) : 1;
    const rankB = typeof itemB === "object" ? (itemB?.rank ?? 1) : 1;
    if (idA !== idB || rankA !== rankB) return false;
  }
  return true;
}

