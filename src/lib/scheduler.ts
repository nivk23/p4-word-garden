// Spaced repetition scheduler using Leitner boxes

export interface SchedulerItem {
  itemId: string;
  type: "word" | "grammar";
  introducedOn: string;
  box: number; // 0-5 (meaning box)
  spellBox?: number; // 0-5 (spelling box) - only for words
  correct: number;
  wrong: number;
  spellCorrect?: number;
  spellWrong?: number;
  streak: number;
  lastSeen: string;
  nextDue: string;
  correctDays?: string[]; // days on which answered correctly
  correctTypes?: string[]; // question types on which answered correctly
}

const boxIntervals = [1, 2, 4, 7, 14, 30]; // days

/**
 * Move item to next box on correct answer, tracking mastery progress
 */
export function markCorrect(
  item: SchedulerItem,
  today: string,
  qType?: string
): SchedulerItem {
  const newBox = Math.min(item.box + 1, 5);
  const nextDue = addDays(today, boxIntervals[newBox]);
  const newSpellBox =
    item.spellBox !== undefined ? Math.min(item.spellBox + 1, 5) : undefined;

  // Track correct days and types for mastery
  const correctDays = [...(item.correctDays || [])];
  if (!correctDays.includes(today)) {
    correctDays.push(today);
  }

  const correctTypes = [...(item.correctTypes || [])];
  if (qType && !correctTypes.includes(qType)) {
    correctTypes.push(qType);
  }

  return {
    ...item,
    box: newBox,
    // Grammar items never have a spellBox (only words do), so newSpellBox
    // is `undefined` here — spreading `{ spellBox: undefined }` explicitly
    // sets the field to `undefined` on the returned object. Firestore's
    // setDoc() rejects any field with a literal `undefined` value outright
    // ("Unsupported field value: undefined"), so saving a grammar item's
    // correct answer always threw, silently fell back to local-only
    // storage on that device, and never synced. Only include the key when
    // there's an actual value.
    ...(newSpellBox !== undefined ? { spellBox: newSpellBox } : {}),
    correct: item.correct + 1,
    spellCorrect: (item.spellCorrect || 0) + 1,
    streak: item.streak + 1,
    lastSeen: today,
    nextDue,
    correctDays,
    correctTypes,
  };
}

/**
 * Mark spelling as correct
 */
export function markSpellingCorrect(item: SchedulerItem): SchedulerItem {
  const newSpellBox = Math.min((item.spellBox || 0) + 1, 5);
  return {
    ...item,
    spellBox: newSpellBox,
    spellCorrect: (item.spellCorrect || 0) + 1,
  };
}

/**
 * Mark spelling as wrong
 */
export function markSpellingWrong(item: SchedulerItem): SchedulerItem {
  const newSpellBox = Math.max((item.spellBox || 0) - 1, 0);
  return {
    ...item,
    spellBox: newSpellBox,
    spellWrong: (item.spellWrong || 0) + 1,
  };
}

/**
 * Move item back on wrong answer, resetting mastery progress
 */
export function markWrong(item: SchedulerItem, today: string): SchedulerItem {
  const newBox = Math.max(item.box - 2, 0);
  return {
    ...item,
    box: newBox,
    wrong: item.wrong + 1,
    streak: 0,
    lastSeen: today,
    nextDue: addDays(today, 1), // always retry next day
    correctDays: [], // reset mastery tracking
    correctTypes: [],
  };
}

/**
 * Calculate weight for random selection
 * Formula: 1 + 3*wrong - correct/2, clamped >= 0.5
 */
export function calculateWeight(item: SchedulerItem): number {
  return Math.max(0.5, 1 + 3 * item.wrong - item.correct / 2);
}

/**
 * Build daily quiz: all yesterday's items + due items + weighted random
 */
export function buildDailyQuiz(
  today: string,
  allItems: SchedulerItem[],
  yesterdayItemIds: string[],
  maxSize: number = 10
): SchedulerItem[] {
  const quiz: SchedulerItem[] = [];
  const usedIds = new Set<string>();

  // 1. Add all of yesterday's items first
  const yesterdayItems = allItems.filter((i) => yesterdayItemIds.includes(i.itemId));
  yesterdayItems.forEach((item) => {
    quiz.push(item);
    usedIds.add(item.itemId);
  });

  // 2. Add all items with nextDue <= today
  const dueItems = allItems.filter(
    (i) => !usedIds.has(i.itemId) && i.nextDue <= today
  );
  dueItems.forEach((item) => {
    if (quiz.length < maxSize) {
      quiz.push(item);
      usedIds.add(item.itemId);
    }
  });

  // 3. Fill remaining slots with weighted random
  if (quiz.length < maxSize) {
    const availableItems = allItems.filter((i) => !usedIds.has(i.itemId));
    const weights = availableItems.map((i) => calculateWeight(i));

    while (quiz.length < maxSize && availableItems.length > 0) {
      const idx = weightedRandom(weights);
      quiz.push(availableItems[idx]);
      usedIds.add(availableItems[idx].itemId);
      availableItems.splice(idx, 1);
      weights.splice(idx, 1);
    }
  }

  return quiz;
}

/**
 * Select a random index based on weights
 */
function weightedRandom(weights: number[]): number {
  const sum = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * Add days to a date string (YYYY-MM-DD)
 */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  const newDay = String(date.getDate()).padStart(2, "0");
  return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * Check if an item is truly mastered: streak >= 5 AND answered correctly on >= 3 different days AND >= 2 different question types
 */
export function isMastered(item: SchedulerItem): boolean {
  return (
    item.streak >= 5 &&
    (item.correctDays?.length ?? 0) >= 3 &&
    (item.correctTypes?.length ?? 0) >= 2
  );
}

/** Default number of new words introduced in one LearnWords batch. */
export const NEW_WORDS_PER_BATCH = 3;

/** Hard ceiling on new words introduced in a single day, however many batches the child opts into. */
export const MAX_NEW_WORDS_PER_DAY = 15;
