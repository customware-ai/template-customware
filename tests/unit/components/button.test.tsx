import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Button } from "~/components/ui/button";

describe("Button", () => {
  it("disables interaction through the native disabled contract", () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
