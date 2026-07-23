import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARMOR_SET_SLOT_LABELS, getArmorSetRow } from "@/lib/builder/armor-sets";
import {
  armorCraftingEffectLayers,
  findArmorMaterialMod,
  findArmorMiscMod
} from "@/lib/builder/armor-piece-mods";
import {
  getBaseGearPiece,
  isPowerArmorHelmetBasePiece,
  isPowerArmorTorsoBasePiece
} from "@/lib/builder/base-gear";
import {
  aggregateEffectMath,
  BUILDER_SPECIAL_KEYS,
  BUILDER_SPECIAL_LABELS,
  SPECIAL_FULL_NAMES,
  buildShoppingList,
  collectEquippedLegendaryModIds,
  getGroupedLegendaryEffects,
  isFullArmorSetPayload,
  listEquippedLegendariesWithBenchLabels,
  listEquippedModsInBenchOrder
} from "@/lib/builder/compatibility";
import { getCachedPublishedSharedBuild } from "@/lib/builder/get-shared-build";
import { normalizeBuilderPayload } from "@/lib/builder/normalize-builder-payload";
import {
  getPowerArmorEquippedFlatStats,
  getPowerArmorSlotBaseStats,
  isKnownPowerArmorHelmetPieceId,
  powerArmorFrameIntrinsicEffectMath
} from "@/lib/builder/power-armor-stats";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES
} from "@/lib/builder/underarmor";
import { getSortedMutationLabels, sandboxMutationMathLayer } from "@/lib/builder/sandbox-mutations";
import { sandboxLegendaryDescription } from "@/lib/builder/sandbox-mod-description";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ slug: string }> };

