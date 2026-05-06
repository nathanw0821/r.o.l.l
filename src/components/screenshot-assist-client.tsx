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
import { Sparkles } from "lucide-react";
import { useBuilderBetaAccess, BuilderBetaGate } from "@/components/builder/builder-beta-gate";
import { InfoTooltip } from "@/components/ui/tooltip";

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
  autoSelectAi: true,
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
  const isAdmin = Boolean(session?.user?.id === process.env.NEXT_PUBLIC_ADMIN_ID);
  const { map: localProgress } = useLocalProgress(!session);
  const { commitEntries } = useProgressHistory();
  const [localRows, setLocalRows] = React.useState(rows);
  const [imageQueue, setImageQueue] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState(defaultDraft.query);
  const [tier, setTier] = React.useState<(typeof tierOptions)[number]>(defaultDraft.tier);
  const [category, setCategory] = React.useState(defaultDraft.category);
  const [lockedOnly, setLockedOnly] = React.useState(defaultDraft.lockedOnly);
  const [autoSelectAi, setAutoSelectAi] = React.useState(defaultDraft.autoSelectAi);
  const [selectedIds, setSelectedIds] = React.useState<string[]>(defaultDraft.selectedIds);
  const [ocrLang, setOcrLang] = React.useState(defaultDraft.ocrLang);
  const [showBetaGate, setShowBetaGate] = React.useState(false);
  const { hasAccess: hasBetaAccess, accept: acceptBeta } = useBuilderBetaAccess(isAdmin, "roll-scan-beta-accepted");

  const autoSelectAiRef = React.useRef(autoSelectAi);
  React.useEffect(() => {
    autoSelectAiRef.current = autoSelectAi;
  }, [autoSelectAi]);
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [aiSuggestedIds, setAiSuggestedIds] = React.useState<string[]>([]);
  const [aiReasonById, setAiReasonById] = React.useState<Record<string, string>>({});
  const [buildScanResult, setBuildScanResult] = React.useState<{
    armorType: string | null;
    special: Record<string, number>;
    legendaryMods: string[];
    legendaryPerks: string[];
  } | null>(null);
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
        const dataUrl = canvas.toDataURL();
        setImageQueue(prev => [...prev, dataUrl]);
        setMessage("Image added to queue from clipboard.");
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  async function requestTesseractAnalysis() {
    if (imageQueue.length === 0 || !processorRef.current) {
      setAiMessage("Add at least one screenshot first.");
      return;
    }

    setOcrPending(true);
    setAiMessage(null);
    setBuildScanResult(null);

    try {
      const allSuggestedIds = new Set<string>();
      const allReasons: Record<string, string> = {};
      let totalMatches = 0;

      if (preset === "build") {
        const buildAcc = {
          armorType: null as string | null,
          special: {} as Record<string, number>,
          legendaryMods: [] as string[],
          legendaryPerks: [] as string[]
        };

        for (const imageDataUrl of imageQueue) {
          const img = new Image();
          img.src = imageDataUrl;
          await new Promise((resolve) => (img.onload = resolve));

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.drawImage(img, 0, 0);

          const res = await processorRef.current.extractBuildData(canvas, ocrLang);
          if (res.armorType) buildAcc.armorType = res.armorType;
          Object.assign(buildAcc.special, res.special);
          res.legendaryMods.forEach(m => { if (!buildAcc.legendaryMods.includes(m)) buildAcc.legendaryMods.push(m); });
          res.legendaryPerks.forEach(p => { if (!buildAcc.legendaryPerks.includes(p)) buildAcc.legendaryPerks.push(p); });
        }
        
        setBuildScanResult(buildAcc);
        
        // Also map mods to registry IDs if possible for the checklist below
        for (const modName of buildAcc.legendaryMods) {
          const matchingRows = localRows.filter(r => r.effect.name === modName);
          for (const row of matchingRows) {
            allSuggestedIds.add(row.id);
            allReasons[row.id] = "Detected in build scan";
            totalMatches++;
          }
        }
      } else {
        for (const imageDataUrl of imageQueue) {
          const img = new Image();
          img.src = imageDataUrl;
          await new Promise((resolve) => (img.onload = resolve));

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          ctx.drawImage(img, 0, 0);
          
          const matches = await processorRef.current.extractLegendaryMods(canvas, ocrLang);
          
          for (const match of matches) {
            const matchingRows = localRows.filter(r => r.effect.name === match);
            for (const row of matchingRows) {
              allSuggestedIds.add(row.id);
              allReasons[row.id] = "Matched by S.C.A.N. OCR";
              totalMatches++;
            }
          }
        }
      }
      
      const suggestedIdsArray = Array.from(allSuggestedIds);
      setAiSuggestedIds(suggestedIdsArray);
      setAiReasonById(allReasons);
      
      if (autoSelectAiRef.current) {
        setSelectedIds((current) => Array.from(new Set([...current, ...suggestedIdsArray])));
      }
      
      setAiMessage(totalMatches > 0 
        ? `${totalMatches} matches found across ${imageQueue.length} screenshots.` 
        : "No legendary mods recognized. Try clearer images.");
        
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
      // Cleanup happens automatically for dataURLs when state clears or window unloads, 
      // but for completeness we'll leave this hook if we use ObjectURLs later.
    };
  }, []);

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
      const entry = localProgress[row.id];
      if (entry === undefined) return row;
      return {
        ...row,
        unlocked: entry.unlocked,
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
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await readFileAsDataUrl(files[i]);
        newImages.push(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
    setImageQueue(prev => [...prev, ...newImages]);
    setMessage(`${newImages.length} images added to queue.`);
    event.target.value = ""; // Reset input
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
    setImageQueue([]);
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

  function syncToBuilder() {
    if (!buildScanResult) return;
    
    const saved = typeof window !== "undefined" ? localStorage.getItem("roll-builder-payload") : null;
    const payload = saved ? JSON.parse(saved) : {
      version: 5,
      basePieceId: "armor-set-secret-service",
      equipmentKind: "armor",
      weaponSub: null,
      legendaryModIds: [null, null, null, null],
      armorLegendaryModIds: Array(5).fill(Array(4).fill(null)),
      armorPieceCrafting: [],
      powerArmorHelmetId: null,
      powerArmorHelmetCrafting: {},
      powerArmorPiecesEquipped: [true, true, true, true, true, true],
      ghoul: false,
      underarmor: { shellId: "casual", liningId: "none", styleId: "none" },
      mutationIds: [],
      ignoreMutationPenalties: false,
      baseSpecial: {},
      legendaryPerkIds: [],
    };
    
    if (buildScanResult.armorType) {
      payload.basePieceId = buildScanResult.armorType;
      payload.equipmentKind = "armor"; // Assume armor set for now if type detected
    }
    
    if (Object.keys(buildScanResult.special).length > 0) {
      payload.baseSpecial = { ...payload.baseSpecial, ...buildScanResult.special };
    }
    
    if (buildScanResult.legendaryPerks.length > 0) {
      payload.legendaryPerkIds = Array.from(new Set([...(payload.legendaryPerkIds || []), ...buildScanResult.legendaryPerks]));
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem("roll-builder-payload", JSON.stringify(payload));
      setMessage("Build data synced! head to B.U.I.L.D. to view.");
    }
  }


  const isWindow = mode === "window";
  const aiSuggestionSet = React.useMemo(() => new Set(aiSuggestedIds), [aiSuggestedIds]);
  const presetContent = assistPresetContent[preset];

  if (!hasBetaAccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-panel/30 p-12 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-accent/40" />
        <h2 className="text-xl font-bold uppercase tracking-tight">S.C.A.N. Beta</h2>
        <p className="mt-2 max-w-md text-foreground/60 text-sm">
          Screen Capture & Analysis Network. Synchronize your learned mods directly from in-game screenshots using local-first OCR.
        </p>
        <Button onClick={() => setShowBetaGate(true)} className="mt-8">
          Access Beta Features
        </Button>
        <BuilderBetaGate 
          open={showBetaGate} 
          title="Access S.C.A.N. Beta"
          description="S.C.A.N. (Screen Capture & Analysis Network) uses local Tesseract OCR to read your legendary crafting bench. This feature is in active development."
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
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">1. Screenshots ({imageQueue.length})</div>
            {imageQueue.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setImageQueue([])}
                className="h-7 text-[10px] uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="mt-1 text-xs text-foreground/60">Paste (Ctrl+V) multiple or upload a batch of screenshots.</div>
          
          {imageQueue.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {imageQueue.map((url, idx) => (
                <div key={idx} className="group relative h-16 w-16 overflow-hidden rounded border border-border bg-background/50">
                  <img src={url} alt={`Queue ${idx}`} className="h-full w-full object-cover" />
                  <button 
                    onClick={() => setImageQueue(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <span className="text-[10px] font-bold text-destructive">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <Input 
            type="file" 
            multiple 
            accept="image/png,image/jpeg,image/webp" 
            onChange={handleFileChange} 
            className="mt-4" 
          />
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">2. Shortlist</div>
            <InfoTooltip content="Filter the effects you want to find or verify. Use 'Locked only' to avoid seeing things you already know." />
          </div>
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
        <div className={cn("rounded-[var(--radius)] border p-4", preset === "build" ? "border-accent/40 bg-accent/5" : "border-border bg-panel")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">3. {preset === "build" ? "Build Analysis" : "Scan & recognize"}</div>
                <InfoTooltip content={preset === "build" ? "Scans for armor sets, SPECIAL stats, and legendary perks to import into the sandbox." : "Uses Tesseract.js (runs locally in your browser) to extract text from your screenshots and match them against the game's legendary mods."} />
              </div>
              <div className="mt-1 text-xs text-foreground/60">{preset === "build" ? "Character-state OCR discovery." : "Local-first OCR analysis."}</div>
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
              <Button type="button" variant={preset === "build" ? "default" : "outline"} size="sm" onClick={requestTesseractAnalysis} disabled={ocrPending || imageQueue.length === 0}>
                {ocrPending ? "Scanning..." : (preset === "build" ? "Full Build Analysis" : "Run Tesseract Scan")}
              </Button>
              {preset !== "build" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyAiSuggestions}
                  disabled={aiSuggestedIds.length === 0}
                >
                  Use Matches ({aiSuggestedIds.length})
                </Button>
              )}
            </div>
            {preset !== "build" && (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80 hover:text-foreground">
                <input
                  type="checkbox"
                  checked={autoSelectAi}
                  onChange={(event) => setAutoSelectAi(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                Auto-select OCR matches
              </label>
            )}
          </div>
          {aiMessage ? <div className="mt-3 text-xs text-foreground/70">{aiMessage}</div> : null}

          {preset === "build" && buildScanResult && (
            <div className="mt-4 space-y-4 rounded-lg border border-border/40 bg-background/40 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Armor Type</div>
                  <div className="mt-1 text-sm font-bold text-accent">
                    {buildScanResult.armorType ? buildScanResult.armorType.replace("armor-set-", "").replace("-", " ").toUpperCase() : "Not detected"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">SPECIAL Allocation</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(buildScanResult.special).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-black text-accent">
                        {k.toUpperCase()} {v}
                      </span>
                    ))}
                    {Object.keys(buildScanResult.special).length === 0 && <span className="text-xs text-foreground/40 italic">No SPECIAL found</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Legendary Perks Detected</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {buildScanResult.legendaryPerks.map(p => (
                      <span key={p} className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                        {p.replace("legendary-", "").replace("-", " ")}
                      </span>
                    ))}
                    {buildScanResult.legendaryPerks.length === 0 && <span className="text-xs text-foreground/40 italic">No legendary perks found</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Legendary Mods (Scanned)</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {buildScanResult.legendaryMods.map(m => (
                      <span key={m} className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                        {m}
                      </span>
                    ))}
                    {buildScanResult.legendaryMods.length === 0 && <span className="text-xs text-foreground/40 italic">No mods found</span>}
                  </div>
                </div>
              </div>
              <Button 
                onClick={syncToBuilder}
                className="w-full gap-2 bg-accent font-bold text-accent-foreground hover:bg-accent/90"
              >
                <Sparkles className="h-4 w-4" />
                Sync Detected Elements to Builder
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">4. Confirm & save</div>
                <InfoTooltip content="Review the matches found. Ticked items will be marked as 'Unlocked' in your permanent registry when you click Save." />
              </div>
              <div className="mt-1 text-xs text-foreground/60">Finalize your discoveries.</div>
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
        <div className="text-sm font-semibold">Queue Preview</div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius)] border border-border bg-background/40">
          {imageQueue.length > 0 ? (
            <div className="flex flex-col gap-4 p-2">
              {imageQueue.map((url, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] text-foreground/40 uppercase font-medium">Screenshot #{idx + 1}</div>
                  <img src={url} alt={`Screenshot ${idx + 1}`} className="h-auto w-full rounded border border-border/50 object-contain" />
                </div>
              ))}
            </div>
          ) : (
            <div className={cn("flex items-center justify-center px-4 text-center text-sm text-foreground/50", isWindow ? "min-h-[220px]" : "min-h-[320px]")}>
              Queue is empty. Paste screenshots to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
