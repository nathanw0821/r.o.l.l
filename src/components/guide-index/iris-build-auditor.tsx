"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  X,
  Activity,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BUILDER_STORAGE_KEYS, perkLoadoutSlotKey } from "@/lib/builder/storage-keys";
import { SANDBOX_MUTATIONS } from "@/lib/builder/sandbox-mutations";
import { getPerkCardById } from "@/lib/perks/catalog";
import { getLocalTacticalAdvice } from "@/lib/ai/local-tactics";

export interface SpecialState {
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
  L: 7,
};

const CORE_AVAILABLE_PERKS = [
  { id: "tank-killer", name: "Tank Killer", cost: 3, stat: "P" },
  { id: "commando", name: "Commando", cost: 3, stat: "P" },
  { id: "nerd-rage", name: "Nerd Rage", cost: 3, stat: "I" },
  { id: "adrenaline", name: "Adrenaline", cost: 5, stat: "A" },
  { id: "tenderizer", name: "Tenderizer", cost: 3, stat: "C" },
  { id: "critical-savvy", name: "Critical Savvy", cost: 3, stat: "L" },
  { id: "class-freak", name: "Class Freak", cost: 3, stat: "L" },
  { id: "starched-genes", name: "Starched Genes", cost: 2, stat: "L" },
  { id: "fireproof", name: "Fireproof", cost: 3, stat: "E" },
  { id: "stabilized", name: "Stabilized", cost: 3, stat: "I" },
  { id: "serendipity", name: "Serendipity", cost: 3, stat: "L" },
  { id: "radicool", name: "Radicool", cost: 1, stat: "E" },
];

export interface IrisBuildAuditorProps {
  activeSpecial?: SpecialState;
  baseSpecial?: SpecialState;
  activePerks?: string[];
  activeMutations?: string[];
  combatStance?: "low-health" | "full-health";
  armorClass?: "standard" | "power-armor";
  activeWeaponLabel?: string;
  source?: "builder" | "standalone";
}

function normalizeSpecial(input: Record<string, number | undefined> | undefined): SpecialState {
  if (!input) return DEFAULT_SPECIAL;
  return {
    S: input.S ?? input.str ?? 1,
    P: input.P ?? input.per ?? 1,
    E: input.E ?? input.end ?? 1,
    C: input.C ?? input.cha ?? 1,
    I: input.I ?? input.int ?? 1,
    A: input.A ?? input.agi ?? 1,
    L: input.L ?? input.lck ?? 1,
  };
}

