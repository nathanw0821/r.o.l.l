import type { ReactNode } from "react";
import PageHeader from "@/components/page-header";
import OverviewTabs from "@/components/overview-tabs";

export default function OverviewLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="overview-shell">
      <PageHeader title="Overview" description="Profile, achievements, and readme." />
      <OverviewTabs />
      {children}
    </div>
  );
}
