import { BUILDER_SPECIAL_KEYS, BUILDER_SPECIAL_LABELS } from "@/lib/builder/compatibility";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type BuilderTotalsStatKeyMode = "default" | "weapon" | "powerArmor";

const RESIST_LINES: { abbr: string; label: string }[] = [
  { abbr: "DR", label: "Damage resist" },
  { abbr: "ER", label: "Energy resist" },
  { abbr: "FR", label: "Fire resist" },
  { abbr: "CR", label: "Cryo resist" },
  { abbr: "PR", label: "Poison resist" },
  { abbr: "RR", label: "Radiation resist" }
];

const SPECIAL_EXPAND: Record<string, string> = {
  str: "Strength",
  per: "Perception",
  end: "Endurance",
  cha: "Charisma",
  int: "Intelligence",
  agi: "Agility",
  lck: "Luck"
};

/** Legend for Live totals / shared loadout stat abbreviations (collapsed by default). */
export default function BuilderTotalsStatKey({
  className,
  mode = "default"
}: {
  className?: string;
  mode?: BuilderTotalsStatKeyMode;
}) {
  return (
    <details
      className={cn(
        "group rounded-[var(--radius)] border border-border/70 bg-background/40 text-[11px] leading-snug text-foreground/68 open:border-border",
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2 font-semibold text-foreground/80 [&::-webkit-details-marker]:hidden">
        <span>Stat key</span>
        <ChevronDown
          className="size-3.5 shrink-0 text-foreground/45 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="space-y-1.5 border-t border-border/50 px-2.5 pb-2.5 pt-1.5">
      <p className="text-foreground/58">
        Live totals rows read <span className="font-medium text-foreground/72">piece + crafting (+ PA frame)</span>,
        then <span className="font-medium text-foreground/72">(+delta)</span> for legendary stars plus underarmor /
        mutations / N&amp;D, then <span className="font-medium text-foreground/72">= total</span>. One number means no
        (+…) contribution for that stat.
      </p>
      {mode === "weapon" ? (
        <p className="text-foreground/58">
          Weapon view: damage and utility first; the left column is usually 0 — star picks sit in{" "}
          <span className="font-medium text-foreground/70">(+…)</span> with underarmor, mutations, and N&amp;D.
        </p>
      ) : null}
      {mode === "powerArmor" ? (
        <p className="text-foreground/58">
          Power armor view: chassis + piece flat resists and crafting first (no stars), then PA-only % DR/RR, then other
          bonuses — star picks show inside <span className="font-medium text-foreground/70">(+…)</span> with underarmor,
          mutations, and N&amp;D.
        </p>
      ) : null}
      <ul className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
        {RESIST_LINES.map(({ abbr, label }) => (
          <li key={abbr}>
            <span className="font-mono font-medium text-foreground/85">{abbr}</span>
            <span className="text-foreground/50"> — </span>
            {label}
          </li>
        ))}
        <li>
          <span className="font-mono font-medium text-foreground/85">HP</span>
          <span className="text-foreground/50"> — </span>
          Hit points (modeled bonus)
        </li>
        <li>
          <span className="font-mono font-medium text-foreground/85">Damage %</span>
          <span className="text-foreground/50"> — </span>
          {mode === "weapon"
            ? "Weapon damage bonus from this base’s star picks (catalog effectMath)"
            : "Weapon damage (sandbox; mostly 0 on armor / PA bases)"}
        </li>
        {BUILDER_SPECIAL_KEYS.map((k) => (
          <li key={k}>
            <span className="font-mono font-medium text-foreground/85">{BUILDER_SPECIAL_LABELS[k]}</span>
            <span className="text-foreground/50"> — </span>
            {SPECIAL_EXPAND[k]}
          </li>
        ))}
        <li className="sm:col-span-2">
          <span className="font-medium text-foreground/85">SPECIAL (other)</span>
          <span className="text-foreground/50"> — </span>
          SPECIAL bonus not mapped to S.P.E.C.I.A.L. letters
        </li>
        <li>
          <span className="font-medium text-foreground/85">AP regen</span>
          <span className="text-foreground/50"> — </span>
          Action Point regeneration
        </li>
        <li>
          <span className="font-medium text-foreground/85">Carry wt</span>
          <span className="text-foreground/50"> — </span>
          Carry weight bonus
        </li>
        {mode === "powerArmor" ? (
          <>
            <li className="sm:col-span-2">
              <span className="font-medium text-foreground/85">PA inherent DR %</span>
              <span className="text-foreground/50"> — </span>
              Flat damage reduction from wearing PA pieces (not the same integer DR on parts)
            </li>
            <li className="sm:col-span-2">
              <span className="font-medium text-foreground/85">PA inherent rad red. %</span>
              <span className="text-foreground/50"> — </span>
              Radiation damage reduction from wearing PA pieces
            </li>
          </>
        ) : null}
      </ul>
      </div>
    </details>
  );
}
