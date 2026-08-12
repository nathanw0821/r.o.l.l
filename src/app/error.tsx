"use client";

import * as React from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log non-abort navigation errors for diagnostics
    if (error?.message && !error.message.includes("aborted")) {
      console.error("[Navigation Error]", error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-2xl border border-border/40 bg-panel/90 p-8 shadow-2xl space-y-5 font-mono">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 border border-accent/30 text-accent">
          <RefreshCw className="h-6 w-6 animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">Navigation Interrupted</h2>
          <p className="text-xs text-foreground/60 leading-relaxed">
            The page request was interrupted during browser navigation. Click below to refresh or return home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full sm:w-auto bg-accent text-white hover:bg-accent/90 font-bold uppercase text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-border bg-background/50 hover:bg-background text-xs font-bold uppercase text-foreground/80 hover:text-foreground flex items-center justify-center gap-2 transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
