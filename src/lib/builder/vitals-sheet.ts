import stats from "@/data/truth/character-stats.json";
import { lerpSpecial } from "@/lib/builder/perk-defensive-layer";

/**
 * The character sheet's vitals rows: Max HP, HP regen, Max AP, AP regen, carry weight and
 * movement speed, from the base formulas in `character-stats.json`, the live SPECIAL, the perk
 * deck, the switchboard state and the totals the mods/mutations already provide. Pure, so the
 * HUD, the Biometrics band and tests share one set of numbers. Every line carries a source so
 * the sheet can show where a number comes from.
 */
export type VitalsLine = { source: string; value: string };

export type VitalsSheet = {
  maxHp: number;
  hpRegenPerSecond: number;
  maxAp: number;
  apRegenPerSecond: number;
  carryWeight: number;
  moveSpeedPct: number;
  lines: {
    maxHp: VitalsLine[];
    hpRegen: VitalsLine[];
    maxAp: VitalsLine[];
    apRegen: VitalsLine[];
    carryWeight: VitalsLine[];
    moveSpeed: VitalsLine[];
  };
};

export type VitalsInput = {
  special: { str: number; per: number; end: number; cha: number; int: number; agi: number; lck: number };
  perkCards: ReadonlyArray<{ cardId: string; rank: number }>;
  /** Flat HP / AP regen / carry weight already summed from mods and mutations (aggregateEffectMath). */
  totals: { hp: number; apRegen: number; carryWeight: number };
  /** Life Giver's percentage from the defensive profile (END-scaled, approximate). */
  lifegiverMaxHpPct: number;
  /** The firepower engine's AP pool when a weapon is loaded (includes unique innates and Thirst Quencher). */
  engineApPool?: number | null;
  isGhoul: boolean;
  isPowerArmor: boolean;
  timeOfDay: "day" | "night";
  foodState?: string | null;
  thirstState?: string | null;
  isOnTeam: boolean;
  hasWellTunedFurniture: boolean;
  overeatersPieces: number;
  glowPct?: number;
  rangedWeaponEquipped: boolean;
  isDiseased?: boolean;
  /** Above max carry weight: moving drains AP like sprinting (fallout.wiki Carry Weight page). */
  isOverEncumbered?: boolean;
};

const rank = (cards: VitalsInput["perkCards"], id: string) => cards.find((c) => c.cardId === id)?.rank ?? 0;
const byRank = (arr: readonly number[], r: number) => (r > 0 ? arr[Math.min(arr.length, r) - 1] ?? 0 : 0);

