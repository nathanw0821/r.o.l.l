"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Boxes } from "lucide-react";
import { updateLearnedBasePiece } from "@/actions/learned-base-piece";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  countLearnedTrackableBases,
  getBaseGearPiece,
  isPowerArmorHelmetBasePiece,
  isPowerArmorTorsoBasePiece,
  isPowerArmorTorsoRowLearned,
  isTrackableBasePieceId,
  listTrackableBaseGearByGroup,
  pairedPowerArmorHelmetId,
  POWER_ARMOR_HELMET_PIECES,
  trackableBaseRowCount,
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
  listEquippedLegendariesWithBenchLabels,
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
  getPowerArmorEquippedFlatStats,
  getPowerArmorSlotBaseStats,
  isKnownPowerArmorHelmetPieceId,
  POWER_ARMOR_PIECE_SLOT_LABELS,
  powerArmorFrameIntrinsicEffectMath,
  powerArmorInherentDamageReductionPercent,
  powerArmorInherentRadReductionPercent,
  sanitizePowerArmorPiecesEquipped
} from "@/lib/builder/power-armor-stats";
import { DEFAULT_POWER_ARMOR_PIECES_EQUIPPED, type BuilderModDTO, type BuilderPayload } from "@/lib/builder/types";
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
import BuilderTotalsStatKey, {
  type BuilderTotalsStatKeyMode
} from "@/components/builder/builder-totals-stat-key";
import {
  importNukesDragonsFo76CharacterUrl,
  type NdImportResult
} from "@/lib/builder/nukes-dragons-import";
import { SANDBOX_MUTATIONS, sandboxMutationMathLayer } from "@/lib/builder/sandbox-mutations";
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
  if (g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)) return g.label;
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
    powerArmorPiecesEquipped: DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
    ghoul: false,
    underarmor: { shellId: UNDERARMOR_SHELLS[0]!.id, liningId: "none", styleId: "none" },
    mutationIds: [],
    ignoreMutationPenalties: false
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

type TotalsPresentation = "weapon" | "powerArmor" | "balanced";

/** One cell: equipped gear value, optional overlay delta in parentheses, then combined total. */
function liveTotalsValueRowInt(base: number, total: number): React.ReactNode {
  const b = Math.round(base);
  const t = Math.round(total);
  const d = t - b;
  if (d === 0) {
    return <span className="tabular-nums">{t}</span>;
  }
  const sign = d > 0 ? "+" : "";
  return (
    <span className="tabular-nums">
      {b}{" "}
      <span className="text-foreground/55">
        ({sign}
        {d})
      </span>{" "}
      = {t}
    </span>
  );
}

function liveTotalsValueRowPct(base: number, total: number): React.ReactNode {
  const br = Math.round(base * 100);
  const tr = Math.round(total * 100);
  const d = tr - br;
  if (d === 0) {
    return <span className="tabular-nums">{tr}%</span>;
  }
  const sign = d > 0 ? "+" : "";
  return (
    <span className="tabular-nums">
      {br}%{" "}
      <span className="text-foreground/55">
        ({sign}
        {d}%)
      </span>{" "}
      = {tr}%
    </span>
  );
}

