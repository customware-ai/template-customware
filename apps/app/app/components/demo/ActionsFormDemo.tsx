"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { toast as sonnerToast } from "sonner";
import { z } from "zod";

import { ShowcaseCard } from "~/components/demo/shared";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";

const formSchema = z.object({
  company: z.string().min(2, "Use at least 2 characters."),
  contact: z.string().email("Enter a valid email."),
  notes: z.string().min(10, "Add more context."),
  priority: z.enum(["standard", "expedite"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ActionsFormDemo(): ReactElement {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "Northwind Health",
      contact: "ops@northwind.example",
      notes: "Need final pricing review before Friday.",
      priority: "standard",
    },
  });
  const onSubmit = (values: FormValues): void => {
    sonnerToast.success("Form submitted", {
      description: `${values.company} updated for ${values.priority} review.`,
    });
  };

  return (
    <ShowcaseCard title="React Hook Form" description="Form wrapper plus validation messaging.">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="company"
            render={({ field }): ReactElement => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Account receiving the updated quote.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }): ReactElement => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input id="contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }): ReactElement => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea id="notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }): ReactElement => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    <label
                      htmlFor="priority-standard"
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
                    >
                      <RadioGroupItem id="priority-standard" value="standard" />
                      <div>
                        <div className="text-sm font-medium">Standard</div>
                        <div className="text-xs text-muted-foreground">Normal review lane</div>
                      </div>
                    </label>
                    <label
                      htmlFor="priority-expedite"
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
                    >
                      <RadioGroupItem id="priority-expedite" value="expedite" />
                      <div>
                        <div className="text-sm font-medium">Expedite</div>
                        <div className="text-xs text-muted-foreground">
                          Move to the front of the queue
                        </div>
                      </div>
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </ShowcaseCard>
  );
}
