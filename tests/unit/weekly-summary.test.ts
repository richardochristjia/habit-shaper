import { describe, expect, it } from "vitest";
import { calculateWeeklySummary } from "@/features/completions/weekly-summary";

describe("Weekly Summary", () => {
  it.each([
    {
      label: "starts the current week on Monday",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-05",
        completionDays: ["2025-05-05"],
      },
      expected: {
        completed: 1,
        missed: 0,
        pending: 0,
        completionRate: 1,
      },
    },
    {
      label: "ends the current week on Sunday and excludes the prior Sunday",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-11",
        completionDays: [
          "2025-05-04",
          "2025-05-05",
          "2025-05-10",
          "2025-05-11",
        ],
      },
      expected: {
        completed: 3,
        missed: 4,
        pending: 0,
        completionRate: 3 / 7,
      },
    },
    {
      label:
        "assesses only elapsed days in a partial week and keeps today pending",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-08",
        completionDays: ["2025-05-05", "2025-05-07"],
      },
      expected: {
        completed: 2,
        missed: 1,
        pending: 1,
        completionRate: 2 / 3,
      },
    },
    {
      label: "excludes days before a midweek Habit creation and future days",
      input: {
        startDate: "2025-05-07",
        today: "2025-05-11",
        completionDays: [
          "2025-05-05",
          "2025-05-07",
          "2025-05-09",
          "2025-05-12",
        ],
      },
      expected: {
        completed: 2,
        missed: 2,
        pending: 1,
        completionRate: 0.5,
      },
    },
    {
      label: "assesses today when today is completed",
      input: {
        startDate: "2025-05-01",
        today: "2025-05-08",
        completionDays: ["2025-05-05", "2025-05-08"],
      },
      expected: {
        completed: 2,
        missed: 2,
        pending: 0,
        completionRate: 0.5,
      },
    },
    {
      label: "has no assessed days when a Habit starts today unfinished",
      input: {
        startDate: "2025-05-08",
        today: "2025-05-08",
        completionDays: [],
      },
      expected: {
        completed: 0,
        missed: 0,
        pending: 1,
        completionRate: null,
      },
    },
  ])("$label", ({ input, expected }) => {
    expect(calculateWeeklySummary(input)).toEqual(expected);
  });
});
