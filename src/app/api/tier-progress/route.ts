import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTierProgressSummary } from "@/lib/data";
import { ok } from "@/lib/api/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const tierProgress = await getTierProgressSummary(userId);
  const response = ok({ tierProgress });
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}
