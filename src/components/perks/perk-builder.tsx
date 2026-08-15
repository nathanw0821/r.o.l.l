"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PERK_CATALOG, PerkCard, SpecialCategory, calculateSpecialCapacity, calculateLegendarySpecialBonuses, getPerkCardById, searchPerkCards, isGhoulPerkCard } from "@/lib/perks/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exportPerkDeckCard } from "@/components/builder/builder-card-exporter";
import { Sparkles, Link2 } from "lucide-react";
import PerkLevelingRoadmap from "@/components/perks/perk-leveling-roadmap";
import PipBoyPerkCard from "@/components/perks/pipboy-perk-card";
import NukesDragonsImportModal from "@/components/perks/nukes-dragons-import-modal";
import type { NukesDragonsParsedBuild } from "@/lib/perks/nukes-dragons-parser";

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
  mode?: "live" | "pts";
}

import { OFFICIAL_SPECIAL_THEMES as SPECIAL_THEMES } from "@/lib/perks/special-theme";

function PerkBuilderUrlSync({ onQueryChange }: { onQueryChange: (q: string) => void }) {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q") || params.get("card") || "";
      if (urlQuery) {
        onQueryChange(urlQuery);
      }
    }
  }, [onQueryChange]);

  return null;
}

export default function PerkBuilder({ characterId, characterName, mode = "live" }: PerkBuilderProps) {
  const [activeSlot, setActiveSlot] = React.useState<number>(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SpecialCategory | "ALL" | "GHOUL">("ALL");
  const [showRoadmap, setShowRoadmap] = React.useState(false);
  const [isGhoul, setIsGhoul] = React.useState(mode === "pts");

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
  const [isFemale, setIsFemale] = React.useState(false);
  const [isNdImportOpen, setIsNdImportOpen] = React.useState(false);

  const isInitialLoadedRef = React.useRef(false);

  // Load active loadout slot (LocalStorage first for instant load, then Cloud sync)
  React.useEffect(() => {
    isInitialLoadedRef.current = false;
    // 1. LocalStorage prefill
    try {
      const localDataStr = localStorage.getItem(`roll_perk_loadout_slot_${activeSlot}`);
      if (localDataStr) {
        const parsed = JSON.parse(localDataStr);
        if (parsed.specials) setSpecials(parsed.specials);
        if (Array.isArray(parsed.equippedCards)) setEquippedCards(parsed.equippedCards);
      } else {
        setSpecials({ S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 });
        setEquippedCards([]);
      }
    } catch {
      // Ignore local storage read errors
    }

    setTimeout(() => {
      isInitialLoadedRef.current = true;
    }, 100);

    // 2. Cloud DB sync
    fetch(`/api/perks/loadouts${characterId ? `?characterId=${characterId}` : ""}`)
      .then((res) => res.json() as Promise<{ success?: boolean; data?: { loadouts?: Array<{ slotIndex: number; specials?: SpecialsState; equippedCards?: EquippedItem[] }> } }>)
      .then((payload) => {
        if (payload?.success && Array.isArray(payload.data?.loadouts)) {
          const slotData = payload.data.loadouts.find((l: { slotIndex: number }) => l.slotIndex === activeSlot);
          if (slotData) {
            if (slotData.specials && Object.keys(slotData.specials).length > 0) {
              setSpecials(slotData.specials);
            }
            if (Array.isArray(slotData.equippedCards) && slotData.equippedCards.length > 0) {
              setEquippedCards(slotData.equippedCards);
            }
          }
        }
      })
      .catch(() => undefined);
  }, [characterId, activeSlot]);

  // Auto-save to LocalStorage on change ONLY after initial load is complete
  React.useEffect(() => {
    if (!isInitialLoadedRef.current) return;
    try {
      localStorage.setItem(
        `roll_perk_loadout_slot_${activeSlot}`,
        JSON.stringify({ specials, equippedCards })
      );
    } catch {
      // Ignore write error
    }
  }, [activeSlot, specials, equippedCards]);

  const safeEquippedCards = React.useMemo(() => {
    if (!Array.isArray(equippedCards)) return [];
    return equippedCards
      .map((item) => {
        if (typeof item === "string") return { cardId: item, rank: 1 };
        if (item && typeof item === "object" && typeof (item as { cardId?: unknown }).cardId === "string") {
          return { cardId: (item as { cardId: string }).cardId, rank: typeof (item as { rank?: unknown }).rank === "number" ? (item as { rank: number }).rank : 1 };
        }
        return null;
      })
      .filter((item): item is EquippedItem => item !== null);
  }, [equippedCards]);

  const usedSpecialCapacity = React.useMemo(() => calculateSpecialCapacity(safeEquippedCards), [safeEquippedCards]);
  const legendaryBonuses = React.useMemo(() => calculateLegendarySpecialBonuses(safeEquippedCards), [safeEquippedCards]);

  const equippedLegendaryCards = React.useMemo(() => {
    return safeEquippedCards.filter((item) => {
      const card = getPerkCardById(item.cardId);
      return card?.special === "LEGENDARY";
    });
  }, [safeEquippedCards]);

  // Hard Cap of 15 (Human) or 20 (Ghoul) for perk card slot capacity
  const effectiveCapacities = React.useMemo(() => {
    const maxCap = isGhoul ? 20 : 15;
    const caps: Record<keyof SpecialsState, number> = { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 };
    (["S", "P", "E", "C", "I", "A", "L"] as Array<keyof SpecialsState>).forEach((stat) => {
      caps[stat] = Math.min(maxCap, specials[stat] + (legendaryBonuses[stat] || 0));
    });
    return caps;
  }, [specials, legendaryBonuses, isGhoul]);

  const totalEffectiveSpecials = React.useMemo(() => {
    const totals: Record<keyof SpecialsState, number> = { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 };
    (["S", "P", "E", "C", "I", "A", "L"] as Array<keyof SpecialsState>).forEach((stat) => {
      totals[stat] = specials[stat] + (legendaryBonuses[stat] || 0);
    });
    return totals;
  }, [specials, legendaryBonuses]);

  const totalAllocatedSpecial = Object.values(specials).reduce((acc, val) => acc + val, 0);
  const totalLegendaryBonusSpecial = Object.values(legendaryBonuses).reduce((acc, val) => acc + val, 0);

  const overCapacityStats = React.useMemo(() => {
    const over: Array<{ stat: keyof SpecialsState; used: number; max: number }> = [];
    (["S", "P", "E", "C", "I", "A", "L"] as Array<keyof SpecialsState>).forEach((stat) => {
      const used = usedSpecialCapacity[stat] || 0;
      const max = effectiveCapacities[stat];
      if (used > max) over.push({ stat, used, max });
    });
    return over;
  }, [usedSpecialCapacity, effectiveCapacities]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const handleSpecialChange = (stat: keyof SpecialsState, delta: number) => {
    setSpecials((prev) => {
      const current = prev[stat];
      const next = Math.max(1, Math.min(15, current + delta));
      return { ...prev, [stat]: next };
    });
  };

  const handleEquipCard = (card: PerkCard, rank = 1) => {
    if (card.special === "LEGENDARY") {
      const isAlreadyEquipped = equippedCards.some((item) => item.cardId === card.id);
      if (!isAlreadyEquipped && equippedLegendaryCards.length >= 6) {
        setSaveMessage("⚠️ Level 300 Limit: Maximum 6 Legendary Perk Cards can be equipped total.");
        setTimeout(() => setSaveMessage(null), 3500);
        return;
      }
    }

    setEquippedCards((prev) => {
      const filtered = prev.filter((item) => item.cardId !== card.id);
      return [...filtered, { cardId: card.id, rank }];
    });
  };

  const handleUnequipCard = (cardId: string) => {
    setEquippedCards((prev) => prev.filter((item) => item.cardId !== cardId));
  };

  const handleSaveLoadout = async () => {
    setSaving(true);
    setSaveMessage(null);

    // Save to LocalStorage immediately (guarantees saving regardless of auth/network state)
    try {
      localStorage.setItem(
        `roll_perk_loadout_slot_${activeSlot}`,
        JSON.stringify({ specials, equippedCards })
      );
    } catch {
      // Ignore local storage error
    }

    try {
      const res = await fetch("/api/perks/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: characterId || undefined,
          slotIndex: activeSlot,
          name: `Punch Card Loadout ${activeSlot + 1}`,
          specials,
          equippedCards
        })
      });
      const payload = (await res.json()) as { success?: boolean };
      if (payload?.success) {
        setSaveMessage(`✅ Punch Card Loadout ${activeSlot + 1} Saved! (Cloud & Local)`);
      } else {
        setSaveMessage(`✅ Punch Card Loadout ${activeSlot + 1} Saved Locally!`);
      }
    } catch {
      setSaveMessage(`✅ Punch Card Loadout ${activeSlot + 1} Saved Locally!`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const handleApplyNdBuild = (build: NukesDragonsParsedBuild) => {
    const newSpecials: SpecialsState = {
      S: build.specials.str,
      P: build.specials.per,
      E: build.specials.end,
      C: build.specials.cha,
      I: build.specials.int,
      A: build.specials.agi,
      L: build.specials.lck,
    };
    setSpecials(newSpecials);
    setEquippedCards(build.equippedCards);
    if (build.isGhoul && mode === "pts") {
      setIsGhoul(true);
    }

    try {
      localStorage.setItem(
        `roll_perk_loadout_slot_${activeSlot}`,
        JSON.stringify({ specials: newSpecials, equippedCards: build.equippedCards })
      );
      if (build.legendaryPerks.length > 0) {
        localStorage.setItem(
          "roll_legendary_perk_ids",
          JSON.stringify(build.legendaryPerks.map((lp) => lp.id))
        );
      }
    } catch {
      // Ignore local storage write errors
    }

    setSaveMessage(`✅ N&D Build imported successfully into Loadout ${activeSlot + 1}!`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleExportDeckPng = () => {
    exportPerkDeckCard({
      characterName: characterName || "Vault Dweller",
      slotName: `Punch Card Loadout ${activeSlot + 1}`,
      specials,
      equippedCards
    });
  };

  const searchedAllCards = React.useMemo(() => searchPerkCards(searchQuery), [searchQuery]);

  const filteredCards = React.useMemo(() => {
    let result = searchedAllCards;
    if (selectedCategory === "GHOUL") {
      result = result.filter((c) => isGhoulPerkCard(c.id || c.name));
    } else if (selectedCategory !== "ALL") {
      result = result.filter((c) => c.special === selectedCategory);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchedAllCards, selectedCategory]);

  const handleClearDeck = () => {
    setEquippedCards([]);
  };

  const handleResetSpecials = () => {
    setSpecials({ S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 });
  };

  const [aiAdvice, setAiAdvice] = React.useState<string | null>(null);
  const [loadingAi, setLoadingAi] = React.useState(false);

  const handleGetAiAdvice = async () => {
    setLoadingAi(true);
    try {
      const equippedDetails = equippedCards.map((item) => {
        const card = getPerkCardById(item.cardId);
        return {
          name: card?.name || item.cardId,
          rank: item.rank,
          special: card?.special || "S",
        };
      });

      const res = await fetch("/api/ai/build-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          special: specials,
          perks: equippedDetails,
        }),
      });
      const data = (await res.json()) as { success?: boolean; advice?: string; error?: string };
      if (data.success && data.advice) {
        setAiAdvice(data.advice);
      } else {
        setAiAdvice(data.error || "Vault-Tec Build Calculations currently offline.");
      }
    } catch {
      setAiAdvice("Unable to compute build synergies right now.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <React.Suspense fallback={null}>
        <PerkBuilderUrlSync onQueryChange={setSearchQuery} />
      </React.Suspense>
      {/* Header Banner */}
      <div className="bg-[#0c121a] border border-slate-800 p-5 shadow-xl font-mono relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
              PUNCH CARD MACHINE // {PERK_CATALOG.length} REGISTERED CARDS
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-0.5 text-white uppercase">
              P.E.R.K. Loadout Manager
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Perk Equipment &amp; Reconfiguration Kit for {characterName ? <strong className="text-emerald-400">{characterName}</strong> : "Selected Character"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleGetAiAdvice} disabled={loadingAi} variant="outline" className="font-mono text-xs border-amber-500/60 text-amber-300 bg-amber-950/30 hover:bg-amber-900/50">
              {loadingAi ? "Analyzing Build..." : "Build Tactics"}
            </Button>
            <Button onClick={handleExportDeckPng} variant="outline" className="font-mono text-xs border-emerald-500/60 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50">
              Export Deck PNG
            </Button>
            <Button onClick={handleSaveLoadout} disabled={saving || !characterId} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs disabled:opacity-60">
              {saving ? "Saving..." : !characterId ? "Sign In to Save Loadout" : "Save Active Loadout"}
            </Button>
          </div>
        </div>
        {saveMessage ? <div className="mt-3 text-xs text-emerald-400 font-bold">{saveMessage}</div> : null}
        {aiAdvice && (
          <div className="mt-3 p-3 border border-amber-500/50 bg-[#111720] text-xs text-amber-200 flex items-start justify-between gap-3 shadow-md">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[0.7rem] mb-0.5">[ BUILD TACTICS ]</span>
                <p className="leading-relaxed text-amber-100">{aiAdvice}</p>
              </div>
            </div>
            <button type="button" onClick={() => setAiAdvice(null)} className="text-amber-400/60 hover:text-amber-300 text-sm font-bold shrink-0">×</button>
          </div>
        )}
      </div>

      {/* 6 Loadout Slot Selection Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2.5 font-mono text-xs">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setActiveSlot(slot)}
            className={`px-3 py-1.5 border transition-all ${
              activeSlot === slot
                ? "border-amber-400 bg-amber-500/10 text-amber-300 font-black shadow-sm"
                : "border-slate-800 bg-[#0c121a] text-slate-400 hover:text-white hover:border-slate-600"
            }`}
          >
            SLOT {slot + 1}
          </button>
        ))}
      </div>

      {/* SPECIAL Stat Allocation Sliders */}
      <Card className="bg-slate-950 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-900">
          <CardTitle className="text-base font-mono flex justify-between items-center text-slate-100">
            <span>S.P.E.C.I.A.L. Base Point Allocation</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-amber-400 font-bold">
                Total Base: {totalAllocatedSpecial} / 56
                {totalLegendaryBonusSpecial > 0 ? (
                  <span className="ml-1.5 text-amber-300 font-normal">(+{totalLegendaryBonusSpecial} Legendary)</span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={handleResetSpecials}
                className="text-[0.68rem] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all font-mono"
              >
                Reset (1-1-1-1-1-1-1)
              </button>
            </div>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Allocate up to 15 points per S.P.E.C.I.A.L. stat. Equipped Legendary S.P.E.C.I.A.L. perks automatically add extra points &amp; expand perk card capacity (capped at 15 per category).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {(["S", "P", "E", "C", "I", "A", "L"] as Array<keyof SpecialsState>).map((stat) => {
              const theme = SPECIAL_THEMES[stat] || { name: stat, text: "text-foreground" };
              const used = usedSpecialCapacity[stat] || 0;
              const legBonus = legendaryBonuses[stat] || 0;
              const effectiveCap = effectiveCapacities[stat];
              const effectiveTotal = totalEffectiveSpecials[stat];
              const isOver = used > effectiveCap;

              const styleMap: Record<keyof SpecialsState, { bg: string; rotation: string }> = {
                S: { bg: "bg-[#2b473b]", rotation: "-rotate-1.5" },
                P: { bg: "bg-[#423c28]", rotation: "rotate-1" },
                E: { bg: "bg-[#15576c]", rotation: "-rotate-1" },
                C: { bg: "bg-[#823f18]", rotation: "rotate-1.5" },
                I: { bg: "bg-[#4e5844]", rotation: "-rotate-1" },
                A: { bg: "bg-[#8b4f40]", rotation: "rotate-1" },
                L: { bg: "bg-[#484459]", rotation: "-rotate-1.5" }
              };

              const cardStyle = styleMap[stat];

              return (
                <div
                  key={stat}
                  className={cn(
                    "relative rounded-xl border-[2.5px] border-[#e8dfc8]/70 p-3 flex flex-col items-center justify-between space-y-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition-all duration-200 hover:rotate-0 hover:scale-[1.03] select-none",
                    cardStyle.bg,
                    cardStyle.rotation
                  )}
                >
                  {/* Decorative vintage inner paper border */}
                  <div className="absolute inset-1 rounded-lg border border-[#e8dfc8]/20 pointer-events-none" />

                  {/* Actual Official Fallout 76 WebP SPECIAL Letter Icon */}
                  <div className="flex flex-col items-center gap-1 z-10 pt-1">
                    <div className="relative h-20 w-20 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/special/special_${stat}.webp`}
                        alt={`Official Fallout 76 ${theme.name} SPECIAL Letter`}
                        onError={(e) => {
                          e.currentTarget.src = `/images/special/special_${stat}.png`;
                        }}
                        className="h-20 w-20 object-contain transition-transform duration-200 hover:scale-105"
                      />
                    </div>
                    <span className="text-[0.72rem] font-mono text-[#f3efe0] uppercase tracking-widest font-bold drop-shadow mt-1">
                      {theme.name}
                    </span>
                    {legBonus > 0 ? (
                      <span className="mt-0.5 text-[0.62rem] font-mono px-2 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-500/60 rounded-full font-bold shadow">
                        +{legBonus}⭐ Legendary
                      </span>
                    ) : null}
                  </div>

                  {/* Point Adjuster */}
                  <div className="flex items-center gap-1.5 z-10 my-1">
                    <button
                      type="button"
                      title={`Decrease ${theme.name} base points`}
                      onClick={() => handleSpecialChange(stat, -1)}
                      className="w-7 h-7 rounded-md bg-[#121619]/80 hover:bg-[#121619] border border-[#e8dfc8]/40 text-[#f8f5ea] font-mono font-bold text-sm transition-all shadow active:scale-95 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-base font-mono font-bold text-[#fffdf5] w-6 text-center drop-shadow">
                      {specials[stat]}
                    </span>
                    <button
                      type="button"
                      title={`Increase ${theme.name} base points`}
                      onClick={() => handleSpecialChange(stat, 1)}
                      className="w-7 h-7 rounded-md bg-[#121619]/80 hover:bg-[#121619] border border-[#e8dfc8]/40 text-[#f8f5ea] font-mono font-bold text-sm transition-all shadow active:scale-95 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Stat Total & Card Capacity Badge */}
                  <div className="flex flex-col items-center gap-1 z-10 pb-0.5">
                    {legBonus > 0 ? (
                      <span className="text-[0.6rem] font-mono text-amber-200/90 font-semibold drop-shadow">
                        Total Stat: {effectiveTotal}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "text-[0.66rem] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm",
                        isOver
                          ? "bg-red-950/90 text-red-300 border-red-500/80 animate-pulse"
                          : "bg-[#121619]/80 text-[#f3efe0] border-[#e8dfc8]/30"
                      )}
                    >
                      Cards: {used} / {effectiveCap}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Capacity Overflow Warning Banner */}
      {overCapacityStats.length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/80 p-3.5 text-xs font-mono text-red-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <div>
              <span className="font-bold uppercase tracking-wider text-red-400">Capacity Overflow Warning: </span>
              <span className="text-red-200">
                {overCapacityStats.map((item) => `${SPECIAL_THEMES[item.stat].name} (${item.used}/${item.max} pts)`).join(", ")}
              </span>
            </div>
          </div>
          <span className="text-[0.68rem] px-2.5 py-1 rounded bg-red-900 border border-red-500/40 text-red-300 font-bold shrink-0">
            Increase Base S.P.E.C.I.A.L. or Unequip Cards
          </span>
        </div>
      )}

      {/* Legendary Perk Slot Overflow Banner */}
      {equippedLegendaryCards.length > 6 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-950/80 p-3.5 text-xs font-mono text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <div>
              <span className="font-bold uppercase tracking-wider text-amber-400">Legendary Slot Overflow Warning: </span>
              <span className="text-amber-200">
                {equippedLegendaryCards.length} / 6 Legendary Perk Cards equipped. Maximum 6 Legendary slots unlocked at Level 300.
              </span>
            </div>
          </div>
          <span className="text-[0.68rem] px-2.5 py-1 rounded bg-amber-900 border border-amber-500/40 text-amber-300 font-bold shrink-0">
            Unequip {equippedLegendaryCards.length - 6} Legendary Perk Card{equippedLegendaryCards.length - 6 > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Equipped Perk Cards Deck */}
      <Card className="bg-slate-950 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-900">
          <CardTitle className="text-base font-mono text-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Equipped Perk Deck ({safeEquippedCards.length} Cards)</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                Legendary Perks: {equippedLegendaryCards.length} / 6 Slots
              </span>
              {safeEquippedCards.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDeck}
                  className="text-[0.68rem] px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 hover:border-red-400 text-red-300 hover:text-white transition-all font-mono"
                >
                  Clear Deck
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsNdImportOpen(true)}
                className="text-[0.68rem] px-2.5 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-mono font-bold transition-all flex items-center gap-1"
              >
                <Link2 className="h-3 w-3" />
                Import N&amp;D Spec
              </button>
              <button
                type="button"
                onClick={() => setShowRoadmap((prev) => !prev)}
                className={`text-[0.68rem] px-2.5 py-0.5 rounded border font-mono font-bold transition-all ${
                  showRoadmap
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                }`}
              >
                {showRoadmap ? "Hide Leveling Roadmap" : "View Leveling Roadmap (Lvl 2–100+)"}
              </button>
              {mode === "pts" ? (
                <button
                  type="button"
                  onClick={() => setIsGhoul((prev) => !prev)}
                  className={`text-[0.68rem] px-2.5 py-0.5 rounded border font-mono font-bold transition-all ${
                    isGhoul
                      ? "bg-lime-500 text-slate-950 border-lime-400 font-black"
                      : "bg-lime-500/20 text-lime-300 border-lime-500/40 hover:bg-lime-500/30"
                  }`}
                >
                  {isGhoul ? "PTS Ghoul Mode (20 Max Cap)" : "PTS Human Mode (15 Max Cap)"}
                </button>
              ) : (
                <span className="text-[0.68rem] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  [LIVE GAME RULES - 15 CAP]
                </span>
              )}
            </div>
            <span className="text-xs text-emerald-400 font-normal">Punch Card Loadout {activeSlot + 1}</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Active perk cards slotted in this loadout.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {showRoadmap && <PerkLevelingRoadmap equippedCards={safeEquippedCards} />}
          {safeEquippedCards.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
              No perk cards equipped in this loadout yet. Select cards below from the Vault-Tec catalog!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {safeEquippedCards.map((item) => {
                const card = getPerkCardById(item.cardId);
                if (!card) return null;
                const activeRankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];
                const isOverflowStat = overCapacityStats.some((o) => o.stat === card.special);

                return (
                  <PipBoyPerkCard
                    key={card.id}
                    cardId={card.id}
                    name={card.name}
                    special={card.special}
                    cost={activeRankObj?.cost || item.rank}
                    rank={item.rank}
                    maxRank={card.ranks.length}
                    description={activeRankObj?.description || ""}
                    isEquipped={true}
                    isOverflow={isOverflowStat}
                    isFemale={isFemale}
                    onUnequip={() => handleUnequipCard(card.id)}
                    onRankChange={(newRank) => handleEquipCard(card, newRank)}
                  />
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
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsFemale((prev) => !prev)}
                className={`px-3 py-1.5 rounded-md border text-xs font-mono font-bold transition-all shrink-0 ${
                  isFemale
                    ? "bg-pink-950/80 border-pink-500 text-pink-300 shadow-md shadow-pink-900/30"
                    : "bg-blue-950/80 border-blue-500 text-blue-300 shadow-md shadow-blue-900/30"
                }`}
                title="Toggle Vault Boy / Vault Girl card variant artwork"
              >
                {isFemale ? "♀ Vault Girl Art" : "♂ Vault Boy Art"}
              </button>
              <input
                type="text"
                placeholder="Search perk cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 text-xs font-mono text-white placeholder:text-slate-500 w-full md:w-64 focus:outline-none focus:border-emerald-500"
              />
            </div>
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
              ALL ({searchedAllCards.length})
            </button>
            {(["S", "P", "E", "C", "I", "A", "L", "LEGENDARY"] as SpecialCategory[]).map((cat) => {
              const theme = SPECIAL_THEMES[cat];
              const count = searchedAllCards.filter((c) => c.special === cat).length;
              const hasMatches = searchQuery.trim().length > 0 && count > 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                    selectedCategory === cat
                      ? `${theme.badge} border-current shadow-md`
                      : hasMatches
                      ? `${theme.badge} border-emerald-500/60 ring-1 ring-emerald-500/50`
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat === "LEGENDARY" ? `LEGENDARY (${count}) [${equippedLegendaryCards.length}/6]` : `${cat} (${count})`}
                </button>
              );
            })}

            {/* Ghoul Perks Dedicated Filter Pill */}
            {(() => {
              const ghoulCount = searchedAllCards.filter((c) => isGhoulPerkCard(c.id || c.name)).length;
              return (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("GHOUL")}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
                    selectedCategory === "GHOUL"
                      ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400"
                      : "border-emerald-800/40 bg-emerald-950/30 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-500/60"
                  }`}
                  title="Filter by Playable Ghoul & Feral synergy perk cards"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  GHOUL ({ghoulCount})
                </button>
              );
            })()}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {filteredCards.map((card) => {
              const equippedItem = equippedCards.find((item) => item.cardId === card.id);
                return (
                <PipBoyPerkCard
                  key={card.id}
                  cardId={card.id}
                  name={card.name}
                  special={card.special}
                  cost={card.ranks[0]?.cost || 1}
                  rank={equippedItem ? equippedItem.rank : 1}
                  maxRank={card.maxRank}
                  minLevel={card.minLevel}
                  description={card.ranks[0]?.description || ""}
                  isEquipped={!!equippedItem}
                  isFemale={isFemale}
                  onEquip={() => handleEquipCard(card, 1)}
                  onUnequip={() => handleUnequipCard(card.id)}
                  onRankChange={(newRank) => handleEquipCard(card, newRank)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <NukesDragonsImportModal
        isOpen={isNdImportOpen}
        onClose={() => setIsNdImportOpen(false)}
        onApplyBuild={handleApplyNdBuild}
      />
    </div>
  );
}
