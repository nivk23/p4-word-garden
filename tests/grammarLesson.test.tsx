import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GrammarLesson from "../src/pages/GrammarLesson";
import { getTodayKey } from "../src/lib/dates";
import { saveDayRecord, getSchedulerItems } from "../src/store/progress";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

async function seedDay(grammarId: string) {
  const today = getTodayKey();
  await saveDayRecord({
    date: today,
    wordIds: ["huge"],
    grammarId,
    completed: false,
    quizResults: [],
    accuracy: 0,
    durationSec: 0,
  });
}

describe("GrammarLesson practice scoring", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("tapping the correct word in a tap-the-noun sentence marks it correct (was previously unimplemented — no tappable words at all)", async () => {
    await seedDay("lesson_1"); // "My friend plays in the park." -> correctAnswer: "friend"

    render(
      <MemoryRouter>
        <GrammarLesson />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/my friend plays in the park/i));

    fireEvent.click(screen.getByRole("button", { name: "friend" }));

    await waitFor(() => screen.getByText("Correct!"));

    const items = await getSchedulerItems();
    const grammarItem = items.find((i) => i.itemId === "lesson_1");
    expect(grammarItem?.streak).toBeGreaterThan(0);
  });

  it("tapping the wrong word in a tap-the-noun sentence marks it wrong", async () => {
    await seedDay("lesson_1");

    render(
      <MemoryRouter>
        <GrammarLesson />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/my friend plays in the park/i));

    fireEvent.click(screen.getByRole("button", { name: "plays" }));

    await waitFor(() => screen.getByText(/not quite right/i));
  });

  it("tapping the correct multiple-choice option marks it correct (regression: correctAnswer is an index into options, not text — comparing option text against the stringified index always failed before)", async () => {
    await seedDay("lesson_7"); // options: ["book","books","boks"], correctAnswer: 1 -> "books"

    render(
      <MemoryRouter>
        <GrammarLesson />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: "books" }));

    fireEvent.click(screen.getByRole("button", { name: "books" }));

    await waitFor(() => screen.getByText("Correct!"));

    const items = await getSchedulerItems();
    const grammarItem = items.find((i) => i.itemId === "lesson_7");
    expect(grammarItem?.streak).toBeGreaterThan(0);
  });

  it("tapping a wrong multiple-choice option marks it wrong, not correct", async () => {
    await seedDay("lesson_7");

    render(
      <MemoryRouter>
        <GrammarLesson />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: "boks" }));

    fireEvent.click(screen.getByRole("button", { name: "boks" }));

    await waitFor(() => screen.getByText(/not quite right/i));
  });
});
