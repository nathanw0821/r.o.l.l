/**
 * ☢️ Fallout 76 Deterministic Mechanics & Calculation Engine (TypeScript port)
 *
 * Reverse-engineered Creation Engine formulas for mathematically verified
 * theorycrafting. Ported 1:1 from `sovereign_vault_ui/fo76_mechanics_calculator.py`
 * (the `fo76-calc` CLI) so the Discord `/calc` command and the web builder share
 * one source of truth. Every function is pure and deterministic.
 *
 * Formulas implemented:
 * 1. Post-Patch 22 (One Wasteland) additive base vs multiplicative total damage scaling
 * 2. Multiplicative sequential armor penetration stacking (Anti-Armor, Tank Killer, mags)
 * 3. Non-linear Bethesda damage resistance (DR/ER) mitigation power curve (0.15 / 0.365)
 * 4. VATS AP cost mod multipliers and -25% Less VATS Cost (LVC)
 * 5. Critical meter fill and Luck breakpoints (Critical Savvy rank 1-3, Lucky Hit)
 */

/** Bethesda Creation Engine Game Settings (GMST). */
export const F_ARMOR_RATING_MULT = 0.15;
export const F_ARMOR_RATING_BASE = 0.365;
export const MAX_DAMAGE_MITIGATION = 0.99;
/** Engine cap on effective armor reduction. */
export const MAX_ARMOR_PENETRATION = 0.9;

/**
 * Percent of the critical meter preserved after a crit, by Critical Savvy rank
 * (the perk uses 15/30/45% less meter, so rank 3 consumes 55 and preserves 45).
 */
export const CRIT_SAVVY_METER_PRESERVED_PCT: Readonly<Record<number, number>> = {
  0: 0,
  1: 15,
  2: 30,
  3: 45
};

/** Rounds to `digits` decimal places (mirrors Python's `round(x, digits)` for these inputs). */
function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export interface EffectiveArmorResult {
  /** Remaining DR after all penetration sources. */
  effectiveDr: number;
  /** Total penetration as a percentage (0-90, engine capped). */
  totalPenetrationPct: number;
}

export interface MitigatedDamageResult {
  /** Damage actually delivered after DR curve and flat boss reduction. */
  finalDamage: number;
  /** Damage coefficient from the DR curve as a percentage (before flat reduction). */
  damageCoefficientPct: number;
}

export interface CritFrequencyResult {
  luck: number;
  critSavvyRank: number;
  fillPerShotPct: number;
  meterPreservedPct: number;
  shotsPerCritCycle: number;
  everyOtherShot: boolean;
}

/**
 * Formula 1 — Outgoing "paper" weapon damage before enemy armor.
 *
 * Post-Patch 22 rule: all standard perks, chems, mutations, and legendary primary
 * effects (Bloodied, Junkie's, Commando, Nerd Rage, Adrenal Reaction) additively
 * modify BASE damage. Only true debuffs/amplifiers (Tenderizer, Follow Through,
 * Taking One For The Team, Executioner's) multiply total damage.
 *
 *   Damage = Base * (1 + sum(additive_pct)) * prod(1 + mult_pct)
 *
 * @param baseDamage Weapon base damage.
 * @param additivePerksPct Sum of all additive bonuses, in percent (e.g. 160 for +160%).
 * @param multiplicativePerksPct Each multiplicative bonus, in percent (e.g. [40, 10]).
 */
export function calculatePaperDamage(
  baseDamage: number,
  additivePerksPct: number,
  multiplicativePerksPct: readonly number[] = []
): number {
  let damage = baseDamage * (1 + additivePerksPct / 100);
  for (const mult of multiplicativePerksPct) {
    damage *= 1 + mult / 100;
  }
  return roundTo(damage, 2);
}

/**
 * Formula 2 — Enemy's remaining effective DR after all armor penetration sources.
 *
 * Armor penetration does NOT add linearly (50% + 36% != 86%). It stacks
 * multiplicatively against remaining armor, then is capped at the engine limit:
 *
 *   Remaining_DR = Target_DR * prod(1 - source_pct)
 *   Total_Penetration = min(1 - Remaining_DR / Target_DR, 0.90)
 *
 * @param targetDr Enemy damage resistance.
 * @param penetrationSourcesPct Each penetration source, in percent (e.g. [50, 36]).
 */
export function calculateEffectiveArmor(
  targetDr: number,
  penetrationSourcesPct: readonly number[]
): EffectiveArmorResult {
  if (targetDr <= 0) {
    return { effectiveDr: 0, totalPenetrationPct: 100 };
  }

  let remainingFraction = 1;
  for (const pen of penetrationSourcesPct) {
    remainingFraction *= 1 - pen / 100;
  }

  const totalPen = Math.min(1 - remainingFraction, MAX_ARMOR_PENETRATION);
  const effectiveDr = targetDr * (1 - totalPen);

  return {
    effectiveDr: roundTo(effectiveDr, 2),
    totalPenetrationPct: roundTo(totalPen * 100, 2)
  };
}

