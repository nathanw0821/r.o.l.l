"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BuilderGearSelector, { gearKindLabel } from "@/components/builder/builder-gear-selector";
import { isPowerArmorTorsoRowLearned } from "@/lib/builder/base-gear";
import type { BuilderEquipmentKind } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export type GearPickerDialogProps = {
  /** Category to pick from; `null` keeps the dialog closed. */
  kind: BuilderEquipmentKind | null;
  onClose: () => void;
  /** Called once with the chosen base id; the dialog closes itself afterwards. */
  onPick: (baseId: string) => void;
  inBayIds: ReadonlySet<string>;
  learnedBasePieceIds: ReadonlySet<string>;
  isCompactDensity?: boolean;
  /**
   * The button that opened the picker. Radix's modal dialog only returns focus to a DialogTrigger,
   * and this dialog is opened from ordinary buttons, so the opener is captured by the caller and
   * focused again on close.
   */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

const TITLE: Record<BuilderEquipmentKind, string> = {
  weapon: "> CHANGE WEAPON",
  armor: "> CHANGE ARMOR SET",
  powerArmor: "> CHANGE POWER ARMOR FRAME",
  underarmor: "> CHANGE UNDERARMOR SHELL",
};

const HINT: Record<BuilderEquipmentKind, string> = {
  weapon: "One weapon is readied in the bay. Its attachments and stars stay where they fit the new class.",
  armor: "Five body slots follow the set you pick; mixed sets are set per slot in the bay afterwards.",
  powerArmor: "The frame fills all six attach points. Un-equip pieces in the bay for a partial set.",
  underarmor: "Shell only. Lining and style are set in the bay; both are removed while in power armor.",
};

/**
 * Scoped gear picker opened from the Chassis Bay: one category, search, Equip closes it.
 * Radix handles focus trapping, Escape and returning focus to the opening button.
 */
export default function GearPickerDialog({
  kind,
  onClose,
  onPick,
  inBayIds,
  learnedBasePieceIds,
  isCompactDensity,
  returnFocusRef,
}: GearPickerDialogProps) {
  return (
    <Dialog open={kind !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
        className={cn(
          "pip-terminal-panel flex max-h-[min(94vh,52rem)] flex-col gap-0 border-accent/40 rounded-xl overflow-hidden font-mono",
          // Phones: a bottom sheet instead of a centred card.
          "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none",
          isCompactDensity ? "sm:max-w-2xl p-3 sm:p-4" : "sm:max-w-3xl p-4 sm:p-6",
        )}
      >
        {kind && (
          <>
            <DialogHeader className="shrink-0 pr-8 relative z-10">
              <DialogTitle
                className={cn(
                  "font-black uppercase tracking-widest text-accent",
                  isCompactDensity ? "text-xs" : "text-sm",
                )}
              >
                {TITLE[kind]}
              </DialogTitle>
              <DialogDescription className="text-2xs text-foreground/50 uppercase tracking-widest leading-relaxed">
                {HINT[kind]}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 min-h-0 overflow-y-auto relative z-10">
              <BuilderGearSelector
                mode="pick"
                kind={kind}
                inBayIds={inBayIds}
                learnedBasePieceIds={learnedBasePieceIds}
                isPowerArmorTorsoLearned={isPowerArmorTorsoRowLearned}
                autoFocusSearch={!isCompactDensity}
                onPick={(id) => {
                  onPick(id);
                  onClose();
                }}
              />
            </div>
            <p className="mt-2 shrink-0 text-3xs text-foreground/40 uppercase tracking-widest">
              {gearKindLabel(kind)} · Esc closes without changes
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
