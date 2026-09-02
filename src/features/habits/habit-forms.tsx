"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useCallback, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  FieldError,
  FormError,
  FormSubmitButton,
  formInputClassName,
} from "@/components/form-controls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  deleteHabitAction,
  type HabitActionState,
  renameHabitAction,
} from "@/features/habits/actions";
import type { HabitView } from "@/features/habits/service";

const initialState: HabitActionState = {};

function DeleteHabitSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <AlertDialogAction aria-busy={pending} disabled={pending} type="submit">
      <Trash2 aria-hidden="true" className="size-4" />
      {pending ? "Deleting…" : "Delete Habit"}
    </AlertDialogAction>
  );
}

export function HabitSettings({
  habit,
  onDeleted,
}: {
  habit: HabitView;
  onDeleted: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState(habit.name);
  const renameWithFeedback = useCallback(
    async (previousState: HabitActionState, formData: FormData) => {
      const result = await renameHabitAction(previousState, formData);
      if (result.success) {
        const renamedName = String(formData.get("name")).trim();
        setName(renamedName);
        toast.success("Habit renamed", {
          description: `“${renamedName}” is now shown on Today.`,
        });
      } else if (result.form) {
        toast.error("Habit not renamed", { description: result.form });
      }
      return result;
    },
    [],
  );
  const deleteWithFeedback = useCallback(
    async (previousState: HabitActionState, formData: FormData) => {
      const result = await deleteHabitAction(previousState, formData);
      if (result.success) {
        toast.success("Habit deleted", {
          description: `“${habit.name}” was removed from Today.`,
        });
        onDeleted();
      } else {
        toast.error("Habit not deleted", {
          description: result.form ?? "Please try again.",
        });
      }
      return result;
    },
    [habit.name, onDeleted],
  );
  const [renameState, renameAction] = useActionState(
    renameWithFeedback,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteWithFeedback,
    initialState,
  );
  const nameInputId = `${habit.id}-name`;
  const nameErrorId = `${nameInputId}-error`;
  const trackingRecordName = habit.type === "BUILD" ? "Completion" : "Relapse";

  return (
    <section
      aria-labelledby={`${habit.id}-settings-heading`}
      className="min-w-0"
    >
      <h3
        className="font-display text-2xl font-semibold"
        id={`${habit.id}-settings-heading`}
      >
        Habit settings
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Change this Habit’s name or permanently delete it. Its direction and
        creation date cannot be changed.
      </p>

      <section
        aria-labelledby={`${habit.id}-rename-heading`}
        className="mt-6 min-w-0 rounded-panel border border-border bg-surface p-4 sm:p-5"
      >
        <h4
          className="font-display text-xl font-semibold"
          id={`${habit.id}-rename-heading`}
        >
          Rename Habit
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the name changes. Goals and tracking progress stay in place.
        </p>
        <form action={renameAction} className="mt-4 grid gap-3" noValidate>
          <input name="habitId" type="hidden" value={habit.id} />
          <label className="font-semibold" htmlFor={nameInputId}>
            Habit name
          </label>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <input
              aria-describedby={
                renameState.fields?.name ? nameErrorId : undefined
              }
              aria-invalid={Boolean(renameState.fields?.name)}
              className={formInputClassName}
              id={nameInputId}
              maxLength={120}
              name="name"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
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
      </section>

      <section
        aria-labelledby={`${habit.id}-delete-heading`}
        className="mt-8 min-w-0 rounded-panel border border-destructive/30 bg-destructive-soft/50 p-4 sm:p-5"
      >
        <p className="text-xs font-extrabold tracking-[0.08em] text-destructive uppercase">
          Destructive action
        </p>
        <h4
          className="mt-1 font-display text-xl font-semibold"
          id={`${habit.id}-delete-heading`}
        >
          Delete Habit
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          This removes the Habit and all records attached to it. It cannot be
          undone.
        </p>

        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive">
                <Trash2 aria-hidden="true" />
                Delete Habit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                cancelRef.current?.focus();
              }}
            >
              <div>
                <AlertDialogTitle>Delete “{habit.name}”?</AlertDialogTitle>
                <AlertDialogDescription className="mt-2">
                  This permanently deletes the Habit, its attached Goals, and
                  all {trackingRecordName} history. This cannot be undone.
                </AlertDialogDescription>
              </div>
              <form action={deleteAction} className="grid gap-5">
                <input name="habitId" type="hidden" value={habit.id} />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <AlertDialogCancel ref={cancelRef} type="button">
                    Cancel
                  </AlertDialogCancel>
                  <DeleteHabitSubmitButton />
                </div>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="mt-3">
          <FormError message={deleteState.form} />
        </div>
      </section>
    </section>
  );
}
