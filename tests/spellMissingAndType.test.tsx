import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SpellMissing from "../src/components/SpellMissing";
import SpellType from "../src/components/SpellType";
import { allWords } from "../src/content/allWords";

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

const huge = allWords.find((w) => w.word === "huge")!; // no spellingTip
const carried = allWords.find((w) => w.word === "carried")!; // "double r"

describe("SpellMissing", () => {
  beforeEach(() => cleanup());

  it("regression: the input is typeable immediately, not disabled from the first render", () => {
    // useState<"" | "correct" | "wrong">() with no initial value started
    // `feedback` as `undefined`; disabled={feedback !== ""} then evaluated
    // `undefined !== ""` as true, disabling the input before any
    // interaction — "cannot type at all".
    render(<SpellMissing word={huge} onCorrect={vi.fn()} onWrong={vi.fn()} />);

    const input = screen.getByPlaceholderText("Type the missing letters") as HTMLInputElement;
    expect(input.disabled).toBe(false);

    fireEvent.change(input, { target: { value: "ug" } });
    expect(input.value).toBe("ug");
  });

  it("regression: does not reveal the full word next to 'Tricky' for a word with no matching spelling tip", () => {
    render(<SpellMissing word={huge} onCorrect={vi.fn()} onWrong={vi.fn()} />);
    expect(screen.queryByText(/tricky/i)).toBeNull();
  });

  it("shows a real tricky-letter hint (not the whole word) for a word with a 'double' spelling tip", () => {
    render(<SpellMissing word={carried} onCorrect={vi.fn()} onWrong={vi.fn()} />);
    expect(screen.getByText(/tricky/i)).toBeTruthy();
  });
});

describe("SpellType", () => {
  beforeEach(() => cleanup());

  it("regression: the input is typeable immediately, not disabled from the first render", () => {
    render(<SpellType word={huge} onCorrect={vi.fn()} onWrong={vi.fn()} />);

    const input = screen.getByPlaceholderText("Type the word") as HTMLInputElement;
    expect(input.disabled).toBe(false);

    fireEvent.change(input, { target: { value: "huge" } });
    expect(input.value).toBe("huge");
  });
});
