import { HabitType, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { listBuildHabitProgress } from "@/features/completions/service";
import {
  createGoal,
  deleteGoal,
  GoalNotFoundError,
  GoalValidationError,
  getGoal,
  listGoals,
  renameGoal,
} from "@/features/goals/service";
import { createHabit, deleteHabit } from "@/features/habits/service";
import { listBreakHabitProgress } from "@/features/relapses/service";
import { resetTestDatabase } from "./database";

const fixtures = new PrismaClient();

async function createUser(id: string) {
  await fixtures.user.create({
    data: {
      id,
      email: `${id}@example.test`,
      name: `${id}@example.test`,
      timeZone: "UTC",
    },
  });
}

describe.sequential("authenticated Goal service", () => {
  beforeEach(async () => {
    await resetTestDatabase(fixtures);
    await createUser("owner");
    await createUser("other-user");
  });

  afterAll(async () => {
    await resetTestDatabase(fixtures);
    await fixtures.$disconnect();
  });

  it("creates trimmed Goals for owned Build and Break Habits and accepts duplicate names", async () => {
    const instant = new Date("2025-05-01T12:00:00.000Z");
    const build = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      instant,
    );
    const breakHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      instant,
    );

    const first = await createGoal("owner", build.id, {
      name: "  Feel calm  ",
    });
    const duplicate = await createGoal("owner", breakHabit.id, {
      name: "Feel calm",
    });

    expect(first).toMatchObject({ habitId: build.id, name: "Feel calm" });
    expect(duplicate).toMatchObject({
      habitId: breakHabit.id,
      name: "Feel calm",
    });
    expect(
      (await listGoals("owner")).map(({ habitId, name }) => ({
        habitId,
        name,
      })),
    ).toEqual([
      { habitId: build.id, name: "Feel calm" },
      { habitId: breakHabit.id, name: "Feel calm" },
    ]);
  });

  it("lists duplicate Goal names on the same Habit in stable creation order", async () => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-01T12:00:00.000Z"),
    );

    const first = await createGoal("owner", habit.id, { name: "Read calmly" });
    const duplicate = await createGoal("owner", habit.id, {
      name: "Read calmly",
    });

    expect(await listGoals("owner")).toEqual([first, duplicate]);
  });

  it.each([
    ["an empty name", "   "],
    ["a name over 120 characters", "x".repeat(121)],
  ])("rejects %s", async (_label, name) => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-01T12:00:00.000Z"),
    );

    await expect(
      createGoal("owner", habit.id, { name }),
    ).rejects.toBeInstanceOf(GoalValidationError);
  });

  it("renames only a Goal's name and preserves its fixed Habit attachment in durable MySQL state", async () => {
    const instant = new Date("2025-05-01T12:00:00.000Z");
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      instant,
    );
    const otherHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      instant,
    );
    const goal = await createGoal("owner", habit.id, { name: "Read more" });
    await fixtures.completion.create({
      data: {
        habitId: habit.id,
        trackingDay: new Date("2025-05-01T00:00:00.000Z"),
      },
    });

    const reassignmentShapedInput = {
      name: "  Read every evening  ",
      habitId: otherHabit.id,
    };
    const renamed = await renameGoal("owner", goal.id, reassignmentShapedInput);

    expect(renamed).toEqual({
      ...goal,
      name: "Read every evening",
    });
    const freshClient = new PrismaClient();
    try {
      const persisted = await freshClient.goal.findUniqueOrThrow({
        where: { id: goal.id },
        include: { habit: { include: { completions: true } } },
      });
      expect(persisted.habitId).toBe(habit.id);
      expect(persisted.habit.completions).toHaveLength(1);
    } finally {
      await freshClient.$disconnect();
    }
  });

  it("deletes only Goals and leaves their Habits, tracking history, and derived progress unchanged", async () => {
    const instant = new Date("2025-05-01T12:00:00.000Z");
    const build = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      instant,
    );
    const breakHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      instant,
    );
    const buildGoal = await createGoal("owner", build.id, {
      name: "Read more",
    });
    const breakGoal = await createGoal("owner", breakHabit.id, {
      name: "Breathe freely",
    });
    await fixtures.completion.create({
      data: {
        habitId: build.id,
        trackingDay: new Date("2025-05-01T00:00:00.000Z"),
      },
    });
    await fixtures.relapse.create({
      data: {
        habitId: breakHabit.id,
        trackingDay: new Date("2025-05-01T00:00:00.000Z"),
      },
    });
    const buildProgress = await listBuildHabitProgress("owner", instant);
    const breakProgress = await listBreakHabitProgress("owner", instant);

    await deleteGoal("owner", buildGoal.id);
    await deleteGoal("owner", breakGoal.id);

    expect(await listGoals("owner")).toEqual([]);
    expect(
      await fixtures.habit.count({
        where: { id: { in: [build.id, breakHabit.id] } },
      }),
    ).toBe(2);
    expect(
      await fixtures.completion.count({ where: { habitId: build.id } }),
    ).toBe(1);
    expect(
      await fixtures.relapse.count({ where: { habitId: breakHabit.id } }),
    ).toBe(1);
    expect(await listBuildHabitProgress("owner", instant)).toEqual(
      buildProgress,
    );
    expect(await listBreakHabitProgress("owner", instant)).toEqual(
      breakProgress,
    );
  });

  it("treats cross-User reads and mutations as not found without changing the Goal", async () => {
    const instant = new Date("2025-05-01T12:00:00.000Z");
    const privateHabit = await createHabit(
      "owner",
      { name: "Private", type: HabitType.BREAK },
      instant,
    );
    const privateGoal = await createGoal("owner", privateHabit.id, {
      name: "Private intention",
    });
    expect(await listGoals("other-user")).toEqual([]);
    await expect(getGoal("other-user", privateGoal.id)).rejects.toBeInstanceOf(
      GoalNotFoundError,
    );
    await expect(
      createGoal("other-user", privateHabit.id, { name: "Disclosed" }),
    ).rejects.toBeInstanceOf(GoalNotFoundError);
    await expect(
      renameGoal("other-user", privateGoal.id, { name: "Disclosed" }),
    ).rejects.toBeInstanceOf(GoalNotFoundError);
    await expect(
      deleteGoal("other-user", privateGoal.id),
    ).rejects.toBeInstanceOf(GoalNotFoundError);
    expect(await getGoal("owner", privateGoal.id)).toEqual(privateGoal);
  });

  it("cascades Goals when their Habit is deleted", async () => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-01T12:00:00.000Z"),
    );
    await createGoal("owner", habit.id, { name: "Read more" });

    await deleteHabit("owner", habit.id);

    expect(await listGoals("owner")).toEqual([]);
  });
});
