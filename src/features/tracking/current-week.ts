import {
  addTrackingDays,
  compareTrackingDays,
  startOfTrackingWeek,
} from "@/lib/date-only";

export type CurrentWeekState =
  | "COMPLETION"
  | "CLEAN"
  | "RELAPSE"
  | "PENDING"
  | "MISSED"
  | "FUTURE"
  | "INELIGIBLE";

export type CurrentWeekDay = {
  trackingDay: string;
  state: CurrentWeekState;
};

type CurrentWeekInput = {
  type: "BUILD" | "BREAK";
  startDate: string;
  today: string;
  recordedDays: string[];
};

export function projectCurrentWeek({
  type,
  startDate,
  today,
  recordedDays,
}: CurrentWeekInput): CurrentWeekDay[] {
  const recorded = new Set(recordedDays);
  const weekStart = startOfTrackingWeek(today);

  return Array.from({ length: 7 }, (_, index) => {
    const trackingDay = addTrackingDays(weekStart, index);
    let state: CurrentWeekState;

    if (compareTrackingDays(trackingDay, startDate) < 0) {
      state = "INELIGIBLE";
    } else if (compareTrackingDays(trackingDay, today) > 0) {
      state = "FUTURE";
    } else if (type === "BUILD") {
      state = recorded.has(trackingDay)
        ? "COMPLETION"
        : trackingDay === today
          ? "PENDING"
          : "MISSED";
    } else {
      state = recorded.has(trackingDay) ? "RELAPSE" : "CLEAN";
    }

    return { trackingDay, state };
  });
}