function BuilderTotalsGrid({
  baseTotals,
  totals,
  powerArmorSandbox,
  presentation = "balanced"
}: {
  baseTotals: BuilderEffectTotals;
  totals: BuilderEffectTotals;
  powerArmorSandbox?: { inherentDrPct: number; inherentRadReductionPct: number } | null;
  presentation?: TotalsPresentation;
}) {
  const resistRows = (
    <>
      <dt className="text-foreground/60">DR</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.dr, totals.dr)}</dd>
      <dt className="text-foreground/60">ER</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.er, totals.er)}</dd>
      <dt className="text-foreground/60">FR</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.fr, totals.fr)}</dd>
      <dt className="text-foreground/60">CR</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.cr, totals.cr)}</dd>
      <dt className="text-foreground/60">PR</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.pr, totals.pr)}</dd>
      <dt className="text-foreground/60">RR</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.rr, totals.rr)}</dd>
    </>
  );

  const specialRows = BUILDER_SPECIAL_KEYS.flatMap((k) => [
    <dt key={`${k}-l`} className="text-foreground/60">
      {BUILDER_SPECIAL_LABELS[k]}
    </dt>,
    <dd key={`${k}-r`} className="text-right">
      {liveTotalsValueRowInt(baseTotals[k], totals[k])}
    </dd>
  ]);

  const paRows =
    powerArmorSandbox != null ? (
      <>
        <dt className="text-foreground/60">PA inherent DR %</dt>
        <dd className="text-right tabular-nums">{powerArmorSandbox.inherentDrPct}%</dd>
        <dt className="text-foreground/60">PA inherent rad red. %</dt>
        <dd className="text-right tabular-nums">{powerArmorSandbox.inherentRadReductionPct}%</dd>
      </>
    ) : null;

  /** Default row order after resists (armor / underarmor / PA helmet). */
  const balancedCoreRows = (
    <>
      <dt className="text-foreground/60">HP bump</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.hp, totals.hp)}</dd>
      <dt className="text-foreground/60">Damage %</dt>
      <dd className="text-right">{liveTotalsValueRowPct(baseTotals.damagePct, totals.damagePct)}</dd>
      {specialRows}
      <dt className="text-foreground/60">SPECIAL (other)</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.specialBonus, totals.specialBonus)}</dd>
      <dt className="text-foreground/60">AP regen</dt>
      <dd className="text-right">{liveTotalsValueRowPct(baseTotals.apRegen, totals.apRegen)}</dd>
      <dt className="text-foreground/60">Carry wt</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.carryWeight, totals.carryWeight)}</dd>
    </>
  );

  /** Weapon bases: emphasize damage and mobility; resists are usually from other layers. */
  const weaponCoreRows = (
    <>
      <dt className="text-foreground/60">Damage %</dt>
      <dd className="text-right">{liveTotalsValueRowPct(baseTotals.damagePct, totals.damagePct)}</dd>
      <dt className="text-foreground/60">HP bump</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.hp, totals.hp)}</dd>
      <dt className="text-foreground/60">AP regen</dt>
      <dd className="text-right">{liveTotalsValueRowPct(baseTotals.apRegen, totals.apRegen)}</dd>
      <dt className="text-foreground/60">Carry wt</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.carryWeight, totals.carryWeight)}</dd>
      {specialRows}
      <dt className="text-foreground/60">SPECIAL (other)</dt>
      <dd className="text-right">{liveTotalsValueRowInt(baseTotals.specialBonus, totals.specialBonus)}</dd>
    </>
  );

  if (presentation === "weapon") {
    return (
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {weaponCoreRows}
        <dt className="col-span-2 mt-1 border-t border-border/60 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
          Resists (underarmor · mutations · imports)
        </dt>
        {resistRows}
      </dl>
    );
  }

  if (presentation === "powerArmor") {
    return (
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {resistRows}
        {paRows}
        <dt className="col-span-2 mt-1 border-t border-border/60 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
          Other modeled bonuses
        </dt>
        {balancedCoreRows}
      </dl>
    );
  }

  return (
    <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
      {resistRows}
      {balancedCoreRows}
      {paRows}
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
  isRecommended,
  onPick
}: {
  mod: BuilderModDTO;
  piece: BaseGearPiece;
  compact: boolean;
  ghoulMode: boolean;
  isRecommended?: boolean;
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
        "summary-status-card mod-picker-option flex w-full flex-col rounded-[var(--radius)] border text-left relative",
        "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        unlock === "unknown" && "opacity-95",
        compact ? "gap-0 px-2 py-1.5" : "gap-0.5 py-2.5",
        isRecommended && "border-accent/40 bg-accent/5"
      )}
      onClick={() => onPick(mod.id)}
    >
      <div className={cn("flex items-start justify-between gap-2", compact ? "px-0" : "px-0.5")}>
        <span className={cn("min-w-0 font-semibold leading-snug flex items-center gap-2", compact ? "text-[13px]" : "text-sm")}>
          {mod.name}
          {isRecommended && (
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-accent font-bold">
              Used on other piece
            </span>
          )}
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
    fullArmorSet ||
    piece.kind === "weapon" ||
    (piece.kind === "powerArmor" && !isPowerArmorHelmetBasePiece(piece));

  const totalsPresentation: TotalsPresentation =
    piece.kind === "weapon"
      ? "weapon"
      : piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)
        ? "powerArmor"
        : "balanced";

  const statKeyMode: BuilderTotalsStatKeyMode =
    totalsPresentation === "weapon" ? "weapon" : totalsPresentation === "powerArmor" ? "powerArmor" : "default";
  const currentBaseLearned =
    isTrackableBasePieceId(piece.id) &&
    (piece.kind === "powerArmor" && isPowerArmorTorsoBasePiece(piece)
      ? isPowerArmorTorsoRowLearned(learnedBasePieceIds, piece.id)
      : learnedBasePieceIds.has(piece.id));
  const trackableGroups = React.useMemo(() => listTrackableBaseGearByGroup(), []);
  const learnedTrackableCount = React.useMemo(
    () => countLearnedTrackableBases(learnedBasePieceIds),
    [learnedBasePieceIds]
  );
  const trackableTotal = trackableBaseRowCount();

  async function toggleLearnedBasePiece(pieceId: string, learned: boolean) {
    setLearnedToggleError(null);
    if (!isSignedIn) return;
    const row = getBaseGearPiece(pieceId);
    const ids =
      row && isPowerArmorTorsoBasePiece(row)
        ? [pieceId, pairedPowerArmorHelmetId(pieceId)].filter((x): x is string => Boolean(x))
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

  const equippedLegendaryBenchLines = React.useMemo(
    () => listEquippedLegendariesWithBenchLabels(payload, mods),
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
      return getPowerArmorEquippedFlatStats(piece.id, payload.powerArmorHelmetId, payload.powerArmorPiecesEquipped);
    }
    return null;
  }, [piece, payload.powerArmorHelmetId, payload.powerArmorPiecesEquipped]);

  const powerArmorFrameIntrinsicLayer = React.useMemo(() => {
    if (piece.kind !== "powerArmor" || !isPowerArmorTorsoBasePiece(piece)) return null;
    return powerArmorFrameIntrinsicEffectMath();
  }, [piece]);

  const powerArmorSandboxMeta = React.useMemo(() => {
    if (!isPowerArmorTorsoBasePiece(piece)) return null;
    return {
      inherentDrPct: powerArmorInherentDamageReductionPercent(payload.powerArmorPiecesEquipped),
      inherentRadReductionPct: powerArmorInherentRadReductionPercent(payload.powerArmorPiecesEquipped)
    };
  }, [piece, payload.powerArmorPiecesEquipped]);

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

  const mutationLayer = React.useMemo(
    () =>
      sandboxMutationMathLayer(payload.mutationIds, payload.ignoreMutationPenalties, {
        strangeInNumbersMutatedTeammates:
          ndImport?.hasStrangeInNumbers && payload.mutationIds.length > 0 ? 4 : 0
      }),
    [payload.mutationIds, payload.ignoreMutationPenalties, ndImport?.hasStrangeInNumbers]
  );

  /**
   * Same layers as full totals minus legendary stars and Character overlays (underarmor / mutations / N&D).
   * Live totals rows use `totals - intrinsicBenchTotals` so the (+…) block updates when star picks change.
   */
  const intrinsicBenchTotals = React.useMemo(
    () =>
      aggregateEffectMath([], {
        ghoul: payload.ghoul,
        extraLayers: [
          ...armorCraftingLayers,
          ...powerArmorTorsoCraftingLayers,
          ...powerArmorHelmetCraftingLayers,
          ...powerArmorHelmetOnlyCraftingLayers,
          ...(powerArmorFrameIntrinsicLayer ? [powerArmorFrameIntrinsicLayer] : [])
        ],
        baseArmorStats
      }),
    [
      payload.ghoul,
      armorCraftingLayers,
      powerArmorTorsoCraftingLayers,
      powerArmorHelmetCraftingLayers,
      powerArmorHelmetOnlyCraftingLayers,
      powerArmorFrameIntrinsicLayer,
      baseArmorStats
    ]
  );

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
          ...(powerArmorFrameIntrinsicLayer ? [powerArmorFrameIntrinsicLayer] : []),
          ...(mutationLayer ? [mutationLayer] : []),
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
      powerArmorFrameIntrinsicLayer,
      baseArmorStats,
      mutationLayer,
      ndPerkLayer
    ]
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
  }, [mods, piece, activePick, deferredSlotQuery, payload.ghoul, recommendedIds]);

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
      powerArmorPiecesEquipped:
        next.kind === "powerArmor" && isPowerArmorTorsoBasePiece(next)
          ? DEFAULT_POWER_ARMOR_PIECES_EQUIPPED
          : p.powerArmorPiecesEquipped,
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
      <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
        <h1 className="text-xl font-bold tracking-tight">B.U.I.L.D.</h1>
        <h2 className="text-sm font-semibold text-foreground/80 mt-1">
          Battle Utility &amp; Inventory Logistics Diagnostic
        </h2>
        <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/70">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-accent shrink-0" />
            <span>
              Experimental loadout sandbox — armor sets use{" "}
              <a
                className="text-accent underline"
                href="https://nukaknights.com/articles/expected-changes-for-the-backwoods-update-on-3rd-march-2026.html#armor"
                target="_blank"
                rel="noreferrer"
              >
                Nuka Knights (Backwoods) resist tables
              </a>
              ; optional perk overlay from{" "}
              <a
                className="text-accent underline"
                href="https://nukesdragons.com/fallout-76/character"
                target="_blank"
                rel="noreferrer"
              >
                Nukes &amp; Dragons
              </a>{" "}
              share URLs, plus your R.O.L.L. legendary catalog for effect math.
            </span>
          </div>
          
          <div className="mt-4 border-t border-border/60 pt-3">
            <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-2">
              Credits &amp; Inspiration
            </p>
            <p className="text-xs leading-relaxed">
              This diagnostic tool draws heavy inspiration from the following rich loadout planners and character builders:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-xs">
              <li>
                <a href="https://www.falloutbuilds.com/fo76/planner/" target="_blank" rel="noreferrer" className="text-accent hover:underline">FalloutBuilds Character Planner</a>
              </li>
              <li>
                <a href="https://www.falloutbuilds.com/fo76/mutations/" target="_blank" rel="noreferrer" className="text-accent hover:underline">FalloutBuilds Mutations Database</a>
              </li>
              <li>
                <a href="https://www.falloutbuilds.com/fo76/perk-matrix/" target="_blank" rel="noreferrer" className="text-accent hover:underline">FalloutBuilds Perk Matrix</a>
              </li>
              <li>
                <a href="https://www.falloutbuilds.com/fo76/perks/" target="_blank" rel="noreferrer" className="text-accent hover:underline">FalloutBuilds Perk Cards List</a>
              </li>
              <li>
                <a href="https://nukesdragons.com/fallout-76/character" target="_blank" rel="noreferrer" className="text-accent hover:underline">Nukes &amp; Dragons Character Builder</a>
              </li>
            </ul>
          </div>
        </div>
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
              {BASE_GEAR_GROUP_ORDER.map((kind) => (
                <optgroup key={kind} label={BASE_GEAR_GROUP_LABEL[kind]}>
                  {BASE_GEAR_PIECES.filter((g) => g.kind === kind).map((g) => {
                    const learnedHint =
                      isTrackableBasePieceId(g.id) &&
                      (g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)
                        ? isPowerArmorTorsoRowLearned(learnedBasePieceIds, g.id)
                        : learnedBasePieceIds.has(g.id))
                        ? " · learned"
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
                        const learned =
                          g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)
                            ? isPowerArmorTorsoRowLearned(learnedBasePieceIds, g.id)
                            : learnedBasePieceIds.has(g.id);
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
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-sm font-semibold">Pieces on frame</div>
                <p className="mt-1 text-xs text-foreground/55">
                  Flat DR/ER/RR from the chassis (always) plus toggled parts — piece values follow Fallout Wiki max-tier
                  tables (ballistic / energy / radiation; fire/cryo/poison not listed in those sources). Separate from
                  those numbers, power armor grants inherent % damage reduction and rad reduction that
                  scale about 7% / 15% per attached piece (see totals). Entering a frame always adds +10 STR / +50
                  carry in “All layers” even with every piece off — fall immunity, underwater breathing with a fusion
                  core, and higher unarmed damage apply in-frame but are not numeric rows here.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {POWER_ARMOR_PIECE_SLOT_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-2 py-1.5"
                    >
                      <span className="text-xs text-foreground/80">{label}</span>
                      <Switch
                        checked={payload.powerArmorPiecesEquipped[i]!}
                        onCheckedChange={(on) =>
                          setPayload((p) => ({
                            ...p,
                            powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(
                              p.powerArmorPiecesEquipped.map((v, j) => (j === i ? on : v))
                            )
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
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
                      isRecommended={recommendedIds.has(m.id)}
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
            <div className="text-sm font-semibold">Character state</div>
            <p className="mt-1 border-l-2 border-accent/35 pl-2 text-xs leading-snug text-foreground/60">
              Same <span className="font-medium text-foreground/75">idea</span> as the Nukes &amp; Dragons planner
              switchboard — here it only drives R.O.L.L. Live totals (species, sandbox mutations, serum-style penalty
              toggle). Addictions, Glow, lunches, and other planner knobs are out of scope.
            </p>
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Species / rules</div>
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
                    Playable Ghoul (Ghoul Within): hunger/thirst legendaries dropped from math; RR on gear still
                    stacks; CHA includes −10 vs human; Bloodied / Unyielding stay pickable with warnings.
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
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Mutations</div>
              <p className="text-[11px] leading-snug text-foreground/60">
                R.O.L.L. sandbox list — not auto-imported from share URLs. Approximate stat splits; serum toggle drops
                modeled downsides only (no Class Freak). When your applied N&amp;D URL includes{" "}
                <span className="font-medium text-foreground/75">Strange in Numbers</span> (<code className="text-[10px]">p=</code>{" "}
                token <code className="text-[10px]">ce</code>), mutation <span className="font-medium">benefits</span>{" "}
                are scaled as if four mutated teammates are on your team (+100%).
              </p>
              <div className="max-h-44 space-y-1 overflow-y-auto pr-1 sm:columns-2 sm:gap-x-3">
                {SANDBOX_MUTATIONS.map((m) => {
                  const on = payload.mutationIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="mb-1 flex cursor-pointer items-start gap-2 break-inside-avoid rounded-[var(--radius)] px-0.5 py-0.5 text-[11px] text-foreground/75 hover:bg-background/50"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          setPayload((p) => {
                            const next = on ? p.mutationIds.filter((x) => x !== m.id) : [...p.mutationIds, m.id];
                            return { ...p, mutationIds: next };
                          });
                        }}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
                      />
                      <span>{m.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-foreground/85">Ignore mutation penalties</div>
                  <p className="text-[10px] leading-snug text-foreground/55">
                    Serum-style: bonuses only; drop modeled downsides.
                  </p>
                </div>
                <Switch
                  checked={payload.ignoreMutationPenalties}
                  onCheckedChange={(checked) => setPayload((p) => ({ ...p, ignoreMutationPenalties: checked }))}
                  aria-label="Ignore mutation penalties"
                />
              </div>
            </div>
          </div>
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
            <div className="text-sm font-semibold">
              {showSplitTotalsPanel ? (
                <>Live totals · {formatBaseOptionLabel(piece)}</>
              ) : (
                <>
                  Live totals
                  {piece.kind === "underarmor" ? " · Underarmor" : null}
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-foreground/60">
              {fullArmorSet ? (
                <>
                  <span className="font-medium text-foreground/75">{baseStarsContextLabel}</span> full set: the first
                  number is Backwoods table resists plus each slot&apos;s material and misc craft (no star rolls). The{" "}
                  <span className="font-medium text-foreground/75">(+…)</span> block adds all twenty legendaries,
                  underarmor, mutations, and N&amp;D import.
                </>
              ) : piece.kind === "weapon" ? (
                <>
                  The first column is usually 0 for weapons (no modeled shell). Star picks, underarmor, mutations, and
                  N&amp;D modeled perks all land in the <span className="font-medium text-foreground/75">(+…)</span>{" "}
                  portion before the total.
                </>
              ) : isPowerArmorTorsoBasePiece(piece) ? (
                <>
                  The first number is chassis + attached piece flat resists (per toggles), frame STR/carry, optional
                  helmet base + crafting, and torso crafting — no legendary stars. Stars, underarmor, mutations, and
                  N&amp;D add the <span className="font-medium text-foreground/75">(+…)</span> before the total; PA % DR
                  / RR rows stay single values.
                </>
              ) : piece.kind === "powerArmor" && isPowerArmorHelmetBasePiece(piece) ? (
                <>
                  Helmet base resists and helmet material / misc — legendary stars are not available on power armor
                  helmets.
                </>
              ) : piece.kind === "powerArmor" ? (
                <>
                  Bench uses torso context for stars; equipped gear is still frame, piece resists, and crafting you have
                  toggled on this base.
                </>
              ) : piece.kind === "underarmor" ? (
                <>
                  Shell, lining, and style — switch to armor, power armor, or a weapon to model legendary stars on
                  outer gear.
                </>
              ) : (
                <>
                  First number is on-piece crafting and any modeled shell stats without star rolls; legendaries,
                  underarmor, mutations, and N&amp;D roll into <span className="font-medium text-foreground/75">(+…)</span>.
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-foreground/50">
              Each row is <span className="font-medium text-foreground/70">piece + crafting (+ frame on PA)</span>, then{" "}
              <span className="font-medium text-foreground/70">(+delta)</span> for legendary stars plus underarmor /
              mutations / N&amp;D, then <span className="font-medium text-foreground/70">= total</span>. A single number
              means there is nothing in that (+…) bucket for that stat.
              {payload.ghoul
                ? " Ghoul caps some legendaries and applies −10 effective CHA in this sandbox."
                : null}{" "}
              {ndPerkLayer ? "Imported N&D perk codes are folded into the (+…) portion where we model them." : null}
            </p>
            <BuilderTotalsStatKey className="mt-2" mode={statKeyMode} />
            <BuilderTotalsGrid
              baseTotals={intrinsicBenchTotals}
              totals={totals}
              powerArmorSandbox={powerArmorSandboxMeta}
              presentation={totalsPresentation}
            />
            <div className="mt-4 border-t border-border/60 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-foreground/65">Effects</div>
              {equippedLegendaryBenchLines.length === 0 ? (
                <p className="mt-2 text-xs text-foreground/55">No legendary stars selected on this base.</p>
              ) : (
                <ul className="mt-2 space-y-2.5">
                  {equippedLegendaryBenchLines.map(({ mod, benchLabel }) => {
                    const descRaw = mod.description?.trim() ?? "";
                    const desc = sandboxLegendaryDescription(descRaw, piece) || descRaw;
                    return (
                      <li key={`${benchLabel}-${mod.id}`} className="text-xs leading-snug">
                        <div className="font-medium text-foreground/85">{mod.name}</div>
                        <div className="text-[11px] text-foreground/50">{benchLabel}</div>
                        {desc ? (
                          <p className="mt-0.5 text-foreground/60 line-clamp-3">{desc}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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
