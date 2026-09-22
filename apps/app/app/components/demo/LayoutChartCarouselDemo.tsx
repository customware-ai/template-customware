"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { lazy, Suspense, type ReactElement } from "react";

import { ShowcaseCard } from "~/components/demo/shared";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

// Recharts is a large charting package. Keep it behind this import() boundary
// so pages that only need carousel/pagination UI do not load charting code.
const LayoutChartDemo = lazy(() =>
  import("~/components/demo/LayoutChartDemo").then((module) => ({
    default: module.LayoutChartDemo,
  })),
);

export function LayoutChartCarouselDemo(): ReactElement {
  return (
    <ShowcaseCard title="Chart and carousel" description="Data and media presentation.">
      <div className="space-y-6">
        <Suspense fallback={null}>
          <LayoutChartDemo />
        </Suspense>
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Carousel opts={{ loop: true }}>
            <CarouselContent>
              {["Proposal", "Review", "Approval"].map((label) => (
                <CarouselItem key={label}>
                  <div className="rounded-xl border border-border bg-muted/40 p-8 text-center text-sm font-medium">
                    {label} slide
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#pagination" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#pagination" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#pagination">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#pagination" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </ShowcaseCard>
  );
}
