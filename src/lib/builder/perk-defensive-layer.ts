/**
 * Defensive perk deck layer (Patch 62 / 66 / 70 rules).
 *
 * Every number lives in `src/data/truth/defensive-perks.json`; nothing here is
 * hardcoded twice. Perks whose SPECIAL curve is only published as a min/max
 * range are interpolated linearly over SPECIAL 1..15 and flagged `approximate`
 * so UI strings can say so.
 *
 * Order of operations since Patch 66 (see `calculateDamageTaken`):
 *   delivered = curve(paper, DR * (1 - pen)) * PRODUCT(1 - reducer_i)
 * Evade and Deflect are a chance layer that sits before the damage maths.
 */

import defensiveTruth from "@/data/truth/defensive-perks.json";
import { calculateMitigatedDamage } from "@/lib/calculator/creation-engine-math";

export interface EquippedPerkCardItem {
  cardId: string;
  rank: number;
}

export type ResistKey = "dr" | "er" | "fr" | "cr" | "pr" | "rr";
export type SpecialKey = "str" | "per" | "end" | "cha" | "int" | "agi" | "lck";

export type PerkDeckDefensiveResult = Record<string, number> & Record<ResistKey, number>;

export type DefensiveReducerCondition =
  | "explosion"
  | "ballistic"
  | "sprinting"
  | "stationary"
  | "solo"
  | "always";

export interface DefensiveReducer {
  id: string;
  label: string;
  /** Percent of delivered damage removed (0..100). */
  pct: number;
  condition: DefensiveReducerCondition;
  /** True when the value is interpolated from a published range only. */
  approximate?: boolean;
}

export interface DefensiveProfile {
  flat: Record<ResistKey, number>;
  reducers: DefensiveReducer[];
  /** Total Evade chance in percent (0..100). */
  evadeChance: number;
  /** Total Deflect chance in percent (0..100), heavy armor / PA multiplier applied. */
  deflectChance: number;
  /** Block percentage while blocking (base + Blocker). */
  blockPct: number;
  /** Lifegiver max-HP bonus in percent. */
  maxHpPct: number;
  notes: string[];
}

export interface DefensiveProfileOptions {
  isPowerArmor: boolean;
  special?: Partial<Record<SpecialKey, number>>;
  /** Current health, 0..100. */
  healthPct?: number;
  isOnTeam?: boolean;
  /** Number of other players on the team (max 3 counts). */
  teammates?: number;
  isSprinting?: boolean;
  isStationary?: boolean;
  isFiringHeavyGun?: boolean;
  armorPieceCount?: number;
  matchingSet?: boolean;
  wearingNoArmor?: boolean;
  isOverEncumbered?: boolean;
  /** Heavy armor weight class (Deflect multiplier). Power Armor implies it. */
  isHeavyArmor?: boolean;
  /** Worn armor DR/ER that Ironclad multiplies. */
  baseArmor?: { dr: number; er: number };
  /** Legendary mod slugs on the worn armor (e.g. "vanguards", "bolstering"). */
  equippedModSlugs?: string[];
  mutationCount?: number;
  bulletStormStacks?: number;
  killStreak?: number;
  /** Junk Shield only counts while junk is carried; defaults to true. */
  holdingJunk?: boolean;
  /**
   * Innate Power Armor reduction per piece. Unverified; the truth file keeps it
   * at 0 and the UI exposes it as a toggle labelled unverified.
   */
  powerArmorInnatePct?: number;
}

/** Legacy option shape kept for `calculatePerkDeckDefensiveLayer` callers. */
export interface PerkDeckDefensiveOptions extends Omit<DefensiveProfileOptions, "special"> {
  special?: Partial<Record<SpecialKey, number>>;
  strVal?: number;
  agiVal?: number;
}

export type IncomingDamageType = "ballistic" | "energy" | "explosion";

export interface DamageTakenResult {
  /** Damage after the armor curve and the boss flat reduction, before reducers. */
  afterCurve: number;
  /** Final damage after every applicable multiplicative reducer. */
  delivered: number;
  damageCoefficientPct: number;
  appliedReducers: DefensiveReducer[];
  /** Combined multiplicative reduction of the applied reducers, in percent. */
  totalReducerPct: number;
}

