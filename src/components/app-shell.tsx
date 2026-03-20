"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { Award, BookOpen, ClipboardList, ListChecks, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandStack from "@/components/brand-stack";
import CommandHubShell from "@/components/command-hub-shell";
import LocalProgressSync from "@/components/local-progress-sync";
import SupportLink from "@/components/support-link";
import { useLocalProgress } from "@/components/use-local-progress";
import { useRewards } from "@/components/rewards-provider";
import UsernameCompletion from "@/components/username-completion";
import FeedbackWidget from "@/components/feedback-widget";
import { formatTierStars } from "@/lib/tier-format";

const links = [
  { href: "/", label: "Summary", icon: Sparkles },
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

export default function AppShell({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { status: rewardsStatus } = useRewards();
  const isSignedIn = Boolean(session?.user);
  const [providers, setProviders] = React.useState<Record<string, { id: string; name: string }>>({});
  const [linkedProviders, setLinkedProviders] = React.useState<string[]>([]);
  const { map: localProgress } = useLocalProgress(!isSignedIn);
  const [tierProgress, setTierProgress] = React.useState<TierProgressSummary[]>([]);
  const visibleLinks = links.filter((link) => !link.requiresAuth || session?.user);

  React.useEffect(() => {
    let active = true;
    fetch("/api/tier-progress", { cache: "no-store" })
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
            <SupportLink href={rewardsStatus?.supportUrl} label="Help keep this tool alive" />
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
