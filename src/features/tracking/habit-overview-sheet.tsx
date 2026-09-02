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
import type { BuildHabitProgressView } from "@/features/completions/service";
import type { HabitView } from "@/features/habits/service";
import type { BreakHabitProgressView } from "@/features/relapses/service";
import {
  type OverviewTrackingDayState,
  projectEligibleTrackingDays,
} from "@/features/tracking/overview-tracking-days";
import { parseTrackingDay } from "@/lib/date-only";

type HabitProgress = BuildHabitProgressView | BreakHabitProgressView;

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

function WeeklySummary({ progress }: { progress: BuildHabitProgressView }) {
  const summary = progress.weeklySummary;
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
      aria-labelledby={`${progress.habitId}-weekly-summary-heading`}
    >
      <h3
        className="font-display text-xl font-semibold"
        id={`${progress.habitId}-weekly-summary-heading`}
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
}: {
  habit: HabitView;
  progress: HabitProgress;
  selectedDay: string;
  onSelect: (trackingDay: string) => void;
}) {
  const isBuild = "completionDays" in progress;
  const recordedDays = isBuild ? progress.completionDays : progress.relapseDays;
  const trackingDays = projectEligibleTrackingDays({
    type: habit.type,
    startDate: progress.startDate,
    today: progress.today,
    recordedDays,
  });
  const selected = trackingDays.find(
    ({ trackingDay }) => trackingDay === selectedDay,
  );

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
          const presentation = statePresentation[state];
          const StateIcon = presentation.icon;
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
                  className={`mt-2 inline-flex w-fit max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-bold ${presentation.className}`}
                >
                  <StateIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate">{presentation.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {selected && (
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
            className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${statePresentation[selected.state].className}`}
            role="status"
          >
            {statePresentation[selected.state].label}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This Tracking Day is read-only. Use Manage below this Habit card to
            correct its record.
          </p>
        </section>
      )}
    </section>
  );
}

function UnavailableTab({ name }: { name: "Goals" | "Settings" }) {
  return (
    <section className="min-w-0 max-w-full rounded-panel border border-border bg-surface-soft p-5">
      <h3 className="font-display text-xl font-semibold">{name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {name} management remains available in Manage below this Habit card.
      </p>
    </section>
  );
}

export function HabitOverviewSheet({
  habit,
  progress,
}: {
  habit: HabitView;
  progress: HabitProgress;
}) {
  const isBuild = "completionDays" in progress;
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(progress.today);
  const streak = isBuild ? progress.buildStreak : progress.cleanStreak;
  const DirectionIcon = isBuild ? Sprout : Shield;

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen) setSelectedDay(progress.today);
    setOpen(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button className="mt-4" type="button" variant="ghost">
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
              {isBuild && <WeeklySummary progress={progress} />}
              <TrackingDays
                habit={habit}
                onSelect={setSelectedDay}
                progress={progress}
                selectedDay={selectedDay}
              />
            </div>
          </TabsContent>
          <TabsContent className="py-5" value="goals">
            <UnavailableTab name="Goals" />
          </TabsContent>
          <TabsContent className="py-5" value="settings">
            <UnavailableTab name="Settings" />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
