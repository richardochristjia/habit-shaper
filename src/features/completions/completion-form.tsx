"use client";

import { useActionState, useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  FieldError,
  FormError,
  formInputClassName,
} from "@/components/form-controls";
import {
  type CompletionActionState,
  setCompletionAction,
} from "@/features/completions/actions";
import { calculateBuildStreak } from "@/features/completions/build-streak";
import type { BuildHabitProgressView } from "@/features/completions/service";
import {
  calculateWeeklySummary,
  type WeeklySummary,
} from "@/features/completions/weekly-summary";
import { compareTrackingDays } from "@/lib/date-only";

const initialState: CompletionActionState = {};

type CompletionIntent = {
  trackingDay: string;
  recorded: boolean;
};

function WeeklySummaryView({
  habitId,
  summary,
}: {
  habitId: string;
  summary: WeeklySummary;
}) {
  const completionRate =
    summary.completionRate === null
      ? "—"
      : `${Math.round(summary.completionRate * 100)}%`;

  return (
    <section
      className="mt-4 rounded-panel border border-border bg-surface-soft p-4 sm:p-5"
      aria-labelledby={`${habitId}-weekly-summary-heading`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4
          className="font-display text-xl font-semibold leading-tight"
          id={`${habitId}-weekly-summary-heading`}
        >
          Current Weekly Summary
        </h4>
        <p className="m-0 text-sm font-semibold text-muted-foreground">
          Monday–Sunday
        </p>
      </div>
      <dl
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-live="polite"
      >
        <div className="rounded-field border border-border bg-surface p-3">
          <dt className="text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
            Completed
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-accent">
            {summary.completed}
          </dd>
        </div>
        <div className="rounded-field border border-border bg-surface p-3">
          <dt className="text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
            Missed
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold">
            {summary.missed}
          </dd>
        </div>
        <div className="rounded-field border border-border bg-surface p-3">
          <dt className="text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
            Pending
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-brand">
            {summary.pending}
          </dd>
        </div>
        <div className="rounded-field border border-border bg-surface p-3">
          <dt className="text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
            Completion rate
          </dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-action">
            {completionRate}
          </dd>
        </div>
      </dl>
      {summary.completionRate === null && (
        <p className="mt-3 mb-0 text-sm text-muted-foreground">
          No Tracking Days have been assessed yet.
        </p>
      )}
    </section>
  );
}

function CompletionSubmitButton({ recorded }: { recorded: boolean }) {
  const { data, pending } = useFormStatus();
  const isThisIntent = data?.get("recorded") === String(recorded);
  const label = recorded ? "Record Completion" : "Remove Completion";
  const pendingLabel = recorded ? "Recording…" : "Removing…";

  return (
    <button
      className={`min-h-12 cursor-pointer rounded-field border px-5 py-2.5 font-bold transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${
        recorded
          ? "border-transparent bg-action text-white shadow-action enabled:hover:bg-action-hover enabled:active:bg-action-hover"
          : "border-border bg-surface text-foreground enabled:hover:border-action enabled:hover:bg-surface-soft enabled:active:border-action enabled:active:bg-surface-soft"
      }`}
      disabled={pending}
      name="recorded"
      type="submit"
      value={String(recorded)}
    >
      {pending && isThisIntent ? pendingLabel : label}
    </button>
  );
}

export function CompletionSection({
  progress,
}: {
  progress: BuildHabitProgressView;
}) {
  const [selectedDay, setSelectedDay] = useState(progress.today);
  const [state, formAction] = useActionState(setCompletionAction, initialState);
  const [optimisticCompletionDays, updateOptimisticCompletion] = useOptimistic(
    progress.completionDays,
    (currentDays, intent: CompletionIntent) => {
      if (!intent.recorded) {
        return currentDays.filter((day) => day !== intent.trackingDay);
      }
      return Array.from(new Set([...currentDays, intent.trackingDay])).sort();
    },
  );
  const isRecorded = optimisticCompletionDays.includes(selectedDay);
  const buildStreak = calculateBuildStreak({
    startDate: progress.startDate,
    today: progress.today,
    completionDays: optimisticCompletionDays,
  });
  const weeklySummary = calculateWeeklySummary({
    startDate: progress.startDate,
    today: progress.today,
    completionDays: optimisticCompletionDays,
  });

  async function submitWithOptimism(formData: FormData) {
    const trackingDay = String(formData.get("trackingDay"));
    try {
      if (
        compareTrackingDays(trackingDay, progress.startDate) >= 0 &&
        compareTrackingDays(trackingDay, progress.today) <= 0
      ) {
        updateOptimisticCompletion({
          trackingDay,
          recorded: formData.get("recorded") === "true",
        });
      }
    } catch {
      // The Server Action returns the authoritative field error.
    }
    await formAction(formData);
  }

  return (
    <section
      className="mt-6 border-t border-border pt-5"
      aria-labelledby={`${progress.habitId}-completion-heading`}
    >
      <div className="grid gap-4 rounded-panel border border-border bg-accent-soft p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div>
          <h3
            className="font-display text-2xl font-semibold leading-tight"
            id={`${progress.habitId}-completion-heading`}
          >
            Completions
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Record any eligible Tracking Day or correct earlier history.
          </p>
        </div>
        <p className="m-0 sm:text-right" aria-live="polite">
          <span className="block text-sm font-bold text-muted-foreground">
            Current Build Streak
          </span>
          <strong className="font-display text-3xl leading-tight text-accent">
            {buildStreak} {buildStreak === 1 ? "day" : "days"}
          </strong>
        </p>
      </div>

      <WeeklySummaryView habitId={progress.habitId} summary={weeklySummary} />

      <form action={submitWithOptimism} className="mt-4 grid gap-3" noValidate>
        <input name="habitId" type="hidden" value={progress.habitId} />
        <label className="font-semibold" htmlFor={`${progress.habitId}-day`}>
          Tracking Day
        </label>
        <input
          aria-describedby={`${progress.habitId}-day-status${
            state.fields?.trackingDay ? ` ${progress.habitId}-day-error` : ""
          }`}
          aria-invalid={Boolean(state.fields?.trackingDay)}
          className={formInputClassName}
          id={`${progress.habitId}-day`}
          max={progress.today}
          min={progress.startDate}
          name="trackingDay"
          onChange={(event) => setSelectedDay(event.target.value)}
          required
          type="date"
          value={selectedDay}
        />
        <p
          className={`m-0 rounded-field border px-3.5 py-3 text-sm font-semibold ${
            isRecorded
              ? "border-accent bg-accent-soft text-accent"
              : "border-border bg-surface-soft text-muted-foreground"
          }`}
          id={`${progress.habitId}-day-status`}
          role="status"
        >
          {isRecorded
            ? "Completion recorded for this Tracking Day."
            : "No Completion recorded for this Tracking Day."}
        </p>
        <FieldError
          errors={state.fields?.trackingDay}
          id={`${progress.habitId}-day-error`}
        />
        <FormError message={state.form} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <CompletionSubmitButton recorded />
          <CompletionSubmitButton recorded={false} />
        </div>
        {state.success && (
          <p className="m-0 text-sm font-semibold text-accent" role="status">
            Completion updated.
          </p>
        )}
      </form>
    </section>
  );
}
