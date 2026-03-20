import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";
import { getSiteUrl } from "@/lib/app-config";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: "R.O.L.L | Record Of Legendary Loadouts",
  description: "Record of legendary effects, components, and acquisition paths for Fallout 76.",
  icons: {
    icon: [{ url: "/favicon-v3.png?v=3", type: "image/png" }],
    shortcut: ["/favicon-v3.png?v=3"],
    apple: ["/favicon-v3.png?v=3"]
  }
};

type ThemeMode = "light" | "dark" | "system";
type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialTheme: ThemeMode = "system";
  const initialAccent = "ember";
  const initialColorBlind: ColorBlindMode = "none";
  const initialDensity = "comfortable";
  const resolvedTheme: "light" | "dark" | undefined = undefined;

  return (
    <html
      lang="en"
      data-theme={resolvedTheme}
      data-accent={initialAccent}
      data-colorblind={initialColorBlind}
    >
      <body>
        <Providers
          initialTheme={initialTheme}
          initialAccent={initialAccent}
          initialColorBlind={initialColorBlind}
          initialDensity={initialDensity}
          preferDefaults={false}
        >
          <AppShell>
            {children}
          </AppShell>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
