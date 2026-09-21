"use client";

import { CircleCheckIcon, TablePropertiesIcon, WandSparklesIcon } from "lucide-react";
import { type Dispatch, type ReactElement, type SetStateAction } from "react";

import { Section, ShowcaseCard } from "~/components/demo/shared";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Calendar } from "~/components/ui/calendar";
import { Kbd, KbdGroup } from "~/components/ui/kbd";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";

export function FeedbackSection({
  dateValue,
  setDateValue,
}: {
  dateValue: Date | undefined;
  setDateValue: Dispatch<SetStateAction<Date | undefined>>;
}): ReactElement {
  return (
    <Section
      title="Feedback and Utilities"
      description="Alerts, loading states, notifications, and compact helper components."
    >
      <div className="space-y-4">
        <ShowcaseCard
          title="Alerts and loading"
          description="Status, empty, skeleton, and spinner states."
        >
          <div className="space-y-4">
            <Alert>
              <CircleCheckIcon />
              <AlertTitle>Catalog synced</AlertTitle>
              <AlertDescription>
                All intended components are wired into the client-only template.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 flex-1" />
              <Spinner className="size-5" />
            </div>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          title="Calendar and utilities"
          description="Direct calendar surface plus keyboard hints."
        >
          <div className="max-w-sm space-y-4">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={setDateValue}
              className="rounded-xl border border-border"
            />
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          title="Notifications"
          description="Generated Base UI toast coverage is triggered from the hero actions."
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Use the buttons above to trigger standard and actionable notifications.</p>
            <div className="flex items-center gap-2">
              <TablePropertiesIcon className="size-4" />
              <span>One generated toast manager owns notifications.</span>
            </div>
            <div className="flex items-center gap-2">
              <WandSparklesIcon className="size-4" />
              <span>Success, error, loading, and action states share the same surface.</span>
            </div>
          </div>
        </ShowcaseCard>
      </div>
    </Section>
  );
}
