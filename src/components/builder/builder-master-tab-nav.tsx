"use client";

import { Shield, Sparkles, Sliders, Crosshair, Brain } from "lucide-react";
import type { CombatFirepowerResult } from "@/lib/builder/combat-firepower-engine";

export type BuilderMasterTab = "gear" | "perks" | "biometrics" | "combat" | "iris";

/** The master workspace tab buttons plus live firepower telemetry and Iris audit trigger. */
export type BuilderMasterTabNavProps = {
  masterTab: BuilderMasterTab;
  switchTab: (tab: BuilderMasterTab) => void;
  weaponFirepowerResult: CombatFirepowerResult | null;
};

export default function BuilderMasterTabNav({ masterTab, switchTab, weaponFirepowerResult }: BuilderMasterTabNavProps) {
  return (
<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/50 bg-slate-950/90 p-2.5 font-mono shadow-[0_0_20px_rgba(16,185,129,0.15)]">
  <div className="flex flex-wrap items-center gap-1.5 text-xs">
    <button
      type="button"
      onClick={() => switchTab("gear")}
      className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
        masterTab === "gear"
          ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
      }`}
    >
      <Shield className="h-3.5 w-3.5" />
      <span>[ 1. GEAR &amp; ARMORY ]</span>
    </button>
    <button
      type="button"
      onClick={() => switchTab("perks")}
      className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
        masterTab === "perks"
          ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>[ 2. PERK DECK &amp; S.P.E.C.I.A.L. ]</span>
    </button>
    <button
      type="button"
      onClick={() => switchTab("biometrics")}
      className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
        masterTab === "biometrics"
          ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
      }`}
    >
      <Sliders className="h-3.5 w-3.5" />
      <span>[ 3. BIOMETRICS &amp; STANCES ]</span>
    </button>
    <button
      type="button"
      onClick={() => switchTab("combat")}
      className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
        masterTab === "combat"
          ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
      }`}
    >
      <Crosshair className="h-3.5 w-3.5" />
      <span>[ 4. COMBAT DPS &amp; VATS ]</span>
    </button>
    <button
      type="button"
      onClick={() => switchTab("iris")}
      className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
        masterTab === "iris"
          ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-400"
          : "bg-slate-900/80 text-purple-300 hover:text-white border border-purple-900/50 hover:border-purple-600/50"
      }`}
    >
      <Brain className="h-3.5 w-3.5 text-purple-400" />
      <span>[ 5. IRIS AUDITOR ]</span>
    </button>
  </div>

  {/* Quick Live Telemetry Snapshot Badge & Audit Trigger */}
  <div className="flex flex-wrap items-center gap-2 text-xs">
    {weaponFirepowerResult && (
      <>
        <div className="flex items-center gap-1.5 rounded bg-emerald-950 border border-emerald-500/40 px-2.5 py-0.5 text-emerald-300 font-bold">
          <span>Shot: {weaponFirepowerResult.damagePerShot.normal}</span>
          <span className="text-amber-400">/ Crit: {weaponFirepowerResult.damagePerShot.critical}</span>
        </div>
        <div className="flex items-center gap-1 rounded bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 text-cyan-300 font-bold">
          <span>Burst: {weaponFirepowerResult.dps.burstDPS.toLocaleString()} DPS</span>
        </div>
      </>
    )}
    <button
      type="button"
      onClick={() => switchTab("iris")}
      aria-label="Audit active build with Iris Build Auditor"
      className="flex items-center gap-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 px-2.5 py-1 text-purple-300 hover:text-purple-100 font-bold text-xs transition cursor-pointer min-h-[28px]"
    >
      <Brain className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
      <span>Audit with Iris ↗</span>
    </button>
  </div>
</div>
  );
}
