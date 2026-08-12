"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, ChevronDown, ChevronUp, Compass, FlaskConical, Palette, Search, Settings, Shield, SlidersHorizontal, Trophy, User, Wrench, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/components/filter-context";
import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/components/theme-provider";
import { updateUserSettings } from "@/actions/settings";
import { useLocalProgress } from "@/components/use-local-progress";
import { formatTierStars } from "@/lib/tier-format";

import { usePathname } from "next/navigation";
import { searchPerkCards } from "@/lib/perks/catalog";

type CommandHubProps = {
  summary: { total: number; unlocked: number; percent: number };
  tierProgress: {
    tierLabel: string;
    total: number;
    unlocked: number;
    percent: number;
    effectTierIds: string[];
  }[];
  isAdmin?: boolean;
  dataset?: {
    importedAt?: string | null;
    sourceType?: string | null;
    sourceName?: string | null;
  } | null;
};

export default function CommandHub({ summary, tierProgress, isAdmin = false, dataset }: CommandHubProps) {
  const hubRef = React.useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isPerksPage = Boolean(pathname?.startsWith("/perks"));
  const isGearPage = Boolean(
    pathname?.startsWith("/build") ||
    pathname?.startsWith("/1-star") ||
    pathname?.startsWith("/2-star") ||
    pathname?.startsWith("/3-star") ||
    pathname?.startsWith("/4-star") ||
    pathname?.startsWith("/all-effects")
  );
  const { data: session } = useSession();
  const isUserAdmin = Boolean(session?.user && ((session.user as { role?: string }).role === "ADMIN" || (session.user as { isAdmin?: boolean }).isAdmin)) || isAdmin;
  const {
    query,
    setQuery,
    sourceFilters,
    statusFilters,
    originFilters,
    categoryFilters,
    originOptions,
    clearFilters,
    toggleSource,
    toggleStatus,
    toggleOrigin,
    toggleCategory
  } = useFilters();
  const [expanded, setExpanded] = React.useState(false);
  const [animateBars, setAnimateBars] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const {
    accent,
    density,
    setAccent,
    setDensity,
  } = useThemeSettings();
  const categoryOptions = ["Armor", "Power Armor", "Weapon: Ranged", "Weapon: Melee"];
  const isSignedIn = hydrated && Boolean(session);
  const hasActiveFilters =
    query.trim().length > 0 ||
    sourceFilters.length > 0 ||
    statusFilters.length > 0 ||
    originFilters.length > 0 ||
    categoryFilters.length > 0;
  const { map: localProgress, unlockedCount } = useLocalProgress(!isSignedIn);

  const displayUnlocked = isSignedIn ? summary.unlocked : unlockedCount;
  const locked = Math.max(summary.total - displayUnlocked, 0);
  const displayPercent = summary.total > 0 ? Math.round((displayUnlocked / summary.total) * 100) : 0;
  const unlockedPercent = displayPercent;
  const lockedPercent = 100 - unlockedPercent;
  const lastSynced = dataset?.importedAt ? new Date(dataset.importedAt).toLocaleString() : "Unknown";
  const displayLastSynced = hydrated ? lastSynced : "Loading...";
  const displayTierProgress = React.useMemo(
    () =>
      tierProgress.map((tier) => {
        if (isSignedIn) return tier;
        const unlocked = tier.effectTierIds.reduce(
          (count, effectTierId) => count + (localProgress[effectTierId] ? 1 : 0),
          0
        );
        return {
          ...tier,
          unlocked,
          percent: tier.total > 0 ? Math.round((unlocked / tier.total) * 100) : 0
        };
      }),
    [isSignedIn, localProgress, tierProgress]
  );

  const matchingPerks = React.useMemo(() => {
    if (!query.trim() || isGearPage) return [];
    return searchPerkCards(query).slice(0, 6);
  }, [query, isGearPage]);

  React.useEffect(() => {
    setAnimateBars(true);
  }, []);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!expanded) return;

    function handlePointerDown(event: PointerEvent) {
      if (!hubRef.current) return;
      if (hubRef.current.contains(event.target as Node)) return;
      setExpanded(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [expanded]);

  async function persistSettings(next: { theme?: string; accent?: string; colorBlind?: string; density?: string }) {
    if (!session) return;
    await updateUserSettings({
      theme: next.theme as "light" | "dark" | "system" | undefined,
      accent: next.accent as
        | "ember"
        | "vault"
        | "radburst"
        | "glow"
        | "brass"
        | "frost"
        | "sunset"
        | "mint"
        | "nightfall"
        | undefined,
      density: next.density as "comfortable" | "compact" | undefined,
      colorBlind: next.colorBlind as
        | "none"
        | "deuteranopia"
        | "protanopia"
        | "tritanopia"
        | "high-contrast"
        | undefined
    });
  }

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        setExpanded(true);
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [activeTab, setActiveTab] = React.useState<"filters" | "progress" | "appearance" | "nav">("filters");

  return (
    <>
      <div ref={hubRef} className={cn("command-hub", expanded && "command-hub--open")}>
      <div className="command-hub__bar">
        <div className="command-hub__search relative">
          <Search className="h-4 w-4 text-foreground/50 shrink-0" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(event) => {
              const val = event.target.value;
              setQuery(val);
              if (val.trim().length > 0 && !expanded) {
                setExpanded(true);
              }
            }}
            placeholder={
              isPerksPage
                ? "Search perk cards..."
                : isGearPage
                ? "Search legendary effects, tiers, origins..."
                : "Search perks, legendary effects, origins..."
            }
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none pr-6"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 focus:outline-none cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="command-hub__stat">
          <div className="text-[0.78rem] uppercase text-foreground/50">Completion</div>
          <div className="text-base font-semibold">{displayPercent}%</div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="command-hub__expand"
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded ? (
        <div className="command-hub__body">
          {/* Mobile close header */}
          <div className="xl:hidden flex items-center justify-between border-b border-border/30 pb-2 mb-2 w-full font-mono">
            <span className="text-xs font-black uppercase text-accent tracking-widest">[ COMMAND CENTER ]</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex items-center gap-1 text-xs font-bold uppercase text-foreground/60 hover:text-foreground bg-background/50 px-2.5 py-1 rounded border border-border/30 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-panel/80 border border-border/40 mb-4 font-mono">
            <button
              type="button"
              onClick={() => setActiveTab("filters")}
              className={cn(
                "py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "filters"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
              <span>Filters</span>
              {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("progress")}
              className={cn(
                "py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "progress"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span>Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={cn(
                "py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "appearance"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Palette className="h-3.5 w-3.5 shrink-0" />
              <span>Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("nav")}
              className={cn(
                "py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "nav"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span>Nav</span>
            </button>
          </div>

          {/* P.E.R.K. Card Matches */}
          {matchingPerks.length > 0 && (
            <section className="hub-zone mb-3 border-b border-border/40 pb-3">
              <div className="hub-zone__title text-emerald-400 font-mono flex items-center justify-between">
                <span>🃏 P.E.R.K. Card Matches ({matchingPerks.length})</span>
                <Link
                  href={`/perks?q=${encodeURIComponent(query)}`}
                  onClick={() => setExpanded(false)}
                  className="text-[0.7rem] text-emerald-400 hover:underline uppercase tracking-wider"
                >
                  View All in P.E.R.K. →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {matchingPerks.map((card) => (
                  <Link
                    key={card.id}
                    href={`/perks?q=${encodeURIComponent(card.name)}`}
                    onClick={() => setExpanded(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-800 bg-slate-950/90 hover:bg-slate-900/90 hover:border-emerald-500/50 transition-all group"
                  >
                    <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                      [{card.special}]
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold font-mono text-white group-hover:text-emerald-400 truncate">{card.name}</span>
                        <span className="text-[0.65rem] font-mono text-amber-400 font-bold shrink-0">{card.maxRank}★</span>
                      </div>
                      <p className="text-[0.68rem] font-mono text-slate-400 line-clamp-1 mt-0.5">
                        {card.ranks[0]?.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* TAB 1: FILTERS */}
          {activeTab === "filters" && (
            <div className="space-y-4 font-mono">
              {/* Status Filter */}
              <div className="space-y-1.5">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Status</span>
                <div className="flex flex-wrap gap-2">
                  {(["unlocked", "locked"] as const).map((status) => {
                    const active = statusFilters.includes(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleStatus(status)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer capitalize",
                          active
                            ? "bg-accent/20 border-accent text-accent shadow-sm"
                            : "border-border/60 bg-panel/60 text-foreground/60 hover:text-foreground hover:border-accent/40"
                        )}
                      >
                        {status === "unlocked" ? "✓ Learned" : "🔒 Locked"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Filter */}
              <div className="space-y-1.5">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Source</span>
                <div className="flex flex-wrap gap-2">
                  {(["default", "imported", "edited"] as const).map((source) => {
                    const active = sourceFilters.includes(source);
                    return (
                      <button
                        key={source}
                        type="button"
                        onClick={() => toggleSource(source)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer capitalize",
                          active
                            ? "bg-accent/20 border-accent text-accent shadow-sm"
                            : "border-border/60 bg-panel/60 text-foreground/60 hover:text-foreground hover:border-accent/40"
                        )}
                      >
                        {source}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => {
                    const active = categoryFilters.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                          active
                            ? "bg-accent/20 border-accent text-accent shadow-sm"
                            : "border-border/60 bg-panel/60 text-foreground/60 hover:text-foreground hover:border-accent/40"
                        )}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Origins Filter (Only shown if origin options exist) */}
              {originOptions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Origins</span>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {originOptions.map((origin) => {
                      const active = originFilters.includes(origin);
                      return (
                        <button
                          key={origin}
                          type="button"
                          onClick={() => toggleOrigin(origin)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[0.72rem] font-bold transition-all border cursor-pointer",
                            active
                              ? "bg-accent/20 border-accent text-accent"
                              : "border-border/60 bg-panel/60 text-foreground/60 hover:text-foreground"
                          )}
                        >
                          {origin}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions & Active Filters */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="w-full font-mono text-xs border-red-500/40 text-red-400 hover:bg-red-950/40">
                    🧹 Clear All Filters
                  </Button>
                  <div className="flex flex-wrap gap-1.5 text-xs text-foreground/60">
                    {query.trim().length > 0 && (
                      <button type="button" onClick={() => setQuery("")} className="px-2 py-0.5 rounded bg-panel border border-border text-foreground/80 hover:border-accent">
                        Query: &quot;{query}&quot; ×
                      </button>
                    )}
                    {statusFilters.map((s) => (
                      <button key={s} type="button" onClick={() => toggleStatus(s)} className="px-2 py-0.5 rounded bg-panel border border-border text-foreground/80 hover:border-accent capitalize">
                        Status: {s} ×
                      </button>
                    ))}
                    {sourceFilters.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSource(s)} className="px-2 py-0.5 rounded bg-panel border border-border text-foreground/80 hover:border-accent capitalize">
                        Source: {s} ×
                      </button>
                    ))}
                    {categoryFilters.map((c) => (
                      <button key={c} type="button" onClick={() => toggleCategory(c)} className="px-2 py-0.5 rounded bg-panel border border-border text-foreground/80 hover:border-accent">
                        {c} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROGRESS */}
          {activeTab === "progress" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20">
                  <div className="text-[0.7rem] uppercase text-emerald-400 font-bold">Unlocked</div>
                  <div className="text-xl font-bold text-emerald-300 mt-0.5">{displayUnlocked} / {summary.total}</div>
                  <div className="hub-bar mt-2">
                    <div className="hub-bar__fill hub-bar__fill--success" style={{ width: animateBars ? `${unlockedPercent}%` : "0%" }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/20">
                  <div className="text-[0.7rem] uppercase text-amber-400 font-bold">Remaining</div>
                  <div className="text-xl font-bold text-amber-300 mt-0.5">{locked}</div>
                  <div className="hub-bar mt-2">
                    <div className="hub-bar__fill hub-bar__fill--warning" style={{ width: animateBars ? `${lockedPercent}%` : "0%" }} />
                  </div>
                </div>
              </div>

              {dataset && (
                <div className="p-3 rounded-lg border border-border/60 bg-panel/60 text-xs text-foreground/70">
                  <div className="font-bold text-foreground">Data Source: {dataset.sourceName ?? dataset.sourceType ?? "Unknown"}</div>
                  <div className="text-foreground/50 mt-0.5">Last synced: {displayLastSynced}</div>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Per Tier Breakdown</span>
                <div className="space-y-2">
                  {displayTierProgress.map((tier) => (
                    <div key={tier.tierLabel} className="p-2.5 rounded-lg border border-border/40 bg-panel/40">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground mb-1.5">
                        <span>{formatTierStars(tier.tierLabel) || tier.tierLabel}</span>
                        <span className="text-emerald-400">{tier.percent}% ({tier.unlocked}/{tier.total})</span>
                      </div>
                      <div className="hub-bar">
                        <div className="hub-bar__fill hub-bar__fill--success" style={{ width: animateBars ? `${tier.percent}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & SYSTEM */}
          {activeTab === "appearance" && (
            <div className="space-y-4 font-mono">
              {/* Density */}
              <div className="space-y-1.5">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">UI Density</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["comfortable", "compact"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDensity(opt);
                        persistSettings({ density: opt });
                      }}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer capitalize",
                        density === opt
                          ? "bg-accent/20 border-accent text-accent shadow-sm"
                          : "border-border/60 bg-panel/60 text-foreground/60 hover:text-foreground"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme & Accent */}
              <div className="space-y-1.5">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Color Accent</span>
                <div className="flex flex-wrap gap-1.5">
                  {(["ember", "vault", "radburst", "glow", "brass", "frost", "sunset", "mint", "nightfall"] as const).map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => {
                        setAccent(acc);
                        persistSettings({ accent: acc });
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[0.72rem] font-bold capitalize transition-all border cursor-pointer",
                        accent === acc
                          ? "bg-accent text-accent-foreground border-accent shadow-sm"
                          : "border-border/60 bg-panel/60 text-foreground/60 hover:text-foreground"
                      )}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="pt-3 border-t border-border/40 space-y-2">
                <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Quick Navigation</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" size="sm" asChild className="font-mono text-xs border-accent/40 text-accent hover:bg-accent/10">
                    <Link href="/overview/achievements" onClick={() => setExpanded(false)}>🏆 Achievements</Link>
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild className="font-mono text-xs border-border text-foreground/80 hover:text-foreground">
                    <Link href="/settings" onClick={() => setExpanded(false)}>⚙️ Settings</Link>
                  </Button>
                  {isUserAdmin && (
                    <Button type="button" variant="outline" size="sm" asChild className="col-span-2 font-mono text-xs border-amber-500/40 text-amber-400 hover:bg-amber-950/40">
                      <Link href="/admin-import" onClick={() => setExpanded(false)}>🛠️ Admin Tools</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK NAVIGATION */}
          {activeTab === "nav" && (
            <div className="space-y-3 font-mono">
              <span className="text-[0.72rem] uppercase font-bold text-foreground/50 tracking-wider">Navigation & Account</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link
                  href="/overview/general"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 hover:border-accent transition-all group"
                >
                  <User className="h-4 w-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-accent">Account & Profile</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">Manage account baseline & data</div>
                  </div>
                </Link>

                <Link
                  href="/overview/achievements"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-500 transition-all group"
                >
                  <Trophy className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-emerald-400">Achievements</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">Milestones & Wasteland easter eggs</div>
                  </div>
                </Link>

                <Link
                  href="/pts"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/30 hover:border-amber-500 transition-all group col-span-1 md:col-span-2"
                >
                  <FlaskConical className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-amber-400">🧪 PTS Experimental Lab</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">Ghoul 20-Cap Sandbox, The Pitt & Atlantic City drop tables</div>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-panel/60 hover:bg-panel hover:border-border transition-all group"
                >
                  <Settings className="h-4 w-4 text-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-accent">App Settings</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">General preferences & backups</div>
                  </div>
                </Link>

                <Link
                  href="/overview/security"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-panel/60 hover:bg-panel hover:border-border transition-all group"
                >
                  <Shield className="h-4 w-4 text-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-accent">Password & Security</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">Account credentials & safety</div>
                  </div>
                </Link>

                <Link
                  href="/overview/appearance"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-panel/60 hover:bg-panel hover:border-border transition-all group"
                >
                  <Palette className="h-4 w-4 text-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-accent">Theme & Appearance</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">Custom colors, density & scanlines</div>
                  </div>
                </Link>

                <Link
                  href="/overview/readme"
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-panel/60 hover:bg-panel hover:border-border transition-all group"
                >
                  <BookOpen className="h-4 w-4 text-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-accent">Readme & Docs</div>
                    <div className="text-[0.68rem] text-foreground/50 truncate">Features guide & documentation</div>
                  </div>
                </Link>

                {isUserAdmin && (
                  <Link
                    href="/admin-import"
                    onClick={() => setExpanded(false)}
                    className="col-span-1 md:col-span-2 flex items-center gap-3 p-3 rounded-lg border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-400 transition-all group"
                  >
                    <Wrench className="h-4 w-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-300">Admin Tools & System Import</div>
                      <div className="text-[0.68rem] text-amber-400/60 truncate">Database management & dataset updates</div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
      
      {/* Floating Quick-Filter button on mobile */}
      <button
        type="button"
        onClick={() => {
          setExpanded((prev) => !prev);
        }}
        className={cn(
          "xl:hidden fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-accent-foreground font-mono text-xs font-black uppercase shadow-xl border border-accent/40 backdrop-blur-md active:scale-95 transition-all cursor-pointer",
          expanded && "hidden"
        )}
        aria-label="Open Command Hub Filters"
      >
        <SlidersHorizontal className="h-4 w-4 shrink-0" />
        <span>Quick Filters</span>
        {hasActiveFilters && (
          <span className="h-2 w-2 rounded-full bg-warning animate-ping" />
        )}
      </button>
    </>
  );
}
