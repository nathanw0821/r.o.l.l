import { headers } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Tracks a visitor hit for the current day.
 * Increments total hits and checks for uniqueness based on a hashed IP + User Agent or Guest UUID.
 */
export async function trackVisitor(userId?: string, guestUuid?: string) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const ua = headerList.get("user-agent") || "unknown";
    
    // Create a unique hash for today (Salted with the date to prevent cross-day tracking)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use guestUuid as primary uniqueness factor if available, otherwise fallback to IP+UA
    const identityString = guestUuid || `${ip}-${ua}`;
    const hash = createHash("sha256")
      .update(`${identityString}-${today.toISOString()}`)
      .digest("hex");

    const isUser = Boolean(userId);

    // 1. Log the individual hit to the VisitorStats table (Total counts)
    await prisma.visitorStats.upsert({
      where: { date: today },
      update: {
        ...(isUser ? { userHits: { increment: 1 } } : { guestHits: { increment: 1 } })
      },
      create: {
        date: today,
        userHits: isUser ? 1 : 0,
        guestHits: isUser ? 0 : 1,
        uniqueUsers: 0,
        uniqueGuests: 0
      }
    });

    // 2. Try to record a unique visit for today
    try {
      await prisma.dailyUniqueVisitor.create({
        data: {
          date: today,
          hash: hash,
          isUser: isUser
        }
      });

      // If create succeeded, it's a new unique visitor for today. Update the stats.
      await prisma.visitorStats.update({
        where: { date: today },
        data: {
          ...(isUser ? { uniqueUsers: { increment: 1 } } : { uniqueGuests: { increment: 1 } })
        }
      });
    } catch (e) {
      // Duplicate error (P2002) is expected if the visitor already hit the site today.
      // We just ignore it.
    }
  } catch (error) {
    // Silently fail to ensure site performance isn't affected by metrics tracking
    console.error("Failed to track visitor:", error);
  }
}

/**
 * Fetches the last N days of visitor metrics.
 */
export async function getVisitorMetrics(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return prisma.visitorStats.findMany({
    where: {
      date: { gte: startDate }
    },
    orderBy: {
      date: "desc"
    }
  });
}
