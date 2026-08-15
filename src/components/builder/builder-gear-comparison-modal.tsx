"use client";

import * as React from "react";
import { ARMOR_SET_ROWS } from "@/lib/builder/armor-sets";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { POWER_ARMOR_FRAME_COMPARISON_ROWS } from "@/lib/builder/power-armor-frame-data";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, Zap, X } from "lucide-react";

interface BuilderGearComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuilderGearComparisonModal({ isOpen, onClose }: BuilderGearComparisonModalProps) {
  const [activeTab, setActiveTab] = React.useState<"armor" | "powerArmor" | "weapons">("armor");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 font-mono">
      <div className="bg-[#070b10] border border-amber-500/50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c121a]">
          <div className="flex items-center gap-2.5 text-sm font-black uppercase text-amber-400 tracking-wider">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <span>📊 R.O.L.L. GEAR COMPARISON MATRIX</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                className={`px-3 py-1 font-bold uppercase rounded transition-all ${
                  activeTab === "armor" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("armor")}
              >
                Armor Sets
              </button>
              <button
                type="button"
                className={`px-3 py-1 font-bold uppercase rounded transition-all ${
                  activeTab === "powerArmor" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("powerArmor")}
              >
                Power Armor
              </button>
              <button
                type="button"
                className={`px-3 py-1 font-bold uppercase rounded transition-all ${
                  activeTab === "weapons" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("weapons")}
              >
                Weapons Base
              </button>
            </div>

            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-white p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-4 overflow-y-auto space-y-4">
          {activeTab === "armor" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0e1622] text-amber-400 uppercase text-[0.7rem] font-bold">
                    <th className="p-2.5">Armor Set Name</th>
                    <th className="p-2.5 text-center">DR (Damage)</th>
                    <th className="p-2.5 text-center">ER (Energy)</th>
                    <th className="p-2.5 text-center">RR (Rad)</th>
                    <th className="p-2.5 text-center">FR (Fire)</th>
                    <th className="p-2.5 text-center">PR (Poison)</th>
                    <th className="p-2.5 text-center">CR (Cryo)</th>
                    <th className="p-2.5 text-right">Total Resists</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ARMOR_SET_ROWS.map((row) => {
                    const total = row.stats.dr + row.stats.er + row.stats.rr + row.stats.fr + row.stats.pr + row.stats.cr;
                    return (
                      <tr key={row.key} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-100">{row.label}</td>
                        <td className="p-2.5 text-center text-amber-300 font-bold">{row.stats.dr}</td>
                        <td className="p-2.5 text-center text-cyan-300 font-bold">{row.stats.er}</td>
                        <td className="p-2.5 text-center text-emerald-300 font-bold">{row.stats.rr}</td>
                        <td className="p-2.5 text-center text-red-300">{row.stats.fr}</td>
                        <td className="p-2.5 text-center text-purple-300">{row.stats.pr}</td>
                        <td className="p-2.5 text-center text-blue-300">{row.stats.cr}</td>
                        <td className="p-2.5 text-right font-black text-amber-400">{total} pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "powerArmor" && (
            <div className="overflow-x-auto space-y-4">
              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[0.72rem] text-amber-300 flex items-center gap-2">
                <Shield className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  All Power Armor frames include inherent <strong>42% Damage Reduction</strong> &amp; <strong>90% Radiation Reduction</strong> before raw stat calculations.
                </span>
              </div>
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0e1622] text-amber-400 uppercase text-[0.7rem] font-bold">
                    <th className="p-2.5">Power Armor Frame</th>
                    <th className="p-2.5 text-center">DR</th>
                    <th className="p-2.5 text-center">ER</th>
                    <th className="p-2.5 text-center">RR</th>
                    <th className="p-2.5 text-center">PR</th>
                    <th className="p-2.5 text-center">CR</th>
                    <th className="p-2.5 text-center">Total</th>
                    <th className="p-2.5">Innate Frame Set Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {POWER_ARMOR_FRAME_COMPARISON_ROWS.map((row) => {
                    const total = row.stats.dr + row.stats.er + row.stats.rr + row.stats.fr + row.stats.pr + row.stats.cr;
                    return (
                      <tr key={row.key} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-100 whitespace-nowrap">
                          {row.label}
                          {row.notes && <div className="text-[0.68rem] text-slate-400 font-normal">{row.notes}</div>}
                        </td>
                        <td className="p-2.5 text-center text-amber-300 font-bold">{row.stats.dr}</td>
                        <td className="p-2.5 text-center text-cyan-300 font-bold">{row.stats.er}</td>
                        <td className="p-2.5 text-center text-emerald-300 font-bold">{row.stats.rr}</td>
                        <td className="p-2.5 text-center text-purple-300">{row.stats.pr || "—"}</td>
                        <td className="p-2.5 text-center text-blue-300">{row.stats.cr || "—"}</td>
                        <td className="p-2.5 text-center font-black text-amber-400 whitespace-nowrap">{total} pts</td>
                        <td className="p-2.5 text-[0.72rem] text-emerald-300 font-medium">{row.setBonus}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "weapons" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BASE_GEAR_PIECES.filter((g) => g.kind === "weapon").map((w) => (
                <div key={w.id} className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-amber-500/40 transition-colors">
                  <div className="text-xs font-black uppercase text-amber-400 flex items-center justify-between">
                    <span>{w.label}</span>
                    <span className="text-[0.62rem] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase font-mono">
                      {w.weaponSub || "Tactical"}
                    </span>
                  </div>
                  <div className="text-[0.68rem] text-emerald-400 font-mono bg-slate-950 p-2 rounded border border-slate-800/80 flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    <span>✓ High-VATS &amp; 1★–4★ Legendary Mod Ready</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#090d14] flex justify-end">
          <Button type="button" size="sm" className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </div>
  );
}
