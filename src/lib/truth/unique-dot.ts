/**
 * Damage-over-time innates of named unique weapons, read from the Patch 70 client data
 * (`src/data/truth/unique-innate-effects-p70.json`: the enchantments each unique's custom mod
 * applies). Nathan, 2026-10-12: apply the game-file curves and show the DoT as its own line on
 * the Combat DPS tab, never folded into the per-shot number, labelled datamined.
 *
 * Reading of the data (the truth file's own `$comment`): `magnitude` is the effect's base value;
 * when a curve is present it is the level scaling of that value (x = item level 1-50). For
 * Damage-archetype effects the magnitude is read as damage per second for `durationSeconds`.
 * Neither reading was observed in game, hence `confidence: "datamined"`.
 *
 * When a unique carries several DoT effects (The Kabloom has four: 5 and 6 base, 10/7/1/1 s,
 * two of them level-scaled), the level-scaled effect with the longest duration is used and the
 * others are counted in `variantsIgnored`; their in-game conditions are not decoded.
 */

import innateTruth from "@/data/truth/unique-innate-effects-p70.json";

export type UniqueDotDamageType = "fire" | "poison" | "bleed";

export type UniqueDot = {
  /** Unique id (unique-items.json / builder id). */
  uniqueId: string;
  uniqueName: string;
  damageType: UniqueDotDamageType;
  /** "Burn", "Poison" or "Bleed". */
  label: string;
  /** Damage per second at `itemLevel`. */
  perSecond: number;
  durationSeconds: number;
  /** perSecond × durationSeconds. */
  total: number;
  itemLevel: number;
  /** Client effect and curve names, for the tooltip. */
  effect: string;
  curve: string | null;
  /** Other DoT effects on the same unique that were not used (see the module comment). */
  variantsIgnored: number;
  confidence: "datamined";
  source: string;
};

type RawEffect = {
  effect: string;
  magnitude: number | null;
  durationSeconds: number | null;
  curve?: { name: string; points: [number, number][] | null };
};
type RawUnique = { name: string; enchantments: { enchantment: string; effects: RawEffect[] }[] };

const UNIQUES = (innateTruth as unknown as { uniques: Record<string, RawUnique> }).uniques;

const DOT_EFFECT = /^dt(Poison|Fire)|DamageHealthContact|(Fire|Poison|Bleed)(Damage)?Effect$/i;

function damageTypeOf(effect: string, enchantment: string): UniqueDotDamageType | null {
  const text = `${effect} ${enchantment}`;
  if (/poison/i.test(text)) return "poison";
  if (/fire|flame|burn/i.test(text)) return "fire";
  if (/bleed|DamageHealthContact/i.test(text)) return "bleed";
  return null;
}

const LABEL: Record<UniqueDotDamageType, string> = { fire: "Burn", poison: "Poison", bleed: "Bleed" };

/** Linear interpolation on a level curve, clamped to its ends. */
export function readLevelCurve(points: readonly [number, number][], level: number): number {
  if (points.length === 0) return 0;
  if (level <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    if (level <= x1) {
      const [x0, y0] = points[i - 1];
      return y0 + ((y1 - y0) * (level - x0)) / (x1 - x0);
    }
  }
  return points[points.length - 1][1];
}

/** The unique's datamined DoT at the given item level, or null when it has none. */
export function getUniqueDot(uniqueId: string, itemLevel: number): UniqueDot | null {
  const entry = UNIQUES[uniqueId];
  if (!entry) return null;
  const candidates: { effect: RawEffect; enchantment: string; type: UniqueDotDamageType }[] = [];
  for (const ench of entry.enchantments) {
    for (const effect of ench.effects) {
      if (!DOT_EFFECT.test(effect.effect) || !(effect.durationSeconds && effect.durationSeconds > 0)) continue;
      const type = damageTypeOf(effect.effect, ench.enchantment);
      if (type) candidates.push({ effect, enchantment: ench.enchantment, type });
    }
  }
  if (candidates.length === 0) return null;
  const scaled = candidates.filter((c) => c.effect.curve?.points?.length);
  const pool = scaled.length > 0 ? scaled : candidates;
  const chosen = pool.reduce((best, c) =>
    (c.effect.durationSeconds ?? 0) > (best.effect.durationSeconds ?? 0) ? c : best
  );
  const points = chosen.effect.curve?.points ?? null;
  const perSecond = Math.round(points ? readLevelCurve(points, itemLevel) : chosen.effect.magnitude ?? 0);
  if (perSecond <= 0) return null;
  const durationSeconds = chosen.effect.durationSeconds ?? 0;
  return {
    uniqueId,
    uniqueName: entry.name,
    damageType: chosen.type,
    label: LABEL[chosen.type],
    perSecond,
    durationSeconds,
    total: perSecond * durationSeconds,
    itemLevel,
    effect: chosen.effect.effect,
    curve: chosen.effect.curve?.name ?? null,
    variantsIgnored: candidates.length - 1,
    confidence: "datamined",
    source: "unique-innate-effects-p70.json (SeventySix.esm 2026-09-16)",
  };
}
