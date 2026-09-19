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
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-fg)",
        panel: "var(--color-panel)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        accentMuted: "var(--color-accent-muted)",
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
