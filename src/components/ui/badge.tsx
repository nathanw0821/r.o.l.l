import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "neutral" | "success" | "warning" | "danger";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-accentMuted text-foreground",
  success: "bg-[var(--color-success)] text-white",
  warning: "bg-[var(--color-warning)] text-black",
  danger: "bg-[var(--color-danger)] text-white"
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
