"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ARMOR_SET_ROWS, getArmorSetMaxLevel } from "@/lib/builder/armor-sets";
import { getPowerArmorMaxLevel } from "@/lib/builder/power-armor-frame-data";
import {
  ARMOR_MATERIAL_MODS,
  listArmorMiscModOptions,
} from "@/lib/builder/armor-piece-mods";
import {
  getGroupedWeaponCategories,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";
import {
  getWeaponMaxLevel,
  type CombatFirepowerResult,
} from "@/lib/builder/combat-firepower-engine";
import { SLOT_LABELS, type ActivePick } from "@/lib/builder/active-pick";
import { findModByIdOrSlug } from "@/lib/builder/compatibility";
import { findLocalProgressEntry } from "@/lib/progress-lookup";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES,
} from "@/lib/builder/underarmor";
import {
  listWeaponAvailableSlots,
  listWeaponInnateModOptions,
  getWeaponInnateModOption,
  defaultWeaponInnateCrafting,
  type WeaponInnateSlotKey,
  type WeaponInnateAggregateEffects,
} from "@/lib/builder/weapon-piece-mods";
import { resolveUniqueForBuilderId } from "@/lib/truth/unique-items";
import LinkifiedText from "@/components/linkified-text";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import type { LocalProgressMap } from "@/components/use-local-progress";

export interface ChassisBayColumnProps {
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  activeChassisPiece: BaseGearPiece;
  activeWeaponPiece: BaseGearPiece;
  piece: BaseGearPiece;
  isPA: boolean;
  mods: BuilderModDTO[];
  activeWeaponAttachments: WeaponInnateAggregateEffects;
  weaponFirepowerResult: CombatFirepowerResult | null;
  localProgress: LocalProgressMap;
  weaponSubMenu: "attachments" | "stars" | "matrix";
  setWeaponSubMenu: React.Dispatch<React.SetStateAction<"attachments" | "stars" | "matrix">>;
  selectActiveWeapon: (weaponId: string) => void;
  setWeaponInnateSlot: (slot: WeaponInnateSlotKey, modId: string) => void;
  clearPiece: (payloadIndex: number) => void;
  setArmorCraftingField: (
    pieceIndex: number,
    field: "materialModId" | "miscModId",
    value: string,
  ) => void;
  clearStarSlot: (
    scope: "single" | "armorSet",
    pieceIndex: number | undefined,
    starIndex: number,
  ) => void;
  setActivePick: React.Dispatch<React.SetStateAction<ActivePick>>;
  readOnly?: boolean;
}

