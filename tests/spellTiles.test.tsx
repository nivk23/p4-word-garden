import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import SpellTiles from "../src/components/SpellTiles";
import type { Word } from "../src/content/words";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

const cat: Word = {
  word: "cat",
  pos: "noun",
  kidMeaning: "A small furry pet animal.",
  examples: ["The cat is asleep.", "I have a pet cat."],
  emoji: "🐱",
  syllables: "cat",
  distractorGroup: "animals",
};

const dog: Word = {
  word: "dog",
  pos: "noun",
  kidMeaning: "A furry pet animal that barks.",
  examples: ["The dog runs fast.", "My dog is happy."],
  emoji: "🐶",
  syllables: "dog",
  distractorGroup: "animals",
};

function tiles(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('[data-testid="tile"]')) as HTMLButtonElement[];
}

function tapWord(container: HTMLElement, word: string) {
  for (const letter of word) {
    // Re-query on every tap: React reuses tile DOM nodes positionally
    // (key={idx}), so a stale element reference can point at the wrong tile
    // after a prior click re-renders the list.
    const match = tiles(container).find(
      (b) => b.textContent?.toLowerCase() === letter.toLowerCase()
    );
    if (!match) throw new Error(`No tile found for letter ${letter}`);
    fireEvent.click(match);
  }
}

function tapAllTiles(container: HTMLElement) {
  while (tiles(container).length > 0) {
    fireEvent.click(tiles(container)[0]);
  }
}

describe("SpellTiles", () => {
  beforeEach(() => {
    cleanup();
  });

  it("resets tiles and feedback when the word prop changes", () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    const { container, rerender } = render(
      <SpellTiles word={cat} onCorrect={onCorrect} onWrong={onWrong} />
    );

    // Tap a letter so some state is dirtied
    fireEvent.click(tiles(container)[0]);
    expect(screen.getByRole("button", { name: /check/i })).toBeTruthy();

    rerender(<SpellTiles word={dog} onCorrect={onCorrect} onWrong={onWrong} />);

    // Placeholder should reflect the new word's length with nothing selected
    expect(screen.getByText("_".repeat(dog.word.length))).toBeTruthy();
    // Check button should be disabled again since no tiles are placed for the new word
    expect((screen.getByRole("button", { name: /check/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("keeps Check disabled until a tile is placed, then confirms a correct answer", () => {
    vi.useFakeTimers();
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    const { container } = render(
      <SpellTiles word={cat} onCorrect={onCorrect} onWrong={onWrong} />
    );

    const checkBtn = screen.getByRole("button", { name: /check/i }) as HTMLButtonElement;
    expect(checkBtn.disabled).toBe(true);

    tapWord(container, cat.word);

    expect(checkBtn.disabled).toBe(false);
    fireEvent.click(checkBtn);

    expect(screen.getByText(/correct!/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onCorrect).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("allows up to 2 retries before calling onWrong and revealing the correct spelling", () => {
    vi.useFakeTimers();
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    const { container } = render(
      <SpellTiles word={cat} onCorrect={onCorrect} onWrong={onWrong} />
    );

    const checkBtn = () => screen.getByRole("button", { name: /check/i });

    // Attempt 1: tap every tile (letters + decoys) — guaranteed wrong since
    // the assembled length won't match the 3-letter word.
    tapAllTiles(container);
    fireEvent.click(checkBtn());
    expect(screen.getByText(/2 left/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(2000); });

    // Attempt 2 (first retry)
    tapAllTiles(container);
    fireEvent.click(checkBtn());
    expect(screen.getByText(/1 left/i)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(2000); });

    // Attempt 3 (second retry, out of attempts) — should reveal the correct spelling and call onWrong
    tapAllTiles(container);
    fireEvent.click(checkBtn());
    expect(screen.getByText(/the word is "cat"/i)).toBeTruthy();
    expect(onWrong).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2200); });
    expect(onWrong).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("Give up calls onWrong immediately without waiting on retries", () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    render(<SpellTiles word={cat} onCorrect={onCorrect} onWrong={onWrong} />);

    fireEvent.click(screen.getByRole("button", { name: /give up/i }));
    expect(onWrong).toHaveBeenCalledTimes(1);
    expect(onCorrect).not.toHaveBeenCalled();
  });
});
