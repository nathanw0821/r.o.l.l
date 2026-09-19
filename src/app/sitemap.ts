import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const publicRoutes = [
  "/",
  "/summary",
  "/build",
  "/all-effects",
  "/1-star",
  "/2-star",
  "/3-star",
  "/4-star",
  "/perks",
  "/pts",
  "/transmissions",
  "/wiki",
  "/wiki/glossary",
  "/screenshot-assist",
  "/rules",
  "/privacy",
  "/terms"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const lastModified = new Date();
  return publicRoutes.map((route) => ({
    url: new URL(route, siteUrl.origin).toString(),
    lastModified
  }));
}
