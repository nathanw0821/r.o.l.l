"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { bulkUpdateProgress } from "@/actions/progress";
import { useLocalProgress } from "@/components/use-local-progress";
import type { SelectionSource } from "@/lib/filter-utils";
import { emitProgressChange } from "@/lib/progress-events";

const HISTORY_LIMIT = 5;

type ProgressHistoryEntry = {
  effectTierId: string;
  previousUnlocked: boolean | null;
  nextUnlocked: boolean | null;
  previousResolvedUnlocked: boolean;
  nextResolvedUnlocked: boolean;
  previousSelectionSource?: SelectionSource;
  nextSelectionSource?: SelectionSource;
};

type ProgressHistoryContextValue = {
  commitEntries: (entries: ProgressHistoryEntry[]) => Promise<boolean>;
  undo: () => Promise<boolean>;
  canUndo: boolean;
  isPending: boolean;
};

const ProgressHistoryContext = React.createContext<ProgressHistoryContextValue | null>(null);

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "textarea" || tagName === "select") return true;
  if (tagName !== "input") return false;

  const input = target as HTMLInputElement;
  const type = (input.type || "text").toLowerCase();
  return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(type);
}

function isMeaningfulChange(entry: ProgressHistoryEntry) {
  return !(
    entry.previousUnlocked === entry.nextUnlocked &&
    entry.previousResolvedUnlocked === entry.nextResolvedUnlocked &&
    entry.previousSelectionSource === entry.nextSelectionSource
  );
}

export function ProgressHistoryProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setEntries } = useLocalProgress(!session);
  const historyRef = React.useRef<ProgressHistoryEntry[][]>([]);
  const pendingRef = React.useRef(false);
  const [canUndo, setCanUndo] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const persistEntries = React.useCallback(
    async (entries: ProgressHistoryEntry[], direction: "forward" | "undo", recordHistory: boolean) => {
      const meaningfulEntries = entries.filter(isMeaningfulChange);
      if (meaningfulEntries.length === 0 || pendingRef.current) return false;

      const payload = meaningfulEntries.map((entry) => ({
        effectTierId: entry.effectTierId,
        unlocked: direction === "forward" ? entry.nextUnlocked : entry.previousUnlocked
      }));
      const broadcastEntries = meaningfulEntries.map((entry) => ({
        effectTierId: entry.effectTierId,
        unlocked: direction === "forward" ? entry.nextResolvedUnlocked : entry.previousResolvedUnlocked,
        selectionSource: direction === "forward" ? entry.nextSelectionSource : entry.previousSelectionSource
      }));

      pendingRef.current = true;
      setIsPending(true);

      try {
        if (session) {
          await bulkUpdateProgress({ entries: payload });
        } else {
          setEntries(
            payload.map((entry) => ({
              id: entry.effectTierId,
              unlocked: entry.unlocked
            }))
          );
        }

        emitProgressChange(broadcastEntries);

        if (recordHistory) {
          const nextHistory = [...historyRef.current, meaningfulEntries].slice(-HISTORY_LIMIT);
          historyRef.current = nextHistory;
          setCanUndo(nextHistory.length > 0);
        } else {
          const nextHistory = historyRef.current.slice(0, -1);
          historyRef.current = nextHistory;
          setCanUndo(nextHistory.length > 0);
        }

        if (session) {
          router.refresh();
        }

        return true;
      } catch {
        return false;
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [router, session, setEntries]
  );

  const commitEntries = React.useCallback(
    async (entries: ProgressHistoryEntry[]) => persistEntries(entries, "forward", true),
    [persistEntries]
  );

  const undo = React.useCallback(async () => {
    const previousStep = historyRef.current.at(-1);
    if (!previousStep) return false;
    return persistEntries(previousStep, "undo", false);
  }, [persistEntries]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== "z") return;
      if (pendingRef.current || historyRef.current.length === 0) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      void undo();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  const value = React.useMemo(
    () => ({
      commitEntries,
      undo,
      canUndo,
      isPending
    }),
    [commitEntries, undo, canUndo, isPending]
  );

  return <ProgressHistoryContext.Provider value={value}>{children}</ProgressHistoryContext.Provider>;
}

export function useProgressHistory() {
  const context = React.useContext(ProgressHistoryContext);
  if (!context) {
    throw new Error("useProgressHistory must be used within ProgressHistoryProvider");
  }
  return context;
}
