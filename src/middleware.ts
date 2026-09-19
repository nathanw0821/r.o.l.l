import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildContentSecurityPolicy, createNonce, CSP_NONCE_HEADER } from "@/lib/security/csp";

export const runtime = "experimental-edge";

const BOT_PROBE_EXTENSIONS = /\.(?:htc|php\d?|phtml|asp|aspx|jsp|cgi|env|git|bak|sql|ini|conf|yaml|yml|ds_store)$/i;
const LEGITIMATE_TXT_FILES = /^\/(?:robots\.txt|humans\.txt|security\.txt|ads\.txt|app-ads\.txt)$/i;
const BOT_PROBE_PATHS = /^\/(?:wp-admin|wp-login|wp-includes|xmlrpc\.php|phpmyadmin|cgi-bin|autodiscover|console|actuator|debug|_profiler)\b/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Fast-Path Edge Filter: Instantly drop vulnerability scanner bot probes
  if (
    BOT_PROBE_EXTENSIONS.test(pathname) ||
    BOT_PROBE_PATHS.test(pathname) ||
    (pathname.endsWith(".txt") && !LEGITIMATE_TXT_FILES.test(pathname))
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Edge-Fast-Path": "blocked-probe"
      }
    });
  }

  // 2. Canonical domain redirect (www -> apex)
  const host = request.headers.get("host") || "";
  if (host === "www.fallout76.wiki") {
    const url = request.nextUrl.clone();
    url.host = "fallout76.wiki";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 3. Content-Security-Policy with a per-request nonce. Next reads the nonce from the request's
  // CSP header and stamps it on its own scripts; the layout passes it to the bootstrap <Script>.
  const nonce = createNonce();
  const csp = buildContentSecurityPolicy(nonce, { dev: process.env.NODE_ENV === "development" });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSP_NONCE_HEADER, nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|fonts|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js|map)).*)",
  ],
};
