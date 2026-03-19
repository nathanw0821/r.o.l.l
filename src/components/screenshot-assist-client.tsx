"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { bulkUpdateProgress } from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalProgress } from "@/components/use-local-progress";
import { cn } from "@/lib/utils";

type ScreenshotAssistRow = {
  id: string;
  effect: { name: string };
  tier?: { label?: string } | null;
  categories: { category: { name: string } }[];
  unlocked: boolean;
};

const tierOptions = ["all", "1 Star", "2 Star", "3 Star", "4 Star"] as const;

export default function ScreenshotAssistClient({
  rows
}: {
  rows: ScreenshotAssistRow[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setEntries } = useLocalProgress(!session);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [tier, setTier] = React.useState<(typeof tierOptions)[number]>("all");
  const [category, setCategory] = React.useState("all");
  const [lockedOnly, setLockedOnly] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const categoryOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const row of rows) {
      for (const categoryRow of row.categories) {
        names.add(categoryRow.category.name);
      }
    }
    return ["all", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (lockedOnly && row.unlocked) return false;
      if (tier !== "all" && row.tier?.label !== tier) return false;
      if (
        category !== "all" &&
        !row.categories.some((categoryRow) => categoryRow.category.name === category)
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      const categoryText = row.categories.map((categoryRow) => categoryRow.category.name).join(" ").toLowerCase();
      return (
        row.effect.name.toLowerCase().includes(normalizedQuery) ||
        (row.tier?.label ?? "").toLowerCase().includes(normalizedQuery) ||
        categoryText.includes(normalizedQuery)
      );
    });
  }, [rows, lockedOnly, tier, category, query]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setSelectedIds([]);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function toggleSelection(effectTierId: string) {
    setSelectedIds((current) =>
      current.includes(effectTierId)
        ? current.filter((id) => id !== effectTierId)
        : [...current, effectTierId]
    );
  }

  function selectVisible() {
    setSelectedIds(Array.from(new Set(filteredRows.map((row) => row.id))));
  }

  async function saveConfirmed() {
    if (selectedIds.length === 0) return;
    setPending(true);
    setMessage(null);
    const entries = selectedIds.map((id) => ({ id, unlocked: true as const }));

    try {
      if (session) {
        await bulkUpdateProgress({
          entries: selectedIds.map((effectTierId) => ({ effectTierId, unlocked: true }))
        });
        router.refresh();
      } else {
        setEntries(entries);
      }
      setMessage(`Saved ${selectedIds.length} confirmed unlock${selectedIds.length === 1 ? "" : "s"}.`);
      setSelectedIds([]);
    } catch {
      setMessage("Could not save confirmed unlocks.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">1. Add a screenshot</div>
          <div className="mt-1 text-xs text-foreground/60">
            Your screenshot stays in this browser. R.O.L.L. uses it as a visual reference only and does not parse it.
          </div>
          <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="mt-3" />
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">2. Narrow the checklist</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-xs text-foreground/60">
              Search
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Effect or category"
                className="mt-1"
              />
            </label>
            <label className="text-xs text-foreground/60">
              Tier
              <select
                value={tier}
                onChange={(event) => setTier(event.target.value as (typeof tierOptions)[number])}
                className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-panel px-3 text-sm"
              >
                {tierOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All tiers" : option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-foreground/60">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius)] border border-border bg-panel px-3 text-sm"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All categories" : option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={lockedOnly}
                onChange={(event) => setLockedOnly(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Show still locked only
            </label>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">3. Confirm visible unlocks</div>
              <div className="mt-1 text-xs text-foreground/60">
                Select only the effects you can clearly verify in the screenshot.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectVisible}>
                Select Visible
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
              <Button type="button" size="sm" onClick={saveConfirmed} disabled={pending || selectedIds.length === 0}>
                {pending ? "Saving..." : `Save Confirmed (${selectedIds.length})`}
              </Button>
            </div>
          </div>

          <div className="mt-4 max-h-[520px] space-y-2 overflow-auto">
            {filteredRows.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-border px-3 py-4 text-sm text-foreground/60">
                No effects match the current filters.
              </div>
            ) : null}
            {filteredRows.map((row) => {
              const selected = selectedIds.includes(row.id);
              const categories = row.categories.map((categoryRow) => categoryRow.category.name).join(", ");
              return (
                <label
                  key={row.id}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius)] border px-3 py-3 text-sm",
                    selected ? "border-accent bg-accentMuted/20" : "border-border bg-panel/70"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelection(row.id)}
                    className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold">{row.effect.name}</div>
                    <div className="mt-1 text-xs text-foreground/60">
                      {row.tier?.label ?? "Unknown tier"}
                      {categories ? ` | ${categories}` : ""}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {message ? <div className="mt-3 text-xs text-foreground/70">{message}</div> : null}
          {!session ? (
            <div className="mt-3 text-xs text-foreground/60">
              Guest mode saves locally in this browser. Sign in to sync confirmed unlocks to your account.
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-panel p-4 lg:sticky lg:top-24 lg:self-start">
        <div className="text-sm font-semibold">Screenshot Reference</div>
        <div className="mt-1 text-xs text-foreground/60">
          Keep the screenshot open here while you confirm unlocks on the left.
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius)] border border-border bg-background/40">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Uploaded game screenshot for manual review" className="h-auto w-full object-contain" />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center px-4 text-center text-sm text-foreground/50">
              Add a screenshot to preview it here. No OCR, no parsing, and no live game access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
