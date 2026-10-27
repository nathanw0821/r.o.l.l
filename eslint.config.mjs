import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      "coverage/**",
      ".next/**",
      ".open-next/**",
      "dist-worker/**",
      ".vercel/**",
      ".wrangler/**",
      "node_modules/**",
      "worker-configuration.d.ts",
      ".claude/**"
    ]
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  }
];

export default config;
