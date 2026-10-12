"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, CalendarPlus, ChevronRight, History } from "lucide-react";
import {
  CALENDAR_ENTRIES,
  CALENDAR_SOURCE,
  CALENDAR_TITLE,
  EVENT_KIND_LABEL,
  CALENDAR_YEAR,
  entryDays,
  entryStatus,
  entryWindowUtc,
  monthGrid,
  monthKeyFor,
  yearMonthKeys,
  type CalendarEntry,
  type CalendarGrid,
  type EntryStatus,
  type EventKind,
  type GridSegment,
} from "@/lib/events/calendar";
import { cn } from "@/lib/utils";

const KIND_CLASS: Record<EventKind, string> = {
  update: "border-sky-500/50 text-sky-300 bg-sky-500/10",
  double: "border-amber-500/50 text-amber-300 bg-amber-500/10",
  seasonal: "border-rose-500/50 text-rose-300 bg-rose-500/10",
  bonus: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
  limit: "border-violet-500/50 text-violet-300 bg-violet-500/10",
  community: "border-slate-500/50 text-slate-300 bg-slate-500/10",
};

/** Bar colours: the chip palette, with a stronger fill when the bar is the hovered one. */
const BAR_CLASS: Record<EventKind, { base: string; active: string }> = {
  update: { base: "border-sky-500/50 bg-sky-500/15 text-sky-200", active: "border-sky-300 bg-sky-500/40 text-white" },
  double: { base: "border-amber-500/50 bg-amber-500/15 text-amber-200", active: "border-amber-300 bg-amber-500/40 text-white" },
  seasonal: { base: "border-rose-500/50 bg-rose-500/15 text-rose-200", active: "border-rose-300 bg-rose-500/40 text-white" },
  bonus: { base: "border-emerald-500/50 bg-emerald-500/15 text-emerald-200", active: "border-emerald-300 bg-emerald-500/40 text-white" },
  limit: { base: "border-violet-500/50 bg-violet-500/15 text-violet-200", active: "border-violet-300 bg-violet-500/40 text-white" },
  community: { base: "border-slate-500/50 bg-slate-500/15 text-slate-200", active: "border-slate-300 bg-slate-500/40 text-white" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CARD_ID = "calendar-event-card";
const CARD_WIDTH = 360;
const CARD_HEIGHT_GUESS = 240;

const ET_DATE = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", weekday: "short" });
const ET_TIME = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
const ET_DAY = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });

function etRange(entry: CalendarEntry): string {
  const { startUtc, endUtc } = entryWindowUtc(entry);
  const single = entry.start === entry.end;
  return single
    ? `${ET_DATE.format(startUtc)}, from ${ET_TIME.format(startUtc)}`
    : `${ET_DATE.format(startUtc)} to ${ET_DATE.format(endUtc)}, reset to reset (${ET_TIME.format(startUtc)})`;
}

/** ISO day of an instant in Eastern time, for the "today" mark. */
function etIsoDay(d: Date): string {
  const p = ET_DAY.formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** The viewer's own zone, known only in the browser (server and first paint show Eastern). */
function useViewerZone(): string | null {
  const [zone, setZone] = React.useState<string | null>(null);
  React.useEffect(() => {
    try {
      setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || null);
    } catch {
      setZone(null);
    }
  }, []);
  return zone;
}

