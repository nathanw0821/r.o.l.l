"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Terminal,
  Share2,
  Copy,
  Check,
  Link2,
  Radio,
  RefreshCw,
  X,
  AlertTriangle,
  GitFork,
} from "lucide-react";
import NukesDragonsImportModal from "@/components/perks/nukes-dragons-import-modal";
import { BUILDER_STORAGE_KEYS } from "@/lib/builder/storage-keys";
import { useDensityCompact } from "@/lib/hooks/use-density-compact";
import BuilderMasterTabNav from "@/components/builder/builder-master-tab-nav";
import LegendaryModPickerDialog from "@/components/builder/legendary-mod-picker-dialog";
import PerkDeckTab from "@/components/builder/tabs/perk-deck-tab";
import BiometricsTab from "@/components/builder/tabs/biometrics-tab";
import CombatDpsTab from "@/components/builder/tabs/combat-dps-tab";
import DiagnosticsHudColumn from "@/components/builder/tabs/gear/diagnostics-hud-column";
import ChassisBayColumn from "@/components/builder/tabs/gear/chassis-bay-column";
import AuxLogisticsColumn from "@/components/builder/tabs/gear/aux-logistics-column";
import ArmoryMatrixSection from "@/components/builder/tabs/gear/armory-matrix-section";
import { useBuilderModCatalog } from "@/components/builder/hooks/use-builder-mod-catalog";
import { useBuilderTotals } from "@/components/builder/hooks/use-builder-totals";
import { useLegendaryBench } from "@/components/builder/hooks/use-legendary-bench";
import { useBuilderShare } from "@/components/builder/hooks/use-builder-share";
import { useLearnedBasePieces } from "@/components/builder/hooks/use-learned-base-pieces";
import { isUniqueBaseItem } from "@/lib/truth/unique-items";
import { useBuilderPayload } from "@/components/builder/hooks/use-builder-payload";
import { useBuilderBootstrap } from "@/components/builder/hooks/use-builder-bootstrap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateCombatFirepower } from "@/lib/builder/combat-firepower-engine";
import BuilderGearComparisonModal from "@/components/builder/builder-gear-comparison-modal";
import {
  buildShoppingList,
  stripGhoulBlockedLegendarySelections,
} from "@/lib/builder/compatibility";
import {
  type BuilderPayload,
} from "@/lib/builder/types";
import { useLocalProgress } from "@/components/use-local-progress";
import { cn } from "@/lib/utils";
import {
  BuilderBetaGate,
} from "@/components/builder/builder-beta-gate";
import { triggerBuilderAchievement } from "@/actions/builder-achievements";

export type BuilderExperimentClientProps = {
  initialLearnedBasePieceIds?: string[];
  isAdmin?: boolean;
  initialTab?: "gear" | "perks" | "biometrics" | "combat";
  readOnly?: boolean;
  initialPayload?: BuilderPayload;
  sharedTransmissionTitle?: string;
  sharedTransmissionSlug?: string;
  sharedTransmissionId?: string;
  isOwner?: boolean;
};

