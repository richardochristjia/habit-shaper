import "server-only";
import { prisma } from "@/lib/prisma";

export type GoalView = {
  id: string;
  habitId: string;
  name: string;
};

export class GoalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoalValidationError";
  }
}

export class GoalNotFoundError extends Error {
  constructor() {
    super("Goal not found");
    this.name = "GoalNotFoundError";
  }
}

type GoalNameInput = {
  name: unknown;
};

function validatedName(value: unknown): string {
  if (typeof value !== "string") {
    throw new GoalValidationError("Goal name is required");
  }
  const name = value.trim();
  if (name.length < 1 || name.length > 120) {
    throw new GoalValidationError(
      "Goal name must contain between 1 and 120 characters",
    );
  }
  return name;
}

const goalViewSelect = {
  id: true,
  habitId: true,
  name: true,
} as const;

export async function listGoals(userId: string): Promise<GoalView[]> {
  return prisma.goal.findMany({
    where: { habit: { userId } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: goalViewSelect,
  });
}

export async function getGoal(
  userId: string,
  goalId: string,
): Promise<GoalView> {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, habit: { userId } },
    select: goalViewSelect,
  });
  if (!goal) throw new GoalNotFoundError();
  return goal;
}

export async function createGoal(
  userId: string,
  habitId: string,
  input: GoalNameInput,
): Promise<GoalView> {
  const name = validatedName(input.name);
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });
  if (!habit) throw new GoalNotFoundError();

  return prisma.goal.create({
    data: { habitId: habit.id, name },
    select: goalViewSelect,
  });
}

export async function renameGoal(
  userId: string,
  goalId: string,
  input: GoalNameInput,
): Promise<GoalView> {
  const name = validatedName(input.name);
  const result = await prisma.goal.updateMany({
    where: { id: goalId, habit: { userId } },
    data: { name },
  });
  if (result.count === 0) throw new GoalNotFoundError();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, habit: { userId } },
    select: goalViewSelect,
  });
  if (!goal) throw new GoalNotFoundError();
  return goal;
}

export async function moveGoal(
  userId: string,
  goalId: string,
  destinationHabitId: string,
): Promise<GoalView> {
  return prisma.$transaction(async (transaction) => {
    const goal = await transaction.goal.findFirst({
      where: { id: goalId, habit: { userId } },
      select: { id: true },
    });
    const destinationHabit = await transaction.habit.findFirst({
      where: { id: destinationHabitId, userId },
      select: { id: true },
    });
    if (!goal || !destinationHabit) throw new GoalNotFoundError();

    return transaction.goal.update({
      where: { id: goal.id },
      data: { habitId: destinationHabit.id },
      select: goalViewSelect,
    });
  });
}

export async function deleteGoal(
  userId: string,
  goalId: string,
): Promise<void> {
  const result = await prisma.goal.deleteMany({
    where: { id: goalId, habit: { userId } },
  });
  if (result.count === 0) throw new GoalNotFoundError();
}
