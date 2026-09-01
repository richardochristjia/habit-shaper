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
      className="button button-primary"
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
    <p className="field-error" id={id}>
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
    <form action={formAction} className="auth-form" noValidate>
      <input name="timeZone" type="hidden" value={timeZone} />
      <div className="field">
        <label htmlFor={`${mode}-email`}>Email</label>
        <input
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
      <div className="field">
        <label htmlFor={`${mode}-password`}>Password</label>
        <input
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
          <p className="field-hint">Use at least 8 characters.</p>
        )}
        <ErrorList
          errors={state.fields?.password}
          id={`${mode}-password-error`}
        />
      </div>
      {state.fields?.timeZone && <ErrorList errors={state.fields.timeZone} />}
      {state.form && (
        <p className="form-error" role="alert">
          {state.form}
        </p>
      )}
      <SubmitButton mode={mode} timeZoneReady={Boolean(timeZone)} />
      {!timeZone && <p className="field-hint">Detecting your time zone…</p>}
      <noscript>
        <p className="form-error">
          JavaScript is required to detect your time zone.
        </p>
      </noscript>
    </form>
  );
}
