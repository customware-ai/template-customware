import { APP_NAME } from "@cw/shared/app-name";
import { useEffect, type ReactElement } from "react";
import { Link, Outlet } from "speedy-router";

import { ThemeProvider } from "./components/theme-provider";
import { attachGlobalFrontendErrorHandlers, logFrontendError } from "./utils/error-logger";

/** Shared providers and frontend error capture for all routes. */
export function App(): ReactElement {
  useEffect((): (() => void) => {
    document.title = APP_NAME;
    return attachGlobalFrontendErrorHandlers();
  }, []);
  return (
    <ThemeProvider defaultTheme="system">
      <Outlet />
    </ThemeProvider>
  );
}

/** Render and report unexpected routing errors. */
export function RouteError({ error }: { error: Error }): ReactElement {
  useEffect((): void => {
    logFrontendError(error.message, { type: "route-error", stack: error.stack });
  }, [error]);
  return (
    <main
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center"
    >
      <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
      <p>An unexpected error occurred. Please try again.</p>
      <a className="underline" href="/">
        Go Home
      </a>
    </main>
  );
}

/** Display an unmatched browser route. */
export function NotFound(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p>The requested page could not be found.</p>
      <Link className="underline" to="/">
        Go Home
      </Link>
    </main>
  );
}
