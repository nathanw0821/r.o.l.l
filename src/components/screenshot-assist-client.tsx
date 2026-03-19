"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useProgressHistory } from "@/components/progress-history-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalProgress } from "@/components/use-local-progress";
import { type SelectionSource } from "@/lib/filter-utils";
import { subscribeProgressChange } from "@/lib/progress-events";
import { cn } from "@/lib/utils";

type ScreenshotAssistRow = {
  id: string;
  effect: { name: string };
  tier?: { label?: string } | null;
  categories: { category: { name: string } }[];
  unlocked: boolean;
  selectionSource?: SelectionSource;
};

const tierOptions = ["all", "1 Star", "2 Star", "3 Star", "4 Star"] as const;
const STORAGE_KEY = "roll.screenshot-assist.v1";

type DraftState = {
  query: string;
  tier: (typeof tierOptions)[number];
  category: string;
  lockedOnly: boolean;
  selectedIds: string[];
};

const defaultDraft: DraftState = {
  query: "",
  tier: "all",
  category: "all",
  lockedOnly: true,
  selectedIds: []
};

function readDraft(): DraftState {
  if (typeof window === "undefined") return defaultDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    return {
      query: typeof parsed.query === "string" ? parsed.query : defaultDraft.query,
      tier: tierOptions.includes(parsed.tier as (typeof tierOptions)[number])
        ? (parsed.tier as (typeof tierOptions)[number])
        : defaultDraft.tier,
      category: typeof parsed.category === "string" ? parsed.category : defaultDraft.category,
      lockedOnly: typeof parsed.lockedOnly === "boolean" ? parsed.lockedOnly : defaultDraft.lockedOnly,
      selectedIds: Array.isArray(parsed.selectedIds)
        ? parsed.selectedIds.filter((value): value is string => typeof value === "string")
        : defaultDraft.selectedIds
    };
  } catch {
    return defaultDraft;
  }
}

