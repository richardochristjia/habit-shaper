"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  FieldError,
  FormError,
  FormSubmitButton,
  formInputClassName,
} from "@/components/form-controls";
import {
  createGoalAction,
  deleteGoalAction,
  type GoalActionState,
  renameGoalAction,
} from "@/features/goals/actions";
import type { GoalView } from "@/features/goals/service";
import type { HabitView } from "@/features/habits/service";

const initialState: GoalActionState = {};

function CreateGoalForm({ habitId }: { habitId: string }) {
  const [state, formAction] = useActionState(createGoalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const inputId = `${habitId}-new-goal-name`;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      action={formAction}
      className="mt-4 grid gap-3"
      noValidate
      ref={formRef}
    >
      <input name="habitId" type="hidden" value={habitId} />
      <label className="font-semibold" htmlFor={inputId}>
        Add a Goal
      </label>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <input
          aria-describedby={state.fields?.name ? errorId : undefined}
          aria-invalid={Boolean(state.fields?.name)}
          className={formInputClassName}
          id={inputId}
          maxLength={120}
          name="name"
          placeholder="For example, Finish one chapter"
          required
        />
        <FormSubmitButton
          idleLabel="Add Goal"
          pendingLabel="Adding Goal…"
          variant="primary"
        />
      </div>
      <FieldError errors={state.fields?.name} id={errorId} />
      <FormError message={state.form} />
      {state.success && (
        <p className="m-0 text-sm font-semibold text-accent" role="status">
          Goal added.
        </p>
      )}
    </form>
  );
}

function GoalItem({ goal }: { goal: GoalView }) {
  const [renameState, renameAction] = useActionState(
    renameGoalAction,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteGoalAction,
    initialState,
  );
  const nameId = `${goal.id}-goal-name`;
  const nameErrorId = `${nameId}-error`;

  return (
    <li className="rounded-field border border-border bg-surface p-4">
      <h4 className="font-display text-xl font-semibold leading-tight">
        {goal.name}
      </h4>
      <details className="mt-2">
        <summary className="min-h-11 cursor-pointer rounded-sm py-2 font-bold text-action transition-colors duration-200 hover:text-action-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
          Edit Goal
        </summary>
        <div className="mt-3 grid gap-5 border-t border-border pt-4">
          <form action={renameAction} className="grid gap-3" noValidate>
            <input name="goalId" type="hidden" value={goal.id} />
            <label className="font-semibold" htmlFor={nameId}>
              Rename Goal
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <input
                aria-describedby={
                  renameState.fields?.name ? nameErrorId : undefined
                }
                aria-invalid={Boolean(renameState.fields?.name)}
                className={formInputClassName}
                defaultValue={goal.name}
                id={nameId}
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
              <p
                className="m-0 text-sm font-semibold text-accent"
                role="status"
              >
                Goal renamed.
              </p>
            )}
          </form>

          <form
            action={deleteAction}
            className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center"
          >
            <input name="goalId" type="hidden" value={goal.id} />
            <FormSubmitButton
              idleLabel="Delete Goal"
              pendingLabel="Deleting…"
              variant="destructive"
            />
            <p className="m-0 text-sm text-muted-foreground">
              Removes this Goal only. Its Habit and tracking history stay in
              place.
            </p>
            <div className="sm:col-span-2">
              <FormError message={deleteState.form} />
            </div>
          </form>
        </div>
      </details>
    </li>
  );
}

export function GoalSection({
  habit,
  goals,
}: {
  habit: HabitView;
  goals: GoalView[];
}) {
  return (
    <section
      className="mt-6 border-t border-border pt-5"
      aria-labelledby={`${habit.id}-goals-heading`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          className="font-display text-2xl font-semibold leading-tight"
          id={`${habit.id}-goals-heading`}
        >
          Goals
        </h3>
        <p className="m-0 text-sm font-semibold text-muted-foreground">
          {goals.length} {goals.length === 1 ? "Goal" : "Goals"}
        </p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Name the intentions that help shape this Habit.
      </p>

      {goals.length === 0 ? (
        <p className="mt-4 rounded-field border border-border bg-surface-soft px-4 py-3 text-sm text-muted-foreground">
          No Goals attached yet. Add one when you want to describe an intention
          for this Habit.
        </p>
      ) : (
        <ul className="mt-4 grid list-none gap-3 p-0">
          {goals.map((goal) => (
            <GoalItem goal={goal} key={goal.id} />
          ))}
        </ul>
      )}

      <CreateGoalForm habitId={habit.id} />
    </section>
  );
}
