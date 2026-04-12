/** Underarmor / lining / style options (tunable without DB migrations). */

export type UnderarmorOption = { id: string; label: string; effectMath: Record<string, number> };

export const UNDERARMOR_SHELLS: UnderarmorOption[] = [
  { id: "casual", label: "Casual underarmor", effectMath: {} },
  { id: "operative", label: "Operative underarmor", effectMath: {} },
  { id: "secret-service", label: "Secret Service underarmor", effectMath: { dr: 4, er: 6, rr: 0 } },
  { id: "raider", label: "Raider skivvies", effectMath: { dr: 2, er: 1 } },
  { id: "marine", label: "Marine wetsuit", effectMath: { dr: 3, er: 2, rr: 1 } },
  { id: "vault-suit", label: "Vault suit (jumpsuit)", effectMath: { rr: 2 } },
  { id: "military-fatigues", label: "Military fatigues", effectMath: { dr: 1, er: 1 } },
  { id: "road-leathers", label: "Road leathers", effectMath: { er: 2 } },
  { id: "long-johns", label: "Long johns", effectMath: {} },
  { id: "harness", label: "Harness", effectMath: {} },
  { id: "forest-scout", label: "Forest operative underarmor", effectMath: { dr: 2, rr: 1 } },
  { id: "civil-engineer", label: "Civil Engineer underarmor", effectMath: { er: 3, rr: 1 } }
];

/** Linings (Standard → Shielded; resist rows aligned with Backwoods underarmor table). */
export const UNDERARMOR_LININGS: UnderarmorOption[] = [
  { id: "none", label: "No lining", effectMath: {} },
  { id: "standard", label: "Standard lining", effectMath: { dr: 12, er: 12, fr: 12, cr: 12, pr: 12, rr: 12 } },
  { id: "treated", label: "Treated lining", effectMath: { dr: 6, er: 3, rr: 0 } },
  { id: "resistant", label: "Resistant lining", effectMath: { dr: 9, er: 6, rr: 0 } },
  { id: "protective", label: "Protective lining", effectMath: { dr: 10, er: 10, rr: 0 } },
  { id: "shielded", label: "Shielded lining", effectMath: { dr: 8, er: 8, rr: 13 } }
];

/** Style plans — `effectMath` uses str/per/end/cha/int/agi/lck; labels match those bonuses. */
export const UNDERARMOR_STYLES: UnderarmorOption[] = [
  { id: "none", label: "No style (no bonus)", effectMath: {} },
  { id: "vault-tec", label: "Vault-Tec style (+2 RR)", effectMath: { rr: 2 } },
  { id: "wasteland", label: "Wasteland style (+2 DR)", effectMath: { dr: 2 } },
  {
    id: "operative-style",
    label: "Operative style (+4 PER, +2 INT, +4 AGI)",
    effectMath: { per: 4, int: 2, agi: 4 }
  },
  {
    id: "raider-style",
    label: "Raider style (+2 PER, +3 AGI, +5 LCK)",
    effectMath: { per: 2, agi: 3, lck: 5 }
  },
  {
    id: "marine-style",
    label: "Marine style (+4 STR, +3 END, +3 AGI)",
    effectMath: { str: 4, end: 3, agi: 3 }
  },
  {
    id: "secret-service-style",
    label: "Secret Service style (+4 END, +3 PER, +3 STR)",
    effectMath: { end: 4, per: 3, str: 3 }
  },
  {
    id: "civil-engineer-style",
    label: "Civil Engineer style (+3 STR, +3 PER, +4 CHA)",
    effectMath: { str: 3, per: 3, cha: 4 }
  },
  {
    id: "vault-suit-style",
    label: "Vault suit style (+2 END, +5 INT, +3 LCK)",
    effectMath: { end: 2, int: 5, lck: 3 }
  }
];

export function findUnderarmorOption(
  list: UnderarmorOption[],
  id: string | null | undefined
): UnderarmorOption | undefined {
  if (!id) return undefined;
  return list.find((item) => item.id === id);
}
