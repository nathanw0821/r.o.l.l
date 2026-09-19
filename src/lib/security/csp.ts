/**
 * Content-Security-Policy for HTML responses (set per request in middleware with a fresh nonce).
 *
 * - Scripts: only ones carrying this request's nonce ('strict-dynamic' lets those load their own
 *   chunks, e.g. Next's bundles and the Cloudflare Turnstile loader injected by our widget).
 * - Styles allow 'unsafe-inline' because React style={} attributes cannot carry a nonce.
 * - Images allow any https source: avatars come from Google/Discord; images cannot run code.
 * - Fonts are self-hosted by next/font; Turnstile runs in a challenges.cloudflare.com frame.
 * - No framing of the site, no plugins, no <base> hijacking, forms post to us or the OAuth hosts.
 */
export const CSP_NONCE_HEADER = "x-nonce";

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function buildContentSecurityPolicy(nonce: string, options: { dev?: boolean } = {}): string {
  const dev = Boolean(options.dev);
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "https://challenges.cloudflare.com", ...(dev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", "https://challenges.cloudflare.com", ...(dev ? ["ws:", "wss:"] : [])],
    "frame-src": ["https://challenges.cloudflare.com"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "media-src": ["'self'", "blob:", "data:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://accounts.google.com", "https://discord.com"],
    "frame-ancestors": ["'none'"]
  };
  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!dev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}
