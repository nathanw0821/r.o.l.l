import type { ReactNode } from "react";
import PageHeader from "@/components/page-header";
import OverviewTabs from "@/components/overview-tabs";

export default async function OverviewLayout({
  children
}: {
  children: ReactNode;
}) {

  return (
    <div className="overview-shell max-w-6xl mx-auto">
      <div className="mb-6">
        <PageHeader title="Overview" description="Account profile, achievements, and in-app readme." />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <OverviewTabs />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
