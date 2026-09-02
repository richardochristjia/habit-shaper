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
  goals?: unknown;
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

function validatedGoalNames(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new HabitValidationError("Initial Goals must be a list");
  }

  return value.flatMap((goal) => {
    if (typeof goal !== "string") {
      throw new HabitValidationError("Goal name must be text");
    }
    const name = goal.trim();
    if (name.length === 0) return [];
    if (name.length > 120) {
      throw new HabitValidationError(
        "Goal name must contain at most 120 characters",
      );
    }
    return [name];
  });
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
  const goalNames = validatedGoalNames(input.goals);

  const habit = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: { id: userId },
      select: { timeZone: true },
    });
    if (!user) throw new HabitNotFoundError();

    const startDate = parseTrackingDay(trackingDayAt(instant, user.timeZone));
    const createdHabit = await transaction.habit.create({
      data: { userId, name, type, startDate },
      select: habitViewSelect,
    });
    if (goalNames.length > 0) {
      await transaction.goal.createMany({
        data: goalNames.map((goalName) => ({
          habitId: createdHabit.id,
          name: goalName,
        })),
      });
    }
    return createdHabit;
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
