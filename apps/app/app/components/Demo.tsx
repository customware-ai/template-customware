"use client";

import { lazy, Suspense, type ReactElement, useState } from "react";
import { toast as sonnerToast } from "sonner";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { ToastAction } from "~/components/ui/toast";
import { TooltipProvider } from "~/components/ui/tooltip";
import { toast as legacyToast } from "~/hooks/use-toast";

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
            onTriggerSonner={(): void => {
              sonnerToast.success("Sonner notification", {
                description: "Global toast wiring is active.",
              });
            }}
            onTriggerLegacyToast={(): void => {
              legacyToast({
                title: "Legacy toast",
                description: "Hook-based Radix toast is still mounted.",
                action: <ToastAction altText="Dismiss">Undo</ToastAction>,
              });
            }}
          />
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
