"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useProgressHistory } from "@/components/progress-history-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionAssist } from "@/components/session-assist-provider";
import { useLocalProgress } from "@/components/use-local-progress";
import { ASSIST_PRESETS, assistPresetContent } from "@/lib/session-assist-presets";
import type { SessionAssistRow } from "@/lib/session-assist";
import { subscribeProgressChange } from "@/lib/progress-events";
import { cn } from "@/lib/utils";

const tierOptions = ["all", "1 Star", "2 Star", "3 Star", "4 Star"] as const;
const STORAGE_KEY = "roll.screenshot-assist.v1";
const OPENAI_KEY_STORAGE_KEY = "roll.session-assist.openai-key.v1";
/** Matches `/api/session-assist/analyze` candidate cap per request. */
const AI_CANDIDATE_CHUNK = 120;

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

function readStoredOpenAiKey() {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(OPENAI_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the screenshot."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the screenshot."));
    reader.readAsDataURL(file);
  });
}

export default function ScreenshotAssistClient({
  rows,
  mode = "page"
}: {
  rows: SessionAssistRow[];
  mode?: "page" | "window";
}) {
  const { preset, setPreset } = useSessionAssist();
  const { data: session } = useSession();
  const { map: localProgress } = useLocalProgress(!session);
  const { commitEntries } = useProgressHistory();
  const [localRows, setLocalRows] = React.useState(rows);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState(defaultDraft.query);
  const [tier, setTier] = React.useState<(typeof tierOptions)[number]>(defaultDraft.tier);
  const [category, setCategory] = React.useState(defaultDraft.category);
  const [lockedOnly, setLockedOnly] = React.useState(defaultDraft.lockedOnly);
  const [selectedIds, setSelectedIds] = React.useState<string[]>(defaultDraft.selectedIds);
  const [openAiKey, setOpenAiKey] = React.useState("");
  const [aiPending, setAiPending] = React.useState(false);
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [aiSuggestedIds, setAiSuggestedIds] = React.useState<string[]>([]);
  const [aiReasonById, setAiReasonById] = React.useState<Record<string, string>>({});
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
    setOpenAiKey(readStoredOpenAiKey());
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
    if (!hasLoadedDraft.current) return;
    try {
      if (openAiKey.trim()) {
        window.sessionStorage.setItem(OPENAI_KEY_STORAGE_KEY, openAiKey);
      } else {
        window.sessionStorage.removeItem(OPENAI_KEY_STORAGE_KEY);
      }
    } catch {
      // ignore browser storage errors
    }
  }, [openAiKey]);

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
    setAiSuggestedIds([]);
    setAiMessage(null);
    setAiReasonById({});
  }, [query, tier, category, lockedOnly]);

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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setAiMessage(null);
    setAiSuggestedIds([]);
    setAiReasonById({});
    setSelectedIds([]);
    try {
      const nextImageDataUrl = await readFileAsDataUrl(file);
      setImageDataUrl(nextImageDataUrl);
    } catch {
      setImageDataUrl(null);
      setAiMessage("Could not read that screenshot file.");
    }
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
    setAiMessage(null);
    setAiSuggestedIds([]);
    setAiReasonById({});
    setImageDataUrl(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function applyAiSuggestions() {
    if (aiSuggestedIds.length === 0) return;
    setSelectedIds((current) => Array.from(new Set([...current, ...aiSuggestedIds])));
    setMessage(`Added ${aiSuggestedIds.length} AI suggestion${aiSuggestedIds.length === 1 ? "" : "s"} to the checklist. Review them before saving.`);
  }

  async function requestAiSuggestions() {
    if (!imageDataUrl) {
      setAiMessage("Add a screenshot first.");
      return;
    }
    if (!openAiKey.trim()) {
      setAiMessage("Add your OpenAI API key.");
      return;
    }
    if (filteredRows.length === 0) {
      setAiMessage("No rows match the current filters.");
      return;
    }

    setAiPending(true);
    setAiMessage(null);
    setAiSuggestedIds([]);
    setAiReasonById({});

    const key = openAiKey.trim();
    const reasons = new Map<string, string>();
    const orderedIds: string[] = [];
    const cautions: string[] = [];
    const chunks: (typeof filteredRows)[] = [];
    for (let i = 0; i < filteredRows.length; i += AI_CANDIDATE_CHUNK) {
      chunks.push(filteredRows.slice(i, i + AI_CANDIDATE_CHUNK));
    }

    try {
      for (const chunk of chunks) {
        const response = await fetch("/api/session-assist/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            apiKey: key,
            imageDataUrl,
            assistPreset: preset,
            candidates: chunk.map((row) => ({
              effectTierId: row.id,
              effectName: row.effect.name,
              tierLabel: row.tier?.label ?? "Unknown tier",
              categories: row.categories.map((categoryRow) => categoryRow.category.name)
            }))
          })
        });

        const payload = (await response.json()) as {
          success?: boolean;
          matches?: { effectTierId: string; reason: string }[];
          caution?: string;
          error?: { message?: string };
        };

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message ?? "AI review could not complete.");
        }

        if (payload.caution?.trim()) cautions.push(payload.caution.trim());

        for (const match of payload.matches ?? []) {
          if (!reasons.has(match.effectTierId)) {
            reasons.set(match.effectTierId, match.reason);
            orderedIds.push(match.effectTierId);
          }
        }
      }

      setAiSuggestedIds(orderedIds);
      setAiReasonById(Object.fromEntries(reasons));

      if (orderedIds.length === 0) {
        setAiMessage(
          cautions[cautions.length - 1] ?? "No clear matches. Narrow filters or try a clearer screenshot."
        );
      } else {
        const batchNote = chunks.length > 1 ? ` · ${chunks.length} requests` : "";
        setAiMessage(`${orderedIds.length} suggested${batchNote}. Review before "Use suggestions".`);
      }
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : "AI review could not complete.");
    } finally {
      setAiPending(false);
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

  const isWindow = mode === "window";
  const aiSuggestionSet = React.useMemo(() => new Set(aiSuggestedIds), [aiSuggestedIds]);
  const presetContent = assistPresetContent[preset];

  return (
    <div className={cn(isWindow ? "space-y-4" : "grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]")}>
      <div className="space-y-4">
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">{presetContent.label}</div>
          <div className="mt-1 text-xs text-foreground/60">{presetContent.checklistHint}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ASSIST_PRESETS.map((value) => {
              const option = assistPresetContent[value];
              return (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={preset === value ? "default" : "outline"}
                  onClick={() => setPreset(value)}
                >
                  {option.shortLabel}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">1. Screenshot</div>
          <div className="mt-1 text-xs text-foreground/60">Local only until you run AI or save.</div>
          <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="mt-3" />
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">2. Shortlist</div>
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">3. {presetContent.aiTitle}</div>
              <div className="mt-1 text-xs text-foreground/60">Suggestions only; large lists use multiple requests.</div>
            </div>
            <div className="rounded-full border border-border px-2 py-1 text-[11px] text-foreground/60">
              Shortlist: {filteredRows.length}
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <label className="text-xs text-foreground/60">
              OpenAI API key
              <Input
                type="password"
                value={openAiKey}
                onChange={(event) => setOpenAiKey(event.target.value)}
                placeholder="sk-..."
                className="mt-1"
                autoComplete="off"
              />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={requestAiSuggestions} disabled={aiPending}>
                {aiPending ? "Analyzing..." : presetContent.aiButton}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyAiSuggestions}
                disabled={aiSuggestedIds.length === 0}
              >
                Use Suggestions ({aiSuggestedIds.length})
              </Button>
            </div>
          </div>
          <div className="mt-3 text-xs text-foreground/60">
            Key stays in this tab session. Image + shortlist go to OpenAI only when you run analyze.
          </div>
          {aiMessage ? <div className="mt-2 text-xs text-foreground/70">{aiMessage}</div> : null}
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">4. Confirm & save</div>
              <div className="mt-1 text-xs text-foreground/60">Tick what you verify, then save.</div>
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

          <div className={cn("mt-4 space-y-2 overflow-auto", isWindow ? "max-h-[320px]" : "max-h-[520px]")}>
            {filteredRows.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-border px-3 py-4 text-sm text-foreground/60">
                No effects match the current filters.
              </div>
            ) : null}
            {filteredRows.map((row) => {
              const selected = selectedIds.includes(row.id);
              const aiSuggested = aiSuggestionSet.has(row.id);
              const categories = row.categories.map((categoryRow) => categoryRow.category.name).join(", ");
              return (
                <label
                  key={row.id}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius)] border px-3 py-3 text-sm",
                    selected
                      ? "border-accent bg-accentMuted/20"
                      : aiSuggested
                        ? "border-[color:color-mix(in_srgb,var(--color-accent)_46%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_12%,var(--color-panel))]"
                        : "border-border bg-panel/70"
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
                    {aiSuggested ? (
                      <div className="mt-1 space-y-0.5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent)]">
                          AI suggested
                        </div>
                        {aiReasonById[row.id] ? (
                          <div className="text-[11px] leading-snug text-foreground/70">{aiReasonById[row.id]}</div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>

          {message ? <div className="mt-3 text-xs text-foreground/70">{message}</div> : null}
          <div className="mt-3 text-xs text-foreground/60">
            Draft + key: this browser. Saves go to {session ? "your account" : "guest storage here"}.
          </div>
        </div>
      </div>

      <div className={cn("rounded-[var(--radius)] border border-border bg-panel p-4", !isWindow && "lg:sticky lg:top-24 lg:self-start")}>
        <div className="text-sm font-semibold">Preview</div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius)] border border-border bg-background/40">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Screenshot reference" className="h-auto w-full object-contain" />
          ) : (
            <div className={cn("flex items-center justify-center px-4 text-center text-sm text-foreground/50", isWindow ? "min-h-[220px]" : "min-h-[320px]")}>
              No image yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
