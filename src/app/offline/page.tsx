import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline | R.O.L.L.",
  description: "You are offline. R.O.L.L. will load again when the connection is back.",
  robots: { index: false, follow: false }
};

/**
 * Fallback page the service worker (public/sw.js) shows when a page cannot be
 * loaded because the device is offline. It is cached once, fetched without
 * cookies, so it never holds account data. Inline styles keep it readable even
 * when the stylesheet is not in the cache.
 */
export default function OfflinePage() {
  return (
    <div
      className="mx-auto max-w-lg space-y-4 px-4 py-10 text-center font-mono"
      style={{ maxWidth: "32rem", margin: "0 auto", padding: "2.5rem 1rem", textAlign: "center" }}
    >
      <h1 className="text-2xl font-bold tracking-tight" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
        You are offline
      </h1>
      <p className="text-sm text-foreground/70" style={{ lineHeight: 1.5 }}>
        This page could not be loaded because there is no connection. Nothing you saved is lost. Check your
        connection, then reload the page or open the start page.
      </p>
      <p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 font-bold text-white"
          style={{ display: "inline-block", padding: "0.75rem 1.25rem" }}
        >
          Open the start page
        </Link>
      </p>
    </div>
  );
}
