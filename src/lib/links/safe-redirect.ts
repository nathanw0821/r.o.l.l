const SITE_HOSTS = new Set(["fallout76.wiki", "www.fallout76.wiki"]);

/**
 * Shortlink targets may only point inside the site: a root-relative path, or an absolute
 * https URL on fallout76.wiki (returned as its path). Anything else is refused (open redirect).
 */
export function sameSiteRedirectPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || /[\u0000-\u001f\\]/.test(value)) return null;
  if (value.startsWith("/")) return value.startsWith("//") ? null : value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !SITE_HOSTS.has(url.hostname) || url.username || url.password) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
