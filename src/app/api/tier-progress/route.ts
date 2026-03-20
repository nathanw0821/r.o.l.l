import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTierProgressSummary } from "@/lib/data";
import { ok } from "@/lib/api/responses";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const tierProgress = await getTierProgressSummary(userId);
  const response = ok({ tierProgress });
  response.headers.set(
    "Cache-Control",
    userId ? "private, no-store" : "public, s-maxage=60, stale-while-revalidate=300"
  );
  return response;
}
