/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx}", "./src/**/*.tsx"],
  theme: {
    extend: {
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
        panel: "0 1px 0 rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)"
      }
    }
  },
  plugins: []
};
