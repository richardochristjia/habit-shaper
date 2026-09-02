"use client";

import {
  CalendarDays,
  CircleCheck,
  CircleSlash2,
  Clock3,
  Flame,
  type LucideIcon,
  Minus,
  Shield,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateBuildStreak } from "@/features/completions/build-streak";
import type { BuildHabitProgressView } from "@/features/completions/service";
import {
  calculateWeeklySummary,
  type WeeklySummary as WeeklySummaryData,
} from "@/features/completions/weekly-summary";
import { GoalSection } from "@/features/goals/goal-forms";
import type { GoalView } from "@/features/goals/service";
import { HabitSettings } from "@/features/habits/habit-forms";
import type { HabitView } from "@/features/habits/service";
import { calculateCleanStreak } from "@/features/relapses/clean-streak";
import type { BreakHabitProgressView } from "@/features/relapses/service";
import {
  type OverviewTrackingDayState,
  projectEligibleTrackingDays,
} from "@/features/tracking/overview-tracking-days";
import { parseTrackingDay } from "@/lib/date-only";

type HabitProgress = BuildHabitProgressView | BreakHabitProgressView;

type TrackingMutationResult = {
  success: boolean;
  message?: string;
};

const statePresentation: Record<
  OverviewTrackingDayState,
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
};

function formatTrackingDay(
  trackingDay: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(parseTrackingDay(trackingDay));
}

function WeeklySummary({ summary }: { summary: WeeklySummaryData }) {
  const rate =
    summary.completionRate === null
      ? "Not available"
      : `${Math.round(summary.completionRate * 100)}%`;
  const values = [
    ["Completed", summary.completed],
    ["Missed", summary.missed],
    ["Pending", summary.pending],
    ["Rate", rate],
  ];

  return (
    <section
      className="min-w-0 max-w-full"
      aria-labelledby="overview-weekly-summary-heading"
    >
      <h3
        className="font-display text-xl font-semibold"
        id="overview-weekly-summary-heading"
      >
        Current Weekly Summary
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This Monday–Sunday week has {summary.completed} completed,{" "}
        {summary.missed} missed, and {summary.pending} pending eligible Tracking
        Days.
      </p>
      <dl className="mt-4 grid min-w-0 max-w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {values.map(([label, value]) => (
          <div
            className="min-w-0 rounded-field border border-border bg-brand-soft p-3"
            key={label}
          >
            <dt className="text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-1 break-words font-display text-2xl font-semibold">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {summary.completionRate === null && (
        <p className="mt-3 text-sm text-muted-foreground">
          No Tracking Days have been assessed yet, so no completion rate is
          shown.
        </p>
      )}
    </section>
  );
}

