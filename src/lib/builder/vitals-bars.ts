/**
 * Widths for the Biometrics vitals bars.
 *
 * Human: one bar. Rads cap the usable health pool from the right (the Bloodied threshold), so
 * HP and rads share a 0–100 scale and the rads segment eats into it.
 *
 * Ghoul: two bars. The Glow overshield is radiation converted into a separate pool on top of
 * health, not a cap on it, so it gets its own 0–100 bar above HP instead of the old single bar
 * that appended glow to the right of HP and clipped it (60 % HP + 60 % glow showed 40 % glow).
 */
export type VitalsBarModel =
  | { kind: "human"; hpPct: number; usableHpPct: number; radsPct: number }
  | { kind: "ghoul"; hpPct: number; glowPct: number };

const clampPct = (n: number | null | undefined, min = 0) =>
  Math.max(min, Math.min(100, Number.isFinite(n as number) ? (n as number) : 0));

export function vitalsBarModel(input: {
  isGhoul: boolean;
  healthPct: number;
  radsPct?: number | null;
  glowPct?: number | null;
}): VitalsBarModel {
  const hpPct = clampPct(input.healthPct, 5);
  if (input.isGhoul) {
    return { kind: "ghoul", hpPct, glowPct: clampPct(input.glowPct) };
  }
  const radsPct = clampPct(input.radsPct);
  return {
    kind: "human",
    hpPct,
    usableHpPct: Math.min(hpPct, Math.max(5, 100 - radsPct)),
    radsPct,
  };
}
