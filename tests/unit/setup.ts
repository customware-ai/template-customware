import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vite-plus/test";

import { E2E_DATABASE_FILE_PATH } from "../e2e/database";

process.env.E2E_DATABASE_FILE_PATH = E2E_DATABASE_FILE_PATH;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock console methods to keep test output clean
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});
vi.spyOn(console, "info").mockImplementation(() => {});
vi.spyOn(console, "debug").mockImplementation(() => {});

if (!window.matchMedia) {
  window.matchMedia = ((query: string): MediaQueryList => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }) as typeof window.matchMedia;
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver
    implements globalThis.IntersectionObserver
  {
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds = [];

    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    unobserve(): void {}
  };
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver implements globalThis.ResizeObserver {
    disconnect(): void {}
    observe(): void {}
    unobserve(): void {}
  };
}
