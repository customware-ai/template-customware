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
    semi: true,
    tabWidth: 2,
    useTabs: false,
    printWidth: 100,
    singleQuote: false,
    bracketSameLine: false,
    trailingComma: "all",
    ignorePatterns: IGNORE_PATTERNS,
    sortPackageJson: false,
    sortImports: {},
  },
  lint: {
    plugins: ["eslint", "jsx-a11y", "oxc", "typescript"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: IGNORE_PATTERNS,
    rules: {
      "oxc/no-barrel-file": "error",
      "no-unassigned-vars": "error",
      "typescript/explicit-function-return-type": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-floating-promises": "error",
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
    },
  },
  run: {
    cache: true,
  },
});
