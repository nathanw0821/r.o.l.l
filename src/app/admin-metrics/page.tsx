import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { forbidden } from "@/lib/api/responses";
import { getVisitorMetrics } from "@/lib/metrics";
import { format } from "date-fns";
import BrandStack from "@/components/brand-stack";
import type { VisitorStats } from "@prisma/client";

export default async function AdminMetricsPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminUser(session?.user)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-[var(--radius-lg)] border border-border bg-panel p-8 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-foreground/60 max-w-md">
          You do not have administrative privileges to view traffic metrics. 
          If you believe this is an error, please contact the site administrator.
        </p>
        <BrandStack align="center" className="mt-4" />
      </div>
    );
  }

  const metrics = await getVisitorMetrics(30);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Traffic Metrics</h1>
          <p className="text-sm text-foreground/60">
            Comparing guest vs. logged-in engagement over the last 30 days.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Hits (30d)" 
          value={metrics.reduce((acc: number, m: VisitorStats) => acc + m.guestHits + m.userHits, 0)} 
          subtitle="All page loads"
        />
        <MetricCard 
          title="Unique Guests (30d)" 
          value={metrics.reduce((acc: number, m: VisitorStats) => acc + m.uniqueGuests, 0)} 
          subtitle="Non-logged-in users"
          highlight
        />
        <MetricCard 
          title="Unique Users (30d)" 
          value={metrics.reduce((acc: number, m: VisitorStats) => acc + m.uniqueUsers, 0)} 
          subtitle="Logged-in users"
        />
        <MetricCard 
          title="Engagement Rate" 
          value={`${Math.round((metrics.reduce((acc: number, m: VisitorStats) => acc + m.uniqueUsers, 0) / (metrics.reduce((acc: number, m: VisitorStats) => acc + m.uniqueGuests, 0) || 1)) * 100)}%`}
          subtitle="Users vs. Guests"
        />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-panel overflow-hidden">
        <div className="border-b border-border bg-foreground/5 px-4 py-3 font-semibold">
          Daily Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/5 uppercase text-[0.78rem] tracking-wider text-foreground/50">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Unique Guests</th>
                <th className="px-4 py-2">Unique Users</th>
                <th className="px-4 py-2">Guest Hits</th>
                <th className="px-4 py-2">User Hits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.map((day: VisitorStats) => (
                <tr key={day.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 font-mono">{format(day.date, "MMM dd, yyyy")}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-accent">{day.uniqueGuests}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{day.uniqueUsers}</td>
                  <td className="px-4 py-3 text-foreground/60">{day.guestHits}</td>
                  <td className="px-4 py-3 text-foreground/60">{day.userHits}</td>
                </tr>
              ))}
              {metrics.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-foreground/40 italic">
                    No data recorded yet. Tracking started today!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, highlight = false }: { 
  title: string; 
  value: string | number; 
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-[var(--radius-lg)] border p-5 ${highlight ? 'border-accent bg-accent/5' : 'border-border bg-panel'}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-foreground/50">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${highlight ? 'text-accent' : ''}`}>{value}</div>
      <div className="mt-1 text-[0.78rem] text-foreground/40">{subtitle}</div>
    </div>
  );
}
