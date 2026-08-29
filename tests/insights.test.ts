import { describe, it, expect } from "vitest";
import type { SchedulerItem } from "../src/lib/scheduler";
import type { AnswerLog } from "../src/store/progress";
import {
  calculateMasteredCount,
  calculateLearnedCount,
  calculateBeingLearnedCount,
  calculateSpellingMasteredCount,
  calculateAccuracy,
  calculateAccuracyLastNDays,
  calculateDailyAccuracies,
  calculateDailyQuestionCounts,
  findTroubleWords,
  calculateGrammarAccuracy,
  calculateComprehensionAccuracy,
  calculateSpellingAccuracy,
  findTrickySpellings,
} from "../src/lib/insights";

const createItem = (
  id: string,
  type: "word" | "grammar" = "word",
  box: number = 0
): SchedulerItem => ({
  itemId: id,
  type,
  introducedOn: "2024-01-01",
  box,
  correct: 0,
  wrong: 0,
  streak: 0,
  lastSeen: "2024-01-01",
  nextDue: "2024-01-01",
  correctDays: [],
  correctTypes: [],
});

describe("Insights", () => {
  describe("calculateMasteredCount", () => {
    it("should count words with streak >= 5 AND correctDays >= 3 AND correctTypes >= 2", () => {
      const item1 = createItem("word1");
      item1.streak = 5;
      item1.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      item1.correctTypes = ["meaning", "picture_pick"];

      const item2 = createItem("word2");
      item2.streak = 4; // Not enough streak

      const item3 = createItem("word3");
      item3.streak = 5;
      item3.correctDays = ["2024-01-01", "2024-01-02"]; // Not enough days

      const items = [item1, item2, item3];
      expect(calculateMasteredCount(items)).toBe(1);
    });

    it("should only count words, not grammar", () => {
      const word = createItem("word1", "word");
      word.streak = 5;
      word.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      word.correctTypes = ["meaning", "picture_pick"];

      const grammar = createItem("grammar1", "grammar");
      grammar.streak = 5;
      grammar.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      grammar.correctTypes = ["choose_form", "grammar_tag"];

      const items = [word, grammar];
      expect(calculateMasteredCount(items)).toBe(1);
    });
  });

  describe("calculateLearnedCount", () => {
    it("should count words with box >= 1", () => {
      const items = [
        createItem("word1", "word", 0),
        createItem("word2", "word", 1),
        createItem("word3", "word", 2),
      ];
      expect(calculateLearnedCount(items)).toBe(2);
    });
  });

  describe("calculateBeingLearnedCount", () => {
    it("should count words with 1 <= box <= 3", () => {
      const items = [
        createItem("word1", "word", 0),
        createItem("word2", "word", 1),
        createItem("word3", "word", 3),
        createItem("word4", "word", 4),
      ];
      expect(calculateBeingLearnedCount(items)).toBe(2);
    });
  });

  describe("calculateSpellingMasteredCount", () => {
    it("should count words with spellBox >= 4", () => {
      const item1 = createItem("word1", "word");
      item1.spellBox = 4;

      const item2 = createItem("word2", "word");
      item2.spellBox = 3;

      const items = [item1, item2];
      expect(calculateSpellingMasteredCount(items)).toBe(1);
    });
  });

  describe("calculateAccuracy", () => {
    it("should calculate overall accuracy", () => {
      const logs: AnswerLog[] = [
        {
          day: "2024-01-01",
          itemId: "word1",
          qType: "meaning",
          correct: true,
          ts: 0,
        },
        {
          day: "2024-01-01",
          itemId: "word2",
          qType: "meaning",
          correct: false,
          ts: 0,
        },
        {
          day: "2024-01-02",
          itemId: "word3",
          qType: "picture_pick",
          correct: true,
          ts: 0,
        },
      ];
      expect(calculateAccuracy(logs)).toBe(67);
    });

    it("should return 0 for empty logs", () => {
      expect(calculateAccuracy([])).toBe(0);
    });
  });

  describe("calculateSpellingAccuracy", () => {
    it("should calculate spelling accuracy from items", () => {
      const item1 = createItem("word1", "word");
      item1.spellCorrect = 5;
      item1.spellWrong = 1;

      const item2 = createItem("word2", "word");
      item2.spellCorrect = 4;
      item2.spellWrong = 2;

      const items = [item1, item2];
      // (5+4) / (5+1+4+2) = 9/12 = 75%
      expect(calculateSpellingAccuracy(items)).toBe(75);
    });
  });

  describe("calculateComprehensionAccuracy", () => {
    it("should calculate accuracy for comprehension question types", () => {
      const logs: AnswerLog[] = [
        {
          day: "2024-01-01",
          itemId: "word1",
          qType: "read_answer",
          correct: true,
          ts: 0,
        },
        {
          day: "2024-01-01",
          itemId: "word2",
          qType: "picture_pick",
          correct: false,
          ts: 0,
        },
        {
          day: "2024-01-01",
          itemId: "word3",
          qType: "situation",
          correct: true,
          ts: 0,
        },
        {
          day: "2024-01-01",
          itemId: "word4",
          qType: "meaning",
          correct: true,
          ts: 0,
        }, // Not comprehension type
      ];
      // Only first 3 count: 2/3 = 67%
      expect(calculateComprehensionAccuracy(logs)).toBe(67);
    });
  });

  describe("findTroubleWords", () => {
    it("should return words sorted by wrong count", () => {
      const items = [
        createItem("word1", "word"),
        createItem("word2", "word"),
        createItem("word3", "word"),
      ];
      items[0].wrong = 5;
      items[0].correct = 2;
      items[1].wrong = 3;
      items[1].correct = 4;
      items[2].wrong = 1;
      items[2].correct = 1;

      const trouble = findTroubleWords(items);
      expect(trouble[0].itemId).toBe("word1");
      expect(trouble[1].itemId).toBe("word2");
    });
  });

  describe("findTrickySpellings", () => {
    it("should return words sorted by spelling accuracy (lowest first)", () => {
      const items = [
        createItem("word1", "word"),
        createItem("word2", "word"),
      ];
      items[0].spellCorrect = 1;
      items[0].spellWrong = 3; // 25% accuracy
      items[1].spellCorrect = 3;
      items[1].spellWrong = 1; // 75% accuracy

      const tricky = findTrickySpellings(items);
      expect(tricky[0].itemId).toBe("word1");
      expect(tricky[1].itemId).toBe("word2");
    });
  });

  describe("calculateDailyAccuracies", () => {
    it("should calculate accuracy for each day", () => {
      const logs: AnswerLog[] = [
        { day: "2024-01-01", itemId: "w1", qType: "m", correct: true, ts: 0 },
        { day: "2024-01-01", itemId: "w2", qType: "m", correct: false, ts: 0 },
        { day: "2024-01-02", itemId: "w3", qType: "m", correct: true, ts: 0 },
      ];
      const daily = calculateDailyAccuracies(logs);
      expect(daily.length).toBe(2);
      expect(daily[0].date).toBe("2024-01-01");
      expect(daily[0].accuracy).toBe(50);
      expect(daily[1].date).toBe("2024-01-02");
      expect(daily[1].accuracy).toBe(100);
    });
  });

  describe("calculateDailyQuestionCounts", () => {
    it("should count questions per day", () => {
      const logs: AnswerLog[] = [
        { day: "2024-01-01", itemId: "w1", qType: "m", correct: true, ts: 0 },
        { day: "2024-01-01", itemId: "w2", qType: "m", correct: false, ts: 0 },
        { day: "2024-01-02", itemId: "w3", qType: "m", correct: true, ts: 0 },
      ];
      const daily = calculateDailyQuestionCounts(logs);
      expect(daily.length).toBe(2);
      expect(daily[0].count).toBe(2);
      expect(daily[1].count).toBe(1);
    });
  });

  describe("calculateGrammarAccuracy", () => {
    it("should calculate accuracy per grammar rule", () => {
      const logs: AnswerLog[] = [
        {
          day: "2024-01-01",
          itemId: "grammar1",
          qType: "choose_form",
          correct: true,
          ts: 0,
        },
        {
          day: "2024-01-01",
          itemId: "grammar1",
          qType: "choose_form",
          correct: false,
          ts: 0,
        },
        {
          day: "2024-01-01",
          itemId: "grammar2",
          qType: "grammar_tag",
          correct: true,
          ts: 0,
        },
      ];
      const acc = calculateGrammarAccuracy(logs, ["grammar1", "grammar2"]);
      expect(acc.length).toBe(2);
      expect(acc.find((a) => a.grammarId === "grammar1")?.accuracy).toBe(50);
      expect(acc.find((a) => a.grammarId === "grammar2")?.accuracy).toBe(100);
    });
  });
});
