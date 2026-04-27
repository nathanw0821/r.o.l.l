import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";
import { getSiteUrl } from "@/lib/app-config";
import { getAppSession } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { prisma } from "@/lib/prisma";
import { RenameMainCharacterPrompt } from "@/components/rename-main-character-prompt";

const vt323 = "https://fonts.googleapis.com/css2?family=VT323&display=swap";
const shareTechMono = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: "R.O.L.L | Record Of Legendary Loadouts",
  description: "Record of legendary effects, components, and acquisition paths for Fallout 76."
};

type ThemeMode = "light" | "dark" | "system";
type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";

function buildUiBootstrapScript() {
  return `(() => {
    try {
      const root = document.documentElement;
      const storage = window.localStorage;
      const read = (key, fallback) => storage.getItem(key) ?? fallback;
      const theme = read("roll-theme", "system");
      const accent = read("roll-accent", "ember");
      const colorBlind = read("roll-colorblind", "none");
      const density = read("roll-density", "compact");
      const scanlineMode = read("roll-scanline-mode", "balanced");
      const uiTone = read("roll-ui-tone", "neutral");
      const sidebarCollapsed = read("roll-sidebar-collapsed", "0");
      const resolvedTheme =
        theme === "light" || theme === "dark"
          ? theme
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

      root.setAttribute("data-theme", resolvedTheme);
      root.setAttribute("data-accent", accent);
      root.setAttribute("data-colorblind", colorBlind);
      root.setAttribute("data-density", density);
      root.setAttribute("data-scanlines", scanlineMode);
      root.setAttribute("data-ui-tone", uiTone);
      root.setAttribute("data-sidebar-collapsed", sidebarCollapsed === "1" ? "1" : "0");
    } catch {
      // Keep server defaults if storage is unavailable.
    }
  })();`;
}

async function DynamicShell({ children }: { children: ReactNode }) {
  const session = await getAppSession();
  const initialTheme: ThemeMode = "system";
  const initialAccent = "ember";
  const initialColorBlind: ColorBlindMode = "none";
  const initialDensity = "compact";

  let mainCharacterId: string | null = null;
  if (session?.user?.id) {
    const mainChar = await prisma.character.findFirst({
      where: { userId: session.user.id, name: "Main Character" }
    });
    if (mainChar) {
      mainCharacterId = mainChar.id;
    }
  }

  return (
    <Providers
      session={session}
      initialTheme={initialTheme}
      initialAccent={initialAccent}
      initialColorBlind={initialColorBlind}
      initialDensity={initialDensity}
      preferDefaults={false}
    >
      <AppShell>
        {children}
        {mainCharacterId && <RenameMainCharacterPrompt characterId={mainCharacterId} />}
      </AppShell>
    </Providers>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const resolvedTheme: "light" | "dark" | undefined = undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={resolvedTheme}
      data-accent="ember"
      data-colorblind="none"
      data-density="compact"
      data-scanlines="balanced"
      data-ui-tone="neutral"
      data-sidebar-collapsed="0"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={vt323} rel="stylesheet" />
        <link href={shareTechMono} rel="stylesheet" />
        <Script
          id="ui-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: buildUiBootstrapScript() }}
        />
      </head>
      <body>
        <Suspense>
          <DynamicShell>{children}</DynamicShell>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
