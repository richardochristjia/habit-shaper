import { describe, expect, it } from "vitest";
import { projectCurrentWeek } from "@/features/tracking/current-week";

describe("current Monday–Sunday Tracking Day strip", () => {
  it("projects Build Habit ineligible, Completion, Pending, and future states", () => {
    expect(
      projectCurrentWeek({
        type: "BUILD",
        startDate: "2025-05-07",
        today: "2025-05-08",
        recordedDays: ["2025-05-07"],
      }),
    ).toEqual([
      { trackingDay: "2025-05-05", state: "INELIGIBLE" },
      { trackingDay: "2025-05-06", state: "INELIGIBLE" },
      { trackingDay: "2025-05-07", state: "COMPLETION" },
      { trackingDay: "2025-05-08", state: "PENDING" },
      { trackingDay: "2025-05-09", state: "FUTURE" },
      { trackingDay: "2025-05-10", state: "FUTURE" },
      { trackingDay: "2025-05-11", state: "FUTURE" },
    ]);
  });

  it("distinguishes assessed Build Habit misses from Completions", () => {
    expect(
      projectCurrentWeek({
        type: "BUILD",
        startDate: "2025-05-01",
        today: "2025-05-11",
        recordedDays: ["2025-05-05", "2025-05-11"],
      }).map(({ state }) => state),
    ).toEqual([
      "COMPLETION",
      "MISSED",
      "MISSED",
      "MISSED",
      "MISSED",
      "MISSED",
      "COMPLETION",
    ]);
  });

  it("derives Clean Days for Break Habits and marks persisted Relapses", () => {
    expect(
      projectCurrentWeek({
        type: "BREAK",
        startDate: "2025-05-07",
        today: "2025-05-08",
        recordedDays: ["2025-05-08"],
      }).map(({ state }) => state),
    ).toEqual([
      "INELIGIBLE",
      "INELIGIBLE",
      "CLEAN",
      "RELAPSE",
      "FUTURE",
      "FUTURE",
      "FUTURE",
    ]);
  });
});
