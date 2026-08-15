"use client";

import * as React from "react";
import {
  BASE_GEAR_PIECES,
  isPowerArmorTorsoBasePiece,
  isTrackableBasePieceId,
  type BaseGearPiece
} from "@/lib/builder/base-gear";
import type { BuilderEquipmentKind, BuilderWeaponSub, BuilderUnderarmor } from "@/lib/builder/types";
import {
  UNDERARMOR_SHELLS,
  UNDERARMOR_LININGS,
  UNDERARMOR_STYLES,
  findUnderarmorOption
} from "@/lib/builder/underarmor";
import { Search, ChevronRight, CheckCircle2, X, Sparkles, Shield, Shirt } from "lucide-react";

interface BuilderGearSelectorProps {
  selectedBaseId: string;
  onSelectBase: (baseId: string) => void;
  learnedBasePieceIds: Set<string>;
  isPowerArmorTorsoLearned: (id: string, learnedSet: Set<string>) => boolean;
  underarmor?: BuilderUnderarmor;
  onUnderarmorChange?: (underarmor: BuilderUnderarmor) => void;
  activeWeaponId?: string;
  activeArmorId?: string;
  inPowerArmor?: boolean;
}

const CATEGORY_TABS: Array<{
  kind: BuilderEquipmentKind;
  label: string;
  icon: string;
}> = [
  { kind: "armor", label: "Armor Sets", icon: "🛡️" },
  { kind: "powerArmor", label: "Power Armor", icon: "🦾" },
  { kind: "weapon", label: "Weapons", icon: "🎯" },
  { kind: "underarmor", label: "Underarmor", icon: "👕" }
];

const WEAPON_SUB_TABS: Array<{ sub: "all" | BuilderWeaponSub; label: string }> = [
  { sub: "all", label: "All Weapons" },
  { sub: "heavy", label: "Heavy" },
  { sub: "ranged", label: "Ranged / Rifles" },
  { sub: "energy", label: "Energy" },
  { sub: "melee", label: "Melee" }
];

