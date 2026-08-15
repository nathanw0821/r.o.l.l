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

export type CombatSwitchboardState = {
  isGhoul?: boolean;
  healthPct: number;
  radsPct?: number;
  feralPct?: number;
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
    isSprinting: boolean;
    isAiming: boolean;
    isPowerAttacking: boolean;
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
}

export default function BuilderCombatSwitchboard({
  rawDamage,
  isGhoul = false,
  onSpeciesChange,
  activeMutations = [],
  onMutationsChange,
  hasStrangeInNumbers = false,
  onStrangeInNumbersChange,
  ignoreMutationPenalties = false,
  onIgnoreMutationPenaltiesChange,
  onStateChange,
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
    return {
      isGhoul,
      healthPct: 100,
      radsPct: 0,
      feralPct: 0,
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
        isSprinting: false,
        isAiming: false,
        isPowerAttacking: false,
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
  });

  const updateField = <K extends keyof CombatSwitchboardState>(key: K, val: CombatSwitchboardState[K]) => {
    setSwitchboard((prev) => {
      const next = { ...prev, [key]: val };
      onStateChange?.(next);
      return next;
    });
  };

  const updateStance = (key: "isSneaking" | "isSprinting" | "isAiming" | "isPowerAttacking", val: boolean) => {
    setSwitchboard((prev) => {
      const nextStance = { ...(prev.combatStance || { isSneaking: false, isSprinting: false, isAiming: false, isPowerAttacking: false }), [key]: val };
      const next = { ...prev, combatStance: nextStance };
      onStateChange?.(next);
      return next;
    });
  };

  // Step Helpers
  const stepFood = (dir: -1 | 1) => {
    const currIdx = FOOD_STATES.findIndex((f) => f.id === (switchboard.foodState || "fully_fed"));
    const nextIdx = Math.max(0, Math.min(FOOD_STATES.length - 1, currIdx + dir));
    updateField("foodState", FOOD_STATES[nextIdx].id);
  };

  const stepThirst = (dir: -1 | 1) => {
    const currIdx = THIRST_STATES.findIndex((t) => t.id === (switchboard.thirstState || "fully_hydrated"));
    const nextIdx = Math.max(0, Math.min(THIRST_STATES.length - 1, currIdx + dir));
    updateField("thirstState", THIRST_STATES[nextIdx].id);
  };

  const stepTeam = (dir: -1 | 1) => {
    const currIdx = TEAM_STATES.findIndex((t) => t.id === (switchboard.teamState || "casual"));
    const nextIdx = Math.max(0, Math.min(TEAM_STATES.length - 1, currIdx + dir));
    updateField("teamState", TEAM_STATES[nextIdx].id);
  };

  const handleSelectFood = (foodId: string) => {
    if (!foodId || foodId === "none") return;
    const allFoods = [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS];
    const food = allFoods.find((f) => f.id === foodId);
    if (!food) return;

    const categoryKey = food.foodBuffType || "general";
    const nextFoods = { ...(switchboard.activeFoods || {}) };
    nextFoods[categoryKey] = food.id;

    setSwitchboard((prev) => {
      const next = { ...prev, activeFoods: nextFoods, activeFood: food.id };
      onStateChange?.(next);
      return next;
    });
  };

  const handleRemoveFoodCategory = (categoryKey: string) => {
    const nextFoods = { ...(switchboard.activeFoods || {}) };
    delete nextFoods[categoryKey];
    setSwitchboard((prev) => {
      const next = {
        ...prev,
        activeFoods: nextFoods,
        activeFood: Object.values(nextFoods)[0] || null,
      };
      onStateChange?.(next);
      return next;
    });
  };

  const currentFoodDef = FOOD_STATES.find((f) => f.id === (switchboard.foodState || "fully_fed")) || FOOD_STATES[4];
  const currentThirstDef = THIRST_STATES.find((t) => t.id === (switchboard.thirstState || "fully_hydrated")) || THIRST_STATES[4];
  const currentTeamDef = TEAM_STATES.find((t) => t.id === (switchboard.teamState || "casual")) || TEAM_STATES[1];

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-slate-950/95 p-4 font-mono text-slate-100 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4">
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
            className={`px-3 py-1 rounded font-bold uppercase transition-all ${
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
            className={`px-3 py-1 rounded font-bold uppercase transition-all ${
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
            className={`px-3 py-1 rounded font-bold uppercase transition-all ${
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
        <div className="space-y-4">
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
                className={`text-xs px-3 py-1 rounded font-black uppercase tracking-wider transition-all border ${
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
                className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition-all border ${
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
                className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
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

          {/* Steppers Matrix (HP, Rads/Feral, Food, Thirst, Team) */}
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
                  className={`px-2 py-0.5 rounded border transition-colors ${
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
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    switchboard.healthPct === 100
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Full HP (100%)
                </button>
              </div>
            </div>

            {/* Radiation Bar (Human) / Feral Meter (Ghoul) */}
            {isGhoul ? (
              <div className="rounded-lg border border-lime-500/30 bg-slate-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lime-400 font-bold uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Feral / Glow Charge
                  </span>
                  <span className="text-lime-300 font-bold">{switchboard.feralPct || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={switchboard.feralPct || 0}
                  onChange={(e) => updateField("feralPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-lime-500"
                />
                <div className="text-[0.68rem] text-slate-400">
                  Ghouls gain unique Feral combat damage scaling without radiation degradation.
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                    <Skull className="h-3.5 w-3.5" /> Radiation Saturation (Rads)
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
                <div className="text-[0.68rem] text-slate-400">
                  Rads cap max usable HP pool (80% Rads = 20% Max HP Bloodied threshold).
                </div>
              </div>
            )}

            {/* Food Survival Tier Stepper */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-between">
                <span>Food Satiation</span>
                <span className="text-emerald-400">{currentFoodDef.label}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2 py-1">
                <button
                  type="button"
                  onClick={() => stepFood(-1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white uppercase">{currentFoodDef.label}</span>
                <button
                  type="button"
                  onClick={() => stepFood(1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[0.68rem] text-slate-400">{currentFoodDef.desc}</p>
            </div>

            {/* Thirst Survival Tier Stepper */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-between">
                <span>Hydration</span>
                <span className="text-cyan-400">{currentThirstDef.label}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2 py-1">
                <button
                  type="button"
                  onClick={() => stepThirst(-1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white uppercase">{currentThirstDef.label}</span>
                <button
                  type="button"
                  onClick={() => stepThirst(1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[0.68rem] text-slate-400">{currentThirstDef.desc}</p>
            </div>

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
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white uppercase">{currentTeamDef.label}</span>
                <button
                  type="button"
                  onClick={() => stepTeam(1)}
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[0.68rem] text-slate-400 pt-0.5">
                <span>{currentTeamDef.desc}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400 font-bold">
                  <input
                    type="checkbox"
                    checked={hasStrangeInNumbers}
                    onChange={(e) => {
                      onStrangeInNumbersChange?.(e.target.checked);
                      updateField("hasMutatedTeammate", e.target.checked);
                    }}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Mutated Teammates (Strange in Numbers +25%)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Combat Stances Matrix */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Tactical Combat Stances
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => updateStance("isSneaking", !switchboard.combatStance?.isSneaking)}
                className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                  switchboard.combatStance?.isSneaking
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{switchboard.combatStance?.isSneaking ? "🤫 Sneaking (2.5×)" : "🧍 Standing"}</span>
                <span className="text-[0.65rem] font-normal text-slate-500">
                  {switchboard.combatStance?.isSneaking ? "Sneak Attack Active" : "Normal Detection"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateStance("isSprinting", !switchboard.combatStance?.isSprinting)}
                className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                  switchboard.combatStance?.isSprinting
                    ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-black"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{switchboard.combatStance?.isSprinting ? "🏃 Sprinting" : "🚶 Walking"}</span>
                <span className="text-[0.65rem] font-normal text-slate-500">
                  {switchboard.combatStance?.isSprinting ? "Cavalier's -75% DR" : "Standard Mobility"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateStance("isPowerAttacking", !switchboard.combatStance?.isPowerAttacking)}
                className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                  switchboard.combatStance?.isPowerAttacking
                    ? "bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] font-black"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{switchboard.combatStance?.isPowerAttacking ? "💥 Power Attack" : "🗡️ Normal Attack"}</span>
                <span className="text-[0.65rem] font-normal text-slate-500">
                  {switchboard.combatStance?.isPowerAttacking ? "+40% Heavy Hitter" : "Base Attack"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateStance("isAiming", !switchboard.combatStance?.isAiming)}
                className={`p-2 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                  switchboard.combatStance?.isAiming
                    ? "bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)] font-black"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{switchboard.combatStance?.isAiming ? "🎯 Aiming Down Sight" : "🔫 Hip Fire"}</span>
                <span className="text-[0.65rem] font-normal text-slate-500">
                  {switchboard.combatStance?.isAiming ? "+25% Hitman's Mod" : "Free Spread"}
                </span>
              </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className="text-[0.68rem] text-rose-400 hover:underline"
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
                        className="text-slate-500 hover:text-rose-400"
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
          <div className="font-bold text-emerald-400 uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Calculator className="h-4 w-4" /> Live Calculation Formula Audit
          </div>
          <div className="space-y-1.5 text-slate-300 text-[0.72rem]">
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
