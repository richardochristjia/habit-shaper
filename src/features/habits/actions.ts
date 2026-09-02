"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createHabit,
  deleteHabit,
  HabitNotFoundError,
  renameHabit,
} from "@/features/habits/service";
import { requireSession } from "@/lib/session";

export type HabitActionState = {
  fields?: Partial<Record<"name" | "type" | "goals", string[]>>;
  form?: string;
  success?: boolean;
};

const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter a Habit name.")
  .max(120, "Habit name must contain at most 120 characters.");

const optionalGoalNameSchema = z
  .string()
  .transform((name) => name.trim())
  .refine((name) => name.length <= 120, {
    message: "Goal name must contain at most 120 characters.",
  });

const createHabitSchema = z.object({
  name: nameSchema,
  type: z.enum(["BUILD", "BREAK"], {
    error: "Choose a Build Habit or Break Habit.",
  }),
  goals: z
    .array(optionalGoalNameSchema)
    .transform((goals) => goals.filter((name) => name.length > 0)),
});

const renameHabitSchema = z.object({
  habitId: z.string().min(1),
  name: nameSchema,
});

const deleteHabitSchema = z.object({
  habitId: z.string().min(1),
});

export async function createHabitAction(
  _previous: HabitActionState,
  formData: FormData,
): Promise<HabitActionState> {
  const session = await requireSession();
  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    goals: formData.getAll("goals"),
  });
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await createHabit(session.user.id, parsed.data);
  } catch {
    return { form: "We could not create that Habit. Please try again." };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function renameHabitAction(
  _previous: HabitActionState,
  formData: FormData,
): Promise<HabitActionState> {
  const session = await requireSession();
  const parsed = renameHabitSchema.safeParse({
    habitId: formData.get("habitId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await renameHabit(session.user.id, parsed.data.habitId, {
      name: parsed.data.name,
    });
  } catch (error) {
    return {
      form:
        error instanceof HabitNotFoundError
          ? "Habit not found."
          : "We could not rename that Habit. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function deleteHabitAction(
  _previous: HabitActionState,
  formData: FormData,
): Promise<HabitActionState> {
  const session = await requireSession();
  const parsed = deleteHabitSchema.safeParse({
    habitId: formData.get("habitId"),
  });
  if (!parsed.success) return { form: "Habit not found." };

  try {
    await deleteHabit(session.user.id, parsed.data.habitId);
  } catch (error) {
    return {
      form:
        error instanceof HabitNotFoundError
          ? "Habit not found."
          : "We could not delete that Habit. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}
