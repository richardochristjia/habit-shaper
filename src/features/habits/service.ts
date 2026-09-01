import "server-only";
import { HabitType } from "@prisma/client";
import {
  formatTrackingDay,
  parseTrackingDay,
  trackingDayAt,
} from "@/lib/date-only";
import { prisma } from "@/lib/prisma";

export type HabitView = {
  id: string;
  name: string;
  type: HabitType;
  startDate: string;
};

export class HabitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HabitValidationError";
  }
}

export class HabitNotFoundError extends Error {
  constructor() {
    super("Habit not found");
    this.name = "HabitNotFoundError";
  }
}

type CreateHabitInput = {
  name: unknown;
  type: unknown;
};

type RenameHabitInput = {
  name: unknown;
};

function validatedName(value: unknown): string {
  if (typeof value !== "string") {
    throw new HabitValidationError("Habit name is required");
  }
  const name = value.trim();
  if (name.length < 1 || name.length > 120) {
    throw new HabitValidationError(
      "Habit name must contain between 1 and 120 characters",
    );
  }
  return name;
}

function validatedType(value: unknown): HabitType {
  if (value !== HabitType.BUILD && value !== HabitType.BREAK) {
    throw new HabitValidationError("Habit type must be Build or Break");
  }
  return value;
}

function toHabitView(habit: {
  id: string;
  name: string;
  type: HabitType;
  startDate: Date;
}): HabitView {
  return {
    id: habit.id,
    name: habit.name,
    type: habit.type,
    startDate: formatTrackingDay(habit.startDate),
  };
}

const habitViewSelect = {
  id: true,
  name: true,
  type: true,
  startDate: true,
} as const;

export async function listHabits(userId: string): Promise<HabitView[]> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: habitViewSelect,
  });
  return habits.map(toHabitView);
}

export async function createHabit(
  userId: string,
  input: CreateHabitInput,
  instant = new Date(),
): Promise<HabitView> {
  const name = validatedName(input.name);
  const type = validatedType(input.type);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeZone: true },
  });
  if (!user) throw new HabitNotFoundError();

  const startDate = parseTrackingDay(trackingDayAt(instant, user.timeZone));
  const habit = await prisma.habit.create({
    data: { userId, name, type, startDate },
    select: habitViewSelect,
  });
  return toHabitView(habit);
}

export async function renameHabit(
  userId: string,
  habitId: string,
  input: RenameHabitInput,
): Promise<HabitView> {
  const name = validatedName(input.name);
  const result = await prisma.habit.updateMany({
    where: { id: habitId, userId },
    data: { name },
  });
  if (result.count === 0) throw new HabitNotFoundError();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: habitViewSelect,
  });
  if (!habit) throw new HabitNotFoundError();
  return toHabitView(habit);
}

export async function deleteHabit(
  userId: string,
  habitId: string,
): Promise<void> {
  const result = await prisma.habit.deleteMany({
    where: { id: habitId, userId },
  });
  if (result.count === 0) throw new HabitNotFoundError();
}
