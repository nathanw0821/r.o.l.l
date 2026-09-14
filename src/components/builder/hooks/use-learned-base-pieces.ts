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
  initialLearnedBasePieceIds = [],
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

  React.useEffect(() => {
    setLearnedBasePieceIds(new Set(initialLearnedBasePieceIds));
  }, [initialLearnedBasePieceIds]);

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
