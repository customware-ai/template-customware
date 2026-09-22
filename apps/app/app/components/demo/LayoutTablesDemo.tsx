"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { lazy, Suspense, type ReactElement } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

// TanStack Table is a large third-party package. Keep it behind this import()
// boundary so simple table UI does not pull data-grid code into the parent chunk.
const LayoutDataTableDemo = lazy(() =>
  import("~/components/demo/LayoutDataTableDemo").then((module) => ({
    default: module.LayoutDataTableDemo,
  })),
);

export function LayoutTablesDemo(): ReactElement {
  return (
    <ShowcaseCard
      title="Table and data table"
      description="Shared primitive plus route-level table composition."
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Discovery</TableCell>
                <TableCell>Ava</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Pricing</TableCell>
                <TableCell>Rhea</TableCell>
                <TableCell>
                  <Badge variant="outline">Queued</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <Suspense fallback={null}>
          <LayoutDataTableDemo />
        </Suspense>
      </div>
    </ShowcaseCard>
  );
}
