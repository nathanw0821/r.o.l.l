import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProgressSummary } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const summary = await getProgressSummary(session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Track legendary crafting unlocks across tiers with a compact, high-signal view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Total Effects</div>
              <div className="text-2xl font-semibold">{summary.total}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Unlocked</div>
              <div className="text-2xl font-semibold">{summary.unlocked}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Completion</div>
              <div className="text-2xl font-semibold">{summary.percent}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!session ? (
        <Card>
          <CardHeader>
            <CardTitle>Sign in to track progress</CardTitle>
            <CardDescription>
              Progress is saved per user. Sign in to store unlocked status and notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/auth/sign-in"
              className="inline-flex rounded-[var(--radius)] border border-border px-3 py-2 text-sm hover:border-accent"
            >
              Sign in
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
