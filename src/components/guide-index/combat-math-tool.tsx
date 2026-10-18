"use client";

import * as React from "react";
import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  calculatePaperDamage,
  calculateEffectiveArmor,
  calculateMitigatedDamage,
  MAX_ARMOR_PENETRATION
} from "@/lib/calculator/creation-engine-math";

export default function CombatMathTool() {
  const [baseDamage, setBaseDamage] = useState<number>(100);
  const [additivePerksPct, setAdditivePerksPct] = useState<number>(60);
  const [targetDr, setTargetDr] = useState<number>(300);
  const [hasAntiArmor, setHasAntiArmor] = useState<boolean>(true);
  const [hasTankKiller, setHasTankKiller] = useState<boolean>(true);
  const [hasPerfMag, setHasPerfMag] = useState<boolean>(false);
  const [bossMitigationPct, setBossMitigationPct] = useState<number>(0);

  // Compile penetration sources
  const penetrationSources: number[] = [];
  if (hasAntiArmor) penetrationSources.push(50);
  if (hasTankKiller) penetrationSources.push(36);
  if (hasPerfMag) penetrationSources.push(40);

  // Run deterministic Creation Engine combat formulas
  const paperDamage = calculatePaperDamage(baseDamage, additivePerksPct, []);
  const armorResult = calculateEffectiveArmor(targetDr, penetrationSources);
  const mitigationResult = calculateMitigatedDamage(
    paperDamage,
    armorResult.effectiveDr,
    bossMitigationPct
  );

  return (
    <div className="rounded-xl border border-blue-500/30 bg-slate-950/70 p-4 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Clean-Room Combat Calculator
          </h3>
        </div>
        <span className="text-xs uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
          0.15 / 0.365 Curve
        </span>
      </div>

      <p className="text-sm text-foreground/80 font-sans leading-relaxed">
        Deterministic reverse-engineered Creation Engine damage pipeline. Pure math, zero network latency.
      </p>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label htmlFor="combat-base-damage" className="block text-foreground/60 mb-1">Base Weapon Damage</label>
          <input
            id="combat-base-damage"
            aria-label="Base Weapon Damage"
            type="number"
            min={1}
            max={2000}
            value={baseDamage}
            onChange={(e) => setBaseDamage(Math.max(1, Number(e.target.value) || 0))}
            className="w-full rounded bg-slate-900 border border-border px-2.5 py-1.5 text-xs text-foreground font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="combat-additive-bonus" className="block text-foreground/60 mb-1">Additive Bonus (%)</label>
          <input
            id="combat-additive-bonus"
            aria-label="Additive Bonus (%)"
            type="number"
            min={0}
            max={1000}
            value={additivePerksPct}
            onChange={(e) => setAdditivePerksPct(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded bg-slate-900 border border-border px-2.5 py-1.5 text-xs text-foreground font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="combat-target-dr" className="block text-foreground/60 mb-1">Target DR / ER</label>
          <input
            id="combat-target-dr"
            aria-label="Target DR / ER"
            type="number"
            min={0}
            max={5000}
            value={targetDr}
            onChange={(e) => setTargetDr(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded bg-slate-900 border border-border px-2.5 py-1.5 text-xs text-foreground font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="combat-boss-reduction" className="block text-foreground/60 mb-1">Boss Reduction</label>
          <select
            id="combat-boss-reduction"
            aria-label="Boss Reduction"
            value={bossMitigationPct}
            onChange={(e) => setBossMitigationPct(Number(e.target.value))}
            className="w-full rounded bg-slate-900 border border-border px-2 py-1.5 text-xs text-foreground font-mono focus:border-cyan-400 focus:outline-none"
          >
            <option value={0}>Standard Mob (0%)</option>
            <option value={70}>Scorchbeast Queen (70%)</option>
            <option value={80}>Earle Williams (80%)</option>
          </select>
        </div>
      </div>

      {/* Penetration Stacking Toggles */}
      <div className="space-y-1.5 pt-1">
        <span className="text-xs uppercase font-bold text-foreground/60">
          Armor Penetration Sources (Multiplicative)
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer rounded border border-border/50 bg-slate-900/60 px-2 py-1 hover:border-cyan-400">
            <input
              type="checkbox"
              checked={hasAntiArmor}
              onChange={(e) => setHasAntiArmor(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Anti-Armor (50%)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer rounded border border-border/50 bg-slate-900/60 px-2 py-1 hover:border-cyan-400">
            <input
              type="checkbox"
              checked={hasTankKiller}
              onChange={(e) => setHasTankKiller(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Tank Killer (36%)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer rounded border border-border/50 bg-slate-900/60 px-2 py-1 hover:border-cyan-400">
            <input
              type="checkbox"
              checked={hasPerfMag}
              onChange={(e) => setHasPerfMag(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Perforating Mag (40%)</span>
          </label>
        </div>
      </div>

      {/* Deterministic Results Card */}
      <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-xs text-foreground/50 block">Paper Damage</span>
            <span className="text-sm font-bold text-foreground">{paperDamage}</span>
          </div>
          <div>
            <span className="text-xs text-foreground/50 block">
              Effective DR ({armorResult.totalPenetrationPct}% pen)
            </span>
            <span className="text-sm font-bold text-amber-300">
              {armorResult.effectiveDr}
              {armorResult.totalPenetrationPct >= MAX_ARMOR_PENETRATION * 100 && (
                <span className="ml-1 text-xs text-amber-500 uppercase font-normal">(90% Cap)</span>
              )}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-foreground/50 block">Bethesda Curve Efficiency</span>
            <span className="text-xs font-mono text-cyan-300">
              {mitigationResult.damageCoefficientPct.toFixed(1)}% delivered
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-cyan-400 block">Delivered Damage</span>
            <span className="text-lg font-bold text-emerald-400">
              {Math.round(mitigationResult.finalDamage)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
