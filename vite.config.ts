import { fileURLToPath } from "node:url";

import { defineConfig } from "vite-plus";

// Select TSRS for Oxlint’s type-aware rules rather than the bundled Go backend.
process.env.OXLINT_TSGOLINT_PATH = fileURLToPath(
  new URL("./node_modules/.bin/tsrs-lint", import.meta.url),
);

const IGNORE_PATTERNS = [
  "build/**",
  "**/node_modules/**",
  "playwright-report/**",
  "test-results/**",
  "tmp/**",
];

export default defineConfig({
  fmt: {
    ignorePatterns: IGNORE_PATTERNS,
  },
  lint: {
    plugins: ["eslint", "jsx-a11y", "oxc", "react", "react-perf", "typescript"],
    categories: {
      correctness: "error",
    },
    env: {
      browser: true,
      node: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: [...IGNORE_PATTERNS, "task-workflow/**", "tests/**"],
    overrides: [
      {
        files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
        rules: {
          "eslint/max-lines": ["error", { max: 500, skipComments: true }],
        },
      },
    ],
    rules: {
      "oxc/no-barrel-file": ["error", { threshold: 0 }],
      "typescript/no-unsafe-type-assertion": "error",
      "typescript/no-non-null-assertion": "error",
      "typescript/switch-exhaustiveness-check": "error",
      "typescript/only-throw-error": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-return": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-misused-promises": "error",
      "typescript/await-thenable": "error",
      "typescript/prefer-promise-reject-errors": "error",
      "typescript/restrict-template-expressions": "error",
      "typescript/no-base-to-string": "error",
      "typescript/no-unnecessary-type-assertion": "error",
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "error",
      "no-unassigned-vars": "error",
      "typescript/explicit-function-return-type": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-floating-promises": "error",
      "typescript/no-inferrable-types": "off",
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "react/jsx-no-duplicate-props": "error",
    },
    settings: {
      "jsx-a11y": {
        attributes: {
          for: ["for", "htmlFor"],
        },
      },
      react: {
        version: "19.0",
      },
    },
  },
  run: {
    cache: true,
  },
});
