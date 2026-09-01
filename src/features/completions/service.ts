import "server-only";
import { HabitType } from "@prisma/client";
import { calculateBuildStreak } from "@/features/completions/build-streak";
import {
  calculateWeeklySummary,
  type WeeklySummary,
} from "@/features/completions/weekly-summary";
import {
  compareTrackingDays,
  formatTrackingDay,
  parseTrackingDay,
  startOfTrackingWeek,
  trackingDayAt,
} from "@/lib/date-only";
import { prisma } from "@/lib/prisma";

export type BuildHabitProgressView = {
  habitId: string;
  startDate: string;
  today: string;
  completionDays: string[];
  buildStreak: number;
  weeklySummary: WeeklySummary;
};

export class CompletionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompletionValidationError";
  }
}

export class BuildHabitNotFoundError extends Error {
  constructor() {
    super("Build Habit not found");
    this.name = "BuildHabitNotFoundError";
  }
}

type SetCompletionInput = {
  trackingDay: unknown;
  recorded: unknown;
};

function validatedTrackingDay(value: unknown): string {
  if (typeof value !== "string") {
    throw new CompletionValidationError("Tracking Day must use YYYY-MM-DD");
  }
  try {
    parseTrackingDay(value);
    return value;
  } catch {
    throw new CompletionValidationError(
      "Tracking Day must be a valid YYYY-MM-DD date",
    );
  }
}

function validatedRecorded(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new CompletionValidationError(
      "Completion state must be recorded or not recorded",
    );
  }
  return value;
}

export async function listBuildHabitProgress(
  userId: string,
  instant = new Date(),
): Promise<BuildHabitProgressView[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeZone: true },
  });
  if (!user) return [];

  const today = trackingDayAt(instant, user.timeZone);
  const weekStart = startOfTrackingWeek(today);
  const [habits, completionHistory] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, type: HabitType.BUILD },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        startDate: true,
        completions: {
          where: {
            trackingDay: {
              gte: parseTrackingDay(weekStart),
              lte: parseTrackingDay(today),
            },
          },
          orderBy: { trackingDay: "asc" },
          take: 7,
          select: { trackingDay: true },
        },
      },
    }),
    prisma.completion.findMany({
      where: {
        habit: { userId, type: HabitType.BUILD },
        trackingDay: { lte: parseTrackingDay(today) },
      },
      orderBy: [{ trackingDay: "asc" }, { habitId: "asc" }],
      select: { habitId: true, trackingDay: true },
    }),
  ]);

  return habits.map((habit) => {
    const startDate = formatTrackingDay(habit.startDate);
    const completionDays = completionHistory
      .filter((completion) => completion.habitId === habit.id)
      .map(({ trackingDay }) => formatTrackingDay(trackingDay));
    const weeklyCompletionDays = habit.completions.map(({ trackingDay }) =>
      formatTrackingDay(trackingDay),
    );
    return {
      habitId: habit.id,
      startDate,
      today,
      completionDays,
      buildStreak: calculateBuildStreak({
        startDate,
        today,
        completionDays,
      }),
      weeklySummary: calculateWeeklySummary({
        startDate,
        today,
        completionDays: weeklyCompletionDays,
      }),
    };
  });
}

export async function setCompletion(
  userId: string,
  habitId: string,
  input: SetCompletionInput,
  instant = new Date(),
): Promise<void> {
  const trackingDay = validatedTrackingDay(input.trackingDay);
  const recorded = validatedRecorded(input.recorded);
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, type: HabitType.BUILD },
    select: {
      startDate: true,
      user: { select: { timeZone: true } },
    },
  });
  if (!habit) throw new BuildHabitNotFoundError();

  const startDate = formatTrackingDay(habit.startDate);
  const today = trackingDayAt(instant, habit.user.timeZone);
  if (compareTrackingDays(trackingDay, startDate) < 0) {
    throw new CompletionValidationError(
      "Tracking Day cannot be before this Habit began",
    );
  }
  if (compareTrackingDays(trackingDay, today) > 0) {
    throw new CompletionValidationError("Tracking Day cannot be in the future");
  }

  const trackingDate = parseTrackingDay(trackingDay);
  if (recorded) {
    await prisma.completion.upsert({
      where: { habitId_trackingDay: { habitId, trackingDay: trackingDate } },
      create: { habitId, trackingDay: trackingDate },
      update: {},
    });
    return;
  }

  await prisma.completion.deleteMany({
    where: { habitId, trackingDay: trackingDate },
  });
}
