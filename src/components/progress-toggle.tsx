"use client";

import { cn } from "@/lib/utils";

export default function ProgressToggle({
  unlocked,
  onToggle,
  disabled = false,
  className
}: {
  unlocked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      data-status={unlocked ? "unlocked" : "locked"}
      className={cn("status-button rounded-[var(--radius)] border px-3 py-1.5 text-sm font-medium", className)}
    >
      {unlocked ? "Unlocked" : "Locked"}
    </button>
  );
}
