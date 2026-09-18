import Link from "next/link";
import patchDeltas from "@/data/truth/patch-deltas.json";
import gameVersion from "@/data/truth/game-version.json";

type PatchChange = { area: string; text: string; href?: string };
type PatchEntry = { patch: number; name: string; released: string; changes: PatchChange[] };

/** "What changed" list for the live patch, read from the truth pack (no prose is hand-written here). */
export default function PatchChangesPanel({ limit }: { limit?: number }) {
  const entry = (patchDeltas.patches as PatchEntry[]).find((p) => p.patch === gameVersion.patch);
  if (!entry) return null;
  const changes = limit ? entry.changes.slice(0, limit) : entry.changes;
  return (
    <section
      aria-labelledby="patch-changes-heading"
      className="rounded-[var(--radius)] border border-border/40 bg-panel p-5 font-mono"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="patch-changes-heading" className="text-base font-bold text-foreground">
          What changed in Patch {entry.patch}, {entry.name}
        </h2>
        <span className="text-xs text-foreground/50">Released {entry.released}. Site data checked {gameVersion.verifiedAt}.</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-foreground/80">
        {changes.map((c) => (
          <li key={c.text} className="flex gap-3">
            <span className="w-32 shrink-0 text-foreground/50">{c.area}</span>
            <span>
              {c.text}
              {c.href ? (
                <>
                  {" "}
                  <Link href={c.href} className="text-accent hover:underline">
                    Open
                  </Link>
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
