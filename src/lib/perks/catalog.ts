import rawPerkCards from "@/data/perk-cards.json";

export type SpecialCategory = "S" | "P" | "E" | "C" | "I" | "A" | "L" | "LEGENDARY";

export type PerkRank = {
  rank: number;
  cost: number;
  description: string;
};

export type PerkCard = {
  id: string;
  name: string;
  special: SpecialCategory;
  minLevel: number;
  maxRank: number;
  imageUrl: string;
  ranks: PerkRank[];
};

export const GHOUL_PERK_IDS = new Set([
  "action-ghoul",
  "action-diet",
  "chem-diet",
  "feral-presence",
  "feral-rage",
  "glowing-criticals",
  "glowing-gut",
  "glowing-hunter",
  "glowing-one",
  "moral-support",
  "rad-specialist",
  "rad-reaver",
  "radiation-power",
  "radioactive-strength",
  "united-ordeal"
]);

export function isGhoulPerkCard(cardIdOrName?: string): boolean {
  if (!cardIdOrName) return false;
  const clean = cardIdOrName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const unhyphenated = clean.replace(/-/g, "");
  return GHOUL_PERK_IDS.has(clean) || GHOUL_PERK_IDS.has(unhyphenated);
}

export const PERK_CATALOG: PerkCard[] = (rawPerkCards as PerkCard[]).sort((a, b) =>
  a.name.localeCompare(b.name)
);

const PERK_MAP = new Map<string, PerkCard>(
  PERK_CATALOG.map((card) => [card.id, card])
);

export function getPerkCardById(id: string): PerkCard | undefined {
  if (!id) return undefined;
  const direct = PERK_MAP.get(id);
  if (direct) return direct;

  const lower = id.toLowerCase().trim();
  const slug = lower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const clean = lower.replace(/[^a-z0-9]/g, "");

  return PERK_CATALOG.find((card) => {
    const cId = card.id.toLowerCase();
    const cSlug = cId.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const cClean = cId.replace(/[^a-z0-9]/g, "");
    const cName = card.name.toLowerCase();
    return cId === lower || cSlug === slug || cClean === clean || cName === lower;
  });
}

export function getGenderedPerkName(name: string, isFemale = false): string {
  if (!isFemale || !name) return name;
  const lower = name.toLowerCase().trim();
  if (lower === "action boy" || lower === "action-boy" || lower === "actionboy") return "Action Girl";
  if (lower === "aquaboy" || lower === "aqua-boy" || lower === "aquaboy-aquagirl") return "Aquagirl";
  if (lower === "party boy" || lower === "party-boy" || lower === "partyboy") return "Party Girl";
  return name;
}

export function searchPerkCards(query: string, rank?: number): PerkCard[] {
  const norm = query.toLowerCase().trim();
  if (!norm) return PERK_CATALOG;

  return PERK_CATALOG.filter((card) => {
    const femaleName = getGenderedPerkName(card.name, true).toLowerCase();
    const matchName = card.name.toLowerCase().includes(norm) || femaleName.includes(norm);
    const matchId = card.id.toLowerCase().includes(norm);
    const matchSpecial = card.special.toLowerCase() === norm;
    const matchRank = rank ? card.ranks.some((r) => r.rank === rank) : true;
    return (matchName || matchId || matchSpecial) && matchRank;
  }).sort((a, b) => a.name.localeCompare(b.name));
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

