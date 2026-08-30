import { describe, it, expect } from 'vitest';
import { dictionaryMeanings, getDictionaryMeaning } from '../src/content/dictionary';
import { allWords } from '../src/content/allWords';

describe('dictionary', () => {
  it('should have a definition for every word we teach', () => {
    const missing = allWords.filter((w) => !getDictionaryMeaning(w.word)).map((w) => w.word);
    expect(missing, `regenerate with scripts/build_dictionary.py after adding words`).toEqual([]);
  });

  it('should look words up regardless of case', () => {
    expect(getDictionaryMeaning('Receipt')).toBe(getDictionaryMeaning('receipt'));
    expect(getDictionaryMeaning('not-a-word')).toBeUndefined();
  });

  it('should hold a non-empty, single-clause definition for each entry', () => {
    Object.entries(dictionaryMeanings).forEach(([word, meaning]) => {
      expect(meaning.length, word).toBeGreaterThan(3);
      expect(meaning.length, word).toBeLessThanOrEqual(115);
      expect(meaning.endsWith('.'), word).toBe(false);
    });
  });

  it('should use British spelling, matching the rest of the content', () => {
    const american = /\b(color|colors|favorite|honor|humor|neighbor|behavior|flavor|center|liter|meter|theater|fiber|defense|offense|gray|jewelry|traveling|marvelous|skillful|airplane|pajamas|mustache|skeptical|aluminum|kilometer|centimeter|millimeter|organize|organized|organization|recognize|apologize|analyze|memorize)\b/;
    const offenders = Object.entries(dictionaryMeanings)
      .filter(([, meaning]) => american.test(meaning))
      .map(([word, meaning]) => `${word}: ${meaning}`);
    expect(offenders).toEqual([]);
  });

  it('should give the sense we actually teach, not just WordNet sense 1', () => {
    // Each of these leads with a sense we do not mean; the generator overrides them.
    expect(getDictionaryMeaning('escalator')).toContain('stairway');
    expect(getDictionaryMeaning('receipt')).toContain('payment');
    expect(getDictionaryMeaning('licence')).toContain('permission');
    expect(getDictionaryMeaning('online')).toContain('computer network');
    expect(getDictionaryMeaning('jam')).toContain('vehicles');
  });
});

describe('dictionary senses we had to pin', () => {
  // Each of these picked a plausible-but-wrong sense before it was pinned in
  // scripts/build_dictionary.py. They are the regression guard for that table.
  const expected: Record<string, RegExp> = {
    brave: /courage/,
    bank: /financial institution/,
    plane: /aircraft/,
    party: /social interaction|celebration|assemble/,
    sit: /seated/,
    fruit: /seed plant/,
    glass: /brittle transparent solid/,
    wheel: /circular frame/,
    snake: /reptile/,
    pirate: /robs at sea/,
    creator: /grows or makes or invents/,
    argument: /dispute|contentious/,
    cashier: /receiving payments/,
    witch: /sorcerer|magician/,
    inches: /one twelfth of a foot/,
    sport: /physical exertion/,
    read: /interpret something that is written/,
    monument: /commemorate/,
    knight: /noble birth/,
    medicine: /treats or prevents/,
    stepsister: /stepparent/,
  };
  Object.entries(expected).forEach(([word, pattern]) => {
    it(`should define "${word}" as the sense we teach`, () => {
      expect(getDictionaryMeaning(word)).toMatch(pattern);
    });
  });
});
