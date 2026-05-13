"use client";

import { useEffect } from "react";

/**
 * VisitorTracker performs a fire-and-forget visit log from the client.
 * Moving this out of the server rendering path prevents database latency
 * from blocking the initial page paint (FCP/LCP).
 */
export default function VisitorTracker({ userId }: { userId?: string }) {
  useEffect(() => {
    // We use a small delay to ensure the main thread is idle
    const timeout = setTimeout(() => {
      fetch("/api/metrics/track", {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" }
      }).catch(() => {
        // Silently fail if tracking fails; UX is priority
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [userId]);

  return null;
}
