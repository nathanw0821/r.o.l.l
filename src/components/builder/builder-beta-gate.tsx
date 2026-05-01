"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const BETA_ACCEPTED_KEY = "roll-builder-beta-accepted";

export function useBuilderBetaAccess(isAdmin: boolean) {
  const [accepted, setAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const check = () => {
      const val = window.localStorage.getItem(BETA_ACCEPTED_KEY) === "true";
      setAccepted(val);
    };
    check();

    window.addEventListener("storage", (e) => {
      if (e.key === BETA_ACCEPTED_KEY) check();
    });
  }, []);

  const accept = React.useCallback(() => {
    window.localStorage.setItem(BETA_ACCEPTED_KEY, "true");
    setAccepted(true);
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event("storage"));
  }, []);

  return {
    hasAccess: isAdmin || accepted === true,
    accepted,
    accept
  };
}

export function BuilderBetaGate({
  open,
  onAccept,
  onCancel
}: {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onCancel(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Access B.U.I.L.D. Beta</DialogTitle>
          <DialogDescription className="space-y-4 pt-4 text-foreground/90">
            <p>
              This feature is experimental and uses ideas and inspiration from multiple community tools. 
              Data and calculations should be taken with a grain of salt.
            </p>
            <p className="text-sm text-foreground/60">
              By joining the beta, you'll gain access to the Battle Utility & Inventory Logistics Diagnostic tool.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onCancel}>
                No thanks
              </Button>
              <Button onClick={onAccept}>
                I'm in
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
