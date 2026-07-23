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
import { Sparkles, Terminal, Upload, CheckCircle2, Sparkle, Trash2, Shield } from "lucide-react";
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

const SPECIAL_FULL_NAMES: Record<string, string> = {
  str: "Strength",
  per: "Perception",
  end: "Endurance",
  cha: "Charisma",
  int: "Intelligence",
  agi: "Agility",
  lck: "Luck"
};
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
    <div className={cn("space-y-6", isWindow ? "space-y-4" : "grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]")}>
      <style>{`
        @keyframes scan-sweep {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(220%); }
          100% { transform: translateY(-100%); }
        }
        @keyframes crt-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.28; }
        }
        @keyframes scanline-flicker {
          0% { opacity: 0.28; }
          50% { opacity: 0.32; }
          100% { opacity: 0.29; }
        }
        .pip-terminal-panel {
          border: 1px solid var(--hub-panel-border);
          background: var(--hub-panel-bg-strong);
          box-shadow: inset 0 0 16px color-mix(in srgb, var(--color-accent) 6%, transparent), var(--shadow-panel);
          position: relative;
          overflow: hidden;
        }
        .pip-terminal-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            180deg,
            var(--shell-scanline) 0px,
            var(--shell-scanline) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.25;
          z-index: 10;
        }
      `}</style>

      {/* Main Left Controller Area */}
      <div className="space-y-4">
        {/* CRT Banner Title */}
        <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 font-mono text-[0.84rem] uppercase tracking-widest text-accent shadow-sm">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 animate-pulse text-accent" />
            <span>S.C.A.N. // SCREEN CAPTURE & ANALYSIS NETWORK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[0.78rem] text-accent/70">DIAGNOSTIC STATE: OK</span>
          </div>
        </div>

        {/* Preset Tab Switcher */}
        <div className="pip-terminal-panel rounded-[var(--radius)] p-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <div className="text-sm font-semibold tracking-wide text-foreground/90 uppercase font-mono">{presetContent.label}</div>
              <div className="mt-0.5 text-xs text-foreground/50">{presetContent.checklistHint}</div>
            </div>
            <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[0.72rem] uppercase tracking-wider text-accent border border-accent/25">
              MODE: {preset.toUpperCase()}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ASSIST_PRESETS.map((value) => {
              const option = assistPresetContent[value];
              const isActive = preset === value;
              return (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setPreset(value)}
                  className={cn(
                    "font-mono uppercase text-xs tracking-wider transition-all duration-200",
                    isActive 
                      ? "bg-accent text-accent-foreground shadow-[0_0_12px_rgba(var(--color-accent),0.3)]" 
                      : "border-border/60 text-foreground/70 hover:border-accent/55 hover:text-accent"
                  )}
                >
                  {option.shortLabel}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 1. Holographic Image Drop Zone / Clipboard */}
        <div className="pip-terminal-panel rounded-[var(--radius)] p-4 relative">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold uppercase font-mono text-foreground/90 tracking-wide flex items-center gap-2">
              <span className="text-accent">01.</span> Holographic Ingest Zone
            </div>
            {imageQueue.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setImageQueue([])}
                className="h-7 text-[0.78rem] uppercase font-mono tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                Eject All ({imageQueue.length})
              </Button>
            )}
          </div>
          
          {imageQueue.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-background/20 p-8 text-center transition-colors hover:border-accent/40 group relative overflow-hidden">
              <Upload className="mb-3 h-10 w-10 text-foreground/30 group-hover:text-accent group-hover:scale-105 transition-all duration-300" />
              <div className="font-mono text-xs uppercase text-foreground/75 tracking-wide">
                Paste Clipboard Image <kbd className="bg-background/80 px-1 py-0.5 rounded border border-border text-[0.78rem] ml-1">Ctrl + V</kbd>
              </div>
              <p className="mt-1 max-w-[280px] text-[0.78rem] text-foreground/45">
                Drop your Fallout 76 screenshots or inventory snips here directly.
              </p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/10 to-transparent group-hover:via-accent/30 transition-all duration-500" />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2.5 max-h-[144px] overflow-y-auto pr-1">
              {imageQueue.map((url, idx) => (
                <div key={idx} className="group relative h-16 w-16 overflow-hidden rounded border border-border bg-background/50 cursor-pointer shadow-sm hover:border-accent transition-all duration-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Queue ${idx}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[0.72rem] font-bold uppercase tracking-wider text-destructive flex items-center gap-1" onClick={() => setImageQueue(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-3 w-3" /> Remove
                    </span>
                  </div>
                  <span className="absolute bottom-0 right-0 bg-accent px-1 text-[0.84rem] font-bold text-accent-foreground font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Input 
              type="file" 
              multiple 
              accept="image/png,image/jpeg,image/webp" 
              onChange={handleFileChange} 
              className="bg-background/40 hover:border-accent/40 font-mono text-xs tracking-wide cursor-pointer transition-colors" 
            />
          </div>
        </div>

        {/* 2. Shortlist Filter Deck */}
        <div className="pip-terminal-panel rounded-[var(--radius)] p-4">
          <div className="text-sm font-semibold uppercase font-mono text-foreground/90 tracking-wide flex items-center gap-2">
            <span className="text-accent">02.</span> Shortlist Target Index
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-[0.78rem] font-mono uppercase tracking-wider text-foreground/50 block">
              Search Target String
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Effect (e.g. Unyielding) or Category"
                className="mt-1.5 font-mono text-xs tracking-wide bg-background/40 hover:border-accent/40 focus:border-accent transition-colors"
              />
            </label>
            <label className="text-[0.78rem] font-mono uppercase tracking-wider text-foreground/50 block">
              Legendary Tier
              <select
                value={tier}
                onChange={(event) => setTier(event.target.value as (typeof tierOptions)[number])}
                className="mt-1.5 h-10 w-full rounded-[var(--radius)] border border-border bg-background/40 px-3 text-xs font-mono tracking-wide focus:outline-none focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
              >
                {tierOptions.map((option) => (
                  <option key={option} value={option} className="bg-panel text-foreground">
                    {option === "all" ? "All Tiers (1* - 4*)" : `${option} Selection`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[0.78rem] font-mono uppercase tracking-wider text-foreground/50 block">
              Gear Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-[var(--radius)] border border-border bg-background/40 px-3 text-xs font-mono tracking-wide focus:outline-none focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option} className="bg-panel text-foreground">
                    {option === "all" ? "All Categories" : `${option.toUpperCase()} GEAR`}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2.5 self-end rounded-[var(--radius)] border border-border bg-background/20 px-3 py-2.5 text-xs text-foreground/80 hover:text-accent font-mono cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                checked={lockedOnly}
                onChange={(event) => setLockedOnly(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)] border-border/80 rounded bg-background/40"
              />
              Filter: Locked Recipes Only
            </label>
          </div>
        </div>

        {/* 3. Scan & Analyze Core */}
        <div className={cn("pip-terminal-panel rounded-[var(--radius)] p-4 border transition-all duration-300", preset === "build" ? "border-accent/40 bg-accent/5" : "border-border")}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-2.5">
            <div>
              <div className="text-sm font-semibold uppercase font-mono text-foreground/90 tracking-wide flex items-center gap-2">
                <span className="text-accent">03.</span> {preset === "build" ? "Holographic Build Diagnostic" : "Tesseract Scan Engine"}
              </div>
              <div className="mt-0.5 text-xs text-foreground/50">{preset === "build" ? "Resolving full SPECIAL & legendary stat arrays." : "Local-first OCR character recognition."}</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[0.72rem] font-mono uppercase tracking-wider text-foreground/40">OCR Language</label>
                <select 
                  value={ocrLang}
                  onChange={(e) => setOcrLang(e.target.value)}
                  className="rounded border border-border bg-background/60 px-2.5 py-1 text-xs font-mono tracking-wide focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                >
                  {langOptions.map(opt => (
                    <option key={opt.code} value={opt.code} className="bg-panel text-foreground">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 font-mono text-[0.78rem] text-accent tracking-wide uppercase">
                Shortlist Pool: {filteredRows.length}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5">
              <Button 
                type="button" 
                variant={preset === "build" ? "default" : "outline"} 
                size="sm" 
                onClick={requestTesseractAnalysis} 
                disabled={ocrPending || imageQueue.length === 0}
                className={cn(
                  "font-mono uppercase text-xs tracking-wider transition-all duration-200",
                  (ocrPending || imageQueue.length === 0)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_14px_rgba(var(--color-accent),0.25)]"
                )}
              >
                {ocrPending ? "SCANNING..." : (preset === "build" ? "Analyze Build Specs" : "Engage OCR Scanner")}
              </Button>
              {preset !== "build" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyAiSuggestions}
                  disabled={aiSuggestedIds.length === 0}
                  className="font-mono uppercase text-xs tracking-wider hover:border-accent hover:text-accent"
                >
                  Load Matches ({aiSuggestedIds.length})
                </Button>
              )}
            </div>
            {preset !== "build" && (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-mono text-foreground/80 hover:text-accent transition-colors select-none">
                <input
                  type="checkbox"
                  checked={autoSelectAi}
                  onChange={(event) => setAutoSelectAi(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--accent)] border-border/80 rounded"
                />
                Auto-Select matches
              </label>
            )}
          </div>

          {/* Telemetry Output Logs */}
          <div className="mt-4 rounded-md border border-accent/20 bg-black/75 p-3.5 font-mono text-[0.84rem] text-accent/85 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>&gt; S.C.A.N. NETWORK INITIALIZED // CLIENT_OCR_STANDBY</span>
            </div>
            {ocrPending && (
              <div className="text-accent/60 leading-relaxed pl-3.5">
                <div>&gt; [TESSERACT.JS]: SPUN UP BROWSER worker_process.node</div>
                <div className="animate-pulse">&gt; [PIPELINE]: APPLIED ADAPTIVE INTEGRAL IMAGE SWEEPS...</div>
                <div className="text-accent font-bold animate-pulse">&gt; [ANALYSIS]: DETECTING LEGENDARY MOD COGNITION...</div>
              </div>
            )}
            {aiMessage && (
              <div className="text-accent font-bold pl-3.5 border-l border-accent/25 mt-1.5">
                &gt; ANALYSIS COMPLETE: {aiMessage}
              </div>
            )}
            {!ocrPending && !aiMessage && (
              <div className="text-foreground/40 pl-3.5 italic">&gt; waiting for image_payload.img ingest...</div>
            )}
          </div>

          {preset === "build" && buildScanResult && (
            <div className="mt-4 space-y-4 rounded-lg border border-accent/20 bg-accent/5 p-4 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-accent/[0.02] to-transparent" />
              <div className="grid gap-4 sm:grid-cols-2 relative z-10 font-mono text-xs">
                <div>
                  <div className="text-[0.78rem] font-bold uppercase tracking-wider text-foreground/45">Armor Class Specs</div>
                  <div className="mt-1 text-sm font-black text-accent tracking-wide flex items-center gap-1.5">
                    <Shield className="h-4 w-4 shrink-0" />
                    {buildScanResult.armorType ? buildScanResult.armorType.replace("armor-set-", "").replace("-", " ").toUpperCase() : "NOT RECOGNIZED"}
                  </div>
                </div>
                <div>
                  <div className="text-[0.78rem] font-bold uppercase tracking-wider text-foreground/45">SPECIAL Core Stats</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Object.entries(buildScanResult.special).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center rounded bg-accent/20 px-2 py-0.5 text-[0.72rem] font-black text-accent border border-accent/30 tabular-nums cursor-help" title={SPECIAL_FULL_NAMES[k.toLowerCase()] || k.toUpperCase()}>
                        {k.toUpperCase()} {v}
                      </span>
                    ))}
                    {Object.keys(buildScanResult.special).length === 0 && <span className="text-foreground/40 italic">Null state</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[0.78rem] font-bold uppercase tracking-wider text-foreground/45">Active Legendary Perks</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {buildScanResult.legendaryPerks.map(p => (
                      <span key={p} className="inline-flex items-center rounded bg-blue-500/15 px-2.5 py-0.5 text-[0.72rem] font-bold text-blue-300 border border-blue-400/20 uppercase tracking-wide">
                        {p.replace("legendary-", "").replace("-", " ")}
                      </span>
                    ))}
                    {buildScanResult.legendaryPerks.length === 0 && <span className="text-foreground/40 italic">Null state</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[0.78rem] font-bold uppercase tracking-wider text-foreground/45">Detected Bench Modifications ({buildScanResult.legendaryMods.length})</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {buildScanResult.legendaryMods.map(m => (
                      <span key={m} className="inline-flex items-center rounded bg-background/50 px-2.5 py-0.5 text-[0.72rem] font-medium text-foreground/80 border border-border/40">
                        {m}
                      </span>
                    ))}
                    {buildScanResult.legendaryMods.length === 0 && <span className="text-foreground/40 italic">Null state</span>}
                  </div>
                </div>
              </div>
              <Button 
                onClick={syncToBuilder}
                className="w-full gap-2 bg-accent font-mono font-bold text-xs uppercase tracking-wider text-accent-foreground hover:bg-accent/90 shadow-[0_0_14px_rgba(var(--color-accent),0.2)]"
              >
                <Sparkles className="h-4 w-4" />
                Inject Specs into B.U.I.L.D. Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Right Queue/Checklist View */}
      <div className="space-y-4">
        {/* Screenshot Diagnostics Monitor Console */}
        <div className={cn("pip-terminal-panel rounded-[var(--radius)] p-4", !isWindow && "lg:sticky lg:top-24 lg:self-start")}>
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="text-sm font-semibold uppercase font-mono text-foreground/90 tracking-wide flex items-center gap-2">
              <span className="text-accent">04.</span> Optical Stream Preview
            </div>
            {imageQueue.length > 0 && (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[0.72rem] text-accent font-bold uppercase border border-accent/20 tracking-wider">
                Active Feed
              </span>
            )}
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background/25 shadow-inner relative min-h-[220px] flex flex-col items-center justify-center">
            {imageQueue.length > 0 ? (
              <div className="flex flex-col gap-4 p-3 w-full max-h-[380px] overflow-y-auto">
                {imageQueue.map((url, idx) => (
                  <div key={idx} className="space-y-1 bg-black/40 p-2 rounded border border-border/30 relative group">
                    <div className="flex justify-between items-center text-[0.84rem] font-mono text-foreground/40 uppercase tracking-widest">
                      <span>FEED_STREAM_0{idx + 1}.img</span>
                      <span>{ocrPending ? "INGESTING_OCR..." : "STREAM_LOCKED"}</span>
                    </div>
                    <div className="relative overflow-hidden rounded border border-border/50 bg-background/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Screenshot ${idx + 1}`} className="h-auto w-full object-contain" />
                      {/* Interactive laser scanner sweep bar */}
                      {ocrPending && (
                        <>
                          <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                          <div className="absolute left-0 right-0 h-0.5 bg-accent/80 shadow-[0_0_12px_var(--color-accent)] animate-[scan-sweep_2s_infinite] pointer-events-none" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 text-center">
                <Terminal className="h-8 w-8 text-foreground/20 mb-2" />
                <div className="font-mono text-xs uppercase text-foreground/40 tracking-wider">Visual feed stream empty</div>
                <div className="text-[0.78rem] text-foreground/30 mt-0.5 font-mono">&gt; waiting_for_screenshot_sync.img</div>
              </div>
            )}
          </div>

          {/* S.C.A.N. Match Log & Confirm Save */}
          <div className="mt-4 border-t border-border/40 pt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase font-mono text-foreground/90 tracking-wide flex items-center gap-2">
                  <span className="text-accent">05.</span> Matching Diagnostics
                </div>
                <div className="mt-0.5 text-xs text-foreground/50 font-mono">Verify target matches and save unlocks.</div>
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[0.78rem]">
                <Button type="button" variant="outline" size="sm" onClick={selectVisible} className="h-8 px-2.5 text-[0.78rem] uppercase font-mono hover:text-accent hover:border-accent">
                  Select Visible
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIds([])} className="h-8 px-2.5 text-[0.78rem] uppercase font-mono hover:text-destructive hover:border-destructive">
                  Clear
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearDraft} className="h-8 px-2.5 text-[0.78rem] uppercase font-mono hover:text-foreground">
                  Reset
                </Button>
                <Button type="button" size="sm" onClick={saveConfirmed} disabled={pending || selectedIds.length === 0} className="h-8 px-3 text-[0.78rem] uppercase font-mono bg-accent text-accent-foreground font-bold shadow-[0_0_12px_rgba(var(--color-accent),0.2)]">
                  {pending ? "SAVING..." : `COMMIT UNLOCKS (${selectedIds.length})`}
                </Button>
              </div>
            </div>

            {/* Glowing match result list */}
            <div className={cn("space-y-2 overflow-y-auto pr-1 border border-border/40 rounded-lg p-2 bg-background/25 shadow-inner", isWindow ? "max-h-[220px]" : "max-h-[360px]")}>
              {filteredRows.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/60 p-4 text-center font-mono text-xs text-foreground/40 uppercase">
                  No matches align with selected shortlist matrix
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
                      "flex items-start gap-3 rounded-[var(--radius)] border px-3 py-3 text-xs font-mono transition-all duration-200 cursor-pointer select-none relative group overflow-hidden",
                      selected
                        ? "border-accent bg-accent/10 shadow-[0_0_12px_rgba(var(--color-accent),0.06)]"
                        : aiSuggested
                          ? "border-accent/40 bg-accent/[0.03] hover:border-accent/75"
                          : "border-border/65 bg-background/30 hover:border-border-strong hover:bg-background/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelection(row.id)}
                      className="mt-0.5 h-4 w-4 accent-[var(--accent)] border-border/80 rounded bg-background/40 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span className={cn(selected ? "text-accent" : "text-foreground/95")}>{row.effect.name}</span>
                        {aiSuggested && (
                          <span className="shrink-0 flex items-center gap-1 rounded bg-accent/20 px-1.5 py-0.5 text-[0.84rem] font-black uppercase text-accent tracking-wider border border-accent/35 animate-pulse">
                            <Sparkle className="h-2 w-2" /> Match
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[0.78rem] text-foreground/45 flex items-center gap-1.5">
                        <span className="font-semibold text-accent/80 uppercase">{row.tier?.label ?? "unknown*"}</span>
                        <span>|</span>
                        <span className="uppercase">{categories || "misc gear"}</span>
                      </div>
                      {aiSuggested && aiReasonById[row.id] && (
                        <div className="mt-1.5 border-t border-accent/15 pt-1 text-[0.72rem] text-accent/85 leading-snug italic font-sans">
                          {aiReasonById[row.id]}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {message ? (
              <div className="rounded-md border border-accent/20 bg-accent/5 p-3.5 font-mono text-[0.84rem] text-accent uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            ) : null}

            <div className="font-mono text-[0.72rem] text-foreground/40 uppercase tracking-widest leading-normal text-center">
              registry cache: local draft + active session. DB commits persistant.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
