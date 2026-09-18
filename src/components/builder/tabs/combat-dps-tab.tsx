"use client";

import Link from "next/link";

import BuilderFirepowerMatrix from "@/components/builder/builder-firepower-matrix";
import type { CombatFirepowerResult } from "@/lib/builder/combat-firepower-engine";
import { cn } from "@/lib/utils";

/** Master tab 4: Combat DPS & V.A.T.S., wrapping <BuilderFirepowerMatrix>. */
export type CombatDpsTabProps = {
  active: boolean;
  weaponFirepowerResult: CombatFirepowerResult | null;
  /** Label of the weapon the numbers are computed for, so nobody reads them as their own by accident. */
  weaponLabel?: string | null;
};

export default function CombatDpsTab({ active, weaponFirepowerResult, weaponLabel }: CombatDpsTabProps) {
  return (
<div className={cn("space-y-4 animate-in fade-in duration-200", active ? "block" : "hidden")}>
  {weaponFirepowerResult ? (
    <>
      {weaponLabel ? (
        <p className="rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2 text-sm font-mono text-slate-300">
          Showing damage for <span className="font-bold text-amber-300">{weaponLabel}</span>.{" "}
          <Link href="/build?tab=gear" className="text-amber-300 hover:underline">Change the weapon in the Gear tab</Link>
        </p>
      ) : null}
      <BuilderFirepowerMatrix firepower={weaponFirepowerResult} />
    </>
  ) : (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400 font-mono space-y-3">
      <p>No weapon selected yet. Choose a weapon and its mods in the Gear tab to see damage and V.A.T.S. numbers here.</p>
      <Link href="/build?tab=gear" className="inline-block rounded border border-amber-500/50 px-4 py-2 text-amber-300 hover:bg-amber-500/10 transition">Open the Gear tab</Link>
    </div>
  )}
</div>
  );
}
