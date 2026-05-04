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
import { ImageProcessor } from "@/lib/image-processor";
import { useBuilderBetaAccess, BuilderBetaGate } from "@/components/builder/builder-beta-gate";

const langOptions = [
  { code: "eng", label: "English" },
  { code: "deu", label: "German" },
  { code: "fra", label: "French" },
  { code: "spa", label: "Spanish" },
  { code: "pol", label: "Polish" },
  { code: "rus", label: "Russian" },
  { code: "por", label: "Portuguese" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "nld", label: "Dutch" },
  { code: "ukr", label: "Ukrainian" },
  { code: "hin", label: "Hindi (Exp.)" },
  { code: "ara", label: "Arabic (Exp.)" },
  { code: "ben", label: "Bengali (Exp.)" },
  { code: "urd", label: "Urdu (Exp.)" }
];

const tierOptions = ["all", "1 Star", "2 Star", "3 Star", "4 Star"] as const;
const STORAGE_KEY = "roll.screenshot-assist.v1";
// OpenAI support removed temporarily - Tesseract OCR only
type DraftState = {
  query: string;
  tier: (typeof tierOptions)[number];
  category: string;
  lockedOnly: boolean;
  selectedIds: string[];
  autoSelectAi: boolean;
  ocrLang: string;
};

const defaultDraft: DraftState = {
  query: "",
  tier: "all",
  category: "all",
  lockedOnly: true,
  selectedIds: [],
  autoSelectAi: false,
  ocrLang: "eng"
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
      autoSelectAi: typeof parsed.autoSelectAi === "boolean" ? parsed.autoSelectAi : defaultDraft.autoSelectAi,
      selectedIds: Array.isArray(parsed.selectedIds)
        ? parsed.selectedIds.filter((value): value is string => typeof value === "string")
        : defaultDraft.selectedIds,
      ocrLang: typeof parsed.ocrLang === "string" ? parsed.ocrLang : defaultDraft.ocrLang
    };
  } catch {
    return defaultDraft;
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
  const [autoSelectAi, setAutoSelectAi] = React.useState(defaultDraft.autoSelectAi);
  const [selectedIds, setSelectedIds] = React.useState<string[]>(defaultDraft.selectedIds);
  const [ocrLang, setOcrLang] = React.useState(defaultDraft.ocrLang);
  const [showBetaGate, setShowBetaGate] = React.useState(false);
  const { hasAccess: hasBetaAccess, accept: acceptBeta } = useBuilderBetaAccess(isAdmin);

  const autoSelectAiRef = React.useRef(autoSelectAi);
  React.useEffect(() => {
    autoSelectAiRef.current = autoSelectAi;
  }, [autoSelectAi]);
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [aiSuggestedIds, setAiSuggestedIds] = React.useState<string[]>([]);
  const [aiReasonById, setAiReasonById] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [ocrPending, setOcrPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const processorRef = React.useRef<ImageProcessor | null>(null);
  const hasLoadedDraft = React.useRef(false);

  React.useEffect(() => {
    processorRef.current = new ImageProcessor();
    return () => {
      processorRef.current?.terminate();
    };
  }, []);

  React.useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const canvas = await ImageProcessor.getImageFromClipboard(e);
      if (canvas) {
        setImageDataUrl(canvas.toDataURL());
        setPreviewUrl(canvas.toDataURL()); // Use data URL for preview too
        setMessage("Image pasted from clipboard.");
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  async function requestTesseractAnalysis() {
    if (!imageDataUrl || !processorRef.current) {
      setAiMessage("Add a screenshot first.");
      return;
    }

    setOcrPending(true);
    setAiMessage(null);

    try {
      const img = new Image();
      img.src = imageDataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0);
      processorRef.current.applyFilters(canvas, ctx);
      
      const matches = await processorRef.current.extractLegendaryMods(canvas, ocrLang);
      
      if (matches.length === 0) {
        setAiMessage("No legendary mods recognized by Tesseract OCR. Try a clearer image.");
      } else {
        // Map names back to IDs in filteredRows
        const suggestedIds: string[] = [];
        const reasons: Record<string, string> = {};
        
        for (const match of matches) {
          const row = localRows.find(r => r.effect.name === match);
          if (row) {
            suggestedIds.push(row.id);
            reasons[row.id] = "Matched by Tesseract OCR";
          }
        }
        
        setAiSuggestedIds(suggestedIds);
        setAiReasonById(reasons);
        if (autoSelectAiRef.current) {
          setSelectedIds((current) => Array.from(new Set([...current, ...suggestedIds])));
        }
        setAiMessage(`${suggestedIds.length} mods recognized by Tesseract. Review and "${autoSelectAiRef.current ? "Save Confirmed" : "Use matches"}".`);
      }
    } catch (err) {
      setAiMessage(err instanceof Error ? err.message : "OCR failed.");
    } finally {
      setOcrPending(false);
    }
  }

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
    setAutoSelectAi(draft.autoSelectAi);
    setSelectedIds(draft.selectedIds);
    setOcrLang(draft.ocrLang);
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
          autoSelectAi,
          selectedIds,
          ocrLang
        } satisfies DraftState)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [query, tier, category, lockedOnly, autoSelectAi, selectedIds, ocrLang]);


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
    setAutoSelectAi(defaultDraft.autoSelectAi);
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
    setMessage(`Added ${aiSuggestedIds.length} OCR match${aiSuggestedIds.length === 1 ? "" : "es"} to the checklist. Review them before saving.`);
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

  if (!hasBetaAccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-panel/30 p-12 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-accent/40" />
        <h2 className="text-xl font-bold">Screenshot Assist Beta</h2>
        <p className="mt-2 max-w-md text-foreground/60">
          This tool is currently in experimental beta. Use screenshots from your in-game legendary crafting bench to sync your progress.
        </p>
        <Button onClick={() => setShowBetaGate(true)} className="mt-8">
          Access Beta Features
        </Button>
        <BuilderBetaGate 
          open={showBetaGate} 
          onAccept={() => { setShowBetaGate(false); acceptBeta(); }}
          onCancel={() => setShowBetaGate(false)}
        />
      </div>
    );
  }

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
          <div className="mt-1 text-xs text-foreground/60">Paste (Ctrl+V) or upload a screenshot of your Crafting Bench list.</div>
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
              <div className="text-sm font-semibold">3. Scan & recognize</div>
              <div className="mt-1 text-xs text-foreground/60">Tesseract OCR scans your screenshot for matching legendary mods.</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-wider text-foreground/40">OCR Language</label>
                <select 
                  value={ocrLang}
                  onChange={(e) => setOcrLang(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {langOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-full border border-border px-2 py-1 text-[11px] text-foreground/60">
                Shortlist: {filteredRows.length}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={requestTesseractAnalysis} disabled={ocrPending}>
                {ocrPending ? "Scanning..." : "Run Tesseract Scan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyAiSuggestions}
                disabled={aiSuggestedIds.length === 0}
              >
                Use Matches ({aiSuggestedIds.length})
              </Button>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                checked={autoSelectAi}
                onChange={(event) => setAutoSelectAi(event.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--accent)]"
              />
              Auto-select OCR matches
            </label>
          </div>
          {aiMessage ? <div className="mt-3 text-xs text-foreground/70">{aiMessage}</div> : null}
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
                          OCR matched
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
