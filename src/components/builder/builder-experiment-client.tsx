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
import { areEquippedCardsEqual } from "@/lib/perks/catalog";
import NukesDragonsImportModal from "@/components/perks/nukes-dragons-import-modal";
import type { NukesDragonsParsedBuild } from "@/lib/perks/nukes-dragons-parser";
import type { LocalTransmissionRecord } from "@/components/transmissions/transmissions-vault-client";
import { OFFICIAL_SPECIAL_THEMES } from "@/lib/perks/special-theme";
import { updateLearnedBasePiece } from "@/actions/learned-base-piece";
import { SLOT_LABELS, type ActivePick } from "@/lib/builder/active-pick";
import { BUILDER_STORAGE_KEYS, perkLoadoutSlotKey } from "@/lib/builder/storage-keys";
import { useDensityCompact } from "@/lib/hooks/use-density-compact";
import BuilderMasterTabNav from "@/components/builder/builder-master-tab-nav";
import LegendaryModPickerDialog from "@/components/builder/legendary-mod-picker-dialog";
import PerkDeckTab from "@/components/builder/tabs/perk-deck-tab";
import BiometricsTab from "@/components/builder/tabs/biometrics-tab";
import CombatDpsTab from "@/components/builder/tabs/combat-dps-tab";
import DiagnosticsHudColumn from "@/components/builder/tabs/gear/diagnostics-hud-column";
import AuxLogisticsColumn from "@/components/builder/tabs/gear/aux-logistics-column";
import ArmoryMatrixSection from "@/components/builder/tabs/gear/armory-matrix-section";
import { useBuilderModCatalog } from "@/components/builder/hooks/use-builder-mod-catalog";
import { useBuilderTotals } from "@/components/builder/hooks/use-builder-totals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { type CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";
import { calculateAggregatedBuffSpecial } from "@/lib/builder/buff-stacking-engine";
import { calculateCombatFirepower, getWeaponMaxLevel } from "@/lib/builder/combat-firepower-engine";
import BuilderGearComparisonModal from "@/components/builder/builder-gear-comparison-modal";
import {
  ARMOR_SET_ROWS,
  getArmorSetRow,
  getArmorSetMaxLevel,
} from "@/lib/builder/armor-sets";
import { getPowerArmorMaxLevel } from "@/lib/builder/power-armor-frame-data";
import {
  ARMOR_MATERIAL_MODS,
  listArmorMiscModOptions,
  defaultArmorPieceCrafting,
} from "@/lib/builder/armor-piece-mods";
import {
  BASE_GEAR_PIECES,
  formatBaseOptionLabel,
  getBaseGearPiece,
  getGroupedWeaponCategories,
  isPowerArmorTorsoBasePiece,
  isPowerArmorTorsoRowLearned,
  isTrackableBasePieceId,
  pairedPowerArmorHelmetId,
} from "@/lib/builder/base-gear";
import {
  BUILDER_SPECIAL_KEYS,
  BUILDER_SPECIAL_LABELS,
  SPECIAL_FULL_NAMES,
  RESIST_FULL_NAMES,
  buildShoppingList,
  filterModsForSlot,
  findModByIdOrSlug,
  stripGhoulBlockedLegendarySelections,
  weaponSubMatches,
  type BuilderEffectTotals,
} from "@/lib/builder/compatibility";
import { isGhoulDiscouragedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import {
  defaultPayload,
  emptyArmorLegendaryGrid,
  normalizeBuilderPayload,
} from "@/lib/builder/normalize-builder-payload";
import {
  DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  type BuilderPayload,
} from "@/lib/builder/types";
import { useLocalProgress } from "@/components/use-local-progress";
import { findLocalProgressEntry } from "@/lib/progress-lookup";
import {
  listWeaponInnateModOptions,
  defaultWeaponInnateCrafting,
  getWeaponInnateModOption,
  calculateWeaponInnateAggregate,
  listWeaponAvailableSlots,
  type WeaponInnateSlotKey,
} from "@/lib/builder/weapon-piece-mods";
import { cn } from "@/lib/utils";
import {
  BuilderBetaGate,
  useBuilderBetaAccess,
} from "@/components/builder/builder-beta-gate";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES,
} from "@/lib/builder/underarmor";
import { triggerBuilderAchievement } from "@/actions/builder-achievements";
import { LEGENDARY_PERK_CARDS } from "@/lib/builder/compatibility";

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
  const [payload, setPayload] = React.useState<BuilderPayload>(() => {
    if (initialPayload) {
      return normalizeBuilderPayload(initialPayload) || initialPayload;
    }
    return defaultPayload();
  });

  const [activeWeaponId, setActiveWeaponId] = React.useState<string>(() => {
    if (initialPayload?.activeWeaponPieceId) {
      return initialPayload.activeWeaponPieceId;
    }
    const defaultWeap = BASE_GEAR_PIECES.find(p => p.kind === "weapon")?.id || "fixer";
    return defaultWeap;
  });
  const [activeChassisId, setActiveChassisId] = React.useState<string>(() => {
    const defaultArm = BASE_GEAR_PIECES.find(p => p.kind === "armor")?.id || "armor-set-civil-engineer";
    return defaultArm;
  });

  const [undoPayload, setUndoPayload] = React.useState<BuilderPayload | null>(
    null,
  );

  React.useEffect(() => {
    if (isMounted) {
      triggerBuilderAchievement("diagnostic_access");
    }
  }, [isMounted]);

  const [savedLoadouts, setSavedLoadouts] = React.useState<
    { id: string; name: string; payload: BuilderPayload }[]
  >([]);

  const { map: localProgress } = useLocalProgress(true);
  const [weaponSubMenu, setWeaponSubMenu] = React.useState<"attachments" | "stars" | "matrix">("attachments");
  const [modalTrackerFilter, setModalTrackerFilter] = React.useState<"all" | "unlocked" | "stash">("all");

  const [activePick, setActivePick] = React.useState<ActivePick>(null);
  const [slotQuery, setSlotQuery] = React.useState("");
  const deferredSlotQuery = React.useDeferredValue(slotQuery);
  const isCompactDensity = useDensityCompact();
  const [shareTitle, setShareTitle] = React.useState(sharedTransmissionTitle || "B.U.I.L.D. Loadout");
  const [shareBusy, setShareBusy] = React.useState(false);
  const [shareResult, setShareResult] = React.useState<string | null>(null);
  const [shareCopied, setShareCopied] = React.useState(false);

  // Active transmission management (loaded from /transmissions or /l/[slug])
  const [activeTransmission, setActiveTransmission] = React.useState<{
    id: string;
    slug: string;
    title: string;
    description?: string;
    isOwner: boolean;
    editToken?: string;
  } | null>(null);
  const [transmissionLoading, setTransmissionLoading] = React.useState(false);
  const [updateBusy, setUpdateBusy] = React.useState(false);
  const [updateStatus, setUpdateStatus] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isNdImportOpen, setIsNdImportOpen] = React.useState(false);
  const [importedBuildForPerkBuilder, setImportedBuildForPerkBuilder] =
    React.useState<{ build: NukesDragonsParsedBuild; timestamp: number } | null>(null);
  const [learnedBasePieceIds, setLearnedBasePieceIds] = React.useState(
    () => new Set(initialLearnedBasePieceIds),
  );
  const [learnedToggleError, setLearnedToggleError] = React.useState<
    string | null
  >(null);
  const [pendingLearnedPieceId, setPendingLearnedPieceId] = React.useState<
    string | null
  >(null);

  const [activeLoadoutIndex, setActiveLoadoutIndex] = React.useState<
    number | null
  >(null);
  const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);
  const internalUpdateRef = React.useRef(false);
  const [switchboardState, setSwitchboardState] = React.useState<CombatSwitchboardState | null>(() => {
    if (initialPayload?.switchboardState && typeof initialPayload.switchboardState === "object") {
      return initialPayload.switchboardState as unknown as CombatSwitchboardState;
    }
    return null;
  });

  const [equippedPerkCards, setEquippedPerkCards] = React.useState<
    { cardId: string; rank: number }[]
  >(() => {
    if (Array.isArray(initialPayload?.equippedPerkCards) && initialPayload.equippedPerkCards.length > 0) {
      return initialPayload.equippedPerkCards;
    }
    if (readOnly) return [];
    if (typeof window === "undefined") return [];
    try {
      const activePerkSlot = localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
      const perkSlotStr = localStorage.getItem(perkLoadoutSlotKey(activePerkSlot));
      if (!perkSlotStr) return [];
      const perkData = JSON.parse(perkSlotStr);
      return Array.isArray(perkData.equippedCards) ? (perkData.equippedCards as { cardId: string; rank: number }[]) : [];
    } catch {
      return [];
    }
  });

  const buffSpecial = React.useMemo(() => {
    if (!switchboardState) return { totals: { str: 0, per: 0, end: 0, cha: 0, int: 0, agi: 0, lck: 0 }, breakdown: [] };
    return calculateAggregatedBuffSpecial({
      activeCampBuffs: switchboardState.activeCampBuffs,
      activeDrug: switchboardState.activeDrug,
      activeFood: switchboardState.activeFood,
      activeFoods: switchboardState.activeFoods,
      activeBobblehead: switchboardState.activeBobblehead,
      activeMagazine: switchboardState.activeMagazine,
      activeAlcohol: switchboardState.activeAlcohol,
      activeNukaCola: switchboardState.activeNukaCola,
      activeCompanion: switchboardState.activeCompanion,
      activeMutations: payload.mutationIds,
      hasStrangeInNumbers: payload.hasStrangeInNumbers,
    });
  }, [switchboardState, payload.mutationIds, payload.hasStrangeInNumbers]);

  const { hasAccess: hasBuilderAccess, accept: acceptBuilderBeta } =
    useBuilderBetaAccess(isAdmin);
  const [showBetaPrompt, setShowBetaPrompt] = React.useState(false);

  React.useEffect(() => {
    if (readOnly) {
      setIsMounted(true);
      return;
    }
    try {
      const saved = localStorage.getItem(BUILDER_STORAGE_KEYS.payload);
      if (saved) {
        const parsed = JSON.parse(saved);
        const norm = normalizeBuilderPayload(parsed) || parsed;
        if (norm && typeof norm === "object" && (norm.basePieceId || norm.equipmentKind)) {
          setPayload(norm as BuilderPayload);
        }
      }

      const savedSlots = localStorage.getItem(BUILDER_STORAGE_KEYS.saves);
      if (savedSlots) {
        const parsedSlots = JSON.parse(savedSlots);
        if (Array.isArray(parsedSlots)) {
          setSavedLoadouts(parsedSlots);
        }
      }

      // Sync P.E.R.K. punch card machine loadout into B.U.I.L.D.
      try {
        const activePerkSlot = localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
        const perkSlotStr = localStorage.getItem(perkLoadoutSlotKey(activePerkSlot));
        if (perkSlotStr) {
          const perkData = JSON.parse(perkSlotStr);
          if (perkData) {
            setPayload((prev) => {
              const next = { ...prev };
              if (perkData.specials && Object.keys(perkData.specials).length > 0) {
                const s = perkData.specials;
                if (!next.baseSpecial || Object.keys(next.baseSpecial).length === 0) {
                  next.baseSpecial = {
                    str: s.S ?? 1,
                    per: s.P ?? 1,
                    end: s.E ?? 1,
                    cha: s.C ?? 1,
                    int: s.I ?? 1,
                    agi: s.A ?? 1,
                    lck: s.L ?? 1,
                  };
                }
              }
              if (Array.isArray(perkData.equippedCards) && perkData.equippedCards.length > 0) {
                const legendaryEntries: string[] = [];
                for (const item of perkData.equippedCards) {
                  const cardId = item.cardId;
                  const rank = item.rank || 4;
                  if (cardId in LEGENDARY_PERK_CARDS || cardId.startsWith("legendary-") || ["sizzling-style", "funky-duds", "what-rads", "electric-absorption", "master-infiltrator", "taking-one-for-the-team", "follow-through", "ammo-factory", "brawling-chemist", "hack-and-slash", "far-flung-fireworks", "exploding-palm", "detonation-contagion", "collateral-damage", "blood-sacrifice", "retribution", "power-armor-reboot", "power-sprinter", "survival-shortcut"].includes(cardId)) {
                    legendaryEntries.push(`${cardId}:${rank}`);
                  }
                }
                if (legendaryEntries.length > 0) {
                  next.legendaryPerkIds = Array.from(new Set([...(next.legendaryPerkIds || []), ...legendaryEntries]));
                }
              }
              return next;
            });
          }
        }
      } catch {
        // Ignore perk loadout sync error
      }

      if (!isAdmin && !hasBuilderAccess) {
        setShowBetaPrompt(true);
      }

      // Auto-equip item passed via URL parameter e.g. /build?equip=civil-engineer or /build?equip=fixer
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const equipTarget = searchParams.get("equip") || searchParams.get("gear") || searchParams.get("base") || searchParams.get("q");

        if (equipTarget) {
          const normTarget = equipTarget.toLowerCase().trim();
          const matchPiece = (query: string) => {
            return BASE_GEAR_PIECES.find((p) => {
              const pid = p.id.toLowerCase();
              const pkey = (p.armorSetKey || "").toLowerCase();
              const plabel = p.label.toLowerCase();
              return (
                pid === query ||
                pkey === query ||
                pid === `armor-set-${query}` ||
                pid.includes(query) ||
                plabel.includes(query)
              );
            });
          };

          const found = matchPiece(normTarget);
          if (found) {
            setPayload((prev) => ({
              ...prev,
              basePieceId: found.id,
              equipmentKind: found.kind,
              weaponSub: found.weaponSub ?? null
            }));
          }
        }
      }
    } catch {
      // ignore
    }
    setIsMounted(true);
  }, [isAdmin, hasBuilderAccess, readOnly]);

  // Synchronize state when initialPayload is passed (e.g. read-only shared build view)
  React.useEffect(() => {
    if (initialPayload) {
      const norm = normalizeBuilderPayload(initialPayload) || initialPayload;
      setPayload(norm);
      if (Array.isArray(norm.equippedPerkCards) && norm.equippedPerkCards.length > 0) {
        setEquippedPerkCards(norm.equippedPerkCards);
      }
      if (norm.activeWeaponPieceId) {
        setActiveWeaponId(norm.activeWeaponPieceId);
      }
      if (norm.switchboardState && typeof norm.switchboardState === "object") {
        setSwitchboardState(norm.switchboardState as unknown as CombatSwitchboardState);
      }
      const base = getBaseGearPiece(norm.basePieceId);
      if (base?.kind === "weapon") {
        setActiveWeaponId(base.id);
      } else if (base?.kind === "armor" || base?.kind === "powerArmor") {
        setActiveChassisId(base.id);
      }
    }
  }, [initialPayload]);

  // Synchronize target transmission when ?load=slug or ?edit=slug is provided in URL
  React.useEffect(() => {
    if (!targetTransmissionSlug || !isMounted) return;
    if (activeTransmission?.slug === targetTransmissionSlug) return;

    let cancelled = false;
    setTransmissionLoading(true);

    interface TransmissionResponse {
      success?: boolean;
      data?: {
        id: string;
        slug: string;
        title: string;
        description?: string;
        payload?: Record<string, unknown>;
        userId?: string | null;
        isOwner?: boolean;
      };
    }

    fetch(`/api/builder/transmissions/by-slug/${encodeURIComponent(targetTransmissionSlug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Transmission not found");
        return (await res.json()) as TransmissionResponse;
      })
      .then((json: TransmissionResponse) => {
        if (cancelled || !json?.success || !json?.data) return;
        const item = json.data;

        // Check ownership from session, server isOwner flag, or localStorage roll_my_transmissions
        let localToken: string | undefined;
        try {
          const raw = localStorage.getItem(BUILDER_STORAGE_KEYS.myTransmissions);
          if (raw) {
            const list: LocalTransmissionRecord[] = JSON.parse(raw);
            const match = list.find(
              (x) => x.slug === item.slug || x.id === item.id
            );
            if (match?.editToken) {
              localToken = match.editToken;
            }
          }
        } catch {
          // ignore
        }

        const isOwner = Boolean(
          item.isOwner ||
          localToken ||
          (item.userId && currentUserId && item.userId === currentUserId) ||
          isAdmin
        );

        setActiveTransmission({
          id: item.id,
          slug: item.slug,
          title: item.title,
          description: item.description,
          isOwner,
          editToken: localToken || (typeof item.payload?._editToken === "string" ? item.payload._editToken : undefined),
        });

        if (item.title) {
          setShareTitle(item.title);
        }

        if (item.payload) {
          const norm = normalizeBuilderPayload(item.payload) || item.payload;
          if (norm && typeof norm === "object") {
            setPayload(norm as BuilderPayload);
            const payloadObj = norm as Record<string, unknown>;
            const basePieceId = typeof payloadObj.basePieceId === "string" ? payloadObj.basePieceId : undefined;
            if (basePieceId) {
              const base = getBaseGearPiece(basePieceId);
              if (base?.kind === "weapon") {
                setActiveWeaponId(base.id);
              } else if (base?.kind === "armor" || base?.kind === "powerArmor") {
                setActiveChassisId(base.id);
              }
            }
            if (typeof payloadObj.activeWeaponPieceId === "string" && payloadObj.activeWeaponPieceId) {
              setActiveWeaponId(payloadObj.activeWeaponPieceId);
            }
            if (Array.isArray(payloadObj.equippedPerkCards) && payloadObj.equippedPerkCards.length > 0) {
              setEquippedPerkCards(payloadObj.equippedPerkCards as Array<{ cardId: string; rank: number }>);
            }
            if (payloadObj.switchboardState && typeof payloadObj.switchboardState === "object") {
              setSwitchboardState(payloadObj.switchboardState as unknown as CombatSwitchboardState);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load transmission:", err);
      })
      .finally(() => {
        if (!cancelled) setTransmissionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetTransmissionSlug, isMounted, currentUserId, isAdmin, activeTransmission?.slug]);

  const clearAllSelections = React.useCallback(() => {
    setUndoPayload(payload);
    setPayload((p) => ({
      ...p,
      legendaryModIds: [null, null, null, null],
      armorLegendaryModIds: emptyArmorLegendaryGrid(),
      mutationIds: [],
      legendaryPerkIds: [],
      baseSpecial: {},
    }));
  }, [payload]);

  const undoClear = React.useCallback(() => {
    if (undoPayload) {
      setPayload(undoPayload);
      setUndoPayload(null);
    }
  }, [undoPayload]);

  const clearPiece = React.useCallback((payloadIndex: number) => {
    setPayload((prev) => {
      const nextCrafting = [...prev.armorPieceCrafting];
      nextCrafting[payloadIndex] = { materialModId: "none", miscModId: "none" };

      const nextStars = [...prev.armorLegendaryModIds];
      nextStars[payloadIndex] = [null, null, null, null];

      let nextEquipped = prev.powerArmorPiecesEquipped;
      if (prev.equipmentKind === "powerArmor") {
        const mask = [...prev.powerArmorPiecesEquipped] as unknown as [
          boolean,
          boolean,
          boolean,
          boolean,
          boolean,
          boolean,
        ];
        mask[payloadIndex] = false;
        nextEquipped = mask;
      }

      return {
        ...prev,
        powerArmorPiecesEquipped: nextEquipped,
        armorPieceCrafting: nextCrafting,
        armorLegendaryModIds: nextStars,
      };
    });
  }, []);

  const saveLoadout = React.useCallback(
    (slotIndex: number) => {
      const name = prompt(
        "Enter a name for this loadout slot:",
        savedLoadouts[slotIndex]?.name || `Loadout ${slotIndex + 1}`,
      );
      if (name === null) return;
      setSavedLoadouts((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          id: String(slotIndex),
          name: name || `Loadout ${slotIndex + 1}`,
          payload: {
            ...payload,
            equippedPerkCards,
            activeWeaponPieceId: activeWeaponId,
            switchboardState: switchboardState ? (switchboardState as unknown as Record<string, unknown>) : undefined,
          },
        };

        const filledCount = next.filter(
          (x) => x !== null && x !== undefined,
        ).length;
        triggerBuilderAchievement("build_save");
        if (filledCount >= 10) triggerBuilderAchievement("build_full");

        return next;
      });
      setActiveLoadoutIndex(slotIndex);
    },
    [payload, savedLoadouts, equippedPerkCards, activeWeaponId, switchboardState],
  );

  const loadLoadout = React.useCallback(
    (slotIndex: number) => {
      const saved = savedLoadouts[slotIndex];
      if (saved) {
        internalUpdateRef.current = true;
        const norm = normalizeBuilderPayload(saved.payload) || saved.payload;
        setPayload(norm);
        if (Array.isArray(norm.equippedPerkCards)) {
          setEquippedPerkCards(norm.equippedPerkCards);
        }
        if (norm.activeWeaponPieceId) {
          setActiveWeaponId(norm.activeWeaponPieceId);
        }
        if (norm.switchboardState && typeof norm.switchboardState === "object") {
          setSwitchboardState(norm.switchboardState as unknown as CombatSwitchboardState);
        }
        const base = getBaseGearPiece(norm.basePieceId);
        if (base?.kind === "weapon") {
          setActiveWeaponId(base.id);
        } else if (base?.kind === "armor" || base?.kind === "powerArmor") {
          setActiveChassisId(base.id);
        }
        setActiveLoadoutIndex(slotIndex);
        triggerBuilderAchievement("build_stats");
        triggerBuilderAchievement("build_perks");
      }
    },
    [savedLoadouts],
  );

  React.useEffect(() => {
    if (isMounted && !readOnly) {
      localStorage.setItem(BUILDER_STORAGE_KEYS.payload, JSON.stringify(payload));
    }
  }, [payload, isMounted, readOnly]);

  React.useEffect(() => {
    if (isMounted && !readOnly) {
      localStorage.setItem(BUILDER_STORAGE_KEYS.saves, JSON.stringify(savedLoadouts));
    }
  }, [savedLoadouts, isMounted, readOnly]);

  React.useEffect(() => {
    if (!isMounted) return;
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }
    setActiveLoadoutIndex(null);
  }, [payload, isMounted]);

  React.useEffect(() => {
    setLearnedBasePieceIds(new Set(initialLearnedBasePieceIds));
  }, [initialLearnedBasePieceIds]);



  const piece = getBaseGearPiece(payload.basePieceId) ?? BASE_GEAR_PIECES[0]!;
  
  const pieceMaxLevel = React.useMemo(() => {
    if (!piece) return null;
    if (piece.kind === "weapon") return getWeaponMaxLevel(piece.id);
    if (piece.kind === "armor" && piece.armorSetKey) return getArmorSetMaxLevel(piece.armorSetKey);
    if (piece.kind === "powerArmor") return getPowerArmorMaxLevel(piece.id);
    return null;
  }, [piece]);

  const activeWeaponPiece = React.useMemo(
    () => getBaseGearPiece(activeWeaponId) || BASE_GEAR_PIECES.find((p) => p.kind === "weapon") || BASE_GEAR_PIECES[0],
    [activeWeaponId]
  );

  const isMeleeWeapon = activeWeaponPiece.weaponSub === "melee";

  const activeWeaponAttachments = React.useMemo(() => {
    return calculateWeaponInnateAggregate(activeWeaponPiece.id, payload.weaponCrafting);
  }, [activeWeaponPiece.id, payload.weaponCrafting]);

  const setWeaponInnateSlot = React.useCallback(
    (slot: WeaponInnateSlotKey, modId: string) => {
      setPayload((prev) => {
        const current = prev.weaponCrafting ?? defaultWeaponInnateCrafting(activeWeaponPiece.id);
        const slotKey =
          slot === "receiver"
            ? "receiverId"
            : slot === "barrel"
            ? "barrelId"
            : slot === "stock"
            ? "stockId"
            : slot === "magazine"
            ? "magazineId"
            : slot === "sight"
            ? "sightId"
            : "muzzleId";
        return {
          ...prev,
          weaponCrafting: {
            ...current,
            [slotKey]: modId,
          },
        };
      });
    },
    [activeWeaponPiece.id]
  );

  const groupedWeaponCategories = React.useMemo(() => getGroupedWeaponCategories(), []);

  const activeChassisPiece = React.useMemo(
    () => getBaseGearPiece(activeChassisId) || BASE_GEAR_PIECES.find((p) => p.kind === "armor") || BASE_GEAR_PIECES[0],
    [activeChassisId]
  );

  const isPA = activeChassisPiece.kind === "powerArmor" || piece.kind === "powerArmor";
  const isMultiPiece = true;
  const baseStarsContextLabel = React.useMemo(() => {
    if (activeChassisPiece.kind === "armor" && activeChassisPiece.armorSetKey) {
      return getArmorSetRow(activeChassisPiece.armorSetKey)?.label ?? activeChassisPiece.label;
    }
    return formatBaseOptionLabel(activeChassisPiece);
  }, [activeChassisPiece]);

  const currentBaseLearned =
    isTrackableBasePieceId(piece.id) &&
    (piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)
      ? isPowerArmorTorsoRowLearned(piece.id, learnedBasePieceIds)
      : learnedBasePieceIds.has(piece.id));

  async function toggleLearnedBasePiece(pieceId: string, learned: boolean) {
    setLearnedToggleError(null);
    if (!isSignedIn) return;
    const row = getBaseGearPiece(pieceId);
    const ids =
      row && isPowerArmorTorsoBasePiece(row)
        ? [pieceId, pairedPowerArmorHelmetId(pieceId)].filter(
            (x): x is string => Boolean(x),
          )
        : [pieceId];
    setPendingLearnedPieceId(pieceId);
    try {
      for (const id of ids) {
        await updateLearnedBasePiece({ basePieceId: id, learned });
      }
      setLearnedBasePieceIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) {
          if (learned) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    } catch {
      setLearnedToggleError(
        "Could not update learned bases. Try signing in again.",
      );
    } finally {
      setPendingLearnedPieceId(null);
    }
  }

  React.useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      equipmentKind: piece.kind,
      weaponSub:
        piece.kind === "weapon" ? (piece.weaponSub ?? prev.weaponSub) : null,
    }));
  }, [piece.id, piece.kind, piece.weaponSub]);

  const {
    equippedModsOrdered,
    groupedLegendaryEffects,
    perkDeckDefensiveLayer,
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
    () => buildShoppingList(equippedModsOrdered, { underarmor: payload.underarmor, pieceKind: piece.kind, isMultiPiece }),
    [equippedModsOrdered, payload.underarmor, piece.kind, isMultiPiece],
  );

  const assignSlot = React.useCallback(
    (modId: string) => {
      if (!activePick) return;
      if (activePick.scope === "single") {
        setPayload((p) => {
          const next = [...p.legendaryModIds];
          next[activePick.starIndex] = modId;
          return { ...p, legendaryModIds: next };
        });
      } else {
        setPayload((p) => {
          const grid = p.armorLegendaryModIds.map((row) => [...row]);
          const row = [...grid[activePick.pieceIndex]!];
          row[activePick.starIndex] = modId;
          grid[activePick.pieceIndex] = row;
          return { ...p, armorLegendaryModIds: grid };
        });
      }
      setActivePick(null);
      setSlotQuery("");
    },
    [activePick],
  );

  const recommendedIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (!activePick) return ids;
    if (activePick.scope === "armorSet") {
      for (let i = 0; i < payload.armorLegendaryModIds.length; i++) {
        if (i === activePick.pieceIndex) continue;
        const id = payload.armorLegendaryModIds[i]?.[activePick.starIndex];
        if (id) ids.add(id);
      }
    }
    return ids;
  }, [activePick, payload.armorLegendaryModIds]);

  const optionsForActivePick = React.useMemo(() => {
    if (!activePick) return [];
    const slotIndex = activePick.starIndex;
    const targetPiece = activePick.scope === "single" ? activeWeaponPiece : activeChassisPiece;
    const filtered = filterModsForSlot(mods, targetPiece, slotIndex, {
      ghoul: payload.ghoul,
    }).filter((m) => {
      const q = deferredSlotQuery.trim().toLowerCase();
      if (q) {
        const matchesQuery =
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (modalTrackerFilter !== "all") {
        const entry = findLocalProgressEntry(localProgress, m.id, m.name, `${m.starRank} Star`);
        const isUnlocked = entry?.unlocked ?? (m.trackerUnlock === "unlocked");
        const stashCount = entry?.modCount ?? 0;

        if (modalTrackerFilter === "unlocked" && !isUnlocked) return false;
        if (modalTrackerFilter === "stash" && stashCount <= 0) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const entryA = findLocalProgressEntry(localProgress, a.id, a.name, `${a.starRank} Star`);
      const entryB = findLocalProgressEntry(localProgress, b.id, b.name, `${b.starRank} Star`);
      const unlockedA = (entryA?.unlocked ?? (a.trackerUnlock === "unlocked")) ? 1 : 0;
      const unlockedB = (entryB?.unlocked ?? (b.trackerUnlock === "unlocked")) ? 1 : 0;
      const stashA = (entryA?.modCount ?? 0) > 0 ? 1 : 0;
      const stashB = (entryB?.modCount ?? 0) > 0 ? 1 : 0;

      const recA = recommendedIds.has(a.id) ? 1 : 0;
      const recB = recommendedIds.has(b.id) ? 1 : 0;
      if (recA !== recB) return recB - recA;

      // Status prioritization: unlocked > stash > locked
      const statusScoreA = unlockedA * 2 + stashA;
      const statusScoreB = unlockedB * 2 + stashB;
      if (statusScoreA !== statusScoreB) return statusScoreB - statusScoreA;

      if (payload.ghoul) {
        const discA = isGhoulDiscouragedLegendarySlug(a.slug) ? 1 : 0;
        const discB = isGhoulDiscouragedLegendarySlug(b.slug) ? 1 : 0;
        if (discA !== discB) return discA - discB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [
    mods,
    activeWeaponPiece,
    activeChassisPiece,
    activePick,
    deferredSlotQuery,
    modalTrackerFilter,
    localProgress,
    payload.ghoul,
    recommendedIds,
  ]);

  const selectActiveWeapon = React.useCallback(
    (id: string) => {
      const next = getBaseGearPiece(id);
      if (!next || next.kind !== "weapon") return;
      setActiveWeaponId(id);
      setPayload((p) => {
        const prevWeaponId = p.activeWeaponPieceId || activeWeaponId;
        const isPrevMelee = getBaseGearPiece(prevWeaponId)?.weaponSub === "melee";
        const isNextMelee = next.weaponSub === "melee";
        const nextCrafting =
          !p.weaponCrafting || isPrevMelee !== isNextMelee
            ? defaultWeaponInnateCrafting(id)
            : p.weaponCrafting;

        // Sanitize legendary stars if transitioning between melee and ranged
        const nextStars = [...p.legendaryModIds] as [string | null, string | null, string | null, string | null];
        if (isPrevMelee !== isNextMelee) {
          for (let s = 0; s < 4; s++) {
            const starId = nextStars[s];
            if (starId) {
              const mod = findModByIdOrSlug(mods, starId, s + 1);
              if (mod && !weaponSubMatches(mod, next)) {
                nextStars[s] = null;
              }
            }
          }
        }

        return {
          ...p,
          activeWeaponPieceId: id,
          legendaryModIds: nextStars,
          weaponCrafting: nextCrafting,
          ...(p.equipmentKind === "weapon"
            ? { basePieceId: id, weaponSub: next.weaponSub ?? null }
            : {}),
        };
      });
      setActivePick(null);
    },
    [activeWeaponId, mods]
  );

  function setBase(id: string) {
    const next = getBaseGearPiece(id);
    if (!next) return;
    if (next.kind === "weapon") {
      selectActiveWeapon(id);
    } else if (next.kind === "armor" || next.kind === "powerArmor") {
      setActiveChassisId(id);
      const isNextPA = next.kind === "powerArmor";
      setPayload((p) => ({
        ...p,
        basePieceId: id,
        equipmentKind: next.kind,
        armorLegendaryModIds: p.armorLegendaryModIds.length === (isNextPA ? 6 : 5) ? p.armorLegendaryModIds : emptyArmorLegendaryGrid(isNextPA),
        armorPieceCrafting: p.armorPieceCrafting.length === (isNextPA ? 6 : 5) ? p.armorPieceCrafting : defaultArmorPieceCrafting(isNextPA),
        powerArmorHelmetId: isNextPA ? p.powerArmorHelmetId : null,
        powerArmorPiecesEquipped: isNextPA ? p.powerArmorPiecesEquipped : DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
      }));
    } else if (next.kind === "underarmor") {
      if (next.defaultUnderarmorShellId) {
        setPayload((p) => ({
          ...p,
          underarmor: {
            ...p.underarmor,
            shellId: next.defaultUnderarmorShellId!,
          },
        }));
      }
    }
    setActivePick(null);
  }

  function setArmorCraftingField(
    pieceIndex: number,
    field: "materialModId" | "miscModId",
    value: string,
  ) {
    setPayload((p) => {
      const nextCraft = p.armorPieceCrafting.map((row, i) =>
        i === pieceIndex ? { ...row, [field]: value } : row,
      );
      return { ...p, armorPieceCrafting: nextCraft };
    });
  }

  function clearStarSlot(
    scope: "single" | "armorSet",
    pieceIndex: number | undefined,
    starIndex: number,
  ) {
    if (scope === "single") {
      setPayload((p) => {
        const next = [...p.legendaryModIds];
        next[starIndex] = null;
        return { ...p, legendaryModIds: next };
      });
      return;
    }
    if (pieceIndex === undefined) return;
    setPayload((p) => {
      const grid = p.armorLegendaryModIds.map((row) => [...row]);
      const row = [...grid[pieceIndex]!];
      row[starIndex] = null;
      grid[pieceIndex] = row;
      return { ...p, armorLegendaryModIds: grid };
    });
  }

  async function shareBuild() {
    setShareBusy(true);
    setShareResult(null);
    try {
      const response = await fetch("/api/builder/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: shareTitle,
          description: `${piece.label} · ${payload.ghoul ? "Ghoul" : "Human"} · sandbox`,
          payload: {
            ...payload,
            equippedPerkCards,
            activeWeaponPieceId: activeWeaponId,
            switchboardState: switchboardState ? (switchboardState as unknown as Record<string, unknown>) : undefined,
          },
        }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        data?: { id?: string; slug?: string; path?: string; editToken?: string };
        error?: { message?: string };
      };
      if (!response.ok || !body?.success) {
        throw new Error(body?.error?.message ?? "Share failed.");
      }
      const path = body.data?.path;
      const slug = body.data?.slug;
      const id = body.data?.id;
      const editToken = body.data?.editToken;
      setShareResult(path ?? "");

      // Save to localStorage roll_my_transmissions for author tracking
      if (id && slug) {
        try {
          const raw = localStorage.getItem(BUILDER_STORAGE_KEYS.myTransmissions);
          const list: LocalTransmissionRecord[] = raw ? JSON.parse(raw) : [];
          const updated = [
            {
              id,
              slug,
              title: shareTitle,
              editToken,
              createdAt: new Date().toISOString(),
            },
            ...list.filter((x) => x.id !== id && x.slug !== slug),
          ];
          localStorage.setItem(BUILDER_STORAGE_KEYS.myTransmissions, JSON.stringify(updated));
        } catch {
          // ignore
        }

        // Switch active transmission to the newly saved build
        setActiveTransmission({
          id,
          slug,
          title: shareTitle,
          isOwner: true,
          editToken,
        });
      }
    } catch (e) {
      setShareResult(e instanceof Error ? e.message : "Share failed.");
    } finally {
      setShareBusy(false);
    }
  }

  async function updateTransmission() {
    if (!activeTransmission) return;
    setUpdateBusy(true);
    setUpdateStatus(null);
    try {
      const response = await fetch(`/api/builder/transmissions/${activeTransmission.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: shareTitle,
          description: `${piece.label} · ${payload.ghoul ? "Ghoul" : "Human"} · sandbox`,
          payload: {
            ...payload,
            equippedPerkCards,
            activeWeaponPieceId: activeWeaponId,
            switchboardState: switchboardState ? (switchboardState as unknown as Record<string, unknown>) : undefined,
          },
          editToken: activeTransmission.editToken,
        }),
      });
      const body = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !body?.success) {
        throw new Error(body?.error ?? "Update failed.");
      }

      // Update title in localStorage roll_my_transmissions if present
      try {
        const raw = localStorage.getItem(BUILDER_STORAGE_KEYS.myTransmissions);
        if (raw) {
          const list: LocalTransmissionRecord[] = JSON.parse(raw);
          const updated = list.map((item) =>
            item.id === activeTransmission.id || item.slug === activeTransmission.slug
              ? { ...item, title: shareTitle }
              : item
          );
          localStorage.setItem(BUILDER_STORAGE_KEYS.myTransmissions, JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      setActiveTransmission((prev) => (prev ? { ...prev, title: shareTitle } : null));
      setUpdateStatus({ type: "success", text: "Transmission updated in vault!" });
      setTimeout(() => setUpdateStatus(null), 4000);
    } catch (e) {
      setUpdateStatus({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to update transmission.",
      });
    } finally {
      setUpdateBusy(false);
    }
  }

  function exitTransmissionMode() {
    setActiveTransmission(null);
    setUpdateStatus(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      url.searchParams.delete("load");
      window.history.replaceState({}, "", url.toString());
    }
  }

  const handlePerkLoadoutChange = React.useCallback(
    (data: {
      specials: Record<string, number>;
      equippedCards: { cardId: string; rank: number }[];
      legendaryPerks?: Array<{ id: string; rank: number }>;
      isGhoul?: boolean;
    }) => {
      setEquippedPerkCards((prev) => {
        if (areEquippedCardsEqual(prev, data.equippedCards)) {
          return prev;
        }
        return data.equippedCards;
      });
      setPayload((prev) => {
        const nextSpecials = {
          str: data.specials.S ?? prev.baseSpecial?.str ?? 1,
          per: data.specials.P ?? prev.baseSpecial?.per ?? 1,
          end: data.specials.E ?? prev.baseSpecial?.end ?? 1,
          cha: data.specials.C ?? prev.baseSpecial?.cha ?? 1,
          int: data.specials.I ?? prev.baseSpecial?.int ?? 1,
          agi: data.specials.A ?? prev.baseSpecial?.agi ?? 1,
          lck: data.specials.L ?? prev.baseSpecial?.lck ?? 1,
        };
        const nextLegPerks =
          data.legendaryPerks && data.legendaryPerks.length > 0
            ? data.legendaryPerks.map((lp) => lp.id)
            : prev.legendaryPerkIds;
        const nextGhoul = data.isGhoul !== undefined ? data.isGhoul : prev.ghoul;

        const specialsSame =
          prev.baseSpecial?.str === nextSpecials.str &&
          prev.baseSpecial?.per === nextSpecials.per &&
          prev.baseSpecial?.end === nextSpecials.end &&
          prev.baseSpecial?.cha === nextSpecials.cha &&
          prev.baseSpecial?.int === nextSpecials.int &&
          prev.baseSpecial?.agi === nextSpecials.agi &&
          prev.baseSpecial?.lck === nextSpecials.lck;

        const cardsSame = areEquippedCardsEqual(prev.equippedPerkCards, data.equippedCards);
        const ghoulSame = prev.ghoul === nextGhoul;
        const legSame =
          prev.legendaryPerkIds?.length === nextLegPerks?.length &&
          (prev.legendaryPerkIds || []).every((id, idx) => id === nextLegPerks?.[idx]);

        if (specialsSame && cardsSame && ghoulSame && legSame) {
          return prev;
        }

        return {
          ...prev,
          baseSpecial: nextSpecials,
          legendaryPerkIds: nextLegPerks,
          ghoul: nextGhoul,
          equippedPerkCards: data.equippedCards,
        };
      });
    },
    []
  );

  const handleApplyNdBuild = (build: NukesDragonsParsedBuild) => {
    // Determine legendary cards: imported or preserved from active equipped
    const importedLegCards = (build.legendaryPerks || []).map((lp) => ({ cardId: lp.id, rank: lp.rank }));
    const existingLegCards = equippedPerkCards.filter((c) => c.cardId.startsWith("legendary-"));
    const finalLegCards = importedLegCards.length > 0 ? importedLegCards : existingLegCards;
    const allEquipped = [...build.equippedCards, ...finalLegCards];

    setPayload((prev) => ({
      ...prev,
      baseSpecial: { ...build.specials },
      legendaryPerkIds: finalLegCards.map((p) => p.cardId),
      ghoul: build.isGhoul ? true : prev.ghoul,
    }));
    setEquippedPerkCards(allEquipped);

    // Forward import trigger to PerkBuilder
    setImportedBuildForPerkBuilder({ build, timestamp: Date.now() });

    try {
      const activePerkSlot = localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
      localStorage.setItem(
        perkLoadoutSlotKey(activePerkSlot),
        JSON.stringify({
          specials: {
            S: build.specials.str,
            P: build.specials.per,
            E: build.specials.end,
            C: build.specials.cha,
            I: build.specials.int,
            A: build.specials.agi,
            L: build.specials.lck,
          },
          equippedCards: allEquipped,
        })
      );
      if (finalLegCards.length > 0) {
        localStorage.setItem(
          BUILDER_STORAGE_KEYS.legendaryPerkIds,
          JSON.stringify(finalLegCards.map((lp) => lp.cardId))
        );
      }
    } catch {
      // Ignore local storage write errors
    }

    triggerBuilderAchievement("build_specials");
    triggerBuilderAchievement("build_perks");
  };

  // Gear schematic card generator for multi-piece view
  function renderGearSlotCard(
    slotKey: "helmet" | "leftArm" | "torso" | "rightArm" | "leftLeg" | "rightLeg",
    label: string,
    payloadIndex: number | null
  ) {
    const isEquipped = (isPA && payloadIndex !== null) ? payload.powerArmorPiecesEquipped[payloadIndex] : true;
    const isPAHelmet = isPA && slotKey === "helmet";
    const isRegularHelmet = !isPA && slotKey === "helmet";

    const craft = payloadIndex !== null ? payload.armorPieceCrafting[payloadIndex] : null;
    const material = craft?.materialModId && craft.materialModId !== "none" 
      ? ARMOR_MATERIAL_MODS.find(m => m.id === craft.materialModId)?.label 
      : null;
    const misc = craft?.miscModId && craft.miscModId !== "none" && payloadIndex !== null
      ? listArmorMiscModOptions(piece.armorSetKey ?? null, payloadIndex, { powerArmor: isPA }).find(m => m.id === craft.miscModId)?.label 
      : null;

    return (
      <div
        className={cn(
          "pip-terminal-panel w-full p-2.5 rounded-lg border text-left transition-all duration-200 group relative flex flex-col justify-between font-mono",
          isEquipped 
            ? "border-accent/40 bg-accent/[0.02] shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]" 
            : "border-border/15 opacity-35 bg-background/10 hover:opacity-60 hover:border-border/30"
        )}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-[0.72rem] uppercase font-black text-foreground/50 tracking-widest border-b border-border/20 pb-1 mb-1.5">
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
                    const next = [...payload.powerArmorPiecesEquipped] as unknown as [boolean, boolean, boolean, boolean, boolean, boolean];
                    next[payloadIndex] = true;
                    setPayload(p => ({ ...p, powerArmorPiecesEquipped: next }));
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
                <div className="w-full text-[0.68rem] bg-background/90 border border-border/30 rounded px-1.5 py-0.5 font-mono uppercase text-accent font-bold truncate">
                  {ARMOR_SET_ROWS.find(r => r.key === (payload.armorPieceSetKeys?.[payloadIndex] || piece.armorSetKey || "civil-engineer"))?.label || "Armor Piece"}
                </div>
              ) : (
                <select
                  className="w-full text-[0.68rem] bg-background/90 border border-border/40 rounded px-1 py-0.5 font-mono uppercase text-accent font-bold cursor-pointer hover:border-accent"
                  value={payload.armorPieceSetKeys?.[payloadIndex] || piece.armorSetKey || "civil-engineer"}
                  onChange={(e) => {
                    const currentKeys = payload.armorPieceSetKeys || [
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer",
                      piece.armorSetKey || "civil-engineer"
                    ];
                    const nextKeys = [...currentKeys];
                    nextKeys[payloadIndex] = e.target.value;
                    setPayload(p => ({ ...p, armorPieceSetKeys: nextKeys }));
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
              ) : (material || misc) ? (
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
                      className="h-5 text-[0.84rem] w-full rounded border border-border/35 bg-background/60 px-1 font-mono uppercase text-foreground/80 cursor-pointer"
                      value={craft?.materialModId ?? "none"}
                      onChange={(e) => setArmorCraftingField(payloadIndex, "materialModId", e.target.value)}
                    >
                      {ARMOR_MATERIAL_MODS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    className="h-5 text-[0.84rem] w-full rounded border border-border/35 bg-background/60 px-1 font-mono uppercase text-foreground/80 cursor-pointer"
                    value={craft?.miscModId ?? "none"}
                    onChange={(e) => setArmorCraftingField(payloadIndex, "miscModId", e.target.value)}
                  >
                    {listArmorMiscModOptions(piece.armorSetKey ?? null, payloadIndex, { powerArmor: isPA }).map((o) => (
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
                            "flex items-center justify-between text-[0.72rem] rounded px-1.5 py-0.5 transition-all border",
                            !readOnly && "cursor-pointer",
                            mod 
                              ? "border-accent/30 bg-accent/[0.04] text-foreground/90 hover:border-accent/60" 
                              : "border-dashed border-border/30 text-foreground/40 hover:border-accent/40 hover:text-foreground/75"
                          )}
                          onClick={() => {
                            if (!readOnly) {
                              setActivePick({ scope: "armorSet", pieceIndex: payloadIndex, starIndex });
                            }
                          }}
                        >
                          <span className="truncate max-w-[100px] font-bold">
                            {starIndex + 1}★ {mod ? mod.name : "empty"}
                          </span>
                          {mod && !readOnly && (
                            <button
                              type="button"
                              className="text-[0.84rem] text-foreground/40 hover:text-destructive px-1 font-bold"
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
        <div className="space-y-4">
          
          {/* Interactive Silhouette Repair Frame / Chassis Bay schematic */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-4 font-mono relative min-h-[500px] flex flex-col justify-between">
            <div className="crt-scanline" />
            
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2 relative z-10">
              <span>[ Chassis Bay schematic ]</span>
              <span className="text-[0.72rem] text-foreground/40 font-normal flex items-center gap-1.5">
                <span>Active frame: {activeChassisPiece.label}</span>
                {activeChassisPiece.kind === "powerArmor" ? (
                  <span className="text-[0.62rem] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
                    LVL {getPowerArmorMaxLevel(activeChassisPiece.id)} (MAX)
                  </span>
                ) : (
                  <span className="text-[0.62rem] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
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
                      <div className="text-[0.62rem] text-foreground/45 uppercase truncate">
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
                                  opt.isVariant && "text-amber-200"
                                )}
                              >
                                {opt.isVariant ? `\u00A0\u00A0↳ ${opt.label}` : opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                    <span className="text-[0.62rem] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
                      LVL {getWeaponMaxLevel(activeWeaponPiece.id)} (MAX)
                    </span>
                    <span className="text-[0.62rem] px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent font-bold">
                      ACTIVE WEAPON
                    </span>
                  </div>
                </div>

                {/* WEAPON SUB-NAVIGATION: ATTACHMENTS vs LEGENDARY STARS vs MATRIX */}
                <div className="flex items-center justify-between gap-1 border-b border-border/15 pb-2">
                  <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setWeaponSubMenu("attachments")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[0.72rem] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                        weaponSubMenu === "attachments"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm"
                          : "text-foreground/50 hover:text-foreground hover:bg-background/30 border border-transparent"
                      )}
                    >
                      <span>⚙️ Attachments</span>
                      <span className="text-[0.65rem] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200">
                        {listWeaponAvailableSlots(activeWeaponPiece.id).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeaponSubMenu("stars")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[0.72rem] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                        weaponSubMenu === "stars"
                          ? "bg-accent/20 text-accent border border-accent/60 shadow-sm"
                          : "text-foreground/50 hover:text-foreground hover:bg-background/30 border border-transparent"
                      )}
                    >
                      <span>★ Legendary Stars</span>
                      <span className="text-[0.65rem] px-1 py-0.2 rounded bg-accent/20 text-accent">
                        4
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeaponSubMenu("matrix")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[0.72rem] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                        weaponSubMenu === "matrix"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm"
                          : "text-foreground/50 hover:text-foreground hover:bg-background/30 border border-transparent"
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
                      <span className="text-foreground/50 font-bold uppercase text-[0.66rem] mr-1">
                        Innate Mod Bonuses:
                      </span>
                      {activeWeaponAttachments.damagePct !== 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-[0.68rem]">
                          {activeWeaponAttachments.damagePct > 0 ? "+" : ""}{Math.round(activeWeaponAttachments.damagePct * 100)}% Dmg
                        </span>
                      )}
                      {activeWeaponAttachments.apCostPct !== 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold text-[0.68rem]">
                          {activeWeaponAttachments.apCostPct > 0 ? "+" : ""}{Math.round(activeWeaponAttachments.apCostPct * 100)}% AP
                        </span>
                      )}
                      {activeWeaponAttachments.armorPenetrationPct > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[0.68rem]">
                          +{activeWeaponAttachments.armorPenetrationPct}% Armor Pen
                        </span>
                      )}
                      {activeWeaponAttachments.critDamagePct > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 font-bold text-[0.68rem]">
                          +{Math.round(activeWeaponAttachments.critDamagePct * 100)}% Crit
                        </span>
                      )}
                      {activeWeaponAttachments.fireRatePct !== 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/40 text-blue-300 font-bold text-[0.68rem]">
                          {activeWeaponAttachments.fireRatePct > 0 ? "+" : ""}{Math.round(activeWeaponAttachments.fireRatePct * 100)}% Fire Rate
                        </span>
                      )}
                      {activeWeaponAttachments.isSuppressed && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold text-[0.68rem]">
                          🔇 Silenced
                        </span>
                      )}
                      {activeWeaponAttachments.durabilityPct > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-500/15 border border-slate-500/40 text-slate-300 font-bold text-[0.68rem]">
                          +{Math.round(activeWeaponAttachments.durabilityPct * 100)}% Durability
                        </span>
                      )}
                      {!readOnly && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-5 px-2 text-[0.65rem] text-foreground/45 hover:text-amber-400 font-mono cursor-pointer"
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
                        const crafting = payload.weaponCrafting ?? defaultWeaponInnateCrafting(activeWeaponPiece.id);
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
                        const activeOpt = getWeaponInnateModOption(activeWeaponPiece.id, slotKey, currentId) || options[0];

                        return (
                          <div
                            key={slotKey}
                            className="flex flex-col gap-1.5 rounded-lg border border-amber-500/25 bg-background/30 p-2.5 font-mono text-xs transition-all hover:border-amber-500/40"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-amber-300 text-[0.72rem] uppercase flex items-center gap-1.5">
                                <span>{slotInfo.icon}</span>
                                <span>{slotInfo.label}</span>
                              </span>
                              {activeOpt?.effectMath.apCostPct && (
                                <span className="text-[0.62rem] px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                                  {activeOpt.effectMath.apCostPct < 0 ? "" : "+"}{Math.round(activeOpt.effectMath.apCostPct * 100)}% AP
                                </span>
                              )}
                              {activeOpt?.effectMath.armorPenetrationPct && (
                                <span className="text-[0.62rem] px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
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
                              <p className="text-[0.65rem] text-foreground/50 leading-relaxed truncate">
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
                        const trackerEntry = mod ? findLocalProgressEntry(localProgress, mod.id, mod.name, `${starIndex + 1} Star`) : undefined;
                        const isUnlocked = trackerEntry?.unlocked ?? (mod?.trackerUnlock === "unlocked");
                        const modCount = trackerEntry?.modCount ?? 0;
                        const isSeeking = trackerEntry?.isSeeking ?? false;

                        return (
                          <div
                            key={starIndex}
                            className={cn(
                              "flex flex-col gap-1.5 rounded-lg border p-2.5 text-[0.72rem] transition-all font-mono",
                              mod
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-border/20 bg-background/20 text-foreground/50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="min-w-0 flex items-center gap-1.5 truncate">
                                <span className="font-black px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[0.7rem]">
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
                                    className="h-6 px-2 text-[0.66rem] uppercase font-mono font-bold hover:text-accent bg-accent/15 border border-accent/40 cursor-pointer"
                                    onClick={() => setActivePick({ scope: "single", starIndex })}
                                  >
                                    Bench
                                  </Button>
                                  {mod && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-1.5 text-[0.66rem] uppercase font-mono hover:text-destructive text-foreground/40 cursor-pointer"
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
                              <div className="flex items-center justify-between gap-2 border-t border-border/15 pt-1 mt-0.5 text-[0.66rem]">
                                <span className="text-foreground/50 truncate text-[0.64rem] italic">
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
                              <div className="text-[0.64rem] text-foreground/35 italic">
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
                        <div className="text-[0.7rem] font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                          <span>⚙️ Installed Attachments</span>
                          <button
                            type="button"
                            onClick={() => setWeaponSubMenu("attachments")}
                            className="text-[0.65rem] text-accent hover:underline cursor-pointer"
                          >
                            Edit Attachments &gt;
                          </button>
                        </div>
                        <div className="space-y-1 text-[0.68rem]">
                          {activeWeaponAttachments.installedMods.length > 0 ? (
                            activeWeaponAttachments.installedMods.map((m, idx) => (
                              <div key={idx} className="flex items-center justify-between text-foreground/80 py-0.5 border-b border-border/10">
                                <span className="text-foreground/50 uppercase">{m.slot}:</span>
                                <span className="font-semibold text-slate-100">{m.label}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-foreground/40 italic">Factory default components installed.</div>
                          )}
                        </div>
                      </div>

                      {/* Stars Column */}
                      <div className="p-2.5 rounded-lg border border-accent/30 bg-background/40 space-y-1.5">
                        <div className="text-[0.7rem] font-black uppercase tracking-wider text-accent flex items-center justify-between">
                          <span>★ Legendary Stars</span>
                          <button
                            type="button"
                            onClick={() => setWeaponSubMenu("stars")}
                            className="text-[0.65rem] text-accent hover:underline cursor-pointer"
                          >
                            Edit Stars &gt;
                          </button>
                        </div>
                        <div className="space-y-1 text-[0.68rem]">
                          {SLOT_LABELS.map((starLabel, starIndex) => {
                            const id = payload.legendaryModIds[starIndex];
                            const mod = findModByIdOrSlug(mods, id, starIndex + 1);
                            const trackerEntry = mod ? findLocalProgressEntry(localProgress, mod.id, mod.name, `${starIndex + 1} Star`) : undefined;
                            const isUnlocked = trackerEntry?.unlocked ?? (mod?.trackerUnlock === "unlocked");

                            return (
                              <div key={starIndex} className="flex items-center justify-between py-0.5 border-b border-border/10">
                                <span className="text-foreground/50">{starIndex + 1}★:</span>
                                <span className={cn("font-semibold truncate max-w-[140px]", mod ? "text-accent" : "text-foreground/30")}>
                                  {mod ? mod.name : "None"}
                                </span>
                                {mod && (
                                  <span className={cn("text-[0.6rem] font-bold px-1 rounded", isUnlocked ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-400")}>
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
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-[0.72rem]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">⚡ Single Shot:</span>
                          <span className="font-mono text-slate-100">{weaponFirepowerResult.damagePerShot.normal}</span>
                          <span className="text-amber-400 font-mono">/ Crit: {weaponFirepowerResult.damagePerShot.critical}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-300">Burst DPS:</span>
                          <span className="font-mono text-slate-100">{weaponFirepowerResult.dps.burstDPS.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">V.A.T.S.:</span>
                          <span className="font-mono text-slate-100">{weaponFirepowerResult.vats.apCostPerShot} AP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-300">Armor Pen:</span>
                          <span className="font-mono text-slate-100">{weaponFirepowerResult.armorPenetration.effectiveArmorPenetrationPct}%</span>
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
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[0.72rem]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">👕</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">
                      {findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId)?.label || "Underarmor"}
                    </div>
                    <div className="text-[0.62rem] text-slate-400 truncate">
                      Lining: <span className="text-cyan-300 font-bold">{findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId)?.label?.split("(")[0]?.trim() || "None"}</span> · Style: <span className="text-amber-300 font-bold">{findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId)?.label?.split("(")[0]?.trim() || "None"}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isPA ? (
                    <span className="text-[0.62rem] px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30 font-bold">
                      ⚠️ SUPPRESSED IN PA
                    </span>
                  ) : (
                    <span className="text-[0.62rem] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
                      ✓ ACTIVE WITH ARMOR
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[0.72rem] text-foreground/30 uppercase tracking-widest leading-relaxed border-t border-border/10 pt-2 text-center mt-2">
              Telemetric calculations updated instant client-side. Cloudflare 0ms CPU load.
            </div>
          </div>

        </div>

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
