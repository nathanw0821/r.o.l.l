"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type StateGroupProps = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  /** One line shown in the header while collapsed (and, dimmer, while open). */
  summary?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * One collapsible state group of the Biometrics stateboard: a real button header (keyboard
 * operable, aria-expanded) and a region that stays in the DOM only while open, so a phone
 * shows one group at a time without rendering every slider on the page.
 */
export default function StateGroup({
  id,
  title,
  icon,
  summary,
  open,
  onToggle,
  children,
  className,
}: StateGroupProps) {
  const panelId = `state-group-${id}`;
  const headingId = `${panelId}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className={cn("rounded-lg border border-slate-800 bg-slate-900/40", open && "border-emerald-500/30", className)}
    >
      <h3 id={headingId} className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(
            "flex w-full min-h-10 touch:min-h-11 items-center justify-between gap-3 px-3 py-2 text-left rounded-lg",
            "text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-slate-900/70 transition-colors",
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            {icon ? <span className="shrink-0 text-emerald-400" aria-hidden="true">{icon}</span> : null}
            <span className="truncate">{title}</span>
          </span>
          <span className="flex items-center gap-2 min-w-0 shrink">
            {summary ? (
              <span className={cn("hidden sm:block truncate text-2xs font-normal normal-case tracking-normal", open ? "text-dim" : "text-slate-300")}>
                {summary}
              </span>
            ) : null}
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-dim transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </span>
        </button>
      </h3>
      {summary && !open ? (
        <div className="sm:hidden px-3 pb-2 -mt-1 text-2xs text-slate-300 truncate">{summary}</div>
      ) : null}
      {open ? (
        <div id={panelId} role="region" aria-labelledby={headingId} className="px-3 pb-3 space-y-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}
