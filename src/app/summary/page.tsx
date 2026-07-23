import SummaryClient from "@/components/summary-client";
import { Card } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
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

  const user = session?.user?.id 
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
    : null;

  return (
    <div className="space-y-6 summary-page-container">
      <Card className="primary-page-header border border-border/30 bg-panel shadow-sm font-mono overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-mono font-bold uppercase tracking-wider text-foreground">SUMMARY</h1>
              <p className="text-sm font-mono text-foreground/60 leading-relaxed">
                Track legendary crafting unlocks across tiers with a compact, high-signal view.
              </p>
            </div>
            {user?.username && (
              <Link 
                href={`/u/${user.username}`} 
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-xs font-mono font-bold uppercase hover:bg-accent/90 transition shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                Share Resume
              </Link>
            )}
          </div>
          
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-foreground/70">
              <span>Overall Completion Progress</span>
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
              <span className="text-[0.72rem] font-mono uppercase tracking-widest text-foreground/50">Total Effects</span>
              <span className="text-2xl font-mono font-bold text-foreground mt-1">{summary.total}</span>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/30 p-3.5 flex flex-col justify-center">
              <span className="text-[0.72rem] font-mono uppercase tracking-widest text-foreground/50">Unlocked</span>
              <span className="text-2xl font-mono font-bold text-foreground mt-1">{summary.unlocked}</span>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/30 p-3.5 flex flex-col justify-center">
              <span className="text-[0.72rem] font-mono uppercase tracking-widest text-foreground/50">Completion</span>
              <span className="text-2xl font-mono font-bold text-foreground mt-1">{summary.percent}%</span>
            </div>
          </div>
        </div>
      </Card>
      <SummaryClient rows={rows} isSignedIn={Boolean(session?.user?.id)} />
    </div>
  );
}
