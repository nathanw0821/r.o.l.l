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
import { updateLearnedBasePiece } from "@/actions/learned-base-piece";
import { type ActivePick } from "@/lib/builder/active-pick";
import { BUILDER_STORAGE_KEYS, perkLoadoutSlotKey } from "@/lib/builder/storage-keys";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";
import { calculateAggregatedBuffSpecial } from "@/lib/builder/buff-stacking-engine";
import { calculateCombatFirepower, getWeaponMaxLevel } from "@/lib/builder/combat-firepower-engine";
import BuilderGearComparisonModal from "@/components/builder/builder-gear-comparison-modal";
import {
  getArmorSetRow,
  getArmorSetMaxLevel,
} from "@/lib/builder/armor-sets";
import { getPowerArmorMaxLevel } from "@/lib/builder/power-armor-frame-data";
import {
  defaultArmorPieceCrafting,
} from "@/lib/builder/armor-piece-mods";
import {
  BASE_GEAR_PIECES,
  formatBaseOptionLabel,
  getBaseGearPiece,
  isPowerArmorTorsoBasePiece,
  isPowerArmorTorsoRowLearned,
  isTrackableBasePieceId,
  pairedPowerArmorHelmetId,
} from "@/lib/builder/base-gear";
import {
  buildShoppingList,
  filterModsForSlot,
  findModByIdOrSlug,
  stripGhoulBlockedLegendarySelections,
  weaponSubMatches,
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
  defaultWeaponInnateCrafting,
  calculateWeaponInnateAggregate,
  type WeaponInnateSlotKey,
} from "@/lib/builder/weapon-piece-mods";
import { cn } from "@/lib/utils";
import {
  BuilderBetaGate,
  useBuilderBetaAccess,
} from "@/components/builder/builder-beta-gate";
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
