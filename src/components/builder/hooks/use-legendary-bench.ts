"use client";

import * as React from "react";
import type { ActivePick } from "@/lib/builder/active-pick";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import { filterModsForSlot } from "@/lib/builder/compatibility";
import { isGhoulDiscouragedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import { emptyArmorLegendaryGrid } from "@/lib/builder/normalize-builder-payload";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import type { LocalProgressMap } from "@/components/use-local-progress";
import { findLocalProgressEntry } from "@/lib/progress-lookup";

export interface UseLegendaryBenchProps {
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  mods: BuilderModDTO[];
  activeWeaponPiece: BaseGearPiece;
  activeChassisPiece: BaseGearPiece;
  localProgress: LocalProgressMap;
}

export interface UseLegendaryBenchResult {
  activePick: ActivePick;
  setActivePick: React.Dispatch<React.SetStateAction<ActivePick>>;
  slotQuery: string;
  setSlotQuery: React.Dispatch<React.SetStateAction<string>>;
  deferredSlotQuery: string;
  modalTrackerFilter: "all" | "unlocked" | "stash";
  setModalTrackerFilter: React.Dispatch<
    React.SetStateAction<"all" | "unlocked" | "stash">
  >;
  undoPayload: BuilderPayload | null;
  hasUndo: boolean;
  recommendedIds: Set<string>;
  optionsForActivePick: BuilderModDTO[];
  assignSlot: (modId: string) => void;
  clearStarSlot: (
    scope: "single" | "armorSet",
    pieceIndex: number | undefined,
    starIndex: number,
  ) => void;
  clearAllSelections: () => void;
  undoClear: () => void;
}

export function useLegendaryBench({
  payload,
  setPayload,
  mods,
  activeWeaponPiece,
  activeChassisPiece,
  localProgress,
}: UseLegendaryBenchProps): UseLegendaryBenchResult {
  const [undoPayload, setUndoPayload] = React.useState<BuilderPayload | null>(
    null,
  );
  const [modalTrackerFilter, setModalTrackerFilter] = React.useState<
    "all" | "unlocked" | "stash"
  >("all");
  const [activePick, setActivePick] = React.useState<ActivePick>(null);
  const [slotQuery, setSlotQuery] = React.useState("");
  const deferredSlotQuery = React.useDeferredValue(slotQuery);

  const clearAllSelections = React.useCallback(() => {
    setUndoPayload(payload);
    setPayload((p) => ({
      ...p,
      legendaryModIds: [null, null, null, null],
      armorLegendaryModIds: emptyArmorLegendaryGrid(),
      mutationIds: [],
      legendaryPerkIds: [],
      baseSpecial: {},
    }));
  }, [payload, setPayload]);

  const undoClear = React.useCallback(() => {
    if (undoPayload) {
      setPayload(undoPayload);
      setUndoPayload(null);
    }
  }, [undoPayload, setPayload]);

  const assignSlot = React.useCallback(
    (modId: string) => {
      if (!activePick) return;
      if (activePick.scope === "single") {
        setPayload((p) => {
          const next = [...p.legendaryModIds];
          next[activePick.starIndex] = modId;
          return { ...p, legendaryModIds: next };
        });
      } else {
        setPayload((p) => {
          const grid = p.armorLegendaryModIds.map((row) => [...row]);
          const row = [...grid[activePick.pieceIndex]!];
          row[activePick.starIndex] = modId;
          grid[activePick.pieceIndex] = row;
          return { ...p, armorLegendaryModIds: grid };
        });
      }
      setActivePick(null);
      setSlotQuery("");
    },
    [activePick, setPayload],
  );

  const recommendedIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (!activePick) return ids;
    if (activePick.scope === "armorSet") {
      for (let i = 0; i < payload.armorLegendaryModIds.length; i++) {
        if (i === activePick.pieceIndex) continue;
        const id = payload.armorLegendaryModIds[i]?.[activePick.starIndex];
        if (id) ids.add(id);
      }
    }
    return ids;
  }, [activePick, payload.armorLegendaryModIds]);

  const optionsForActivePick = React.useMemo(() => {
    if (!activePick) return [];
    const slotIndex = activePick.starIndex;
    const targetPiece =
      activePick.scope === "single" ? activeWeaponPiece : activeChassisPiece;
    const filtered = filterModsForSlot(mods, targetPiece, slotIndex, {
      ghoul: payload.ghoul,
    }).filter((m) => {
      const q = deferredSlotQuery.trim().toLowerCase();
      if (q) {
        const matchesQuery =
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (modalTrackerFilter !== "all") {
        const entry = findLocalProgressEntry(
          localProgress,
          m.id,
          m.name,
          `${m.starRank} Star`,
        );
        const isUnlocked =
          entry?.unlocked ?? m.trackerUnlock === "unlocked";
        const stashCount = entry?.modCount ?? 0;

        if (modalTrackerFilter === "unlocked" && !isUnlocked) return false;
        if (modalTrackerFilter === "stash" && stashCount <= 0) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const entryA = findLocalProgressEntry(
        localProgress,
        a.id,
        a.name,
        `${a.starRank} Star`,
      );
      const entryB = findLocalProgressEntry(
        localProgress,
        b.id,
        b.name,
        `${b.starRank} Star`,
      );
      const unlockedA =
        (entryA?.unlocked ?? a.trackerUnlock === "unlocked") ? 1 : 0;
      const unlockedB =
        (entryB?.unlocked ?? b.trackerUnlock === "unlocked") ? 1 : 0;
      const stashA = (entryA?.modCount ?? 0) > 0 ? 1 : 0;
      const stashB = (entryB?.modCount ?? 0) > 0 ? 1 : 0;

      const recA = recommendedIds.has(a.id) ? 1 : 0;
      const recB = recommendedIds.has(b.id) ? 1 : 0;
      if (recA !== recB) return recB - recA;

      // Status prioritization: unlocked > stash > locked
      const statusScoreA = unlockedA * 2 + stashA;
      const statusScoreB = unlockedB * 2 + stashB;
      if (statusScoreA !== statusScoreB) return statusScoreB - statusScoreA;

      if (payload.ghoul) {
        const discA = isGhoulDiscouragedLegendarySlug(a.slug) ? 1 : 0;
        const discB = isGhoulDiscouragedLegendarySlug(b.slug) ? 1 : 0;
        if (discA !== discB) return discA - discB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [
    mods,
    activeWeaponPiece,
    activeChassisPiece,
    activePick,
    deferredSlotQuery,
    modalTrackerFilter,
    localProgress,
    payload.ghoul,
    recommendedIds,
  ]);

  const clearStarSlot = React.useCallback(
    (
      scope: "single" | "armorSet",
      pieceIndex: number | undefined,
      starIndex: number,
    ) => {
      if (scope === "single") {
        setPayload((p) => {
          const next = [...p.legendaryModIds];
          next[starIndex] = null;
          return { ...p, legendaryModIds: next };
        });
        return;
      }
      if (pieceIndex === undefined) return;
      setPayload((p) => {
        const grid = p.armorLegendaryModIds.map((row) => [...row]);
        const row = [...grid[pieceIndex]!];
        row[starIndex] = null;
        grid[pieceIndex] = row;
        return { ...p, armorLegendaryModIds: grid };
      });
    },
    [setPayload],
  );

  return {
    activePick,
    setActivePick,
    slotQuery,
    setSlotQuery,
    deferredSlotQuery,
    modalTrackerFilter,
    setModalTrackerFilter,
    undoPayload,
    hasUndo: Boolean(undoPayload),
    recommendedIds,
    optionsForActivePick,
    assignSlot,
    clearStarSlot,
    clearAllSelections,
    undoClear,
  };
}
