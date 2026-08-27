import type { SchedulerItem } from "./scheduler";
import type { AnswerLog } from "../store/progress";

/**
 * Calculate count of mastered words
 * Mastered: streak >= 5 AND correctDays >= 3 AND correctTypes >= 2
 */
export function calculateMasteredCount(items: SchedulerItem[]): number {
  return items.filter((item) => {
    return (
      item.type === "word" &&
      item.streak >= 5 &&
      (item.correctDays?.length ?? 0) >= 3 &&
      (item.correctTypes?.length ?? 0) >= 2
    );
  }).length;
}

/**
 * Calculate count of learned words (box >= 1)
 */
export function calculateLearnedCount(items: SchedulerItem[]): number {
  return items.filter(
    (item) => item.type === "word" && item.box >= 1
  ).length;
}

/**
 * Calculate count of words being learned (box 1-3)
 */
export function calculateBeingLearnedCount(items: SchedulerItem[]): number {
  return items.filter(
    (item) => item.type === "word" && item.box >= 1 && item.box <= 3
  ).length;
}

/**
 * Calculate count of words fully mastered in spelling (spellBox >= 4)
 */
export function calculateSpellingMasteredCount(items: SchedulerItem[]): number {
  return items.filter(
    (item) => item.type === "word" && (item.spellBox ?? 0) >= 4
  ).length;
}

/**
 * Calculate overall accuracy from answer logs
 */
export function calculateAccuracy(logs: AnswerLog[]): number {
  if (logs.length === 0) return 0;
  const correct = logs.filter((l) => l.correct).length;
  return Math.round((correct / logs.length) * 100);
}

/**
 * Calculate accuracy for a specific date range (last N days)
 */
export function calculateAccuracyLastNDays(
  logs: AnswerLog[],
  days: number
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  const filtered = logs.filter((l) => l.day >= cutoffStr);
  if (filtered.length === 0) return 0;
  const correct = filtered.filter((l) => l.correct).length;
  return Math.round((correct / filtered.length) * 100);
}

/**
 * Calculate daily accuracies for charting
 */
