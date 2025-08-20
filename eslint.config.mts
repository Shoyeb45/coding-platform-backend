import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{ts,mts,cts}"],
    plugins: { js },
    ignores: ["dist/**", "node_modules/**"],
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  ...(tseslint.configs.recommended as any),
]);
