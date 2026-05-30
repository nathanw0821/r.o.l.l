import { headers } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Tracks a visitor hit for the current day.
 * Increments total hits and checks for uniqueness based on a hashed IP + User Agent or Guest UUID.
 */
export async function trackVisitor(userId?: string, guestUuid?: string) {
  // Visitor tracking has been rolled back per user privacy policy guidelines.
  // We no longer record hits or uniqueness details in the active database.
  return;
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
