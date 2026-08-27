import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MiniRead from "../src/pages/MiniRead";
import { getTodayKey } from "../src/lib/dates";
import { saveDayRecord, getAllAnswerLogs } from "../src/store/progress";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

async function seedToday() {
  const today = getTodayKey();
  await saveDayRecord({
    date: today,
    wordIds: ["huge"], // matches passage_1's targetWords
    grammarId: "lesson_1",
    completed: false,
    quizResults: [],
    accuracy: 0,
    durationSec: 0,
  });
}

describe("MiniRead logging", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("logs a correct read_answer with the passage/question itemId", async () => {
    await seedToday();

    render(
      <MemoryRouter>
        <MiniRead />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/how big is tom's dog/i));
    fireEvent.click(screen.getByText("huge"));

    await waitFor(async () => {
      const logs = await getAllAnswerLogs();
      expect(
        logs.some((l) => l.itemId === "passage_1_q0" && l.qType === "read_answer" && l.correct)
      ).toBe(true);
    });
  });

  it("logs a wrong read_answer when the wrong option is tapped", async () => {
    await seedToday();

    render(
      <MemoryRouter>
        <MiniRead />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/how big is tom's dog/i));
    fireEvent.click(screen.getByText("tiny"));

    await waitFor(async () => {
      const logs = await getAllAnswerLogs();
      expect(
        logs.some((l) => l.itemId === "passage_1_q0" && l.qType === "read_answer" && !l.correct)
      ).toBe(true);
    });
  });

  it("regression: does not highlight the correct option after a wrong tap — it says 'Try again!' while simultaneously giving away the answer", async () => {
    await seedToday();

    render(
      <MemoryRouter>
        <MiniRead />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/how big is tom's dog/i));
    fireEvent.click(screen.getByText("tiny")); // wrong; correct answer is "huge"

    await waitFor(() => screen.getByText(/listen to the relevant part|try again/i));

    const correctOptionButton = screen.getByText("huge").closest("button")!;
    expect(correctOptionButton.className).not.toMatch(/green/);
  });
});
