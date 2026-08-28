/**
 * Spelling question generators
 */
import type { Word } from "../content/words";

export type SpellingType = "tiles" | "missing" | "type";

/**
 * Choose spelling question type based on spellBox level
 */
export function chooseSpellingType(spellBox: number): SpellingType {
  if (spellBox < 1) return "tiles";
  if (spellBox < 3) return "missing";
  return "type";
}

/**
 * Generate tiles + decoys for spelling challenge
 * Returns array of tiles where user must tap in order
 */
export function generateSpellingTiles(
  word: Word
): { tiles: string[]; correctOrder: string[] } {
  const letters = word.word.split("");
  const decoys = generateDecoyLetters(word.word, Math.max(1, 5 - letters.length));
  const allTiles = letters.concat(decoys);

  // Shuffle
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }

  return {
    tiles: allTiles,
    correctOrder: letters,
  };
}

/**
 * Generate missing-letter version with tricky parts blanked
 */
export function generateSpellingMissing(word: Word): {
  blanked: string;
  tricky: string[];
  full: string;
  tip: string;
} {
  const full = word.word;
  const tip = word.spellingTip || "";

  // Identify tricky letters from tip
  const tricky: string[] = [];
  let blanked = full;

  if (tip.includes("double")) {
    // e.g., "carry" has double r
    for (let i = 0; i < full.length - 1; i++) {
      if (full[i] === full[i + 1]) {
        blanked = blanked.substring(0, i + 1) + "_" + blanked.substring(i + 2);
        tricky.push(full[i + 1]);
      }
    }
  } else if (tip.includes("ei") || tip.includes("ie")) {
    // Blank the vowel combo
    const pattern = tip.includes("ei") ? "ei" : "ie";
    const idx = full.indexOf(pattern);
    if (idx >= 0) {
      blanked = full.substring(0, idx) + "__" + full.substring(idx + 2);
      tricky.push(pattern);
    }
  } else if (tip.includes("silent")) {
    // Blank silent letters
    // Simple heuristic: look for common silent patterns
    const silentPatterns = [
      { pattern: "gh", in: ["gh"] },
      { pattern: "ps", in: ["ps"] },
      { pattern: "kn", in: ["kn"] },
    ];
    for (const { pattern, in: matches } of silentPatterns) {
      if (matches.some((m) => full.includes(m))) {
        const idx = full.indexOf(pattern);
        if (idx >= 0) {
          blanked = full.substring(0, idx) + "_".repeat(pattern.length) + full.substring(idx + pattern.length);
          tricky.push(pattern);
        }
      }
    }
  } else {
    // Default: blank alternate letters. Deliberately leave `tricky` empty —
    // there's no single tricky substring to call out here (unlike the
    // double/ei-ie/silent cases above), so the "Tricky: ..." hint should
    // stay hidden rather than have something pushed into it just to have a
    // value; the previous placeholder ("letters") wasn't a real substring
    // of the word, so highlightTricky's regex never matched it and the
    // component rendered the *entire unblanked word* next to "Tricky:" —
    // as an answer-reveal for every word without a recognised spelling tip.
    blanked = full
      .split("")
      .map((c, i) => (i % 2 === 1 ? "_" : c))
      .join("");
  }

  return { blanked, tricky, full, tip };
}

/**
 * Validate spelling answer
 */
export function validateSpelling(answer: string, word: string): boolean {
  return answer.toLowerCase().trim() === word.toLowerCase();
}

// Helper: generate decoy letters
function generateDecoyLetters(word: string, count: number): string[] {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const used = new Set(word.toLowerCase().split(""));
  const available = alphabet.filter((l) => !used.has(l));

  const result: string[] = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  return result;
}
