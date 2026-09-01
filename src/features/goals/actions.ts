"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createGoal,
  deleteGoal,
  GoalNotFoundError,
  moveGoal,
  renameGoal,
} from "@/features/goals/service";
import { requireSession } from "@/lib/session";

export type GoalActionState = {
  fields?: Partial<Record<"name" | "destinationHabitId", string[]>>;
  form?: string;
  success?: boolean;
};

const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter a Goal name.")
  .max(120, "Goal name must contain at most 120 characters.");

const createGoalSchema = z.object({
  habitId: z.string().min(1),
  name: nameSchema,
});

const renameGoalSchema = z.object({
  goalId: z.string().min(1),
  name: nameSchema,
});

const moveGoalSchema = z.object({
  goalId: z.string().min(1),
  destinationHabitId: z.string().min(1, "Choose a destination Habit."),
});

const deleteGoalSchema = z.object({
  goalId: z.string().min(1),
});

export async function createGoalAction(
  _previous: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const session = await requireSession();
  const parsed = createGoalSchema.safeParse({
    habitId: formData.get("habitId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await createGoal(session.user.id, parsed.data.habitId, {
      name: parsed.data.name,
    });
  } catch (error) {
    return {
      form:
        error instanceof GoalNotFoundError
          ? "Habit not found."
          : "We could not create that Goal. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function renameGoalAction(
  _previous: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const session = await requireSession();
  const parsed = renameGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await renameGoal(session.user.id, parsed.data.goalId, {
      name: parsed.data.name,
    });
  } catch (error) {
    return {
      form:
        error instanceof GoalNotFoundError
          ? "Goal not found."
          : "We could not rename that Goal. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function moveGoalAction(
  _previous: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const session = await requireSession();
  const parsed = moveGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    destinationHabitId: formData.get("destinationHabitId"),
  });
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await moveGoal(
      session.user.id,
      parsed.data.goalId,
      parsed.data.destinationHabitId,
    );
  } catch (error) {
    return {
      form:
        error instanceof GoalNotFoundError
          ? "Goal or destination Habit not found."
          : "We could not move that Goal. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function deleteGoalAction(
  _previous: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const session = await requireSession();
  const parsed = deleteGoalSchema.safeParse({
    goalId: formData.get("goalId"),
  });
  if (!parsed.success) return { form: "Goal not found." };

  try {
    await deleteGoal(session.user.id, parsed.data.goalId);
  } catch (error) {
    return {
      form:
        error instanceof GoalNotFoundError
          ? "Goal not found."
          : "We could not delete that Goal. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}
