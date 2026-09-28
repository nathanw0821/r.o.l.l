"use client";

import * as React from "react";
import Link from "next/link";
import BuilderGearSelector from "@/components/builder/builder-gear-selector";
import { isPowerArmorTorsoRowLearned, type BaseGearPiece } from "@/lib/builder/base-gear";
import { underarmorBasePieceIdForShell } from "@/lib/builder/loadout-mode";
import type { BuilderPayload } from "@/lib/builder/types";

export interface ArmoryMatrixSectionProps {
  payload: BuilderPayload;
  activeChassisPiece: BaseGearPiece;
  activeWeaponPiece: BaseGearPiece;
  isPA: boolean;
  learnedBasePieceIds: Set<string>;
  isSignedIn: boolean;
  pendingLearnedPieceId: string | null;
  toggleLearnedBasePiece: (pieceId: string, learned: boolean) => Promise<void> | void;
  learnedToggleError: string | null;
}

/**
 * The account ledger: which base-gear plans this account has learned. Read-only for the build
 * (equipping happens in the Chassis Bay); the IN BAY badge only reports what the bay holds.
 */
export default function ArmoryMatrixSection({
  payload,
  activeChassisPiece,
  activeWeaponPiece,
  isPA,
  learnedBasePieceIds,
  isSignedIn,
  pendingLearnedPieceId,
  toggleLearnedBasePiece,
  learnedToggleError,
}: ArmoryMatrixSectionProps) {
  const inBayIds = React.useMemo(() => {
    const ids = new Set<string>([activeChassisPiece.id, activeWeaponPiece.id]);
    const shellRow = isPA ? null : underarmorBasePieceIdForShell(payload.underarmor.shellId);
    if (shellRow) ids.add(shellRow);
    return ids;
  }, [activeChassisPiece.id, activeWeaponPiece.id, isPA, payload.underarmor.shellId]);

  return (
    <section aria-labelledby="armory-matrix-heading" className="mt-6">
      <div className="pip-terminal-panel p-4 rounded-xl space-y-3.5 font-mono">
        <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 id="armory-matrix-heading" className="text-xs font-black uppercase tracking-widest">
            &gt; CHASSIS &amp; GEAR ARMORY MATRIX
          </h2>
          <span className="text-2xs text-foreground/45 font-normal normal-case tracking-normal">
            Plan registry: what this account has learned. Equip gear in the Chassis Bay above.
          </span>
        </div>

        {!isSignedIn && (
          <p className="text-2xs text-foreground/60 border border-border/20 rounded px-3 py-2 bg-background/25">
            Learned plans are saved to your account.{" "}
            <Link href="/auth/sign-in" className="text-accent underline underline-offset-2 font-bold">
              Sign in
            </Link>{" "}
            to mark plans learned; the toggles are read-only as a guest.
          </p>
        )}

        <BuilderGearSelector
          mode="ledger"
          initialKind={isPA ? "powerArmor" : "armor"}
          inBayIds={inBayIds}
          learnedBasePieceIds={learnedBasePieceIds}
          isPowerArmorTorsoLearned={isPowerArmorTorsoRowLearned}
          onToggleLearned={(id, learned) => void toggleLearnedBasePiece(id, learned)}
          pendingLearnedPieceId={pendingLearnedPieceId}
          canToggle={isSignedIn}
        />

        {learnedToggleError ? (
          <p role="alert" className="text-xs text-danger font-bold">
            &gt;&gt; ERROR: {learnedToggleError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
