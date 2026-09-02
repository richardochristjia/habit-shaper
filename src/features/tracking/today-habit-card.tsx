"use client";

import {
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
} from "lucide-react";
import { type ReactNode, useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  type CompletionActionState,
  setCompletionAction,
} from "@/features/completions/actions";
import { calculateBuildStreak } from "@/features/completions/build-streak";
import type { BuildHabitProgressView } from "@/features/completions/service";
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
import { HabitOverviewSheet } from "@/features/tracking/habit-overview-sheet";
import { parseTrackingDay } from "@/lib/date-only";

const weekStatePresentation: Record<
  CurrentWeekState,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
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
    <section className="mt-auto border-t border-border pt-4">
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
                role="img"
                className={`mx-auto mt-1 grid size-8 place-items-center rounded-full border ${presentation.className}`}
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
  recorded,
  type,
}: {
  recorded: boolean;
  type: "BUILD" | "BREAK";
}) {
  const { pending } = useFormStatus();
  const isUndo = recorded;
  const label =
    type === "BUILD"
      ? isUndo
        ? "Done today"
        : "Undo"
      : isUndo
        ? "I relapsed"
        : "Undo";
  const Icon = isUndo ? (type === "BUILD" ? CircleCheck : CircleSlash2) : Undo2;

  return (
    <Button
      aria-busy={pending}
      className={isUndo ? "min-w-32" : undefined}
      disabled={pending}
      name="recorded"
      size={isUndo ? "default" : "compact"}
      type="submit"
      value={String(recorded)}
      variant={isUndo ? (type === "BUILD" ? "build" : "break") : "ghost"}
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
  children,
}: {
  habit: HabitView;
  progress: BuildHabitProgressView | BreakHabitProgressView;
  children?: ReactNode;
}) {
  const isBuild = "completionDays" in progress;
  const authoritativeRecorded = isBuild
    ? progress.completionDays.includes(progress.today)
    : progress.relapseDays.includes(progress.today);
  const [optimisticRecorded, setOptimisticRecorded] = useOptimistic(
    authoritativeRecorded,
    (_current, desired: boolean) => desired,
  );
  const [error, setError] = useState<string>();

  const recordedDays = isBuild ? progress.completionDays : progress.relapseDays;
  const optimisticRecordedDays = optimisticRecorded
    ? Array.from(new Set([...recordedDays, progress.today])).sort()
    : recordedDays.filter((day) => day !== progress.today);
  const streak = isBuild
    ? calculateBuildStreak({
        startDate: progress.startDate,
        today: progress.today,
        completionDays: optimisticRecordedDays,
      })
    : calculateCleanStreak({
        startDate: progress.startDate,
        today: progress.today,
        relapseDays: optimisticRecordedDays,
      });
  const TypeIcon = isBuild ? Sprout : Shield;
  const StatusIcon = isBuild
    ? optimisticRecorded
      ? CircleCheck
      : Clock3
    : optimisticRecorded
      ? CircleSlash2
      : ShieldCheck;
  const statusLabel = isBuild
    ? optimisticRecorded
      ? "Done for today"
      : "Pending today"
    : optimisticRecorded
      ? "Relapsed today"
      : "Clean today";
  const desiredRecorded = !optimisticRecorded;

  async function updateToday(formData: FormData) {
    const desired = formData.get("recorded") === "true";
    setError(undefined);
    setOptimisticRecorded(desired);

    try {
      const state = isBuild
        ? await setCompletionAction({}, formData)
        : await setRelapseAction({}, formData);
      if (state.success) {
        toast.success(
          isBuild
            ? desired
              ? "Completion recorded"
              : "Completion removed"
            : desired
              ? "Relapse recorded"
              : "Relapse removed",
        );
        return;
      }

      showRollback(
        failureMessage(
          state,
          isBuild
            ? "We could not update that Completion."
            : "We could not update that Relapse.",
        ),
      );
    } catch {
      showRollback(
        isBuild
          ? "We could not update that Completion."
          : "We could not update that Relapse.",
      );
    }
  }

  function showRollback(message: string) {
    const rollbackMessage = `${message} Your previous saved state was restored. Please try again.`;
    setError(rollbackMessage);
    toast.error("Update not saved", { description: rollbackMessage });
  }

  return (
    <div className="min-w-0">
      <article className="flex min-h-80 min-w-0 flex-col rounded-panel border border-border bg-surface p-4 sm:p-5">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold tracking-[0.06em] uppercase ${isBuild ? "bg-build-soft text-build" : "bg-break-soft text-break"}`}
            >
              <TypeIcon aria-hidden="true" className="size-4" />
              {isBuild ? "Build" : "Break"}
            </p>
            <h3 className="mt-2 break-words font-display text-xl font-semibold leading-tight tracking-[-0.015em] sm:text-2xl">
              {habit.name}
            </h3>
            <p
              aria-live="polite"
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                isBuild && !optimisticRecorded
                  ? "border-pending/40 bg-pending-soft text-pending"
                  : optimisticRecorded && !isBuild
                    ? "border-break/40 bg-break-soft text-break"
                    : "border-build/40 bg-build-soft text-build"
              }`}
            >
              <StatusIcon aria-hidden="true" className="size-4" />
              {statusLabel}
            </p>
          </div>

          <form action={updateToday} className="flex w-32 shrink-0 justify-end">
            <input name="habitId" type="hidden" value={habit.id} />
            <input name="trackingDay" type="hidden" value={progress.today} />
            <DailySubmitButton
              recorded={desiredRecorded}
              type={isBuild ? "BUILD" : "BREAK"}
            />
          </form>
        </div>

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

        <HabitOverviewSheet habit={habit} progress={progress} />

        <CurrentWeekStrip
          recordedDays={optimisticRecordedDays}
          startDate={progress.startDate}
          today={progress.today}
          type={isBuild ? "BUILD" : "BREAK"}
        />
      </article>

      {children && (
        <details className="mt-2 rounded-field border border-border bg-surface-soft open:bg-surface">
          <summary className="flex min-h-11 cursor-pointer items-center rounded-field px-4 py-2 text-sm font-bold text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
            Manage {habit.name}
          </summary>
          <div className="min-w-0 border-t border-border p-2 sm:p-3">
            {children}
          </div>
        </details>
      )}
    </div>
  );
}
