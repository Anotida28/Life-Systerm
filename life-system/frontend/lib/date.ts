import { APP_TIME_ZONE } from "./constants";

const HARARE_OFFSET_MINUTES = 120;

function getTimeZoneParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) {
    throw new Error("Failed to derive Harare date parts");
  }

  return { year, month, day };
}

function parseDateKeyParts(dateKey: string) {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-").map(Number);

  if (!yearRaw || !monthRaw || !dayRaw) {
    throw new Error("Invalid date key format");
  }

  return {
    year: yearRaw,
    month: monthRaw,
    day: dayRaw,
  };
}

function shiftDateKey(dateKey: string, days: number) {
  const { year, month, day } = parseDateKeyParts(dateKey);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  utcNoon.setUTCDate(utcNoon.getUTCDate() + days);

  return `${utcNoon.getUTCFullYear()}-${String(utcNoon.getUTCMonth() + 1).padStart(2, "0")}-${String(
    utcNoon.getUTCDate(),
  ).padStart(2, "0")}`;
}

function getWeekdayIndex(dateKey: string) {
  const { year, month, day } = parseDateKeyParts(dateKey);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = utcNoon.getUTCDay();
  return (weekday + 6) % 7;
}

function formatInTimeZone(
  date: Date,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).format(date);
}

export function normalizeDate(date = new Date()) {
  return parseDateKey(toDateKey(date));
}

export function toDateKey(date: Date) {
  const { year, month, day } = getTimeZoneParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateKey(dateKey: string) {
  const { year, month, day } = parseDateKeyParts(dateKey);
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return new Date(utcMs - HARARE_OFFSET_MINUTES * 60 * 1000);
}

export function formatLongDate(date: Date) {
  return formatInTimeZone(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatHistoryDate(date: Date) {
  return formatInTimeZone(date, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatWeekRangeLabel(start: Date, end: Date) {
  const startLabel = formatInTimeZone(start, { month: "short", day: "numeric" });
  const endLabel = formatInTimeZone(end, { month: "short", day: "numeric" });
  return `${startLabel} - ${endLabel}`;
}

export function getWeekRange(referenceDate = new Date()) {
  const dateKey = toDateKey(referenceDate);
  const mondayKey = shiftDateKey(dateKey, -getWeekdayIndex(dateKey));
  const sundayKey = shiftDateKey(mondayKey, 6);

  return {
    weekStart: parseDateKey(mondayKey),
    weekEnd: parseDateKey(sundayKey),
  };
}

export function getPreviousDay(date: Date) {
  return parseDateKey(shiftDateKey(toDateKey(date), -1));
}

export function isToday(date: Date) {
  return toDateKey(date) === toDateKey(new Date());
}
