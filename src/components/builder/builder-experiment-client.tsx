"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Boxes,
  Shield,
  Zap,
  Flame,
  Snowflake,
  Droplets,
  Radiation,
  Activity,
  Search,
  RotateCcw,
  Trash2,
  Save,
  Download,
  Sparkle,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { updateLearnedBasePiece } from "@/actions/learned-base-piece";
import { exportBuilderLoadoutCard } from "@/components/builder/builder-card-exporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ProgressToggle from "@/components/progress-toggle";
import {
  ARMOR_SET_SLOT_LABELS,
  getArmorSetRow,
} from "@/lib/builder/armor-sets";
import {
  ARMOR_MATERIAL_MODS,
  listArmorMiscModOptions,
  armorCraftingEffectLayers,
  defaultArmorPieceCrafting,
} from "@/lib/builder/armor-piece-mods";
import {
  BASE_GEAR_GROUP_LABEL,
  BASE_GEAR_GROUP_ORDER,
  BASE_GEAR_PIECES,
  getBaseGearPiece,
  isPowerArmorHelmetBasePiece,
  isPowerArmorTorsoBasePiece,
  isPowerArmorTorsoRowLearned,
  isTrackableBasePieceId,
  pairedPowerArmorHelmetId,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";
import {
  aggregateEffectMath,
  BUILDER_SPECIAL_KEYS,
  BUILDER_SPECIAL_LABELS,
  SPECIAL_FULL_NAMES,
  RESIST_FULL_NAMES,
  buildShoppingList,
  filterModsForSlot,
  formatEffectMathDeltas,
  isMultiPiecePayload,
  listEquippedLegendariesWithBenchLabels,
  listEquippedModsInBenchOrder,
  listExtraEffectMathEntries,
  stripGhoulBlockedLegendarySelections,
  type BuilderEffectTotals,
} from "@/lib/builder/compatibility";
import { isGhoulDiscouragedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import {
  defaultPowerArmorHelmetCrafting,
  emptyArmorLegendaryGrid,
  normalizeBuilderPayload,
} from "@/lib/builder/normalize-builder-payload";
import {
  getPowerArmorEquippedFlatStats,
  getPowerArmorSlotBaseStats,
  powerArmorFrameIntrinsicEffectMath,
  POWER_ARMOR_PIECE_SLOT_LABELS,
} from "@/lib/builder/power-armor-stats";
import {
  DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  type BuilderModDTO,
  type BuilderPayload,
} from "@/lib/builder/types";
import { subscribeProgressChange } from "@/lib/progress-events";
import { sandboxLegendaryDescription } from "@/lib/builder/sandbox-mod-description";
import { isNewMod } from "@/lib/filter-utils";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BuilderBetaGate,
  useBuilderBetaAccess,
} from "@/components/builder/builder-beta-gate";

import {
  SANDBOX_MUTATIONS,
  sandboxMutationMathLayer,
} from "@/lib/builder/sandbox-mutations";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES,
} from "@/lib/builder/underarmor";
import { triggerBuilderAchievement } from "@/actions/builder-achievements";
import { LEGENDARY_PERK_CARDS } from "@/lib/builder/compatibility";

const SLOT_LABELS = ["1st star", "2nd star", "3rd star", "4th star"];

type ActivePick =
  | null
  | { scope: "single"; starIndex: number }
  | { scope: "armorSet"; pieceIndex: number; starIndex: number };

function formatBaseOptionLabel(g: BaseGearPiece) {
  if (g.kind === "underarmor") return `${g.label} (underarmor)`;
  if (g.kind === "weapon" && g.weaponSub)
    return `${g.label} (weapon · ${g.weaponSub})`;
  if (g.kind === "armor" && g.armorSetKey) return g.label;
  if (g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)) return g.label;
  if (g.kind === "powerArmor" && g.powerArmorSlot === "helmet")
    return `${g.label} (power armor · helmet)`;
  return `${g.label} (${g.kind})`;
}

function defaultPayload(): BuilderPayload {
  const first =
    BASE_GEAR_PIECES.find((p) => p.kind === "armor") ?? BASE_GEAR_PIECES[0]!;
  return {
    version: 5,
    basePieceId: first.id,
    equipmentKind: first.kind,
    weaponSub: first.weaponSub ?? null,
    legendaryModIds: [null, null, null, null],
    armorLegendaryModIds: emptyArmorLegendaryGrid(),
    armorPieceCrafting: defaultArmorPieceCrafting(),
    powerArmorHelmetId: null,
    powerArmorHelmetCrafting: defaultPowerArmorHelmetCrafting(),
    powerArmorPiecesEquipped: DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
    ghoul: false,
    underarmor: {
      shellId: UNDERARMOR_SHELLS[0]!.id,
      liningId: "none",
      styleId: "none",
    },
    mutationIds: [],
    ignoreMutationPenalties: false,
    baseSpecial: { str: 1, per: 1, end: 1, cha: 1, int: 1, agi: 1, lck: 1 },
    legendaryPerkIds: [],
    hasStrangeInNumbers: false,
  };
}

function activePickLabel(active: ActivePick, baseLabel: string, isPA?: boolean): string {
  if (!active) return "";
  if (active.scope === "single") {
    const star = SLOT_LABELS[active.starIndex] ?? "";
    return `${star} · ${baseLabel}`;
  }
  const labels = isPA ? POWER_ARMOR_PIECE_SLOT_LABELS : ARMOR_SET_SLOT_LABELS;
  const slot = labels[active.pieceIndex] ?? "Piece";
  const star = SLOT_LABELS[active.starIndex] ?? "";
  return `${star} · ${slot} · ${baseLabel}`;
}


function useDensityCompact() {
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setCompact(root.getAttribute("data-density") === "compact");
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-density"] });
    return () => obs.disconnect();
  }, []);
  return compact;
}

