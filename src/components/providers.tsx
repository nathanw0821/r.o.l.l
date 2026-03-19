"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { FilterProvider } from "@/components/filter-context";
import { ProgressHistoryProvider } from "@/components/progress-history-provider";
import { RewardsProvider } from "@/components/rewards-provider";
import { SessionAssistProvider } from "@/components/session-assist-provider";

export default function Providers({
  children,
  initialTheme,
  initialAccent,
  initialColorBlind,
  initialDensity,
  preferDefaults
}: {
  children: React.ReactNode;
  initialTheme?: "light" | "dark" | "system";
  initialAccent?: string;
  initialColorBlind?: "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";
  initialDensity?: "comfortable" | "compact";
  preferDefaults?: boolean;
}) {
  return (
    <SessionProvider>
      <SessionAssistProvider>
        <ThemeProvider
          defaultTheme={initialTheme}
          defaultAccent={initialAccent}
          defaultColorBlind={initialColorBlind}
          defaultDensity={initialDensity}
          preferDefaults={preferDefaults}
        >
          <RewardsProvider>
            <FilterProvider>
              <ProgressHistoryProvider>{children}</ProgressHistoryProvider>
            </FilterProvider>
          </RewardsProvider>
        </ThemeProvider>
      </SessionAssistProvider>
    </SessionProvider>
  );
}
