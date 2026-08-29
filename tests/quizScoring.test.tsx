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

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

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
    mockNavigate.mockClear();
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

  it("regression: a wrong grammar-question answer shows a Continue button and actually advances, instead of leaving the quiz permanently stuck", async () => {
    // `word` (looked up by currentQuestion.itemId, a word string) is always
    // undefined for grammar questions (itemId is a lesson id) — the
    // reveal+continue screen used to be gated on `showMeaning && word`, so
    // it never rendered here. Nothing else re-enables the tiles or offers
    // a way forward, so any wrong grammar answer froze the quiz.
    await seedGrammarQuiz();

    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/tap the noun/i));
    fireEvent.click(await screen.findByRole("button", { name: "sits" }));

    const continueBtn = await screen.findByRole("button", { name: /continue/i }, { timeout: 2000 });
    expect(screen.getByText(/the answer is/i)).toBeTruthy();
    expect(screen.getByText("cat")).toBeTruthy();
    fireEvent.click(continueBtn);

    // Lands on the practice-only retry of the same question with a fresh,
    // un-disabled set of tappable words — not stuck on the previous
    // (disabled, wrong-highlighted) attempt forever.
    await waitFor(() => screen.getByText(/tap the noun/i));
    const freshCatButton = (await screen.findByRole("button", { name: "cat" })) as HTMLButtonElement;
    expect(freshCatButton.disabled).toBe(false);
  });

  it("regression: the final score/total sent to the Done page includes the very last question answered, not last render's stale count", async () => {
    // goToNext() used to be called right after setScore/setAnsweredCount in
    // the same synchronous block — those are async state updates, so
    // goToNext read last render's stale `score`/`answeredCount` closure
    // values. When the *last* question of the quiz was a practice-only
    // retry resolved correctly (as here — a wrong tap_noun re-asked and
    // then gotten right), the /done navigation reported score:0, total:0
    // instead of score:1, total:1 — the last answer was silently dropped
    // from the final tally.
    await seedGrammarQuiz();

    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/tap the noun/i));
    fireEvent.click(await screen.findByRole("button", { name: "sits" })); // wrong
    await waitFor(() => screen.getByText(/the answer is/i));
    fireEvent.click(await screen.findByRole("button", { name: /continue/i }));

    await waitFor(() => screen.getByText(/tap the noun/i));
    fireEvent.click(await screen.findByRole("button", { name: "cat" })); // retry, correct
    await waitFor(() => screen.getByText(/nice one/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/done", { state: { score: 0, total: 1 } });
    });
  });
});
