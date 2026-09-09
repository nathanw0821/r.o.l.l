"use client";

import * as React from "react";
import {
  Sliders,
  Utensils,
  Sparkles,
  Home,
  Pill,
  Book,
  Beer,
  Heart,
  Calculator,
  X,
  Sun,
  Moon,
  Users,
  Target,
  ChevronLeft,
  ChevronRight,
  Skull,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_BOBBLEHEADS,
  ALL_MAGAZINES,
  ALL_CHEMS,
  ALL_PLANT_FOODS,
  ALL_MEAT_FOODS,
  ALL_ALCOHOL,
  ALL_COMPANIONS,
} from "@/lib/builder/all-fallout76-buffs";
import type {
  FoodSurvivalState,
  ThirstSurvivalState,
  TeamCategory,
} from "@/lib/builder/unified-builder-state";
import type { VatsCritQualification } from "@/lib/builder/combat-firepower-engine";

export type CombatSwitchboardState = {
  isGhoul?: boolean;
  healthPct: number;
  radsPct?: number;
  glowPct?: number; // Ghoul Radiation converted to Green Overshield (0-100%)
  feralPct?: number; // Ghoul Feralization Instinct Meter (0-100%)
  foodState?: FoodSurvivalState;
  thirstState?: ThirstSurvivalState;
  teamState?: TeamCategory;
  hasMutatedTeammate?: boolean;
  timeOfDay?: "day" | "night";
  addictionsCount?: number;
  adrenalineStacks?: number;
  furiousStacks?: number;
  bulletStormStacks?: number;
  combatStance?: {
    isSneaking: boolean;
    isCrouched?: boolean;
    isSprinting: boolean;
    isAiming: boolean;
    isPowerAttacking: boolean;
    isStationary?: boolean;
    isInVats?: boolean;
    vatsCritEveryOtherShot?: boolean;
  };
  caps?: number;

  inPowerArmor: boolean;
  activeFood: string | null;
  activeFoods: Record<string, string>; // Category -> Food ID
  activeDrug: string | null;
  activeBobblehead: string | null;
  activeMagazine: string | null;
  activeAlcohol: string | null;
  activeNukaCola: string | null;
  activeCompanion: string | null;
  activeCampBuffs: string[];
  targetEnemy: string;
};

export const TARGET_ENEMIES: Record<string, { name: string; dr: number; pctReduction: number }> = {
  superMutant: { name: "Super Mutant Firestarter (150 DR)", dr: 150, pctReduction: 0 },
  earle: { name: "Earle Williams (Boss 80% Mitigation + 300 DR)", dr: 300, pctReduction: 0.80 },
  sbq: { name: "Scorchbeast Queen (Boss 80% Mitigation + 300 DR)", dr: 300, pctReduction: 0.80 },
  titan: { name: "Ultracite Titan (Boss 70% Mitigation + 350 DR)", dr: 350, pctReduction: 0.70 },
  standardScorched: { name: "Standard Scorched (40 DR)", dr: 40, pctReduction: 0 },
};

export type FeralStageId = "apex" | "frenzied" | "agitated" | "lucid";

export const FERAL_STAGES: {
  id: FeralStageId;
  min: number;
  max: number;
  label: string;
  stage: string;
  desc: string;
  icon: string;
  boost: string;
  presetVal: number;
}[] = [
  {
    id: "apex",
    min: 0,
    max: 20,
    label: "Apex Feral Rampage",
    stage: "Stage IV: Feral (0–20% Empty)",
    desc: "Bar empty/low (chem deprivation & decay): Complete primal feral bloodlust (+50% Melee & Unarmed Damage multiplier).",
    icon: "👹",
    boost: "+50% Melee/Unarmed Bloodlust (Fully Feral)",
    presetVal: 0,
  },
  {
    id: "frenzied",
    min: 21,
    max: 50,
    label: "Frenzied",
    stage: "Stage III: Frenzied (21–50% Low)",
    desc: "Bar low: Primal urges surge (+25% Melee & Unarmed Damage, +10% Sprint Speed, primal DR).",
    icon: "🐺",
    boost: "+25% Melee/Unarmed & +10% Sprint",
    presetVal: 35,
  },
  {
    id: "agitated",
    min: 51,
    max: 80,
    label: "Clear / Steady",
    stage: "Stage II: Steady (51–80% Mid)",
    desc: "Bar moderate: Steady lucidity, heightened reflexes, +15% Action Point recovery rate.",
    icon: "⚡",
    boost: "+15% AP Recovery Rate",
    presetVal: 65,
  },
  {
    id: "lucid",
    min: 81,
    max: 100,
    label: "Fully Lucid / Sane",
    stage: "Stage I: Lucid (81–100% Full)",
    desc: "Bar full (fueled by chems): Peak intellectual clarity, optimal VATS accuracy, full Charisma & social stability.",
    icon: "🧠",
    boost: "Optimal VATS & Perception (Fully Lucid Buff)",
    presetVal: 100,
  },
];

const FOOD_STATES: { id: FoodSurvivalState; label: string; desc: string }[] = [
  { id: "starving", label: "Starving", desc: "No Food Buffs (AP regen & stats reduced)" },
  { id: "hungry", label: "Hungry", desc: "Low Satiation" },
  { id: "content", label: "Content", desc: "Normal Satiation" },
  { id: "well_fed", label: "Well Fed", desc: "Max HP +25, Disease Res +25%" },
  { id: "fully_fed", label: "Fully Fed", desc: "Max HP +35, Disease Res +35%, STR +1" },
];

const THIRST_STATES: { id: ThirstSurvivalState; label: string; desc: string }[] = [
  { id: "parched", label: "Parched", desc: "Severe Dehydration" },
  { id: "thirsty", label: "Thirsty", desc: "Low Hydration" },
  { id: "hydrated", label: "Hydrated", desc: "Normal Hydration" },
  { id: "well_hydrated", label: "Well Hydrated", desc: "AP Regen +25%, Disease Res +25%" },
  { id: "fully_hydrated", label: "Fully Hydrated", desc: "AP Regen +35%, Disease Res +35%, END +1" },
];

