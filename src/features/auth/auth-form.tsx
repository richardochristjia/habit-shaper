"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  type AuthActionState,
  registerAction,
  signInAction,
} from "@/features/auth/actions";

type Mode = "register" | "sign-in";
const initialAuthState: AuthActionState = {};
const inputClassName =
  "min-h-12 w-full rounded-field border border-input-border bg-surface px-3.5 py-3 text-foreground transition-[border-color,box-shadow] duration-200 hover:border-foreground/60 focus:border-focus-ring focus:outline-none focus:ring-3 focus:ring-focus-ring/15 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none aria-invalid:border-destructive";

function SubmitButton({
  mode,
  timeZoneReady,
}: {
  mode: Mode;
  timeZoneReady: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className="min-h-12 cursor-pointer rounded-field border border-transparent bg-action px-5 py-2.5 font-bold text-white shadow-action transition-colors duration-200 enabled:hover:bg-action-hover enabled:active:bg-action-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || !timeZoneReady}
      type="submit"
    >
      {pending
        ? "Please wait…"
        : mode === "register"
          ? "Create my record"
          : "Sign in"}
    </button>
  );
}

function ErrorList({ errors, id }: { errors?: string[]; id?: string }) {
  if (!errors?.length) return null;
  return (
    <p className="m-0 text-sm font-semibold text-destructive" id={id}>
      {errors[0]}
    </p>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "register" ? registerAction : signInAction;
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    action,
    initialAuthState,
  );
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <form action={formAction} className="mt-6 grid gap-5" noValidate>
      <input name="timeZone" type="hidden" value={timeZone} />
      <div className="grid gap-2">
        <label className="font-semibold" htmlFor={`${mode}-email`}>
          Email
        </label>
        <input
          className={inputClassName}
          autoComplete="email"
          id={`${mode}-email`}
          name="email"
          required
          type="email"
          aria-describedby={
            state.fields?.email ? `${mode}-email-error` : undefined
          }
          aria-invalid={Boolean(state.fields?.email)}
        />
        <ErrorList errors={state.fields?.email} id={`${mode}-email-error`} />
      </div>
      <div className="grid gap-2">
        <label className="font-semibold" htmlFor={`${mode}-password`}>
          Password
        </label>
        <input
          className={inputClassName}
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          id={`${mode}-password`}
          minLength={8}
          name="password"
          required
          type="password"
          aria-describedby={
            state.fields?.password ? `${mode}-password-error` : undefined
          }
          aria-invalid={Boolean(state.fields?.password)}
        />
        {mode === "register" && (
          <p className="m-0 text-sm text-muted-foreground">
            Use at least 8 characters.
          </p>
        )}
        <ErrorList
          errors={state.fields?.password}
          id={`${mode}-password-error`}
        />
      </div>
      {state.fields?.timeZone && <ErrorList errors={state.fields.timeZone} />}
      {state.form && (
        <p
          className="m-0 border-l-4 border-destructive bg-destructive-soft px-3.5 py-3 font-semibold text-destructive"
          role="alert"
        >
          {state.form}
        </p>
      )}
      <SubmitButton mode={mode} timeZoneReady={Boolean(timeZone)} />
      {!timeZone && (
        <p className="m-0 text-sm text-muted-foreground">
          Detecting your time zone…
        </p>
      )}
      <noscript>
        <p className="m-0 border-l-4 border-destructive bg-destructive-soft px-3.5 py-3 font-semibold text-destructive">
          JavaScript is required to detect your time zone.
        </p>
      </noscript>
    </form>
  );
}
