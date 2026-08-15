"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, 
  Zap, 
  Star, 
  Search, 
  Filter, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Layers,
  Terminal,
  Grid,
  List,
  Flame,
  Crosshair,
  Award,
  Cpu,
  ArrowUpRight,
  Bookmark,
  CheckCircle2
} from "lucide-react";

type PrototypeMode = "concept-3" | "concept-4";

// Sample live data for testing
const SAMPLE_MODS = [
  { id: "mod-1", name: "Bloodied", stars: 1, tier: "1★", category: "Weapon: All", effect: "Damage increases up to +95% as your Health decreases (<20% HP).", modules: 15, component: "1 Blood Pack", unlocked: true, seeking: false, dpsGain: "+95%" },
  { id: "mod-2", name: "Anti-Armor", stars: 1, tier: "1★", category: "Weapon: All", effect: "Ignores 50% of your target's Armor and Energy Resistance.", modules: 15, component: "1 Black Titanium", unlocked: true, seeking: false, dpsGain: "+28%" },
  { id: "mod-3", name: "Quad", stars: 1, tier: "1★", category: "Weapon: Ranged", effect: "+300% Ammo Capacity (4x base magazine size).", modules: 15, component: "1 Fusion Cell", unlocked: false, seeking: true, dpsGain: "+70% Sustained" },
  { id: "mod-4", name: "Overeater's", stars: 1, tier: "1★", category: "Armor & Power Armor", effect: "Increases Damage Reduction up to +6% per piece as you fill your hunger and thirst meters (Max 30%).", modules: 15, component: "1 Perfect Bubblegum", unlocked: true, seeking: false, dpsGain: "+30% Mitig" },
  { id: "mod-5", name: "Unyielding", stars: 1, tier: "1★", category: "Armor: Regular", effect: "Gain up to +3 to all SPECIAL stats (except END) per piece when at low health (Max +15).", modules: 15, component: "1 X-Cell", unlocked: false, seeking: true, dpsGain: "+15 SPECIAL" },
  { id: "mod-6", name: "Explosive", stars: 2, tier: "2★", category: "Weapon: Ballistic", effect: "Bullets explode for +20% weapon damage on impact.", modules: 30, component: "1 Bobblehead: Explosive", unlocked: true, seeking: false, dpsGain: "+20% AoE" },
  { id: "mod-7", name: "Rapid (25% Weapon Speed)", stars: 2, tier: "2★", category: "Weapon: All", effect: "+25% faster Fire Rate / +40% faster Melee Swing Speed.", modules: 30, component: "1 Bobblehead: Energy Weapons", unlocked: false, seeking: true, dpsGain: "+25% DPS" },
  { id: "mod-8", name: "Powered (AP Refresh)", stars: 2, tier: "2★", category: "Armor & Power Armor", effect: "Increases Action Point refresh speed by +5 AP/sec per piece (Max +25 AP/sec).", modules: 30, component: "1 Canned Coffee", unlocked: true, seeking: false, dpsGain: "+25 AP/s" },
  { id: "mod-9", name: "V.A.T.S. Enhanced (-25% AP)", stars: 3, tier: "3★", category: "Weapon: Ranged", effect: "-25% Action Point Cost for all V.A.T.S. attacks.", modules: 60, component: "1 Bobblehead: Small Guns", unlocked: true, seeking: false, dpsGain: "-25% AP" },
  { id: "mod-10", name: "Swift (15% Reload)", stars: 3, tier: "3★", category: "Weapon: Ranged", effect: "+15% faster Reload Speed.", modules: 60, component: "1 Speed Demon Serum", unlocked: false, seeking: false, dpsGain: "+15% Reload" },
  { id: "mod-11", name: "Sentinel's", stars: 3, tier: "3★", category: "Armor & Power Armor", effect: "75% chance to reduce incoming damage by 15% while standing still (Max 75%).", modules: 60, component: "1 Scrip Token", unlocked: false, seeking: true, dpsGain: "+75% Mitig" },
  { id: "mod-12", name: "Conductor's", stars: 4, tier: "4★", category: "Weapon: Energy", effect: "Consecutive critical hits release an electrical shock wave inflicting 250 Energy damage to surrounding enemies.", modules: 120, component: "1 Radiant Depths Core", unlocked: false, seeking: true, dpsGain: "+250 Shock" }
];

