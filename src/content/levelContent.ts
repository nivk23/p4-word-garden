import type { Word } from "./words";
import type { GrammarLesson } from "./grammar";
import type { Passage } from "./passages";
import type { Level } from "./levels";
import { allWords } from "./allWords";
import { grammarLessons } from "./grammar";
import { passages } from "./passages";

const wordCache = new Map<Level, Word[]>();

/**
 * Every word a child at this level should know, easiest first.
 *
 * Levels are **cumulative**: a P4 child is taught P1–P4 words and starts at P1.
 * She may be in P4 and still be missing P2 vocabulary — that is the whole reason
 * this app exists — so nothing below her level is assumed to be known. A child
 * who does already know the early words simply clears them in a few days.
 *
 * `sort` is stable, so within one level the `allWords` order survives and her
 * P4 book words (`words.ts`, which comes first in the merge) stay ahead of the
 * extra bands.
 */
export function wordsForLevel(level: Level): Word[] {
  const cached = wordCache.get(level);
  if (cached) return cached;
  const forLevel = allWords.filter((w) => w.level <= level).sort((a, b) => a.level - b.level);
  wordCache.set(level, forLevel);
  return forLevel;
}

/** Grammar lessons up to this level, in teaching order (P1 rules first). */
export function grammarForLevel(level: Level): GrammarLesson[] {
  return grammarLessons.filter((l) => l.level <= level).sort((a, b) => a.level - b.level);
}

/**
 * Mini-read passages a child at this level can read. If a level somehow has
 * nothing at all, fall back to the three easiest rather than leaving the day
 * with no reading step.
 */
export function passagesForLevel(level: Level): Passage[] {
  const fit = passages.filter((p) => p.level <= level);
  if (fit.length > 0) return fit;
  return [...passages].sort((a, b) => a.level - b.level).slice(0, 3);
}
