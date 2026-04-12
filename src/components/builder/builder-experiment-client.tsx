"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Boxes } from "lucide-react";
import { updateLearnedBasePiece } from "@/actions/learned-base-piece";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressToggle from "@/components/progress-toggle";
import { ARMOR_SET_SLOT_LABELS, getArmorSetRow } from "@/lib/builder/armor-sets";
import {
  ARMOR_MATERIAL_MODS,
  listArmorMiscModOptions,
  armorCraftingEffectLayers,
  defaultArmorPieceCrafting
} from "@/lib/builder/armor-piece-mods";
import {
  BASE_GEAR_GROUP_LABEL,
  BASE_GEAR_GROUP_ORDER,
  BASE_GEAR_PIECES,
  getBaseGearPiece,
  isPowerArmorHelmetBasePiece,
  isPowerArmorTorsoBasePiece,
  isTrackableBasePieceId,
  listTrackableBaseGearByGroup,
  POWER_ARMOR_HELMET_PIECES,
  type BaseGearPiece
} from "@/lib/builder/base-gear";
import {
  aggregateEffectMath,
  BUILDER_SPECIAL_KEYS,
  BUILDER_SPECIAL_LABELS,
  buildShoppingList,
  filterModsForSlot,
  formatEffectMathDeltas,
  isFullArmorSetPayload,
  listEquippedModsInBenchOrder,
  listExtraEffectMathEntries,
  stripGhoulBlockedLegendarySelections,
  type BuilderEffectTotals
} from "@/lib/builder/compatibility";
import { isGhoulDiscouragedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import {
  defaultPowerArmorHelmetCrafting,
  emptyArmorLegendaryGrid
} from "@/lib/builder/normalize-builder-payload";
import {
  defaultHelmetIdForTorsoPieceId,
  getPowerArmorCombinedBaseStats,
  getPowerArmorSlotBaseStats,
  isKnownPowerArmorHelmetPieceId
} from "@/lib/builder/power-armor-stats";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import { subscribeProgressChange } from "@/lib/progress-events";
import { sandboxLegendaryDescription } from "@/lib/builder/sandbox-mod-description";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import BuilderTotalsStatKey from "@/components/builder/builder-totals-stat-key";
import {
  importNukesDragonsFo76CharacterUrl,
  type NdImportResult
} from "@/lib/builder/nukes-dragons-import";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES
} from "@/lib/builder/underarmor";

const SLOT_LABELS = ["1st star", "2nd star", "3rd star", "4th star"];

type ActivePick =
  | null
  | { scope: "single"; starIndex: number }
  | { scope: "armorSet"; pieceIndex: number; starIndex: number };

function formatBaseOptionLabel(g: BaseGearPiece) {
  if (g.kind === "underarmor") return `${g.label} (underarmor)`;
  if (g.kind === "weapon" && g.weaponSub) return `${g.label} (weapon · ${g.weaponSub})`;
  if (g.kind === "armor" && g.armorSetKey) return g.label;
  if (g.kind === "powerArmor" && g.powerArmorSlot === "helmet") return `${g.label} (power armor · helmet)`;
  return `${g.label} (${g.kind})`;
}

function defaultPayload(): BuilderPayload {
  const first = BASE_GEAR_PIECES.find((p) => p.kind === "armor") ?? BASE_GEAR_PIECES[0]!;
  return {
    version: 4,
    basePieceId: first.id,
    equipmentKind: first.kind,
    weaponSub: first.weaponSub ?? null,
    legendaryModIds: [null, null, null, null],
    armorLegendaryModIds: emptyArmorLegendaryGrid(),
    armorPieceCrafting: defaultArmorPieceCrafting(),
    powerArmorHelmetId: null,
    powerArmorHelmetCrafting: defaultPowerArmorHelmetCrafting(),
    ghoul: false,
    underarmor: { shellId: UNDERARMOR_SHELLS[0]!.id, liningId: "none", styleId: "none" }
  };
}

function activePickLabel(active: ActivePick, baseLabel: string): string {
  if (!active) return "";
  if (active.scope === "single") {
    const star = SLOT_LABELS[active.starIndex] ?? "";
    return `${star} · ${baseLabel}`;
  }
  const slot = ARMOR_SET_SLOT_LABELS[active.pieceIndex] ?? "Piece";
  const star = SLOT_LABELS[active.starIndex] ?? "";
  return `${star} · ${slot} · ${baseLabel}`;
}

function BuilderTotalsGrid({ totals }: { totals: BuilderEffectTotals }) {
  return (
    <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
      <dt className="text-foreground/60">DR</dt>
      <dd>{totals.dr}</dd>
      <dt className="text-foreground/60">ER</dt>
      <dd>{totals.er}</dd>
      <dt className="text-foreground/60">FR</dt>
      <dd>{totals.fr}</dd>
      <dt className="text-foreground/60">CR</dt>
      <dd>{totals.cr}</dd>
      <dt className="text-foreground/60">PR</dt>
      <dd>{totals.pr}</dd>
      <dt className="text-foreground/60">RR</dt>
      <dd>{totals.rr}</dd>
      <dt className="text-foreground/60">HP bump</dt>
      <dd>{totals.hp}</dd>
      <dt className="text-foreground/60">Damage %</dt>
      <dd>{Math.round(totals.damagePct * 100)}%</dd>
      {BUILDER_SPECIAL_KEYS.flatMap((k) => [
        <dt key={`${k}-l`} className="text-foreground/60">
          {BUILDER_SPECIAL_LABELS[k]}
        </dt>,
        <dd key={`${k}-r`}>{totals[k]}</dd>
      ])}
      <dt className="text-foreground/60">SPECIAL (other)</dt>
      <dd>{totals.specialBonus}</dd>
      <dt className="text-foreground/60">AP regen</dt>
      <dd>{Math.round(totals.apRegen * 100)}%</dd>
      <dt className="text-foreground/60">Carry wt</dt>
      <dd>{totals.carryWeight}</dd>
    </dl>
  );
}

