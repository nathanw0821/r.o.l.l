import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "experimental-edge";

export function middleware(request: NextRequest) {
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
