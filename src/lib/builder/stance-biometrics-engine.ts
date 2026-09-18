/**
 * Stance and Biometrics Engine for Fallout 76 Loadout Builder (B.U.I.L.D.)
 *
 * Dynamically computes game-accurate SPECIAL, resistance, and tactical bonuses
 * based on the character's physical combat stance (Crouched/Stealthed, Aiming ADS,
 * Power Attacking, Sprinting, Stationary) and biometric status (Health %, Rads %,
 * Feral Instinct, Time of Day, Hunger/Thirst).
 *
 * Since Patch 66 the health-scaled armor effects (Vanguard's, Bolstering, Mutant's)
 * and the stance effects (Cavalier's, Sentinel's) are percentage damage reducers,
 * not flat resistances. Their numbers come from `calculateDefensiveProfile`
 * (single source: `src/data/truth/defensive-perks.json`) and surface here as
 * tactical tags only.
 */

import type { BuilderModDTO } from "./types";
import type { CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";
import { calculateDefensiveProfile } from "./perk-defensive-layer";

export interface StanceBiometricsInput {
  switchboard: CombatSwitchboardState | null;
  equippedMods: BuilderModDTO[];
  isGhoul: boolean;
  activeMutations?: string[];
}

export interface StanceBiometricsResult {
  layer: Record<string, number>;
  specialBreakdowns: { stat: string; source: string; val: number }[];
  resistanceBreakdowns: { res: string; source: string; val: number }[];
  activeTacticalTags: string[];
}

export function calculateStanceAndBiometricModifiers(
  input: StanceBiometricsInput
): StanceBiometricsResult {
  const { switchboard, equippedMods, isGhoul, activeMutations = [] } = input;

  const layer: Record<string, number> = {
    str: 0,
    per: 0,
    end: 0,
    cha: 0,
    int: 0,
    agi: 0,
    lck: 0,
    dr: 0,
    er: 0,
    fr: 0,
    cr: 0,
    pr: 0,
    rr: 0,
  };

  const specialBreakdowns: { stat: string; source: string; val: number }[] = [];
  const resistanceBreakdowns: { res: string; source: string; val: number }[] = [];
  const activeTacticalTags: string[] = [];

  // 1. Resolve Combat Stance & Biometrics
  const combatStance = switchboard?.combatStance;
  const isCrouched = Boolean(combatStance?.isCrouched || combatStance?.isSneaking);
  const isInVats = Boolean(combatStance?.isInVats);
  const vatsCritEveryOtherShot = Boolean(combatStance?.vatsCritEveryOtherShot);
  const isAiming = Boolean(combatStance?.isAiming) && !isInVats;
  const isPowerAttacking = Boolean(combatStance?.isPowerAttacking);
  const isSprinting = Boolean(combatStance?.isSprinting);
  const isStationary = Boolean(combatStance?.isStationary);

  const timeOfDay = switchboard?.timeOfDay || "day";
  const isNight = timeOfDay === "night";

  const rawHealth = switchboard?.healthPct ?? 100;
  const healthPct = rawHealth > 1 ? rawHealth : rawHealth * 100;

  const foodState = switchboard?.foodState || "fully_fed";
  const thirstState = switchboard?.thirstState || "fully_hydrated";
  const isWellFedAndHydrated =
    (foodState === "well_fed" || foodState === "fully_fed") &&
    (thirstState === "well_hydrated" || thirstState === "fully_hydrated");

  // Track armor piece counts for affixes
  let nocturnalArmorCount = 0;
  let chameleonArmorCount = 0;
  let unyieldingArmorCount = 0;
  let steadfastArmorCount = 0;
  let overeatersArmorCount = 0;
  const armorModSlugs: string[] = [];

  // Track weapon affixes
  let hasNocturnalWeapon = false;
  let hasHitmansWeapon = false;
  let hasHeavyHittersWeapon = false;
  let hasSteadyWeapon = false;
  let hasStalkersWeapon = false;
  let hasBloodiedWeapon = false;

  for (const mod of equippedMods) {
    const slug = (mod.slug || "").toLowerCase();
    const name = (mod.name || "").toLowerCase();
    const isArmorOrPA = mod.allowedOnArmor || mod.allowedOnPowerArmor || mod.category === "Armor";
    const isWeapon = mod.allowedOnWeapon || mod.category === "Weapon";

    if (isArmorOrPA) armorModSlugs.push(slug);

    if (slug.includes("nocturnal") || name.includes("nocturnal")) {
      if (isArmorOrPA && !slug.includes("weapon")) nocturnalArmorCount++;
      if (isWeapon || slug.includes("weapon")) hasNocturnalWeapon = true;
    } else if (slug.includes("chameleon") || name.includes("chameleon")) {
      if (isArmorOrPA) chameleonArmorCount++;
    } else if (slug.includes("unyielding") || name.includes("unyielding")) {
      if (isArmorOrPA) unyieldingArmorCount++;
    } else if (slug.includes("steadfast") || name.includes("steadfast")) {
      if (isArmorOrPA) steadfastArmorCount++;
    } else if (slug.includes("overeater") || name.includes("overeater")) {
      if (isArmorOrPA) overeatersArmorCount++;
    }

    if (isWeapon) {
      if (slug.includes("hitman") || name.includes("hitman")) hasHitmansWeapon = true;
      if (slug.includes("heavy-hitter") || name.includes("heavy hitter")) hasHeavyHittersWeapon = true;
      if (slug.includes("steady") || name.includes("steady")) hasSteadyWeapon = true;
      if (slug.includes("stalker") || name.includes("stalker")) hasStalkersWeapon = true;
      if (slug.includes("bloodied") || name.includes("bloodied")) hasBloodiedWeapon = true;
    }
  }

  // 2. Compute Nocturnal Armor Stance/Night Modifier
  // In Fallout 76, Nocturnal grants +4 PER and +4 AGI per piece while cloaked/crouched/stealthed OR at night.
  const nocturnalActive = isCrouched || isNight;
  if (nocturnalArmorCount > 0 && nocturnalActive) {
    const perBonus = nocturnalArmorCount * 4;
    const agiBonus = nocturnalArmorCount * 4;
    layer.per += perBonus;
    layer.agi += agiBonus;

    const sourceLabel = isCrouched && isNight
      ? `Nocturnal (${nocturnalArmorCount}x · Crouched & Night)`
      : isCrouched
      ? `Nocturnal (${nocturnalArmorCount}x · Crouched / Stealthed)`
      : `Nocturnal (${nocturnalArmorCount}x · Nighttime)`;

    specialBreakdowns.push(
      { stat: "per", source: sourceLabel, val: perBonus },
      { stat: "agi", source: sourceLabel, val: agiBonus }
    );

    activeTacticalTags.push(`Nocturnal (+${perBonus} PER, +${agiBonus} AGI)`);
  }

  // 3. Compute Chameleon Armor Stance Modifier
  // Grants +2 AGI per piece and active stealth field while crouched / stealthed.
  if (chameleonArmorCount > 0 && isCrouched) {
    const agiBonus = chameleonArmorCount * 2;
    layer.agi += agiBonus;

    const sourceLabel = `Chameleon (${chameleonArmorCount}x · Crouched / Stealthed)`;
    specialBreakdowns.push({ stat: "agi", source: sourceLabel, val: agiBonus });
    activeTacticalTags.push(`Chameleon (+${agiBonus} AGI, Stealth Field)`);
  }

  // 4. Compute Unyielding Armor Biometric Modifier
  // In Fallout 76: Up to +3 to all SPECIAL stats (except END) per piece when health is <= 20%.
  // Scales (Patch 70 inclusive thresholds): <=20% HP = +3/piece; <=40% HP = +2/piece; <=60% HP = +1/piece.
  // Blocked / ineffective for Ghouls in 76.
  if (unyieldingArmorCount > 0 && !isGhoul) {
    let unyieldingPerPiece = 0;
    let thresholdLabel = "";

    if (healthPct <= 20) {
      unyieldingPerPiece = 3;
      thresholdLabel = "≤20% HP";
    } else if (healthPct <= 40) {
      unyieldingPerPiece = 2;
      thresholdLabel = "≤40% HP";
    } else if (healthPct <= 60) {
      unyieldingPerPiece = 1;
      thresholdLabel = "≤60% HP";
    }

    if (unyieldingPerPiece > 0) {
      const bonus = unyieldingArmorCount * unyieldingPerPiece;
      const statsToBoost = ["str", "per", "cha", "int", "agi", "lck"] as const;
      const sourceLabel = `Unyielding (${unyieldingArmorCount}x · ${thresholdLabel})`;

      for (const st of statsToBoost) {
        layer[st] += bonus;
        specialBreakdowns.push({ stat: st, source: sourceLabel, val: bonus });
      }

      activeTacticalTags.push(`Unyielding (+${bonus} STR/PER/CHA/INT/AGI/LCK)`);
    }
  }

  // 5. Compute Steadfast Armor Stance Modifier
  // +50 DR per piece while aiming down sights.
  if (steadfastArmorCount > 0 && isAiming) {
    const totalDr = steadfastArmorCount * 50;
    layer.dr += totalDr;

    const sourceLabel = `Steadfast (${steadfastArmorCount}x · Aiming ADS)`;
    resistanceBreakdowns.push({ res: "dr", source: sourceLabel, val: totalDr });
    activeTacticalTags.push(`Steadfast (+${totalDr} DR While Aiming)`);
  }

  // 6. Overeater's tag. Since Patch 66 (The Backwoods, 2026-03-03) Overeater's grants up to
  // +40 Max Health per piece as hunger/thirst fill and no longer reduces incoming damage.
  if (overeatersArmorCount > 0 && !isGhoul && isWellFedAndHydrated) {
    const maxHpBonus = overeatersArmorCount * 40;
    activeTacticalTags.push(`Overeater's (+${maxHpBonus} Max HP · Well Fed/Hydrated)`);
  }

  // 7. Percentage damage reducers from armor legendary mods (Patch 66 order of operations:
  // applied after the armor curve). Vanguard's / Bolstering / Mutant's / Cavalier's / Sentinel's
  // no longer add flat DR/ER here; the values come from the defensive-perk truth file.
  if (armorModSlugs.length > 0) {
    const profile = calculateDefensiveProfile([], {
      isPowerArmor: Boolean(switchboard?.inPowerArmor),
      equippedModSlugs: armorModSlugs,
      healthPct,
      mutationCount: activeMutations.length,
      isSprinting,
      isStationary,
      bulletStormStacks: switchboard?.bulletStormStacks ?? 0,
    });

    const detailFor = (id: string): string => {
      switch (id) {
        case "vanguards":
        case "bolstering":
          return `${Math.round(healthPct)}% HP`;
        case "mutants":
          return `${activeMutations.length} mutation${activeMutations.length === 1 ? "" : "s"}`;
        case "cavaliers":
          return "sprinting";
        case "sentinels":
          return "standing still";
        default:
          return "";
      }
    };

    for (const r of profile.reducers) {
      const detail = detailFor(r.id);
      activeTacticalTags.push(`${r.label} (-${r.pct}% damage taken${detail ? ` · ${detail}` : ""})`);
    }
    if (profile.evadeChance > 0) {
      activeTacticalTags.push(`Armor mods (+${profile.evadeChance}% Evade)`);
    }
    if (profile.deflectChance > 0) {
      activeTacticalTags.push(`Armor mods (+${profile.deflectChance}% Deflect)`);
    }
  }

  // 8. Compute Weapon Tactical Stance & Biometric Tags
  if (hasNocturnalWeapon && nocturnalActive) {
    activeTacticalTags.push("Nocturnal (+50% Weapon Dmg · Stealthed/Night)");
  }
  if (hasHitmansWeapon && isAiming) {
    activeTacticalTags.push("Hitman's (+25% Weapon Dmg · Aiming ADS)");
  }
  if (hasHeavyHittersWeapon && isPowerAttacking) {
    activeTacticalTags.push("Heavy Hitter's (+40% Power Attack Dmg)");
  }
  if (hasSteadyWeapon && isStationary) {
    activeTacticalTags.push("Steady (+25% Stationary Melee Dmg)");
  }
  if (hasStalkersWeapon && isCrouched) {
    activeTacticalTags.push("Stalker's (+100% Sneak VATS Hit)");
  }
  if (hasBloodiedWeapon && healthPct <= 20) {
    activeTacticalTags.push("Bloodied (+80% Weapon Dmg · Low HP)");
  }
  if (isCrouched) {
    activeTacticalTags.push("Sneak Attack Multiplier (2.0×–2.5×)");
  }
  if (isInVats) {
    activeTacticalTags.push("🎯 In V.A.T.S. (Target Lock Active)");
  }
  if (vatsCritEveryOtherShot) {
    activeTacticalTags.push("✨ 1:1 V.A.T.S. Crit Cycle Active");
  }

  return {
    layer,
    specialBreakdowns,
    resistanceBreakdowns,
    activeTacticalTags,
  };
}
