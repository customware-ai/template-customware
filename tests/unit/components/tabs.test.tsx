import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

describe("Tabs", () => {
  it("switches the selected panel with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Estimate sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Current estimate</TabsContent>
        <TabsContent value="history">Earlier revisions</TabsContent>
      </Tabs>,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Current estimate");

    overviewTab.focus();
    await user.keyboard("{ArrowRight}");

    const historyTab = screen.getByRole("tab", { name: "History" });
    await waitFor(() => expect(historyTab).toHaveFocus());
    await user.keyboard("{Enter}");

    await waitFor(() => expect(historyTab).toHaveAttribute("aria-selected", "true"));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Earlier revisions");
  });
});
