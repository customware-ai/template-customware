"use client";

import {
  flexRender,
  type ReactTable,
  type RowData,
  type TableFeatures,
} from "@tanstack/react-table";
import { row_getVisibleCells } from "@tanstack/react-table/static-functions";
import type { ReactElement } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

/** Renders a configured TanStack table without imposing a data model. */
export function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  table,
}: {
  table: ReactTable<TFeatures, TData>;
}): ReactElement {
  return (
    <div className="rounded-xl border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row_getVisibleCells(row).map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
