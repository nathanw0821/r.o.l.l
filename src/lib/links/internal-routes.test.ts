import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { ENTITY_LINKS, normalizeEntityKey } from "@/lib/links/entity-links";
import { hrefPathname, resolvesToAppRoute, routeSegmentsFromAppFile } from "@/lib/links/route-resolution";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { UPDATE_PATCH_IDS } from "@/lib/wiki/update-patches";
import { GLOSSARY_SLUGS, GLOSSARY_TERMS } from "@/lib/truth/mechanics-glossary";
import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";
import perkCards from "@/data/perk-cards.json";

const APP_DIR = path.join(process.cwd(), "src/app");

/** Every page/route file under src/app, relative to it (a shallow tree on the NVMe; no HDD paths). */
function listAppFiles(dir = APP_DIR, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listAppFiles(path.join(dir, entry.name), rel));
    else if (routeSegmentsFromAppFile(rel)) out.push(rel);
  }
  return out;
}

const APP_FILES = listAppFiles();
const BASE_IDS = new Set(BASE_GEAR_PIECES.map((p) => p.id));
const PERK_KEYS = new Set((perkCards as Array<{ name: string }>).map((c) => normalizeEntityKey(c.name)));
const EFFECT_KEYS = new Set(FALLBACK_LEGENDARY_EFFECTS.map((r) => normalizeEntityKey(r.effectName)));

const ALL_HREFS: Array<{ from: string; href: string }> = [
  ...ENTITY_LINKS.map((e) => ({ from: `link map "${e.name}"`, href: e.href })),
  ...GLOSSARY_TERMS.flatMap((t) => t.seeAlso.map((href) => ({ from: `glossary "${t.term}" seeAlso`, href })))
];

describe("route-resolution helpers", () => {
  it("strips query, hash and trailing slash", () => {
    expect(hrefPathname("/wiki/glossary#evade")).toBe("/wiki/glossary");
    expect(hrefPathname("/build?tab=gear&piece=fixer")).toBe("/build");
    expect(hrefPathname("/perks/")).toBe("/perks");
    expect(hrefPathname("/?q=x")).toBe("/");
  });

  it("maps app files to route segments", () => {
    expect(routeSegmentsFromAppFile("page.tsx")).toEqual([]);
    expect(routeSegmentsFromAppFile("wiki/glossary/page.tsx")).toEqual(["wiki", "glossary"]);
    expect(routeSegmentsFromAppFile("(marketing)/about/page.tsx")).toEqual(["about"]);
    expect(routeSegmentsFromAppFile("wiki/layout.tsx")).toBeNull();
  });

  it("resolves static, dynamic and catch-all segments", () => {
    const files = ["page.tsx", "wiki/page.tsx", "l/[slug]/page.tsx", "docs/[...rest]/page.tsx"];
    expect(resolvesToAppRoute("/", files)).toBe(true);
    expect(resolvesToAppRoute("/wiki?q=x", files)).toBe(true);
    expect(resolvesToAppRoute("/l/abc", files)).toBe(true);
    expect(resolvesToAppRoute("/l", files)).toBe(false);
    expect(resolvesToAppRoute("/docs/a/b", files)).toBe(true);
    expect(resolvesToAppRoute("/wiki/nope", files)).toBe(false);
    expect(resolvesToAppRoute("https://example.com/wiki", files)).toBe(false);
  });
});

describe("internal links resolve", () => {
  it("found the app routes this test relies on", () => {
    for (const route of ["/", "/wiki", "/wiki/glossary", "/build", "/perks", "/all-effects"]) {
      expect(resolvesToAppRoute(route, APP_FILES), route).toBe(true);
    }
  });

  it("every link-map and glossary seeAlso href points at an existing route under src/app", () => {
    for (const { from, href } of ALL_HREFS) {
      expect(resolvesToAppRoute(href, APP_FILES), `${from} -> ${href}`).toBe(true);
    }
  });

  it("every piece= id is a base gear piece, every update= id a guides chip, every glossary anchor a term", () => {
    for (const { from, href } of ALL_HREFS) {
      const url = new URL(href, "https://roll.local");
      const piece = url.searchParams.get("piece");
      if (url.pathname === "/build" && piece !== null) expect(BASE_IDS.has(piece), `${from} piece=${piece}`).toBe(true);
      const update = url.searchParams.get("update");
      if (update !== null) expect(UPDATE_PATCH_IDS.has(update), `${from} update=${update}`).toBe(true);
      if (url.pathname === "/wiki/glossary") {
        const slug = url.hash.replace(/^#/, "");
        expect(GLOSSARY_SLUGS.has(slug), `${from} #${slug}`).toBe(true);
      }
    }
  });

  it("glossary seeAlso searches name a real perk card or legendary effect", () => {
    for (const t of GLOSSARY_TERMS) {
      for (const href of t.seeAlso) {
        const url = new URL(href, "https://roll.local");
        const q = url.searchParams.get("q");
        if (q === null) continue;
        if (url.pathname === "/perks") expect(PERK_KEYS.has(normalizeEntityKey(q)), `${t.term} -> ${href}`).toBe(true);
        if (url.pathname === "/all-effects") expect(EFFECT_KEYS.has(normalizeEntityKey(q)), `${t.term} -> ${href}`).toBe(true);
      }
    }
  });
});

describe("sitemap", () => {
  it("lists only routes that exist", async () => {
    vi.stubEnv("NEXTAUTH_URL", "https://fallout76.wiki");
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(urls.length).toBeGreaterThan(5);
    expect(urls.filter((p) => !resolvesToAppRoute(p, APP_FILES))).toEqual([]);
  });
});
