/**
 * `/calc` slash command: Creation Engine combat math rendered as a Vault-Tec
 * Pip-Boy style Discord embed. Pure functions so the route stays thin and the
 * output is unit-testable without Discord.
 */
import {
  calculateCritFrequency,
  calculateEffectiveArmor,
  calculateMitigatedDamage,
  calculatePaperDamage,
  calculateVatsApCost,
  MAX_ARMOR_PENETRATION
} from "@/lib/calculator/creation-engine-math";

/** Pip-Boy phosphor green. */
export const PIPBOY_GREEN = 0x1aff80;
/** Pip-Boy amber, used for invalid-input readouts. */
export const PIPBOY_AMBER = 0xffb000;

export const CALC_FOOTER = {
  text: "R.O.L.L. Creation Engine Calculator • Deterministic, no LLM math",
  icon_url: "https://fallout76.wiki/favicon-v3.png"
} as const;

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  url?: string;
  description?: string;
  color: number;
  fields: DiscordEmbedField[];
  footer: { text: string; icon_url: string };
}

export type CalcOptionValue = string | number | boolean;
export type CalcOptions = Record<string, CalcOptionValue | undefined>;

export type CalcSubcommand = "damage" | "vats" | "crit";

/**
 * Parses a comma/space separated list of percentages like "50, 36" into numbers.
 * Returns null when any token is not a finite number or falls outside 0-100.
 */
export function parsePercentList(raw: CalcOptionValue | undefined): number[] | null {
  if (raw === undefined || raw === null || raw === "") return [];
  const tokens = String(raw)
    .split(/[,\s]+/)
    .map((t) => t.replace(/%$/, "").trim())
    .filter(Boolean);
  const values: number[] = [];
  for (const token of tokens) {
    const n = Number(token);
    if (!Number.isFinite(n) || n < 0 || n > 100) return null;
    values.push(n);
  }
  return values;
}

function num(value: CalcOptionValue | undefined, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value: CalcOptionValue | undefined): boolean {
  return value === true || value === "true";
}

function fmt(n: number, digits = 2): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(digits).replace(/\.?0+$/, "");
}

function readout(lines: string[]): string {
  return "```ansi\n" + lines.join("\n") + "\n```";
}

function pct(n: number): string {
  return `${fmt(n)}%`;
}

function errorEmbed(title: string, message: string): DiscordEmbed {
  return {
    title,
    color: PIPBOY_AMBER,
    description: readout(["[ VAULT-TEC INPUT FAULT ]", message]),
    fields: [],
    footer: CALC_FOOTER
  };
}

/**
 * `/calc damage` — full pipeline: paper damage → effective armor → mitigated damage.
 * Options: base (req), additive, multipliers, target_dr, penetration, flat_reduction.
 */
export function buildDamageEmbed(opts: CalcOptions): DiscordEmbed {
  const base = num(opts.base, NaN);
  if (!Number.isFinite(base) || base <= 0) {
    return errorEmbed("☢️ DAMAGE CALCULATOR", "Base damage must be a positive number.");
  }
  const additive = num(opts.additive, 0);
  const multipliers = parsePercentList(opts.multipliers);
  const penetration = parsePercentList(opts.penetration);
  if (multipliers === null) {
    return errorEmbed("☢️ DAMAGE CALCULATOR", 'Multipliers must be percentages 0-100, e.g. "40, 10".');
  }
  if (penetration === null) {
    return errorEmbed("☢️ DAMAGE CALCULATOR", 'Penetration sources must be percentages 0-100, e.g. "50, 36".');
  }
  const targetDr = num(opts.target_dr, 0);
  const flatReduction = Math.max(0, Math.min(100, num(opts.flat_reduction, 0)));

  const paper = calculatePaperDamage(base, additive, multipliers);
  const additiveMult = 1 + additive / 100;
  const multChain = multipliers.length ? multipliers.map((m) => `× ${fmt(1 + m / 100)}`).join(" ") : "";

  const fields: DiscordEmbedField[] = [
    {
      name: "📟 PAPER DAMAGE (Pre-Armor)",
      value: readout([
        `BASE      ${fmt(base)}`,
        `ADDITIVE  +${pct(additive)}  → × ${fmt(additiveMult)}`,
        multipliers.length ? `MULTIPLY  ${multChain}` : "MULTIPLY  none",
        `= ${fmt(paper)} DMG`
      ]),
      inline: false
    }
  ];

  let description = "Post-Patch 22 rule: perks, chems, mutations and legendary primaries add to BASE. Only debuffs and amplifiers multiply the total.";

  if (targetDr > 0) {
    const armor = calculateEffectiveArmor(targetDr, penetration);
    const penChain = penetration.length ? penetration.map((p) => `(1 − ${fmt(p / 100)})`).join(" × ") : "no penetration";
    const capped = 1 - penetration.reduce((acc, p) => acc * (1 - p / 100), 1) > MAX_ARMOR_PENETRATION;
    fields.push({
      name: "🛡️ EFFECTIVE ARMOR (Multiplicative Penetration)",
      value: readout([
        `TARGET DR ${fmt(targetDr)}`,
        `STACK     ${penChain}`,
        `TOTAL PEN ${pct(armor.totalPenetrationPct)}${capped ? "  [ENGINE CAP 90%]" : ""}`,
        `= ${fmt(armor.effectiveDr)} DR remaining`
      ]),
      inline: false
    });

    const hit = calculateMitigatedDamage(paper, armor.effectiveDr, flatReduction);
    const ratio = (paper * 0.15) / Math.max(armor.effectiveDr, 0.0001);
    const mitigationLines = [
      `R = (${fmt(paper)} × 0.15) / ${fmt(armor.effectiveDr)} = ${fmt(ratio, 4)}`,
      `COEFF = min(0.99, R^0.365) = ${pct(hit.damageCoefficientPct)}`
    ];
    if (flatReduction > 0) {
      mitigationLines.push(`FLAT RED  −${pct(flatReduction)} (applied after curve)`);
    }
    mitigationLines.push(`= ${fmt(hit.finalDamage)} DELIVERED`);
    fields.push({
      name: "💥 DELIVERED DAMAGE (0.15 / 0.365 Curve)",
      value: readout(mitigationLines),
      inline: false
    });
    description += `\n\n**${fmt(paper)}** paper → **${fmt(hit.finalDamage)}** delivered (${pct(
      hit.finalDamage > 0 ? (hit.finalDamage / paper) * 100 : 0
    )} of paper).`;
  } else {
    description += "\n\nAdd `target_dr` to run the armor and mitigation curve.";
  }

  return {
    title: "☢️ CREATION ENGINE DAMAGE CALCULATOR",
    url: "https://fallout76.wiki",
    description,
    color: PIPBOY_GREEN,
    fields,
    footer: CALC_FOOTER
  };
}

