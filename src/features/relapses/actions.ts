"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  BreakHabitNotFoundError,
  RelapseValidationError,
  setRelapse,
} from "@/features/relapses/service";
import { parseTrackingDay } from "@/lib/date-only";
import { requireSession } from "@/lib/session";

export type RelapseActionState = {
  fields?: Partial<Record<"trackingDay", string[]>>;
  form?: string;
  success?: boolean;
};

const trackingDaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a Tracking Day as YYYY-MM-DD.")
  .refine((value) => {
    try {
      parseTrackingDay(value);
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid Tracking Day.");

const setRelapseSchema = z.object({
  habitId: z.string().min(1),
  trackingDay: trackingDaySchema,
  recorded: z.enum(["true", "false"]),
});

export async function setRelapseAction(
  _previous: RelapseActionState,
  formData: FormData,
): Promise<RelapseActionState> {
  const session = await requireSession();
  const parsed = setRelapseSchema.safeParse({
    habitId: formData.get("habitId"),
    trackingDay: formData.get("trackingDay"),
    recorded: formData.get("recorded"),
  });
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await setRelapse(session.user.id, parsed.data.habitId, {
      trackingDay: parsed.data.trackingDay,
      recorded: parsed.data.recorded === "true",
    });
  } catch (error) {
    if (error instanceof RelapseValidationError) {
      return { fields: { trackingDay: [error.message] } };
    }
    return {
      form:
        error instanceof BreakHabitNotFoundError
          ? "Break Habit not found."
          : "We could not update that Relapse. Please try again.",
    };
  }

  revalidatePath("/app");
  return { success: true };
}
