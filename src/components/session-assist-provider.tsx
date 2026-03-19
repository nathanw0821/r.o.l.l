"use client";

import * as React from "react";
import { type AssistPreset } from "@/lib/session-assist-presets";

type SessionAssistContextValue = {
  open: boolean;
  pinned: boolean;
  preset: AssistPreset;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setPinned: (pinned: boolean) => void;
  togglePinned: () => void;
  setPreset: (preset: AssistPreset) => void;
};

const SessionAssistContext = React.createContext<SessionAssistContextValue | null>(null);

const OPEN_KEY = "roll.session-assist.open";
const PINNED_KEY = "roll.session-assist.pinned";
const PRESET_KEY = "roll.session-assist.preset";

function readStoredFlag(key: string, fallback = false) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) === "true";
}

export function SessionAssistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [preset, setPreset] = React.useState<AssistPreset>("manual");
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setOpen(readStoredFlag(OPEN_KEY));
    setPinned(readStoredFlag(PINNED_KEY));
    const storedPreset = window.localStorage.getItem(PRESET_KEY);
    if (storedPreset === "manual" || storedPreset === "session" || storedPreset === "ai") {
      setPreset(storedPreset);
    }
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
    if (!hydrated.current) return;
    window.localStorage.setItem(PRESET_KEY, preset);
  }, [preset]);

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
      preset,
      setOpen,
      toggleOpen: () => setOpen((current) => !current),
      setPinned,
      togglePinned: () => setPinned((current) => !current),
      setPreset
    }),
    [open, pinned, preset]
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
