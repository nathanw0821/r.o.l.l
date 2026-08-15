"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Radio,
  Search,
  Zap,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import type { TransmissionSummary } from "@/app/api/builder/transmissions/route";

const ARCHETYPE_TAGS = [
  "All",
  "Bloodied",
  "Anti-Armor",
  "Quad",
  "Commando",
  "Heavy Gunner",
  "Power Armor",
  "Unyielding",
  "Melee",
  "Shotgunner",
  "Gunslinger",
  "Ghoul",
];

interface TransmissionsVaultClientProps {
  initialTransmissions: TransmissionSummary[];
  initialTotalCount: number;
}

export default function TransmissionsVaultClient({
  initialTransmissions,
  initialTotalCount,
}: TransmissionsVaultClientProps) {
  const router = useRouter();
  const [transmissions, setTransmissions] = React.useState<TransmissionSummary[]>(initialTransmissions);
  const [totalCount, setTotalCount] = React.useState(initialTotalCount);
  const [searchQuery, setSearchQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(searchQuery);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [speciesFilter, setSpeciesFilter] = React.useState<"all" | "human" | "ghoul">("all");
  const [kindFilter, setKindFilter] = React.useState<"all" | "weapon" | "armor" | "powerArmor">("all");
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [clonedSlug, setClonedSlug] = React.useState<string | null>(null);

  // Fetch transmissions on filter/page change
  const fetchTransmissions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (deferredQuery) params.set("q", deferredQuery);
      if (selectedTag !== "All") params.set("tag", selectedTag);
      if (speciesFilter !== "all") params.set("species", speciesFilter);
      if (kindFilter !== "all") params.set("kind", kindFilter);
      params.set("page", page.toString());
      params.set("limit", "18");

      const res = await fetch(`/api/builder/transmissions?${params.toString()}`);
      const data = (await res.json()) as {
        success?: boolean;
        data?: TransmissionSummary[];
        pagination?: { totalCount?: number; totalPages?: number };
      };
      if (data?.success && Array.isArray(data.data)) {
        setTransmissions(data.data);
        if (typeof data.pagination?.totalCount === "number") {
          setTotalCount(data.pagination.totalCount);
        }
      }
    } catch (e) {
      console.error("Failed to fetch transmissions", e);
    } finally {
      setIsLoading(false);
    }
  }, [deferredQuery, selectedTag, speciesFilter, kindFilter, page]);

  React.useEffect(() => {
    fetchTransmissions();
  }, [fetchTransmissions]);

  // Clone Build to Local Workbench
  const handleCloneBuild = async (slug: string) => {
    try {
      setClonedSlug(slug);
      router.push(`/l/${slug}`);
    } catch (e) {
      console.error("Clone error", e);
    }
  };

  const totalPages = Math.ceil(totalCount / 18) || 1;

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-in fade-in duration-200">
      {/* Vault Header Banner */}
      <div className="rounded-xl border border-emerald-500/50 bg-slate-950/95 p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Radio className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>[ VAULT-TEC APALACHIAN FREQUENCY // COMMUNITY TRANSMISSIONS VAULT ]</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Community Transmissions Vault
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Browse, inspect, and 1-click clone battle-tested character builds published by Wasteland survivors. Complete with weapons, armor frames, 37-card perk decks, and biometrics.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/build"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
            >
              <Zap className="h-4 w-4" />
              <span>[ Open B.U.I.L.D. Workbench ]</span>
            </Link>
            <div className="text-xs text-slate-500">
              ⚡ Total Transmissions In Vault: <span className="text-emerald-400 font-bold">{totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Switchboard */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-4 shadow-lg">
        {/* Search & Primary Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by build title, weapon, legendary stars, or author..."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
          </div>

          {/* Species Filter */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setSpeciesFilter("all");
                setPage(1);
              }}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all ${
                speciesFilter === "all"
                  ? "bg-slate-800 text-white font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Species
            </button>
            <button
              type="button"
              onClick={() => {
                setSpeciesFilter("human");
                setPage(1);
              }}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all ${
                speciesFilter === "human"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              👤 Human
            </button>
            <button
              type="button"
              onClick={() => {
                setSpeciesFilter("ghoul");
                setPage(1);
              }}
              className={`flex-1 py-1 rounded text-center font-bold uppercase transition-all ${
                speciesFilter === "ghoul"
                  ? "bg-lime-500 text-slate-950 font-black shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ☣️ Ghoul
            </button>
          </div>
        </div>

        {/* Equipment Category Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[0.68rem] text-slate-500 font-bold uppercase mr-1">Gear Category:</span>
          {[
            { id: "all", label: "All Gear" },
            { id: "weapon", label: "🔫 Weapons" },
            { id: "armor", label: "🛡️ Regular Armor" },
            { id: "powerArmor", label: "🦾 Power Armor" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setKindFilter(cat.id as "all" | "weapon" | "armor" | "powerArmor");
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded text-[0.7rem] font-bold uppercase tracking-wider transition-all border ${
                kindFilter === cat.id
                  ? "bg-cyan-600 text-slate-950 border-cyan-400 font-black shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Archetype Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[0.68rem] text-slate-500 font-bold uppercase mr-1">Archetypes:</span>
          {ARCHETYPE_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelectedTag(tag);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[0.7rem] font-bold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmissions Grid */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-12 text-center text-slate-400 font-mono animate-pulse">
          &gt;&gt; SCANNING APALACHIAN FREQUENCY FOR TRANSMISSIONS...
        </div>
      ) : transmissions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-12 text-center text-slate-400 font-mono space-y-3">
          <p className="text-sm text-slate-300 font-bold">&gt;&gt; NO TRANSMISSIONS FOUND MATCHING YOUR CRITERIA.</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or selecting a different archetype filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transmissions.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-950/95 p-4 flex flex-col justify-between space-y-3 transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)] group"
            >
              <div className="space-y-2.5">
                {/* Header: Author & Species Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-xs shrink-0 font-black">
                      {t.author?.name ? t.author.name.charAt(0).toUpperCase() : <UserIcon className="h-3 w-3" />}
                    </div>
                    <span className="text-xs font-bold text-slate-300 truncate">
                      {t.author?.name || t.author?.username || "Wasteland Survivor"}
                    </span>
                  </div>

                  <span
                    className={`text-[0.65rem] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 border ${
                      t.isGhoul
                        ? "bg-lime-950/80 text-lime-400 border-lime-500/40"
                        : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                    }`}
                  >
                    {t.isGhoul ? "☣️ GHOUL" : "👤 HUMAN"}
                  </span>
                </div>

                {/* Build Title & Description */}
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors uppercase truncate">
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-[0.72rem] text-slate-400 line-clamp-2 mt-0.5">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Weapon & Chassis Badge */}
                <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 uppercase truncate">
                      {t.equipmentKind === "powerArmor" ? "🦾 " : "🔫 "}
                      {t.basePieceId.replace(/-/g, " ")}
                    </span>
                    <span className="text-[0.65rem] text-slate-500 uppercase">
                      {t.equipmentKind}
                    </span>
                  </div>

                  {/* Legendary Star Chips */}
                  {t.legendaryModIds.some(Boolean) && (
                    <div className="flex flex-wrap gap-1">
                      {t.legendaryModIds.map((modId, starIdx) => {
                        if (!modId) return null;
                        return (
                          <span
                            key={`${modId}-${starIdx}`}
                            className="px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/30 text-[0.62rem] font-bold text-amber-300 uppercase"
                          >
                            ★ {modId.replace(/-/g, " ")}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* S.P.E.C.I.A.L. Spread Mini Bar */}
                <div className="flex items-center justify-between text-[0.68rem] bg-slate-900/60 rounded px-2 py-1 border border-slate-800">
                  <span className="text-slate-500 font-bold">SPECIAL:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-rose-400">S:{t.specials.S}</span>
                    <span className="text-orange-400">P:{t.specials.P}</span>
                    <span className="text-amber-400">E:{t.specials.E}</span>
                    <span className="text-emerald-400">C:{t.specials.C}</span>
                    <span className="text-cyan-400">I:{t.specials.I}</span>
                    <span className="text-indigo-400">A:{t.specials.A}</span>
                    <span className="text-purple-400">L:{t.specials.L}</span>
                  </div>
                </div>

                {/* Archetype Tag Badges */}
                {t.archetypeTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {t.archetypeTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[0.62rem] font-bold text-slate-400 uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <Link
                  href={`/l/${t.slug}`}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-center uppercase transition-colors flex items-center justify-center gap-1 text-[0.7rem]"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Inspect</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleCloneBuild(t.slug)}
                  className="py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 font-black uppercase transition-colors flex items-center justify-center gap-1 text-[0.7rem]"
                >
                  <Zap className="h-3 w-3 text-emerald-400" />
                  <span>{clonedSlug === t.slug ? "Cloning..." : "Clone"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none uppercase font-bold"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-slate-400 font-bold">
            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none uppercase font-bold"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
