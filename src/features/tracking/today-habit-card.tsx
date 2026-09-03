"use client";

import {
  CalendarDays,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleSlash2,
  Clock3,
  Flame,
  type LucideIcon,
  Minus,
  Shield,
  ShieldCheck,
  Sprout,
  Undo2,
  Waypoints,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CompletionActionState,
  setCompletionAction,
} from "@/features/completions/actions";
import { calculateBuildStreak } from "@/features/completions/build-streak";
import type { BuildHabitProgressView } from "@/features/completions/service";
import type { GoalView } from "@/features/goals/service";
import type { HabitView } from "@/features/habits/service";
import {
  type RelapseActionState,
  setRelapseAction,
} from "@/features/relapses/actions";
import { calculateCleanStreak } from "@/features/relapses/clean-streak";
import type { BreakHabitProgressView } from "@/features/relapses/service";
import {
  type CurrentWeekState,
  projectCurrentWeek,
} from "@/features/tracking/current-week";
import {
  HabitOverviewSheet,
  HabitOverviewSheetTrigger,
} from "@/features/tracking/habit-overview-sheet";
import { applyRecordedTrackingDay } from "@/features/tracking/overview-tracking-days";
import { parseTrackingDay } from "@/lib/date-only";

const weekStatePresentation: Record<
  CurrentWeekState,
  { label: string; icon: LucideIcon; className: string }
> = {
  COMPLETION: {
    label: "Completion",
    icon: CircleCheck,
    className: "border-build/40 bg-build-soft text-build",
  },
  CLEAN: {
    label: "Clean Day",
    icon: ShieldCheck,
    className: "border-build/40 bg-build-soft text-build",
  },
  RELAPSE: {
    label: "Relapse",
    icon: CircleSlash2,
    className: "border-break/40 bg-break-soft text-break",
  },
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className: "border-pending/40 bg-pending-soft text-pending",
  },
  MISSED: {
    label: "Missed",
    icon: Minus,
    className: "border-border bg-surface-soft text-muted-foreground",
  },
  FUTURE: {
    label: "Future",
    icon: CircleDashed,
    className: "border-border/70 bg-surface text-muted-foreground/70",
  },
  INELIGIBLE: {
    label: "Ineligible",
    icon: Circle,
    className: "border-border/60 bg-surface text-muted-foreground/45",
  },
};

function shortWeekday(trackingDay: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "narrow",
    timeZone: "UTC",
  }).format(parseTrackingDay(trackingDay));
}