export default function ScreenshotAssistClient({
  rows
}: {
  rows: ScreenshotAssistRow[];
}) {
  const { data: session } = useSession();
  const { map: localProgress } = useLocalProgress(!session);
  const { commitEntries } = useProgressHistory();
  const [localRows, setLocalRows] = React.useState(rows);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState(defaultDraft.query);
  const [tier, setTier] = React.useState<(typeof tierOptions)[number]>(defaultDraft.tier);
  const [category, setCategory] = React.useState(defaultDraft.category);
  const [lockedOnly, setLockedOnly] = React.useState(defaultDraft.lockedOnly);
  const [selectedIds, setSelectedIds] = React.useState<string[]>(defaultDraft.selectedIds);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const hasLoadedDraft = React.useRef(false);

  const categoryOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const row of localRows) {
      for (const categoryRow of row.categories) {
        names.add(categoryRow.category.name);
      }
    }
    return ["all", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [localRows]);

  React.useEffect(() => {
    if (hasLoadedDraft.current) return;
    hasLoadedDraft.current = true;
    const draft = readDraft();
    setQuery(draft.query);
    setTier(draft.tier);
    setCategory(draft.category);
    setLockedOnly(draft.lockedOnly);
    setSelectedIds(draft.selectedIds);
  }, []);

  React.useEffect(() => {
    if (!hasLoadedDraft.current) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          query,
          tier,
          category,
          lockedOnly,
          selectedIds
        } satisfies DraftState)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [query, tier, category, lockedOnly, selectedIds]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  React.useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory("all");
    }
  }, [category, categoryOptions]);

  React.useEffect(() => {
    const merged = rows.map((row) => {
      const localValue = localProgress[row.id];
      if (localValue === undefined) return row;
      return {
        ...row,
        unlocked: localValue,
        selectionSource: "edited" as const
      };
    });
    setLocalRows(merged);
  }, [rows, localProgress]);

  React.useEffect(() => {
    return subscribeProgressChange((entries) => {
      if (entries.length === 0) return;
      const entryMap = new Map(entries.map((entry) => [entry.effectTierId, entry]));
      setLocalRows((prev) =>
        prev.map((row) => {
          const entry = entryMap.get(row.id);
          if (!entry) return row;
          return {
            ...row,
            unlocked: entry.unlocked,
            selectionSource: entry.selectionSource ?? row.selectionSource
          };
        })
      );
    });
  }, []);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return localRows.filter((row) => {
      if (lockedOnly && row.unlocked) return false;
      if (tier !== "all" && row.tier?.label !== tier) return false;
      if (
        category !== "all" &&
        !row.categories.some((categoryRow) => categoryRow.category.name === category)
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      const categoryText = row.categories.map((categoryRow) => categoryRow.category.name).join(" ").toLowerCase();
      return (
        row.effect.name.toLowerCase().includes(normalizedQuery) ||
        (row.tier?.label ?? "").toLowerCase().includes(normalizedQuery) ||
        categoryText.includes(normalizedQuery)
      );
    });
  }, [localRows, lockedOnly, tier, category, query]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setSelectedIds([]);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function toggleSelection(effectTierId: string) {
    setSelectedIds((current) =>
      current.includes(effectTierId)
        ? current.filter((id) => id !== effectTierId)
        : [...current, effectTierId]
    );
  }

  function selectVisible() {
    setSelectedIds(Array.from(new Set(filteredRows.map((row) => row.id))));
  }

  function clearDraft() {
    setQuery(defaultDraft.query);
    setTier(defaultDraft.tier);
    setCategory(defaultDraft.category);
    setLockedOnly(defaultDraft.lockedOnly);
    setSelectedIds(defaultDraft.selectedIds);
    setMessage(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function saveConfirmed() {
    if (selectedIds.length === 0) return;
    setPending(true);
    setMessage(null);
    const selectedRows = localRows.filter((row) => selectedIds.includes(row.id));
    const saved = await commitEntries(
      selectedRows.map((row) => ({
        effectTierId: row.id,
        previousUnlocked: row.selectionSource === "edited" ? row.unlocked : null,
        nextUnlocked: true,
        previousResolvedUnlocked: row.unlocked,
        nextResolvedUnlocked: true,
        previousSelectionSource: row.selectionSource,
        nextSelectionSource: "edited" as const
      }))
    );

    if (saved) {
      setMessage(`Saved ${selectedIds.length} confirmed unlock${selectedIds.length === 1 ? "" : "s"}.`);
      setSelectedIds([]);
    } else {
      setMessage("Could not save confirmed unlocks.");
    }
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">1. Add a screenshot</div>
          <div className="mt-1 text-xs text-foreground/60">
            Your screenshot stays in this browser. R.O.L.L. uses it as a visual reference only and does not parse it.
          </div>
          <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="mt-3" />
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">2. Narrow the checklist</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-xs text-foreground/60">
              Search
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Effect or category"
                className="mt-1"
              />
            </label>
            <label className="text-xs text-foreground/60">
              Tier
              <select
                value={tier}
                onChange={(event) => setTier(event.target.value as (typeof tierOptions)[number])}
                className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-panel px-3 text-sm"
              >
                {tierOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All tiers" : option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-foreground/60">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-panel px-3 text-sm"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All categories" : option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={lockedOnly}
                onChange={(event) => setLockedOnly(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Show still locked only
            </label>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">3. Confirm visible unlocks</div>
              <div className="mt-1 text-xs text-foreground/60">
                Select only the effects you can clearly verify in the screenshot.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectVisible}>
                Select Visible
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearDraft}>
                Reset Assist
              </Button>
              <Button type="button" size="sm" onClick={saveConfirmed} disabled={pending || selectedIds.length === 0}>
                {pending ? "Saving..." : `Save Confirmed (${selectedIds.length})`}
              </Button>
            </div>
          </div>

          <div className="mt-4 max-h-[520px] space-y-2 overflow-auto">
            {filteredRows.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-border px-3 py-4 text-sm text-foreground/60">
                No effects match the current filters.
              </div>
            ) : null}
            {filteredRows.map((row) => {
              const selected = selectedIds.includes(row.id);
              const categories = row.categories.map((categoryRow) => categoryRow.category.name).join(", ");
              return (
                <label
                  key={row.id}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius)] border px-3 py-3 text-sm",
                    selected ? "border-accent bg-accentMuted/20" : "border-border bg-panel/70"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelection(row.id)}
                    className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold">{row.effect.name}</div>
                    <div className="mt-1 text-xs text-foreground/60">
                      {row.tier?.label ?? "Unknown tier"}
                      {categories ? ` | ${categories}` : ""}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {message ? <div className="mt-3 text-xs text-foreground/70">{message}</div> : null}
          <div className="mt-3 text-xs text-foreground/60">
            Storage: screenshot preview stays local to this browser tab, assist filters and checklist draft stay in local browser storage, and confirmed unlocks save to {session ? "your account on the server" : "the existing guest progress cookie"}.
          </div>
          {!session ? (
            <div className="mt-2 text-xs text-foreground/60">
              Guest mode saves locally in this browser. Sign in to sync confirmed unlocks to your account.
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-panel p-4 lg:sticky lg:top-24 lg:self-start">
        <div className="text-sm font-semibold">Screenshot Reference</div>
        <div className="mt-1 text-xs text-foreground/60">
          Keep the screenshot open here while you confirm unlocks on the left.
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius)] border border-border bg-background/40">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Uploaded game screenshot for manual review" className="h-auto w-full object-contain" />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center px-4 text-center text-sm text-foreground/50">
              Add a screenshot to preview it here. No OCR, no parsing, and no live game access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
