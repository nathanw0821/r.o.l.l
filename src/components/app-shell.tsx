"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/all-effects", label: "All Effects" },
  { href: "/1-star", label: "1 Star" },
  { href: "/2-star", label: "2 Star" },
  { href: "/3-star", label: "3 Star" },
  { href: "/4-star", label: "4 Star" },
  { href: "/still-need", label: "Still Need" },
  { href: "/settings", label: "Settings" },
  { href: "/admin-import", label: "Admin Import" }
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="border-b border-border bg-panel">
        <div className="container-app mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link href="/" className="text-lg font-semibold">
              R.O.L.L.
            </Link>
            <p className="text-xs text-foreground/60">Registry Of Legendary Luck</p>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
        <nav className="border-t border-border bg-panel/80">
          <div className="container-app mx-auto flex flex-wrap gap-2 px-6 py-3">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-[var(--radius)] px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "bg-accent text-black"
                      : "border border-transparent text-foreground/70 hover:border-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main id="main-content" className="container-app mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}