const TEAM_STATES: { id: TeamCategory; label: string; desc: string }[] = [
  { id: "solo", label: "No Team (Solo)", desc: "Lone Wanderer active (if equipped)" },
  { id: "casual", label: "Casual Team", desc: "+4 Intelligence (+12.4% XP)" },
  { id: "event", label: "Event Team", desc: "+400% Event Completion XP" },
  { id: "roleplay", label: "Roleplay Team", desc: "+4 Charisma (Better vendor rates)" },
  { id: "daily_ops", label: "Daily Ops Team", desc: "+400% Daily Ops Completion XP" },
  { id: "exploration", label: "Exploration Team", desc: "+4 Endurance (+20 Max HP)" },
];

interface BuilderCombatSwitchboardProps {
  rawDamage: number;
  isGhoul?: boolean;
  onSpeciesChange?: (isGhoul: boolean) => void;
  activeMutations?: string[];
  onMutationsChange?: (mutations: string[]) => void;
  hasStrangeInNumbers?: boolean;
  onStrangeInNumbersChange?: (enabled: boolean) => void;
  ignoreMutationPenalties?: boolean;
  onIgnoreMutationPenaltiesChange?: (enabled: boolean) => void;
  onStateChange?: (state: CombatSwitchboardState) => void;
  activeTacticalTags?: string[];
  critQualification?: VatsCritQualification;
  readOnly?: boolean;
  initialState?: Partial<CombatSwitchboardState>;
}

