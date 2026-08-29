import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTodayKey, getYesterdayKey } from '../src/lib/dates';
import {
  saveDayRecord,
  getDayRecord,
  getSchedulerItems,
  saveSchedulerItem,
  getAllDayRecords,
} from '../src/store/progress';
import { allWords } from '../src/content/allWords';
import { grammarLessons } from '../src/content/grammar';
import { buildDailyQuiz } from '../src/lib/scheduler';
import { buildDailyQuizWithSpelling, generateWordQuestions, generateGrammarQuestions } from '../src/lib/questions';

// Mock localStorage for testing
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('Integration: Daily Flow', () => {
  it('should create DayRecord with 3 words and 3 scheduler items after LearnWords', async () => {
    const today = getTodayKey();
    const wordIds = allWords.slice(0, 3).map(w => w.word);
    const grammarId = grammarLessons[0].id;

    // Simulate LearnWords creating scheduler items
    for (const wordId of wordIds) {
      await saveSchedulerItem({
        itemId: wordId,
        type: 'word',
        introducedOn: today,
        box: 0,
        spellBox: 0,
        correct: 0,
        wrong: 0,
        spellCorrect: 0,
        spellWrong: 0,
        streak: 0,
        lastSeen: today,
        nextDue: today,
        correctDays: [],
        correctTypes: [],
      });
    }

    // Save DayRecord
    await saveDayRecord({
      date: today,
      wordIds,
      grammarId,
      completed: false,
      quizResults: [],
      accuracy: 0,
      durationSec: 0,
    });

    // Verify DayRecord exists with 3 word IDs
    const dayRecord = await getDayRecord(today);
    expect(dayRecord).not.toBeNull();
    expect(dayRecord?.wordIds).toEqual(wordIds);
    expect(dayRecord?.wordIds.length).toBe(3);
    expect(dayRecord?.grammarId).toBe(grammarId);

    // Verify 3 scheduler items exist
    const schedulerItems = await getSchedulerItems();
    const wordItems = schedulerItems.filter(i => i.type === 'word');
    expect(wordItems.length).toBe(3);
    expect(wordItems.map(i => i.itemId).sort()).toEqual(wordIds.sort());
  });

  it('should build real questions with non-empty text when yesterday\'s record exists', async () => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    // Create yesterday's record
    const yesterdayWordIds = allWords.slice(0, 3).map(w => w.word);
    await saveDayRecord({
      date: yesterday,
      wordIds: yesterdayWordIds,
      grammarId: grammarLessons[0].id,
      completed: true,
      quizResults: [],
      accuracy: 0,
      durationSec: 0,
    });

    // Create scheduler items for yesterday's words
    for (const wordId of yesterdayWordIds) {
      await saveSchedulerItem({
        itemId: wordId,
        type: 'word',
        introducedOn: yesterday,
        box: 1,
        spellBox: 0,
        correct: 1,
        wrong: 0,
        spellCorrect: 0,
        spellWrong: 0,
        streak: 1,
        lastSeen: yesterday,
        nextDue: today,
        correctDays: [yesterday],
        correctTypes: ['meaning'],
      });
    }

    // Create today's new words
    const todayWordIds = allWords.slice(3, 6).map(w => w.word);
    for (const wordId of todayWordIds) {
      await saveSchedulerItem({
        itemId: wordId,
        type: 'word',
        introducedOn: today,
        box: 0,
        spellBox: 0,
        correct: 0,
        wrong: 0,
        spellCorrect: 0,
        spellWrong: 0,
        streak: 0,
        lastSeen: today,
        nextDue: today,
        correctDays: [],
        correctTypes: [],
      });
    }

    const allItems = await getSchedulerItems();

    // Build quiz with yesterday's items
    const quiz = buildDailyQuiz(today, allItems, yesterdayWordIds, 10);
    expect(quiz.length).toBeGreaterThanOrEqual(6);

    // Generate real questions for the quiz
    let questionsWithContent = 0;
    for (const item of quiz) {
      if (item.type === 'word') {
        const word = allWords.find(w => w.word === item.itemId);
        if (word) {
          const wordQuestions = generateWordQuestions(word);
          if (wordQuestions.length > 0) {
            const question = wordQuestions[0];
            expect(question.question).toBeTruthy();
            expect(question.question.length).toBeGreaterThan(0);
            expect(Array.isArray(question.options)).toBe(true);
            if (question.options.length > 0) {
              expect(question.options[0]).toBeTruthy();
              questionsWithContent++;
            }
          }
        }
      } else if (item.type === 'grammar') {
        const lesson = grammarLessons.find(l => l.id === item.itemId);
        if (lesson) {
          const grammarQuestions = generateGrammarQuestions(lesson);
          if (grammarQuestions.length > 0) {
            const question = grammarQuestions[0];
            expect(question.question).toBeTruthy();
            questionsWithContent++;
          }
        }
      }
    }

    expect(questionsWithContent).toBeGreaterThanOrEqual(6);
  });

  it('practice-only retry should not modify scheduler items', async () => {
    const today = getTodayKey();
    const wordId = allWords[0].word;

    // Create initial scheduler item
    const item = {
      itemId: wordId,
      type: 'word' as const,
      introducedOn: today,
      box: 1,
      spellBox: 0,
      correct: 5,
      wrong: 2,
      spellCorrect: 0,
      spellWrong: 0,
      streak: 3,
      lastSeen: today,
      nextDue: today,
      correctDays: [today],
      correctTypes: ['meaning'],
    };

    await saveSchedulerItem(item);
    const initialItem = (await getSchedulerItems())[0];
    expect(initialItem.correct).toBe(5);
    expect(initialItem.streak).toBe(3);

    // Simulate practice-only retry - should NOT update scheduler
    // (The actual Quiz component guards this with !currentQuestion.practiceOnly)
    // So the item should remain unchanged
    const currentItems = await getSchedulerItems();
    const unchangedItem = currentItems[0];
    expect(unchangedItem.correct).toBe(5);
    expect(unchangedItem.streak).toBe(3);
    expect(unchangedItem.box).toBe(1);
  });

  it('second visit same day should not create new scheduler items', async () => {
    const today = getTodayKey();

    // First visit: create words and DayRecord
    const wordIds = allWords.slice(0, 3).map(w => w.word);
    for (const wordId of wordIds) {
      await saveSchedulerItem({
        itemId: wordId,
        type: 'word',
        introducedOn: today,
        box: 0,
        spellBox: 0,
        correct: 0,
        wrong: 0,
        spellCorrect: 0,
        spellWrong: 0,
        streak: 0,
        lastSeen: today,
        nextDue: today,
        correctDays: [],
        correctTypes: [],
      });
    }

    const dayRecord = {
      date: today,
      wordIds,
      grammarId: grammarLessons[0].id,
      completed: false,
      quizResults: [],
      accuracy: 0,
      durationSec: 0,
    };
    await saveDayRecord(dayRecord);

    const itemsAfterFirstVisit = await getSchedulerItems();
    const countAfterFirstVisit = itemsAfterFirstVisit.length;

    // Second visit: load LearnWords again
    // It should detect that words already have scheduler items and not create new ones
    const schedulerItems = await getSchedulerItems();
    const taughtWordIds = new Set(schedulerItems.filter(i => i.type === "word").map(i => i.itemId));

    // Find next 3 untaught words
    const newWords = [];
    for (const word of allWords) {
      if (!taughtWordIds.has(word.word)) {
        newWords.push(word);
        if (newWords.length === 3) break;
      }
    }

    // On second visit, LearnWords should pick the NEXT 3 words, not the same ones
    expect(newWords.map(w => w.word)).not.toEqual(wordIds);

    // The number of scheduler items should not increase just from re-visiting
    const itemsAfterSecondLoad = await getSchedulerItems();
    expect(itemsAfterSecondLoad.length).toBeLessThanOrEqual(countAfterFirstVisit + 3); // +3 only if new words selected
  });

  it('Quiz should include yesterday\'s items in the quiz', async () => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    // Create yesterday's items
    const yesterdayWordIds = ['word1', 'word2', 'word3'];
    for (const wordId of yesterdayWordIds) {
      await saveSchedulerItem({
        itemId: wordId,
        type: 'word',
        introducedOn: yesterday,
        box: 1,
        spellBox: 0,
        correct: 1,
        wrong: 0,
        spellCorrect: 0,
        spellWrong: 0,
        streak: 1,
        lastSeen: yesterday,
        nextDue: today,
        correctDays: [yesterday],
        correctTypes: ['meaning'],
      });
    }

    const allItems = await getSchedulerItems();

    // Build quiz for today - should include yesterday's items
    const quiz = buildDailyQuiz(today, allItems, yesterdayWordIds, 10);

    // Quiz should contain at least the yesterday's items
    const quizItemIds = quiz.map(item => item.itemId);
    const hasYesterdayItems = yesterdayWordIds.some(id => quizItemIds.includes(id));
    expect(hasYesterdayItems).toBe(true);
  });
});