function LegendaryModDetailFootprint({
  mod,
  piece = null,
  density = "default",
}: {
  mod: BuilderModDTO;
  piece?: BaseGearPiece | null;
  density?: "default" | "compact";
}) {
  const deltas = formatEffectMathDeltas(mod.effectMath);
  const extras = listExtraEffectMathEntries(mod.effectMath);
  const descRaw = mod.description?.trim() ?? "";
  const desc = sandboxLegendaryDescription(descRaw, piece) || descRaw;
  const tail = Boolean(desc || extras.length > 0);

  if (density === "compact") {
    const line =
      deltas || "No modeled DR/SPECIAL/damage in sandbox — still equippable.";
    const titleBits = [
      desc,
      descRaw !== desc ? descRaw : "",
      ...extras.map((e) => `${e.key}: ${e.value}`),
    ].filter(Boolean);
    const title = titleBits.length
      ? `${line}\n\n${titleBits.join("\n")}`
      : line;
    return (
      <p
        className="mt-0.5 truncate text-[0.78rem] leading-snug text-foreground/65"
        title={title}
      >
        <span className="font-semibold text-accent/85 tabular-nums">{line}</span>
        {tail ? (
          <span className="text-foreground/45"> · details on hover</span>
        ) : null}
      </p>
    );
  }

  return (
    <div className="mt-1 space-y-1 bg-background/30 p-1.5 rounded border border-border/10">
      <div className="text-[0.78rem] leading-snug font-mono">
        {deltas ? (
          <span className="font-semibold text-accent/90 tabular-nums">
            {deltas}
          </span>
        ) : (
          <span className="text-foreground/45 italic">
            No resist, SPECIAL, or damage bonus modeled.
          </span>
        )}
      </div>
      {tail ? (
        <div className="space-y-1 border-t border-border/10 pt-1 text-[0.78rem] leading-snug text-foreground/70">
          {desc ? (
            <p>
              <span className="font-bold text-accent/70">Desc: </span>
              {desc}
            </p>
          ) : null}
          {extras.length > 0 ? (
            <div>
              <div className="font-bold text-foreground/40 uppercase text-[0.84rem] tracking-tight">
                Extras (not in sandbox totals)
              </div>
              <ul className="list-disc pl-3 text-[0.72rem] text-foreground/50 space-y-0.5">
                {extras.map((e) => (
                  <li key={e.key}>
                    <span className="font-mono">{e.key}</span>: {e.value}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const ModPickerOption = React.memo(function ModPickerOption({
  mod,
  piece,
  compact,
  ghoulMode,
  isRecommended,
  onPick,
}: {
  mod: BuilderModDTO;
  piece: BaseGearPiece;
  compact: boolean;
  ghoulMode: boolean;
  isRecommended?: boolean;
  onPick: (id: string) => void;
}) {
  const unlock = mod.trackerUnlock ?? "unknown";
  const statusAttr =
    unlock === "unlocked"
      ? "unlocked"
      : unlock === "locked"
        ? "locked"
        : undefined;
  const statusLabel =
    unlock === "unlocked"
      ? "Unlocked"
      : unlock === "locked"
        ? "Locked"
        : "Not in tracker";
  const descDisplay =
    sandboxLegendaryDescription(mod.description, piece) ||
    mod.description?.trim() ||
    "";
  const title = compact
    ? [mod.name, descDisplay, formatEffectMathDeltas(mod.effectMath)]
        .filter(Boolean)
        .join(" — ")
    : undefined;

  return (
    <button
      type="button"
      data-status={statusAttr}
      title={title}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: compact ? "auto 48px" : "auto 96px",
      }}
      className={cn(
        "pip-terminal-panel flex w-full flex-col rounded-[var(--radius)] border text-left p-2.5 transition-all duration-150 cursor-pointer font-mono select-none overflow-hidden relative group",
        unlock === "unlocked"
          ? "border-accent bg-accent/5 hover:bg-accent/10 shadow-[0_0_10px_rgba(var(--color-accent),0.05)]"
          : unlock === "locked"
            ? "border-border/30 opacity-70 hover:opacity-100 hover:border-border/60 hover:bg-background/20"
            : "border-border/40 bg-background/10 hover:border-accent/50 hover:bg-background/30",
        isRecommended && "border-accent/60 bg-accent/[0.04]",
      )}
      onClick={() => onPick(mod.id)}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <span className="min-w-0 font-bold flex flex-wrap items-center gap-1.5 text-xs">
          <span 
            className={cn(
              "break-words",
              unlock === "unlocked" ? "text-accent" : "text-foreground"
            )}
            style={{ overflowWrap: "anywhere" }}
          >
            {mod.name}
          </span>
          {isNewMod(mod.name) && (
            <span className="rounded border border-accent/40 bg-accent/30 px-1.5 py-0.5 text-[0.78rem] uppercase tracking-wider text-accent font-black animate-pulse">
              New
            </span>
          )}
          {isRecommended && (
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[0.84rem] uppercase tracking-wider text-accent font-black animate-pulse">
              <Sparkle className="h-2 w-2 inline mr-0.5" /> Recom.
            </span>
          )}
        </span>
        <span className={cn(
          "shrink-0 text-[0.72rem] font-black uppercase tracking-wider mt-0.5",
          unlock === "unlocked" ? "text-accent" : "text-foreground/40"
        )}>
          {statusLabel}
        </span>
      </div>
      
      <div className="mt-1 w-full">
        <LegendaryModDetailFootprint
          mod={mod}
          piece={piece}
          density={compact ? "compact" : "default"}
        />
      </div>
      
      {ghoulMode && isGhoulDiscouragedLegendarySlug(mod.slug) ? (
        <p className="mt-1.5 rounded border border-warning/30 bg-warning/5 px-2 py-0.5 text-[0.84rem] leading-tight text-warning/80 italic font-sans">
          Off-meta for typical Ghoul builds.
        </p>
      ) : null}
    </button>
  );
});

type BuilderExperimentClientProps = {
  initialLearnedBasePieceIds?: string[];
  isAdmin?: boolean;
};

export default function BuilderExperimentClient({
  initialLearnedBasePieceIds = [],
  isAdmin = false,
}: BuilderExperimentClientProps) {
  const { data: session, status: sessionStatus } = useSession();
  const isSignedIn =
    sessionStatus === "authenticated" && Boolean(session?.user?.id);

  const [mods, setMods] = React.useState<BuilderModDTO[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Persistence state
  const [isMounted, setIsMounted] = React.useState(false);
  const [payload, setPayload] =
    React.useState<BuilderPayload>(defaultPayload());
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

  const [activePick, setActivePick] = React.useState<ActivePick>(null);
  const [slotQuery, setSlotQuery] = React.useState("");
  const deferredSlotQuery = React.useDeferredValue(slotQuery);
  const isCompactDensity = useDensityCompact();
  const [shareTitle, setShareTitle] = React.useState("B.U.I.L.D. Loadout");
  const [shareBusy, setShareBusy] = React.useState(false);
  const [shareResult, setShareResult] = React.useState<string | null>(null);
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
  const internalUpdateRef = React.useRef(false);

  const { hasAccess: hasBuilderAccess, accept: acceptBuilderBeta } =
    useBuilderBetaAccess(isAdmin);
  const [showBetaPrompt, setShowBetaPrompt] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("roll-builder-payload");
      if (saved) {
        const parsed = JSON.parse(saved);
        const norm = normalizeBuilderPayload(parsed) || parsed;
        if (norm?.basePieceId) setPayload(norm as BuilderPayload);
      }

      const savedSlots = localStorage.getItem("roll-builder-saves");
      if (savedSlots) {
        setSavedLoadouts(JSON.parse(savedSlots));
      }

      if (!isAdmin && !hasBuilderAccess) {
        setShowBetaPrompt(true);
      }
    } catch {
      // ignore
    }
    setIsMounted(true);
  }, [isAdmin, hasBuilderAccess]);

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
          payload,
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
    [payload, savedLoadouts],
  );

  const loadLoadout = React.useCallback(
    (slotIndex: number) => {
      const saved = savedLoadouts[slotIndex];
      if (saved) {
        internalUpdateRef.current = true;
        setPayload(saved.payload);
        setActiveLoadoutIndex(slotIndex);
        triggerBuilderAchievement("build_stats");
        triggerBuilderAchievement("build_perks");
      }
    },
    [savedLoadouts],
  );

  React.useEffect(() => {
    if (isMounted) {
      localStorage.setItem("roll-builder-payload", JSON.stringify(payload));
    }
  }, [payload, isMounted]);

  React.useEffect(() => {
    if (isMounted) {
      localStorage.setItem("roll-builder-saves", JSON.stringify(savedLoadouts));
    }
  }, [savedLoadouts, isMounted]);

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

  const loadMods = React.useCallback(() => {
    fetch("/api/builder/mods")
      .then((r) => r.json())
      .then((body) => {
        if (!body?.success || !Array.isArray(body.data?.mods)) {
          throw new Error("Could not load builder catalog.");
        }
        setMods(body.data.mods as BuilderModDTO[]);
        setLoadError(null);
      })
      .catch(() =>
        setLoadError(
          "Builder catalog failed to load. On the server, run database migrations (`prisma migrate deploy`) and seed builder mods (`npm run db:seed:builder` or full `npm run db:seed`) if tables are empty.",
        ),
      );
  }, []);

  React.useEffect(() => {
    loadMods();
  }, [loadMods]);

  React.useEffect(() => {
    return subscribeProgressChange(() => {
      loadMods();
    });
  }, [loadMods]);

  const piece = getBaseGearPiece(payload.basePieceId) ?? BASE_GEAR_PIECES[0]!;
  const isPA = piece.kind === "powerArmor";
  const isMultiPiece = isMultiPiecePayload(payload);
  const baseStarsContextLabel = React.useMemo(() => {
    if (piece.kind === "armor" && piece.armorSetKey) {
      return getArmorSetRow(piece.armorSetKey)?.label ?? piece.label;
    }
    return formatBaseOptionLabel(piece);
  }, [piece]);

  const currentBaseLearned =
    isTrackableBasePieceId(piece.id) &&
    (piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)
      ? isPowerArmorTorsoRowLearned(learnedBasePieceIds, piece.id)
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

  const equippedModsOrdered = React.useMemo(
    () => listEquippedModsInBenchOrder(payload, mods),
    [mods, payload],
  );

  const equippedLegendaryBenchLines = React.useMemo(
    () => listEquippedLegendariesWithBenchLabels(payload, mods),
    [mods, payload],
  );

  const groupedLegendaryEffects = React.useMemo(() => {
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
  }, [equippedLegendaryBenchLines]);

  const underLayers = React.useMemo(() => {
    const layers: Record<string, number>[] = [];
    const shell = findUnderarmorOption(
      UNDERARMOR_SHELLS,
      payload.underarmor.shellId,
    );
    const lining = findUnderarmorOption(
      UNDERARMOR_LININGS,
      payload.underarmor.liningId,
    );
    const style = findUnderarmorOption(
      UNDERARMOR_STYLES,
      payload.underarmor.styleId,
    );
    if (shell?.effectMath) layers.push(shell.effectMath);
    if (lining?.effectMath) layers.push(lining.effectMath);
    if (style?.effectMath) layers.push(style.effectMath);
    return layers;
  }, [payload.underarmor]);

  const armorCraftingLayers = React.useMemo(() => {
    if (!isMultiPiece) return [];
    return armorCraftingEffectLayers(
      payload.armorPieceCrafting,
      piece.kind === "powerArmor",
    );
  }, [isMultiPiece, piece.kind, payload.armorPieceCrafting]);

  const baseArmorStats = React.useMemo(() => {
    if (piece.kind === "armor" && piece.armorSetKey) {
      return getArmorSetRow(piece.armorSetKey)?.stats ?? null;
    }
    if (piece.kind === "powerArmor") {
      if (isMultiPiece) {
        return getPowerArmorEquippedFlatStats(
          piece.id,
          payload.powerArmorHelmetId,
          payload.powerArmorPiecesEquipped,
        );
      }
      if (isPowerArmorHelmetBasePiece(piece)) {
        return getPowerArmorSlotBaseStats(piece.id, "helmet");
      }
    }
    return null;
  }, [
    isMultiPiece,
    piece,
    payload.powerArmorHelmetId,
    payload.powerArmorPiecesEquipped,
  ]);

  const powerArmorFrameIntrinsicLayer = React.useMemo(() => {
    if (piece.kind !== "powerArmor" || !isPowerArmorTorsoBasePiece(piece))
      return null;
    return powerArmorFrameIntrinsicEffectMath();
  }, [piece]);


  const mutationLayer = React.useMemo(
    () =>
      sandboxMutationMathLayer(
        payload.mutationIds,
        payload.ignoreMutationPenalties,
        {
          strangeInNumbersMutatedTeammates:
            payload.hasStrangeInNumbers && payload.mutationIds.length > 0
              ? 4
              : 0,
        },
      ),
    [
      payload.mutationIds,
      payload.ignoreMutationPenalties,
      payload.hasStrangeInNumbers,
    ],
  );

  const intrinsicBenchTotals = React.useMemo(
    () =>
      aggregateEffectMath([], {
        ghoul: payload.ghoul,
        extraLayers: [
          ...armorCraftingLayers,
          ...(powerArmorFrameIntrinsicLayer
            ? [powerArmorFrameIntrinsicLayer]
            : []),
        ],
        baseArmorStats,
        baseSpecial: payload.baseSpecial,
      }),
    [
      payload.ghoul,
      armorCraftingLayers,
      powerArmorFrameIntrinsicLayer,
      baseArmorStats,
      payload.baseSpecial,
    ],
  );

  const totals = React.useMemo(
    () =>
      aggregateEffectMath(equippedModsOrdered, {
        ghoul: payload.ghoul,
        extraLayers: [
          ...(piece.kind !== "powerArmor" ? underLayers : []),
          ...armorCraftingLayers,
          ...(powerArmorFrameIntrinsicLayer
            ? [powerArmorFrameIntrinsicLayer]
            : []),
          ...(mutationLayer ? [mutationLayer] : []),
        ],
        baseArmorStats,
        baseSpecial: payload.baseSpecial,
        legendaryPerkIds: payload.legendaryPerkIds,
      }),
    [
      equippedModsOrdered,
      payload.ghoul,
      underLayers,
      armorCraftingLayers,
      powerArmorFrameIntrinsicLayer,
      mutationLayer,
      baseArmorStats,
      payload.baseSpecial,
      payload.legendaryPerkIds,
      piece.kind,
    ],
  );

  const ghoulLegendarySandboxNotes = React.useMemo(() => {
    if (!payload.ghoul) return null;
    const lines: string[] = [
      "RR: Radiation Resist still sums from gear in stats block though Ghouls take no rad damage.",
      "CHA: Playable Ghoul sets base effective Charisma −10 in-game vs humans.",
      "Stars: Food/Thirst bench rows are hidden; Bloodied/Unyielding trigger off-meta logs.",
    ];
    if (equippedModsOrdered.length > 0) {
      const human = aggregateEffectMath(equippedModsOrdered, {
        ghoul: false,
        extraLayers: [],
      });
      const ghoul = aggregateEffectMath(equippedModsOrdered, {
        ghoul: true,
        extraLayers: [],
      });
      if (human.specialBonus !== ghoul.specialBonus) {
        lines.push(
          `SPECIAL block bonus: ${human.specialBonus} → ${ghoul.specialBonus} after Ghoul caps on flagged rows.`,
        );
      }
    }
    return lines;
  }, [payload.ghoul, equippedModsOrdered]);

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
    const filtered = filterModsForSlot(mods, piece, slotIndex, {
      ghoul: payload.ghoul,
    }).filter((m) => {
      const q = deferredSlotQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      const recA = recommendedIds.has(a.id) ? 1 : 0;
      const recB = recommendedIds.has(b.id) ? 1 : 0;
      if (recA !== recB) return recB - recA;

      if (payload.ghoul) {
        const discA = isGhoulDiscouragedLegendarySlug(a.slug) ? 1 : 0;
        const discB = isGhoulDiscouragedLegendarySlug(b.slug) ? 1 : 0;
        if (discA !== discB) return discA - discB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [
    mods,
    piece,
    activePick,
    deferredSlotQuery,
    payload.ghoul,
    recommendedIds,
  ]);

  function setBase(id: string) {
    const next = getBaseGearPiece(id);
    if (!next) return;
    const isPA = next.kind === "powerArmor";
    setPayload((p) => ({
      ...p,
      basePieceId: id,
      equipmentKind: next.kind,
      weaponSub: next.kind === "weapon" ? (next.weaponSub ?? null) : null,
      legendaryModIds: [null, null, null, null],
      armorLegendaryModIds: emptyArmorLegendaryGrid(isPA),
      armorPieceCrafting: defaultArmorPieceCrafting(isPA),
      powerArmorHelmetId: null,
      powerArmorHelmetCrafting: defaultPowerArmorHelmetCrafting(),
      powerArmorPiecesEquipped: DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
      underarmor:
        next.kind === "underarmor" && next.defaultUnderarmorShellId
          ? { ...p.underarmor, shellId: next.defaultUnderarmorShellId }
          : p.underarmor,
    }));
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
          payload,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body?.success) {
        throw new Error(body?.error?.message ?? "Share failed.");
      }
      const path = body.data?.path as string;
      setShareResult(path ?? "");
    } catch (e) {
      setShareResult(e instanceof Error ? e.message : "Share failed.");
    } finally {
      setShareBusy(false);
    }
  }

  const starsDisabled = piece.kind === "underarmor";


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
            {isPA && payloadIndex !== null && (
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
              {!isRegularHelmet && payloadIndex !== null && (
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
                      const mod = id ? mods.find(m => m.id === id) : null;
                      return (
                        <div 
                          key={starIndex}
                          className={cn(
                            "flex items-center justify-between text-[0.72rem] rounded px-1.5 py-0.5 cursor-pointer transition-all border",
                            mod 
                              ? "border-accent/30 bg-accent/[0.04] text-foreground/90 hover:border-accent/60" 
                              : "border-dashed border-border/30 text-foreground/40 hover:border-accent/40 hover:text-foreground/75"
                          )}
                          onClick={() => setActivePick({ scope: "armorSet", pieceIndex: payloadIndex, starIndex })}
                        >
                          <span className="truncate max-w-[100px] font-bold">
                            {starIndex + 1}★ {mod ? mod.name : "empty"}
                          </span>
                          {mod && (
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

      {/* Main Terminal Shell Title Header */}
      <div className="pip-terminal-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
            <Terminal className="h-4 w-4 animate-pulse" /> SYSTEM DIAGNOSTICS: ACTIVE TERMINAL MODE
          </div>
          <h1 className="text-xl font-black font-mono tracking-tight text-foreground mt-1">
            B.U.I.L.D. SANDBOX TERMINAL
          </h1>
          <p className="text-[0.84rem] font-mono text-foreground/50 uppercase mt-0.5 tracking-wider">
            Battle Utility &amp; Inventory Logistics Diagnostic // Nuka Knights (Backwoods Edition)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[0.78rem]">
          <a
            className="rounded border border-accent/25 bg-accent/5 px-2.5 py-1 text-accent font-bold hover:bg-accent/15 transition-all"
            href="https://nukaknights.com/articles/expected-changes-for-the-backwoods-update-on-3rd-march-2026.html#armor"
            target="_blank"
            rel="noreferrer"
          >
            Resist Matrix Notes
          </a>
          <a
            className="rounded border border-accent/25 bg-accent/5 px-2.5 py-1 text-accent font-bold hover:bg-accent/15 transition-all"
            href="https://nukesdragons.com/fallout-76/character"
            target="_blank"
            rel="noreferrer"
          >
            N&amp;D Overlay Spec
          </a>
        </div>
      </div>

      {loadError ? (
        <div className="pip-terminal-panel p-4 rounded-lg font-mono text-xs text-warning/90 border-warning/30 bg-warning/5">
          &gt;&gt; ERROR: {loadError}
        </div>
      ) : null}

      {/* Three Pane Responsive Tactical Grid */}
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_325px] lg:grid-cols-[250px_1fr_280px] grid-cols-1">
        
        {/* COLUMN 1: DIAGNOSTICS HUD */}
        <div className="space-y-4">
          
          {/* SPECIAL Progress bars */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-4">
            <div className="text-xs font-black font-mono uppercase tracking-widest text-accent border-b border-border/20 pb-2 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> [ S.P.E.C.I.A.L. TELEMETRY ]
            </div>
            
            <TooltipProvider delayDuration={150}>
              <div className="space-y-3">
                {BUILDER_SPECIAL_KEYS.map((key) => {
                  const live = totals[key];
                  const base = payload.baseSpecial[key] || 1;
                  const delta = live - base;
                  const percent = Math.min(100, Math.max(5, (live / 20) * 100));

                  // Breakdown lines for SPECIAL
                  const bLines: { source: string; val: string }[] = [
                    { source: "Base S.P.E.C.I.A.L.", val: `${base}` }
                  ];

                  const style = findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId);
                  if (style?.effectMath && style.effectMath[key]) {
                    bLines.push({ source: `${style.label.split(" (")[0]}`, val: `+${style.effectMath[key]}` });
                  }

                  payload.legendaryPerkIds.forEach((id) => {
                    const perk = LEGENDARY_PERK_CARDS[id];
                    if (perk?.specialBonus && perk.specialBonus[key]) {
                      bLines.push({ source: perk.label.split(" (")[0], val: `+${perk.specialBonus[key]}` });
                    }
                  });

                  payload.legendaryModIds.forEach((id, idx) => {
                    if (!id) return;
                    const mod = mods.find((m) => m.id === id);
                    if (mod?.effectMath && mod.effectMath[key]) {
                      bLines.push({ source: `${mod.name} (${idx + 1}★)`, val: `+${mod.effectMath[key]}` });
                    }
                  });

                  if (payload.ghoul && key === "cha") {
                    bLines.push({ source: "Ghoul Biology", val: "-10" });
                  }
                  
                  return (
                    <div key={key} className="space-y-1 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-bold text-accent/90 cursor-help hover:underline decoration-accent/40 decoration-dashed underline-offset-2">
                              {BUILDER_SPECIAL_LABELS[key]}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-background/95 border-border/70 p-2.5 font-mono text-[0.78rem] shadow-xl space-y-1.5 min-w-[200px]">
                            <div className="font-black text-accent border-b border-border/20 pb-1 flex justify-between">
                              <span>{SPECIAL_FULL_NAMES[key] || key.toUpperCase()}</span>
                              <span>Total: {live}</span>
                            </div>
                            <div className="space-y-1 text-foreground/80 text-[0.75rem]">
                              {bLines.map((b, i) => (
                                <div key={i} className="flex justify-between gap-3">
                                  <span className="text-foreground/60">{b.source}</span>
                                  <span className="font-bold text-accent">{b.val}</span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex items-center gap-1 text-[0.84rem]">
                          <span className="font-black text-foreground">{live}</span>
                          {delta !== 0 && (
                            <span className={cn(
                              "text-[0.84rem] px-1 rounded font-black tracking-tight",
                              delta > 0 ? "text-accent bg-accent/10 border border-accent/20" : "text-danger bg-danger/10 border border-danger/20"
                            )}>
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Progress track */}
                      <div className="h-1.5 w-full bg-background/60 rounded border border-border/15 overflow-hidden relative">
                        <div 
                          className="h-full bg-accent shadow-[0_0_6px_var(--color-accent)] transition-all duration-200"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {/* Mini inline baseline increment/decrement */}
                      <div className="flex items-center gap-1 mt-0.5 justify-end text-[0.72rem]">
                        <span className="text-foreground/30 mr-1">Base: {base}</span>
                        <button
                          type="button"
                          className="w-3.5 h-3.5 rounded border border-border/30 hover:border-accent hover:text-accent flex items-center justify-center font-bold bg-background/40 transition-colors"
                          onClick={() => {
                            const val = Math.max(1, base - 1);
                            setPayload(p => ({
                              ...p,
                              baseSpecial: { ...p.baseSpecial, [key]: val }
                            }));
                            triggerBuilderAchievement("build_stats");
                          }}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="w-3.5 h-3.5 rounded border border-border/30 hover:border-accent hover:text-accent flex items-center justify-center font-bold bg-background/40 transition-colors"
                          onClick={() => {
                            const val = Math.min(15, base + 1);
                            setPayload(p => ({
                              ...p,
                              baseSpecial: { ...p.baseSpecial, [key]: val }
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
                    rLines.push({ source: `${lining.label.split(" (")[0]}`, val: `+${lining.effectMath[k]}` });
                  }

                  payload.legendaryModIds.forEach((id, idx) => {
                    if (!id) return;
                    const mod = mods.find((m) => m.id === id);
                    if (mod?.effectMath && mod.effectMath[k]) {
                      rLines.push({ source: `${mod.name} (${idx + 1}★)`, val: `+${mod.effectMath[k]}` });
                    }
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
                      <TooltipContent side="top" className="bg-background/95 border-border/70 p-2.5 font-mono text-[0.78rem] shadow-xl space-y-1.5 min-w-[210px]">
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

        </div>

        {/* COLUMN 2: CENTER PANEL - REPAIR BAY SILHOUETTE */}
        <div className="space-y-4">
          
          {/* Base selector panel dropdown */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              &gt; CHASSIS CONFIGURATION MATRIX
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 items-center">
              <div>
                <label className="text-[0.78rem] text-foreground/45 uppercase font-bold tracking-widest">Active Target Base</label>
                <select
                  className="mt-1 h-9 w-full rounded border border-border/30 bg-background/55 px-2 text-xs font-mono uppercase text-foreground/90 cursor-pointer hover:border-accent transition-colors"
                  value={payload.basePieceId}
                  onChange={(e) => setBase(e.target.value)}
                >
                  {BASE_GEAR_GROUP_ORDER.map((kind) => (
                    <optgroup key={kind} label={BASE_GEAR_GROUP_LABEL[kind]} className="bg-background font-mono text-xs">
                      {BASE_GEAR_PIECES.filter((g) => g.kind === kind).map((g) => {
                        const learnedHint =
                          isTrackableBasePieceId(g.id) &&
                          (g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)
                            ? isPowerArmorTorsoRowLearned(learnedBasePieceIds, g.id)
                            : learnedBasePieceIds.has(g.id))
                            ? " [LEARNED]"
                            : "";
                        return (
                          <option key={g.id} value={g.id}>
                            {formatBaseOptionLabel(g)}
                            {learnedHint}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 sm:mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-full text-xs font-mono uppercase font-bold text-accent border-accent/40 hover:border-accent hover:bg-accent/10"
                  onClick={() => exportBuilderLoadoutCard({ piece, payload, totals, equippedLines: listEquippedLegendariesWithBenchLabels(payload, mods) })}
                >
                  Export Build Card (PNG)
                </Button>
              </div>

              {isTrackableBasePieceId(piece.id) ? (
                <div className={cn(
                  "flex items-center justify-between gap-3 border rounded px-3 py-2.5 mt-4 sm:mt-0 font-mono",
                  currentBaseLearned
                    ? "border-accent/40 bg-accent/5"
                    : "border-border/20 bg-background/25"
                )}>
                  <div className="min-w-0">
                    <div className="text-[0.72rem] font-black uppercase text-accent tracking-wider">Plan Registry Sync</div>
                    <div className="text-[0.72rem] text-foreground/45 mt-0.5 uppercase">
                      {isSignedIn ? "Database persistent" : "Offline draft"}
                    </div>
                  </div>
                  <ProgressToggle
                    unlocked={currentBaseLearned}
                    disabled={!isSignedIn || pendingLearnedPieceId === piece.id}
                    onToggle={() =>
                      void toggleLearnedBasePiece(piece.id, !currentBaseLearned)
                    }
                    className="shrink-0"
                  />
                </div>
              ) : null}
            </div>

            {learnedToggleError ? (
              <p className="text-[0.78rem] text-danger font-bold">
                &gt;&gt; ERROR: {learnedToggleError}
              </p>
            ) : null}
          </div>

          {/* Interactive Silhouette Repair Frame */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-4 font-mono relative min-h-[500px] flex flex-col justify-between">
            <div className="crt-scanline" />
            
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2 relative z-10">
              <span>[ Chassis Bay schematic ]</span>
              <span className="text-[0.72rem] text-foreground/40 font-normal">Active frame: {piece.label}</span>
            </div>

            {isMultiPiece ? (
              <div className="relative flex flex-col items-center justify-center bg-background/20 rounded-lg p-2 overflow-hidden border border-border/15 shadow-inner">
                {/* Skeletal layout */}
                <div className="w-full max-w-lg grid grid-cols-3 gap-2.5 relative z-10">
                  
                  {/* Row 1: Helmet (Center) */}
                  <div className="col-span-3 flex justify-center mb-1.5">
                    <div className="w-1/2 min-w-[130px]">
                      {renderGearSlotCard("helmet", "Helmet", isPA ? 0 : null)}
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
            ) : (
              <div className="flex flex-col items-center justify-center py-6 relative z-10 w-full">
                <div className="flex flex-col items-center p-6 text-center border border-dashed border-accent/25 bg-accent/[0.01] rounded-xl w-full max-w-md mb-4 relative overflow-hidden">
                  <Boxes className="h-10 w-10 text-accent/50 mb-2 animate-pulse" />
                  <span className="text-sm font-black uppercase tracking-wider text-accent">{piece.label}</span>
                  <span className="text-[0.72rem] text-foreground/45 mt-1 uppercase tracking-widest font-mono">
                    {piece.kind === "weapon" ? `Weapon Matrix // ${piece.weaponSub || "Tactical"}` : "Core Stack Lining"}
                  </span>
                </div>
                
                {!starsDisabled ? (
                  <div className="space-y-2 w-full max-w-md">
                    {SLOT_LABELS.map((starLabel, starIndex) => {
                      const id = payload.legendaryModIds[starIndex];
                      const mod = id ? mods.find(m => m.id === id) : null;
                      return (
                        <div
                          key={starIndex}
                          className={cn(
                            "pip-terminal-panel flex flex-col gap-2 rounded-lg border px-3 py-2.5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between",
                            mod 
                              ? "border-accent/40 bg-accent/[0.02]" 
                              : "border-border/30 bg-background/25"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[0.72rem] font-black uppercase text-foreground/45 tracking-widest">
                              {starIndex + 1}★ {starLabel}
                            </div>
                            <div className="text-xs font-bold text-foreground mt-0.5 uppercase tracking-wide">
                              {mod ? mod.name : "— Empty bench configuration —"}
                            </div>
                            {mod && (
                              <LegendaryModDetailFootprint
                                mod={mod}
                                piece={piece}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 sm:mt-0 mt-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-[0.72rem] uppercase font-mono hover:text-accent hover:border-accent"
                              onClick={() => setActivePick({ scope: "single", starIndex })}
                            >
                              Bench
                            </Button>
                            {mod && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[0.72rem] uppercase font-mono hover:text-destructive text-foreground/40"
                                onClick={() => clearStarSlot("single", undefined, starIndex)}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-foreground/30 border border-dashed border-border/30 bg-background/10 rounded-xl w-full max-w-md">
                    <div className="text-xs uppercase tracking-widest font-black">LEGENDARY STAR BENCH DISABLED</div>
                    <div className="text-[0.72rem] text-foreground/40 mt-1">&gt; linings_applied_via_aux_logistics.exe</div>
                  </div>
                )}
              </div>
            )}

            <div className="text-[0.72rem] text-foreground/30 uppercase tracking-widest leading-relaxed border-t border-border/10 pt-2 text-center mt-2">
              Telemetric calculations updated instant client-side. Cloudflare 0ms CPU load.
            </div>
          </div>

        </div>

        {/* COLUMN 3: AUX LOGISTICS & PRESENTS */}
        <div className="space-y-4">
          
          {/* Holotape presests slot saver */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <div className="text-xs font-black uppercase tracking-widest text-accent">
                [ Presets holotape deck ]
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-[0.84rem] font-black uppercase border tracking-wider",
                activeLoadoutIndex === null
                  ? "bg-amber-400/10 border-amber-400/20 text-amber-500/90"
                  : "bg-emerald-400/10 border-emerald-400/20 text-emerald-500/90"
              )}>
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  activeLoadoutIndex === null ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <span>{activeLoadoutIndex === null ? "sandbox" : `LOADED`}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const saved = savedLoadouts[i];
                return (
                  <div key={i} className="flex flex-col gap-0.5 border border-border/15 p-1 rounded-md bg-background/25">
                    <Button
                      variant={saved ? "secondary" : "outline"}
                      size="sm"
                      className={cn(
                        "h-7 px-1 text-[0.72rem] font-bold uppercase transition-all truncate text-center",
                        saved 
                          ? "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20" 
                          : "opacity-40 hover:opacity-100 border-dashed"
                      )}
                      onClick={() => loadLoadout(i)}
                      disabled={!saved}
                      title={saved ? `Load ${saved.name}` : "Empty Tape Drive"}
                    >
                      {saved ? saved.name : `Tape slot ${i + 1}`}
                    </Button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1 text-[0.84rem] text-foreground/45 hover:text-accent font-black uppercase tracking-wider py-0.5"
                      onClick={() => saveLoadout(i)}
                    >
                      {saved ? (
                        <>
                          <Save className="h-2 w-2" /> <span>rewrite</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-2 w-2" /> <span>write</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Character Species / Ghoul switch */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ TELEMETRY MODS &amp; SPECIES ]
            </div>
            
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-2 text-xs text-foreground/75 hover:bg-background/25 p-1.5 rounded transition-all">
                <input
                  type="checkbox"
                  checked={payload.ghoul}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setPayload((p) => {
                      const base = { ...p, ghoul: next };
                      if (next && mods.length > 0)
                        return stripGhoulBlockedLegendarySelections(base, mods);
                      return base;
                    });
                  }}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--accent)] cursor-pointer"
                />
                <span>
                  <span className="font-bold text-accent">GHOUL BIOLOGY ACTIVATION</span>
                  <span className="block text-[0.72rem] text-foreground/50 uppercase tracking-wide mt-0.5">
                    Radiation immunised; CHA −10 penalty; Blocked rows stripped.
                  </span>
                </span>
              </label>

              {ghoulLegendarySandboxNotes ? (
                <div className="p-2 border border-warning/30 bg-warning/5 text-[0.72rem] rounded text-warning/90 space-y-1">
                  <div className="font-black uppercase tracking-widest">&gt;&gt; WARNING: RAD DEVIATION LOGGED</div>
                  <ul className="list-disc pl-3.5 space-y-0.5 font-sans">
                    {ghoulLegendarySandboxNotes.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Global Actions */}
            <div className="flex gap-2 pt-2 border-t border-border/15">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAllSelections}
                className="gap-1.5 h-7 text-[0.72rem] uppercase font-mono bg-danger/10 hover:bg-danger/25 text-danger font-bold border border-danger/20 flex-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Flush Registry</span>
              </Button>
              {undoPayload ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoClear}
                  className="gap-1.5 h-7 text-[0.72rem] uppercase font-mono flex-1 font-bold"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restore</span>
                </Button>
              ) : null}
            </div>
          </div>

          {/* Mutations loader dropdown matrix */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ MUTATION SERUM MATRIX ]
            </div>
            
            <div className="max-h-36 space-y-1 overflow-y-auto pr-1 grid grid-cols-2 gap-1 text-[0.78rem]">
              {SANDBOX_MUTATIONS.map((m) => {
                const on = payload.mutationIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded p-1 transition-colors hover:bg-background/45 border",
                      on ? "border-accent/30 bg-accent/5 text-accent" : "border-transparent text-foreground/75"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => {
                        setPayload((p) => {
                          const next = on
                            ? p.mutationIds.filter((x) => x !== m.id)
                            : [...p.mutationIds, m.id];
                          return { ...p, mutationIds: next };
                        });
                      }}
                      className="h-3 w-3 shrink-0 accent-[var(--accent)] cursor-pointer"
                    />
                    <span className="truncate">{m.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/15 text-[0.78rem]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-foreground">Strange in Numbers</div>
                  <p className="text-[0.72rem] text-foreground/45 leading-tight">Teammate mutations amplify +25%.</p>
                </div>
                <Switch
                  checked={payload.hasStrangeInNumbers}
                  onCheckedChange={(checked) =>
                    setPayload((p) => ({
                      ...p,
                      hasStrangeInNumbers: checked,
                    }))
                  }
                  aria-label="Strange in Numbers"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="min-w-0">
                  <div className="font-bold text-foreground">Ignore Serum penalties</div>
                  <p className="text-[0.72rem] text-foreground/45 leading-tight">Filter mutation negatives.</p>
                </div>
                <Switch
                  checked={payload.ignoreMutationPenalties}
                  onCheckedChange={(checked) =>
                    setPayload((p) => ({
                      ...p,
                      ignoreMutationPenalties: checked,
                    }))
                  }
                  aria-label="Ignore mutation penalties"
                />
              </div>
            </div>
          </div>

          {/* Underarmor configurations details */}
          {piece.kind !== "powerArmor" && (
            <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
              <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
                [ UNDERARMOR SUB-SYSTEMS ]
              </div>
              <div className="grid gap-2.5 text-[0.78rem] w-full max-w-full overflow-hidden">
                <label className="flex flex-col min-w-0 max-w-full">
                  <span className="text-foreground/45 uppercase font-bold tracking-wider mb-0.5">Cosmetic Base</span>
                  <select
                    className="h-8 rounded border border-border/30 bg-background/90 px-2 text-xs font-mono uppercase text-foreground/80 cursor-pointer w-full max-w-full min-w-0 truncate pr-6 text-ellipsis focus:outline-none focus:border-accent"
                    value={payload.underarmor.shellId}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        underarmor: { ...p.underarmor, shellId: e.target.value },
                      }))
                    }
                  >
                    {UNDERARMOR_SHELLS.map((o) => (
                      <option key={o.id} value={o.id} className="bg-background text-foreground">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col min-w-0 max-w-full">
                  <span className="text-foreground/45 uppercase font-bold tracking-wider mb-0.5">Lining Mod (Resistances)</span>
                  <select
                    className="h-8 rounded border border-border/30 bg-background/90 px-2 text-xs font-mono uppercase text-foreground/80 cursor-pointer w-full max-w-full min-w-0 truncate pr-6 text-ellipsis focus:outline-none focus:border-accent"
                    value={payload.underarmor.liningId ?? "none"}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        underarmor: {
                          ...p.underarmor,
                          liningId: e.target.value === "none" ? null : e.target.value,
                        },
                      }))
                    }
                  >
                    {UNDERARMOR_LININGS.map((o) => (
                      <option key={o.id} value={o.id} className="bg-background text-foreground">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col min-w-0 max-w-full">
                  <span className="text-foreground/45 uppercase font-bold tracking-wider mb-0.5">Underarmor Style (S.P.E.C.I.A.L. Bonus)</span>
                  <select
                    className="h-8 rounded border border-border/30 bg-background/90 px-2 text-xs font-mono uppercase text-foreground/80 cursor-pointer w-full max-w-full min-w-0 truncate pr-6 text-ellipsis focus:outline-none focus:border-accent"
                    value={payload.underarmor.styleId ?? "none"}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        underarmor: {
                          ...p.underarmor,
                          styleId: e.target.value === "none" ? null : e.target.value,
                        },
                      }))
                    }
                  >
                    {UNDERARMOR_STYLES.map((o) => (
                      <option key={o.id} value={o.id} className="bg-background text-foreground">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Legendary Perks selections */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-2 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ LEGENDARY CLEARANCE PERKS ]
            </div>
            
            <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-1">
              {Object.entries(LEGENDARY_PERK_CARDS).map(([id, perk]) => {
                const on = payload.legendaryPerkIds.includes(id);
                return (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded p-1 transition-colors hover:bg-background/45 border text-[0.78rem]",
                      on ? "border-accent/30 bg-accent/5 text-accent" : "border-transparent text-foreground/75"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => {
                        setPayload((p) => {
                          const next = on
                            ? p.legendaryPerkIds.filter((x) => x !== id)
                            : [...p.legendaryPerkIds, id];
                          return { ...p, legendaryPerkIds: next };
                        });
                        triggerBuilderAchievement("build_perks");
                      }}
                      className="h-3 w-3 shrink-0 accent-accent cursor-pointer"
                    />
                    <span className="truncate">{perk.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Shopping list of modules required */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ BENCH MATERIALS LIST ]
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {shopping.lines.length === 0 ? (
                <p className="text-[0.78rem] text-foreground/30 italic uppercase">
                  &gt; legendary bench is idle. no modules required.
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

          {/* Active Effects Summarizer rollup list */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ ACTIVE LEGENDARY MATRICES ]
            </div>
            
            {groupedLegendaryEffects.length === 0 ? (
              <p className="text-[0.78rem] text-foreground/35 italic uppercase">
                &gt; no legendary effects currently loaded.
              </p>
            ) : (
              <ul className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {groupedLegendaryEffects.map(({ mod, count, benchLabels }) => {
                  const descRaw = mod.description?.trim() ?? "";
                  const desc = sandboxLegendaryDescription(descRaw, piece) || descRaw;
                  return (
                    <li key={mod.id} className="text-[0.78rem] leading-snug border-b border-border/10 pb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-accent/90 uppercase tracking-wide">
                          {mod.name}
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

          {/* Share links inputs and logs */}
          <div className="pip-terminal-panel p-4 rounded-xl space-y-3 font-mono">
            <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2">
              [ PUBLISH TRANSMISSION ]
            </div>
            <Input
              className="h-8 text-xs bg-background/55 font-mono text-foreground border-border/30 focus-visible:ring-accent"
              value={shareTitle}
              onChange={(e) => setShareTitle(e.target.value)}
              placeholder="Loadout name..."
            />
            <Button
              type="button"
              className="w-full h-8 text-[0.78rem] font-black uppercase tracking-widest bg-accent hover:bg-accent/80 text-accent-foreground shadow-[0_0_10px_rgba(var(--color-accent),0.2)]"
              onClick={shareBuild}
              disabled={shareBusy}
            >
              {shareBusy ? "UPLOADING TO ETHER..." : "PUBLISH ENCRYPTED URL"}
            </Button>
            
            {shareResult?.startsWith(String.fromCharCode(47)) ? (
              <div className="rounded border border-accent/30 bg-accent/5 p-2 text-center text-xs animate-pulse">
                <Link className="text-accent font-black uppercase tracking-wider underline flex items-center justify-center gap-1" href={shareResult}>
                  <CheckCircle2 className="h-3 w-3" /> OPEN SHARED SPEC
                </Link>
              </div>
            ) : shareResult ? (
              <div className="p-2 border border-danger/30 bg-danger/5 text-[0.72rem] rounded text-danger font-bold uppercase">
                &gt;&gt; ERROR: {shareResult}
              </div>
            ) : null}
          </div>

        </div>

      </div>

      {/* Dialog Overlay Mod Picker with customized Fallout styling */}
      <Dialog
        open={activePick !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActivePick(null);
            setSlotQuery("");
          }
        }}
      >
        <DialogContent
          className={cn(
            "pip-terminal-panel flex max-h-[min(94vh,56rem)] flex-col gap-0 border-accent/40 rounded-xl overflow-hidden font-mono",
            isCompactDensity
              ? "max-w-xl p-3 sm:p-4"
              : "max-w-2xl p-5 sm:p-6",
          )}
        >
          <div className="crt-scanline" />
          
          <DialogHeader className={cn("shrink-0 pr-8 relative z-10", isCompactDensity && "space-y-1")}>
            <DialogTitle className={cn("font-black uppercase tracking-widest text-accent", isCompactDensity ? "text-xs" : "text-sm")}>
              {activePick
                ? `&gt; CONFIGURE SLOT: ${activePickLabel(activePick, baseStarsContextLabel, piece.kind === "powerArmor")}`
                : "CHOOSE MOD"}
            </DialogTitle>
            <DialogDescription className="text-[0.78rem] text-foreground/50 uppercase tracking-widest leading-relaxed">
              {isCompactDensity
                ? "Search compatible catalog mods. Tap row to equip."
                : "Search compatibilities. Unlocked entries sync from legendary ledger tracker database values."}
              {payload.ghoul ? (
                <span className="mt-1.5 block text-[0.72rem] text-warning/90 font-bold bg-warning/5 p-1 rounded border border-warning/20">
                  GHOUL NOTICE: FOOD/WATER ACCENTS STRIPPED FROM EFFECT MATH.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mt-3 shrink-0 relative z-10">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
            <Input
              className={cn(
                "pl-8 h-9 text-xs bg-background/60 font-mono text-foreground border-border/30 focus-visible:ring-accent",
                isCompactDensity && "h-8"
              )}
              placeholder="SEARCH EFFECT CODENAME..."
              value={slotQuery}
              onChange={(e) => setSlotQuery(e.target.value)}
            />
          </div>
          
          {slotQuery.trim() !== deferredSlotQuery.trim() ? (
            <p className="mt-1 text-[0.72rem] text-foreground/35 uppercase tracking-wider relative z-10 animate-pulse">
              &gt; searching matrices database...
            </p>
          ) : null}
          
          <div
            className={cn(
              "mt-3 min-h-[min(32vh,14rem)] flex-1 overflow-y-auto pr-1 [scrollbar-gutter:stable] relative z-10",
              isCompactDensity
                ? "max-h-[min(74vh,30rem)] space-y-1 sm:max-h-[min(76vh,32rem)]"
                : "max-h-[min(70vh,38rem)] space-y-2 sm:max-h-[min(72vh,40rem)] min-h-[min(36vh,18rem)]",
            )}
          >
            {piece.kind === "underarmor" ? (
              <div className="text-foreground/40 text-xs italic uppercase">
                &gt; underarmor does not equip legendary stars.
              </div>
            ) : optionsForActivePick.length === 0 ? (
              <div className="text-foreground/40 text-xs italic uppercase">
                &gt; no matching catalog mods found.
              </div>
            ) : (
              <div className="grid gap-2">
                {optionsForActivePick.map((m) => (
                  <ModPickerOption
                    key={m.id}
                    mod={m}
                    piece={piece}
                    compact={isCompactDensity}
                    ghoulMode={payload.ghoul}
                    isRecommended={recommendedIds.has(m.id)}
                    onPick={assignSlot}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/15 shrink-0 flex items-center justify-between relative z-10">
            <Button
              type="button"
              className="h-8 text-[0.78rem] uppercase font-mono hover:text-accent font-bold"
              variant="outline"
              size="sm"
              onClick={() => {
                setActivePick(null);
                setSlotQuery("");
              }}
            >
              EJECT BENCH
            </Button>
            <span className="text-[0.84rem] text-foreground/30 uppercase tracking-widest font-mono">
              SECURE LEDGER CONNECTION ENABLED
            </span>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
