import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "../src/pages/Home";
import { saveDayRecord } from "../src/store/progress";
import { getTodayKey } from "../src/lib/dates";

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

describe("Home in-progress day (regression: 'Start today' re-running Learn Words would overwrite today's word selection)", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("offers 'Continue today' (not 'Start today') when today's DayRecord exists but isn't completed yet", async () => {
    await saveDayRecord({
      date: getTodayKey(),
      wordIds: ["huge"],
      grammarId: "lesson_1",
      completed: false,
      quizResults: [],
      accuracy: 0,
      durationSec: 0,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spell-it" element={<div>SPELL IT PAGE</div>} />
          <Route path="/learn-words" element={<div>LEARN WORDS PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    const continueBtn = await screen.findByRole("button", { name: /continue today/i });
    expect(screen.queryByRole("button", { name: /^start today$/i })).toBeNull();

    // Continuing must land on /spell-it, not re-run Learn Words (which
    // would pick a new set of words and overwrite today's DayRecord).
    fireEvent.click(continueBtn);
    await waitFor(() => screen.getByText("SPELL IT PAGE"));
  });

  it("still offers 'Start today' → /learn-words when there is no DayRecord for today at all", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn-words" element={<div>LEARN WORDS PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    const startBtn = await screen.findByRole("button", { name: /^start today$/i });
    fireEvent.click(startBtn);
    await waitFor(() => screen.getByText("LEARN WORDS PAGE"));
  });
});
