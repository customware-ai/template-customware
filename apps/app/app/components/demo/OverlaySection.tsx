"use client";

import { CommandIcon } from "lucide-react";
import { type ReactElement } from "react";

import { Section, ShowcaseCard } from "~/components/demo/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "~/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export function OverlaySection({ onOpenCommand }: { onOpenCommand: () => void }): ReactElement {
  return (
    <Section
      title="Overlay and Navigation"
      description="Menus, dialogs, drawers, hover surfaces, and command patterns."
    >
      <div className="grid items-start gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        <ShowcaseCard
          title="Menus"
          description="Dropdown, context menu, menubar, and navigation menu."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  Dropdown
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ContextMenu>
                <ContextMenuTrigger className="flex h-9 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
                  Right click
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Assign owner</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Export row</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New quote</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Export</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Compact density</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Workspace</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 md:w-[360px]">
                      <li>
                        <NavigationMenuLink className="block rounded-lg p-3 hover:bg-accent">
                          Workflow shells, navigation patterns, and catalog demos.
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          title="Dialog stack"
          description="Modal, sheet, drawer, and confirmation surfaces."
        >
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Dialog</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Publish updates</DialogTitle>
                  <DialogDescription>
                    Review staged workspace changes before publishing.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Publish</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Sheet</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Workspace panel</SheetTitle>
                  <SheetDescription>Secondary controls without leaving the page.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Drawer>
              <DrawerTrigger render={<Button variant="outline" />}>Drawer</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Mobile-ready actions</DrawerTitle>
                  <DrawerDescription>Base UI drawer for touch-first flows.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Continue</Button>
                  <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" />}>
                Alert Dialog
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete draft quote?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          title="Command, tooltip, hover card"
          description="Fast navigation and contextual helper surfaces."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={onOpenCommand}>
              <CommandIcon className="mr-2 size-4" />
              Command Palette
            </Button>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" />}>Tooltip</TooltipTrigger>
              <TooltipContent>Hover-only hint</TooltipContent>
            </Tooltip>
            <HoverCard>
              <HoverCardTrigger render={<Button variant="outline" />}>Hover Card</HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-1">
                  <div className="font-medium">Northwind Health</div>
                  <div className="text-sm text-muted-foreground">
                    High-value renewal currently in pricing review.
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </ShowcaseCard>
      </div>
    </Section>
  );
}
