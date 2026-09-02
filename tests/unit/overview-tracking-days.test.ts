import { describe, expect, it } from "vitest";
import { projectEligibleTrackingDays } from "@/features/tracking/overview-tracking-days";

describe("Habit Overview Tracking Days", () => {
  it("projects every eligible Build Habit day in ascending order", () => {
    expect(
      projectEligibleTrackingDays({
        type: "BUILD",
        startDate: "2025-05-07",
        today: "2025-05-10",
        recordedDays: ["2025-05-08"],
      }),
    ).toEqual([
      { trackingDay: "2025-05-07", state: "MISSED" },
      { trackingDay: "2025-05-08", state: "COMPLETION" },
      { trackingDay: "2025-05-09", state: "MISSED" },
      { trackingDay: "2025-05-10", state: "PENDING" },
    ]);
  });

  it("derives Clean Days and Relapses only across the eligible Break Habit interval", () => {
    expect(
      projectEligibleTrackingDays({
        type: "BREAK",
        startDate: "2025-05-07",
        today: "2025-05-09",
        recordedDays: ["2025-05-08"],
      }),
    ).toEqual([
      { trackingDay: "2025-05-07", state: "CLEAN" },
      { trackingDay: "2025-05-08", state: "RELAPSE" },
      { trackingDay: "2025-05-09", state: "CLEAN" },
    ]);
  });

  it("excludes dates before creation and after today", () => {
    expect(
      projectEligibleTrackingDays({
        type: "BUILD",
        startDate: "2025-05-07",
        today: "2025-05-08",
        recordedDays: ["2025-05-06", "2025-05-09"],
      }).map(({ trackingDay }) => trackingDay),
    ).toEqual(["2025-05-07", "2025-05-08"]);
  });
});
