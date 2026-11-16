import type { ReactElement } from "react";

import { ModeToggle } from "~/components/mode-toggle";
import { TodoActivityChart } from "~/components/todo-activity-chart";
import { TodoDemo } from "~/components/todo-demo";

/** Introduces the reusable UI foundation. */
export default function IndexPage(): ReactElement {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">UI components</h1>
          <p className="text-sm text-muted-foreground">
            Reusable components live in apps/app/app/components/ui.
          </p>
        </div>
        <ModeToggle />
      </header>
      <TodoDemo />
      <TodoActivityChart />
    </section>
  );
}
