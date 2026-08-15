"use client";

import * as React from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  Boxes,
  FlaskConical,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Sparkles,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import BrandStack from "@/components/brand-stack";
import SupportLink from "@/components/support-link";
import { useLocalProgress } from "@/components/use-local-progress";
import { formatTierStars } from "@/lib/tier-format";
import { usePersistedAppNavigation } from "@/components/use-persisted-app-navigation";
import { useBuilderBetaAccess } from "@/components/builder/builder-beta-gate";
import { CharacterSelector } from "@/components/character-selector";
import MigrationNotice from "@/components/migration-notice";
import { useVisitorTracking } from "@/lib/hooks/use-visitor-tracking";

interface AppSubLink {
  href: string;
  label: string;
  ariaLabel?: string;
  tierLabel?: string;
}

interface AppNavLink {
  href: string;
  label: string;
  ariaLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  activePaths?: string[];
  activePrefixes?: string[];
  prefetch?: boolean;
  tierLabel?: string;
  isBuildTab?: boolean;
  requiresAuth?: boolean;
  subLinks?: AppSubLink[];
}

const trackingLinks: AppNavLink[] = [
  { href: "/wiki", label: "Truth Wiki", icon: BookOpen, activePaths: ["/wiki"] },
  { href: "/", label: "Summary", icon: Sparkles, activePaths: ["/", "/summary"] },
  {
    href: "/all-effects",
    label: "Legendary Tracking",
    icon: ListChecks,
    activePrefixes: ["/1-star", "/2-star", "/3-star", "/4-star", "/all-effects"],
    subLinks: [
      { href: "/1-star", label: "★ 1 Star Mods", tierLabel: "1 Star" },
      { href: "/2-star", label: "★★ 2 Star Mods", tierLabel: "2 Star" },
      { href: "/3-star", label: "★★★ 3 Star Mods", tierLabel: "3 Star" },
      { href: "/4-star", label: "★★★★ 4 Star Mods", tierLabel: "4 Star" },
      { href: "/all-effects", label: "All Mod Effects" }
    ]
  },
  {
    href: "/build",
    label: "B.U.I.L.D.",
    icon: Boxes,
    activePrefixes: ["/build", "/perks"],
    prefetch: false,
    isBuildTab: true,
    subLinks: [
      { href: "/build?tab=gear", label: "🛡️ Gear & Armory" },
      { href: "/build?tab=perks", label: "🎴 Perk Deck & SPECIAL" },
      { href: "/build?tab=biometrics", label: "🧪 Biometrics & Stances" },
      { href: "/build?tab=combat", label: "📊 Combat DPS & VATS" }
    ]
  },
  { href: "/pts", label: "P.T.S.", icon: FlaskConical, activePrefixes: ["/pts"] },
  { href: "/screenshot-assist", label: "S.C.A.N.", icon: Sparkles },
  { href: "/transmissions", label: "Transmissions", icon: Radio, activePrefixes: ["/transmissions"] },
  { href: "/overview/achievements", label: "Achievements", icon: Trophy, activePrefixes: ["/overview/achievements"] }
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
const DeferredTermsModal = dynamic(() => import("@/components/terms-modal"), { ssr: false });
const DeferredGuestSignupBanner = dynamic(() => import("@/components/guest-signup-banner"), { ssr: false });

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
  children,
  isAdmin = false
}: {
  children: ReactNode;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || (pathname === "/perks" ? "perks" : "gear");
  const { canGoBack, goBack } = usePersistedAppNavigation();
  const { data: session } = useSession();
  useVisitorTracking();
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
  useBuilderBetaAccess(isAdmin);
  const [tierProgress, setTierProgress] = React.useState<TierProgressSummary[]>([]);
  const visibleTrackingLinks = React.useMemo(
    () => trackingLinks.filter((link) => {
      if (link.requiresAuth && !isSignedIn) return false;
      return true;
    }),
    [isSignedIn]
  );

interface TierProgressResponse {
  success?: boolean;
  data?: {
    tierProgress?: TierProgressSummary[];
  };
}

interface AccountLinksResponse {
  success?: boolean;
  data?: {
    providers?: string[];
  };
}

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/tier-progress?auth=${encodeURIComponent(authKey)}`, {
      signal: controller.signal,
      cache: isSignedIn ? "no-store" : "force-cache"
    })
      .then((response) => response.json() as Promise<TierProgressResponse>)
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
    let scrollStopTimeout: number | null = null;
    let accumulatedUpScroll = 0;

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
        if (scrollStopTimeout) {
          window.clearTimeout(scrollStopTimeout);
          scrollStopTimeout = null;
        }
        accumulatedUpScroll = 0;
        return;
      }
      const delta = y - lastY;
      if (delta > 0.5) {
        // Scrolling down: immediately hide the bar incrementally, cancel upward reveal timers
        if (scrollStopTimeout) {
          window.clearTimeout(scrollStopTimeout);
          scrollStopTimeout = null;
        }
        accumulatedUpScroll = 0;
        applyReveal(revealRef - delta / 120);
      } else if (delta < -0.5) {
        // Scrolling up: don't reveal immediately during active fast scroll.
        // Instead, accumulate upward distance and reveal only when scroll stops or slows.
        accumulatedUpScroll += Math.abs(delta);
        if (scrollStopTimeout) {
          window.clearTimeout(scrollStopTimeout);
        }
        scrollStopTimeout = window.setTimeout(() => {
          if (accumulatedUpScroll > 30) {
            applyReveal(1);
          }
          accumulatedUpScroll = 0;
          scrollStopTimeout = null;
        }, 150) as unknown as number;
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
      if (scrollStopTimeout) window.clearTimeout(scrollStopTimeout);
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
      .then((response) => response.json() as Promise<AccountLinksResponse>)
      .then((payload) => {
        if (payload?.success) {
          setLinkedProviders(payload.data?.providers ?? []);
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
  const hasDiscordProvider = Boolean(providers.discord);
  const googleLinked = linkedProviders.includes("google");
  const discordLinked = linkedProviders.includes("discord");
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
  const onLinkDiscordSettings = React.useCallback(() => {
    signIn("discord", { callbackUrl: "/settings" });
  }, []);
  const onSignInGoogleHome = React.useCallback(() => {
    signIn("google", { callbackUrl: "/" });
  }, []);
  const onSignInDiscordHome = React.useCallback(() => {
    signIn("discord", { callbackUrl: "/" });
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
            <div className="app-brand flex flex-col gap-1.5">
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
            <button
              type="button"
              className={cn("app-nav__link app-nav__button", !canGoBack && "pointer-events-none opacity-40")}
              disabled={!canGoBack}
              aria-disabled={!canGoBack}
              aria-label={canGoBack ? "Go back to previous page" : "No previous page in history"}
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span>Back</span>
            </button>
            {visibleTrackingLinks.map((link) => {
              const active = isNavLinkActive(pathname, link);
              const Icon = link.icon;
              const tier = link.tierLabel ? tierLookup.get(link.tierLabel) : null;
              const linkLabel = tier ? `${formatTierStars(link.tierLabel)} ${tier.percent}%` : link.label;

              return (
                <React.Fragment key={link.href}>
                  {link.isBuildTab && <div className="my-2 border-t border-border/20" />}
                  <Link
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
                  {/* Render Subcategory Links (Legendary Tiers or BUILD Subsections) */}
                  {link.subLinks && (active || link.subLinks.some((sub) => pathname === sub.href || (sub.href.startsWith(pathname) && pathname === "/build"))) && !sidebarCollapsed && (
                    <div className="pl-6 space-y-0.5 my-1 border-l-2 border-amber-500/40 ml-4 font-mono text-xs">
                      {link.subLinks.map((sub) => {
                        const isTabSub = sub.href.includes("?tab=");
                        const subTab = isTabSub ? sub.href.split("?tab=")[1] : null;
                        const subActive = subTab
                          ? (pathname === "/build" || pathname === "/perks") && currentTab === subTab
                          : pathname === sub.href;
                        const subTier = sub.tierLabel ? tierLookup.get(sub.tierLabel) : null;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "flex items-center justify-between px-2.5 py-1 rounded transition-all text-[0.72rem]",
                              subActive
                                ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/50 shadow-sm"
                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                          >
                            <span>{sub.label}</span>
                            {subTier && (
                              <span className="text-[0.62rem] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
                                {subTier.percent}%
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <div className="app-sidebar__auth space-y-2">
              {isSignedIn ? (
                <>
                  <div className="flex flex-col gap-1.5">
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

                    {hasDiscordProvider ? (
                      discordLinked ? (
                        <div className="app-sidebar__auth-status app-sidebar__auth-status--discord">Discord linked</div>
                      ) : (
                        <button
                          type="button"
                          className="app-sidebar__auth-button app-sidebar__auth-button--discord"
                          onClick={onLinkDiscordSettings}
                        >
                          Link Discord
                        </button>
                      )
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="app-sidebar__auth-button mt-1"
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
                  <div className="flex flex-col gap-1.5">
                    {hasGoogleProvider ? (
                      <button
                        type="button"
                        className="app-sidebar__auth-button app-sidebar__auth-button--google"
                        onClick={onSignInGoogleHome}
                      >
                        Continue with Google
                      </button>
                    ) : null}
                    {hasDiscordProvider ? (
                      <button
                        type="button"
                        className="app-sidebar__auth-button app-sidebar__auth-button--discord"
                        onClick={onSignInDiscordHome}
                      >
                        Continue with Discord
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
            <div className="app-sidebar__support">
              <SupportLink href={supportUrl} label="Help keep this tool alive" />
            </div>
            {isSignedIn && (
              <div className="w-full">
                <CharacterSelector collapsed={sidebarRail} />
              </div>
            )}
          </div>
        </aside>
        <div className="app-main">
          <div className="content-canvas">
            <div className="top-scroll-mask" />
            <DeferredLocalProgressSync />
            <DeferredCommandHubShell authKey={authKey} isSignedIn={isSignedIn} />
            <DeferredFeedbackWidget />
            <main id="main-content" className="content-panel">
              <DeferredGuestSignupBanner />
              {children}
            </main>
            <DeferredUsernameCompletion />

            {/* Global Active Build Bar (Persistent Navigation Pill) */}
            <div className="my-4 pip-terminal-panel p-3 rounded-xl border border-amber-500/30 bg-slate-950/90 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs shadow-xl">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="font-bold text-amber-400 uppercase tracking-wider">ACTIVE VAULT LOADOUT: </span>
                  <span className="text-slate-200">Civil Engineer / Fixer Build Stack</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/build"
                  className="px-3 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-bold uppercase transition-all"
                >
                  B.U.I.L.D. Sandbox ↗
                </Link>
                <Link
                  href="/perks"
                  className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 font-bold uppercase transition-all"
                >
                  P.E.R.K. Deck ↗
                </Link>
              </div>
            </div>

            {/* Retro pip-boy styled footer */}
            <footer className="mt-8 border-t border-border/40 pt-6 pb-6 text-xs text-slate-400 font-mono space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="text-[0.70rem] text-slate-300 font-bold">© 2026 R.O.L.L. RECORD OF LEGENDARY LOADOUTS</span>
                <div className="flex items-center gap-3 text-[0.68rem]">
                  <Link href="/rules" className="hover:text-amber-400 transition-colors">&gt; COMMUNITY RULES</Link>
                  <span className="text-slate-700">|</span>
                  <Link href="/terms" className="hover:text-amber-400 transition-colors">&gt; TERMS OF SERVICE</Link>
                  <span className="text-slate-700">|</span>
                  <Link href="/privacy" className="hover:text-amber-400 transition-colors">&gt; PRIVACY POLICY</Link>
                </div>
              </div>

              {/* Official Bethesda Fan Content & Legal Attribution Banner */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[0.62rem] text-slate-400 leading-relaxed font-sans space-y-1">
                <div className="flex items-center justify-between text-[0.65rem] font-mono text-amber-400/90 font-bold uppercase tracking-wider">
                  <span>OFFICIAL BETHESDA FAN CONTENT DISCLAIMER</span>
                  <span>100% NON-COMMERCIAL / FAIR USE</span>
                </div>
                <p>
                  Fallout, Fallout 76, Vault-Tec, S.P.E.C.I.A.L., and related trademarks, logos, and game artwork are registered trademarks and copyrighted property of Bethesda Softworks LLC / ZeniMax Media Inc. R.O.L.L. is an independent community tool created under Fair Use (17 U.S.C. § 107) and Bethesda Fan Content guidelines.
                </p>
                <div className="pt-1 flex items-center gap-3 text-[0.62rem] font-mono text-slate-400">
                  <span>Outbound Credits:</span>
                  <a href="https://nukaknights.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 underline">NukaKnights Datamines</a>
                  <span>•</span>
                  <a href="https://fallout.fandom.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 underline">Fallout Wiki</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
      <MigrationNotice />
      {isSignedIn && <DeferredTermsModal userEmail={session?.user?.email} />}
    </div>
  );
}
