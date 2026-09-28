"use client";

import * as React from "react";
import { Search, CheckCircle2, X } from "lucide-react";
import ProgressToggle from "@/components/progress-toggle";
import {
  BASE_GEAR_PIECES,
  isPowerArmorTorsoBasePiece,
  isTrackableBasePieceId,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";
import type { BuilderEquipmentKind, BuilderWeaponSub } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

/**
 * Base-gear catalog, in two modes that never mix:
 * - `pick`: one fixed category, search, and Equip as the only action. Used inside the gear picker
 *   dialog that the Chassis Bay opens per category (weapon, armor set, power armor, underarmor).
 * - `ledger`: the Armory Matrix. Category chips with "n of N learned" counts, one category
 *   rendered at a time, a learned toggle per card and a read-only IN BAY badge. Nothing here
 *   changes the build.
 */
export type BuilderGearSelectorProps =
  | {
      mode: "pick";
      kind: BuilderEquipmentKind;
      /** Ids currently in the bay (frame, weapon, underarmor shell row). */
      inBayIds: ReadonlySet<string>;
      learnedBasePieceIds: ReadonlySet<string>;
      isPowerArmorTorsoLearned: (id: string, learnedSet: ReadonlySet<string>) => boolean;
      onPick: (baseId: string) => void;
      autoFocusSearch?: boolean;
    }
  | {
      mode: "ledger";
      /** Category shown first; the chips switch it. */
      initialKind: BuilderEquipmentKind;
      inBayIds: ReadonlySet<string>;
      learnedBasePieceIds: ReadonlySet<string>;
      isPowerArmorTorsoLearned: (id: string, learnedSet: ReadonlySet<string>) => boolean;
      onToggleLearned: (baseId: string, learned: boolean) => void;
      pendingLearnedPieceId: string | null;
      /** Toggles are disabled (and explained) when the viewer is not signed in. */
      canToggle: boolean;
    };

export const GEAR_CATEGORY_TABS: Array<{
  kind: BuilderEquipmentKind;
  label: string;
  icon: string;
}> = [
  { kind: "armor", label: "Armor sets", icon: "🛡️" },
  { kind: "powerArmor", label: "Power armor", icon: "🦾" },
  { kind: "weapon", label: "Weapons", icon: "🎯" },
  { kind: "underarmor", label: "Underarmor", icon: "👕" },
];

const WEAPON_SUB_TABS: Array<{ sub: "all" | BuilderWeaponSub; label: string }> = [
  { sub: "all", label: "All weapons" },
  { sub: "heavy", label: "Heavy" },
  { sub: "ranged", label: "Ranged / rifles" },
  { sub: "energy", label: "Energy" },
  { sub: "melee", label: "Melee" },
];

export function gearKindLabel(kind: BuilderEquipmentKind): string {
  return GEAR_CATEGORY_TABS.find((t) => t.kind === kind)?.label ?? kind;
}

export function cleanGearLabel(label: string): string {
  return label.replace(/\(full set\)|\(underarmor\)|\(shell\)/gi, "").trim();
}

function pieceKindLine(g: BaseGearPiece): string {
  if (g.weaponSub) return `Weapon · ${g.weaponSub}`;
  if (g.kind === "powerArmor") return "Power armor frame";
  if (g.kind === "armor") return "5-piece armor set";
  return "Underarmor shell";
}

export default function BuilderGearSelector(props: BuilderGearSelectorProps) {
  const [ledgerKind, setLedgerKind] = React.useState<BuilderEquipmentKind>(
    props.mode === "ledger" ? props.initialKind : props.kind,
  );
  const activeKind = props.mode === "pick" ? props.kind : ledgerKind;
  const [weaponSubFilter, setWeaponSubFilter] = React.useState<"all" | BuilderWeaponSub>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (props.mode === "pick" && props.autoFocusSearch) {
      searchRef.current?.focus();
    }
    // Only on mount: the dialog remounts this component each time it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLearned = React.useCallback(
    (g: BaseGearPiece) =>
      isTrackableBasePieceId(g.id) &&
      (g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)
        ? props.isPowerArmorTorsoLearned(g.id, props.learnedBasePieceIds)
        : props.learnedBasePieceIds.has(g.id)),
    [props],
  );

  const learnedCounts = React.useMemo(() => {
    const counts: Record<string, { learned: number; total: number }> = {};
    for (const tab of GEAR_CATEGORY_TABS) counts[tab.kind] = { learned: 0, total: 0 };
    for (const g of BASE_GEAR_PIECES) {
      const c = counts[g.kind]!;
      c.total += 1;
      if (isLearned(g)) c.learned += 1;
    }
    return counts;
  }, [isLearned]);

  const filteredPieces = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return BASE_GEAR_PIECES.filter((g) => {
      if (g.kind !== activeKind) return false;
      if (activeKind === "weapon" && weaponSubFilter !== "all" && g.weaponSub !== weaponSubFilter) {
        return false;
      }
      if (!query) return true;
      return (
        g.label.toLowerCase().includes(query) ||
        (g.weaponSub?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [activeKind, weaponSubFilter, searchQuery]);

  const listId = React.useId();

  return (
    <div className="space-y-3 font-mono">
      {/* Ledger: category chips with learned counts */}
      {props.mode === "ledger" && (
        <div
          role="tablist"
          aria-label="Base gear category"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800"
        >
          {GEAR_CATEGORY_TABS.map((tab) => {
            const isSelected = ledgerKind === tab.kind;
            const c = learnedCounts[tab.kind]!;
            return (
              <button
                key={tab.kind}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`${listId}-list`}
                onClick={() => {
                  setLedgerKind(tab.kind);
                  setSearchQuery("");
                }}
                className={cn(
                  "flex min-h-9 touch:min-h-11 flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded text-xs font-bold uppercase transition-all",
                  isSelected
                    ? "bg-emerald-500 text-slate-950 shadow-md font-black ring-1 ring-emerald-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60",
                )}
              >
                <span className="truncate">
                  {tab.icon} {tab.label}
                </span>
                <span
                  className={cn(
                    "text-2xs font-mono",
                    isSelected ? "text-slate-950/80" : "text-dim",
                  )}
                >
                  {c.learned} of {c.total} learned
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Weapon sub-class chips + search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {activeKind === "weapon" ? (
          <div className="flex flex-wrap gap-1" role="group" aria-label="Weapon class">
            {WEAPON_SUB_TABS.map((subTab) => (
              <button
                key={subTab.sub}
                type="button"
                aria-pressed={weaponSubFilter === subTab.sub}
                onClick={() => setWeaponSubFilter(subTab.sub)}
                className={cn(
                  "min-h-6 touch:min-h-11 px-2 py-1 rounded text-2xs font-bold uppercase border transition-all",
                  weaponSubFilter === subTab.sub
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                    : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700",
                )}
              >
                {subTab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-2xs text-slate-400 font-bold uppercase tracking-wider">
            {props.mode === "pick"
              ? `Pick the ${activeKind === "armor" ? "armor set" : activeKind === "powerArmor" ? "power armor frame" : "underarmor shell"} to equip`
              : `${gearKindLabel(activeKind)} your account has learned`}
          </div>
        )}

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            aria-label={`Search ${gearKindLabel(activeKind).toLowerCase()}`}
            placeholder={`Search ${gearKindLabel(activeKind).toLowerCase()}…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-9 touch:min-h-11 pl-8 pr-7 py-1 rounded border border-slate-800 bg-slate-900/90 text-base sm:text-xs text-slate-200 placeholder:text-dim focus:outline-none focus:border-emerald-500 font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 touch:h-11 touch:w-11 items-center justify-center text-dim hover:text-slate-300"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {/* The grid scrolls; tabIndex keeps it keyboard-scrollable even when every toggle inside is
          disabled (signed-out ledger), which axe's scrollable-region-focusable rule requires. */}
      <div
        id={`${listId}-list`}
        role={props.mode === "ledger" ? "tabpanel" : "region"}
        aria-label={`${gearKindLabel(activeKind)} ${props.mode === "pick" ? "to equip" : "ledger"}`}
        tabIndex={0}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1 border border-slate-800/80 rounded-lg p-2 bg-[#06090e]",
          props.mode === "pick" ? "md:grid-cols-3 max-h-[min(60vh,28rem)]" : "md:grid-cols-3 lg:grid-cols-4 max-h-72",
        )}
      >
        {filteredPieces.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-dim italic">
            No {gearKindLabel(activeKind).toLowerCase()} match &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredPieces.map((g) => {
            const inBay = props.inBayIds.has(g.id);
            const learned = isLearned(g);
            const label = cleanGearLabel(g.label);

            if (props.mode === "pick") {
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => props.onPick(g.id)}
                  aria-label={`Equip ${label}${inBay ? " (in bay)" : ""}${learned ? ", learned" : ""}`}
                  aria-current={inBay ? "true" : undefined}
                  className={cn(
                    "text-left p-2.5 min-h-11 rounded-lg border transition-all flex flex-col justify-between gap-1.5 group relative",
                    inBay
                      ? "bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400 shadow-md shadow-emerald-950/40"
                      : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900",
                  )}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0 w-full">
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "text-xs font-bold truncate",
                          inBay ? "text-emerald-300 font-black" : "text-slate-200 group-hover:text-white",
                        )}
                      >
                        {label}
                      </div>
                      <div className="text-3xs text-slate-400 uppercase tracking-wider truncate">
                        {pieceKindLine(g)}
                      </div>
                    </div>
                    {inBay && <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1" aria-hidden="true" />}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40 w-full text-3xs">
                    {learned ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                        <span>Learned</span>
                      </span>
                    ) : (
                      <span className="text-dim uppercase">Not learned</span>
                    )}
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded font-bold uppercase",
                        inBay ? "bg-emerald-400 text-slate-950 font-black" : "text-slate-400 group-hover:text-slate-200",
                      )}
                    >
                      {inBay ? "In bay" : "Equip"}
                    </span>
                  </div>
                </button>
              );
            }

            const pending = props.pendingLearnedPieceId === g.id;
            return (
              <div
                key={g.id}
                className={cn(
                  "text-left p-2.5 rounded-lg border flex flex-col justify-between gap-1.5",
                  learned
                    ? "bg-emerald-950/30 border-emerald-500/40"
                    : "bg-slate-900/60 border-slate-800/90",
                )}
              >
                <div className="flex items-start justify-between gap-2 min-w-0 w-full">
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-xs font-bold truncate", learned ? "text-emerald-300" : "text-slate-200")}>
                      {label}
                    </div>
                    <div className="text-3xs text-slate-400 uppercase tracking-wider truncate">
                      {pieceKindLine(g)}
                    </div>
                  </div>
                  {inBay && (
                    <span className="text-3xs px-1.5 py-0.2 rounded bg-accent/15 border border-accent/40 text-accent font-bold uppercase shrink-0">
                      In bay
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40 w-full">
                  <span className="text-3xs text-dim uppercase">
                    {g.kind === "powerArmor" ? "Frame + helmet plans" : "Plan"}
                  </span>
                  <ProgressToggle
                    unlocked={learned}
                    disabled={!props.canToggle || pending}
                    onToggle={() => props.onToggleLearned(g.id, !learned)}
                    className="min-h-6 touch:min-h-11 px-2 py-0.5 text-2xs"
                    labels={{ on: "✓ Learned", off: "Not learned" }}
                    ariaLabel={`Mark ${label} ${learned ? "not learned" : "learned"}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
