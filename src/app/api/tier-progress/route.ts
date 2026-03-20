import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTierProgressSummary } from "@/lib/data";
import { ok } from "@/lib/api/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHint = searchParams.get("auth");
  const isGuestHint = authHint === "guest";

  const session = isGuestHint ? null : await getServerSession(authOptions);
  const userId = session?.user?.id;
  const tierProgress = await getTierProgressSummary(userId);
  const response = ok({ tierProgress });
  if (userId) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  } else {
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  }
  return response;
}
