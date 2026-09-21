"use client";

import { type ReactElement } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export function LayoutDisclosureDemo(): ReactElement {
  return (
    <ShowcaseCard
      title="Accordion, collapsible, tabs"
      description="Progressive disclosure for dense screens."
    >
      <div className="space-y-4">
        <Accordion>
          <AccordionItem value="item-1">
            <AccordionTrigger>Quote summary</AccordionTrigger>
            <AccordionContent>
              Three approvals pending, margin stable, and no blocking validation errors.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible>
          <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
            Toggle details
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 text-sm text-muted-foreground">
            Collapsible content is useful when a full accordion feels too heavy.
          </CollapsibleContent>
        </Collapsible>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm text-muted-foreground">
            Overview panel content.
          </TabsContent>
          <TabsContent value="history" className="text-sm text-muted-foreground">
            History panel content.
          </TabsContent>
        </Tabs>
      </div>
    </ShowcaseCard>
  );
}