function CurrentWeekStrip({
  type,
  startDate,
  today,
  recordedDays,
}: {
  type: "BUILD" | "BREAK";
  startDate: string;
  today: string;
  recordedDays: string[];
}) {
  const week = projectCurrentWeek({ type, startDate, today, recordedDays });

  return (
    <section className="mt-4 border-t border-border pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-xs font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
          This week
        </h4>
        <span className="text-xs font-semibold text-muted-foreground">
          Mon–Sun
        </span>
      </div>
      <ol
        className="grid min-w-0 grid-cols-7 gap-1.5"
        aria-label="Monday to Sunday Tracking Days"
      >
        {week.map(({ trackingDay, state }) => {
          const presentation = weekStatePresentation[state];
          const StateIcon = presentation.icon;
          return (
            <li className="min-w-0 text-center" key={trackingDay}>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {shortWeekday(trackingDay)}
              </span>
              <span
                aria-label={`${trackingDay}: ${presentation.label}`}
                className={`mx-auto mt-1 grid size-8 place-items-center rounded-full border ${presentation.className}`}
                role="img"
                title={`${trackingDay}: ${presentation.label}`}
              >
                <StateIcon aria-hidden="true" className="size-4" />
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DailySubmitButton({
  desiredRecorded,
  type,
  externallyPending,
}: {
  desiredRecorded: boolean;
  type: "BUILD" | "BREAK";
  externallyPending: boolean;
}) {
  const { pending: formPending } = useFormStatus();
  const pending = formPending || externallyPending;
  const isUndo = !desiredRecorded;
  const label =
    type === "BUILD"
      ? isUndo
        ? "Undo"
        : "Done today"
      : isUndo
        ? "Undo"
        : "I relapsed";
  const Icon = isUndo ? Undo2 : type === "BUILD" ? CircleCheck : CircleSlash2;

  return (
    <Button
      aria-busy={pending}
      className={isUndo ? undefined : "min-w-32"}
      disabled={pending}
      name="recorded"
      size={isUndo ? "compact" : "default"}
      type="submit"
      value={String(desiredRecorded)}
      variant={isUndo ? "ghost" : type === "BUILD" ? "build" : "break"}
    >
      <Icon aria-hidden="true" />
      {pending ? "Saving…" : label}
    </Button>
  );
}

function failureMessage(
  state: CompletionActionState | RelapseActionState,
  fallback: string,
) {
  return state.form ?? state.fields?.trackingDay?.[0] ?? fallback;
}

export function TodayHabitCard({
  habit,
  progress,
  goals,
}: {
  habit: HabitView;
  progress: BuildHabitProgressView | BreakHabitProgressView;
  goals: GoalView[];
}) {
  const isBuild = "completionDays" in progress;
  const authoritativeDays = isBuild
    ? progress.completionDays
    : progress.relapseDays;
  const [optimisticDays, setOptimisticDays] = useState(authoritativeDays);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!pending) setOptimisticDays(authoritativeDays);
  }, [authoritativeDays, pending]);

  const recordedToday = optimisticDays.includes(progress.today);
  const streak = isBuild
    ? calculateBuildStreak({
        startDate: progress.startDate,
        today: progress.today,
        completionDays: optimisticDays,
      })
    : calculateCleanStreak({
        startDate: progress.startDate,
        today: progress.today,
        relapseDays: optimisticDays,
      });
  const TypeIcon = isBuild ? Sprout : Shield;
  const StatusIcon = isBuild
    ? recordedToday
      ? CircleCheck
      : Clock3
    : recordedToday
      ? CircleSlash2
      : ShieldCheck;
  const statusLabel = isBuild
    ? recordedToday
      ? "Done for today"
      : "Pending today"
    : recordedToday
      ? "Relapsed today"
      : "Clean today";

  function rollback(message: string, previousDays: string[]) {
    const rollbackMessage = `${message} Your previous saved state was restored. Please try again.`;
    setOptimisticDays(previousDays);
    setError(rollbackMessage);
    toast.error("Update not saved", { description: rollbackMessage });
    return { success: false, message: rollbackMessage };
  }

  async function updateTrackingDay(trackingDay: string, recorded: boolean) {
    if (pending) {
      return {
        success: false,
        message: "A Tracking Day update is already saving.",
      };
    }

    const previousDays = optimisticDays;
    const formData = new FormData();
    formData.set("habitId", habit.id);
    formData.set("trackingDay", trackingDay);
    formData.set("recorded", String(recorded));
    setError(undefined);
    setPending(true);
    setOptimisticDays(
      applyRecordedTrackingDay(previousDays, trackingDay, recorded),
    );

    try {
      const state = isBuild
        ? await setCompletionAction({}, formData)
        : await setRelapseAction({}, formData);
      if (state.success) {
        toast.success(
          isBuild
            ? recorded
              ? "Completion recorded"
              : "Completion removed"
            : recorded
              ? "Relapse recorded"
              : "Relapse removed",
        );
        return { success: true };
      }
      return rollback(
        failureMessage(
          state,
          isBuild
            ? "We could not update that Completion."
            : "We could not update that Relapse.",
        ),
        previousDays,
      );
    } catch {
      return rollback(
        isBuild
          ? "We could not update that Completion."
          : "We could not update that Relapse.",
        previousDays,
      );
    } finally {
      setPending(false);
    }
  }

  async function updateToday(formData: FormData) {
    await updateTrackingDay(
      progress.today,
      formData.get("recorded") === "true",
    );
  }

  const visibleGoals = goals.slice(0, 2);
  const remainingGoalCount = goals.length - visibleGoals.length;

  return (
    <HabitOverviewSheet
      goals={goals}
      habit={habit}
      onSetTrackingDay={updateTrackingDay}
      pending={pending}
      progress={progress}
      recordedDays={optimisticDays}
    >
      <div className="min-w-0">
        <article className="flex min-h-72 min-w-0 flex-col rounded-panel border border-border bg-surface p-4 sm:p-5">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold tracking-[0.06em] uppercase ${isBuild ? "bg-build-soft text-build" : "bg-break-soft text-break"}`}
            >
              <TypeIcon aria-hidden="true" className="size-4" />
              {isBuild ? "Build" : "Break"}
            </p>
            <Tooltip>
              <HabitOverviewSheetTrigger tab="overview">
                <TooltipTrigger asChild>
                  <Button
                    aria-label={`Open details for ${habit.name}`}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <CalendarDays aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
              </HabitOverviewSheetTrigger>
              <TooltipContent>Details</TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h3 className="break-words font-display text-xl font-semibold leading-tight tracking-[-0.015em] sm:text-2xl">
                {habit.name}
              </h3>
              <p
                aria-live="polite"
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                  isBuild && !recordedToday
                    ? "border-pending/40 bg-pending-soft text-pending"
                    : recordedToday && !isBuild
                      ? "border-break/40 bg-break-soft text-break"
                      : "border-build/40 bg-build-soft text-build"
                }`}
              >
                <StatusIcon aria-hidden="true" className="size-4" />
                {statusLabel}
              </p>
            </div>

            <form
              action={updateToday}
              className="flex w-32 shrink-0 justify-end"
            >
              <input name="habitId" type="hidden" value={habit.id} />
              <input name="trackingDay" type="hidden" value={progress.today} />
              <DailySubmitButton
                desiredRecorded={!recordedToday}
                externallyPending={pending}
                type={isBuild ? "BUILD" : "BREAK"}
              />
            </form>
          </div>

          {visibleGoals.length > 0 && (
            <HabitOverviewSheetTrigger tab="goals">
              <button
                className="mt-3 flex min-h-11 w-full min-w-0 cursor-pointer items-start gap-2 rounded-field bg-surface-soft px-3 py-2.5 text-left transition-colors duration-150 hover:bg-brand-soft active:bg-brand-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
                type="button"
              >
                <Waypoints
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-muted-foreground"
                />
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <span className="shrink-0 text-xs font-extrabold tracking-[0.06em] text-muted-foreground uppercase">
                    Goals
                  </span>
                  {visibleGoals.map((goal) => (
                    <span
                      className="inline-block max-w-full shrink-0 truncate rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-foreground"
                      key={goal.id}
                    >
                      {goal.name}
                    </span>
                  ))}
                  {remainingGoalCount > 0 && (
                    <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-action">
                      +{remainingGoalCount} more
                    </span>
                  )}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-muted-foreground"
                />
              </button>
            </HabitOverviewSheetTrigger>
          )}

          <p className="mt-4 flex min-w-0 items-center gap-2 text-sm font-bold text-foreground">
            <Flame aria-hidden="true" className="size-5 shrink-0 text-streak" />
            <span>
              {isBuild ? "Build Streak" : "Clean Streak"}: {streak}{" "}
              {streak === 1 ? "day" : "days"}
            </span>
          </p>

          {error && (
            <p
              className="mt-3 border-l-4 border-destructive bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <CurrentWeekStrip
            recordedDays={optimisticDays}
            startDate={progress.startDate}
            today={progress.today}
            type={isBuild ? "BUILD" : "BREAK"}
          />
        </article>
      </div>
    </HabitOverviewSheet>
  );
}
