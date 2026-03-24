"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const overviewTabs = [
  { href: "/overview/profile", label: "Profile" },
  { href: "/overview/achievements", label: "Achievements" },
  { href: "/overview/readme", label: "Readme" }
];

export default function OverviewTabs() {
  const pathname = usePathname();

  return (
    <nav className="overview-tabs" aria-label="Overview sections">
      {overviewTabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn("overview-tab", active && "overview-tab--active")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
