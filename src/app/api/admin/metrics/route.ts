import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { ok, forbidden } from "@/lib/api/responses";
import { getVisitorMetrics } from "@/lib/metrics";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminUser(session?.user)) {
    return forbidden("Admin access required.");
  }

  const metrics = await getVisitorMetrics(30); // Last 30 days
  return ok({ metrics });
}
