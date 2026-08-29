import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|fonts|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js|map)).*)",
  ],
};
