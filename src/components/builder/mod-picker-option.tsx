import * as React from "react";
import Link from "next/link";
import { Sparkle, Check } from "lucide-react";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderModDTO } from "@/lib/builder/types";
import type { LocalProgressMap } from "@/components/use-local-progress";
import { findLocalProgressEntry } from "@/lib/progress-lookup";
import { formatEffectMathDeltas, listExtraEffectMathEntries } from "@/lib/builder/compatibility";
import { sandboxLegendaryDescription } from "@/lib/builder/sandbox-mod-description";
import { isGhoulDiscouragedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import { isNewMod } from "@/lib/filter-utils";
import { cn } from "@/lib/utils";
import { trackerSearchHref } from "@/lib/links/cross-links";

function LegendaryModDetailFootprint({
  mod,
  piece = null,
  density = "default",
}: {
  mod: BuilderModDTO;
  piece?: BaseGearPiece | null;
  density?: "default" | "compact";
}) {
  const deltas = formatEffectMathDeltas(mod.effectMath);
  const extras = listExtraEffectMathEntries(mod.effectMath);
  const descRaw = mod.description?.trim() ?? "";
  const desc = sandboxLegendaryDescription(descRaw, piece) || descRaw;
  const modules =
    (typeof mod.craftingCost === "object" && mod.craftingCost !== null && "legendaryModules" in mod.craftingCost
      ? (mod.craftingCost.legendaryModules as number)
      : null) ??
    (mod.starRank === 4 ? 120 : mod.starRank === 3 ? 60 : mod.starRank === 2 ? 30 : 15);
  const catalyst =
    mod.extraComponent ||
    (typeof mod.craftingCost === "object" && mod.craftingCost !== null && "extraComponent" in mod.craftingCost
      ? (mod.craftingCost.extraComponent as string)
      : null) ||
    null;

  if (density === "compact") {
    return (
      <div className="mt-0.5 space-y-0.5 text-[0.76rem] leading-snug">
        {desc ? (
          <p className="text-foreground/90 font-sans">{desc}</p>
        ) : deltas ? (
          <p className="font-semibold text-accent/85 tabular-nums">{deltas}</p>
        ) : null}
        <div className="flex items-center gap-2 text-2xs text-foreground/50 font-mono">
          <span className="text-amber-400 font-semibold">{modules} Mod</span>
          {catalyst && <span>• {catalyst}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-1.5 bg-background/30 p-2 rounded border border-border/10">
      {desc ? (
        <p className="text-[0.78rem] leading-snug text-foreground/90 font-sans">
          {desc}
        </p>
      ) : null}
      {deltas ? (
        <div className="text-[0.76rem] leading-snug font-mono font-semibold text-accent/90 tabular-nums">
          {deltas}
        </div>
      ) : !desc ? (
        <div className="text-2xs text-foreground/45 italic font-mono">
          Active combat effect (see live telemetry).
        </div>
      ) : null}
      {extras.length > 0 ? (
        <div className="border-t border-border/10 pt-1">
          <div className="font-bold text-foreground/40 uppercase text-2xs tracking-tight">
            Extras
          </div>
          <ul className="list-disc pl-3 text-2xs text-foreground/50 space-y-0.5 font-mono">
            {extras.map((e) => (
              <li key={e.key}>
                <span className="text-accent/80">{e.key}</span>: {e.value}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/10 text-2xs font-mono">
        <span className="text-amber-400 font-bold">{modules} Modules</span>
        {catalyst ? (
          <span className="text-slate-400">
            • Catalyst: <span className="text-emerald-400/90 font-semibold">{catalyst}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

const ModPickerOption = React.memo(function ModPickerOption({
  mod,
  piece,
  compact,
  ghoulMode,
  isRecommended,
  localProgress,
  onPick,
}: {
  mod: BuilderModDTO;
  piece: BaseGearPiece;
  compact: boolean;
  ghoulMode: boolean;
  isRecommended?: boolean;
  localProgress?: LocalProgressMap;
  onPick: (id: string) => void;
}) {
  const entry = findLocalProgressEntry(localProgress, mod.id, mod.name, `${mod.starRank} Star`);
  const isUnlocked = entry?.unlocked ?? (mod.trackerUnlock === "unlocked");
  const modCount = entry?.modCount ?? 0;
  const isSeeking = entry?.isSeeking ?? false;

  const statusAttr = isUnlocked ? "unlocked" : modCount > 0 ? "stash" : "locked";
  const descDisplay =
    sandboxLegendaryDescription(mod.description, piece) ||
    mod.description?.trim() ||
    "";
  const title = compact
    ? [mod.name, descDisplay, formatEffectMathDeltas(mod.effectMath)]
        .filter(Boolean)
        .join(" — ")
    : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        data-status={statusAttr}
        title={title}
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: compact ? "auto 48px" : "auto 96px",
        }}
        className={cn(
          "pip-terminal-panel flex w-full flex-col rounded-[var(--radius)] border text-left p-2.5 transition-all duration-150 cursor-pointer font-mono select-none overflow-hidden relative group",
          isUnlocked
            ? "border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-900/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            : modCount > 0
              ? "border-amber-500/50 bg-amber-950/20 hover:bg-amber-900/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              : "border-border/30 opacity-75 hover:opacity-100 hover:border-border/60 hover:bg-background/20",
          isRecommended && "ring-1 ring-accent/60",
        )}
        onClick={() => onPick(mod.id)}
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <span className="min-w-0 font-bold flex flex-wrap items-center gap-1.5 text-xs">
            <span 
              className={cn(
                "break-words font-black",
                isUnlocked ? "text-emerald-300" : modCount > 0 ? "text-amber-200" : "text-foreground"
              )}
              style={{ overflowWrap: "anywhere" }}
            >
              {mod.name}
            </span>
            {isNewMod(mod.name) && (
              <span className="rounded border border-accent/40 bg-accent/30 px-1.5 py-0.5 text-[0.78rem] uppercase tracking-wider text-accent font-black animate-pulse">
                New
              </span>
            )}
            {isRecommended && (
              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[0.84rem] uppercase tracking-wider text-accent font-black animate-pulse">
                <Sparkle className="h-2 w-2 inline mr-0.5" /> Recom.
              </span>
            )}
          </span>
          <div className="shrink-0 flex items-center gap-1.5 text-2xs font-mono">
            {isUnlocked ? (
              <span className="px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center gap-0.5 shadow-sm">
                <Check className="w-2.5 h-2.5" /> Unlocked
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded font-medium uppercase tracking-wider bg-rose-500/10 border border-rose-500/25 text-rose-400/80">
                🔒 Locked
              </span>
            )}
            {modCount > 0 && (
              <span className="px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm">
                📦 x{modCount} Stash
              </span>
            )}
            {isSeeking && (
              <span className="px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-cyan-500/20 border border-cyan-500/50 text-cyan-300">
                🎯 Seeking
              </span>
            )}
          </div>
        </div>
      
        <div className="mt-1 w-full">
          <LegendaryModDetailFootprint
            mod={mod}
            piece={piece}
            density={compact ? "compact" : "default"}
          />
        </div>
      
        {ghoulMode && isGhoulDiscouragedLegendarySlug(mod.slug) ? (
          <p className="mt-1.5 rounded border border-warning/30 bg-warning/5 px-2 py-0.5 text-[0.84rem] leading-tight text-warning/80 italic font-sans">
            Off-meta for typical Ghoul builds.
          </p>
        ) : null}
      </button>
      {/* Sibling of the pick button (a link cannot sit inside a button); opens the tracker searched to this mod. */}
      <Link
        href={trackerSearchHref(mod.name)}
        data-track-mod
        aria-label={`Track this mod: ${mod.name}`}
        className="absolute bottom-2 right-2.5 z-10 font-mono text-2xs text-foreground/55 underline decoration-border/60 underline-offset-2 hover:text-accent hover:decoration-accent"
      >
        Track this mod
      </Link>
    </div>
  );
});

export { LegendaryModDetailFootprint };
export default ModPickerOption;
