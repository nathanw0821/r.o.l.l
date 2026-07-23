/** Canonical site URL from env only — no Node built-ins (safe for metadata routes). */
export function getSiteUrl() {
  const candidates = [
    process.env.NEXTAUTH_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  ];

  for (const raw of candidates) {
    const candidate = raw?.trim();
    if (!candidate) continue;

    try {
      return new URL(candidate);
    } catch {
      continue;
    }
  }

  return null;
}
