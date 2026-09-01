"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createHabitAction,
  deleteHabitAction,
  type HabitActionState,
  renameHabitAction,
} from "@/features/habits/actions";
import type { HabitView } from "@/features/habits/service";

const initialState: HabitActionState = {};
const inputClassName =
  "min-h-12 w-full rounded-field border border-input-border bg-surface px-3.5 py-3 text-foreground transition-[border-color,box-shadow] duration-200 hover:border-foreground/60 focus:border-focus-ring focus:outline-none focus:ring-3 focus:ring-focus-ring/15 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none aria-invalid:border-destructive";

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return (
    <p className="m-0 text-sm font-semibold text-destructive" id={id}>
      {errors[0]}
    </p>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="m-0 border-l-4 border-destructive bg-destructive-soft px-3.5 py-3 text-sm font-semibold text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
}: {
  idleLabel: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "destructive";
}) {
  const { pending } = useFormStatus();
  const variants = {
    primary:
      "border-transparent bg-action text-white shadow-action enabled:hover:bg-action-hover enabled:active:bg-action-hover",
    secondary:
      "border-border bg-surface text-foreground enabled:hover:border-action enabled:hover:bg-surface-soft enabled:active:border-action enabled:active:bg-surface-soft",
    destructive:
      "border-destructive bg-surface text-destructive enabled:hover:bg-destructive-soft enabled:active:bg-destructive-soft",
  };

  return (
    <button
      className={`min-h-12 cursor-pointer rounded-field border px-5 py-2.5 font-bold transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function CreateHabitForm() {
  const [state, formAction] = useActionState(createHabitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      action={formAction}
      className="mt-6 grid gap-5"
      noValidate
      ref={formRef}
    >
      <div className="grid gap-2">
        <label className="font-semibold" htmlFor="new-habit-name">
          Habit name
        </label>
        <input
          aria-describedby={
            state.fields?.name ? "new-habit-name-error" : "new-habit-name-help"
          }
          aria-invalid={Boolean(state.fields?.name)}
          className={inputClassName}
          id="new-habit-name"
          maxLength={120}
          name="name"
          placeholder="For example, Read before bed"
          required
        />
        <p
          className="m-0 text-sm text-muted-foreground"
          id="new-habit-name-help"
        >
          Use a short name for the behaviour you want to shape.
        </p>
        <FieldError errors={state.fields?.name} id="new-habit-name-error" />
      </div>
      <div className="grid gap-2">
        <label className="font-semibold" htmlFor="new-habit-type">
          Habit type
        </label>
        <select
          aria-describedby={
            state.fields?.type ? "new-habit-type-error" : "new-habit-type-help"
          }
          aria-invalid={Boolean(state.fields?.type)}
          className={inputClassName}
          defaultValue=""
          id="new-habit-type"
          name="type"
          required
        >
          <option disabled value="">
            Choose a type
          </option>
          <option value="BUILD">Build Habit — a behaviour to perform</option>
          <option value="BREAK">Break Habit — a behaviour to avoid</option>
        </select>
        <p
          className="m-0 text-sm text-muted-foreground"
          id="new-habit-type-help"
        >
          Type cannot be changed after this Habit is created.
        </p>
        <FieldError errors={state.fields?.type} id="new-habit-type-error" />
      </div>
      <FormError message={state.form} />
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <SubmitButton idleLabel="Create Habit" pendingLabel="Creating Habit…" />
        {state.success && (
          <p className="m-0 text-sm font-semibold text-accent" role="status">
            Habit created.
          </p>
        )}
      </div>
    </form>
  );
}

export function HabitCard({ habit }: { habit: HabitView }) {
  const [renameState, renameAction] = useActionState(
    renameHabitAction,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteHabitAction,
    initialState,
  );
  const nameErrorId = `${habit.id}-name-error`;

  return (
    <article className="rounded-panel border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={`m-0 inline-flex rounded-full px-3 py-1 text-xs font-extrabold tracking-[0.08em] uppercase ${
              habit.type === "BUILD"
                ? "bg-accent-soft text-accent"
                : "bg-brand-soft text-brand"
            }`}
          >
            {habit.type === "BUILD" ? "Build Habit" : "Break Habit"}
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.02em]">
            {habit.name}
          </h3>
        </div>
        <p className="m-0 text-sm font-medium text-muted-foreground">
          Started {habit.startDate}
        </p>
      </div>

      <form action={renameAction} className="mt-6 grid gap-3" noValidate>
        <input name="habitId" type="hidden" value={habit.id} />
        <label className="font-semibold" htmlFor={`${habit.id}-name`}>
          Rename Habit
        </label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <input
            aria-describedby={
              renameState.fields?.name ? nameErrorId : undefined
            }
            aria-invalid={Boolean(renameState.fields?.name)}
            className={inputClassName}
            defaultValue={habit.name}
            id={`${habit.id}-name`}
            maxLength={120}
            name="name"
            required
          />
          <SubmitButton
            idleLabel="Save name"
            pendingLabel="Saving…"
            variant="secondary"
          />
        </div>
        <FieldError errors={renameState.fields?.name} id={nameErrorId} />
        <FormError message={renameState.form} />
        {renameState.success && (
          <p className="m-0 text-sm font-semibold text-accent" role="status">
            Habit renamed.
          </p>
        )}
      </form>

      <div className="mt-6 border-t border-border pt-5">
        <form
          action={deleteAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input name="habitId" type="hidden" value={habit.id} />
          <SubmitButton
            idleLabel="Delete Habit"
            pendingLabel="Deleting…"
            variant="destructive"
          />
          <p className="m-0 text-sm text-muted-foreground">
            Deletes this Habit and all linked Goals and tracking history.
          </p>
        </form>
        <div className="mt-3">
          <FormError message={deleteState.form} />
        </div>
      </div>
    </article>
  );
}
