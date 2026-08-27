import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SpellIt from "../src/pages/SpellIt";
import { allWords } from "../src/content/allWords";
import { getTodayKey } from "../src/lib/dates";
import {
  saveDayRecord,
  saveSchedulerItem,
  getSchedulerItems,
  getAllAnswerLogs,
} from "../src/store/progress";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

const word = allWords.find((w) => w.word === "huge")!;

function tapLetter(container: HTMLElement, letter: string) {
  const tile = Array.from(container.querySelectorAll('[data-testid="tile"]')).find(
    (b) => b.textContent?.toLowerCase() === letter.toLowerCase()
  );
  if (!tile) throw new Error(`No tile for ${letter}`);
  fireEvent.click(tile);
}

async function seedToday() {
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
    box: 0,
    spellBox: 0,
    correct: 0,
    wrong: 0,
    spellCorrect: 0,
    spellWrong: 0,
    streak: 0,
    lastSeen: today,
    nextDue: today,
    correctDays: [],
    correctTypes: [],
    sayCorrect: 0,
    sayWrong: 0,
  });
}

describe("SpellIt logging", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("records a spell_tiles answer log and updates spellBox on a correct spelling", async () => {
    await seedToday();

    const { container } = render(
      <MemoryRouter>
        <SpellIt />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/tap the letters/i));
    await waitFor(() =>
      expect(container.querySelectorAll('[data-testid="tile"]').length).toBeGreaterThan(0)
    );

    for (const letter of word.word) {
      tapLetter(container, letter);
    }

    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    await waitFor(async () => {
      const logs = await getAllAnswerLogs();
      expect(logs.some((l) => l.itemId === word.word && l.qType === "spell_tiles" && l.correct)).toBe(true);
    });

    const items = await getSchedulerItems();
    const updated = items.find((i) => i.itemId === word.word);
    expect(updated?.spellBox).toBe(1);
  });
});
