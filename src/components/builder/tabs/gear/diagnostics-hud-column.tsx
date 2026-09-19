"use client";

import * as React from "react";
import {
  Shield,
  Zap,
  Flame,
  Snowflake,
  Droplets,
  Radiation,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { OFFICIAL_SPECIAL_THEMES } from "@/lib/perks/special-theme";
import { triggerBuilderAchievement } from "@/actions/builder-achievements";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import {
  BUILDER_SPECIAL_KEYS,
  BUILDER_SPECIAL_LABELS,
  SPECIAL_FULL_NAMES,
  RESIST_FULL_NAMES,
  LEGENDARY_PERK_CARDS,
  type BuilderEffectTotals,
} from "@/lib/builder/compatibility";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_STYLES,
} from "@/lib/builder/underarmor";
import { sandboxLegendaryDescription } from "@/lib/builder/sandbox-mod-description";
import type { AggregatedBuffSpecial } from "@/lib/builder/buff-stacking-engine";
import type { UseBuilderTotalsResult } from "@/components/builder/hooks/use-builder-totals";

export interface DiagnosticsHudColumnProps {
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  totals: BuilderEffectTotals;
  buffSpecial: AggregatedBuffSpecial;
  stanceAndBiometricsLayer: UseBuilderTotalsResult["stanceAndBiometricsLayer"];
  intrinsicBenchTotals: BuilderEffectTotals;
  perkDeckDefensiveLayer: UseBuilderTotalsResult["perkDeckDefensiveLayer"];
  groupedLegendaryEffects: UseBuilderTotalsResult["groupedLegendaryEffects"];
  mods: BuilderModDTO[];
  piece: BaseGearPiece;
}

