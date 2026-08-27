import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SayItStep from "../src/pages/SayItStep";
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

// SayIt itself relies on the browser SpeechRecognition API, which jsdom
// doesn't implement. Stub it with simple Correct/Wrong triggers so this
// test can focus on SayItStep's own scheduler + logging wiring.
vi.mock("../src/components/SayIt", () => ({
  default: ({ onCorrect, onWrong }: { onCorrect: () => void; onWrong: () => void }) => (
    <div>
      <button onClick={onCorrect}>Mock say correct</button>
      <button onClick={onWrong}>Mock say wrong</button>
    </div>
  ),
}));

const word = allWords.find((w) => w.word === "huge")!;

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

describe("SayItStep logging", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("records a say_word correct log and increments sayCorrect", async () => {
    await seedToday();

    render(
      <MemoryRouter>
        <SayItStep />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/mock say correct/i));
    fireEvent.click(screen.getByText(/mock say correct/i));

    await waitFor(async () => {
      const logs = await getAllAnswerLogs();
      expect(logs.some((l) => l.itemId === word.word && l.qType === "say_word" && l.correct)).toBe(true);
    });

    const items = await getSchedulerItems();
    const updated = items.find((i) => i.itemId === word.word);
    expect(updated?.sayCorrect).toBe(1);
  });

  it("records a say_word wrong log and increments sayWrong without touching box", async () => {
    await seedToday();

    render(
      <MemoryRouter>
        <SayItStep />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/mock say wrong/i));
    fireEvent.click(screen.getByText(/mock say wrong/i));

    await waitFor(async () => {
      const logs = await getAllAnswerLogs();
      expect(logs.some((l) => l.itemId === word.word && l.qType === "say_word" && !l.correct)).toBe(true);
    });

    const items = await getSchedulerItems();
    const updated = items.find((i) => i.itemId === word.word);
    expect(updated?.sayWrong).toBe(1);
    expect(updated?.box).toBe(0);
  });
});
