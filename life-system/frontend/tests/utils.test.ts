import { describe, expect, it } from "vitest";

import { average, clamp, toPercent } from "../lib/utils";

describe("utility helpers", () => {
  it("clamps value within bounds", () => {
    expect(clamp(5, 1, 4)).toBe(4);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(7, 1, 10)).toBe(7);
  });

  it("converts decimals to percent", () => {
    expect(toPercent(0.845)).toBe(85);
  });

  it("averages values and rounds", () => {
    expect(average([80, 90, 100])).toBe(90);
    expect(average([1, 2])).toBe(2);
  });

  it("returns zero for empty average", () => {
    expect(average([])).toBe(0);
  });
});
