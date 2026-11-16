import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement } from "react";
import { describe, expect, it } from "vite-plus/test";

import { ThemeProvider, useTheme } from "~/components/theme-provider";

function ThemeControl(): ReactElement {
  const { theme, setTheme } = useTheme();

  return <button onClick={() => setTheme("dark")}>{theme}</button>;
}

describe("ThemeProvider", () => {
  it("applies and persists an explicit theme choice", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="system">
        <ThemeControl />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "system" }));

    expect(screen.getByRole("button", { name: "dark" })).toBeVisible();
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("ui-theme")).toBe("dark");
  });
});

it("tracks system changes and removes the listener when leaving system mode", async () => {
  const user = userEvent.setup();
  const original = window.matchMedia;
  const media = new EventTarget();
  let dark = false;
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({
    get matches() { return dark; },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: media.addEventListener.bind(media),
    removeEventListener: media.removeEventListener.bind(media),
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: media.dispatchEvent.bind(media),
  }) });
  try {
    render(<ThemeProvider><ThemeControl /></ThemeProvider>);
    expect(document.documentElement).toHaveClass("light");
    dark = true;
    media.dispatchEvent(new Event("change"));
    expect(document.documentElement).toHaveClass("dark");
    await user.click(screen.getByRole("button", { name: "system" }));
    dark = false;
    media.dispatchEvent(new Event("change"));
    expect(document.documentElement).toHaveClass("dark");
  } finally {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: original });
  }
});

it("falls back when the stored theme is invalid", () => {
  window.localStorage.setItem("ui-theme", "invalid");
  render(<ThemeProvider defaultTheme="light"><ThemeControl /></ThemeProvider>);
  expect(screen.getByRole("button", { name: "light" })).toBeVisible();
});
