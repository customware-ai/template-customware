"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { BellIcon, Layers3Icon, Settings2Icon } from "lucide-react";
import { type ReactElement, useState } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DirectionProvider } from "~/components/ui/direction";
import { Kbd } from "~/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

function SidebarPreview(): ReactElement {
  const items = [
    { icon: Layers3Icon, label: "Workflows" },
    { icon: BellIcon, label: "Activity" },
    { icon: Settings2Icon, label: "Settings" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground">
      <SidebarProvider
        defaultOpen
        className="min-h-0 flex-col overflow-hidden [--sidebar-width:17rem] md:h-80 md:flex-row"
      >
        <Sidebar
          collapsible="none"
          className="w-full shrink-0 border-b border-sidebar-border md:h-full md:w-(--sidebar-width) md:border-b-0 md:border-r"
        >
          <SidebarHeader className="justify-center px-4 py-4 md:min-h-28">
            <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/70 px-4 py-3 text-sm font-semibold text-sidebar-accent-foreground">
              <Layers3Icon className="size-5 shrink-0" />
              <span>Component Lab</span>
            </div>
          </SidebarHeader>
          <SidebarSeparator className="mx-0" />
          <SidebarContent className="px-3 py-3">
            <SidebarGroup className="gap-2 px-0">
              <SidebarGroupLabel className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map(({ icon: Icon, label }, index) => (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton
                        isActive={index === 0}
                        className="h-10 rounded-lg px-3 text-base"
                      >
                        <Icon className="size-5" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="min-w-0 bg-background">
          <div className="flex flex-col justify-center border-b border-border px-5 py-4 md:min-h-28">
            <div className="text-lg font-semibold">Inset preview</div>
            <p className="mt-1 text-sm text-muted-foreground">
              The shared sidebar primitives used by the main shell are also exposed here.
            </p>
          </div>
          <div className="grid gap-3 p-5 text-sm text-muted-foreground xl:grid-cols-2">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4">
              Desktop shell collapse behavior is exercised through the real app sidebar toggle in
              the header.
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-4">
              Direction switching is covered separately below so this preview can stay layout-stable
              across widths.
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function DirectionDemo({
  direction,
  onToggle,
}: {
  direction: "ltr" | "rtl";
  onToggle: () => void;
}): ReactElement {
  return (
    <div dir={direction} className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Direction provider</div>
          <div className="text-sm text-muted-foreground">
            Current mode: {direction.toUpperCase()}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onToggle}>
          Toggle Direction
        </Button>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <Badge variant="secondary">Lead</Badge>
        <span>Direction-sensitive row content</span>
        <Kbd className="ml-auto">Tab</Kbd>
      </div>
    </div>
  );
}

export function LayoutSidebarDirectionDemo(): ReactElement {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  return (
    <ShowcaseCard title="Sidebar and direction" description="Shell preview and RTL/LTR coverage.">
      <div className="space-y-4">
        <SidebarPreview />
        <DirectionProvider direction={direction}>
          <DirectionDemo
            direction={direction}
            onToggle={(): void => setDirection((current) => (current === "ltr" ? "rtl" : "ltr"))}
          />
        </DirectionProvider>
      </div>
    </ShowcaseCard>
  );
}
