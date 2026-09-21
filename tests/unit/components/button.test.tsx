import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Button } from "~/components/ui/button";

// Sample test only: keep component coverage focused on behavior that should not
// regress. Do not add tests for every variant, class, or incidental click.
describe("Button", () => {
  it("shows loading feedback and disables interaction while loading", () => {
    const handleClick = vi.fn();

    render(
      <Button loading onClick={handleClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
