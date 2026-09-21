"use client";

import { APP_NAME } from "@template-customware/shared";
import { AlertTriangle } from "lucide-react";
import { useEffect, type ReactElement, type ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";

import "./app.css";
import { InitialLoadingState, INITIAL_LOADING_STYLES } from "./components/initial-loading-state";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Toaster } from "./components/ui/toast";
import { attachGlobalFrontendErrorHandlers, logFrontendError } from "./utils/error-logger";

export function Layout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{APP_NAME}</title>
        <Meta />
        <style
          id="initial-loading-styles"
          dangerouslySetInnerHTML={{ __html: INITIAL_LOADING_STYLES }}
        />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var storageKey = 'ui-theme';
                var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

                function getThemeMode() {
                  try {
                    var storedThemeMode = window.localStorage.getItem(storageKey);
                    if (
                      storedThemeMode === 'dark' ||
                      storedThemeMode === 'light' ||
                      storedThemeMode === 'system'
                    ) {
                      return storedThemeMode;
                    }
                  } catch (error) {
                    // Ignore malformed localStorage payloads and fall back to system theme.
                  }

                  return 'system';
                }

                function applyThemeMode(themeMode) {
                  var resolvedThemeMode = themeMode === 'system'
                    ? (mediaQuery.matches ? 'dark' : 'light')
                    : themeMode;
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolvedThemeMode);
                }

                applyThemeMode(getThemeMode());

                mediaQuery.addEventListener('change', function() {
                  applyThemeMode(getThemeMode());
                });

                window.addEventListener('storage', function(event) {
                  if (event.key === storageKey) {
                    applyThemeMode(getThemeMode());
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-x-hidden bg-background text-foreground antialiased">
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * HydrateFallback - Required for SPA mode
 * This is rendered during the initial page load while the app hydrates.
 */
export function HydrateFallback(): ReactElement {
  return <InitialLoadingState />;
}

export default function App(): ReactElement {
  /**
   * @critical
   * @description
   * Attach global frontend error handlers once on app mount.
   * This forwards uncaught window/document errors and unhandled promise
   * rejections to `POST /logs`, which persists logs in `.runtime.logs`.
   * @important
   * Do NOT remove this initializer. Without it, frontend runtime errors
   * are no longer captured for the shared log pipeline.
   */
  useEffect((): (() => void) => {
    return attachGlobalFrontendErrorHandlers();
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <Outlet />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): ReactElement {
  // Log error for monitoring
  logFrontendError(error instanceof Error ? error.message : "Route error", {
    type: "route-error",
    status: isRouteErrorResponse(error) ? error.status : undefined,
    statusText: isRouteErrorResponse(error) ? error.statusText : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-6xl font-bold text-destructive mb-4">{error.status}</h1>
            <p className="text-lg text-muted-foreground mb-2">
              {error.status === 404 ? "Page Not Found" : "Something went wrong"}
            </p>
            <p className="text-muted-foreground">
              {error.statusText || "The requested page could not be found."}
            </p>
            <Button render={<a href="/" aria-label="Go home" />} className="mt-6">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg text-center">
        <CardContent className="pt-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-destructive mb-2">Application Error</h1>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Please try again.
          </p>
          {import.meta.env.DEV && error instanceof Error && (
            <pre className="mt-4 p-4 bg-muted rounded-lg text-left text-xs overflow-auto max-h-48 text-muted-foreground">
              {error.stack}
            </pre>
          )}
          <Button render={<a href="/" aria-label="Go home" />} className="mt-6">
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
