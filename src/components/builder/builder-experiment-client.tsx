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
  ARMOR_MISC_MODS,
  armorCraftingEffectLayers,
  defaultArmorPieceCrafting
} from "@/lib/builder/armor-piece-mods";
import {
  BASE_GEAR_GROUP_LABEL,
  BASE_GEAR_GROUP_ORDER,
  BASE_GEAR_PIECES,
  getBaseGearPiece,
  isTrackableBasePieceId,
  listTrackableBaseGearByGroup,
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
  type BuilderEffectTotals
} from "@/lib/builder/compatibility";
import { emptyArmorLegendaryGrid } from "@/lib/builder/normalize-builder-payload";
import { trackerUnlockSortOrder } from "@/lib/builder/legendary-tracker-unlock";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import { subscribeProgressChange } from "@/lib/progress-events";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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

function LegendaryModDetailFootprint({ mod }: { mod: BuilderModDTO }) {
  const deltas = formatEffectMathDeltas(mod.effectMath);
  const extras = listExtraEffectMathEntries(mod.effectMath);
  const desc = mod.description?.trim() ?? "";
  const tail = Boolean(desc || extras.length > 0);

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
  const [shareTitle, setShareTitle] = React.useState("My R.O.L.L. loadout");
  const [shareBusy, setShareBusy] = React.useState(false);
  const [shareResult, setShareResult] = React.useState<string | null>(null);
  const [learnedBasePieceIds, setLearnedBasePieceIds] = React.useState(
    () => new Set(initialLearnedBasePieceIds)
  );
  const [learnedToggleError, setLearnedToggleError] = React.useState<string | null>(null);
  const [pendingLearnedPieceId, setPendingLearnedPieceId] = React.useState<string | null>(null);

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
      .catch(() => setLoadError("Builder catalog failed to load. Run `npm run db:seed` after migrate."));
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
  const showSplitTotalsPanel = piece.kind === "weapon" || piece.kind === "powerArmor";
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

  const baseArmorStats =
    piece.kind === "armor" && piece.armorSetKey ? getArmorSetRow(piece.armorSetKey)?.stats ?? null : null;

  const totals = React.useMemo(
    () =>
      aggregateEffectMath(equippedModsOrdered, {
        ghoul: payload.ghoul,
        extraLayers: [...underLayers, ...armorCraftingLayers],
        baseArmorStats
      }),
    [equippedModsOrdered, payload.ghoul, underLayers, armorCraftingLayers, baseArmorStats]
  );

  const starModTotals = React.useMemo(
    () => aggregateEffectMath(equippedModsOrdered, { ghoul: payload.ghoul, extraLayers: [] }),
    [equippedModsOrdered, payload.ghoul]
  );

  const shopping = React.useMemo(() => buildShoppingList(equippedModsOrdered), [equippedModsOrdered]);

  const optionsForActivePick = React.useMemo(() => {
    if (!activePick) return [];
    const slotIndex = activePick.scope === "single" ? activePick.starIndex : activePick.starIndex;
    const filtered = filterModsForSlot(mods, piece, slotIndex).filter((m) => {
      const q = slotQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      const d =
        trackerUnlockSortOrder(a.trackerUnlock ?? "unknown") -
        trackerUnlockSortOrder(b.trackerUnlock ?? "unknown");
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
  }, [mods, piece, activePick, slotQuery]);

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

  function assignSlot(modId: string) {
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

  const starsDisabled = piece.kind === "underarmor";
  const showSingleStars = !fullArmorSet && !starsDisabled;

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
              {BASE_GEAR_GROUP_ORDER.map((kind) => (
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
                  <div key={group.kind}>
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
            <label className="mt-3 flex items-center gap-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={payload.ghoul}
                onChange={(e) => setPayload((p) => ({ ...p, ghoul: e.target.checked }))}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Ghoul (caps SPECIAL-style rows where flagged)
            </label>
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

          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-sm font-semibold">Stars</div>
            {starsDisabled ? (
              <p className="mt-2 text-xs text-foreground/65">
                Underarmor uses linings and styles only — no outer legendary stars. Switch base to armor, power armor, or
                a weapon to plan star mods (underarmor bases stay trackable in the list above).
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
                          {ARMOR_MISC_MODS.map((o) => (
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
                              {mod ? <LegendaryModDetailFootprint mod={mod} /> : null}
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
                          {mod ? <LegendaryModDetailFootprint mod={mod} /> : null}
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
            <DialogContent className="flex max-h-[min(94vh,56rem)] flex-col gap-0 p-5 sm:p-6">
              <DialogHeader className="shrink-0 pr-8">
                <DialogTitle className="text-base">
                  {activePick ? `Choose ${activePickLabel(activePick, baseStarsContextLabel)}` : "Choose mod"}
                </DialogTitle>
                <DialogDescription>
                  Search your catalog; rows use the same unlock colors as All Effects when this mod maps to a tracker
                  tier. Mods with no modeled resists or SPECIAL still work here — details appear under each row.
                </DialogDescription>
              </DialogHeader>
              <Input
                className="mt-3 shrink-0"
                placeholder="Search compatible mods…"
                value={slotQuery}
                onChange={(e) => setSlotQuery(e.target.value)}
              />
              <div
                className={cn(
                  "mt-3 min-h-[min(36vh,18rem)] flex-1 space-y-2 overflow-y-auto pr-1 text-sm",
                  "max-h-[min(70vh,38rem)] sm:max-h-[min(72vh,40rem)]"
                )}
              >
                {piece.kind === "underarmor" ? (
                  <div className="text-foreground/60">No compatible mods for underarmor.</div>
                ) : optionsForActivePick.length === 0 ? (
                  <div className="text-foreground/60">No compatible mods for this slot and base.</div>
                ) : (
                  optionsForActivePick.map((m) => {
                    const unlock = m.trackerUnlock ?? "unknown";
                    const statusAttr =
                      unlock === "unlocked" ? "unlocked" : unlock === "locked" ? "locked" : undefined;
                    const statusLabel =
                      unlock === "unlocked"
                        ? "Unlocked"
                        : unlock === "locked"
                          ? "Locked"
                          : "Not in tracker";
                    return (
                      <button
                        key={m.id}
                        type="button"
                        data-status={statusAttr}
                        className={cn(
                          "summary-status-card flex w-full flex-col rounded-[var(--radius)] border py-2.5 text-left transition",
                          "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          unlock === "unknown" && "opacity-95"
                        )}
                        onClick={() => assignSlot(m.id)}
                      >
                        <div className="flex items-start justify-between gap-2 px-0.5">
                          <span className="min-w-0 text-sm font-semibold leading-snug">{m.name}</span>
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/70">
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-1 px-0.5">
                          <LegendaryModDetailFootprint mod={m} />
                        </div>
                      </button>
                    );
                  })
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
            {showSplitTotalsPanel ? (
              <>
                <div className="text-sm font-semibold">Live totals · {formatBaseOptionLabel(piece)}</div>
                <p className="mt-1 text-xs text-foreground/60">
                  {piece.kind === "weapon"
                    ? "Weapon star picks roll up separately from your underarmor (and any other layers). Damage % is usually what moves on guns."
                    : "Power armor star picks stack separately from underarmor; resists still include shell/lining/style."}
                </p>
                <p className="mt-1 text-xs text-foreground/50">
                  These numbers are base math only — they do not include any perk card bonuses.
                </p>
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
                {baseArmorStats ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    <span className="font-medium text-foreground/75">{baseStarsContextLabel}</span> full set: Backwoods
                    resist table, each slot&apos;s material and misc craft, all twenty star picks, plus underarmor effect
                    math.
                  </p>
                ) : piece.kind === "underarmor" ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    Shell, lining, and style only — switch to armor, power armor, or a weapon to model legendary stars.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-foreground/60">
                    Totals from your R.O.L.L. legendary catalog and underarmor layers.
                  </p>
                )}
                <p className="mt-1 text-xs text-foreground/50">
                  These numbers are base math only — they do not include any perk card bonuses.
                </p>
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
