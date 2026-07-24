"use client";

import * as React from "react";
import { PERK_CATALOG, PerkCard, SpecialCategory, calculateSpecialCapacity, searchPerkCards } from "@/lib/perks/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const SPECIAL_LABELS: Record<SpecialCategory, { name: string; color: string; bg: string }> = {
  S: { name: "Strength", color: "text-red-400", bg: "bg-red-950/40 border-red-500/30" },
  P: { name: "Perception", color: "text-amber-400", bg: "bg-amber-950/40 border-amber-500/30" },
  E: { name: "Endurance", color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-500/30" },
  C: { name: "Charisma", color: "text-purple-400", bg: "bg-purple-950/40 border-purple-500/30" },
  I: { name: "Intelligence", color: "text-blue-400", bg: "bg-blue-950/40 border-blue-500/30" },
  A: { name: "Agility", color: "text-cyan-400", bg: "bg-cyan-950/40 border-cyan-500/30" },
  L: { name: "Luck", color: "text-yellow-400", bg: "bg-yellow-950/40 border-yellow-500/30" },
  LEGENDARY: { name: "Legendary", color: "text-amber-300", bg: "bg-amber-900/30 border-amber-400/40" }
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

  const filteredCards = React.useMemo(() => {
    let result = searchPerkCards(searchQuery);
    if (selectedCategory !== "ALL") {
      result = result.filter((c) => c.special === selectedCategory);
    }
    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">PUNCH CARD MACHINE // BETA</span>
            <h1 className="text-3xl font-bold tracking-tight mt-1 font-mono">P.E.R.K. Loadout Manager</h1>
            <p className="text-sm text-foreground/60 mt-1 font-mono">
              Perk Equipment &amp; Reconfiguration Kit for {characterName ? <strong>{characterName}</strong> : "Selected Character"}
            </p>
          </div>
          <Button onClick={handleSaveLoadout} disabled={saving || !characterId} className="bg-accent text-accent-foreground font-mono">
            {saving ? "Saving..." : "Save Active Loadout"}
          </Button>
        </div>
        {saveMessage ? <div className="mt-3 text-xs font-mono text-emerald-400">{saveMessage}</div> : null}
      </div>

      {/* 6 Loadout Slot Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setActiveSlot(slot)}
            className={`px-4 py-2 rounded-t-md text-xs font-mono font-bold transition-all border ${
              activeSlot === slot
                ? "border-accent bg-accent/15 text-accent border-b-transparent"
                : "border-border bg-card/40 text-foreground/60 hover:text-foreground hover:bg-card"
            }`}
          >
            🕹️ Slot {slot + 1}
          </button>
        ))}
      </div>

      {/* SPECIAL Stat Allocation Sliders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono flex justify-between items-center">
            <span>S.P.E.C.I.A.L. Base Point Allocation</span>
            <span className="text-xs font-mono text-accent">Total Points: {totalAllocatedSpecial} / 56</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Allocate up to 15 points per S.P.E.C.I.A.L. stat. Points expand your card slot capacity per category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {(["S", "P", "E", "C", "I", "A", "L"] as Array<keyof SpecialsState>).map((stat) => {
              const meta = SPECIAL_LABELS[stat];
              const used = usedSpecialCapacity[stat] || 0;
              const max = specials[stat];
              const isOver = used > max;

              return (
                <div key={stat} className={`rounded-lg border p-3 flex flex-col items-center justify-between space-y-2 ${meta.bg}`}>
                  <span className={`text-lg font-black font-mono ${meta.color}`}>{stat}</span>
                  <span className="text-[0.68rem] font-mono text-foreground/70 uppercase tracking-wider">{meta.name}</span>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => handleSpecialChange(stat, -1)}
                      className="px-2 py-0.5 rounded bg-panel border border-border hover:bg-card text-xs"
                    >
                      -
                    </button>
                    <span>{specials[stat]}</span>
                    <button
                      type="button"
                      onClick={() => handleSpecialChange(stat, 1)}
                      className="px-2 py-0.5 rounded bg-panel border border-border hover:bg-card text-xs"
                    >
                      +
                    </button>
                  </div>
                  <span className={`text-[0.7rem] font-mono font-semibold ${isOver ? "text-red-400 font-bold" : "text-foreground/50"}`}>
                    Cards: {used} / {max}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Equipped Perk Cards Deck */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono">Equipped Perk Deck ({equippedCards.length} Cards)</CardTitle>
          <CardDescription className="text-xs">Active perk cards slotted in Punch Card Loadout {activeSlot + 1}.</CardDescription>
        </CardHeader>
        <CardContent>
          {equippedCards.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-foreground/40 border border-dashed border-border rounded-lg">
              No perk cards equipped in this loadout yet. Select cards below to slot into your deck!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {equippedCards.map((item) => {
                const card = PERK_CATALOG.find((c) => c.id === item.cardId);
                if (!card) return null;
                const meta = SPECIAL_LABELS[card.special];
                const activeRankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];

                return (
                  <div key={card.id} className={`rounded-lg border p-3 space-y-2 relative overflow-hidden bg-panel ${meta.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono ${meta.color}`}>[{card.special}] {card.name}</span>
                      <button
                        type="button"
                        onClick={() => handleUnequipCard(card.id)}
                        className="text-[0.7rem] text-foreground/50 hover:text-red-400 font-mono"
                      >
                        Unequip
                      </button>
                    </div>
                    <div className="text-[0.75rem] font-mono text-foreground/80 leading-snug">
                      {activeRankObj?.description}
                    </div>
                    <div className="flex items-center justify-between text-[0.7rem] font-mono pt-1 border-t border-border/50">
                      <span className="text-accent">Cost: {activeRankObj?.cost} pts</span>
                      <span className="text-amber-400">{"★".repeat(item.rank)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perk Cards Catalog Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-mono">Vault-Tec Perk Card Catalog</CardTitle>
              <CardDescription className="text-xs">Browse all Fallout 76 perk cards across S.P.E.C.I.A.L. categories.</CardDescription>
            </div>
            <input
              type="text"
              placeholder="Search perk cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono text-foreground w-full md:w-64 focus:outline-none focus:border-accent"
            />
          </div>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                selectedCategory === "ALL" ? "bg-accent text-accent-foreground border-accent" : "border-border bg-panel text-foreground/60"
              }`}
            >
              ALL
            </button>
            {(["S", "P", "E", "C", "I", "A", "L", "LEGENDARY"] as SpecialCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  selectedCategory === cat ? "bg-accent text-accent-foreground border-accent" : "border-border bg-panel text-foreground/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCards.map((card) => {
              const equippedItem = equippedCards.find((item) => item.cardId === card.id);
              const meta = SPECIAL_LABELS[card.special];

              return (
                <div
                  key={card.id}
                  className={`rounded-lg border p-4 flex flex-col justify-between space-y-3 bg-panel transition-all ${
                    equippedItem ? "border-accent bg-accent/5 shadow-md" : "border-border hover:border-accent/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-bold font-mono ${meta.color}`}>[{card.special}] {card.name}</span>
                      <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-foreground/60">
                        Lvl {card.minLevel}
                      </span>
                    </div>

                    {/* Card Illustration Image */}
                    {card.imageUrl ? (
                      <div className="relative w-full h-32 rounded bg-background/60 border border-border flex items-center justify-center p-2 overflow-hidden">
                        {/* eslint-disable-next-html-element-suppression */}
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    <div className="text-[0.75rem] font-mono text-foreground/80 leading-relaxed">
                      {card.ranks[0]?.description}
                    </div>
                  </div>

                  {/* Equip & Rank Buttons */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground/50">Max Rank: {"★".repeat(card.maxRank)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {card.ranks.map((r) => (
                        <button
                          key={r.rank}
                          type="button"
                          onClick={() => handleEquipCard(card, r.rank)}
                          className={`flex-1 py-1 text-[0.68rem] font-mono font-bold rounded border ${
                            equippedItem?.rank === r.rank
                              ? "bg-accent text-accent-foreground border-accent"
                              : "bg-background border-border text-foreground/70 hover:border-accent"
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
