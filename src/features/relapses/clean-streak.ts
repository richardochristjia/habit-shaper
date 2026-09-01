import { compareTrackingDays, differenceInTrackingDays } from "@/lib/date-only";

type CleanStreakInput = {
  startDate: string;
  today: string;
  relapseDays: string[];
};

export function calculateCleanStreak({
  startDate,
  today,
  relapseDays,
}: CleanStreakInput): number {
  const latestRelapse = relapseDays.reduce<string | undefined>(
    (latest, trackingDay) =>
      compareTrackingDays(trackingDay, today) <= 0 &&
      (!latest || compareTrackingDays(trackingDay, latest) > 0)
        ? trackingDay
        : latest,
    undefined,
  );

  return latestRelapse
    ? differenceInTrackingDays(today, latestRelapse)
    : differenceInTrackingDays(today, startDate) + 1;
}
