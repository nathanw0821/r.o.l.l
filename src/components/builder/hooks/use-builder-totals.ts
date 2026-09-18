import * as React from "react";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import type { CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";
import { getArmorSetRow } from "@/lib/builder/armor-sets";
import { armorCraftingEffectLayers } from "@/lib/builder/armor-piece-mods";
import {
  aggregateEffectMath,
  getGroupedLegendaryEffects,
  listEquippedLegendariesWithBenchLabels,
  listEquippedModsInBenchOrder,
} from "@/lib/builder/compatibility";
import {
  getPowerArmorEquippedFlatStats,
  powerArmorFrameIntrinsicEffectMath,
} from "@/lib/builder/power-armor-stats";
import { sandboxMutationMathLayer } from "@/lib/builder/sandbox-mutations";
import {
  calculateDefensiveProfile,
  type EquippedPerkCardItem,
} from "@/lib/builder/perk-defensive-layer";
import { calculateStanceAndBiometricModifiers } from "@/lib/builder/stance-biometrics-engine";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES,
} from "@/lib/builder/underarmor";

export interface UseBuilderTotalsParams {
  payload: BuilderPayload;
  mods: BuilderModDTO[];
  activeChassisPiece: BaseGearPiece;
  piece: BaseGearPiece;
  isPA: boolean;
  equippedPerkCards: EquippedPerkCardItem[];
  switchboardState: CombatSwitchboardState | null;
  /** Bullet Shield only counts while a heavy gun is being fired. */
  isFiringHeavyGun?: boolean;
}

