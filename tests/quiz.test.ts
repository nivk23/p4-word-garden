import { describe, it, expect } from "vitest";
import {
  buildDailyQuizWithSpelling,
  createPracticeOnlyRetry,
  shuffleOptionsWithCorrect,
} from "../src/lib/questions";
import type { SchedulerItem } from "../src/lib/scheduler";
import type { Question } from "../src/lib/questions";

const createSchedulerItem = (id: string, spellBox: number = 0): SchedulerItem => ({
  itemId: id,
  type: "word",
  introducedOn: "2024-01-01",
  box: 1,
  spellBox,
  correct: 0,
  wrong: 0,
  streak: 0,
  lastSeen: "2024-01-01",
  nextDue: "2024-01-01",
});

const createQuestion = (itemId: string): Question => ({
  id: itemId,
  type: "meaning",
  itemId,
  question: `What does ${itemId} mean?`,
  options: ["option1", "option2", "option3", "option4"],
  correctAnswer: 0,
});

describe("Quiz Integration", () => {
  describe("buildDailyQuizWithSpelling", () => {
    it("should include 2-3 spelling items when building quiz", () => {
      const mainQuiz = [
        createQuestion("huge"),
        createQuestion("tiny"),
        createQuestion("brave"),
      ];
      const items = [
        createSchedulerItem("huge", 0),
        createSchedulerItem("tiny", 1),
        createSchedulerItem("brave", 2),
      ];

      const quiz = buildDailyQuizWithSpelling(mainQuiz, items);

      const spellingQuestions = quiz.filter((q) => q.type.includes("spell"));
      expect(spellingQuestions.length).toBeGreaterThanOrEqual(2);
      expect(spellingQuestions.length).toBeLessThanOrEqual(3);
    });

    it("regression: never adds a say_word item (the pronunciation step was removed)", () => {
      const mainQuiz = [
        createQuestion("huge"),
        createQuestion("tiny"),
        createQuestion("brave"),
      ];
      const items = [
        createSchedulerItem("huge", 0),
        createSchedulerItem("tiny", 1),
        createSchedulerItem("brave", 2),
      ];

      const quiz = buildDailyQuizWithSpelling(mainQuiz, items);

      const sayWordQuestions = quiz.filter((q) => (q.type as string) === "say_word");
      expect(sayWordQuestions.length).toBe(0);
    });

    it("should use spell_tiles for spellBox 0-1", () => {
      const mainQuiz = [createQuestion("huge")];
      const items = [createSchedulerItem("huge", 0)];

      const quiz = buildDailyQuizWithSpelling(mainQuiz, items);

      const tilesQuestion = quiz.find((q) => q.type === "spell_tiles");
      expect(tilesQuestion).toBeDefined();
    });

    it("should use spell_missing for spellBox 2-3", () => {
      const mainQuiz = [createQuestion("tiny")];
      const items = [createSchedulerItem("tiny", 2)];

      const quiz = buildDailyQuizWithSpelling(mainQuiz, items);

      const missingQuestion = quiz.find((q) => q.type === "spell_missing");
      expect(missingQuestion).toBeDefined();
    });

    it("should use spell_type for spellBox 4+", () => {
      const mainQuiz = [createQuestion("brave")];
      const items = [createSchedulerItem("brave", 4)];

      const quiz = buildDailyQuizWithSpelling(mainQuiz, items);

      const typeQuestion = quiz.find((q) => q.type === "spell_type");
      expect(typeQuestion).toBeDefined();
    });

    it("should only include spelling items when meaning box >= 1", () => {
      const mainQuiz = [createQuestion("huge")];
      const items = [
        {
          ...createSchedulerItem("huge", 2),
          box: 0, // Not learned yet
        },
      ];

      const quiz = buildDailyQuizWithSpelling(mainQuiz, items);

      // Should have original question + no spelling (since box < 1)
      const spellingQuestions = quiz.filter((q) => q.type.includes("spell"));
      expect(spellingQuestions.length).toBe(0);
    });
  });

  describe("createPracticeOnlyRetry", () => {
    it("should mark question as practiceOnly", () => {
      const question = createQuestion("huge");
      const retry = createPracticeOnlyRetry(question);

      expect(retry.practiceOnly).toBe(true);
    });

    it("should create a new ID for retry", () => {
      const question = createQuestion("huge");
      const retry = createPracticeOnlyRetry(question);

      expect(retry.id).not.toBe(question.id);
      expect(retry.id).toContain("_retry");
    });

    it("should preserve other question properties", () => {
      const question = createQuestion("huge");
      const retry = createPracticeOnlyRetry(question);

      expect(retry.type).toBe(question.type);
      expect(retry.itemId).toBe(question.itemId);
      expect(retry.question).toBe(question.question);
      expect(retry.correctAnswer).toBe(question.correctAnswer);
    });
  });

  describe("shuffleOptionsWithCorrect", () => {
    it("should shuffle options", () => {
      const options = ["a", "b", "c", "d"];
      const { options: shuffled } = shuffleOptionsWithCorrect(options, 0);

      // At least some chance they're different order (very unlikely to be same multiple times)
      expect(shuffled.length).toBe(options.length);
      expect(new Set(shuffled)).toEqual(new Set(options)); // Same elements
    });

    it("should maintain correct answer's value in shuffled array", () => {
      const options = ["correct", "wrong1", "wrong2", "wrong3"];
      const { options: shuffled, correctAnswer } = shuffleOptionsWithCorrect(options, 0);

      expect(shuffled[correctAnswer]).toBe("correct");
    });

    it("should return new index of correct answer", () => {
      const options = ["opt1", "opt2", "opt3", "opt4"];
      const { correctAnswer: newIdx } = shuffleOptionsWithCorrect(options, 2);

      // The correct answer at index 2 should be found at newIdx in shuffled array
      expect(newIdx).toBeGreaterThanOrEqual(0);
      expect(newIdx).toBeLessThan(options.length);
    });

    it("should handle single-element options", () => {
      const options = ["only"];
      const { options: shuffled, correctAnswer } = shuffleOptionsWithCorrect(options, 0);

      expect(shuffled).toEqual(["only"]);
      expect(correctAnswer).toBe(0);
    });
  });

  describe("anti-guessing and re-queue", () => {
    it("should support practiceOnly flag to skip recording", () => {
      const question = createQuestion("huge");
      const retryQuestion = createPracticeOnlyRetry(question);

      expect(retryQuestion.practiceOnly).toBe(true);
      expect(question.practiceOnly).toBeUndefined();
    });

    it("should shuffle options on each render for anti-guessing", () => {
      const options = ["a", "b", "c", "d"];
      const results = [];

      for (let i = 0; i < 10; i++) {
        const { options: shuffled } = shuffleOptionsWithCorrect(options, 0);
        results.push(shuffled.join(""));
      }

      // Check that we get some variation in shuffling
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });
});
