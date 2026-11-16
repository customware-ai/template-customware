"use client";

import { Result } from "better-result";
import * as React from "react";
import { z } from "zod/mini";

/**
 * Shared localStorage key for the shell theme mode.
 * Theme persistence is independent from any product-specific workspace state.
 */
const THEME_STORAGE_KEY = "ui-theme";

export const ThemeModeSchema = z.enum(["dark", "light", "system"]);
export type ThemeMode = z.infer<typeof ThemeModeSchema>;

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined);

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

function applyTheme(theme: ThemeMode): Result<void, Error> {
  return Result.try({
    try: () => {
      const root = window.document.documentElement;

      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
    },
    catch: toError,
  });
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const storedThemeResult = Result.try({
      try: () => ThemeModeSchema.parse(window.localStorage.getItem(storageKey)),
      catch: toError,
    });
    return storedThemeResult.unwrapOr(defaultTheme);
  });

  React.useEffect((): (() => void) | undefined => {
    applyTheme(theme).unwrapOr(undefined);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (): void => { applyTheme("system").unwrapOr(undefined); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);

  const setTheme = React.useCallback(
    (nextTheme: ThemeMode): void => {
      void Result.try({
        try: () => window.localStorage.setItem(storageKey, nextTheme),
        catch: toError,
      });

      setThemeState(nextTheme);
    },
    [storageKey],
  );

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export function useTheme(): ThemeProviderState {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
