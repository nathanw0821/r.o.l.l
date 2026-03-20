"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandStackProps = {
  align?: "left" | "center";
  href?: string;
  className?: string;
  variant?: "default" | "auth";
  titleSlot?: ReactNode;
  subtitleSlot?: ReactNode;
  supportSlot?: ReactNode;
};

export default function BrandStack({
  align = "left",
  href,
  className,
  variant = "default",
  titleSlot,
  subtitleSlot,
  supportSlot
}: BrandStackProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={cn("brand-stack", variant === "auth" && "brand-stack--auth", alignment, className)}>
      {href ? (
        <Link href={href} className="brand-stack__title">
          {titleSlot ?? "R.O.L.L"}
        </Link>
      ) : (
        <div className="brand-stack__title">{titleSlot ?? "R.O.L.L"}</div>
      )}
      <div className="brand-stack__subtitle">{subtitleSlot ?? "Record Of Legendary Loadouts"}</div>
      <div className="brand-stack__support">{supportSlot ?? "Effects | Components | Acquisition"}</div>
    </div>
  );
}
