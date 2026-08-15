"use client";

import * as React from "react";
import { ARMOR_SET_ROWS } from "@/lib/builder/armor-sets";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { Button } from "@/components/ui/button";
import { BarChart3, X } from "lucide-react";

interface BuilderGearComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuilderGearComparisonModal({ isOpen, onClose }: BuilderGearComparisonModalProps) {
  const [activeTab, setActiveTab] = React.useState<"armor" | "weapons">("armor");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-mono">
      <div className="bg-slate-950 border border-amber-500/40 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-amber-400">
            <BarChart3 className="h-5 w-5" />
            <span>📊 R.O.L.L. GEAR COMPARISON MATRIX</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded border border-slate-800">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold uppercase rounded ${
                  activeTab === "armor" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("armor")}
              >
                Armor Sets
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold uppercase rounded ${
                  activeTab === "weapons" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
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
          {activeTab === "armor" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-amber-400 uppercase text-[0.7rem] font-bold">
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
                      <tr key={row.key} className="hover:bg-slate-900/40 transition-colors">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BASE_GEAR_PIECES.filter((g) => g.kind === "weapon").map((w) => (
                <div key={w.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-black uppercase text-amber-400">{w.label}</div>
                  <div className="text-[0.7rem] text-slate-400 font-mono uppercase">
                    Category: {w.weaponSub || "Tactical"}
                  </div>
                  <div className="text-[0.68rem] text-emerald-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                    ✓ High-VATS & Modern Crafting Ready
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <Button type="button" size="sm" className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </div>
  );
}
