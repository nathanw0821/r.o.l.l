import { BUILDER_SPECIAL_KEYS, BUILDER_SPECIAL_LABELS } from "@/lib/builder/compatibility";
import { cn } from "@/lib/utils";

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

/** Legend for Live totals / shared loadout stat abbreviations. */
export default function BuilderTotalsStatKey({
  className,
  mode = "default"
}: {
  className?: string;
  mode?: BuilderTotalsStatKeyMode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border/70 bg-background/40 px-2.5 py-2 text-[11px] leading-snug text-foreground/68",
        className
      )}
    >
      <div className="font-semibold text-foreground/80">Stat key</div>
      <p className="mt-1 text-foreground/58">
        Live totals rows read <span className="font-medium text-foreground/72">equipped</span>, then optional{" "}
        <span className="font-medium text-foreground/72">(+delta)</span> from underarmor / mutations / N&amp;D, then{" "}
        <span className="font-medium text-foreground/72">= total</span> (single number when there is no overlay).
      </p>
      {mode === "weapon" ? (
        <p className="mt-1 text-foreground/58">
          Weapon view: damage and utility first; DR/ER/… usually come from underarmor, mutations, or N&amp;D import — not
          the gun&apos;s star row.
        </p>
      ) : null}
      {mode === "powerArmor" ? (
        <p className="mt-1 text-foreground/58">
          Power armor view: chassis + piece flat resists first, then PA-only % DR/RR, then shared layers (underarmor,
          mutations, perks).
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
  );
}