function TrackingDays({
  habit,
  progress,
  selectedDay,
  onSelect,
  onSetTrackingDay,
  pending,
  recordedDays,
}: {
  habit: HabitView;
  progress: HabitProgress;
  selectedDay: string;
  onSelect: (trackingDay: string) => void;
  onSetTrackingDay: (
    trackingDay: string,
    recorded: boolean,
  ) => Promise<TrackingMutationResult>;
  pending: boolean;
  recordedDays: string[];
}) {
  const isBuild = "completionDays" in progress;
  const trackingDays = projectEligibleTrackingDays({
    type: habit.type,
    startDate: progress.startDate,
    today: progress.today,
    recordedDays,
  });
  const selected = trackingDays.find(
    ({ trackingDay }) => trackingDay === selectedDay,
  );

  if (!selected) return null;

  const presentation = statePresentation[selected.state];
  const StateIcon = presentation.icon;
  const selectedTrackingDay = selected.trackingDay;
  const selectedIsRecorded =
    selected.state === "COMPLETION" || selected.state === "RELAPSE";

  async function correctSelectedDay(formData: FormData) {
    await onSetTrackingDay(
      selectedTrackingDay,
      formData.get("recorded") === "true",
    );
  }

  return (
    <section
      className="min-w-0 max-w-full overflow-x-hidden"
      aria-labelledby={`${habit.id}-tracking-days-heading`}
    >
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <h3
            className="font-display text-xl font-semibold"
            id={`${habit.id}-tracking-days-heading`}
          >
            Tracking Days
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Every eligible day since this Habit began.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {trackingDays.length} eligible{" "}
          {trackingDays.length === 1 ? "day" : "days"}
        </p>
      </div>

      <ol className="mt-4 grid min-w-0 max-w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {trackingDays.map(({ trackingDay, state }) => {
          const dayPresentation = statePresentation[state];
          const DayIcon = dayPresentation.icon;
          const selectedCard = trackingDay === selectedDay;
          return (
            <li className="min-w-0" key={trackingDay}>
              <button
                aria-pressed={selectedCard}
                className={`grid min-h-28 w-full min-w-0 cursor-pointer content-start rounded-field border p-3 text-left transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none ${selectedCard ? "border-action bg-brand-soft" : "border-border bg-surface hover:bg-surface-soft"}`}
                onClick={() => onSelect(trackingDay)}
                type="button"
              >
                <span className="text-xs font-bold text-muted-foreground">
                  {formatTrackingDay(trackingDay, { weekday: "short" })}
                </span>
                <span className="mt-1 font-display text-2xl font-semibold leading-none">
                  {formatTrackingDay(trackingDay, { day: "numeric" })}
                </span>
                <span className="mt-1 text-xs font-semibold text-muted-foreground">
                  {formatTrackingDay(trackingDay, { month: "short" })}
                </span>
                <span
                  className={`mt-2 inline-flex w-fit max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-bold ${dayPresentation.className}`}
                >
                  <DayIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate">{dayPresentation.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <section
        className="mt-4 min-w-0 max-w-full rounded-panel border border-border bg-surface p-4"
        aria-labelledby={`${habit.id}-selected-day-heading`}
      >
        <h3
          className="font-display text-xl font-semibold"
          id={`${habit.id}-selected-day-heading`}
        >
          {formatTrackingDay(selected.trackingDay, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
        <p
          aria-live="polite"
          className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${presentation.className}`}
          role="status"
        >
          <StateIcon aria-hidden="true" className="size-4" />
          {presentation.label}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecting a Tracking Day is read-only. Use the explicit action below
          to correct it.
        </p>
        <form action={correctSelectedDay} className="mt-4 grid gap-3">
          <input name="trackingDay" type="hidden" value={selectedTrackingDay} />
          <Button
            aria-busy={pending}
            disabled={pending}
            name="recorded"
            type="submit"
            value={String(!selectedIsRecorded)}
            variant={
              selectedIsRecorded ? "destructive" : isBuild ? "build" : "break"
            }
          >
            {pending
              ? "Saving…"
              : selectedIsRecorded
                ? `Remove ${isBuild ? "Completion" : "Relapse"}`
                : `Add ${isBuild ? "Completion" : "Relapse"}`}
          </Button>
        </form>
      </section>
    </section>
  );
}

export function HabitOverviewSheet({
  habit,
  progress,
  goals,
  recordedDays,
  pending,
  onSetTrackingDay,
}: {
  habit: HabitView;
  progress: HabitProgress;
  goals: GoalView[];
  recordedDays: string[];
  pending: boolean;
  onSetTrackingDay: (
    trackingDay: string,
    recorded: boolean,
  ) => Promise<TrackingMutationResult>;
}) {
  const isBuild = "completionDays" in progress;
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(progress.today);
  const [error, setError] = useState<string>();
  const streak = isBuild
    ? calculateBuildStreak({
        startDate: progress.startDate,
        today: progress.today,
        completionDays: recordedDays,
      })
    : calculateCleanStreak({
        startDate: progress.startDate,
        today: progress.today,
        relapseDays: recordedDays,
      });
  const summary = isBuild
    ? calculateWeeklySummary({
        startDate: progress.startDate,
        today: progress.today,
        completionDays: recordedDays,
      })
    : undefined;
  const DirectionIcon = isBuild ? Sprout : Shield;

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelectedDay(progress.today);
      setError(undefined);
    }
    setOpen(nextOpen);
  }

  async function setSelectedTrackingDay(
    trackingDay: string,
    recorded: boolean,
  ): Promise<TrackingMutationResult> {
    setError(undefined);
    const result = await onSetTrackingDay(trackingDay, recorded);
    if (!result.success) {
      setError(result.message ?? "The update was not saved. Please try again.");
    }
    return result;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          aria-label={`Open details for ${habit.name}`}
          className="mt-4"
          type="button"
          variant="ghost"
        >
          <CalendarDays aria-hidden="true" />
          Details
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={`${habit.id}-overview-description`}>
        <SheetHeader>
          <p
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold tracking-[0.06em] uppercase ${isBuild ? "bg-build-soft text-build" : "bg-break-soft text-break"}`}
          >
            <DirectionIcon aria-hidden="true" className="size-4" />
            {isBuild ? "Build Habit" : "Break Habit"}
          </p>
          <SheetTitle className="mt-3">{habit.name}</SheetTitle>
          <SheetDescription id={`${habit.id}-overview-description`}>
            Created{" "}
            {formatTrackingDay(habit.startDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </SheetDescription>
        </SheetHeader>

        <Tabs
          className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden p-5 sm:p-6"
          defaultValue="overview"
        >
          <TabsList aria-label="Habit details sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent
            className="min-h-0 flex-1 overflow-y-auto py-5"
            value="overview"
          >
            <div className="grid min-w-0 max-w-full gap-6 pb-6">
              <section
                className="min-w-0 rounded-panel border border-border bg-surface-soft p-4"
                aria-label="Current streak"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Flame aria-hidden="true" className="size-5 text-streak" />
                  Current {isBuild ? "Build" : "Clean"} Streak
                </p>
                <p className="mt-1 font-display text-3xl font-semibold">
                  {streak} {streak === 1 ? "day" : "days"}
                </p>
              </section>
              {summary && <WeeklySummary summary={summary} />}
              <TrackingDays
                habit={habit}
                onSelect={setSelectedDay}
                onSetTrackingDay={setSelectedTrackingDay}
                pending={pending}
                progress={progress}
                recordedDays={recordedDays}
                selectedDay={selectedDay}
              />
              {error && (
                <p
                  className="border-l-4 border-destructive bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent className="min-w-0 overflow-y-auto py-5" value="goals">
            <GoalSection goals={goals} habit={habit} />
          </TabsContent>
          <TabsContent
            className="min-w-0 overflow-y-auto py-5"
            value="settings"
          >
            <HabitSettings habit={habit} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