const modDetailSelect = {
  id: true,
  slug: true,
  name: true,
  starRank: true,
  category: true,
  subCategory: true,
  description: true,
  effectMath: true,
  craftingCost: true,
  allowedOnPowerArmor: true,
  allowedOnArmor: true,
  allowedOnWeapon: true,
  infestationOnly: true,
  fifthStarEligible: true,
  ghoulSpecialCap: true
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await getCachedPublishedSharedBuild(slug);
  if (!row) {
    return { title: "Loadout | R.O.L.L" };
  }
  const title = row.seoTitle?.trim() || `${row.title} | R.O.L.L loadout`;
  const description =
    row.description?.trim() ||
    `Shared Fallout 76 loadout: ${row.title}. Built with R.O.L.L. — modules, underarmor, and legendary slots.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description }
  };
}

function baseArmorFromPayload(payload: BuilderPayload) {
  const piece = getBaseGearPiece(payload.basePieceId);
  if (!piece) return null;
  if (piece.kind === "armor" && piece.armorSetKey) {
    return getArmorSetRow(piece.armorSetKey)?.stats ?? null;
  }
  if (piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece)) {
    return getPowerArmorSlotBaseStats(piece.id, "helmet");
  }
  if (piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)) {
    return getPowerArmorEquippedFlatStats(piece.id, payload.powerArmorHelmetId, payload.powerArmorPiecesEquipped);
  }
  return null;
}

export default async function SharedLoadoutPage({ params }: PageProps) {
  
  // Removed admin-only gate for shared B.U.I.L.D. links to allow beta testers to view and share builds.
  // if (!isAdminUser(session?.user)) {
  //   redirect("/");
  // }

  const { slug } = await params;
  const row = await getCachedPublishedSharedBuild(slug);
  const payload = normalizeBuilderPayload(row?.payload);
  if (!row || !payload) {
    notFound();
  }

  const piece = getBaseGearPiece(payload.basePieceId);
  const ids = collectEquippedLegendaryModIds(payload);
  const modRows = ids.length
    ? await prisma.legendaryMod.findMany({
        where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
        select: modDetailSelect
      })
    : [];

  const dtoList: BuilderModDTO[] = modRows.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    starRank: m.starRank,
    category: m.category,
    subCategory: m.subCategory,
    description: m.description,
    effectMath: (m.effectMath as Record<string, unknown>) ?? {},
    craftingCost: (m.craftingCost as Record<string, unknown>) ?? {},
    allowedOnPowerArmor: m.allowedOnPowerArmor,
    allowedOnArmor: m.allowedOnArmor,
    allowedOnWeapon: m.allowedOnWeapon,
    infestationOnly: m.infestationOnly,
    fifthStarEligible: m.fifthStarEligible,
    ghoulSpecialCap: m.ghoulSpecialCap,
    trackerUnlock: "unknown"
  }));

  const equippedOrdered = listEquippedModsInBenchOrder(payload, dtoList);
  const equippedLegendaryBenchLines = listEquippedLegendariesWithBenchLabels(payload, dtoList);

  const layers: Record<string, number>[] = [];
  if (piece?.kind !== "powerArmor") {
    const shell = findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId);
    const lining = findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId);
    const style = findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId);
    if (shell?.effectMath) layers.push(shell.effectMath);
    if (lining?.effectMath) layers.push(lining.effectMath);
    if (style?.effectMath) layers.push(style.effectMath);
  }
  if (isFullArmorSetPayload(payload)) {
    for (const layer of armorCraftingEffectLayers(payload.armorPieceCrafting, piece?.kind === "powerArmor")) {
      layers.push(layer);
    }
  } else if (piece?.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)) {
    const torsoRow = payload.armorPieceCrafting[0];
    for (const layer of armorCraftingEffectLayers([torsoRow ?? { materialModId: "none", miscModId: "none" }], true)) {
      layers.push(layer);
    }
    if (payload.powerArmorHelmetId && isKnownPowerArmorHelmetPieceId(payload.powerArmorHelmetId)) {
      for (const layer of armorCraftingEffectLayers([payload.powerArmorHelmetCrafting], true)) {
        layers.push(layer);
      }
    }
  } else if (piece?.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece)) {
    const row = payload.armorPieceCrafting[0];
    for (const layer of armorCraftingEffectLayers([row ?? { materialModId: "none", miscModId: "none" }], true)) {
      layers.push(layer);
    }
  }

  const baseArmorStats = baseArmorFromPayload(payload);
  if (piece?.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)) {
    layers.push(powerArmorFrameIntrinsicEffectMath());
  }
  const mutationLayer = sandboxMutationMathLayer(
    payload.mutationIds,
    payload.ignoreMutationPenalties,
    {
      strangeInNumbersMutatedTeammates:
        payload.hasStrangeInNumbers && payload.mutationIds.length > 0 ? 4 : 0
    }
  );
  if (mutationLayer) layers.push(mutationLayer);
  const totals = aggregateEffectMath(equippedOrdered, {
    ghoul: payload.ghoul,
    extraLayers: layers,
    baseArmorStats,
    baseSpecial: payload.baseSpecial,
    legendaryPerkIds: payload.legendaryPerkIds
  });
  const shopping = buildShoppingList(equippedOrdered);

  const groupedLegendaryEffects = getGroupedLegendaryEffects(equippedLegendaryBenchLines);

  const SLOT_LABELS = ["1st", "2nd", "3rd", "4th"];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-mono">
      {/* Top Diagnostic Banner */}
      <div className="pip-terminal-panel p-4 rounded-xl border border-accent/30 bg-panel shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-3">
          <div>
            <div className="text-[0.72rem] font-bold text-accent uppercase tracking-widest">&gt; SYSTEM DIAGNOSTICS: ACTIVE TRANSMISSION LOADOUT</div>
            <h1 className="text-2xl font-black uppercase text-foreground tracking-wide mt-1">{row.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent font-bold uppercase">{piece?.label ?? payload.basePieceId}</span>
            <span className="px-2 py-0.5 rounded bg-background/50 border border-border/30 text-foreground/70 font-bold uppercase">{payload.ghoul ? "Ghoul Biology" : "Human Spec"}</span>
          </div>
        </div>
        <p className="text-[0.75rem] text-foreground/50 mt-2 italic">
          Shared via B.U.I.L.D. Diagnostic Hub · {new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
        </p>
      </div>

      {/* 3-Column Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* COLUMN 1: TELEMETRY & STATS */}
        <div className="space-y-4">
          
          {/* SPECIAL Telemetry */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ S.P.E.C.I.A.L. TELEMETRY ]
            </div>
            <div className="space-y-2">
              {BUILDER_SPECIAL_KEYS.map((k) => {
                const label = BUILDER_SPECIAL_LABELS[k];
                const live = totals[k];
                const pct = Math.min(100, Math.max(5, (live / 30) * 100));
                return (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-foreground/70">{label} ({SPECIAL_FULL_NAMES[k]})</span>
                      <span className="text-accent">{live}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-background/60 overflow-hidden border border-border/20">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resistance Ratings */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ RESISTANCE RATINGS ]
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-background/50 border border-border/30 flex justify-between items-center">
                <span className="text-foreground/60 font-bold">DR</span>
                <span className="font-black text-accent text-sm">{totals.dr}</span>
              </div>
              <div className="p-2.5 rounded bg-background/50 border border-border/30 flex justify-between items-center">
                <span className="text-foreground/60 font-bold">ER</span>
                <span className="font-black text-accent text-sm">{totals.er}</span>
              </div>
              <div className="p-2.5 rounded bg-background/50 border border-border/30 flex justify-between items-center">
                <span className="text-foreground/60 font-bold">FR</span>
                <span className="font-black text-accent text-sm">{totals.fr}</span>
              </div>
              <div className="p-2.5 rounded bg-background/50 border border-border/30 flex justify-between items-center">
                <span className="text-foreground/60 font-bold">RR</span>
                <span className="font-black text-accent text-sm">{totals.rr}</span>
              </div>
              <div className="p-2.5 rounded bg-background/50 border border-border/30 flex justify-between items-center">
                <span className="text-foreground/60 font-bold">PR</span>
                <span className="font-black text-accent text-sm">{totals.pr}</span>
              </div>
              <div className="p-2.5 rounded bg-background/50 border border-border/30 flex justify-between items-center">
                <span className="text-foreground/60 font-bold">CR</span>
                <span className="font-black text-accent text-sm">{totals.cr}</span>
              </div>
            </div>
          </div>

          {/* Active Legendary Matrices Grouped */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ ACTIVE LEGENDARY MATRICES ]
            </div>
            {groupedLegendaryEffects.length === 0 ? (
              <p className="text-[0.78rem] text-foreground/35 italic uppercase">
                &gt; no legendary effects loaded on chassis.
              </p>
            ) : (
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {groupedLegendaryEffects.map(({ mod, count, benchLabels }) => {
                  const descRaw = mod.description?.trim() ?? "";
                  const desc = sandboxLegendaryDescription(descRaw, piece ?? undefined) || descRaw;
                  return (
                    <li key={mod.id} className="text-[0.78rem] leading-snug border-b border-border/10 pb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-accent/90 uppercase tracking-wide">
                          {mod.starRank}★ {mod.name}
                        </span>
                        {count > 1 && (
                          <span className="rounded-full bg-accent/10 px-1.5 py-0.2 text-[0.84rem] font-black text-accent border border-accent/20">
                            ×{count}
                          </span>
                        )}
                      </div>
                      <div className="text-[0.84rem] text-foreground/45 mt-0.5 font-bold uppercase tracking-wider">
                        {benchLabels.join(" · ")}
                      </div>
                      {desc ? (
                        <p className="mt-1 text-foreground/70 font-sans italic text-[0.75rem]">
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

        {/* COLUMN 2: CHASSIS D&V SCHEMATIC & SUB-SYSTEMS */}
        <div className="space-y-4">
          
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ CHASSIS D&amp;V SCHEMATIC ]
            </div>

            {isFullArmorSetPayload(payload) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ARMOR_SET_SLOT_LABELS.map((slotLabel, pieceIndex) => {
                  const craft = payload.armorPieceCrafting[pieceIndex];
                  const mat = craft ? findArmorMaterialMod(craft.materialModId) : undefined;
                  const misc = craft ? findArmorMiscMod(craft.miscModId) : undefined;
                  return (
                    <div key={slotLabel} className="p-3 rounded border border-border/30 bg-background/25 space-y-2">
                      <div className="text-[0.78rem] font-black uppercase text-accent tracking-wider border-b border-border/15 pb-1 flex justify-between">
                        <span>{slotLabel}</span>
                      </div>
                      {craft ? (
                        <div className="text-[0.72rem] text-foreground/50 uppercase font-mono">
                          {mat?.label ?? craft.materialModId} · {misc?.label ?? craft.miscModId}
                        </div>
                      ) : null}
                      <div className="space-y-1 text-xs">
                        {SLOT_LABELS.map((starLabel, starIndex) => {
                          const id = payload.armorLegendaryModIds[pieceIndex]![starIndex];
                          const mod = id ? dtoList.find((m) => m.id === id || m.slug === id) : null;
                          return (
                            <div key={starIndex} className="flex justify-between items-center text-[0.78rem]">
                              <span className="text-foreground/40 font-bold">{starIndex + 1}★</span>
                              <span className={mod ? "font-bold text-foreground" : "text-foreground/30 italic"}>
                                {mod ? mod.name : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {SLOT_LABELS.map((starLabel, starIndex) => {
                  const id = payload.legendaryModIds[starIndex];
                  const mod = id ? dtoList.find((m) => m.id === id || m.slug === id) : null;
                  return (
                    <div key={starIndex} className="p-3 rounded border border-border/30 bg-background/25 flex justify-between items-center text-xs">
                      <span className="text-foreground/40 font-bold">{starIndex + 1}★ {starLabel} Star</span>
                      <span className={mod ? "font-bold text-accent text-sm" : "text-foreground/30 italic"}>
                        {mod ? mod.name : "— Empty Slot —"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Underarmor & Mutations Sub-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {piece?.kind !== "powerArmor" && (
              <div className="pip-terminal-panel p-4 rounded-xl space-y-2 font-mono">
                <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
                  [ UNDERARMOR SUB-SYSTEMS ]
                </div>
                <div className="space-y-1.5 text-xs text-foreground/80">
                  <div>
                    <span className="text-foreground/40 uppercase">Base: </span>
                    <span className="font-bold">{findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId)?.label ?? "Standard"}</span>
                  </div>
                  <div>
                    <span className="text-foreground/40 uppercase">Lining: </span>
                    <span className="font-bold">{findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId)?.label ?? "None"}</span>
                  </div>
                  <div>
                    <span className="text-foreground/40 uppercase">Style: </span>
                    <span className="font-bold">{findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId)?.label ?? "None"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pip-terminal-panel p-4 rounded-xl space-y-2 font-mono">
              <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
                [ MUTATION SERUM MATRIX ]
              </div>
              {getSortedMutationLabels(payload.mutationIds).length > 0 ? (
                <div className="text-xs font-bold text-accent leading-relaxed">
                  {getSortedMutationLabels(payload.mutationIds).join(" · ")}
                </div>
              ) : (
                <div className="text-xs text-foreground/40 italic">No mutations active.</div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMN 3: PERKS & CRAFTING LOGISTICS */}
        <div className="space-y-4">
          
          {/* Legendary Perks */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ LEGENDARY PERKS ]
            </div>
            {payload.legendaryPerkIds.length === 0 ? (
              <div className="text-xs text-foreground/40 italic">No legendary perks equipped.</div>
            ) : (
              <div className="space-y-1.5 text-xs">
                {payload.legendaryPerkIds.map((id) => (
                  <div key={id} className="p-2 rounded bg-background/30 border border-border/20 text-foreground/90 font-bold uppercase">
                    {id.replace(/-/g, " ")}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bench Materials List */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ BENCH MATERIALS LIST ]
            </div>
            <div className="flex flex-wrap gap-1.5">
              {shopping.lines.length === 0 ? (
                <p className="text-[0.78rem] text-foreground/30 italic uppercase">
                  &gt; no materials required.
                </p>
              ) : (
                shopping.lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-[0.72rem] font-black text-accent uppercase tracking-widest"
                  >
                    <span>{line.count}×</span>
                    <span>{line.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
