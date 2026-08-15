import rawNdPerkMap from "@/data/nd-perk-map.json";
import { getPerkCardById, isGhoulPerkCard } from "@/lib/perks/catalog";
import { LEGENDARY_PERK_CARDS } from "@/lib/builder/compatibility";

/**
 * 1:1 Exhaustive mapping of Nukes & Dragons 2-character perk codes to R.O.L.L. card IDs.
 * Covers all standard and Ghoul perk cards (268 total codes).
 */
export const ND_PERK_CODE_MAP: Record<string, string> = rawNdPerkMap as Record<string, string>;

/**
 * Nukes & Dragons Legendary Perk codes.
 */
export const ND_LEGENDARY_PERK_MAP: Record<string, string> = {
  xq: "what-rads",
  xp: "taking-one-for-the-team",
  xf: "blood-sacrifice",
  xm: "follow-through",
  xg: "brawling-chemist",
  xl: "far-flung-fireworks",
  xi: "detonation-contagion",
  xj: "electric-absorption",
  xn: "power-armor-reboot",
  xk: "exploding-palm",
  xh: "collateral-damage",
  xo: "retribution",
  xe: "survival-shortcut",
  x1: "funky-duds",
  x3: "sizzling-style",
  x0: "ammo-factory",
  xd: "power-sprinter",
  xa: "legendary-strength",
  x9: "legendary-perception",
  x6: "legendary-endurance",
  x5: "legendary-charisma",
  x7: "legendary-intelligence",
  x4: "legendary-agility",
  x8: "legendary-luck",
  xb: "master-infiltrator",
  x2: "hack-and-slash"
};

/**
 * Nukes & Dragons Mutation codes from 'ef=' parameter.
 */
export const ND_MUTATION_MAP: Record<string, string> = {
  Mg: "talons",
  M0: "egg-head",
  M5: "eagle-eyes",
  M3: "carnivore",
  Mh: "twisted-muscles",
  Ma: "herbivore",
  M1: "bird-bones",
  Mc: "marsupial",
  M9: "healing-factor",
  Me: "scaly-skin",
  Mf: "speed-demon",
  M7: "empath",
  M2: "adrenal-reaction",
  Mb: "herd-mentality",
  Mi: "unstable-isotope",
  M6: "electrically-charged",
  M4: "chameleon",
  Md: "plague-walker",
  M8: "grounded"
};

export type NukesDragonsParsedCard = {
  cardId: string;
  rank: number;
  name: string;
  special: string;
  isGhoul: boolean;
  cost: number;
};

export type NukesDragonsParsedLegendaryPerk = {
  id: string;
  rank: number;
  label: string;
  category: string;
};

export type NukesDragonsParsedBuild = {
  specials: {
    str: number;
    per: number;
    end: number;
    cha: number;
    int: number;
    agi: number;
    lck: number;
  };
  equippedCards: { cardId: string; rank: number }[];
  cardDetails: NukesDragonsParsedCard[];
  legendaryPerks: { id: string; rank: number }[];
  legendaryPerkDetails: NukesDragonsParsedLegendaryPerk[];
  mutations: string[];
  totalCardPoints: number;
  isGhoul: boolean;
  unknownTokens: string[];
  warnings: string[];
  rawParams: Record<string, string>;
};

/**
 * Checks if an input string looks like a Nukes & Dragons character URL or query string.
 */
export function isNukesDragonsUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const trimmed = input.trim();
  return (
    trimmed.includes("nukesdragons.com") ||
    (trimmed.includes("p=") &&
      (trimmed.includes("s=") || trimmed.includes("lp=") || trimmed.includes("ef=")))
  );
}

/**
 * Parses a Nukes & Dragons character planner URL or query string into structured R.O.L.L. data.
 */
