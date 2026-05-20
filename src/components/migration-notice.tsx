"use client";

import * as React from "react";
import { Info, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "roll-migration-notice-dismissed-v2";

export default function MigrationNotice() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Only check localStorage on the client side
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small timeout to let page load smoothly before notice slides in
      const timeout = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm w-full md:w-[380px] p-5 rounded-xl border shadow-2xl",
        "backdrop-blur-md bg-panel/90 border-accent/30 text-foreground",
        "animate-in fade-in slide-in-from-bottom-5 duration-300 ease-out"
      )}
      style={{
        boxShadow: "0 12px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent shrink-0">
          <Info className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-wide text-foreground uppercase">
              System Migration Notice
            </h3>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition"
              aria-label="Dismiss notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground/85 leading-relaxed">
            R.O.L.L. has successfully transitioned to a new host! All your character profiles and progress data are fully preserved and secure.
          </p>
          <p className="mt-2 text-xs text-foreground/80 leading-relaxed">
            Some features are still in active transition. If you spot anything that is broken or behaving unexpectedly, please submit feedback on-site or let us know directly on Discord!
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://discord.gg/sMuQv7Waks"
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white",
                "bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A3] transition-colors"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Join Discord
            </a>
            <button
              onClick={handleDismiss}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 hover:border-foreground/25",
                "hover:bg-foreground/5 active:bg-foreground/10 text-foreground transition-all"
              )}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
