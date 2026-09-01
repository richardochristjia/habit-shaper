import "server-only";
import { randomUUID } from "node:crypto";
import prismaClientPackage, { type Prisma } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import {
  addTrackingDays,
  parseTrackingDay,
  trackingDayAt,
} from "../../lib/date-only.ts";
import { prisma } from "../../lib/prisma.ts";

const { HabitType } = prismaClientPackage;
type HabitTypeValue = (typeof HabitType)[keyof typeof HabitType];

export const DEMO_EMAIL = "demo@habit-shaper.local";
export const DEMO_PASSWORD = "habit-shaper-demo";

export type DemoDataResult = {
  userId: string;
  trackingDay: string;
  habitCount: number;
};

type DemoHabit = {
  name: string;
  type: HabitTypeValue;
  startOffset: number;
  goal: string;
  completionOffsets?: number[];
  relapseOffsets?: number[];
};

const demoHabits: DemoHabit[] = [
  {
    name: "Read for 20 minutes",
    type: HabitType.BUILD,
    startOffset: -6,
    goal: "Finish the current book",
    completionOffsets: [-3, -2, -1],
  },
  {
    name: "Morning walk",
    type: HabitType.BUILD,
    startOffset: -4,
    goal: "Get outside before work",
    completionOffsets: [-4, -2, 0],
  },
  {
    name: "Avoid sugary drinks",
    type: HabitType.BREAK,
    startOffset: -10,
    goal: "Choose water with lunch",
    relapseOffsets: [-4],
  },
  {
    name: "Stop late-night scrolling",
    type: HabitType.BREAK,
    startOffset: -7,
    goal: "Keep the phone outside the bedroom",
    relapseOffsets: [-7, 0],
  },
];

export async function disconnectDemoDataService(): Promise<void> {
  await prisma.$disconnect();
}

export async function seedDemoData(
  instant = new Date(),
): Promise<DemoDataResult> {
  const today = trackingDayAt(instant, "UTC");
  const password = await hashPassword(DEMO_PASSWORD);

  return prisma.$transaction(async (transaction) => {
    const existingDemoUser = await transaction.user.findUnique({
      where: { email: DEMO_EMAIL },
      select: { id: true },
    });
    if (existingDemoUser) {
      await transaction.user.delete({ where: { id: existingDemoUser.id } });
    }

    const user = await transaction.user.create({
      data: {
        id: `demo-${randomUUID()}`,
        email: DEMO_EMAIL,
        name: DEMO_EMAIL,
        timeZone: "UTC",
      },
      select: { id: true },
    });
    await transaction.account.create({
      data: {
        id: `demo-account-${randomUUID()}`,
        issuer: "local:credential",
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password,
      },
    });

    for (const habit of demoHabits) {
      await createDemoHabit(transaction, user.id, today, habit);
    }

    return {
      userId: user.id,
      trackingDay: today,
      habitCount: demoHabits.length,
    };
  });
}

async function createDemoHabit(
  transaction: Prisma.TransactionClient,
  userId: string,
  today: string,
  fixture: DemoHabit,
): Promise<void> {
  const habit = await transaction.habit.create({
    data: {
      userId,
      name: fixture.name,
      type: fixture.type,
      startDate: parseTrackingDay(addTrackingDays(today, fixture.startOffset)),
      goals: { create: { name: fixture.goal } },
    },
    select: { id: true },
  });

  if (fixture.completionOffsets) {
    await transaction.completion.createMany({
      data: fixture.completionOffsets.map((offset) => ({
        habitId: habit.id,
        trackingDay: parseTrackingDay(addTrackingDays(today, offset)),
      })),
    });
  }

  if (fixture.relapseOffsets) {
    await transaction.relapse.createMany({
      data: fixture.relapseOffsets.map((offset) => ({
        habitId: habit.id,
        trackingDay: parseTrackingDay(addTrackingDays(today, offset)),
      })),
    });
  }
}
