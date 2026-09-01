import { describe, expect, it } from "vitest";
import { calculateCleanStreak } from "@/features/relapses/clean-streak";

describe("Clean Streak", () => {
  it.each([
    {
      label: "returns zero when today has a Relapse",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-06",
        relapseDays: ["2025-05-06"],
      },
      expected: 0,
    },
    {
      label: "counts Clean Days after the latest earlier Relapse",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-06",
        relapseDays: ["2025-05-02", "2025-05-04"],
      },
      expected: 2,
    },
    {
      label: "counts every eligible day when there has been no Relapse",
      input: {
        startDate: "2025-05-03",
        today: "2025-05-06",
        relapseDays: [],
      },
      expected: 4,
    },
    {
      label: "counts the creation day at the creation boundary",
      input: {
        startDate: "2025-05-06",
        today: "2025-05-06",
        relapseDays: [],
      },
      expected: 1,
    },
    {
      label: "uses date-only arithmetic across a leap-day boundary",
      input: {
        startDate: "2024-02-28",
        today: "2024-03-01",
        relapseDays: ["2024-02-28"],
      },
      expected: 2,
    },
  ])("$label", ({ input, expected }) => {
    expect(calculateCleanStreak(input)).toBe(expected);
  });
});
