/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx}", "./src/**/*.tsx"],
  future: {
    // hover: styles apply only on devices that can really hover, so they do not
    // stick after a tap on phones and tablets.
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      screens: {
        // Coarse primary pointer (phones, tablets): bigger touch targets
        // without changing the desktop density. Usage: touch:h-11 touch:w-11
        touch: { raw: "(pointer: coarse)" }
      },
      // Type floor tokens: desktop keeps its density, phones/touch raise the
      // floor to 12px (3xs, 2xs) and 14px (prose). Values live in globals.css.
      fontSize: {
        "3xs": "var(--text-3xs)",
        "2xs": "var(--text-2xs)",
        prose: "var(--text-prose)"
      },
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-fg)",
        panel: "var(--color-panel)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        accentMuted: "var(--color-accent-muted)",
        // Text that sits on the accent colour (dark on amber/ember, white on the blues).
        "accent-foreground": "var(--color-accent-foreground)",
        // Muted text with >= 4.5:1 on every panel in both themes (replaces text-slate-500).
        dim: "rgb(var(--text-dim-rgb) / <alpha-value>)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      boxShadow: {
        panel: "var(--shadow-panel)"
      }
    }
  },
  plugins: []
};