export default function BuilderExperimentClient({
  initialLearnedBasePieceIds = [],
  isAdmin = false,
  initialTab = "gear",
  readOnly = false,
  initialPayload,
  sharedTransmissionTitle,
  sharedTransmissionSlug,
  sharedTransmissionId,
  isOwner = false,
}: BuilderExperimentClientProps) {
  const { data: session, status: sessionStatus } = useSession();
  const isSignedIn =
    sessionStatus === "authenticated" && Boolean(session?.user?.id);
  const currentUserId = session?.user?.id;

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const editSlug = searchParams?.get("edit");
  const loadSlug = searchParams?.get("load");
  const targetTransmissionSlug = editSlug || loadSlug;

  const [masterTab, setMasterTab] = React.useState<"gear" | "perks" | "biometrics" | "combat">(
    (tabParam === "gear" || tabParam === "perks" || tabParam === "biometrics" || tabParam === "combat")
      ? tabParam
      : initialTab
  );

  React.useEffect(() => {
    if (tabParam === "gear" || tabParam === "perks" || tabParam === "biometrics" || tabParam === "combat") {
      setMasterTab(tabParam);
    }
  }, [tabParam]);

  const switchTab = React.useCallback((newTab: "gear" | "perks" | "biometrics" | "combat") => {
    setMasterTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (!readOnly) {
        url.pathname = "/build";
      }
      url.searchParams.set("tab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  }, [readOnly]);

  const { mods, loadError } = useBuilderModCatalog();

  // Persistence state
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (isMounted) {
      triggerBuilderAchievement("diagnostic_access");
    }
  }, [isMounted]);

  const clearPickRef = React.useRef<() => void>(() => {});
  const {
    payload,
    setPayload,
    activeWeaponId,
    setActiveWeaponId,
    setActiveChassisId,
    savedLoadouts,
    setSavedLoadouts,
    activeLoadoutIndex,
    switchboardState,
    setSwitchboardState,
    equippedPerkCards,
    setEquippedPerkCards,
    isNdImportOpen,
    setIsNdImportOpen,
    importedBuildForPerkBuilder,
    piece,
    pieceMaxLevel,
    activeWeaponPiece,
    activeWeaponAttachments,
    activeChassisPiece,
    isPA,
    isMultiPiece,
    baseStarsContextLabel,
    buffSpecial,
    selectActiveWeapon,
    setBase,
    setArmorCraftingField,
    clearPiece,
    setWeaponInnateSlot,
    saveLoadout,
    loadLoadout,
    handlePerkLoadoutChange,
    handleApplyNdBuild,
  } = useBuilderPayload({
    initialPayload,
    readOnly,
    isMounted,
    mods,
    onClearPick: () => clearPickRef.current(),
  });

  const { map: localProgress } = useLocalProgress(true);
  const [weaponSubMenu, setWeaponSubMenu] = React.useState<"attachments" | "stars" | "matrix">("attachments");
  const isCompactDensity = useDensityCompact();
  const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);

  const {
    showBetaPrompt,
    setShowBetaPrompt,
    hasBuilderAccess,
    acceptBuilderBeta,
  } = useBuilderBootstrap({
    isAdmin,
    readOnly,
    isMounted,
    setIsMounted,
    setPayload,
    setSavedLoadouts,
  });

  const {
    learnedBasePieceIds,
    learnedToggleError,
    pendingLearnedPieceId,
    currentBaseLearned,
    toggleLearnedBasePiece,
  } = useLearnedBasePieces({
    initialLearnedBasePieceIds,
    isSignedIn,
    piece,
  });


  const {
    equippedModsOrdered,
    groupedLegendaryEffects,
    perkDeckDefensiveLayer,
    defensiveProfile,
    intrinsicBenchTotals,
    stanceAndBiometricsLayer,
    totals,
  } = useBuilderTotals({
    payload,
    mods,
    activeChassisPiece,
    piece,
    isPA,
    equippedPerkCards,
    switchboardState,
    isFiringHeavyGun: activeWeaponPiece?.weaponSub === "heavy",
  });

  const weaponFirepowerResult = React.useMemo(() => {
    const targetWeapon = activeWeaponPiece;
    return calculateCombatFirepower({
      weaponId: targetWeapon.id,
      weaponCrafting: payload.weaponCrafting,
      equippedMods: equippedModsOrdered,
      equippedPerks: equippedPerkCards,
      activeBuffs: {
        activeDrug: switchboardState?.activeDrug,
        activeFood: switchboardState?.activeFood,
        activeFoods: switchboardState?.activeFoods ? Object.values(switchboardState.activeFoods) : [],
        activeBobblehead: switchboardState?.activeBobblehead,
        activeMagazine: switchboardState?.activeMagazine,
        activeAlcohol: switchboardState?.activeAlcohol,
        activeMutations: payload.mutationIds,
      },
      playerStats: {
        agility: totals.agi,
        luck: totals.lck,
        strength: totals.str,
        healthPct: switchboardState?.healthPct ?? 20,
        caps: switchboardState?.caps ?? 30000,
        isPowerArmor: isPA,
        hasStrangeInNumbers: payload.hasStrangeInNumbers,
        timeOfDay: switchboardState?.timeOfDay ?? "day",
        isCrouched: Boolean(switchboardState?.combatStance?.isCrouched || switchboardState?.combatStance?.isSneaking),
        isAiming: Boolean(switchboardState?.combatStance?.isAiming),
        isPowerAttacking: Boolean(switchboardState?.combatStance?.isPowerAttacking),
        isSprinting: Boolean(switchboardState?.combatStance?.isSprinting),
        isStationary: Boolean(switchboardState?.combatStance?.isStationary),
        isInVats: Boolean(switchboardState?.combatStance?.isInVats),
        vatsCritEveryOtherShot: Boolean(switchboardState?.combatStance?.vatsCritEveryOtherShot),
        addictionsCount: switchboardState?.addictionsCount ?? 0,
        adrenalineStacks: switchboardState?.adrenalineStacks ?? 0,
        bulletStormStacks: switchboardState?.bulletStormStacks ?? 0,
        onslaughtStacks: switchboardState?.onslaughtStacks ?? 0,
        killStreak: switchboardState?.killStreak ?? switchboardState?.adrenalineStacks ?? 0,
        tenderizerStacks: switchboardState?.tenderizerStacks ?? 0,
        targetBleeding: Boolean(switchboardState?.targetBleeding),
        targetBurning: Boolean(switchboardState?.targetBurning),
        targetPoisoned: Boolean(switchboardState?.targetPoisoned),
        targetCrippledLimbs: switchboardState?.targetCrippledLimbs ?? 0,
        feralPct: switchboardState?.feralPct ?? 100,
        foodState: switchboardState?.foodState,
        thirstState: switchboardState?.thirstState,
      },
    });
  }, [
    activeWeaponPiece,
    payload.weaponCrafting,
    equippedModsOrdered,
    equippedPerkCards,
    switchboardState,
    payload.mutationIds,
    payload.hasStrangeInNumbers,
    totals.agi,
    totals.lck,
    totals.str,
    isPA,
  ]);


  const shopping = React.useMemo(
    () =>
      buildShoppingList(equippedModsOrdered, {
        underarmor: payload.underarmor,
        pieceKind: piece.kind,
        isMultiPiece,
        isUnique: isUniqueBaseItem(piece.id),
      }),
    [equippedModsOrdered, payload.underarmor, piece.kind, piece.id, isMultiPiece],
  );

  const {
    activePick,
    setActivePick,
    slotQuery,
    setSlotQuery,
    deferredSlotQuery,
    modalTrackerFilter,
    setModalTrackerFilter,
    undoPayload,
    recommendedIds,
    optionsForActivePick,
    assignSlot,
    clearStarSlot,
    clearAllSelections,
    undoClear,
  } = useLegendaryBench({
    payload,
    setPayload,
    mods,
    activeWeaponPiece,
    activeChassisPiece,
    localProgress,
  });

  React.useEffect(() => {
    clearPickRef.current = () => setActivePick(null);
  }, [setActivePick]);


  const {
    shareTitle,
    setShareTitle,
    shareBusy,
    shareResult,
    shareCopied,
    setShareCopied,
    activeTransmission,
    transmissionLoading,
    updateBusy,
    updateStatus,
    shareBuild,
    updateTransmission,
    exitTransmissionMode,
  } = useBuilderShare({
    piece,
    payload,
    setPayload,
    equippedPerkCards,
    setEquippedPerkCards,
    activeWeaponId,
    setActiveWeaponId,
    setActiveChassisId,
    switchboardState,
    setSwitchboardState,
    sharedTransmissionTitle,
    targetTransmissionSlug,
    isMounted,
    currentUserId,
    isAdmin,
  });


  return (
    <div className="space-y-6">
      {/* Pip-Boy / CRT Terminal Theme Injection */}
      <style>{`
        @keyframes crt-pulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }
        @keyframes scanline-flicker {
          0% { opacity: 0.22; }
          50% { opacity: 0.26; }
          100% { opacity: 0.23; }
        }
        .pip-terminal-panel {
          border: 1px solid color-mix(in srgb, var(--color-accent) 24%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 2.5%, var(--color-bg));
          box-shadow: inset 0 0 12px color-mix(in srgb, var(--color-accent) 4.5%, transparent), var(--shadow-panel);
          position: relative;
          overflow: hidden;
        }
        .pip-terminal-panel.fixed {
          position: fixed !important;
        }
        .pip-terminal-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            180deg,
            color-mix(in srgb, var(--color-accent) 4%, transparent) 0px,
            color-mix(in srgb, var(--color-accent) 4%, transparent) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.25;
          z-index: 10;
        }
        .crt-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: color-mix(in srgb, var(--color-accent) 40%, transparent);
          box-shadow: 0 0 8px var(--color-accent);
          pointer-events: none;
          z-index: 9;
          animation: scan-sweep 6s linear infinite;
        }
      `}</style>

      {/* Main Terminal Shell Title Header (Visually aligned with P.E.R.K.) */}
      <div className="rounded-[var(--radius-lg)] border border-emerald-500/40 bg-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 animate-pulse" />{" "}
              {readOnly ? "VAULT-TEC ARCHIVAL TRANSMISSION // SPECTATOR LOADOUT" : "VAULT-TEC PUNCH CARD MACHINE // B.U.I.L.D. SANDBOX"}
            </span>
            <h1 className="text-3xl font-bold tracking-tight mt-1 font-mono text-white">
              {readOnly ? (sharedTransmissionTitle || shareTitle || "Wasteland Loadout Spec") : "B.U.I.L.D. Loadout Manager"}
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-mono">
              {readOnly
                ? `Unified 4-Tab Transmission Spec · ${sharedTransmissionSlug ? `ID: ${sharedTransmissionSlug}` : "Verified Build"}`
                : "Battle Utility & Inventory Logistics Diagnostic System"}
            </p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-2 font-mono text-xs">
            {readOnly ? (
              <div className="flex flex-wrap items-center gap-2">
                {/* Global Species Badge */}
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-slate-900/90 px-3 py-1.5 shadow-md">
                  <span>{payload.ghoul ? "☣️" : "👤"}</span>
                  <span className="font-bold text-xs uppercase text-slate-200">
                    {payload.ghoul ? "PLAYABLE GHOUL" : "HUMAN"}
                  </span>
                </div>

                {/* Clone / Fork in Builder */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    try {
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(BUILDER_STORAGE_KEYS.activeBuilderPayload, JSON.stringify(payload));
                        window.localStorage.setItem(BUILDER_STORAGE_KEYS.equippedPerks, JSON.stringify(equippedPerkCards));
                        if (switchboardState) {
                          window.localStorage.setItem(BUILDER_STORAGE_KEYS.combatSwitchboardState, JSON.stringify(switchboardState));
                        }
                      }
                    } catch {}
                    window.location.href = "/build";
                  }}
                  className="h-8 px-3 text-[0.72rem] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                  title="Clone this loadout into your interactive B.U.I.L.D. workspace"
                >
                  <GitFork className="h-3.5 w-3.5" />
                  Clone in Builder
                </Button>

                {/* Copy Share Link */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const fullUrl = typeof window !== "undefined" ? window.location.href : "";
                    if (fullUrl) {
                      navigator.clipboard.writeText(fullUrl);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }}
                  className="h-8 px-3 text-[0.72rem] font-bold uppercase tracking-wider rounded border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {shareCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" /> COPY TRANSMISSION LINK
                    </>
                  )}
                </Button>

                {/* Edit Transmission if Owner */}
                {isOwner && sharedTransmissionSlug && (
                  <Link
                    href={`/build?transmission=${encodeURIComponent(sharedTransmissionSlug)}`}
                    className="h-8 px-3 text-[0.72rem] font-bold uppercase tracking-wider rounded border border-amber-500/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition-all flex items-center gap-1.5"
                  >
                    <Radio className="h-3.5 w-3.5 text-amber-400" />
                    Edit Transmission
                  </Link>
                )}

                <Link
                  href="/build"
                  className="h-8 px-3 text-[0.72rem] font-bold uppercase tracking-wider rounded border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  New Build ↗
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {/* Global Species Selector (Human vs Playable Ghoul) */}
                <div className="flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-slate-900/90 p-1 shadow-md">
                  <button
                    type="button"
                    onClick={() => {
                      setPayload((p) => ({ ...p, ghoul: false }));
                      triggerBuilderAchievement("build_biometrics");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer",
                      !payload.ghoul
                        ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <span>👤</span>
                    <span>HUMAN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayload((p) => {
                        const base = { ...p, ghoul: true };
                        if (mods.length > 0) return stripGhoulBlockedLegendarySelections(base, mods);
                        return base;
                      });
                      triggerBuilderAchievement("build_biometrics");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer",
                      payload.ghoul
                        ? "bg-lime-500 text-slate-950 font-black shadow-[0_0_15px_rgba(132,204,22,0.5)] animate-pulse"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <span>☣️</span>
                    <span>PLAYABLE GHOUL</span>
                  </button>
                </div>

                {/* Active Transmission Editing Banner */}
                {activeTransmission && (
                  <div className="flex items-center gap-2 rounded border border-amber-500/60 bg-amber-950/50 px-2.5 py-1 text-xs backdrop-blur-sm">
                    <Radio className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
                    <div className="flex items-center gap-1 font-mono text-[0.7rem]">
                      <span className="text-amber-400 font-black uppercase">
                        {activeTransmission.isOwner ? "TRANSMISSION:" : "VIEWING:"}
                      </span>
                      <span className="text-amber-200 font-bold max-w-[120px] sm:max-w-[180px] truncate" title={activeTransmission.title}>
                        {activeTransmission.title}
                      </span>
                    </div>
                    {activeTransmission.isOwner && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={updateTransmission}
                        disabled={updateBusy}
                        className="h-7 px-2.5 text-[0.68rem] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all shrink-0 flex items-center gap-1"
                      >
                        <RefreshCw className={cn("h-3 w-3", updateBusy && "animate-spin")} />
                        {updateBusy ? "SAVING..." : "UPDATE"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={exitTransmissionMode}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-amber-900/40 shrink-0"
                      title="Exit transmission mode"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Publish / Clone Controls */}
                <div className="flex items-center gap-1 rounded border border-emerald-500/50 bg-emerald-950/40 p-0.5">
                  <Input
                    className="h-8 w-36 sm:w-44 text-xs bg-transparent border-0 font-mono text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-2.5"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="Loadout name..."
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 px-3 text-[0.72rem] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all shrink-0 flex items-center gap-1.5"
                    onClick={shareBuild}
                    disabled={shareBusy}
                    title={activeTransmission ? "Publish as a new transmission" : "Publish transmission to vault"}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {shareBusy ? "PUBLISHING..." : activeTransmission ? "SAVE AS NEW" : "PUBLISH"}
                  </Button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsNdImportOpen(true)}
                  className="h-8 px-3 text-[0.72rem] font-bold uppercase tracking-wider rounded border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Import N&amp;D Spec
                </Button>

                <a
                  className="rounded border border-emerald-500/60 bg-emerald-950/30 px-3 py-2 text-emerald-400 font-bold hover:bg-emerald-900/50 transition-all flex items-center gap-1"
                  href="https://nukaknights.com/articles/expected-changes-for-the-backwoods-update-on-3rd-march-2026.html#armor"
                  target="_blank"
                  rel="noreferrer"
                >
                  Resist Matrix Notes
                </a>
                <a
                  className="rounded border border-emerald-500/60 bg-emerald-950/30 px-3 py-2 text-emerald-400 font-bold hover:bg-emerald-900/50 transition-all flex items-center gap-1"
                  href="https://nukesdragons.com/fallout-76/character"
                  target="_blank"
                  rel="noreferrer"
                >
                  N&amp;D Overlay Spec
                </a>
              </div>
            )}

            {/* Transmission Loading Indicator */}
            {transmissionLoading && (
              <div className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/40 px-2.5 py-1 text-xs text-amber-300 font-mono animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>LOADING TRANSMISSION DATA...</span>
              </div>
            )}

            {/* Update Status Overlay */}
            {updateStatus && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded px-2.5 py-1 text-xs font-mono font-bold animate-in fade-in",
                  updateStatus.type === "success"
                    ? "bg-emerald-950/90 border border-emerald-500/60 text-emerald-300"
                    : "bg-red-950/90 border border-red-500/60 text-red-300"
                )}
              >
                {updateStatus.type === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                )}
                <span>{updateStatus.text}</span>
              </div>
            )}

            {/* Share Result Status Overlay */}
            {shareResult?.startsWith("/") ? (
              <div className="flex items-center gap-2 rounded border border-emerald-500/50 bg-emerald-950/80 px-2.5 py-1 text-xs text-emerald-300 font-bold animate-pulse">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <Link className="underline hover:text-white" href={shareResult}>
                  OPEN TRANSMISSION
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${shareResult}` : shareResult;
                    navigator.clipboard.writeText(fullUrl);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  }}
                  className="ml-1 flex items-center gap-1 text-[0.68rem] px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 uppercase transition-colors"
                >
                  {shareCopied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> COPY LINK
                    </>
                  )}
                </button>
              </div>
            ) : shareResult ? (
              <div className="rounded border border-red-500/40 bg-red-950/60 px-2.5 py-1 text-[0.72rem] text-red-300 font-bold">
                &gt;&gt; ERROR: {shareResult}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="pip-terminal-panel p-4 rounded-lg font-mono text-xs text-warning/90 border-warning/30 bg-warning/5">
          &gt;&gt; ERROR: {loadError}
        </div>
      ) : null}

      {/* MASTER WORKSPACE NAVIGATION BAR */}
      <BuilderMasterTabNav masterTab={masterTab} switchTab={switchTab} weaponFirepowerResult={weaponFirepowerResult} />

      {/* VIEWPORT: PERK DECK & SPECIAL (TAB 2) */}
      <PerkDeckTab
        active={masterTab === "perks"}
        readOnly={readOnly}
        baseSpecial={payload.baseSpecial}
        equippedPerkCards={equippedPerkCards}
        legendaryPerkIds={payload.legendaryPerkIds}
        importedBuildForPerkBuilder={importedBuildForPerkBuilder}
        handlePerkLoadoutChange={handlePerkLoadoutChange}
      />


      {/* VIEWPORT: BIOMETRICS & CHARACTER PANEL (TAB 3) */}
      <BiometricsTab
        active={masterTab === "biometrics"}
        readOnly={readOnly}
        switchboardState={switchboardState}
        setSwitchboardState={setSwitchboardState}
        weaponFirepowerResult={weaponFirepowerResult}
        payload={payload}
        setPayload={setPayload}
        activeTacticalTags={stanceAndBiometricsLayer.activeTacticalTags}
        defensiveProfile={defensiveProfile}
        playerResists={{ dr: totals.dr, er: totals.er }}
      />


      {/* VIEWPORT: COMBAT DPS & VATS (TAB 4) */}
      <CombatDpsTab active={masterTab === "combat"} weaponFirepowerResult={weaponFirepowerResult} />

      {/* VIEWPORT: GEAR & ARMORY (TAB 1) */}
      <div className={cn("space-y-6 animate-in fade-in duration-200", masterTab === "gear" ? "block" : "hidden")}>
          {/* Three Pane Responsive Tactical Grid */}
          <div className="grid gap-6 xl:grid-cols-[280px_1fr_325px] lg:grid-cols-[250px_1fr_280px] grid-cols-1">
        
        {/* COLUMN 1: DIAGNOSTICS HUD */}
        <DiagnosticsHudColumn
          payload={payload}
          setPayload={setPayload}
          totals={totals}
          buffSpecial={buffSpecial}
          stanceAndBiometricsLayer={stanceAndBiometricsLayer}
          intrinsicBenchTotals={intrinsicBenchTotals}
          perkDeckDefensiveLayer={perkDeckDefensiveLayer}
          groupedLegendaryEffects={groupedLegendaryEffects}
          mods={mods}
          piece={piece}
        />

        {/* COLUMN 2: CENTER PANEL - REPAIR BAY SILHOUETTE & FULL LOADOUT COMPILATION */}
        <ChassisBayColumn
          payload={payload}
          setPayload={setPayload}
          activeChassisPiece={activeChassisPiece}
          activeWeaponPiece={activeWeaponPiece}
          piece={piece}
          isPA={isPA}
          mods={mods}
          activeWeaponAttachments={activeWeaponAttachments}
          weaponFirepowerResult={weaponFirepowerResult}
          localProgress={localProgress}
          weaponSubMenu={weaponSubMenu}
          setWeaponSubMenu={setWeaponSubMenu}
          selectActiveWeapon={selectActiveWeapon}
          setWeaponInnateSlot={setWeaponInnateSlot}
          clearPiece={clearPiece}
          setArmorCraftingField={setArmorCraftingField}
          clearStarSlot={clearStarSlot}
          setActivePick={setActivePick}
          readOnly={readOnly}
        />

        {/* COLUMN 3: AUX LOGISTICS & PRESETS */}
        <AuxLogisticsColumn
          readOnly={readOnly}
          activeLoadoutIndex={activeLoadoutIndex}
          savedLoadouts={savedLoadouts}
          loadLoadout={loadLoadout}
          saveLoadout={saveLoadout}
          clearAllSelections={clearAllSelections}
          undoPayload={undoPayload}
          undoClear={undoClear}
          shopping={shopping}
        />

      </div>

      {/* BOTTOM SECTION: Tactile Armory Station & Aux Base Picker */}
      <ArmoryMatrixSection
        payload={payload}
        setPayload={setPayload}
        setBase={setBase}
        activeChassisPiece={activeChassisPiece}
        activeWeaponPiece={activeWeaponPiece}
        piece={piece}
        isPA={isPA}
        pieceMaxLevel={pieceMaxLevel}
        learnedBasePieceIds={learnedBasePieceIds}
        totals={totals}
        groupedLegendaryEffects={groupedLegendaryEffects}
        mods={mods}
        shopping={shopping}
        setIsComparisonOpen={setIsComparisonOpen}
        currentBaseLearned={currentBaseLearned}
        isSignedIn={isSignedIn}
        pendingLearnedPieceId={pendingLearnedPieceId}
        readOnly={readOnly}
        toggleLearnedBasePiece={toggleLearnedBasePiece}
        learnedToggleError={learnedToggleError}
      />
    </div>

      {/* Dialog Overlay Mod Picker with customized Fallout styling */}
      <LegendaryModPickerDialog
        activePick={activePick}
        setActivePick={setActivePick}
        slotQuery={slotQuery}
        setSlotQuery={setSlotQuery}
        deferredSlotQuery={deferredSlotQuery}
        modalTrackerFilter={modalTrackerFilter}
        setModalTrackerFilter={setModalTrackerFilter}
        isCompactDensity={isCompactDensity}
        activeWeaponPiece={activeWeaponPiece}
        activeChassisPiece={activeChassisPiece}
        baseStarsContextLabel={baseStarsContextLabel}
        piece={piece}
        ghoulMode={payload.ghoul}
        optionsForActivePick={optionsForActivePick}
        recommendedIds={recommendedIds}
        localProgress={localProgress}
        assignSlot={assignSlot}
      />

      {/* Beta access overlay gate */}
      <BuilderBetaGate
        open={showBetaPrompt && !hasBuilderAccess}
        onAccept={() => {
          acceptBuilderBeta();
          setShowBetaPrompt(false);
        }}
        onCancel={() => {
          window.location.href = "/";
        }}
      />

      {/* GEAR COMPARISON MATRIX MODAL */}
      <BuilderGearComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      {/* NUKES & DRAGONS IMPORT MODAL */}
      <NukesDragonsImportModal
        isOpen={isNdImportOpen}
        onClose={() => setIsNdImportOpen(false)}
        onApplyBuild={handleApplyNdBuild}
      />
    </div>
  );
}
