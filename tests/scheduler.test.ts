import { describe, it, expect } from "vitest";
import {
  markCorrect,
  markWrong,
  calculateWeight,
  buildDailyQuiz,
  addDays,
  isMastered,
  SchedulerItem,
} from "../src/lib/scheduler";

describe("Scheduler", () => {
  const createItem = (id: string, box: number = 0): SchedulerItem => ({
    itemId: id,
    type: "word",
    introducedOn: "2024-01-01",
    box,
    correct: 0,
    wrong: 0,
    streak: 0,
    lastSeen: "2024-01-01",
    nextDue: "2024-01-01",
  });

  describe("markCorrect", () => {
    it("should increase box by 1", () => {
      const item = createItem("word1", 0);
      const updated = markCorrect(item, "2024-01-02");
      expect(updated.box).toBe(1);
    });

    it("should increment correct count", () => {
      const item = createItem("word1", 0);
      const updated = markCorrect(item, "2024-01-02");
      expect(updated.correct).toBe(1);
    });

    it("should set nextDue based on box interval", () => {
      const item = createItem("word1", 0);
      const updated = markCorrect(item, "2024-01-02");
      expect(updated.nextDue).toBe("2024-01-04"); // box 1 = 2 days
    });

    it("should cap box at 5", () => {
      const item = createItem("word1", 5);
      const updated = markCorrect(item, "2024-01-02");
      expect(updated.box).toBe(5);
    });

    it("regression: does not add a spellBox key at all for an item that never had one (e.g. a grammar item) — a literal `undefined` value crashes Firestore's setDoc()", () => {
      const grammarItem: SchedulerItem = { ...createItem("lesson_1", 0), type: "grammar" };
      expect("spellBox" in grammarItem).toBe(false);

      const updated = markCorrect(grammarItem, "2024-01-02");

      expect("spellBox" in updated).toBe(false);
      // A stronger check than `=== undefined`: JSON.stringify drops keys
      // whose value is undefined but would still include one explicitly
      // set to `undefined` as... nothing, since JSON has no `undefined` —
      // so round-tripping is a reasonable proxy for "Firestore would
      // accept this", but the `in` check above is the direct assertion.
      expect(JSON.parse(JSON.stringify(updated))).not.toHaveProperty("spellBox");
    });

    it("still increments spellBox normally for a word item that has one", () => {
      const item: SchedulerItem = { ...createItem("huge", 0), spellBox: 2 };
      const updated = markCorrect(item, "2024-01-02");
      expect(updated.spellBox).toBe(3);
    });
  });

  describe("markWrong", () => {
    it("should decrease box by 2", () => {
      const item = createItem("word1", 3);
      const updated = markWrong(item, "2024-01-02");
      expect(updated.box).toBe(1);
    });

    it("should clamp box to 0", () => {
      const item = createItem("word1", 1);
      const updated = markWrong(item, "2024-01-02");
      expect(updated.box).toBe(0);
    });

    it("should increment wrong count", () => {
      const item = createItem("word1", 1);
      const updated = markWrong(item, "2024-01-02");
      expect(updated.wrong).toBe(1);
    });

    it("should set nextDue to tomorrow", () => {
      const item = createItem("word1", 1);
      const updated = markWrong(item, "2024-01-02");
      expect(updated.nextDue).toBe("2024-01-03");
    });

    it("should reset streak", () => {
      const item = createItem("word1", 1);
      item.streak = 5;
      const updated = markWrong(item, "2024-01-02");
      expect(updated.streak).toBe(0);
    });
  });

  describe("calculateWeight", () => {
    it("should calculate weight based on wrong and correct", () => {
      const item = createItem("word1");
      item.wrong = 2;
      item.correct = 1;
      // weight = 1 + 3*2 - 1/2 = 1 + 6 - 0.5 = 6.5
      expect(calculateWeight(item)).toBe(6.5);
    });

    it("should clamp to minimum 0.5", () => {
      const item = createItem("word1");
      item.wrong = 0;
      item.correct = 10;
      // weight = 1 + 0 - 5 = -4, clamped to 0.5
      expect(calculateWeight(item)).toBe(0.5);
    });
  });

  describe("buildDailyQuiz", () => {
    it("should include all yesterday's items", () => {
      const items = [
        createItem("word1", 1),
        createItem("word2", 1),
        createItem("word3", 1),
        createItem("word4", 0),
      ];
      const yesterdayIds = ["word1", "word2", "word3"];
      const quiz = buildDailyQuiz("2024-01-02", items, yesterdayIds, 10);

      expect(quiz.some((i) => i.itemId === "word1")).toBe(true);
      expect(quiz.some((i) => i.itemId === "word2")).toBe(true);
      expect(quiz.some((i) => i.itemId === "word3")).toBe(true);
    });

    it("should not exceed max size", () => {
      const items = Array.from({ length: 20 }, (_, i) =>
        createItem(`word${i}`, 0)
      );
      const quiz = buildDailyQuiz("2024-01-02", items, [], 10);
      expect(quiz.length).toBeLessThanOrEqual(10);
    });

    it("should not include duplicates", () => {
      const items = [
        createItem("word1", 1),
        createItem("word2", 1),
        createItem("word3", 0),
      ];
      const quiz = buildDailyQuiz("2024-01-02", items, ["word1"], 10);
      const ids = quiz.map((i) => i.itemId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("addDays", () => {
    it("should add days correctly", () => {
      expect(addDays("2024-01-01", 1)).toBe("2024-01-02");
      expect(addDays("2024-01-01", 7)).toBe("2024-01-08");
      expect(addDays("2024-01-31", 1)).toBe("2024-02-01");
    });

    it("should handle negative days", () => {
      expect(addDays("2024-01-02", -1)).toBe("2024-01-01");
    });
  });

  describe("isMastered", () => {
    it("should require all three conditions: streak >= 5, correctDays >= 3, correctTypes >= 2", () => {
      const item = createItem("word1", 5);
      item.streak = 5;
      item.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      item.correctTypes = ["meaning", "picture_pick"];
      expect(isMastered(item)).toBe(true);
    });

    it("should return false if streak < 5", () => {
      const item = createItem("word1", 5);
      item.streak = 4;
      item.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      item.correctTypes = ["meaning", "picture_pick"];
      expect(isMastered(item)).toBe(false);
    });

    it("should return false if correctDays < 3", () => {
      const item = createItem("word1", 5);
      item.streak = 5;
      item.correctDays = ["2024-01-01", "2024-01-02"];
      item.correctTypes = ["meaning", "picture_pick"];
      expect(isMastered(item)).toBe(false);
    });

    it("should return false if correctTypes < 2", () => {
      const item = createItem("word1", 5);
      item.streak = 5;
      item.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      item.correctTypes = ["meaning"];
      expect(isMastered(item)).toBe(false);
    });
  });

  describe("mastery tracking", () => {
    it("should track correctDays when answering correctly", () => {
      const item = createItem("word1", 0);
      const day1 = markCorrect(item, "2024-01-01");
      expect(day1.correctDays).toContain("2024-01-01");

      const day2 = markCorrect(day1, "2024-01-02");
      expect(day2.correctDays).toContain("2024-01-01");
      expect(day2.correctDays).toContain("2024-01-02");
    });

    it("should track correctTypes when answering correctly", () => {
      const item = createItem("word1", 0);
      const type1 = markCorrect(item, "2024-01-01", "meaning");
      expect(type1.correctTypes).toContain("meaning");

      const type2 = markCorrect(type1, "2024-01-02", "picture_pick");
      expect(type2.correctTypes).toContain("meaning");
      expect(type2.correctTypes).toContain("picture_pick");
    });

    it("should reset correctDays and correctTypes on wrong answer", () => {
      const item = createItem("word1", 3);
      item.streak = 5;
      item.correctDays = ["2024-01-01", "2024-01-02", "2024-01-03"];
      item.correctTypes = ["meaning", "picture_pick"];

      const updated = markWrong(item, "2024-01-04");
      expect(updated.correctDays).toEqual([]);
      expect(updated.correctTypes).toEqual([]);
    });
  });
});
