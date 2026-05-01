"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Palette, Trophy, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const overviewTabs = [
  { href: "/overview/general", label: "General", icon: User },
  { href: "/overview/security", label: "Password & Security", icon: Shield },
  { href: "/overview/appearance", label: "Theme & Appearance", icon: Palette },
  { href: "/overview/achievements", label: "Achievements", icon: Trophy },
  { href: "/overview/readme", label: "Readme", icon: BookOpen }
];

export default function OverviewTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 w-full" aria-label="Overview sections">
      {overviewTabs.map((tab) => {
        const active = pathname === tab.href || (pathname === "/overview/profile" && tab.href === "/overview/general");
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