export default function BuilderCombatSwitchboard({
  isGhoul = false,
  onSpeciesChange,
  activeMutations = [],
  hasStrangeInNumbers = false,
  onStrangeInNumbersChange,
  onStateChange,
  activeTacticalTags,
  critQualification,
  readOnly = false,
  initialState,
}: BuilderCombatSwitchboardProps) {
  const isCarnivore = activeMutations.includes("carnivore");
  const isHerbivore = activeMutations.includes("herbivore");

  const [activeTab, setActiveTab] = React.useState<"biometrics" | "registry" | "audit">("biometrics");
  const [showMathInspector, setShowMathInspector] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showMathInspector) {
        setShowMathInspector(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMathInspector]);

  const DEFAULT_COMBAT_STANCE = React.useMemo(() => ({
    isSneaking: false,
    isCrouched: false,
    isSprinting: false,
    isAiming: false,
    isPowerAttacking: false,
    isStationary: false,
    isInVats: false,
    vatsCritEveryOtherShot: false,
  }), []);

  const [switchboard, setSwitchboard] = React.useState<CombatSwitchboardState>(() => {
    const initialFoods: Record<string, string> = {};
    if (isHerbivore) {
      initialFoods["ap_regen"] = "plant-company-tea";
      initialFoods["crit_damage"] = "plant-blight-soup";
      initialFoods["int"] = "plant-brain-bombs";
      initialFoods["xp"] = "plant-cranberry-relish";
    } else if (isCarnivore) {
      initialFoods["int"] = "meat-scorchbeast-brain";
      initialFoods["melee_damage"] = "meat-glowing-steak";
      initialFoods["str"] = "meat-deathclaw-steak";
      initialFoods["xp"] = "meat-tasty-squirrel";
    }
    const defaults: CombatSwitchboardState = {
      isGhoul,
      healthPct: 100,
      radsPct: 0,
      glowPct: 0,
      feralPct: 100,
      foodState: "fully_fed",
      thirstState: "fully_hydrated",
      teamState: "casual",
      hasMutatedTeammate: true,
      timeOfDay: "day",
      addictionsCount: 0,
      adrenalineStacks: 0,
      furiousStacks: 0,
      bulletStormStacks: 0,
      combatStance: {
        isSneaking: false,
        isCrouched: false,
        isSprinting: false,
        isAiming: false,
        isPowerAttacking: false,
        isStationary: false,
        isInVats: false,
        vatsCritEveryOtherShot: false,
      },
      caps: 30000,

      inPowerArmor: false,
      activeFood: isHerbivore ? "plant-company-tea" : isCarnivore ? "meat-scorchbeast-brain" : null,
      activeFoods: initialFoods,
      activeDrug: "chem-psychotats",
      activeBobblehead: "bobble-small-guns",
      activeMagazine: "mag-gb3",
      activeAlcohol: "brew-ballistic-bock",
      activeNukaCola: "nuka-cranberry",
      activeCompanion: "comp-adelaide",
      activeCampBuffs: ["camp-phoropter", "camp-love-seat", "camp-mothman-tome", "camp-instrument"],
      targetEnemy: "superMutant",
    };

    return {
      ...defaults,
      ...(initialState || {}),
      combatStance: {
        isSneaking: initialState?.combatStance?.isSneaking ?? false,
        isCrouched: initialState?.combatStance?.isCrouched ?? false,
        isSprinting: initialState?.combatStance?.isSprinting ?? false,
        isAiming: initialState?.combatStance?.isAiming ?? false,
        isPowerAttacking: initialState?.combatStance?.isPowerAttacking ?? false,
        isStationary: initialState?.combatStance?.isStationary ?? false,
        isInVats: initialState?.combatStance?.isInVats ?? false,
        vatsCritEveryOtherShot: initialState?.combatStance?.vatsCritEveryOtherShot ?? false,
      },
      activeFoods: {
        ...defaults.activeFoods,
        ...(initialState?.activeFoods || {}),
      },
    };
  });

  const onStateChangeRef = React.useRef(onStateChange);
  React.useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const isInternalChangeRef = React.useRef(false);

  React.useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (initialState) {
      setSwitchboard((prev) => {
        let hasDiff = false;
        const next = { ...prev };
        for (const k of Object.keys(initialState) as Array<keyof CombatSwitchboardState>) {
          if (k === "combatStance") {
            const nextStance = {
              isSneaking: initialState.combatStance?.isSneaking ?? prev.combatStance?.isSneaking ?? false,
              isCrouched: initialState.combatStance?.isCrouched ?? prev.combatStance?.isCrouched ?? false,
              isSprinting: initialState.combatStance?.isSprinting ?? prev.combatStance?.isSprinting ?? false,
              isAiming: initialState.combatStance?.isAiming ?? prev.combatStance?.isAiming ?? false,
              isPowerAttacking: initialState.combatStance?.isPowerAttacking ?? prev.combatStance?.isPowerAttacking ?? false,
              isStationary: initialState.combatStance?.isStationary ?? prev.combatStance?.isStationary ?? false,
              isInVats: initialState.combatStance?.isInVats ?? prev.combatStance?.isInVats ?? false,
              vatsCritEveryOtherShot: initialState.combatStance?.vatsCritEveryOtherShot ?? prev.combatStance?.vatsCritEveryOtherShot ?? false,
            };
            if (JSON.stringify(nextStance) !== JSON.stringify(prev.combatStance)) {
              next.combatStance = nextStance;
              hasDiff = true;
            }
          } else if (k === "activeFoods") {
            const nextFoods = { ...prev.activeFoods, ...(initialState.activeFoods || {}) };
            if (JSON.stringify(nextFoods) !== JSON.stringify(prev.activeFoods)) {
              next.activeFoods = nextFoods;
              hasDiff = true;
            }
          } else if (prev[k] !== initialState[k]) {
            (next as Record<string, unknown>)[k] = initialState[k];
            hasDiff = true;
          }
        }
        return hasDiff ? next : prev;
      });
    }
  }, [initialState]);

  const updateField = <K extends keyof CombatSwitchboardState>(key: K, val: CombatSwitchboardState[K]) => {
    if (readOnly) return;
    isInternalChangeRef.current = true;
    const next = { ...switchboard, [key]: val };
    setSwitchboard(next);
    onStateChangeRef.current?.(next);
  };

  const updateStance = (
    key: keyof NonNullable<CombatSwitchboardState["combatStance"]>,
    val: boolean
  ) => {
    if (readOnly) return;
    const curr = switchboard.combatStance || {
      isSneaking: false,
      isCrouched: false,
      isSprinting: false,
      isAiming: false,
      isPowerAttacking: false,
      isStationary: false,
      isInVats: false,
      vatsCritEveryOtherShot: false,
    };
    const nextStance = { ...curr, [key]: val };
    if (key === "isCrouched") {
      nextStance.isSneaking = val;
    } else if (key === "isSneaking") {
      nextStance.isCrouched = val;
    }
    if (key === "isSprinting" && val) {
      nextStance.isStationary = false;
    }
    if (key === "isStationary" && val) {
      nextStance.isSprinting = false;
    }
    if (key === "isInVats") {
      if (val) {
        nextStance.isAiming = false;
      } else {
        nextStance.vatsCritEveryOtherShot = false;
      }
    }
    if (key === "isAiming") {
      if (val) {
        nextStance.isInVats = false;
        nextStance.vatsCritEveryOtherShot = false;
      }
    }
    if (key === "vatsCritEveryOtherShot") {
      if (val) {
        nextStance.isInVats = true;
        nextStance.isAiming = false;
      }
    }
    const next = { ...switchboard, combatStance: nextStance };
    isInternalChangeRef.current = true;
    setSwitchboard(next);
    onStateChangeRef.current?.(next);
  };

  // Step Helpers
  const stepFood = (dir: -1 | 1) => {
    if (readOnly) return;
    const currIdx = FOOD_STATES.findIndex((f) => f.id === (switchboard.foodState || "fully_fed"));
    const nextIdx = Math.max(0, Math.min(FOOD_STATES.length - 1, currIdx + dir));
    updateField("foodState", FOOD_STATES[nextIdx].id);
  };

  const stepThirst = (dir: -1 | 1) => {
    if (readOnly) return;
    const currIdx = THIRST_STATES.findIndex((t) => t.id === (switchboard.thirstState || "fully_hydrated"));
    const nextIdx = Math.max(0, Math.min(THIRST_STATES.length - 1, currIdx + dir));
    updateField("thirstState", THIRST_STATES[nextIdx].id);
  };

  const stepTeam = (dir: -1 | 1) => {
    if (readOnly) return;
    const currIdx = TEAM_STATES.findIndex((t) => t.id === (switchboard.teamState || "casual"));
    const nextIdx = Math.max(0, Math.min(TEAM_STATES.length - 1, currIdx + dir));
    updateField("teamState", TEAM_STATES[nextIdx].id);
  };

  const handleSelectFood = (foodId: string) => {
    if (readOnly) return;
    if (!foodId || foodId === "none") return;
    const allFoods = [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS];
    const food = allFoods.find((f) => f.id === foodId);
    if (!food) return;

    const categoryKey = food.foodBuffType || "general";
    const nextFoods = { ...(switchboard.activeFoods || {}) };
    nextFoods[categoryKey] = food.id;

    const next = { ...switchboard, activeFoods: nextFoods, activeFood: food.id };
    isInternalChangeRef.current = true;
    setSwitchboard(next);
    onStateChangeRef.current?.(next);
  };

  const handleRemoveFoodCategory = (categoryKey: string) => {
    if (readOnly) return;
    const nextFoods = { ...(switchboard.activeFoods || {}) };
    delete nextFoods[categoryKey];
    const next = {
      ...switchboard,
      activeFoods: nextFoods,
      activeFood: Object.values(nextFoods)[0] || null,
    };
    isInternalChangeRef.current = true;
    setSwitchboard(next);
    onStateChangeRef.current?.(next);
  };

  React.useEffect(() => {
    setSwitchboard((prev) => {
      if (prev.isGhoul === isGhoul) return prev;
      return { ...prev, isGhoul };
    });
  }, [isGhoul]);

  const currentFoodDef = FOOD_STATES.find((f) => f.id === (switchboard.foodState || "fully_fed")) || FOOD_STATES[4];
  const currentThirstDef = THIRST_STATES.find((t) => t.id === (switchboard.thirstState || "fully_hydrated")) || THIRST_STATES[4];
  const currentTeamDef = TEAM_STATES.find((t) => t.id === (switchboard.teamState || "casual")) || TEAM_STATES[1];

  const currentFeralPct = switchboard.feralPct || 0;
  const currentFeralStage = FERAL_STAGES.find((s) => currentFeralPct >= s.min && currentFeralPct <= s.max) || FERAL_STAGES[0];

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-slate-950/95 p-4 font-mono text-slate-100 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4">
      {readOnly && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-2.5 text-xs font-mono text-amber-300 flex items-center justify-between">
          <span className="font-bold tracking-wider uppercase">&gt;&gt; SPECTATOR VIEW · READ-ONLY BIOMETRICS &amp; COMBAT STANCES</span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200">
            Telemetry Locked
          </span>
        </div>
      )}
      {/* Top Header & Sub-Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            [ VAULT-TEC BIOMETRICS &amp; CHARACTER STATE PANEL ]
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("biometrics")}
            className={`px-3 py-1 rounded font-bold uppercase transition-all cursor-pointer ${
              activeTab === "biometrics"
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Biometrics &amp; Stances
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("registry")}
            className={`px-3 py-1 rounded font-bold uppercase transition-all cursor-pointer ${
              activeTab === "registry"
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Consumables &amp; Buffs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1 rounded font-bold uppercase transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Formula Math Audit
          </button>
        </div>
      </div>

      {/* TAB 1: BIOMETRICS & COMBAT STANCES */}
      {activeTab === "biometrics" && (
        <div className={cn("space-y-4", readOnly && "pointer-events-none opacity-90")}>
          {/* Top Species & Frame Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Species Toggle */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Species:</span>
              <button
                type="button"
                onClick={() => {
                  const nextGhoul = !isGhoul;
                  onSpeciesChange?.(nextGhoul);
                  updateField("isGhoul", nextGhoul);
                }}
                className={`text-xs px-3 py-1 rounded font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  isGhoul
                    ? "bg-lime-500 text-slate-950 border-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                    : "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                }`}
              >
                {isGhoul ? "☣️ PLAYABLE GHOUL" : "👤 HUMAN"}
              </button>
            </div>

            {/* Armor Chassis Mode */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Armor Frame:</span>
              <button
                type="button"
                onClick={() => updateField("inPowerArmor", !switchboard.inPowerArmor)}
                className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  switchboard.inPowerArmor
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                    : "bg-slate-800 text-slate-200 border-slate-700"
                }`}
              >
                {switchboard.inPowerArmor ? "🦾 POWER ARMOR" : "🛡️ REGULAR ARMOR"}
              </button>
            </div>

            {/* Time of Day */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Time of Day:</span>
              <button
                type="button"
                onClick={() => updateField("timeOfDay", switchboard.timeOfDay === "night" ? "day" : "night")}
                className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer ${
                  switchboard.timeOfDay === "night"
                    ? "bg-indigo-950 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                    : "bg-amber-950 border-amber-500 text-amber-300"
                }`}
              >
                {switchboard.timeOfDay === "night" ? (
                  <>
                    <Moon className="h-3 w-3" /> NIGHT 🌙
                  </>
                ) : (
                  <>
                    <Sun className="h-3 w-3" /> DAY ☀️
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DUAL-LAYER PIP-BOY BIOMETRIC TELEMETRY GRAPHIC */}
          {isGhoul ? (
            <div className="rounded-lg border border-lime-500/40 bg-slate-950 p-3 space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-lime-400 font-bold uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-lime-400 animate-pulse" />
                  <span>[ BIOMETRIC TELEMETRY: HP &amp; RADIANT GLOW OVERSHIELD ]</span>
                </span>
                <span className="text-[0.72rem] text-slate-400">
                  Base HP: <span className="text-rose-400 font-bold">{switchboard.healthPct}%</span> · Glow Overshield: <span className="text-lime-300 font-bold">{switchboard.glowPct || 0}%</span>
                </span>
              </div>

              {/* The Layered Visual Bar */}
              <div className="relative h-6 w-full rounded bg-slate-900 border border-slate-700 overflow-hidden shadow-inner flex">
                {/* Base Health Layer (Rose/Red) */}
                <div
                  className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300 relative shrink-0"
                  style={{ width: `${switchboard.healthPct}%` }}
                >
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[0.65rem] font-black text-white tracking-widest drop-shadow">
                    HP {switchboard.healthPct}%
                  </span>
                </div>

                {/* Radiant Green Glow Overshield Layer (Lime/Emerald) */}
                {(switchboard.glowPct || 0) > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 via-emerald-400 to-lime-300 border-l border-lime-200 transition-all duration-300 relative shadow-[0_0_15px_rgba(132,204,22,0.8)] animate-pulse shrink-0"
                    style={{ width: `${Math.min(100 - switchboard.healthPct, switchboard.glowPct || 0)}%` }}
                  >
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[0.62rem] font-black text-slate-950 tracking-wider">
                      +GLOW {switchboard.glowPct}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-[0.65rem] text-slate-400 pt-0.5 gap-2">
                <span>🛡️ GHOUL RAD CONVERSION: Radiation taken or consumed is converted into a Green Overshield.</span>
                <span className="text-lime-400 font-bold">OVERSHIELD: {switchboard.glowPct || 0}% ACTIVE</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/40 bg-slate-950 p-3 space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span>[ BIOMETRIC TELEMETRY: HP &amp; RADIATION CAP ]</span>
                </span>
                <span className="text-[0.72rem] text-slate-400">
                  Usable HP: <span className="text-rose-400 font-bold">{Math.min(switchboard.healthPct, Math.max(5, 100 - (switchboard.radsPct || 0)))}%</span> · Rad Saturation: <span className="text-amber-400 font-bold">{switchboard.radsPct || 0}%</span>
                </span>
              </div>

              {/* The Layered Visual Bar */}
              <div className="relative h-6 w-full rounded bg-slate-900 border border-slate-700 overflow-hidden shadow-inner flex">
                {/* Usable Health Layer */}
                <div
                  className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300 relative"
                  style={{ width: `${Math.min(switchboard.healthPct, Math.max(5, 100 - (switchboard.radsPct || 0)))}%` }}
                >
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[0.65rem] font-black text-white tracking-widest drop-shadow">
                    HP {switchboard.healthPct}%
                  </span>
                </div>

                {/* Radiation Capped Section */}
                {(switchboard.radsPct || 0) > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500 border-l border-amber-300 ml-auto transition-all duration-300 relative"
                    style={{ width: `${switchboard.radsPct || 0}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.62rem] font-black text-slate-950 tracking-wider">
                      RADS {switchboard.radsPct}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-[0.65rem] text-slate-400 pt-0.5 gap-2">
                <span>☣️ RADIATION CAP: Rads suppress maximum usable health pool (Bloodied threshold).</span>
                <span className="text-amber-400 font-bold">RAD CAP: {switchboard.radsPct || 0}%</span>
              </div>
            </div>
          )}

          {/* Steppers Matrix (Ghouls get HP, Glow Overshield, Feral Instinct, Feral Telemetry; Humans get HP, Rads, Food, Thirst) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* HP Stepper / Slider */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-500" /> Current Health (HP)
                </span>
                <span className="text-white font-bold">{switchboard.healthPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={switchboard.healthPct}
                  onChange={(e) => updateField("healthPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
              <div className="flex items-center justify-between text-[0.68rem] pt-1">
                <button
                  type="button"
                  onClick={() => updateField("healthPct", 20)}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    switchboard.healthPct <= 20
                      ? "bg-rose-950 border-rose-500 text-rose-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Bloodied / Nerd Rage (20%)
                </button>
                <button
                  type="button"
                  onClick={() => updateField("healthPct", 100)}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    switchboard.healthPct === 100
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Full HP (100%)
                </button>
              </div>
            </div>

            {/* Radiation Bar (Human) vs Green Glow Overshield (Ghoul) */}
            {isGhoul ? (
              <div className="rounded-lg border border-lime-500/40 bg-slate-900/70 p-3 space-y-2 shadow-[0_0_15px_rgba(132,204,22,0.1)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lime-400 font-bold uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-lime-400 animate-pulse" />
                    <span>Radiation Converted to Glow Overshield</span>
                  </span>
                  <span className="text-lime-300 font-bold">{switchboard.glowPct || 0}% Shield</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={switchboard.glowPct || 0}
                  onChange={(e) => updateField("glowPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-lime-400"
                />
                <div className="flex items-center justify-between text-[0.68rem] pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateField("glowPct", 0)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        (switchboard.glowPct || 0) === 0
                          ? "bg-slate-800 border-slate-600 text-slate-200 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      0% Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("glowPct", 50)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        (switchboard.glowPct || 0) === 50
                          ? "bg-lime-950 border-lime-500 text-lime-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      50% Shield
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("glowPct", 100)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        (switchboard.glowPct || 0) === 100
                          ? "bg-lime-950 border-lime-400 text-lime-200 font-black shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      100% Max Glow
                    </button>
                  </div>
                  <span className="text-[0.65rem] text-slate-500 italic">Damage absorbed by shield</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                    <Skull className="h-3.5 w-3.5 text-amber-400" />
                    <span>Radiation Saturation (Rads)</span>
                  </span>
                  <span className="text-amber-300 font-bold">{switchboard.radsPct || 0}% Rads</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={switchboard.radsPct || 0}
                  onChange={(e) => updateField("radsPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex items-center justify-between text-[0.68rem] pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateField("radsPct", 0)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        (switchboard.radsPct || 0) === 0
                          ? "bg-slate-800 border-slate-600 text-slate-200 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      0% Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("radsPct", 80)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        (switchboard.radsPct || 0) === 80
                          ? "bg-amber-950 border-amber-500 text-amber-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      80% Bloodied Cap
                    </button>
                  </div>
                  <span className="text-[0.65rem] text-slate-500">Rads cap max usable HP pool</span>
                </div>
              </div>
            )}

            {/* Feralization Instinct Meter (Ghouls) vs Food Satiation (Humans) */}
            {isGhoul ? (
              <div className="rounded-lg border border-lime-500/30 bg-slate-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lime-400 font-bold uppercase flex items-center gap-1.5">
                    <span>{currentFeralStage.icon}</span>
                    <span>Feral / Lucidity Bar</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/40 font-bold">
                    {currentFeralStage.label} ({switchboard.feralPct ?? 100}%)
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={switchboard.feralPct ?? 100}
                  onChange={(e) => updateField("feralPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-lime-500"
                />

                <div className="grid grid-cols-4 gap-1 pt-1">
                  {FERAL_STAGES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateField("feralPct", st.presetVal)}
                      className={`px-1 py-1 rounded text-[0.65rem] font-bold uppercase transition-all truncate border cursor-pointer ${
                        currentFeralStage.id === st.id
                          ? "bg-lime-500 text-slate-950 border-lime-400 font-black shadow-[0_0_8px_rgba(132,204,22,0.4)]"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st.id === "apex" ? "👹 Feral (0%)" : st.id === "frenzied" ? "🐺 Frenzy" : st.id === "agitated" ? "⚡ Steady" : "🧠 Lucid (100%)"}
                    </button>
                  ))}
                </div>

                <div className="text-[0.68rem] text-lime-300/90 bg-lime-950/40 border border-lime-500/20 rounded p-1.5 space-y-0.5">
                  <div className="font-bold text-lime-300">{currentFeralStage.boost}</div>
                  <div className="text-slate-400">{currentFeralStage.desc}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
                <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Food Satiation</span>
                  </span>
                  <span className="text-emerald-400 font-bold">{currentFoodDef.label}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <button
                    type="button"
                    onClick={() => stepFood(-1)}
                    className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-black text-white uppercase">{currentFoodDef.label}</span>
                  <button
                    type="button"
                    onClick={() => stepFood(1)}
                    className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[0.68rem] text-slate-400">{currentFoodDef.desc}</p>
              </div>
            )}

            {/* Feral Dynamics Telemetry (Ghouls) vs Thirst Hydration (Humans) */}
            {isGhoul ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between border-b border-slate-800 pb-1">
                  <span>[ 🧬 GHOUL DYNAMICS &amp; BUFF INGESTION ]</span>
                  <span className="text-[0.62rem] text-slate-400 uppercase">Survival Bypassed</span>
                </div>

                <div className="space-y-1.5 text-[0.68rem]">
                  <div className="flex items-start gap-1.5 text-emerald-300 font-bold">
                    <span className="text-emerald-400 shrink-0">🍖 FOOD &amp; DRINK BUFFS:</span>
                    <span className="font-normal text-slate-200">Ghouls fully consume and gain 100% stat &amp; damage bonuses from all Food Buffs, Teas, Chems, and Alcohol.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-lime-400 font-bold shrink-0">💊 CHEMS (Fills Bar):</span>
                    <span>Taking chems / lucidity items fills the bar up towards 100% (Fully Lucid / Sane buff).</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-amber-400 font-bold shrink-0">⏳ DECAY (Empties Bar):</span>
                    <span>Playing and taking no chems drains the bar toward 0%, triggering the fully Feral Apex bloodlust multiplier (+50% Melee/Unarmed Damage).</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-cyan-400 font-bold shrink-0">🎴 PERKS:</span>
                    <span>Ghoul perk cards trigger distinct effects depending on whether your state is Lucid or Feral.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-400 pt-0.5 border-t border-slate-800/60">
                    <span className="text-emerald-400 font-bold">🛡️ NO HUNGER/THIRST METERS:</span>
                    <span className="font-normal text-slate-400">Starvation &amp; dehydration penalties are completely bypassed.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
                <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-between">
                  <span>Hydration</span>
                  <span className="text-cyan-400 font-bold">{currentThirstDef.label}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <button
                    type="button"
                    onClick={() => stepThirst(-1)}
                    className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-black text-white uppercase">{currentThirstDef.label}</span>
                  <button
                    type="button"
                    onClick={() => stepThirst(1)}
                    className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[0.68rem] text-slate-400">{currentThirstDef.desc}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateField("foodState", "fully_fed");
                      updateField("thirstState", "fully_hydrated");
                    }}
                    className="flex-1 py-1 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-[0.65rem] font-bold uppercase hover:bg-emerald-900/50 transition-colors cursor-pointer text-center truncate"
                    title="Set Hunger & Thirst to 100% (Triggers Overeater's 30% mitigation & Gourmand's +24% damage)"
                  >
                    🍖💧 Max Overeater&apos;s
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("foodState", "starving");
                      updateField("thirstState", "parched");
                    }}
                    className="px-2 py-1 rounded border border-rose-500/30 bg-rose-950/30 text-rose-400 text-[0.65rem] font-bold uppercase hover:bg-rose-900/40 transition-colors cursor-pointer"
                    title="Set to Starving & Parched"
                  >
                    ⚠️ Depleted
                  </button>
                </div>
              </div>
            )}

            {/* Team Category Stepper */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5 md:col-span-2">
              <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" /> Team Status
                </span>
                <span className="text-indigo-300 font-bold">{currentTeamDef.label}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2 py-1">
                <button
                  type="button"
                  onClick={() => stepTeam(-1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white uppercase">{currentTeamDef.label}</span>
                <button
                  type="button"
                  onClick={() => stepTeam(1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between text-[0.68rem] text-slate-400 pt-0.5 gap-2">
                <span>{currentTeamDef.desc}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400 font-bold">
                  <input
                    type="checkbox"
                    checked={hasStrangeInNumbers}
                    onChange={(e) => {
                      onStrangeInNumbersChange?.(e.target.checked);
                      updateField("hasMutatedTeammate", e.target.checked);
                    }}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Mutated Teammates (Strange in Numbers +25%)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Combat Stances & V.A.T.S. Matrix */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Tactical Combat Stances &amp; V.A.T.S.
              </span>
              <span className="text-[0.65rem] text-slate-400 font-normal">
                {switchboard.combatStance?.isCrouched ? "🤫 Stealthed" : "🧍 Upright"} ·{" "}
                {switchboard.combatStance?.isInVats
                  ? switchboard.combatStance?.vatsCritEveryOtherShot
                    ? "✨ 1:1 Crit Loop"
                    : "🎯 In V.A.T.S."
                  : switchboard.combatStance?.isAiming
                  ? "🎯 Aiming ADS"
                  : "🔫 Hip Fire"}
              </span>
            </div>

            {/* Row 1: Physical Posture & Movement Stances */}
            <div className="space-y-1">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>Physical Movement &amp; Posture</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Crouched / Stealthed */}
                <button
                  type="button"
                  onClick={() => updateStance("isCrouched", !switchboard.combatStance?.isCrouched)}
                  className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.isCrouched
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{switchboard.combatStance?.isCrouched ? "🤫 Stealthed" : "🧍 Upright"}</span>
                  <span className="text-[0.62rem] font-normal text-slate-500">
                    {switchboard.combatStance?.isCrouched ? "Nocturnal / Sneak (2.5×)" : "Normal Detection"}
                  </span>
                </button>

                {/* 2. Sprinting */}
                <button
                  type="button"
                  onClick={() => updateStance("isSprinting", !switchboard.combatStance?.isSprinting)}
                  className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.isSprinting
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-black"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{switchboard.combatStance?.isSprinting ? "🏃 Sprinting" : "🚶 Walking"}</span>
                  <span className="text-[0.62rem] font-normal text-slate-500">
                    {switchboard.combatStance?.isSprinting ? "Cavalier's (-75% Dmg)" : "Standard Speed"}
                  </span>
                </button>

                {/* 3. Stationary / Standing Still */}
                <button
                  type="button"
                  onClick={() => updateStance("isStationary", !switchboard.combatStance?.isStationary)}
                  className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.isStationary
                      ? "bg-blue-950 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)] font-black"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{switchboard.combatStance?.isStationary ? "🛑 Stationary" : "🏃 Moving"}</span>
                  <span className="text-[0.62rem] font-normal text-slate-500">
                    {switchboard.combatStance?.isStationary ? "Sentinel's / Steady (+25%)" : "Dynamic Movement"}
                  </span>
                </button>

                {/* 4. Power Attack */}
                <button
                  type="button"
                  onClick={() => updateStance("isPowerAttacking", !switchboard.combatStance?.isPowerAttacking)}
                  className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.isPowerAttacking
                      ? "bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] font-black"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{switchboard.combatStance?.isPowerAttacking ? "💥 Power Attack" : "🗡️ Regular Atk"}</span>
                  <span className="text-[0.62rem] font-normal text-slate-500">
                    {switchboard.combatStance?.isPowerAttacking ? "+40% Heavy Hitter's" : "Base Attack Cost"}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 2: Targeting & V.A.T.S. Fire Control */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Targeting &amp; V.A.T.S. Critical Loop</span>
                <span className="text-[0.62rem] text-slate-500 lowercase">vats suppresses ads bonuses</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Aiming Down Sights */}
                <button
                  type="button"
                  onClick={() => updateStance("isAiming", !switchboard.combatStance?.isAiming)}
                  className={`p-2.5 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.isAiming
                      ? "bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)] font-black"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>{switchboard.combatStance?.isAiming ? "Aiming (ADS)" : "Hip Fire"}</span>
                  </div>
                  <span className="text-[0.62rem] font-normal text-slate-500">
                    {switchboard.combatStance?.isAiming ? "Hitman's (+25%) · Steadfast (+50 DR)" : "Free Hip Spread (ADS Off)"}
                  </span>
                </button>

                {/* 2. In V.A.T.S. */}
                <button
                  type="button"
                  onClick={() => updateStance("isInVats", !switchboard.combatStance?.isInVats)}
                  className={`p-2.5 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.isInVats
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-black"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">⚡</span>
                    <span>{switchboard.combatStance?.isInVats ? "In V.A.T.S. (Active)" : "Enter V.A.T.S."}</span>
                  </div>
                  <span className="text-[0.62rem] font-normal text-slate-500">
                    {switchboard.combatStance?.isInVats ? "Target Lock · 95% Cap · AP Cost" : "Free Targeting (VATS Off)"}
                  </span>
                </button>

                {/* 3. V.A.T.S. Crit Every Other Shot */}
                <button
                  type="button"
                  onClick={() =>
                    updateStance(
                      "vatsCritEveryOtherShot",
                      !switchboard.combatStance?.vatsCritEveryOtherShot
                    )
                  }
                  className={`p-2.5 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                    switchboard.combatStance?.vatsCritEveryOtherShot
                      ? critQualification?.everySecondShotReady
                        ? "bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black"
                        : "bg-amber-950/60 border-amber-600 text-amber-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <span>✨</span>
                      <span>Crit Every 2nd Shot</span>
                    </span>
                    {critQualification?.everySecondShotReady ? (
                      <span className="text-[0.58rem] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black">
                        ⚡ QUALIFIED
                      </span>
                    ) : (
                      <span className="text-[0.58rem] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        🔒 NEED +{critQualification?.missingLuck ?? "?"} LCK
                      </span>
                    )}
                  </div>
                  <span className="text-[0.62rem] font-normal text-slate-400">
                    {switchboard.combatStance?.vatsCritEveryOtherShot
                      ? "1 Normal ➔ 1 Crit Alternating Loop"
                      : `Req: ${critQualification?.requiredLuck ?? 33} Luck (Build has ${critQualification?.currentLuck ?? 0})`}
                  </span>
                </button>
              </div>

              {/* V.A.T.S. & Luck Chart Telemetry Card */}
              {critQualification && (
                <div className="rounded border border-emerald-500/20 bg-slate-950/80 p-2.5 text-[0.68rem] font-mono space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-800 pb-1">
                    <span className="text-emerald-400 font-bold">
                      [ V.A.T.S. CRITICAL METER &amp; LUCK CHART TELEMETRY ]
                    </span>
                    <span className={critQualification.everySecondShotReady ? "text-emerald-300 font-bold" : "text-amber-400 font-bold"}>
                      {critQualification.summary}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-0.5">
                    <div>
                      <span className="text-slate-500">Current Luck:</span>{" "}
                      <span className="text-white font-bold">{critQualification.currentLuck}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">1:1 Req Luck:</span>{" "}
                      <span className="text-amber-300 font-bold">{critQualification.requiredLuck}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Crit Savvy:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {critQualification.critSavvyRank > 0 ? `Rank ${critQualification.critSavvyRank} (${critQualification.fillCostPct}% cost)` : "None (100% cost)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fill Per Shot:</span>{" "}
                      <span className="text-cyan-300 font-bold">{critQualification.fillPerShotPct}% / shot</span>
                    </div>
                  </div>
                  <div className="text-[0.62rem] text-slate-400 pt-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>💡 {critQualification.recommendation}</span>
                    <span className="text-slate-500 shrink-0">
                      3★ Lucky: {critQualification.hasLucky15Fill ? "Active (-10 Luck)" : "Off"} · VATS Opt: {critQualification.hasVatsOptimized ? "Active (-25% AP)" : "Off"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Active Tactical Telemetry Banner */}
            <div className="rounded border border-emerald-500/30 bg-slate-950 p-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-slate-400 font-bold uppercase text-[0.68rem] shrink-0">Tactical Triggers:</span>
                <span className="text-emerald-300 font-black text-[0.7rem] truncate">
                  {activeTacticalTags && activeTacticalTags.length > 0
                    ? activeTacticalTags.join(" · ")
                    : switchboard.combatStance?.isCrouched
                    ? "Crouched / Stealthed (Sneak Attack 2.0×–2.5× · Nocturnal/Chameleon Ready)"
                    : "Standard Upright Combat (No Stance Buffs Active)"}
                </span>
              </div>
              <span className="text-[0.62rem] text-slate-500 uppercase shrink-0 text-right">
                Live Game Mechanics Active
              </span>
            </div>
          </div>

          {/* Dynamic Counters & Aristocrat's Caps Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Adrenaline Stacks */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Adrenaline Kill Streak:</span>
                <span className="text-amber-400">{switchboard.adrenalineStacks || 0} / 6</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={switchboard.adrenalineStacks || 0}
                onChange={(e) => updateField("adrenalineStacks", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="text-[0.65rem] text-slate-500">
                +{(switchboard.adrenalineStacks || 0) * 10}% Additive Damage
              </div>
            </div>

            {/* Addictions Counter */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Addictions (Junkie&apos;s):</span>
                <span className="text-purple-400">{switchboard.addictionsCount || 0} / 5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={switchboard.addictionsCount || 0}
                onChange={(e) => updateField("addictionsCount", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="text-[0.65rem] text-slate-500">
                +{(switchboard.addictionsCount || 0) * 10}% Junkie&apos;s Bonus (Max 50%)
              </div>
            </div>

            {/* Aristocrat's Caps Slider */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Caps (Aristocrat&apos;s):</span>
                <span className="text-emerald-400">{(switchboard.caps ?? 30000).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="40000"
                step="1000"
                value={switchboard.caps ?? 30000}
                onChange={(e) => updateField("caps", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="text-[0.65rem] text-slate-500">
                {(switchboard.caps ?? 30000) >= 29000 ? "✅ Max +50% Aristocrat's Bonus" : "Scaled Aristocrat's Bonus"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSUMABLES & BUFF REGISTRY */}
      {activeTab === "registry" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-500/30 bg-slate-900/50 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-400 shrink-0" />
              <span><strong className="text-emerald-400 font-bold">Full Species Buff Compatibility:</strong> Both Humans and Ghouls benefit 100% from stacked food recipes, teas, chems, bobbleheads, magazines, and alcohol brews.</span>
            </span>
            <span className="text-[0.68rem] text-slate-400 uppercase font-mono">
              Species: <span className={isGhoul ? "text-lime-400 font-bold" : "text-emerald-400 font-bold"}>{isGhoul ? "☣️ PLAYABLE GHOUL" : "👤 HUMAN"}</span>
            </span>
          </div>

          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", readOnly && "pointer-events-none opacity-90")}>
            {/* Chems */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-rose-400" /> Active Primary Chem
              </label>
              <select
                value={switchboard.activeDrug || ""}
                onChange={(e) => updateField("activeDrug", e.target.value || null)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="">None (No Chem)</option>
                {ALL_CHEMS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.description})
                  </option>
                ))}
              </select>
            </div>

            {/* Bobblehead */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Active Bobblehead
              </label>
              <select
                value={switchboard.activeBobblehead || ""}
                onChange={(e) => updateField("activeBobblehead", e.target.value || null)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="">None (No Bobblehead)</option>
                {ALL_BOBBLEHEADS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Magazine */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Book className="h-3.5 w-3.5 text-cyan-400" /> Active Magazine
              </label>
              <select
                value={switchboard.activeMagazine || ""}
                onChange={(e) => updateField("activeMagazine", e.target.value || null)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="">None (No Magazine)</option>
                {ALL_MAGAZINES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Alcohol */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Beer className="h-3.5 w-3.5 text-amber-500" /> Active Brew / Alcohol
              </label>
              <select
                value={switchboard.activeAlcohol || ""}
                onChange={(e) => updateField("activeAlcohol", e.target.value || null)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="">None (No Alcohol)</option>
                {ALL_ALCOHOL.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Stacking */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-emerald-400" /> Add Stackable Food
              </label>
              <select
                value=""
                onChange={(e) => handleSelectFood(e.target.value)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="">+ Select Food Buff to Add</option>
                {(isHerbivore ? ALL_PLANT_FOODS : isCarnivore ? ALL_MEAT_FOODS : [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS]).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label} ({f.foodBuffType})
                  </option>
                ))}
              </select>
            </div>

            {/* Companion Buff */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-purple-400" /> Camp Companion
              </label>
              <select
                value={switchboard.activeCompanion || ""}
                onChange={(e) => updateField("activeCompanion", e.target.value || null)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="">None (No Companion)</option>
                {ALL_COMPANIONS.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Food Chips */}
          {Object.keys(switchboard.activeFoods || {}).length > 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Active Stacked Food Buffs ({Object.keys(switchboard.activeFoods).length})</span>
                <button
                  type="button"
                  onClick={() => updateField("activeFoods", {})}
                  className="text-[0.68rem] text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All Foods
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(switchboard.activeFoods).map(([category, id]) => {
                  const allFoods = [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS];
                  const item = allFoods.find((f) => f.id === id);
                  return (
                    <div
                      key={category}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-emerald-500/40 text-xs font-bold text-emerald-300"
                    >
                      <span>{item?.label || id}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFoodCategory(category)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FORMULA MATH AUDIT */}
      {activeTab === "audit" && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-3 text-xs font-mono">
          <div className="font-bold text-emerald-400 uppercase flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Calculator className="h-4 w-4" /> Live Calculation Formula &amp; Biometrics Audit
            </span>
            <span className="text-[0.68rem] text-slate-400 font-normal">
              Species: <span className={isGhoul ? "text-lime-300 font-bold" : "text-emerald-300 font-bold"}>{isGhoul ? "☣️ PLAYABLE GHOUL" : "👤 HUMAN"}</span>
            </span>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[0.72rem]">
            {isGhoul ? (
              <>
                <div>• <span className="text-white font-bold">Ghoul Glow Overshield:</span> {switchboard.glowPct || 0}% active (<span className="text-lime-400">Radiation absorbed &amp; converted 1:1 into Green Overshield</span>)</div>
                <div>• <span className="text-white font-bold">Ghoul Lucidity State:</span> {currentFeralStage.label} ({switchboard.feralPct ?? 100}%) — <span className="text-lime-300 font-bold">{currentFeralStage.boost}</span></div>
                <div>• <span className="text-white font-bold">Food &amp; Consumable Buffs:</span> <span className="text-emerald-400 font-bold">100% Active &amp; Stacked</span> ({Object.keys(switchboard.activeFoods || {}).length} active food buffs, full recipes applied)</div>
                <div>• <span className="text-white font-bold">Survival Degradation:</span> <span className="text-emerald-400">Bypassed</span> (Ghouls have zero Food or Thirst penalties)</div>
              </>
            ) : (
              <>
                <div>• <span className="text-white font-bold">Radiation Saturation:</span> {switchboard.radsPct || 0}% Rads (<span className="text-amber-400">Caps usable HP to {Math.max(5, 100 - (switchboard.radsPct || 0))}%</span>)</div>
                <div>• <span className="text-white font-bold">Food &amp; Hydration:</span> {currentFoodDef.label} / {currentThirstDef.label}</div>
                <div>• <span className="text-white font-bold">Food &amp; Consumable Buffs:</span> {Object.keys(switchboard.activeFoods || {}).length} active food buffs applied</div>
              </>
            )}
            <div>• <span className="text-white font-bold">Health State:</span> {switchboard.healthPct}% (Bloodied gives +{Math.round(Math.min(95, (100 - switchboard.healthPct)))}% bonus)</div>
            <div>• <span className="text-white font-bold">Adrenaline:</span> {switchboard.adrenalineStacks || 0} stacks (+{(switchboard.adrenalineStacks || 0) * 10}% damage)</div>
            <div>• <span className="text-white font-bold">Junkie&apos;s Addictions:</span> {switchboard.addictionsCount || 0} addictions (+{(switchboard.addictionsCount || 0) * 10}% damage)</div>
            <div>• <span className="text-white font-bold">Aristocrat&apos;s Caps:</span> {(switchboard.caps ?? 30000).toLocaleString()} caps ({(switchboard.caps ?? 30000) >= 29000 ? "+50% max damage" : "Scaled damage"})</div>
            <div>• <span className="text-white font-bold">Sneak Stance:</span> {switchboard.combatStance?.isSneaking ? "Active (2.5× multiplier + Follow Through +40%)" : "Inactive"}</div>
            <div>• <span className="text-white font-bold">Strange in Numbers:</span> {hasStrangeInNumbers ? "Active (25% boost to positive mutation effects)" : "Inactive"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
