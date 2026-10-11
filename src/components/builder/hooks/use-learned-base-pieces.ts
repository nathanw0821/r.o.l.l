"use client";

import * as React from "react";
import { updateLearnedBasePiece } from "@/actions/learned-base-piece";
import {
  getBaseGearPiece,
  isPowerArmorTorsoBasePiece,
  isPowerArmorTorsoRowLearned,
  isTrackableBasePieceId,
  pairedPowerArmorHelmetId,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";

/** Stable empty default: a fresh `[]` per render would re-run the sync effect every render. */
const NO_LEARNED_IDS: readonly string[] = [];

export interface UseLearnedBasePiecesProps {
  initialLearnedBasePieceIds?: string[];
  isSignedIn: boolean;
  piece: BaseGearPiece;
}

export interface UseLearnedBasePiecesResult {
  learnedBasePieceIds: Set<string>;
  learnedToggleError: string | null;
  pendingLearnedPieceId: string | null;
  currentBaseLearned: boolean;
  toggleLearnedBasePiece: (pieceId: string, learned: boolean) => Promise<void>;
}

export function useLearnedBasePieces({
  initialLearnedBasePieceIds = NO_LEARNED_IDS as string[],
  isSignedIn,
  piece,
}: UseLearnedBasePiecesProps): UseLearnedBasePiecesResult {
  const [learnedBasePieceIds, setLearnedBasePieceIds] = React.useState(
    () => new Set(initialLearnedBasePieceIds),
  );
  const [learnedToggleError, setLearnedToggleError] = React.useState<
    string | null
  >(null);
  const [pendingLearnedPieceId, setPendingLearnedPieceId] = React.useState<
    string | null
  >(null);

  // Re-sync from the server list by content, not array identity: the shared loadout page
  // (`/l/[slug]`) passes no list, and an identity-keyed effect on a per-render `[]` set a new
  // Set every render until React threw "Maximum update depth exceeded" (2026-10-10).
  const initialLearnedKey = JSON.stringify(initialLearnedBasePieceIds);
  React.useEffect(() => {
    setLearnedBasePieceIds(new Set(JSON.parse(initialLearnedKey) as string[]));
  }, [initialLearnedKey]);

  const currentBaseLearned =
    isTrackableBasePieceId(piece.id) &&
    (piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)
      ? isPowerArmorTorsoRowLearned(piece.id, learnedBasePieceIds)
      : learnedBasePieceIds.has(piece.id));

  const toggleLearnedBasePiece = React.useCallback(
    async (pieceId: string, learned: boolean) => {
      setLearnedToggleError(null);
      if (!isSignedIn) return;
      const row = getBaseGearPiece(pieceId);
      const ids =
        row && isPowerArmorTorsoBasePiece(row)
          ? [pieceId, pairedPowerArmorHelmetId(pieceId)].filter(
              (x): x is string => Boolean(x),
            )
          : [pieceId];
      setPendingLearnedPieceId(pieceId);
      try {
        for (const id of ids) {
          await updateLearnedBasePiece({ basePieceId: id, learned });
        }
        setLearnedBasePieceIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) {
            if (learned) next.add(id);
            else next.delete(id);
          }
          return next;
        });
      } catch {
        setLearnedToggleError(
          "Could not update learned bases. Try signing in again.",
        );
      } finally {
        setPendingLearnedPieceId(null);
      }
    },
    [isSignedIn],
  );

  return {
    learnedBasePieceIds,
    learnedToggleError,
    pendingLearnedPieceId,
    currentBaseLearned,
    toggleLearnedBasePiece,
  };
}
