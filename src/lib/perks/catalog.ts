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

export const PERK_CATALOG: PerkCard[] = rawPerkCards as PerkCard[];

export function getPerkCardById(id: string): PerkCard | undefined {
  return PERK_CATALOG.find((card) => card.id === id);
}

export function searchPerkCards(query: string, rank?: number): PerkCard[] {
  const norm = query.toLowerCase().trim();
  if (!norm) return PERK_CATALOG;

  return PERK_CATALOG.filter((card) => {
    const matchName = card.name.toLowerCase().includes(norm);
    const matchId = card.id.toLowerCase().includes(norm);
    const matchSpecial = card.special.toLowerCase() === norm;
    const matchRank = rank ? card.ranks.some((r) => r.rank === rank) : true;
    return (matchName || matchId || matchSpecial) && matchRank;
  });
}

export function filterPerksBySpecial(special: SpecialCategory): PerkCard[] {
  return PERK_CATALOG.filter((card) => card.special === special);
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
