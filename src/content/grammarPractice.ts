/**
 * Grammar practice content: the teaching and the exam-format drilling that the
 * one-rule-a-day lessons in grammar.ts do not do.
 *
 * Every entry hangs off a lesson id in grammar.ts, so the practice module can
 * always answer "she is weak on lesson_13 — teach and drill lesson_13".
 *
 * `EditingItem` mirrors her P4 paper (Editing for Spelling and Grammar
 * Explained!): a sentence with exactly one wrong word, which she taps and then
 * corrects. `why` is shown after every answer — right or wrong — because being
 * told "correct" teaches her nothing about the rule.
 */

export interface EditingItem {
  lessonId: string;
  /** The sentence as she sees it, containing exactly one mistake. */
  sentence: string;
  /** The wrong word to tap. Must appear in `sentence` exactly once. */
  wrong: string;
  /** Three corrections to choose between, one of them right. */
  options: string[];
  correct: string;
  /** Kid-level reason, shown after answering. */
  why: string;
}

export interface RuleTeaching {
  lessonId: string;
  /** Worked steps: what to look at, and what it tells you. */
  steps: Array<{ show: string; explain: string }>;
  /** One line she can carry into the exam. */
  tip: string;
}

export const ruleTeachings: RuleTeaching[] = [
  {
    lessonId: "lesson_1",
    steps: [
      { show: "cat, table, London, teacher", explain: "Each one names a person, an animal, a thing or a place." },
      { show: "The cat sat on the mat.", explain: "Two naming words hide in here: cat and mat." },
      { show: "one bird → three birds", explain: "When you mean more than one, the naming word takes -s." },
    ],
    tip: "If you can put 'a' or 'the' in front of it, it is a naming word.",
  },
  {
    lessonId: "lesson_2",
    steps: [
      { show: "run, sleep, eat, is", explain: "Doing words tell you what someone does or what someone is." },
      { show: "The dog jumps over the fence.", explain: "Ask what the dog does: it jumps. That is the doing word." },
      { show: "he jumps / they jump", explain: "One person or thing takes -s. More than one does not." },
    ],
    tip: "Find the doing word by asking 'what is happening?'",
  },
  {
    lessonId: "lesson_3",
    steps: [
      { show: "a red bag, a tall boy", explain: "Describing words tell you more about a naming word." },
      { show: "The soup tastes delicious.", explain: "After taste, smell and feel, use the describing word, not -ly." },
      { show: "She sings beautifully.", explain: "But after a normal doing word, use the -ly form." },
    ],
    tip: "Describing words go with things; -ly words go with actions.",
  },
  {
    lessonId: "lesson_4",
    steps: [
      { show: "The cat sat down.", explain: "The first word of a sentence always starts with a capital letter." },
      { show: "Ali, Singapore, June", explain: "Names of people, places and months take a capital letter too." },
      { show: "my friend ali", explain: "This is wrong: Ali is a name, so it needs a capital A." },
    ],
    tip: "Sentence starts and names always get a capital letter.",
  },
  {
    lessonId: "lesson_5",
    steps: [
      { show: "The cat sat on the mat.", explain: "A sentence that tells you something ends with a full stop." },
      { show: "Where is my bag?", explain: "A sentence that asks something ends with a question mark instead." },
      { show: "I like to read books", explain: "This one is not finished: it needs a full stop at the end." },
    ],
    tip: "Every telling sentence needs a full stop to show it has ended.",
  },
  {
    lessonId: "lesson_6",
    steps: [
      { show: "a book, a cat, a table", explain: "Use 'a' when the next word starts with a consonant sound." },
      { show: "an apple, an egg, an hour", explain: "Use 'an' when the next word starts with a vowel sound." },
      { show: "a umbrella", explain: "This is wrong: umbrella starts with a vowel sound, so it takes 'an'." },
    ],
    tip: "Listen to the sound, not the letter: an hour, a uniform.",
  },
  {
    lessonId: "lesson_7",
    steps: [
      { show: "one apple → two apples", explain: "More than one takes -s on the end of the naming word." },
      { show: "There are five apples in the bowl.", explain: "Five tells you it is more than one, so apple takes -s." },
      { show: "There are five apple", explain: "This is wrong: after a number bigger than one, add the -s." },
    ],
    tip: "A number bigger than one means the naming word needs -s.",
  },
  {
    lessonId: "lesson_8",
    steps: [
      { show: "dish → dishes, box → boxes", explain: "Words ending in sh, ch, s or x add -es, not just -s." },
      { show: "tooth → teeth, child → children", explain: "A few words change completely instead of adding anything." },
      { show: "one sheep → two sheep", explain: "And a few do not change at all." },
    ],
    tip: "If -s is hard to say after the word, it probably needs -es.",
  },
  {
    lessonId: "lesson_9",
    steps: [
      { show: "Ali went home. He went home.", explain: "A pronoun stands in for a naming word you already know." },
      { show: "She is my friend.", explain: "I, you, he, she, it, we and they do the action." },
      { show: "The book belongs to him.", explain: "Me, him, her, us and them come after the action." },
    ],
    tip: "Doing the action: he, she, they. Receiving it: him, her, them.",
  },
  {
    lessonId: "lesson_10",
    steps: [
      { show: "He is tall. It is hot.", explain: "Use 'is' when you talk about one person or thing." },
      { show: "They are tall. We are here.", explain: "Use 'are' when you talk about more than one." },
      { show: "The children is playing", explain: "This is wrong: children means more than one, so use 'are'." },
    ],
    tip: "One thing takes is; more than one takes are.",
  },
];

