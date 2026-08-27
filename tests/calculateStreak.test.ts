import { describe, it, expect } from "vitest";
import { calculateStreak } from "../src/store/progress";
import type { DayRecord } from "../src/store/progress";

function dayRecord(date: string, completed = true): DayRecord {
  return { date, wordIds: [], grammarId: "lesson_1", completed, quizResults: [], accuracy: 0, durationSec: 0 };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("calculateStreak", () => {
  it("returns 0 with no records", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 0 when only non-completed days exist", () => {
    expect(calculateStreak([dayRecord(daysAgo(0), false), dayRecord(daysAgo(1), false)])).toBe(0);
  });

  it("counts a single completed day (today)", () => {
    expect(calculateStreak([dayRecord(daysAgo(0))])).toBe(1);
  });

  it("regression: counts a genuinely multi-day unbroken streak, not just 1 (was capped at 1 by a double-decrement bug)", () => {
    const records = Array.from({ length: 10 }, (_, i) => dayRecord(daysAgo(i)));
    expect(calculateStreak(records)).toBe(10);
  });

  it("stops counting at the first gap", () => {
    // today, yesterday completed; 2 days ago missing entirely; 3 days ago completed
    const records = [dayRecord(daysAgo(0)), dayRecord(daysAgo(1)), dayRecord(daysAgo(3))];
    expect(calculateStreak(records)).toBe(2);
  });

  it("stops counting at the first non-completed day", () => {
    const records = [dayRecord(daysAgo(0)), dayRecord(daysAgo(1)), dayRecord(daysAgo(2), false), dayRecord(daysAgo(3))];
    expect(calculateStreak(records)).toBe(2);
  });

  it("is 0 if today isn't completed, even with a long run ending yesterday", () => {
    const records = Array.from({ length: 10 }, (_, i) => dayRecord(daysAgo(i + 1)));
    expect(calculateStreak(records)).toBe(0);
  });

  it("doesn't care about record order in the input array", () => {
    const records = Array.from({ length: 5 }, (_, i) => dayRecord(daysAgo(i))).reverse();
    expect(calculateStreak(records)).toBe(5);
  });
});
