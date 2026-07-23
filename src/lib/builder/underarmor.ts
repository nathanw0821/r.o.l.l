/** Underarmor / lining / style options (Patch 66 SPECIAL system aligned). */

export type UnderarmorOption = { id: string; label: string; effectMath: Record<string, number> };

/** Base Underarmor Shells (Cosmetic Base Items). */
export const UNDERARMOR_SHELLS: UnderarmorOption[] = [
  { id: "casual", label: "Casual underarmor (Cosmetic)", effectMath: {} },
  { id: "operative", label: "Operative underarmor (Cosmetic)", effectMath: {} },
  { id: "secret-service", label: "Secret Service underarmor (Cosmetic)", effectMath: {} },
  { id: "raider", label: "Raider skivvies (Cosmetic)", effectMath: {} },
  { id: "marine", label: "Marine wetsuit (Cosmetic)", effectMath: {} },
  { id: "vault-suit", label: "Vault suit (Cosmetic)", effectMath: {} },
  { id: "bos", label: "Brotherhood of Steel underarmor (Cosmetic)", effectMath: {} },
  { id: "military-fatigues", label: "Military fatigues (Cosmetic)", effectMath: {} },
  { id: "road-leathers", label: "Road leathers (Cosmetic)", effectMath: {} },
  { id: "long-johns", label: "Long johns (Cosmetic)", effectMath: {} },
  { id: "harness", label: "Harness (Cosmetic)", effectMath: {} },
  { id: "forest-scout", label: "Forest operative underarmor (Cosmetic)", effectMath: {} },
  { id: "civil-engineer", label: "Civil Engineer underarmor (Cosmetic)", effectMath: {} }
];

/** Linings (Standard → Shielded; determines DR/ER/FR/CR/PR/RR resistances per Patch 66 table). */
export const UNDERARMOR_LININGS: UnderarmorOption[] = [
  { id: "none", label: "No lining (0 resists)", effectMath: {} },
  { id: "standard", label: "Standard lining (+12 DR/ER/FR/CR/PR/RR)", effectMath: { dr: 12, er: 12, fr: 12, cr: 12, pr: 12, rr: 12 } },
  { id: "treated", label: "Treated lining (+10 DR/ER, +15 FR/CR, +48 PR, +6 RR)", effectMath: { dr: 10, er: 10, fr: 15, cr: 15, pr: 48, rr: 6 } },
  { id: "resistant", label: "Resistant lining (+6 DR, +10 ER, +31 FR/CR, +15 PR, +10 RR)", effectMath: { dr: 6, er: 10, fr: 31, cr: 31, pr: 15, rr: 10 } },
  { id: "protective", label: "Protective lining (+48 DR, +23 ER, +10 FR/CR/PR/RR)", effectMath: { dr: 48, er: 23, fr: 10, cr: 10, pr: 10, rr: 10 } },
  { id: "shielded", label: "Shielded lining (+23 DR, +31 ER, +6 FR/CR/PR, +48 RR)", effectMath: { dr: 23, er: 31, fr: 6, cr: 6, pr: 6, rr: 48 } }
];

/** Underarmor Styles (Determines SPECIAL point bonuses per Patch 66 bonus system). */
export const UNDERARMOR_STYLES: UnderarmorOption[] = [
  { id: "none", label: "No style (no SPECIAL bonus)", effectMath: {} },
  {
    id: "bos-style",
    label: "BoS Underarmor Style (+4 STR, +3 END, +3 INT)",
    effectMath: { str: 4, end: 3, int: 3 }
  },
  {
    id: "casual-style",
    label: "Casual Underarmor Style (+5 CHA, +3 INT, +2 LCK)",
    effectMath: { cha: 5, int: 3, lck: 2 }
  },
  {
    id: "civil-engineer-style",
    label: "Civil Engineer Underarmor Style (+3 STR, +3 PER, +4 CHA)",
    effectMath: { str: 3, per: 3, cha: 4 }
  },
  {
    id: "marine-style",
    label: "Marine Underarmor Style (+4 STR, +3 END, +3 AGI)",
    effectMath: { str: 4, end: 3, agi: 3 }
  },
  {
    id: "operative-style",
    label: "Operative Underarmor Style (+4 PER, +2 INT, +4 AGI)",
    effectMath: { per: 4, int: 2, agi: 4 }
  },
  {
    id: "raider-style",
    label: "Raider Underarmor Style (+2 PER, +3 AGI, +5 LCK)",
    effectMath: { per: 2, agi: 3, lck: 5 }
  },
  {
    id: "secret-service-style",
    label: "Secret Service Underarmor Style (+4 END, +3 PER, +3 STR)",
    effectMath: { end: 4, per: 3, str: 3 }
  },
  {
    id: "vault-suit-style",
    label: "Vault Suit Underarmor Style (+2 END, +5 INT, +3 LCK)",
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
