"use client";

import * as React from "react";

type ThemeMode = "light" | "dark" | "system";
type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";
type ScanlineMode = "off" | "soft" | "balanced" | "strong";
type UiTone = "neutral" | "vault" | "copper" | "olive" | "rose";

type ThemeContextValue = {
  theme: ThemeMode;
  accent: string;
  colorBlind: ColorBlindMode;
  density: "comfortable" | "compact";
  scanlineMode: ScanlineMode;
  uiTone: UiTone;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: string) => void;
  setColorBlind: (mode: ColorBlindMode) => void;
  setDensity: (density: "comfortable" | "compact") => void;
  setScanlineMode: (mode: ScanlineMode) => void;
  setUiTone: (tone: UiTone) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "roll-theme";
const ACCENT_KEY = "roll-accent";
const COLORBLIND_KEY = "roll-colorblind";
const DENSITY_KEY = "roll-density";
const SCANLINE_KEY = "roll-scanline-mode";
const UI_TONE_KEY = "roll-ui-tone";

function readStoredValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function readRootAttribute(name: string) {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute(name);
}

function readStoredTheme(defaultTheme: ThemeMode) {
  const storedTheme = readStoredValue(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }
  return defaultTheme;
}

function readStoredColorBlind(defaultColorBlind: ColorBlindMode) {
  const storedColorBlind = readStoredValue(COLORBLIND_KEY);
  if (
    storedColorBlind === "none" ||
    storedColorBlind === "deuteranopia" ||
    storedColorBlind === "protanopia" ||
    storedColorBlind === "tritanopia" ||
    storedColorBlind === "high-contrast"
  ) {
    return storedColorBlind;
  }
  return defaultColorBlind;
}

function readStoredDensity(defaultDensity: "comfortable" | "compact") {
  const storedDensity = readStoredValue(DENSITY_KEY);
  if (storedDensity === "compact" || storedDensity === "comfortable") {
    return storedDensity;
  }
  return defaultDensity;
}

function readStoredScanline() {
  const storedScanline = readStoredValue(SCANLINE_KEY) ?? readRootAttribute("data-scanlines");
  if (storedScanline === "off" || storedScanline === "soft" || storedScanline === "balanced" || storedScanline === "strong") {
    return storedScanline;
  }
  return "balanced";
}

function readStoredUiTone() {
  const storedUiTone = readStoredValue(UI_TONE_KEY) ?? readRootAttribute("data-ui-tone");
  if (
    storedUiTone === "neutral" ||
    storedUiTone === "vault" ||
    storedUiTone === "copper" ||
    storedUiTone === "olive" ||
    storedUiTone === "rose"
  ) {
    return storedUiTone;
  }
  return "neutral";
}

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
  defaultDensity = "compact",
  preferDefaults = false
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultAccent?: string;
  defaultColorBlind?: ColorBlindMode;
  defaultDensity?: "comfortable" | "compact";
  preferDefaults?: boolean;
}) {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => readStoredTheme(defaultTheme));
  const [accent, setAccentState] = React.useState<string>(() => readStoredValue(ACCENT_KEY) ?? readRootAttribute("data-accent") ?? defaultAccent);
  const [colorBlind, setColorBlindState] = React.useState<ColorBlindMode>(() => readStoredColorBlind(defaultColorBlind));
  const [density, setDensityState] = React.useState<"comfortable" | "compact">(() => readStoredDensity(defaultDensity));
  const [scanlineMode, setScanlineModeState] = React.useState<ScanlineMode>(() => readStoredScanline());
  const [uiTone, setUiToneState] = React.useState<UiTone>(() => readStoredUiTone());

  React.useEffect(() => {
    if (!preferDefaults) return;

    setThemeState(defaultTheme);
    setAccentState(defaultAccent);
    setColorBlindState(defaultColorBlind);
    setDensityState(defaultDensity);
    setScanlineModeState("balanced");
    setUiToneState("neutral");
    window.localStorage.setItem(THEME_KEY, defaultTheme);
    window.localStorage.setItem(ACCENT_KEY, defaultAccent);
    window.localStorage.setItem(COLORBLIND_KEY, defaultColorBlind);
    window.localStorage.setItem(DENSITY_KEY, defaultDensity);
    window.localStorage.setItem(SCANLINE_KEY, "balanced");
    window.localStorage.setItem(UI_TONE_KEY, "neutral");
  }, [defaultAccent, defaultColorBlind, defaultDensity, defaultTheme, preferDefaults]);

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

  React.useEffect(() => {
    document.documentElement.setAttribute("data-scanlines", scanlineMode);
    window.localStorage.setItem(SCANLINE_KEY, scanlineMode);
  }, [scanlineMode]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-ui-tone", uiTone);
    window.localStorage.setItem(UI_TONE_KEY, uiTone);
  }, [uiTone]);

  const value = React.useMemo(
    () => ({
      theme,
      accent,
      colorBlind,
      density,
      scanlineMode,
      uiTone,
      setTheme: setThemeState,
      setAccent: setAccentState,
      setColorBlind: setColorBlindState,
      setDensity: setDensityState,
      setScanlineMode: setScanlineModeState,
      setUiTone: setUiToneState
    }),
    [theme, accent, colorBlind, density, scanlineMode, uiTone]
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
