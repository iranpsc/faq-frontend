import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "deploy/**",
      "public/assets/script/**",
      "**/public/assets/script/**",
      "**/deploy/public/assets/script/**",
      "**/public_html/**",
      "**/domains/**"
    ],
  },
  {
    rules: {
      // Disable unused vars warnings for production scripts
      "@typescript-eslint/no-unused-vars": "off",
      // Keep other important rules
      "react/no-unescaped-entities": "error",
    },
  },
];
