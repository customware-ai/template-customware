import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { HydrateFallback } from "../../../apps/app/app/root";

// Sample test only: assert the stable loading contract. Visual polish belongs
// in interactive Playwright verification unless the loader behavior is core.
describe("root hydrate fallback", () => {
  it("renders the accessible application loading state", () => {
    const { container } = render(<HydrateFallback />);

    expect(container.querySelector("output[data-slot='hydrate-loader']")).not.toBeNull();
    expect(screen.getByText("Loading application")).toBeInTheDocument();
    expect(container.querySelector("svg.animate-spin")).toBeNull();
  });
});
