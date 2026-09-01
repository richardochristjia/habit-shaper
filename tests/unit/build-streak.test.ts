import { describe, expect, it } from "vitest";
import { calculateBuildStreak } from "@/features/completions/build-streak";

describe("Build Streak", () => {
  it.each([
    {
      label: "anchors on today when today is complete",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-06",
        completionDays: ["2025-05-04", "2025-05-05", "2025-05-06"],
      },
      expected: 3,
    },
    {
      label: "keeps an unfinished today pending and anchors on yesterday",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-06",
        completionDays: ["2025-05-03", "2025-05-04", "2025-05-05"],
      },
      expected: 3,
    },
    {
      label: "returns zero when yesterday is missing and today is pending",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-06",
        completionDays: ["2025-05-03", "2025-05-04"],
      },
      expected: 0,
    },
    {
      label: "stops at the Habit creation boundary",
      input: {
        startDate: "2025-05-03",
        today: "2025-05-06",
        completionDays: ["2025-05-03", "2025-05-04", "2025-05-05"],
      },
      expected: 3,
    },
  ])("$label", ({ input, expected }) => {
    expect(calculateBuildStreak(input)).toBe(expected);
  });
});
