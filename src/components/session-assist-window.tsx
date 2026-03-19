"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, ExternalLink, PanelLeftOpen, Pin, PinOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScreenshotAssistClient from "@/components/screenshot-assist-client";
import { useSessionAssist } from "@/components/session-assist-provider";
import type { SessionAssistRow } from "@/lib/session-assist";

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "ready"; rows: SessionAssistRow[] }
  | { status: "error"; message: string };

export default function SessionAssistWindow() {
  const { open, setOpen, pinned, togglePinned } = useSessionAssist();
  const [loadState, setLoadState] = React.useState<LoadState>({ status: "idle" });

  React.useEffect(() => {
    if (!open || loadState.status === "ready" || loadState.status === "loading") return;

    let cancelled = false;
    setLoadState({ status: "loading" });

    fetch("/api/session-assist", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load Session Assist.");
        }
        return response.json() as Promise<{ rows: SessionAssistRow[] }>;
      })
      .then((payload) => {
        if (cancelled) return;
        setLoadState({ status: "ready", rows: payload.rows });
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState({ status: "error", message: "Could not load Session Assist right now." });
      });

    return () => {
      cancelled = true;
    };
  }, [loadState.status, open]);

  if (!open) return null;

  return (
    <div className="session-assist-window-wrap" aria-live="polite">
      <section className="session-assist-window">
        <div className="session-assist-window__header">
          <div>
            <div className="session-assist-window__title">
              <Camera className="h-4 w-4" />
              Session Assist
            </div>
            <div className="session-assist-window__subtitle">
              Keep this open while you move through the tracker. Suggestions stay manual until you confirm them.
            </div>
          </div>
          <div className="session-assist-window__actions">
            <Button type="button" variant="outline" size="sm" onClick={togglePinned}>
              {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              {pinned ? "Unpin Tab" : "Pin Tab"}
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/screenshot-assist">
                <PanelLeftOpen className="h-4 w-4" />
                Full Page
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} aria-label="Close Session Assist">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="session-assist-window__body">
          {loadState.status === "loading" || loadState.status === "idle" ? (
            <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-6 text-sm text-foreground/70">
              Loading Session Assist...
            </div>
          ) : null}

          {loadState.status === "error" ? (
            <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-6 text-sm text-foreground/70">
              {loadState.message}
            </div>
          ) : null}

          {loadState.status === "ready" ? <ScreenshotAssistClient rows={loadState.rows} mode="window" /> : null}
        </div>
      </section>
    </div>
  );
}
