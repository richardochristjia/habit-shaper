import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-field border px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-action text-white shadow-action hover:bg-action-hover active:bg-action-hover",
        secondary:
          "border-border bg-surface text-foreground hover:border-action hover:bg-surface-soft active:border-action active:bg-surface-soft",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-surface-soft hover:text-foreground active:bg-surface-soft",
        build:
          "border-transparent bg-build text-white hover:bg-build-hover active:bg-build-hover",
        break:
          "border-break bg-surface text-break hover:bg-break-soft active:bg-break-soft",
        destructive:
          "border-destructive bg-surface text-destructive hover:bg-destructive-soft active:bg-destructive-soft",
      },
      size: {
        default: "min-h-12 px-4",
        compact: "min-h-11 px-3",
        icon: "size-11 min-h-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
