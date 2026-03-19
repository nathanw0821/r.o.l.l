"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Award, BookOpen, ClipboardList, ListChecks, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandStack from "@/components/brand-stack";
import LocalProgressSync from "@/components/local-progress-sync";

const links = [
  { href: "/", label: "Readme", icon: BookOpen },
  { href: "/summary", label: "Summary", icon: Sparkles },
  { href: "/achievements", label: "Achievements", icon: Award, requiresAuth: true },
  { href: "/all-effects", label: "All Effects", icon: ListChecks },
  { href: "/1-star", label: "1-Star", ariaLabel: "1 Star", icon: Star },
  { href: "/2-star", label: "2-Star", ariaLabel: "2 Star", icon: Star },
  { href: "/3-star", label: "3-Star", ariaLabel: "3 Star", icon: Star },
  { href: "/4-star", label: "4-Star", ariaLabel: "4 Star", icon: Star },
  { href: "/still-need", label: "Still Need", icon: ClipboardList }
];

export default function AppShell({ children, hub }: { children: ReactNode; hub?: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const visibleLinks = links.filter((link) => !link.requiresAuth || session?.user);

  return (
    <div className="min-h-screen bg-background text-foreground pip-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="app-layout">
        <aside className="app-sidebar">
          <div className="app-brand">
            <BrandStack href="/" />
          </div>
          <nav className="app-nav">
            {visibleLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={link.ariaLabel ?? link.label}
                  className={cn("app-nav__link", active && "app-nav__link--active")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="app-main">
          <div className="content-canvas">
            <LocalProgressSync />
            {hub}
            <main id="main-content" className="content-panel">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