export function calculateVitalsSheet(input: VitalsInput): VitalsSheet {
  const P = stats.perks;
  const S = stats.states;
  const lines: VitalsSheet["lines"] = { maxHp: [], hpRegen: [], maxAp: [], apRegen: [], carryWeight: [], moveSpeed: [] };

  // Max HP
  const hpBase = stats.hp.base + Math.max(0, input.special.end - stats.hp.enduranceOffset) * stats.hp.perEndurance;
  lines.maxHp.push({ source: `Base (${stats.hp.formula}, END ${input.special.end})`, value: `${hpBase}` });
  let maxHp = hpBase;
  if (input.lifegiverMaxHpPct > 0) {
    const add = Math.round(hpBase * (input.lifegiverMaxHpPct / 100));
    maxHp += add;
    lines.maxHp.push({ source: `Lifegiver (+${input.lifegiverMaxHpPct}% of base, END-scaled, approx.)`, value: `+${add}` });
  }
  const nocturnal = byRank(P["nocturnal-fortitude"].byRank, rank(input.perkCards, "nocturnal-fortitude"));
  if (nocturnal > 0 && input.timeOfDay === "night") {
    maxHp += nocturnal;
    lines.maxHp.push({ source: "Nocturnal Fortitude (night)", value: `+${nocturnal}` });
  }
  const foodHpRaw = (S.foodMaxHp as unknown as Record<string, unknown>)[input.foodState ?? ""];
  const foodHp = typeof foodHpRaw === "number" ? foodHpRaw : 0;
  if (foodHp > 0 && !input.isGhoul) {
    maxHp += foodHp;
    lines.maxHp.push({ source: input.foodState === "fully_fed" ? "Fully Fed" : "Well Fed", value: `+${foodHp}` });
  }
  if (input.overeatersPieces > 0 && !input.isGhoul && foodHp > 0) {
    const add = input.overeatersPieces * S.overeatersMaxHpPerPiece;
    maxHp += add;
    lines.maxHp.push({ source: `Overeater's ×${input.overeatersPieces} (Well Fed/Hydrated)`, value: `+${add}` });
  }
  if (input.totals.hp !== 0) {
    maxHp += input.totals.hp;
    lines.maxHp.push({ source: "Mods, mutations & buffs (sheet totals)", value: `${input.totals.hp > 0 ? "+" : ""}${input.totals.hp}` });
  }

  // HP regen
  let hpRegen = 0;
  const photo = byRank(P.photosynthetic.byRank, rank(input.perkCards, "photosynthetic"));
  if (photo > 0 && input.timeOfDay === "day") {
    hpRegen += photo;
    lines.hpRegen.push({ source: "Photosynthetic (day)", value: `+${photo} HP/s` });
  }
  const genes = byRank(P["battle-genes"].byRank, rank(input.perkCards, "battle-genes"));
  if (genes > 0) {
    hpRegen += genes;
    lines.hpRegen.push({ source: "Battle Genes (in combat)", value: `+${genes} HP/s` });
  }
  if (input.isGhoul && rank(input.perkCards, "ghoulish") > 0) {
    lines.hpRegen.push({ source: "Ghoulish (rads heal; rate unpublished)", value: "on" });
  }

  // Max AP: the engine's pool when a weapon is loaded (it adds unique innates and Thirst Quencher).
  const apBase = stats.ap.base + input.special.agi * stats.ap.perAgility;
  let maxAp = input.engineApPool ?? apBase;
  lines.maxAp.push({ source: `Base (${stats.ap.formula}, AGI ${input.special.agi}; base flagged approximate)`, value: `${apBase}` });
  if (input.engineApPool != null && input.engineApPool !== apBase) {
    lines.maxAp.push({ source: "Weapon innates & Thirst Quencher (firepower engine)", value: `${input.engineApPool - apBase > 0 ? "+" : ""}${input.engineApPool - apBase}` });
  } else if (input.engineApPool == null) {
    const tq = rank(input.perkCards, "thirst-quencher") > 0 && !input.isDiseased
      ? Math.round(lerpSpecial(input.special.end, P["thirst-quencher"].min, P["thirst-quencher"].max))
      : 0;
    if (tq > 0) {
      maxAp += tq;
      lines.maxAp.push({ source: `Thirst Quencher (END ${input.special.end}, approx.)`, value: `+${tq}` });
    }
  }

  // AP regen
  let apRegenPct = 0;
  const actionBoy = byRank(P["action-boy"].byRank, rank(input.perkCards, "action-boy"));
  if (actionBoy > 0) {
    apRegenPct += actionBoy;
    lines.apRegen.push({ source: "Action Boy/Girl", value: `+${Math.round(actionBoy * 100)}%` });
  }
  const actionGhoul = byRank(P["action-ghoul"].byRank, rank(input.perkCards, "action-ghoul"));
  if (actionGhoul > 0 && input.isGhoul) {
    apRegenPct += actionGhoul;
    lines.apRegen.push({ source: "Action Ghoul", value: `+${Math.round(actionGhoul * 100)}%` });
  }
  const thirstRegenRaw = (S.thirstApRegenPct as unknown as Record<string, unknown>)[input.thirstState ?? ""];
  const thirstRegen = typeof thirstRegenRaw === "number" ? thirstRegenRaw : 0;
  if (thirstRegen > 0 && !input.isGhoul) {
    apRegenPct += thirstRegen;
    lines.apRegen.push({ source: input.thirstState === "fully_hydrated" ? "Fully Hydrated" : "Well Hydrated", value: `+${Math.round(thirstRegen * 100)}%` });
  }
  if (input.hasWellTunedFurniture) {
    apRegenPct += S.campWellTunedApRegenPct;
    lines.apRegen.push({ source: "Well Tuned (C.A.M.P. instrument)", value: `+${Math.round(S.campWellTunedApRegenPct * 100)}%` });
  }
  if (input.totals.apRegen !== 0) {
    apRegenPct += input.totals.apRegen;
    lines.apRegen.push({ source: "Mods & mutations (sheet totals)", value: `${input.totals.apRegen > 0 ? "+" : ""}${Math.round(input.totals.apRegen * 100)}%` });
  }
  const apRegenPerSecond = Math.round(stats.ap.regenPerSecond * (1 + apRegenPct) * 10) / 10;
  lines.apRegen.unshift({ source: "Base regen", value: `${stats.ap.regenPerSecond} AP/s` });

  // Carry weight
  const carryBase = stats.carryWeight.base + input.special.str * stats.carryWeight.perStrength;
  let carry = carryBase;
  lines.carryWeight.push({ source: `Base (${stats.carryWeight.formula}, STR ${input.special.str})`, value: `${carryBase}` });
  if (rank(input.perkCards, "strong-back") > 0) {
    const add = Math.round(lerpSpecial(input.special.str, P["strong-back"].min, P["strong-back"].max));
    carry += add;
    lines.carryWeight.push({ source: `Strong Back (STR ${input.special.str}, approx.)`, value: `+${add}` });
  }
  if (input.totals.carryWeight !== 0) {
    carry += input.totals.carryWeight;
    lines.carryWeight.push({ source: "Mods, mutations & buffs (sheet totals)", value: `${input.totals.carryWeight > 0 ? "+" : ""}${input.totals.carryWeight}` });
  }
  if (input.isOverEncumbered) {
    // No published drain rate; the wiki states the rule, not a number.
    lines.carryWeight.push({ source: "Over-encumbered: moving drains AP like sprinting", value: "on" });
  }

  // Movement speed (percent from perks; base speed has no published number)
  let speed = 0;
  const gunRunner = byRank(P["gun-runner"].byRank, rank(input.perkCards, "gun-runner"));
  if (gunRunner > 0 && input.rangedWeaponEquipped) {
    speed += gunRunner;
    lines.moveSpeed.push({ source: "Gun Runner (ranged weapon)", value: `+${Math.round(gunRunner * 100)}%` });
  }
  const squad = byRank(P["squad-maneuvers"].byRank, rank(input.perkCards, "squad-maneuvers"));
  if (squad > 0 && input.isOnTeam) {
    speed += squad;
    lines.moveSpeed.push({ source: "Squad Maneuvers (team)", value: `+${Math.round(squad * 100)}%` });
  }
  const portable = byRank(P["portable-power"].byRank, rank(input.perkCards, "portable-power"));
  if (portable > 0 && input.isPowerArmor) {
    speed += portable;
    lines.moveSpeed.push({ source: "Portable Power (power armor)", value: `+${Math.round(portable * 100)}%` });
  }
  const jaguar = byRank(P["jaguar-speed"].byRank, rank(input.perkCards, "jaguar-speed"));
  if (jaguar > 0 && input.isGhoul && (input.glowPct ?? 0) >= 80) {
    speed += jaguar;
    lines.moveSpeed.push({ source: "Jaguar Speed (Glow high, sprint)", value: `+${Math.round(jaguar * 100)}%` });
  }

  return {
    maxHp: Math.round(maxHp),
    hpRegenPerSecond: hpRegen,
    maxAp: Math.round(maxAp),
    apRegenPerSecond,
    carryWeight: Math.round(carry),
    moveSpeedPct: Math.round(speed * 100),
    lines,
  };
}
