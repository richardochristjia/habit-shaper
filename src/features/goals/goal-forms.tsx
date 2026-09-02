"use client";

import { MoreHorizontal, Pencil, Plus, Trash2, Waypoints } from "lucide-react";
import {
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createGoalAction,
  deleteGoalAction,
  type GoalActionState,
  renameGoalAction,
} from "@/features/goals/actions";
import type { GoalView } from "@/features/goals/service";
import type { HabitView } from "@/features/habits/service";

const initialState: GoalActionState = {};

type GoalEditorMode = "add" | "rename";

function GoalSubmitButton({ mode }: { mode: GoalEditorMode }) {
  const { pending } = useFormStatus();

  return (
    <Button aria-busy={pending} disabled={pending} type="submit">
      {pending
        ? mode === "add"
          ? "Adding Goal…"
          : "Saving…"
        : mode === "add"
          ? "Add Goal"
          : "Save name"}
    </Button>
  );
}

function GoalEditorForm({
  mode,
  habitId,
  goal,
  onSuccess,
}: {
  mode: GoalEditorMode;
  habitId?: string;
  goal?: GoalView;
  onSuccess: () => void;
}) {
  const submitWithFeedback = useCallback(
    async (previousState: GoalActionState, formData: FormData) => {
      try {
        const result = await (mode === "add"
          ? createGoalAction(previousState, formData)
          : renameGoalAction(previousState, formData));
        if (result.success) {
          toast.success(mode === "add" ? "Goal added" : "Goal renamed");
        }
        return result;
      } catch {
        return {
          form:
            mode === "add"
              ? "We could not create that Goal. Please try again."
              : "We could not rename that Goal. Please try again.",
        };
      }
    },
    [mode],
  );
  const [state, formAction] = useActionState(submitWithFeedback, initialState);
  const inputId =
    mode === "add" ? `${habitId}-new-goal-name` : `${goal?.id}-goal-name`;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    if (state.success) onSuccess();
  }, [onSuccess, state.success]);

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col"
      noValidate
    >
      <header className="border-b border-border px-5 py-5 pr-16 sm:px-6 sm:pr-16">
        <p className="mb-1 text-xs font-extrabold tracking-[0.12em] text-action uppercase">
          Goal management
        </p>
        <DialogTitle>
          {mode === "add" ? "Add a Goal" : "Rename Goal"}
        </DialogTitle>
        <DialogDescription className="mt-2">
          {mode === "add"
            ? "Attach an optional named intention to this Habit. Goals do not independently track progress."
            : "Change this Goal’s wording. Its Habit attachment and tracking history stay unchanged."}
        </DialogDescription>
      </header>

      <div className="grid min-h-0 flex-1 gap-2 overflow-y-auto p-5 sm:p-6">
        {mode === "add" ? (
          <input name="habitId" type="hidden" value={habitId} />
        ) : (
          <input name="goalId" type="hidden" value={goal?.id} />
        )}
        <label className="font-semibold" htmlFor={inputId}>
          Goal name
        </label>
        <input
          aria-describedby={state.fields?.name ? errorId : undefined}
          aria-invalid={Boolean(state.fields?.name)}
          className={formInputClassName}
          defaultValue={goal?.name}
          id={inputId}
          maxLength={120}
          name="name"
          placeholder="For example, Make evenings feel calmer"
          required
        />
        <FieldError errors={state.fields?.name} id={errorId} />
        <FormError message={state.form} />
      </div>

      <footer className="mt-auto flex items-center justify-end gap-2 border-t border-border bg-surface-soft p-4 sm:px-6">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <GoalSubmitButton mode={mode} />
      </footer>
    </form>
  );
}

function AddGoalDialog({ habitId }: { habitId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              aria-label="Add Goal"
              size="icon"
              type="button"
              variant="secondary"
            >
              <Plus aria-hidden="true" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>Add Goal</TooltipContent>
      </Tooltip>
      {open && (
        <DialogContent className="sm:max-w-lg">
          <GoalEditorForm
            habitId={habitId}
            mode="add"
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}

function DeleteGoalButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-busy={pending}
      disabled={pending}
      type="submit"
      variant="destructive"
    >
      {pending ? "Deleting…" : "Delete Goal"}
    </Button>
  );
}

function DeleteGoalForm({
  goal,
  onSuccess,
}: {
  goal: GoalView;
  onSuccess: () => void;
}) {
  const deleteWithFeedback = useCallback(
    async (previousState: GoalActionState, formData: FormData) => {
      try {
        const result = await deleteGoalAction(previousState, formData);
        if (result.success) toast.success("Goal deleted");
        return result;
      } catch {
        return {
          form: "We could not delete that Goal. Please try again.",
        };
      }
    },
    [],
  );
  const [state, formAction] = useActionState(deleteWithFeedback, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [onSuccess, state.success]);

  return (
    <>
      <div>
        <AlertDialogTitle>Delete “{goal.name}”?</AlertDialogTitle>
        <AlertDialogDescription className="mt-2">
          This removes this Goal only. Its Habit and all tracking history remain
          unchanged.
        </AlertDialogDescription>
      </div>
      <form action={formAction} className="grid gap-3" noValidate>
        <input name="goalId" type="hidden" value={goal.id} />
        <FormError message={state.form} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
          <DeleteGoalButton />
        </div>
      </form>
    </>
  );
}

function DeleteGoalDialog({
  goal,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  goal: GoalView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onCloseAutoFocus();
          }}
        >
          <DeleteGoalForm goal={goal} onSuccess={() => onOpenChange(false)} />
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

function GoalItem({ goal }: { goal: GoalView }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const returnFocusToMenu = () => menuTriggerRef.current?.focus();

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-field border border-border bg-surface px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-action">
        <Waypoints aria-hidden="true" className="size-4" />
      </span>
      <p className="min-w-0 flex-1 break-words font-semibold">{goal.name}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Open actions for Goal ${goal.name}`}
            ref={menuTriggerRef}
            size="icon"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil aria-hidden="true" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        {renameOpen && (
          <DialogContent
            className="sm:max-w-lg"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              returnFocusToMenu();
            }}
          >
            <GoalEditorForm
              goal={goal}
              mode="rename"
              onSuccess={() => setRenameOpen(false)}
            />
          </DialogContent>
        )}
      </Dialog>

      <DeleteGoalDialog
        goal={goal}
        onCloseAutoFocus={returnFocusToMenu}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
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
    <TooltipProvider>
      <section
        aria-labelledby={`${habit.id}-goals-heading`}
        className="min-w-0 pb-6"
      >
        <header className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="font-display text-xl font-semibold"
              id={`${habit.id}-goals-heading`}
            >
              Goals
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {goals.length} attached {goals.length === 1 ? "Goal" : "Goals"}
            </p>
          </div>
          <AddGoalDialog habitId={habit.id} />
        </header>

        {goals.length === 0 ? (
          <div className="mt-5 rounded-field border border-border bg-surface-soft p-5">
            <p className="font-semibold">
              Goals are optional named intentions.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add one when it helps describe why this Habit matters. Goals do
              not independently track progress.
            </p>
          </div>
        ) : (
          <ul className="mt-5 grid min-w-0 list-none gap-3 p-0">
            {goals.map((goal) => (
              <GoalItem goal={goal} key={goal.id} />
            ))}
          </ul>
        )}
      </section>
    </TooltipProvider>
  );
}
