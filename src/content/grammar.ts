export interface GrammarLesson {
  id: string;
  title: string;
  description: string;
  examples: string[];
  practiceItems: Array<{
    type: "tag_noun" | "tag_verb" | "tag_adjective" | "pick_word" | "word_order" | "choose_form";
    question: string;
    sentence?: string;
    options?: string[];
    correctAnswer: string | number;
  }>;
}

export const grammarLessons: GrammarLesson[] = [
  {
    id: "lesson_1",
    title: "Naming Words (Nouns)",
    description: "Nouns are words for people, animals, things, or places.",
    examples: [
      "cat is a noun (animal)",
      "table is a noun (thing)",
      "London is a noun (place)",
      "teacher is a noun (person)",
    ],
    practiceItems: [
      {
        type: "tag_noun",
        question: "Tap the noun in this sentence.",
        sentence: "The cat sits on the mat.",
        correctAnswer: "cat",
      },
      {
        type: "tag_noun",
        question: "Tap the noun in this sentence.",
        sentence: "My friend plays in the park.",
        correctAnswer: "friend",
      },
    ],
  },
  {
    id: "lesson_2",
    title: "Doing Words (Verbs)",
    description: "Verbs are action words. They show what someone does or is.",
    examples: [
      "run is a verb (action)",
      "sleep is a verb (action)",
      "eat is a verb (action)",
      "is is a verb (state)",
    ],
    practiceItems: [
      {
        type: "tag_verb",
        question: "Tap the verb in this sentence.",
        sentence: "The dog jumps over the fence.",
        correctAnswer: "jumps",
      },
      {
        type: "tag_verb",
        question: "Tap the verb in this sentence.",
        sentence: "She plays the piano every day.",
        correctAnswer: "plays",
      },
    ],
  },
  {
    id: "lesson_3",
    title: "Describing Words (Adjectives)",
    description: "Adjectives describe nouns. They tell you more about a person, animal, thing, or place.",
    examples: [
      "big is an adjective (size)",
      "red is an adjective (colour)",
      "happy is an adjective (feeling)",
      "fast is an adjective (speed)",
    ],
    practiceItems: [
      {
        type: "tag_adjective",
        question: "Tap the adjective in this sentence.",
        sentence: "The tiny mouse hides in the hole.",
        correctAnswer: "tiny",
      },
      {
        type: "tag_adjective",
        question: "Tap the adjective in this sentence.",
        sentence: "She has a beautiful necklace.",
        correctAnswer: "beautiful",
      },
    ],
  },
  {
    id: "lesson_4",
    title: "Capital Letters",
    description: "Use a capital letter at the start of a sentence and for names of people and places.",
    examples: [
      "The sentence starts with a capital letter.",
      "My name is Ali.",
      "I live in Singapore.",
      "Monday is a day of the week.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which sentence is correct?",
        options: [
          "the cat sits on the mat",
          "The cat sits on the mat",
          "The Cat sits on the mat",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which name is written correctly?",
        options: ["ali", "Ali", "ALI"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_5",
    title: "Full Stops",
    description: "Use a full stop at the end of a sentence to show it is complete.",
    examples: [
      "I have a cat.",
      "She goes to school.",
      "They play in the park.",
      "The book is on the table.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which sentence has the correct full stop?",
        options: [
          "The dog runs fast",
          "The dog runs fast.",
          "The dog runs fast..",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_6",
    title: "A and An",
    description: "Use 'a' before a word that starts with a consonant sound. Use 'an' before a word that starts with a vowel sound.",
    examples: [
      "a cat (consonant sound)",
      "an elephant (vowel sound)",
      "a book (consonant sound)",
      "an apple (vowel sound)",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "a elephant",
          "an elephant",
          "a an elephant",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "an dog",
          "a dog",
          "an a dog",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_7",
    title: "Singular and Plural (-s)",
    description: "Singular is one thing. Plural is more than one. Add -s to make most nouns plural.",
    examples: [
      "one cat, two cats",
      "one book, three books",
      "one apple, five apples",
      "one dog, many dogs",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the plural?",
        options: ["book", "books", "boks"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "What is the plural?",
        options: ["table", "tabel", "tables"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_8",
    title: "Plural -es and Irregular",
    description: "Some nouns add -es to become plural. Some nouns change completely.",
    examples: [
      "one box, two boxes (add -es)",
      "one glass, two glasses (add -es)",
      "one child, two children (irregular)",
      "one foot, two feet (irregular)",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the plural?",
        options: ["box", "boxes", "boxs"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "What is the plural?",
        options: ["child", "childes", "children"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_9",
    title: "Pronouns (I, You, He, She, It, They)",
    description: "Pronouns are words that replace nouns. They help us avoid saying the same name over and over.",
    examples: [
      "I like apples. (I = me)",
      "You are kind. (You = the person listening)",
      "He is tall. (He = a boy or man)",
      "She is fast. (She = a girl or woman)",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which pronoun is correct?",
        options: ["He like cats", "She like cats", "He likes cats"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_10",
    title: "Is and Are",
    description: "Use 'is' with one person or thing (he, she, it). Use 'are' with more than one (you, we, they).",
    examples: [
      "She is happy.",
      "They are happy.",
      "The cat is small.",
      "The cats are small.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "The boy are tall",
          "The boy is tall",
          "The boy are tall.",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "They are happy",
          "They is happy",
          "They are happy.",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_11",
    title: "Was and Were",
    description: "Was and were are past tense of 'is' and 'are'. Use 'was' for I, he, she, it. Use 'were' for you, we, they.",
    examples: [
      "I was happy.",
      "They were happy.",
      "He was tall.",
      "You were kind.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "She were sad",
          "She was sad",
          "She am sad",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "We was hungry",
          "We were hungry",
          "We is hungry",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_12",
    title: "Has and Have",
    description: "Use 'has' with he, she, it. Use 'have' with I, you, we, they.",
    examples: [
      "She has a cat.",
      "They have a dog.",
      "He has a book.",
      "I have an apple.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "she has a dog",
          "She has a dog",
          "She had a dog",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_13",
    title: "Simple Present (-s with he/she/it)",
    description: "In the simple present, add -s to the verb when you use he, she, or it.",
    examples: [
      "she play the piano. (wrong: she plays)",
      "He like ice cream. (wrong: He likes)",
      "It run very fast. (wrong: It runs)",
      "I play the piano. (I - no -s)",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "she play football",
          "She plays football",
          "she playss football",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_14",
    title: "Present Continuous (-ing)",
    description: "Use -ing to show what is happening right now. You add -ing to the verb: play → playing, run → running.",
    examples: [
      "She is playing the piano.",
      "They are running in the park.",
      "He is eating an apple.",
      "I am reading a book.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the -ing form?",
        options: ["run", "running", "runnig"],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "She is play",
          "She is playing",
          "She playing",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_15",
    title: "Simple Past (-ed)",
    description: "To make the past tense, add -ed to the verb. play → played, walk → walked. You use it for things that already happen.",
    examples: [
      "She played the piano.",
      "They walked in the park.",
      "He liked ice cream.",
      "I watched a movie.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the past tense?",
        options: ["play", "played", "playing"],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "she walks home",
          "She walked home",
          "She walks home",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_16",
    title: "Irregular Past Tense",
    description: "Some verbs do not add -ed. They change in special ways: go → went, eat → ate, see → saw.",
    examples: [
      "She went to school.",
      "He ate an apple.",
      "They saw a movie.",
      "I did my homework.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the past tense of 'go'?",
        options: ["goed", "went", "going"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "What is the past tense of 'eat'?",
        options: ["eated", "ate", "eating"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_17",
    title: "Question Words (Who, What, Where)",
    description: "Question words help you ask about people, things, and places. Who = person, What = thing, Where = place, Why = reason.",
    examples: [
      "Who is your friend?",
      "What is in the box?",
      "Where do you live?",
      "Why are you sad?",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which word asks about a person?",
        options: ["What", "Where", "Who"],
        correctAnswer: 2,
      },
      {
        type: "pick_word",
        question: "Which word asks about a place?",
        options: ["What", "Where", "Why"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_18",
    title: "Question Marks",
    description: "Use a question mark at the end of a question. Questions are sentences that ask for information.",
    examples: [
      "Is your name Tom?",
      "What is this?",
      "Where are you going?",
      "Do you like apples?",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "What is your name",
          "What is your name?",
          "What is your name.",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_19",
    title: "And, But, Because",
    description: "These words join ideas together. 'and' adds ideas, 'but' shows difference, 'because' shows reason.",
    examples: [
      "She likes cats and dogs.",
      "I like apples but not oranges.",
      "She is happy because it is her birthday.",
      "He likes to play and run.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which word shows difference?",
        options: ["and", "but", "because"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "Which word shows reason?",
        options: ["and", "but", "because"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_20",
    title: "Prepositions (in, on, under)",
    description: "Prepositions show where things are. in = inside, on = top of, under = below.",
    examples: [
      "The cat is in the box.",
      "The book is on the table.",
      "The ball is under the chair.",
      "She lives in the city.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which preposition means 'inside'?",
        options: ["on", "in", "under"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "Which preposition means 'below'?",
        options: ["on", "in", "under"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_21",
    title: "Contractions (don't, can't, won't)",
    description: "Contractions are short forms where two words join and a letter is removed. do not → don't, can not → can't.",
    examples: [
      "I don't like vegetables.",
      "She can't swim.",
      "They won't go to the party.",
      "He didn't come yesterday.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is the contraction of 'do not'?",
        options: ["do't", "don't", "dont"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "Which is the contraction of 'can not'?",
        options: ["can't", "cann't", "cant"],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_22",
    title: "Possessives ('s)",
    description: "Use 's to show that something belongs to someone. cat's = the cat's, Tom's = Tom's.",
    examples: [
      "The cat's toy is red.",
      "Tom's book is on the table.",
      "My sister's friends are kind.",
      "The dog's bone is big.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which shows that the book belongs to Ali?",
        options: ["Ali book", "Ali's book", "Alis book"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_23",
    title: "Commas in Lists",
    description: "Use commas to separate items in a list. The last two items are joined with 'and'.",
    examples: [
      "I like apples, oranges, and bananas.",
      "She has a cat, a dog, and a fish.",
      "The book is on the table, under the bed, and in the closet.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "I like apples oranges and bananas",
          "I like apples, oranges, and bananas",
          "I like apples, oranges and bananas.",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_24",
    title: "Question Tags",
    description: "Question tags are small questions at the end of a sentence. Positive sentence → negative tag. She likes cats, doesn't she?",
    examples: [
      "She is happy, isn't she?",
      "They can swim, can't they?",
      "You like apples, don't you?",
      "He was late, wasn't he?",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the question tag?",
        options: ["is she", "isn't she", "does she"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_25",
    title: "Question Words: Where and Which",
    description: "Where asks about place. Which asks about choice from a group. Who asks about person.",
    examples: [
      "Where do you live?",
      "Which book do you like?",
      "Who is your best friend?",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which word asks for a choice?",
        options: ["Where", "Which", "Who"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_26",
    title: "The vs A",
    description: "Use 'the' for something specific you already know. Use 'a' for something new or general.",
    examples: [
      "I see a cat. The cat is black.",
      "She has a dog. The dog is big.",
      "There is an apple on the table.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "I see cat. A cat is black.",
          "I see a cat. The cat is black.",
          "I see the cat. The cat is black.",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_27",
    title: "Comparatives (taller, smaller, faster)",
    description: "Use -er to compare two things. She is taller than him. The red ball is bigger than the blue ball.",
    examples: [
      "She is taller than her sister.",
      "This pencil is shorter than that one.",
      "The lion is bigger than the cat.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is the comparative?",
        options: ["tall", "taller", "tallest"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_28",
    title: "Superlatives (tallest, smallest, fastest)",
    description: "Use -est to compare all things. She is the tallest in the class. It is the biggest of all.",
    examples: [
      "She is the tallest in her class.",
      "This is the shortest pencil.",
      "The lion is the biggest animal.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is the superlative?",
        options: ["fast", "faster", "fastest"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_29",
    title: "Prepositions of Place (in, on, by)",
    description: "Different prepositions show different places. 'In bed' but 'on the bed'. 'In the middle of'. 'On the Internet'.",
    examples: [
      "She is in bed.",
      "The book is on the table.",
      "He is in the middle of the room.",
      "We chat on the Internet.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "She is on bed",
          "She is in bed",
          "She is by bed",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_30",
    title: "Countable and Uncountable Nouns",
    description: "Countable nouns you can count: one apple, two apples. Uncountable you cannot count: much water, a lot of rice.",
    examples: [
      "I have many apples (countable).",
      "I drink a lot of water (uncountable).",
      "There is much sugar (uncountable).",
      "He has many coins (countable).",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "I have much apples",
          "I have many apples",
          "I have a lot apples",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_31",
    title: "Gerunds as Subjects",
    description: "A gerund is an -ing word used as a noun. It can be the subject of a sentence. 'Swimming is fun.'",
    examples: [
      "Swimming is fun.",
      "Reading makes you smart.",
      "Playing is important.",
      "Dancing is her favourite thing.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is the gerund?",
        options: ["swim", "swimming", "swam"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_32",
    title: "Past Continuous (was doing)",
    description: "Past continuous shows what was happening at a time in the past. She was reading when I called.",
    examples: [
      "She was reading when he arrived.",
      "They were playing in the park.",
      "I was sleeping all night.",
      "He was writing a letter.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "She was reading",
          "She am reading",
          "She is reading",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_33",
    title: "Passive Voice (has been done)",
    description: "Passive voice: the subject receives the action. The letter was written by Tom. The house has been abandoned.",
    examples: [
      "The letter was written by Tom.",
      "The house has been abandoned.",
      "The cake was eaten by the children.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is passive?",
        options: [
          "Tom wrote the letter",
          "The letter was written by Tom",
          "Tom is writing the letter",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_34",
    title: "Irregular Plurals",
    description: "Some plurals do not use -s or -es. One ox → oxen. One child → children. One hundred → hundreds of.",
    examples: [
      "One ox, many oxen.",
      "One child, many children.",
      "The buildings are tall.",
      "Hundreds of people were there.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the plural of 'child'?",
        options: ["childs", "children", "childes"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_35",
    title: "Adverbs from Adjectives (-ly)",
    description: "Add -ly to adjectives to make adverbs. happy → happily. slow → slowly. When y → i, happy → happily.",
    examples: [
      "She plays happily in the garden.",
      "He speaks politely to the teacher.",
      "They walk slowly down the path.",
      "She runs quickly to school.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is the adverb?",
        options: ["quick", "quickly", "quickily"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "What is the adverb from 'happy'?",
        options: ["happyly", "happily", "happyley"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_36",
    title: "Any vs Some in Negatives",
    description: "Use 'some' in positive sentences. Use 'any' in negative sentences and questions. There is some water / There is not any water.",
    examples: [
      "There is some water.",
      "There is not any water. (or: There is no water.)",
      "Do you have any apples?",
      "I have some apples.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "There is some apples",
          "There is any apples",
          "There are some apples",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_37",
    title: "Irregular Past Tense (shone, drew, built, tore, rang, met)",
    description: "Some verbs change completely in past tense. shine → shone. draw → drew. build → built. tear → tore. ring → rang. meet → met.",
    examples: [
      "The sun shone brightly.",
      "She drew a picture.",
      "They built a house.",
      "He tore the paper.",
      "The bell rang loudly.",
      "I met my friend at school.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the past tense of 'shine'?",
        options: ["shined", "shone", "shining"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "What is the past tense of 'draw'?",
        options: ["drawed", "drew", "drawing"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_38",
    title: "It's vs Its",
    description: "It's = it is. Its = something belongs to it. The cat likes its toy. It's a beautiful day.",
    examples: [
      "It's a beautiful day. (It is)",
      "The dog loves its toy.",
      "It's time to go home. (It is)",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "Its a beautiful day",
          "It's a beautiful day",
          "Its beautiful day",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "The dog loves it's toy",
          "The dog loves its toy",
          "The dog loves it toy",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_39",
    title: "Phrasal Verbs (dozed off, put off)",
    description: "Phrasal verbs are verb + particle (like 'off', 'up', 'on'). doze off = fall asleep. put off = delay. They dozed off. She put off the meeting.",
    examples: [
      "He dozed off during the movie.",
      "She put off the meeting until tomorrow.",
      "Turn on the light.",
      "Wake up! It is time to go.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which means 'delay'?",
        options: ["doze off", "put off", "turn on"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_40",
    title: "Would You Like? and I Wish I Could",
    description: "Would you like... is a polite question. I wish I could... show something you want but cannot do.",
    examples: [
      "Would you like some tea?",
      "I wish I could fly.",
      "I wish I could swim better.",
      "Would you like to come to the party?",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is polite?",
        options: [
          "Give me tea",
          "Would you like tea",
          "Would you like tea?",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_41",
    title: "Uncountable Nouns Take IS",
    description: "Uncountable nouns like furniture, dust, sugar do not add -s. They use IS not ARE. The furniture is new.",
    examples: [
      "The furniture is new.",
      "Sugar is sweet.",
      "Dust is dirty.",
      "Information is important.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "The furniture are new",
          "The furniture is new",
          "The furnitures are new",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "Sugar are sweet",
          "Sugar is sweet",
          "Sugars is sweet",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_42",
    title: "Plural Verbs with Two Subjects",
    description: "When two people or things do the action together, use a plural verb. She and her friend have lunch. Birds exist in nature.",
    examples: [
      "She and her friend have lunch.",
      "Birds and fish exist in nature.",
      "Tom and Ali play together.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "She and he goes home",
          "She and he go home",
          "She and he having go home",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_43",
    title: "Used To (Past Habit)",
    description: "Used to + base verb show something you do in the past but not now. I used to play every day.",
    examples: [
      "I used to play every day.",
      "She used to live in Paris.",
      "He used to eat candy every day.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "I am used to play",
          "I used to play",
          "I using to play",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_44",
    title: "Plural -es After ch, x, o",
    description: "When a noun end with ch, x, or o, add -es to make it plural. inch → inches. volcano → volcanoes.",
    examples: [
      "One inch, many inches.",
      "One box, many boxes.",
      "One volcano, many volcanoes.",
      "One church, many churches.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the plural?",
        options: ["inch", "inchs", "inches"],
        correctAnswer: 2,
      },
      {
        type: "pick_word",
        question: "What is the plural?",
        options: ["volcano", "volcanos", "volcanoes"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_45",
    title: "Too + Adjective + To",
    description: "Too + adjective + to + verb show something is too much or more than needed. She is too tired to play.",
    examples: [
      "She is too tired to play.",
      "The food is too hot to eat.",
      "He is too small to reach the shelf.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is correct?",
        options: [
          "too tall to",
          "too tall for",
          "too tall and",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_46",
    title: "A Number Of + Plural",
    description: "Use 'a number of' with a plural noun and a plural verb. A number of students are here. Many people are late.",
    examples: [
      "A number of students are here.",
      "A number of people are late.",
      "A number of cars are in the car park.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "A number of student is here",
          "A number of students are here",
          "A number of students has come",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_47",
    title: "With vs Of",
    description: "Use 'with' for company or thing together. Use 'of' for part or type. Birds with big beaks. A shower of dust.",
    examples: [
      "A bird with a big beak.",
      "A shower of dust.",
      "A girl with long hair.",
      "A piece of cake.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "A bird of a big beak",
          "A bird with a big beak",
          "A bird of big beak",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_48",
    title: "In vs On for Time and Place",
    description: "Use 'in' for month and year: in January. Use 'on' for day: on Friday. In bed but on the bed.",
    examples: [
      "He was born in January.",
      "She goes to work on Monday.",
      "She is in the room.",
      "The book is on the table.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "in Friday",
          "on Friday",
          "in the Friday",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "She sleeps in bed",
          "She sleeps on bed",
          "She sleeps by bed",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_49",
    title: "Comparatives vs Superlatives",
    description: "Comparatives compare two things: taller. Superlatives are the most: tallest. She is taller than him. She is the tallest.",
    examples: [
      "He is taller than his brother.",
      "She is the tallest in the class.",
      "This apple is bigger than that one.",
      "This is the biggest apple.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is comparative?",
        options: ["tallest", "taller", "tall"],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "Which is superlative?",
        options: ["bigger", "biggest", "big"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_50",
    title: "Passive Voice (was + past participle)",
    description: "Passive: the subject receives the action. She was measured. They were involved. The house was built.",
    examples: [
      "She was measured by the doctor.",
      "They were involved in the project.",
      "The house was built in 2020.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is passive?",
        options: [
          "She measures the room",
          "She was measured by the ruler",
          "She measures with a ruler",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_51",
    title: "Keen On",
    description: "Keen on means you really like something. She is keen on sport. He is keen on reading.",
    examples: [
      "She is keen on sport.",
      "He is keen on reading.",
      "They are keen on music.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What follow 'keen'?",
        options: ["in", "on", "at"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_52",
    title: "-ous Adjectives",
    description: "Many adjectives end with -ous: religious, dangerous, marvellous. It means full of or having a quality.",
    examples: [
      "He is a religious person.",
      "The dog is dangerous.",
      "That is a marvellous idea.",
      "She is ambitious and curious.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which adjective end with -ous?",
        options: ["happy", "religious", "beautiful"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_53",
    title: "-ed Adjectives vs -ing Adjectives",
    description: "Adjectives with -ed describe a feeling. Adjectives with -ing describe the cause. I am amazed. The show is amazing.",
    examples: [
      "I am amazed by the trick.",
      "The magic trick is amazing.",
      "She is fascinated by the book.",
      "The book is fascinating.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "I am amazing",
          "I am amazed",
          "I am amaze",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "The movie is fascinated",
          "The movie is fascinating",
          "The movie is fascinate",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_54",
    title: "-less Adjectives",
    description: "Adjectives with -less mean without. Countless = without count. Tireless = without getting tired.",
    examples: [
      "There are countless stars.",
      "She is a tireless worker.",
      "The homeless children need help.",
      "He is helpless without his phone.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What do -less mean?",
        options: ["with", "without", "full of"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_55",
    title: "For + Purpose",
    description: "Use 'for' to say why you do something. She goes to school for learning. He goes to the shop for milk.",
    examples: [
      "She goes to school for learning.",
      "He goes to the shop for milk.",
      "We go to the park for fun.",
      "She works hard for success.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "We go for play",
          "We go to play",
          "We go for playing",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_56",
    title: "Looking Forward To + -ing",
    description: "Looking forward to always use -ing form. She is looking forward to seeing her friend.",
    examples: [
      "She is looking forward to seeing her friend.",
      "I am looking forward to eating cake.",
      "They are looking forward to going on holiday.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "looking forward to see",
          "looking forward to seeing",
          "looking forward see",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_57",
    title: "One Of The + Plural",
    description: "One of the + plural noun. He is one of the greatest player. She is one of the best student.",
    examples: [
      "He is one of the greatest players.",
      "She is one of the best students.",
      "They are one of the most popular bands.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "one of the greatest player",
          "one of the greatest players",
          "one of greatest player",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_58",
    title: "Good At vs Good With",
    description: "Good at = skill. Good with = get along with people or handle thing well.",
    examples: [
      "She is good at maths.",
      "He is good with children.",
      "I am good at sport.",
      "She is good with people.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "good at children",
          "good with children",
          "good for children",
        ],
        correctAnswer: 1,
      },
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "good at maths",
          "good with maths",
          "good for maths",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_59",
    title: "Although vs However",
    description: "Although introduces a contrast. However shows a change. Although it is raining, we go. It is raining; however, we go.",
    examples: [
      "Although it is raining, we go to the park.",
      "It is raining; however, we go to the park.",
      "Although she is tired, she continues to work.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "Although she rains",
          "Although she is tired she goes",
          "Although she is tired, she goes",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_60",
    title: "May + Base Verb (possibility)",
    description: "May + base verb show something is possible. The colour may vary. The price may change.",
    examples: [
      "The colour may vary.",
      "The price may change.",
      "She may come tomorrow.",
      "They may arrive late.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "may varies",
          "may vary",
          "may to vary",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_61",
    title: "Make + Someone + Base Verb",
    description: "Make + someone + base verb. The sad story makes her cry. Loud noise makes the baby wake.",
    examples: [
      "The sad story makes her cry.",
      "Loud noise makes the baby wake.",
      "The joke makes everyone laugh.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "make her crying",
          "make her cry",
          "make her to cry",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_62",
    title: "Was/Were + Past Participle (Passive)",
    description: "In the passive voice, 'was' or 'were' must match the subject. The letter was brought by post. The flowers were formed in spring.",
    examples: [
      "The letter was brought by post.",
      "The flowers were formed in spring.",
      "She was hidden in the room.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "The letter was brought",
          "The letter were brought",
          "The letter are brought",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_63",
    title: "At The Weekends",
    description: "Use 'at the weekends' for recurring time. At the weekends, I play with friends.",
    examples: [
      "At the weekends, I play with friends.",
      "I rest at the weekends.",
      "We go to the park at the weekends.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is correct?",
        options: [
          "in the weekends",
          "at the weekends",
          "on the weekend",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_64",
    title: "From vs To",
    description: "From = start place. To = end place. She goes from home to school.",
    examples: [
      "She goes from home to school.",
      "The train goes from Singapore to Malaysia.",
      "I travel from my house to the park.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "from school to home",
          "to school from home",
          "at school to home",
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: "lesson_65",
    title: "Become + Adjective",
    description: "Become + adjective shows change. The animal became extinct. She became famous.",
    examples: [
      "The animal became extinct.",
      "She became famous.",
      "The weather became cold.",
      "He became angry.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which adjective follows 'become'?",
        options: [
          "extinction",
          "extinct",
          "extincts",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_66",
    title: "Had Been + Past Participle",
    description: "Had been + past participle show past passive. The money had been stolen. The letter had been lost.",
    examples: [
      "The money had been stolen.",
      "The letter had been lost.",
      "The cake had been eaten.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "had stolen",
          "had been stolen",
          "has been stolen",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_67",
    title: "Had + Past Participle (Past Perfect)",
    description: "Had + past participle show something happen before. She had delivered the package.",
    examples: [
      "She had delivered the package.",
      "He had finished his work.",
      "They had arrived before noon.",
    ],
    practiceItems: [
      {
        type: "choose_form",
        question: "Which is correct?",
        options: [
          "had deliver",
          "had delivered",
          "have delivered",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "lesson_68",
    title: "Possessive Pronouns (mine, yours, his)",
    description: "Possessive pronouns show who something belongs to. This toy is mine. That book is yours.",
    examples: [
      "This toy is mine.",
      "That book is yours.",
      "The pen is his.",
      "The doll is hers.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the possessive pronoun?",
        options: [
          "my",
          "me",
          "mine",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_69",
    title: "-t Past Forms (meant, learnt, dealt)",
    description: "Some verbs use '-t' instead of '-ed' in the past. mean → meant. learn → learnt. deal → dealt.",
    examples: [
      "She meant what she said.",
      "He learnt to swim.",
      "They dealt with the problem.",
      "I spelt the word wrong.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "What is the past tense of 'mean'?",
        options: [
          "meaned",
          "meant",
          "meaning",
        ],
        correctAnswer: 1,
      },
      {
        type: "pick_word",
        question: "What is the past tense of 'learn'?",
        options: [
          "learned",
          "learnt",
          "both a and b",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "lesson_70",
    title: "Specialise In",
    description: "Specialise in = study or know something very well. She specialises in science. He specialises in maths.",
    examples: [
      "She specialises in science.",
      "He specialises in art.",
      "They specialise in cooking.",
    ],
    practiceItems: [
      {
        type: "pick_word",
        question: "Which is correct?",
        options: [
          "specialise at",
          "specialise in",
          "specialise on",
        ],
        correctAnswer: 1,
      },
    ],
  },
];