/**
 * `/calc vats` — AP cost per shot. Options: base_ap (req), mod_reduction, lvc.
 */
export function buildVatsEmbed(opts: CalcOptions): DiscordEmbed {
  const baseAp = num(opts.base_ap, NaN);
  if (!Number.isFinite(baseAp) || baseAp <= 0) {
    return errorEmbed("🎯 V.A.T.S. AP CALCULATOR", "Base AP cost must be a positive number.");
  }
  const modReduction = Math.max(0, Math.min(100, num(opts.mod_reduction, 0)));
  const lvc = bool(opts.lvc);
  const cost = calculateVatsApCost(baseAp, modReduction, lvc);
  const withoutLvc = calculateVatsApCost(baseAp, modReduction, false);

  return {
    title: "🎯 V.A.T.S. ACTION POINT CALCULATOR",
    url: "https://fallout76.wiki",
    description: "Weapon mod reductions sum additively against base AP. The 25% Less VATS Cost star multiplies the modded cost by 0.75.",
    color: PIPBOY_GREEN,
    fields: [
      {
        name: "📟 AP COST PER SHOT",
        value: readout([
          `BASE AP   ${fmt(baseAp)}`,
          `MODS      −${pct(modReduction)}  → ${fmt(withoutLvc, 1)} AP`,
          lvc ? `25 LVC    × 0.75  → ${fmt(cost, 1)} AP` : "25 LVC    not equipped",
          `= ${fmt(cost, 1)} AP / shot`
        ]),
        inline: false
      },
      {
        name: "🔧 Common Mod Reductions",
        value: "Reflex sight −15% · Aligned barrel −5% · Forceful stock −5% · Swift mag −5%",
        inline: false
      }
    ],
    footer: CALC_FOOTER
  };
}

/**
 * `/calc crit` — crit meter fill and cycle length. Options: luck (req), savvy, lucky_hit.
 */
export function buildCritEmbed(opts: CalcOptions): DiscordEmbed {
  const luck = Math.round(num(opts.luck, NaN));
  if (!Number.isFinite(luck) || luck < 1) {
    return errorEmbed("🍀 CRITICAL METER CALCULATOR", "Luck must be a whole number of at least 1.");
  }
  const savvy = Math.max(0, Math.min(3, Math.round(num(opts.savvy, 3))));
  const luckyHit = bool(opts.lucky_hit);
  const crit = calculateCritFrequency(luck, savvy, luckyHit);

  return {
    title: "🍀 CRITICAL METER CALCULATOR",
    url: "https://fallout76.wiki",
    description: crit.everyOtherShot
      ? "**EVERY-OTHER-SHOT CRITICAL ACHIEVED.** One hit refills the meter after each crit."
      : `Meter needs **${crit.shotsPerCritCycle - 1}** hits to refill after each crit.`,
    color: PIPBOY_GREEN,
    fields: [
      {
        name: "📟 METER READOUT",
        value: readout([
          `LUCK      ${luck}`,
          `FILL/HIT  round((${luck} × 1.5) + 5${luckyHit ? " + 15" : ""}) = ${pct(crit.fillPerShotPct)}`,
          `SAVVY R${savvy}  ${pct(crit.meterPreservedPct)} preserved after crit`,
          `= 1 crit every ${crit.shotsPerCritCycle} shots`
        ]),
        inline: false
      },
      {
        name: "📐 Breakpoints",
        value: "Luck 33 + Critical Savvy 3 → every other shot. Luck 23 with the 3★ Lucky Hit legendary also reaches it.",
        inline: false
      }
    ],
    footer: CALC_FOOTER
  };
}

/**
 * Dispatches a `/calc <subcommand>` invocation to its embed builder.
 * Returns null for an unknown subcommand so the caller can fall through.
 */
export function buildCalcEmbed(subcommand: string, opts: CalcOptions): DiscordEmbed | null {
  switch (subcommand as CalcSubcommand) {
    case "damage":
      return buildDamageEmbed(opts);
    case "vats":
      return buildVatsEmbed(opts);
    case "crit":
      return buildCritEmbed(opts);
    default:
      return null;
  }
}

/** Flattens Discord's `{ name, value }[]` option list into a record. */
export function optionsToRecord(options: Array<{ name: string; value?: CalcOptionValue }> | undefined): CalcOptions {
  const record: CalcOptions = {};
  for (const option of options ?? []) {
    record[option.name] = option.value;
  }
  return record;
}
