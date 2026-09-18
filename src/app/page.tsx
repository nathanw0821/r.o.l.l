import { Suspense } from "react";
import SummaryClient, { type SummaryRow } from "@/components/summary-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminUser } from "@/lib/app-config";
import { getAppSession } from "@/lib/auth";
import { getAllEffectTiers, getProgressSummary } from "@/lib/data";
import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AppalachianRadar from "@/components/appalachian-radar";
import PatchChangesPanel from "@/components/patch-changes-panel";
import SeasonBanner from "@/components/season-banner";
import AtomicShopCard from "@/components/atomic-shop-card";

async function HomeSummaryOverview() {
  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Graceful session fallback
  }

  let summary = { percent: 0, unlocked: 0, total: FALLBACK_LEGENDARY_EFFECTS.length };
  try {
    summary = await getProgressSummary(session?.user?.id);
  } catch (e) {
    console.error("[HomeSummaryOverview] Failed to load progress summary:", e);
  }

  let sampleBuild: { slug: string; title: string } | null = null;
  if (!session?.user?.id) {
    try {
      sampleBuild = await prisma.sharedBuild.findFirst({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: { slug: true, title: true },
      });
    } catch {
      // Graceful DB fallback: no sample link
    }
  }

  let user: { username: string | null } | null = null;
  if (session?.user?.id) {
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true }
      });
    } catch {
      // Graceful DB fallback
    }
  }

  return (
    <Card className="primary-page-header border border-border/30 bg-panel shadow-sm font-mono overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-mono font-bold text-foreground">Legendary tracker</h1>
            <p className="text-sm font-mono text-foreground/60 leading-relaxed">
              Track which legendary mods you have learned, build loadouts, and check damage against the current patch.
            </p>
          </div>
          {!user?.username && sampleBuild && (
            <Link
              href={`/l/${sampleBuild.slug}`}
              title={sampleBuild.title}
              className="inline-flex max-w-full items-center gap-2 px-4 py-2 border border-accent/60 text-accent rounded-lg text-xs font-mono font-bold hover:bg-accent/10 transition"
            >
              Open a sample build
            </Link>
          )}
          {user?.username && (
            <Link 
              href={`/u/${user.username}`} 
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-xs font-mono font-bold uppercase hover:bg-accent/90 transition shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              Share profile
            </Link>
          )}
        </div>
        
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-foreground/70">
            <span>Learned so far</span>
            <span className="text-accent font-mono">{summary.percent}% ({summary.unlocked}/{summary.total})</span>
          </div>
          <div className="h-2.5 w-full bg-background/50 rounded-full overflow-hidden border border-border/30 p-0.5">
            <div 
              className="h-full bg-accent transition-all duration-500 rounded-full shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]" 
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>
        
        <div className="pt-3 border-t border-border/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/30 bg-background/30 p-3.5 flex flex-col justify-center">
            <span className="text-[0.72rem] font-mono text-foreground/50">Mod effects in the game</span>
            <span className="text-2xl font-mono font-bold text-foreground mt-1">{summary.total}</span>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/30 p-3.5 flex flex-col justify-center">
            <span className="text-[0.72rem] font-mono text-foreground/50">Learned</span>
            <span className="text-2xl font-mono font-bold text-foreground mt-1">{summary.unlocked}</span>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/30 p-3.5 flex flex-col justify-center">
            <span className="text-[0.72rem] font-mono text-foreground/50">Complete</span>
            <span className="text-2xl font-mono font-bold text-foreground mt-1">{summary.percent}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function HomeSummaryOverviewFallback() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>
          Track which legendary mods you have learned, build loadouts, and check damage against the current patch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="h-3 w-24 rounded bg-foreground/10" />
            <div className="mt-2 h-8 w-16 rounded bg-foreground/10" />
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="h-3 w-20 rounded bg-foreground/10" />
            <div className="mt-2 h-8 w-14 rounded bg-foreground/10" />
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="h-3 w-24 rounded bg-foreground/10" />
            <div className="mt-2 h-8 w-12 rounded bg-foreground/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function HomeSummaryTracker() {
  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Graceful session fallback
  }
  const isAdmin = isAdminUser(session?.user);

  let rows: SummaryRow[] = [];
  try {
    rows = await getAllEffectTiers(session?.user?.id);
  } catch (e) {
    console.error("[HomeSummaryTracker] Failed to load effect tiers:", e);
  }

  return <SummaryClient rows={rows} isSignedIn={Boolean(session?.user?.id)} isAdmin={isAdmin} />;
}

function HomeSummaryTrackerFallback() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-foreground/10" />
          <div className="h-3 w-64 max-w-full rounded bg-foreground/10" />
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="h-8 w-20 rounded-full bg-foreground/10" />
            <div className="h-8 w-16 rounded-full bg-foreground/10" />
            <div className="h-8 w-16 rounded-full bg-foreground/10" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-h-[220px] rounded-[var(--radius)] border border-border bg-panel/70 p-4" />
        <div className="min-h-[220px] rounded-[var(--radius)] border border-border bg-panel/70 p-4" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6 summary-page-container">
      <SeasonBanner />
      <AppalachianRadar />
      <Suspense fallback={<HomeSummaryOverviewFallback />}>
        <HomeSummaryOverview />
      </Suspense>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <PatchChangesPanel />
        <AtomicShopCard />
      </div>
      <Suspense fallback={<HomeSummaryTrackerFallback />}>
        <HomeSummaryTracker />
      </Suspense>
    </div>
  );
}
