import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Quiz from "../src/pages/Quiz";
import { allWords } from "../src/content/allWords";
import { getTodayKey } from "../src/lib/dates";
import { saveDayRecord, saveSchedulerItem, getSchedulerItems } from "../src/store/progress";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

const word = allWords.find((w) => w.word === "huge")!;

async function seedWordQuiz() {
  const today = getTodayKey();
  await saveDayRecord({
    date: today,
    wordIds: [word.word],
    grammarId: "lesson_1",
    completed: false,
    quizResults: [],
    accuracy: 0,
    durationSec: 0,
  });
  await saveSchedulerItem({
    itemId: word.word,
    type: "word",
    introducedOn: today,
    box: 1,
    spellBox: 0,
    correct: 1,
    wrong: 0,
    spellCorrect: 0,
    spellWrong: 0,
    streak: 1,
    lastSeen: today,
    nextDue: today,
    correctDays: [],
    correctTypes: [],
    sayCorrect: 0,
    sayWrong: 0,
  });
}

async function seedGrammarQuiz() {
  const today = getTodayKey();
  await saveDayRecord({
    date: today,
    wordIds: [],
    grammarId: "lesson_1",
    completed: false,
    quizResults: [],
    accuracy: 0,
    durationSec: 0,
  });
  await saveSchedulerItem({
    itemId: "lesson_1",
    type: "grammar",
    introducedOn: today,
    box: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    lastSeen: today,
    nextDue: today,
    correctDays: [],
    correctTypes: [],
  });
}

describe("Quiz scoring", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("regression: tapping the option that IS the correct answer registers as correct, regardless of its shuffled position", async () => {
    await seedWordQuiz();

    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>
    );

    // "meaning" is the first question type generated for a word (picture_pick
    // was removed) — its correct option text is the word's kidMeaning.
    await waitFor(() => screen.getByText(word.kidMeaning));

    fireEvent.click(screen.getByText(word.kidMeaning));

    await waitFor(() => screen.getByText(/nice one/i));

    // The banner shows immediately on tap; the actual scheduler-item write
    // happens in a delayed handleAnswer call after that — wait for it.
    await waitFor(async () => {
      const items = await getSchedulerItems();
      const item = items.find((i) => i.itemId === word.word);
      // markCorrect increments streak; markWrong (the pre-fix behaviour for a
      // "correct" tap misread as wrong) would have reset it to 0 instead.
      expect(item?.streak).toBeGreaterThan(1);
    });
  });

  it("regression: tapping a wrong option is still recorded as wrong (not always 'correct')", async () => {
    await seedWordQuiz();

    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(word.kidMeaning));

    const wrongOption = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent && btn.textContent !== word.kidMeaning && btn.className.includes("rounded-2xl") && btn.className.includes("text-left"));
    expect(wrongOption).toBeTruthy();
    fireEvent.click(wrongOption!);

    await waitFor(() => screen.getByText(/it means/i));

    const items = await getSchedulerItems();
    const item = items.find((i) => i.itemId === word.word);
    expect(item?.streak).toBe(0);
  });

  it("renders tappable words for a tag_noun grammar question and scores a correct tap correctly (was previously unimplemented — no options, nothing rendered at all)", async () => {
    await seedGrammarQuiz();

    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>
    );

    // lesson_1's first practice item: "Tap the noun in this sentence." /
    // "The cat sits on the mat." / correctAnswer "cat".
    await waitFor(() => screen.getByText(/tap the noun/i));
    const catButton = await screen.findByRole("button", { name: "cat" });

    fireEvent.click(catButton);

    await waitFor(() => screen.getByText(/nice one/i));

    await waitFor(async () => {
      const items = await getSchedulerItems();
      const item = items.find((i) => i.itemId === "lesson_1");
      expect(item?.streak).toBeGreaterThan(0);
    });
  });

  it("marks a wrong word tap in a tag_noun question as wrong", async () => {
    await seedGrammarQuiz();

    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/tap the noun/i));
    const wrongButton = await screen.findByRole("button", { name: "sits" });

    fireEvent.click(wrongButton);

    await waitFor(() => screen.getByText(/it means|not quite/i));
  });
});
