"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateUserTimeZone } from "@/features/users/service";
import { getAuth } from "@/lib/auth";
import { isIanaTimeZone } from "@/lib/date-only";

export type AuthActionState = {
  fields?: Partial<Record<"email" | "password" | "timeZone", string[]>>;
  form?: string;
};

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password must contain at most 128 characters."),
  timeZone: z
    .string()
    .refine(isIanaTimeZone, "Browser time zone is unavailable."),
});

function credentialsFrom(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    timeZone: formData.get("timeZone"),
  });
}

export async function registerAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsFrom(formData);
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  try {
    await getAuth().api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.email,
        timeZone: parsed.data.timeZone,
      },
    });
  } catch {
    return {
      form: "Registration failed. That email may already be registered.",
    };
  }

  redirect("/app");
}

export async function signInAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsFrom(formData);
  if (!parsed.success) return { fields: parsed.error.flatten().fieldErrors };

  let userId: string;
  try {
    const result = await getAuth().api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    userId = result.user.id;
  } catch {
    return { form: "Email or password is incorrect." };
  }

  await updateUserTimeZone(userId, parsed.data.timeZone);
  redirect("/app");
}

export async function signOutAction() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/sign-in");
}
