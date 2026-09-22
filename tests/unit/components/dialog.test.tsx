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

/** TEMPLATE EXAMPLE ONLY. Replace this interaction with real product coverage. */
describe("Dialog", () => {
  it("opens an accessible modal and closes it from inside", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Review todo</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Todo review</DialogTitle>
          <DialogDescription>Confirm the todo before saving it.</DialogDescription>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Review todo" }));

    const dialog = await screen.findByRole("dialog", { name: "Todo review" });
    expect(dialog).toHaveAccessibleDescription("Confirm the todo before saving it.");

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
