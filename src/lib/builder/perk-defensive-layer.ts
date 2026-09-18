export interface EquippedPerkCardItem {
  cardId: string;
  rank: number;
}

export type PerkDeckDefensiveResult = Record<string, number> & {
  dr: number;
  er: number;
  fr: number;
  pr: number;
  rr: number;
};

export interface PerkDeckDefensiveOptions {
  isPowerArmor: boolean;
  strVal?: number;
  agiVal?: number;
}

export function calculatePerkDeckDefensiveLayer(
  equippedPerkCards: EquippedPerkCardItem[] | null | undefined,
  options: PerkDeckDefensiveOptions
): PerkDeckDefensiveResult | null {
  if (!equippedPerkCards || equippedPerkCards.length === 0) return null;
  try {
    let dr = 0;
    let er = 0;
    let fr = 0;
    const pr = 0;
    let rr = 0;

    const { isPowerArmor, strVal = 1, agiVal = 1 } = options;

    // Lone Wanderer (Patch 70 "The Slasher", 2026-09-15): the solo bonus is now
    // CHA-scaled damage reduction against ALL damage types (plus AP Regen), not a
    // flat Resistance value. Damage reduction is a post-mitigation multiplier and
    // the per-CHA coefficient is not published, so it is intentionally NOT folded
    // into the DR/ER/FR/PR/RR totals below.

    for (const card of equippedPerkCards) {
      const id = (card.cardId || "").toLowerCase();
      const rank = card.rank || 1;

      if (id === "ironclad" && !isPowerArmor) {
        dr += rank * 10;
        er += rank * 10;
      } else if (id === "barbarian" && !isPowerArmor) {
        const mult = rank === 1 ? 2 : rank === 2 ? 3 : 4;
        dr += Math.min(80, strVal * mult);
      } else if (id === "evasive" && !isPowerArmor) {
        const mult = rank === 1 ? 1 : rank === 2 ? 2 : 3;
        const bonus = Math.min(45, agiVal * mult);
        dr += bonus;
        er += bonus;
      } else if (id === "refractor") {
        er += rank * 10;
      } else if (id === "fireproof") {
        fr += rank * 15;
      } else if (id === "rad-resistant" || id === "radresistant") {
        rr += rank * 10;
      } else if (id === "junk-shield" && !isPowerArmor) {
        dr += rank * 10;
        er += rank * 10;
      } else if (id === "bodyguards") {
        const perMember = rank === 1 ? 6 : rank === 2 ? 8 : rank === 3 ? 10 : 12;
        dr += perMember * 3;
        er += perMember * 3;
      }
    }

    return { dr, er, fr, pr, rr };
  } catch {
    return null;
  }
}
