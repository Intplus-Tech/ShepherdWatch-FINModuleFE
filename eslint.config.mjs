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
    // Repo-root one-off Node refactor/utility scripts (CommonJS, not shipped):
    "check_tags.js",
    "cleanup_states.js",
    "refactor.js",
    "refactor_assets.js",
    "refactor_mutation.js",
    "refactor_settings.js",
    "fix.mjs",
    "scratch/**",
  ]),
  {
    rules: {
      // Existing codebase has many intentional `any` usages from third-party API responses.
      // Downgrade to warning rather than block lint.
      "@typescript-eslint/no-explicit-any": "warn",
      // Apostrophes/quotes in JSX text are noisy to escape and not a real correctness issue.
      "react/no-unescaped-entities": "off",
      // New strict React rule; existing useEffect setState patterns are widespread.
      // Downgrade to warning until refactored.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
