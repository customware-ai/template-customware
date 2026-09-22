"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { type ReactElement } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { ScrollArea } from "~/components/ui/scroll-area";

export function LayoutScrollResizeDemo(): ReactElement {
  return (
    <ShowcaseCard
      title="Scroll area and resizable panels"
      description="Viewport-bound containers and pane resizing."
    >
      <div className="space-y-4">
        <ScrollArea className="h-40 rounded-xl border border-border p-4">
          <div className="space-y-3 text-sm">
            {Array.from({ length: 8 }, (_, index) => `Row ${index + 1}`).map((rowLabel) => (
              <div key={rowLabel} className="rounded-lg bg-muted/60 p-3">
                {rowLabel} inside the scroll area.
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="h-52 overflow-hidden rounded-xl border border-border">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={55}>
              <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                Pipeline board
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45}>
              <div className="flex h-full items-center justify-center bg-card text-sm text-muted-foreground">
                Inspector
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </ShowcaseCard>
  );
}
