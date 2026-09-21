import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Template backend note:
 *
 * This schema is sample-only. It exists so the template shows a complete
 * contract → query → service → route chain. A consuming app can replace the
 * table shape with its own domain tables without needing to preserve this one.
 */

/**
 * Template example table used by the CPQ estimate contract/service/query flow.
 */
export const estimates = sqliteTable(
  "estimates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    estimate_number: text("estimate_number").notNull(),
    account_name: text("account_name").notNull(),
    project_name: text("project_name").notNull(),
    status: text("status").notNull().default("draft"),
    workflow_stage: text("workflow_stage").notNull(),
    item_count: integer("item_count").notNull().default(0),
    total_value: real("total_value").notNull().default(0),
    margin_percent: real("margin_percent").notNull().default(0),
    notes: text("notes"),
    created_at: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_estimates_status").on(table.status),
    index("idx_estimates_number").on(table.estimate_number),
    index("idx_estimates_account").on(table.account_name),
  ],
);
