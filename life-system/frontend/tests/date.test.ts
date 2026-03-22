import { describe, expect, it } from "vitest";

import {
  formatWeekRangeLabel,
  getPreviousDay,
  getWeekRange,
  normalizeDate,
  parseDateKey,
  toDateKey,
} from "../lib/date";

describe("date helpers", () => {
  it("normalizes date to start of day", () => {
    const normalized = normalizeDate(new Date(2026, 2, 22, 18, 45, 13));

    expect(normalized.getHours()).toBe(0);
    expect(normalized.getMinutes()).toBe(0);
    expect(normalized.getSeconds()).toBe(0);
  });

  it("round-trips date key conversion", () => {
    const original = new Date(2026, 2, 22, 13, 20, 10);

    const key = toDateKey(original);
    const parsed = parseDateKey(key);

    expect(key).toBe("2026-03-22");
    expect(toDateKey(parsed)).toBe("2026-03-22");
  });

  it("returns Monday-to-Sunday week range", () => {
    const { weekStart, weekEnd } = getWeekRange(new Date(2026, 2, 22));

    expect(weekStart.getDay()).toBe(1);
    expect(weekEnd.getDay()).toBe(0);
  });

  it("computes previous day correctly", () => {
    const previous = getPreviousDay(new Date(2026, 2, 22));

    expect(toDateKey(previous)).toBe("2026-03-21");
  });

  it("formats week labels", () => {
    const label = formatWeekRangeLabel(new Date(2026, 2, 16), new Date(2026, 2, 22));

    expect(label).toBe("Mar 16 - Mar 22");
  });
});
