import type { Word } from "../content/words";
import { allWords } from "../content/allWords";
import type { GrammarLesson } from "../content/grammar";
import { passages } from "../content/passages";
import type { SchedulerItem } from "./scheduler";

export type QuestionType =
  | "picture_pick"
  | "meaning"
  | "situation"
  | "read_answer"
  | "fill_blank"
  | "pick_sentence"
  | "listen_pick"
  | "grammar_tag"
  | "word_order"
  | "choose_form"
  | "editing"
  | "spell_tiles"
  | "spell_missing"
  | "spell_type"
  | "say_word";

export interface Question {
  id: string;
  type: QuestionType;
  itemId: string; // word or grammar ID
  question: string;
  options: string[]; // for most types
  correctAnswer: number; // index in options
  context?: string; // passage text for read_answer
  practiceOnly?: boolean; // for anti-guessing: don't record this attempt
}

/**
 * Generate all question types for a word
 */
export function generateWordQuestions(word: Word, askSeed?: number): Question[] {
  const questions: Question[] = [];

  // picture_pick: "Which emoji shows this word?"
  questions.push({
    id: `${word.word}_picture`,
    type: "picture_pick",
    itemId: word.word,
    question: `Which emoji shows "${word.word}"?`,
    options: [word.emoji, getRandomEmojis(3)].flat(),
    correctAnswer: 0, // shuffle would change this
  });

  // meaning: "What does X mean?"
  const meaningsSeed = askSeed !== undefined ? askSeed * 31 + 1 : undefined;
  const meanings = [word.kidMeaning, ...getRandomMeanings(3, word.word, meaningsSeed)];
  questions.push({
    id: `${word.word}_meaning`,
    type: "meaning",
    itemId: word.word,
    question: `What does "${word.word}" mean?`,
    options: meanings,
    correctAnswer: 0,
  });

  // situation: "Which word fits this situation?"
  const situationSeed = askSeed !== undefined ? askSeed * 31 + 2 : undefined;
  questions.push({
    id: `${word.word}_situation`,
    type: "situation",
    itemId: word.word,
    question: `${word.examples[0]} Which word is it?`,
    options: [word.word, ...getRandomWords(3, word.pos, situationSeed)],
    correctAnswer: 0,
  });

  // fill_blank: "The ___ dog ran fast."
  if (word.pos === "adjective") {
    const fillSeed = askSeed !== undefined ? askSeed * 31 + 3 : undefined;
    questions.push({
      id: `${word.word}_fill`,
      type: "fill_blank",
      itemId: word.word,
      question: `The ___ dog ran fast.`,
      options: [word.word, ...getRandomWords(3, "adjective", fillSeed)],
      correctAnswer: 0,
    });
  }

  // pick_sentence: which sentence uses the word correctly?
  questions.push({
    id: `${word.word}_pick_sentence`,
    type: "pick_sentence",
    itemId: word.word,
    question: `Which sentence uses "${word.word}" correctly?`,
    options: word.examples.map((ex) => ex),
    correctAnswer: 0,
  });

  // listen_pick: word is spoken, pick the spelling
  const listenSeed = askSeed !== undefined ? askSeed * 31 + 4 : undefined;
  questions.push({
    id: `${word.word}_listen`,
    type: "listen_pick",
    itemId: word.word,
    question: `Listen to the word. Pick the correct spelling.`,
    options: [word.word, ...getRandomWords(3, word.pos, listenSeed)],
    correctAnswer: 0,
  });

  // editing: misspelled word or variant
  if (word.spellingTip) {
    questions.push({
      id: `${word.word}_editing`,
      type: "editing",
      itemId: word.word,
      question: `Which spelling is correct for "${word.word}"?`,
      options: [word.word, getMisspellings(word.word, 2)].flat(),
      correctAnswer: 0,
    });
  }

  return questions;
}

/**
 * Generate questions for a grammar lesson
 */
export function generateGrammarQuestions(lesson: GrammarLesson): Question[] {
  return lesson.practiceItems.map((item, idx) => ({
    id: `${lesson.id}_${idx}`,
    type: item.type as any,
    itemId: lesson.id,
    question: item.question,
    options: item.options || [],
    correctAnswer: typeof item.correctAnswer === "number" ? item.correctAnswer : 0,
    context: item.sentence,
  }));
}

/**
 * Pick a random passage for the day
 */
export function selectDailyPassage(): { passage: string; questions: Array<{ q: string; a: number }> } {
  const passage = passages[Math.floor(Math.random() * passages.length)];
  return {
    passage: passage.text,
    questions: passage.questions.map((q) => ({ q: q.question, a: q.correctAnswer })),
  };
}

// Helper functions

function getRandomEmojis(count: number): string[] {
  const emojis = ["🎉", "🎨", "🎭", "🎪", "🎸", "🎮", "🏀", "⚽", "🐶", "🐱"];
  return shuffleArray(emojis).slice(0, count);
}

function getRandomMeanings(count: number, excludeWord: string, seed?: number): string[] {
  const candidates = allWords.filter((w) => w.word !== excludeWord);
  const shuffled = shuffleArray(candidates, seed);
  return shuffled
    .slice(0, count)
    .map((w) => w.kidMeaning);
}

function getRandomWords(count: number, pos: string, seed?: number): string[] {
  const candidates = allWords.filter((w) => w.pos === pos);
  const shuffled = shuffleArray(candidates, seed);
  return shuffled
    .slice(0, count)
    .map((w) => w.word);
}

