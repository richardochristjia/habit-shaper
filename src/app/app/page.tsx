import { signOutAction } from "@/features/auth/actions";
import { listBuildHabitProgress } from "@/features/completions/service";
import { listGoals } from "@/features/goals/service";
import { CreateHabitForm, HabitCard } from "@/features/habits/habit-forms";
import { listHabits } from "@/features/habits/service";
import { requireSession } from "@/lib/session";

export default async function ApplicationPage() {
  const session = await requireSession();
  const [habits, goals, buildProgress] = await Promise.all([
    listHabits(session.user.id),
    listGoals(session.user.id),
    listBuildHabitProgress(session.user.id),
  ]);

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
        className="pt-[clamp(3rem,8vw,6rem)]"
        aria-labelledby="page-heading"
      >
        <p className="mb-3 text-xs font-extrabold tracking-[0.15em] text-action uppercase">
          Your private record
        </p>
        <h1
          className="max-w-copy font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]"
          id="page-heading"
        >
          Shape one day at a time.
        </h1>
        <p className="mt-5 max-w-copy text-lg text-muted-foreground">
          Create Build Habits for behaviours you want to perform and Break
          Habits for behaviours you want to avoid. Only you can see this
          collection.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Signed in as{" "}
          <strong className="break-all">{session.user.email}</strong>
        </p>
      </section>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
        <section
          className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8"
          aria-labelledby="create-habit-heading"
        >
          <div
            className="grid size-12 place-items-center rounded-panel bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <svg
              className="size-6 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
              viewBox="0 0 24 24"
              focusable="false"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h2
            className="mt-5 font-display text-3xl font-semibold leading-tight tracking-[-0.025em]"
            id="create-habit-heading"
          >
            Create a Habit
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your Habit begins today in your current User Time Zone.
          </p>
          <CreateHabitForm />
        </section>

        <section aria-labelledby="habit-list-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-extrabold tracking-[0.12em] text-action uppercase">
                Your collection
              </p>
              <h2
                className="font-display text-3xl font-semibold leading-tight tracking-[-0.025em]"
                id="habit-list-heading"
              >
                Habits
              </h2>
            </div>
            <p className="m-0 font-semibold text-muted-foreground">
              {habits.length} {habits.length === 1 ? "Habit" : "Habits"}
            </p>
          </div>

          {habits.length === 0 ? (
            <div className="mt-5 rounded-panel border border-border bg-surface-soft p-8 text-center">
              <svg
                className="mx-auto size-10 fill-none stroke-muted-foreground stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
                viewBox="0 0 24 24"
                focusable="false"
                aria-hidden="true"
              >
                <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z" />
              </svg>
              <h3 className="mt-4 font-display text-2xl font-semibold">
                No Habits yet
              </h3>
              <p className="mx-auto mt-2 max-w-note text-muted-foreground">
                Create your first Build Habit or Break Habit to begin shaping
                your private record.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5">
              {habits.map((habit) => (
                <HabitCard
                  goals={goals.filter((goal) => goal.habitId === habit.id)}
                  habit={habit}
                  habits={habits}
                  key={habit.id}
                  progress={buildProgress.find(
                    (progress) => progress.habitId === habit.id,
                  )}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
