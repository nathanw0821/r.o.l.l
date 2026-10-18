"use client";

import * as React from "react";
import { useState } from "react";
import { Sparkles, Brain, X, Activity } from "lucide-react";

interface SpecialState {
  S: number;
  P: number;
  E: number;
  C: number;
  I: number;
  A: number;
  L: number;
}

const DEFAULT_SPECIAL: SpecialState = {
  S: 15,
  P: 3,
  E: 5,
  C: 4,
  I: 12,
  A: 10,
  L: 7
};

const AVAILABLE_PERKS = [
  { id: "tank-killer", name: "Tank Killer", cost: 3, stat: "P" },
  { id: "commando", name: "Commando", cost: 3, stat: "P" },
  { id: "nerd-rage", name: "Nerd Rage", cost: 3, stat: "I" },
  { id: "adrenaline", name: "Adrenaline", cost: 5, stat: "A" },
  { id: "tenderizer", name: "Tenderizer", cost: 3, stat: "C" },
  { id: "critical-savvy", name: "Critical Savvy", cost: 3, stat: "L" },
  { id: "class-freak", name: "Class Freak", cost: 3, stat: "L" },
  { id: "starched-genes", name: "Starched Genes", cost: 2, stat: "L" },
  { id: "fireproof", name: "Fireproof", cost: 3, stat: "E" },
  { id: "stabilized", name: "Stabilized", cost: 3, stat: "I" }
];

const AVAILABLE_MUTATIONS = [
  "Adrenal Reaction",
  "Marsupial",
  "Speed Demon",
  "Bird Bones",
  "Eagle Eyes",
  "Herbivore",
  "Carnivore"
];

