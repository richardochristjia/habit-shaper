import { addTrackingDays, compareTrackingDays } from "@/lib/date-only";

type BuildStreakInput = {
  startDate: string;
  today: string;
  completionDays: string[];
};

export function calculateBuildStreak({
  startDate,
  today,
  completionDays,
}: BuildStreakInput): number {
  const completed = new Set(completionDays);
  let trackingDay = completed.has(today) ? today : addTrackingDays(today, -1);
  let streak = 0;

  while (
    compareTrackingDays(trackingDay, startDate) >= 0 &&
    completed.has(trackingDay)
  ) {
    streak += 1;
    trackingDay = addTrackingDays(trackingDay, -1);
  }

  return streak;
}
