/**
 * Stance and Biometrics Engine for Fallout 76 Loadout Builder (B.U.I.L.D.)
 *
 * Dynamically computes game-accurate SPECIAL, resistance, and tactical bonuses
 * based on the character's physical combat stance (Crouched/Stealthed, Aiming ADS,
 * Power Attacking, Sprinting, Stationary) and biometric status (Health %, Rads %,
 * Feral Instinct, Time of Day, Hunger/Thirst).
 */

import type { BuilderModDTO } from "./types";
import type { CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";

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

  const hasMutations = activeMutations.length > 0;

  // Track armor piece counts for affixes
  let nocturnalArmorCount = 0;
  let chameleonArmorCount = 0;
  let unyieldingArmorCount = 0;
  let bolsteringArmorCount = 0;
  let vanguardArmorCount = 0;
  let steadfastArmorCount = 0;
  let mutantsArmorCount = 0;
  let overeatersArmorCount = 0;
  let sentinelsArmorCount = 0;
  let cavaliersArmorCount = 0;

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

    if (slug.includes("nocturnal") || name.includes("nocturnal")) {
      if (isArmorOrPA && !slug.includes("weapon")) nocturnalArmorCount++;
      if (isWeapon || slug.includes("weapon")) hasNocturnalWeapon = true;
    } else if (slug.includes("chameleon") || name.includes("chameleon")) {
      if (isArmorOrPA) chameleonArmorCount++;
    } else if (slug.includes("unyielding") || name.includes("unyielding")) {
      if (isArmorOrPA) unyieldingArmorCount++;
    } else if (slug.includes("bolstering") || name.includes("bolstering")) {
      if (isArmorOrPA) bolsteringArmorCount++;
    } else if (slug.includes("vanguard") || name.includes("vanguard")) {
      if (isArmorOrPA) vanguardArmorCount++;
    } else if (slug.includes("steadfast") || name.includes("steadfast")) {
      if (isArmorOrPA) steadfastArmorCount++;
    } else if (slug.includes("mutant") && !slug.includes("mutant-slayer") && name.includes("mutant's")) {
      if (isArmorOrPA) mutantsArmorCount++;
    } else if (slug.includes("overeater") || name.includes("overeater")) {
      if (isArmorOrPA) overeatersArmorCount++;
    } else if (slug.includes("sentinel") || name.includes("sentinel")) {
      if (isArmorOrPA) sentinelsArmorCount++;
    } else if (slug.includes("cavalier") || name.includes("cavalier")) {
      if (isArmorOrPA) cavaliersArmorCount++;
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
  // Scales: <=20% HP = +3/piece; 21-40% HP = +2/piece; 41-60% HP = +1/piece.
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

  // 5. Compute Bolstering Armor Biometric Modifier
  // Up to +35 DR and +35 ER per piece as health decreases.
  if (bolsteringArmorCount > 0) {
    let drPerPiece = 0;
    let label = "";

    if (healthPct <= 20) {
      drPerPiece = 35;
      label = "≤20% HP";
    } else if (healthPct <= 40) {
      drPerPiece = 28;
      label = "≤40% HP";
    } else if (healthPct <= 60) {
      drPerPiece = 21;
      label = "≤60% HP";
    } else if (healthPct <= 80) {
      drPerPiece = 14;
      label = "≤80% HP";
    } else {
      drPerPiece = 7;
      label = ">80% HP";
    }

    // Seed catalog already provides baseline +10 DR/ER; we add the scaling bonus beyond 10 if applicable
    const extraPerPiece = Math.max(0, drPerPiece - 10);
    if (extraPerPiece > 0) {
      const totalDr = bolsteringArmorCount * extraPerPiece;
      layer.dr += totalDr;
      layer.er += totalDr;

      const sourceLabel = `Bolstering (${bolsteringArmorCount}x · ${label})`;
      resistanceBreakdowns.push(
        { res: "dr", source: sourceLabel, val: totalDr },
        { res: "er", source: sourceLabel, val: totalDr }
      );
      activeTacticalTags.push(`Bolstering (+${bolsteringArmorCount * drPerPiece} DR/ER)`);
    }
  }

  // 6. Compute Vanguard's Armor Biometric Modifier
  // Up to +35 DR and +35 ER per piece as health increases (max at >= 80% HP).
  if (vanguardArmorCount > 0) {
    let drPerPiece = 0;
    let label = "";

    if (healthPct >= 80) {
      drPerPiece = 35;
      label = "≥80% HP";
    } else if (healthPct >= 60) {
      drPerPiece = 28;
      label = "≥60% HP";
    } else if (healthPct >= 40) {
      drPerPiece = 21;
      label = "≥40% HP";
    } else if (healthPct >= 20) {
      drPerPiece = 14;
      label = "≥20% HP";
    }

    if (drPerPiece > 0) {
      const totalDr = vanguardArmorCount * drPerPiece;
      layer.dr += totalDr;
      layer.er += totalDr;

      const sourceLabel = `Vanguard's (${vanguardArmorCount}x · ${label})`;
      resistanceBreakdowns.push(
        { res: "dr", source: sourceLabel, val: totalDr },
        { res: "er", source: sourceLabel, val: totalDr }
      );
      activeTacticalTags.push(`Vanguard's (+${totalDr} DR/ER)`);
    }
  }

  // 7. Compute Steadfast Armor Stance Modifier
  // +50 DR per piece while aiming down sights.
  if (steadfastArmorCount > 0 && isAiming) {
    const totalDr = steadfastArmorCount * 50;
    layer.dr += totalDr;

    const sourceLabel = `Steadfast (${steadfastArmorCount}x · Aiming ADS)`;
    resistanceBreakdowns.push({ res: "dr", source: sourceLabel, val: totalDr });
    activeTacticalTags.push(`Steadfast (+${totalDr} DR While Aiming)`);
  }

  // 8. Compute Mutant's Armor Biometric Modifier
  // +10 DR & +10 ER per piece if player is mutated.
  if (mutantsArmorCount > 0 && hasMutations) {
    const totalRes = mutantsArmorCount * 10;
    layer.dr += totalRes;
    layer.er += totalRes;

    const sourceLabel = `Mutant's (${mutantsArmorCount}x · Mutated)`;
    resistanceBreakdowns.push(
      { res: "dr", source: sourceLabel, val: totalRes },
      { res: "er", source: sourceLabel, val: totalRes }
    );
    activeTacticalTags.push(`Mutant's (+${totalRes} DR/ER)`);
  }

  // 9. Compute Overeater's Armor Mitigation Tag
  // 6% damage reduction per piece when fully fed & hydrated (30% on 5-piece).
  if (overeatersArmorCount > 0 && !isGhoul && isWellFedAndHydrated) {
    const mitigationPct = overeatersArmorCount * 6;
    activeTacticalTags.push(`Overeater's (-${mitigationPct}% Dmg Taken · Well Fed/Hydrated)`);
  }

  // 10. Compute Sentinel's & Cavalier's Tactical Tags
  if (sentinelsArmorCount > 0 && isStationary) {
    const mitigationPct = sentinelsArmorCount * 15;
    activeTacticalTags.push(`Sentinel's (-${mitigationPct}% Dmg Taken · Stationary)`);
  }

  if (cavaliersArmorCount > 0 && isSprinting) {
    const mitigationPct = cavaliersArmorCount * 15;
    activeTacticalTags.push(`Cavalier's (-${mitigationPct}% Dmg Taken · Sprinting)`);
  }

  // 11. Compute Weapon Tactical Stance & Biometric Tags
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
