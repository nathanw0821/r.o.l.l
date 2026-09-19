/**
 * Does an internal href land on a real App Router route? Pure helpers, so the check can run in a
 * unit test against the list of `page.tsx` / `route.ts` files under `src/app` (see
 * `internal-routes.test.ts`). Query strings and hashes are ignored here; the test checks the
 * values that matter (`piece=`, `update=`, glossary anchors) separately.
 */

/** Path part of an internal href: no query, no hash, no trailing slash ("/" stays "/"). */
export function hrefPathname(href: string): string {
  const path = href.split(/[?#]/)[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/**
 * Route segments of an app file path relative to `src/app`, or null when the file is not a page or
 * route handler. Route groups "(name)" and parallel slots "@name" do not add a URL segment.
 */
export function routeSegmentsFromAppFile(relativeFile: string): string[] | null {
  const parts = relativeFile.replace(/\\/g, "/").split("/");
  const leaf = parts.pop() ?? "";
  if (!/^(?:page|route)\.(?:tsx|ts|jsx|js|mdx)$/.test(leaf)) return null;
  return parts.filter((p) => p && !/^\(.*\)$/.test(p) && !p.startsWith("@"));
}

function segmentsMatch(route: readonly string[], url: readonly string[]): boolean {
  for (let i = 0; i < route.length; i++) {
    const seg = route[i];
    if (/^\[\[\.\.\..+\]\]$/.test(seg)) return true; // optional catch-all
    if (/^\[\.\.\..+\]$/.test(seg)) return url.length > i; // catch-all needs one segment
    if (i >= url.length) return false;
    if (/^\[.+\]$/.test(seg)) continue; // dynamic segment
    if (seg !== url[i]) return false;
  }
  return route.length === url.length;
}

/** True when `href` (internal, starting with "/") resolves to one of the app files. */
export function resolvesToAppRoute(href: string, appFiles: readonly string[]): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const url = hrefPathname(href).split("/").filter(Boolean).map((s) => decodeURIComponent(s));
  return appFiles.some((file) => {
    const route = routeSegmentsFromAppFile(file);
    return route !== null && segmentsMatch(route, url);
  });
}
