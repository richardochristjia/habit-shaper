import { HabitType, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { listGoals } from "@/features/goals/service";
import {
  createHabit,
  deleteHabit,
  HabitNotFoundError,
  HabitValidationError,
  listHabits,
  renameHabit,
} from "@/features/habits/service";
import { resetTestDatabase } from "./database";

const fixtures = new PrismaClient();

async function createUser(id: string, timeZone: string) {
  await fixtures.user.create({
    data: {
      id,
      email: `${id}@example.test`,
      name: `${id}@example.test`,
      timeZone,
    },
  });
}

describe.sequential("authenticated Habit service", () => {
  beforeEach(async () => {
    await resetTestDatabase(fixtures);
    await createUser("owner", "Pacific/Auckland");
    await createUser("other-user", "America/Los_Angeles");
  });

  afterAll(async () => {
    await resetTestDatabase(fixtures);
    await fixtures.$disconnect();
  });

  it("creates trimmed Build and Break Habits for today's User Time Zone and accepts duplicate names", async () => {
    const instant = new Date("2025-01-01T11:30:00.000Z");

    const build = await createHabit(
      "owner",
      { name: "  Read  ", type: HabitType.BUILD, goals: ["   "] },
      instant,
    );
    const duplicateBreak = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BREAK },
      instant,
    );

    expect(build).toMatchObject({
      name: "Read",
      type: HabitType.BUILD,
      startDate: "2025-01-02",
    });
    expect(duplicateBreak).toMatchObject({
      name: "Read",
      type: HabitType.BREAK,
      startDate: "2025-01-02",
    });
    expect(
      (await listHabits("owner")).map(({ name, type }) => ({ name, type })),
    ).toEqual([
      { name: "Read", type: HabitType.BUILD },
      { name: "Read", type: HabitType.BREAK },
    ]);
    expect(await listGoals("owner")).toEqual([]);
  });

  it("creates one or several initial Goals, including duplicate names, in durable state", async () => {
    const instant = new Date("2025-01-01T11:30:00.000Z");

    const build = await createHabit(
      "owner",
      {
        name: "Read",
        type: HabitType.BUILD,
        goals: ["  Finish a chapter  "],
      },
      instant,
    );
    const breakHabit = await createHabit(
      "owner",
      {
        name: "No late snacks",
        type: HabitType.BREAK,
        goals: ["Sleep comfortably", "Sleep comfortably", "Wake refreshed"],
      },
      instant,
    );

    expect(
      (await listGoals("owner")).map(({ habitId, name }) => ({
        habitId,
        name,
      })),
    ).toEqual([
      { habitId: build.id, name: "Finish a chapter" },
      { habitId: breakHabit.id, name: "Sleep comfortably" },
      { habitId: breakHabit.id, name: "Sleep comfortably" },
      { habitId: breakHabit.id, name: "Wake refreshed" },
    ]);

    const freshClient = new PrismaClient();
    try {
      const persisted = await freshClient.habit.findMany({
        where: { id: { in: [build.id, breakHabit.id] } },
        include: { goals: true },
        orderBy: { createdAt: "asc" },
      });
      expect(persisted.map((habit) => habit.goals.length)).toEqual([1, 3]);
    } finally {
      await freshClient.$disconnect();
    }
  });

  it("creates neither the Habit nor initial Goals when any initial Goal is invalid", async () => {
    await expect(
      createHabit("owner", {
        name: "Read",
        type: HabitType.BUILD,
        goals: ["Finish a chapter", "x".repeat(121)],
      }),
    ).rejects.toBeInstanceOf(HabitValidationError);

    expect(await listHabits("owner")).toEqual([]);
    expect(await listGoals("owner")).toEqual([]);
  });

  it("rolls back the Habit when an initial Goal database write fails", async () => {
    await fixtures.$executeRawUnsafe(`
      ALTER TABLE Goal
      ADD CONSTRAINT reject_initial_goal CHECK (name <> 'Rejected by database')
    `);

    try {
      await expect(
        createHabit("owner", {
          name: "Read",
          type: HabitType.BUILD,
          goals: ["Rejected by database"],
        }),
      ).rejects.toThrow();
    } finally {
      await fixtures.$executeRawUnsafe(
        "ALTER TABLE Goal DROP CHECK reject_initial_goal",
      );
    }

    expect(await listHabits("owner")).toEqual([]);
    expect(await listGoals("owner")).toEqual([]);
  });

  it("ignores client attempts to choose ownership or a start date for a Habit and its initial Goals", async () => {
    const untrustedInput = {
      name: "Walk",
      type: HabitType.BUILD,
      goals: ["  Spend time outside  "],
      userId: "other-user",
      startDate: "1999-01-01",
    };

    const habit = await createHabit(
      "owner",
      untrustedInput,
      new Date("2025-06-10T02:00:00.000Z"),
    );

    expect(habit.startDate).toBe("2025-06-10");
    expect(await listHabits("other-user")).toEqual([]);
    expect(await listGoals("other-user")).toEqual([]);
    expect((await listHabits("owner")).map(({ id }) => id)).toEqual([habit.id]);
    expect(await listGoals("owner")).toEqual([
      expect.objectContaining({
        habitId: habit.id,
        name: "Spend time outside",
      }),
    ]);
  });

  it.each([
    ["an empty name", { name: "   ", type: HabitType.BUILD }],
    [
      "a name over 120 characters",
      { name: "x".repeat(121), type: HabitType.BUILD },
    ],
    ["an unknown type", { name: "Read", type: "OTHER" }],
  ])("rejects %s", async (_label, input) => {
    await expect(
      createHabit("owner", input, new Date()),
    ).rejects.toBeInstanceOf(HabitValidationError);
  });

  it("renames a Habit while preserving identity, type, start date, and history in durable MySQL state", async () => {
    const habit = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-02-03T12:00:00.000Z"),
    );
    await fixtures.completion.create({
      data: {
        habitId: habit.id,
        trackingDay: new Date("2025-02-03T00:00:00.000Z"),
      },
    });

    const untrustedRename = {
      name: "  Read ten pages  ",
      type: HabitType.BREAK,
      startDate: "1999-01-01",
    };
    const renamed = await renameHabit("owner", habit.id, untrustedRename);

    expect(renamed).toEqual({
      ...habit,
      name: "Read ten pages",
    });

    const freshClient = new PrismaClient();
    try {
      const persisted = await freshClient.habit.findUniqueOrThrow({
        where: { id: habit.id },
        include: { completions: true },
      });
      expect(persisted).toMatchObject({
        id: habit.id,
        name: "Read ten pages",
        type: HabitType.BUILD,
      });
      expect(persisted.startDate.toISOString().slice(0, 10)).toBe(
        habit.startDate,
      );
      expect(persisted.completions).toHaveLength(1);
    } finally {
      await freshClient.$disconnect();
    }
  });

  it("keeps reads and mutations private and treats another User's Habit as not found", async () => {
    const privateHabit = await createHabit(
      "owner",
      { name: "Private", type: HabitType.BREAK },
      new Date("2025-03-01T12:00:00.000Z"),
    );

    expect(await listHabits("other-user")).toEqual([]);
    await expect(
      renameHabit("other-user", privateHabit.id, { name: "Disclosed" }),
    ).rejects.toBeInstanceOf(HabitNotFoundError);
    await expect(
      deleteHabit("other-user", privateHabit.id),
    ).rejects.toBeInstanceOf(HabitNotFoundError);
    expect((await listHabits("owner"))[0]?.name).toBe("Private");
  });

  it("deletes linked Goals, Completions, and Relapses through database cascades", async () => {
    const build = await createHabit(
      "owner",
      { name: "Read", type: HabitType.BUILD },
      new Date("2025-04-01T12:00:00.000Z"),
    );
    const breakHabit = await createHabit(
      "owner",
      { name: "No smoking", type: HabitType.BREAK },
      new Date("2025-04-01T12:00:00.000Z"),
    );
    await fixtures.goal.createMany({
      data: [
        { habitId: build.id, name: "Finish a chapter" },
        { habitId: breakHabit.id, name: "Breathe freely" },
      ],
    });
    await fixtures.completion.create({
      data: {
        habitId: build.id,
        trackingDay: new Date("2025-04-01T00:00:00.000Z"),
      },
    });
    await fixtures.relapse.create({
      data: {
        habitId: breakHabit.id,
        trackingDay: new Date("2025-04-01T00:00:00.000Z"),
      },
    });

    await deleteHabit("owner", build.id);
    await deleteHabit("owner", breakHabit.id);

    expect(await fixtures.goal.count()).toBe(0);
    expect(await fixtures.completion.count()).toBe(0);
    expect(await fixtures.relapse.count()).toBe(0);
  });
});
