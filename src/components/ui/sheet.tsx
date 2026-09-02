"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Sheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-foreground/45 data-[state=closed]:[animation:dialog-overlay-out_150ms_ease-in] data-[state=open]:[animation:dialog-overlay-in_180ms_ease-out] motion-reduce:[animation:none]",
        className,
      )}
      data-slot="sheet-overlay"
      {...props}
    />
  );
}

function SheetContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-full min-w-0 flex-col overflow-x-hidden bg-surface shadow-card outline-none data-[state=closed]:[animation:dialog-content-out_150ms_ease-in] data-[state=open]:[animation:dialog-content-in_180ms_ease-out] motion-reduce:[animation:none] sm:w-[min(42rem,calc(100vw-4rem))] sm:border-l sm:border-border",
          className,
        )}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 grid size-11 cursor-pointer place-items-center rounded-field text-muted-foreground transition-colors duration-200 hover:bg-surface-soft hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
          <X aria-hidden="true" className="size-5" />
          <span className="sr-only">Close Habit details</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "min-w-0 max-w-full border-b border-border p-5 pr-16 sm:p-6 sm:pr-16",
        className,
      )}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "break-words font-display text-3xl font-semibold leading-tight tracking-[-0.025em]",
        className,
      )}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
