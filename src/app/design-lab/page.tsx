"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PureSvgPerkCard from "@/components/perks/pure-svg-perk-card";
import { 
  Search, 
  Check, 
  ArrowUpRight,
  Bookmark,
  TrendingUp,
  Database,
  Sparkles
} from "lucide-react";

// Sample live data for testing
const SAMPLE_MODS = [
  { id: "mod-1", name: "Bloodied", stars: 1, tier: "1★", category: "Weapon: All", effect: "Damage increases up to +95% as your Health decreases (<20% HP).", modules: 15, component: "1 Blood Pack", unlocked: true, seeking: false, dpsGain: "+95%" },
  { id: "mod-2", name: "Anti-Armor", stars: 1, tier: "1★", category: "Weapon: All", effect: "Ignores 50% of your target's Armor and Energy Resistance.", modules: 15, component: "1 Black Titanium", unlocked: true, seeking: false, dpsGain: "+28%" },
  { id: "mod-3", name: "Quad", stars: 1, tier: "1★", category: "Weapon: Ranged", effect: "+300% Ammo Capacity (4x base magazine size).", modules: 15, component: "1 Fusion Cell", unlocked: false, seeking: true, dpsGain: "+70% Sustained" },
  { id: "mod-4", name: "Overeater's", stars: 1, tier: "1★", category: "Armor & Power Armor", effect: "Increases Damage Reduction up to +6% per piece as you fill hunger/thirst (Max 30%).", modules: 15, component: "1 Perfect Bubblegum", unlocked: true, seeking: false, dpsGain: "+30% Mitig" },
  { id: "mod-5", name: "Unyielding", stars: 1, tier: "1★", category: "Armor: Regular", effect: "Gain up to +3 to all SPECIAL stats (except END) per piece at low health (Max +15).", modules: 15, component: "1 X-Cell", unlocked: false, seeking: true, dpsGain: "+15 SPECIAL" },
  { id: "mod-6", name: "Explosive", stars: 2, tier: "2★", category: "Weapon: Ballistic", effect: "Bullets explode for +20% weapon damage on impact.", modules: 30, component: "1 Bobblehead: Explosive", unlocked: true, seeking: false, dpsGain: "+20% AoE" },
  { id: "mod-7", name: "Rapid (25% Weapon Speed)", stars: 2, tier: "2★", category: "Weapon: All", effect: "+25% faster Fire Rate / +40% faster Melee Swing Speed.", modules: 30, component: "1 Bobblehead: Energy Weapons", unlocked: false, seeking: true, dpsGain: "+25% DPS" },
  { id: "mod-8", name: "Powered (AP Refresh)", stars: 2, tier: "2★", category: "Armor & Power Armor", effect: "Increases Action Point refresh speed by +5 AP/sec per piece (Max +25 AP/sec).", modules: 30, component: "1 Canned Coffee", unlocked: true, seeking: false, dpsGain: "+25 AP/s" },
  { id: "mod-9", name: "V.A.T.S. Enhanced (-25% AP)", stars: 3, tier: "3★", category: "Weapon: Ranged", effect: "-25% Action Point Cost for all V.A.T.S. attacks.", modules: 60, component: "1 Bobblehead: Small Guns", unlocked: true, seeking: false, dpsGain: "-25% AP" },
  { id: "mod-10", name: "Swift (15% Reload)", stars: 3, tier: "3★", category: "Weapon: Ranged", effect: "+15% faster Reload Speed.", modules: 60, component: "1 Speed Demon Serum", unlocked: false, seeking: false, dpsGain: "+15% Reload" },
  { id: "mod-11", name: "Sentinel's", stars: 3, tier: "3★", category: "Armor & Power Armor", effect: "75% chance to reduce incoming damage by 15% while standing still (Max 75%).", modules: 60, component: "1 Scrip Token", unlocked: false, seeking: true, dpsGain: "+75% Mitig" },
  { id: "mod-12", name: "Conductor's", stars: 4, tier: "4★", category: "Weapon: Energy", effect: "Consecutive critical hits release an electrical shock wave inflicting 250 Energy damage.", modules: 120, component: "1 Radiant Depths Core", unlocked: false, seeking: true, dpsGain: "+250 Shock" }
];

