"use client";

import * as React from "react";
import { RefreshCw, Home, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    // Log non-abort errors for diagnostics
    if (error?.message && !error.message.includes("aborted")) {
      console.error("[Tactical Diagnostic Interruption]", error);
    }
  }, [error]);

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full rounded-2xl border border-amber-500/30 bg-slate-950/95 p-6 sm:p-8 shadow-2xl space-y-5 font-mono relative overflow-hidden text-left">
        <div className="crt-scanline" />

        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-300">
              [ Tactical Diagnostic Interrupted ]
            </h2>
            <p className="text-[0.68rem] text-slate-400 uppercase tracking-widest">
              Interface Telemetry Exception
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          A runtime interface interruption occurred while calculating telemetry or processing the active loadout. You can re-attempt the operation or return to base.
        </p>

        {/* Technical Diagnostics Disclosure */}
        {error?.message && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2 text-xs">
            <button
              type="button"
              onClick={() => setShowDetails((p) => !p)}
              className="flex items-center justify-between w-full text-[0.7rem] uppercase tracking-wider text-amber-400/90 hover:text-amber-300 font-bold transition cursor-pointer"
            >
              <span>Telemetry Diagnostic Details</span>
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDetails && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[0.68rem] text-slate-400 break-words font-mono">
                <div className="text-amber-200/90 font-semibold">{error.message}</div>
                {error.digest && (
                  <div className="text-slate-500 text-[0.62rem]">
                    Digest: <span className="text-slate-400">{error.digest}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center justify-center gap-2 transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Link>
          <Button
            type="button"
            onClick={() => {
              try {
                reset();
              } catch {
                /* ignore reset failure */
              }
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs px-5 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
