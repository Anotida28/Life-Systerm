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
  it("normalizes dates to the current Harare day key", () => {
    const normalized = normalizeDate(new Date("2026-03-22T18:45:13+02:00"));

    expect(toDateKey(normalized)).toBe("2026-03-22");
  });

  it("round-trips date key conversion", () => {
    const original = new Date("2026-03-22T13:20:10+02:00");

    const key = toDateKey(original);
    const parsed = parseDateKey(key);

    expect(key).toBe("2026-03-22");
    expect(toDateKey(parsed)).toBe("2026-03-22");
  });

  it("returns Monday-to-Sunday week range", () => {
    const { weekStart, weekEnd } = getWeekRange(new Date("2026-03-22T12:00:00+02:00"));

    expect(toDateKey(weekStart)).toBe("2026-03-16");
    expect(toDateKey(weekEnd)).toBe("2026-03-22");
  });

  it("computes previous day correctly", () => {
    const previous = getPreviousDay(new Date("2026-03-22T12:00:00+02:00"));

    expect(toDateKey(previous)).toBe("2026-03-21");
  });

  it("formats week labels", () => {
    const label = formatWeekRangeLabel(new Date(2026, 2, 16), new Date(2026, 2, 22));

    expect(label).toBe("Mar 16 - Mar 22");
  });
});
