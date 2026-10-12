/**
 * Reader for the datamined Patch 70 curve tables in `src/data/truth/perk-curves-p70.json`
 * (SeventySix - Startup.ba2, build 1.7.26.13). Each curve is a list of `[x, y]` control points;
 * values between points are read linearly (standard curve-table behaviour, assumed in the pack's
 * `$comment`) and clamped to the first and last point.
 *
 * Read the curve at the real input (the live SPECIAL, health fraction, DR …): x = 15 is the
 * normal SPECIAL maximum, and the x = 100 point is only reachable with boosts. Reading the
 * x = 100 value as the SPECIAL-15 value was the bug fixed on 2026-10-12.
 */
import perkCurves from "@/data/truth/perk-curves-p70.json";

const CURVES = perkCurves.curves as unknown as Record<string, readonly (readonly [number, number])[]>;

export type PerkCurveName = keyof typeof perkCurves.curves;

/** The control points of a curve; throws on an unknown name so a typo cannot read as zero. */
export function perkCurvePoints(name: PerkCurveName): readonly (readonly [number, number])[] {
  const curve = CURVES[name];
  if (!curve || curve.length === 0) throw new Error(`perk-curves-p70.json has no curve ${String(name)}`);
  return curve;
}

/** Piecewise-linear read of `name` at `x`, clamped to the curve's first and last control point. */
export function readPerkCurve(name: PerkCurveName, x: number): number {
  const curve = perkCurvePoints(name);
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (!Number.isFinite(x) || x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < curve.length; i += 1) {
    const [x1, y1] = curve[i];
    if (x <= x1) {
      const [x0, y0] = curve[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return last[1];
}
