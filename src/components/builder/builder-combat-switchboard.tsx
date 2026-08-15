"use client";

import * as React from "react";
import { Sliders, Utensils, Sparkles, Home, Pill, Dna, Book, Beer, Heart, Calculator, X } from "lucide-react";
import {
  ALL_BOBBLEHEADS,
  ALL_MAGAZINES,
  ALL_CHEMS,
  ALL_PLANT_FOODS,
  ALL_MEAT_FOODS,
  ALL_ALCOHOL,
  ALL_CAMP_APPLIANCES,
  ALL_COMPANIONS,
} from "@/lib/builder/all-fallout76-buffs";
import { SANDBOX_MUTATIONS } from "@/lib/builder/sandbox-mutations";
import { Switch } from "@/components/ui/switch";

export type CombatSwitchboardState = {
  healthPct: number;
  inPowerArmor: boolean;
  activeFood: string | null;
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

interface BuilderCombatSwitchboardProps {
  rawDamage: number;
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

  const [switchboard, setSwitchboard] = React.useState<CombatSwitchboardState>({
    healthPct: 100,
    inPowerArmor: false,
    activeFood: isHerbivore ? "plant-company-tea" : isCarnivore ? "meat-scorchbeast-brain" : null,
    activeDrug: "chem-psychotats",
    activeBobblehead: "bobble-small-guns",
    activeMagazine: "mag-gb3",
    activeAlcohol: "brew-ballistic-bock",
    activeNukaCola: "nuka-cranberry",
    activeCompanion: "comp-adelaide",
    activeCampBuffs: ["camp-phoropter", "camp-love-seat", "camp-mothman-tome", "camp-instrument"],
    targetEnemy: "superMutant",
  });

  const updateField = <K extends keyof CombatSwitchboardState>(key: K, val: CombatSwitchboardState[K]) => {
    setSwitchboard((prev) => {
      const next = { ...prev, [key]: val };
      onStateChange?.(next);
      return next;
    });
  };

  const toggleCampBuff = (id: string) => {
    const next = switchboard.activeCampBuffs.includes(id)
      ? switchboard.activeCampBuffs.filter((x) => x !== id)
      : [...switchboard.activeCampBuffs, id];
    updateField("activeCampBuffs", next);
  };

  // Effective Damage & XP Calculation
  const target = TARGET_ENEMIES[switchboard.targetEnemy] || TARGET_ENEMIES.superMutant;
  const baseDamage = rawDamage > 0 ? rawDamage : 85;
  let buffedDamage = baseDamage;

  // Apply Drug Buff
  const selectedChem = ALL_CHEMS.find((c) => c.id === switchboard.activeDrug);
  if (selectedChem?.damageMultiplier) buffedDamage *= selectedChem.damageMultiplier;

  // Apply Bobblehead
  const selectedBobble = ALL_BOBBLEHEADS.find((b) => b.id === switchboard.activeBobblehead);
  if (selectedBobble?.damageMultiplier) buffedDamage *= selectedBobble.damageMultiplier;

  // Apply Magazine
  const selectedMag = ALL_MAGAZINES.find((m) => m.id === switchboard.activeMagazine);
  if (selectedMag?.damageMultiplier) buffedDamage *= selectedMag.damageMultiplier;

  // Apply Alcohol
  const selectedAlcohol = ALL_ALCOHOL.find((a) => a.id === switchboard.activeAlcohol);
  if (selectedAlcohol?.damageMultiplier) buffedDamage *= selectedAlcohol.damageMultiplier;

  // Apply Companion
  const selectedComp = ALL_COMPANIONS.find((c) => c.id === switchboard.activeCompanion);
  if (selectedComp?.damageMultiplier) buffedDamage *= selectedComp.damageMultiplier;

  // Apply Health State
  let bloodiedMultiplier = 1.0;
  if (switchboard.healthPct <= 20) {
    bloodiedMultiplier = 1.80;
    buffedDamage *= bloodiedMultiplier;
  }

  // Apply Food Buff
  const allFoods = [...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS];
  const selectedFood = allFoods.find((f) => f.id === switchboard.activeFood);
  if (selectedFood) {
    const isMeatBlocked = selectedFood.category === "food_meat" && isHerbivore && !ignoreMutationPenalties;
    const isPlantBlocked = selectedFood.category === "food_plant" && isCarnivore && !ignoreMutationPenalties;

    if (!isMeatBlocked && !isPlantBlocked && selectedFood.damageMultiplier) {
      buffedDamage *= selectedFood.damageMultiplier;
    }
  }

  // FO76 Armor Reduction Factor = min(0.99, (Damage / EnemyDR)^0.366)
  const drRatio = buffedDamage / Math.max(1, target.dr);
  const armorMitigationFactor = Math.min(0.99, Math.pow(drRatio, 0.366));
  const postArmorDamage = buffedDamage * armorMitigationFactor;
  const finalEffectiveDamage = Math.max(1, Math.round(postArmorDamage * (1 - target.pctReduction)));

  return (
    <div className="pip-terminal-panel p-4 rounded-xl space-y-4 font-mono border border-amber-500/30 bg-slate-950/90 shadow-xl relative">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
          <Sliders className="h-4 w-4" />
          <span>⚡ ALL-INCLUSIVE VAULT-TEC BUFF & CONSUMABLE REGISTRY</span>
        </div>
        <div className="flex items-center gap-2">
          {ignoreMutationPenalties && (
            <span className="text-[0.65rem] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> SERUM SUPPRESSION ACTIVE
            </span>
          )}
          {isCarnivore && (
            <span className="text-[0.65rem] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-bold">
              🥩 CARNIVORE (2.5x MEAT)
            </span>
          )}
          {isHerbivore && (
            <span className="text-[0.65rem] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              🍵 HERBIVORE (2.5x TEAS)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
        {/* Column 1: Health State & Enemy Target */}
        <div className="space-y-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center justify-between">
            <span>Health State</span>
            <span className={switchboard.healthPct <= 20 ? "text-red-400 font-black" : "text-emerald-400"}>
              {switchboard.healthPct}% HP {switchboard.healthPct <= 20 ? "(BLOODIED)" : "(FULL)"}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={switchboard.healthPct}
            onChange={(e) => updateField("healthPct", Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
          />

          <label className="flex items-center gap-1.5 cursor-pointer pt-1 border-t border-slate-800">
            <input
              type="checkbox"
              checked={switchboard.inPowerArmor}
              onChange={(e) => updateField("inPowerArmor", e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-0 h-3 w-3"
            />
            <span className="text-[0.68rem] font-bold text-slate-200 uppercase">Power Armor (42% DR / 90% RR)</span>
          </label>

          <div className="pt-1.5 border-t border-slate-800">
            <div className="text-[0.68rem] uppercase font-bold text-slate-300 mb-1">Target Enemy Mitigation</div>
            <select
              className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-amber-400 font-bold focus:outline-none"
              value={switchboard.targetEnemy}
              onChange={(e) => updateField("targetEnemy", e.target.value)}
            >
              {Object.entries(TARGET_ENEMIES).map(([key, val]) => (
                <option key={key} value={key} className="bg-slate-950 text-slate-200">
                  {val.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column 2: Food & Steeped Teas */}
        <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1">
            <Utensils className="h-3 w-3" /> Food & Steeped Teas ({ALL_PLANT_FOODS.length + ALL_MEAT_FOODS.length})
          </div>
          <select
            className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 focus:outline-none"
            value={switchboard.activeFood ?? "none"}
            onChange={(e) => updateField("activeFood", e.target.value === "none" ? null : e.target.value)}
          >
            <option value="none" className="bg-slate-950 text-slate-400">-- None --</option>
            <optgroup label="🍵 Steeped Teas & Plant Foods (Herbivore)" className="bg-slate-950 text-emerald-400 font-bold">
              {ALL_PLANT_FOODS.map((f) => {
                const isBlocked = isCarnivore && !ignoreMutationPenalties;
                return (
                  <option key={f.id} value={f.id} disabled={isBlocked} className={isBlocked ? "bg-slate-950 text-slate-600 line-through" : "bg-slate-950 text-slate-200"}>
                    {f.label} ({f.description}) {isBlocked ? "[BLOCKED]" : ""}
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="🥩 Scorchbeast Organs & Meats (Carnivore)" className="bg-slate-950 text-red-400 font-bold">
              {ALL_MEAT_FOODS.map((f) => {
                const isBlocked = isHerbivore && !ignoreMutationPenalties;
                return (
                  <option key={f.id} value={f.id} disabled={isBlocked} className={isBlocked ? "bg-slate-950 text-slate-600 line-through" : "bg-slate-950 text-slate-200"}>
                    {f.label} ({f.description}) {isBlocked ? "[BLOCKED]" : ""}
                  </option>
                );
              })}
            </optgroup>
          </select>
          {switchboard.activeFood && (
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[0.62rem] text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <span className="text-base shrink-0">
                {isCarnivore ? "🥩" : isHerbivore ? "🍵" : "🍏"}
              </span>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 truncate">
                  {[...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS].find((f) => f.id === switchboard.activeFood)?.label}
                </div>
                <div className="text-[0.58rem] text-slate-400 truncate">
                  {[...ALL_PLANT_FOODS, ...ALL_MEAT_FOODS].find((f) => f.id === switchboard.activeFood)?.description}
                </div>
              </div>
            </div>
          )}

          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <Pill className="h-3 w-3" /> Chems ({ALL_CHEMS.length})
          </div>
          <select
            className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 focus:outline-none"
            value={switchboard.activeDrug ?? "none"}
            onChange={(e) => updateField("activeDrug", e.target.value === "none" ? null : e.target.value)}
          >
            <option value="none" className="bg-slate-950 text-slate-400">-- None --</option>
            {ALL_CHEMS.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                {c.label} ({c.description})
              </option>
            ))}
          </select>
          {switchboard.activeDrug && (
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[0.62rem] text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <span className="text-base shrink-0">🧪</span>
              <div className="min-w-0">
                <div className="font-bold text-cyan-300 truncate">
                  {ALL_CHEMS.find((c) => c.id === switchboard.activeDrug)?.label}
                </div>
                <div className="text-[0.58rem] text-slate-400 truncate">
                  {ALL_CHEMS.find((c) => c.id === switchboard.activeDrug)?.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Bobbleheads & Magazines */}
        <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Bobbleheads ({ALL_BOBBLEHEADS.length})
          </div>
          <select
            className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-amber-300 font-bold focus:outline-none"
            value={switchboard.activeBobblehead ?? "none"}
            onChange={(e) => updateField("activeBobblehead", e.target.value === "none" ? null : e.target.value)}
          >
            <option value="none" className="bg-slate-950 text-slate-400">-- None --</option>
            {ALL_BOBBLEHEADS.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-950 text-slate-200">
                {b.label} ({b.description})
              </option>
            ))}
          </select>
          {switchboard.activeBobblehead && (
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[0.62rem] text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <span className="text-base shrink-0">💥</span>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 truncate">
                  {ALL_BOBBLEHEADS.find((b) => b.id === switchboard.activeBobblehead)?.label}
                </div>
                <div className="text-[0.58rem] text-slate-400 truncate">
                  {ALL_BOBBLEHEADS.find((b) => b.id === switchboard.activeBobblehead)?.description}
                </div>
              </div>
            </div>
          )}

          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <Book className="h-3 w-3" /> Magazines ({ALL_MAGAZINES.length})
          </div>
          <select
            className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-cyan-300 font-bold focus:outline-none"
            value={switchboard.activeMagazine ?? "none"}
            onChange={(e) => updateField("activeMagazine", e.target.value === "none" ? null : e.target.value)}
          >
            <option value="none" className="bg-slate-950 text-slate-400">-- None --</option>
            {ALL_MAGAZINES.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-950 text-slate-200">
                {m.label} ({m.description})
              </option>
            ))}
          </select>
          {switchboard.activeMagazine && (
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[0.62rem] text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <span className="text-base shrink-0">📖</span>
              <div className="min-w-0">
                <div className="font-bold text-cyan-300 truncate">
                  {ALL_MAGAZINES.find((m) => m.id === switchboard.activeMagazine)?.label}
                </div>
                <div className="text-[0.58rem] text-slate-400 truncate">
                  {ALL_MAGAZINES.find((m) => m.id === switchboard.activeMagazine)?.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 4: Alcohol, Nuka-Cola & Companions */}
        <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1">
            <Beer className="h-3 w-3" /> Alcohol & Brews ({ALL_ALCOHOL.length})
          </div>
          <select
            className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-amber-400 font-bold focus:outline-none"
            value={switchboard.activeAlcohol ?? "none"}
            onChange={(e) => updateField("activeAlcohol", e.target.value === "none" ? null : e.target.value)}
          >
            <option value="none" className="bg-slate-950 text-slate-400">-- None --</option>
            {ALL_ALCOHOL.map((a) => (
              <option key={a.id} value={a.id} className="bg-slate-950 text-slate-200">
                {a.label} ({a.description})
              </option>
            ))}
          </select>
          {switchboard.activeAlcohol && (
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[0.62rem] text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <span className="text-base shrink-0">🍺</span>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 truncate">
                  {ALL_ALCOHOL.find((a) => a.id === switchboard.activeAlcohol)?.label}
                </div>
                <div className="text-[0.58rem] text-slate-400 truncate">
                  {ALL_ALCOHOL.find((a) => a.id === switchboard.activeAlcohol)?.description}
                </div>
              </div>
            </div>
          )}

          <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <Heart className="h-3 w-3" /> Companion Buffs ({ALL_COMPANIONS.length})
          </div>
          <select
            className="w-full text-[0.65rem] font-mono uppercase bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-pink-300 font-bold focus:outline-none"
            value={switchboard.activeCompanion ?? "none"}
            onChange={(e) => updateField("activeCompanion", e.target.value === "none" ? null : e.target.value)}
          >
            <option value="none" className="bg-slate-950 text-slate-400">-- None --</option>
            {ALL_COMPANIONS.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                {c.label} ({c.description})
              </option>
            ))}
          </select>
          {switchboard.activeCompanion && (
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[0.62rem] text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
              <span className="text-base shrink-0">🤖</span>
              <div className="min-w-0">
                <div className="font-bold text-pink-300 truncate">
                  {ALL_COMPANIONS.find((c) => c.id === switchboard.activeCompanion)?.label}
                </div>
                <div className="text-[0.58rem] text-slate-400 truncate">
                  {ALL_COMPANIONS.find((c) => c.id === switchboard.activeCompanion)?.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 5: CAMP Machines & Effective DPS Matrix */}
        <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[0.70rem] uppercase font-bold text-slate-300 flex items-center gap-1 mb-1">
              <Home className="h-3 w-3" /> CAMP Furniture ({ALL_CAMP_APPLIANCES.length})
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 bg-slate-950 p-1.5 rounded border border-slate-800">
              {ALL_CAMP_APPLIANCES.map((camp) => {
                const active = switchboard.activeCampBuffs.includes(camp.id);
                return (
                  <label key={camp.id} className="flex items-center gap-1.5 cursor-pointer text-[0.62rem]">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleCampBuff(camp.id)}
                      className="h-2.5 w-2.5 rounded text-amber-400"
                    />
                    <span className={active ? "text-amber-300 font-bold truncate" : "text-slate-400 truncate"}>
                      {camp.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-amber-500/40 text-center space-y-1">
            <div className="text-[0.60rem] uppercase text-slate-400 tracking-wider">Effective Damage Per Shot</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {finalEffectiveDamage} <span className="text-xs text-slate-400 font-normal">DMG / SHOT</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMathInspector((prev) => !prev)}
              className="text-[0.62rem] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all font-mono font-bold flex items-center gap-1 mx-auto"
            >
              <Calculator className="h-3 w-3" /> 🔍 Audit Formula Steps
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Mutation Serum Matrix */}
      <div className="pt-3 border-t border-amber-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
            <Dna className="h-4 w-4 text-emerald-400" />
            <span>[ 🧬 MUTATION SERUM MATRIX ] ({activeMutations.length} Active)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700">
              <span className="text-[0.68rem] font-bold text-slate-300 uppercase">Strange in Numbers (+25%)</span>
              <Switch
                checked={hasStrangeInNumbers}
                onCheckedChange={(checked) => onStrangeInNumbersChange?.(checked)}
                aria-label="Strange in Numbers"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700">
              <span className="text-[0.68rem] font-bold text-slate-300 uppercase">Ignore Serum Penalties</span>
              <Switch
                checked={ignoreMutationPenalties}
                onCheckedChange={(checked) => onIgnoreMutationPenaltiesChange?.(checked)}
                aria-label="Ignore mutation penalties"
              />
            </label>
          </div>
        </div>

        {/* Mutation Pills / Checkboxes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          {SANDBOX_MUTATIONS.map((m) => {
            const on = activeMutations.includes(m.id);
            return (
              <label
                key={m.id}
                className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-[0.68rem] font-mono border transition-all select-none ${
                  on
                    ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold shadow-sm"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => {
                    if (!onMutationsChange) return;
                    const next = on
                      ? activeMutations.filter((x) => x !== m.id)
                      : [...activeMutations, m.id];
                    onMutationsChange(next);
                  }}
                  className="h-3 w-3 shrink-0 accent-emerald-500 cursor-pointer"
                />
                <span className="truncate">{m.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* FORMULA AUDIT INSPECTOR MODAL (Integrity & Truth Principle) */}
      {showMathInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-widest">
                <Calculator className="h-4 w-4" />
                <span>🔍 FO76 LOGARITHMIC DAMAGE AUDIT STEPS</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMathInspector(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>1. Base Raw Weapon Damage:</span>
                <span className="font-bold text-amber-400">{baseDamage} DMG</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>2. Chem Multiplier ({selectedChem?.label || "None"}):</span>
                <span className="font-bold text-emerald-400">x{selectedChem?.damageMultiplier || 1.0}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>3. Bobblehead Multiplier ({selectedBobble?.label || "None"}):</span>
                <span className="font-bold text-emerald-400">x{selectedBobble?.damageMultiplier || 1.0}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>4. Magazine Multiplier ({selectedMag?.label || "None"}):</span>
                <span className="font-bold text-emerald-400">x{selectedMag?.damageMultiplier || 1.0}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>5. Companion Multiplier ({selectedComp?.label || "None"}):</span>
                <span className="font-bold text-emerald-400">x{selectedComp?.damageMultiplier || 1.0}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>6. Total Stacked Raw Damage:</span>
                <span className="font-bold text-amber-300">{Math.round(buffedDamage)} DMG</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-cyan-300">
                  <span>7. Armor Reduction Factor:</span>
                  <span>{(armorMitigationFactor * 100).toFixed(1)}%</span>
                </div>
                <div className="text-[0.62rem] text-slate-400 font-mono">
                  Formula: min(0.99, ({Math.round(buffedDamage)} / {target.dr})^0.366)
                </div>
              </div>
              <div className="flex justify-between p-2 bg-emerald-950/60 rounded border border-emerald-500/40 font-bold text-emerald-300 text-sm">
                <span>Final Output Damage Per Shot:</span>
                <span>{finalEffectiveDamage} DMG / SHOT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