type TruthPerk = {
  id: string;
  label: string;
  model: string;
  ranks: number;
  values?: number[];
  min?: number;
  max?: number;
  special?: string;
  resists?: string[];
  condition?: string;
  confidence: string;
  matchingSetMultiplier?: number;
  unarmoredMultiplier?: number;
  noPowerArmor?: boolean;
  notOverEncumbered?: boolean;
  healthBelowPct?: number;
  baseBlockPct?: number;
  maxTeammates?: number;
};

const TRUTH = defensiveTruth as unknown as {
  specialRange: { min: number; max: number };
  perks: Record<string, TruthPerk>;
  legendaryMods: Record<
    string,
    {
      id: string;
      label: string;
      model: string;
      condition?: string;
      pct?: number;
      maxPct?: number;
      fullAtHealthPct?: number;
      scaling?: string;
      perMutationPct?: number;
      basePct?: number;
      perKillStreakPct?: number;
      perPiecePct?: number;
      evadeToReductionMultiplier?: number;
      perBulletStormStackPct?: number;
      confidence: string;
    }
  >;
  evadeDeflect: {
    deflectHeavyArmorMultiplier: number;
    deflectDamageTakenPct: number;
    chanceCapPct: number;
  };
  powerArmorInnate: { perPiecePct: number };
};

export const DEFENSIVE_TRUTH = TRUTH;

const APPROX_SUFFIX = " (approx.)";

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Linear interpolation over SPECIAL 1..15. Values above 15 are capped at the
 * published ceiling because the range past 15 is unpublished.
 */
export function lerpSpecial(special: number, min: number, max: number): number {
  const { min: lo, max: hi } = TRUTH.specialRange;
  const s = clamp(Number.isFinite(special) ? special : lo, lo, hi);
  return min + ((max - min) * (s - lo)) / (hi - lo);
}

