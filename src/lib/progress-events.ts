"use client";

import type { SelectionSource } from "@/lib/filter-utils";

export const PROGRESS_CHANGE_EVENT = "roll:progress-change";

export type ProgressEventEntry = {
  effectTierId: string;
  unlocked: boolean;
  selectionSource?: SelectionSource;
};

export function emitProgressChange(entries: ProgressEventEntry[]) {
  if (typeof window === "undefined" || entries.length === 0) return;

  window.dispatchEvent(
    new CustomEvent<ProgressEventEntry[]>(PROGRESS_CHANGE_EVENT, {
      detail: entries
    })
  );
}

export function subscribeProgressChange(callback: (entries: ProgressEventEntry[]) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ProgressEventEntry[]>;
    callback(Array.isArray(customEvent.detail) ? customEvent.detail : []);
  };

  window.addEventListener(PROGRESS_CHANGE_EVENT, handler);
  return () => window.removeEventListener(PROGRESS_CHANGE_EVENT, handler);
}
