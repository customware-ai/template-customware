CREATE TABLE `estimates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`estimate_number` text NOT NULL,
	`account_name` text NOT NULL,
	`project_name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`workflow_stage` text NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`total_value` real DEFAULT 0 NOT NULL,
	`margin_percent` real DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_estimates_status` ON `estimates` (`status`);--> statement-breakpoint
CREATE INDEX `idx_estimates_number` ON `estimates` (`estimate_number`);--> statement-breakpoint
CREATE INDEX `idx_estimates_account` ON `estimates` (`account_name`);
