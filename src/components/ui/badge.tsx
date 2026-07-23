import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "neutral" | "success" | "warning" | "danger";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-accentMuted text-foreground",
  success: "bg-[var(--color-success)] text-[color:var(--text-primary)]",
  warning: "bg-[var(--color-warning)] text-[color:var(--text-primary)]",
  danger: "bg-[var(--color-danger)] text-[color:var(--text-primary)]"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
