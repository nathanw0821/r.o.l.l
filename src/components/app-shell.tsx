"use client";

import * as React from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { Boxes, ClipboardList, LayoutDashboard, ListChecks, PanelLeftClose, PanelLeftOpen, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandStack from "@/components/brand-stack";
import SupportLink from "@/components/support-link";
import { useLocalProgress } from "@/components/use-local-progress";
import { formatTierStars } from "@/lib/tier-format";

type AppNavLink = {
  href: string;
  label: string;
  icon: typeof Sparkles;
  ariaLabel?: string;
  tierLabel?: string;
  requiresAuth?: boolean;
  activePaths?: string[];
  activePrefixes?: string[];
  /** When false, avoids prefetching the route (keeps tracker sessions free of extra RSC work). */
  prefetch?: boolean;
};

const links: AppNavLink[] = [
  { href: "/", label: "Summary", icon: Sparkles, activePaths: ["/", "/summary"] },
  { href: "/overview", label: "Overview", icon: LayoutDashboard, activePrefixes: ["/overview"] },
  { href: "/build", label: "Builder", icon: Boxes, activePrefixes: ["/build"], prefetch: false },
  { href: "/all-effects", label: "All Effects", icon: ListChecks },
  { href: "/1-star", label: "\u2606", ariaLabel: "1 Star", icon: Star, tierLabel: "1 Star" },
  { href: "/2-star", label: "\u2606\u2606", ariaLabel: "2 Star", icon: Star, tierLabel: "2 Star" },
  { href: "/3-star", label: "\u2606\u2606\u2606", ariaLabel: "3 Star", icon: Star, tierLabel: "3 Star" },
  { href: "/4-star", label: "\u2606\u2606\u2606\u2606", ariaLabel: "4 Star", icon: Star, tierLabel: "4 Star" },
  { href: "/still-need", label: "Still Need", icon: ClipboardList }
];

type TierProgressSummary = {
  tierLabel: string;
  total: number;
  unlocked: number;
  percent: number;
  effectTierIds: string[];
};

const SIDEBAR_COLLAPSE_KEY = "roll-sidebar-collapsed";
const MOBILE_SIDEBAR_SUPPRESS_KEY = "roll.mobile.sidebar.suppress";
function CommandHubShellFallback() {
  return (
    <div aria-hidden="true" className="command-hub">
      <div className="command-hub__bar">
        <div className="h-10 rounded-full bg-foreground/10" />
        <div className="h-10 w-20 rounded-full bg-foreground/10" />
        <div className="h-10 w-10 rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

const DeferredCommandHubShell = dynamic(() => import("@/components/command-hub-shell"), {
  ssr: false,
  loading: CommandHubShellFallback
});
const DeferredLocalProgressSync = dynamic(() => import("@/components/local-progress-sync"), { ssr: false });
const DeferredUsernameCompletion = dynamic(() => import("@/components/username-completion"), { ssr: false });
const DeferredFeedbackWidget = dynamic(() => import("@/components/feedback-widget"), { ssr: false });

function isNavLinkActive(pathname: string, link: AppNavLink) {
  if (link.activePaths?.includes(pathname)) {
    return true;
  }

  if (link.activePrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  return pathname === link.href;
}

export default function AppShell({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);
  const authKey = session?.user?.id ?? "guest";
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL ?? null;
  const [providers, setProviders] = React.useState<Record<string, { id: string; name: string }>>({});
  const [linkedProviders, setLinkedProviders] = React.useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileSidebarReveal, setMobileSidebarReveal] = React.useState(1);
  const mobileSidebarRevealRef = React.useRef(1);
  const { map: localProgress } = useLocalProgress(!isSignedIn);
  const [tierProgress, setTierProgress] = React.useState<TierProgressSummary[]>([]);
  const visibleLinks = React.useMemo(
    () => links.filter((link) => !link.requiresAuth || isSignedIn),
    [isSignedIn]
  );

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/tier-progress?auth=${encodeURIComponent(authKey)}`, {
      signal: controller.signal,
      cache: isSignedIn ? "no-store" : "force-cache"
    })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.success || !Array.isArray(payload.data?.tierProgress)) return;
        setTierProgress(payload.data.tierProgress);
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
    };
  }, [authKey, isSignedIn]);

  React.useEffect(() => {
    getProviders()
      .then((result) => setProviders(result ?? {}))
      .catch(() => setProviders({}));
  }, []);

  React.useEffect(() => {
    const stored =
      document.documentElement.getAttribute("data-sidebar-collapsed") ?? window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    setSidebarCollapsed(stored === "1");
  }, []);

  React.useEffect(() => {
    const value = sidebarCollapsed ? "1" : "0";
    document.documentElement.setAttribute("data-sidebar-collapsed", value);
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, value);
  }, [sidebarCollapsed]);

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    mobileSidebarRevealRef.current = mobileSidebarReveal;
  }, [mobileSidebarReveal]);

  React.useEffect(() => {
    if (!isMobile) {
      setMobileSidebarReveal(1);
      return;
    }

    let lastY = window.scrollY;
    let frame = 0;
    let pendingY = lastY;
    let revealRef = mobileSidebarRevealRef.current;
    const applyReveal = (next: number) => {
      const clamped = Math.max(0, Math.min(1, next));
      if (Math.abs(clamped - revealRef) < 0.02) return;
      revealRef = clamped;
      setMobileSidebarReveal(clamped);
    };
    const onFrame = () => {
      frame = 0;
      const suppress = window.sessionStorage.getItem(MOBILE_SIDEBAR_SUPPRESS_KEY) === "1";
      if (suppress) {
        applyReveal(0);
        lastY = pendingY;
        return;
      }
      const y = pendingY;
      if (y <= 24) {
        applyReveal(1);
        lastY = y;
        return;
      }
      const delta = y - lastY;
      if (delta > 0.5) {
        applyReveal(revealRef - delta / 120);
      } else if (delta < -0.5) {
        applyReveal(revealRef + (-delta) / 120);
      }
      lastY = y;
    };
    const handleScroll = () => {
      pendingY = window.scrollY;
      if (frame) return;
      frame = window.requestAnimationFrame(onFrame);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) return;
    const suppress = window.sessionStorage.getItem(MOBILE_SIDEBAR_SUPPRESS_KEY) === "1";
    if (!suppress) return;
    setMobileSidebarReveal(0);
    const timeout = window.setTimeout(() => {
      window.sessionStorage.removeItem(MOBILE_SIDEBAR_SUPPRESS_KEY);
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [isMobile, pathname]);

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
  const onToggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((value) => !value);
  }, []);
  const onSignOut = React.useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);
  const onLinkGoogleSettings = React.useCallback(() => {
    signIn("google", { callbackUrl: "/settings" });
  }, []);
  const onSignInGoogleHome = React.useCallback(() => {
    signIn("google", { callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pip-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className={cn("app-layout", sidebarRail && "app-layout--sidebar-rail")}>
        <aside
          style={
            isMobile
              ? ({
                  "--mobile-sidebar-reveal": String(mobileSidebarReveal)
                } as React.CSSProperties)
              : undefined
          }
          className={cn(
            "app-sidebar",
            sidebarRail && "app-sidebar--rail",
            isMobile && sidebarCollapsed && "app-sidebar--mobile-collapsed"
          )}
        >
          <div className="app-sidebar__top">
            <div className="app-brand">
            <BrandStack href="/" />
            </div>
            <button
              type="button"
              className="app-sidebar__collapse-button"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={sidebarCollapsed}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
          <nav className="app-nav">
            {visibleLinks.map((link) => {
              const active = isNavLinkActive(pathname, link);
              const Icon = link.icon;
              const tier = link.tierLabel ? tierLookup.get(link.tierLabel) : null;
              const linkLabel = tier ? `${formatTierStars(link.tierLabel)} ${tier.percent}%` : link.label;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch === false ? false : undefined}
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
                <div className="app-sidebar__auth-provider-slot" aria-hidden={!hasGoogleProvider}>
                  {hasGoogleProvider ? (
                    googleLinked ? (
                      <div className="app-sidebar__auth-status">Google linked</div>
                    ) : (
                      <button
                        type="button"
                        className="app-sidebar__auth-button app-sidebar__auth-button--google"
                        onClick={onLinkGoogleSettings}
                      >
                        Link Google
                      </button>
                    )
                  ) : null}
                </div>
                <button
                  type="button"
                  className="app-sidebar__auth-button"
                  onClick={onSignOut}
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
                <div className="app-sidebar__auth-provider-slot" aria-hidden={!hasGoogleProvider}>
                  {hasGoogleProvider ? (
                    <button
                      type="button"
                      className="app-sidebar__auth-button app-sidebar__auth-button--google"
                      onClick={onSignInGoogleHome}
                    >
                      Continue with Google
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
          <div className="app-sidebar__support">
            <SupportLink href={supportUrl} label="Help keep this tool alive" />
          </div>
        </aside>
        <div className="app-main">
          <div className="content-canvas">
            <DeferredLocalProgressSync />
            <DeferredCommandHubShell authKey={authKey} isSignedIn={isSignedIn} />
            <DeferredFeedbackWidget />
            <main id="main-content" className="content-panel">
              {children}
            </main>
            <DeferredUsernameCompletion />
          </div>
        </div>
      </div>
    </div>
  );
}
