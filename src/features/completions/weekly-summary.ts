import {
  addTrackingDays,
  compareTrackingDays,
  startOfTrackingWeek,
} from "@/lib/date-only";

export type WeeklySummary = {
  completed: number;
  missed: number;
  pending: number;
  completionRate: number | null;
};

type WeeklySummaryInput = {
  startDate: string;
  today: string;
  completionDays: string[];
};

export function calculateWeeklySummary({
  startDate,
  today,
  completionDays,
}: WeeklySummaryInput): WeeklySummary {
  const completedDays = new Set(completionDays);
  const weekStart = startOfTrackingWeek(today);
  let trackingDay =
    compareTrackingDays(startDate, weekStart) > 0 ? startDate : weekStart;
  let completed = 0;
  let missed = 0;
  let pending = 0;

  while (compareTrackingDays(trackingDay, today) <= 0) {
    if (completedDays.has(trackingDay)) {
      completed += 1;
    } else if (trackingDay === today) {
      pending += 1;
    } else {
      missed += 1;
    }
    trackingDay = addTrackingDays(trackingDay, 1);
  }

  const assessed = completed + missed;
  return {
    completed,
    missed,
    pending,
    completionRate: assessed === 0 ? null : completed / assessed,
  };
}
