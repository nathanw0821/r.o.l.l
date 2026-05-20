import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";
import { getSiteUrl } from "@/lib/app-config";
import { isAdminUser } from "@/lib/app-config";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RenameMainCharacterPrompt } from "@/components/rename-main-character-prompt";

import { VT323, Share_Tech_Mono } from "next/font/google";
import VisitorTracker from "@/components/visitor-tracker";

const fontVT323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const fontShareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

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
  
  let mainCharacterId: string | null = null;
  if (session?.user?.id) {
    const mainChar = await prisma.character.findFirst({
      where: { userId: session.user.id, name: "Main Character" }
    });
    if (mainChar) {
      mainCharacterId = mainChar.id;
    }
  }

  const isAdmin = isAdminUser(session?.user);
  const initialTheme: ThemeMode = "system";
  const initialAccent = "ember";
  const initialColorBlind: ColorBlindMode = "none";
  const initialDensity = "compact";

  return (
    <Providers
      session={session}
      initialTheme={initialTheme}
      initialAccent={initialAccent}
      initialColorBlind={initialColorBlind}
      initialDensity={initialDensity}
      preferDefaults={false}
    >
      <AppShell isAdmin={isAdmin}>
        <VisitorTracker userId={session?.user?.id} />
        {children}
        {mainCharacterId && <RenameMainCharacterPrompt characterId={mainCharacterId} />}
      </AppShell>
    </Providers>
  );
}

function ShellLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4efe8] dark:bg-[#0f1113]">
      <div className="text-sm font-mono text-foreground/40 animate-pulse">
        Initializing R.O.L.L. System...
      </div>
    </div>
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
      className={`${fontVT323.variable} ${fontShareTechMono.variable}`}
    >
      <head>
        <Script
          id="ui-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: buildUiBootstrapScript() }}
        />
      </head>
      <body>
        <Suspense fallback={<ShellLoading />}>
          <DynamicShell>{children}</DynamicShell>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
