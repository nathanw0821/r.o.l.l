import { cn } from "@/lib/utils";

export default function ProgressToggle({
  unlocked,
  onToggle,
  disabled = false,
  className,
  ariaLabel,
  labels
}: {
  unlocked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  /** Names the toggle when the visible "Unlocked / Locked" text alone would be ambiguous (one toggle per row). */
  ariaLabel?: string;
  /** Visible wording; the tracker's "Unlocked / Locked" by default. */
  labels?: { on: string; off: string };
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={unlocked}
      data-status={unlocked ? "unlocked" : "locked"}
      className={cn(
        "status-button rounded-[var(--radius)] border px-3 py-1.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none",
        unlocked 
          ? "bg-emerald-500/20 border-emerald-500/80 text-emerald-400 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
          : "bg-background/40 border-border/60 text-foreground/60 hover:border-border hover:bg-background/60",
        className
      )}
    >
      <span className={cn("inline-block h-2 w-2 rounded-full", unlocked ? "bg-emerald-400 animate-pulse" : "bg-foreground/30")} />
      {unlocked ? (labels?.on ?? "✓ Unlocked") : (labels?.off ?? "Locked")}
    </button>
  );
}
