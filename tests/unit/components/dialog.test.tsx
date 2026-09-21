import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

describe("Dialog", () => {
  it("opens an accessible modal and closes it from inside", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Review estimate</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Estimate review</DialogTitle>
          <DialogDescription>Confirm the estimate before sending it.</DialogDescription>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Review estimate" }));

    const dialog = await screen.findByRole("dialog", { name: "Estimate review" });
    expect(dialog).toHaveAccessibleDescription("Confirm the estimate before sending it.");

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