export default function ChassisBayColumn({
  payload,
  setPayload,
  activeChassisPiece,
  activeWeaponPiece,
  piece,
  isPA,
  mods,
  activeWeaponAttachments,
  weaponFirepowerResult,
  localProgress,
  weaponSubMenu,
  setWeaponSubMenu,
  selectActiveWeapon,
  setWeaponInnateSlot,
  clearPiece,
  setArmorCraftingField,
  clearStarSlot,
  setActivePick,
  readOnly,
}: ChassisBayColumnProps) {
  const groupedWeaponCategories = React.useMemo(() => getGroupedWeaponCategories(), []);
  const pathname = usePathname();
  // Named unique in the weapon bay: its innate text is read-only reference copy.
  const activeWeaponUnique = React.useMemo(
    () => resolveUniqueForBuilderId(activeWeaponPiece.id),
    [activeWeaponPiece.id],
  );

  // Gear schematic card generator for multi-piece view
  function renderGearSlotCard(
    slotKey: "helmet" | "leftArm" | "torso" | "rightArm" | "leftLeg" | "rightLeg",
    label: string,
    payloadIndex: number | null,
  ) {
    const isEquipped = isPA && payloadIndex !== null ? payload.powerArmorPiecesEquipped[payloadIndex] : true;
    const isPAHelmet = isPA && slotKey === "helmet";
    const isRegularHelmet = !isPA && slotKey === "helmet";

    const craft = payloadIndex !== null ? payload.armorPieceCrafting[payloadIndex] : null;
    const material =
      craft?.materialModId && craft.materialModId !== "none"
        ? ARMOR_MATERIAL_MODS.find((m) => m.id === craft.materialModId)?.label
        : null;
    const misc =
      craft?.miscModId && craft.miscModId !== "none" && payloadIndex !== null
        ? listArmorMiscModOptions(piece.armorSetKey ?? null, payloadIndex, { powerArmor: isPA }).find(
            (m) => m.id === craft.miscModId,
          )?.label
        : null;

    return (
      <div
        className={cn(
          "pip-terminal-panel w-full p-2.5 rounded-lg border text-left transition-all duration-200 group relative flex flex-col justify-between font-mono",
          isEquipped
            ? "border-accent/40 bg-accent/[0.02] shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
            : "border-border/15 opacity-35 bg-background/10 hover:opacity-60 hover:border-border/30",
        )}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-2xs uppercase font-black text-foreground/50 tracking-widest border-b border-border/20 pb-1 mb-1.5">
            <span>{label}</span>
            {isPA && payloadIndex !== null && !readOnly && (
              <button
                type="button"
                className="text-[0.84rem] text-accent hover:underline font-black uppercase transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEquipped) {
                    clearPiece(payloadIndex);
                  } else {
                    const next = [...payload.powerArmorPiecesEquipped] as unknown as [
                      boolean,
                      boolean,
                      boolean,
                      boolean,
                      boolean,
                      boolean,
                    ];
                    next[payloadIndex] = true;
                    setPayload((p) => ({ ...p, powerArmorPiecesEquipped: next }));
                  }
                }}
              >
                {isEquipped ? "un-equip" : "equip"}
              </button>
            )}
          </div>

          {/* Per-Slot Armor Piece Selector for Mixed Sets */}
          {!isPA && payloadIndex !== null && (
            <div className="mb-1.5">
              {readOnly ? (
                <div className="w-full text-2xs bg-background/90 border border-border/30 rounded px-1.5 py-0.5 font-mono uppercase text-accent font-bold truncate">
                  {ARMOR_SET_ROWS.find(
                    (r) =>
                      r.key ===
                      (payload.armorPieceSetKeys?.[payloadIndex] ||
                        piece.armorSetKey ||
                        "civil-engineer"),
                  )?.label || "Armor Piece"}
                </div>
              ) : (
                <select
                  aria-label={`Armor set for ${label}`}
                  className="w-full text-2xs bg-background/90 border border-border/40 rounded px-1 py-0.5 font-mono uppercase text-accent font-bold cursor-pointer hover:border-accent"
                  value={
                    payload.armorPieceSetKeys?.[payloadIndex] ||
                    piece.armorSetKey ||
                    "civil-engineer"
                  }
                  onChange={(e) => {
                    const currentKeys = payload.armorPieceSetKeys || [
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                    ];
                    const nextKeys = [...currentKeys];
                    nextKeys[payloadIndex] = e.target.value;
                    setPayload((p) => ({ ...p, armorPieceSetKeys: nextKeys }));
                  }}
                >
                  {ARMOR_SET_ROWS.map((row) => (
                    <option key={row.key} value={row.key} className="bg-background text-foreground">
                      {row.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {isEquipped ? (
            <div className="space-y-2">
              {/* Mods display */}
              {isRegularHelmet ? (
                <div className="text-[0.84rem] text-foreground/30 italic">No crafting mods</div>
              ) : material || misc ? (
                <div className="text-[0.84rem] text-accent/80 leading-tight uppercase font-black tracking-wider bg-accent/5 p-1 rounded border border-accent/10">
                  {material && <div className="truncate">Mat: {material}</div>}
                  {misc && <div className="truncate">Misc: {misc}</div>}
                </div>
              ) : (
                <div className="text-[0.84rem] text-foreground/30 italic">No crafting mods</div>
              )}

              {/* Tweak selectors */}
              {!readOnly && !isRegularHelmet && payloadIndex !== null && (
                <div className="flex flex-col gap-1 mt-1">
                  {!isPA && (
                    <select
                      aria-label={`Material mod for ${label}`}
                      className="h-5 text-[0.84rem] w-full rounded border border-border/35 bg-background/60 px-1 font-mono uppercase text-foreground/80 cursor-pointer"
                      value={craft?.materialModId ?? "none"}
                      onChange={(e) =>
                        setArmorCraftingField(payloadIndex, "materialModId", e.target.value)
                      }
                    >
                      {ARMOR_MATERIAL_MODS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    aria-label={`Misc mod for ${label}`}
                    className="h-5 text-[0.84rem] w-full rounded border border-border/35 bg-background/60 px-1 font-mono uppercase text-foreground/80 cursor-pointer"
                    value={craft?.miscModId ?? "none"}
                    onChange={(e) =>
                      setArmorCraftingField(payloadIndex, "miscModId", e.target.value)
                    }
                  >
                    {listArmorMiscModOptions(piece.armorSetKey ?? null, payloadIndex, {
                      powerArmor: isPA,
                    }).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Legendary star rows */}
              {isPAHelmet || isRegularHelmet ? (
                <div className="text-[0.84rem] text-foreground/45 italic leading-snug mt-1.5 pt-1.5 border-t border-border/10">
                  {isPAHelmet ? "PA Helm - Stars Lock" : "No legendary effects allowed"}
                </div>
              ) : (
                payloadIndex !== null && (
                  <div className="space-y-1 mt-1.5 pt-1.5 border-t border-border/10">
                    {SLOT_LABELS.map((starLabel, starIndex) => {
                      const id = payload.armorLegendaryModIds[payloadIndex]?.[starIndex];
                      const mod = findModByIdOrSlug(mods, id, starIndex + 1);
                      return (
                        <div
                          key={starIndex}
                          className={cn(
                            "flex items-center justify-between text-2xs rounded px-1.5 py-0.5 transition-all border",
                            mod
                              ? "border-accent/30 bg-accent/[0.04] text-foreground/90 hover:border-accent/60"
                              : "border-dashed border-border/30 text-foreground/40 hover:border-accent/40 hover:text-foreground/75",
                          )}
                        >
                          {/* A real button, so the bench opens from the keyboard too. */}
                          <button
                            type="button"
                            disabled={readOnly}
                            aria-label={`${starLabel} legendary mod for ${label}: ${mod ? mod.name : "empty"}`}
                            className="min-h-6 min-w-0 flex-1 truncate text-left font-bold enabled:cursor-pointer"
                            onClick={() => {
                              if (!readOnly) {
                                setActivePick({
                                  scope: "armorSet",
                                  pieceIndex: payloadIndex,
                                  starIndex,
                                });
                              }
                            }}
                          >
                            {starIndex + 1}★ {mod ? mod.name : "empty"}
                          </button>
                          {mod && !readOnly && (
                            <button
                              type="button"
                              aria-label={`Clear ${starLabel} mod for ${label}`}
                              className="min-h-6 min-w-6 text-[0.84rem] text-foreground/40 hover:text-destructive px-1 font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearStarSlot("armorSet", payloadIndex, starIndex);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-foreground/20 font-black">
              <span className="text-[0.84rem] tracking-widest">OFFLINE</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Interactive Silhouette Repair Frame / Chassis Bay schematic */}
      <div className="pip-terminal-panel p-4 rounded-xl space-y-4 font-mono relative min-h-[500px] flex flex-col justify-between">
        <div className="crt-scanline" />

        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2 relative z-10">
          <span>[ Chassis Bay schematic ]</span>
          <span className="text-2xs text-foreground/40 font-normal flex items-center gap-1.5">
            <span>Active frame: {activeChassisPiece.label}</span>
            {activeChassisPiece.kind === "powerArmor" ? (
              <span className="text-3xs px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
                LVL {getPowerArmorMaxLevel(activeChassisPiece.id)} (MAX)
              </span>
            ) : (
              <span className="text-3xs px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
                LVL {getArmorSetMaxLevel(activeChassisPiece.armorSetKey || activeChassisPiece.id)} (MAX)
              </span>
            )}
          </span>
        </div>

        <div className="space-y-3 relative z-10">
          {/* SECTION A: ACTIVE PRIMARY WEAPON BAY */}
          <div className="rounded-lg border border-accent/30 bg-background/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/20 pb-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">🎯</span>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-wider text-accent truncate">
                    {activeWeaponPiece.label}
                  </div>
                  <div className="text-3xs text-foreground/45 uppercase truncate">
                    Primary Weapon · {activeWeaponPiece.weaponSub || "Tactical"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {readOnly ? (
                  <span className="h-7 flex items-center text-xs font-mono bg-slate-950 border border-amber-500/40 text-amber-300 rounded px-2.5 max-w-[170px] sm:max-w-[240px] truncate shadow-inner font-bold">
                    {activeWeaponPiece.label}
                  </span>
                ) : (
                  <select
                    value={activeWeaponPiece.id}
                    onChange={(e) => selectActiveWeapon(e.target.value)}
                    className="h-7 text-xs font-mono bg-slate-950 border border-amber-500/40 text-amber-300 rounded px-2 focus:ring-1 focus:ring-accent outline-none cursor-pointer max-w-[170px] sm:max-w-[240px] truncate shadow-inner"
                    title="Switch Active Weapon Chassis"
                  >
                    {groupedWeaponCategories.map((group) => (
                      <optgroup
                        key={group.categoryKey}
                        label={`── ${group.categoryLabel.toUpperCase()} ──`}
                        className="bg-slate-950 text-emerald-400 font-bold"
                      >
                        {group.options.map((opt) => (
                          <option
                            key={opt.id}
                            value={opt.id}
                            className={cn(
                              "bg-slate-900 text-slate-100",
                              opt.isVariant && "text-amber-200",
                            )}
                          >
                            {opt.isVariant ? `\u00A0\u00A0↳ ${opt.label}` : opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
                <span className="text-3xs px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
                  LVL {getWeaponMaxLevel(activeWeaponPiece.id)} (MAX)
                </span>
                <span className="text-3xs px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent font-bold">
                  ACTIVE WEAPON
                </span>
              </div>
            </div>

            {/* UNIQUE INNATE EFFECT (read-only reference from the Patch 70 truth pack) */}
            {activeWeaponUnique && (
              <div className="rounded-lg border border-amber-500/25 bg-slate-950/70 p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xs font-black uppercase tracking-widest text-amber-300">
                    Unique effect
                  </span>
                  <span
                    className={cn(
                      "text-3xs px-1.5 py-0.2 rounded border font-bold shrink-0",
                      activeWeaponUnique.model
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-500/15 border-slate-500/40 text-slate-300",
                    )}
                  >
                    {activeWeaponUnique.model ? "Modelled in damage numbers" : "Shown for reference"}
                  </span>
                </div>
                <p className="text-2xs text-slate-200 leading-relaxed">
                  <LinkifiedText text={activeWeaponUnique.innateEffect} currentPath={pathname} />
                </p>
                <p className="text-3xs text-foreground/45 leading-relaxed">
                  Mods can be changed and a 4th star added since Patch 70 (10x scrip).
                </p>
              </div>
            )}

            {/* WEAPON SUB-NAVIGATION: ATTACHMENTS vs LEGENDARY STARS vs MATRIX */}
            <div className="flex items-center justify-between gap-1 border-b border-border/15 pb-2">
              <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setWeaponSubMenu("attachments")}
                  className={cn(
                    "px-2.5 py-1 rounded text-2xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                    weaponSubMenu === "attachments"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm"
                      : "text-foreground/50 hover:text-foreground hover:bg-background/30 border border-transparent",
                  )}
                >
                  <span>⚙️ Attachments</span>
                  <span className="text-2xs px-1 py-0.2 rounded bg-amber-500/20 text-amber-200">
                    {listWeaponAvailableSlots(activeWeaponPiece.id).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWeaponSubMenu("stars")}
                  className={cn(
                    "px-2.5 py-1 rounded text-2xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                    weaponSubMenu === "stars"
                      ? "bg-accent/20 text-accent border border-accent/60 shadow-sm"
                      : "text-foreground/50 hover:text-foreground hover:bg-background/30 border border-transparent",
                  )}
                >
                  <span>★ Legendary Stars</span>
                  <span className="text-2xs px-1 py-0.2 rounded bg-accent/20 text-accent">
                    4
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWeaponSubMenu("matrix")}
                  className={cn(
                    "px-2.5 py-1 rounded text-2xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                    weaponSubMenu === "matrix"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm"
                      : "text-foreground/50 hover:text-foreground hover:bg-background/30 border border-transparent",
                  )}
                >
                  <span>👁️ All Weapon Matrix</span>
                </button>
              </div>
            </div>

            {/* TAB 1: WORKBENCH INNATE ATTACHMENTS */}
            {weaponSubMenu === "attachments" && (
              <div className="space-y-2.5 pt-0.5">
                {/* Active Aggregate Summary Banner */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-amber-500/20 text-xs font-mono">
                  <span className="text-foreground/50 font-bold uppercase text-2xs mr-1">
                    Innate Mod Bonuses:
                  </span>
                  {activeWeaponAttachments.damagePct !== 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-2xs">
                      {activeWeaponAttachments.damagePct > 0 ? "+" : ""}
                      {Math.round(activeWeaponAttachments.damagePct * 100)}% Dmg
                    </span>
                  )}
                  {activeWeaponAttachments.apCostPct !== 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold text-2xs">
                      {activeWeaponAttachments.apCostPct > 0 ? "+" : ""}
                      {Math.round(activeWeaponAttachments.apCostPct * 100)}% AP
                    </span>
                  )}
                  {activeWeaponAttachments.armorPenetrationPct > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-2xs">
                      +{activeWeaponAttachments.armorPenetrationPct}% Armor Pen
                    </span>
                  )}
                  {activeWeaponAttachments.critDamagePct > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 font-bold text-2xs">
                      +{Math.round(activeWeaponAttachments.critDamagePct * 100)}% Crit
                    </span>
                  )}
                  {activeWeaponAttachments.fireRatePct !== 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/40 text-blue-300 font-bold text-2xs">
                      {activeWeaponAttachments.fireRatePct > 0 ? "+" : ""}
                      {Math.round(activeWeaponAttachments.fireRatePct * 100)}% Fire Rate
                    </span>
                  )}
                  {activeWeaponAttachments.isSuppressed && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold text-2xs">
                      🔇 Silenced
                    </span>
                  )}
                  {activeWeaponAttachments.durabilityPct > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-500/15 border border-slate-500/40 text-slate-300 font-bold text-2xs">
                      +{Math.round(activeWeaponAttachments.durabilityPct * 100)}% Durability
                    </span>
                  )}
                  {!readOnly && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-5 px-2 text-2xs text-foreground/45 hover:text-amber-400 font-mono cursor-pointer"
                      onClick={() => {
                        setPayload((p) => ({
                          ...p,
                          weaponCrafting: defaultWeaponInnateCrafting(activeWeaponPiece.id),
                        }));
                      }}
                    >
                      ↺ Reset Meta Defaults
                    </Button>
                  )}
                </div>

                {/* Attachment Selectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {listWeaponAvailableSlots(activeWeaponPiece.id).map((slotInfo) => {
                    const slotKey = slotInfo.key;
                    const crafting =
                      payload.weaponCrafting ?? defaultWeaponInnateCrafting(activeWeaponPiece.id);
                    const currentId =
                      slotKey === "receiver"
                        ? crafting.receiverId
                        : slotKey === "barrel"
                          ? crafting.barrelId
                          : slotKey === "stock"
                            ? crafting.stockId
                            : slotKey === "magazine"
                              ? crafting.magazineId
                              : slotKey === "sight"
                                ? crafting.sightId
                                : crafting.muzzleId;

                    const options = listWeaponInnateModOptions(activeWeaponPiece.id, slotKey);
                    const activeOpt =
                      getWeaponInnateModOption(activeWeaponPiece.id, slotKey, currentId) ||
                      options[0];

                    return (
                      <div
                        key={slotKey}
                        className="flex flex-col gap-1.5 rounded-lg border border-amber-500/25 bg-background/30 p-2.5 font-mono text-xs transition-all hover:border-amber-500/40"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-amber-300 text-2xs uppercase flex items-center gap-1.5">
                            <span>{slotInfo.icon}</span>
                            <span>{slotInfo.label}</span>
                          </span>
                          {activeOpt?.effectMath.apCostPct && (
                            <span className="text-3xs px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                              {activeOpt.effectMath.apCostPct < 0 ? "" : "+"}
                              {Math.round(activeOpt.effectMath.apCostPct * 100)}% AP
                            </span>
                          )}
                          {activeOpt?.effectMath.armorPenetrationPct && (
                            <span className="text-3xs px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                              +{activeOpt.effectMath.armorPenetrationPct}% Pen
                            </span>
                          )}
                        </div>

                        {readOnly ? (
                          <div className="w-full h-7 flex items-center text-xs font-mono bg-slate-950/80 border border-amber-500/20 text-slate-200 rounded px-2 truncate font-semibold">
                            {activeOpt?.label || "Standard"}
                          </div>
                        ) : (
                          <select
                            aria-label={`${slotInfo.label} mod for ${activeWeaponPiece.label}`}
                            value={activeOpt?.id || ""}
                            onChange={(e) => setWeaponInnateSlot(slotKey, e.target.value)}
                            className="w-full h-7 text-xs font-mono bg-slate-950 border border-amber-500/40 text-slate-100 rounded px-2 focus:ring-1 focus:ring-accent outline-none cursor-pointer truncate shadow-inner"
                          >
                            {options.map((opt) => (
                              <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {activeOpt?.description && (
                          <p className="text-2xs text-foreground/50 leading-relaxed truncate">
                            {activeOpt.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: LEGENDARY 4-STAR SLOTS */}
            {weaponSubMenu === "stars" && (
              <div className="space-y-2 pt-0.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SLOT_LABELS.map((starLabel, starIndex) => {
                    const id = payload.legendaryModIds[starIndex];
                    const mod = findModByIdOrSlug(mods, id, starIndex + 1);
                    const trackerEntry = mod
                      ? findLocalProgressEntry(localProgress, mod.id, mod.name, `${starIndex + 1} Star`)
                      : undefined;
                    const isUnlocked =
                      trackerEntry?.unlocked ?? (mod?.trackerUnlock === "unlocked");
                    const modCount = trackerEntry?.modCount ?? 0;
                    const isSeeking = trackerEntry?.isSeeking ?? false;

                    return (
                      <div
                        key={starIndex}
                        className={cn(
                          "flex flex-col gap-1.5 rounded-lg border p-2.5 text-2xs transition-all font-mono",
                          mod
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-border/20 bg-background/20 text-foreground/50",
                        )}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="min-w-0 flex items-center gap-1.5 truncate">
                            <span className="font-black px-1.5 py-0.5 rounded bg-accent/20 text-accent text-2xs">
                              {starIndex + 1}★
                            </span>
                            <span className="text-foreground font-bold truncate">
                              {mod ? mod.name : starLabel}
                            </span>
                          </div>
                          {!readOnly && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-2xs uppercase font-mono font-bold hover:text-accent bg-accent/15 border border-accent/40 cursor-pointer"
                                onClick={() => setActivePick({ scope: "single", starIndex })}
                              >
                                Bench
                              </Button>
                              {mod && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-1.5 text-2xs uppercase font-mono hover:text-destructive text-foreground/40 cursor-pointer"
                                  onClick={() => clearStarSlot("single", undefined, starIndex)}
                                  title="Remove Mod"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Live Mod Tracker Status */}
                        {mod ? (
                          <div className="flex items-center justify-between gap-2 border-t border-border/15 pt-1 mt-0.5 text-2xs">
                            <span className="text-foreground/50 truncate text-3xs italic">
                              {mod.description || "Active Legendary Effect"}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {isUnlocked ? (
                                <span className="px-1.5 py-0.2 rounded font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Unlocked
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded font-medium uppercase tracking-wider bg-rose-500/10 border border-rose-500/25 text-rose-400/80">
                                  🔒 Locked
                                </span>
                              )}
                              {modCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                  📦 x{modCount}
                                </span>
                              )}
                              {isSeeking && (
                                <span className="px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                                  🎯 Seeking
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-3xs text-foreground/35 italic">
                            Empty slot. Click [Bench] to equip unlocked legendary mods or craft with mod boxes.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ALL WEAPON MATRIX OVERVIEW */}
            {weaponSubMenu === "matrix" && (
              <div className="space-y-3 pt-1 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Attachments Column */}
                  <div className="p-2.5 rounded-lg border border-amber-500/30 bg-background/40 space-y-1.5">
                    <div className="text-2xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                      <span>⚙️ Installed Attachments</span>
                      <button
                        type="button"
                        onClick={() => setWeaponSubMenu("attachments")}
                        className="text-2xs text-accent hover:underline cursor-pointer"
                      >
                        Edit Attachments &gt;
                      </button>
                    </div>
                    <div className="space-y-1 text-2xs">
                      {activeWeaponAttachments.installedMods.length > 0 ? (
                        activeWeaponAttachments.installedMods.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-foreground/80 py-0.5 border-b border-border/10"
                          >
                            <span className="text-foreground/50 uppercase">{m.slot}:</span>
                            <span className="font-semibold text-slate-100">{m.label}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-foreground/40 italic">
                          Factory default components installed.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stars Column */}
                  <div className="p-2.5 rounded-lg border border-accent/30 bg-background/40 space-y-1.5">
                    <div className="text-2xs font-black uppercase tracking-wider text-accent flex items-center justify-between">
                      <span>★ Legendary Stars</span>
                      <button
                        type="button"
                        onClick={() => setWeaponSubMenu("stars")}
                        className="text-2xs text-accent hover:underline cursor-pointer"
                      >
                        Edit Stars &gt;
                      </button>
                    </div>
                    <div className="space-y-1 text-2xs">
                      {SLOT_LABELS.map((starLabel, starIndex) => {
                        const id = payload.legendaryModIds[starIndex];
                        const mod = findModByIdOrSlug(mods, id, starIndex + 1);
                        const trackerEntry = mod
                          ? findLocalProgressEntry(localProgress, mod.id, mod.name, `${starIndex + 1} Star`)
                          : undefined;
                        const isUnlocked =
                          trackerEntry?.unlocked ?? (mod?.trackerUnlock === "unlocked");

                        return (
                          <div
                            key={starIndex}
                            className="flex items-center justify-between py-0.5 border-b border-border/10"
                          >
                            <span className="text-foreground/50">{starIndex + 1}★:</span>
                            <span
                              className={cn(
                                "font-semibold truncate max-w-[140px]",
                                mod ? "text-accent" : "text-foreground/30",
                              )}
                            >
                              {mod ? mod.name : "None"}
                            </span>
                            {mod && (
                              <span
                                className={cn(
                                  "text-3xs font-bold px-1 rounded",
                                  isUnlocked
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-rose-500/20 text-rose-400",
                                )}
                              >
                                {isUnlocked ? "UNLOCKED" : "LOCKED"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Firepower Stat Chips */}
                {weaponFirepowerResult && (
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-2xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">⚡ Single Shot:</span>
                      <span className="font-mono text-slate-100">
                        {weaponFirepowerResult.damagePerShot.normal}
                      </span>
                      <span className="text-amber-400 font-mono">
                        / Crit: {weaponFirepowerResult.damagePerShot.critical}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">Burst DPS:</span>
                      <span className="font-mono text-slate-100">
                        {weaponFirepowerResult.dps.burstDPS.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">V.A.T.S.:</span>
                      <span className="font-mono text-slate-100">
                        {weaponFirepowerResult.vats.apCostPerShot} AP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-300">Armor Pen:</span>
                      <span className="font-mono text-slate-100">
                        {weaponFirepowerResult.armorPenetration.effectiveArmorPenetrationPct}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION B: CHASSIS FRAME SKELETAL BAY */}
          <div className="relative flex flex-col items-center justify-center bg-background/20 rounded-lg p-2 overflow-hidden border border-border/15 shadow-inner">
            {/* Skeletal layout */}
            <div className="w-full max-w-lg grid grid-cols-3 gap-2.5 relative z-10">
              {/* Row 1: Helmet (Center) */}
              <div className="col-span-3 flex justify-center mb-1.5">
                <div className="w-1/2 min-w-[130px]">
                  {renderGearSlotCard("helmet", isPA ? "PA Helmet" : "Helmet", isPA ? 0 : null)}
                </div>
              </div>

              {/* Row 2: Left Arm, Torso, Right Arm */}
              <div className="flex flex-col justify-center">
                {renderGearSlotCard("leftArm", "Left Arm", isPA ? 2 : 1)}
              </div>
              <div className="flex flex-col justify-center">
                {renderGearSlotCard("torso", "Torso Chassis", isPA ? 1 : 0)}
              </div>
              <div className="flex flex-col justify-center">
                {renderGearSlotCard("rightArm", "Right Arm", isPA ? 3 : 2)}
              </div>

              {/* Row 3: Left Leg, Right Leg */}
              <div className="col-span-3 grid grid-cols-2 gap-4 mt-2">
                <div className="flex justify-end">
                  <div className="w-full max-w-[145px]">
                    {renderGearSlotCard("leftLeg", "Left Leg", isPA ? 4 : 3)}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="w-full max-w-[145px]">
                    {renderGearSlotCard("rightLeg", "Right Leg", isPA ? 5 : 4)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: ACTIVE UNDERARMOR SUBSYSTEM STATUS CHIP */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">👕</span>
              <div className="min-w-0">
                <div className="font-bold text-slate-200 truncate">
                  {findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId)?.label ||
                    "Underarmor"}
                </div>
                <div className="text-3xs text-slate-400 truncate">
                  Lining:{" "}
                  <span className="text-cyan-300 font-bold">
                    {findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId)?.label
                      ?.split("(")[0]
                      ?.trim() || "None"}
                  </span>{" "}
                  · Style:{" "}
                  <span className="text-amber-300 font-bold">
                    {findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId)?.label
                      ?.split("(")[0]
                      ?.trim() || "None"}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {isPA ? (
                <span className="text-3xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30 font-bold">
                  ⚠️ SUPPRESSED IN PA
                </span>
              ) : (
                <span className="text-3xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
                  ✓ ACTIVE WITH ARMOR
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-2xs text-foreground/30 uppercase tracking-widest leading-relaxed border-t border-border/10 pt-2 text-center mt-2">
          Telemetric calculations updated instant client-side. Cloudflare 0ms CPU load.
        </div>
      </div>
    </div>
  );
}