/** Live clock, null until mounted so the first paint never disagrees with the server. */
function useNow(): Date | null {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function LocalRange({ entry, zone }: { entry: CalendarEntry; zone: string }) {
  const { startUtc, endUtc } = entryWindowUtc(entry);
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: zone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return (
    <p className="text-2xs text-dim">
      Your time ({zone.replace(/_/g, " ")}): {fmt.format(startUtc)} to {fmt.format(endUtc)}
    </p>
  );
}

function StatusChip({ status }: { status: EntryStatus }) {
  if (status === "active") {
    return (
      <span className="text-3xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 font-black">
        Live now
      </span>
    );
  }
  if (status === "past") {
    return <span className="text-3xs uppercase tracking-widest text-foreground/60">Ended</span>;
  }
  return <span className="text-3xs uppercase tracking-widest text-foreground/60">Upcoming</span>;
}

type ActiveCard = {
  id: string;
  /** Viewport box of the hovered bar; the card hangs below it, or above when there is no room. */
  left: number;
  top: number;
  bottom: number;
  width: number;
};

type HoverHandlers = {
  activeId: string | null;
  show: (id: string, el: HTMLElement) => void;
  hide: () => void;
};

function EventBar({ seg, monthKey, status, hover }: { seg: GridSegment; monthKey: string; status: EntryStatus | null; hover: HoverHandlers }) {
  const { entry } = seg;
  const active = hover.activeId === entry.id;
  const palette = BAR_CLASS[entry.kind];
  const anchorId = seg.first && entry.start.slice(0, 7) === monthKey ? entry.id : undefined;
  return (
    <button
      type="button"
      id={anchorId}
      aria-label={`${entry.name}: ${etRange(entry)}`}
      aria-describedby={active ? CARD_ID : undefined}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hover.show(entry.id, e.currentTarget);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hover.hide();
      }}
      onFocus={(e) => hover.show(entry.id, e.currentTarget)}
      onBlur={() => hover.hide()}
      onClick={(e) => hover.show(entry.id, e.currentTarget)}
      style={{ gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`, gridRow: seg.lane + 2 }}
      className={cn(
        "relative z-10 min-h-6 touch:min-h-8 mx-px px-1.5 text-left text-3xs font-bold truncate border rounded scroll-mt-28",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active ? palette.active : palette.base,
        active && "shadow-[0_0_0_1px_rgba(255,255,255,0.35)]",
        status === "past" && !active && "opacity-60",
        status === "active" && !active && "border-dashed",
        seg.continuesBefore && "rounded-l-none border-l-0 ml-0",
        seg.continuesAfter && "rounded-r-none border-r-0 mr-0",
      )}
    >
      {seg.continuesBefore ? <span aria-hidden="true" className="mr-0.5 opacity-70">‹</span> : null}
      {entry.name}
      {seg.continuesAfter ? <span aria-hidden="true" className="ml-0.5 opacity-70">›</span> : null}
    </button>
  );
}

function MonthGrid({ grid, now, hover, activeDays }: { grid: CalendarGrid; now: Date | null; hover: HoverHandlers; activeDays: Set<string> }) {
  const today = now ? etIsoDay(now) : null;
  return (
    <div className="space-y-px">
      <div className="grid grid-cols-7 text-3xs uppercase tracking-wider text-dim" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <div key={d} className={cn("px-1.5 py-1", d === "Tue" && "text-foreground/80")}>
            {d}
            {d === "Tue" ? <span className="ml-1 hidden sm:inline normal-case tracking-normal text-dim">reset</span> : null}
          </div>
        ))}
      </div>
      {grid.weeks.map((week) => (
        <div
          key={week.days[0]!.iso}
          className="grid gap-y-0.5 border-t border-border/20"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridTemplateRows: `1.5rem repeat(${week.laneCount}, auto)`, paddingBottom: week.laneCount ? "0.375rem" : "0.75rem" }}
        >
          {week.days.map((day, di) => {
            const lit = activeDays.has(day.iso);
            const isToday = day.iso === today;
            return (
              <div
                key={day.iso}
                style={{ gridColumn: di + 1, gridRow: "1 / -1" }}
                className={cn(
                  "border-r border-border/10 last:border-r-0 px-1 pt-0.5 transition-colors",
                  !day.inMonth && "bg-background/20",
                  lit && "bg-accent/10",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-2xs tabular-nums",
                    day.inMonth ? "text-foreground/80" : "text-dim",
                    day.tuesday && day.inMonth && "border border-border/40",
                    isToday && "bg-accent text-accent-foreground font-black",
                  )}
                  aria-label={isToday ? `${day.day}, today` : undefined}
                >
                  {day.day}
                </span>
              </div>
            );
          })}
          {week.segments.map((seg) => (
            <EventBar key={`${seg.entry.id}-${week.days[0]!.iso}`} seg={seg} monthKey={grid.key} status={now ? entryStatus(seg.entry, now) : null} hover={hover} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EventCard({ entry, card, now, zone }: { entry: CalendarEntry; card: ActiveCard; now: Date | null; zone: string | null }) {
  const vw = typeof window === "undefined" ? 1024 : window.innerWidth;
  const vh = typeof window === "undefined" ? 768 : window.innerHeight;
  const width = Math.min(CARD_WIDTH, vw - 16);
  const left = Math.max(8, Math.min(card.left, vw - width - 8));
  const above = card.bottom + CARD_HEIGHT_GUESS > vh && card.top > CARD_HEIGHT_GUESS;
  const status = now ? entryStatus(entry, now) : null;
  const showLocal = zone !== null && zone !== "America/New_York";
  return (
    <div
      id={CARD_ID}
      role="tooltip"
      style={{ position: "fixed", left, width, ...(above ? { bottom: vh - card.top + 6 } : { top: card.bottom + 6 }) }}
      className="z-50 rounded-lg border border-border/60 bg-panel p-3 space-y-1.5 shadow-xl shadow-black/40 font-mono"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("text-3xs uppercase tracking-wider px-1.5 py-0.5 rounded border", KIND_CLASS[entry.kind])}>{EVENT_KIND_LABEL[entry.kind]}</span>
        <span className="text-sm font-bold text-foreground">{entry.name}</span>
        {status ? <StatusChip status={status} /> : null}
      </div>
      <p className="text-2xs text-foreground/80">{etRange(entry)}</p>
      {showLocal && zone ? <LocalRange entry={entry} zone={zone} /> : null}
      <p className="text-prose text-foreground/80">{entry.note}</p>
      <p className="text-2xs">
        <Link href={`/wiki?q=${encodeURIComponent(entry.name)}`} className="text-accent underline underline-offset-2">
          Guides about {entry.name}
        </Link>
      </p>
    </div>
  );
}

function monthSummary(grid: CalendarGrid): string {
  const n = grid.entries.length;
  return n === 0 ? "no events recorded" : `${n} event${n === 1 ? "" : "s"}`;
}

export default function SeasonCalendar() {
  // Request-time clock for the month order (the page is rendered per request); the live clock
  // below drives the status chips and the "today" mark once the browser is in charge.
  const [requestNow] = React.useState(() => new Date());
  const now = useNow();
  const zone = useViewerZone();
  const currentKey = monthKeyFor(now ?? requestNow);

  const grids = React.useMemo(() => yearMonthKeys(CALENDAR_YEAR).map((key) => monthGrid(key, CALENDAR_ENTRIES)), []);
  const current = grids.filter((g) => g.key >= currentKey);
  const earlier = grids.filter((g) => g.key < currentKey);

  const [card, setCard] = React.useState<ActiveCard | null>(null);
  const activeEntry = card ? CALENDAR_ENTRIES.find((e) => e.id === card.id) ?? null : null;
  const activeDays = React.useMemo(() => new Set(activeEntry ? entryDays(activeEntry) : []), [activeEntry]);

  const place = React.useCallback((id: string, el: HTMLElement): ActiveCard => {
    const r = el.getBoundingClientRect();
    return { id, left: r.left, top: r.top, bottom: r.bottom, width: r.width };
  }, []);
  const hover: HoverHandlers = {
    activeId: card?.id ?? null,
    show: (id, el) => setCard(place(id, el)),
    hide: () => setCard(null),
  };

  // Escape closes the card; a tap or click anywhere else closes it too (touch has no hover-out).
  React.useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCard(null);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(`#${CARD_ID}`) || t?.closest("[aria-describedby]")) return;
      setCard(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [card]);

  const liveCount = now ? CALENDAR_ENTRIES.filter((e) => entryStatus(e, now) === "active").length : 0;

  return (
    <div className="space-y-6 font-mono">
      <header className="rounded-[var(--radius)] border border-border/40 bg-panel p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-3xs uppercase tracking-widest text-accent font-bold">Fallout 76 · community calendar</p>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-accent" aria-hidden="true" />
              {CALENDAR_TITLE}
            </h1>
            <p className="text-prose text-foreground/70 mt-1 max-w-3xl">
              Hover or tap an event bar for its exact start and end. Every event day runs from daily reset to daily reset, noon
              Eastern; once the page knows your zone it shows your local times as well.
              {now && liveCount > 0 ? ` ${liveCount} event${liveCount === 1 ? " is" : "s are"} live now.` : ""}
            </p>
          </div>
          <a
            href="/calendar.ics"
            className="inline-flex min-h-9 touch:min-h-11 items-center gap-1.5 rounded border border-accent/50 bg-accent/10 px-3 text-xs font-bold uppercase tracking-wider text-accent hover:bg-accent/20"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Subscribe (.ics)
          </a>
        </div>
        <ul className="flex flex-wrap gap-1.5 text-3xs uppercase tracking-wider" aria-label="Event types">
          {(Object.keys(EVENT_KIND_LABEL) as EventKind[]).map((k) => (
            <li key={k} className={cn("px-2 py-0.5 rounded border", KIND_CLASS[k])}>
              {EVENT_KIND_LABEL[k]}
            </li>
          ))}
        </ul>
      </header>

      {current.map((grid) => (
        <section key={grid.key} aria-labelledby={`month-${grid.key}`} className="rounded-[var(--radius)] border border-border/40 bg-panel p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id={`month-${grid.key}`} className="text-base font-bold text-foreground">
              {grid.label}
              {grid.key === currentKey ? <span className="ml-2 text-3xs uppercase tracking-widest text-accent">this month</span> : null}
            </h2>
            <p className="text-2xs text-dim">{monthSummary(grid)}</p>
          </div>
          <MonthGrid grid={grid} now={now} hover={hover} activeDays={activeDays} />
        </section>
      ))}

      {current.length === 0 ? (
        <p className="text-prose text-foreground/70">This season&apos;s calendar has ended; the months below are kept for reference.</p>
      ) : null}

      {earlier.length > 0 ? (
        <section aria-labelledby="previous-months" className="space-y-3 pt-4">
          <div className="flex items-center gap-3" role="presentation">
            <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
            <h2 id="previous-months" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-foreground/80">
              <History className="h-4 w-4 text-accent" aria-hidden="true" />
              Previous months
            </h2>
            <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
          </div>
          <p className="text-2xs text-dim text-center">
            {earlier.length} ended month{earlier.length === 1 ? "" : "s"} of {CALENDAR_YEAR}, newest first. Open one to see its grid.
          </p>
          {earlier
            .slice()
            .reverse()
            .map((grid) => (
              <details key={grid.key} className="group rounded-[var(--radius)] border border-border/40 bg-panel">
                <summary className="list-none cursor-pointer flex items-center gap-2 px-4 py-3 min-h-11 text-sm font-bold text-foreground/80 hover:text-foreground [&::-webkit-details-marker]:hidden">
                  <ChevronRight className="h-4 w-4 text-dim transition-transform group-open:rotate-90" aria-hidden="true" />
                  <span id={`month-${grid.key}`}>{grid.label}</span>
                  <span className="text-2xs text-dim font-normal">{monthSummary(grid)}{grid.entries.length ? ", ended" : ""}</span>
                </summary>
                <div className="px-4 pb-4 sm:px-5">
                  {grid.entries.length === 0 ? (
                    <p className="text-2xs text-dim pb-2">Nothing from the community calendar is recorded for this month.</p>
                  ) : null}
                  <MonthGrid grid={grid} now={now} hover={hover} activeDays={activeDays} />
                </div>
              </details>
            ))}
        </section>
      ) : null}

      {activeEntry && card ? (
        <div
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setCard(null);
          }}
        >
          <EventCard entry={activeEntry} card={card} now={now} zone={zone} />
        </div>
      ) : null}

      <footer className="text-2xs text-dim leading-relaxed">
        Source: {CALENDAR_SOURCE.label}. {CALENDAR_SOURCE.note} Dates can change; Bethesda&apos;s announcements win over this page.
      </footer>
    </div>
  );
}
