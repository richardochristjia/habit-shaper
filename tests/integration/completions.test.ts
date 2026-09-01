import { HabitType, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  BuildHabitNotFoundError,
  CompletionValidationError,
  listBuildHabitProgress,
  setCompletion,
} from "@/features/completions/service";
import { createHabit, deleteHabit } from "@/features/habits/service";
import { resetTestDatabase } from "./database";

const fixtures = new PrismaClient();
const instant = new Date("2025-05-06T12:00:00.000Z");

async function createUser(id: string, timeZone = "UTC") {
  await fixtures.user.create({
    data: {
      id,
      email: `${id}@example.test`,
      name: `${id}@example.test`,
      timeZone,
    },
  });
}

describe.sequential("authenticated Completion service", () => {
  beforeEach(async () => {
    await resetTestDatabase(fixtures);
    await createUser("owner");
    await createUser("other-user");
  });

  afterAll(async () => {
    await resetTestDatabase(fixtures);
    await fixtures.$disconnect();
  });

  it("sets the desired Completion state idempotently and recalculates the Build Streak", async () => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    for (const trackingDay of ["2025-05-03", "2025-05-04", "2025-05-05"]) {
      await setCompletion(
        "owner",
        habit.id,
        { trackingDay, recorded: true },
        instant,
      );
      await setCompletion(
        "owner",
        habit.id,
        { trackingDay, recorded: true },
        instant,
      );
    }

    expect(await fixtures.completion.count()).toBe(3);
    expect(await listBuildHabitProgress("owner", instant)).toEqual([
      {
        habitId: habit.id,
        startDate: "2025-05-03",
        today: "2025-05-06",
        completionDays: ["2025-05-03", "2025-05-04", "2025-05-05"],
        buildStreak: 3,
        weeklySummary: {
          completed: 1,
          missed: 0,
          pending: 1,
          completionRate: 1,
        },
      },
    ]);

    await setCompletion(
      "owner",
      habit.id,
      { trackingDay: "2025-05-04", recorded: false },
      instant,
    );
    await setCompletion(
      "owner",
      habit.id,
      { trackingDay: "2025-05-04", recorded: false },
      instant,
    );

    expect(await fixtures.completion.count()).toBe(2);
    expect(
      (await listBuildHabitProgress("owner", instant))[0]?.buildStreak,
    ).toBe(1);
  });

  it.each([
    ["a malformed Tracking Day", "2025-5-04"],
    ["an impossible Tracking Day", "2025-02-30"],
    ["a Tracking Day before Habit creation", "2025-05-02"],
    ["a future Tracking Day", "2025-05-07"],
  ])("rejects %s", async (_label, trackingDay) => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    await expect(
      setCompletion(
        "owner",
        habit.id,
        { trackingDay, recorded: true },
        instant,
      ),
    ).rejects.toBeInstanceOf(CompletionValidationError);
    expect(await fixtures.completion.count()).toBe(0);
  });

  it("treats another User's Habit and a Break Habit as the same not-found outcome", async () => {
    const privateBuildHabit = await createHabit(
      "owner",
      { name: "Private", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    const breakHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    await expect(
      setCompletion(
        "other-user",
        privateBuildHabit.id,
        { trackingDay: "2025-05-05", recorded: true },
        instant,
      ),
    ).rejects.toBeInstanceOf(BuildHabitNotFoundError);
    await expect(
      setCompletion(
        "owner",
        breakHabit.id,
        { trackingDay: "2025-05-05", recorded: true },
        instant,
      ),
    ).rejects.toBeInstanceOf(BuildHabitNotFoundError);
    expect(await listBuildHabitProgress("other-user", instant)).toEqual([]);
    expect(await fixtures.completion.count()).toBe(0);
  });

  it("keeps Weekly Summaries User-scoped and reflects persisted historical corrections", async () => {
    const ownerHabit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-04T12:00:00.000Z"),
    );
    const otherHabit = await createHabit(
      "other-user",
      { name: "Exercise", type: HabitType.BUILD },
      new Date("2025-05-04T12:00:00.000Z"),
    );
    await setCompletion(
      "owner",
      ownerHabit.id,
      { trackingDay: "2025-05-05", recorded: true },
      instant,
    );
    await setCompletion(
      "other-user",
      otherHabit.id,
      { trackingDay: "2025-05-05", recorded: true },
      instant,
    );

    const ownerProgress = await listBuildHabitProgress("owner", instant);
    expect(ownerProgress).toHaveLength(1);
    expect(ownerProgress[0]).toMatchObject({
      habitId: ownerHabit.id,
      weeklySummary: {
        completed: 1,
        missed: 0,
        pending: 1,
        completionRate: 1,
      },
    });

    await setCompletion(
      "owner",
      ownerHabit.id,
      { trackingDay: "2025-05-05", recorded: false },
      instant,
    );

    expect(
      (await listBuildHabitProgress("owner", instant))[0]?.weeklySummary,
    ).toEqual({
      completed: 0,
      missed: 1,
      pending: 1,
      completionRate: 0,
    });
    expect(
      (await listBuildHabitProgress("other-user", instant))[0]?.weeklySummary,
    ).toEqual({
      completed: 1,
      missed: 0,
      pending: 1,
      completionRate: 1,
    });
  });

  it("persists one date-only Completion durably and lets MySQL reject duplicates and Break compatibility", async () => {
    const buildHabit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    const breakHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    await setCompletion(
      "owner",
      buildHabit.id,
      { trackingDay: "2025-05-05", recorded: true },
      instant,
    );

    await expect(
      fixtures.completion.create({
        data: {
          habitId: buildHabit.id,
          trackingDay: new Date("2025-05-05T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();
    await expect(
      fixtures.completion.create({
        data: {
          habitId: breakHabit.id,
          trackingDay: new Date("2025-05-05T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();

    const freshClient = new PrismaClient();
    try {
      const persisted = await freshClient.completion.findUniqueOrThrow({
        where: {
          habitId_trackingDay: {
            habitId: buildHabit.id,
            trackingDay: new Date("2025-05-05T00:00:00.000Z"),
          },
        },
      });
      expect(persisted.trackingDay.toISOString()).toBe(
        "2025-05-05T00:00:00.000Z",
      );
    } finally {
      await freshClient.$disconnect();
    }
  });

  it("cascades Completions when their Habit is deleted", async () => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    await setCompletion(
      "owner",
      habit.id,
      { trackingDay: "2025-05-05", recorded: true },
      instant,
    );

    await deleteHabit("owner", habit.id);

    expect(await fixtures.completion.count()).toBe(0);
  });
});
