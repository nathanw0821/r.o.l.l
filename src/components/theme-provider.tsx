"use client";

import * as React from "react";

type ThemeMode = "light" | "dark" | "system";
type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";

type ThemeContextValue = {
  theme: ThemeMode;
  accent: string;
  colorBlind: ColorBlindMode;
  density: "comfortable" | "compact";
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: string) => void;
  setColorBlind: (mode: ColorBlindMode) => void;
  setDensity: (density: "comfortable" | "compact") => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "roll-theme";
const ACCENT_KEY = "roll-accent";
const COLORBLIND_KEY = "roll-colorblind";
const DENSITY_KEY = "roll-density";

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccent = "ember",
  defaultColorBlind = "none",
  defaultDensity = "comfortable",
  preferDefaults = false
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultAccent?: string;
  defaultColorBlind?: ColorBlindMode;
  defaultDensity?: "comfortable" | "compact";
  preferDefaults?: boolean;
}) {
  const [theme, setThemeState] = React.useState<ThemeMode>(defaultTheme);
  const [accent, setAccentState] = React.useState<string>(defaultAccent);
  const [colorBlind, setColorBlindState] = React.useState<ColorBlindMode>(defaultColorBlind);
  const [density, setDensityState] = React.useState<"comfortable" | "compact">(defaultDensity);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const storedTheme = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const storedAccent = window.localStorage.getItem(ACCENT_KEY);
    const storedColorBlind = window.localStorage.getItem(COLORBLIND_KEY) as ColorBlindMode | null;
    const storedDensity = window.localStorage.getItem(DENSITY_KEY) as "comfortable" | "compact" | null;
    if (preferDefaults) {
      setThemeState(defaultTheme);
      setAccentState(defaultAccent);
      setColorBlindState(defaultColorBlind);
      setDensityState(defaultDensity);
      window.localStorage.setItem(THEME_KEY, defaultTheme);
      window.localStorage.setItem(ACCENT_KEY, defaultAccent);
      window.localStorage.setItem(COLORBLIND_KEY, defaultColorBlind);
      window.localStorage.setItem(DENSITY_KEY, defaultDensity);
      return;
    }
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    if (storedAccent) {
      setAccentState(storedAccent);
    }
    if (storedColorBlind) {
      setColorBlindState(storedColorBlind);
    }
    if (storedDensity === "compact" || storedDensity === "comfortable") {
      setDensityState(storedDensity);
    }
  }, [defaultAccent, defaultColorBlind, defaultTheme, preferDefaults]);

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

  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
    window.localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  const value = React.useMemo(
    () => ({
      theme,
      accent,
      colorBlind,
      density,
      setTheme: setThemeState,
      setAccent: setAccentState,
      setColorBlind: setColorBlindState,
      setDensity: setDensityState
    }),
    [theme, accent, colorBlind, density]
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
