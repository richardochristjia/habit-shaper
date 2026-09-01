import "server-only";
import { HabitType } from "@prisma/client";
import { calculateCleanStreak } from "@/features/relapses/clean-streak";
import {
  compareTrackingDays,
  formatTrackingDay,
  parseTrackingDay,
  trackingDayAt,
} from "@/lib/date-only";
import { prisma } from "@/lib/prisma";

export type BreakHabitProgressView = {
  habitId: string;
  startDate: string;
  today: string;
  relapseDays: string[];
  cleanStreak: number;
};

export class RelapseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RelapseValidationError";
  }
}

export class BreakHabitNotFoundError extends Error {
  constructor() {
    super("Break Habit not found");
    this.name = "BreakHabitNotFoundError";
  }
}

type SetRelapseInput = {
  trackingDay: unknown;
  recorded: unknown;
};

function validatedTrackingDay(value: unknown): string {
  if (typeof value !== "string") {
    throw new RelapseValidationError("Tracking Day must use YYYY-MM-DD");
  }
  try {
    parseTrackingDay(value);
    return value;
  } catch {
    throw new RelapseValidationError(
      "Tracking Day must be a valid YYYY-MM-DD date",
    );
  }
}

function validatedRecorded(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new RelapseValidationError(
      "Relapse state must be recorded or not recorded",
    );
  }
  return value;
}

export async function listBreakHabitProgress(
  userId: string,
  instant = new Date(),
): Promise<BreakHabitProgressView[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeZone: true },
  });
  if (!user) return [];

  const today = trackingDayAt(instant, user.timeZone);
  const habits = await prisma.habit.findMany({
    where: { userId, type: HabitType.BREAK },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      startDate: true,
      relapses: {
        where: { trackingDay: { lte: parseTrackingDay(today) } },
        orderBy: { trackingDay: "asc" },
        select: { trackingDay: true },
      },
    },
  });

  return habits.map((habit) => {
    const startDate = formatTrackingDay(habit.startDate);
    const relapseDays = habit.relapses.map(({ trackingDay }) =>
      formatTrackingDay(trackingDay),
    );
    return {
      habitId: habit.id,
      startDate,
      today,
      relapseDays,
      cleanStreak: calculateCleanStreak({
        startDate,
        today,
        relapseDays,
      }),
    };
  });
}

export async function setRelapse(
  userId: string,
  habitId: string,
  input: SetRelapseInput,
  instant = new Date(),
): Promise<void> {
  const trackingDay = validatedTrackingDay(input.trackingDay);
  const recorded = validatedRecorded(input.recorded);
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, type: HabitType.BREAK },
    select: {
      startDate: true,
      user: { select: { timeZone: true } },
    },
  });
  if (!habit) throw new BreakHabitNotFoundError();

  const startDate = formatTrackingDay(habit.startDate);
  const today = trackingDayAt(instant, habit.user.timeZone);
  if (compareTrackingDays(trackingDay, startDate) < 0) {
    throw new RelapseValidationError(
      "Tracking Day cannot be before this Habit began",
    );
  }
  if (compareTrackingDays(trackingDay, today) > 0) {
    throw new RelapseValidationError("Tracking Day cannot be in the future");
  }

  const trackingDate = parseTrackingDay(trackingDay);
  if (recorded) {
    await prisma.relapse.upsert({
      where: { habitId_trackingDay: { habitId, trackingDay: trackingDate } },
      create: { habitId, trackingDay: trackingDate },
      update: {},
    });
    return;
  }

  await prisma.relapse.deleteMany({
    where: { habitId, trackingDay: trackingDate },
  });
}
