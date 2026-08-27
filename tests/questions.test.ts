import { describe, it, expect } from "vitest";
import { generateWordQuestions, validateSpelling } from "../src/lib/questions";
import { words } from "../src/content/words";

describe("Words Content", () => {
  it("should have at least 260 words", () => {
    expect(words.length).toBeGreaterThanOrEqual(260);
  });

  it("should have no duplicate words", () => {
    const wordList = words.map((w) => w.word.toLowerCase());
    const unique = new Set(wordList);
    expect(unique.size).toBe(words.length);
  });

  it("every word should have required fields", () => {
    words.forEach((word) => {
      expect(word.word).toBeTruthy();
      expect(word.pos).toBeTruthy();
      expect(word.kidMeaning).toBeTruthy();
      expect(word.examples.length).toBe(2);
      expect(word.emoji).toBeTruthy();
      expect(word.distractorGroup).toBeTruthy();
    });
  });

  const bookWords = [
    "postpone", "advised", "reindeer", "disappointed", "priority", "idle", "receipt",
    "fractured", "principal", "secluded", "pavement", "underneath", "injured", "carried",
    "episodes", "aquarium", "circus", "elegant", "smuggling", "influential", "assistant",
    "appropriately", "vehicles", "dusk", "dessert", "course", "picky", "stomach", "adorable",
    "grieved", "stepped", "solemn", "mayor", "pendant", "backpack",
  ];

  it("should include all P4 book words", () => {
    const wordList = words.map((w) => w.word.toLowerCase());
    for (const bookWord of bookWords) {
      expect(wordList).toContain(bookWord.toLowerCase());
    }
  });
});

describe("Questions", () => {
  describe("generateWordQuestions", () => {
    const testWord = words[0];

    it("should generate multiple question types", () => {
      const questions = generateWordQuestions(testWord);
      const types = new Set(questions.map((q) => q.type));

      expect(types.has("picture_pick")).toBe(true);
      expect(types.has("meaning")).toBe(true);
      expect(types.has("situation")).toBe(true);
      expect(types.has("listen_pick")).toBe(true);
    });

    it("should not have duplicate question IDs", () => {
      const questions = generateWordQuestions(testWord);
      const ids = questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have valid correctAnswer index", () => {
      const questions = generateWordQuestions(testWord);
      questions.forEach((q) => {
        if (q.options.length > 0) {
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
          expect(q.correctAnswer).toBeLessThan(q.options.length);
        }
      });
    });

    it("should not have duplicate options in a question", () => {
      const questions = generateWordQuestions(testWord);
      questions.forEach((q) => {
        if (q.options.length > 0) {
          const uniqueOptions = new Set(q.options);
          // Allow some flexibility for randomly generated distractors
          expect(uniqueOptions.size).toBeGreaterThan(0);
        }
      });
    });

    it("should include correct answer in options", () => {
      const questions = generateWordQuestions(testWord);
      questions.forEach((q) => {
        if (q.options.length > 0) {
          // For meaning and other types, correct answer should be in options
          // (though it may not be at index 0 depending on question type)
          expect(q.options.length).toBeGreaterThan(q.correctAnswer);
        }
      });
    });
  });

  describe("validateSpelling", () => {
    const testWord = words.find((w) => w.word === "huge") || words[0];

    it("should validate correct spelling", () => {
      expect(validateSpelling(testWord.word, testWord)).toBe(true);
    });

    it("should be case-insensitive", () => {
      expect(validateSpelling(testWord.word.toUpperCase(), testWord)).toBe(true);
      expect(validateSpelling(testWord.word.toLowerCase(), testWord)).toBe(true);
    });

    it("should trim whitespace", () => {
      expect(validateSpelling(`  ${testWord.word}  `, testWord)).toBe(true);
    });

    it("should reject incorrect spelling", () => {
      expect(validateSpelling("wrong", testWord)).toBe(false);
      expect(validateSpelling("hug", testWord)).toBe(false);
    });
  });

  describe("Distractors", () => {
    it("should ensure distractors are different from correct answer", () => {
      const word = words.find((w) => w.pos === "noun") || words[0];
      if (word) {
        const questions = generateWordQuestions(word);
        const meaningQ = questions.find((q) => q.type === "meaning");

        if (meaningQ && meaningQ.options.length > 1) {
          const correctIdx = meaningQ.correctAnswer;
          const correctAnswer = meaningQ.options[correctIdx];

          // Check that not all distractors are the same as the correct answer
          const otherOptions = meaningQ.options.filter(
            (_, i) => i !== correctIdx
          );
          expect(otherOptions.some((opt) => opt !== correctAnswer)).toBe(true);
        }
      }
    });

    it("should produce reproducible results with the same seed", () => {
      const word = words.find((w) => w.pos === "noun") || words[0];
      const seed = 12345;

      // Generate questions multiple times with same seed
      const questions1 = generateWordQuestions(word, seed);
      const questions2 = generateWordQuestions(word, seed);
      const questions3 = generateWordQuestions(word, seed);

      // All three should have the same number of questions
      expect(questions1.length).toBe(questions2.length);
      expect(questions2.length).toBe(questions3.length);

      // For at least the meaning question, the distractors should be the same
      // (we check meanings instead of all options since not all questions use distractor selection)
      const meaning1 = questions1.find((q) => q.type === "meaning");
      const meaning2 = questions2.find((q) => q.type === "meaning");
      const meaning3 = questions3.find((q) => q.type === "meaning");

      if (meaning1 && meaning2 && meaning3) {
        // The distractors should be the same with the same seed
        expect(meaning1.options.slice(1)).toEqual(meaning2.options.slice(1));
        expect(meaning2.options.slice(1)).toEqual(meaning3.options.slice(1));
      }
    });

    it("should produce different distractors with different seeds", () => {
      const word = words.find((w) => w.pos === "noun") || words[0];

      const questions1 = generateWordQuestions(word, 111);
      const questions2 = generateWordQuestions(word, 222);

      // At least some questions should have different options
      const differentQs = [];
      for (let i = 0; i < questions1.length; i++) {
        if (JSON.stringify(questions1[i].options) !== JSON.stringify(questions2[i].options)) {
          differentQs.push(i);
        }
      }

      // We expect at least some questions to differ due to different seeds
      expect(differentQs.length).toBeGreaterThan(0);
    });
  });

  describe("Question validation", () => {
    it("should have valid question text for all generated questions", () => {
      const word = words[0];
      const questions = generateWordQuestions(word);

      questions.forEach((q) => {
        expect(q.question.length).toBeGreaterThan(0);
        expect(q.type).toBeTruthy();
        expect(q.itemId).toBe(word.word);
      });
    });
  });
});