export function calculateDailyAccuracies(
  logs: AnswerLog[]
): Array<{ date: string; accuracy: number }> {
  const byDate = new Map<string, { correct: number; total: number }>();

  for (const log of logs) {
    if (!byDate.has(log.day)) {
      byDate.set(log.day, { correct: 0, total: 0 });
    }
    const entry = byDate.get(log.day)!;
    entry.total++;
    if (log.correct) {
      entry.correct++;
    }
  }

  return Array.from(byDate.entries())
    .map(([date, { correct, total }]) => ({
      date,
      accuracy: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate daily question counts for charting
 */
export function calculateDailyQuestionCounts(
  logs: AnswerLog[]
): Array<{ date: string; count: number }> {
  const byDate = new Map<string, number>();

  for (const log of logs) {
    byDate.set(log.day, (byDate.get(log.day) ?? 0) + 1);
  }

  return Array.from(byDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Find trouble words: most frequently answered wrong
 */
export function findTroubleWords(
  items: SchedulerItem[],
  limit: number = 10
): Array<{
  itemId: string;
  correct: number;
  wrong: number;
  lastSeen: string;
}> {
  return items
    .filter((item) => item.type === "word" && item.wrong > 0)
    .map((item) => ({
      itemId: item.itemId,
      correct: item.correct,
      wrong: item.wrong,
      lastSeen: item.lastSeen,
    }))
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, limit);
}

/**
 * Calculate grammar accuracy per rule
 */
export function calculateGrammarAccuracy(
  logs: AnswerLog[],
  grammarIds: string[]
): Array<{ grammarId: string; accuracy: number }> {
  const byGrammar = new Map<
    string,
    { correct: number; total: number }
  >();

  for (const log of logs) {
    if (grammarIds.includes(log.itemId)) {
      if (!byGrammar.has(log.itemId)) {
        byGrammar.set(log.itemId, { correct: 0, total: 0 });
      }
      const entry = byGrammar.get(log.itemId)!;
      entry.total++;
      if (log.correct) {
        entry.correct++;
      }
    }
  }

  return Array.from(byGrammar.entries())
    .map(([grammarId, { correct, total }]) => ({
      grammarId,
      accuracy: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Calculate comprehension accuracy (read_answer, situation, picture_pick)
 */
export function calculateComprehensionAccuracy(logs: AnswerLog[]): number {
  const comprehensionTypes = [
    "read_answer",
    "situation",
    "picture_pick",
  ];
  const filtered = logs.filter((l) =>
    comprehensionTypes.includes(l.qType)
  );
  if (filtered.length === 0) return 0;
  const correct = filtered.filter((l) => l.correct).length;
  return Math.round((correct / filtered.length) * 100);
}

/**
 * Calculate spelling accuracy
 */
export function calculateSpellingAccuracy(
  items: SchedulerItem[]
): number {
  const wordItems = items.filter((item) => item.type === "word");
  if (wordItems.length === 0) return 0;

  let totalSpellingAttempts = 0;
  let totalSpellingCorrect = 0;

  for (const item of wordItems) {
    const correct = item.spellCorrect ?? 0;
    const wrong = item.spellWrong ?? 0;
    if (correct + wrong > 0) {
      totalSpellingAttempts += correct + wrong;
      totalSpellingCorrect += correct;
    }
  }

  if (totalSpellingAttempts === 0) return 0;
  return Math.round((totalSpellingCorrect / totalSpellingAttempts) * 100);
}

/**
 * Calculate pronunciation accuracy
 */
export function calculatePronunciationAccuracy(
  items: SchedulerItem[]
): number {
  const wordItems = items.filter((item) => item.type === "word");
  if (wordItems.length === 0) return 0;

  let totalSayAttempts = 0;
  let totalSayCorrect = 0;

  for (const item of wordItems) {
    const correct = item.sayCorrect ?? 0;
    const wrong = item.sayWrong ?? 0;
    if (correct + wrong > 0) {
      totalSayAttempts += correct + wrong;
      totalSayCorrect += correct;
    }
  }

  if (totalSayAttempts === 0) return 0;
  return Math.round((totalSayCorrect / totalSayAttempts) * 100);
}

/**
 * Find tricky spellings: words with lowest spelling accuracy
 */
export function findTrickySpellings(
  items: SchedulerItem[],
  limit: number = 10
): Array<{ itemId: string; correct: number; wrong: number }> {
  return items
    .filter(
      (item) =>
        item.type === "word" && ((item.spellCorrect ?? 0) + (item.spellWrong ?? 0) > 0)
    )
    .map((item) => ({
      itemId: item.itemId,
      correct: item.spellCorrect ?? 0,
      wrong: item.spellWrong ?? 0,
    }))
    .sort((a, b) => {
      const aAccuracy =
        a.correct / (a.correct + a.wrong);
      const bAccuracy =
        b.correct / (b.correct + b.wrong);
      return aAccuracy - bAccuracy;
    })
    .slice(0, limit);
}

/**
 * Find hard to say words: lowest pronunciation accuracy
 */
export function findHardToSayWords(
  items: SchedulerItem[],
  limit: number = 10
): Array<{ itemId: string; correct: number; wrong: number }> {
  return items
    .filter(
      (item) =>
        item.type === "word" &&
        ((item.sayCorrect ?? 0) + (item.sayWrong ?? 0) > 0)
    )
    .map((item) => ({
      itemId: item.itemId,
      correct: item.sayCorrect ?? 0,
      wrong: item.sayWrong ?? 0,
    }))
    .sort((a, b) => {
      const aAccuracy = a.correct / (a.correct + a.wrong);
      const bAccuracy = b.correct / (b.correct + b.wrong);
      return aAccuracy - bAccuracy;
    })
    .slice(0, limit);
}
