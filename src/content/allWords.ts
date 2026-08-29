import type { Word } from "./words";
import { words } from "./words";
import { band1 } from "./words-extra/band1";
import { band2 } from "./words-extra/band2";
import { band3 } from "./words-extra/band3";
import { band4 } from "./words-extra/band4";
import { band5 } from "./words-extra/band5";
import { band6 } from "./words-extra/band6";
import { band7 } from "./words-extra/band7";

/**
 * Combine all word sources with deduplication (case-insensitive).
 * Core words come first, followed by bands in order.
 * Keeps first occurrence if a word appears multiple times.
 */
export const allWords: Word[] = (() => {
  const combined = [...words, ...band1, ...band2, ...band3, ...band4, ...band5, ...band6, ...band7];
  const seen = new Set<string>();
  const result: Word[] = [];

  for (const word of combined) {
    const key = word.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(word);
    }
  }

  return result;
})();
