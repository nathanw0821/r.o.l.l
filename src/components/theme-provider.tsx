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
  fontScale: number;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: string) => void;
  setColorBlind: (mode: ColorBlindMode) => void;
  setDensity: (density: "comfortable" | "compact") => void;
  setScanlineMode: (mode: ScanlineMode) => void;
  setUiTone: (tone: UiTone) => void;
  setFontScale: (scale: number) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "roll-theme";
const ACCENT_KEY = "roll-accent";
const COLORBLIND_KEY = "roll-colorblind";
const DENSITY_KEY = "roll-density";
const SCANLINE_KEY = "roll-scanline-mode";
const UI_TONE_KEY = "roll-ui-tone";
const FONT_SCALE_KEY = "roll-font-scale";

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
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultAccent?: string;
  defaultColorBlind?: ColorBlindMode;
  defaultDensity?: "comfortable" | "compact";
  preferDefaults?: boolean;
}) {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => readStoredTheme(defaultTheme));
  const [accent, setAccentState] = React.useState<string>(
    () => readStoredValue(ACCENT_KEY) ?? readRootAttribute("data-accent") ?? defaultAccent
  );
  const [colorBlind, setColorBlindState] = React.useState<ColorBlindMode>(() => readStoredColorBlind(defaultColorBlind));
  const [density, setDensityState] = React.useState<"comfortable" | "compact">(
    () => readStoredDensity(defaultDensity)
  );
  const [scanlineMode, setScanlineModeState] = React.useState<ScanlineMode>(() => readStoredScanline());
  const [uiTone, setUiToneState] = React.useState<UiTone>(() => readStoredUiTone());
  const [fontScale, setFontScaleState] = React.useState<number>(() => {
    const stored = readStoredValue(FONT_SCALE_KEY);
    return stored ? parseFloat(stored) : 1.0;
  });

  const isMounted = React.useRef(false);

  // Sync state on client mount from local storage / DOM attributes safely
  React.useEffect(() => {
    const storedAccent = readStoredValue(ACCENT_KEY) ?? readRootAttribute("data-accent");
    if (storedAccent && storedAccent !== accent) {
      setAccentState(storedAccent);
      document.documentElement.setAttribute("data-accent", storedAccent);
    }
    const storedTheme = readStoredTheme(defaultTheme);
    if (storedTheme !== theme) setThemeState(storedTheme);

    const storedColorBlind = readStoredColorBlind(defaultColorBlind);
    if (storedColorBlind !== colorBlind) setColorBlindState(storedColorBlind);

    const storedDensity = readStoredDensity(defaultDensity);
    if (storedDensity !== density) setDensityState(storedDensity);

    const storedScanline = readStoredScanline();
    if (storedScanline !== scanlineMode) setScanlineModeState(storedScanline);

    const storedUiTone = readStoredUiTone();
    if (storedUiTone !== uiTone) setUiToneState(storedUiTone);

    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multi-window / Multi-tab storage sync listener
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === ACCENT_KEY && e.newValue) {
        setAccentState(e.newValue);
        document.documentElement.setAttribute("data-accent", e.newValue);
      }
      if (e.key === THEME_KEY && e.newValue) {
        const nextTheme = e.newValue as ThemeMode;
        setThemeState(nextTheme);
        document.documentElement.setAttribute("data-theme", resolveTheme(nextTheme));
      }
      if (e.key === COLORBLIND_KEY && e.newValue) {
        const nextColorBlind = e.newValue as ColorBlindMode;
        setColorBlindState(nextColorBlind);
        document.documentElement.setAttribute("data-colorblind", nextColorBlind);
      }
      if (e.key === DENSITY_KEY && e.newValue) {
        const nextDensity = e.newValue as "comfortable" | "compact";
        setDensityState(nextDensity);
        document.documentElement.setAttribute("data-density", nextDensity);
      }
      if (e.key === SCANLINE_KEY && e.newValue) {
        const nextScanline = e.newValue as ScanlineMode;
        setScanlineModeState(nextScanline);
        document.documentElement.setAttribute("data-scanlines", nextScanline);
      }
      if (e.key === UI_TONE_KEY && e.newValue) {
        const nextUiTone = e.newValue as UiTone;
        setUiToneState(nextUiTone);
        document.documentElement.setAttribute("data-ui-tone", nextUiTone);
      }
      if (e.key === FONT_SCALE_KEY && e.newValue) {
        const nextScale = parseFloat(e.newValue) || 1.0;
        setFontScaleState(nextScale);
        document.documentElement.style.setProperty("--base-font-scale", String(nextScale));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Persistence Effects (only write to localStorage when mounted and state changes)
  React.useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute("data-theme", resolved);
    if (isMounted.current) {
      window.localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    if (isMounted.current) {
      window.localStorage.setItem(ACCENT_KEY, accent);
    }
  }, [accent]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-colorblind", colorBlind);
    if (isMounted.current) {
      window.localStorage.setItem(COLORBLIND_KEY, colorBlind);
    }
  }, [colorBlind]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
    if (isMounted.current) {
      window.localStorage.setItem(DENSITY_KEY, density);
    }
  }, [density]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-scanlines", scanlineMode);
    if (isMounted.current) {
      window.localStorage.setItem(SCANLINE_KEY, scanlineMode);
    }
  }, [scanlineMode]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-ui-tone", uiTone);
    if (isMounted.current) {
      window.localStorage.setItem(UI_TONE_KEY, uiTone);
    }
  }, [uiTone]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--base-font-scale", String(fontScale));
    if (isMounted.current) {
      window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
    }
  }, [fontScale]);

  const value = React.useMemo(
    () => ({
      theme,
      accent,
      colorBlind,
      density,
      scanlineMode,
      uiTone,
      fontScale,
      setTheme: setThemeState,
      setAccent: setAccentState,
      setColorBlind: setColorBlindState,
      setDensity: setDensityState,
      setScanlineMode: setScanlineModeState,
      setUiTone: setUiToneState,
      setFontScale: setFontScaleState
    }),
    [theme, accent, colorBlind, density, scanlineMode, uiTone, fontScale]
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
