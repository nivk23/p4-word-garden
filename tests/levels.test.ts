import { describe, it, expect } from 'vitest';
import { allWords } from '../src/content/allWords';
import { grammarLessons } from '../src/content/grammar';
import { passages } from '../src/content/passages';
import { LEVELS, DEFAULT_LEVEL, levelLabel, asLevel } from '../src/content/levels';
import { wordsForLevel, grammarForLevel, passagesForLevel } from '../src/content/levelContent';
import { generateWordQuestions } from '../src/lib/questions';

describe('level grading', () => {
  it('gives every word a level from P1 to P6', () => {
    const ungraded = allWords.filter((w) => !LEVELS.includes(w.level));
    expect(ungraded.map((w) => w.word)).toEqual([]);
  });

  it('gives every grammar lesson a level', () => {
    const ungraded = grammarLessons.filter((l) => !LEVELS.includes(l.level));
    expect(ungraded.map((l) => l.id)).toEqual([]);
  });

  it('gives every passage a level', () => {
    const ungraded = passages.filter((p) => !LEVELS.includes(p.level));
    expect(ungraded.map((p) => p.id)).toEqual([]);
  });

  it('keeps every grammar rule reachable by P4', () => {
    // Every lesson in grammar.ts comes from her P4 book's grammar worksheets or
    // from a P4 exam paper — lessons 71-81 were added precisely because a P4
    // paper tests them. Grading one at P5/P6 by the general MOE progression
    // would silently stop teaching a rule her own exam asks for.
    const tooHigh = grammarLessons.filter((l) => l.level > 4);
    expect(tooHigh.map((l) => `${l.id} ${l.title}`)).toEqual([]);
  });

  it('keeps every level stocked with words to teach', () => {
    for (const level of LEVELS) {
      expect(allWords.filter((w) => w.level === level).length).toBeGreaterThan(50);
    }
  });

  it('keeps her P4 book words reachable by P4', () => {
    // words.ts is the 400 words from her school book — they are the whole point
    // of the app for a P4 child, so none of them may be graded above P4.
    const tooHigh = allWords.slice(0, 400).filter((w) => w.level > 4);
    expect(tooHigh.map((w) => w.word)).toEqual([]);
  });
});

describe('wordsForLevel', () => {
  it('is cumulative: a P4 child gets P1-P4 words', () => {
    expect(wordsForLevel(4).every((w) => w.level <= 4)).toBe(true);
    expect(wordsForLevel(4).length).toBe(allWords.filter((w) => w.level <= 4).length);
  });

  it('never drops a word a lower level was taught', () => {
    for (let level = 2; level <= 6; level++) {
      const lower = new Set(wordsForLevel((level - 1) as 1).map((w) => w.word));
      const here = new Set(wordsForLevel(level as 1).map((w) => w.word));
      expect([...lower].filter((w) => !here.has(w))).toEqual([]);
      expect(here.size).toBeGreaterThan(lower.size);
    }
  });

  it('teaches easiest first, so a P6 child still starts at P1', () => {
    const levels = wordsForLevel(6).map((w) => w.level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });

  it('covers the whole bank at P6', () => {
    expect(wordsForLevel(6).length).toBe(allWords.length);
  });

  it('keeps the core book words ahead of the bands within a level', () => {
    const p1 = wordsForLevel(1);
    const firstBandIndex = p1.findIndex((w) => !allWords.slice(0, 400).includes(w));
    const coreAfter = p1.slice(firstBandIndex).filter((w) => allWords.slice(0, 400).includes(w));
    expect(coreAfter).toEqual([]);
  });
});

describe('grammarForLevel', () => {
  it('is cumulative and teaches the earliest rules first', () => {
    const levels = grammarForLevel(6).map((l) => l.level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
    expect(grammarForLevel(6).length).toBe(grammarLessons.length);
    expect(grammarForLevel(1).every((l) => l.level === 1)).toBe(true);
  });

  it('gives a P4 child the whole rule bank, since all of it is P4 material', () => {
    expect(grammarForLevel(4).length).toBe(grammarLessons.length);
  });

  it('starts a P1 child on nouns, not on the passive voice', () => {
    expect(grammarForLevel(1)[0].id).toBe('lesson_1');
    expect(grammarForLevel(1).some((l) => l.title.includes('Passive'))).toBe(false);
  });
});

describe('passagesForLevel', () => {
  it('never leaves a level with no mini-read', () => {
    for (const level of LEVELS) {
      expect(passagesForLevel(level).length).toBeGreaterThan(0);
    }
  });

  it('only offers passages a child at that level can read', () => {
    for (const level of LEVELS) {
      expect(passagesForLevel(level).every((p) => p.level <= level)).toBe(true);
    }
  });
});

describe('level-aware distractors', () => {
  it('never offers a P1 child a meaning from a harder word', () => {
    const p1Meanings = new Set(wordsForLevel(1).map((w) => w.kidMeaning));
    const word = wordsForLevel(1)[0];
    const questions = generateWordQuestions(word, 1, 1);
    const meaning = questions.find((q) => q.type === 'meaning')!;
    const wrong = meaning.options.filter((_, i) => i !== meaning.correctAnswer);
    expect(wrong.filter((o) => !p1Meanings.has(o))).toEqual([]);
  });
});

describe('level helpers', () => {
  it('labels levels the way a Singapore parent writes them', () => {
    expect(LEVELS.map(levelLabel)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
  });

  it('rejects anything that is not a real level', () => {
    expect(asLevel(3)).toBe(3);
    expect(asLevel(0)).toBeNull();
    expect(asLevel(7)).toBeNull();
    expect(asLevel(undefined)).toBeNull();
    expect(asLevel('4')).toBeNull();
  });

  it('defaults to the level the app was built for', () => {
    expect(DEFAULT_LEVEL).toBe(4);
  });
});
