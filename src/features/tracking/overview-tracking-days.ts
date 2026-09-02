import { addTrackingDays, compareTrackingDays } from "@/lib/date-only";

export type OverviewTrackingDayState =
  | "COMPLETION"
  | "CLEAN"
  | "RELAPSE"
  | "PENDING"
  | "MISSED";

export type OverviewTrackingDay = {
  trackingDay: string;
  state: OverviewTrackingDayState;
};

type OverviewTrackingDaysInput = {
  type: "BUILD" | "BREAK";
  startDate: string;
  today: string;
  recordedDays: string[];
};

export function projectEligibleTrackingDays({
  type,
  startDate,
  today,
  recordedDays,
}: OverviewTrackingDaysInput): OverviewTrackingDay[] {
  const recorded = new Set(recordedDays);
  const trackingDays: OverviewTrackingDay[] = [];

  for (
    let trackingDay = startDate;
    compareTrackingDays(trackingDay, today) <= 0;
    trackingDay = addTrackingDays(trackingDay, 1)
  ) {
    const state =
      type === "BUILD"
        ? recorded.has(trackingDay)
          ? "COMPLETION"
          : trackingDay === today
            ? "PENDING"
            : "MISSED"
        : recorded.has(trackingDay)
          ? "RELAPSE"
          : "CLEAN";
    trackingDays.push({ trackingDay, state });
  }

  return trackingDays;
}