export const editingItems: EditingItem[] = [
  // lesson_1 — naming words
  { lessonId: "lesson_1", sentence: "I saw three bird in the tree.", wrong: "bird",
    options: ["birds", "bird's", "birdes"], correct: "birds",
    why: "Three means more than one, so the naming word takes -s." },
  { lessonId: "lesson_1", sentence: "The farmer keeps two cow on his land.", wrong: "cow",
    options: ["cows", "cow's", "cowes"], correct: "cows",
    why: "Two cows is more than one, so add -s to the naming word." },
  { lessonId: "lesson_1", sentence: "She keeps many toy in her cupboard.", wrong: "toy",
    options: ["toys", "toy's", "toies"], correct: "toys",
    why: "Many tells you there is more than one toy, so add -s." },

  // lesson_2 — doing words
  { lessonId: "lesson_2", sentence: "The dog jump over the low fence.", wrong: "jump",
    options: ["jumps", "jumping", "jumped"], correct: "jumps",
    why: "One dog is like he or she, so the doing word takes -s." },
  { lessonId: "lesson_2", sentence: "My sister read a book every night.", wrong: "read",
    options: ["reads", "reading", "readed"], correct: "reads",
    why: "One sister is like she, so the doing word takes -s." },
  { lessonId: "lesson_2", sentence: "He walk to school with his friend.", wrong: "walk",
    options: ["walks", "walking", "walkes"], correct: "walks",
    why: "He is one person, so the doing word takes -s." },

  // lesson_3 — describing words
  { lessonId: "lesson_3", sentence: "The soup tastes deliciously today.", wrong: "deliciously",
    options: ["delicious", "deliciousness", "deliciouser"], correct: "delicious",
    why: "After taste, smell and feel we use the describing word, not -ly." },
  { lessonId: "lesson_3", sentence: "She wore a beautifully dress to the party.", wrong: "beautifully",
    options: ["beautiful", "beauty", "beautifuller"], correct: "beautiful",
    why: "A describing word goes in front of a naming word, without -ly." },
  { lessonId: "lesson_3", sentence: "The flower smells sweetly in the morning.", wrong: "sweetly",
    options: ["sweet", "sweetness", "sweeter"], correct: "sweet",
    why: "Smell is not an action here, so use sweet, not sweetly." },

  // lesson_4 — capital letters
  { lessonId: "lesson_4", sentence: "My friend ali lives next door to us.", wrong: "ali",
    options: ["Ali", "ALI", "ali's"], correct: "Ali",
    why: "A person's name always starts with a capital letter." },
  { lessonId: "lesson_4", sentence: "Her birthday is in june every year.", wrong: "june",
    options: ["June", "JUNE", "junes"], correct: "June",
    why: "Months of the year start with a capital letter." },
  { lessonId: "lesson_4", sentence: "the cat sat quietly on a mat.", wrong: "the",
    options: ["The", "THE", "A"], correct: "The",
    why: "The first word of a sentence starts with a capital letter." },

  // lesson_5 — full stops
  { lessonId: "lesson_5", sentence: "The cat sat on the warm mat", wrong: "mat",
    options: ["mat.", "mat?", "mat!"], correct: "mat.",
    why: "A sentence that tells you something ends with a full stop." },
  { lessonId: "lesson_5", sentence: "I like to read books at night", wrong: "night",
    options: ["night.", "night?", "night,"], correct: "night.",
    why: "This sentence tells you something, so it needs a full stop." },
  { lessonId: "lesson_5", sentence: "We walked home after lunch", wrong: "lunch",
    options: ["lunch.", "lunch?", "lunch!"], correct: "lunch.",
    why: "Finish a telling sentence with a full stop, not a question mark." },

  // lesson_6 — a and an
  { lessonId: "lesson_6", sentence: "She ate a apple for her lunch.", wrong: "a",
    options: ["an", "the", "some"], correct: "an",
    why: "Apple starts with a vowel sound, so it takes 'an'." },
  { lessonId: "lesson_6", sentence: "He saw an bird sitting in the tree.", wrong: "an",
    options: ["a", "the", "any"], correct: "a",
    why: "Bird starts with a consonant sound, so it takes 'a'." },
  { lessonId: "lesson_6", sentence: "I opened a umbrella in the rain.", wrong: "a",
    options: ["an", "the", "one"], correct: "an",
    why: "Umbrella starts with a vowel sound, so it takes 'an'." },

  // lesson_7 — singular and plural
  { lessonId: "lesson_7", sentence: "There are five apple in the bowl.", wrong: "apple",
    options: ["apples", "apple's", "applees"], correct: "apples",
    why: "Five is more than one, so the naming word takes -s." },
  { lessonId: "lesson_7", sentence: "He keeps three pen inside his bag.", wrong: "pen",
    options: ["pens", "pen's", "penes"], correct: "pens",
    why: "Three is more than one, so add -s to pen." },
  { lessonId: "lesson_7", sentence: "Two dog ran across the wide field.", wrong: "dog",
    options: ["dogs", "dog's", "doges"], correct: "dogs",
    why: "Two is more than one, so the naming word takes -s." },

  // lesson_8 — plural -es and irregular
  { lessonId: "lesson_8", sentence: "She washed all the dishs after dinner.", wrong: "dishs",
    options: ["dishes", "dish", "dishies"], correct: "dishes",
    why: "Words ending in sh add -es, not just -s." },
  { lessonId: "lesson_8", sentence: "The farmer keeps six sheeps on his land.", wrong: "sheeps",
    options: ["sheep", "sheepes", "sheep's"], correct: "sheep",
    why: "Sheep stays the same whether there is one or many." },
  { lessonId: "lesson_8", sentence: "He brushed his tooths before bed.", wrong: "tooths",
    options: ["teeth", "toothes", "tooth"], correct: "teeth",
    why: "Tooth changes completely: one tooth, two teeth." },

  // lesson_9 — pronouns
  { lessonId: "lesson_9", sentence: "Ali and me went to the shop.", wrong: "me",
    options: ["I", "my", "mine"], correct: "I",
    why: "Use I when you are doing the action: Ali and I went." },
  { lessonId: "lesson_9", sentence: "Her is my best friend at school.", wrong: "Her",
    options: ["She", "Hers", "Herself"], correct: "She",
    why: "She does the action; her comes after the action." },
  { lessonId: "lesson_9", sentence: "The heavy book belongs to he.", wrong: "he",
    options: ["him", "his", "himself"], correct: "him",
    why: "After a word like 'to', use him, not he." },

  // lesson_10 — is and are
  { lessonId: "lesson_10", sentence: "The children is playing in the garden.", wrong: "is",
    options: ["are", "was", "be"], correct: "are",
    why: "Children means more than one, so use are." },
  { lessonId: "lesson_10", sentence: "My brother are very tall for his age.", wrong: "are",
    options: ["is", "were", "be"], correct: "is",
    why: "One brother is just one person, so use is." },
  { lessonId: "lesson_10", sentence: "The books is on the top shelf.", wrong: "is",
    options: ["are", "was", "be"], correct: "are",
    why: "Books means more than one, so use are." },
];

/** Every editing item for one rule. */
export function editingItemsFor(lessonId: string): EditingItem[] {
  return editingItems.filter((item) => item.lessonId === lessonId);
}

/** The worked teaching for one rule, if it has been written yet. */
export function teachingFor(lessonId: string): RuleTeaching | undefined {
  return ruleTeachings.find((teaching) => teaching.lessonId === lessonId);
}

/** Rules that have practice content, in grammar.ts order. */
export function rulesWithPractice(): string[] {
  return [...new Set(editingItems.map((item) => item.lessonId))];
}
