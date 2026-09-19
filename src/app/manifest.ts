import type { MetadataRoute } from "next";

/**
 * The only web app manifest (served at /manifest.webmanifest).
 * Icons are real PNGs at the declared sizes (public/icons/), upscaled from the
 * site favicon; the maskable one keeps the artwork inside the 80% safe zone.
 * Colours match the default dark theme (--color-bg) and the ember accent.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "R.O.L.L | Reconfiguration, Optimization & Logistics Laboratory",
    short_name: "R.O.L.L",
    description:
      "Fallout 76 companion: legendary mod tracker, B.U.I.L.D. sandbox, perk cards and guides.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#070a0f",
    theme_color: "#070a0f",
    categories: ["games", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      { name: "Legendary tracker", short_name: "Tracker", url: "/all-effects" },
      { name: "Builder", short_name: "Builder", url: "/build" },
      { name: "Guides", short_name: "Guides", url: "/wiki" }
    ]
  };
}
