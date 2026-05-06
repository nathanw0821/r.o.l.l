"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const BETA_ACCEPTED_KEY = "roll-builder-beta-accepted";

export function useBuilderBetaAccess(isAdmin: boolean, storageKey: string = BETA_ACCEPTED_KEY) {
  const [accepted, setAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const check = () => {
      const val = window.localStorage.getItem(storageKey) === "true";
      setAccepted(val);
    };
    check();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) check();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const accept = React.useCallback(() => {
    window.localStorage.setItem(storageKey, "true");
    setAccepted(true);
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event("storage"));
  }, [storageKey]);

  return {
    hasAccess: isAdmin || accepted === true,
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
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onCancel}>
                No thanks
              </Button>
              <Button onClick={onAccept}>
                I&apos;m in
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
