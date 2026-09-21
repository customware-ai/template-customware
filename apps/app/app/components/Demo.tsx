"use client";

/**
 * REFERENCE UI ONLY.
 * Keep this component available while implementing the first product task, then
 * remove it and `components/demo/` at the very end after the product UI and its
 * documentation have been completed and verified.
 */

import { lazy, Suspense, type ReactElement, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { toast } from "~/components/ui/toast";
import { TooltipProvider } from "~/components/ui/tooltip";

// Demo sections are intentionally lazy imported. Any component file or external
// package that can plausibly add 50 kB+ should stay behind an import() boundary.
const ActionsSection = lazy(() =>
  import("~/components/demo/ActionsSection").then((module) => ({
    default: module.ActionsSection,
  })),
);
const FeedbackSection = lazy(() =>
  import("~/components/demo/FeedbackSection").then((module) => ({
    default: module.FeedbackSection,
  })),
);
const CommunicationSection = lazy(() =>
  import("~/components/demo/CommunicationSection").then((module) => ({
    default: module.CommunicationSection,
  })),
);
// Keep the optional server-state reference surface split from the demo shell.
const DataSection = lazy(() =>
  import("~/components/demo/DataSection").then((module) => ({
    default: module.DataSection,
  })),
);
const HeroSection = lazy(() =>
  import("~/components/demo/HeroSection").then((module) => ({
    default: module.HeroSection,
  })),
);
const IdentitySection = lazy(() =>
  import("~/components/demo/IdentitySection").then((module) => ({
    default: module.IdentitySection,
  })),
);
const LayoutSection = lazy(() =>
  import("~/components/demo/LayoutSection").then((module) => ({
    default: module.LayoutSection,
  })),
);
const OverlaySection = lazy(() =>
  import("~/components/demo/OverlaySection").then((module) => ({
    default: module.OverlaySection,
  })),
);

export default function Demo(): ReactElement {
  const [commandOpen, setCommandOpen] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(new Date());
  const [comboboxValue, setComboboxValue] = useState("proposal");
  const [progressValue, setProgressValue] = useState(58);
  const [otpValue, setOtpValue] = useState("");

  return (
    <TooltipProvider>
      <div className="space-y-12 pb-12">
        <Suspense fallback={null}>
          <HeroSection
            onOpenCommand={(): void => setCommandOpen(true)}
            onTriggerToast={(): void => {
              toast.add({
                title: "Base UI notification",
                description: "Global toast wiring is active.",
                type: "success",
              });
            }}
            onTriggerActionToast={(): void => {
              toast.add({
                title: "Action available",
                description: "The generated toast supports an optional action.",
                actionProps: { children: "Undo" },
              });
            }}
          />
          <DataSection />
          <IdentitySection />
          <ActionsSection
            dateValue={dateValue}
            setDateValue={setDateValue}
            comboboxValue={comboboxValue}
            setComboboxValue={setComboboxValue}
            progressValue={progressValue}
            setProgressValue={setProgressValue}
            otpValue={otpValue}
            setOtpValue={setOtpValue}
          />
          <OverlaySection onOpenCommand={(): void => setCommandOpen(true)} />
          <LayoutSection />
          <FeedbackSection dateValue={dateValue} setDateValue={setDateValue} />
          <CommunicationSection />
        </Suspense>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No result found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={(): void => setCommandOpen(false)}>
              Open review board
            </CommandItem>
            <CommandItem onSelect={(): void => setCommandOpen(false)}>Export pipeline</CommandItem>
            <CommandItem onSelect={(): void => setCommandOpen(false)}>Toggle density</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </TooltipProvider>
  );
}
