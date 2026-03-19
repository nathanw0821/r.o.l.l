"use client";

import { useThemeSettings } from "@/components/theme-provider";
import { updateUserSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";

const accents = [
  { value: "ember", label: "Ember" },
  { value: "vault", label: "Vault" },
  { value: "radburst", label: "Radburst" },
  { value: "glow", label: "Glow" },
  { value: "brass", label: "Brass" },
  { value: "frost", label: "Frost" }
] as const;

export default function ThemeSettings({ canPersist }: { canPersist: boolean }) {
  const { theme, accent, colorBlind, setTheme, setAccent, setColorBlind } = useThemeSettings();

  async function persistSettings(next: { theme?: string; accent?: string; colorBlind?: string }) {
    if (!canPersist) return;
    await updateUserSettings({
      theme: next.theme as "light" | "dark" | "system" | undefined,
      accent: next.accent as "ember" | "vault" | "radburst" | "glow" | undefined,
      colorBlind: next.colorBlind as
        | "none"
        | "deuteranopia"
        | "protanopia"
        | "tritanopia"
        | "high-contrast"
        | undefined
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold">Theme</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {["light", "dark", "system"].map((value) => (
            <Button
              key={value}
              size="sm"
              variant={theme === value ? "default" : "outline"}
              onClick={() => {
                setTheme(value as "light" | "dark" | "system");
                persistSettings({ theme: value });
              }}
            >
              {value}
            </Button>
          ))}
        </div>
        {theme === "light" ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--color-warning)]">
            Caution, bright
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-semibold">Accent</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {accents.map((accentOption) => (
            <Button
              key={accentOption.value}
              size="sm"
              variant={accent === accentOption.value ? "default" : "outline"}
              onClick={() => {
                setAccent(accentOption.value);
                persistSettings({ accent: accentOption.value });
              }}
            >
              {accentOption.label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Color-Blind Preset</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { value: "none", label: "Default" },
            { value: "deuteranopia", label: "Deuteranopia" },
            { value: "protanopia", label: "Protanopia" },
            { value: "tritanopia", label: "Tritanopia" },
            { value: "high-contrast", label: "High Contrast" }
          ].map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={colorBlind === option.value ? "default" : "outline"}
              onClick={() => {
                setColorBlind(option.value as typeof colorBlind);
                persistSettings({ colorBlind: option.value });
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-foreground/60">
          Adjusts status colors to remain distinct under common color-vision deficiencies.
        </p>
      </div>
      {!canPersist ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
          Sign in to sync settings across devices.
        </div>
      ) : null}
    </div>
  );
}
