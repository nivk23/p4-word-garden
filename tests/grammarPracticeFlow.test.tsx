import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GrammarPractice from "../src/pages/GrammarPractice";
import { editingItems } from "../src/content/grammarPractice";
import { getAllAnswerLogs } from "../src/store/progress";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

const renderPractice = () =>
  render(
    <MemoryRouter>
      <GrammarPractice />
    </MemoryRouter>
  );

/** The item currently on screen, found by the sentence its words spell out. */
function itemOnScreen() {
  return editingItems.find((item) =>
    item.sentence
      .split(" ")
      .every((word) => screen.queryAllByRole("button", { name: word }).length > 0)
  );
}

describe("grammar practice flow", () => {
  beforeEach(() => { localStorage.clear(); cleanup(); });
  afterEach(() => { localStorage.clear(); });

  it("re-teaches the rule and asks again when she gets one wrong", async () => {
    renderPractice();
    fireEvent.click(await screen.findByText(/start fixing/i));

    const first = await waitFor(() => {
      const found = itemOnScreen();
      expect(found).toBeTruthy();
      return found!;
    });

    // tap the mistake, then deliberately choose a wrong correction
    fireEvent.click(screen.getAllByRole("button", { name: first.wrong })[0]);
    const wrongChoice = first.options.find((o) => o !== first.correct)!;
    fireEvent.click(await screen.findByRole("button", { name: wrongChoice }));

    // she is told the answer, given the reason, and taught the rule again
    expect(await screen.findByText(new RegExp(`It should be "${first.correct}"`))).toBeTruthy();
    expect(screen.getByText(first.why)).toBeTruthy();
    expect(screen.getByText(/look at the rule again/i)).toBeTruthy();
    expect(screen.getByText(/see this sentence again/i)).toBeTruthy();

    // and the session does not end until that sentence has been answered again
    await waitFor(async () => {
      const logs = await getAllAnswerLogs();
      expect(logs.some((l) => l.itemId === first.lessonId && l.qType === "grammar_edit" && !l.correct)).toBe(true);
    });
  });

  it("keeps her answer and the explanation on screen after a wrong answer", async () => {
    renderPractice();
    fireEvent.click(await screen.findByText(/start fixing/i));
    const first = await waitFor(() => {
      const found = itemOnScreen();
      expect(found).toBeTruthy();
      return found!;
    });

    fireEvent.click(screen.getAllByRole("button", { name: first.wrong })[0]);
    const wrongChoice = first.options.find((o) => o !== first.correct)!;
    fireEvent.click(await screen.findByRole("button", { name: wrongChoice }));

    // regression: keying the card on the retry count used to remount it here,
    // wiping the feedback and the reason she needs to read
    expect(screen.getByText(first.why)).toBeTruthy();
    expect(screen.queryByText(/tap the word that is wrong/i)).toBeNull();
  });

  it("offers both practice modes from the hub", async () => {
    renderPractice();
    expect(await screen.findByText(/fix the sentence/i)).toBeTruthy();
    expect(screen.getByText(/practise one rule/i)).toBeTruthy();
  });
});