export default function BuilderGearSelector({
  selectedBaseId,
  onSelectBase,
  learnedBasePieceIds,
  isPowerArmorTorsoLearned,
  underarmor,
  onUnderarmorChange,
  activeWeaponId,
  activeArmorId,
  inPowerArmor = false,
}: BuilderGearSelectorProps) {
  const currentPiece = React.useMemo(
    () => BASE_GEAR_PIECES.find((p) => p.id === selectedBaseId) || BASE_GEAR_PIECES[0],
    [selectedBaseId]
  );

  const [activeCategory, setActiveCategory] = React.useState<BuilderEquipmentKind>(
    currentPiece?.kind || "armor"
  );
  const [weaponSubFilter, setWeaponSubFilter] = React.useState<"all" | BuilderWeaponSub>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Only sync category when selectedBaseId actually changes externally
  const prevBaseIdRef = React.useRef(selectedBaseId);
  React.useEffect(() => {
    if (prevBaseIdRef.current !== selectedBaseId) {
      prevBaseIdRef.current = selectedBaseId;
      if (currentPiece) {
        setActiveCategory(currentPiece.kind);
      }
    }
  }, [selectedBaseId, currentPiece]);

  const filteredPieces = React.useMemo(() => {
    return BASE_GEAR_PIECES.filter((piece) => {
      // 1. Category match
      if (piece.kind !== activeCategory) return false;

      // 2. Weapon subcategory match
      if (activeCategory === "weapon" && weaponSubFilter !== "all") {
        if (piece.weaponSub !== weaponSubFilter) return false;
      }

      // 3. Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchLabel = piece.label.toLowerCase().includes(query);
        const matchSub = piece.weaponSub?.toLowerCase().includes(query);
        const matchKind = piece.kind.toLowerCase().includes(query);
        return matchLabel || matchSub || matchKind;
      }

      return true;
    });
  }, [activeCategory, weaponSubFilter, searchQuery]);

  const activeLining = findUnderarmorOption(UNDERARMOR_LININGS, underarmor?.liningId);
  const activeStyle = findUnderarmorOption(UNDERARMOR_STYLES, underarmor?.styleId);

  return (
    <div className="space-y-3 font-mono">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = activeCategory === tab.kind;
          const count = BASE_GEAR_PIECES.filter((p) => p.kind === tab.kind).length;
          return (
            <button
              key={tab.kind}
              type="button"
              onClick={() => {
                setActiveCategory(tab.kind);
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-bold uppercase transition-all ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black ring-1 ring-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
              <span className={`text-[0.65rem] px-1 rounded ${isSelected ? "bg-slate-950/30 text-slate-950" : "bg-slate-900 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Filter (For Weapons) & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {activeCategory === "weapon" ? (
          <div className="flex flex-wrap gap-1">
            {WEAPON_SUB_TABS.map((subTab) => (
              <button
                key={subTab.sub}
                type="button"
                onClick={() => setWeaponSubFilter(subTab.sub)}
                className={`px-2 py-1 rounded text-[0.68rem] font-bold uppercase border transition-all ${
                  weaponSubFilter === subTab.sub
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                    : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-[0.72rem] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />
            <span>Select Active {activeCategory === "armor" ? "5-Piece Armor Set" : activeCategory === "powerArmor" ? "Power Armor Frame" : "Underarmor Shell"}</span>
          </div>
        )}

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeCategory}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 rounded border border-slate-800 bg-slate-900/90 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Underarmor Subsystems Configuration Controls (Lining Mod + Style) */}
      {activeCategory === "underarmor" && underarmor && onUnderarmorChange && (
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 shadow-md space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-black uppercase tracking-wider text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Shirt className="h-4 w-4" /> [ UNDERARMOR SUBSYSTEMS CONFIGURATION ]
            </span>
            {inPowerArmor ? (
              <span className="text-[0.65rem] px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/40 font-bold">
                ⚠️ SUPPRESSED IN POWER ARMOR
              </span>
            ) : (
              <span className="text-[0.65rem] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                ✓ ACTIVE WITH REGULAR ARMOR
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Lining Mod -> Resistances */}
            <div className="space-y-1.5 rounded-lg bg-slate-900/80 border border-slate-800 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold uppercase flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-cyan-400" /> Lining Mod (Resistances)
                </span>
                <span className="text-[0.62rem] text-cyan-400 font-bold">
                  {activeLining?.label?.split("(")[0]?.trim() || "No Lining"}
                </span>
              </div>
              <select
                className="w-full h-8 rounded bg-slate-950 border border-slate-800 px-2 text-xs font-mono uppercase text-slate-200 focus:outline-none focus:border-cyan-400"
                value={underarmor.liningId ?? "none"}
                onChange={(e) =>
                  onUnderarmorChange({
                    ...underarmor,
                    liningId: e.target.value === "none" ? null : e.target.value,
                  })
                }
              >
                {UNDERARMOR_LININGS.map((o) => (
                  <option key={o.id} value={o.id} className="bg-slate-950 text-slate-200">
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="text-[0.65rem] text-slate-400">
                Determines flat damage resistance (DR), energy resistance (ER), and radiation resistance (RR).
              </div>
            </div>

            {/* Underarmor Style -> S.P.E.C.I.A.L. */}
            <div className="space-y-1.5 rounded-lg bg-slate-900/80 border border-slate-800 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold uppercase flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Underarmor Style (S.P.E.C.I.A.L.)
                </span>
                <span className="text-[0.62rem] text-amber-400 font-bold">
                  {activeStyle?.label?.split("(")[0]?.trim() || "No Style"}
                </span>
              </div>
              <select
                className="w-full h-8 rounded bg-slate-950 border border-slate-800 px-2 text-xs font-mono uppercase text-slate-200 focus:outline-none focus:border-amber-400"
                value={underarmor.styleId ?? "none"}
                onChange={(e) =>
                  onUnderarmorChange({
                    ...underarmor,
                    styleId: e.target.value === "none" ? null : e.target.value,
                  })
                }
              >
                {UNDERARMOR_STYLES.map((o) => (
                  <option key={o.id} value={o.id} className="bg-slate-950 text-slate-200">
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="text-[0.65rem] text-slate-400">
                Determines character S.P.E.C.I.A.L. attribute bonuses from underarmor pattern tailoring.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gear Grid Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1 border border-slate-800/80 rounded-lg p-2 bg-[#06090e]">
        {filteredPieces.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-slate-500 italic">
            No gear bases matching &quot;{searchQuery}&quot; found in {activeCategory}.
          </div>
        ) : (
          filteredPieces.map((g) => {
            const isSelected =
              g.id === selectedBaseId ||
              (g.kind === "weapon" && g.id === activeWeaponId) ||
              ((g.kind === "armor" || g.kind === "powerArmor") && g.id === activeArmorId) ||
              (g.kind === "underarmor" && g.defaultUnderarmorShellId === underarmor?.shellId);

            const isLearned =
              isTrackableBasePieceId(g.id) &&
              (g.kind === "powerArmor" && isPowerArmorTorsoBasePiece(g)
                ? isPowerArmorTorsoLearned(g.id, learnedBasePieceIds)
                : learnedBasePieceIds.has(g.id));

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  onSelectBase(g.id);
                  if (g.kind === "underarmor" && g.defaultUnderarmorShellId && onUnderarmorChange && underarmor) {
                    onUnderarmorChange({ ...underarmor, shellId: g.defaultUnderarmorShellId });
                  }
                }}
                className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between gap-1.5 group relative ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400 shadow-md shadow-emerald-950/40"
                    : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2 min-w-0 w-full">
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold truncate ${isSelected ? "text-emerald-300 font-black" : "text-slate-200 group-hover:text-white"}`}>
                      {g.label.replace(/\(full set\)|\(underarmor\)|\(shell\)/gi, "").trim()}
                    </div>
                    <div className="text-[0.62rem] text-slate-400 uppercase tracking-wider font-mono truncate">
                      {g.weaponSub ? `Weapon · ${g.weaponSub}` : g.kind === "powerArmor" ? "Power Armor Frame" : g.kind === "armor" ? "5-Piece Armor Set" : "Underarmor Shell"}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40 w-full text-[0.6rem]">
                  {isLearned ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>LEARNED</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 uppercase">NOT LEARNED</span>
                  )}

                  <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${isSelected ? "bg-emerald-400 text-slate-950 font-black" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {isSelected ? "EQUIPPED" : "EQUIP"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
