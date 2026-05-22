import SummaryClient from "@/components/summary-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { getAllEffectTiers, getGlobalProgressSummary } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function SummaryPage() {
  const session = await getAppSession();
  const rows = await getAllEffectTiers(session?.user?.id);
  const unlocked = rows.filter((row) => row.unlocked).length;
  const summary = {
    total: rows.length,
    unlocked,
    percent: rows.length > 0 ? Math.round((unlocked / rows.length) * 100) : 0
  };

  const globalSummary = session?.user?.id
    ? await getGlobalProgressSummary(session.user.id)
    : null;

  const user = session?.user?.id 
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
    : null;

  return (
    <div className="space-y-6 summary-page-container">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Summary</h1>
        {user?.username && (
          <Link 
            href={`/u/${user.username}`} 
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Share Crafting Resume
          </Link>
        )}
      </div>
      <Card className="primary-page-header">
        <CardHeader>
          <CardTitle>Progress Diagnostic</CardTitle>
          <CardDescription>
            Detailed completion tracking for your current character and account-wide milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Active Character Progress</div>
                <div className="text-sm font-medium">{summary.percent}% ({summary.unlocked}/{summary.total})</div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
            </div>

            {globalSummary && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-accent">Account-Wide Progress (Unique Effects)</div>
                  <div className="text-sm font-medium text-accent">{globalSummary.percent}% ({globalSummary.unlocked}/{globalSummary.total})</div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${globalSummary.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-[0.78rem] text-foreground/50">
                  Total unique legendary effects unlocked across all characters in your roster.
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3 pt-2">
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs text-foreground/60">Total Effects</div>
                <div className="text-2xl font-semibold">{summary.total}</div>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs text-foreground/60">Unlocked (Char)</div>
                <div className="text-2xl font-semibold">{summary.unlocked}</div>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs text-foreground/60">Unlocked (Account)</div>
                <div className="text-2xl font-semibold">{globalSummary?.unlocked ?? summary.unlocked}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <SummaryClient rows={rows} isSignedIn={Boolean(session?.user?.id)} />
    </div>
  );
}