function useDensityCompact() {
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    const root = document.documentElement;
    const read = () => setCompact(root.getAttribute("data-density") === "compact");
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
  density = "default"
}: {
  mod: BuilderModDTO;
  /** When set, scaling descriptions (caps, addictions, etc.) show the max relevant line for this base. */
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
      deltas ||
      "No modeled DR/SPECIAL/damage in sandbox — still equippable.";
    const titleBits = [desc, descRaw !== desc ? descRaw : "", ...extras.map((e) => `${e.key}: ${e.value}`)].filter(
      Boolean
    );
    const title = titleBits.length ? `${line}\n\n${titleBits.join("\n")}` : line;
    return (
      <p className="mt-0.5 truncate text-[11px] leading-snug text-foreground/65" title={title}>
        <span className="font-medium text-accent/85 tabular-nums">{line}</span>
        {tail ? <span className="text-foreground/45"> · details on hover</span> : null}
      </p>
    );
  }

  return (
    <div className="mt-1 space-y-2">
      <div className="text-xs leading-relaxed">
        {deltas ? (
          <span className="font-medium text-accent/90 tabular-nums">{deltas}</span>
        ) : (
          <span className="text-foreground/55">
            No resist, SPECIAL, or damage bonus modeled in sandbox totals — you can still equip this star.
          </span>
        )}
      </div>
      {tail ? (
        <div className="space-y-1.5 border-t border-border/70 pt-1.5 text-xs leading-snug text-foreground/72">
          {desc ? (
            <p>
              <span className="font-semibold text-foreground/50">Also: </span>
              {desc}
              {descRaw && descRaw !== desc ? (
                <span className="sr-only"> Original catalog: {descRaw}</span>
              ) : null}
            </p>
          ) : null}
          {extras.length > 0 ? (
            <div>
              <div className="font-semibold text-foreground/50">Catalog extras (not in totals)</div>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                {extras.map((e) => (
                  <li key={e.key}>
                    <span className="font-mono text-[10px] uppercase tracking-tight text-foreground/45">
                      {e.key}
                    </span>
                    : {e.value}
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
  onPick
}: {
  mod: BuilderModDTO;
  piece: BaseGearPiece;
  compact: boolean;
  ghoulMode: boolean;
  onPick: (id: string) => void;
}) {
  const unlock = mod.trackerUnlock ?? "unknown";
  const statusAttr = unlock === "unlocked" ? "unlocked" : unlock === "locked" ? "locked" : undefined;
  const statusLabel =
    unlock === "unlocked" ? "Unlocked" : unlock === "locked" ? "Locked" : "Not in tracker";
  const descDisplay = sandboxLegendaryDescription(mod.description, piece) || mod.description?.trim() || "";
  const title = compact
    ? [mod.name, descDisplay, formatEffectMathDeltas(mod.effectMath)].filter(Boolean).join(" — ")
    : undefined;

  return (
    <button
      type="button"
      data-status={statusAttr}
      title={title}
      style={{ contentVisibility: "auto", containIntrinsicSize: compact ? "auto 48px" : "auto 96px" }}
      className={cn(
        "summary-status-card mod-picker-option flex w-full flex-col rounded-[var(--radius)] border text-left",
        "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        unlock === "unknown" && "opacity-95",
        compact ? "gap-0 px-2 py-1.5" : "gap-0.5 py-2.5"
      )}
      onClick={() => onPick(mod.id)}
    >
      <div className={cn("flex items-start justify-between gap-2", compact ? "px-0" : "px-0.5")}>
        <span className={cn("min-w-0 font-semibold leading-snug", compact ? "text-[13px]" : "text-sm")}>
          {mod.name}
        </span>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/70">
          {statusLabel}
        </span>
      </div>
      <div className={cn(compact ? "px-0" : "mt-1 px-0.5")}>
        <LegendaryModDetailFootprint mod={mod} piece={piece} density={compact ? "compact" : "default"} />
      </div>
      {ghoulMode && isGhoulDiscouragedLegendarySlug(mod.slug) ? (
        <p
          className={cn(
            "mt-1 rounded-[var(--radius)] border border-[color:color-mix(in_srgb,var(--color-warning)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_12%,transparent)] px-1.5 py-1 text-[10px] leading-snug text-foreground/75",
            compact ? "mx-0" : "mx-0.5"
          )}
        >
          Off-meta for typical Ghoul play — you can still pick it here.
        </p>
      ) : null}
    </button>
  );
});

type BuilderExperimentClientProps = {
  initialLearnedBasePieceIds?: string[];
};

export default function BuilderExperimentClient({
  initialLearnedBasePieceIds = []
}: BuilderExperimentClientProps) {
  const { data: session, status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === "authenticated" && Boolean(session?.user?.id);

  const [mods, setMods] = React.useState<BuilderModDTO[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<BuilderPayload>(() => defaultPayload());
  const [activePick, setActivePick] = React.useState<ActivePick>(null);
  const [slotQuery, setSlotQuery] = React.useState("");
  const deferredSlotQuery = React.useDeferredValue(slotQuery);
  const isCompactDensity = useDensityCompact();
  const [shareTitle, setShareTitle] = React.useState("My R.O.L.L. loadout");
  const [shareBusy, setShareBusy] = React.useState(false);
  const [shareResult, setShareResult] = React.useState<string | null>(null);
  const [learnedBasePieceIds, setLearnedBasePieceIds] = React.useState(
    () => new Set(initialLearnedBasePieceIds)
  );
  const [learnedToggleError, setLearnedToggleError] = React.useState<string | null>(null);
  const [pendingLearnedPieceId, setPendingLearnedPieceId] = React.useState<string | null>(null);
  const [ndUrlInput, setNdUrlInput] = React.useState("");
  const [ndImport, setNdImport] = React.useState<(NdImportResult & { appliedAt: number }) | null>(null);
  const [ndImportError, setNdImportError] = React.useState<string | null>(null);

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
          "Builder catalog failed to load. On the server, run database migrations (`prisma migrate deploy`) and seed builder mods (`npm run db:seed:builder` or full `npm run db:seed`) if tables are empty."
        )
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
  const fullArmorSet = piece.kind === "armor" && Boolean(piece.armorSetKey) && isFullArmorSetPayload(payload);
  const baseStarsContextLabel = React.useMemo(() => {
    if (piece.kind === "armor" && piece.armorSetKey) {
      return getArmorSetRow(piece.armorSetKey)?.label ?? piece.label;
    }
    return formatBaseOptionLabel(piece);
  }, [piece]);
  const showSplitTotalsPanel =
    piece.kind === "weapon" || (piece.kind === "powerArmor" && !isPowerArmorHelmetBasePiece(piece));
  const currentBaseLearned = isTrackableBasePieceId(piece.id) && learnedBasePieceIds.has(piece.id);
  const trackableGroups = React.useMemo(() => listTrackableBaseGearByGroup(), []);
  const learnedTrackableCount = React.useMemo(() => {
    let n = 0;
    for (const id of learnedBasePieceIds) {
      if (isTrackableBasePieceId(id)) n += 1;
    }
    return n;
  }, [learnedBasePieceIds]);
  const trackableTotal = React.useMemo(
    () => trackableGroups.reduce((acc, g) => acc + g.pieces.length, 0),
    [trackableGroups]
  );

  async function toggleLearnedBasePiece(pieceId: string, learned: boolean) {
    setLearnedToggleError(null);
    if (!isSignedIn) return;
    setPendingLearnedPieceId(pieceId);
    try {
      await updateLearnedBasePiece({ basePieceId: pieceId, learned });
      setLearnedBasePieceIds((prev) => {
        const next = new Set(prev);
        if (learned) next.add(pieceId);
        else next.delete(pieceId);
        return next;
      });
    } catch {
      setLearnedToggleError("Could not update learned bases. Try signing in again.");
    } finally {
      setPendingLearnedPieceId(null);
    }
  }

  React.useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      equipmentKind: piece.kind,
      weaponSub: piece.kind === "weapon" ? (piece.weaponSub ?? prev.weaponSub) : null
    }));
  }, [piece.id, piece.kind, piece.weaponSub]);

  const equippedModsOrdered = React.useMemo(
    () => listEquippedModsInBenchOrder(payload, mods),
    [mods, payload]
  );

  const underLayers = React.useMemo(() => {
    const layers: Record<string, number>[] = [];
    const shell = findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId);
    const lining = findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId);
    const style = findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId);
    if (shell?.effectMath) layers.push(shell.effectMath);
    if (lining?.effectMath) layers.push(lining.effectMath);
    if (style?.effectMath) layers.push(style.effectMath);
    return layers;
  }, [payload.underarmor]);

  const armorCraftingLayers = React.useMemo(() => {
    if (!fullArmorSet) return [];
    return armorCraftingEffectLayers(payload.armorPieceCrafting);
  }, [fullArmorSet, payload.armorPieceCrafting]);

  const baseArmorStats = React.useMemo(() => {
    if (piece.kind === "armor" && piece.armorSetKey) {
      return getArmorSetRow(piece.armorSetKey)?.stats ?? null;
    }
    if (piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece)) {
      return getPowerArmorSlotBaseStats(piece.id, "helmet");
    }
    if (piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)) {
      return getPowerArmorCombinedBaseStats(piece.id, payload.powerArmorHelmetId);
    }
    return null;
  }, [piece, payload.powerArmorHelmetId]);

  const powerArmorHelmetCraftingLayers = React.useMemo(() => {
    if (piece.kind !== "powerArmor" || !isPowerArmorTorsoBasePiece(piece)) return [];
    if (!payload.powerArmorHelmetId || !isKnownPowerArmorHelmetPieceId(payload.powerArmorHelmetId)) return [];
    return armorCraftingEffectLayers([payload.powerArmorHelmetCrafting]);
  }, [piece, payload.powerArmorHelmetId, payload.powerArmorHelmetCrafting]);

  const powerArmorHelmetOnlyCraftingLayers = React.useMemo(() => {
    if (piece.kind !== "powerArmor" || !isPowerArmorHelmetBasePiece(piece)) return [];
    const row = payload.armorPieceCrafting[0];
    return armorCraftingEffectLayers([row ?? { materialModId: "none", miscModId: "none" }]);
  }, [piece, payload.armorPieceCrafting]);

  const powerArmorTorsoCraftingLayers = React.useMemo(() => {
    if (piece.kind !== "powerArmor" || !isPowerArmorTorsoBasePiece(piece)) return [];
    const row = payload.armorPieceCrafting[0];
    return armorCraftingEffectLayers([row ?? { materialModId: "none", miscModId: "none" }]);
  }, [piece, payload.armorPieceCrafting]);

  const ndPerkLayer = React.useMemo(() => {
    if (!ndImport?.layer) return null;
    const keys = Object.keys(ndImport.layer).filter((k) => ndImport!.layer[k] !== 0);
    if (keys.length === 0) return null;
    return ndImport.layer;
  }, [ndImport]);

  const totals = React.useMemo(
    () =>
      aggregateEffectMath(equippedModsOrdered, {
        ghoul: payload.ghoul,
        extraLayers: [
          ...underLayers,
          ...armorCraftingLayers,
          ...powerArmorTorsoCraftingLayers,
          ...powerArmorHelmetCraftingLayers,
          ...powerArmorHelmetOnlyCraftingLayers,
          ...(ndPerkLayer ? [ndPerkLayer] : [])
        ],
        baseArmorStats
      }),
    [
      equippedModsOrdered,
      payload.ghoul,
      underLayers,
      armorCraftingLayers,
      powerArmorTorsoCraftingLayers,
      powerArmorHelmetCraftingLayers,
      powerArmorHelmetOnlyCraftingLayers,
      baseArmorStats,
      ndPerkLayer
    ]
  );

  const starModTotals = React.useMemo(
    () => aggregateEffectMath(equippedModsOrdered, { ghoul: payload.ghoul, extraLayers: [] }),
    [equippedModsOrdered, payload.ghoul]
  );

  /** How Ghoul mode changes sandbox totals vs human (legendary slice + global rules). @see https://fallout.fandom.com/wiki/Fallout_76_playable_ghoul */
  const ghoulLegendarySandboxNotes = React.useMemo(() => {
    if (!payload.ghoul) return null;
    const lines: string[] = [
      "RR: still summed from gear and layers here — resist can change how radiation interacts with your character even though ghouls do not take rads like humans (full rad/Glow sim is out of scope for this sandbox).",
      "CHA: Live totals apply −10 effective Charisma vs human for playable Ghoul (perk-card equip limits are unchanged in-game).",
      "Star picker: Overeater’s, Gourmand’s, Nutrition, and Hydration bench rows are hidden; Bloodied / Unyielding stay available with an off-meta note."
    ];
    if (equippedModsOrdered.length > 0) {
      const human = aggregateEffectMath(equippedModsOrdered, { ghoul: false, extraLayers: [] });
      const ghoul = aggregateEffectMath(equippedModsOrdered, { ghoul: true, extraLayers: [] });
      if (human.specialBonus !== ghoul.specialBonus) {
        lines.push(
          `SPECIAL bonus roll-up (legendaries only): ${human.specialBonus} → ${ghoul.specialBonus} after Ghoul caps on flagged catalog rows.`
        );
      }
      if (human.dr !== ghoul.dr || human.er !== ghoul.er || human.cha !== ghoul.cha) {
        lines.push(
          `Legendary-only row — DR ${human.dr}→${ghoul.dr}, ER ${human.er}→${ghoul.er}, CHA ${human.cha}→${ghoul.cha} (CHA includes −10 only when Ghoul is on).`
        );
      }
    }
    return lines;
  }, [payload.ghoul, equippedModsOrdered]);

  const shopping = React.useMemo(() => buildShoppingList(equippedModsOrdered), [equippedModsOrdered]);

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
    [activePick]
  );

  const optionsForActivePick = React.useMemo(() => {
    if (!activePick) return [];
    const slotIndex = activePick.scope === "single" ? activePick.starIndex : activePick.starIndex;
    const filtered = filterModsForSlot(mods, piece, slotIndex, { ghoul: payload.ghoul }).filter((m) => {
      const q = deferredSlotQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      if (payload.ghoul) {
        const discA = isGhoulDiscouragedLegendarySlug(a.slug) ? 1 : 0;
        const discB = isGhoulDiscouragedLegendarySlug(b.slug) ? 1 : 0;
        if (discA !== discB) return discA - discB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [mods, piece, activePick, deferredSlotQuery, payload.ghoul]);

  function setBase(id: string) {
    const next = getBaseGearPiece(id);
    if (!next) return;
    setPayload((p) => ({
      ...p,
      basePieceId: id,
      equipmentKind: next.kind,
      weaponSub: next.kind === "weapon" ? next.weaponSub ?? null : null,
      legendaryModIds: [null, null, null, null],
      armorLegendaryModIds: emptyArmorLegendaryGrid(),
      armorPieceCrafting: defaultArmorPieceCrafting(),
      powerArmorHelmetId:
        next.kind === "powerArmor" && isPowerArmorTorsoBasePiece(next)
          ? defaultHelmetIdForTorsoPieceId(next.id)
          : null,
      powerArmorHelmetCrafting: defaultPowerArmorHelmetCrafting(),
      underarmor:
        next.kind === "underarmor" && next.defaultUnderarmorShellId
          ? { ...p.underarmor, shellId: next.defaultUnderarmorShellId }
          : p.underarmor
    }));
    setActivePick(null);
  }

  function setArmorCraftingField(
    pieceIndex: number,
    field: "materialModId" | "miscModId",
    value: string
  ) {
    setPayload((p) => {
      const nextCraft = p.armorPieceCrafting.map((row, i) =>
        i === pieceIndex ? { ...row, [field]: value } : row
      );
      return { ...p, armorPieceCrafting: nextCraft };
    });
  }

  function clearStarSlot(scope: "single" | "armorSet", pieceIndex: number | undefined, starIndex: number) {
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
          payload
        })
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

  const starsDisabled =
    piece.kind === "underarmor" || (piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece));
  const showSingleStars =
    !fullArmorSet && !starsDisabled && !(piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/70">
        <Boxes className="h-4 w-4 text-accent" />
        <span>
          Experimental loadout sandbox — armor sets use{" "}
          <a
            className="text-accent underline"
            href="https://nukaknights.com/articles/expected-changes-for-the-backwoods-update-on-3rd-march-2026.html#armor"
            target="_blank"
            rel="noreferrer"
          >
            Nuka Knights (Backwoods) resist tables
          </a>{" "}
          plus your R.O.L.L. legendary catalog for effect math.
        </span>
      </div>

      {loadError ? <div className="text-sm text-[color:var(--color-warning)]">{loadError}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">Base</div>
            <select
              className="mt-2 h-10 w-full rounded-[var(--radius)] border border-border bg-background px-3 text-sm"
              value={payload.basePieceId}
              onChange={(e) => setBase(e.target.value)}
            >
              {BASE_GEAR_GROUP_ORDER.map((kind) =>
                kind === "powerArmor" ? (
                  <React.Fragment key="power-armor-split">
                    <optgroup label="Power armor (torso)">
                      {BASE_GEAR_PIECES.filter((g) => g.kind === "powerArmor" && g.powerArmorSlot !== "helmet").map(
                        (g) => {
                          const learnedHint =
                            isTrackableBasePieceId(g.id) && learnedBasePieceIds.has(g.id) ? " · learned" : "";
                          return (
                            <option key={g.id} value={g.id}>
                              {formatBaseOptionLabel(g)}
                              {learnedHint}
                            </option>
                          );
                        }
                      )}
                    </optgroup>
                    <optgroup label="Power armor (helmet)">
                      {POWER_ARMOR_HELMET_PIECES.map((g) => {
                        const learnedHint =
                          isTrackableBasePieceId(g.id) && learnedBasePieceIds.has(g.id) ? " · learned" : "";
                        return (
                          <option key={g.id} value={g.id}>
                            {formatBaseOptionLabel(g)}
                            {learnedHint}
                          </option>
                        );
                      })}
                    </optgroup>
                  </React.Fragment>
                ) : (
                  <optgroup key={kind} label={BASE_GEAR_GROUP_LABEL[kind]}>
                    {BASE_GEAR_PIECES.filter((g) => g.kind === kind).map((g) => {
                      const learnedHint =
                        isTrackableBasePieceId(g.id) && learnedBasePieceIds.has(g.id) ? " · learned" : "";
                      return (
                        <option key={g.id} value={g.id}>
                          {formatBaseOptionLabel(g)}
                          {learnedHint}
                        </option>
                      );
                    })}
                  </optgroup>
                )
              )}
            </select>
            {isTrackableBasePieceId(piece.id) ? (
              <div
                className={cn(
                  "mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] border px-3 py-2",
                  currentBaseLearned ? "border-[color:color-mix(in_srgb,var(--color-success)_60%,var(--color-border))]" : "border-border"
                )}
                data-status={currentBaseLearned ? "unlocked" : "locked"}
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground/60">Plan learned (this base)</div>
                  <div className="text-xs text-foreground/55">
                    {isSignedIn
                      ? "Matches tracker-style unlock colors elsewhere in R.O.L.L."
                      : "Sign in to save which armor, power armor, and underarmor bases you know."}
                  </div>
                </div>
                <ProgressToggle
                  unlocked={currentBaseLearned}
                  disabled={!isSignedIn || pendingLearnedPieceId === piece.id}
                  onToggle={() => void toggleLearnedBasePiece(piece.id, !currentBaseLearned)}
                  className="shrink-0"
                />
              </div>
            ) : null}
            {learnedToggleError ? (
              <p className="mt-2 text-xs text-[color:var(--color-warning)]">{learnedToggleError}</p>
            ) : null}
            {sessionStatus === "unauthenticated" ? (
              <p className="mt-2 text-xs text-foreground/60">
                <Link href="/auth/sign-in?callbackUrl=/build" className="text-accent underline">
                  Sign in
                </Link>{" "}
                to persist learned bases.
              </p>
            ) : null}
            <details className="mt-3 rounded-[var(--radius)] border border-border bg-background/40">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-foreground/75">
                All armor, power armor &amp; underarmor bases ({learnedTrackableCount}/{trackableTotal} learned)
              </summary>
              <div className="max-h-72 space-y-3 overflow-y-auto border-t border-border px-3 py-3">
                {trackableGroups.map((group) => (
                  <div key={`${group.kind}-${group.label}`}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
                      {group.label}
                    </div>
                    <ul className="mt-1.5 space-y-1.5">
                      {group.pieces.map((g) => {
                        const learned = learnedBasePieceIds.has(g.id);
                        const pending = pendingLearnedPieceId === g.id;
                        return (
                          <li
                            key={g.id}
                            className={cn(
                              "summary-status-card flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] border text-sm",
                              learned ? "opacity-100" : "opacity-95"
                            )}
                            data-status={learned ? "unlocked" : "locked"}
                          >
                            <span className="min-w-0 font-medium leading-snug">{formatBaseOptionLabel(g)}</span>
                            <ProgressToggle
                              unlocked={learned}
                              disabled={!isSignedIn || pending}
                              onToggle={() => void toggleLearnedBasePiece(g.id, !learned)}
                              className="shrink-0 text-xs"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
            {fullArmorSet ? (
              <p className="mt-2 text-xs text-foreground/65">
                Full set: chest, then arms, then legs — four legendary stars per piece (20 total). Pick material +
                misc per slot; fifth-star legendaries are not in this sandbox yet.
              </p>
            ) : null}
            <div className="mt-3 space-y-2 rounded-[var(--radius)] border border-border bg-background/35 px-3 py-2">
              <label className="flex cursor-pointer items-start gap-2 text-xs text-foreground/75">
                <input
                  type="checkbox"
                  checked={payload.ghoul}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setPayload((p) => {
                      const base = { ...p, ghoul: next };
                      if (next && mods.length > 0) return stripGhoulBlockedLegendarySelections(base, mods);
                      return base;
                    });
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span>
                  <span className="font-medium text-foreground/85">Ghoul build</span>
                  <span className="block text-[11px] text-foreground/60">
                    Modeled after playable Ghoul (Ghoul Within): Feral replaces hunger/thirst, so hunger/thirst
                    legendaries and bench rows are dropped from math; RR on gear still stacks into totals; CHA includes a
                    −10 effective penalty; Unyielding-style caps still apply; Bloodied / Unyielding stay pickable with a
                    warning.
                  </span>
                </span>
              </label>
              {ghoulLegendarySandboxNotes ? (
                <ul className="list-disc space-y-1 pl-5 text-[11px] text-foreground/65">
                  {ghoulLegendarySandboxNotes.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">Underarmor</div>
            <p className="mt-1 text-xs text-foreground/55">
              Shell, lining, and style stack into totals. Mark shells as learned in the list above — underarmor never
              uses the outer legendary star bench.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="text-xs text-foreground/60">
                Shell
                <select
                  className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                  value={payload.underarmor.shellId}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, underarmor: { ...p.underarmor, shellId: e.target.value } }))
                  }
                >
                  {UNDERARMOR_SHELLS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-foreground/60">
                Lining
                <select
                  className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                  value={payload.underarmor.liningId ?? "none"}
                  onChange={(e) =>
                    setPayload((p) => ({
                      ...p,
                      underarmor: { ...p.underarmor, liningId: e.target.value === "none" ? null : e.target.value }
                    }))
                  }
                >
                  {UNDERARMOR_LININGS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-foreground/60">
                Style
                <select
                  className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                  value={payload.underarmor.styleId ?? "none"}
                  onChange={(e) =>
                    setPayload((p) => ({
                      ...p,
                      underarmor: { ...p.underarmor, styleId: e.target.value === "none" ? null : e.target.value }
                    }))
                  }
                >
                  {UNDERARMOR_STYLES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece) ? (
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-sm font-semibold">Helmet crafting</div>
              <p className="mt-1 text-xs text-foreground/55">
                Power armor helmets never take legendary stars — only material upgrades and misc mods (stacked into
                totals here).
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-foreground/60">
                  Material
                  <select
                    className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                    value={payload.armorPieceCrafting[0]?.materialModId ?? "none"}
                    onChange={(e) => setArmorCraftingField(0, "materialModId", e.target.value)}
                  >
                    {ARMOR_MATERIAL_MODS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-foreground/60">
                  Misc
                  <select
                    className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                    value={payload.armorPieceCrafting[0]?.miscModId ?? "none"}
                    onChange={(e) => setArmorCraftingField(0, "miscModId", e.target.value)}
                  >
                    {listArmorMiscModOptions(null, 0).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece) ? (
            <>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-sm font-semibold">Torso crafting</div>
                <p className="mt-1 text-xs text-foreground/55">
                  Bench-style material and misc for this chassis (same sandbox hints as armor pieces). Jet pack is
                  available on the torso, matching in-game power armor behavior.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="text-xs text-foreground/60">
                    Material
                    <select
                      className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                      value={payload.armorPieceCrafting[0]?.materialModId ?? "none"}
                      onChange={(e) => setArmorCraftingField(0, "materialModId", e.target.value)}
                    >
                      {ARMOR_MATERIAL_MODS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-foreground/60">
                    Misc
                    <select
                      className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                      value={payload.armorPieceCrafting[0]?.miscModId ?? "none"}
                      onChange={(e) => setArmorCraftingField(0, "miscModId", e.target.value)}
                    >
                      {listArmorMiscModOptions(null, 0, { powerArmorTorso: true }).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-sm font-semibold">Paired helmet</div>
              <p className="mt-1 text-xs text-foreground/55">
                In Fallout 76, power armor helmets do not accept legendary effects. Choose a helmet to add its base
                resists and material / misc bench math on top of your torso plan (torso still uses the four-star bench
                below).
              </p>
              <label className="mt-3 block text-xs text-foreground/60">
                Helmet
                <select
                  className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-background px-3 text-sm"
                  value={payload.powerArmorHelmetId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPayload((p) => ({
                      ...p,
                      powerArmorHelmetId: v === "" ? null : v,
                      powerArmorHelmetCrafting: v === "" ? defaultPowerArmorHelmetCrafting() : p.powerArmorHelmetCrafting
                    }));
                  }}
                >
                  <option value="">No helmet</option>
                  {POWER_ARMOR_HELMET_PIECES.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
              {payload.powerArmorHelmetId ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="text-xs text-foreground/60">
                    Helmet material
                    <select
                      className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                      value={payload.powerArmorHelmetCrafting.materialModId}
                      onChange={(e) =>
                        setPayload((p) => ({
                          ...p,
                          powerArmorHelmetCrafting: {
                            ...p.powerArmorHelmetCrafting,
                            materialModId: e.target.value
                          }
                        }))
                      }
                    >
                      {ARMOR_MATERIAL_MODS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-foreground/60">
                    Helmet misc
                    <select
                      className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                      value={payload.powerArmorHelmetCrafting.miscModId}
                      onChange={(e) =>
                        setPayload((p) => ({
                          ...p,
                          powerArmorHelmetCrafting: { ...p.powerArmorHelmetCrafting, miscModId: e.target.value }
                        }))
                      }
                    >
                      {listArmorMiscModOptions(null, 0).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </div>
            </>
          ) : null}

          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">Stars</div>
            {starsDisabled ? (
              <p className="mt-2 text-xs text-foreground/65">
                {piece.kind === "underarmor" ? (
                  <>
                    Underarmor uses linings and styles only — no outer legendary stars. Switch base to armor, power
                    armor, or a weapon to plan star mods (underarmor bases stay trackable in the list above).
                  </>
                ) : (
                  <>
                    Power armor helmets never use the outer legendary star bench — plan material and misc under{" "}
                    <span className="font-medium text-foreground/80">Helmet crafting</span> above. Switch to a torso or
                    weapon base to pick star mods.
                  </>
                )}
              </p>
            ) : (
              <p className="mt-2 text-xs text-foreground/70">
                Legendary planning for{" "}
                <span className="font-semibold text-foreground/90">{baseStarsContextLabel}</span>
                {fullArmorSet
                  ? " — each body slot below is part of this set; stars and crafting apply only to this armor."
                  : showSingleStars
                    ? " — four stars apply to this base only."
                    : null}
              </p>
            )}

            {fullArmorSet ? (
              <div className="mt-3 space-y-4">
                {ARMOR_SET_SLOT_LABELS.map((slotLabel, pieceIndex) => (
                  <div
                    key={slotLabel}
                    className="rounded-[var(--radius)] border border-border bg-background/40 p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                      {slotLabel}
                      <span className="mt-0.5 block text-[10px] font-normal normal-case text-foreground/50">
                        {baseStarsContextLabel} · material &amp; misc for this piece only
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-foreground/60">
                        Material
                        <select
                          className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                          value={payload.armorPieceCrafting[pieceIndex]?.materialModId ?? "none"}
                          onChange={(e) => setArmorCraftingField(pieceIndex, "materialModId", e.target.value)}
                        >
                          {ARMOR_MATERIAL_MODS.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-foreground/60">
                        Misc
                        <select
                          className="mt-1 h-9 w-full rounded-[var(--radius)] border border-border bg-background px-2 text-sm"
                          value={payload.armorPieceCrafting[pieceIndex]?.miscModId ?? "none"}
                          onChange={(e) => setArmorCraftingField(pieceIndex, "miscModId", e.target.value)}
                        >
                          {listArmorMiscModOptions(piece.armorSetKey ?? null, pieceIndex).map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {SLOT_LABELS.map((label, starIndex) => {
                        const id = payload.armorLegendaryModIds[pieceIndex]![starIndex];
                        const mod = id ? mods.find((m) => m.id === id) : null;
                        return (
                          <div
                            key={`${pieceIndex}-${starIndex}`}
                            className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background/50 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-foreground/60">{label}</div>
                              <div className="mt-0.5 text-sm font-medium leading-snug">{mod?.name ?? "—"}</div>
                              {mod ? <LegendaryModDetailFootprint mod={mod} piece={piece} /> : null}
                              {payload.ghoul && mod && isGhoulDiscouragedLegendarySlug(mod.slug) ? (
                                <p className="mt-1 text-[10px] leading-snug text-[color:color-mix(in_srgb,var(--color-warning)_75%,var(--foreground))]">
                                  Off-meta for typical Ghoul builds — kept so you can compare numbers anyway.
                                </p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 gap-2 sm:pt-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setActivePick({ scope: "armorSet", pieceIndex, starIndex })}
                              >
                                Pick
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => clearStarSlot("armorSet", pieceIndex, starIndex)}
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {showSingleStars ? (
              <div className="mt-3 rounded-[var(--radius)] border border-border bg-background/40 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  {piece.kind === "weapon" ? "Weapon" : piece.kind === "powerArmor" ? "Power armor" : "Armor"}
                </div>
                <p className="mt-1 text-xs text-foreground/55">
                  Four legendary stars on{" "}
                  <span className="font-medium text-foreground/75">{formatBaseOptionLabel(piece)}</span> — the right
                  panel reflects this base plus your underarmor stack.
                </p>
                <div className="mt-3 grid gap-2">
                  {SLOT_LABELS.map((label, index) => {
                    const id = payload.legendaryModIds[index];
                    const mod = id ? mods.find((m) => m.id === id) : null;
                    return (
                      <div
                        key={label}
                        className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background/50 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-foreground/60">{label}</div>
                          <div className="mt-0.5 text-sm font-medium leading-snug">{mod?.name ?? "—"}</div>
                          {mod ? <LegendaryModDetailFootprint mod={mod} piece={piece} /> : null}
                          {payload.ghoul && mod && isGhoulDiscouragedLegendarySlug(mod.slug) ? (
                            <p className="mt-1 text-[10px] leading-snug text-[color:color-mix(in_srgb,var(--color-warning)_75%,var(--foreground))]">
                              Off-meta for typical Ghoul builds — kept so you can compare numbers anyway.
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-2 sm:pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setActivePick({ scope: "single", starIndex: index })}
                          >
                            Pick
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => clearStarSlot("single", undefined, index)}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

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
                "builder-mod-picker flex max-h-[min(94vh,56rem)] flex-col gap-0",
                isCompactDensity ? "max-w-xl p-3 sm:p-4" : "max-w-2xl p-5 sm:p-6"
              )}
            >
              <DialogHeader className={cn("shrink-0 pr-8", isCompactDensity && "space-y-1")}>
                <DialogTitle className={cn(isCompactDensity ? "text-sm" : "text-base")}>
                  {activePick ? `Choose ${activePickLabel(activePick, baseStarsContextLabel)}` : "Choose mod"}
                </DialogTitle>
                <DialogDescription className={cn(isCompactDensity && "text-xs leading-snug")}>
                  {isCompactDensity
                    ? "Search, then tap a row. Hover a compact row for full description."
                    : "Search your catalog; rows use the same unlock colors as All Effects when this mod maps to a tracker tier. Mods with no modeled resists or SPECIAL still work here — details appear under each row."}
                  {payload.ghoul ? (
                    <span className="mt-1 block text-[11px] text-[color:color-mix(in_srgb,var(--color-warning)_80%,var(--foreground))]">
                      Ghoul build: hunger/thirst rows follow playable Ghoul rules; Bloodied / Unyielding stay pickable
                      with an off-meta note.
                    </span>
                  ) : null}
                </DialogDescription>
              </DialogHeader>
              <Input
                className={cn("mt-2 shrink-0", isCompactDensity && "h-8 text-sm")}
                placeholder="Search compatible mods…"
                value={slotQuery}
                onChange={(e) => setSlotQuery(e.target.value)}
              />
              {slotQuery.trim() !== deferredSlotQuery.trim() ? (
                <p className="mt-1 text-[11px] text-foreground/45">Updating results…</p>
              ) : null}
              <div
                className={cn(
                  "builder-mod-picker-scroll mt-2 min-h-[min(32vh,14rem)] flex-1 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]",
                  isCompactDensity
                    ? "max-h-[min(74vh,30rem)] space-y-1 sm:max-h-[min(76vh,32rem)]"
                    : "max-h-[min(70vh,38rem)] space-y-2 sm:max-h-[min(72vh,40rem)] min-h-[min(36vh,18rem)]"
                )}
              >
                {piece.kind === "underarmor" ? (
                  <div className="text-foreground/60">No compatible mods for underarmor.</div>
                ) : optionsForActivePick.length === 0 ? (
                  <div className="text-foreground/60">No compatible mods for this slot and base.</div>
                ) : (
                  optionsForActivePick.map((m) => (
                    <ModPickerOption
                      key={m.id}
                      mod={m}
                      piece={piece}
                      compact={isCompactDensity}
                      ghoulMode={payload.ghoul}
                      onPick={assignSlot}
                    />
                  ))
                )}
              </div>
              <Button
                type="button"
                className="mt-4 shrink-0 self-start"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActivePick(null);
                  setSlotQuery("");
                }}
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>

          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">R.O.L.L. link</div>
            <Input className="mt-2" value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} />
            <Button type="button" className="mt-3" size="sm" onClick={shareBuild} disabled={shareBusy}>
              {shareBusy ? "Saving…" : "Publish share link"}
            </Button>
            {shareResult?.startsWith("/") ? (
              <div className="mt-2 text-sm">
                <Link className="text-accent underline" href={shareResult}>
                  Open {shareResult}
                </Link>
              </div>
            ) : shareResult ? (
              <div className="mt-2 text-sm text-[color:var(--color-warning)]">{shareResult}</div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-5.5rem)] lg:self-start lg:overflow-y-auto">
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">Nukes &amp; Dragons import</div>
            <p className="mt-1 text-xs text-foreground/60">
              Paste a share URL from the{" "}
              <a
                className="text-accent underline"
                href="https://nukesdragons.com/fallout-76/character"
                target="_blank"
                rel="noreferrer"
              >
                Fallout 76 character planner
              </a>
              . R.O.L.L. merges a <span className="font-medium text-foreground/75">partial</span> perk table into Live
              totals (carry, resists, a few damage/AP/HP hints). Expand the table in code for full coverage.
            </p>
            <Input
              className="mt-2 font-mono text-[11px] leading-snug"
              placeholder="https://nukesdragons.com/fallout-76/character?p=…&s=…&v=2"
              value={ndUrlInput}
              onChange={(e) => {
                setNdUrlInput(e.target.value);
                setNdImportError(null);
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setNdImportError(null);
                  const r = importNukesDragonsFo76CharacterUrl(ndUrlInput);
                  if ("error" in r) {
                    setNdImportError(r.error);
                    setNdImport(null);
                    return;
                  }
                  setNdImport({ ...r, appliedAt: Date.now() });
                }}
              >
                Apply to Live totals
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setNdImport(null);
                  setNdImportError(null);
                }}
              >
                Clear import
              </Button>
            </div>
            {ndImportError ? (
              <p className="mt-2 text-xs text-[color:var(--color-warning)]">{ndImportError}</p>
            ) : null}
            {ndImport ? (
              <div className="mt-2 space-y-1.5 text-[11px] leading-snug text-foreground/65">
                {ndImport.warnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
                {ndImport.unknownCodes.length > 0 ? (
                  <p>
                    <span className="font-medium text-foreground/75">Codes not in R.O.L.L. table yet:</span>{" "}
                    {ndImport.unknownCodes.join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            {showSplitTotalsPanel ? (
              <>
                <div className="text-sm font-semibold">Live totals · {formatBaseOptionLabel(piece)}</div>
                <p className="mt-1 text-xs text-foreground/60">
                  {piece.kind === "weapon"
                    ? "Weapon star picks roll up separately from your underarmor (and any other layers). Damage % is usually what moves on guns."
                    : isPowerArmorTorsoBasePiece(piece)
                      ? "Torso star picks stack separately from underarmor. When a helmet is selected, its base resists and helmet crafting are included in “All layers” — helmets never roll into the star-only row."
                      : "Power armor star picks stack separately from underarmor; resists still include shell/lining/style."}
                </p>
                <p className="mt-1 text-xs text-foreground/50">
                  {ndPerkLayer
                    ? "Star-only row is legendaries on this base. “All layers” also includes underarmor, crafting rows, and any Nukes & Dragons perk import you applied above."
                    : "These rows are catalog math only unless you apply a Nukes & Dragons import — that overlay is merged into “All layers” only."}
                </p>
                <BuilderTotalsStatKey className="mt-2" />
                <div className="mt-3 text-xs font-semibold text-foreground/65">From legendary stars (this base)</div>
                <BuilderTotalsGrid totals={starModTotals} />
                <div className="mt-4 text-xs font-semibold text-foreground/65">All layers (stars + underarmor)</div>
                <BuilderTotalsGrid totals={totals} />
              </>
            ) : (
              <>
                <div className="text-sm font-semibold">
                  Live totals
                  {piece.kind === "underarmor" ? " · Underarmor" : null}
                </div>
                {fullArmorSet ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    <span className="font-medium text-foreground/75">{baseStarsContextLabel}</span> full set: Backwoods
                    resist table, each slot&apos;s material and misc craft, all twenty star picks, plus underarmor effect
                    math.
                  </p>
                ) : piece.kind === "underarmor" ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    Shell, lining, and style only — switch to armor, power armor, or a weapon to model legendary stars.
                  </p>
                ) : piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece) ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    Torso base resists, torso material / misc (jet pack when chosen), optional helmet base and helmet
                    bench rows, torso star picks, and underarmor layers.
                  </p>
                ) : piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece) ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    Helmet base resists and helmet material / misc only — legendary stars are not available on power
                    armor helmets.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-foreground/60">
                    Totals from your R.O.L.L. legendary catalog and underarmor layers.
                  </p>
                )}
                <p className="mt-1 text-xs text-foreground/50">
                  {ndPerkLayer
                    ? "Totals include your legendary picks, underarmor, crafting rows, and the Nukes & Dragons perk import (approximate sandbox math)."
                    : "These numbers are catalog math only unless you apply a Nukes & Dragons import for approximate perk bonuses."}
                </p>
                <BuilderTotalsStatKey className="mt-2" />
                <BuilderTotalsGrid totals={totals} />
              </>
            )}
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">Shopping list</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">
              {shopping.lines.length === 0 ? <li>No legendary modules picked yet.</li> : null}
              {shopping.lines.map((line) => (
                <li key={line.label}>
                  {line.count}× {line.label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