function rankValue(perk: TruthPerk, rank: number): number {
  const values = perk.values ?? [];
  if (values.length === 0) return 0;
  const idx = clamp(Math.round(rank), 1, values.length) - 1;
  return values[idx] ?? 0;
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function emptyFlat(): Record<ResistKey, number> {
  return { dr: 0, er: 0, fr: 0, cr: 0, pr: 0, rr: 0 };
}

function hasSlug(slugs: string[], needle: string): boolean {
  return slugs.some((s) => s.includes(needle));
}

export function calculateDefensiveProfile(
  equippedPerkCards: EquippedPerkCardItem[] | null | undefined,
  options: DefensiveProfileOptions,
): DefensiveProfile {
  const flat = emptyFlat();
  const reducers: DefensiveReducer[] = [];
  const notes: string[] = [];
  let evadeChance = 0;
  let deflectChance = 0;
  let blockPct = TRUTH.perks.blocker?.baseBlockPct ?? 60;
  let maxHpPct = 0;

  const {
    isPowerArmor,
    healthPct = 100,
    isOnTeam = false,
    teammates = isOnTeam ? 3 : 0,
    isSprinting = false,
    isStationary = false,
    isFiringHeavyGun = false,
    matchingSet = false,
    wearingNoArmor = false,
    isOverEncumbered = false,
    isHeavyArmor = false,
    baseArmor = { dr: 0, er: 0 },
    mutationCount = 0,
    bulletStormStacks = 0,
    killStreak = 0,
    holdingJunk = true,
    powerArmorInnatePct = TRUTH.powerArmorInnate.perPiecePct,
    armorPieceCount = isPowerArmor ? 6 : 5,
  } = options;

  const special: Record<SpecialKey, number> = {
    str: options.special?.str ?? 1,
    per: options.special?.per ?? 1,
    end: options.special?.end ?? 1,
    cha: options.special?.cha ?? 1,
    int: options.special?.int ?? 1,
    agi: options.special?.agi ?? 1,
    lck: options.special?.lck ?? 1,
  };

  const slugs = (options.equippedModSlugs ?? []).map((s) => (s || "").toLowerCase());
  // Same 0..1 vs 0..100 tolerance as the stance engine.
  const hp = clamp(healthPct > 1 ? healthPct : healthPct * 100, 0, 100);

  for (const card of equippedPerkCards ?? []) {
    const id = (card.cardId || "").toLowerCase();
    const rank = Math.max(1, card.rank || 1);
    const perk = TRUTH.perks[id];
    if (!perk) continue;
    if (perk.noPowerArmor && isPowerArmor) {
      notes.push(`${perk.label} does nothing in Power Armor`);
      continue;
    }
    const approx = perk.confidence === "approximate";
    const label = approx ? `${perk.label}${APPROX_SUFFIX}` : perk.label;

    switch (id) {
      case "ironclad": {
        let pct = rankValue(perk, rank);
        if (matchingSet) pct *= perk.matchingSetMultiplier ?? 2;
        const drBonus = Math.round((baseArmor.dr * pct) / 100);
        const erBonus = Math.round((baseArmor.er * pct) / 100);
        flat.dr += drBonus;
        flat.er += erBonus;
        notes.push(
          `Ironclad rank ${rank}: +${pct}% armor protection${matchingSet ? " (matching set, doubled)" : ""} = +${drBonus} DR, +${erBonus} ER`,
        );
        break;
      }
      case "hardy":
        reducers.push({ id, label, pct: rankValue(perk, rank), condition: "explosion" });
        break;
      case "thick-skin":
        reducers.push({ id, label, pct: rankValue(perk, rank), condition: "ballistic" });
        break;
      case "blocker": {
        const bonus = rankValue(perk, rank);
        blockPct += bonus;
        notes.push(`Blocker rank ${rank}: blocks ${blockPct}% of melee damage while blocking`);
        break;
      }
      case "barbarian": {
        let dr = Math.round(lerpSpecial(special.str, perk.min ?? 0, perk.max ?? 0));
        if (wearingNoArmor && !isPowerArmor) dr *= perk.unarmoredMultiplier ?? 2;
        flat.dr += dr;
        notes.push(`${label}: +${dr} DR from STR ${special.str}${wearingNoArmor && !isPowerArmor ? " (no armor, doubled)" : ""}`);
        break;
      }
      case "evasive": {
        if (perk.notOverEncumbered && isOverEncumbered) {
          notes.push("Evasive is off while over-encumbered");
          break;
        }
        const chance = round1(lerpSpecial(special.agi, perk.min ?? 0, perk.max ?? 0));
        evadeChance += chance;
        notes.push(`${label}: +${chance}% Evade from AGI ${special.agi}`);
        break;
      }
      case "moving-target": {
        if (!isSprinting) break;
        const chance = rankValue(perk, rank);
        evadeChance += chance;
        notes.push(`Moving Target rank ${rank}: +${chance}% Evade while sprinting`);
        break;
      }
      case "dodgy": {
        const chance = rankValue(perk, rank);
        evadeChance += chance;
        notes.push(`Dodgy: +${chance}% Evade, no cooldown (costs AP)`);
        break;
      }
      case "serendipity": {
        if (hp >= (perk.healthBelowPct ?? 30)) break;
        const chance = round1(lerpSpecial(special.lck, perk.min ?? 0, perk.max ?? 0));
        evadeChance += chance;
        notes.push(`${label}: +${chance}% Evade from LCK ${special.lck} below ${perk.healthBelowPct}% HP`);
        break;
      }
      case "ricochet": {
        const chance = round1(lerpSpecial(special.lck, perk.min ?? 0, perk.max ?? 0));
        deflectChance += chance;
        notes.push(`${label}: +${chance}% Deflect from LCK ${special.lck}`);
        break;
      }
      case "bullet-shield": {
        if (!isFiringHeavyGun) break;
        const chance = rankValue(perk, rank);
        deflectChance += chance;
        notes.push(`Bullet Shield rank ${rank}: +${chance}% Deflect for 6 s after firing a heavy gun`);
        break;
      }
      case "lone-wanderer": {
        if (isOnTeam) {
          notes.push("Lone Wanderer is off while on a team");
          break;
        }
        const pct = round1(lerpSpecial(special.cha, perk.min ?? 0, perk.max ?? 0));
        reducers.push({ id, label, pct, condition: "solo", approximate: approx });
        break;
      }
      case "bodyguards": {
        const count = Math.min(perk.maxTeammates ?? 3, Math.max(0, teammates));
        if (!isOnTeam || count === 0) break;
        const perTeammate = lerpSpecial(special.cha, perk.min ?? 0, perk.max ?? 0);
        const total = Math.round(perTeammate * count);
        flat.dr += total;
        flat.er += total;
        notes.push(`${label}: +${total} DR/ER from CHA ${special.cha} x ${count} teammate${count === 1 ? "" : "s"}`);
        break;
      }
      case "refractor": {
        const er = Math.round(lerpSpecial(special.per, perk.min ?? 0, perk.max ?? 0));
        flat.er += er;
        notes.push(`${label}: +${er} ER from PER ${special.per}`);
        break;
      }
      case "rad-resistant": {
        const rr = Math.round(lerpSpecial(special.end, perk.min ?? 0, perk.max ?? 0));
        flat.rr += rr;
        notes.push(`${label}: +${rr} rad resistance from END ${special.end}`);
        break;
      }
      case "junk-shield": {
        if (!holdingJunk) break;
        const v = Math.round(lerpSpecial(special.lck, perk.min ?? 0, perk.max ?? 0));
        flat.dr += v;
        flat.er += v;
        notes.push(`${label}: +${v} DR/ER from LCK ${special.lck} while carrying junk`);
        break;
      }
      case "lifegiver": {
        const pct = Math.round(lerpSpecial(special.end, perk.min ?? 0, perk.max ?? 0));
        maxHpPct += pct;
        notes.push(`${label}: +${pct}% max HP from END ${special.end}`);
        break;
      }
      case "nerd-rage":
        notes.push("Nerd Rage no longer grants Damage Resistance (damage and AP regen only)");
        break;
      case "tenderizer":
        notes.push("Tenderizer is offensive (+0.1% damage taken by the target per hit, to +100%)");
        break;
      default:
        break;
    }
  }

  // Legendary armor mods that act as reducers or chance layers.
  const mods = TRUTH.legendaryMods;

  if (hasSlug(slugs, "vanguard") && mods.vanguards) {
    const scale = hp / (mods.vanguards.fullAtHealthPct ?? 100);
    const pct = round1((mods.vanguards.maxPct ?? 0) * clamp(scale, 0, 1));
    if (pct > 0) reducers.push({ id: "vanguards", label: `Vanguard's${APPROX_SUFFIX}`, pct, condition: "always", approximate: true });
  }

  if (hasSlug(slugs, "bolstering") && mods.bolstering) {
    const full = mods.bolstering.fullAtHealthPct ?? 5;
    const scale = clamp((100 - hp) / (100 - full), 0, 1);
    const pct = round1((mods.bolstering.maxPct ?? 0) * scale);
    if (pct > 0) reducers.push({ id: "bolstering", label: `Bolstering${APPROX_SUFFIX}`, pct, condition: "always", approximate: true });
  }

  if (slugs.some((s) => s.includes("mutant") && !s.includes("slayer")) && mods.mutants) {
    const pct = Math.min(mods.mutants.maxPct ?? 5, mutationCount * (mods.mutants.perMutationPct ?? 1));
    if (pct > 0) reducers.push({ id: "mutants", label: "Mutant's", pct, condition: "always" });
  }

  if (hasSlug(slugs, "cavalier") && mods.cavaliers && isSprinting) {
    reducers.push({ id: "cavaliers", label: "Cavalier's", pct: mods.cavaliers.pct ?? 0, condition: "sprinting" });
  }

  if (hasSlug(slugs, "sentinel") && mods.sentinels && isStationary) {
    reducers.push({ id: "sentinels", label: "Sentinel's", pct: mods.sentinels.pct ?? 0, condition: "stationary" });
  }

  if (hasSlug(slugs, "unstoppable-monster") && mods["unstoppable-monster"]) {
    const m = mods["unstoppable-monster"];
    const pct = (m.basePct ?? 0) + Math.max(0, killStreak) * (m.perKillStreakPct ?? 0);
    reducers.push({ id: "unstoppable-monster", label: `Unstoppable Monster${APPROX_SUFFIX}`, pct, condition: "always", approximate: true });
  }

  // Exact-ish match: "hyper-reflexes" (a different effect) must not count.
  const reflexPieces = slugs.filter((s) => s === "reflex" || s.startsWith("reflex-") || s.endsWith("-reflex")).length;
  if (reflexPieces > 0 && mods.reflex) {
    const chance = reflexPieces * (mods.reflex.perPiecePct ?? 0);
    evadeChance += chance;
    notes.push(`Reflex x${reflexPieces}: +${chance}% Evade`);
  }

  if (hasSlug(slugs, "old-guard") && mods["old-guard"]) {
    deflectChance += mods["old-guard"].pct ?? 0;
    notes.push(`Old Guard: +${mods["old-guard"].pct}% Deflect`);
  }

  if (hasSlug(slugs, "action-hero") && mods["the-action-hero"] && bulletStormStacks > 0) {
    const chance = bulletStormStacks * (mods["the-action-hero"].perBulletStormStackPct ?? 0);
    deflectChance += chance;
    notes.push(`The Action Hero: +${chance}% Deflect from ${bulletStormStacks} Bullet Storm stacks`);
  }

  if (powerArmorInnatePct > 0 && isPowerArmor) {
    const pct = round1(powerArmorInnatePct * armorPieceCount);
    reducers.push({ id: "power-armor-innate", label: "Power Armor innate (unverified)", pct, condition: "always", approximate: true });
  }

  const cap = TRUTH.evadeDeflect.chanceCapPct;
  if (hasSlug(slugs, "last-stand") && mods["last-stand"]) {
    const pct = round1(evadeChance * (mods["last-stand"].evadeToReductionMultiplier ?? 0.5));
    if (pct > 0) reducers.push({ id: "last-stand", label: "Last Stand", pct, condition: "always" });
    notes.push(`Last Stand converts ${round1(evadeChance)}% Evade into ${pct}% damage reduction (no Evade)`);
    evadeChance = 0;
  }

  if ((isHeavyArmor || isPowerArmor) && deflectChance > 0) {
    deflectChance *= TRUTH.evadeDeflect.deflectHeavyArmorMultiplier;
    notes.push(`Deflect chance x${TRUTH.evadeDeflect.deflectHeavyArmorMultiplier} in heavy armor / Power Armor`);
  }

  return {
    flat,
    reducers,
    evadeChance: round1(clamp(evadeChance, 0, cap)),
    deflectChance: round1(clamp(deflectChance, 0, cap)),
    blockPct,
    maxHpPct,
    notes,
  };
}

/**
 * Backwards-compatible flat-resist layer for `aggregateEffectMath`.
 * Returns null when no perk cards are equipped (old contract).
 */
export function calculatePerkDeckDefensiveLayer(
  equippedPerkCards: EquippedPerkCardItem[] | null | undefined,
  options: PerkDeckDefensiveOptions,
): PerkDeckDefensiveResult | null {
  if (!equippedPerkCards || equippedPerkCards.length === 0) return null;
  try {
    const { strVal, agiVal, special, ...rest } = options;
    const profile = calculateDefensiveProfile(equippedPerkCards, {
      ...rest,
      special: {
        ...(special ?? {}),
        ...(strVal !== undefined && special?.str === undefined ? { str: strVal } : {}),
        ...(agiVal !== undefined && special?.agi === undefined ? { agi: agiVal } : {}),
      },
    });
    return { ...profile.flat };
  } catch {
    return null;
  }
}

/** Reducers that apply to a hit of the given damage type. */
export function selectApplicableReducers(
  reducers: DefensiveReducer[],
  damageType: IncomingDamageType,
): DefensiveReducer[] {
  return reducers.filter((r) => {
    if (r.pct <= 0) return false;
    if (r.condition === "explosion") return damageType === "explosion";
    if (r.condition === "ballistic") return damageType === "ballistic";
    return true;
  });
}

/**
 * Patch-66 order of operations: armor curve (with the boss flat reduction),
 * then every applicable reducer multiplied together.
 */
export function calculateDamageTaken(
  rawDamage: number,
  effectiveDr: number,
  bossFlatReductionPct: number,
  reducers: DefensiveReducer[],
  damageType: IncomingDamageType,
): DamageTakenResult {
  const curve = calculateMitigatedDamage(rawDamage, effectiveDr, bossFlatReductionPct);
  const applied = selectApplicableReducers(reducers, damageType);
  let multiplier = 1;
  for (const r of applied) multiplier *= 1 - clamp(r.pct, 0, 100) / 100;
  return {
    afterCurve: curve.finalDamage,
    delivered: Math.round(curve.finalDamage * multiplier * 100) / 100,
    damageCoefficientPct: curve.damageCoefficientPct,
    appliedReducers: applied,
    totalReducerPct: round1((1 - multiplier) * 100),
  };
}
