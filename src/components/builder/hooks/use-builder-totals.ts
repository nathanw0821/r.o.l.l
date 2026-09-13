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
  calculatePerkDeckDefensiveLayer,
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
}

export function useBuilderTotals({
  payload,
  mods,
  activeChassisPiece,
  piece,
  isPA,
  equippedPerkCards,
  switchboardState,
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

  const underLayers = React.useMemo(() => {
    // Underarmor resistances (lining) and SPECIAL bonuses (style) are strictly SUPPRESSED when in Power Armor!
    if (isPA || activeChassisPiece.kind === "powerArmor" || piece.kind === "powerArmor") return [];
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
  }, [payload.underarmor, isPA, activeChassisPiece.kind, piece.kind]);

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

  const perkDeckDefensiveLayer = React.useMemo(() => {
    return calculatePerkDeckDefensiveLayer(equippedPerkCards, {
      isPowerArmor: piece.kind === "powerArmor",
      strVal: payload.baseSpecial?.str || 1,
      agiVal: payload.baseSpecial?.agi || 1,
    });
  }, [piece.kind, payload.baseSpecial, equippedPerkCards]);

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

  const totals = React.useMemo(
    () =>
      aggregateEffectMath(equippedModsOrdered, {
        ghoul: payload.ghoul,
        extraLayers: [
          ...(piece.kind !== "powerArmor" ? underLayers : []),
          ...armorCraftingLayers,
          ...(powerArmorFrameIntrinsicLayer
            ? [powerArmorFrameIntrinsicLayer]
            : []),
          ...(mutationLayer ? [mutationLayer] : []),
          ...(perkDeckDefensiveLayer ? [perkDeckDefensiveLayer] : []),
          stanceAndBiometricsLayer.layer,
        ],
        baseArmorStats,
        armorPieceSetKeys: payload.armorPieceSetKeys,
        baseSpecial: payload.baseSpecial,
        legendaryPerkIds: payload.legendaryPerkIds,
      }),
    [
      equippedModsOrdered,
      payload.ghoul,
      underLayers,
      armorCraftingLayers,
      powerArmorFrameIntrinsicLayer,
      mutationLayer,
      perkDeckDefensiveLayer,
      stanceAndBiometricsLayer.layer,
      baseArmorStats,
      payload.armorPieceSetKeys,
      payload.baseSpecial,
      payload.legendaryPerkIds,
      piece.kind,
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
    intrinsicBenchTotals,
    stanceAndBiometricsLayer,
    totals,
  };
}

export type UseBuilderTotalsResult = ReturnType<typeof useBuilderTotals>;
