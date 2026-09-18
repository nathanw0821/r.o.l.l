import Link from "next/link";
import { currentEventPhase } from "@/lib/season";

/** One quiet line while a seasonal event is running. Server-rendered; no motion. */
export default function SeasonBanner() {
  const phase = currentEventPhase();
  if (!phase) return null;
  const endText = new Date(`${phase.end}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <p className="rounded-[var(--radius)] border border-rose-900/50 bg-rose-950/20 px-4 py-2 text-sm font-mono text-foreground/80 season-banner">
      <span className="font-bold text-rose-300">{phase.event}</span>, week {phase.week}: {phase.title}
      {phase.note ? ` (${phase.note.toLowerCase()})` : ""}. Season {phase.seasonNumber}, {phase.seasonName}, runs until {endText}.{" "}
      <Link href="/overview/appearance" className="text-accent hover:underline">
        Seasonal look settings
      </Link>
    </p>
  );
}
