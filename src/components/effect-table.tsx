"use client";

import * as React from "react";
import { Lock, LockOpen } from "lucide-react";
import { updateProgress } from "@/actions/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type EffectTierRow = {
  id: string;
  effect: { name: string };
  tier: { label?: string } | null;
  categories: { category: { name: string } }[];
  description?: string | null;
  extraComponent?: string | null;
  legendaryModules?: number | null;
  notes?: string | null;
  unlocked: boolean;
};

export default function EffectTable({
  rows,
  canEdit
}: {
  rows: EffectTierRow[];
  canEdit: boolean;
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function toggleRow(row: EffectTierRow) {
    if (!canEdit) return;
    setPendingId(row.id);
    try {
      await updateProgress({ effectTierId: row.id, unlocked: !row.unlocked });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="hidden text-xs font-semibold uppercase text-foreground/60 md:grid table-grid">
        <div>Effect</div>
        <div>Categories</div>
        <div>Description</div>
        <div>Extra Component</div>
        <div>Modules</div>
        <div>Status</div>
        <div>Notes</div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const categories = row.categories.map((c) => c.category.name).join(" | ");
          return (
            <div
              key={row.id}
              className={cn(
                "rounded-[var(--radius)] border border-border bg-panel p-4",
                "md:grid md:items-start md:gap-3 table-grid"
              )}
            >
              <div>
                <div className="font-semibold">{row.effect.name}</div>
                {row.tier?.label ? (
                  <div className="text-xs text-foreground/60">{row.tier.label}</div>
                ) : null}
              </div>
              <div className="text-sm text-foreground/80">{categories || "-"}</div>
              <div className="text-sm text-foreground/80">{row.description || "-"}</div>
              <div className="text-sm text-foreground/80">{row.extraComponent || "-"}</div>
              <div className="text-sm text-foreground/80">
                {row.legendaryModules ?? "-"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={row.unlocked ? "success" : "danger"}>
                    {row.unlocked ? (
                      <>
                        <LockOpen className="h-3 w-3" /> Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Locked
                      </>
                    )}
                  </Badge>
                  {canEdit ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRow(row)}
                      disabled={pendingId === row.id}
                    >
                      {row.unlocked ? "Mark Locked" : "Mark Unlocked"}
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="text-sm text-foreground/80">{row.notes || "-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
