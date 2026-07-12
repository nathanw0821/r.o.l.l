import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { badRequest, internalError, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

const pingSchema = z.object({
  type: z.enum(["guest", "user"])
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, pingSchema);
  if ("response" in parsed) return parsed.response;

  const { type } = parsed.data;

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
