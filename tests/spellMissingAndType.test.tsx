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
const tiny = allWords.find((w) => w.word === "tiny")!;

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

  it("regression: does not print the full unblanked word as text — it used to show it plainly under 'Sound it out', right above the fill-in-the-blank challenge", () => {
    render(<SpellMissing word={huge} onCorrect={vi.fn()} onWrong={vi.fn()} />);
    expect(screen.queryByText(huge.word)).toBeNull();
    expect(screen.queryByText(/sound it out/i)).toBeNull();
    expect(screen.getByText(/hear word \(normal\)/i)).toBeTruthy();
    expect(screen.getByText(/hear word \(slow\)/i)).toBeTruthy();
  });

  it("regression: does not print the full unblanked word as text even for a word with a spelling tip (previously highlighted, not blanked, next to 'Tricky:')", () => {
    render(<SpellMissing word={carried} onCorrect={vi.fn()} onWrong={vi.fn()} />);
    expect(screen.queryByText(carried.word)).toBeNull();
    expect(screen.queryByText(/tricky/i)).toBeNull();
  });

  it("regression: resets when Quiz.tsx reuses this component instance for the next spell_missing word", () => {
    // Quiz.tsx renders <SpellMissing word={...}> at the same JSX position for
    // every spell_missing question, so React reuses the instance instead of
    // remounting it — simulate that here with rerender (not a fresh render).
    const { rerender } = render(<SpellMissing word={huge} onCorrect={vi.fn()} onWrong={vi.fn()} />);

    const firstInput = screen.getByPlaceholderText("Type the missing letters") as HTMLInputElement;
    fireEvent.change(firstInput, { target: { value: huge.word } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(screen.getByText(/correct!/i)).toBeTruthy();

    rerender(<SpellMissing word={tiny} onCorrect={vi.fn()} onWrong={vi.fn()} />);

    const secondInput = screen.getByPlaceholderText("Type the missing letters") as HTMLInputElement;
    expect(secondInput.disabled).toBe(false);
    expect(secondInput.value).toBe("");
    expect(screen.queryByText(/correct!/i)).toBeNull();
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

  it("regression: does not print the example sentence as text (it spells out the word being tested, right above the 'type the word' input)", () => {
    render(<SpellType word={huge} onCorrect={vi.fn()} onWrong={vi.fn()} />);

    expect(screen.queryByText(huge.examples[0])).toBeNull();
    expect(screen.getByText(/hear example/i)).toBeTruthy();
  });
});
