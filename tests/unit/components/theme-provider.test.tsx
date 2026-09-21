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
