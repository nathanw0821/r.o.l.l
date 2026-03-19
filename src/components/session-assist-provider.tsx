"use client";

import * as React from "react";

type SessionAssistContextValue = {
  open: boolean;
  pinned: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setPinned: (pinned: boolean) => void;
  togglePinned: () => void;
};

const SessionAssistContext = React.createContext<SessionAssistContextValue | null>(null);

const OPEN_KEY = "roll.session-assist.open";
const PINNED_KEY = "roll.session-assist.pinned";

function readStoredFlag(key: string, fallback = false) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) === "true";
}

export function SessionAssistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setOpen(readStoredFlag(OPEN_KEY));
    setPinned(readStoredFlag(PINNED_KEY));
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(OPEN_KEY, open ? "true" : "false");
  }, [open]);

  React.useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(PINNED_KEY, pinned ? "true" : "false");
  }, [pinned]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = React.useMemo(
    () => ({
      open,
      pinned,
      setOpen,
      toggleOpen: () => setOpen((current) => !current),
      setPinned,
      togglePinned: () => setPinned((current) => !current)
    }),
    [open, pinned]
  );

  return <SessionAssistContext.Provider value={value}>{children}</SessionAssistContext.Provider>;
}

export function useSessionAssist() {
  const context = React.useContext(SessionAssistContext);
  if (!context) {
    throw new Error("useSessionAssist must be used within SessionAssistProvider");
  }
  return context;
}
