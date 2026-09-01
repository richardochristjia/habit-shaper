import { signOutAction } from "@/features/auth/actions";
import { requireSession } from "@/lib/session";

export default async function ApplicationPage() {
  const session = await requireSession();
  return (
    <main className="mx-auto w-full max-w-app px-4 pt-6 pb-16 sm:px-6">
      <header className="flex min-h-16 items-center justify-between gap-5">
        <a
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm font-bold text-foreground no-underline transition-colors duration-200 hover:text-action focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none"
          href="/app"
          aria-label="Habit Shaper home"
        >
          <span
            className="grid size-11 place-items-center rounded-mark-small bg-brand font-display text-xs font-bold text-white shadow-brand"
            aria-hidden="true"
          >
            HS
          </span>
          Habit Shaper
        </a>
        <form action={signOutAction}>
          <button
            className="min-h-12 cursor-pointer rounded-field border border-border bg-surface px-5 py-2.5 font-bold text-foreground transition-colors duration-200 hover:border-action hover:bg-surface-soft active:border-action active:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>
      <section
        className="mt-[clamp(3rem,9vw,7rem)] rounded-card border border-border bg-surface p-[clamp(1.75rem,6vw,4.5rem)] shadow-card"
        aria-labelledby="welcome-heading"
      >
        <p className="mb-3 text-xs font-extrabold tracking-[0.15em] text-action uppercase">
          Your private record
        </p>
        <h1
          className="font-display text-[clamp(2.375rem,6vw,4rem)] font-semibold leading-[1.1] tracking-[-0.025em]"
          id="welcome-heading"
        >
          Welcome to Habit Shaper.
        </h1>
        <p className="mt-6">
          You are securely signed in as{" "}
          <strong className="break-all">{session.user.email}</strong>.
        </p>
        <div className="mt-10 flex flex-col items-start gap-5 rounded-panel border border-border bg-surface-soft p-6 min-[481px]:flex-row">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-panel bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <svg
              className="size-6.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <title>Calendar check</title>
              <path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 9 2 2 4-5" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.025em]">
              Your foundation is ready
            </h2>
            <p className="mt-2 text-muted-foreground">
              Habits and daily tracking arrive in the next slice. Your
              authenticated, database-backed record is active.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
