"use client";

import { useActionState } from "react";
import {
  FieldError,
  FormError,
  FormSubmitButton,
  formInputClassName,
} from "@/components/form-controls";
import {
  deleteHabitAction,
  type HabitActionState,
  renameHabitAction,
} from "@/features/habits/actions";
import type { HabitView } from "@/features/habits/service";

const initialState: HabitActionState = {};

export function HabitSettings({ habit }: { habit: HabitView }) {
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
    <section
      aria-labelledby={`${habit.id}-settings-heading`}
      className="min-w-0"
    >
      <h3
        className="font-display text-xl font-semibold"
        id={`${habit.id}-settings-heading`}
      >
        Habit settings
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        The Habit direction and creation date cannot be changed.
      </p>

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
            className={formInputClassName}
            defaultValue={habit.name}
            id={`${habit.id}-name`}
            maxLength={120}
            name="name"
            required
          />
          <FormSubmitButton
            idleLabel="Save name"
            pendingLabel="Saving…"
            variant="secondary"
          />
        </div>
        <FieldError errors={renameState.fields?.name} id={nameErrorId} />
        <FormError message={renameState.form} />
        {renameState.success && (
          <p className="text-sm font-semibold text-accent" role="status">
            Habit renamed.
          </p>
        )}
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <h4 className="font-display text-lg font-semibold">Delete Habit</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          This permanently deletes {habit.name} and its linked Goals and
          tracking history.
        </p>
        <form action={deleteAction} className="mt-4 grid gap-3" noValidate>
          <input name="habitId" type="hidden" value={habit.id} />
          <FormSubmitButton
            idleLabel="Delete Habit"
            pendingLabel="Deleting…"
            variant="destructive"
          />
          <FormError message={deleteState.form} />
        </form>
      </div>
    </section>
  );
}
