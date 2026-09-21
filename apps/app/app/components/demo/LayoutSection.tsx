"use client";

import { lazy, Suspense, type ReactElement } from "react";

import { Section } from "~/components/demo/shared";

// Layout demos pull in several larger UI packages. Keep each area lazy so a
// single component showcase cannot quietly bloat the parent section chunk.
const LayoutDisclosureDemo = lazy(() =>
  import("~/components/demo/LayoutDisclosureDemo").then((module) => ({
    default: module.LayoutDisclosureDemo,
  })),
);
const LayoutScrollResizeDemo = lazy(() =>
  import("~/components/demo/LayoutScrollResizeDemo").then((module) => ({
    default: module.LayoutScrollResizeDemo,
  })),
);
const LayoutSidebarDirectionDemo = lazy(() =>
  import("~/components/demo/LayoutSidebarDirectionDemo").then((module) => ({
    default: module.LayoutSidebarDirectionDemo,
  })),
);
const LayoutTablesDemo = lazy(() =>
  import("~/components/demo/LayoutTablesDemo").then((module) => ({
    default: module.LayoutTablesDemo,
  })),
);
const LayoutChartCarouselDemo = lazy(() =>
  import("~/components/demo/LayoutChartCarouselDemo").then((module) => ({
    default: module.LayoutChartCarouselDemo,
  })),
);

export function LayoutSection(): ReactElement {
  return (
    <Section
      title="Layout and Data"
      description="Disclosure patterns, scrolling, resizing, tables, charts, and client-only shell previews."
    >
      <div className="grid gap-4">
        <Suspense fallback={null}>
          <LayoutDisclosureDemo />
          <LayoutScrollResizeDemo />
          <LayoutSidebarDirectionDemo />
        </Suspense>
      </div>
      <div className="grid gap-4">
        <Suspense fallback={null}>
          <LayoutTablesDemo />
          <LayoutChartCarouselDemo />
        </Suspense>
      </div>
    </Section>
  );
}
