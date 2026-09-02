import { Shield, Sprout } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { signOutAction } from "@/features/auth/actions";
import type { BuildHabitProgressView } from "@/features/completions/service";
import type { GoalView } from "@/features/goals/service";
import { AddHabitDialog } from "@/features/habits/add-habit-dialog";
import { HabitCard } from "@/features/habits/habit-forms";
import type { HabitView } from "@/features/habits/service";
import type { BreakHabitProgressView } from "@/features/relapses/service";
import { TodayHabitCard } from "@/features/tracking/today-habit-card";
import { parseTrackingDay } from "@/lib/date-only";

function fullTrackingDate(trackingDay: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseTrackingDay(trackingDay));
}

function DirectionEmptyState({ type }: { type: "BUILD" | "BREAK" }) {
  const isBuild = type === "BUILD";
  const Icon = isBuild ? Sprout : Shield;

  return (
    <div className="grid min-h-48 place-items-center rounded-panel border border-dashed border-border bg-surface-soft p-6 text-center">
      <div>
        <Icon
          aria-hidden="true"
          className={`mx-auto size-7 ${isBuild ? "text-build" : "text-break"}`}
        />
        <h3 className="mt-3 font-display text-xl font-semibold">
          No {isBuild ? "Build" : "Break"} Habits yet
        </h3>
        <p className="mx-auto mt-2 max-w-note text-sm text-muted-foreground">
          {isBuild
            ? "Add a behaviour you want to perform consistently."
            : "Add a behaviour you want to avoid; Clean Days are automatic."}
        </p>
        <div className="mt-4">
          <AddHabitDialog
            emphasis="secondary"
            label={`Add a ${isBuild ? "Build" : "Break"} Habit`}
          />
        </div>
      </div>
    </div>
  );
}

function HabitDirectionColumn({
  type,
  habits,
  goals,
  buildProgress,
  breakProgress,
}: {
  type: "BUILD" | "BREAK";
  habits: HabitView[];
  goals: GoalView[];
  buildProgress: BuildHabitProgressView[];
  breakProgress: BreakHabitProgressView[];
}) {
  const isBuild = type === "BUILD";
  const Icon = isBuild ? Sprout : Shield;
  const headingId = `${type.toLowerCase()}-today-heading`;

  return (
    <section className="min-w-0" aria-labelledby={headingId}>
      <header className="mb-4 flex min-w-0 items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-full ${isBuild ? "bg-build-soft text-build" : "bg-break-soft text-break"}`}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2
              className="font-display text-2xl font-semibold leading-tight"
              id={headingId}
            >
              {isBuild ? "Build Today" : "Break Today"}
            </h2>
            <p className="text-xs font-semibold text-muted-foreground">
              {habits.length} {habits.length === 1 ? "Habit" : "Habits"}
            </p>
          </div>
        </div>
      </header>

      {habits.length === 0 ? (
        <DirectionEmptyState type={type} />
      ) : (
        <div className="grid min-w-0 gap-4">
          {habits.map((habit) => {
            const habitBuildProgress = buildProgress.find(
              (progress) => progress.habitId === habit.id,
            );
            const habitBreakProgress = breakProgress.find(
              (progress) => progress.habitId === habit.id,
            );
            const progress = habitBuildProgress ?? habitBreakProgress;
            if (!progress) return null;
            return (
              <TodayHabitCard habit={habit} key={habit.id} progress={progress}>
                <HabitCard
                  breakProgress={habitBreakProgress}
                  buildProgress={habitBuildProgress}
                  goals={goals.filter((goal) => goal.habitId === habit.id)}
                  habit={habit}
                />
              </TodayHabitCard>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function TodayWorkspace({
  email,
  today,
  habits,
  goals,
  buildProgress,
  breakProgress,
}: {
  email: string;
  today: string;
  habits: HabitView[];
  goals: GoalView[];
  buildProgress: BuildHabitProgressView[];
  breakProgress: BreakHabitProgressView[];
}) {
  const buildHabits = habits.filter((habit) => habit.type === "BUILD");
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");

  return (
    <>
      <main className="mx-auto w-full max-w-app overflow-x-hidden px-4 pt-4 pb-16 sm:px-6 sm:pt-6">
        <header className="border-b border-border pb-5">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <a
              aria-label="Habit Shaper home"
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm font-bold text-foreground no-underline transition-colors duration-200 hover:text-action focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none"
              href="/app"
            >
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-mark-small bg-brand font-display text-xs font-bold text-white shadow-brand"
              >
                HS
              </span>
              Habit Shaper
            </a>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              <p className="max-w-48 truncate text-xs font-semibold text-muted-foreground sm:max-w-64">
                <span className="sr-only">Signed in as </span>
                {email}
              </p>
              <form action={signOutAction}>
                <button
                  className="min-h-11 cursor-pointer rounded-field px-3 py-2 text-sm font-bold text-muted-foreground transition-colors duration-200 hover:bg-surface-soft hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="text-xs font-extrabold tracking-[0.12em] text-action uppercase">
                Shape one day at a time
              </p>
              <h1 className="mt-1 font-display text-4xl font-semibold leading-none tracking-[-0.03em] sm:text-5xl">
                Today
              </h1>
              <p className="mt-2 font-semibold text-muted-foreground">
                {fullTrackingDate(today)}
              </p>
            </div>
            <AddHabitDialog />
          </div>
        </header>

        {habits.length === 0 ? (
          <section
            className="mt-8 rounded-card border border-border bg-surface p-7 text-center shadow-card sm:p-10"
            aria-labelledby="empty-today-heading"
          >
            <div className="mx-auto flex w-fit items-center gap-2">
              <span className="grid size-10 place-items-center rounded-full bg-build-soft text-build">
                <Sprout aria-hidden="true" className="size-5" />
              </span>
              <span className="grid size-10 place-items-center rounded-full bg-break-soft text-break">
                <Shield aria-hidden="true" className="size-5" />
              </span>
            </div>
            <h2
              className="mt-5 font-display text-3xl font-semibold"
              id="empty-today-heading"
            >
              Shape your first day
            </h2>
            <p className="mx-auto mt-3 max-w-note text-muted-foreground">
              Build Habits are behaviours you want to perform. Break Habits are
              behaviours you want to avoid, with Clean Days counted
              automatically.
            </p>
            <div className="mt-6">
              <AddHabitDialog label="Add your first Habit" />
            </div>
          </section>
        ) : (
          <div className="mt-8 grid min-w-0 items-start gap-8 lg:grid-cols-2">
            <HabitDirectionColumn
              breakProgress={breakProgress}
              buildProgress={buildProgress}
              goals={goals}
              habits={buildHabits}
              type="BUILD"
            />
            <HabitDirectionColumn
              breakProgress={breakProgress}
              buildProgress={buildProgress}
              goals={goals}
              habits={breakHabits}
              type="BREAK"
            />
          </div>
        )}
      </main>
      <Toaster />
    </>
  );
}
