"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { SearchIcon, SparklesIcon } from "lucide-react";
import { type Dispatch, type ReactElement, type SetStateAction } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import { Button } from "~/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "~/components/ui/button-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { Kbd } from "~/components/ui/kbd";
import { Label } from "~/components/ui/label";
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select";
import { Progress } from "~/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Toggle } from "~/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export function ActionsControlsDemo({
  progressValue,
  setProgressValue,
  otpValue,
  setOtpValue,
}: {
  progressValue: number;
  setProgressValue: Dispatch<SetStateAction<number>>;
  otpValue: string;
  setOtpValue: Dispatch<SetStateAction<string>>;
}): ReactElement {
  return (
    <>
      <ShowcaseCard
        title="Buttons and toggles"
        description="Stateful controls and keyboard hinting."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
          <ButtonGroup>
            <Button variant="ghost" size="sm">
              Save
            </Button>
            <ButtonGroupSeparator />
            <ButtonGroupText>Ctrl</ButtonGroupText>
            <Kbd>S</Kbd>
          </ButtonGroup>
          <div className="flex flex-wrap items-center gap-3">
            <Toggle aria-label="Toggle pin">
              <SparklesIcon />
            </Toggle>
            <ToggleGroup defaultValue={["week"]}>
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </ShowcaseCard>
      <ShowcaseCard
        title="Choice controls"
        description="Checkbox, radio, switch, slider, and progress."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox defaultChecked id="alerts" />
            <Label htmlFor="alerts">Alert routing enabled</Label>
          </div>
          <RadioGroup defaultValue="proposal">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="proposal" id="proposal" />
              <Label htmlFor="proposal">Proposal</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="review" id="review" />
              <Label htmlFor="review">Review</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-approve under threshold</span>
            <Switch defaultChecked />
          </div>
          <Slider
            value={progressValue}
            onValueChange={(value): void =>
              setProgressValue(Array.isArray(value) ? (value[0] ?? 0) : value)
            }
            max={100}
            step={1}
          />
          <Progress value={progressValue} />
        </div>
      </ShowcaseCard>
      <ShowcaseCard
        title="Inputs and composed fields"
        description="Structured entry patterns and mobile-safe native inputs."
      >
        <div className="space-y-4">
          <Input placeholder="Quote title" />
          <Textarea placeholder="Context for reviewers" />
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search accounts" />
            <InputGroupButton>Go</InputGroupButton>
          </InputGroup>
          <NativeSelect defaultValue="review">
            <NativeSelectOption value="discovery">Discovery</NativeSelectOption>
            <NativeSelectOption value="review">Review</NativeSelectOption>
            <NativeSelectOption value="approved">Approved</NativeSelectOption>
          </NativeSelect>
          <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </ShowcaseCard>
    </>
  );
}
