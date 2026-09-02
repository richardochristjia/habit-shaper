"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  FieldError,
  FormError,
  formInputClassName,
} from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createHabitAction,
  type HabitActionState,
} from "@/features/habits/actions";

const initialState: HabitActionState = {};

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {pending ? "Creating Habit…" : "Create Habit"}
    </Button>
  );
}

export function AddHabitDialog({
  label = "Add a Habit",
  emphasis = "primary",
}: {
  label?: string;
  emphasis?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createHabitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={emphasis === "primary" ? "default" : "secondary"}>
          <Plus aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
          <DialogHeader>
            <DialogTitle>Add a Habit</DialogTitle>
            <DialogDescription>
              Create a Build Habit for a behaviour to perform or a Break Habit
              for a behaviour to avoid. It begins today in your User Time Zone.
            </DialogDescription>
          </DialogHeader>

          <form
            action={formAction}
            className="mt-6 grid gap-5"
            noValidate
            ref={formRef}
          >
            <div className="grid gap-2">
              <label className="font-semibold" htmlFor="dialog-habit-name">
                Habit name
              </label>
              <input
                aria-describedby={
                  state.fields?.name ? "dialog-habit-name-error" : undefined
                }
                aria-invalid={Boolean(state.fields?.name)}
                autoFocus
                className={formInputClassName}
                id="dialog-habit-name"
                maxLength={120}
                name="name"
                placeholder="For example, Read before bed"
                required
              />
              <FieldError
                errors={state.fields?.name}
                id="dialog-habit-name-error"
              />
            </div>

            <fieldset
              aria-describedby={
                state.fields?.type ? "dialog-habit-type-error" : undefined
              }
              className="grid gap-3"
            >
              <legend className="font-semibold">Habit direction</legend>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-input-border bg-surface px-4 py-3 transition-colors duration-200 hover:border-build has-checked:border-build has-checked:bg-build-soft focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus-ring motion-reduce:transition-none">
                <input name="type" type="radio" value="BUILD" />
                <span>
                  <strong className="block text-build">Build Habit</strong>
                  <span className="text-sm text-muted-foreground">
                    A behaviour you want to perform.
                  </span>
                </span>
              </label>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-input-border bg-surface px-4 py-3 transition-colors duration-200 hover:border-break has-checked:border-break has-checked:bg-break-soft focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus-ring motion-reduce:transition-none">
                <input name="type" type="radio" value="BREAK" />
                <span>
                  <strong className="block text-break">Break Habit</strong>
                  <span className="text-sm text-muted-foreground">
                    A behaviour you want to avoid.
                  </span>
                </span>
              </label>
              <FieldError
                errors={state.fields?.type}
                id="dialog-habit-type-error"
              />
              <p className="text-sm text-muted-foreground">
                Direction cannot be changed after creation.
              </p>
            </fieldset>

            <FormError message={state.form} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <CreateButton />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
