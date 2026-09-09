"use client";

import * as React from "react";
import {
  type CombatFirepowerResult,
  TARGET_DUMMY_LIST,
  calculateTargetMitigation,
} from "@/lib/builder/combat-firepower-engine";
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
  Skull,
  Target,
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
  const [selectedDummyId, setSelectedDummyId] = React.useState<string>(
    firepower.targetDummy?.dummy?.id || "scorchbeast-queen"
  );
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

  const dummyCalc = React.useMemo(() => {
    return calculateTargetMitigation(firepower, selectedDummyId);
  }, [firepower, selectedDummyId]);

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
            <span className="rounded bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 font-bold uppercase text-amber-300 text-[0.68rem] tracking-wider">
              LVL {baseStats.maxLevel || 50} (MAX)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[0.68rem]">
            {/* Active Firing Mode Indicator */}
            {firepower.firingMode === "vats_crit_cycle" ? (
              <span className="rounded bg-amber-950/90 border border-amber-400 px-2 py-0.5 font-black uppercase text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)] animate-pulse">
                ⚡ 1:1 CRIT CYCLE
              </span>
            ) : firepower.firingMode === "vats_standard" ? (
              <span className="rounded bg-emerald-950 border border-emerald-500/60 px-2 py-0.5 font-bold uppercase text-emerald-300">
                🎯 IN V.A.T.S.
              </span>
            ) : firepower.firingMode === "aiming_ads" ? (
              <span className="rounded bg-purple-950 border border-purple-500/60 px-2 py-0.5 font-bold uppercase text-purple-300">
                🎯 AIMING (ADS)
              </span>
            ) : (
              <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 font-bold uppercase text-slate-400">
                🔫 HIP FIRE
              </span>
            )}
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
              <div className={`flex items-baseline justify-between p-1 rounded transition-colors ${
                firepower.firingMode !== "vats_crit_cycle" ? "bg-cyan-950/40 border border-cyan-500/30" : ""
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Burst DPS:</span>
                  {firepower.firingMode !== "vats_crit_cycle" && (
                    <span className="text-[0.55rem] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <span className="text-lg font-black text-cyan-300">
                  {dps.burstDPS.toLocaleString()}
                </span>
              </div>
              <div className={`flex items-baseline justify-between p-1 rounded transition-colors ${
                firepower.firingMode === "vats_crit_cycle" ? "bg-amber-950/40 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]" : "pt-1 border-t border-slate-800"
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-emerald-400 font-bold">
                    2nd-Shot Crit DPS:
                  </span>
                  {firepower.firingMode === "vats_crit_cycle" && (
                    <span className="text-[0.55rem] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black">
                      ACTIVE
                    </span>
                  )}
                </div>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-purple-300 font-bold text-[0.65rem] hover:underline flex items-center gap-0.5">
                    <span>Luck: {critCycle.currentLuck} / {critCycle.requiredLuck}</span>
                    <HelpCircle className="h-3 w-3 text-slate-500 ml-0.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-950 border-emerald-500/40 text-xs font-mono p-2.5 max-w-xs space-y-1.5">
                  <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">
                    Fallout 76 Luck &amp; Critical Savvy Chart:
                  </div>
                  <div className="text-[0.68rem] text-slate-300 space-y-0.5">
                    <div>• Crit Savvy Rank 3: 33 Luck (23 with 3★ Lucky)</div>
                    <div>• Crit Savvy Rank 2: 44 Luck (34 with 3★ Lucky)</div>
                    <div>• Crit Savvy Rank 1: 54 Luck (44 with 3★ Lucky)</div>
                    <div>• No Crit Savvy: 64 Luck (54 with 3★ Lucky)</div>
                  </div>
                  <div className="border-t border-slate-800 pt-1 text-[0.65rem] text-slate-400">
                    Fill/Shot = (Luck × 1.5) + 5 + (Lucky ? 15 : 0)
                  </div>
                </TooltipContent>
              </Tooltip>
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
                    Need +{critCycle.missingLuck} Luck (or 3★ Lucky)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[0.68rem] text-slate-400 pt-0.5">
                <span>Savvy: {critCycle.critSavvyRank > 0 ? `R${critCycle.critSavvyRank} (${critCycle.fillCostPct}%)` : "None"}</span>
                <span className="text-emerald-400 font-bold">
                  {critCycle.fillPerShotPct}% / shot · {armorPenetration.effectiveArmorPenetrationPct}% AP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Boss Combat Mitigation & Landed DPS Matrix */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Skull className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Target Dummy Combat Simulator
              </span>
              <span className="text-[0.65rem] px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 font-bold">
                DR &amp; FLAT MITIGATION
              </span>
            </div>

            {/* Target Selectors */}
            <div className="flex flex-wrap items-center gap-1">
              {TARGET_DUMMY_LIST.map((dummy) => {
                const isActive = dummy.id === selectedDummyId;
                return (
                  <button
                    key={dummy.id}
                    type="button"
                    onClick={() => setSelectedDummyId(dummy.id)}
                    className={`px-2.5 py-1 rounded text-[0.68rem] font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)] border border-rose-400"
                        : "bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:bg-slate-700/60"
                    }`}
                  >
                    {dummy.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Target Dummy Details & Landed Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Target Specs */}
            <div className="md:col-span-5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-bold text-white text-xs">{dummyCalc.dummy.name}</span>
              </div>
              <p className="text-[0.68rem] text-slate-400 leading-relaxed">
                {dummyCalc.dummy.description}
              </p>
              <div className="flex flex-wrap gap-2 text-[0.68rem] pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  Target DR: <strong className="text-white">{baseStats.isEnergy ? dummyCalc.dummy.energyResistance : dummyCalc.dummy.damageResistance}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  Effective DR: <strong className="text-white">{dummyCalc.effectiveDR}</strong>
                </span>
                {dummyCalc.dummy.flatDamageReductionPct > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                    Shield: <strong>-{Math.round(dummyCalc.dummy.flatDamageReductionPct * 100)}% Flat</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Landed Telemetry Grid */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded border border-slate-800 bg-slate-950/60 p-2 text-center space-y-0.5">
                <span className="text-[0.65rem] text-slate-400 uppercase tracking-wider block">Landed Hit</span>
                <span className="text-base font-black text-white">{dummyCalc.normalLanded}</span>
                <span className="text-[0.62rem] text-slate-500 block">vs {damagePerShot.totalPerShot} sheet</span>
              </div>

              <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2 text-center space-y-0.5">
                <span className="text-[0.65rem] text-amber-400 uppercase tracking-wider block">Landed Crit</span>
                <span className="text-base font-black text-amber-300">{dummyCalc.criticalLanded}</span>
                <span className="text-[0.62rem] text-amber-400/60 block">vs {damagePerShot.critical} sheet</span>
              </div>

              <div className="rounded border border-cyan-500/30 bg-cyan-950/20 p-2 text-center space-y-0.5">
                <span className="text-[0.65rem] text-cyan-400 uppercase tracking-wider block">Landed Burst</span>
                <span className="text-base font-black text-cyan-300">{dummyCalc.burstDPSLanded.toLocaleString()}</span>
                <span className="text-[0.62rem] text-cyan-400/60 block">DPS</span>
              </div>

              <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2 text-center space-y-0.5">
                <span className="text-[0.65rem] text-emerald-400 uppercase tracking-wider block">Landed 2nd Crit</span>
                <span className="text-base font-black text-emerald-300">{dummyCalc.criticalCycleDPSLanded.toLocaleString()}</span>
                <span className="text-[0.62rem] text-emerald-400/60 block">DPS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
