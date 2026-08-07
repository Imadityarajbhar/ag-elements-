import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Plain CommonJS Node tooling scripts, not part of the Next.js app —
    // the TypeScript rule set (no-require-imports, etc.) doesn't apply to
    // how these are written.
    "catalog-cli/**",
  ]),
]);

export default eslintConfig;
