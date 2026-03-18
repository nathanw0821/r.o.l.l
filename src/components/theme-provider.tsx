"use client";

import * as React from "react";

type ThemeMode = "light" | "dark" | "system";
type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";

type ThemeContextValue = {
  theme: ThemeMode;
  accent: string;
  colorBlind: ColorBlindMode;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: string) => void;
  setColorBlind: (mode: ColorBlindMode) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "roll-theme";
const ACCENT_KEY = "roll-accent";
const COLORBLIND_KEY = "roll-colorblind";

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccent = "ember",
  defaultColorBlind = "none"
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultAccent?: string;
  defaultColorBlind?: ColorBlindMode;
}) {
  const [theme, setThemeState] = React.useState<ThemeMode>(defaultTheme);
  const [accent, setAccentState] = React.useState<string>(defaultAccent);
  const [colorBlind, setColorBlindState] = React.useState<ColorBlindMode>(defaultColorBlind);

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const storedAccent = window.localStorage.getItem(ACCENT_KEY);
    const storedColorBlind = window.localStorage.getItem(COLORBLIND_KEY) as ColorBlindMode | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    if (storedAccent) {
      setAccentState(storedAccent);
    }
    if (storedColorBlind) {
      setColorBlindState(storedColorBlind);
    }
  }, []);

  React.useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute("data-theme", resolved);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-colorblind", colorBlind);
    window.localStorage.setItem(COLORBLIND_KEY, colorBlind);
  }, [colorBlind]);

  const value = React.useMemo(
    () => ({
      theme,
      accent,
      colorBlind,
      setTheme: setThemeState,
      setAccent: setAccentState,
      setColorBlind: setColorBlindState
    }),
    [theme, accent, colorBlind]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeSettings must be used within ThemeProvider");
  }
  return ctx;
}
