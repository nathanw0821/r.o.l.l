"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SyncSource = {
  id: string;
  name: string;
  kind: string;
  url: string | null;
  referenceUrl: string | null;
  format: string | null;
  enabled: boolean;
  lastSyncedAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  lastChangedAt: string | null;
  lastCheckStatus: string | null;
};

export default function AdminSyncPanel() {
  const [sources, setSources] = React.useState<SyncSource[]>([]);
  const [syncPending, setSyncPending] = React.useState(false);
  const [checkPending, setCheckPending] = React.useState(false);
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
    setSyncPending(true);
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
      setSyncPending(false);
    }
  }

  async function handleCheck() {
    setCheckPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/sync/check", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setError(payload?.error?.message ?? "Change check failed.");
      } else {
        const changedCount = payload?.data?.changedCount ?? 0;
        setMessage(changedCount > 0 ? `${changedCount} source page(s) changed.` : "No source page changes detected.");
      }
      await loadSources();
    } catch {
      setError("Change check failed.");
    } finally {
      setCheckPending(false);
    }
  }

  async function handleUpdate(
    sourceId: string,
    patch: Partial<Pick<SyncSource, "url" | "referenceUrl" | "enabled" | "format">>
  ) {
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
            Track source pages here and maintain the companion tracker’s reference dataset.
          </div>
          <div className="mt-1 text-xs text-foreground/50">
            “Check for Changes” monitors saved source pages. “Run Sync” only uses enabled CSV/TSV/JSON feed URLs and never reads live game data.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCheck} disabled={checkPending}>
            {checkPending ? "Checking..." : "Check for Changes"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleSync} disabled={syncPending}>
            {syncPending ? "Syncing..." : "Run Sync"}
          </Button>
        </div>
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
                    ? "border-[color:color-mix(in_srgb,var(--color-success)_44%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_12%,var(--color-panel))] text-[color:var(--color-success)]"
                    : source.lastStatus === "failed"
                      ? "border-[color:color-mix(in_srgb,var(--color-warning)_44%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_12%,var(--color-panel))] text-[color:var(--color-warning)]"
                      : "border-border text-foreground/60"
                )}
              >
                {source.lastStatus ?? "Not synced"}
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="text-xs text-foreground/60 md:col-span-2">
                Reference URL
                <input
                  value={source.referenceUrl ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSources((current) =>
                      current.map((item) => (item.id === source.id ? { ...item, referenceUrl: value } : item))
                    );
                  }}
                  onBlur={(event) => handleUpdate(source.id, { referenceUrl: event.target.value || null })}
                  className="mt-1 w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-foreground/60">
                Sync Feed URL
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
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-foreground/60">
                Enabled for Sync
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
              <div className="text-xs text-foreground/60">
                <div>
                  Last checked: {source.lastCheckedAt ? new Date(source.lastCheckedAt).toLocaleString() : "Never"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px]",
                      source.lastCheckStatus === "changed"
                        ? "border-[color:color-mix(in_srgb,var(--color-warning)_44%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_12%,var(--color-panel))] text-[color:var(--color-warning)]"
                        : source.lastCheckStatus === "unchanged"
                          ? "border-[color:color-mix(in_srgb,var(--color-success)_44%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_12%,var(--color-panel))] text-[color:var(--color-success)]"
                          : source.lastCheckStatus === "baseline"
                            ? "border-[color:color-mix(in_srgb,var(--color-accent)_44%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_12%,var(--color-panel))] text-[color:var(--color-accent)]"
                            : "border-border text-foreground/60"
                    )}
                  >
                    {source.lastCheckStatus ?? "Not checked"}
                  </span>
                  {source.lastChangedAt ? (
                    <span>Last changed: {new Date(source.lastChangedAt).toLocaleString()}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-foreground/60">
              Last synced: {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleString() : "Never"}
            </div>
            {source.lastError ? (
              <div className="mt-2 text-xs text-[color:var(--color-warning)]">Error: {source.lastError}</div>
            ) : null}
          </div>
        ))}
      </div>

      {message ? <div className="text-xs text-[color:var(--color-success)]">{message}</div> : null}
      {error ? <div className="text-xs text-[color:var(--color-warning)]">{error}</div> : null}
    </div>
  );
}
