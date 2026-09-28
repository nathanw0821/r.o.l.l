"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, CalendarPlus } from "lucide-react";
import {
  CALENDAR_ENTRIES,
  CALENDAR_SOURCE,
  CALENDAR_TITLE,
  EVENT_KIND_LABEL,
  calendarMonths,
  entryStatus,
  entryWindowUtc,
  type CalendarEntry,
  type EntryStatus,
  type EventKind,
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

const ET_DATE = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", weekday: "short" });
const ET_TIME = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

function etRange(entry: CalendarEntry): string {
  const { startUtc, endUtc } = entryWindowUtc(entry);
  const single = entry.start === entry.end;
  return single
    ? `${ET_DATE.format(startUtc)}, from ${ET_TIME.format(startUtc)}`
    : `${ET_DATE.format(startUtc)} to ${ET_DATE.format(endUtc)}, reset to reset (${ET_TIME.format(startUtc)})`;
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
    <span className="text-2xs text-dim">
      Your time ({zone.replace(/_/g, " ")}): {fmt.format(startUtc)} to {fmt.format(endUtc)}
    </span>
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
  return null;
}

export default function SeasonCalendar() {
  const months = React.useMemo(() => calendarMonths(CALENDAR_ENTRIES), []);
  const zone = useViewerZone();
  const now = useNow();
  const showLocal = zone !== null && zone !== "America/New_York";
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
              Every event day runs from daily reset to daily reset, noon Eastern. Times below are Eastern; once the page knows your
              zone it shows your local start and end as well.{now && liveCount > 0 ? ` ${liveCount} event${liveCount === 1 ? " is" : "s are"} live now.` : ""}
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

      {months.map((month) => (
        <section key={month.key} aria-labelledby={`month-${month.key}`} className="rounded-[var(--radius)] border border-border/40 bg-panel p-5 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/20 pb-2">
            <h2 id={`month-${month.key}`} className="text-base font-bold text-foreground">
              {month.label}
            </h2>
            <p className="text-2xs text-dim" aria-label={`Update Tuesdays in ${month.label}`}>
              Tuesdays (weekly reset):{" "}
              {month.tuesdays.map((t) => (
                <span key={t} className="ml-1.5 inline-block px-1.5 py-0.5 rounded border border-border/30 text-foreground/70">
                  {Number.parseInt(t.slice(8, 10), 10)}
                </span>
              ))}
            </p>
          </div>
          <ol className="space-y-2">
            {month.entries.map((entry) => {
              const status = now ? entryStatus(entry, now) : null;
              return (
                <li
                  key={entry.id}
                  id={entry.id}
                  className={cn(
                    "rounded-lg border p-3 space-y-1.5 scroll-mt-24",
                    status === "active" ? "border-emerald-500/50 bg-emerald-950/20" : status === "past" ? "border-border/20 bg-background/10" : "border-border/30 bg-background/30",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-3xs uppercase tracking-wider px-1.5 py-0.5 rounded border", KIND_CLASS[entry.kind])}>
                      {EVENT_KIND_LABEL[entry.kind]}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{entry.name}</h3>
                    {status ? <StatusChip status={status} /> : null}
                  </div>
                  <p className="text-2xs text-foreground/70">{etRange(entry)}</p>
                  {showLocal && zone ? <LocalRange entry={entry} zone={zone} /> : null}
                  <p className="text-prose text-foreground/80">{entry.note}</p>
                  <p className="text-2xs">
                    <Link href={`/wiki?q=${encodeURIComponent(entry.name)}`} className="text-accent underline underline-offset-2">
                      Guides about {entry.name}
                    </Link>
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <footer className="text-2xs text-dim leading-relaxed">
        Source: {CALENDAR_SOURCE.label}. {CALENDAR_SOURCE.note} Dates can change; Bethesda&apos;s announcements win over this page.
      </footer>
    </div>
  );
}
