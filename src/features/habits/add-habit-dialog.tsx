"use client";

import { Plus, Shield, Sprout } from "lucide-react";
import {
  type FormEvent,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  FieldError,
  FormError,
  formInputClassName,
} from "@/components/form-controls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createHabitAction,
  type HabitActionState,
} from "@/features/habits/actions";

type Step = 1 | 2 | 3;
type HabitDirection = "BUILD" | "BREAK" | "";
type GoalDraft = { id: string; name: string };
type Draft = {
  name: string;
  type: HabitDirection;
  goals: GoalDraft[];
  dirty: boolean;
};

const initialActionState: HabitActionState = {};
const newDraft = (): Draft => ({
  name: "",
  type: "",
  goals: [{ id: "goal-1", name: "" }],
  dirty: false,
});

const secondaryButtonClassName =
  "min-h-11 cursor-pointer rounded-field border border-border bg-surface px-5 py-2.5 font-bold text-foreground transition-colors duration-150 hover:border-action hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none";
const quietButtonClassName =
  "min-h-11 cursor-pointer rounded-field px-4 py-2.5 font-bold text-muted-foreground transition-colors duration-150 hover:bg-surface-soft hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none";
const primaryButtonClassName =
  "min-h-12 cursor-pointer rounded-field border border-transparent bg-action px-5 py-2.5 font-bold text-white shadow-action transition-colors duration-150 hover:bg-action-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60";

function CreateHabitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={primaryButtonClassName} disabled={pending} type="submit">
      {pending ? "Creating Habit…" : "Create Habit"}
    </button>
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
  const [discardOpen, setDiscardOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [fieldErrors, setFieldErrors] = useState<HabitActionState["fields"]>();
  const [formError, setFormError] = useState<string>();
  const [actionState, formAction] = useActionState(
    createHabitAction,
    initialActionState,
  );
  const focusBeforeDiscard = useRef<HTMLElement | null>(null);
  const discarding = useRef(false);

  const reset = useCallback(() => {
    setStep(1);
    setDraft(newDraft());
    setFieldErrors(undefined);
    setFormError(undefined);
  }, []);

  useEffect(() => {
    if (actionState.success) {
      setOpen(false);
      reset();
      toast.success("Habit created");
      return;
    }

    setFieldErrors(actionState.fields);
    setFormError(actionState.form);
    if (actionState.fields?.name) setStep(1);
    else if (actionState.fields?.type) setStep(2);
    else if (actionState.fields?.goals) setStep(3);
  }, [actionState, reset]);

  const requestClose = () => {
    if (!draft.dirty) {
      setOpen(false);
      reset();
      return;
    }
    focusBeforeDiscard.current = document.activeElement as HTMLElement | null;
    discarding.current = false;
    setDiscardOpen(true);
  };

  const continueWizard = () => {
    setFormError(undefined);
    if (step === 1) {
      const name = draft.name.trim();
      if (!name) {
        setFieldErrors({ name: ["Enter a Habit name."] });
        return;
      }
      if (name.length > 120) {
        setFieldErrors({
          name: ["Habit name must contain at most 120 characters."],
        });
        return;
      }
      setFieldErrors(undefined);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!draft.type) {
        setFieldErrors({
          type: ["Choose a Build Habit or Break Habit."],
        });
        return;
      }
      setFieldErrors(undefined);
      setStep(3);
    }
  };

  const preventEarlySubmission = (event: FormEvent<HTMLFormElement>) => {
    if (step < 3) {
      event.preventDefault();
      continueWizard();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            reset();
            setOpen(true);
          } else {
            requestClose();
          }
        }}
      >
        <DialogTrigger asChild>
          <button
            className={
              emphasis === "primary"
                ? primaryButtonClassName
                : secondaryButtonClassName
            }
            type="button"
          >
            <Plus aria-hidden="true" className="mr-2 inline size-5" />
            {label}
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <form
            action={formAction}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={preventEarlySubmission}
          >
            <header className="border-b border-border px-5 py-5 pr-16 sm:px-6 sm:pr-16">
              <p className="mb-1 text-xs font-extrabold tracking-[0.12em] text-action uppercase">
                Step {step} of 3
              </p>
              <DialogTitle>
                {step === 1
                  ? "What behaviour do you want to shape?"
                  : step === 2
                    ? "Which direction fits?"
                    : "Add optional Goals"}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {step === 1
                  ? "Use a short phrase that will be easy to scan each day."
                  : step === 2
                    ? "Choose carefully. A Habit's direction cannot change later."
                    : "Goals are attached intentions, not tasks or progress trackers."}
              </DialogDescription>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <ol
                aria-label="Habit creation progress"
                className="mb-7 grid grid-cols-3 gap-2"
              >
                {["Name", "Direction", "Goals"].map((label, index) => (
                  <li
                    className={`border-t-4 pt-2 text-xs font-bold ${step >= index + 1 ? "border-action text-foreground" : "border-border text-muted-foreground"}`}
                    key={label}
                  >
                    {index + 1} · {label}
                  </li>
                ))}
              </ol>

              {step === 1 && (
                <div className="grid gap-2">
                  <label className="font-semibold" htmlFor="wizard-habit-name">
                    Habit name
                  </label>
                  <input
                    aria-describedby={
                      fieldErrors?.name
                        ? "wizard-habit-name-error"
                        : "wizard-habit-name-help"
                    }
                    aria-invalid={Boolean(fieldErrors?.name)}
                    autoFocus
                    className={formInputClassName}
                    id="wizard-habit-name"
                    maxLength={120}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        name: event.target.value,
                        dirty: true,
                      }));
                      setFieldErrors((current) => ({
                        ...current,
                        name: undefined,
                      }));
                    }}
                    placeholder="For example, Walk after dinner"
                    value={draft.name}
                  />
                  <p
                    className="m-0 text-sm text-muted-foreground"
                    id="wizard-habit-name-help"
                  >
                    Name the behaviour in 120 characters or fewer.
                  </p>
                  <FieldError
                    errors={fieldErrors?.name}
                    id="wizard-habit-name-error"
                  />
                </div>
              )}

              {step === 2 && (
                <fieldset
                  aria-describedby={
                    fieldErrors?.type ? "wizard-habit-type-error" : undefined
                  }
                >
                  <legend className="sr-only">Habit direction</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      aria-pressed={draft.type === "BUILD"}
                      className={`min-h-36 cursor-pointer rounded-panel border-2 p-5 text-left transition-colors duration-150 hover:border-build hover:bg-build-soft focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none ${draft.type === "BUILD" ? "border-build bg-build-soft" : "border-border bg-surface"}`}
                      onClick={() => {
                        setDraft((current) => ({
                          ...current,
                          type: "BUILD",
                          dirty: true,
                        }));
                        setFieldErrors((current) => ({
                          ...current,
                          type: undefined,
                        }));
                      }}
                      type="button"
                    >
                      <strong className="flex items-center gap-2 font-display text-xl text-build">
                        <Sprout aria-hidden="true" className="size-6" />
                        Build
                      </strong>
                      <span className="mt-2 block text-sm text-muted-foreground">
                        A behaviour you want to perform. Record a Completion
                        when you do it.
                      </span>
                    </button>
                    <button
                      aria-pressed={draft.type === "BREAK"}
                      className={`min-h-36 cursor-pointer rounded-panel border-2 p-5 text-left transition-colors duration-150 hover:border-break hover:bg-break-soft focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none ${draft.type === "BREAK" ? "border-break bg-break-soft" : "border-border bg-surface"}`}
                      onClick={() => {
                        setDraft((current) => ({
                          ...current,
                          type: "BREAK",
                          dirty: true,
                        }));
                        setFieldErrors((current) => ({
                          ...current,
                          type: undefined,
                        }));
                      }}
                      type="button"
                    >
                      <strong className="flex items-center gap-2 font-display text-xl text-break">
                        <Shield aria-hidden="true" className="size-6" />
                        Break
                      </strong>
                      <span className="mt-2 block text-sm text-muted-foreground">
                        A behaviour you want to avoid. Clean Days happen
                        automatically.
                      </span>
                    </button>
                  </div>
                  <div className="mt-3">
                    <FieldError
                      errors={fieldErrors?.type}
                      id="wizard-habit-type-error"
                    />
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <div>
                  <p className="mb-5 text-sm text-muted-foreground">
                    Goals are optional and can also be added later.
                  </p>
                  <div className="grid gap-4">
                    {draft.goals.map((goal, index) => (
                      <div className="grid gap-2" key={goal.id}>
                        <label
                          className="font-semibold"
                          htmlFor={`wizard-goal-${index}`}
                        >
                          {index === 0
                            ? "Goal name (optional)"
                            : `Goal ${index + 1} (optional)`}
                        </label>
                        <input
                          aria-describedby={
                            fieldErrors?.goals
                              ? "wizard-goals-error"
                              : undefined
                          }
                          aria-invalid={Boolean(fieldErrors?.goals)}
                          className={formInputClassName}
                          id={`wizard-goal-${index}`}
                          maxLength={120}
                          name="goals"
                          onChange={(event) => {
                            const value = event.target.value;
                            setDraft((current) => ({
                              ...current,
                              dirty: true,
                              goals: current.goals.map(
                                (currentGoal, goalIndex) =>
                                  goalIndex === index
                                    ? { ...currentGoal, name: value }
                                    : currentGoal,
                              ),
                            }));
                            setFieldErrors((current) => ({
                              ...current,
                              goals: undefined,
                            }));
                          }}
                          placeholder="For example, Make evenings feel calmer"
                          value={goal.name}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <FieldError
                      errors={fieldErrors?.goals}
                      id="wizard-goals-error"
                    />
                  </div>
                  <button
                    className={`${quietButtonClassName} mt-3 text-action`}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        dirty: true,
                        goals: [
                          ...current.goals,
                          {
                            id: `goal-${current.goals.length + 1}`,
                            name: "",
                          },
                        ],
                      }))
                    }
                    type="button"
                  >
                    <Plus aria-hidden="true" className="mr-2 inline size-5" />
                    Add another
                  </button>
                </div>
              )}

              <input name="name" type="hidden" value={draft.name} />
              <input name="type" type="hidden" value={draft.type} />
              <div className="mt-5">
                <FormError message={formError} />
              </div>
            </div>

            <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-border bg-surface-soft p-4 sm:px-6">
              {step > 1 && (
                <button
                  className={secondaryButtonClassName}
                  onClick={() => setStep((current) => (current - 1) as Step)}
                  type="button"
                >
                  Back
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  className={quietButtonClassName}
                  onClick={requestClose}
                  type="button"
                >
                  Cancel
                </button>
                {step < 3 ? (
                  <button
                    className={primaryButtonClassName}
                    onClick={continueWizard}
                    type="button"
                  >
                    Continue
                  </button>
                ) : (
                  <CreateHabitButton />
                )}
              </div>
            </footer>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            if (!discarding.current) {
              event.preventDefault();
              focusBeforeDiscard.current?.focus();
            }
            discarding.current = false;
          }}
        >
          <div>
            <AlertDialogTitle>Discard new Habit?</AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              Your draft values will be lost. No Habit or Goal has been created.
            </AlertDialogDescription>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                discarding.current = true;
                setDiscardOpen(false);
                setOpen(false);
                reset();
              }}
            >
              Discard
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
