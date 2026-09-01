import { HabitType, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createHabit, deleteHabit } from "@/features/habits/service";
import {
  BreakHabitNotFoundError,
  listBreakHabitProgress,
  RelapseValidationError,
  setRelapse,
} from "@/features/relapses/service";

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

describe.sequential("authenticated Relapse service", () => {
  beforeEach(async () => {
    await fixtures.user.deleteMany();
    await createUser("owner");
    await createUser("other-user");
  });

  afterAll(async () => {
    await fixtures.user.deleteMany();
    await fixtures.$disconnect();
  });

  it("sets the desired Relapse state idempotently and recalculates the Clean Streak", async () => {
    const habit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    for (const trackingDay of ["2025-05-03", "2025-05-04"]) {
      await setRelapse(
        "owner",
        habit.id,
        { trackingDay, recorded: true },
        instant,
      );
      await setRelapse(
        "owner",
        habit.id,
        { trackingDay, recorded: true },
        instant,
      );
    }

    expect(await fixtures.relapse.count()).toBe(2);
    expect(await listBreakHabitProgress("owner", instant)).toEqual([
      {
        habitId: habit.id,
        startDate: "2025-05-03",
        today: "2025-05-06",
        relapseDays: ["2025-05-03", "2025-05-04"],
        cleanStreak: 2,
      },
    ]);

    await setRelapse(
      "owner",
      habit.id,
      { trackingDay: "2025-05-06", recorded: true },
      instant,
    );
    expect(
      (await listBreakHabitProgress("owner", instant))[0]?.cleanStreak,
    ).toBe(0);

    await setRelapse(
      "owner",
      habit.id,
      { trackingDay: "2025-05-06", recorded: false },
      instant,
    );
    await setRelapse(
      "owner",
      habit.id,
      { trackingDay: "2025-05-06", recorded: false },
      instant,
    );
    expect(
      (await listBreakHabitProgress("owner", instant))[0]?.cleanStreak,
    ).toBe(2);

    await setRelapse(
      "owner",
      habit.id,
      { trackingDay: "2025-05-04", recorded: false },
      instant,
    );
    expect(
      (await listBreakHabitProgress("owner", instant))[0]?.cleanStreak,
    ).toBe(3);
  });

  it("derives Clean Days without storing daily records", async () => {
    const habit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    expect(await listBreakHabitProgress("owner", instant)).toEqual([
      {
        habitId: habit.id,
        startDate: "2025-05-03",
        today: "2025-05-06",
        relapseDays: [],
        cleanStreak: 4,
      },
    ]);
    expect(await fixtures.relapse.count()).toBe(0);
  });

  it.each([
    ["a malformed Tracking Day", "2025-5-04"],
    ["an impossible Tracking Day", "2025-02-30"],
    ["a Tracking Day before Habit creation", "2025-05-02"],
    ["a future Tracking Day", "2025-05-07"],
  ])("rejects %s", async (_label, trackingDay) => {
    const habit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    await expect(
      setRelapse("owner", habit.id, { trackingDay, recorded: true }, instant),
    ).rejects.toBeInstanceOf(RelapseValidationError);
    expect(await fixtures.relapse.count()).toBe(0);
  });

  it("treats another User's Habit and a Build Habit as the same not-found outcome", async () => {
    const privateBreakHabit = await createHabit(
      "owner",
      { name: "Private", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    const buildHabit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );

    await expect(
      setRelapse(
        "other-user",
        privateBreakHabit.id,
        { trackingDay: "2025-05-05", recorded: true },
        instant,
      ),
    ).rejects.toBeInstanceOf(BreakHabitNotFoundError);
    await expect(
      setRelapse(
        "owner",
        buildHabit.id,
        { trackingDay: "2025-05-05", recorded: true },
        instant,
      ),
    ).rejects.toBeInstanceOf(BreakHabitNotFoundError);
    expect(await listBreakHabitProgress("other-user", instant)).toEqual([]);
    expect(await fixtures.relapse.count()).toBe(0);
  });

  it("persists one date-only Relapse durably and lets MySQL reject duplicates and Build compatibility", async () => {
    const breakHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    const buildHabit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    await setRelapse(
      "owner",
      breakHabit.id,
      { trackingDay: "2025-05-05", recorded: true },
      instant,
    );

    await expect(
      fixtures.relapse.create({
        data: {
          habitId: breakHabit.id,
          trackingDay: new Date("2025-05-05T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();
    await expect(
      fixtures.relapse.create({
        data: {
          habitId: buildHabit.id,
          trackingDay: new Date("2025-05-05T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();
    await expect(
      fixtures.relapse.create({
        data: {
          habitId: breakHabit.id,
          habitType: HabitType.BUILD,
          trackingDay: new Date("2025-05-04T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();

    const freshClient = new PrismaClient();
    try {
      const persisted = await freshClient.relapse.findUniqueOrThrow({
        where: {
          habitId_trackingDay: {
            habitId: breakHabit.id,
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

  it("cascades Relapses when their Habit is deleted", async () => {
    const habit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-05-03T12:00:00.000Z"),
    );
    await setRelapse(
      "owner",
      habit.id,
      { trackingDay: "2025-05-05", recorded: true },
      instant,
    );

    await deleteHabit("owner", habit.id);

    expect(await fixtures.relapse.count()).toBe(0);
  });
});