export default function DiagnosticsHudColumn({
  payload,
  setPayload,
  totals,
  buffSpecial,
  stanceAndBiometricsLayer,
  intrinsicBenchTotals,
  perkDeckDefensiveLayer,
  groupedLegendaryEffects,
  mods,
  piece,
}: DiagnosticsHudColumnProps) {
  return (
    <div className="space-y-4">
      {/* SPECIAL Progress bars */}
      <div className="pip-terminal-panel p-4 rounded-xl space-y-4">
        <div className="text-xs font-black font-mono uppercase tracking-widest text-accent border-b border-border/20 pb-2 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" /> [S.P.E.C.I.A.L. TELEMETRY]
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="space-y-3">
            {BUILDER_SPECIAL_KEYS.map((key) => {
              const bBonus = buffSpecial.totals[key] || 0;
              const live = totals[key] + bBonus;
              const base = payload.baseSpecial[key] || 1;
              const delta = live - base;
              const percent = Math.min(100, Math.max(5, (live / 20) * 100));

              // Breakdown lines for SPECIAL
              const bLines: { source: string; val: string }[] = [
                { source: "Base S.P.E.C.I.A.L.", val: `${base}` },
              ];

              // Add active Buffs & CAMP Furniture (Deduplicated)
              buffSpecial.breakdown
                .filter((item) => item.stat === key)
                .forEach((item) => {
                  bLines.push({ source: item.source, val: `+${item.val}` });
                });

              // Add dynamic Stance and Biometric Modifiers (Nocturnal, Unyielding, Chameleon)
              stanceAndBiometricsLayer.specialBreakdowns
                .filter((item) => item.stat === key)
                .forEach((item) => {
                  bLines.push({ source: item.source, val: `+${item.val}` });
                });

              const style = findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId);
              if (style?.effectMath && style.effectMath[key]) {
                bLines.push({
                  source: `${style.label.split(" (")[0]}`,
                  val: `+${style.effectMath[key]}`,
                });
              }

              payload.legendaryPerkIds.forEach((rawEntry) => {
                const [id, rankStr] = rawEntry.split(":");
                const rank = parseInt(rankStr, 10) || 4;
                const bonus = rank === 4 ? 5 : Math.max(1, Math.min(3, rank));
                const perk = LEGENDARY_PERK_CARDS[id];
                if (perk?.specialBonus && perk.specialBonus[key]) {
                  bLines.push({ source: `Legendary: ${perk.label.split(" (")[0]}`, val: `+${bonus}` });
                }
              });

              payload.legendaryModIds.forEach((id, idx) => {
                if (!id) return;
                const mod = mods.find((m) => m.id === id || m.slug === id);
                if (mod?.effectMath && mod.effectMath[key]) {
                  bLines.push({ source: `${mod.name} (${idx + 1}★)`, val: `+${mod.effectMath[key]}` });
                }
              });

              if (payload.ghoul && key === "cha") {
                bLines.push({ source: "Ghoul Biology", val: "-10" });
              }

              const STAT_TO_SPECIAL_CAT: Record<string, "S" | "P" | "E" | "C" | "I" | "A" | "L"> = {
                str: "S",
                per: "P",
                end: "E",
                cha: "C",
                int: "I",
                agi: "A",
                lck: "L",
              };
              const specTheme = OFFICIAL_SPECIAL_THEMES[STAT_TO_SPECIAL_CAT[key] || "S"];

              return (
                <div key={key} className="space-y-1 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "touch-hit font-bold cursor-help hover:underline decoration-dashed underline-offset-2",
                            specTheme.text,
                          )}
                        >
                          {BUILDER_SPECIAL_LABELS[key]}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-[#0c1014] border-border/80 p-2.5 font-mono text-[0.78rem] shadow-2xl space-y-1.5 min-w-[200px] z-[10000] opacity-100"
                      >
                        <div
                          className={cn(
                            "font-black border-b border-border/20 pb-1 flex justify-between",
                            specTheme.text,
                          )}
                        >
                          <span>{SPECIAL_FULL_NAMES[key] || key.toUpperCase()}</span>
                          <span>Total: {live}</span>
                        </div>
                        <div className="space-y-1 text-foreground/80 text-[0.75rem]">
                          {bLines.map((b, i) => (
                            <div key={i} className="flex justify-between gap-3">
                              <span className="text-foreground/60">{b.source}</span>
                              <span className={cn("font-bold", specTheme.text)}>{b.val}</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <div className="flex items-center gap-1 text-[0.84rem]">
                      <span className="font-black text-foreground">{live}</span>
                      {delta !== 0 && (
                        <span
                          className={cn(
                            "text-[0.84rem] px-1 rounded font-black tracking-tight",
                            delta > 0
                              ? "text-accent bg-accent/10 border border-accent/20"
                              : "text-danger bg-danger/10 border border-danger/20",
                          )}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress track with official SPECIAL color */}
                  <div className="h-1.5 w-full bg-background/60 rounded border border-border/15 overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-200"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: specTheme.hex,
                        boxShadow: `0 0 6px ${specTheme.hex}`,
                      }}
                    />
                  </div>
                  {/* Mini inline baseline increment/decrement */}
                  <div className="flex items-center gap-1 mt-0.5 justify-end text-[0.72rem]">
                    <span className="text-foreground/30 mr-1">Base: {base}</span>
                    <button
                      type="button"
                      aria-label={`Lower base ${SPECIAL_FULL_NAMES[key] || key.toUpperCase()}`}
                      className="w-3.5 h-3.5 touch:w-11 touch:h-11 touch:text-base rounded border border-border/30 hover:border-accent hover:text-accent flex items-center justify-center font-bold bg-background/40 transition-colors"
                      onClick={() => {
                        const val = Math.max(1, base - 1);
                        setPayload((p) => ({
                          ...p,
                          baseSpecial: { ...p.baseSpecial, [key]: val },
                        }));
                        triggerBuilderAchievement("build_stats");
                      }}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      aria-label={`Raise base ${SPECIAL_FULL_NAMES[key] || key.toUpperCase()}`}
                      className="w-3.5 h-3.5 touch:w-11 touch:h-11 touch:text-base rounded border border-border/30 hover:border-accent hover:text-accent flex items-center justify-center font-bold bg-background/40 transition-colors"
                      onClick={() => {
                        const val = Math.min(15, base + 1);
                        setPayload((p) => ({
                          ...p,
                          baseSpecial: { ...p.baseSpecial, [key]: val },
                        }));
                        triggerBuilderAchievement("build_stats");
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Tactical Resistance cards */}
      <div className="pip-terminal-panel p-4 rounded-xl space-y-3">
        <div className="text-xs font-black font-mono uppercase tracking-widest text-accent border-b border-border/20 pb-2 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" /> [ RESISTANCE RATINGS ]
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-2 gap-2 font-mono">
            {[
              { k: "dr", l: "DR", icon: Shield, col: "text-blue-400/80" },
              { k: "er", l: "ER", icon: Zap, col: "text-yellow-400/80" },
              { k: "fr", l: "FR", icon: Flame, col: "text-orange-400/80" },
              { k: "cr", l: "CR", icon: Snowflake, col: "text-cyan-400/80" },
              { k: "pr", l: "PR", icon: Droplets, col: "text-green-400/80" },
              { k: "rr", l: "RR", icon: Radiation, col: "text-lime-400/80" },
            ].map(({ k, l, icon: Icon, col }) => {
              const live = totals[k as keyof BuilderEffectTotals] as number;
              const base = intrinsicBenchTotals[k as keyof BuilderEffectTotals] as number;
              const delta = live - base;

              // Breakdown lines for Resistance
              const rLines: { source: string; val: string }[] = [];
              if (base > 0) rLines.push({ source: "Base / Gear Base", val: `${base}` });

              const lining = findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId);
              if (lining?.effectMath && lining.effectMath[k]) {
                rLines.push({
                  source: `${lining.label.split(" (")[0]}`,
                  val: `+${lining.effectMath[k]}`,
                });
              }

              payload.legendaryPerkIds.forEach((rawEntry) => {
                const [id, rankStr] = rawEntry.split(":");
                const rank = parseInt(rankStr, 10) || 4;
                const perk = LEGENDARY_PERK_CARDS[id];
                if (perk?.resBonus && perk.resBonus[k as keyof typeof perk.resBonus]) {
                  const val = Math.round(
                    (perk.resBonus[k as keyof typeof perk.resBonus] || 0) * (rank / 4),
                  );
                  if (val > 0) {
                    rLines.push({ source: `Legendary: ${perk.label.split(" (")[0]}`, val: `+${val}` });
                  }
                }
              });

              if (
                perkDeckDefensiveLayer &&
                perkDeckDefensiveLayer[k as keyof typeof perkDeckDefensiveLayer] > 0
              ) {
                rLines.push({
                  source: "Equipped Perk Deck",
                  val: `+${perkDeckDefensiveLayer[k as keyof typeof perkDeckDefensiveLayer]}`,
                });
              }

              payload.legendaryModIds.forEach((id, idx) => {
                if (!id) return;
                const mod = mods.find((m) => m.id === id || m.slug === id);
                if (mod?.effectMath && mod.effectMath[k]) {
                  rLines.push({
                    source: `${mod.name} (${idx + 1}★)`,
                    val: `+${mod.effectMath[k]}`,
                  });
                }
              });

              // Add dynamic Stance and Biometric Resistance Modifiers (Bolstering, Vanguard, Steadfast, Mutant's)
              stanceAndBiometricsLayer.resistanceBreakdowns
                .filter((item) => item.res === k)
                .forEach((item) => {
                  rLines.push({ source: item.source, val: `+${item.val}` });
                });

              return (
                <Tooltip key={k}>
                  <TooltipTrigger asChild>
                    <div className="bg-background/25 border border-border/20 p-2 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[56px] hover:border-accent/35 transition-colors cursor-help">
                      <div className="flex items-center gap-1 text-[0.72rem] text-foreground/45 font-black uppercase tracking-wider">
                        <Icon className={cn("h-3 w-3 shrink-0", col)} />
                        <span>{l}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-black text-foreground">{live}</span>
                        {delta !== 0 && (
                          <span className="text-[0.72rem] text-accent font-black tracking-tight bg-accent/5 px-1 border border-accent/20 rounded">
                            +{delta}
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-[#0c1014] border-border/80 p-2.5 font-mono text-[0.78rem] shadow-2xl space-y-1.5 min-w-[210px] z-[10000] opacity-100"
                  >
                    <div className="font-black text-accent border-b border-border/20 pb-1 flex justify-between">
                      <span>{RESIST_FULL_NAMES[k] || l}</span>
                      <span>Total: {live}</span>
                    </div>
                    <div className="space-y-1 text-foreground/80 text-[0.75rem]">
                      {rLines.length === 0 ? (
                        <div className="text-foreground/40 italic">0 resistances active</div>
                      ) : (
                        rLines.map((r, i) => (
                          <div key={i} className="flex justify-between gap-3">
                            <span className="text-foreground/60">{r.source}</span>
                            <span className="font-bold text-accent">{r.val}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Active Effects Summarizer rollup list (Compact High-Density Matrix) */}
      <div className="pip-terminal-panel p-3 rounded-xl space-y-2 font-mono">
        <div className="flex items-center justify-between border-b border-border/20 pb-1.5 text-xs font-black uppercase tracking-widest text-accent">
          <span>[ ACTIVE LEGENDARY MATRICES ]</span>
          <span className="text-[0.65rem] px-1.5 py-0.2 rounded bg-accent/10 border border-accent/30 text-accent font-bold">
            {groupedLegendaryEffects.length} ACTIVE
          </span>
        </div>

        {groupedLegendaryEffects.length === 0 ? (
          <p className="text-[0.72rem] text-foreground/35 italic uppercase py-1">
            &gt; no legendary effects currently loaded.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {groupedLegendaryEffects.map(({ mod, count, benchLabels }) => {
              const descRaw = mod.description?.trim() ?? "";
              const desc = sandboxLegendaryDescription(descRaw, piece) || descRaw;
              return (
                <li
                  key={mod.id}
                  className="text-[0.72rem] leading-tight bg-background/30 p-1.5 rounded border border-border/20 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-accent truncate">
                      {mod.starRank}★ {mod.name}
                    </span>
                    {count > 1 && (
                      <span className="rounded bg-accent/20 px-1 py-0.2 text-[0.65rem] font-black text-accent border border-accent/40 shrink-0">
                        ×{count}
                      </span>
                    )}
                  </div>
                  <div className="text-[0.62rem] text-foreground/45 truncate mt-0.5 uppercase">
                    {benchLabels.join(" · ")}
                  </div>
                  {desc ? (
                    <p
                      className="mt-0.5 text-foreground/70 text-[0.65rem] line-clamp-1 font-sans italic"
                      title={desc}
                    >
                      {desc}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
