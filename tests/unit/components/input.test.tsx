import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

describe("Input", () => {
  it("forwards native input accessibility properties", () => {
    render(<Input aria-label="Email address" aria-invalid="true" type="email" />);

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Textarea", () => {
  it("forwards native textarea accessibility properties", () => {
    render(<Textarea aria-label="Description" aria-invalid="true" />);

    const textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });
});
