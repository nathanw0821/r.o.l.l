import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getVisitorMetrics } from "@/lib/metrics";
import { format, formatDistance } from "date-fns";
import BrandStack from "@/components/brand-stack";
import type { VisitorStats } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminMetricsPage({ searchParams }: PageProps) {
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

  // Next.js 15/16: searchParams is a Promise that must be awaited
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "overview";

  // 1. Fetch visitor traffic metrics (last 30 days)
  const metrics = await getVisitorMetrics(30);

  // 2. Fetch registration metrics
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, usersLast24h, usersLast7d, verifiedUsers, totalSyncs, totalImports] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({
      where: {
        OR: [
          { emailVerified: { not: null } },
          { accounts: { some: {} } }
        ]
      }
    }),
    prisma.syncRun.count(),
    prisma.importAudit.count()
  ]);

  // 3. Fetch latest 15 registered users for spam/bot audit
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      emailVerified: true,
      accounts: {
        select: { provider: true }
      },
      _count: {
        select: {
          characters: true,
          progress: true
        }
      }
    }
  });

  // 4. Fetch latest 10 crawler RSS sync runs
  const recentSyncs = await prisma.syncRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 10,
    include: {
      source: true
    }
  });

  // 5. Fetch latest 10 manual user import audits
  const recentImports = await prisma.importAudit.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: {
        select: { username: true, email: true }
      }
    }
  });

  // Tab configurations
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "User Registry & Spam Feed" },
    { id: "traffic", label: "Traffic Breakdown" },
    { id: "crawlers", label: "Crawler Sync Logs" },
    { id: "imports", label: "Import Audits" }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">R.O.L.L. Unified Admin Dashboard</h1>
          <p className="text-sm text-foreground/60">
            Streamlined metrics and system logs for security auditing, crawler syncs, and traffic analysis.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin-metrics?tab=${tab.id}`}
              className={`rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive 
                  ? "border-b-2 border-accent bg-accent/5 text-accent" 
                  : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/50">Core Platform KPI Cards</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard 
                title="Total Registered Users" 
                value={totalUsers} 
                subtitle="All-time user registry"
                highlight
              />
              <MetricCard 
                title="Recent Sign-ups (7d)" 
                value={usersLast7d} 
                subtitle="New profiles this week"
              />
              <MetricCard 
                title="30-Day Unique Visitors" 
                value={metrics.reduce((acc: number, m: VisitorStats) => acc + m.uniqueGuests + m.uniqueUsers, 0)} 
                subtitle="Daily unique guest + user hits"
              />
              <MetricCard 
                title="Active Crawler Syncs" 
                value={totalSyncs} 
                subtitle="RSS feed crawler runs logged"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-5 space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Database Summary</h3>
              <div className="divide-y divide-border text-sm">
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Total Registered Users</span>
                  <span className="font-mono font-bold">{totalUsers}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Verified / Social-linked Accounts</span>
                  <span className="font-mono font-bold text-emerald-500">{verifiedUsers}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Manual TSV/Excel Sheets Imported</span>
                  <span className="font-mono font-bold">{totalImports}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Crawler Crawler Sync Runs</span>
                  <span className="font-mono font-bold text-accent">{totalSyncs}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-5 space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">System Integrations status</h3>
              <div className="divide-y divide-border text-sm">
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Public Registration Route</span>
                  <span className="font-semibold text-emerald-500">Enabled</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Edge Rate Limiting Namespace</span>
                  <span className="font-mono font-semibold text-accent">KV_LIMITER</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Primary Hashing Scheme</span>
                  <span className="font-mono font-semibold text-accent">PBKDF2-SHA-256</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-foreground/60">Bcrypt Legacy Upgrade Path</span>
                  <span className="font-semibold text-emerald-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: User Registry & Spam Feed */}
      {activeTab === "users" && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-panel overflow-hidden animate-in fade-in duration-200">
          <div className="border-b border-border bg-foreground/5 px-4 py-3 font-semibold">
            Latest Registered Profiles (Audit Mode)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/5 uppercase text-[0.78rem] tracking-wider text-foreground/50">
                  <th className="px-4 py-2">Registered At</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2 text-center">Auth Method</th>
                  <th className="px-4 py-2 text-center">Chars</th>
                  <th className="px-4 py-2 text-center">Progress Unlocks</th>
                  <th className="px-4 py-2">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentUsers.map((user) => {
                  const providers = user.accounts.map(a => a.provider.toUpperCase()).join(", ") || "Credentials";
                  const charCount = user._count.characters;
                  const progCount = user._count.progress;
                  const isVerified = user.emailVerified || user.accounts.length > 0;
                  
                  // Bot Heuristic: 0 characters, 0 progress, no linked socials, unverified email
                  const looksLikeBot = charCount === 0 && progCount === 0 && !isVerified;

                  return (
                    <tr key={user.id} className={`hover:bg-foreground/5 transition-colors ${looksLikeBot ? 'bg-[color:var(--color-warning)]/5' : ''}`}>
                      <td className="px-4 py-3 font-mono">{format(user.createdAt, "MMM dd, yyyy HH:mm")}</td>
                      <td className="px-4 py-3 font-semibold flex items-center gap-2">
                        {user.username || "Anonymous"}
                        {looksLikeBot && (
                          <span className="rounded bg-[color:var(--color-warning)]/20 px-1.5 py-0.5 text-[0.7rem] font-bold text-[color:var(--color-warning)]">
                            SPAM RISK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground/80">{user.email || "N/A"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-[var(--radius)] bg-foreground/10 px-2 py-0.5 text-xs">
                          {providers}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-accent">{charCount}</td>
                      <td className="px-4 py-3 text-center text-foreground/75">{progCount}</td>
                      <td className="px-4 py-3">
                        {isVerified ? (
                          <span className="text-emerald-500 font-medium">✓ Verified</span>
                        ) : (
                          <span className="text-foreground/40 italic">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-foreground/40 italic">
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Traffic Breakdown */}
      {activeTab === "traffic" && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-panel overflow-hidden animate-in fade-in duration-200">
          <div className="border-b border-border bg-foreground/5 px-4 py-3 font-semibold">
            Daily Visitor Traffic Statistics (30 Days)
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
                      No traffic data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Crawler Sync Logs */}
      {activeTab === "crawlers" && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-panel overflow-hidden animate-in fade-in duration-200">
          <div className="border-b border-border bg-foreground/5 px-4 py-3 font-semibold">
            Bethesda & RSS News Crawler Sync Runs
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/5 uppercase text-[0.78rem] tracking-wider text-foreground/50">
                  <th className="px-4 py-2">Sync Time</th>
                  <th className="px-4 py-2">Source Feed</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Duration</th>
                  <th className="px-4 py-2">Import Summary / Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentSyncs.map((run) => {
                  const duration = run.completedAt 
                    ? formatDistance(run.startedAt, run.completedAt)
                    : "Running...";
                  
                  const isSuccess = run.status.toLowerCase() === "success";
                  const summaryStr = run.summary ? JSON.stringify(run.summary) : "";
                  const errorStr = run.errorSummary ? JSON.stringify(run.errorSummary) : "";

                  return (
                    <tr key={run.id} className="hover:bg-foreground/5 transition-colors">
                      <td className="px-4 py-3 font-mono">{format(run.startedAt, "MMM dd, HH:mm")}</td>
                      <td className="px-4 py-3 font-semibold">
                        {run.source?.name || " Bethesday Core"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                          isSuccess 
                            ? "bg-emerald-500/20 text-emerald-500" 
                            : "bg-[color:var(--color-warning)]/20 text-[color:var(--color-warning)]"
                        }`}>
                          {run.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/60">{duration}</td>
                      <td className="px-4 py-3 font-mono text-xs max-w-xs truncate text-foreground/75" title={isSuccess ? summaryStr : errorStr}>
                        {isSuccess ? (summaryStr || "No new rows") : (errorStr || "Fetch failure")}
                      </td>
                    </tr>
                  );
                })}
                {recentSyncs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-foreground/40 italic">
                      No crawler sync runs have been executed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Import Audits */}
      {activeTab === "imports" && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-panel overflow-hidden animate-in fade-in duration-200">
          <div className="border-b border-border bg-foreground/5 px-4 py-3 font-semibold">
            Manual Sheets & TSV Upload Import Audits
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/5 uppercase text-[0.78rem] tracking-wider text-foreground/50">
                  <th className="px-4 py-2">Import Time</th>
                  <th className="px-4 py-2">Uploader</th>
                  <th className="px-4 py-2">Filename</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">Row Errors</th>
                  <th className="px-4 py-2">Audit Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentImports.map((audit) => {
                  const isSuccess = audit.status.toLowerCase() === "success" || audit.status.toLowerCase() === "completed";
                  const errorMsg = audit.errorSummary ? JSON.stringify(audit.errorSummary) : "None";

                  return (
                    <tr key={audit.id} className="hover:bg-foreground/5 transition-colors">
                      <td className="px-4 py-3 font-mono">{format(audit.createdAt, "MMM dd, HH:mm")}</td>
                      <td className="px-4 py-3 font-semibold">
                        {audit.user?.username || audit.user?.email || "System Admin"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[150px]" title={audit.filename}>
                        {audit.filename}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                          isSuccess 
                            ? "bg-emerald-500/20 text-emerald-500" 
                            : "bg-[color:var(--color-warning)]/20 text-[color:var(--color-warning)]"
                        }`}>
                          {audit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-foreground/80">{audit.errorCount}</td>
                      <td className="px-4 py-3 font-mono text-xs max-w-xs truncate text-foreground/60" title={errorMsg}>
                        {errorMsg}
                      </td>
                    </tr>
                  );
                })}
                {recentImports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-foreground/40 italic">
                      No sheet import audits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