export default function IrisBuildAuditor({
  activeSpecial,
  baseSpecial,
  activePerks,
  activeMutations,
  combatStance: propCombatStance,
  armorClass: propArmorClass,
  activeWeaponLabel,
  source = "standalone",
}: IrisBuildAuditorProps) {
  const isBuilderSource = source === "builder";

  // Initial values resolved from props or defaults
  const initialSpecial = useMemo(() => {
    if (activeSpecial) return activeSpecial;
    if (baseSpecial) return baseSpecial;
    return DEFAULT_SPECIAL;
  }, [activeSpecial, baseSpecial]);

  const [special, setSpecial] = useState<SpecialState>(initialSpecial);
  const [selectedPerks, setSelectedPerks] = useState<string[]>(
    activePerks && activePerks.length > 0
      ? activePerks
      : ["tank-killer", "nerd-rage", "critical-savvy", "class-freak", "starched-genes"]
  );
  const [selectedMutations, setSelectedMutations] = useState<string[]>(
    activeMutations && activeMutations.length > 0
      ? activeMutations
      : ["adrenal-reaction", "marsupial", "speed-demon"]
  );
  const [combatStance, setCombatStance] = useState<"low-health" | "full-health">(
    propCombatStance || "low-health"
  );
  const [armorClass, setArmorClass] = useState<"standard" | "power-armor">(
    propArmorClass || "standard"
  );
  const [activeWeapon, setActiveWeapon] = useState<string>(activeWeaponLabel || "Standard Arsenal");

  // Sync state tracking
  const [syncStatus, setSyncStatus] = useState<{
    synced: boolean;
    sourceName: string;
    timestamp?: number;
  }>({
    synced: isBuilderSource,
    sourceName: isBuilderSource ? "Active B.U.I.L.D. Session" : "",
  });

  const [showAllMutations, setShowAllMutations] = useState(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tacticalAdvice, setTacticalAdvice] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // If in builder mode and props change, update state
  useEffect(() => {
    if (isBuilderSource) {
      if (activeSpecial) setSpecial(activeSpecial);
      if (activePerks && activePerks.length > 0) setSelectedPerks(activePerks);
      if (activeMutations) setSelectedMutations(activeMutations);
      if (propCombatStance) setCombatStance(propCombatStance);
      if (propArmorClass) setArmorClass(propArmorClass);
      if (activeWeaponLabel) setActiveWeapon(activeWeaponLabel);
      setSyncStatus({
        synced: true,
        sourceName: "Active B.U.I.L.D. Session",
        timestamp: Date.now(),
      });
    }
  }, [
    isBuilderSource,
    activeSpecial,
    activePerks,
    activeMutations,
    propCombatStance,
    propArmorClass,
    activeWeaponLabel,
  ]);

  // If in standalone mode (e.g. /wiki), check if an active build exists in localStorage
  useEffect(() => {
    if (!isBuilderSource && typeof window !== "undefined") {
      try {
        const savedPayloadStr = localStorage.getItem(BUILDER_STORAGE_KEYS.payload);
        if (savedPayloadStr) {
          const parsed = JSON.parse(savedPayloadStr);
          if (parsed && (parsed.baseSpecial || parsed.equippedPerkCards || parsed.mutationIds)) {
            setSyncStatus((prev) => ({
              ...prev,
              sourceName: "Detected Local B.U.I.L.D. Build",
            }));
          }
        }
      } catch {
        // Ignore parsing errors on storage check
      }
    }
  }, [isBuilderSource]);

  // Load from local storage function
  const handleLoadFromLocalStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      let loadedSpecial: SpecialState | null = null;
      let loadedPerks: string[] = [];
      let loadedMutations: string[] = [];
      let loadedStance: "low-health" | "full-health" = "low-health";
      let loadedArmor: "standard" | "power-armor" = "standard";
      let detectedWeapon = "Custom Loadout";

      const savedPayloadStr = localStorage.getItem(BUILDER_STORAGE_KEYS.payload);
      if (savedPayloadStr) {
        const payload = JSON.parse(savedPayloadStr);
        if (payload.baseSpecial) {
          loadedSpecial = normalizeSpecial(payload.baseSpecial);
        }
        if (Array.isArray(payload.mutationIds) && payload.mutationIds.length > 0) {
          loadedMutations = payload.mutationIds;
        }
        if (Array.isArray(payload.equippedPerkCards) && payload.equippedPerkCards.length > 0) {
          loadedPerks = payload.equippedPerkCards.map((c: { cardId: string }) => c.cardId);
        }
        if (payload.equipmentKind === "powerArmor") {
          loadedArmor = "power-armor";
        }
        if (payload.activeWeaponPieceId) {
          detectedWeapon = payload.activeWeaponPieceId;
        }
      }

      // Check punch card machine slot if perks weren't in payload
      if (loadedPerks.length === 0) {
        const activePerkSlot = localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
        const perkSlotStr = localStorage.getItem(perkLoadoutSlotKey(activePerkSlot));
        if (perkSlotStr) {
          const perkData = JSON.parse(perkSlotStr);
          if (perkData.specials && !loadedSpecial) {
            loadedSpecial = normalizeSpecial(perkData.specials);
          }
          if (Array.isArray(perkData.equippedCards)) {
            loadedPerks = perkData.equippedCards.map((c: { cardId: string }) => c.cardId);
          }
        }
      }

      // Check combat switchboard state for health and armor stance
      const switchboardStr = localStorage.getItem(BUILDER_STORAGE_KEYS.combatSwitchboardState);
      if (switchboardStr) {
        const switchboard = JSON.parse(switchboardStr);
        if (switchboard.healthPct != null) {
          loadedStance = switchboard.healthPct <= 20 ? "low-health" : "full-health";
        }
        if (switchboard.inPowerArmor != null) {
          loadedArmor = switchboard.inPowerArmor ? "power-armor" : "standard";
        }
      }

      if (loadedSpecial) setSpecial(loadedSpecial);
      if (loadedPerks.length > 0) setSelectedPerks(loadedPerks);
      if (loadedMutations.length > 0) setSelectedMutations(loadedMutations);
      setCombatStance(loadedStance);
      setArmorClass(loadedArmor);
      setActiveWeapon(detectedWeapon);

      setSyncStatus({
        synced: true,
        sourceName: `Synced from B.U.I.L.D. [${detectedWeapon}]`,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error("[IrisBuildAuditor] Failed to load local build:", e);
    }
  }, []);

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

  const toggleMutation = (id: string) => {
    setSelectedMutations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Compile active perks list including any equipped from builder that aren't in CORE_AVAILABLE_PERKS
  const allDisplayPerks = useMemo(() => {
    const list = [...CORE_AVAILABLE_PERKS];
    const existingIds = new Set(list.map((p) => p.id));

    for (const perkId of selectedPerks) {
      if (!existingIds.has(perkId)) {
        const card = getPerkCardById(perkId);
        list.push({
          id: perkId,
          name: card?.name || perkId,
          cost: card?.ranks?.[0]?.cost || 1,
          stat: (card?.special || "P") as string,
        });
        existingIds.add(perkId);
      }
    }
    return list;
  }, [selectedPerks]);

  // Synergy heuristic diagnostics
  const synergyReport = useMemo(() => {
    const perkSet = new Set(selectedPerks.map((p) => p.toLowerCase()));
    const mutationSet = new Set(selectedMutations.map((m) => m.toLowerCase()));

    const isBloodied = combatStance === "low-health";
    const hasNerdRage = perkSet.has("nerd-rage") || perkSet.has("nerd rage!");
    const hasAdrenal = mutationSet.has("adrenal-reaction");
    const bloodiedSynergy = isBloodied && hasNerdRage && hasAdrenal;

    const hasStarched = perkSet.has("starched-genes") || perkSet.has("starched genes");
    const hasClassFreak = perkSet.has("class-freak") || perkSet.has("class freak");
    const mutationProtected = hasStarched && hasClassFreak;

    const isPA = armorClass === "power-armor";
    const hasStabilized = perkSet.has("stabilized");
    const paSynergy = isPA ? hasStabilized : !hasStabilized;

    const hasTankKiller = perkSet.has("tank-killer") || perkSet.has("tank killer");

    return {
      isBloodied,
      hasNerdRage,
      hasAdrenal,
      bloodiedSynergy,
      mutationProtected,
      isPA,
      hasStabilized,
      paSynergy,
      hasTankKiller,
    };
  }, [selectedPerks, selectedMutations, combatStance, armorClass]);

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);

    // Prepare build advice payload for tactical engine & AI
    const perksForAnalysis = selectedPerks.map((id) => {
      const card = getPerkCardById(id);
      return {
        name: card?.name || id,
        rank: 3,
        special: card?.special || "P",
      };
    });

    const advicePayload = {
      special: {
        S: special.S,
        P: special.P,
        E: special.E,
        C: special.C,
        I: special.I,
        A: special.A,
        L: special.L,
      },
      perks: perksForAnalysis,
    };

    // Calculate immediate 0-token client-side local advice
    const localAdvice = getLocalTacticalAdvice(advicePayload);

    try {
      // Dispatched request to AI build advisor endpoint (with 1.5s timeout abort)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch("/api/ai/build-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advicePayload),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = (await res.json().catch(() => null)) as { advice?: string } | null;
        if (data?.advice) {
          setTacticalAdvice(data.advice);
        } else {
          setTacticalAdvice(localAdvice);
        }
      } else {
        setTacticalAdvice(localAdvice);
      }
    } catch {
      setTacticalAdvice(localAdvice);
    } finally {
      setIsAuditing(false);
      setShowModal(true);
    }
  };

  const copyInferencePrompt = () => {
    const perkNames = selectedPerks
      .map((id) => getPerkCardById(id)?.name || id)
      .join(", ");
    const mutationNames = selectedMutations
      .map((id) => SANDBOX_MUTATIONS.find((m) => m.id === id)?.label || id)
      .join(", ");

    const text = `FALLOUT 76 BUILD TELEMETRY (IRIS AUDITOR)
Weapon: ${activeWeapon}
Chassis: ${armorClass === "power-armor" ? "Power Armor" : "Standard Armor"}
Health Stance: ${combatStance === "low-health" ? "Bloodied (<20% HP)" : "Full Health"}
S.P.E.C.I.A.L.: S:${special.S} P:${special.P} E:${special.E} C:${special.C} I:${special.I} A:${special.A} L:${special.L}
Active Perks: ${perkNames || "None"}
Active Mutations: ${mutationNames || "None"}

Please evaluate this Fallout 76 loadout for AP efficiency, damage multipliers, and defensive mitigation.`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-purple-500/40 bg-slate-950/90 p-4 sm:p-5 font-mono shadow-sm space-y-4">
      {/* Header & Synchronization Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-300">
            Iris Build Auditor
          </h3>
          <span className="text-3xs uppercase px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-400 font-bold">
            {isBuilderSource ? "Live B.U.I.L.D. Mode" : "UI Staging Layer"}
          </span>
        </div>

        {/* Sync Status & Action Button */}
        <div className="flex items-center gap-2 text-xs">
          {syncStatus.synced ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-3xs font-bold">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>{syncStatus.sourceName}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleLoadFromLocalStorage}
              aria-label="Load active build from B.U.I.L.D."
              className="flex items-center gap-1.5 px-2.5 py-1 min-h-[28px] rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-purple-100 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 text-purple-400 animate-spin-slow" />
              <span>Sync Active B.U.I.L.D. State</span>
            </button>
          )}

          {!isBuilderSource && (
            <Link
              href="/build?tab=iris"
              className="flex items-center gap-1 px-2 py-1 min-h-[28px] rounded-lg border border-border/60 bg-slate-900/60 hover:bg-slate-800 text-foreground/70 hover:text-cyan-300 text-xs transition"
            >
              <span>Open in B.U.I.L.D.</span>
              <ArrowUpRight className="h-3 w-3 text-cyan-400" />
            </Link>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed">
        {isBuilderSource
          ? "Live build verification and AI advisory matrix. Your active B.U.I.L.D. weapons, perks, mutations, and S.P.E.C.I.A.L. allocation are pre-loaded below for deep synergy inspection."
          : "Localized build verification interface. Formulate your S.P.E.C.I.A.L. array, active perks, and mutations for deep synergy analysis."}
      </p>

      <form onSubmit={handleSubmitAudit} className="space-y-4">
        {/* S.P.E.C.I.A.L. Distribution Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-foreground/60">
            <span>S.P.E.C.I.A.L. Allocation</span>
            <span className={totalSpecial === 56 ? "text-emerald-400" : "text-amber-400"}>
              Points: {totalSpecial} / 56
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {(["S", "P", "E", "C", "I", "A", "L"] as (keyof SpecialState)[]).map((stat) => (
              <div
                key={stat}
                className="flex flex-col items-center rounded border border-border/60 bg-slate-900/80 p-1 sm:p-1.5"
              >
                <span className="text-xs font-bold text-purple-400">{stat}</span>
                <span className="text-xs font-bold text-foreground my-0.5">{special[stat]}</span>
                <div className="flex flex-col gap-1.5 mt-1 items-center">
                  <button
                    type="button"
                    aria-label={`Increase ${stat}`}
                    onClick={() => handleSpecialChange(stat, 1)}
                    disabled={special[stat] >= 15}
                    className="h-6 w-6 min-h-[24px] min-w-[24px] flex items-center justify-center rounded bg-slate-800 text-xs font-bold text-foreground/80 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-label={`Decrease ${stat}`}
                    onClick={() => handleSpecialChange(stat, -1)}
                    disabled={special[stat] <= 1}
                    className="h-6 w-6 min-h-[24px] min-w-[24px] flex items-center justify-center rounded bg-slate-800 text-xs font-bold text-foreground/80 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perk Selection Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-foreground/60">
            <span>Core Perk Synergy Deck ({selectedPerks.length} Selected)</span>
            <span className="text-3xs text-purple-400/80">Click to toggle synergy cards</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
            {allDisplayPerks.map((perk) => {
              const active = selectedPerks.includes(perk.id);
              return (
                <button
                  type="button"
                  key={perk.id}
                  onClick={() => togglePerk(perk.id)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 min-h-[28px] rounded text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "border-purple-400 bg-purple-500/20 text-purple-200 font-bold"
                      : "border-border/40 bg-slate-900/60 text-foreground/50 hover:border-purple-500/40"
                  }`}
                >
                  <span>{perk.name}</span>
                  <span className="opacity-60 text-3xs font-mono">[{perk.stat}{perk.cost}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mutations Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-foreground/60">
            <span>Mutation Serum Matrix ({selectedMutations.length} Active)</span>
            <button
              type="button"
              onClick={() => setShowAllMutations((prev) => !prev)}
              aria-label="Toggle full mutation matrix"
              className="text-3xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllMutations ? "Show Core Serums" : "Expand All Serums"}</span>
              {showAllMutations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {SANDBOX_MUTATIONS.filter((m) =>
              showAllMutations
                ? true
                : selectedMutations.includes(m.id) ||
                  ["adrenal-reaction", "marsupial", "speed-demon", "bird-bones", "eagle-eyes", "herbivore", "carnivore"].includes(m.id)
            ).map((mutation) => {
              const active = selectedMutations.includes(mutation.id);
              return (
                <button
                  type="button"
                  key={mutation.id}
                  onClick={() => toggleMutation(mutation.id)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 min-h-[28px] rounded-full text-xs border transition-colors cursor-pointer ${
                    active
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold"
                      : "border-border/30 bg-slate-900/40 text-foreground/40 hover:border-cyan-500/30"
                  }`}
                >
                  {mutation.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Combat Stance & Equipment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-foreground/60 block mb-1">Health Stance</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setCombatStance("low-health")}
                aria-pressed={combatStance === "low-health"}
                className={`py-1.5 min-h-[28px] rounded border text-center transition cursor-pointer ${
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
                aria-pressed={combatStance === "full-health"}
                className={`py-1.5 min-h-[28px] rounded border text-center transition cursor-pointer ${
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
                aria-pressed={armorClass === "standard"}
                className={`py-1.5 min-h-[28px] rounded border text-center transition cursor-pointer ${
                  armorClass === "standard"
                    ? "border-purple-400 bg-purple-500/20 text-purple-300 font-bold"
                    : "border-border/40 bg-slate-900 text-foreground/60"
                }`}
              >
                Standard Armor
              </button>
              <button
                type="button"
                onClick={() => setArmorClass("power-armor")}
                aria-pressed={armorClass === "power-armor"}
                className={`py-1.5 min-h-[28px] rounded border text-center transition cursor-pointer ${
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
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer min-h-[38px]"
        >
          {isAuditing ? (
            <>
              <Activity className="h-4 w-4 animate-spin text-purple-200" />
              <span>Synthesizing Build Telemetry & Synergies...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-purple-200" />
              <span>Run Iris Build Audit ↗</span>
            </>
          )}
        </button>
      </form>

      {/* Stylized Interception & Heuristic Audit Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/50 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                  Iris Build Auditor Diagnostic
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
                className="rounded p-1 text-foreground/60 hover:bg-slate-800 hover:text-foreground cursor-pointer min-h-[24px] min-w-[24px]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mandated Optimization Notice */}
            <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
              <span className="text-3xs uppercase px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700 text-purple-300 font-bold">
                System Notice
              </span>
              <p className="text-xs text-foreground/90 font-sans leading-relaxed font-medium">
                Iris Build Auditor: System optimization in progress. High-capacity inference modules undergoing localized context alignment. Full access resuming shortly.
              </p>
            </div>

            {/* Tactical Advice Recommendation (Live AI / Heuristic) */}
            {tacticalAdvice && (
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 text-3xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>Vault-Tec Tactical Recommendation</span>
                </div>
                <p className="text-xs text-foreground/90 font-sans leading-relaxed">
                  {tacticalAdvice}
                </p>
              </div>
            )}

            {/* Synergy Diagnostics Matrix */}
            <div className="rounded-lg border border-border/40 bg-slate-900/70 p-3.5 text-xs space-y-2">
              <div className="text-foreground/50 uppercase font-bold tracking-wider text-3xs border-b border-border/40 pb-1">
                Synergy Matrix Telemetry
              </div>

              <div className="grid grid-cols-2 gap-2 text-2xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-border/30">
                  <span className="text-foreground/70">S.P.E.C.I.A.L. Points:</span>
                  <span className={`font-bold ${totalSpecial === 56 ? "text-emerald-400" : "text-amber-400"}`}>
                    {totalSpecial} / 56
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-border/30">
                  <span className="text-foreground/70">Perk Deck Size:</span>
                  <span className="font-bold text-cyan-300">{selectedPerks.length} Cards</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-border/30">
                  <span className="text-foreground/70">Bloodied Synergy:</span>
                  <span className={`font-bold ${synergyReport.bloodiedSynergy ? "text-emerald-400" : synergyReport.isBloodied ? "text-amber-400" : "text-slate-400"}`}>
                    {synergyReport.bloodiedSynergy ? "Optimized" : synergyReport.isBloodied ? "Needs Nerd Rage" : "N/A (Full HP)"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-border/30">
                  <span className="text-foreground/70">Mutation Lock:</span>
                  <span className={`font-bold ${synergyReport.mutationProtected ? "text-emerald-400" : "text-amber-400"}`}>
                    {synergyReport.mutationProtected ? "Starched & Freaked" : "Unprotected"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Inference Prompt Telemetry Exporter */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/40 bg-slate-900/40 text-xs">
              <span className="text-foreground/70 text-2xs font-sans">
                Export loadout telemetry for external LLMs (Claude, Gemini, Ollama):
              </span>
              <button
                type="button"
                onClick={copyInferencePrompt}
                aria-label="Copy AI Inference Prompt"
                className="flex items-center gap-1 px-2.5 py-1 min-h-[28px] rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-3xs font-bold transition cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-purple-400" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition cursor-pointer min-h-[36px]"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
