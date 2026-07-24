"use client";

import * as React from "react";
import { PERK_CATALOG, PerkCard, SpecialCategory, calculateSpecialCapacity, searchPerkCards } from "@/lib/perks/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exportPerkDeckCard } from "@/components/builder/builder-card-exporter";

type EquippedItem = { cardId: string; rank: number };

type SpecialsState = {
  S: number;
  P: number;
  E: number;
  C: number;
  I: number;
  A: number;
  L: number;
};

interface PerkBuilderProps {
  characterId?: string | null;
  characterName?: string | null;
}

const SPECIAL_THEMES: Record<SpecialCategory, { name: string; border: string; text: string; badge: string; glow: string }> = {
  S: { name: "Strength", border: "border-red-500/50 hover:border-red-500", text: "text-red-400", badge: "bg-red-500/20 text-red-300 border-red-500/40", glow: "shadow-red-950/40" },
  P: { name: "Perception", border: "border-amber-500/50 hover:border-amber-500", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", glow: "shadow-amber-950/40" },
  E: { name: "Endurance", border: "border-emerald-500/50 hover:border-emerald-500", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", glow: "shadow-emerald-950/40" },
  C: { name: "Charisma", border: "border-purple-500/50 hover:border-purple-500", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40", glow: "shadow-purple-950/40" },
  I: { name: "Intelligence", border: "border-blue-500/50 hover:border-blue-500", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40", glow: "shadow-blue-950/40" },
  A: { name: "Agility", border: "border-cyan-500/50 hover:border-cyan-500", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", glow: "shadow-cyan-950/40" },
  L: { name: "Luck", border: "border-yellow-500/50 hover:border-yellow-500", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", glow: "shadow-yellow-950/40" },
  LEGENDARY: { name: "Legendary", border: "border-amber-400/80 hover:border-amber-300", text: "text-amber-300", badge: "bg-amber-400/20 text-amber-200 border-amber-400/50", glow: "shadow-amber-900/50" }
};

export default function PerkBuilder({ characterId, characterName }: PerkBuilderProps) {
  const [activeSlot, setActiveSlot] = React.useState<number>(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SpecialCategory | "ALL">("ALL");

  const [specials, setSpecials] = React.useState<SpecialsState>({
    S: 1,
    P: 1,
    E: 1,
    C: 1,
    I: 1,
    A: 1,
    L: 1
  });

  const [equippedCards, setEquippedCards] = React.useState<EquippedItem[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);

  // Load active loadout slot
  React.useEffect(() => {
    if (!characterId) return;
    fetch(`/api/perks/loadouts?characterId=${characterId}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success && Array.isArray(payload.data?.loadouts)) {
          const slotData = payload.data.loadouts.find((l: { slotIndex: number }) => l.slotIndex === activeSlot);
          if (slotData) {
            if (slotData.specials) setSpecials(slotData.specials);
            if (Array.isArray(slotData.equippedCards)) setEquippedCards(slotData.equippedCards);
          } else {
            setSpecials({ S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 });
            setEquippedCards([]);
          }
        }
      })
      .catch(() => undefined);
  }, [characterId, activeSlot]);

  const usedSpecialCapacity = React.useMemo(() => calculateSpecialCapacity(equippedCards), [equippedCards]);
  const totalAllocatedSpecial = Object.values(specials).reduce((acc, val) => acc + val, 0);

  const handleSpecialChange = (stat: keyof SpecialsState, delta: number) => {
    setSpecials((prev) => {
      const current = prev[stat];
      const next = Math.max(1, Math.min(15, current + delta));
      return { ...prev, [stat]: next };
    });
  };

  const handleEquipCard = (card: PerkCard, rank = 1) => {
    setEquippedCards((prev) => {
      const filtered = prev.filter((item) => item.cardId !== card.id);
      return [...filtered, { cardId: card.id, rank }];
    });
  };

  const handleUnequipCard = (cardId: string) => {
    setEquippedCards((prev) => prev.filter((item) => item.cardId !== cardId));
  };

  const handleSaveLoadout = async () => {
    if (!characterId) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/perks/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          slotIndex: activeSlot,
          name: `Punch Card Loadout ${activeSlot + 1}`,
          specials,
          equippedCards
        })
      });
      const payload = await res.json();
      if (payload?.success) {
        setSaveMessage(`✅ Punch Card Loadout ${activeSlot + 1} Saved!`);
      } else {
        setSaveMessage("❌ Failed to save loadout.");
      }
    } catch {
      setSaveMessage("❌ Error saving loadout.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleExportDeckPng = () => {
    exportPerkDeckCard({
      characterName: characterName || "Vault Dweller",
      slotName: `Punch Card Loadout ${activeSlot + 1}`,
      specials,
      equippedCards
    });
  };

  const filteredCards = React.useMemo(() => {
    let result = searchPerkCards(searchQuery);
    if (selectedCategory !== "ALL") {
      result = result.filter((c) => c.special === selectedCategory);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[var(--radius-lg)] border border-emerald-500/40 bg-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-emerald-400 font-bold">
              VAULT-TEC PUNCH CARD MACHINE // P.E.R.K. SYSTEM ({PERK_CATALOG.length} CARDS)
            </span>
            <h1 className="text-3xl font-bold tracking-tight mt-1 font-mono text-white">
              P.E.R.K. Loadout Manager
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-mono">
              Perk Equipment &amp; Reconfiguration Kit for {characterName ? <strong className="text-emerald-400">{characterName}</strong> : "Selected Character"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleExportDeckPng} variant="outline" className="font-mono text-xs border-emerald-500/60 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50">
              📸 Export Deck PNG
            </Button>
            <Button onClick={handleSaveLoadout} disabled={saving || !characterId} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs">
              {saving ? "Saving..." : "Save Active Loadout"}
            </Button>
          </div>
        </div>
        {saveMessage ? <div className="mt-3 text-xs font-mono text-emerald-400 font-bold">{saveMessage}</div> : null}
      </div>

      {/* 6 Loadout Slot Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setActiveSlot(slot)}
            className={`px-4 py-2 rounded-t-md text-xs font-mono font-bold transition-all border ${
              activeSlot === slot
                ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 border-b-transparent shadow-md"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            🕹️ Slot {slot + 1}
          </button>
        ))}
      </div>

      {/* SPECIAL Stat Allocation Sliders */}
      <Card className="bg-slate-950 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-900">
          <CardTitle className="text-base font-mono flex justify-between items-center text-slate-100">
            <span>S.P.E.C.I.A.L. Base Point Allocation</span>
            <span className="text-xs font-mono text-amber-400 font-bold">Total Points: {totalAllocatedSpecial} / 56</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Allocate up to 15 points per S.P.E.C.I.A.L. stat to expand your perk card slot capacity.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {(["S", "P", "E", "C", "I", "A", "L"] as Array<keyof SpecialsState>).map((stat) => {
              const theme = SPECIAL_THEMES[stat];
              const used = usedSpecialCapacity[stat] || 0;
              const max = specials[stat];
              const isOver = used > max;

              return (
                <div key={stat} className={`rounded-lg border bg-slate-900/90 p-3 flex flex-col items-center justify-between space-y-2 ${theme.border}`}>
                  <span className={`text-xl font-black font-mono ${theme.text}`}>{stat}</span>
                  <span className="text-[0.65rem] font-mono text-slate-300 uppercase tracking-widest font-semibold">{theme.name}</span>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                    <button
                      type="button"
                      onClick={() => handleSpecialChange(stat, -1)}
                      className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-200"
                    >
                      -
                    </button>
                    <span className="w-5 text-center">{specials[stat]}</span>
                    <button
                      type="button"
                      onClick={() => handleSpecialChange(stat, 1)}
                      className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-200"
                    >
                      +
                    </button>
                  </div>
                  <span className={`text-[0.68rem] font-mono font-bold px-2 py-0.5 rounded ${isOver ? "bg-red-950 text-red-400 border border-red-500/50" : "bg-slate-950 text-slate-300 border border-slate-800"}`}>
                    Cards: {used} / {max}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Equipped Perk Cards Deck */}
      <Card className="bg-slate-950 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-900">
          <CardTitle className="text-base font-mono text-slate-100 flex items-center justify-between">
            <span>Equipped Perk Deck ({equippedCards.length} Cards)</span>
            <span className="text-xs text-emerald-400 font-normal">Punch Card Loadout {activeSlot + 1}</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Active perk cards slotted in this loadout.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {equippedCards.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
              No perk cards equipped in this loadout yet. Select cards below from the Vault-Tec catalog!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {equippedCards.map((item) => {
                const card = PERK_CATALOG.find((c) => c.id === item.cardId);
                if (!card) return null;
                const theme = SPECIAL_THEMES[card.special];
                const activeRankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];

                return (
                  <div key={card.id} className={`rounded-lg border bg-slate-900/95 p-3.5 space-y-2.5 relative overflow-hidden shadow-lg ${theme.border}`}>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[0.7rem] font-bold font-mono px-1.5 py-0.5 rounded border ${theme.badge}`}>{card.special}</span>
                        <span className="text-xs font-bold font-mono text-white truncate">{card.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnequipCard(card.id)}
                        className="text-[0.68rem] text-slate-400 hover:text-red-400 font-mono font-semibold"
                      >
                        Unequip
                      </button>
                    </div>
                    <p className="text-[0.75rem] font-mono text-slate-200 leading-relaxed min-h-[40px]">
                      {activeRankObj?.description}
                    </p>
                    <div className="flex items-center justify-between text-[0.7rem] font-mono pt-2 border-t border-slate-800/80">
                      <span className="text-emerald-400 font-bold">Cost: {activeRankObj?.cost || item.rank} pts</span>
                      <span className="text-amber-400 font-bold">{"★".repeat(item.rank)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perk Cards Catalog Selection */}
      <Card className="bg-slate-950 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-mono text-slate-100 flex items-center gap-2">
                <span>Vault-Tec Perk Card Catalog</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono">
                  {filteredCards.length} Cards
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Browse all Fallout 76 perk cards across S.P.E.C.I.A.L. categories.</CardDescription>
            </div>
            <input
              type="text"
              placeholder="Search perk cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 text-xs font-mono text-white placeholder:text-slate-500 w-full md:w-64 focus:outline-none focus:border-emerald-500"
            />
          </div>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border ${
                selectedCategory === "ALL" ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-md" : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              ALL ({PERK_CATALOG.length})
            </button>
            {(["S", "P", "E", "C", "I", "A", "L", "LEGENDARY"] as SpecialCategory[]).map((cat) => {
              const theme = SPECIAL_THEMES[cat];
              const count = PERK_CATALOG.filter((c) => c.special === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                    selectedCategory === cat ? `${theme.badge} border-current shadow-md` : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCards.map((card) => {
              const equippedItem = equippedCards.find((item) => item.cardId === card.id);
              const theme = SPECIAL_THEMES[card.special];

              return (
                <div
                  key={card.id}
                  className={`rounded-lg border p-4 flex flex-col justify-between space-y-3 bg-slate-900/90 transition-all ${
                    equippedItem
                      ? "border-emerald-500 bg-emerald-950/20 shadow-lg ring-1 ring-emerald-500/50"
                      : `${theme.border} hover:bg-slate-900`
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[0.68rem] font-bold font-mono px-1.5 py-0.5 rounded border ${theme.badge}`}>{card.special}</span>
                        <span className="text-xs font-bold font-mono text-white leading-tight">{card.name}</span>
                      </div>
                      <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-semibold whitespace-nowrap">
                        Lvl {card.minLevel}
                      </span>
                    </div>

                    {/* High-contrast Card Description */}
                    <div className="text-[0.75rem] font-mono text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80 min-h-[54px]">
                      {card.ranks[0]?.description}
                    </div>
                  </div>

                  {/* Equip & Rank Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 text-[0.7rem]">Max: {"★".repeat(card.maxRank)}</span>
                      {equippedItem ? (
                        <span className="text-[0.68rem] font-bold font-mono text-emerald-400 flex items-center gap-1">
                          ✓ Equipped ({equippedItem.rank}★)
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      {card.ranks.map((r) => (
                        <button
                          key={r.rank}
                          type="button"
                          onClick={() => handleEquipCard(card, r.rank)}
                          className={`flex-1 py-1 text-[0.7rem] font-mono font-bold rounded border transition-all ${
                            equippedItem?.rank === r.rank
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md"
                              : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                          }`}
                        >
                          {r.rank}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
