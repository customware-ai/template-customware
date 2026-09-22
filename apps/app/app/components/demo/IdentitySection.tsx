"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { SparklesIcon } from "lucide-react";
import { type ReactElement } from "react";

import { Section, ShowcaseCard } from "~/components/demo/shared";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Separator } from "~/components/ui/separator";
import { toast } from "~/components/ui/toast";

export function IdentitySection(): ReactElement {
  return (
    <Section
      title="Identity and Typography"
      description="Foundational content patterns and low-level display primitives."
    >
      <div className="space-y-10">
        <ShowcaseCard
          title="Badges, avatars, breadcrumbs"
          description="Compact identity treatments."
        >
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Catalog</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>NS</AvatarFallback>
              </Avatar>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              Direct separator coverage for the base primitive.
            </div>
          </div>
        </ShowcaseCard>
        <ShowcaseCard title="Typography" description="Route-level shadcn typography treatment.">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold tracking-tight">
              Intentional, readable documentation blocks
            </h3>
            <p className="text-sm text-muted-foreground">
              Typography is not shipped as a primitive, so this demo keeps it as route-level content
              styling rather than a forced reusable component.
            </p>
            <blockquote className="border-l-2 border-border pl-4 text-sm text-muted-foreground">
              Keep structural styles reusable, and keep document voice local to the screen that
              needs it.
            </blockquote>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          title="Aspect ratio and empty state"
          description="Media framing and no-data surfaces."
        >
          <div className="space-y-4">
            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-muted">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                16:9 preview
              </div>
            </AspectRatio>
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <SparklesIcon className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No configured widgets</EmptyTitle>
                <EmptyDescription>
                  Add layout blocks or seed sample data to preview the workspace shell.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  onClick={(): void => {
                    toast.add({
                      title: "Block added",
                      description: "Sample empty-state action is wired for QA.",
                      type: "success",
                    });
                  }}
                >
                  Add block
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(): void => {
                    toast.add({
                      title: "Sample imported",
                      description: "The empty-state secondary action is interactive too.",
                      type: "success",
                    });
                  }}
                >
                  Import sample
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        </ShowcaseCard>
      </div>
    </Section>
  );
}
