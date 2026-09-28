"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ScopedPickerItem = {
  id: string;
  label: string;
  description?: string;
  /** Small right-aligned tag, e.g. the food buff type or "active". */
  badge?: string;
};

export type ScopedPickerDialogProps = {
  /** `null` keeps the dialog closed. */
  title: string | null;
  hint?: string;
  items: ScopedPickerItem[];
  /** Ids shown as already active (rendered with aria-current and a marker). */
  activeIds?: ReadonlySet<string>;
  onPick: (id: string) => void;
  onClose: () => void;
  /** Opener button, refocused on close (Radix only returns focus to a DialogTrigger). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  emptyText?: string;
  isCompactDensity?: boolean;
};

/**
 * One-category picker ("Add mutation", "Change chem"): search, a list, one pick closes it.
 * The same interaction as the gear picker, for the small catalogs in the Biometrics tab.
 */
export default function ScopedPickerDialog({
  title,
  hint,
  items,
  activeIds,
  onPick,
  onClose,
  returnFocusRef,
  emptyText = "Nothing matches.",
  isCompactDensity,
}: ScopedPickerDialogProps) {
  const [query, setQuery] = React.useState("");
  const open = title !== null;
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.description?.toLowerCase().includes(q) ?? false) ||
        (it.badge?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
        className={cn(
          "pip-terminal-panel flex max-h-[min(94vh,44rem)] flex-col gap-0 border-accent/40 rounded-xl overflow-hidden font-mono",
          "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none",
          isCompactDensity ? "sm:max-w-lg p-3 sm:p-4" : "sm:max-w-xl p-4 sm:p-6",
        )}
      >
        {open && (
          <>
            <DialogHeader className="shrink-0 pr-8 relative z-10">
              <DialogTitle className={cn("font-black uppercase tracking-widest text-accent", isCompactDensity ? "text-xs" : "text-sm")}>
                &gt; {title}
              </DialogTitle>
              <DialogDescription className="text-2xs text-foreground/50 uppercase tracking-widest leading-relaxed">
                {hint ?? "Pick one; the list closes. Esc closes without changes."}
              </DialogDescription>
            </DialogHeader>
            <div className="relative mt-3 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" aria-hidden="true" />
              <input
                type="search"
                aria-label={`Search ${title.toLowerCase()}`}
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus={!isCompactDensity}
                className="w-full min-h-9 touch:min-h-11 pl-8 pr-2 py-1 rounded border border-slate-800 bg-slate-900/90 text-base sm:text-xs text-slate-200 placeholder:text-dim focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div
              role="region"
              aria-label={`${title} options`}
              tabIndex={0}
              className="mt-2 min-h-0 overflow-y-auto rounded-lg border border-slate-800/80 bg-[#06090e] p-2 space-y-1"
            >
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-xs text-dim italic">{emptyText}</p>
              ) : (
                filtered.map((it) => {
                  const active = activeIds?.has(it.id) ?? false;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        onPick(it.id);
                        onClose();
                      }}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "w-full min-h-11 text-left px-2.5 py-2 rounded-lg border flex items-start justify-between gap-2",
                        active
                          ? "bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400"
                          : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900",
                      )}
                    >
                      <span className="min-w-0">
                        <span className={cn("block text-xs font-bold truncate", active ? "text-emerald-300" : "text-slate-200")}>
                          {it.label}
                        </span>
                        {it.description ? (
                          <span className="block text-2xs text-slate-400 leading-snug">{it.description}</span>
                        ) : null}
                      </span>
                      {it.badge ? (
                        <span className="shrink-0 text-3xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
                          {it.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
