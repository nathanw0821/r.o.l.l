import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";
import CommandHubShell from "@/components/command-hub-shell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteUrl } from "@/lib/app-config";
import { getTierProgressSummary } from "@/lib/data";
import { prisma } from "@/lib/prisma";
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

const THEME_MODES = ["light", "dark", "system"] as const;
const COLORBLIND_MODES = ["none", "deuteranopia", "protanopia", "tritanopia", "high-contrast"] as const;

type ThemeMode = (typeof THEME_MODES)[number];
type ColorBlindMode = (typeof COLORBLIND_MODES)[number];

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value ? THEME_MODES.includes(value as ThemeMode) : false;
}

function isColorBlindMode(value: string | null | undefined): value is ColorBlindMode {
  return value ? COLORBLIND_MODES.includes(value as ColorBlindMode) : false;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const tierProgress = await getTierProgressSummary(session?.user?.id);
  const settings = session?.user?.id
    ? await prisma.userSettings.findUnique({ where: { userId: session.user.id } })
    : null;

  const initialTheme: ThemeMode = isThemeMode(settings?.theme) ? settings.theme : "system";
  const initialAccent = settings?.accent ?? "ember";
  const initialColorBlind: ColorBlindMode = isColorBlindMode(settings?.colorBlind)
    ? settings.colorBlind
    : "none";
  const initialDensity = settings?.density === "compact" ? "compact" : "comfortable";
  const resolvedTheme =
    initialTheme === "dark" ? "dark" : initialTheme === "light" ? "light" : undefined;

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
          preferDefaults={Boolean(settings)}
        >
          <AppShell tierProgress={tierProgress} hub={<CommandHubShell tierProgress={tierProgress} />}>
            {children}
          </AppShell>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
