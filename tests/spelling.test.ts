import { describe, it, expect } from "vitest";
import { generateSpellingMissing, highlightTricky } from "../src/lib/spelling";
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

describe("highlightTricky", () => {
  it("returns the whole string as a single non-tricky segment when there's nothing tricky", () => {
    const { segments } = highlightTricky("huge", []);
    expect(segments).toEqual([{ text: "huge", tricky: false }]);
  });

  it("splits out the real tricky substring into its own marked segment", () => {
    const { segments } = highlightTricky("car-ried", ["r"]);
    const trickyText = segments.filter((s) => s.tricky).map((s) => s.text);
    const plainText = segments.filter((s) => !s.tricky).map((s) => s.text).join("");
    expect(trickyText.length).toBeGreaterThan(0);
    expect(trickyText.every((t) => t.toLowerCase() === "r")).toBe(true);
    // Rejoining every segment must reproduce the original string exactly.
    expect(segments.map((s) => s.text).join("")).toBe("car-ried");
    expect(plainText.length).toBeGreaterThan(0);
  });

  it("never emits literal HTML tag text (regression: used to build an HTML string via string.replace, which React then rendered as escaped visible text)", () => {
    const { segments } = highlightTricky("car-ried", ["r"]);
    for (const seg of segments) {
      expect(seg.text).not.toMatch(/<mark>|<\/mark>/);
    }
  });
});
