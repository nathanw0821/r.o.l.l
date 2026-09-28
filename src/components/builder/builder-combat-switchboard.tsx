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
  Shield,
  Dna,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StateGroup from "@/components/builder/state-group";
import ScopedPickerDialog, { type ScopedPickerItem } from "@/components/builder/scoped-picker-dialog";
import { SANDBOX_MUTATIONS, type SandboxMutationDef } from "@/lib/builder/sandbox-mutations";
import { vitalsBarModel } from "@/lib/builder/vitals-bars";
import { useIsPhoneWidth } from "@/lib/hooks/use-is-phone-width";
import { BUILDER_SPECIAL_KEYS } from "@/lib/builder/compatibility";
import {
  ALL_BOBBLEHEADS,
  ALL_MAGAZINES,
  ALL_CHEMS,
  ALL_PLANT_FOODS,
  ALL_MEAT_FOODS,
  ALL_ALCOHOL,
  ALL_COMPANIONS,
  type Fallout76BuffDef,
} from "@/lib/builder/all-fallout76-buffs";
import type {
  FoodSurvivalState,
  ThirstSurvivalState,
  TeamCategory,
} from "@/lib/builder/unified-builder-state";
import type { CombatHitLocation, CombatTargetRange, VatsCritQualification } from "@/lib/builder/combat-firepower-engine";
import {
  calculateDamageTaken,
  type DefensiveProfile,
  type IncomingDamageType,
} from "@/lib/builder/perk-defensive-layer";
import combatConditions from "@/data/truth/combat-conditions.json";

/** Glow meter reading that counts as "Glow high" for the Ghoul cards (combat-conditions.json `glow`). */
const GLOW_HIGH_THRESHOLD_PCT: number = combatConditions.glow.highThresholdPct;

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
  /** Another Ghoul on the team (United Ordeal). */
  hasGhoulTeammate?: boolean;
  /** Carrying a disease: Iron Stomach, Natural Resistance and Thirst Quencher switch off. */
  isDiseased?: boolean;
  timeOfDay?: "day" | "night";
  addictionsCount?: number;
  adrenalineStacks?: number;
  furiousStacks?: number;
  bulletStormStacks?: number;
  onslaughtStacks?: number;
  killStreak?: number;
  tenderizerStacks?: number;
  targetBleeding?: boolean;
  targetBurning?: boolean;
  targetPoisoned?: boolean;
  targetCrippledLimbs?: number;
  /** Target-type overrides for Glow Sight / Exterminator (no shipped dummy carries the tag). */
  targetIsGlowing?: boolean;
  targetIsInsect?: boolean;
  combatStance?: {
    isSneaking: boolean;
    isCrouched?: boolean;
    isSprinting: boolean;
    isAiming: boolean;
    isPowerAttacking: boolean;
    isStationary?: boolean;
    isInVats?: boolean;
    vatsCritEveryOtherShot?: boolean;
    /**
     * @deprecated Derived alias of `hitLocation === "weakSpot"`, written on every change and kept
     * for one release so switchboard state saved before 2026-09-28 still loads. Read `hitLocation`.
     */
    isTargetingWeakSpot?: boolean;
    /** Where the shot lands: body (default), torso (Center Masochist) or weak spot (head multiplier). */
    hitLocation?: CombatHitLocation;
    /** Target distance band: close (Guerrilla), mid (default, no range perk) or far (Down Ranger). */
    targetRange?: CombatTargetRange;
    /** Ghoul: the attack expends Glow (Mad Scientist, Radiation Power, Radioactive Strength). */
    isSpendingGlow?: boolean;
    /** Ghoul: hit in the last 10 s (Science Monster). */
    wasHitRecently?: boolean;
  };
  caps?: number;
  /** Damage-taken preview: size of the incoming hit and its damage type. */
  incomingDamage?: number;
  incomingDamageType?: IncomingDamageType;
  /**
   * Innate Power Armor reduction per piece (percent). Unverified claim (7% / 15%);
   * off by default and labelled unverified in the UI.
   */
  powerArmorInnatePct?: number;

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

type CombatStanceState = NonNullable<CombatSwitchboardState["combatStance"]>;

/** Hit location of a stance; a pre-2026-09-28 save with only `isTargetingWeakSpot: true` reads as "weakSpot". */
export function resolveHitLocation(stance: Partial<CombatStanceState> | null | undefined): CombatHitLocation {
  return stance?.hitLocation ?? (stance?.isTargetingWeakSpot === true ? "weakSpot" : "body");
}

/** Target range of a stance; absent means "mid" (no range perk applies). */
export function resolveTargetRange(stance: Partial<CombatStanceState> | null | undefined): CombatTargetRange {
  return stance?.targetRange ?? "mid";
}

export const HIT_LOCATION_OPTIONS: { id: CombatHitLocation; label: string }[] = [
  { id: "body", label: "Body" },
  { id: "torso", label: "Torso" },
  { id: "weakSpot", label: "Weak spot" },
];

export const TARGET_RANGE_OPTIONS: { id: CombatTargetRange; label: string }[] = [
  { id: "close", label: "Close" },
  { id: "mid", label: "Mid" },
  { id: "far", label: "Far" },
];

export const TARGET_ENEMIES: Record<string, { name: string; dr: number; pctReduction: number }> = {
  superMutant: { name: "Super Mutant Firestarter (150 DR)", dr: 150, pctReduction: 0 },
  earle: { name: "Earle Williams (Boss 80% Mitigation + 300 DR)", dr: 300, pctReduction: 0.80 },
  sbq: { name: "Scorchbeast Queen (Boss 70% Mitigation + 300 DR)", dr: 300, pctReduction: 0.70 },
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

/** Live totals shown in the sticky band above the state groups (from useBuilderTotals). */
export type StatsBandData = {
  special: Record<(typeof BUILDER_SPECIAL_KEYS)[number], number>;
  dr: number;
  er: number;
  rr: number;
  /** Vitals rows (vitals-sheet.ts); absent in read-only embeds without a sheet. */
  maxHp?: number;
  maxAp?: number;
  carryWeight?: number;
};

const STATE_GROUP_IDS = [
  "vitals",
  "stances",
  "damage",
  "stacks",
  "impairments",
  "mutations",
  "consumables",
  "audit",
] as const;
type StateGroupId = (typeof STATE_GROUP_IDS)[number];

type ConsumableSlotField = "activeDrug" | "activeBobblehead" | "activeMagazine" | "activeAlcohol" | "activeCompanion";
type PickerKind = "mutation" | "food" | ConsumableSlotField;

const CONSUMABLE_SLOTS: Array<{
  field: ConsumableSlotField;
  label: string;
  items: Fallout76BuffDef[];
  icon: React.ReactNode;
}> = [
  { field: "activeDrug", label: "Chem", items: ALL_CHEMS, icon: <Pill className="h-3.5 w-3.5 text-rose-400" /> },
  { field: "activeBobblehead", label: "Bobblehead", items: ALL_BOBBLEHEADS, icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" /> },
  { field: "activeMagazine", label: "Magazine", items: ALL_MAGAZINES, icon: <Book className="h-3.5 w-3.5 text-cyan-400" /> },
  { field: "activeAlcohol", label: "Brew / alcohol", items: ALL_ALCOHOL, icon: <Beer className="h-3.5 w-3.5 text-amber-500" /> },
  { field: "activeCompanion", label: "Camp companion", items: ALL_COMPANIONS, icon: <Home className="h-3.5 w-3.5 text-purple-400" /> },
];

const MUTATION_STAT_LABEL: Record<string, string> = {
  str: "STR", per: "PER", end: "END", cha: "CHA", int: "INT", agi: "AGI", lck: "LCK",
  dr: "DR", er: "ER", rr: "RR", hp: "HP", carryWeight: "carry", damagePct: "damage", apRegen: "AP regen",
  meleeDamagePct: "melee", sneakPct: "sneak",
};
function formatMutationLayer(layer: Record<string, number>): string {
  return Object.entries(layer)
    .filter(([, v]) => Number.isFinite(v) && v !== 0)
    .map(([k, v]) => {
      const pct = k.endsWith("Pct") || k === "apRegen";
      const num = pct ? `${Math.round(v * 100)}%` : `${v}`;
      return `${v > 0 ? "+" : ""}${num} ${MUTATION_STAT_LABEL[k] ?? k}`;
    })
    .join(", ");
}
export function formatMutationMath(def: SandboxMutationDef | undefined): string {
  if (!def) return "";
  return [formatMutationLayer(def.benefit), formatMutationLayer(def.penalty)].filter(Boolean).join(" · ");
}

/** One value in the sticky band; flashes for a moment when it changes. */
function FlashStat({ label, value }: { label: string; value: number }) {
  const [flash, setFlash] = React.useState(false);
  const prev = React.useRef(value);
  React.useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded border transition-colors",
        flash ? "border-emerald-400 bg-emerald-500/20 text-emerald-200" : "border-slate-800 text-slate-300",
      )}
    >
      <span className="text-dim mr-1">{label}</span>
      <span className="font-bold text-slate-100">{value}</span>
    </span>
  );
}

