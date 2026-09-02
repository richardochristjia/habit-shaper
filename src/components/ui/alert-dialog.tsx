"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function AlertDialog(
  props: ComponentProps<typeof AlertDialogPrimitive.Root>,
) {
  return <AlertDialogPrimitive.Root {...props} />;
}

export function AlertDialogTitle({
  className = "",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn(
        "font-display text-xl font-semibold leading-tight",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className = "",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function AlertDialogContent({
  children,
  className = "",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-60 bg-foreground/45 transition-opacity duration-150 motion-reduce:transition-none" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-70 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-card border border-border bg-surface p-6 shadow-card outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogCancel({
  className = "",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(
        "min-h-11 cursor-pointer rounded-field border border-border bg-surface px-5 py-2.5 font-bold text-foreground transition-colors duration-150 hover:border-action hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogAction({
  className = "",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(
        "min-h-11 cursor-pointer rounded-field border border-destructive bg-destructive px-5 py-2.5 font-bold text-white transition-colors duration-150 hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
