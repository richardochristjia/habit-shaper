"use client";

import { useFormStatus } from "react-dom";

export const formInputClassName =
  "min-h-12 w-full rounded-field border border-input-border bg-surface px-3.5 py-3 text-foreground transition-[border-color,box-shadow] duration-200 hover:border-foreground/60 focus:border-focus-ring focus:outline-none focus:ring-3 focus:ring-focus-ring/15 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none aria-invalid:border-destructive";

export function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return (
    <p className="m-0 text-sm font-semibold text-destructive" id={id}>
      {errors[0]}
    </p>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="m-0 border-l-4 border-destructive bg-destructive-soft px-3.5 py-3 text-sm font-semibold text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  variant,
}: {
  idleLabel: string;
  pendingLabel: string;
  variant: "primary" | "secondary" | "destructive";
}) {
  const { pending } = useFormStatus();
  const variants = {
    primary:
      "border-transparent bg-action text-white shadow-action enabled:hover:bg-action-hover enabled:active:bg-action-hover",
    secondary:
      "border-border bg-surface text-foreground enabled:hover:border-action enabled:hover:bg-surface-soft enabled:active:border-action enabled:active:bg-surface-soft",
    destructive:
      "border-destructive bg-surface text-destructive enabled:hover:bg-destructive-soft enabled:active:bg-destructive-soft",
  };

  return (
    <button
      className={`min-h-12 cursor-pointer rounded-field border px-5 py-2.5 font-bold transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
