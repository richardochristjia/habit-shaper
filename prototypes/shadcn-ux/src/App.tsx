// THROWAWAY PROTOTYPE — real shadcn interaction primitives, in-memory state only.
import { useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  CircleOff,
  Clock3,
  Ellipsis,
  Flag,
  Flame,
  Leaf,
  LoaderCircle,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sprout,
  Trash2,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TODAY = "2026-09-02"
const DAY_MS = 86_400_000

type HabitType = "BUILD" | "BREAK"
type TrackingState =
  | "completion"
  | "clean"
  | "relapse"
  | "missed"
  | "pending"
  | "future"
  | "ineligible"
type Goal = { id: string; name: string }
type Habit = {
  id: string
  name: string
  type: HabitType
  startDate: string
  createdOrder: number
  goals: Goal[]
  records: Record<string, true>
}

type HabitDraft = {
  step: 1 | 2 | 3
  name: string
  type: HabitType | null
  goals: string[]
  dirty: boolean
}

const toDate = (value: string) => new Date(`${value}T12:00:00`)
const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
const addDays = (value: string, amount: number) =>
  toIso(new Date(toDate(value).getTime() + amount * DAY_MS))
const dateRange = (start: string, end: string) => {
  const result: string[] = []
  for (let day = start; day <= end; day = addDays(day, 1)) result.push(day)
  return result
}
const formatDate = (value: string, full = true) =>
  new Intl.DateTimeFormat(
    "en-GB",
    full
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { day: "numeric", month: "long", year: "numeric" }
  ).format(toDate(value))
const records = (...days: string[]) =>
  Object.fromEntries(days.map((day) => [day, true])) as Record<string, true>

function populatedHabits(): Habit[] {
  return [
    {
      id: "build-read",
      name: "Read for 20 minutes",
      type: "BUILD",
      startDate: "2026-08-20",
      createdOrder: 1,
      goals: [
        { id: "goal-book", name: "Finish one thoughtful book each month" },
      ],
      records: records(
        "2026-08-22",
        "2026-08-24",
        "2026-08-27",
        "2026-08-28",
        "2026-08-29",
        "2026-08-30",
        "2026-08-31",
        "2026-09-01"
      ),
    },
    {
      id: "build-stretch",
      name: "Stretch after lunch",
      type: "BUILD",
      startDate: "2026-08-24",
      createdOrder: 2,
      goals: [
        { id: "goal-mobility", name: "Move comfortably through the workday" },
        { id: "goal-break", name: "Create a dependable midday pause" },
      ],
      records: records(
        "2026-08-27",
        "2026-08-29",
        "2026-08-31",
        "2026-09-01",
        "2026-09-02"
      ),
    },
    {
      id: "build-plan",
      name: "Plan tomorrow before signing off",
      type: "BUILD",
      startDate: "2026-09-01",
      createdOrder: 3,
      goals: [],
      records: records("2026-09-01"),
    },
    {
      id: "break-scroll",
      name: "Late-night scrolling",
      type: "BREAK",
      startDate: "2026-08-20",
      createdOrder: 4,
      goals: [{ id: "goal-rest", name: "Protect a calmer bedtime" }],
      records: records("2026-08-23", "2026-08-29"),
    },
    {
      id: "break-sugar",
      name: "Sugary drinks",
      type: "BREAK",
      startDate: "2026-08-25",
      createdOrder: 5,
      goals: [],
      records: records("2026-08-28", "2026-09-02"),
    },
    {
      id: "break-lunch",
      name: "Skipping lunch",
      type: "BREAK",
      startDate: "2026-09-02",
      createdOrder: 6,
      goals: [{ id: "goal-energy", name: "Keep afternoon energy steady" }],
      records: {},
    },
  ]
}

function mondayOf(value: string) {
  const date = toDate(value)
  const weekday = date.getDay()
  return addDays(value, -(weekday === 0 ? 6 : weekday - 1))
}

function trackingState(habit: Habit, day: string): TrackingState {
  if (day < habit.startDate) return "ineligible"
  if (day > TODAY) return "future"
  if (habit.type === "BUILD") {
    if (habit.records[day]) return "completion"
    return day === TODAY ? "pending" : "missed"
  }
  return habit.records[day] ? "relapse" : "clean"
}

function streak(habit: Habit) {
  if (habit.type === "BREAK") {
    let count = 0
    for (let day = TODAY; day >= habit.startDate; day = addDays(day, -1)) {
      if (habit.records[day]) break
      count += 1
    }
    return count
  }
  let day = habit.records[TODAY] ? TODAY : addDays(TODAY, -1)
  let count = 0
  while (day >= habit.startDate && habit.records[day]) {
    count += 1
    day = addDays(day, -1)
  }
  return count
}

function weeklySummary(habit: Habit) {
  const monday = mondayOf(TODAY)
  const states = dateRange(monday, addDays(monday, 6)).map((day) =>
    trackingState(habit, day)
  )
  const completed = states.filter((value) => value === "completion").length
  const missed = states.filter((value) => value === "missed").length
  const pending = states.filter((value) => value === "pending").length
  const assessed = completed + missed
  return {
    completed,
    missed,
    pending,
    assessed,
    rate: assessed ? Math.round((completed / assessed) * 100) : null,
  }
}

const stateText: Record<TrackingState, string> = {
  completion: "Completed",
  clean: "Clean Day",
  relapse: "Relapse",
  missed: "Missed",
  pending: "Pending",
  future: "Future",
  ineligible: "Not eligible",
}

function TrackingIcon({
  state,
  className,
}: {
  state: TrackingState
  className?: string
}) {
  const props = { className: cn("size-3.5", className), "aria-hidden": true }
  if (state === "completion") return <CheckCircle2 {...props} />
  if (state === "clean") return <ShieldCheck {...props} />
  if (state === "relapse") return <CircleOff {...props} />
  if (state === "pending") return <Clock3 {...props} />
  if (state === "missed") return <Minus {...props} />
  if (state === "ineligible") return null
  return <CircleDashed {...props} />
}

function WeekStrip({ habit }: { habit: Habit }) {
  const monday = mondayOf(TODAY)
  return (
    <div
      className="grid min-w-0 grid-cols-7 gap-1"
      aria-label="Current week, Monday to Sunday"
    >
      {dateRange(monday, addDays(monday, 6)).map((day) => {
        const value = trackingState(habit, day)
        return (
          <Tooltip key={day}>
            <TooltipTrigger asChild>
              <span className="grid min-w-0 justify-items-center gap-1 text-[10px] font-bold text-muted-foreground">
                {toDate(day).toLocaleDateString("en-GB", { weekday: "narrow" })}
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-md border bg-background transition-colors duration-200 motion-reduce:transition-none",
                    value === "completion" &&
                      "border-success/40 bg-success-soft text-success",
                    value === "clean" &&
                      "border-success/40 bg-success-soft text-success",
                    value === "relapse" &&
                      "border-break/45 bg-break-soft text-break",
                    value === "pending" &&
                      "border-pending/40 bg-pending-soft text-pending",
                    value === "missed" && "border-dashed text-muted-foreground",
                    value === "future" && "border-dashed opacity-35",
                    value === "ineligible" &&
                      "border-transparent bg-transparent opacity-20"
                  )}
                >
                  <TrackingIcon state={value} />
                </span>
                <span className="sr-only">
                  {formatDate(day)}: {stateText[value]}
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {formatDate(day)} · {stateText[value]}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

function EmptyDirection({
  type,
  onAdd,
}: {
  type: HabitType
  onAdd: () => void
}) {
  const build = type === "BUILD"
  return (
    <div className="rounded-xl border border-dashed bg-card/60 p-8 text-center">
      <span
        className={cn(
          "mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-success-soft text-success",
          !build && "bg-break-soft text-break"
        )}
      >
        {build ? <Sprout className="size-5" /> : <Shield className="size-5" />}
      </span>
      <h3
        className={cn(
          "font-heading text-lg font-semibold",
          build ? "text-success" : "text-break"
        )}
      >
        No {build ? "Build" : "Break"} Habits yet
      </h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
        {build
          ? "Add a behaviour you want to perform each day."
          : "Add a behaviour you want to avoid; clean days need no check-in."}
      </p>
      <Button
        variant="ghost"
        className="mt-3 h-11 text-primary"
        onClick={onAdd}
      >
        <Plus /> Add a Habit
      </Button>
    </div>
  )
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(populatedHabits)
  const [scenario, setScenario] = useState("Populated Today")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeHabitId, setActiveHabitId] = useState("build-read")
  const [drawerTab, setDrawerTab] = useState("overview")
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const failNextSave = useRef(false)
  const nextId = useRef(200)

  const [creatorOpen, setCreatorOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [draft, setDraft] = useState<HabitDraft>({
    step: 1,
    name: "",
    type: null,
    goals: [""],
    dirty: false,
  })

  const [goalEditorOpen, setGoalEditorOpen] = useState(false)
  const [goalEditorMode, setGoalEditorMode] = useState<"add" | "rename">("add")
  const [goalEditorId, setGoalEditorId] = useState<string | null>(null)
  const [goalName, setGoalName] = useState("")
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null)
  const [deleteHabitOpen, setDeleteHabitOpen] = useState(false)
  const [renameHabitName, setRenameHabitName] = useState("")

  const activeHabit = useMemo(
    () => habits.find((habit) => habit.id === activeHabitId) ?? habits[0],
    [habits, activeHabitId]
  )

  const builds = habits
    .filter((habit) => habit.type === "BUILD")
    .sort((a, b) => a.createdOrder - b.createdOrder)
  const breaks = habits
    .filter((habit) => habit.type === "BREAK")
    .sort((a, b) => a.createdOrder - b.createdOrder)

  const changeHabit = (habitId: string, change: (habit: Habit) => Habit) => {
    setHabits((current) =>
      current.map((habit) => (habit.id === habitId ? change(habit) : habit))
    )
  }

  const showSuccess = (value: string) =>
    toast.success(value, { duration: 1800 })

  const recordToday = (habit: Habit, recorded: boolean) => {
    if (pending.has(habit.id)) return
    const before = Boolean(habit.records[TODAY])
    const shouldFail = failNextSave.current
    failNextSave.current = false
    setError("")
    changeHabit(habit.id, (current) => {
      const nextRecords = { ...current.records }
      if (recorded) nextRecords[TODAY] = true
      else delete nextRecords[TODAY]
      return { ...current, records: nextRecords }
    })
    setPending((current) => new Set(current).add(habit.id))
    const toastId = toast.loading(
      recorded
        ? habit.type === "BUILD"
          ? "Done for today · Saving…"
          : "Relapsed today · Saving…"
        : "Undoing today’s record · Saving…"
    )

    window.setTimeout(() => {
      setPending((current) => {
        const next = new Set(current)
        next.delete(habit.id)
        return next
      })
      if (shouldFail) {
        changeHabit(habit.id, (current) => {
          const nextRecords = { ...current.records }
          if (before) nextRecords[TODAY] = true
          else delete nextRecords[TODAY]
          return { ...current, records: nextRecords }
        })
        const failure = `We couldn’t save the change to “${habit.name}”. The previous state has been restored.`
        setError(failure)
        toast.error(failure, { id: toastId, duration: 3500 })
        setScenario("Failed-save rollback")
        return
      }
      toast.success("Saved", { id: toastId, duration: 1600 })
    }, 750)
  }

  const openHabit = (habit: Habit, tab = "overview") => {
    setActiveHabitId(habit.id)
    setRenameHabitName(habit.name)
    setDrawerTab(tab)
    setSelectedDay(TODAY)
    setDrawerOpen(true)
  }

  const openCreator = () => {
    setDraft({ step: 1, name: "", type: null, goals: [""], dirty: false })
    setCreatorOpen(true)
  }

  const requestCreatorClose = () => {
    if (draft.dirty) setDiscardOpen(true)
    else setCreatorOpen(false)
  }

  const createHabit = () => {
    if (!draft.name.trim() || !draft.type) return
    nextId.current += 1
    const habit: Habit = {
      id: `habit-${nextId.current}`,
      name: draft.name.trim(),
      type: draft.type,
      startDate: TODAY,
      createdOrder: Math.max(0, ...habits.map((item) => item.createdOrder)) + 1,
      records: {},
      goals: draft.goals
        .filter((name) => name.trim())
        .map((name, index) => ({
          id: `goal-${nextId.current}-${index}`,
          name: name.trim(),
        })),
    }
    setHabits((current) => [...current, habit])
    setScenario("Custom state")
    setCreatorOpen(false)
    showSuccess(`${habit.name} created`)
  }

  const setPreset = (preset: "populated" | "empty" | "build-only") => {
    const source = populatedHabits()
    setHabits(
      preset === "empty"
        ? []
        : preset === "build-only"
          ? source.filter((habit) => habit.type === "BUILD")
          : source
    )
    setScenario(
      preset === "empty"
        ? "Empty Today"
        : preset === "build-only"
          ? "Build only"
          : "Populated Today"
    )
    setDrawerOpen(false)
    setError("")
  }

  const saveGoal = () => {
    if (!activeHabit || !goalName.trim()) return
    if (goalEditorMode === "add") {
      nextId.current += 1
      changeHabit(activeHabit.id, (habit) => ({
        ...habit,
        goals: [
          ...habit.goals,
          { id: `goal-${nextId.current}`, name: goalName.trim() },
        ],
      }))
    } else if (goalEditorId) {
      changeHabit(activeHabit.id, (habit) => ({
        ...habit,
        goals: habit.goals.map((goal) =>
          goal.id === goalEditorId ? { ...goal, name: goalName.trim() } : goal
        ),
      }))
    }
    setGoalEditorOpen(false)
    showSuccess(goalEditorMode === "add" ? "Goal added" : "Goal renamed")
  }

  const setHistoryRecorded = (recorded: boolean) => {
    if (!activeHabit) return
    changeHabit(activeHabit.id, (habit) => {
      const nextRecords = { ...habit.records }
      if (recorded) nextRecords[selectedDay] = true
      else delete nextRecords[selectedDay]
      return { ...habit, records: nextRecords }
    })
    showSuccess(
      `${activeHabit.type === "BUILD" ? "Completion" : "Relapse"} ${recorded ? "added" : "removed"}`
    )
  }

  const renderHabitCard = (habit: Habit) => {
    const recorded = Boolean(habit.records[TODAY])
    const saving = pending.has(habit.id)
    const build = habit.type === "BUILD"
    return (
      <article
        key={habit.id}
        className="overflow-hidden rounded-xl border bg-card"
      >
        <div className="grid min-h-24 items-center gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl bg-success-soft text-success",
                !build && "bg-break-soft text-break"
              )}
            >
              {build ? (
                <Sprout className="size-5" />
              ) : (
                <Shield className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <h3 className="font-sans text-base font-bold break-words">
                {habit.name}
              </h3>
              <p
                aria-live="polite"
                className={cn(
                  "mt-1 inline-flex min-h-6 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold",
                  build &&
                    !recorded &&
                    "border-pending/40 bg-pending-soft text-pending",
                  build &&
                    recorded &&
                    "border-success/40 bg-success-soft text-success",
                  !build &&
                    !recorded &&
                    "border-success/35 bg-success-soft text-success",
                  !build &&
                    recorded &&
                    "border-break/40 bg-break-soft text-break"
                )}
              >
                {build ? (
                  recorded ? (
                    <CheckCircle2 className="size-3.5 animate-in zoom-in-75 motion-reduce:animate-none" />
                  ) : (
                    <Clock3 className="size-3.5" />
                  )
                ) : recorded ? (
                  <CircleOff className="size-3.5" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                {build
                  ? recorded
                    ? "Done for today"
                    : "Pending today"
                  : recorded
                    ? "Relapsed today"
                    : "Clean today"}
              </p>
            </div>
          </div>

          {!recorded ? (
            <Button
              variant={build ? "default" : "destructive"}
              className={cn(
                "h-11 w-full sm:w-32",
                build && "bg-success text-white hover:bg-success/90",
                !build &&
                  "border-break/25 bg-break/10 text-break hover:bg-break/20"
              )}
              disabled={saving}
              onClick={() => recordToday(habit, true)}
            >
              {saving ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : build ? (
                <Check />
              ) : (
                <CircleOff />
              )}
              {build ? "Done today" : "I relapsed"}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="h-11 w-fit justify-self-end px-3 text-muted-foreground hover:text-foreground"
              disabled={saving}
              onClick={() => recordToday(habit, false)}
            >
              {saving ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : (
                <RotateCcw />
              )}
              Undo
            </Button>
          )}
        </div>
        <div className="grid items-center gap-3 border-t bg-muted/25 px-4 py-3 sm:grid-cols-[130px_minmax(0,1fr)_44px]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="size-4 text-primary" />
            <span>
              <strong className="block text-sm text-foreground">
                {streak(habit)} {streak(habit) === 1 ? "day" : "days"}
              </strong>
              {build ? "Build Streak" : "Clean Streak"}
            </span>
          </div>
          <WeekStrip habit={habit} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 justify-self-end"
                aria-label={`Open details for ${habit.name}`}
                onClick={() => openHabit(habit)}
              >
                <Ellipsis />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Habit details</TooltipContent>
          </Tooltip>
        </div>
      </article>
    )
  }

  const trackingDays = activeHabit
    ? dateRange(activeHabit.startDate, TODAY)
    : []
  const selectedState = activeHabit
    ? trackingState(activeHabit, selectedDay)
    : "pending"
  const selectedRecorded = Boolean(activeHabit?.records[selectedDay])
  const summary =
    activeHabit?.type === "BUILD" ? weeklySummary(activeHabit) : null
  const deletingGoal = activeHabit?.goals.find(
    (goal) => goal.id === deleteGoalId
  )

  return (
    <TooltipProvider delayDuration={350}>
      <main className="mx-auto min-h-dvh w-full max-w-[1180px] px-4 pb-28 sm:px-6">
        <header className="flex min-h-20 items-center justify-between gap-5">
          <div className="flex items-center gap-3 font-bold">
            <span className="grid size-10 place-items-center rounded-xl bg-brand font-heading text-xs text-white shadow-sm">
              HS
            </span>
            Habit Shaper
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden sm:inline">alex@example.com</span>
            <button
              className="min-h-11 font-bold underline underline-offset-4"
              onClick={() =>
                toast.info("Sign-out is outside this prototype", {
                  duration: 1800,
                })
              }
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="flex flex-col items-start justify-between gap-5 border-b py-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-xs font-extrabold tracking-[.12em] text-primary uppercase">
              Your private record
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Today
            </h1>
            <p className="mt-1 font-bold">{formatDate(TODAY)}</p>
            <p className="text-sm text-muted-foreground">
              Shape one day at a time
            </p>
          </div>
          <Button className="h-11 w-full sm:w-auto" onClick={openCreator}>
            <Plus /> Add a Habit
          </Button>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-destructive/35 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <span className="flex gap-2 font-semibold">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setError("")}>
              Dismiss
            </Button>
          </div>
        )}

        {!habits.length ? (
          <section className="my-7 rounded-2xl border bg-card p-8 text-center sm:p-14">
            <p className="text-xs font-extrabold tracking-[.12em] text-primary uppercase">
              Your private record
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold">
              Begin with one behaviour
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Build what you want to perform. Break what you want to avoid.
              Every Habit begins today in your User Time Zone.
            </p>
            <div className="mx-auto my-6 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/40 p-4">
                <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-success">
                  <Sprout className="size-5" /> Build
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record a Completion when you perform the behaviour.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-break">
                  <Shield className="size-5" /> Break
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Days are clean automatically unless you record a Relapse.
                </p>
              </div>
            </div>
            <Button className="h-12" onClick={openCreator}>
              <Plus /> Add your first Habit
            </Button>
          </section>
        ) : (
          <div className="grid items-start gap-6 py-6 lg:grid-cols-2">
            {(["BUILD", "BREAK"] as HabitType[]).map((type) => {
              const list = type === "BUILD" ? builds : breaks
              return (
                <section
                  key={type}
                  aria-labelledby={`${type.toLowerCase()}-heading`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2
                      id={`${type.toLowerCase()}-heading`}
                      className={cn(
                        "flex items-center gap-2 font-heading text-2xl font-semibold",
                        type === "BUILD" ? "text-success" : "text-break"
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-xl bg-success-soft text-success",
                          type === "BREAK" && "bg-break-soft text-break"
                        )}
                      >
                        {type === "BUILD" ? (
                          <Sprout className="size-5" />
                        ) : (
                          <Shield className="size-5" />
                        )}
                      </span>
                      {type === "BUILD" ? "Build Today" : "Break Today"}
                    </h2>
                    <span className="text-xs font-bold text-muted-foreground">
                      {list.length} {list.length === 1 ? "Habit" : "Habits"}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {list.length ? (
                      list.map(renderHabitCard)
                    ) : (
                      <EmptyDirection type={type} onAdd={openCreator} />
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          className="w-full max-w-full gap-0 overflow-hidden p-0 data-[side=right]:w-full sm:max-w-[680px] data-[side=right]:sm:max-w-[680px]"
          side="right"
        >
          {activeHabit && (
            <>
              <SheetHeader className="max-w-full min-w-0 border-b p-5 pr-14">
                <p
                  className={cn(
                    "text-xs font-extrabold tracking-[.12em] uppercase",
                    activeHabit.type === "BUILD" ? "text-success" : "text-break"
                  )}
                >
                  {activeHabit.type === "BUILD" ? "Build Habit" : "Break Habit"}
                </p>
                <SheetTitle className="font-heading text-2xl font-semibold">
                  {activeHabit.name}
                </SheetTitle>
                <SheetDescription>
                  Began {formatDate(activeHabit.startDate, false)}
                </SheetDescription>
              </SheetHeader>
              <Tabs
                value={drawerTab}
                onValueChange={setDrawerTab}
                className="min-h-0 min-w-0 flex-1 gap-0 overflow-hidden"
              >
                <TabsList className="mx-4 mt-3 grid h-auto w-auto min-w-0 shrink-0 grid-cols-3 rounded-xl border border-primary/15 bg-primary/10 p-1 group-data-horizontal/tabs:h-auto">
                  <TabsTrigger
                    value="overview"
                    className="h-11 rounded-lg px-3 text-muted-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="goals"
                    className="h-11 rounded-lg px-3 text-muted-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
                  >
                    Goals
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="h-11 rounded-lg px-3 text-muted-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>
                <div className="min-h-0 w-full max-w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5">
                  <TabsContent
                    value="overview"
                    className="grid max-w-full min-w-0 gap-4 overflow-hidden"
                  >
                    <section className="rounded-xl border p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Flame className="size-5" />
                        </span>
                        <div>
                          <strong className="block font-heading text-2xl">
                            {streak(activeHabit)}{" "}
                            {streak(activeHabit) === 1 ? "day" : "days"}
                          </strong>
                          <span className="text-sm text-muted-foreground">
                            Current{" "}
                            {activeHabit.type === "BUILD"
                              ? "Build Streak"
                              : "Clean Streak"}
                          </span>
                        </div>
                      </div>
                    </section>

                    {summary && (
                      <section className="rounded-xl border p-4">
                        <h3 className="font-heading text-xl font-semibold">
                          This week
                        </h3>
                        <p className="mt-1 font-semibold">
                          {summary.completed} of {summary.assessed} assessed{" "}
                          {summary.assessed === 1 ? "day" : "days"} completed
                          {summary.pending
                            ? `; ${summary.pending} still pending`
                            : ""}
                          .
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            ["Completed", summary.completed],
                            ["Missed", summary.missed],
                            ["Pending", summary.pending],
                            [
                              "Rate",
                              summary.rate === null ? "—" : `${summary.rate}%`,
                            ],
                          ].map(([label, value]) => (
                            <div
                              className="rounded-lg border border-border bg-accent/70 p-3"
                              key={label}
                            >
                              <strong className="block text-lg tabular-nums">
                                {value}
                              </strong>
                              <span className="text-xs text-muted-foreground">
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="max-w-full min-w-0 overflow-hidden rounded-xl border p-4">
                      <h3 className="font-heading text-xl font-semibold">
                        Tracking Days
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        All eligible days are shown oldest first. Choose a day
                        to review it; selecting a day never changes its record.
                      </p>
                      <div
                        className="mt-4 grid w-full max-w-full grid-cols-3 gap-2 sm:grid-cols-5"
                        aria-label="All eligible Tracking Days, oldest first"
                      >
                        {trackingDays.map((day) => {
                          const value = trackingState(activeHabit, day)
                          return (
                            <button
                              key={day}
                              aria-pressed={selectedDay === day}
                              aria-label={`${formatDate(day)}: ${stateText[value]}`}
                              onClick={() => setSelectedDay(day)}
                              className={cn(
                                "grid min-h-24 min-w-0 place-items-center gap-1 rounded-lg border px-1.5 py-2 text-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none",
                                value === "completion" &&
                                  "border-success/45 bg-success-soft/75 hover:bg-success-soft",
                                value === "clean" &&
                                  "border-success/45 bg-success-soft/75 hover:bg-success-soft",
                                value === "relapse" &&
                                  "border-break/45 bg-break-soft hover:bg-break-soft/75",
                                value === "pending" &&
                                  "border-pending/40 bg-pending-soft hover:bg-pending-soft/75",
                                value === "missed" &&
                                  "border-border bg-muted/45 hover:bg-muted",
                                selectedDay === day &&
                                  "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              )}
                            >
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {toDate(day).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                })}
                              </span>
                              <strong className="leading-none">
                                <span className="block text-lg">
                                  {toDate(day).getDate()}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                  {toDate(day).toLocaleDateString("en-GB", {
                                    month: "short",
                                  })}
                                </span>
                              </strong>
                              <span
                                className={cn(
                                  "inline-flex max-w-full items-center gap-1 rounded-full border px-1.5 py-1 text-[9px] font-extrabold whitespace-nowrap",
                                  (value === "completion" ||
                                    value === "clean") &&
                                    "border-success bg-success text-white",
                                  value === "relapse" &&
                                    "border-break bg-break text-white",
                                  value === "pending" &&
                                    "border-pending bg-pending text-white",
                                  value === "missed" &&
                                    "border-border bg-background text-muted-foreground"
                                )}
                              >
                                <TrackingIcon state={value} />
                                {stateText[value]}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      <div
                        key={selectedDay}
                        className="mt-4 animate-in rounded-xl border bg-muted/45 p-4 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none"
                      >
                        <Badge variant="outline" className="mb-2">
                          Selected Tracking Day
                        </Badge>
                        <p className="font-bold">{formatDate(selectedDay)}</p>
                        <p className="text-sm text-muted-foreground">
                          Current state: {stateText[selectedState]}
                        </p>
                        <Button
                          className="mt-3 h-11"
                          variant={selectedRecorded ? "destructive" : "default"}
                          onClick={() => setHistoryRecorded(!selectedRecorded)}
                        >
                          {selectedRecorded ? "Remove" : "Add"}{" "}
                          {activeHabit.type === "BUILD"
                            ? "Completion"
                            : "Relapse"}
                        </Button>
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent
                    value="goals"
                    className="max-w-full min-w-0 overflow-hidden"
                  >
                    <section className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-xl font-semibold">
                            Goals
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Named intentions attached to this Habit. Their
                            attachment cannot be changed.
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11"
                              aria-label="Add a Goal"
                              onClick={() => {
                                setGoalEditorMode("add")
                                setGoalName("")
                                setGoalEditorId(null)
                                setGoalEditorOpen(true)
                              }}
                            >
                              <Plus />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add a Goal</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {activeHabit.goals.length ? (
                          activeHabit.goals.map((goal) => (
                            <div
                              key={goal.id}
                              className="flex min-h-14 items-center justify-between gap-3 rounded-xl border py-1 pr-1 pl-3"
                            >
                              <span className="flex min-w-0 items-center gap-2 font-semibold">
                                <Flag className="size-4 shrink-0 text-muted-foreground" />
                                <span className="break-words">{goal.name}</span>
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11"
                                    aria-label={`Actions for Goal ${goal.name}`}
                                  >
                                    <Ellipsis />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setGoalEditorMode("rename")
                                      setGoalEditorId(goal.id)
                                      setGoalName(goal.name)
                                      setGoalEditorOpen(true)
                                    }}
                                  >
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => setDeleteGoalId(goal.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed bg-muted/30 p-7 text-center">
                            <Flag className="mx-auto size-5 text-muted-foreground" />
                            <p className="mt-2 font-semibold">
                              No Goals attached
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Goals are optional and do not track progress.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent
                    value="settings"
                    className="grid max-w-full min-w-0 gap-4 overflow-hidden"
                  >
                    <section className="rounded-xl border p-4">
                      <h3 className="font-heading text-xl font-semibold">
                        Rename Habit
                      </h3>
                      <Label className="mt-4" htmlFor="rename-habit">
                        Habit name
                      </Label>
                      <Input
                        id="rename-habit"
                        className="mt-2 h-11"
                        value={renameHabitName}
                        onChange={(event) =>
                          setRenameHabitName(event.target.value)
                        }
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Its {activeHabit.type === "BUILD" ? "Build" : "Break"}{" "}
                        direction and creation day cannot be changed.
                      </p>
                      <Button
                        className="mt-4 h-11"
                        onClick={() => {
                          if (renameHabitName.trim()) {
                            changeHabit(activeHabit.id, (habit) => ({
                              ...habit,
                              name: renameHabitName.trim(),
                            }))
                            showSuccess("Habit renamed")
                          }
                        }}
                      >
                        Save name
                      </Button>
                    </section>
                    <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                      <h3 className="font-heading text-xl font-semibold text-destructive">
                        Delete Habit
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Delete this Habit, its attached Goals, and all tracking
                        history.
                      </p>
                      <Button
                        variant="destructive"
                        className="mt-4 h-11"
                        onClick={() => setDeleteHabitOpen(true)}
                      >
                        <Trash2 /> Delete Habit
                      </Button>
                    </section>
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={creatorOpen}
        onOpenChange={(open) =>
          open ? setCreatorOpen(true) : requestCreatorClose()
        }
      >
        <DialogContent className="h-dvh max-w-none rounded-none p-0 sm:h-auto sm:max-w-xl sm:rounded-xl">
          <DialogHeader className="border-b p-5 pr-14">
            <p className="text-xs font-extrabold tracking-[.12em] text-primary uppercase">
              Step {draft.step} of 3
            </p>
            <DialogTitle className="font-heading text-2xl font-semibold">
              {draft.step === 1
                ? "What behaviour do you want to shape?"
                : draft.step === 2
                  ? "Which direction fits?"
                  : "Add optional Goals"}
            </DialogTitle>
            <DialogDescription>
              {draft.step === 1
                ? "Use a short phrase that will be easy to scan each day."
                : draft.step === 2
                  ? "This choice cannot be changed after creation."
                  : "Goals are named intentions, not tasks or progress trackers."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-5">
            <div
              className="mb-6 grid grid-cols-3 gap-2"
              aria-label="Creation progress"
            >
              {["Name", "Direction", "Goals"].map((label, index) => (
                <div
                  key={label}
                  className={cn(
                    "border-t-4 pt-2 text-xs font-bold text-muted-foreground",
                    draft.step >= index + 1 && "border-primary text-foreground"
                  )}
                >
                  {index + 1} · {label}
                </div>
              ))}
            </div>
            {draft.step === 1 && (
              <div>
                <Label htmlFor="habit-name">Habit name</Label>
                <Input
                  id="habit-name"
                  autoFocus
                  className="mt-2 h-12"
                  value={draft.name}
                  placeholder="For example, Walk after dinner"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                      dirty: true,
                    }))
                  }
                />
              </div>
            )}
            {draft.step === 2 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  aria-pressed={draft.type === "BUILD"}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      type: "BUILD",
                      dirty: true,
                    }))
                  }
                  className="min-h-36 rounded-xl border-2 p-5 text-left transition-colors hover:border-success hover:bg-success-soft/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-pressed:border-success aria-pressed:bg-success-soft motion-reduce:transition-none"
                >
                  <strong className="flex items-center gap-2 font-heading text-xl text-success">
                    <Sprout /> Build
                  </strong>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    Something you want to perform. Record a Completion when you
                    do it.
                  </span>
                </button>
                <button
                  aria-pressed={draft.type === "BREAK"}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      type: "BREAK",
                      dirty: true,
                    }))
                  }
                  className="min-h-36 rounded-xl border-2 p-5 text-left transition-colors hover:border-break hover:bg-break-soft/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-pressed:border-break aria-pressed:bg-break-soft motion-reduce:transition-none"
                >
                  <strong className="flex items-center gap-2 font-heading text-xl text-break">
                    <Shield /> Break
                  </strong>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    Something you want to avoid. Clean Days happen
                    automatically.
                  </span>
                </button>
              </div>
            )}
            {draft.step === 3 && (
              <div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Goals are optional and can be added later.
                </p>
                <div className="grid gap-3">
                  {draft.goals.map((goal, index) => (
                    <div key={index}>
                      <Label htmlFor={`draft-goal-${index}`}>
                        {index
                          ? "Another Goal (optional)"
                          : "Goal name (optional)"}
                      </Label>
                      <Input
                        id={`draft-goal-${index}`}
                        className="mt-2 h-11"
                        value={goal}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            dirty: true,
                            goals: current.goals.map((value, goalIndex) =>
                              goalIndex === index ? event.target.value : value
                            ),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="mt-3 h-11 text-primary"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      dirty: true,
                      goals: [...current.goals, ""],
                    }))
                  }
                >
                  <Plus /> Add another
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="mx-0 mt-auto mb-0 flex-row flex-wrap items-center justify-between rounded-none border-t bg-muted/30 p-4 sm:mt-0 sm:rounded-b-xl">
            <div>
              {draft.step > 1 && (
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      step: (current.step - 1) as 1 | 2,
                    }))
                  }
                >
                  Back
                </Button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-11"
                onClick={requestCreatorClose}
              >
                Cancel
              </Button>
              {draft.step < 3 ? (
                <Button
                  className="h-11"
                  disabled={draft.step === 1 ? !draft.name.trim() : !draft.type}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      step: (current.step + 1) as 2 | 3,
                    }))
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button className="h-11" onClick={createHabit}>
                  Create Habit
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard new Habit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your draft values will be lost. Today will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-11"
              onClick={() => {
                setDiscardOpen(false)
                setCreatorOpen(false)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={goalEditorOpen} onOpenChange={setGoalEditorOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b bg-muted/30 p-5 pr-14">
            <p className="text-xs font-extrabold tracking-[.12em] text-primary uppercase">
              Goal management
            </p>
            <DialogTitle className="font-heading text-xl font-semibold">
              {goalEditorMode === "add" ? "Add a Goal" : "Rename Goal"}
            </DialogTitle>
            <DialogDescription>
              Goals are named intentions attached to {activeHabit?.name}. They
              do not track progress independently.
            </DialogDescription>
          </DialogHeader>
          <div className="p-5">
            <Label htmlFor="goal-name">Goal name</Label>
            <Input
              id="goal-name"
              autoFocus
              className="mt-2 h-11"
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
            />
          </div>
          <DialogFooter className="mx-0 mb-0 rounded-none border-t bg-muted/30 p-4 sm:rounded-b-xl">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setGoalEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-11"
              disabled={!goalName.trim()}
              onClick={saveGoal}
            >
              {goalEditorMode === "add" ? "Add Goal" : "Save name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteGoalId)}
        onOpenChange={(open) => !open && setDeleteGoalId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deletingGoal?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The Habit and its tracking history will stay unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-11"
              onClick={() => {
                if (activeHabit && deleteGoalId)
                  changeHabit(activeHabit.id, (habit) => ({
                    ...habit,
                    goals: habit.goals.filter(
                      (goal) => goal.id !== deleteGoalId
                    ),
                  }))
                setDeleteGoalId(null)
                showSuccess(`${deletingGoal?.name ?? "Goal"} deleted`)
              }}
            >
              Delete Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteHabitOpen} onOpenChange={setDeleteHabitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{activeHabit?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the Habit, its attached Goals, and all
              Completion or Relapse history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus className="h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-11"
              onClick={() => {
                if (activeHabit)
                  setHabits((current) =>
                    current.filter((habit) => habit.id !== activeHabit.id)
                  )
                setDeleteHabitOpen(false)
                setDrawerOpen(false)
                showSuccess("Habit deleted")
              }}
            >
              Delete Habit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-center" offset={80} />

      <div className="fixed right-3 bottom-3 left-3 z-40 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl border bg-popover/95 p-2 shadow-lg backdrop-blur sm:right-5 sm:bottom-5 sm:left-auto">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Throwaway prototype
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11">
              <Leaf /> {scenario} <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Prototype states</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setPreset("populated")}>
              Populated Today
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setPreset("empty")}>
              Empty Today
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setPreset("build-only")}>
              Build only
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                failNextSave.current = true
                setScenario("Next save will fail")
                toast.warning("The next daily save will fail", {
                  duration: 2200,
                })
              }}
            >
              <AlertCircle /> Fail next daily save
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