interface BuilderCombatSwitchboardProps {
  rawDamage: number;
  /** Live totals for the sticky band; omitted in read-only embeds. */
  statsBand?: StatsBandData;
  isCompactDensity?: boolean;
  /** Live weak-spot state from the firepower engine (target part, multiplier, active bonuses). */
  weakSpot?: { targeting: boolean; baseMultiplier: number | null; part: string; bonusPct: number; multiplier: number; breakdown: { source: string; value: string }[] } | null;
  isGhoul?: boolean;
  onSpeciesChange?: (isGhoul: boolean) => void;
  activeMutations?: string[];
  onMutationsChange?: (mutations: string[]) => void;
  /**
   * Armor mode owned by the Gear tab (derived from the equipped chassis). When given, the
   * "Armor frame" button mirrors it and asks the Gear tab to switch instead of flipping the
   * switchboard's own flag, so both tabs always agree.
   */
  armorModeIsPA?: boolean;
  onArmorModeChange?: (isPA: boolean) => void;
  hasStrangeInNumbers?: boolean;
  onStrangeInNumbersChange?: (enabled: boolean) => void;
  ignoreMutationPenalties?: boolean;
  onIgnoreMutationPenaltiesChange?: (enabled: boolean) => void;
  onStateChange?: (state: CombatSwitchboardState) => void;
  activeTacticalTags?: string[];
  critQualification?: VatsCritQualification;
  /** Perk deck + armor mod defensive profile (reducers, Evade, Deflect). */
  defensiveProfile?: DefensiveProfile | null;
  /** The build's total DR / ER after every layer, for the damage-taken preview. */
  playerResists?: { dr: number; er: number };
  readOnly?: boolean;
  initialState?: Partial<CombatSwitchboardState>;
}