export default function VisualOverhaulStudioPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStar, setSelectedStar] = useState<number | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LEARNED" | "SEEKING" | "LOCKED">("ALL");
  const [modsState, setModsState] = useState(SAMPLE_MODS);

  // Toggle unlock state
  const toggleUnlock = (id: string) => {
    setModsState((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextUnlocked = !m.unlocked;
          return { ...m, unlocked: nextUnlocked, seeking: nextUnlocked ? false : m.seeking };
        }
        return m;
      })
    );
  };

  // Toggle seeking state
  const toggleSeeking = (id: string) => {
    setModsState((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, seeking: !m.seeking, unlocked: m.unlocked ? false : m.unlocked };
        }
        return m;
      })
    );
  };

  // Telemetry Calculations
  const stats = useMemo(() => {
    const total = modsState.length;
    const learned = modsState.filter((m) => m.unlocked).length;
    const seeking = modsState.filter((m) => m.seeking).length;
    const locked = total - learned - seeking;
    const percentLearned = total > 0 ? Math.round((learned / total) * 100) : 0;
    const percentSeeking = total > 0 ? Math.round((seeking / total) * 100) : 0;

    // Tier-by-Tier progress
    const tierStats = [1, 2, 3, 4].map((star) => {
      const tierMods = modsState.filter((m) => m.stars === star);
      const tierLearned = tierMods.filter((m) => m.unlocked).length;
      const tierTotal = tierMods.length;
      const tierPercent = tierTotal > 0 ? Math.round((tierLearned / tierTotal) * 100) : 0;
      return { star, learned: tierLearned, total: tierTotal, percent: tierPercent };
    });

    return { total, learned, seeking, locked, percentLearned, percentSeeking, tierStats };
  }, [modsState]);

  const filteredMods = useMemo(() => {
    return modsState.filter((mod) => {
      const matchSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mod.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mod.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "ALL" || mod.category.toUpperCase().includes(selectedCategory);
      const matchStar = selectedStar === "ALL" || mod.stars === selectedStar;
      
      let matchStatus = true;
      if (statusFilter === "LEARNED") matchStatus = mod.unlocked;
      if (statusFilter === "SEEKING") matchStatus = mod.seeking;
      if (statusFilter === "LOCKED") matchStatus = !mod.unlocked && !mod.seeking;

      return matchSearch && matchCategory && matchStar && matchStatus;
    });
  }, [modsState, searchQuery, selectedCategory, selectedStar, statusFilter]);

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="bg-[#0b1017] border-b border-slate-800 px-4 py-2.5 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center font-mono font-black text-black text-xs shadow-md">
              RL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black tracking-widest text-amber-400 uppercase">
                  Tactical Armory System
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  v4.0 Telemetry HUD
                </span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight font-mono">
                Legendary Modification & Scrap Crafting Catalog
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#101722] border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Scrip Cap: <strong className="text-white">11,000</strong></span>
            </div>
            <Link
              href="/mods"
              className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black transition rounded-sm"
            >
              Return to Mods
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-6 space-y-6">
        
        {/* =========================================================================
            1:1 PURE VECTOR PERK CARD PROTOTYPE SHOWCASE
            Side-by-side comparison: Old 2018 Launch Screenshot vs New 1:1 Pure Vector Card
           ========================================================================= */}
        <section className="bg-[#0b1018] border-2 border-amber-500/60 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-amber-400 uppercase tracking-wider font-mono">
                  1:1 Pure Vector Perk Card Prototype (Zero Overlays)
                </h2>
                <p className="text-xs text-slate-400">
                  Direct side-by-side comparison: Old Launch Screenshot vs. New 1:1 Scaleform-Accurate Pure Vector Card
                </p>
              </div>
            </div>
            <div className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950 border border-amber-500/80 text-amber-200">
              Live Patch Test Engine
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center py-2">
            {/* Left: Old 2018 Launch Screenshot */}
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <div className="text-xs font-mono font-black uppercase text-red-400 tracking-wider bg-red-950/80 border border-red-700/60 px-3 py-1 rounded">
                ❌ Old 2018 Launch Screenshot (Baked-in Cost 1 & 3 Stars)
              </div>
              <div className="w-64 aspect-[3/4.2] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950">
                <img
                  src="/images/perks_official_wiki/fo76-perk-scattershot.webp"
                  alt="Old Scattershot 2018"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] font-mono text-slate-400 text-center">
                Permanently shows 2018 text: <em className="text-slate-300">"Shotguns now weigh 30% less..."</em>
              </p>
            </div>

            {/* Right: New 1:1 Pure Vector Card */}
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <div className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider bg-emerald-950/80 border border-emerald-500/60 px-3 py-1 rounded">
                ✅ New 1:1 Pure Vector Card (Live Cost 2, 1 Star, No Underlay)
              </div>
              <div className="w-64 aspect-[320/440]">
                <PureSvgPerkCard
                  displayName="SCATTERSHOT"
                  special="S"
                  cost={2}
                  rank={1}
                  maxRank={1}
                  description="20% of the damage dealt to a limb is applied to all limbs on your target."
                  artImagePath="/images/perks/scattershot_art_exact.png"
                />
              </div>
              <p className="text-[11px] font-mono text-emerald-300 text-center">
                Clean single graphic: exact live cost <strong>2</strong>, <strong>1 star</strong>, and current limb damage text.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            TACTICAL PROGRESS & TELEMETRY HUD
            - Global Segmented Progress Bar (Learned vs Seeking vs Locked)
            - Interactive Tier Breakdown (1★-4★) with click-to-filter
            - Required Catalyst & Modules Calculation Box
           ========================================================================= */}
        <section className="bg-[#0c121a] border border-slate-800 p-4 space-y-4 shadow-xl">
          {/* Header Row: Metrics Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Catalog Unlock Telemetry
                </div>
                <div className="text-base font-black text-white font-mono flex items-center gap-2">
                  <span>{stats.learned} of {stats.total} Learned</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {stats.percentLearned}% Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stat Indicators */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <button 
                onClick={() => setStatusFilter(statusFilter === "LEARNED" ? "ALL" : "LEARNED")}
                className={`px-3 py-1.5 border text-left transition ${
                  statusFilter === "LEARNED" ? "bg-emerald-950/80 border-emerald-500 text-emerald-300" : "bg-[#080d13] border-slate-800 text-slate-300 hover:border-emerald-700"
                }`}
              >
                <div className="text-[10px] text-emerald-400 font-bold uppercase">Learned</div>
                <div className="text-sm font-black text-white">{stats.learned}</div>
              </button>
              
              <button 
                onClick={() => setStatusFilter(statusFilter === "SEEKING" ? "ALL" : "SEEKING")}
                className={`px-3 py-1.5 border text-left transition ${
                  statusFilter === "SEEKING" ? "bg-amber-950/80 border-amber-500 text-amber-300" : "bg-[#080d13] border-slate-800 text-slate-300 hover:border-amber-700"
                }`}
              >
                <div className="text-[10px] text-amber-400 font-bold uppercase">Seeking</div>
                <div className="text-sm font-black text-white">{stats.seeking}</div>
              </button>

              <button 
                onClick={() => setStatusFilter(statusFilter === "LOCKED" ? "ALL" : "LOCKED")}
                className={`px-3 py-1.5 border text-left transition ${
                  statusFilter === "LOCKED" ? "bg-slate-800 border-slate-500 text-slate-200" : "bg-[#080d13] border-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="text-[10px] text-slate-400 font-bold uppercase">Locked</div>
                <div className="text-sm font-black text-white">{stats.locked}</div>
              </button>
            </div>
          </div>

          {/* Master Multi-Track Segmented Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 inline-block rounded-xs" /> Learned ({stats.percentLearned}%)
                <span className="w-2.5 h-2.5 bg-amber-500 inline-block rounded-xs ml-2" /> Seeking ({stats.percentSeeking}%)
                <span className="w-2.5 h-2.5 bg-slate-700 inline-block rounded-xs ml-2" /> Locked ({100 - stats.percentLearned - stats.percentSeeking}%)
              </span>
              <span className="text-slate-300 font-bold">{stats.learned + stats.seeking}/{stats.total} Tracked</span>
            </div>

            {/* Visual Bar Track */}
            <div className="h-3 w-full bg-[#070a0e] border border-slate-800 flex overflow-hidden">
              <div 
                className="bg-emerald-500 transition-all duration-300" 
                style={{ width: `${stats.percentLearned}%` }}
                title={`Learned: ${stats.learned} recipes (${stats.percentLearned}%)`}
              />
              <div 
                className="bg-amber-500 transition-all duration-300" 
                style={{ width: `${stats.percentSeeking}%` }}
                title={`Seeking: ${stats.seeking} recipes (${stats.percentSeeking}%)`}
              />
              <div 
                className="bg-slate-800 flex-1 transition-all duration-300" 
                title={`Locked: ${stats.locked} recipes`}
              />
            </div>
          </div>

          {/* Tier-by-Tier Interactive Micro-Progress Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {stats.tierStats.map((tier) => (
              <button
                key={tier.star}
                onClick={() => setSelectedStar(selectedStar === tier.star ? "ALL" : tier.star)}
                className={`p-2 border text-left font-mono transition group ${
                  selectedStar === tier.star
                    ? "bg-[#16202c] border-amber-400 shadow-md ring-1 ring-amber-400/40"
                    : "bg-[#090e15] border-slate-800/90 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400">{tier.star}★ Tier</span>
                  <span className="text-slate-300 text-[11px] font-bold">
                    {tier.learned}/{tier.total} <span className="text-slate-500">({tier.percent}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-black border border-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 group-hover:bg-emerald-300 transition-all"
                    style={{ width: `${tier.percent}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            TACTICAL SEARCH, FILTERS & MATRIX SWITCHER
           ========================================================================= */}
        <section className="bg-[#0a0e14] border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Quick Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-amber-400" />
            <input
              type="text"
              placeholder="Search by mod name, stat, keyword, or catalyst..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121820] border border-slate-700 px-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Star Filter */}
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

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] mr-1">SLOT:</span>
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

          {/* Status Filter Reset */}
          {statusFilter !== "ALL" && (
            <button
              onClick={() => setStatusFilter("ALL")}
              className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-[11px]"
            >
              Filter: {statusFilter} ✕
            </button>
          )}
        </section>

        {/* =========================================================================
            HIGH-DENSITY TACTICAL ARMORY TABLE
           ========================================================================= */}
        <div className="bg-[#090d12] border border-slate-800 overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#10161f] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center">Tier</th>
                <th className="py-2.5 px-4 w-48">Mod Name</th>
                <th className="py-2.5 px-3 w-36">Equipment Slot</th>
                <th className="py-2.5 px-4">Tactical Effect & Mechanism</th>
                <th className="py-2.5 px-3 w-28 text-center">Delta Impact</th>
                <th className="py-2.5 px-3 w-24 text-center">Modules</th>
                <th className="py-2.5 px-4 w-44">Craft Catalyst</th>
                <th className="py-2.5 px-3 w-36 text-center">Tracking Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMods.map((mod) => (
                <tr 
                  key={mod.id}
                  className={`hover:bg-[#121a24] transition group ${
                    mod.unlocked ? "bg-emerald-950/10" : mod.seeking ? "bg-amber-950/10" : ""
                  }`}
                >
                  {/* Tier */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30 text-[11px]">
                      {mod.tier}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-4 font-bold text-white group-hover:text-amber-400 transition">
                    {mod.name}
                  </td>

                  {/* Equipment Slot */}
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {mod.category}
                  </td>

                  {/* Effect */}
                  <td className="py-2.5 px-4 text-slate-300 font-sans text-xs leading-snug">
                    {mod.effect}
                  </td>

                  {/* Stat Delta */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-800/80 text-[11px]">
                      {mod.dpsGain}
                    </span>
                  </td>

                  {/* Modules Cost */}
                  <td className="py-2.5 px-3 text-center font-bold text-amber-300">
                    {mod.modules}
                  </td>

                  {/* Component */}
                  <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-[170px]" title={mod.component}>
                    {mod.component}
                  </td>

                  {/* Interactive Status Actions */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => toggleUnlock(mod.id)}
                        className={`px-2 py-1 text-[10px] font-bold border transition flex items-center gap-1 ${
                          mod.unlocked
                            ? "bg-emerald-500 text-black border-emerald-400 font-black shadow-sm"
                            : "bg-[#111720] text-slate-400 border-slate-700 hover:text-emerald-300 hover:border-emerald-600"
                        }`}
                        title={mod.unlocked ? "Mark as Locked" : "Mark as Learned"}
                      >
                        <Check className="w-3 h-3" />
                        {mod.unlocked ? "LEARNED" : "LEARN"}
                      </button>

                      <button
                        onClick={() => toggleSeeking(mod.id)}
                        className={`px-2 py-1 text-[10px] font-bold border transition flex items-center gap-1 ${
                          mod.seeking
                            ? "bg-amber-400 text-black border-amber-300 font-black shadow-sm"
                            : "bg-[#111720] text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-600"
                        }`}
                        title={mod.seeking ? "Remove from Seeking" : "Add to Wishlist"}
                      >
                        <Bookmark className="w-3 h-3" />
                        {mod.seeking ? "SEEKING" : "SEEK"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tactical Footer Telemetry */}
        <div className="bg-[#0a0e14] border border-slate-800 p-3 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredMods.length}</strong> matching mod formulas • Scrapping 1★–3★ gear yields <strong className="text-emerald-400">1.0% Plan</strong> / <strong className="text-amber-400">1.5% Box Mod</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">R.O.L.L. Tactical Telemetry Engine</span>
          </div>
        </div>
      </main>
    </div>
  );
}
