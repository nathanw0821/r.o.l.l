/**
 * Parse Nukes & Dragons Fallout 76 character planner URLs and roll up a small
 * subset of perk effects into sandbox `effectMath`-shaped layers.
 *
 * URL format (v2): `https://nukesdragons.com/fallout-76/character?p=...&s=...&v=2`
 * - `p` — compact perk list: repeated tokens of `[SPECIAL letter][slot id][rank digits]`
 *   where SPECIAL ∈ s,p,e,c,i,a,l and slot id is one `[a-z0-9]` character.
 * - `s` — seven hex digits for allocated S.P.E.C.I.A.L. (1–15 each), used for a few scaled perks.
 *
 * Effects are approximations for the R.O.L.L. sandbox (not a full FO76 sim).
 * @see https://nukesdragons.com/fallout-76/character
 */

const ND_HOSTS = new Set(["nukesdragons.com", "www.nukesdragons.com"]);

function num(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

const SPECIAL_FIRST = new Set(["s", "p", "e", "c", "i", "a", "l"]);

export type NdSpecialSpread = {
  str: number;
  per: number;
  end: number;
  cha: number;
  int: number;
  agi: number;
  lck: number;
};

export type NdParsedPerk = { key: string; tree: string; slot: string; rank: number };

export type NdImportResult = {
  /** Flat numeric layer merged into `aggregateEffectMath` `extraLayers`. */
  layer: Record<string, number>;
  /** Parsed S.P.E.C.I.A.L. from `s=` (hex digits), when present. */
  special: NdSpecialSpread | null;
  /** Perk tokens from `p=` with no modeled sandbox row yet. */
  unknownCodes: string[];
  /** Human-readable notes (scaling caveats, parse quirks). */
  warnings: string[];
};

type NdPerkCtx = { rank: number; s: NdSpecialSpread };

type NdPerkDef = (ctx: NdPerkCtx) => Record<string, number>;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** In-game perk ranks cap at 3; planner URLs may carry larger markers — clamp for sandbox math. */
function cardRank(rank: number) {
  return clamp(rank, 1, 3);
}

/** Per-code handlers; keys match `tree + slot` from the compact `p` string. */
const ND_PERK_TABLE: Record<string, NdPerkDef> = {
  // Strength — weight / DR (rough sandbox)
  sb: ({ rank }) => ({ carryWeight: 8 * cardRank(rank) }),
  sa: ({ rank }) => ({ carryWeight: 10 * cardRank(rank) }),
  sv: ({ rank, s }) => ({ carryWeight: Math.round((8 + s.str * 1.1) * cardRank(rank)) }),
  s7: ({ rank, s }) => {
    const r = cardRank(rank);
    return {
      dr: Math.round(0.8 * s.str * r),
      er: Math.round(0.4 * s.str * r)
    };
  },
  // Perception — mostly QOL; small VATS proxy for Concentrated Fire
  p0: () => ({}),
  pb: ({ rank }) => ({ damagePct: 0.01 * cardRank(rank) }),
  // Endurance
  ep: ({ rank }) => ({ rr: 6 * cardRank(rank) }),
  ew: ({ rank }) => ({ hp: 2 * cardRank(rank) }),
  e0: ({ rank }) => ({ rr: 8 * cardRank(rank) }),
  eo: ({ rank }) => ({ pr: 10 * cardRank(rank) }),
  // Charisma — Lone Wanderer solo ballpark (CHA-scaled)
  c7: ({ rank, s }) => {
    const r = cardRank(rank);
    const cha = clamp(s.cha, 1, 15);
    const dr = Math.round((6 + cha * 1.2) * r);
    const er = dr;
    const apRegen = 0.008 * cha * r;
    return { dr, er, apRegen };
  },
  cf: () => ({}),
  c9: () => ({}),
  cq: () => ({}),
  co: () => ({}),
  // Intelligence
  i1: ({ rank, s }) => ({ hp: Math.round(4 + s.int * 0.6) * cardRank(rank) }),
  ii: () => ({}),
  iq: () => ({}),
  ik: () => ({}),
  // Agility
  at: ({ rank }) => ({ damagePct: 0.02 * cardRank(rank) }),
  a6: () => ({}),
  // Luck
  ln: () => ({}),
  l9: ({ rank, s }) => ({ apRegen: 0.04 * clamp(s.lck, 1, 15) * cardRank(rank) }),
  l1: () => ({})
};

function parseSpecialFromParam(s: string | null): NdSpecialSpread | null {
  if (!s || s.length !== 7) return null;
  const digits = s.toLowerCase();
  if (!/^[0-9a-f]{7}$/.test(digits)) return null;
  const vals = [...digits].map((ch) => {
    const v = Number.parseInt(ch, 16);
    return Number.isFinite(v) ? v : 0;
  });
  return {
    str: vals[0] ?? 1,
    per: vals[1] ?? 1,
    end: vals[2] ?? 1,
    cha: vals[3] ?? 1,
    int: vals[4] ?? 1,
    agi: vals[5] ?? 1,
    lck: vals[6] ?? 1
  };
}

/** Tokenize N&D `p` param: `[spe][slotId][rank]` */
export function parseNukesDragonsPerkParam(p: string): NdParsedPerk[] {
  const out: NdParsedPerk[] = [];
  let i = 0;
  const str = p.trim().toLowerCase();
  while (i < str.length) {
    const tree = str[i++]!;
    if (!SPECIAL_FIRST.has(tree)) {
      throw new Error(`Invalid perk string near "${str.slice(Math.max(0, i - 4), i + 4)}" (expected S.P.E.C.I.A.L. letter).`);
    }
    const slot = str[i++];
    if (!slot || !/[a-z0-9]/.test(slot)) {
      throw new Error(`Invalid perk string: missing slot id after "${tree}".`);
    }
    let rank = 0;
    let digits = 0;
    while (i < str.length && /\d/.test(str[i]!)) {
      rank = rank * 10 + (str.charCodeAt(i) - 48);
      i += 1;
      digits += 1;
    }
    if (digits === 0 || rank < 1 || rank > 6) {
      throw new Error(`Invalid rank for "${tree}${slot}" in perk string.`);
    }
    const key = `${tree}${slot}`;
    out.push({ key, tree, slot, rank });
  }
  return out;
}

export function isNukesDragonsFo76CharacterUrl(raw: string): boolean {
  const t = raw.trim();
  if (!/^https?:\/\//i.test(t)) return false;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return false;
  }
  if (!ND_HOSTS.has(u.hostname.toLowerCase())) return false;
  return u.pathname.replace(/\/+$/, "") === "/fallout-76/character";
}

export function importNukesDragonsFo76CharacterUrl(raw: string): NdImportResult | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Paste a Nukes & Dragons character URL." };
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return { error: "That does not look like a valid URL." };
  }
  if (!ND_HOSTS.has(u.hostname.toLowerCase())) {
    return { error: "Only nukesdragons.com Fallout 76 character planner links are supported." };
  }
  if (u.pathname.replace(/\/+$/, "") !== "/fallout-76/character") {
    return { error: "Use the Fallout 76 character planner URL (/fallout-76/character)." };
  }

  const p = u.searchParams.get("p");
  if (!p?.trim()) {
    return { error: "That URL has no perk loadout (missing p= query). Pick perks on N&D and copy Share again." };
  }

  let parsed: NdParsedPerk[];
  try {
    parsed = parseNukesDragonsPerkParam(p);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not read the perk string (p=)." };
  }

  const special = parseSpecialFromParam(u.searchParams.get("s"));
  const warnings: string[] = [];
  if (!special) {
    warnings.push("No valid s= SPECIAL block (seven hex digits) — scaled perks use placeholder S.P.E.C.I.A.L. (all 10).");
  }
  const s = special ?? { str: 10, per: 10, end: 10, cha: 10, int: 10, agi: 10, lck: 10 };

  const layer: Record<string, number> = {};
  const unknownCodes: string[] = [];

  const add = (rec: Record<string, number>) => {
    for (const [k, v] of Object.entries(rec)) {
      if (!Number.isFinite(v) || v === 0) continue;
      layer[k] = num(layer[k]) + v;
    }
  };

  for (const row of parsed) {
    const fn = ND_PERK_TABLE[row.key];
    if (!fn) {
      unknownCodes.push(row.key);
      continue;
    }
    add(fn({ rank: row.rank, s }));
  }

  warnings.push(
    "N&D import uses a partial, approximate perk table in R.O.L.L. — verify important breakpoints on the planner site."
  );

  return { layer, special, unknownCodes, warnings };
}
