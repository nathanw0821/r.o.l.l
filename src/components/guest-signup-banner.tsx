"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { ShieldCheck, X, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const SESSION_DISMISS_KEY = "roll-dismissed-signup-banner-session";
const PERM_DISMISS_KEY = "roll-dismissed-signup-banner-perm";

export default function GuestSignupBanner() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = React.useState(true);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  React.useEffect(() => {
    // Only show for non-authenticated guests who haven't permanently or session-dismissed
    if (status === "unauthenticated") {
      try {
        const isPerm = localStorage.getItem(PERM_DISMISS_KEY) === "true";
        const isSession = sessionStorage.getItem(SESSION_DISMISS_KEY) === "true";
        if (!isPerm && !isSession) {
          setDismissed(false);
        }
      } catch {
        setDismissed(false);
      }
    }
  }, [status]);

  if (dismissed || status !== "unauthenticated" || Boolean(session)) {
    return null;
  }

  const handleDismiss = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem(PERM_DISMISS_KEY, "true");
      } else {
        sessionStorage.setItem(SESSION_DISMISS_KEY, "true");
      }
    } catch {
      // Ignore storage errors
    }
    setDismissed(true);
  };

  return (
    <div className="mb-4 rounded-xl border border-accent/40 bg-panel/95 backdrop-blur-md p-4 shadow-lg font-mono relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 text-accent mt-0.5 md:mt-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1">
                <span>Free Cloud Backup</span>
              </span>
              <span className="text-[0.7rem] bg-accent/10 border border-accent/20 px-2 py-0.5 rounded text-accent/90">
                IGN &amp; Privacy Protected
              </span>
            </div>
            <p className="text-xs text-foreground/75 leading-relaxed max-w-2xl">
              Create a free Vault account to back up your legendary crafting unlocks &amp; custom B.U.I.L.D. loadouts across all your devices. <strong className="text-foreground">We never track, process, or sell your data.</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
          <label className="flex items-center gap-1.5 text-[0.72rem] text-foreground/60 hover:text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--accent)] border-border/80 rounded"
            />
            <span>Don&apos;t show again</span>
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => signIn()}
              className="h-8 px-3 text-[0.75rem] font-bold uppercase tracking-wider bg-accent text-white hover:bg-accent/90 flex items-center gap-1.5 rounded-lg shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </Button>
            <Link
              href="/privacy"
              className="h-8 px-3 text-[0.72rem] font-bold uppercase tracking-wider border border-border bg-background/50 hover:bg-background text-foreground/80 hover:text-foreground flex items-center gap-1.5 rounded-lg transition"
            >
              <Lock className="h-3 w-3 text-foreground/50" />
              <span>Privacy</span>
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              title={dontShowAgain ? "Dismiss permanently" : "Dismiss for current session"}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/40 hover:bg-background/80 text-foreground/50 hover:text-foreground transition ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
