"use client";

import * as React from "react";
import { triggerBuilderAchievement } from "@/actions/builder-achievements";
import { calculateAggregatedBuffSpecial } from "@/lib/builder/buff-stacking-engine";
import { getWeaponMaxLevel } from "@/lib/builder/combat-firepower-engine";
import {
  getArmorSetRow,
  getArmorSetMaxLevel,
} from "@/lib/builder/armor-sets";
import { getPowerArmorMaxLevel } from "@/lib/builder/power-armor-frame-data";
import {
  BASE_GEAR_PIECES,
  formatBaseOptionLabel,
  getBaseGearPiece,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";
import {
  findModByIdOrSlug,
  weaponSubMatches,
} from "@/lib/builder/compatibility";
import {
  defaultPayload,
  normalizeBuilderPayload,
} from "@/lib/builder/normalize-builder-payload";
import {
  applyChassisSelection,
  applyPowerArmorSnapshot,
  applyRegularSnapshot,
  armorModeOf,
  defaultChassisIdForMode,
  snapshotPowerArmorLoadout,
  snapshotRegularLoadout,
  type ArmorMode,
  type PowerArmorLoadoutSnapshot,
  type RegularLoadoutSnapshot,
} from "@/lib/builder/loadout-mode";
import {
  DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  type BuilderModDTO,
  type BuilderPayload,
} from "@/lib/builder/types";
import {
  BUILDER_STORAGE_KEYS,
  perkLoadoutSlotKey,
} from "@/lib/builder/storage-keys";
import {
  defaultWeaponInnateCrafting,
  calculateWeaponInnateAggregate,
  type WeaponInnateSlotKey,
  type WeaponInnateAggregateEffects,
} from "@/lib/builder/weapon-piece-mods";
import type { CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";
import { areEquippedCardsEqual } from "@/lib/perks/catalog";
import type { NukesDragonsParsedBuild } from "@/lib/perks/nukes-dragons-parser";

export interface UseBuilderPayloadProps {
  initialPayload?: BuilderPayload;
  readOnly?: boolean;
  isMounted: boolean;
  mods: BuilderModDTO[];
  onClearPick?: () => void;
}

export interface UseBuilderPayloadResult {
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  activeWeaponId: string;
  setActiveWeaponId: React.Dispatch<React.SetStateAction<string>>;
  activeChassisId: string;
  setActiveChassisId: React.Dispatch<React.SetStateAction<string>>;
  savedLoadouts: Array<{ id: string; name: string; payload: BuilderPayload }>;
  setSavedLoadouts: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; payload: BuilderPayload }>
    >
  >;
  activeLoadoutIndex: number | null;
  setActiveLoadoutIndex: React.Dispatch<React.SetStateAction<number | null>>;
  switchboardState: CombatSwitchboardState | null;
  setSwitchboardState: React.Dispatch<
    React.SetStateAction<CombatSwitchboardState | null>
  >;
  equippedPerkCards: Array<{ cardId: string; rank: number }>;
  setEquippedPerkCards: React.Dispatch<
    React.SetStateAction<Array<{ cardId: string; rank: number }>>
  >;
  isNdImportOpen: boolean;
  setIsNdImportOpen: React.Dispatch<React.SetStateAction<boolean>>;
  importedBuildForPerkBuilder: {
    build: NukesDragonsParsedBuild;
    timestamp: number;
  } | null;
  setImportedBuildForPerkBuilder: React.Dispatch<
    React.SetStateAction<{
      build: NukesDragonsParsedBuild;
      timestamp: number;
    } | null>
  >;
  piece: BaseGearPiece;
  pieceMaxLevel: number | null;
  activeWeaponPiece: BaseGearPiece;
  activeWeaponAttachments: WeaponInnateAggregateEffects;
  activeChassisPiece: BaseGearPiece;
  isPA: boolean;
  isMultiPiece: boolean;
  baseStarsContextLabel: string;
  buffSpecial: ReturnType<typeof calculateAggregatedBuffSpecial>;
  selectActiveWeapon: (id: string) => void;
  setBase: (id: string) => void;
  armorMode: ArmorMode;
  setArmorMode: (mode: ArmorMode) => void;
  completePowerArmorSet: () => void;
  setArmorCraftingField: (
    pieceIndex: number,
    field: "materialModId" | "miscModId",
    value: string,
  ) => void;
  clearPiece: (payloadIndex: number) => void;
  setWeaponInnateSlot: (slot: WeaponInnateSlotKey, modId: string) => void;
  saveLoadout: (slotIndex: number) => void;
  loadLoadout: (slotIndex: number) => void;
  handlePerkLoadoutChange: (data: {
    specials: Record<string, number>;
    equippedCards: { cardId: string; rank: number }[];
    legendaryPerks?: Array<{ id: string; rank: number }>;
    isGhoul?: boolean;
  }) => void;
  handleApplyNdBuild: (build: NukesDragonsParsedBuild) => void;
}

export function useBuilderPayload({
  initialPayload,
  readOnly = false,
  isMounted,
  mods,
  onClearPick,
}: UseBuilderPayloadProps): UseBuilderPayloadResult {
  const [payload, setPayload] = React.useState<BuilderPayload>(() => {
    if (initialPayload) {
      return normalizeBuilderPayload(initialPayload) || initialPayload;
    }
    return defaultPayload();
  });

  const [activeWeaponId, setActiveWeaponId] = React.useState<string>(() => {
    if (initialPayload?.activeWeaponPieceId) {
      return initialPayload.activeWeaponPieceId;
    }
    // Default to The Fixer (the advertised starter loadout), not whatever weapon happens to be first in the catalog.
    const defaultWeap =
      BASE_GEAR_PIECES.find((p) => p.id === "fixer")?.id ||
      BASE_GEAR_PIECES.find((p) => p.kind === "weapon")?.id ||
      "fixer";
    return defaultWeap;
  });
  const [activeChassisId, setActiveChassisId] = React.useState<string>(() => {
    const defaultArm =
      BASE_GEAR_PIECES.find((p) => p.kind === "armor")?.id ||
      "armor-set-civil-engineer";
    return defaultArm;
  });

  const [savedLoadouts, setSavedLoadouts] = React.useState<
    Array<{ id: string; name: string; payload: BuilderPayload }>
  >([]);

  const [isNdImportOpen, setIsNdImportOpen] = React.useState(false);
  const [importedBuildForPerkBuilder, setImportedBuildForPerkBuilder] =
    React.useState<{ build: NukesDragonsParsedBuild; timestamp: number } | null>(
      null,
    );

  const [activeLoadoutIndex, setActiveLoadoutIndex] = React.useState<
    number | null
  >(null);
  const internalUpdateRef = React.useRef(false);
  const [switchboardState, setSwitchboardState] =
    React.useState<CombatSwitchboardState | null>(() => {
      if (
        initialPayload?.switchboardState &&
        typeof initialPayload.switchboardState === "object"
      ) {
        return initialPayload.switchboardState as unknown as CombatSwitchboardState;
      }
      return null;
    });

  const [equippedPerkCards, setEquippedPerkCards] = React.useState<
    Array<{ cardId: string; rank: number }>
  >(() => {
    if (
      Array.isArray(initialPayload?.equippedPerkCards) &&
      initialPayload.equippedPerkCards.length > 0
    ) {
      return initialPayload.equippedPerkCards;
    }
    if (readOnly) return [];
    if (typeof window === "undefined") return [];
    try {
      const activePerkSlot =
        localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
      const perkSlotStr = localStorage.getItem(
        perkLoadoutSlotKey(activePerkSlot),
      );
      if (!perkSlotStr) return [];
      const perkData = JSON.parse(perkSlotStr);
      return Array.isArray(perkData.equippedCards)
        ? (perkData.equippedCards as Array<{ cardId: string; rank: number }>)
        : [];
    } catch {
      return [];
    }
  });

  const buffSpecial = React.useMemo(() => {
    if (!switchboardState)
      return {
        totals: { str: 0, per: 0, end: 0, cha: 0, int: 0, agi: 0, lck: 0 },
        breakdown: [],
      };
    return calculateAggregatedBuffSpecial({
      activeCampBuffs: switchboardState.activeCampBuffs,
      activeDrug: switchboardState.activeDrug,
      activeFood: switchboardState.activeFood,
      activeFoods: switchboardState.activeFoods,
      activeBobblehead: switchboardState.activeBobblehead,
      activeMagazine: switchboardState.activeMagazine,
      activeAlcohol: switchboardState.activeAlcohol,
      activeNukaCola: switchboardState.activeNukaCola,
      activeCompanion: switchboardState.activeCompanion,
      activeMutations: payload.mutationIds,
      hasStrangeInNumbers: payload.hasStrangeInNumbers,
    });
  }, [switchboardState, payload.mutationIds, payload.hasStrangeInNumbers]);

  // Synchronize state when initialPayload is passed (e.g. read-only shared build view)
  React.useEffect(() => {
    if (initialPayload) {
      const norm = normalizeBuilderPayload(initialPayload) || initialPayload;
      setPayload(norm);
      if (
        Array.isArray(norm.equippedPerkCards) &&
        norm.equippedPerkCards.length > 0
      ) {
        setEquippedPerkCards(norm.equippedPerkCards);
      }
      if (norm.activeWeaponPieceId) {
        setActiveWeaponId(norm.activeWeaponPieceId);
      }
      if (norm.switchboardState && typeof norm.switchboardState === "object") {
        setSwitchboardState(
          norm.switchboardState as unknown as CombatSwitchboardState,
        );
      }
      const base = getBaseGearPiece(norm.basePieceId);
      if (base?.kind === "weapon") {
        setActiveWeaponId(base.id);
      } else if (base?.kind === "armor" || base?.kind === "powerArmor") {
        setActiveChassisId(base.id);
      }
    }
  }, [initialPayload]);

  const clearPiece = React.useCallback((payloadIndex: number) => {
    setPayload((prev) => {
      const nextCrafting = [...prev.armorPieceCrafting];
      nextCrafting[payloadIndex] = { materialModId: "none", miscModId: "none" };

      const nextStars = [...prev.armorLegendaryModIds];
      nextStars[payloadIndex] = [null, null, null, null];

      let nextEquipped = prev.powerArmorPiecesEquipped;
      if (prev.equipmentKind === "powerArmor") {
        const mask = [...prev.powerArmorPiecesEquipped] as unknown as [
          boolean,
          boolean,
          boolean,
          boolean,
          boolean,
          boolean,
        ];
        mask[payloadIndex] = false;
        nextEquipped = mask;
      }

      return {
        ...prev,
        powerArmorPiecesEquipped: nextEquipped,
        armorPieceCrafting: nextCrafting,
        armorLegendaryModIds: nextStars,
      };
    });
  }, []);

  const saveLoadout = React.useCallback(
    (slotIndex: number) => {
      const name = prompt(
        "Enter a name for this loadout slot:",
        savedLoadouts[slotIndex]?.name || `Loadout ${slotIndex + 1}`,
      );
      if (name === null) return;
      setSavedLoadouts((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          id: String(slotIndex),
          name: name || `Loadout ${slotIndex + 1}`,
          payload: {
            ...payload,
            equippedPerkCards,
            activeWeaponPieceId: activeWeaponId,
            switchboardState: switchboardState
              ? (switchboardState as unknown as Record<string, unknown>)
              : undefined,
          },
        };

        const filledCount = next.filter(
          (x) => x !== null && x !== undefined,
        ).length;
        triggerBuilderAchievement("build_save");
        if (filledCount >= 10) triggerBuilderAchievement("build_full");

        return next;
      });
      setActiveLoadoutIndex(slotIndex);
    },
    [
      payload,
      savedLoadouts,
      equippedPerkCards,
      activeWeaponId,
      switchboardState,
    ],
  );

  const loadLoadout = React.useCallback(
    (slotIndex: number) => {
      const saved = savedLoadouts[slotIndex];
      if (saved) {
        internalUpdateRef.current = true;
        const norm = normalizeBuilderPayload(saved.payload) || saved.payload;
        setPayload(norm);
        if (Array.isArray(norm.equippedPerkCards)) {
          setEquippedPerkCards(norm.equippedPerkCards);
        }
        if (norm.activeWeaponPieceId) {
          setActiveWeaponId(norm.activeWeaponPieceId);
        }
        if (
          norm.switchboardState &&
          typeof norm.switchboardState === "object"
        ) {
          setSwitchboardState(
            norm.switchboardState as unknown as CombatSwitchboardState,
          );
        }
        const base = getBaseGearPiece(norm.basePieceId);
        if (base?.kind === "weapon") {
          setActiveWeaponId(base.id);
        } else if (base?.kind === "armor" || base?.kind === "powerArmor") {
          setActiveChassisId(base.id);
        }
        setActiveLoadoutIndex(slotIndex);
        triggerBuilderAchievement("build_stats");
        triggerBuilderAchievement("build_perks");
      }
    },
    [savedLoadouts],
  );

  React.useEffect(() => {
    if (isMounted && !readOnly) {
      localStorage.setItem(
        BUILDER_STORAGE_KEYS.payload,
        JSON.stringify(payload),
      );
    }
  }, [payload, isMounted, readOnly]);

  React.useEffect(() => {
    if (isMounted && !readOnly) {
      localStorage.setItem(
        BUILDER_STORAGE_KEYS.saves,
        JSON.stringify(savedLoadouts),
      );
    }
  }, [savedLoadouts, isMounted, readOnly]);

  React.useEffect(() => {
    if (!isMounted) return;
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }
    setActiveLoadoutIndex(null);
  }, [payload, isMounted]);

  const piece = getBaseGearPiece(payload.basePieceId) ?? BASE_GEAR_PIECES[0]!;

  const pieceMaxLevel = React.useMemo(() => {
    if (!piece) return null;
    if (piece.kind === "weapon") return getWeaponMaxLevel(piece.id);
    if (piece.kind === "armor" && piece.armorSetKey)
      return getArmorSetMaxLevel(piece.armorSetKey);
    if (piece.kind === "powerArmor") return getPowerArmorMaxLevel(piece.id);
    return null;
  }, [piece]);

  const activeWeaponPiece = React.useMemo(
    () =>
      getBaseGearPiece(activeWeaponId) ||
      BASE_GEAR_PIECES.find((p) => p.kind === "weapon") ||
      BASE_GEAR_PIECES[0],
    [activeWeaponId],
  );

  const activeWeaponAttachments = React.useMemo(() => {
    return calculateWeaponInnateAggregate(
      activeWeaponPiece.id,
      payload.weaponCrafting,
    );
  }, [activeWeaponPiece.id, payload.weaponCrafting]);

  const setWeaponInnateSlot = React.useCallback(
    (slot: WeaponInnateSlotKey, modId: string) => {
      setPayload((prev) => {
        const current =
          prev.weaponCrafting ??
          defaultWeaponInnateCrafting(activeWeaponPiece.id);
        const slotKey =
          slot === "receiver"
            ? "receiverId"
            : slot === "barrel"
            ? "barrelId"
            : slot === "stock"
            ? "stockId"
            : slot === "magazine"
            ? "magazineId"
            : slot === "sight"
            ? "sightId"
            : "muzzleId";
        return {
          ...prev,
          weaponCrafting: {
            ...current,
            [slotKey]: modId,
          },
        };
      });
    },
    [activeWeaponPiece.id],
  );

  const activeChassisPiece = React.useMemo(
    () =>
      getBaseGearPiece(activeChassisId) ||
      BASE_GEAR_PIECES.find((p) => p.kind === "armor") ||
      BASE_GEAR_PIECES[0],
    [activeChassisId],
  );

  const isPA =
    activeChassisPiece.kind === "powerArmor" || piece.kind === "powerArmor";
  const isMultiPiece = true;
  const baseStarsContextLabel = React.useMemo(() => {
    if (activeChassisPiece.kind === "armor" && activeChassisPiece.armorSetKey) {
      return (
        getArmorSetRow(activeChassisPiece.armorSetKey)?.label ??
        activeChassisPiece.label
      );
    }
    return formatBaseOptionLabel(activeChassisPiece);
  }, [activeChassisPiece]);

  React.useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      equipmentKind: piece.kind,
      weaponSub:
        piece.kind === "weapon" ? (piece.weaponSub ?? prev.weaponSub) : null,
    }));
  }, [piece.id, piece.kind, piece.weaponSub]);

  const selectActiveWeapon = React.useCallback(
    (id: string) => {
      const next = getBaseGearPiece(id);
      if (!next || next.kind !== "weapon") return;
      setActiveWeaponId(id);
      setPayload((p) => {
        const prevWeaponId = p.activeWeaponPieceId || activeWeaponId;
        const isPrevMelee =
          getBaseGearPiece(prevWeaponId)?.weaponSub === "melee";
        const isNextMelee = next.weaponSub === "melee";
        const nextCrafting =
          !p.weaponCrafting || isPrevMelee !== isNextMelee
            ? defaultWeaponInnateCrafting(id)
            : p.weaponCrafting;

        // Sanitize legendary stars if transitioning between melee and ranged
        const nextStars = [...p.legendaryModIds] as [
          string | null,
          string | null,
          string | null,
          string | null,
        ];
        if (isPrevMelee !== isNextMelee) {
          for (let s = 0; s < 4; s++) {
            const starId = nextStars[s];
            if (starId) {
              const mod = findModByIdOrSlug(mods, starId, s + 1);
              if (mod && !weaponSubMatches(mod, next)) {
                nextStars[s] = null;
              }
            }
          }
        }

        return {
          ...p,
          activeWeaponPieceId: id,
          legendaryModIds: nextStars,
          weaponCrafting: nextCrafting,
          ...(p.equipmentKind === "weapon"
            ? { basePieceId: id, weaponSub: next.weaponSub ?? null }
            : {}),
        };
      });
      onClearPick?.();
    },
    [activeWeaponId, mods, onClearPick],
  );

  // Mode memory: the regular-armor and power-armor bays edit the same payload slots, so each
  // mode's per-slot state is parked here while the other mode is active and restored on the way
  // back. Component state only; the shared payload (schema v5) is unchanged.
  const regularSnapshotRef = React.useRef<RegularLoadoutSnapshot | null>(null);
  const powerArmorSnapshotRef = React.useRef<PowerArmorLoadoutSnapshot | null>(null);

  const parkOutgoingMode = React.useCallback(
    (p: BuilderPayload, nextMode: ArmorMode) => {
      const current = getBaseGearPiece(activeChassisId);
      const currentMode: ArmorMode = current ? armorModeOf(current) : "regular";
      if (currentMode === nextMode) return;
      if (currentMode === "regular") {
        regularSnapshotRef.current = snapshotRegularLoadout(p, activeChassisId);
      } else {
        powerArmorSnapshotRef.current = snapshotPowerArmorLoadout(p, activeChassisId);
      }
    },
    [activeChassisId],
  );

  const setBase = React.useCallback(
    (id: string) => {
      const next = getBaseGearPiece(id);
      if (!next) return;
      if (next.kind === "weapon") {
        selectActiveWeapon(id);
      } else if (next.kind === "armor" || next.kind === "powerArmor") {
        setActiveChassisId(id);
        setPayload((p) => {
          parkOutgoingMode(p, armorModeOf(next));
          return applyChassisSelection(p, next);
        });
      } else if (next.kind === "underarmor") {
        if (next.defaultUnderarmorShellId) {
          setPayload((p) => ({
            ...p,
            underarmor: {
              ...p.underarmor,
              shellId: next.defaultUnderarmorShellId!,
            },
          }));
        }
      }
      onClearPick?.();
    },
    [selectActiveWeapon, onClearPick, parkOutgoingMode],
  );

  const armorMode: ArmorMode = armorModeOf(activeChassisPiece);

  /** Switch between regular armor and power armor, restoring that mode's parked loadout. */
  const setArmorMode = React.useCallback(
    (mode: ArmorMode) => {
      if (mode === armorMode) return;
      const snap =
        mode === "regular" ? regularSnapshotRef.current : powerArmorSnapshotRef.current;
      const targetId =
        (mode === "regular"
          ? (snap as RegularLoadoutSnapshot | null)?.chassisId
          : (snap as PowerArmorLoadoutSnapshot | null)?.frameId) ??
        defaultChassisIdForMode(mode);
      const target = getBaseGearPiece(targetId) ?? getBaseGearPiece(defaultChassisIdForMode(mode))!;
      setActiveChassisId(target.id);
      setPayload((p) => {
        parkOutgoingMode(p, mode);
        if (mode === "regular") {
          return regularSnapshotRef.current
            ? applyRegularSnapshot(p, regularSnapshotRef.current)
            : applyChassisSelection(p, target);
        }
        return powerArmorSnapshotRef.current
          ? applyPowerArmorSnapshot(p, powerArmorSnapshotRef.current)
          : applyChassisSelection(p, target);
      });
      onClearPick?.();
    },
    [armorMode, parkOutgoingMode, onClearPick],
  );

  /** Fill every power armor attach point (N&D's "add missing pieces"). */
  const completePowerArmorSet = React.useCallback(() => {
    setPayload((p) => ({
      ...p,
      powerArmorPiecesEquipped: DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
    }));
  }, []);

  const setArmorCraftingField = React.useCallback(
    (
      pieceIndex: number,
      field: "materialModId" | "miscModId",
      value: string,
    ) => {
      setPayload((p) => {
        const nextCraft = p.armorPieceCrafting.map((row, i) =>
          i === pieceIndex ? { ...row, [field]: value } : row,
        );
        return { ...p, armorPieceCrafting: nextCraft };
      });
    },
    [],
  );

  const handlePerkLoadoutChange = React.useCallback(
    (data: {
      specials: Record<string, number>;
      equippedCards: { cardId: string; rank: number }[];
      legendaryPerks?: Array<{ id: string; rank: number }>;
      isGhoul?: boolean;
    }) => {
      setEquippedPerkCards((prev) => {
        if (areEquippedCardsEqual(prev, data.equippedCards)) {
          return prev;
        }
        return data.equippedCards;
      });
      setPayload((prev) => {
        const nextSpecials = {
          str: data.specials.S ?? prev.baseSpecial?.str ?? 1,
          per: data.specials.P ?? prev.baseSpecial?.per ?? 1,
          end: data.specials.E ?? prev.baseSpecial?.end ?? 1,
          cha: data.specials.C ?? prev.baseSpecial?.cha ?? 1,
          int: data.specials.I ?? prev.baseSpecial?.int ?? 1,
          agi: data.specials.A ?? prev.baseSpecial?.agi ?? 1,
          lck: data.specials.L ?? prev.baseSpecial?.lck ?? 1,
        };
        const nextLegPerks =
          data.legendaryPerks && data.legendaryPerks.length > 0
            ? data.legendaryPerks.map((lp) => lp.id)
            : prev.legendaryPerkIds;
        const nextGhoul =
          data.isGhoul !== undefined ? data.isGhoul : prev.ghoul;

        const specialsSame =
          prev.baseSpecial?.str === nextSpecials.str &&
          prev.baseSpecial?.per === nextSpecials.per &&
          prev.baseSpecial?.end === nextSpecials.end &&
          prev.baseSpecial?.cha === nextSpecials.cha &&
          prev.baseSpecial?.int === nextSpecials.int &&
          prev.baseSpecial?.agi === nextSpecials.agi &&
          prev.baseSpecial?.lck === nextSpecials.lck;

        const cardsSame = areEquippedCardsEqual(
          prev.equippedPerkCards,
          data.equippedCards,
        );
        const ghoulSame = prev.ghoul === nextGhoul;
        const legSame =
          prev.legendaryPerkIds?.length === nextLegPerks?.length &&
          (prev.legendaryPerkIds || []).every(
            (id, idx) => id === nextLegPerks?.[idx],
          );

        if (specialsSame && cardsSame && ghoulSame && legSame) {
          return prev;
        }

        return {
          ...prev,
          baseSpecial: nextSpecials,
          legendaryPerkIds: nextLegPerks,
          ghoul: nextGhoul,
          equippedPerkCards: data.equippedCards,
        };
      });
    },
    [],
  );

  const handleApplyNdBuild = React.useCallback(
    (build: NukesDragonsParsedBuild) => {
      // Determine legendary cards: imported or preserved from active equipped
      const importedLegCards = (build.legendaryPerks || []).map((lp) => ({
        cardId: lp.id,
        rank: lp.rank,
      }));
      const existingLegCards = equippedPerkCards.filter((c) =>
        c.cardId.startsWith("legendary-"),
      );
      const finalLegCards =
        importedLegCards.length > 0 ? importedLegCards : existingLegCards;
      const allEquipped = [...build.equippedCards, ...finalLegCards];

      setPayload((prev) => ({
        ...prev,
        baseSpecial: { ...build.specials },
        legendaryPerkIds: finalLegCards.map((p) => p.cardId),
        ghoul: build.isGhoul ? true : prev.ghoul,
      }));
      setEquippedPerkCards(allEquipped);

      // Forward import trigger to PerkBuilder
      setImportedBuildForPerkBuilder({ build, timestamp: Date.now() });

      try {
        const activePerkSlot =
          localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
        localStorage.setItem(
          perkLoadoutSlotKey(activePerkSlot),
          JSON.stringify({
            specials: {
              S: build.specials.str,
              P: build.specials.per,
              E: build.specials.end,
              C: build.specials.cha,
              I: build.specials.int,
              A: build.specials.agi,
              L: build.specials.lck,
            },
            equippedCards: allEquipped,
          }),
        );
        if (finalLegCards.length > 0) {
          localStorage.setItem(
            BUILDER_STORAGE_KEYS.legendaryPerkIds,
            JSON.stringify(finalLegCards.map((lp) => lp.cardId)),
          );
        }
      } catch {
        // Ignore local storage write errors
      }

      triggerBuilderAchievement("build_specials");
      triggerBuilderAchievement("build_perks");
    },
    [equippedPerkCards],
  );

  return {
    payload,
    setPayload,
    activeWeaponId,
    setActiveWeaponId,
    activeChassisId,
    setActiveChassisId,
    savedLoadouts,
    setSavedLoadouts,
    activeLoadoutIndex,
    setActiveLoadoutIndex,
    switchboardState,
    setSwitchboardState,
    equippedPerkCards,
    setEquippedPerkCards,
    isNdImportOpen,
    setIsNdImportOpen,
    importedBuildForPerkBuilder,
    setImportedBuildForPerkBuilder,
    piece,
    pieceMaxLevel,
    activeWeaponPiece,
    activeWeaponAttachments,
    activeChassisPiece,
    isPA,
    isMultiPiece,
    baseStarsContextLabel,
    buffSpecial,
    selectActiveWeapon,
    setBase,
    armorMode,
    setArmorMode,
    completePowerArmorSet,
    setArmorCraftingField,
    clearPiece,
    setWeaponInnateSlot,
    saveLoadout,
    loadLoadout,
    handlePerkLoadoutChange,
    handleApplyNdBuild,
  };
}
