"use client";

import * as React from "react";
import type { CombatFirepowerResult } from "@/lib/builder/combat-firepower-engine";
import {
  Crosshair,
  Zap,
  Flame,
  Activity,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BuilderFirepowerMatrixProps {
  firepower: CombatFirepowerResult;
}

export default function BuilderFirepowerMatrix({
  firepower,
}: BuilderFirepowerMatrixProps) {
  const {
    baseStats,
    damagePerShot,
    fireRate,
    magazineCapacity,
    dps,
    vats,
    critCycle,
    armorPenetration,
  } = firepower;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-xl border border-emerald-500/40 bg-slate-950/90 p-4 font-mono text-slate-100 shadow-[0_0_25px_rgba(16,185,129,0.1)] space-y-4">
        {/* Header telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              [ FIREPOWER // WEAPON COMBAT MATRIX ]
            </span>
            <span className="text-xs font-bold text-white">
              {baseStats.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[0.68rem]">
            <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 font-bold uppercase text-slate-300">
              {baseStats.weaponClass}
            </span>
            <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 font-bold uppercase text-emerald-300">
              {baseStats.damageType}
            </span>
            <span className="rounded bg-amber-950 border border-amber-500/40 px-2 py-0.5 font-bold uppercase text-amber-300">
              Mag: {magazineCapacity.effective}{magazineCapacity.isQuad ? " (Quad ×4)" : ""}
            </span>
          </div>
        </div>

        {/* 4-Card Tactical Firepower Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Damage Per Shot */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-400" /> Damage Per Shot
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-500 hover:text-slate-300">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-950 border-emerald-500/40 text-xs font-mono p-2.5 max-w-xs space-y-1">
                  <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">
                    Damage Calculations Breakdown:
                  </div>
                  {damagePerShot.breakdown.map((b, idx) => (
                    <div key={idx} className="flex justify-between gap-2 text-[0.68rem]">
                      <span className="text-slate-400">{b.source}:</span>
                      <span className="text-emerald-300 font-bold">{b.value}</span>
                    </div>
                  ))}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Normal Shot:</span>
                <span className="text-lg font-black text-white">
                  {damagePerShot.normal}
                  {damagePerShot.explosiveBonus > 0 && (
                    <span className="text-xs font-bold text-amber-400 ml-1">
                      (+{damagePerShot.explosiveBonus} Exp)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> VATS Crit:
                </span>
                <span className="text-lg font-black text-amber-300">
                  {damagePerShot.critical}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Burst & Cyclic DPS */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-cyan-400" /> Burst &amp; Crit DPS
              </span>
              <span className="text-[0.65rem] text-slate-400">
                {fireRate.rps.toFixed(1)} rps ({fireRate.rpm} rpm)
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Burst DPS:</span>
                <span className="text-lg font-black text-cyan-300">
                  {dps.burstDPS.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                <span className="text-xs text-emerald-400 font-bold">
                  2nd-Shot Crit DPS:
                </span>
                <span className="text-lg font-black text-emerald-300">
                  {dps.criticalCycleDPS.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: V.A.T.S. Action Points */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> V.A.T.S. AP Cost
              </span>
              <span className="text-[0.65rem] text-emerald-400 font-bold">
                {vats.totalApPool} Max AP
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Cost Per Shot:</span>
                <span className="text-lg font-black text-emerald-300">
                  {vats.apCostPerShot} AP
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                <span className="text-xs text-slate-400">Max Shots in AP:</span>
                <span className="text-lg font-black text-white">
                  {vats.maxShotsInPool} shots
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Critical Cycle Telemetry */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-purple-400" /> Crit Fill Cycle
              </span>
              <span className="text-[0.65rem] font-bold text-purple-300">
                Luck: {critCycle.currentLuck} / {critCycle.requiredLuck}
              </span>
            </div>

            <div className="space-y-1">
              {critCycle.everySecondShotReady ? (
                <div className="rounded bg-emerald-950/80 border border-emerald-500/50 p-1.5 text-center flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-bold animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>CRIT EVERY 2ND SHOT READY</span>
                </div>
              ) : (
                <div className="rounded bg-amber-950/60 border border-amber-500/40 p-1.5 text-center flex items-center justify-center gap-1.5 text-[0.68rem] text-amber-300 font-bold">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    Need +{Math.max(0, critCycle.requiredLuck - critCycle.currentLuck)} Luck (or 3★ Lucky)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[0.68rem] text-slate-400 pt-0.5">
                <span>Armor Pen:</span>
                <span className="text-emerald-400 font-bold">
                  {armorPenetration.effectiveArmorPenetrationPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