export default function BuilderCombatSwitchboard({
  isGhoul = false,
  onSpeciesChange,
  activeMutations = [],
  onMutationsChange,
  armorModeIsPA,
  onArmorModeChange,
  ignoreMutationPenalties = false,
  onIgnoreMutationPenaltiesChange,
  statsBand,
  isCompactDensity,
  weakSpot,
  hasStrangeInNumbers = false,
  onStrangeInNumbersChange,
  onStateChange,
  activeTacticalTags,
  critQualification,
  defensiveProfile = null,
  playerResists,
  readOnly = false,
  initialState,
}: BuilderCombatSwitchboardProps) {
  const isCarnivore = activeMutations.includes("carnivore");
  const isHerbivore = activeMutations.includes("herbivore");

  // One column of collapsible state groups. Desktop opens all; a phone opens one at a time
  // (the first render is deterministic for hydration, the phone collapse follows on mount).
  const isPhone = useIsPhoneWidth();
  const [openGroups, setOpenGroups] = React.useState<Set<StateGroupId>>(() => new Set(STATE_GROUP_IDS));
  const phoneCollapsedRef = React.useRef(false);
  React.useEffect(() => {
    if (isPhone && !phoneCollapsedRef.current) {
      phoneCollapsedRef.current = true;
      setOpenGroups(new Set<StateGroupId>(["vitals"]));
    }
  }, [isPhone]);
  const toggleGroup = (id: StateGroupId) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (isPhone) next.clear();
        next.add(id);
      }
      return next;
    });
  const setAllGroups = (open: boolean) =>
    setOpenGroups(open ? new Set(STATE_GROUP_IDS) : new Set<StateGroupId>());

  // Scoped pickers (mutation, food, one consumable slot); the opener is refocused on close.
  const [picker, setPicker] = React.useState<PickerKind | null>(null);
  const pickerOpenerRef = React.useRef<HTMLElement | null>(null);
  const openPicker = (kind: PickerKind) => {
    pickerOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPicker(kind);
  };
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
      isDiseased: false,
      timeOfDay: "day",
      addictionsCount: 0,
      adrenalineStacks: 0,
      furiousStacks: 0,
      bulletStormStacks: 0,
      onslaughtStacks: 0,
      killStreak: 0,
      tenderizerStacks: 0,
      targetBleeding: false,
      targetBurning: false,
      targetPoisoned: false,
      targetCrippledLimbs: 0,
      targetIsGlowing: false,
      targetIsInsect: false,
      combatStance: {
        isSneaking: false,
        isCrouched: false,
        isSprinting: false,
        isAiming: false,
        isPowerAttacking: false,
        isStationary: false,
        isInVats: false,
        vatsCritEveryOtherShot: false,
        isTargetingWeakSpot: false,
        hitLocation: "body",
        targetRange: "mid",
      },
      caps: 30000,
      incomingDamage: 100,
      incomingDamageType: "ballistic",
      powerArmorInnatePct: 0,

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
        isTargetingWeakSpot: resolveHitLocation(initialState?.combatStance) === "weakSpot",
        hitLocation: resolveHitLocation(initialState?.combatStance),
        targetRange: resolveTargetRange(initialState?.combatStance),
        isSpendingGlow: initialState?.combatStance?.isSpendingGlow ?? false,
        wasHitRecently: initialState?.combatStance?.wasHitRecently ?? false,
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

  const hitLocation = resolveHitLocation(switchboard.combatStance);
  const targetRange = resolveTargetRange(switchboard.combatStance);

  const isInternalChangeRef = React.useRef(false);

  // Hand the resolved defaults to the parent once on mount when it has no state of its own:
  // until 2026-09-28 the combat tab computed with `switchboardState === null` (no chems, no
  // bobblehead, 20 % HP) until the first Biometrics interaction pushed the whole default board.
  const pushedInitialRef = React.useRef(false);
  React.useEffect(() => {
    if (pushedInitialRef.current || initialState) return;
    pushedInitialRef.current = true;
    isInternalChangeRef.current = true;
    onStateChangeRef.current?.(switchboard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            const nextHitLocation: CombatHitLocation =
              initialState.combatStance?.hitLocation ??
              (initialState.combatStance?.isTargetingWeakSpot === true ? "weakSpot" : prev.combatStance?.hitLocation ?? "body");
            const nextStance: CombatStanceState = {
              isSneaking: initialState.combatStance?.isSneaking ?? prev.combatStance?.isSneaking ?? false,
              isCrouched: initialState.combatStance?.isCrouched ?? prev.combatStance?.isCrouched ?? false,
              isSprinting: initialState.combatStance?.isSprinting ?? prev.combatStance?.isSprinting ?? false,
              isAiming: initialState.combatStance?.isAiming ?? prev.combatStance?.isAiming ?? false,
              isPowerAttacking: initialState.combatStance?.isPowerAttacking ?? prev.combatStance?.isPowerAttacking ?? false,
              isStationary: initialState.combatStance?.isStationary ?? prev.combatStance?.isStationary ?? false,
              isInVats: initialState.combatStance?.isInVats ?? prev.combatStance?.isInVats ?? false,
              vatsCritEveryOtherShot: initialState.combatStance?.vatsCritEveryOtherShot ?? prev.combatStance?.vatsCritEveryOtherShot ?? false,
              isTargetingWeakSpot: nextHitLocation === "weakSpot",
              hitLocation: nextHitLocation,
              targetRange: initialState.combatStance?.targetRange ?? prev.combatStance?.targetRange ?? "mid",
              isSpendingGlow: initialState.combatStance?.isSpendingGlow ?? prev.combatStance?.isSpendingGlow ?? false,
              wasHitRecently: initialState.combatStance?.wasHitRecently ?? prev.combatStance?.wasHitRecently ?? false,
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

  const updateStance = <K extends keyof CombatStanceState>(key: K, val: CombatStanceState[K]) => {
    if (readOnly) return;
    const curr: CombatStanceState = switchboard.combatStance || {
      isSneaking: false,
      isCrouched: false,
      isSprinting: false,
      isAiming: false,
      isPowerAttacking: false,
      isStationary: false,
      isInVats: false,
      vatsCritEveryOtherShot: false,
      hitLocation: "body",
      targetRange: "mid",
    };
    const nextStance: CombatStanceState = { ...curr, [key]: val };
    const flag = Boolean(val);
    if (key === "isCrouched") {
      nextStance.isSneaking = flag;
    } else if (key === "isSneaking") {
      nextStance.isCrouched = flag;
    }
    if (key === "isSprinting" && flag) {
      nextStance.isStationary = false;
    }
    if (key === "isStationary" && flag) {
      nextStance.isSprinting = false;
    }
    if (key === "isInVats") {
      if (flag) {
        nextStance.isAiming = false;
      } else {
        nextStance.vatsCritEveryOtherShot = false;
      }
    }
    if (key === "isAiming") {
      if (flag) {
        nextStance.isInVats = false;
        nextStance.vatsCritEveryOtherShot = false;
      }
    }
    if (key === "vatsCritEveryOtherShot") {
      if (flag) {
        nextStance.isInVats = true;
        nextStance.isAiming = false;
      }
    }
    // The boolean stays a derived alias of the hit location for one release (saved-state compatibility).
    nextStance.isTargetingWeakSpot = nextStance.hitLocation === "weakSpot";
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

  // Damage-taken preview (Patch 66 order of operations): armor curve on the
  // build's DR (ballistic / explosion) or ER (energy), then every applicable
  // reducer multiplied together. The player is not a boss, so no flat reduction.
  const incomingDamage = switchboard.incomingDamage ?? 100;
  const incomingDamageType: IncomingDamageType = switchboard.incomingDamageType ?? "ballistic";
  const damageTaken = React.useMemo(() => {
    if (!defensiveProfile) return null;
    const resist = incomingDamageType === "energy" ? playerResists?.er ?? 0 : playerResists?.dr ?? 0;
    return {
      resist,
      ...calculateDamageTaken(incomingDamage, resist, 0, defensiveProfile.reducers, incomingDamageType),
    };
  }, [defensiveProfile, incomingDamage, incomingDamageType, playerResists?.dr, playerResists?.er]);

  const currentFeralPct = switchboard.feralPct || 0;
  const currentFeralStage = FERAL_STAGES.find((s) => currentFeralPct >= s.min && currentFeralPct <= s.max) || FERAL_STAGES[0];

  const eligibleFoods = isHerbivore ? ALL_PLANT_FOODS : isCarnivore ? ALL_MEAT_FOODS : [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS];
  const pickerItems: ScopedPickerItem[] =
    picker === "mutation"
      ? SANDBOX_MUTATIONS.filter((m) => !activeMutations.includes(m.id)).map((m) => ({
          id: m.id,
          label: m.label,
          description: formatMutationMath(m),
        }))
      : picker === "food"
        ? eligibleFoods.map((f) => ({ id: f.id, label: f.label, description: f.description, badge: f.foodBuffType }))
        : picker
          ? (CONSUMABLE_SLOTS.find((sl) => sl.field === picker)?.items ?? []).map((i) => ({
              id: i.id,
              label: i.label,
              description: i.description,
            }))
          : [];
  const pickerActiveIds = new Set<string>(
    picker === "food"
      ? Object.values(switchboard.activeFoods || {})
      : picker && picker !== "mutation" && switchboard[picker]
        ? [switchboard[picker] as string]
        : [],
  );

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-slate-950/95 p-4 font-mono text-slate-100 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4">
      {readOnly && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-2.5 text-xs font-mono text-amber-300 flex items-center justify-between">
          <span className="font-bold tracking-wider uppercase">&gt;&gt; SPECTATOR VIEW · READ-ONLY BIOMETRICS &amp; COMBAT STANCES</span>
          <span className="text-2xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200">
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

        <div className="flex items-center gap-1.5 text-2xs">
          <button
            type="button"
            onClick={() => setAllGroups(true)}
            className="min-h-7 touch:min-h-11 px-2.5 rounded font-bold uppercase bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setAllGroups(false)}
            className="min-h-7 touch:min-h-11 px-2.5 rounded font-bold uppercase bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Sticky live totals: what every switch below is changing */}
      {statsBand && (
        <div
          role="group"
          aria-label="Live totals"
          className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-slate-950/95 backdrop-blur border-b border-emerald-500/20 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-2xs font-mono"
        >
          {BUILDER_SPECIAL_KEYS.map((k) => (
            <FlashStat key={k} label={k.toUpperCase()} value={statsBand.special[k]} />
          ))}
          <span className="mx-1 h-4 w-px bg-slate-800" aria-hidden="true" />
          <FlashStat label="DR" value={statsBand.dr} />
          <FlashStat label="ER" value={statsBand.er} />
          <FlashStat label="RR" value={statsBand.rr} />
          {statsBand.maxHp !== undefined && statsBand.maxAp !== undefined && statsBand.carryWeight !== undefined && (
            <>
              <span className="mx-1 h-4 w-px bg-slate-800" aria-hidden="true" />
              <FlashStat label="HP" value={statsBand.maxHp} />
              <FlashStat label="AP" value={statsBand.maxAp} />
              <FlashStat label="CARRY" value={statsBand.carryWeight} />
            </>
          )}
        </div>
      )}

      {/* STATE GROUPS (species row first, then one collapsible group per concern) */}
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
                aria-pressed={armorModeIsPA ?? switchboard.inPowerArmor}
                onClick={() => {
                  const nextPA = !(armorModeIsPA ?? switchboard.inPowerArmor);
                  if (onArmorModeChange) {
                    onArmorModeChange(nextPA);
                  } else {
                    updateField("inPowerArmor", nextPA);
                  }
                }}
                className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  (armorModeIsPA ?? switchboard.inPowerArmor)
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                    : "bg-slate-800 text-slate-200 border-slate-700"
                }`}
              >
                {(armorModeIsPA ?? switchboard.inPowerArmor) ? "🦾 POWER ARMOR" : "🛡️ REGULAR ARMOR"}
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

          <StateGroup
            id="vitals"
            title="Vitals"
            icon={<Heart className="h-3.5 w-3.5" />}
            summary={`HP ${switchboard.healthPct}% · ${isGhoul ? `Glow ${switchboard.glowPct || 0}%` : `Rads ${switchboard.radsPct || 0}%`} · ${currentTeamDef.label}${switchboard.isDiseased ? " · Diseased" : ""}`}
            open={openGroups.has("vitals")}
            onToggle={() => toggleGroup("vitals")}
          >
          {/* DUAL-LAYER PIP-BOY BIOMETRIC TELEMETRY GRAPHIC */}
          {isGhoul ? (
            <div className="rounded-lg border border-lime-500/40 bg-slate-950 p-3 space-y-2 font-mono">
              {(() => {
                const bars = vitalsBarModel({ isGhoul: true, healthPct: switchboard.healthPct, glowPct: switchboard.glowPct });
                if (bars.kind !== "ghoul") return null;
                return (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-lime-400 font-bold uppercase flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-lime-400 animate-pulse" />
                        <span>[ BIOMETRIC TELEMETRY: GLOW OVERSHIELD OVER HP ]</span>
                      </span>
                      <span className="text-2xs text-slate-400">
                        Glow: <span className="text-lime-300 font-bold">{bars.glowPct}%</span> · HP: <span className="text-rose-400 font-bold">{bars.hpPct}%</span>
                      </span>
                    </div>

                    {/* Two bars: the overshield is a pool on top of health, not a cap on it. */}
                    <div className="space-y-1.5">
                      <div
                        role="meter"
                        aria-label="Glow overshield"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={bars.glowPct}
                        className="relative h-5 w-full rounded bg-slate-900 border border-lime-700/50 overflow-hidden shadow-inner"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-lime-500 via-emerald-400 to-lime-300 transition-all duration-300 shadow-[0_0_15px_rgba(132,204,22,0.6)]"
                          style={{ width: `${bars.glowPct}%` }}
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-3xs font-black text-slate-950 mix-blend-plus-lighter tracking-widest drop-shadow">
                          GLOW {bars.glowPct}%
                        </span>
                      </div>
                      <div
                        role="meter"
                        aria-label="Health"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={bars.hpPct}
                        className="relative h-5 w-full rounded bg-slate-900 border border-slate-700 overflow-hidden shadow-inner"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300"
                          style={{ width: `${bars.hpPct}%` }}
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-3xs font-black text-white tracking-widest drop-shadow">
                          HP {bars.hpPct}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-2xs text-slate-400 pt-0.5 gap-2">
                      <span>🛡️ GHOUL RAD CONVERSION: radiation taken or consumed becomes Glow, a separate pool absorbed before HP.</span>
                      <span className="text-lime-400 font-bold">OVERSHIELD: {bars.glowPct}% ACTIVE</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/40 bg-slate-950 p-3 space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span>[ BIOMETRIC TELEMETRY: HP &amp; RADIATION CAP ]</span>
                </span>
                <span className="text-2xs text-slate-400">
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
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xs font-black text-white tracking-widest drop-shadow">
                    HP {switchboard.healthPct}%
                  </span>
                </div>

                {/* Radiation Capped Section */}
                {(switchboard.radsPct || 0) > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500 border-l border-amber-300 ml-auto transition-all duration-300 relative"
                    style={{ width: `${switchboard.radsPct || 0}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-3xs font-black text-slate-950 tracking-wider">
                      RADS {switchboard.radsPct}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-2xs text-slate-400 pt-0.5 gap-2">
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
                  aria-label="Current health percent"
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={switchboard.healthPct}
                  onChange={(e) => updateField("healthPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
              <div className="flex items-center justify-between text-2xs pt-1">
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
                <div className="flex items-center justify-between text-2xs pt-0.5">
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
                  <span className="text-2xs text-dim italic">Damage absorbed by shield</span>
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
                  aria-label="Radiation saturation percent"
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={switchboard.radsPct || 0}
                  onChange={(e) => updateField("radsPct", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex items-center justify-between text-2xs pt-0.5">
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
                  <span className="text-2xs text-dim">Rads cap max usable HP pool</span>
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
                      className={`px-1 py-1 rounded text-2xs font-bold uppercase transition-all truncate border cursor-pointer ${
                        currentFeralStage.id === st.id
                          ? "bg-lime-500 text-slate-950 border-lime-400 font-black shadow-[0_0_8px_rgba(132,204,22,0.4)]"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st.id === "apex" ? "👹 Feral (0%)" : st.id === "frenzied" ? "🐺 Frenzy" : st.id === "agitated" ? "⚡ Steady" : "🧠 Lucid (100%)"}
                    </button>
                  ))}
                </div>

                <div className="text-2xs text-lime-300/90 bg-lime-950/40 border border-lime-500/20 rounded p-1.5 space-y-0.5">
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
                    aria-label="Previous food level"
                    className="p-1 hover:text-white text-dim transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-black text-white uppercase">{currentFoodDef.label}</span>
                  <button
                    type="button"
                    onClick={() => stepFood(1)}
                    aria-label="Next food level"
                    className="p-1 hover:text-white text-dim transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-2xs text-slate-400">{currentFoodDef.desc}</p>
              </div>
            )}

            {/* Feral Dynamics Telemetry (Ghouls) vs Thirst Hydration (Humans) */}
            {isGhoul ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between border-b border-slate-800 pb-1">
                  <span>[ 🧬 GHOUL DYNAMICS &amp; BUFF INGESTION ]</span>
                  <span className="text-3xs text-slate-400 uppercase">Survival Bypassed</span>
                </div>

                <div className="space-y-1.5 text-2xs">
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
                    aria-label="Previous thirst level"
                    className="p-1 hover:text-white text-dim transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-black text-white uppercase">{currentThirstDef.label}</span>
                  <button
                    type="button"
                    onClick={() => stepThirst(1)}
                    aria-label="Next thirst level"
                    className="p-1 hover:text-white text-dim transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-2xs text-slate-400">{currentThirstDef.desc}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateField("foodState", "fully_fed");
                      updateField("thirstState", "fully_hydrated");
                    }}
                    className="flex-1 py-1 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-2xs font-bold uppercase hover:bg-emerald-900/50 transition-colors cursor-pointer text-center truncate"
                    title="Set Hunger & Thirst to 100% (Overeater's: +40 Max HP per piece since Patch 66; Gourmand's +24% damage)"
                  >
                    🍖💧 Max Overeater&apos;s
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("foodState", "starving");
                      updateField("thirstState", "parched");
                    }}
                    className="px-2 py-1 rounded border border-rose-500/30 bg-rose-950/30 text-rose-400 text-2xs font-bold uppercase hover:bg-rose-900/40 transition-colors cursor-pointer"
                    title="Set to Starving & Parched"
                  >
                    ⚠️ Depleted
                  </button>
                </div>
              </div>
            )}

            {/* Disease switch: sits beside Food / Thirst; Iron Stomach, Natural Resistance and Thirst Quencher read it */}
            <label className="md:col-span-2 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 min-h-9 touch:min-h-11 cursor-pointer text-2xs">
              <input
                type="checkbox"
                checked={Boolean(switchboard.isDiseased)}
                onChange={(e) => updateField("isDiseased", e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-bold uppercase text-rose-300">Diseased</span>
              <span className="text-dim">Iron Stomach, Natural Resistance and Thirst Quencher switch off while diseased</span>
            </label>

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
                  aria-label="Smaller team"
                  className="p-1 hover:text-white text-dim transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black text-white uppercase">{currentTeamDef.label}</span>
                <button
                  type="button"
                  onClick={() => stepTeam(1)}
                  aria-label="Larger team"
                  className="p-1 hover:text-white text-dim transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between text-2xs text-slate-400 pt-0.5 gap-2">
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
                {isGhoul && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-lime-400 font-bold">
                    <input
                      type="checkbox"
                      checked={Boolean(switchboard.hasGhoulTeammate)}
                      onChange={(e) => updateField("hasGhoulTeammate", e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-lime-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Another Ghoul on the team (United Ordeal)</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          </StateGroup>

          <StateGroup
            id="stances"
            title="Stances & V.A.T.S."
            icon={<Target className="h-3.5 w-3.5" />}
            summary={[
              switchboard.combatStance?.isCrouched ? "Stealthed" : "Upright",
              switchboard.combatStance?.isInVats ? "In V.A.T.S." : switchboard.combatStance?.isAiming ? "Aiming" : "Hip fire",
              hitLocation === "weakSpot" ? "Weak spot" : hitLocation === "torso" ? "Torso" : null,
              targetRange === "close" ? "Close range" : targetRange === "far" ? "Far range" : null,
              isGhoul && switchboard.combatStance?.isSpendingGlow ? "Spending Glow" : null,
              isGhoul && switchboard.combatStance?.wasHitRecently ? "Hit recently" : null,
            ].filter(Boolean).join(" · ")}
            open={openGroups.has("stances")}
            onToggle={() => toggleGroup("stances")}
          >
          {/* Combat Stances & V.A.T.S. Matrix */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Tactical Combat Stances &amp; V.A.T.S.
              </span>
              <span className="text-2xs text-slate-400 font-normal">
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
              <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
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
                  <span className="text-3xs font-normal text-dim">
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
                  <span className="text-3xs font-normal text-dim">
                    {switchboard.combatStance?.isSprinting ? "Cavalier's (-10% damage taken)" : "Standard Speed"}
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
                  <span className="text-3xs font-normal text-dim">
                    {switchboard.combatStance?.isStationary ? "Sentinel's -5% taken · Steady +25%" : "Dynamic Movement"}
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
                  <span className="text-3xs font-normal text-dim">
                    {switchboard.combatStance?.isPowerAttacking ? "+40% Heavy Hitter's" : "Base Attack Cost"}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 1b: Ghoul Glow economy (combat-conditions.json `glow`), ghouls only */}
            {isGhoul && (
              <div className="space-y-1">
                <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between gap-2">
                  <span>☢ Glow economy</span>
                  <span className="text-3xs text-dim lowercase font-normal text-right">
                    glow {switchboard.glowPct || 0}% · high from {GLOW_HIGH_THRESHOLD_PCT}% (Glowing Criticals)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Spending Glow: Mad Scientist, Radiation Power, Radioactive Strength */}
                  <button
                    type="button"
                    aria-pressed={Boolean(switchboard.combatStance?.isSpendingGlow)}
                    onClick={() => updateStance("isSpendingGlow", !switchboard.combatStance?.isSpendingGlow)}
                    className={`p-2 touch:min-h-11 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                      switchboard.combatStance?.isSpendingGlow
                        ? "bg-lime-950 border-lime-500 text-lime-300 shadow-[0_0_10px_rgba(132,204,22,0.3)] font-black"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>☢ Spending Glow</span>
                    <span className="text-3xs font-normal text-dim">
                      {switchboard.combatStance?.isSpendingGlow
                        ? "Mad Scientist · Radiation Power · Radioactive Strength"
                        : "Holding Glow: cards that expend it are idle"}
                    </span>
                  </button>

                  {/* Hit in the last 10 s: Science Monster */}
                  <button
                    type="button"
                    aria-pressed={Boolean(switchboard.combatStance?.wasHitRecently)}
                    onClick={() => updateStance("wasHitRecently", !switchboard.combatStance?.wasHitRecently)}
                    className={`p-2 touch:min-h-11 rounded border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                      switchboard.combatStance?.wasHitRecently
                        ? "bg-lime-950 border-lime-500 text-lime-300 shadow-[0_0_10px_rgba(132,204,22,0.3)] font-black"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>💢 Hit in last 10 s</span>
                    <span className="text-3xs font-normal text-dim">
                      {switchboard.combatStance?.wasHitRecently ? "Science Monster (needs Glow above 0)" : "Science Monster idle"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Row 2: Targeting & V.A.T.S. Fire Control */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Targeting &amp; V.A.T.S. Critical Loop</span>
                <span className="text-3xs text-dim lowercase">vats suppresses ads bonuses</span>
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
                  <span className="text-3xs font-normal text-dim">
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
                  <span className="text-3xs font-normal text-dim">
                    {switchboard.combatStance?.isInVats ? "Target Lock · 95% Cap · AP Cost" : "Free Targeting (VATS Off)"}
                  </span>
                </button>

                {/* 2b. Hit location: body / torso / weak spot (Center Masochist, body-part multiplier) */}
                <div className="p-2.5 rounded border border-slate-800 bg-slate-950 flex flex-col items-center gap-1.5 text-center">
                  <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <span className="text-rose-400">🎯</span> Hit location
                  </span>
                  <div role="group" aria-label="Hit location" className="flex w-full gap-1">
                    {HIT_LOCATION_OPTIONS.map((opt) => {
                      const active = hitLocation === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => updateStance("hitLocation", opt.id)}
                          className={`flex-1 touch:min-h-11 rounded border px-1.5 py-1.5 text-2xs font-bold uppercase transition-all cursor-pointer ${
                            active
                              ? "bg-rose-950 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.35)] font-black"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-3xs font-normal text-dim">
                    {hitLocation === "weakSpot"
                      ? weakSpot?.baseMultiplier
                        ? `${weakSpot.part} ×${weakSpot.baseMultiplier}${weakSpot.bonusPct > 0 ? ` +${Math.round(weakSpot.bonusPct * 100)}% perks` : ""} = ×${weakSpot.multiplier.toFixed(2)}`
                        : "No multiplier data for this target"
                      : hitLocation === "torso"
                        ? "Center Masochist · body-part ×1.00"
                        : "Body shots (×1.00)"}
                  </span>
                </div>

                {/* 2c. Target range: close / mid / far (Guerrilla, Guerrilla Master, Down Ranger) */}
                <div className="p-2.5 rounded border border-slate-800 bg-slate-950 flex flex-col items-center gap-1.5 text-center">
                  <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <span className="text-sky-400">📏</span> Target range
                  </span>
                  <div role="group" aria-label="Target range" className="flex w-full gap-1">
                    {TARGET_RANGE_OPTIONS.map((opt) => {
                      const active = targetRange === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => updateStance("targetRange", opt.id)}
                          className={`flex-1 touch:min-h-11 rounded border px-1.5 py-1.5 text-2xs font-bold uppercase transition-all cursor-pointer ${
                            active
                              ? "bg-sky-950 border-sky-500 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.35)] font-black"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-3xs font-normal text-dim">
                    {targetRange === "close"
                      ? "Guerrilla · Guerrilla Master"
                      : targetRange === "far"
                        ? "Down Ranger"
                        : "No range perk (Guerrilla close · Down Ranger far)"}
                  </span>
                </div>

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
                      <span className="text-3xs px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black">
                        ⚡ QUALIFIED
                      </span>
                    ) : (
                      <span className="text-3xs px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        🔒 NEED +{critQualification?.missingLuck ?? "?"} LCK
                      </span>
                    )}
                  </div>
                  <span className="text-3xs font-normal text-slate-400">
                    {switchboard.combatStance?.vatsCritEveryOtherShot
                      ? "1 Normal ➔ 1 Crit Alternating Loop"
                      : `Req: ${critQualification?.requiredLuck ?? 33} Luck (Build has ${critQualification?.currentLuck ?? 0})`}
                  </span>
                </button>
              </div>

              {/* V.A.T.S. & Luck Chart Telemetry Card */}
              {critQualification && (
                <div className="rounded border border-emerald-500/20 bg-slate-950/80 p-2.5 text-2xs font-mono space-y-1.5">
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
                      <span className="text-dim">Current Luck:</span>{" "}
                      <span className="text-white font-bold">{critQualification.currentLuck}</span>
                    </div>
                    <div>
                      <span className="text-dim">1:1 Req Luck:</span>{" "}
                      <span className="text-amber-300 font-bold">{critQualification.requiredLuck}</span>
                    </div>
                    <div>
                      <span className="text-dim">Crit Savvy:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {critQualification.critSavvyRank > 0 ? `Rank ${critQualification.critSavvyRank} (${critQualification.fillCostPct}% cost)` : "None (100% cost)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-dim">Fill Per Shot:</span>{" "}
                      <span className="text-cyan-300 font-bold">{critQualification.fillPerShotPct}% / shot</span>
                    </div>
                  </div>
                  <div className="text-3xs text-slate-400 pt-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>💡 {critQualification.recommendation}</span>
                    <span className="text-dim shrink-0">
                      3★ Lucky: {critQualification.hasLucky15Fill ? "Active (-10 Luck)" : "Off"} · VATS Opt: {critQualification.hasVatsOptimized ? "Active (-35% AP)" : "Off"}
                      {weakSpot?.targeting
                        ? ` · Weak spot: ×${weakSpot.multiplier.toFixed(2)}${weakSpot.breakdown.length > 0 ? ` (${weakSpot.breakdown.map((b) => `${b.source} ${b.value}`).join(", ")})` : ""}`
                        : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Active Tactical Telemetry Banner */}
            <div className="rounded border border-emerald-500/30 bg-slate-950 p-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-slate-400 font-bold uppercase text-2xs shrink-0">Tactical Triggers:</span>
                <span className="text-emerald-300 font-black text-2xs truncate">
                  {activeTacticalTags && activeTacticalTags.length > 0
                    ? activeTacticalTags.join(" · ")
                    : switchboard.combatStance?.isCrouched
                    ? "Crouched / Stealthed (Sneak Attack 2.0×–2.5× · Nocturnal/Chameleon Ready)"
                    : "Standard Upright Combat (No Stance Buffs Active)"}
                </span>
              </div>
              <span className="text-3xs text-dim uppercase shrink-0 text-right">
                Live Game Mechanics Active
              </span>
            </div>
          </div>

          </StateGroup>

          <StateGroup
            id="damage"
            title="Damage taken"
            icon={<Shield className="h-3.5 w-3.5" />}
            summary={defensiveProfile ? `${incomingDamage} ${incomingDamageType} incoming` : "Needs a perk deck"}
            open={openGroups.has("damage")}
            onToggle={() => toggleGroup("damage")}
          >
          {/* Damage taken preview (armor curve first, then multiplicative reducers) */}
          {defensiveProfile && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-sky-400" /> Damage taken
                </span>
                <span className="text-3xs text-dim normal-case font-normal text-right">
                  Armor curve first, then reducers multiply (Patch 66)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <label className="flex flex-col gap-1 text-2xs text-slate-400">
                  <span>Incoming hit</span>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={incomingDamage}
                    onChange={(e) => updateField("incomingDamage", Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-sky-500 outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-2xs text-slate-400">
                  <span>Incoming damage type</span>
                  <select
                    value={incomingDamageType}
                    onChange={(e) => updateField("incomingDamageType", e.target.value as IncomingDamageType)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-sky-500 outline-none cursor-pointer"
                  >
                    <option value="ballistic">Ballistic</option>
                    <option value="energy">Energy</option>
                    <option value="explosion">Explosion</option>
                  </select>
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono flex items-baseline justify-between gap-2">
                  <span className="text-dim">Taken</span>
                  <span>
                    <span className="text-sky-300 font-black text-base">{damageTaken ? Math.round(damageTaken.delivered) : "—"}</span>
                    <span className="text-dim"> / {incomingDamage}</span>
                  </span>
                </div>
              </div>
              {damageTaken && (
                <div className="text-2xs text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>
                    Curve vs {damageTaken.resist} {incomingDamageType === "energy" ? "ER" : "DR"}: {damageTaken.afterCurve.toFixed(1)} ({damageTaken.damageCoefficientPct}%)
                  </span>
                  <span className="text-emerald-300">
                    Evade {defensiveProfile.evadeChance}% · Deflect {defensiveProfile.deflectChance}%
                  </span>
                  {damageTaken.appliedReducers.length > 0 ? (
                    <span>
                      Reducers ×{(1 - damageTaken.totalReducerPct / 100).toFixed(3)}:{" "}
                      {damageTaken.appliedReducers.map((r) => `${r.label} −${r.pct}%`).join(" · ")}
                    </span>
                  ) : (
                    <span>No reducers apply to this hit</span>
                  )}
                </div>
              )}
              {switchboard.inPowerArmor && (
                <label className="flex items-center gap-1.5 text-2xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(switchboard.powerArmorInnatePct ?? 0) > 0}
                    onChange={(e) => updateField("powerArmorInnatePct", e.target.checked ? 7 : 0)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Assume 7% innate Power Armor reduction per piece (unverified, off by default)</span>
                </label>
              )}
            </div>
          )}

          </StateGroup>

          <StateGroup
            id="stacks"
            title="Stacks & counters"
            icon={<Skull className="h-3.5 w-3.5" />}
            summary={`Bullet Storm ${switchboard.bulletStormStacks || 0} · Onslaught ${switchboard.onslaughtStacks || 0} · Caps ${switchboard.caps ?? 0}`}
            open={openGroups.has("stacks")}
            onToggle={() => toggleGroup("stacks")}
          >
          {/* Dynamic Counters, Stacks & Aristocrat's Caps Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Bullet Storm Stacks */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Bullet Storm:</span>
                <span className="text-cyan-400">{switchboard.bulletStormStacks || 0} / 20</span>
              </div>
              <input
                aria-label="Bullet Storm stacks"
                type="range"
                min="0"
                max="20"
                step="1"
                value={switchboard.bulletStormStacks || 0}
                onChange={(e) => updateField("bulletStormStacks", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="text-2xs text-dim">
                Heavy Gun bonus (3%–9%/stack; min 5 with Resolute Veteran)
              </div>
            </div>

            {/* Onslaught Stacks */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Onslaught:</span>
                <span className="text-orange-400">{switchboard.onslaughtStacks || 0} / 30</span>
              </div>
              <input
                aria-label="Onslaught stacks"
                type="range"
                min="0"
                max="30"
                step="1"
                value={switchboard.onslaughtStacks || 0}
                onChange={(e) => updateField("onslaughtStacks", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="text-2xs text-dim">
                +{(switchboard.onslaughtStacks || 0) * 5}% Damage (+5% per stack)
              </div>
            </div>

            {/* Tenderizer Stacks */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Tenderizer:</span>
                <span className="text-rose-400">{switchboard.tenderizerStacks || 0} / 100 hits</span>
              </div>
              <input
                aria-label="Tenderizer stacks"
                type="range"
                min="0"
                max="100"
                step="5"
                value={switchboard.tenderizerStacks || 0}
                onChange={(e) => updateField("tenderizerStacks", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="text-2xs text-dim">
                +{((switchboard.tenderizerStacks || 0) * 0.1).toFixed(1)}% Damage Taken (+0.1%/hit)
              </div>
            </div>

            {/* Adrenaline Stacks */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Adrenaline Kill Streak:</span>
                <span className="text-amber-400">{switchboard.adrenalineStacks || 0} / 6</span>
              </div>
              <input
                aria-label="Adrenaline kill streak"
                type="range"
                min="0"
                max="6"
                step="1"
                value={switchboard.adrenalineStacks || 0}
                onChange={(e) => updateField("adrenalineStacks", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="text-2xs text-dim">
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
                aria-label="Addictions count"
                type="range"
                min="0"
                max="5"
                step="1"
                value={switchboard.addictionsCount || 0}
                onChange={(e) => updateField("addictionsCount", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="text-2xs text-dim">
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
                aria-label="Caps carried"
                type="range"
                min="0"
                max="40000"
                step="1000"
                value={switchboard.caps ?? 30000}
                onChange={(e) => updateField("caps", parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="text-2xs text-dim">
                {(switchboard.caps ?? 30000) >= 29000 ? "✅ Max +50% Aristocrat's Bonus" : "Scaled Aristocrat's Bonus"}
              </div>
            </div>
          </div>

          </StateGroup>

          <StateGroup
            id="impairments"
            title="Target impairments"
            icon={<Target className="h-3.5 w-3.5" />}
            summary={[
              switchboard.targetBleeding && "Bleeding",
              switchboard.targetBurning && "Burning",
              switchboard.targetPoisoned && "Poisoned",
              (switchboard.targetCrippledLimbs ?? 0) > 0 && `${switchboard.targetCrippledLimbs} crippled`,
              switchboard.targetIsGlowing && "Glowing",
              switchboard.targetIsInsect && "Insect",
            ].filter(Boolean).join(" · ") || "None"}
            open={openGroups.has("impairments")}
            onToggle={() => toggleGroup("impairments")}
          >
          {/* Target Impairments (Enemy Debuffs & Impairment Triggers) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
                <Target className="h-3.5 w-3.5 text-rose-400" />
                <span>Target Impairments (Enemy Debuffs)</span>
              </div>
              <span className="text-2xs text-dim font-mono">
                Triggers Severing, Pyromaniac&apos;s, Viper&apos;s, Bully&apos;s, Wound Salter, Deal Sealer, Easy Target, Tormentor, Shotgun Champ, Glow Sight, Exterminator
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Bleeding Target */}
              <label className={cn(
                "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-xs select-none",
                switchboard.targetBleeding
                  ? "border-rose-500/50 bg-rose-500/10 text-rose-300 font-semibold"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              )}>
                <input
                  type="checkbox"
                  checked={Boolean(switchboard.targetBleeding)}
                  onChange={(e) => updateField("targetBleeding", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <span>🩸 Bleeding</span>
              </label>

              {/* Burning Target */}
              <label className={cn(
                "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-xs select-none",
                switchboard.targetBurning
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              )}>
                <input
                  type="checkbox"
                  checked={Boolean(switchboard.targetBurning)}
                  onChange={(e) => updateField("targetBurning", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>🔥 Burning</span>
              </label>

              {/* Poisoned Target */}
              <label className={cn(
                "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-xs select-none",
                switchboard.targetPoisoned
                  ? "border-lime-500/50 bg-lime-500/10 text-lime-300 font-semibold"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              )}>
                <input
                  type="checkbox"
                  checked={Boolean(switchboard.targetPoisoned)}
                  onChange={(e) => updateField("targetPoisoned", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-lime-500 focus:ring-0 cursor-pointer"
                />
                <span>🧪 Poisoned</span>
              </label>

              {/* Glowing target (Glow Sight) */}
              <label className={cn(
                "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-xs select-none",
                switchboard.targetIsGlowing
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              )}>
                <input
                  type="checkbox"
                  checked={Boolean(switchboard.targetIsGlowing)}
                  onChange={(e) => updateField("targetIsGlowing", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>☢️ Glowing</span>
              </label>

              {/* Insect target (Exterminator) */}
              <label className={cn(
                "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-xs select-none",
                switchboard.targetIsInsect
                  ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300 font-semibold"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              )}>
                <input
                  type="checkbox"
                  checked={Boolean(switchboard.targetIsInsect)}
                  onChange={(e) => updateField("targetIsInsect", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-0 cursor-pointer"
                />
                <span>🐛 Insect</span>
              </label>

              {/* Crippled Limbs */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded border border-slate-800 bg-slate-950/60 text-xs">
                <span className="text-slate-400">🦴 Crippled:</span>
                <select
                  aria-label="Crippled limbs on the target"
                  value={switchboard.targetCrippledLimbs ?? 0}
                  onChange={(e) => updateField("targetCrippledLimbs", parseInt(e.target.value, 10))}
                  className="rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-xs text-slate-200 font-mono cursor-pointer"
                >
                  <option value={0}>0 Limbs</option>
                  <option value={1}>1 Limb</option>
                  <option value={2}>2 Limbs</option>
                  <option value={3}>3 Limbs</option>
                  <option value={4}>4 (All)</option>
                </select>
              </div>
            </div>
          </div>
          </StateGroup>

          <StateGroup
            id="mutations"
            title="Mutations"
            icon={<Dna className="h-3.5 w-3.5" />}
            summary={activeMutations.length > 0 ? `${activeMutations.length} active` : "None"}
            open={openGroups.has("mutations")}
            onToggle={() => toggleGroup("mutations")}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {activeMutations.map((id) => {
                const def = SANDBOX_MUTATIONS.find((m) => m.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded bg-slate-950 border border-lime-500/40 text-xs font-bold text-lime-300"
                  >
                    <span>{def?.label ?? id}</span>
                    <span className="text-3xs font-normal text-slate-400">{formatMutationMath(def)}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        aria-label={`Remove ${def?.label ?? id}`}
                        onClick={() => onMutationsChange?.(activeMutations.filter((m) => m !== id))}
                        className="flex min-h-6 min-w-6 touch:min-h-11 touch:min-w-11 items-center justify-center text-dim hover:text-rose-400"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </span>
                );
              })}
              {activeMutations.length === 0 && (
                <span className="text-2xs text-dim italic">
                  No mutations. Add the ones your character carries; serum and Strange in Numbers only matter once one is in.
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => openPicker("mutation")}
                  className="min-h-9 touch:min-h-11 px-3 rounded border border-lime-500/40 bg-lime-500/10 text-xs font-bold uppercase text-lime-300 hover:bg-lime-500/20"
                >
                  + Add mutation
                </button>
              )}
              <label className="flex items-center gap-1.5 text-2xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreMutationPenalties}
                  disabled={readOnly}
                  onChange={(e) => onIgnoreMutationPenaltiesChange?.(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-lime-500 focus:ring-0 cursor-pointer"
                />
                <span>Ignore penalties (serum-style, benefits only)</span>
              </label>
              <span className="text-2xs text-dim">
                Strange in Numbers: {hasStrangeInNumbers ? "+25% to positives" : "off"} (mutated teammates, under Vitals → Team)
              </span>
            </div>
          </StateGroup>

          <StateGroup
            id="consumables"
            title="Consumables & buffs"
            icon={<Utensils className="h-3.5 w-3.5" />}
            summary={`${CONSUMABLE_SLOTS.filter((sl) => switchboard[sl.field]).length} of ${CONSUMABLE_SLOTS.length} slots · ${Object.keys(switchboard.activeFoods || {}).length} foods`}
            open={openGroups.has("consumables")}
            onToggle={() => toggleGroup("consumables")}
          >
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-500/30 bg-slate-900/50 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-400 shrink-0" />
              <span><strong className="text-emerald-400 font-bold">Full Species Buff Compatibility:</strong> Both Humans and Ghouls benefit 100% from stacked food recipes, teas, chems, bobbleheads, magazines, and alcohol brews.</span>
            </span>
            <span className="text-2xs text-slate-400 uppercase font-mono">
              Species: <span className={isGhoul ? "text-lime-400 font-bold" : "text-emerald-400 font-bold"}>{isGhoul ? "☣️ PLAYABLE GHOUL" : "👤 HUMAN"}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONSUMABLE_SLOTS.map((slot) => {
              const current = slot.items.find((i) => i.id === switchboard[slot.field]) ?? null;
              return (
                <div key={slot.field} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    {slot.icon} {slot.label}
                  </div>
                  <div className={cn("text-xs font-bold truncate", current ? "text-slate-100" : "text-dim")}>
                    {current?.label ?? "None"}
                  </div>
                  <div className="text-2xs text-slate-400 truncate min-h-4">{current?.description ?? ""}</div>
                  {!readOnly && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => openPicker(slot.field)}
                        className="min-h-8 touch:min-h-11 px-2.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-2xs font-bold uppercase text-emerald-300 hover:bg-emerald-500/20"
                      >
                        {current ? "Change" : "Add"} {slot.label.toLowerCase()}
                      </button>
                      {current && (
                        <button
                          type="button"
                          aria-label={`Clear ${slot.label.toLowerCase()}`}
                          onClick={() => updateField(slot.field, null)}
                          className="min-h-8 touch:min-h-11 px-2.5 rounded border border-slate-700 text-2xs font-bold uppercase text-slate-300 hover:text-rose-300 hover:border-rose-500/40"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Food: stackable, one per buff type */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-emerald-400" /> Food buffs
              </div>
              <div className="text-xs font-bold text-slate-100">
                {Object.keys(switchboard.activeFoods || {}).length} stacked
              </div>
              <div className="text-2xs text-slate-400 truncate min-h-4">
                {isHerbivore ? "Herbivore: plant recipes only" : isCarnivore ? "Carnivore: meat recipes only" : "One recipe per buff type stacks"}
              </div>
              {!readOnly && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => openPicker("food")}
                    className="min-h-8 touch:min-h-11 px-2.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-2xs font-bold uppercase text-emerald-300 hover:bg-emerald-500/20"
                  >
                    + Add food
                  </button>
                </div>
              )}
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
                  className="text-2xs text-rose-400 hover:underline cursor-pointer"
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
                        className="text-dim hover:text-rose-400 cursor-pointer"
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
          </StateGroup>

          <StateGroup
            id="audit"
            title="Formula audit"
            icon={<Calculator className="h-3.5 w-3.5" />}
            summary="How the numbers above are put together"
            open={openGroups.has("audit")}
            onToggle={() => toggleGroup("audit")}
          >
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-3 text-xs font-mono">
          <div className="font-bold text-emerald-400 uppercase flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Calculator className="h-4 w-4" /> Live Calculation Formula &amp; Biometrics Audit
            </span>
            <span className="text-2xs text-slate-400 font-normal">
              Species: <span className={isGhoul ? "text-lime-300 font-bold" : "text-emerald-300 font-bold"}>{isGhoul ? "☣️ PLAYABLE GHOUL" : "👤 HUMAN"}</span>
            </span>
          </div>
          <div className="space-y-1.5 text-slate-300 text-2xs">
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
          </StateGroup>
        </div>

      <ScopedPickerDialog
        title={
          picker === "mutation"
            ? "Add mutation"
            : picker === "food"
              ? "Add food buff"
              : picker
                ? `Change ${CONSUMABLE_SLOTS.find((sl) => sl.field === picker)?.label.toLowerCase() ?? "item"}`
                : null
        }
        hint={
          picker === "mutation"
            ? "Benefits first, then penalties. Serum-style play hides the penalties with the toggle."
            : picker === "food"
              ? "One recipe per buff type; adding another of the same type replaces it."
              : undefined
        }
        items={pickerItems}
        activeIds={pickerActiveIds}
        onPick={(id) => {
          if (picker === "mutation") {
            onMutationsChange?.([...activeMutations, id]);
          } else if (picker === "food") {
            handleSelectFood(id);
          } else if (picker) {
            updateField(picker, id);
          }
        }}
        onClose={() => setPicker(null)}
        returnFocusRef={pickerOpenerRef}
        isCompactDensity={isCompactDensity}
      />
    </div>
  );
}
