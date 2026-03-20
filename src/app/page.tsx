import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers, getProgressSummary } from "@/lib/data";
import SummaryClient from "@/components/summary-client";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);
  const summary = await getProgressSummary(session?.user?.id);
  return <SummaryClient rows={rows} summary={summary} />;
}
