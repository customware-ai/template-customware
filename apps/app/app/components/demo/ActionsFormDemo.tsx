"use client";

import { Result } from "better-result";
import { type FormEvent, type ReactElement, useState } from "react";
import { z } from "zod";

import { ShowcaseCard } from "~/components/demo/shared";
import { Button } from "~/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/toast";

const formSchema = z.object({
  company: z.string().min(2, "Use at least 2 characters."),
  contact: z.email("Enter a valid email."),
  notes: z.string().min(10, "Add more context."),
  priority: z.enum(["standard", "expedite"]),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof formSchema>, string>>;

export function ActionsFormDemo(): ReactElement {
  const [errors, setErrors] = useState<FieldErrors>({});

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = Result.try({
      try: () => formSchema.parse(Object.fromEntries(new FormData(event.currentTarget))),
      catch: (cause) => cause,
    });

    if (parsed.isErr()) {
      const fieldErrors: FieldErrors = {};
      if (parsed.error instanceof z.ZodError) {
        for (const issue of parsed.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string" && field in formSchema.shape) {
            fieldErrors[field as keyof FieldErrors] = issue.message;
          }
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    toast.add({
      title: "Form submitted",
      description: `${parsed.value.company} updated for ${parsed.value.priority} review.`,
      type: "success",
    });
  };

  return (
    <ShowcaseCard title="Validated form" description="Field primitives plus Zod validation.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.company)}>
            <FieldLabel htmlFor="company">Company</FieldLabel>
            <Input id="company" name="company" defaultValue="Northwind Health" />
            <FieldDescription>Account receiving the updated quote.</FieldDescription>
            <FieldError>{errors.company}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.contact)}>
            <FieldLabel htmlFor="contact">Contact</FieldLabel>
            <Input id="contact" name="contact" defaultValue="ops@northwind.example" />
            <FieldError>{errors.contact}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.notes)}>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              name="notes"
              defaultValue="Need final pricing review before Friday."
            />
            <FieldError>{errors.notes}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.priority)}>
            <FieldLabel>Priority</FieldLabel>
            <RadioGroup
              name="priority"
              defaultValue="standard"
              className="grid gap-2 sm:grid-cols-2"
            >
              <FieldLabel htmlFor="priority-standard">
                <Field orientation="horizontal">
                  <RadioGroupItem id="priority-standard" value="standard" />
                  <div>
                    <div className="text-sm font-medium">Standard</div>
                    <div className="text-xs text-muted-foreground">Normal review lane</div>
                  </div>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="priority-expedite">
                <Field orientation="horizontal">
                  <RadioGroupItem id="priority-expedite" value="expedite" />
                  <div>
                    <div className="text-sm font-medium">Expedite</div>
                    <div className="text-xs text-muted-foreground">
                      Move to the front of the queue
                    </div>
                  </div>
                </Field>
              </FieldLabel>
            </RadioGroup>
            <FieldError>{errors.priority}</FieldError>
          </Field>
        </FieldGroup>
        <Button type="submit">Submit</Button>
      </form>
    </ShowcaseCard>
  );
}