function getMisspellings(word: string, count: number): string[] {
  const misspellings: string[] = [];
  // Simple misspelling: swap letters, add/remove letters
  if (word.length > 2) {
    misspellings.push(word.slice(0, -1)); // drop last
    misspellings.push(word + "e"); // add e
  }
  return misspellings.slice(0, count);
}

function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];

  // Simple seeded random number generator
  const random = seed !== undefined ?
    (() => {
      seed = (seed! * 9301 + 49297) % 233280;
      return seed! / 233280;
    }) :
    () => Math.random();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a spelling question with letter tiles
 * spellBox 0-1: letter tiles (some included letters + decoys)
 */
export function generateSpellTilesQuestion(word: Word): Question {
  const letters = word.word.split("");
  const decoys = getDecoyLetters(word.word, 2);
  const tiles = shuffleArray([...letters, ...decoys]);

  return {
    id: `${word.word}_spell_tiles`,
    type: "spell_tiles",
    itemId: word.word,
    question: `Tap the letters in order to spell "${word.word}"`,
    options: tiles, // will be rendered as tiles
    correctAnswer: 0, // not used for tiles - validation is different
  };
}

/**
 * Generate a spelling question with missing letters
 * spellBox 2-3: word with tricky letters blanked
 */
export function generateSpellMissingQuestion(word: Word): Question {
  const blanked = blankTrickyLetters(word.word, word.spellingTip);

  return {
    id: `${word.word}_spell_missing`,
    type: "spell_missing",
    itemId: word.word,
    question: `Fill in the missing letters: ${blanked}`,
    options: [], // will be filled by user
    correctAnswer: 0,
  };
}

/**
 * Generate a spelling question: type the whole word
 * spellBox 4+: full spelling from hearing + example
 */
export function generateSpellTypeQuestion(word: Word): Question {
  return {
    id: `${word.word}_spell_type`,
    type: "spell_type",
    itemId: word.word,
    question: `Listen and type the word (from example): "${word.examples[0]}"`,
    options: [],
    correctAnswer: 0,
  };
}

/**
 * Get decoy letters for spelling tiles
 */
function getDecoyLetters(word: string, count: number): string[] {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const used = new Set(word.toLowerCase().split(""));
  const available = alphabet.split("").filter((l) => !used.has(l));
  return available.slice(0, count);
}

/**
 * Blank out tricky letters based on spelling tip
 */
function blankTrickyLetters(word: string, tip?: string): string {
  if (!tip) {
    return word
      .split("")
      .map((c, i) => (i % 2 === 0 ? c : "_"))
      .join("");
  }

  // Simple heuristic: blank vowels that might be confused (e.g., ie, ei, ou, au)
  let result = word;
  if (tip.includes("ei")) {
    result = result.replace(/ei/i, "_ _");
  } else if (tip.includes("ie")) {
    result = result.replace(/ie/i, "_ _");
  }
  return result;
}

/**
 * Validate spelling answer
 */
export function validateSpelling(answer: string, word: Word): boolean {
  return answer.toLowerCase().trim() === word.word.toLowerCase();
}

/**
 * Shuffle options for a question (anti-guessing)
 */
export function shuffleOptionsWithCorrect(
  options: string[],
  correctIdx: number
): { options: string[]; correctAnswer: number } {
  const correct = options[correctIdx];
  const shuffled = shuffleArray(options);
  return {
    options: shuffled,
    correctAnswer: shuffled.indexOf(correct),
  };
}

/**
 * Build a daily quiz with spelling and say_word items
 * Includes 2-3 spelling items per review quiz, ≤ 1 say_word item
 */
export function buildDailyQuizWithSpelling(
  mainQuiz: Question[],
  schedulerItems: SchedulerItem[]
): Question[] {
  const quiz = [...mainQuiz];
  const wordItems = schedulerItems.filter((i) => i.type === "word" && i.box >= 1);

  // Add 2-3 spelling items (by spellBox progression)
  const spellingItems = wordItems.slice(0, 6); // candidates
  let spellingCount = 0;
  for (const item of spellingItems) {
    if (spellingCount >= 3) break;

    const word = allWords.find((w) => w.word === item.itemId);
    if (!word) continue;

    const spellBox = item.spellBox ?? 0;
    let spellQuestion: Question | null = null;

    if (spellBox <= 1) {
      spellQuestion = generateSpellTilesQuestion(word);
    } else if (spellBox <= 3) {
      spellQuestion = generateSpellMissingQuestion(word);
    } else {
      spellQuestion = generateSpellTypeQuestion(word);
    }

    if (spellQuestion) {
      quiz.push(spellQuestion);
      spellingCount++;
    }
  }

  // Add ≤ 1 say_word item
  const sayItem = wordItems.find(
    (i) => i.box >= 1 && !quiz.some((q) => q.itemId === i.itemId && q.type.includes("spell"))
  );
  if (sayItem) {
    const word = allWords.find((w) => w.word === sayItem.itemId);
    if (word) {
      quiz.push({
        id: `${word.word}_say`,
        type: "say_word",
        itemId: word.word,
        question: `Say this word: "${word.word}"`,
        options: [],
        correctAnswer: 0,
      });
    }
  }

  return quiz;
}

/**
 * Add a practice-only re-queue of a failed item
 * (result won't be recorded to scheduler)
 */
export function createPracticeOnlyRetry(question: Question): Question {
  return {
    ...question,
    practiceOnly: true,
    id: `${question.id}_retry`,
  };
}
