import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

// Sample tests only: cover stable form-field contracts such as labeling and
// validation feedback. Avoid class-only, prop-forwarding, or every-handler tests.
describe("Input", () => {
  it("renders an accessible labeled field with helper text", () => {
    render(<Input label="Email Address" type="email" helperText="Use your work email" />);

    const input = screen.getByLabelText("Email Address");

    expect(input).toHaveAttribute("id", "email-address");
    expect(input).toHaveAttribute("type", "email");
    expect(screen.getByText("Use your work email")).toBeInTheDocument();
  });

  it("shows validation feedback instead of helper text", () => {
    render(<Input error="Invalid input" helperText="Helper copy" data-testid="input" />);

    const input = screen.getByTestId("input");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Invalid input")).toBeInTheDocument();
    expect(screen.queryByText("Helper copy")).not.toBeInTheDocument();
  });
});

describe("Textarea", () => {
  it("renders an accessible textarea with helper text", () => {
    render(<Textarea label="Description" helperText="Max 500 characters" />);

    const textarea = screen.getByLabelText("Description");

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(screen.getByText("Max 500 characters")).toBeInTheDocument();
  });

  it("shows validation feedback instead of helper text", () => {
    render(
      <Textarea error="Required field" helperText="Max 500 characters" data-testid="textarea" />,
    );

    const textarea = screen.getByTestId("textarea");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Required field")).toBeInTheDocument();
    expect(screen.queryByText("Max 500 characters")).not.toBeInTheDocument();
  });
});
