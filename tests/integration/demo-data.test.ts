import { HabitType, PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { seedDemoData } from "@/features/demo-data/service";
import { getAuth } from "@/lib/auth";
import { resetTestDatabase } from "./database";

const fixtures = new PrismaClient();
const instant = new Date("2025-05-10T15:30:00.000Z");

describe.sequential("optional demo data seed", () => {
  beforeEach(async () => {
    await resetTestDatabase(fixtures);
  });

  afterAll(async () => {
    await resetTestDatabase(fixtures);
    await fixtures.$disconnect();
  });

  it("recreates representative current demo data without duplicates or changes to another User", async () => {
    const reviewer = await fixtures.user.create({
      data: {
        id: "reviewer",
        email: "reviewer@example.test",
        name: "reviewer@example.test",
        timeZone: "Pacific/Auckland",
        habits: {
          create: {
            name: "Reviewer Habit",
            type: HabitType.BUILD,
            startDate: new Date("2025-01-01T00:00:00.000Z"),
            goals: { create: { name: "Reviewer Goal" } },
            completions: {
              create: { trackingDay: new Date("2025-01-02T00:00:00.000Z") },
            },
          },
        },
      },
      include: {
        habits: {
          include: { goals: true, completions: true, relapses: true },
        },
      },
    });

    await seedDemoData(instant);

    const firstDemo = await demoRecord();
    expect(firstDemo).toMatchObject({
      email: "demo@habit-shaper.local",
      name: "demo@habit-shaper.local",
      timeZone: "UTC",
      habits: [
        {
          name: "Avoid sugary drinks",
          type: HabitType.BREAK,
          startDate: new Date("2025-04-30T00:00:00.000Z"),
          goals: [{ name: "Choose water with lunch" }],
          completions: [],
          relapses: [{ trackingDay: new Date("2025-05-06T00:00:00.000Z") }],
        },
        {
          name: "Morning walk",
          type: HabitType.BUILD,
          startDate: new Date("2025-05-06T00:00:00.000Z"),
          goals: [{ name: "Get outside before work" }],
          completions: [
            { trackingDay: new Date("2025-05-06T00:00:00.000Z") },
            { trackingDay: new Date("2025-05-08T00:00:00.000Z") },
            { trackingDay: new Date("2025-05-10T00:00:00.000Z") },
          ],
          relapses: [],
        },
        {
          name: "Read for 20 minutes",
          type: HabitType.BUILD,
          startDate: new Date("2025-05-04T00:00:00.000Z"),
          goals: [{ name: "Finish the current book" }],
          completions: [
            { trackingDay: new Date("2025-05-07T00:00:00.000Z") },
            { trackingDay: new Date("2025-05-08T00:00:00.000Z") },
            { trackingDay: new Date("2025-05-09T00:00:00.000Z") },
          ],
          relapses: [],
        },
        {
          name: "Stop late-night scrolling",
          type: HabitType.BREAK,
          startDate: new Date("2025-05-03T00:00:00.000Z"),
          goals: [{ name: "Keep the phone outside the bedroom" }],
          completions: [],
          relapses: [
            { trackingDay: new Date("2025-05-03T00:00:00.000Z") },
            { trackingDay: new Date("2025-05-10T00:00:00.000Z") },
          ],
        },
      ],
    });

    await expect(
      getAuth().api.signInEmail({
        body: {
          email: "demo@habit-shaper.local",
          password: "habit-shaper-demo",
        },
      }),
    ).resolves.toMatchObject({
      user: { email: "demo@habit-shaper.local" },
    });

    await fixtures.habit.create({
      data: {
        userId: firstDemo.id,
        name: "Seed rerun must remove this",
        type: HabitType.BUILD,
        startDate: new Date("2025-05-10T00:00:00.000Z"),
      },
    });

    await seedDemoData(instant);

    const secondDemo = await demoRecord();
    expect(secondDemo.id).not.toBe(firstDemo.id);
    expect(demoContent(secondDemo)).toEqual(demoContent(firstDemo));
    expect(await fixtures.user.count()).toBe(2);
    expect(
      await fixtures.user.findUniqueOrThrow({
        where: { id: reviewer.id },
        include: {
          habits: {
            include: { goals: true, completions: true, relapses: true },
          },
        },
      }),
    ).toEqual(reviewer);
    await expect(
      getAuth().api.signInEmail({
        body: {
          email: "demo@habit-shaper.local",
          password: "habit-shaper-demo",
        },
      }),
    ).resolves.toMatchObject({
      user: { email: "demo@habit-shaper.local" },
    });
  });
});

async function demoRecord() {
  return fixtures.user.findUniqueOrThrow({
    where: { email: "demo@habit-shaper.local" },
    include: {
      habits: {
        orderBy: { name: "asc" },
        include: {
          goals: { orderBy: { name: "asc" } },
          completions: { orderBy: { trackingDay: "asc" } },
          relapses: { orderBy: { trackingDay: "asc" } },
        },
      },
    },
  });
}

function demoContent(demo: Awaited<ReturnType<typeof demoRecord>>) {
  return {
    email: demo.email,
    name: demo.name,
    timeZone: demo.timeZone,
    habits: demo.habits.map((habit) => ({
      name: habit.name,
      type: habit.type,
      startDate: habit.startDate,
      goals: habit.goals.map(({ name }) => ({ name })),
      completions: habit.completions.map(({ trackingDay }) => ({
        trackingDay,
      })),
      relapses: habit.relapses.map(({ trackingDay }) => ({ trackingDay })),
    })),
  };
}
