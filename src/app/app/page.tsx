import { listBuildHabitProgress } from "@/features/completions/service";
import { listGoals } from "@/features/goals/service";
import { listHabits } from "@/features/habits/service";
import { listBreakHabitProgress } from "@/features/relapses/service";
import { TodayWorkspace } from "@/features/tracking/today-workspace";
import { trackingDayAt } from "@/lib/date-only";
import { requireSession } from "@/lib/session";

export default async function ApplicationPage() {
  const session = await requireSession();
  const instant = new Date();
  const [habits, goals, buildProgress, breakProgress] = await Promise.all([
    listHabits(session.user.id),
    listGoals(session.user.id),
    listBuildHabitProgress(session.user.id, instant),
    listBreakHabitProgress(session.user.id, instant),
  ]);
  const today = trackingDayAt(instant, session.user.timeZone);

  return (
    <TodayWorkspace
      breakProgress={breakProgress}
      buildProgress={buildProgress}
      email={session.user.email}
      goals={goals}
      habits={habits}
      today={today}
    />
  );
}
