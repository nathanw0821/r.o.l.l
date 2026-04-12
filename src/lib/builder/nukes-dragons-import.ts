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
 * @see docs/nukes-dragons-url.md — URL param notes and golden tests (`npm run test`).
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

/**
 * Tokenize N&D `p` param: repeated `[SPECIAL][slotId][rankDigits]`.
 * - `slotId` is one `[a-z0-9]` character per column slot.
 * - `rankDigits` are planner-internal (often 1–3 card ranks, but URLs can carry larger markers such as `10`);
 *   we accept 1–999 and clamp when applying sandbox math.
 * - When the slot id is a digit and the next character is another SPECIAL letter (or end), N&D sometimes omits
 *   an explicit `1` rank (e.g. `l3ee1` → Luck slot `3` at rank 1, then `ee1`).
 * - Uppercase `X` + digits (e.g. `B1`, `H3`) are legendary-perk URL segments — stripped before parse.
 * - Trailing chunks that are not SPECIAL-led (e.g. mutation encodings) are skipped without failing the import.
 */
export function parseNukesDragonsPerkParam(p: string): NdParsedPerk[] {
  const raw = p.trim();
  /** Legendary perk markers in share URLs: uppercase letter + digits. */
  const stripped = raw.replace(/[A-Z]\d*/g, "");
  const str = stripped.toLowerCase();
  const out: NdParsedPerk[] = [];
  let i = 0;
  const RANK_MIN = 1;
  const RANK_MAX = 999;
  const RANK_DIGIT_CAP = 4;

  while (i < str.length) {
    const tree = str[i]!;
    if (!SPECIAL_FIRST.has(tree)) {
      i += 1;
      continue;
    }
    i += 1;
    const slot = str[i++];
    if (!slot || !/[a-z0-9]/.test(slot)) {
      throw new Error(`Invalid perk string: missing slot id after "${tree}".`);
    }
    const rankStart = i;
    let bestLen = 0;
    let bestRank = 0;
    for (let len = 1; len <= RANK_DIGIT_CAP && rankStart + len <= str.length; len++) {
      const slice = str.slice(rankStart, rankStart + len);
      if (!/^\d+$/.test(slice)) break;
      const r = Number.parseInt(slice, 10);
      if (r < RANK_MIN || r > RANK_MAX) break;
      const j = rankStart + len;
      const next = j < str.length ? str[j]! : "";
      const atEnd = j === str.length;
      const nextIsTree = SPECIAL_FIRST.has(next);
      const nextIsNonDigit = next !== "" && !/\d/.test(next);
      if (atEnd || nextIsTree || nextIsNonDigit) {
        bestLen = len;
        bestRank = r;
      }
    }
    if (bestLen === 0) {
      const next = rankStart < str.length ? str[rankStart]! : "";
      const omitRankOne =
        /[0-9]/.test(slot) && (next === "" || SPECIAL_FIRST.has(next));
      if (omitRankOne) {
        out.push({ key: `${tree}${slot}`, tree, slot, rank: 1 });
        continue;
      }
      throw new Error(`Invalid rank for "${tree}${slot}" in perk string.`);
    }
    i = rankStart + bestLen;
    out.push({ key: `${tree}${slot}`, tree, slot, rank: bestRank });
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
  const lp = u.searchParams.get("lp")?.trim();
  const ef = u.searchParams.get("ef")?.trim();
  const cd = u.searchParams.get("cd")?.trim();

  if (lp) {
    warnings.push(
      "This URL includes lp= (legendary perk row on N&D, e.g. x94…). R.O.L.L. does not parse lp= yet — those +SPECIAL / perk-point bonuses are not merged into Live totals."
    );
  }
  if (ef) {
    warnings.push(
      "This URL includes ef= (mutations, Ghoul / Glow / team switchboard state on N&D). R.O.L.L. does not decode ef= — use Character state in the builder to model mutations separately."
    );
  }
  if (cd) {
    warnings.push(
      "This URL includes cd= (extra planner / character-state packing on N&D). R.O.L.L. does not read cd= yet."
    );
  }

  if (/[A-Z]/.test(p)) {
    warnings.push(
      "Removed uppercase+digit blocks from p= (in-URL markers next to card codes, often legendary-related) before parsing; those markers are not expanded into Live totals."
    );
  }
  warnings.push(
    "Planner mutations and Class Freak / serum rules are not applied from the URL — only the compact p= card string is partially rolled up; mirror mutations in Character state if you need them in totals."
  );
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
  if (unknownCodes.length > 0) {
    warnings.push(
      `Codes listed as “not in R.O.L.L. table yet” are regular p= perk slot keys only — they are not lp= legendary perks or ef= mutations (those live in other query params).`
    );
  }

  return { layer, special, unknownCodes, warnings };
}
