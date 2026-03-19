"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { FilterProvider } from "@/components/filter-context";

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
      <ThemeProvider
        defaultTheme={initialTheme}
        defaultAccent={initialAccent}
        defaultColorBlind={initialColorBlind}
        defaultDensity={initialDensity}
        preferDefaults={preferDefaults}
      >
        <FilterProvider>{children}</FilterProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
