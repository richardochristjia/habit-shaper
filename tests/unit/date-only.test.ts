import { describe, expect, it } from "vitest";
import {
  formatTrackingDay,
  isIanaTimeZone,
  parseTrackingDay,
  trackingDayAt,
} from "@/lib/date-only";

describe("User Time Zone", () => {
  it.each([
    ["2025-03-09T07:30:00.000Z", "America/Los_Angeles", "2025-03-08"],
    ["2025-03-09T08:30:00.000Z", "America/Los_Angeles", "2025-03-09"],
    ["2025-11-02T05:30:00.000Z", "America/New_York", "2025-11-02"],
    ["2025-01-01T15:01:00.000Z", "Asia/Tokyo", "2025-01-02"],
  ])("maps %s to the Tracking Day in %s", (instant, timeZone, expected) => {
    expect(trackingDayAt(new Date(instant), timeZone)).toBe(expected);
  });

  it("validates IANA identifiers", () => {
    expect(isIanaTimeZone("Pacific/Auckland")).toBe(true);
    expect(isIanaTimeZone("Not/A_Time_Zone")).toBe(false);
    expect(isIanaTimeZone("")).toBe(false);
  });
});

describe("Tracking Day parsing", () => {
  it.each(["2024-02-29", "2025-12-31"])("round trips %s", (value) => {
    expect(formatTrackingDay(parseTrackingDay(value))).toBe(value);
  });

  it.each(["2025-2-03", "2025-02-30", "03-02-2025", ""])(
    "rejects %s",
    (value) => {
      expect(() => parseTrackingDay(value)).toThrow();
    },
  );
});
