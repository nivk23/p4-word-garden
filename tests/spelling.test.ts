import { describe, it, expect } from "vitest";
import { generateSpellingMissing } from "../src/lib/spelling";
import { allWords } from "../src/content/allWords";

const huge = allWords.find((w) => w.word === "huge")!; // no spellingTip
const carried = allWords.find((w) => w.word === "carried")!; // "double r"

describe("generateSpellingMissing", () => {
  it("regression: a word with no matching spelling-tip pattern doesn't reveal itself via `tricky`", () => {
    // Previously the default (alternating-blank) branch pushed the literal
    // string "letters" into `tricky` as a placeholder description, which
    // highlightTricky then tried to find *within the word* — it never
    // matched anything real, so the component rendered the whole,
    // unblanked word next to "Tricky:", right beside the blanked exercise.
    const result = generateSpellingMissing(huge);
    expect(result.tricky).toEqual([]);
    expect(result.blanked).not.toBe(huge.word);
  });

  it("blanks alternating letters as the fallback for words without a recognised tip", () => {
    const result = generateSpellingMissing(huge);
    expect(result.blanked).toBe("h_g_");
  });

  it("identifies the real doubled letter for a 'double' spelling tip", () => {
    const result = generateSpellingMissing(carried);
    expect(result.tricky).toContain("r");
    expect(result.blanked).not.toBe(carried.word);
  });
});
