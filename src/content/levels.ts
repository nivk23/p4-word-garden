/**
 * Primary levels, and nothing else.
 *
 * Deliberately free of imports: `store/progress.ts`, the `Word`/`GrammarLesson`/
 * `Passage` interfaces and the profile screens all need a level, and none of
 * them should drag the 2,565-word content bank in behind it. The functions that
 * *query* content by level live in `levelContent.ts`.
 */

/** Singapore primary school year: P1 (7 years old) through P6 (12). */
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

/** The app was built for one P4 child, so P4 stays the default for a new profile. */
export const DEFAULT_LEVEL: Level = 4;

export function levelLabel(level: Level): string {
  return `P${level}`;
}

/** Narrow anything read back from storage (or a URL) to a real level. */
export function asLevel(value: unknown): Level | null {
  return LEVELS.includes(value as Level) ? (value as Level) : null;
}
