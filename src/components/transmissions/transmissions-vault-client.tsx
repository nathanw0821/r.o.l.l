"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Radio,
  Search,
  Zap,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { TransmissionSummary } from "@/lib/builder/transmissions-engine";

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

export type LocalTransmissionRecord = {
  id: string;
  slug: string;
  title: string;
  editToken?: string;
  createdAt?: string;
};

interface TransmissionsVaultClientProps {
  initialTransmissions: TransmissionSummary[];
  initialTotalCount: number;
  initialScope?: "all" | "mine";
  hideScopeToggle?: boolean;
}

export default function TransmissionsVaultClient({
  initialTransmissions,
  initialTotalCount,
  initialScope = "all",
  hideScopeToggle = false,
}: TransmissionsVaultClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [scope, setScope] = React.useState<"all" | "mine">(initialScope);
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
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Read locally saved uploads (for offline/anonymous tracking)
  const [localUploads, setLocalUploads] = React.useState<LocalTransmissionRecord[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("roll_my_transmissions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLocalUploads(parsed);
        }
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Fetch transmissions on filter/page/scope change
  const fetchTransmissions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (deferredQuery) params.set("q", deferredQuery);
      if (selectedTag !== "All") params.set("tag", selectedTag);
      if (speciesFilter !== "all") params.set("species", speciesFilter);
      if (kindFilter !== "all") params.set("kind", kindFilter);
      if (scope === "mine") {
        params.set("mine", "true");
        if (localUploads.length > 0) {
          params.set("slugs", localUploads.map((u) => u.slug).join(","));
        }
      }
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
  }, [deferredQuery, selectedTag, speciesFilter, kindFilter, scope, localUploads, page]);

  React.useEffect(() => {
    fetchTransmissions();
  }, [fetchTransmissions]);

  // Clone Build to Local Workbench
  const handleCloneBuild = async (slug: string) => {
    try {
      setClonedSlug(slug);
      router.push(`/build?load=${slug}`);
    } catch (e) {
      console.error("Clone error", e);
    }
  };

  // Delete Transmission (Author/Admin)
  const handleDeleteTransmission = async (t: TransmissionSummary) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${t.title}" from the Community Transmissions Vault?\n\nThis will permanently remove the build and its share link.`
    );
    if (!confirmed) return;

    setDeletingId(t.id);
    try {
      const localItem = localUploads.find((u) => u.slug === t.slug || u.id === t.id);
      const editToken = localItem?.editToken;

      const res = await fetch(
        `/api/builder/transmissions/${t.id}${editToken ? `?editToken=${encodeURIComponent(editToken)}` : ""}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editToken }),
        }
      );

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete transmission.");
      }

      setTransmissions((prev) => prev.filter((item) => item.id !== t.id));
      setTotalCount((prev) => Math.max(0, prev - 1));

      // Remove from localStorage
      const updatedLocal = localUploads.filter((u) => u.slug !== t.slug && u.id !== t.id);
      setLocalUploads(updatedLocal);
      try {
        localStorage.setItem("roll_my_transmissions", JSON.stringify(updatedLocal));
      } catch {
        // Ignore write error
      }

      setStatusMessage({ type: "success", text: `Successfully deleted "${t.title}" from vault.` });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete transmission.",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setDeletingId(null);
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

      {/* Notification Toast Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-mono font-bold animate-in fade-in duration-150 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-red-950/90 border-red-500/60 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search & Filter Switchboard */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-4 shadow-lg">
        {/* Scope Toggle: All Transmissions vs My Transmissions */}
        {!hideScopeToggle && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setScope("all");
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                  scope === "all"
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>All Transmissions</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope("mine");
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                  scope === "mine"
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>My Uploaded Builds</span>
              </button>
            </div>

            {scope === "mine" && !currentUserId && localUploads.length === 0 && (
              <span className="text-[0.7rem] text-amber-400/90 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                💡 Tip: Sign in to sync your builds across all devices!
              </span>
            )}
          </div>
        )}

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
          <p className="text-sm text-slate-300 font-bold">
            {scope === "mine"
              ? ">> YOU HAVE NOT UPLOADED ANY TRANSMISSIONS YET."
              : ">> NO TRANSMISSIONS FOUND MATCHING YOUR CRITERIA."}
          </p>
          <p className="text-xs text-slate-500">
            {scope === "mine"
              ? "Publish your custom build from the B.U.I.L.D. Workbench to share it with the community!"
              : "Try adjusting your search query or selecting a different archetype filter."}
          </p>
          {scope === "mine" && (
            <Link
              href="/build"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider mt-2"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Create Build Now</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transmissions.map((t) => {
            const isOwned = Boolean(t.isOwner || localUploads.some((u) => u.slug === t.slug || u.id === t.id));
            const isDeleting = deletingId === t.id;

            return (
              <div
                key={t.id}
                className={`rounded-xl border bg-slate-950/95 p-4 flex flex-col justify-between space-y-3 transition-all duration-200 group relative ${
                  isOwned
                    ? "border-amber-500/40 hover:border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                    : "border-slate-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Header: Author & Badges */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-xs shrink-0 font-black">
                        {t.author?.name ? t.author.name.charAt(0).toUpperCase() : <UserIcon className="h-3 w-3" />}
                      </div>
                      <span className="text-xs font-bold text-slate-300 truncate">
                        {t.author?.name || t.author?.username || "Wasteland Survivor"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOwned && (
                        <span className="text-[0.62rem] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-amber-950/90 text-amber-400 border border-amber-500/50 shadow-sm">
                          ★ AUTHOR
                        </span>
                      )}
                      <span
                        className={`text-[0.65rem] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${
                          t.isGhoul
                            ? "bg-lime-950/80 text-lime-400 border-lime-500/40"
                            : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                        }`}
                      >
                        {t.isGhoul ? "☣️ GHOUL" : "👤 HUMAN"}
                      </span>
                    </div>
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
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
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
                      <span>{clonedSlug === t.slug ? "Loading..." : "Load Build"}</span>
                    </button>
                  </div>

                  {/* Owner Controls Row */}
                  {isOwned && (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/50">
                      <Link
                        href={`/build?edit=${t.slug}`}
                        className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-300 font-bold text-center uppercase transition-colors flex items-center justify-center gap-1 text-[0.7rem]"
                      >
                        <Edit3 className="h-3 w-3 text-amber-400" />
                        <span>Edit Build</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransmission(t)}
                        disabled={isDeleting}
                        className="py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold uppercase transition-colors flex items-center justify-center gap-1 text-[0.7rem] disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                        <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
