"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { Award, BookOpen, ClipboardList, ListChecks, PanelLeftClose, PanelLeftOpen, Sparkles, Star, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandStack from "@/components/brand-stack";
import CommandHubShell from "@/components/command-hub-shell";
import LocalProgressSync from "@/components/local-progress-sync";
import SupportLink from "@/components/support-link";
import { useLocalProgress } from "@/components/use-local-progress";
import UsernameCompletion from "@/components/username-completion";
import FeedbackWidget from "@/components/feedback-widget";
import { formatTierStars } from "@/lib/tier-format";

const links = [
  { href: "/", label: "Summary", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: UserCircle2, requiresAuth: true },
  { href: "/all-effects", label: "All Effects", icon: ListChecks },
  { href: "/1-star", label: "\u2606", ariaLabel: "1 Star", icon: Star, tierLabel: "1 Star" },
  { href: "/2-star", label: "\u2606\u2606", ariaLabel: "2 Star", icon: Star, tierLabel: "2 Star" },
  { href: "/3-star", label: "\u2606\u2606\u2606", ariaLabel: "3 Star", icon: Star, tierLabel: "3 Star" },
  { href: "/4-star", label: "\u2606\u2606\u2606\u2606", ariaLabel: "4 Star", icon: Star, tierLabel: "4 Star" },
  { href: "/still-need", label: "Still Need", icon: ClipboardList },
  { href: "/achievements", label: "Achievements", icon: Award, requiresAuth: true },
  { href: "/readme", label: "Readme", icon: BookOpen }
];

type TierProgressSummary = {
  tierLabel: string;
  total: number;
  unlocked: number;
  percent: number;
  effectTierIds: string[];
};

const SIDEBAR_COLLAPSE_KEY = "roll-sidebar-collapsed";

export default function AppShell({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL ?? null;
  const [providers, setProviders] = React.useState<Record<string, { id: string; name: string }>>({});
  const [linkedProviders, setLinkedProviders] = React.useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileSidebarHidden, setMobileSidebarHidden] = React.useState(false);
  const { map: localProgress } = useLocalProgress(!isSignedIn);
  const [tierProgress, setTierProgress] = React.useState<TierProgressSummary[]>([]);
  const visibleLinks = links.filter((link) => !link.requiresAuth || session?.user);

  React.useEffect(() => {
    let active = true;
    const authKey = session?.user?.id ?? "guest";
    fetch(`/api/tier-progress?auth=${encodeURIComponent(authKey)}&t=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.success || !Array.isArray(payload.data?.tierProgress)) return;
        setTierProgress(payload.data.tierProgress);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isSignedIn, session?.user?.id]);

  React.useEffect(() => {
    getProviders()
      .then((result) => setProviders(result ?? {}))
      .catch(() => setProviders({}));
  }, []);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    setSidebarCollapsed(stored === "1");
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    if (!isMobile) {
      setMobileSidebarHidden(false);
      return;
    }

    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y <= 24) {
        setMobileSidebarHidden(false);
        lastY = y;
        return;
      }
      if (y > lastY + 8) {
        setMobileSidebarHidden(true);
      } else if (y < lastY - 8) {
        setMobileSidebarHidden(false);
      }
      lastY = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  React.useEffect(() => {
    if (!isSignedIn) {
      setLinkedProviders([]);
      return;
    }
    fetch("/api/account-links")
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.success) {
          setLinkedProviders(payload.data.providers ?? []);
        }
      })
      .catch(() => setLinkedProviders([]));
  }, [isSignedIn]);

  const displayTierProgress = React.useMemo(
    () =>
      tierProgress.map((tier) => {
        if (isSignedIn) return tier;
        const unlocked = tier.effectTierIds.reduce(
          (count, effectTierId) => count + (localProgress[effectTierId] ? 1 : 0),
          0
        );
        return {
          ...tier,
          unlocked,
          percent: tier.total > 0 ? Math.round((unlocked / tier.total) * 100) : 0
        };
      }),
    [isSignedIn, localProgress, tierProgress]
  );

  const tierLookup = React.useMemo(
    () => new Map(displayTierProgress.map((tier) => [tier.tierLabel, tier])),
    [displayTierProgress]
  );
  const hasGoogleProvider = Boolean(providers.google);
  const googleLinked = linkedProviders.includes("google");
  const sidebarRail = sidebarCollapsed && !isMobile;

  return (
    <div className="min-h-screen bg-background text-foreground pip-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className={cn("app-layout", sidebarRail && "app-layout--sidebar-rail")}>
        <aside
          className={cn(
            "app-sidebar",
            sidebarRail && "app-sidebar--rail",
            isMobile && sidebarCollapsed && "app-sidebar--mobile-collapsed",
            isMobile && mobileSidebarHidden && "app-sidebar--mobile-hidden"
          )}
        >
          <div className="app-sidebar__top">
            <div className="app-brand">
            <BrandStack href="/" />
            </div>
            <button
              type="button"
              className="app-sidebar__collapse-button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={sidebarCollapsed}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
          <nav className="app-nav">
            {visibleLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              const tier = link.tierLabel ? tierLookup.get(link.tierLabel) : null;
              const linkLabel = tier ? `${formatTierStars(link.tierLabel)} ${tier.percent}%` : link.label;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={
                    tier ? `${link.ariaLabel ?? link.label} ${tier.percent}% complete` : link.ariaLabel ?? link.label
                  }
                  className={cn("app-nav__link", active && "app-nav__link--active")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{linkLabel}</span>
                </Link>
              );
            })}
          </nav>
          <div className="app-sidebar__auth">
            {isSignedIn ? (
              <>
                {hasGoogleProvider ? (
                  googleLinked ? (
                    <div className="app-sidebar__auth-status">Google linked</div>
                  ) : (
                    <button
                      type="button"
                      className="app-sidebar__auth-button app-sidebar__auth-button--google"
                      onClick={() => signIn("google", { callbackUrl: "/settings" })}
                    >
                      Link Google
                    </button>
                  )
                ) : null}
                <button
                  type="button"
                  className="app-sidebar__auth-button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className="app-sidebar__auth-button">
                  Sign in
                </Link>
                <Link href="/auth/sign-up" className="app-sidebar__auth-button app-sidebar__auth-button--primary">
                  Sign up
                </Link>
                {hasGoogleProvider ? (
                  <button
                    type="button"
                    className="app-sidebar__auth-button app-sidebar__auth-button--google"
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                  >
                    Continue with Google
                  </button>
                ) : null}
              </>
            )}
          </div>
          <div className="app-sidebar__support">
            <SupportLink href={supportUrl} label="Help keep this tool alive" />
          </div>
        </aside>
        <div className="app-main">
          <div className="content-canvas">
            <LocalProgressSync />
            <UsernameCompletion />
            <CommandHubShell />
            <FeedbackWidget />
            <main id="main-content" className="content-panel">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
