import Link from "next/link";
import type { ReactNode } from "react";
import { AuthForm } from "@/features/auth/auth-form";

type AuthMode = "register" | "sign-in";

type AuthPageProps = {
  mode: AuthMode;
  brand: {
    heading: string;
    description: string;
    support: ReactNode;
  };
  form: {
    eyebrow: string;
    heading: string;
    description: string;
    switchPrompt: string;
    switchHref: string;
    switchLabel: string;
  };
};

export function AuthPage({ mode, brand, form }: AuthPageProps) {
  const formHeadingId = `${mode}-heading`;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(25rem,0.95fr)]">
      <section
        className="flex flex-col justify-center bg-[radial-gradient(circle_at_10%_10%,var(--color-brand-glow),transparent_35%),linear-gradient(145deg,var(--color-brand-soft),var(--color-surface-soft))] px-6 py-12 sm:px-8 sm:py-14 lg:p-[clamp(3rem,7vw,6.5rem)]"
        aria-labelledby="brand-heading"
      >
        <div
          className="mb-6 grid size-14 place-items-center rounded-mark bg-brand font-display font-bold text-white shadow-brand sm:mb-8"
          aria-hidden="true"
        >
          HS
        </div>
        <p className="mb-3 text-xs font-extrabold tracking-[0.15em] text-action uppercase">
          Habit Shaper
        </p>
        <h1
          className="max-w-copy font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-foreground"
          id="brand-heading"
        >
          {brand.heading}
        </h1>
        <p className="mt-6 max-w-copy text-[1.075rem] text-foreground/80">
          {brand.description}
        </p>
        {brand.support}
      </section>
      <section
        className="flex flex-col justify-center bg-surface px-6 py-14 shadow-card sm:px-8 sm:py-16 lg:p-[clamp(3rem,7vw,6.5rem)]"
        aria-labelledby={formHeadingId}
      >
        <div className="mx-auto w-full max-w-auth">
          <p className="mb-3 text-xs font-extrabold tracking-[0.15em] text-action uppercase">
            {form.eyebrow}
          </p>
          <h2
            className="font-display text-[clamp(1.875rem,4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.025em]"
            id={formHeadingId}
          >
            {form.heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{form.description}</p>
          <AuthForm mode={mode} />
          <p className="mt-7 text-muted-foreground">
            {form.switchPrompt}{" "}
            <Link
              className="inline-flex min-h-11 cursor-pointer items-center font-bold text-action underline underline-offset-4 transition-colors duration-200 hover:text-action-hover focus-visible:rounded-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none"
              href={form.switchHref}
            >
              {form.switchLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
