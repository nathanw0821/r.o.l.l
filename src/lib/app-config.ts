import { isIP } from "node:net";

export { getSiteUrl } from "./site-url";

type AdminLikeUser = {
  email?: string | null;
  username?: string | null;
};

const truthyValues = new Set(["1", "true", "yes", "on"]);

function splitEnvList(raw?: string | null) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  const ipType = isIP(normalized);

  if (normalized === "localhost" || normalized.endsWith(".local") || normalized.endsWith(".internal")) {
    return true;
  }

  if (ipType === 4) {
    return isPrivateIpv4(normalized);
  }

  if (ipType === 6) {
    return isPrivateIpv6(normalized);
  }

  return false;
}

export function isPublicRegistrationEnabled() {
  return truthyValues.has((process.env.ALLOW_PUBLIC_REGISTRATION ?? "").trim().toLowerCase());
}

/** NextAuth registers `GoogleProvider` only when both vars are non-empty. */
export function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function isAdminUser(user: AdminLikeUser | null | undefined) {
  if (!user) return false;

  const usernames = new Set(splitEnvList(process.env.ADMIN_USERNAMES));
  const emails = new Set(splitEnvList(process.env.ADMIN_EMAILS));
  const hasConfiguredAdmins = usernames.size > 0 || emails.size > 0;

  if (!hasConfiguredAdmins) {
    return process.env.NODE_ENV !== "production";
  }

  const username = user.username?.trim().toLowerCase();
  const email = user.email?.trim().toLowerCase();

  return Boolean((username && usernames.has(username)) || (email && emails.has(email)));
}

export function getSyncUrlError(rawUrl?: string | null) {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "Enter a valid source URL.";
  }

  if (url.username || url.password) {
    return "Source URLs cannot include embedded credentials.";
  }

  const protocol = url.protocol.toLowerCase();
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (protocol !== "https:" && !(isDevelopment && protocol === "http:")) {
    return "Source URLs must use HTTPS outside development.";
  }

  if (isLocalHostname(url.hostname)) {
    return "Private, loopback, and local source URLs are not allowed.";
  }

  return null;
}