export default function VisualOverhaulStudioPage() {
  const [activeConcept, setActiveConcept] = useState<PrototypeMode>("concept-3");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStar, setSelectedStar] = useState<number | "ALL">("ALL");

  const filteredMods = useMemo(() => {
    return SAMPLE_MODS.filter((mod) => {
      const matchSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mod.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mod.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "ALL" || mod.category.toUpperCase().includes(selectedCategory);
      const matchStar = selectedStar === "ALL" || mod.stars === selectedStar;
      return matchSearch && matchCategory && matchStar;
    });
  }, [searchQuery, selectedCategory, selectedStar]);

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col font-sans">
      {/* Top Architecture Bar & Prototype Switcher */}
      <div className="bg-[#0b1219] border-b border-slate-800 px-4 py-3 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-mono font-black text-black text-sm shadow-md">
              RL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">Visual Overhaul Lab</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Zero AI Tropes</span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">Full Interface Redesign Options</h1>
            </div>
          </div>

          {/* Prototype Concept Switcher */}
          <div className="flex items-center gap-2 bg-[#06090e] p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveConcept("concept-3")}
              className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
                activeConcept === "concept-3"
                  ? "bg-sky-600 text-white shadow-md ring-1 ring-sky-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Concept 3: Vault-Tec Overseer OS</span>
            </button>
            <button
              onClick={() => setActiveConcept("concept-4")}
              className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
                activeConcept === "concept-4"
                  ? "bg-amber-500 text-black shadow-md ring-1 ring-amber-300 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Concept 4: Tactical Armory</span>
            </button>
          </div>

          <Link
            href="/mods"
            className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
          >
            Return to Live Site
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Showcase Canvas */}
      <div className="flex-1 p-4 md:p-8">
        {activeConcept === "concept-3" ? (
          <VaultTecOverseerPrototype
            mods={filteredMods}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStar={selectedStar}
            setSelectedStar={setSelectedStar}
          />
        ) : (
          <TacticalArmoryPrototype
            mods={filteredMods}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStar={selectedStar}
            setSelectedStar={setSelectedStar}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   CONCEPT 3: VAULT-TEC OVERSEER OPERATING SYSTEM (MID-CENTURY ATOMIC MODERN)
   - Solid high-contrast panels, zero blurry glassmorphism
   - Bold corporate stripes, official stamped approval tags, punchy typography
   ========================================================================= */
function VaultTecOverseerPrototype({
  mods,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStar,
  setSelectedStar
}: {
  mods: typeof SAMPLE_MODS;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStar: number | "ALL";
  setSelectedStar: (s: number | "ALL") => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Design Concept Banner */}
      <div className="bg-[#0e1726] border-2 border-sky-900/80 rounded-none p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-black tracking-widest text-sky-400 uppercase">
            Aesthetic Architecture Option 3
          </span>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">
            Vault-Tec Corporation // Overseer Terminal v11.4
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Solid mid-century atomic layout • Heavy typography • Stamped status seals • Zero transparent blur
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
            Official Clearance
          </div>
          <div className="px-3 py-1 bg-sky-950 text-sky-300 font-mono text-xs border border-sky-700">
            Vault 76 Terminal
          </div>
        </div>
      </div>

      {/* Signature Vault-Tec Header Strip */}
      <div className="bg-[#121d30] border-t-4 border-b-2 border-t-amber-400 border-b-sky-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-400 inline-block" />
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase font-mono">
                Legendary Modification Registry
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
              Appalachian Armory & Crafting Directive
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Authorized specifications for 1★ through 4★ legendary mod boxes, required catalyst reagents, and verified drop frequencies across all sectors.
            </p>
          </div>

          {/* Quick Metrics Stamped Boxes */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="bg-[#090e17] border border-sky-800/80 p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Recipes</div>
              <div className="text-xl font-black text-amber-400">268</div>
            </div>
            <div className="bg-[#090e17] border border-sky-800/80 p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Learned</div>
              <div className="text-xl font-black text-sky-400">184</div>
            </div>
            <div className="bg-[#090e17] border border-sky-800/80 p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Seeking</div>
              <div className="text-xl font-black text-rose-400">12</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-sky-900/60 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-sky-400" />
            <input
              type="text"
              placeholder="FILTER REGISTRY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#080d14] border border-sky-700 text-white placeholder-slate-500 text-xs font-mono font-bold focus:outline-none focus:border-amber-400 uppercase"
            />
          </div>

          {/* Star Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["ALL", 1, 2, 3, 4] as const).map((star) => (
              <button
                key={star}
                onClick={() => setSelectedStar(star)}
                className={`px-3 py-1.5 text-xs font-black font-mono transition uppercase ${
                  selectedStar === star
                    ? "bg-amber-400 text-black shadow-md"
                    : "bg-[#080d14] text-slate-300 border border-sky-800 hover:border-sky-500"
                }`}
              >
                {star === "ALL" ? "All Stars" : `${star}★ Star`}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {["ALL", "WEAPON", "ARMOR"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold font-mono transition uppercase ${
                  selectedCategory === cat
                    ? "bg-sky-600 text-white"
                    : "bg-[#080d14] text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registry Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mods.map((mod) => (
          <div
            key={mod.id}
            className="bg-[#111a28] border-2 border-sky-950 hover:border-sky-700 transition flex flex-col justify-between shadow-lg"
          >
            {/* Card Header */}
            <div className="bg-[#0a0f18] p-3.5 border-b border-sky-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black font-mono text-xs">
                  {mod.tier}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  {mod.category}
                </span>
              </div>
              {mod.unlocked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-800">
                  <Check className="w-3 h-3" /> LEARNED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 border border-amber-800">
                  <Bookmark className="w-3 h-3" /> SEEKING
                </span>
              )}
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              <h4 className="text-base font-black text-white tracking-tight uppercase">
                {mod.name}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                {mod.effect}
              </p>
            </div>

            {/* Card Footer Info */}
            <div className="bg-[#0a0f18] px-4 py-3 border-t border-sky-950/80 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-400">
                Cost: <span className="font-bold text-amber-400">{mod.modules} Modules</span>
              </div>
              <div className="text-slate-400 truncate max-w-[140px]" title={mod.component}>
                Req: <span className="text-slate-200">{mod.component}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   CONCEPT 4: HIGH-DENSITY TACTICAL ARMORY (ELITE THEORYCRAFTER UTILITY)
   - Maximum screen information density, instant scanning
   - Razor-sharp 1px border rules, inline stat deltas, compact multi-column table
   ========================================================================= */
function TacticalArmoryPrototype({
  mods,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStar,
  setSelectedStar
}: {
  mods: typeof SAMPLE_MODS;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStar: number | "ALL";
  setSelectedStar: (s: number | "ALL") => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Design Concept Banner */}
      <div className="bg-[#0d1218] border border-amber-500/30 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            Aesthetic Architecture Option 4
          </span>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Tactical Armory // Theorycrafting Grid
          </h2>
          <p className="text-xs text-slate-400">
            High data density • 1px razor dividers • Compact list views • Instant DPS deltas • Zero fluff
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30">
            PRO MODE ACTIVE
          </span>
          <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700">
            {mods.length} EFFECTS MATCHED
          </span>
        </div>
      </div>

      {/* High-Density Tactical Search & Matrix Filter Bar */}
      <div className="bg-[#0a0e14] border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-amber-400" />
          <input
            type="text"
            placeholder="Quick search effect, stat, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121820] border border-slate-700 px-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Star Filter Bar */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-[11px] mr-1">TIER:</span>
          {(["ALL", 1, 2, 3, 4] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStar(s)}
              className={`px-2.5 py-1 text-xs font-bold border transition ${
                selectedStar === s
                  ? "bg-amber-500 text-black border-amber-400 font-black"
                  : "bg-[#121820] text-slate-300 border-slate-800 hover:border-slate-600"
              }`}
            >
              {s === "ALL" ? "ALL" : `${s}★`}
            </button>
          ))}
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-[11px] mr-1">CAT:</span>
          {["ALL", "WEAPON", "ARMOR"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 text-xs font-bold border transition ${
                selectedCategory === c
                  ? "bg-slate-200 text-black border-white"
                  : "bg-[#121820] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Master Compact Tactical Data Table */}
      <div className="bg-[#090d12] border border-slate-800 overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#111720] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center">Tier</th>
              <th className="py-2.5 px-4 w-48">Mod Name</th>
              <th className="py-2.5 px-3 w-36">Equipment Slot</th>
              <th className="py-2.5 px-4">Tactical Effect & Mechanism</th>
              <th className="py-2.5 px-3 w-28 text-center">Delta Impact</th>
              <th className="py-2.5 px-3 w-24 text-center">Modules</th>
              <th className="py-2.5 px-4 w-44">Craft Catalyst</th>
              <th className="py-2.5 px-3 w-28 text-center">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {mods.map((mod) => (
              <tr 
                key={mod.id}
                className="hover:bg-[#121a24] transition group"
              >
                {/* Tier */}
                <td className="py-2 px-3 text-center">
                  <span className="inline-block font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30 text-[11px]">
                    {mod.tier}
                  </span>
                </td>

                {/* Name */}
                <td className="py-2 px-4 font-bold text-white group-hover:text-amber-400 transition">
                  {mod.name}
                </td>

                {/* Equipment Slot */}
                <td className="py-2 px-3 text-slate-400 text-[11px]">
                  {mod.category}
                </td>

                {/* Effect */}
                <td className="py-2 px-4 text-slate-300 font-sans text-xs leading-snug">
                  {mod.effect}
                </td>

                {/* Stat Delta */}
                <td className="py-2 px-3 text-center">
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-800/80 text-[11px]">
                    {mod.dpsGain}
                  </span>
                </td>

                {/* Modules Cost */}
                <td className="py-2 px-3 text-center font-bold text-amber-300">
                  {mod.modules}
                </td>

                {/* Component */}
                <td className="py-2 px-4 text-slate-400 text-[11px] truncate max-w-[170px]" title={mod.component}>
                  {mod.component}
                </td>

                {/* Status Toggle */}
                <td className="py-2 px-3 text-center">
                  {mod.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> LEARNED
                    </span>
                  ) : (
                    <button className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 border border-amber-700 hover:bg-amber-900 transition">
                      <Bookmark className="w-3 h-3" /> SEEK
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Theorycrafting Summary Strip */}
      <div className="bg-[#0a0e14] border border-slate-800 p-3.5 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <span>Displaying <strong className="text-white">{mods.length}</strong> mod formulas</span>
          <span>•</span>
          <span>Scrap Unlock Chance: <strong className="text-emerald-400">1.0%</strong> (Plan) / <strong className="text-amber-400">1.5%</strong> (Box)</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-[#141b24] hover:bg-slate-800 border border-slate-700 text-white font-bold transition">
            Export Loadout CSV
          </button>
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black transition">
            Apply to Build Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