export default function IrisBuildAuditor() {
  const [special, setSpecial] = useState<SpecialState>(DEFAULT_SPECIAL);
  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    "tank-killer",
    "nerd-rage",
    "critical-savvy",
    "class-freak",
    "starched-genes"
  ]);
  const [selectedMutations, setSelectedMutations] = useState<string[]>([
    "Adrenal Reaction",
    "Marsupial",
    "Speed Demon"
  ]);
  const [combatStance, setCombatStance] = useState<"low-health" | "full-health">("low-health");
  const [armorClass, setArmorClass] = useState<"standard" | "power-armor">("standard");

  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const totalSpecial =
    special.S + special.P + special.E + special.C + special.I + special.A + special.L;

  const handleSpecialChange = (stat: keyof SpecialState, delta: number) => {
    setSpecial((prev) => {
      const nextVal = Math.max(1, Math.min(15, prev[stat] + delta));
      return { ...prev, [stat]: nextVal };
    });
  };

  const togglePerk = (id: string) => {
    setSelectedPerks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleMutation = (name: string) => {
    setSelectedMutations((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);

    // Simulate edge context alignment & gateway throttling intercept
    setTimeout(() => {
      setIsAuditing(false);
      setShowModal(true);
    }, 600);
  };

  return (
    <div className="rounded-xl border border-purple-500/40 bg-slate-950/80 p-4 font-mono shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Iris Build Auditor
          </h3>
        </div>
        <span className="text-3xs uppercase px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-400 font-bold">
          UI Staging Layer
        </span>
      </div>

      <p className="text-3xs text-foreground/70 font-sans leading-relaxed">
        Localized build verification interface. Formulate your S.P.E.C.I.A.L. array, active perks, and mutations for deep synergy analysis.
      </p>

      <form onSubmit={handleSubmitAudit} className="space-y-4">
        {/* S.P.E.C.I.A.L. Distribution Sliders/Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-3xs font-bold uppercase text-foreground/60">
            <span>S.P.E.C.I.A.L. Allocation</span>
            <span className={totalSpecial === 56 ? "text-emerald-400" : "text-amber-400"}>
              Points: {totalSpecial} / 56
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {(["S", "P", "E", "C", "I", "A", "L"] as (keyof SpecialState)[]).map((stat) => (
              <div
                key={stat}
                className="flex flex-col items-center rounded border border-border/60 bg-slate-900/80 p-1.5"
              >
                <span className="text-3xs font-bold text-purple-400">{stat}</span>
                <span className="text-xs font-bold text-foreground my-0.5">{special[stat]}</span>
                <div className="flex gap-0.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleSpecialChange(stat, -1)}
                    disabled={special[stat] <= 1}
                    className="h-4 w-4 flex items-center justify-center rounded bg-slate-800 text-3xs text-foreground/70 hover:bg-slate-700 disabled:opacity-30"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpecialChange(stat, 1)}
                    disabled={special[stat] >= 15}
                    className="h-4 w-4 flex items-center justify-center rounded bg-slate-800 text-3xs text-foreground/70 hover:bg-slate-700 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perk Selection Badges */}
        <div className="space-y-1.5">
          <span className="text-3xs font-bold uppercase text-foreground/60 block">
            Core Perk Synergy Deck ({selectedPerks.length} Selected)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_PERKS.map((perk) => {
              const active = selectedPerks.includes(perk.id);
              return (
                <button
                  type="button"
                  key={perk.id}
                  onClick={() => togglePerk(perk.id)}
                  className={`px-2 py-1 rounded text-3xs border transition-colors flex items-center gap-1 ${
                    active
                      ? "border-purple-400 bg-purple-500/20 text-purple-200"
                      : "border-border/40 bg-slate-900/60 text-foreground/50 hover:border-purple-500/40"
                  }`}
                >
                  <span>{perk.name}</span>
                  <span className="opacity-60 text-4xs">[{perk.stat}{perk.cost}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mutations Selection */}
        <div className="space-y-1.5">
          <span className="text-3xs font-bold uppercase text-foreground/60 block">
            Mutation Serum Matrix ({selectedMutations.length} Active)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_MUTATIONS.map((mutation) => {
              const active = selectedMutations.includes(mutation);
              return (
                <button
                  type="button"
                  key={mutation}
                  onClick={() => toggleMutation(mutation)}
                  className={`px-2 py-0.5 rounded-full text-3xs border transition-colors ${
                    active
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                      : "border-border/30 bg-slate-900/40 text-foreground/40 hover:border-cyan-500/30"
                  }`}
                >
                  {mutation}
                </button>
              );
            })}
          </div>
        </div>

        {/* Combat Stance & Equipment */}
        <div className="grid grid-cols-2 gap-2 text-3xs">
          <div>
            <span className="text-foreground/60 block mb-1">Health Stance</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setCombatStance("low-health")}
                className={`py-1 rounded border text-center transition ${
                  combatStance === "low-health"
                    ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                    : "border-border/40 bg-slate-900 text-foreground/60"
                }`}
              >
                Bloodied (&lt;20%)
              </button>
              <button
                type="button"
                onClick={() => setCombatStance("full-health")}
                className={`py-1 rounded border text-center transition ${
                  combatStance === "full-health"
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold"
                    : "border-border/40 bg-slate-900 text-foreground/60"
                }`}
              >
                Full Health
              </button>
            </div>
          </div>

          <div>
            <span className="text-foreground/60 block mb-1">Chassis / Armor</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setArmorClass("standard")}
                className={`py-1 rounded border text-center transition ${
                  armorClass === "standard"
                    ? "border-purple-400 bg-purple-500/20 text-purple-300 font-bold"
                    : "border-border/40 bg-slate-900 text-foreground/60"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setArmorClass("power-armor")}
                className={`py-1 rounded border text-center transition ${
                  armorClass === "power-armor"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                    : "border-border/40 bg-slate-900 text-foreground/60"
                }`}
              >
                Power Armor
              </button>
            </div>
          </div>
        </div>

        {/* Submit Audit Button */}
        <button
          type="submit"
          disabled={isAuditing}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <Activity className="h-4 w-4 animate-spin text-purple-200" />
              <span>Synthesizing Build Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-purple-200" />
              <span>Run Iris Build Audit ↗</span>
            </>
          )}
        </button>
      </form>

      {/* Stylized Interception Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl border border-purple-500/50 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                  Iris Build Auditor
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-foreground/60 hover:bg-slate-800 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
              <span className="text-3xs uppercase px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700 text-purple-300 font-bold">
                System Notice
              </span>
              <p className="text-xs text-foreground/90 font-sans leading-relaxed font-medium">
                Iris Build Auditor: System optimization in progress. High-capacity inference modules undergoing localized context alignment. Full access resuming shortly.
              </p>
            </div>

            {/* Submitted Payload Inspection */}
            <div className="rounded-lg border border-border/40 bg-slate-900/60 p-3 text-3xs space-y-1.5">
              <div className="text-foreground/50 uppercase font-bold tracking-wider">
                Auditor Payload Cached:
              </div>
              <div className="flex justify-between text-foreground/80">
                <span>S.P.E.C.I.A.L. Sum:</span>
                <span className="font-bold text-purple-300">{totalSpecial} Points</span>
              </div>
              <div className="flex justify-between text-foreground/80">
                <span>Active Perk Cards:</span>
                <span className="font-bold text-cyan-300">{selectedPerks.length} Cards</span>
              </div>
              <div className="flex justify-between text-foreground/80">
                <span>Mutations Bound:</span>
                <span className="font-bold text-amber-300">{selectedMutations.length} Serums</span>
              </div>
              <div className="flex justify-between text-foreground/80">
                <span>Stance & Armor:</span>
                <span className="font-bold text-emerald-300">
                  {combatStance === "low-health" ? "Bloodied" : "Full Health"} /{" "}
                  {armorClass === "power-armor" ? "Power Armor" : "Standard"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-slate-700 transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
