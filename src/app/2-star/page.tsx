import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEffectTiersByTierLabel } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { formatTierStars } from "@/lib/tier-format";

const tierLabel = "2 Star";

export default async function TierTwoPage() {
  const session = await getServerSession(authOptions);
  const rows = await getEffectTiersByTierLabel(tierLabel, session?.user?.id);

  return (
    <EffectTable
      rows={rows}
      canEdit={Boolean(session)}
      title={`${formatTierStars(tierLabel)} 2-Star Legendaries`}
      description="Browse all 2-Star Legendaries."
    />
  );
}
