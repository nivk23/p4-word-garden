import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../src/pages/Home";
import { saveDayRecord } from "../src/store/progress";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

describe("Home streak (regression: was capped at 30 days by reading individual dates)", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("counts a streak longer than 30 consecutive days, not just the last 30", async () => {
    // 40 consecutive completed days, ending today (calculateStreak counts
    // the *current* unbroken streak, which must include today), via
    // getAllDayRecords rather than 30 individual date reads.
    for (let i = 0; i < 40; i++) {
      await saveDayRecord({
        date: daysAgo(i),
        wordIds: ["huge"],
        grammarId: "lesson_1",
        completed: true,
        quizResults: [],
        accuracy: 100,
        durationSec: 60,
      });
    }

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("40")).toBeTruthy());
  });

  it("shows 0 for a brand new profile with no day records", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("0")).toBeTruthy());
  });
});
