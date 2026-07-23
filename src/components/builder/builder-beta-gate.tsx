"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const BETA_ACCEPTED_KEY = "roll-builder-beta-accepted";

function getStoredBetaAccess(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export function useBuilderBetaAccess(isAdmin: boolean, storageKey: string = BETA_ACCEPTED_KEY) {
  const [accepted, setAccepted] = React.useState<boolean>(() => getStoredBetaAccess(storageKey));

  React.useEffect(() => {
    const check = () => {
      const val = getStoredBetaAccess(storageKey);
      setAccepted(val);
    };

    // Check again on mount
    check();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) check();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const accept = React.useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, "true");
    } catch {
      // ignore
    }
    setAccepted(true);
    // Dispatch custom event for same-window updates across tabs/components
    window.dispatchEvent(new Event("storage"));
  }, [storageKey]);

  return {
    hasAccess: isAdmin || accepted,
    accepted,
    accept
  };
}

export function BuilderBetaGate({
  open,
  onAccept,
  onCancel,
  title = "Access B.U.I.L.D. Beta",
  description = "This feature is experimental and uses ideas and inspiration from multiple community tools. Data and calculations should be taken with a grain of salt."
}: {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  title?: string;
  description?: React.ReactNode;
}) {
  const [dontShowAgain, setDontShowAgain] = React.useState(true);

  const handleConfirm = () => {
    if (dontShowAgain) {
      try {
        window.localStorage.setItem(BETA_ACCEPTED_KEY, "true");
      } catch {
        // ignore
      }
    }
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onCancel(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="space-y-4 pt-4 text-foreground/90">
            <div className="space-y-4">
              {typeof description === "string" ? <p>{description}</p> : description}
              <p className="text-sm text-foreground/60">
                By joining the beta, you&apos;ll gain access to the experimental diagnostics and logistics tools.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                id="dont-show-beta-again"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-[var(--accent)] cursor-pointer"
              />
              <label htmlFor="dont-show-beta-again" className="cursor-pointer font-medium">
                Don&apos;t show this notice again
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={onCancel}>
                No thanks
              </Button>
              <Button onClick={handleConfirm} className="bg-[var(--accent)] text-white hover:opacity-90">
                I&apos;m in
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
