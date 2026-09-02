"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "!border-border !bg-surface !text-foreground !shadow-card",
          description: "!text-muted-foreground",
          success: "!border-build",
          error: "!border-destructive",
        },
      }}
    />
  );
}
