import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { internalError, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const pingSchema = z.object({
  type: z.enum(["guest", "user"])
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, pingSchema);
  if ("response" in parsed) return parsed.response;

  const { type } = parsed.data;

  // One write per visitor per minute at most; extra pings are accepted but not counted.
  const limiter = await rateLimit("analytics-ping", 3, 60_000);
  if (!limiter.success) return ok({ counted: false });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    await prisma.visitorStats.upsert({
      where: { date: today },
      update: {
        uniqueGuests: type === "guest" ? { increment: 1 } : undefined,
        uniqueUsers: type === "user" ? { increment: 1 } : undefined,
        guestHits: type === "guest" ? { increment: 1 } : undefined,
        userHits: type === "user" ? { increment: 1 } : undefined,
      },
      create: {
        date: today,
        uniqueGuests: type === "guest" ? 1 : 0,
        uniqueUsers: type === "user" ? 1 : 0,
        guestHits: type === "guest" ? 1 : 0,
        userHits: type === "user" ? 1 : 0,
      }
    });
  } catch (error) {
    // Log error internally but return OK to avoid leaking database downtime or breaking client-side lifecycle
    console.error("Failed to record visitor stats:", error);
    return internalError("Database update failed.");
  }

  return ok({ recorded: true });
}
