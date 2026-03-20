"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/components/filter-context";
import SupportLink from "@/components/support-link";
import { useRewards } from "@/components/rewards-provider";
import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/components/theme-provider";
import { updateUserSettings } from "@/actions/settings";
import { useLocalProgress } from "@/components/use-local-progress";
import { formatTierStars } from "@/lib/tier-format";

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
  const { data: session } = useSession();
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
    theme,
    accent,
    colorBlind,
    density,
    scanlineMode,
    uiTone,
    setTheme,
    setAccent,
    setColorBlind,
    setDensity,
    setScanlineMode,
    setUiTone
  } = useThemeSettings();
  const categoryOptions = ["Armor", "Power Armor", "Weapon: Ranged", "Weapon: Melee"];
  const { status: rewardsStatus } = useRewards();
  const [interactionSections, setInteractionSections] = React.useState({
    source: true,
    status: true,
    origins: true,
    categories: true
  });
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

  function toggleInteractionSection(key: keyof typeof interactionSections) {
    setInteractionSections((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div ref={hubRef} className={cn("command-hub", expanded && "command-hub--open")}>
      <div className="command-hub__bar">
        <div className="command-hub__search">
          <Search className="h-4 w-4 text-foreground/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search effects, tiers, origins"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
          />
        </div>
        <div className="command-hub__stat">
          <div className="text-[10px] uppercase text-foreground/50">Completion</div>
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

      <div className="command-hub__body">
        <section className="hub-zone">
          <div className="hub-zone__title">
            <Zap className="h-4 w-4" />
            Data Overview
          </div>
          <div className="hub-metric">
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span>Unlocked</span>
              <span>{displayUnlocked} / {summary.total}</span>
            </div>
            <div className="hub-bar">
              <div
                className="hub-bar__fill hub-bar__fill--success"
                style={{ width: animateBars ? `${unlockedPercent}%` : "0%" }}
              />
            </div>
          </div>
          <div className="hub-metric">
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span>Locked</span>
              <span>{locked}</span>
            </div>
            <div className="hub-bar">
              <div
                className="hub-bar__fill hub-bar__fill--warning"
                style={{ width: animateBars ? `${lockedPercent}%` : "0%" }}
              />
            </div>
          </div>
          <div className="mt-3 rounded-[var(--radius)] border border-border bg-panel/80 px-3 py-2 text-xs text-foreground/60">
            Data source: {dataset?.sourceName ?? dataset?.sourceType ?? "Unknown"}
            <div>Last synced: {displayLastSynced}</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-xs uppercase tracking-[0.08em] text-foreground/50">Per Tier</div>
            {displayTierProgress.map((tier) => (
              <div key={tier.tierLabel} className="hub-metric">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span>{formatTierStars(tier.tierLabel) || tier.tierLabel}</span>
                  <span>{tier.percent}%</span>
                </div>
                <div className="hub-bar">
                  <div
                    className="hub-bar__fill hub-bar__fill--success"
                    style={{ width: animateBars ? `${tier.percent}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hub-zone">
          <div className="hub-zone__title">
            <SlidersHorizontal className="h-4 w-4" />
            Interaction
          </div>
          <div className="hub-group">
            <button
              type="button"
              className="hub-group__toggle"
              onClick={() => toggleInteractionSection("source")}
              aria-expanded={interactionSections.source}
            >
              <span>Source</span>
              {interactionSections.source ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {interactionSections.source ? (
              <div className="hub-options mt-2">
                {(["default", "imported", "edited"] as const).map((source) => (
                  <label key={source} className="hub-option">
                    <input
                      type="checkbox"
                      checked={sourceFilters.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>{source}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
          <div className="hub-group">
            <button
              type="button"
              className="hub-group__toggle"
              onClick={() => toggleInteractionSection("status")}
              aria-expanded={interactionSections.status}
            >
              <span>Status</span>
              {interactionSections.status ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {interactionSections.status ? (
              <div className="hub-options mt-2">
                {(["unlocked", "locked"] as const).map((status) => (
                  <label key={status} className="hub-option">
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
          <div className="hub-group">
            <button
              type="button"
              className="hub-group__toggle"
              onClick={() => toggleInteractionSection("origins")}
              aria-expanded={interactionSections.origins}
            >
              <span>Origins</span>
              {interactionSections.origins ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {interactionSections.origins ? (
              <div className="hub-options hub-options--scroll mt-2">
                {originOptions.length === 0 ? (
                  <div className="text-xs text-foreground/40">No origins detected.</div>
                ) : (
                  originOptions.map((origin) => (
                    <label key={origin} className="hub-option">
                      <input
                        type="checkbox"
                        checked={originFilters.includes(origin)}
                        onChange={() => toggleOrigin(origin)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span>{origin}</span>
                    </label>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <div className="hub-group">
            <button
              type="button"
              className="hub-group__toggle"
              onClick={() => toggleInteractionSection("categories")}
              aria-expanded={interactionSections.categories}
            >
              <span>Categories</span>
              {interactionSections.categories ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {interactionSections.categories ? (
              <div className="hub-options mt-2">
                {categoryOptions.map((category) => (
                  <label key={category} className="hub-option">
                    <input
                      type="checkbox"
                      checked={categoryFilters.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
          {hasActiveFilters ? (
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-foreground/60">
              {query.trim().length > 0 ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
                >
                  Search: {query} x
                </button>
              ) : null}
              {sourceFilters.map((source) => (
                <button
                  key={`source-${source}`}
                  type="button"
                  onClick={() => toggleSource(source)}
                  className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
                >
                  Source: {source} x
                </button>
              ))}
              {statusFilters.map((status) => (
                <button
                  key={`status-${status}`}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
                >
                  Status: {status} x
                </button>
              ))}
              {categoryFilters.map((category) => (
                <button
                  key={`category-${category}`}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
                >
                  Category: {category} x
                </button>
              ))}
              {originFilters.map((origin) => (
                <button
                  key={`origin-${origin}`}
                  type="button"
                  onClick={() => toggleOrigin(origin)}
                  className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
                >
                  Origin: {origin} x
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="hub-zone">
          <div className="hub-zone__title">System</div>
          <div className="hub-section">
            <div className="hub-section__title">View Density</div>
            <div className="hub-section__copy">
              {density === "compact"
                ? "Compact tightens cards, rows, and spacing for faster scanning."
                : "Comfortable adds breathing room for easier reading."}
            </div>
            <div className="hub-choice-grid hub-choice-grid--two">
              {([
                {
                  value: "comfortable",
                  label: "Comfortable",
                  meta: "More spacing, clearer grouping"
                },
                {
                  value: "compact",
                  label: "Compact",
                  meta: "Denser cards, tighter scanning"
                }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-active={density === option.value}
                  className="hub-choice"
                  onClick={() => {
                    setDensity(option.value);
                    persistSettings({ density: option.value });
                  }}
                >
                  <span className="hub-choice__label">{option.label}</span>
                  <span className="hub-choice__meta">{option.meta}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hub-group">
            <div className="text-xs text-foreground/60">Theme</div>
            <div className="flex flex-wrap gap-2">
              {(["dark", "light"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTheme(value);
                    persistSettings({ theme: value });
                  }}
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs",
                    theme === value
                      ? "border-accent text-foreground"
                      : "border-border text-foreground/60 hover:border-accent"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            {theme === "light" ? (
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--color-warning)]">
                Caution, bright
              </div>
            ) : null}
          </div>
          <div className="hub-group">
            <div className="text-xs text-foreground/60">Accent</div>
            <div className="flex flex-wrap gap-2">
              {([
                "ember",
                "vault",
                "radburst",
                "glow",
                "brass",
                "frost",
                ...(["sunset", "mint", "nightfall"] as const).filter((value) =>
                  rewardsStatus?.unlockedItemIds?.includes(`accent-${value}`)
                )
              ] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAccent(value);
                    persistSettings({ accent: value });
                  }}
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs capitalize",
                    accent === value
                      ? "border-accent text-foreground"
                      : "border-border text-foreground/60 hover:border-accent"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="hub-group">
            <div className="text-xs text-foreground/60">UI Tone</div>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "neutral", label: "Neutral" },
                { value: "vault", label: "Vault" },
                { value: "copper", label: "Copper" },
                { value: "olive", label: "Olive" },
                { value: "rose", label: "Rose" }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUiTone(option.value)}
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs",
                    uiTone === option.value
                      ? "border-accent text-foreground"
                      : "border-border text-foreground/60 hover:border-accent"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hub-group">
            <div className="text-xs text-foreground/60">Color Assistance</div>
            <select
              value={colorBlind}
              onChange={(event) => {
                setColorBlind(event.target.value as typeof colorBlind);
                persistSettings({ colorBlind: event.target.value });
              }}
              className="w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs"
            >
              <option value="none">Default</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="protanopia">Protanopia</option>
              <option value="tritanopia">Tritanopia</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>
          <div className="hub-group">
            <div className="text-xs text-foreground/60">Scanlines</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {([
                { value: "off", label: "Off" },
                { value: "soft", label: "Soft" },
                { value: "balanced", label: "Balanced" },
                { value: "strong", label: "Strong" }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setScanlineMode(option.value)}
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs",
                    scanlineMode === option.value
                      ? "border-accent text-foreground"
                      : "border-border text-foreground/60 hover:border-accent"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hub-group">
            <div className="text-xs text-foreground/60">Navigation</div>
            <div className="flex flex-wrap gap-2">
              {isAdmin ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href="/admin-import">Admin Tools</Link>
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            </div>
          </div>
          <div className="hub-section">
            <div className="hub-section__title">Support</div>
            <div className="hub-section__copy">
              Donations stay optional and never gate tracking features.
            </div>
            <div className="mt-3">
              <SupportLink href={rewardsStatus?.supportUrl} label="Support this App ❤️" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
