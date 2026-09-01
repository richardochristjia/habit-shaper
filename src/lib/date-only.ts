const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIanaTimeZone(value: string): boolean {
  if (!value || value === "Etc/Unknown") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function trackingDayAt(instant: Date, timeZone: string): string {
  if (!isIanaTimeZone(timeZone)) throw new Error("Invalid IANA time zone");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function parseTrackingDay(value: string): Date {
  const match = DATE_ONLY.exec(value);
  if (!match) throw new Error("Tracking Day must use YYYY-MM-DD");
  const [, year, month, day] = match;
  const parsed = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  if (formatTrackingDay(parsed) !== value) {
    throw new Error("Tracking Day is not a valid calendar date");
  }
  return parsed;
}

export function formatTrackingDay(value: Date): string {
  return [
    value.getUTCFullYear().toString().padStart(4, "0"),
    (value.getUTCMonth() + 1).toString().padStart(2, "0"),
    value.getUTCDate().toString().padStart(2, "0"),
  ].join("-");
}
