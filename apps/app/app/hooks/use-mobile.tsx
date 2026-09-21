import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 1024;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * Subscribes React to the browser's authoritative viewport breakpoint state.
 */
function subscribeToMobileViewport(onStoreChange: () => void): () => void {
  const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQueryList.addEventListener("change", onStoreChange);

  return (): void => mediaQueryList.removeEventListener("change", onStoreChange);
}

/**
 * Reads the current client viewport state without effect-driven derived state.
 */
function getMobileSnapshot(): boolean {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

/**
 * Keeps server rendering deterministic until React reads the browser snapshot.
 */
function getServerMobileSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );
}