export function parseNukesDragonsBuild(input: string): NukesDragonsParsedBuild {
  const warnings: string[] = [];
  const unknownTokens: string[] = [];
  const rawParams: Record<string, string> = {};

  let queryString = input.trim();
  if (queryString.includes("?")) {
    queryString = queryString.split("?")[1] || "";
  }

  const urlParams = new URLSearchParams(queryString);
  for (const [key, value] of urlParams.entries()) {
    rawParams[key] = value;
  }

  // 1. Parse S.P.E.C.I.A.L. (s=)
  const specials = { str: 1, per: 1, end: 1, cha: 1, int: 1, agi: 1, lck: 1 };
  const sParam = rawParams["s"];
  if (sParam && /^[0-9a-fA-F]{7}$/.test(sParam)) {
    const keys: (keyof typeof specials)[] = ["str", "per", "end", "cha", "int", "agi", "lck"];
    for (let i = 0; i < 7; i++) {
      const hexVal = parseInt(sParam[i], 16);
      specials[keys[i]] = Math.max(1, Math.min(15, isNaN(hexVal) ? 1 : hexVal));
    }
  } else if (sParam) {
    warnings.push(`Malformed SPECIAL string '${sParam}'; defaulted to base values.`);
  }

  // 2. Parse Regular Perk Cards (p=)
  const equippedCards: { cardId: string; rank: number }[] = [];
  const cardDetails: NukesDragonsParsedCard[] = [];
  const pParam = rawParams["p"];

  if (pParam) {
    let i = 0;
    while (i < pParam.length) {
      // Each token is standard 2-char code + 1-digit rank
      if (i + 3 <= pParam.length) {
        const code = pParam.slice(i, i + 2);
        const rankChar = pParam[i + 2];
        const rank = parseInt(rankChar, 10);

        if (!isNaN(rank) && rank >= 1 && rank <= 9) {
          const cardId = ND_PERK_CODE_MAP[code];
          if (cardId) {
            const cardDef = getPerkCardById(cardId);
            const clampedRank = cardDef ? Math.min(cardDef.maxRank, rank) : rank;
            equippedCards.push({ cardId, rank: clampedRank });
            cardDetails.push({
              cardId,
              rank: clampedRank,
              name: cardDef ? cardDef.name : cardId,
              special: cardDef ? cardDef.special : "S",
              isGhoul: isGhoulPerkCard(cardId),
              cost: clampedRank,
            });
          } else {
            unknownTokens.push(`${code}${rank}`);
          }
          i += 3;
          continue;
        }
      }
      i++;
    }
  }

  // 3. Parse Legendary Perks (lp=)
  const legendaryPerks: { id: string; rank: number }[] = [];
  const legendaryPerkDetails: NukesDragonsParsedLegendaryPerk[] = [];
  const lpParam = rawParams["lp"];

  if (lpParam) {
    let i = 0;
    while (i < lpParam.length) {
      if (i + 3 <= lpParam.length) {
        const code = lpParam.slice(i, i + 2);
        const rankChar = lpParam[i + 2];
        const rank = parseInt(rankChar, 10);

        if (code.startsWith("x") && !isNaN(rank) && rank >= 1 && rank <= 4) {
          const legId = ND_LEGENDARY_PERK_MAP[code];
          if (legId) {
            const def = LEGENDARY_PERK_CARDS[legId];
            legendaryPerks.push({ id: legId, rank });
            legendaryPerkDetails.push({
              id: legId,
              rank,
              label: def ? def.label : legId,
              category: def ? def.category : "utility",
            });
          } else {
            unknownTokens.push(`${code}${rank}`);
          }
          i += 3;
          continue;
        }
      }
      i++;
    }
  }

  // 4. Parse Mutations (ef=)
  const mutations: string[] = [];
  const efParam = rawParams["ef"];

  if (efParam) {
    for (let i = 0; i < efParam.length; i += 2) {
      const code = efParam.slice(i, i + 2);
      const mutId = ND_MUTATION_MAP[code];
      if (mutId && !mutations.includes(mutId)) {
        mutations.push(mutId);
      }
    }
  }

  // Calculate totals and Ghoul status
  const totalCardPoints = cardDetails.reduce((acc, c) => acc + c.cost, 0);
  const isGhoul = cardDetails.some((c) => c.isGhoul) || rawParams["cd"]?.includes("ghoul");

  if (unknownTokens.length > 0) {
    warnings.push(`Skipped ${unknownTokens.length} unmapped/deprecated card token(s): ${unknownTokens.join(", ")}`);
  }

  return {
    specials,
    equippedCards,
    cardDetails,
    legendaryPerks,
    legendaryPerkDetails,
    mutations,
    totalCardPoints,
    isGhoul: Boolean(isGhoul),
    unknownTokens,
    warnings,
    rawParams,
  };
}
