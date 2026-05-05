"use client";

import * as React from "react";

const COOKIE_NAME = "roll_local_progress";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const LOCAL_PROGRESS_EVENT = "roll:local-progress";

export type LocalProgressEntry = {
  unlocked: boolean;
  isSeeking?: boolean;
  modCount?: number;
};

export type LocalProgressMap = Record<string, LocalProgressEntry>;

function readCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookieValue(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

function clearCookieValue(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function broadcastLocalProgress(map: LocalProgressMap) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<LocalProgressMap>(LOCAL_PROGRESS_EVENT, {
      detail: map
    })
  );
}

export function readLocalProgress(): LocalProgressMap {
  const raw = readCookieValue(COOKIE_NAME);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized: LocalProgressMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") {
        normalized[key] = { unlocked: value };
      } else if (value && typeof value === "object" && "unlocked" in value) {
        normalized[key] = value as LocalProgressEntry;
      }
    }
    return normalized;
  } catch {
    return {};
  }
}

export function writeLocalProgress(map: LocalProgressMap) {
  writeCookieValue(COOKIE_NAME, JSON.stringify(map));
}

export function clearLocalProgress() {
  clearCookieValue(COOKIE_NAME);
}

export function useLocalProgress(enabled = true) {
  const [map, setMap] = React.useState<LocalProgressMap>({});

  React.useEffect(() => {
    if (!enabled) return;
    setMap(readLocalProgress());
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const sync = () => setMap(readLocalProgress());
    const handleLocalProgress = (event: Event) => {
      const customEvent = event as CustomEvent<LocalProgressMap>;
      if (customEvent.detail && typeof customEvent.detail === "object") {
        setMap(customEvent.detail);
        return;
      }
      sync();
    };

    window.addEventListener(LOCAL_PROGRESS_EVENT, handleLocalProgress);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(LOCAL_PROGRESS_EVENT, handleLocalProgress);
      window.removeEventListener("focus", sync);
    };
  }, [enabled]);

  const setEntry = React.useCallback(
    (id: string, entry: LocalProgressEntry | null) => {
      if (!enabled) return;
      setMap((prev) => {
        const next = { ...prev };
        if (entry === null) {
          delete next[id];
        } else {
          next[id] = { ...prev[id], ...entry };
        }
        writeLocalProgress(next);
        broadcastLocalProgress(next);
        return next;
      });
    },
    [enabled]
  );

  const setEntries = React.useCallback(
    (entries: { id: string; entry: Partial<LocalProgressEntry> | null }[]) => {
      if (!enabled || entries.length === 0) return;
      setMap((prev) => {
        const next = { ...prev };
        for (const item of entries) {
          if (item.entry === null) {
            delete next[item.id];
          } else {
            next[item.id] = { ...prev[item.id], ...item.entry } as LocalProgressEntry;
          }
        }
        writeLocalProgress(next);
        broadcastLocalProgress(next);
        return next;
      });
    },
    [enabled]
  );

  const clear = React.useCallback(() => {
    setMap({});
    clearLocalProgress();
    broadcastLocalProgress({});
  }, []);

  const unlockedCount = React.useMemo(
    () => Object.values(map).filter((entry) => entry.unlocked).length,
    [map]
  );

  return {
    map,
    setEntry,
    setEntries,
    clear,
    unlockedCount,
    hasLocal: Object.keys(map).length > 0
  };
}

