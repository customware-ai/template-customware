"use client";

import { lazy, Suspense, type Dispatch, type ReactElement, type SetStateAction } from "react";

import { Section } from "~/components/demo/shared";

// Input/form packages can grow quickly. Keep optional action demos lazy so
// larger form controls and validation code do not inflate the section shell.
const ActionsControlsDemo = lazy(() =>
  import("~/components/demo/ActionsControlsDemo").then((module) => ({
    default: module.ActionsControlsDemo,
  })),
);
const ActionsPickerDetailsDemo = lazy(() =>
  import("~/components/demo/ActionsPickerDetailsDemo").then((module) => ({
    default: module.ActionsPickerDetailsDemo,
  })),
);
const ActionsFormDemo = lazy(() =>
  import("~/components/demo/ActionsFormDemo").then((module) => ({
    default: module.ActionsFormDemo,
  })),
);

export function ActionsSection({
  dateValue,
  setDateValue,
  comboboxValue,
  setComboboxValue,
  progressValue,
  setProgressValue,
  otpValue,
  setOtpValue,
}: {
  dateValue: Date | undefined;
  setDateValue: Dispatch<SetStateAction<Date | undefined>>;
  comboboxValue: string;
  setComboboxValue: Dispatch<SetStateAction<string>>;
  progressValue: number;
  setProgressValue: Dispatch<SetStateAction<number>>;
  otpValue: string;
  setOtpValue: Dispatch<SetStateAction<string>>;
}): ReactElement {
  return (
    <Section
      title="Actions and Inputs"
      description="Buttons, toggles, fields, structured forms, and common entry patterns."
    >
      <div className="grid items-start gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        <Suspense fallback={null}>
          <ActionsControlsDemo
            progressValue={progressValue}
            setProgressValue={setProgressValue}
            otpValue={otpValue}
            setOtpValue={setOtpValue}
          />
        </Suspense>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        <Suspense fallback={null}>
          <ActionsPickerDetailsDemo
            dateValue={dateValue}
            setDateValue={setDateValue}
            comboboxValue={comboboxValue}
            setComboboxValue={setComboboxValue}
          />
          <ActionsFormDemo />
        </Suspense>
      </div>
    </Section>
  );
}
