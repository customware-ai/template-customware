import type { ReactElement } from "react";

/**
 * Inline styles keep the first loading state visible before the application
 * stylesheet arrives. The same component remains visible across lazy loading.
 */
export const INITIAL_LOADING_STYLES = `
  @keyframes initial-loading-spin {
    to { transform: rotate(360deg); }
  }

  .initial-loading {
    min-height: 100vh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.9rem;
    padding: 1rem;
    background: #fff;
    color: #52525b;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 0.875rem;
  }

  .initial-loading__spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e4e4e7;
    border-top-color: #52525b;
    border-radius: 999px;
    animation: initial-loading-spin 0.8s linear infinite;
  }

  .dark .initial-loading {
    background: #18181b;
    color: #d4d4d8;
  }

  .dark .initial-loading__spinner {
    border-color: #3f3f46;
    border-top-color: #d4d4d8;
  }

  @media (prefers-reduced-motion: reduce) {
    .initial-loading__spinner { animation: none; }
  }
`;

export function InitialLoadingState(): ReactElement {
  return (
    <output aria-live="polite" className="initial-loading" data-slot="hydrate-loader">
      <span aria-hidden="true" className="initial-loading__spinner" />
      <span>Loading application</span>
    </output>
  );
}
