import {
  addDays,
  endOfWeek,
  format,
  isSameDay,
  parse,
  startOfDay,
  startOfWeek,
} from "date-fns";

export function normalizeDate(date = new Date()) {
  return startOfDay(date);
}

export function toDateKey(date: Date) {
  return format(normalizeDate(date), "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string) {
  return normalizeDate(parse(dateKey, "yyyy-MM-dd", new Date()));
}

export function formatLongDate(date: Date) {
  return format(date, "EEEE, MMMM d");
}

export function formatHistoryDate(date: Date) {
  return format(date, "EEE, MMM d");
}

export function formatWeekRangeLabel(start: Date, end: Date) {
  return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
}

export function getWeekRange(date = new Date()) {
  const weekStart = startOfWeek(normalizeDate(date), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(normalizeDate(date), { weekStartsOn: 1 });

  return {
    weekStart,
    weekEnd,
  };
}

export function getPreviousDay(date: Date) {
  return normalizeDate(addDays(date, -1));
}

export function isToday(date: Date) {
  return isSameDay(normalizeDate(date), normalizeDate());
}
