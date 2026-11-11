import type { ReactElement } from "react";

/** Show the loading state while a route surface is loaded. */
export function InitialLoadingState(): ReactElement {
  return (
    <output aria-live="polite" className="initial-loading" data-slot="hydrate-loader">
      <span aria-hidden="true" className="initial-loading__spinner" />
      <span>Loading application</span>
    </output>
  );
}
