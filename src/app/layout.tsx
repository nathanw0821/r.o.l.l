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
import { RenameMainCharacterPrompt } from "@/components/rename-main-character-prompt";

import { VT323, Share_Tech_Mono } from "next/font/google";

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
  title: "R.O.L.L | Reconfiguration, Optimization & Logistics Laboratory",
  description: "Fallout 76 Vault-Tec Master Hub: B.U.I.L.D. Sandbox, P.E.R.K. Matrix, and Truth Bible Knowledge Base.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/favicon-v3.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "R.O.L.L"
  }
};

type ThemeMode = "light" | "dark" | "system";
type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";

function buildUiBootstrapScript() {
  return `(() => {
    try {
      const root = document.documentElement;
      const storage = window.localStorage;
      const read = (key, fallback) => storage.getItem(key) ?? fallback;
      const theme = read("roll-theme", "dark");
      const accent = read("roll-accent", "ember");
      const colorBlind = read("roll-colorblind", "none");
      const density = read("roll-density", "compact");
      const scanlineMode = read("roll-scanline-mode", "balanced");
      const uiTone = read("roll-ui-tone", "neutral");
      const sidebarCollapsed = read("roll-sidebar-collapsed", "0");
      const resolvedTheme =
        theme === "light" || theme === "dark"
          ? theme
          : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

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
  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Graceful fallback if NextAuth session check fails
  }
  
  let mainCharacterId: string | null = null;
  if (session?.user?.id) {
    try {
      const mainChar = await prisma.character.findFirst({
        where: { userId: session.user.id, name: "Main Character" }
      });
      if (mainChar) {
        mainCharacterId = mainChar.id;
      }
    } catch {
      // Graceful fallback if database is unready
    }
  }

  const isAdmin = isAdminUser(session?.user);
  const initialTheme: ThemeMode = "dark";
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
        {children}
        {mainCharacterId && <RenameMainCharacterPrompt characterId={mainCharacterId} />}
      </AppShell>
    </Providers>
  );
}

function ShellLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1113]">
      <div className="text-sm font-mono text-foreground/40 animate-pulse">
        Initializing R.O.L.L. System...
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const resolvedTheme: "light" | "dark" = "dark";

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
        <link rel="preload" href="/images/special/special_S.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/images/special/special_P.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/special/special_E.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/special/special_C.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/special/special_I.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/special/special_A.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/special/special_L.webp" as="image" type="image/webp" />
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
      </body>
    </html>
  );
}
