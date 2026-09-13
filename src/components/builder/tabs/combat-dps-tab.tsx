"use client";

import BuilderFirepowerMatrix from "@/components/builder/builder-firepower-matrix";
import type { CombatFirepowerResult } from "@/lib/builder/combat-firepower-engine";
import { cn } from "@/lib/utils";

/** Master tab 4: Combat DPS & V.A.T.S., wrapping <BuilderFirepowerMatrix>. */
export type CombatDpsTabProps = {
  active: boolean;
  weaponFirepowerResult: CombatFirepowerResult | null;
};

export default function CombatDpsTab({ active, weaponFirepowerResult }: CombatDpsTabProps) {
  return (
<div className={cn("space-y-4 animate-in fade-in duration-200", active ? "block" : "hidden")}>
  {weaponFirepowerResult ? (
    <BuilderFirepowerMatrix firepower={weaponFirepowerResult} />
  ) : (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400 font-mono">
      &gt;&gt; NO WEAPON CONFIGURED. Switch to [ 1. GEAR &amp; ARMORY ] to select your weapon and mods.
    </div>
  )}
</div>
  );
}
