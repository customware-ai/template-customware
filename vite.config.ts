import { defineConfig } from "vite-plus";

const IGNORE_PATTERNS = [
  ".react-router/**",
  "apps/app/.react-router/**",
  "build/**",
  "dist/**",
  "**/node_modules/**",
  "playwright-report/**",
  "test-results/**",
  "tmp/**",
];

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
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
    ignorePatterns: IGNORE_PATTERNS,
    overrides: [
      {
        files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
        rules: {
          "eslint/max-lines": ["error", { max: 500, skipComments: true }],
        },
      },
    ],
    rules: {
      "oxc/no-barrel-file": "error",
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
