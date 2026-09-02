"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type * as React from "react";
import { cn } from "@/lib/utils";

function DropdownMenu(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn(
          "z-70 min-w-40 overflow-hidden rounded-field border border-border bg-surface p-1 shadow-card data-[state=closed]:[animation:dialog-overlay-out_150ms_ease-in] data-[state=open]:[animation:dialog-overlay-in_150ms_ease-out] motion-reduce:[animation:none]",
          className,
        )}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  destructive?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm font-bold outline-none transition-colors duration-150 data-[disabled]:pointer-events-none data-[highlighted]:bg-surface-soft data-[disabled]:opacity-50 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
        destructive
          ? "text-destructive data-[highlighted]:bg-destructive-soft"
          : "text-foreground",
        className,
      )}
      data-slot="dropdown-menu-item"
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
};
