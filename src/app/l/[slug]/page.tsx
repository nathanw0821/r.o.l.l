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
  buildShoppingList,
  collectEquippedLegendaryModIds,
  formatEffectMathDeltas,
  isFullArmorSetPayload,
  listEquippedLegendariesWithBenchLabels,
  listEquippedModsInBenchOrder,
  listExtraEffectMathEntries
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
import { SANDBOX_MUTATIONS, sandboxMutationMathLayer } from "@/lib/builder/sandbox-mutations";
import { sandboxLegendaryDescription } from "@/lib/builder/sandbox-mod-description";
import BuilderTotalsStatKey from "@/components/builder/builder-totals-stat-key";
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
        where: { id: { in: ids } },
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
    for (const layer of armorCraftingEffectLayers(payload.armorPieceCrafting)) {
      layers.push(layer);
    }
  } else if (piece?.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)) {
    const torsoRow = payload.armorPieceCrafting[0];
    for (const layer of armorCraftingEffectLayers([torsoRow ?? { materialModId: "none", miscModId: "none" }])) {
      layers.push(layer);
    }
    if (payload.powerArmorHelmetId && isKnownPowerArmorHelmetPieceId(payload.powerArmorHelmetId)) {
      for (const layer of armorCraftingEffectLayers([payload.powerArmorHelmetCrafting])) {
        layers.push(layer);
      }
    }
  } else if (piece?.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece)) {
    const row = payload.armorPieceCrafting[0];
    for (const layer of armorCraftingEffectLayers([row ?? { materialModId: "none", miscModId: "none" }])) {
      layers.push(layer);
    }
  }

  const baseArmorStats = baseArmorFromPayload(payload);
  if (piece?.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)) {
    layers.push(powerArmorFrameIntrinsicEffectMath());
  }
  const mutationLayer = sandboxMutationMathLayer(payload.mutationIds, payload.ignoreMutationPenalties);
  if (mutationLayer) layers.push(mutationLayer);
  const totals = aggregateEffectMath(equippedOrdered, {
    ghoul: payload.ghoul,
    extraLayers: layers,
    baseArmorStats
  });
  const shopping = buildShoppingList(equippedOrdered);

  const groupedLegendaryEffects = (() => {
    const map = new Map<string, { mod: BuilderModDTO; count: number; benchLabels: string[] }>();
    for (const { mod, benchLabel } of equippedLegendaryBenchLines) {
      const existing = map.get(mod.id);
      if (existing) {
        existing.count++;
        existing.benchLabels.push(benchLabel);
      } else {
        map.set(mod.id, { mod, count: 1, benchLabels: [benchLabel] });
      }
    }
    return Array.from(map.values());
  })();

  const mutationSummary =
    payload.mutationIds.length > 0
      ? payload.mutationIds
          .map((id) => SANDBOX_MUTATIONS.find((m) => m.id === id)?.label ?? id)
          .join(" · ")
      : null;

  const SLOT_LABELS = ["1st", "2nd", "3rd", "4th"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{row.title}</h1>
          <p className="mt-1 text-sm text-foreground/65 flex items-center gap-2">
            <span className="font-semibold text-accent">{piece?.label ?? payload.basePieceId}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{payload.ghoul ? "Ghoul" : "Human"}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>shared via B.U.I.L.D.</span>
          </p>
          {mutationSummary ? (
            <p className="mt-2 text-xs text-foreground/55 italic">
              Sandbox mutations: {mutationSummary}
              {payload.ignoreMutationPenalties ? " (penalties ignored)" : ""}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
           {/* Placeholder for future actions like copy link or clone */}
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-panel p-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="text-sm font-bold uppercase tracking-widest text-foreground/70">Legendary slots</div>
          <div className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Bench breakdown</div>
        </div>
        {isFullArmorSetPayload(payload) ? (
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ARMOR_SET_SLOT_LABELS.map((slotLabel, pieceIndex) => {
              const craft = payload.armorPieceCrafting[pieceIndex];
              const mat = craft ? findArmorMaterialMod(craft.materialModId) : undefined;
              const misc = craft ? findArmorMiscMod(craft.miscModId) : undefined;
              return (
              <div key={slotLabel} className="space-y-3">
                <div className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20">{slotLabel}</div>
                {craft ? (
                  <p className="text-[11px] text-foreground/50 leading-relaxed">
                    <span className="font-semibold text-foreground/40 uppercase text-[9px] mr-1">Craft:</span>
                    {mat?.label ?? craft.materialModId} · {misc?.label ?? craft.miscModId}
                  </p>
                ) : null}
                <div className="space-y-2">
                  {SLOT_LABELS.map((starLabel, starIndex) => {
                    const id = payload.armorLegendaryModIds[pieceIndex]![starIndex];
                    const mod = id ? modRows.find((m) => m.id === id) : null;
                    const math = (mod?.effectMath as Record<string, unknown>) ?? {};
                    const delta = mod ? formatEffectMathDeltas(math) : "";
                    const extras = mod ? listExtraEffectMathEntries(math) : [];
                    return (
                      <div key={`${pieceIndex}-${starIndex}`} className="text-xs group">
                        <div className="flex items-baseline gap-2">
                          <span className="text-foreground/40 font-mono text-[10px] w-5 shrink-0">{starLabel}</span>
                          <span className={mod ? "font-semibold text-foreground/90" : "text-foreground/30 italic"}>
                            {mod?.name ?? "—"}
                          </span>
                          {delta ? <span className="ml-1 text-[10px] font-bold text-accent/80">{delta}</span> : null}
                        </div>
                        {mod?.description ? (
                          <div className="mt-1 pl-7 text-[10px] leading-relaxed text-foreground/50 italic line-clamp-2">
                            {sandboxLegendaryDescription(mod.description, piece ?? undefined)}
                          </div>
                        ) : null}
                        {extras.length > 0 ? (
                          <div className="mt-1 pl-7 flex flex-wrap gap-x-3 gap-y-1">
                            {extras.map((e) => (
                              <div key={e.key} className="text-[9px] text-foreground/40">
                                <span className="font-mono text-foreground/30">{e.key}:</span> {e.value}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {payload.legendaryModIds.map((id, i) => {
              const mod = id ? modRows.find((m) => m.id === id) : null;
              const starLabel = SLOT_LABELS[i] || `${i + 1}th`;
              const math = (mod?.effectMath as Record<string, unknown>) ?? {};
              const delta = mod ? formatEffectMathDeltas(math) : "";
              const extras = mod ? listExtraEffectMathEntries(math) : [];
              return (
                <div key={i} className="space-y-1.5 p-3 rounded-lg bg-foreground/[0.02] border border-border/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">{starLabel} Star</div>
                  <div className="text-sm font-semibold text-foreground/90">
                    {mod?.name ?? "—"}
                  </div>
                  {delta ? <div className="text-[10px] font-bold text-accent/80">{delta}</div> : null}
                  {mod?.description ? (
                    <div className="text-[10px] leading-relaxed text-foreground/50 italic">
                      {sandboxLegendaryDescription(mod.description, piece ?? undefined)}
                    </div>
                  ) : null}
                  {extras.length > 0 ? (
                    <div className="pt-1 flex flex-wrap gap-2 border-t border-border/40 mt-1">
                      {extras.map((e) => (
                        <div key={e.key} className="text-[9px] text-foreground/40">
                          <span className="font-mono text-foreground/30">{e.key}:</span> {e.value}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="rounded-[var(--radius)] border border-border bg-panel p-5 lg:col-span-1">
          <div className="text-sm font-bold uppercase tracking-widest text-foreground/70 border-b border-border/50 pb-3">Totals</div>
          <p className="mt-3 text-[11px] leading-relaxed text-foreground/50 italic">
            {isFullArmorSetPayload(payload) 
              ? "Includes full-set base resistances plus legendary and underarmor effect math."
              : "Includes base resist hints, legendary stars, and underarmor effect math."
            }
          </p>
          <BuilderTotalsStatKey className="mt-4" />
          <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs">
            {[
              { label: "DR", value: totals.dr },
              { label: "ER", value: totals.er },
              { label: "FR", value: totals.fr },
              { label: "CR", value: totals.cr },
              { label: "PR", value: totals.pr },
              { label: "RR", value: totals.rr },
              { label: "HP", value: totals.hp },
              { label: "Damage %", value: `${Math.round(totals.damagePct * 100)}%` },
              ...BUILDER_SPECIAL_KEYS.map(k => ({ label: BUILDER_SPECIAL_LABELS[k], value: totals[k] })),
              { label: "SPECIAL (other)", value: totals.specialBonus },
              { label: "AP regen", value: `${Math.round(totals.apRegen * 100)}%` },
              { label: "Carry wt", value: totals.carryWeight },
            ].map((row) => (
              <React.Fragment key={row.label}>
                <dt className="text-foreground/40 font-medium uppercase tracking-wider text-[10px]">{row.label}</dt>
                <dd className="text-right font-mono text-foreground/90 font-bold">{row.value}</dd>
              </React.Fragment>
            ))}
          </dl>
          <p className="mt-4 text-[9px] text-foreground/30 uppercase font-bold tracking-widest text-center border-t border-border/30 pt-3">
            Excludes perk card bonuses
          </p>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-5 lg:col-span-1">
          <div className="text-sm font-bold uppercase tracking-widest text-foreground/70 border-b border-border/50 pb-3">Effect Summary</div>
          {groupedLegendaryEffects.length === 0 ? (
            <p className="mt-4 text-xs text-foreground/40 italic">No legendary effects active.</p>
          ) : (
            <div className="mt-4 space-y-5">
              {groupedLegendaryEffects.map(({ mod, count, benchLabels }) => {
                const descRaw = mod.description?.trim() ?? "";
                const desc = sandboxLegendaryDescription(descRaw, piece ?? undefined) || descRaw;
                return (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground/90 text-sm">{mod.name}</span>
                      {count > 1 && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent border border-accent/20">
                          ×{count}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-foreground/40 leading-relaxed flex flex-wrap gap-1">
                      {benchLabels.map((l, idx) => (
                        <span key={idx} className="bg-foreground/[0.03] px-1.5 py-0.5 rounded border border-border/30 whitespace-nowrap">{l}</span>
                      ))}
                    </div>
                    {desc ? (
                      <p className="text-[11px] text-foreground/60 leading-relaxed italic border-l-2 border-accent/30 pl-3">
                        {desc}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-5 lg:col-span-1">
          <div className="text-sm font-bold uppercase tracking-widest text-foreground/70 border-b border-border/50 pb-3">Shopping List</div>
          <div className="mt-4 space-y-2">
            {shopping.lines.length === 0 ? (
              <p className="text-xs text-foreground/40 italic">No crafting materials required.</p>
            ) : (
              shopping.lines.map((line) => (
                <div key={line.label} className="flex items-center justify-between group">
                  <span className="text-xs text-foreground/70 group-hover:text-foreground/90 transition-colors">{line.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-foreground/40 font-mono">QTY</span>
                    <span className="font-mono text-xs font-bold text-accent">{line.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 pt-4 border-t border-border/40">
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-2">Build Integrity</div>
            <div className="h-1.5 w-full bg-foreground/[0.05] rounded-full overflow-hidden">
               <div className="h-full bg-accent transition-all duration-500" style={{ width: '100%' }} />
            </div>
            <p className="mt-2 text-[9px] text-foreground/40 leading-relaxed uppercase tracking-wide">
              Shared loadout pages are read-only snapshots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
