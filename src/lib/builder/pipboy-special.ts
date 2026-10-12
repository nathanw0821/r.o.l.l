/**
 * SPECIAL as the Pip-Boy prints it. Mutation scaling leaves fractions on the real value
 * (Strange in Numbers turns Egg Head's +6 INT into +7.5; Class Freak cuts its -3 STR to -2.25,
 * -1.5 or -0.75), and the engine keeps that exact value for everything derived from it. The
 * in-game stat sheet shows whole numbers only, so readouts drop the fraction the way an integer
 * cast does: toward zero. Whether the game rounds 7.5 up instead has not been observed; flip
 * this one line if it does.
 */
export function pipboySpecial(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

/** True when the real value carries a fraction the Pip-Boy would hide. */
export function hasHiddenFraction(value: number): boolean {
  return Number.isFinite(value) && value !== Math.trunc(value);
}