/**
 * Formula 3 — Exact damage delivered through enemy DR using Bethesda's
 * 0.15 / 0.365 power curve.
 *
 *   R = (Damage * 0.15) / DR
 *   Factor = min(0.99, R ^ 0.365)
 *
 * Properties:
 * - When Damage == DR, Factor == 0.15 ^ 0.365 ≈ 0.5002 (50% delivered).
 * - Monotonically increasing, continuous curve from 0 to the 0.99 engine cap.
 * - Saturates smoothly at Damage >= 6.667 * DR with no discontinuity.
 *
 * @param incomingDamage Paper damage hitting the target.
 * @param effectiveDr Target DR after penetration (see {@link calculateEffectiveArmor}).
 * @param flatReductionPct Event boss flat reduction in percent (Earle 80, SBQ 70).
 */
export function calculateMitigatedDamage(
  incomingDamage: number,
  effectiveDr: number,
  flatReductionPct = 0
): MitigatedDamageResult {
  if (incomingDamage <= 0) {
    return { finalDamage: 0, damageCoefficientPct: 0 };
  }

  let coeff: number;
  if (effectiveDr <= 0) {
    coeff = MAX_DAMAGE_MITIGATION;
  } else {
    const ratio = (incomingDamage * F_ARMOR_RATING_MULT) / effectiveDr;
    coeff = Math.min(MAX_DAMAGE_MITIGATION, Math.pow(ratio, F_ARMOR_RATING_BASE));
  }

  let delivered = incomingDamage * coeff;
  if (flatReductionPct > 0) {
    delivered *= 1 - flatReductionPct / 100;
  }

  return {
    finalDamage: roundTo(delivered, 2),
    damageCoefficientPct: roundTo(coeff * 100, 2)
  };
}

/**
 * Formula 4 — VATS AP cost per shot.
 *
 * Weapon mods (Reflex sight -15%, Aligned barrel -5%, Forceful stock -5%,
 * Swift mag -5%) sum additively to reduce base AP cost (floored at 10% of base).
 * The 3rd-star legendary "25% Less VATS Action Point Cost" then multiplies the
 * modded cost by 0.75. Result is rounded to 1 decimal and never below 1 AP.
 *
 * @param baseAp Weapon base AP cost.
 * @param weaponModReductionsPct Sum of weapon mod AP reductions, in percent.
 * @param has25Lvc Whether the 25% Less VATS Cost legendary star is present.
 */
export function calculateVatsApCost(
  baseAp: number,
  weaponModReductionsPct: number,
  has25Lvc = false
): number {
  let moddedAp = baseAp * Math.max(0.1, 1 - weaponModReductionsPct / 100);
  if (has25Lvc) {
    moddedAp *= 0.75;
  }
  return roundTo(Math.max(1, moddedAp), 1);
}

/**
 * Formula 5 — Critical meter fill per shot and shots needed per critical.
 *
 *   Fill per hit = round((Luck * 1.5) + 5)   (+15 with the 3★ legendary "Lucky Hit")
 *
 * The meter is integer-valued, so fill rounds half-up to a whole percent before the
 * comparison. Meter preserved after a crit: rank 0 → 0%, rank 1 → 15%, rank 2 → 30%,
 * rank 3 → 45% (Critical Savvy uses 15/30/45% less meter). The cycle length is the
 * hits needed to refill the consumed portion, plus the crit shot itself.
 * Game-verified breakpoints: Luck 33 with Critical Savvy 3, or Luck 23 with Lucky Hit.
 *
 * @param luckStat Character Luck.
 * @param critSavvyRank Critical Savvy perk rank (0-3). Unknown ranks are treated as 3.
 * @param hasLuckyHit Whether the 3★ Lucky Hit legendary (+15 V.A.T.S. critical charge) is present.
 */
export function calculateCritFrequency(
  luckStat: number,
  critSavvyRank = 3,
  hasLuckyHit = false
): CritFrequencyResult {
  let fillPerShot = luckStat * 1.5 + 5;
  if (hasLuckyHit) {
    fillPerShot += 15;
  }
  // Round half-up (never banker's rounding) to mirror the integer meter.
  fillPerShot = Math.floor(fillPerShot + 0.5);

  const meterPreserved = CRIT_SAVVY_METER_PRESERVED_PCT[critSavvyRank] ?? 45;
  const neededAfterCrit = 100 - meterPreserved;

  // +1 for the crit shot itself
  const shotsToCrit = Math.ceil(neededAfterCrit / fillPerShot) + 1;

  return {
    luck: luckStat,
    critSavvyRank,
    fillPerShotPct: fillPerShot,
    meterPreservedPct: meterPreserved,
    shotsPerCritCycle: shotsToCrit,
    everyOtherShot: shotsToCrit <= 2
  };
}