export function useBuilderTotals({
  payload,
  mods,
  activeChassisPiece,
  piece,
  isPA,
  equippedPerkCards,
  switchboardState,
  isFiringHeavyGun = false,
}: UseBuilderTotalsParams) {
  const equippedModsOrdered = React.useMemo(
    () => listEquippedModsInBenchOrder(payload, mods),
    [mods, payload],
  );

  const equippedLegendaryBenchLines = React.useMemo(
    () => listEquippedLegendariesWithBenchLabels(payload, mods),
    [mods, payload],
  );

  const groupedLegendaryEffects = React.useMemo(
    () => getGroupedLegendaryEffects(equippedLegendaryBenchLines),
    [equippedLegendaryBenchLines],
  );

  const inPowerArmor =
    isPA || activeChassisPiece.kind === "powerArmor" || piece.kind === "powerArmor";

  const underLayers = React.useMemo(() => {
    // Underarmor resistances (lining) and SPECIAL bonuses (style) are strictly SUPPRESSED when in Power Armor!
    if (inPowerArmor) return [];
    const layers: Record<string, number>[] = [];
    const shell = findUnderarmorOption(
      UNDERARMOR_SHELLS,
      payload.underarmor.shellId,
    );
    const lining = findUnderarmorOption(
      UNDERARMOR_LININGS,
      payload.underarmor.liningId,
    );
    const style = findUnderarmorOption(
      UNDERARMOR_STYLES,
      payload.underarmor.styleId,
    );
    if (shell?.effectMath) layers.push(shell.effectMath);
    if (lining?.effectMath) layers.push(lining.effectMath);
    if (style?.effectMath) layers.push(style.effectMath);
    return layers;
  }, [payload.underarmor, inPowerArmor]);

  const armorCraftingLayers = React.useMemo(() => {
    return armorCraftingEffectLayers(
      payload.armorPieceCrafting,
      isPA,
    );
  }, [isPA, payload.armorPieceCrafting]);

  const baseArmorStats = React.useMemo(() => {
    const chassis = activeChassisPiece;
    if (chassis.kind === "armor" && chassis.armorSetKey) {
      return getArmorSetRow(chassis.armorSetKey)?.stats ?? null;
    }
    if (chassis.kind === "powerArmor") {
      return getPowerArmorEquippedFlatStats(
        chassis.id,
        payload.powerArmorHelmetId,
        payload.powerArmorPiecesEquipped,
      );
    }
    return null;
  }, [
    activeChassisPiece,
    payload.powerArmorHelmetId,
    payload.powerArmorPiecesEquipped,
  ]);

  const powerArmorFrameIntrinsicLayer = React.useMemo(() => {
    if (!isPA) return null;
    return powerArmorFrameIntrinsicEffectMath();
  }, [isPA]);

  const mutationLayer = React.useMemo(
    () => {
      const cfRank = equippedPerkCards.find((c) => c.cardId === "class-freak")?.rank ?? 0;
      return sandboxMutationMathLayer(
        payload.mutationIds,
        payload.ignoreMutationPenalties,
        {
          strangeInNumbersMutatedTeammates:
            payload.hasStrangeInNumbers && payload.mutationIds.length > 0
              ? 4
              : 0,
          classFreakRank: cfRank,
        },
      );
    },
    [
      payload.mutationIds,
      payload.ignoreMutationPenalties,
      payload.hasStrangeInNumbers,
      equippedPerkCards,
    ],
  );

  const intrinsicBenchTotals = React.useMemo(
    () =>
      aggregateEffectMath([], {
        ghoul: payload.ghoul,
        extraLayers: [
          ...armorCraftingLayers,
          ...(powerArmorFrameIntrinsicLayer
            ? [powerArmorFrameIntrinsicLayer]
            : []),
        ],
        baseArmorStats,
        baseSpecial: payload.baseSpecial,
      }),
    [
      payload.ghoul,
      armorCraftingLayers,
      powerArmorFrameIntrinsicLayer,
      baseArmorStats,
      payload.baseSpecial,
    ],
  );

  const stanceAndBiometricsLayer = React.useMemo(() => {
    return calculateStanceAndBiometricModifiers({
      switchboard: switchboardState,
      equippedMods: equippedModsOrdered,
      isGhoul: payload.ghoul,
      activeMutations: payload.mutationIds,
    });
  }, [switchboardState, equippedModsOrdered, payload.ghoul, payload.mutationIds]);

  const preDefenseLayers = React.useMemo(
    () => [
      ...(piece.kind !== "powerArmor" ? underLayers : []),
      ...armorCraftingLayers,
      ...(powerArmorFrameIntrinsicLayer ? [powerArmorFrameIntrinsicLayer] : []),
      ...(mutationLayer ? [mutationLayer] : []),
      stanceAndBiometricsLayer.layer,
    ],
    [
      piece.kind,
      underLayers,
      armorCraftingLayers,
      powerArmorFrameIntrinsicLayer,
      mutationLayer,
      stanceAndBiometricsLayer.layer,
    ],
  );

  /**
   * Totals before the perk deck's defensive layer: the SPECIAL-scaled defensive
   * perks (Barbarian, Evasive, Lone Wanderer, ...) read the buffed SPECIAL from
   * here, and the perk layer only ever adds resistances, so there is no cycle.
   */
  const preDefenseTotals = React.useMemo(
    () =>
      aggregateEffectMath(equippedModsOrdered, {
        ghoul: payload.ghoul,
        extraLayers: preDefenseLayers,
        baseArmorStats,
        armorPieceSetKeys: payload.armorPieceSetKeys,
        baseSpecial: payload.baseSpecial,
        legendaryPerkIds: payload.legendaryPerkIds,
      }),
    [
      equippedModsOrdered,
      payload.ghoul,
      preDefenseLayers,
      baseArmorStats,
      payload.armorPieceSetKeys,
      payload.baseSpecial,
      payload.legendaryPerkIds,
    ],
  );

  const armorModSlugs = React.useMemo(
    () =>
      equippedModsOrdered
        .filter((m) => m.allowedOnArmor || m.allowedOnPowerArmor || m.category === "Armor")
        .map((m) => m.slug),
    [equippedModsOrdered],
  );

  const matchingSet = React.useMemo(() => {
    if (activeChassisPiece.kind === "powerArmor") {
      return payload.powerArmorPiecesEquipped.every(Boolean);
    }
    if (activeChassisPiece.kind === "armor") {
      const setKey = activeChassisPiece.armorSetKey;
      if (!setKey) return false;
      return (payload.armorPieceSetKeys ?? []).every((k) => !k || k === setKey);
    }
    return false;
  }, [activeChassisPiece, payload.powerArmorPiecesEquipped, payload.armorPieceSetKeys]);

  const defensiveProfile = React.useMemo(() => {
    const stance = switchboardState?.combatStance;
    const isOnTeam = (switchboardState?.teamState ?? "casual") !== "solo";
    return calculateDefensiveProfile(equippedPerkCards, {
      isPowerArmor: inPowerArmor,
      special: {
        str: preDefenseTotals.str,
        per: preDefenseTotals.per,
        end: preDefenseTotals.end,
        cha: preDefenseTotals.cha,
        int: preDefenseTotals.int,
        agi: preDefenseTotals.agi,
        lck: preDefenseTotals.lck,
      },
      healthPct: switchboardState?.healthPct ?? 100,
      isOnTeam,
      teammates: isOnTeam ? 3 : 0,
      isSprinting: Boolean(stance?.isSprinting),
      isStationary: Boolean(stance?.isStationary),
      isFiringHeavyGun,
      armorPieceCount: inPowerArmor
        ? payload.powerArmorPiecesEquipped.filter(Boolean).length
        : 5,
      matchingSet,
      wearingNoArmor:
        activeChassisPiece.kind !== "armor" && activeChassisPiece.kind !== "powerArmor",
      isOverEncumbered: false,
      // Ironclad multiplies the worn armor's own DR/ER (base table + crafting + PA frame).
      baseArmor: { dr: intrinsicBenchTotals.dr, er: intrinsicBenchTotals.er },
      equippedModSlugs: armorModSlugs,
      mutationCount: payload.mutationIds.length,
      bulletStormStacks: switchboardState?.bulletStormStacks ?? 0,
      killStreak: switchboardState?.killStreak ?? switchboardState?.adrenalineStacks ?? 0,
      // Unverified innate PA reduction: 0 unless the switchboard toggle sets it.
      powerArmorInnatePct: switchboardState?.powerArmorInnatePct ?? 0,
    });
  }, [
    equippedPerkCards,
    inPowerArmor,
    preDefenseTotals,
    switchboardState,
    isFiringHeavyGun,
    payload.powerArmorPiecesEquipped,
    payload.mutationIds.length,
    matchingSet,
    activeChassisPiece.kind,
    intrinsicBenchTotals.dr,
    intrinsicBenchTotals.er,
    armorModSlugs,
  ]);

  /** Flat resist adds from the perk deck (old shape kept for the HUD breakdown). */
  const perkDeckDefensiveLayer = React.useMemo(
    () => (equippedPerkCards.length > 0 ? defensiveProfile.flat : null),
    [equippedPerkCards.length, defensiveProfile.flat],
  );

  const totals = React.useMemo(
    () =>
      aggregateEffectMath(equippedModsOrdered, {
        ghoul: payload.ghoul,
        extraLayers: [
          ...preDefenseLayers,
          ...(perkDeckDefensiveLayer ? [perkDeckDefensiveLayer] : []),
        ],
        baseArmorStats,
        armorPieceSetKeys: payload.armorPieceSetKeys,
        baseSpecial: payload.baseSpecial,
        legendaryPerkIds: payload.legendaryPerkIds,
      }),
    [
      equippedModsOrdered,
      payload.ghoul,
      preDefenseLayers,
      perkDeckDefensiveLayer,
      baseArmorStats,
      payload.armorPieceSetKeys,
      payload.baseSpecial,
      payload.legendaryPerkIds,
    ],
  );

  return {
    equippedModsOrdered,
    equippedLegendaryBenchLines,
    groupedLegendaryEffects,
    underLayers,
    armorCraftingLayers,
    baseArmorStats,
    powerArmorFrameIntrinsicLayer,
    mutationLayer,
    perkDeckDefensiveLayer,
    defensiveProfile,
    intrinsicBenchTotals,
    stanceAndBiometricsLayer,
    totals,
  };
}

export type UseBuilderTotalsResult = ReturnType<typeof useBuilderTotals>;
