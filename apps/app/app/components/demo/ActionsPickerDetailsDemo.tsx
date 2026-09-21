"use client";

import { CreditCardIcon } from "lucide-react";
import { type Dispatch, type ReactElement, type SetStateAction } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { InputGroup, InputGroupTextarea } from "~/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Select } from "~/components/ui/select";

export function ActionsPickerDetailsDemo({
  dateValue,
  setDateValue,
  comboboxValue,
  setComboboxValue,
}: {
  dateValue: Date | undefined;
  setDateValue: Dispatch<SetStateAction<Date | undefined>>;
  comboboxValue: string;
  setComboboxValue: Dispatch<SetStateAction<string>>;
}): ReactElement {
  return (
    <>
      <ShowcaseCard
        title="Select, combobox, date picker"
        description="Decision controls built on the shared primitives."
      >
        <div className="space-y-4">
          <Select
            value="ops"
            options={[
              { label: "Operations", value: "ops" },
              { label: "Finance", value: "finance" },
              { label: "Executive", value: "executive" },
            ]}
          />
          <Combobox
            value={comboboxValue}
            onChange={setComboboxValue}
            options={[
              { label: "Proposal", value: "proposal" },
              { label: "Review", value: "review" },
              { label: "Approved", value: "approved" },
            ]}
          />
          <DatePicker value={dateValue} onChange={setDateValue} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Context panel</PopoverTitle>
                <PopoverDescription>
                  Compact summaries, helper content, and small utility forms.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
      </ShowcaseCard>
      <ShowcaseCard
        title="Field and item helpers"
        description="Support components for dense settings screens."
      >
        <div className="space-y-4">
          <FieldSet>
            <FieldTitle>Approval settings</FieldTitle>
            <FieldDescription>
              Keep low-level layout primitives reusable instead of burying them in route code.
            </FieldDescription>
            <FieldSeparator />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="billing-code">Billing code</FieldLabel>
                <FieldContent>
                  <Input id="billing-code" placeholder="NW-4451" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="internal-notes">Internal notes</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupTextarea
                      id="internal-notes"
                      defaultValue="Escalate only if margin drops below threshold."
                    />
                  </InputGroup>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Item>
            <ItemMedia>
              <CreditCardIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemHeader>
                <ItemTitle>Billing profile</ItemTitle>
                <ItemActions>
                  <Badge variant="secondary">Saved</Badge>
                </ItemActions>
              </ItemHeader>
              <ItemDescription>Ends in 4421 and is used for preview purchases.</ItemDescription>
              <ItemFooter>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </ItemFooter>
            </ItemContent>
          </Item>
        </div>
      </ShowcaseCard>
    </>
  );
}
