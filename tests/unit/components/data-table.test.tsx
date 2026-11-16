import { columnVisibilityFeature, tableFeatures, useTable } from "../../../apps/app/node_modules/@tanstack/react-table/dist/index.js";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect, it } from "vite-plus/test";

import { DataTable } from "~/components/ui/data-table";

function Example(): ReactElement {
  const table = useTable({
    features: tableFeatures({ columnVisibilityFeature }),
    data: [{ first: "Visible", second: "Also visible", hidden: "Hidden value" }],
    columns: [{ id: "group", header: "Group", columns: [
      { accessorKey: "first" }, { accessorKey: "second" }, { accessorKey: "hidden" },
    ] }],
    state: { columnVisibility: { hidden: false } },
  });
  return <DataTable table={table} />;
}

it("renders default cells, respects visibility, and spans grouped headers", () => {
  render(<Example />);
  expect(screen.getByText("Visible")).toBeVisible();
  expect(screen.getByText("Also visible")).toBeVisible();
  expect(screen.queryByText("Hidden value")).toBeNull();
  expect(screen.getByText("Group")).toHaveAttribute("colspan", "2");
});
