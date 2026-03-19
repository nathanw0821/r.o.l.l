"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SyncSource = {
  id: string;
  name: string;
  kind: string;
  url: string | null;
  format: string | null;
  enabled: boolean;
  lastSyncedAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
};

export default function AdminSyncPanel() {
  const [sources, setSources] = React.useState<SyncSource[]>([]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function loadSources() {
    try {
      const response = await fetch("/api/admin/sync");
      const payload = await response.json();
      if (payload?.success) {
        setSources(payload.data.sources ?? []);
      }
    } catch {
      // ignore
    }
  }

  React.useEffect(() => {
    loadSources();
  }, []);

  async function handleSync() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/sync", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setError(payload?.error?.message ?? "Sync failed.");
      } else {
        setMessage("Sync completed.");
      }
      await loadSources();
    } catch {
      setError("Sync failed.");
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(sourceId: string, patch: Partial<Pick<SyncSource, "url" | "enabled" | "format">>) {
    setError(null);
    try {
      const response = await fetch("/api/admin/sync", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: sourceId, ...patch })
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setError(payload?.error?.message ?? "Update failed.");
      } else {
        await loadSources();
      }
    } catch {
      setError("Update failed.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold">Websheet Sync</div>
          <div className="text-xs text-foreground/60">
            Pulls data from configured Fallout 76 sources and refreshes the dataset.
          </div>
          <div className="mt-1 text-xs text-foreground/50">
            Provide CSV/TSV/JSON export URLs for each source to enable syncing.
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSync} disabled={pending}>
          {pending ? "Syncing..." : "Run Sync"}
        </Button>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <div key={source.id} className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{source.name}</div>
                <div className="text-xs text-foreground/60">{source.kind}</div>
              </div>
              <div
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px]",
                  source.lastStatus === "success"
                    ? "border-emerald-500/60 text-emerald-200"
                    : source.lastStatus === "failed"
                      ? "border-amber-500/60 text-amber-200"
                      : "border-border text-foreground/60"
                )}
              >
                {source.lastStatus ?? "Not synced"}
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="text-xs text-foreground/60">
                Source URL
                <input
                  value={source.url ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSources((current) =>
                      current.map((item) => (item.id === source.id ? { ...item, url: value } : item))
                    );
                  }}
                  onBlur={(event) => handleUpdate(source.id, { url: event.target.value || null })}
                  className="mt-1 w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-foreground/60">
                Format
                <select
                  value={source.format ?? ""}
                  onChange={(event) => handleUpdate(source.id, { format: event.target.value || null })}
                  className="mt-1 w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
                >
                  <option value="">Auto</option>
                  <option value="csv">CSV</option>
                  <option value="tsv">TSV</option>
                  <option value="json">JSON</option>
                </select>
              </label>
              <label className="text-xs text-foreground/60">
                Enabled
                <div className="mt-2 flex items-center gap-2 text-xs text-foreground/70">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={(event) => handleUpdate(source.id, { enabled: event.target.checked })}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  {source.enabled ? "On" : "Off"}
                </div>
              </label>
            </div>
            <div className="mt-2 text-xs text-foreground/60">
              Last synced: {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleString() : "Never"}
            </div>
            {source.lastError ? (
              <div className="mt-2 text-xs text-amber-300">Error: {source.lastError}</div>
            ) : null}
          </div>
        ))}
      </div>

      {message ? <div className="text-xs text-emerald-300">{message}</div> : null}
      {error ? <div className="text-xs text-amber-300">{error}</div> : null}
    </div>
  );
}
