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
  /** The wrong word to tap. */
  wrong: string;
  /**
   * Which occurrence to tap, as a 0-based index into `sentence.split(" ")`.
   * Only needed when the word appears more than once — question tags repeat
   * the verb by nature ("You are coming, are you?"), so the sentence alone
   * cannot say which one is the mistake.
   */
  wrongIndex?: number;
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
  {
    lessonId: "lesson_11",
    steps: [
      { show: "He was late. They were late.", explain: "Was goes with one; were goes with more than one." },
      { show: "I was tired.", explain: "I always takes was, even though it feels like more than one." },
      { show: "The boys was noisy", explain: "This is wrong: boys means more than one, so use were." },
    ],
    tip: "One person was; two or more people were.",
  },
  {
    lessonId: "lesson_12",
    steps: [
      { show: "She has a bag. They have bags.", explain: "Has goes with he, she and it; have goes with the rest." },
      { show: "My brother has a bike.", explain: "One brother is like he, so it takes has." },
      { show: "The girls has new shoes", explain: "This is wrong: girls means more than one, so use have." },
    ],
    tip: "He, she and it take has. I, you, we and they take have.",
  },
  {
    lessonId: "lesson_13",
    steps: [
      { show: "I walk. He walks.", explain: "When you talk about he, she or it, the doing word takes -s." },
      { show: "My sister goes to school by bus.", explain: "One sister is like she, so go becomes goes." },
      { show: "She watch television", explain: "This is wrong: after she, watch becomes watches." },
    ],
    tip: "He, she and it always add -s to the doing word.",
  },
  {
    lessonId: "lesson_14",
    steps: [
      { show: "She is reading a book.", explain: "Use is or are with an -ing word for what happens right now." },
      { show: "They are playing outside.", explain: "More than one takes are, and the -ing word stays the same." },
      { show: "He is play football", explain: "This is wrong: after is, the doing word needs -ing." },
    ],
    tip: "Happening now needs both parts: is or are, plus -ing.",
  },
  {
    lessonId: "lesson_15",
    steps: [
      { show: "play → played, walk → walked", explain: "For things that already happened, most doing words add -ed." },
      { show: "Yesterday she walked to school.", explain: "Yesterday tells you it is finished, so use walked." },
      { show: "Yesterday she walk to school", explain: "This is wrong: it happened already, so add -ed." },
    ],
    tip: "If it already happened, the doing word usually ends in -ed.",
  },
  {
    lessonId: "lesson_16",
    steps: [
      { show: "go → went, eat → ate, see → saw", explain: "Some doing words change completely instead of adding -ed." },
      { show: "She went home early.", explain: "You cannot say goed — the past of go is went." },
      { show: "He eated his lunch", explain: "This is wrong: the past of eat is ate." },
    ],
    tip: "The commonest doing words change shape; learn them by heart.",
  },
  {
    lessonId: "lesson_17",
    steps: [
      { show: "Who? What? Where?", explain: "Who asks about a person, what about a thing, where about a place." },
      { show: "Where is my bag?", explain: "Where fits because a bag is somewhere, not someone." },
      { show: "Who is your bag?", explain: "This is wrong: a bag is a thing, so ask where or what." },
    ],
    tip: "Who is for people, what for things, where for places.",
  },
  {
    lessonId: "lesson_18",
    steps: [
      { show: "Where are you going?", explain: "A sentence that asks something ends with a question mark." },
      { show: "I am going home.", explain: "A sentence that tells something ends with a full stop instead." },
      { show: "What is your name.", explain: "This is wrong: it asks something, so it needs a question mark." },
    ],
    tip: "If it asks, it ends with ?; if it tells, it ends with .",
  },
  {
    lessonId: "lesson_19",
    steps: [
      { show: "I like cake and biscuits.", explain: "And adds one idea to another." },
      { show: "I like cake but not biscuits.", explain: "But shows the second idea is different or surprising." },
      { show: "I ate cake because I was hungry.", explain: "Because gives the reason why." },
    ],
    tip: "And adds, but contrasts, because explains why.",
  },
  {
    lessonId: "lesson_20",
    steps: [
      { show: "in the box, on the table, under the bed", explain: "These little words tell you where something is." },
      { show: "The cat is under the chair.", explain: "Under means below something." },
      { show: "The milk is in the fridge.", explain: "In means inside something." },
    ],
    tip: "In means inside, on means touching the top, under means below.",
  },
  {
    lessonId: "lesson_21",
    steps: [
      { show: "do not → don't, cannot → can't", explain: "Two words join into one, and an apostrophe marks the missing letters." },
      { show: "will not → won't", explain: "This one changes shape as well, so learn it on its own." },
      { show: "dont", explain: "This is wrong: without the apostrophe it is not a word." },
    ],
    tip: "The apostrophe stands exactly where the missing letters were.",
  },
  {
    lessonId: "lesson_22",
    steps: [
      { show: "the cat's tail", explain: "Add 's to show the tail belongs to the cat." },
      { show: "the boys' bags", explain: "If the word already ends in -s, the apostrophe goes after it." },
      { show: "the cats tail", explain: "This is wrong: without the apostrophe it just means many cats." },
    ],
    tip: "Belongs to one: 's. Belongs to many that end in s: s'.",
  },
  {
    lessonId: "lesson_23",
    steps: [
      { show: "I bought apples, pears and grapes.", explain: "Commas separate the things in a list." },
      { show: "apples, pears and grapes", explain: "The last two are joined by and, with no comma needed." },
      { show: "apples pears and grapes", explain: "This is wrong: the first items need commas between them." },
    ],
    tip: "Commas between list items, and before the last one.",
  },
  {
    lessonId: "lesson_24",
    steps: [
      { show: "You are coming, aren't you?", explain: "A positive sentence takes a negative tag." },
      { show: "She isn't ready, is she?", explain: "A negative sentence takes a positive tag." },
      { show: "You are coming, are you?", explain: "This is wrong: after a positive sentence the tag turns negative." },
    ],
    tip: "Positive sentence, negative tag. Negative sentence, positive tag.",
  },
  {
    lessonId: "lesson_25",
    steps: [
      { show: "Where is the library?", explain: "Where asks about a place." },
      { show: "Which book do you want?", explain: "Which asks you to choose from a small set." },
      { show: "Where book do you want?", explain: "This is wrong: you are choosing, so use which." },
    ],
    tip: "Where asks about place; which asks you to choose.",
  },
  {
    lessonId: "lesson_26",
    steps: [
      { show: "I saw a dog. The dog barked.", explain: "Use a the first time, the once you both know which one." },
      { show: "the sun, the moon", explain: "Use the when there is only one of something." },
      { show: "I want to see a moon", explain: "This is wrong: there is only one moon, so use the." },
    ],
    tip: "New thing: a. Thing you both know: the.",
  },
  {
    lessonId: "lesson_27",
    steps: [
      { show: "tall → taller, fast → faster", explain: "Add -er when you compare exactly two things." },
      { show: "She is taller than him.", explain: "Than comes with the -er word when you compare two." },
      { show: "She is more tall than him", explain: "This is wrong: short words take -er, not more." },
    ],
    tip: "Comparing two? Add -er and use than.",
  },
  {
    lessonId: "lesson_28",
    steps: [
      { show: "tall → tallest, fast → fastest", explain: "Add -est when you compare three or more." },
      { show: "She is the tallest in the class.", explain: "The goes in front of the -est word." },
      { show: "She is the taller in the class", explain: "This is wrong: a whole class is more than two, so use tallest." },
    ],
    tip: "Two things: -er. Three or more: the -est.",
  },
  {
    lessonId: "lesson_29",
    steps: [
      { show: "in the room, on the wall, by the door", explain: "Each little word puts the thing in a different place." },
      { show: "The picture is on the wall.", explain: "On means touching the surface." },
      { show: "She waited by the door.", explain: "By means beside or close to." },
    ],
    tip: "In is inside, on is touching, by is beside.",
  },
  {
    lessonId: "lesson_30",
    steps: [
      { show: "one apple, two apples", explain: "Countable things can be counted, and take a plural -s." },
      { show: "water, sugar, furniture", explain: "Uncountable things cannot be counted, and never take -s." },
      { show: "I drank three waters", explain: "This is wrong: water is uncountable, so say three glasses of water." },
    ],
    tip: "If you cannot put a number in front, do not add -s.",
  },
  {
    lessonId: "lesson_31",
    steps: [
      { show: "Swimming is good exercise.", explain: "An -ing word can act as the naming word at the start." },
      { show: "Reading helps you learn.", explain: "Reading is the thing doing the helping, so it takes a singular verb." },
      { show: "Swim is good exercise", explain: "This is wrong: as a subject it needs the -ing form." },
    ],
    tip: "An action used as a thing takes -ing: Swimming is fun.",
  },
  {
    lessonId: "lesson_32",
    steps: [
      { show: "She was reading when I came in.", explain: "Was or were plus -ing shows what was going on at that moment." },
      { show: "They were playing outside.", explain: "More than one takes were, and the -ing word stays." },
      { show: "She was read when I came", explain: "This is wrong: after was, the doing word needs -ing." },
    ],
    tip: "Was or were plus -ing means it was going on at the time.",
  },
  {
    lessonId: "lesson_33",
    steps: [
      { show: "The window has been broken.", explain: "Has been plus a past form means it was done to the thing." },
      { show: "The letters have been posted.", explain: "More than one takes have been." },
      { show: "The window has been break", explain: "This is wrong: it needs the past form, broken." },
    ],
    tip: "Has been or have been is always followed by the past form.",
  },
  {
    lessonId: "lesson_34",
    steps: [
      { show: "one ox → two oxen", explain: "A few plurals use an old ending instead of -s." },
      { show: "one mouse → two mice", explain: "Others change the vowel in the middle." },
      { show: "two mouses", explain: "This is wrong: the plural of mouse is mice." },
    ],
    tip: "Some plurals must be learnt: mice, geese, oxen, children.",
  },
  {
    lessonId: "lesson_35",
    steps: [
      { show: "quick → quickly, happy → happily", explain: "Add -ly to a describing word to say how something is done." },
      { show: "She ran quickly.", explain: "Quickly tells you how she ran." },
      { show: "She ran quick", explain: "This is wrong: it describes the running, so it needs -ly." },
    ],
    tip: "Describing an action? The word usually ends in -ly.",
  },
  {
    lessonId: "lesson_36",
    steps: [
      { show: "I have some milk.", explain: "Use some when the sentence is positive." },
      { show: "I do not have any milk.", explain: "Use any after not, and in questions." },
      { show: "I do not have some milk", explain: "This is wrong: after not, some becomes any." },
    ],
    tip: "Positive takes some; not and questions take any.",
  },
  {
    lessonId: "lesson_37",
    steps: [
      { show: "shine → shone, draw → drew", explain: "These change completely rather than adding -ed." },
      { show: "The sun shone all day.", explain: "Shined is not used here: the past of shine is shone." },
      { show: "He drawed a picture", explain: "This is wrong: the past of draw is drew." },
    ],
    tip: "shone, drew, built, tore, rang, met — learn them as a set.",
  },
  {
    lessonId: "lesson_38",
    steps: [
      { show: "It's raining. = It is raining.", explain: "It's with an apostrophe is short for it is." },
      { show: "The cat licked its paw.", explain: "Its without an apostrophe shows something belongs to it." },
      { show: "The cat licked it's paw", explain: "This is wrong: it would read 'it is paw'." },
    ],
    tip: "If you can say 'it is', use it's. Otherwise use its.",
  },
  {
    lessonId: "lesson_39",
    steps: [
      { show: "doze off, put off, look after", explain: "A doing word plus a small word can change the meaning." },
      { show: "She dozed off during the film.", explain: "Dozed off means fell lightly asleep." },
      { show: "They put off the trip.", explain: "Put off means moved it to a later time." },
    ],
    tip: "The little word matters: put off is not the same as put on.",
  },
  {
    lessonId: "lesson_40",
    steps: [
      { show: "Would you like a drink?", explain: "Would you like is a polite way to offer something." },
      { show: "I wish I could swim.", explain: "I wish I could says you want something that is not true yet." },
      { show: "Would you like to drinking?", explain: "This is wrong: after would you like to, use the plain verb." },
    ],
    tip: "Would you like takes 'a' or 'to' plus the plain verb.",
  },
  {
    lessonId: "lesson_41",
    steps: [
      { show: "The furniture is new.", explain: "Uncountable things take is, never are." },
      { show: "The sugar is on the table.", explain: "You cannot say one sugar, so it stays singular." },
      { show: "The furniture are new", explain: "This is wrong: furniture is uncountable, so use is." },
    ],
    tip: "If you cannot count it, it takes is.",
  },
  {
    lessonId: "lesson_42",
    steps: [
      { show: "Ali and Sara are friends.", explain: "Two people joined by and take a plural verb." },
      { show: "My brother and I were late.", explain: "Two subjects means were, not was." },
      { show: "Ali and Sara is friends", explain: "This is wrong: two people take are." },
    ],
    tip: "Two subjects joined by and always take the plural verb.",
  },
  {
    lessonId: "lesson_43",
    steps: [
      { show: "She used to live in Penang.", explain: "Used to means something happened often in the past." },
      { show: "used to + plain verb", explain: "The verb after used to never takes -ed or -ing." },
      { show: "She used to lived there", explain: "This is wrong: after used to, use the plain verb." },
    ],
    tip: "Used to is followed by the plain form: used to walk.",
  },
  {
    lessonId: "lesson_44",
    steps: [
      { show: "church → churches, box → boxes", explain: "Words ending in ch, sh, s, x or o add -es." },
      { show: "tomato → tomatoes", explain: "Many words ending in o add -es too." },
      { show: "two boxs", explain: "This is wrong: after x the plural adds -es." },
    ],
    tip: "After ch, sh, s, x and o, the plural adds -es.",
  },
  {
    lessonId: "lesson_45",
    steps: [
      { show: "The box is too heavy to lift.", explain: "Too plus a describing word plus to says why it cannot happen." },
      { show: "too + describing word + to + plain verb", explain: "The last verb stays plain: to lift, not to lifting." },
      { show: "too heavy to lifting", explain: "This is wrong: after to, use the plain verb." },
    ],
    tip: "Too … to is always followed by the plain verb.",
  },
  {
    lessonId: "lesson_46",
    steps: [
      { show: "A number of pupils were absent.", explain: "A number of means many, so the verb is plural." },
      { show: "a number of + plural noun + plural verb", explain: "Both the naming word and the verb are plural." },
      { show: "A number of pupil was absent", explain: "This is wrong: it needs pupils and were." },
    ],
    tip: "A number of always takes a plural noun and a plural verb.",
  },
  {
    lessonId: "lesson_47",
    steps: [
      { show: "a girl with red hair", explain: "With means together, or having something." },
      { show: "a cup of tea", explain: "Of shows what something is made of or belongs to." },
      { show: "a cup with tea", explain: "This is wrong: what fills the cup takes of." },
    ],
    tip: "With means having or together; of shows what it is made of.",
  },
  {
    lessonId: "lesson_48",
    steps: [
      { show: "in January, in 2026", explain: "Use in for months and years." },
      { show: "on Monday, on my birthday", explain: "Use on for days and dates." },
      { show: "on January", explain: "This is wrong: a month takes in." },
    ],
    tip: "In for months and years, on for days and dates.",
  },
  {
    lessonId: "lesson_49",
    steps: [
      { show: "taller than / the tallest of all", explain: "Two things use -er and than; three or more use the -est." },
      { show: "She is taller than her sister.", explain: "Only two people here, so use taller." },
      { show: "She is the tallest of the two", explain: "This is wrong: two people take taller, not tallest." },
    ],
    tip: "Two: -er and than. Three or more: the -est.",
  },
  {
    lessonId: "lesson_50",
    steps: [
      { show: "She was met at the airport.", explain: "Was plus a past form means it was done to her." },
      { show: "They were taken home.", explain: "More than one takes were." },
      { show: "She was meet at the airport", explain: "This is wrong: after was, use the past form met." },
    ],
    tip: "Was or were is always followed by the past form.",
  },
  {
    lessonId: "lesson_51",
    steps: [
      { show: "She is keen on painting.", explain: "Keen on means you really like something." },
      { show: "keen on + -ing", explain: "The doing word after keen on always takes -ing." },
      { show: "keen on paint", explain: "This is wrong: after keen on, use painting." },
    ],
    tip: "Keen on is always followed by an -ing word.",
  },
  {
    lessonId: "lesson_52",
    steps: [
      { show: "dangerous, famous, nervous", explain: "Many describing words end in -ous." },
      { show: "danger → dangerous", explain: "The naming word changes into a describing word." },
      { show: "a danger animal", explain: "This is wrong: describing the animal needs dangerous." },
    ],
    tip: "-ous turns a naming word into a describing word.",
  },
  {
    lessonId: "lesson_53",
    steps: [
      { show: "I am bored. The film is boring.", explain: "-ed says how you feel; -ing describes the thing." },
      { show: "She is interested in the interesting book.", explain: "The person feels interested; the book is interesting." },
      { show: "I am boring by the film", explain: "This is wrong: you feel bored, so use bored." },
    ],
    tip: "People feel -ed; things are -ing.",
  },
  {
    lessonId: "lesson_54",
    steps: [
      { show: "countless, careless, useless", explain: "-less means without that thing." },
      { show: "careless = without care", explain: "Break the word in two to work out what it means." },
      { show: "a carefull driver", explain: "This is wrong: with care is careful, spelt with one l." },
    ],
    tip: "-less means without; -ful means with.",
  },
  {
    lessonId: "lesson_55",
    steps: [
      { show: "She goes to school for lessons.", explain: "For tells you the purpose or reason." },
      { show: "a bag for books", explain: "For says what the bag is used for." },
      { show: "a bag of books", explain: "That means the bag is full of books, which is different." },
    ],
    tip: "For gives the purpose; of gives the contents.",
  },
  {
    lessonId: "lesson_56",
    steps: [
      { show: "I am looking forward to seeing you.", explain: "Looking forward to always takes an -ing word." },
      { show: "looking forward to + -ing", explain: "Here to is not part of the verb, so the -ing stays." },
      { show: "looking forward to see you", explain: "This is wrong: it must be seeing." },
    ],
    tip: "Looking forward to is followed by -ing, never the plain verb.",
  },
  {
    lessonId: "lesson_57",
    steps: [
      { show: "one of the tallest boys", explain: "One of the is always followed by a plural naming word." },
      { show: "He is one of my best friends.", explain: "Friends is plural even though he is one person." },
      { show: "one of my best friend", explain: "This is wrong: after one of, the noun is plural." },
    ],
    tip: "One of the always takes a plural noun after it.",
  },
  {
    lessonId: "lesson_58",
    steps: [
      { show: "She is good at maths.", explain: "Good at is about a skill you have." },
      { show: "He is good with children.", explain: "Good with is about getting along with people or animals." },
      { show: "good at children", explain: "This is wrong: getting on with people takes good with." },
    ],
    tip: "Good at a skill; good with people and animals.",
  },
  {
    lessonId: "lesson_59",
    steps: [
      { show: "Although it rained, we went out.", explain: "Although joins two parts of one sentence." },
      { show: "It rained. However, we went out.", explain: "However starts a new sentence and takes a comma." },
      { show: "Although it rained. We went out.", explain: "This is wrong: although cannot end the sentence there." },
    ],
    tip: "Although joins within a sentence; however starts a new one.",
  },
  {
    lessonId: "lesson_60",
    steps: [
      { show: "The colour may fade in the sun.", explain: "May shows something is possible, not certain." },
      { show: "may + plain verb", explain: "The verb after may never takes -s or -ed." },
      { show: "It may fades", explain: "This is wrong: after may, use the plain verb fade." },
    ],
    tip: "May is always followed by the plain verb.",
  },
  {
    lessonId: "lesson_61",
    steps: [
      { show: "The story makes her cry.", explain: "Make plus a person plus the plain verb." },
      { show: "make + someone + plain verb", explain: "There is no to and no -ing after make." },
      { show: "makes her to cry", explain: "This is wrong: after make, drop the to." },
    ],
    tip: "Make somebody do — never make somebody to do.",
  },
  {
    lessonId: "lesson_62",
    steps: [
      { show: "The book was returned.", explain: "One thing takes was." },
      { show: "The books were returned.", explain: "More than one takes were." },
      { show: "The books was returned", explain: "This is wrong: books is plural, so use were." },
    ],
    tip: "Match was or were to how many, then add the past form.",
  },
  {
    lessonId: "lesson_63",
    steps: [
      { show: "We play football at the weekends.", explain: "At the weekends means every weekend." },
      { show: "at the weekends", explain: "This is the usual British way to say it." },
      { show: "on the weekends", explain: "This is not the form your paper expects." },
    ],
    tip: "Use at the weekends for something that happens every weekend.",
  },
  {
    lessonId: "lesson_64",
    steps: [
      { show: "She walked from home to school.", explain: "From marks the start, to marks the end." },
      { show: "from Monday to Friday", explain: "The same pair works for times as well as places." },
      { show: "from home until school", explain: "This is wrong: the end of a journey takes to." },
    ],
    tip: "From is where you start; to is where you end.",
  },
  {
    lessonId: "lesson_65",
    steps: [
      { show: "The animal became extinct.", explain: "Become is followed by a describing word." },
      { show: "She became famous.", explain: "The describing word tells you what she changed into." },
      { show: "She became famously", explain: "This is wrong: after become, use famous, not -ly." },
    ],
    tip: "Become takes a describing word, never an -ly word.",
  },
  {
    lessonId: "lesson_66",
    steps: [
      { show: "The money had been taken.", explain: "Had been plus a past form is something done earlier." },
      { show: "had been + past form", explain: "The verb after had been never stays plain." },
      { show: "had been take", explain: "This is wrong: it must be taken." },
    ],
    tip: "Had been is always followed by the past form.",
  },
  {
    lessonId: "lesson_67",
    steps: [
      { show: "She had finished before I arrived.", explain: "Had plus a past form shows which thing happened first." },
      { show: "had + past form", explain: "Use it for the earlier of two past events." },
      { show: "She had finish before I arrived", explain: "This is wrong: after had, use finished." },
    ],
    tip: "Had plus the past form marks the earlier event.",
  },
  {
    lessonId: "lesson_68",
    steps: [
      { show: "mine, yours, his, hers, theirs", explain: "These stand alone and show who something belongs to." },
      { show: "That bag is mine.", explain: "No naming word follows mine — it replaces the whole thing." },
      { show: "That is mine bag", explain: "This is wrong: before a naming word, use my." },
    ],
    tip: "My bag, but that bag is mine.",
  },
  {
    lessonId: "lesson_69",
    steps: [
      { show: "mean → meant, learn → learnt", explain: "A few verbs end in -t instead of -ed in British English." },
      { show: "She learnt the poem by heart.", explain: "Learnt is the usual British past form." },
      { show: "She learned it wrong", explain: "Not an error, but your paper expects learnt." },
    ],
    tip: "British past forms: meant, learnt, dealt, spelt, burnt.",
  },
  {
    lessonId: "lesson_70",
    steps: [
      { show: "The shop specialises in cakes.", explain: "Specialise in means it does that one thing very well." },
      { show: "specialise in + noun or -ing", explain: "The word after in is a thing or an -ing word." },
      { show: "specialises to cakes", explain: "This is wrong: specialise always takes in." },
    ],
    tip: "Specialise is always followed by in.",
  },
  {
    lessonId: "lesson_71",
    steps: [
      { show: "There is a cat. There are two cats.", explain: "Is goes with one thing; are goes with more than one." },
      { show: "There is some water in the jug.", explain: "Uncountable things like water take is." },
      { show: "There is five apples", explain: "This is wrong: five apples is more than one, so use there are." },
    ],
    tip: "Look at what comes after there: one thing is, many things are.",
  },
  {
    lessonId: "lesson_72",
    steps: [
      { show: "the boy who won", explain: "Who points back to a person." },
      { show: "the book which fell", explain: "Which points back to a thing." },
      { show: "the boy which won", explain: "This is wrong: a boy is a person, so use who." },
    ],
    tip: "Who for people, which for things, that for either.",
  },
  {
    lessonId: "lesson_73",
    steps: [
      { show: "\"I am tired,\" she said.", explain: "These are her exact words, inside speech marks." },
      { show: "She said that she was tired.", explain: "When you report it, am steps back to was." },
      { show: "She said that she is tired", explain: "This is wrong: reporting it moves the tense back." },
    ],
    tip: "Reporting what was said moves the tense one step back.",
  },
  {
    lessonId: "lesson_74",
    steps: [
      { show: "She can swim. You must wait.", explain: "Can, must and should are always followed by the plain verb." },
      { show: "You should drink more water.", explain: "Should gives advice about the best thing to do." },
      { show: "She can swims", explain: "This is wrong: after can, drop the -s." },
    ],
    tip: "After can, must and should, the verb never changes.",
  },
  {
    lessonId: "lesson_75",
    steps: [
      { show: "She always walks to school.", explain: "How-often words go before the main doing word." },
      { show: "He is never late.", explain: "But they go after is, am and are." },
      { show: "She walks always to school", explain: "This is wrong: always goes before walks." },
    ],
    tip: "Before the verb, but after is, am and are.",
  },
  {
    lessonId: "lesson_76",
    steps: [
      { show: "If it rains, we will stay at home.", explain: "The if part uses the present, even about the future." },
      { show: "If + present, will + plain verb", explain: "Only the second half takes will." },
      { show: "If it will rain, we will stay", explain: "This is wrong: the if part never takes will." },
    ],
    tip: "No will in the if part — only in the other half.",
  },
  {
    lessonId: "lesson_77",
    steps: [
      { show: "It was so hot that we stayed inside.", explain: "So goes straight in front of a describing word." },
      { show: "It was such a hot day that we stayed inside.", explain: "Such goes in front of a + describing word + naming word." },
      { show: "It was such hot that we stayed", explain: "This is wrong: with no naming word, use so hot." },
    ],
    tip: "So + describing word. Such + a + describing word + thing.",
  },
  {
    lessonId: "lesson_78",
    steps: [
      { show: "Either Ali or Sara will win.", explain: "Either always pairs with or." },
      { show: "Neither the cat nor the dog is hungry.", explain: "Neither always pairs with nor." },
      { show: "Either Ali nor Sara", explain: "This is wrong: either takes or, never nor." },
    ],
    tip: "Either goes with or; neither goes with nor.",
  },
  {
    lessonId: "lesson_79",
    steps: [
      { show: "a flock of birds, a herd of cows", explain: "A collective noun names a whole group at once." },
      { show: "a bunch of bananas", explain: "Each group has its own word, so they must be learnt." },
      { show: "a herd of birds", explain: "This is wrong: birds come in a flock, not a herd." },
    ],
    tip: "Flock of birds, herd of cows, bunch of bananas, shoal of fish.",
  },
  {
    lessonId: "lesson_80",
    steps: [
      { show: "since Monday", explain: "Since marks when something started." },
      { show: "for three days", explain: "For marks how long it has lasted." },
      { show: "since three days", explain: "This is wrong: a length of time takes for." },
    ],
    tip: "Since points to a starting point; for measures a length.",
  },
  {
    lessonId: "lesson_81",
    steps: [
      { show: "First, wash the rice.", explain: "First marks the step you do at the start." },
      { show: "Next, then, after that", explain: "These carry the reader through the middle steps." },
      { show: "Finally, serve the rice hot.", explain: "Finally marks the last step of all." },
    ],
    tip: "First, next, then, finally — in that order.",
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

  // lesson_11 — was and were
  { lessonId: "lesson_11", sentence: "The boys was very noisy yesterday.", wrong: "was",
    options: ["were", "are", "is"], correct: "were",
    why: "Boys means more than one, so use were." },
  { lessonId: "lesson_11", sentence: "My mother were happy with my work.", wrong: "were",
    options: ["was", "are", "is"], correct: "was",
    why: "One mother is one person, so use was." },
  { lessonId: "lesson_11", sentence: "We was late for the school bus.", wrong: "was",
    options: ["were", "is", "are"], correct: "were",
    why: "We means more than one, so use were." },

  // lesson_12 — has and have
  { lessonId: "lesson_12", sentence: "The girls has new shoes for school.", wrong: "has",
    options: ["have", "had", "having"], correct: "have",
    why: "Girls means more than one, so use have." },
  { lessonId: "lesson_12", sentence: "My brother have a red bicycle.", wrong: "have",
    options: ["has", "had", "having"], correct: "has",
    why: "One brother is like he, so use has." },
  { lessonId: "lesson_12", sentence: "She have two younger sisters at home.", wrong: "have",
    options: ["has", "had", "having"], correct: "has",
    why: "She is one person, so use has." },

  // lesson_13 — simple present -s
  { lessonId: "lesson_13", sentence: "My sister go to school by bus.", wrong: "go",
    options: ["goes", "going", "gone"], correct: "goes",
    why: "One sister is like she, so go becomes goes." },
  { lessonId: "lesson_13", sentence: "He watch television after dinner.", wrong: "watch",
    options: ["watches", "watching", "watched"], correct: "watches",
    why: "After he, a word ending in ch adds -es." },
  { lessonId: "lesson_13", sentence: "The baby cry when she is hungry.", wrong: "cry",
    options: ["cries", "crying", "cryed"], correct: "cries",
    why: "One baby is like she, and cry changes y to -ies." },

  // lesson_14 — present continuous
  { lessonId: "lesson_14", sentence: "He is play football in the field.", wrong: "play",
    options: ["playing", "plays", "played"], correct: "playing",
    why: "After is, the doing word needs -ing." },
  { lessonId: "lesson_14", sentence: "They are watch a film together.", wrong: "watch",
    options: ["watching", "watches", "watched"], correct: "watching",
    why: "After are, the doing word needs -ing." },
  { lessonId: "lesson_14", sentence: "She is write a letter to her friend.", wrong: "write",
    options: ["writing", "writes", "wrote"], correct: "writing",
    why: "After is, use the -ing form: writing." },

  // lesson_15 — simple past -ed
  { lessonId: "lesson_15", sentence: "Yesterday she walk to school alone.", wrong: "walk",
    options: ["walked", "walking", "walks"], correct: "walked",
    why: "Yesterday means it has finished, so add -ed." },
  { lessonId: "lesson_15", sentence: "Last week we visit our grandmother.", wrong: "visit",
    options: ["visited", "visiting", "visits"], correct: "visited",
    why: "Last week is in the past, so add -ed." },
  { lessonId: "lesson_15", sentence: "He play in the garden an hour ago.", wrong: "play",
    options: ["played", "playing", "plays"], correct: "played",
    why: "An hour ago is in the past, so add -ed." },

  // lesson_16 — irregular past
  { lessonId: "lesson_16", sentence: "He eated all his lunch quickly.", wrong: "eated",
    options: ["ate", "eaten", "eating"], correct: "ate",
    why: "Eat does not add -ed: the past of eat is ate." },
  { lessonId: "lesson_16", sentence: "She goed to the shop this morning.", wrong: "goed",
    options: ["went", "gone", "going"], correct: "went",
    why: "Go does not add -ed: the past of go is went." },
  { lessonId: "lesson_16", sentence: "I seed a rainbow after the rain.", wrong: "seed",
    options: ["saw", "seen", "seeing"], correct: "saw",
    why: "See does not add -ed: the past of see is saw." },

  // lesson_17 — question words
  { lessonId: "lesson_17", sentence: "Who is my school bag right now?", wrong: "Who",
    options: ["Where", "Which", "Whose"], correct: "Where",
    why: "A bag is a thing in a place, so ask where." },
  { lessonId: "lesson_17", sentence: "Where is that girl in the blue dress?", wrong: "Where",
    options: ["Who", "What", "Why"], correct: "Who",
    why: "You are asking about a person, so use who." },
  { lessonId: "lesson_17", sentence: "Who did you eat for breakfast today?", wrong: "Who",
    options: ["What", "Where", "When"], correct: "What",
    why: "Breakfast is a thing, so ask what, not who." },

  // lesson_18 — question marks
  { lessonId: "lesson_18", sentence: "What is your name.", wrong: "name.",
    options: ["name?", "name!", "name,"], correct: "name?",
    why: "This sentence asks something, so it ends with a question mark." },
  { lessonId: "lesson_18", sentence: "Where are you going.", wrong: "going.",
    options: ["going?", "going!", "going,"], correct: "going?",
    why: "It asks where, so finish it with a question mark." },
  { lessonId: "lesson_18", sentence: "I am going home?", wrong: "home?",
    options: ["home.", "home,", "home!"], correct: "home.",
    why: "This one tells you something, so it needs a full stop." },

  // lesson_19 — and, but, because
  { lessonId: "lesson_19", sentence: "I was hungry and I ate nothing.", wrong: "and",
    options: ["but", "because", "so"], correct: "but",
    why: "The second part is surprising, so use but." },
  { lessonId: "lesson_19", sentence: "She stayed at home but she was ill.", wrong: "but",
    options: ["because", "and", "or"], correct: "because",
    why: "Being ill is the reason, so use because." },
  { lessonId: "lesson_19", sentence: "He likes cake because biscuits too.", wrong: "because",
    options: ["and", "but", "so"], correct: "and",
    why: "You are adding one thing to another, so use and." },

  // lesson_20 — prepositions of place
  { lessonId: "lesson_20", sentence: "The cat is sleeping in the chair.", wrong: "in",
    options: ["on", "of", "at"], correct: "on",
    why: "The cat is touching the top of it, so use on." },
  { lessonId: "lesson_20", sentence: "My shoes are on the bed, out of sight.", wrong: "on",
    options: ["under", "in", "at"], correct: "under",
    why: "Out of sight below the bed means under." },
  { lessonId: "lesson_20", sentence: "The milk is under the fridge.", wrong: "under",
    options: ["in", "on", "by"], correct: "in",
    why: "The milk is inside the fridge, so use in." },

  // lesson_21 — contractions
  { lessonId: "lesson_21", sentence: "I dont want to go outside today.", wrong: "dont",
    options: ["don't", "do'nt", "donot"], correct: "don't",
    why: "Don't needs an apostrophe where the o of not was." },
  { lessonId: "lesson_21", sentence: "She cant reach the top shelf.", wrong: "cant",
    options: ["can't", "ca'nt", "cannot't"], correct: "can't",
    why: "Can't needs an apostrophe where the no of not was." },
  { lessonId: "lesson_21", sentence: "He wont be late for school again.", wrong: "wont",
    options: ["won't", "wo'nt", "willn't"], correct: "won't",
    why: "Will not becomes won't, with an apostrophe." },

  // lesson_22 — possessives
  { lessonId: "lesson_22", sentence: "The cats tail is long and fluffy.", wrong: "cats",
    options: ["cat's", "cats'", "cats's"], correct: "cat's",
    why: "The tail belongs to one cat, so use 's." },
  { lessonId: "lesson_22", sentence: "My sisters bag is on the chair.", wrong: "sisters",
    options: ["sister's", "sisters'", "sisters's"], correct: "sister's",
    why: "The bag belongs to one sister, so use 's." },
  { lessonId: "lesson_22", sentence: "The boys' bag was left behind by him.", wrong: "boys'",
    options: ["boy's", "boys", "boys's"], correct: "boy's",
    why: "Him means one boy, so the apostrophe goes before the s." },

  // lesson_23 — commas in lists
  { lessonId: "lesson_23", sentence: "I bought apples pears and grapes.", wrong: "apples",
    options: ["apples,", "apples;", "apples."], correct: "apples,",
    why: "Items in a list are separated by commas." },
  { lessonId: "lesson_23", sentence: "She packed socks shoes and a hat.", wrong: "socks",
    options: ["socks,", "socks;", "socks."], correct: "socks,",
    why: "A list needs a comma after each item but the last." },
  { lessonId: "lesson_23", sentence: "We saw lions, tigers, and bears, at the zoo.", wrong: "bears,",
    options: ["bears", "bears;", "bears'"], correct: "bears",
    why: "No comma goes between the last item and the rest." },

  // lesson_24 — question tags
  { lessonId: "lesson_24", sentence: "You are coming to the party, are you?", wrong: "are", wrongIndex: 6,
    options: ["aren't", "is", "do"], correct: "aren't",
    why: "A positive sentence takes a negative tag." },
  { lessonId: "lesson_24", sentence: "She isn't ready yet, isn't she?", wrong: "isn't", wrongIndex: 4,
    options: ["is", "are", "was"], correct: "is",
    why: "A negative sentence takes a positive tag." },
  { lessonId: "lesson_24", sentence: "They can swim well, can they?", wrong: "can", wrongIndex: 4,
    options: ["can't", "could", "do"], correct: "can't",
    why: "The sentence is positive, so the tag turns negative." },

  // lesson_25 — where and which
  { lessonId: "lesson_25", sentence: "Where book would you like to borrow?", wrong: "Where",
    options: ["Which", "Who", "When"], correct: "Which",
    why: "You are choosing between books, so use which." },
  { lessonId: "lesson_25", sentence: "Which is the library in this school?", wrong: "Which",
    options: ["Where", "Who", "Why"], correct: "Where",
    why: "You are asking about a place, so use where." },
  { lessonId: "lesson_25", sentence: "Where colour do you like best?", wrong: "Where",
    options: ["Which", "Who", "Whose"], correct: "Which",
    why: "You are choosing from some colours, so use which." },

  // lesson_26 — the vs a
  { lessonId: "lesson_26", sentence: "We watched a sun set over the sea.", wrong: "a",
    options: ["the", "an", "one"], correct: "the",
    why: "There is only one sun, so it takes the." },
  { lessonId: "lesson_26", sentence: "She wants to buy the new bag someday.", wrong: "the",
    options: ["a", "an", "any"], correct: "a",
    why: "We do not know which bag yet, so use a." },
  { lessonId: "lesson_26", sentence: "He looked up at a moon last night.", wrong: "a",
    options: ["the", "an", "some"], correct: "the",
    why: "There is only one moon, so it takes the." },

  // lesson_27 — comparatives
  { lessonId: "lesson_27", sentence: "My brother is more tall than me.", wrong: "more",
    options: ["taller", "tallest", "most"], correct: "taller",
    why: "Short words add -er instead of using more." },
  { lessonId: "lesson_27", sentence: "This bag is heavyer than that one.", wrong: "heavyer",
    options: ["heavier", "heaviest", "heavy"], correct: "heavier",
    why: "Words ending in y change to i before -er." },
  { lessonId: "lesson_27", sentence: "She runs fastest than her friend.", wrong: "fastest",
    options: ["faster", "fast", "more fast"], correct: "faster",
    why: "Comparing two people takes -er, not -est." },

  // lesson_28 — superlatives
  { lessonId: "lesson_28", sentence: "He is the taller boy in the class.", wrong: "taller",
    options: ["tallest", "tall", "more tall"], correct: "tallest",
    why: "A whole class is more than two, so use -est." },
  { lessonId: "lesson_28", sentence: "That was the more exciting day of all.", wrong: "more",
    options: ["most", "much", "very"], correct: "most",
    why: "Comparing all of them takes most, not more." },
  { lessonId: "lesson_28", sentence: "This is the small puppy of the three.", wrong: "small",
    options: ["smallest", "smaller", "most small"], correct: "smallest",
    why: "Three puppies means the -est form: smallest." },

  // lesson_29 — prepositions of place
  { lessonId: "lesson_29", sentence: "The picture hangs in the wall.", wrong: "in",
    options: ["on", "at", "of"], correct: "on",
    why: "It touches the surface of the wall, so use on." },
  { lessonId: "lesson_29", sentence: "She waited on the door for her friend.", wrong: "on",
    options: ["by", "in", "of"], correct: "by",
    why: "Waiting beside the door means by the door." },
  { lessonId: "lesson_29", sentence: "The keys are by my pocket.", wrong: "by",
    options: ["in", "on", "at"], correct: "in",
    why: "Inside a pocket means in, not by." },

  // lesson_30 — countable and uncountable
  { lessonId: "lesson_30", sentence: "She drank three waters after the race.", wrong: "waters",
    options: ["glasses of water", "water's", "waters'"], correct: "glasses of water",
    why: "Water cannot be counted, so count the glasses instead." },
  { lessonId: "lesson_30", sentence: "He bought two furnitures for his room.", wrong: "furnitures",
    options: ["pieces of furniture", "furniture's", "furnitures'"], correct: "pieces of furniture",
    why: "Furniture cannot be counted, so count the pieces." },
  { lessonId: "lesson_30", sentence: "I need to buy some breads for lunch.", wrong: "breads",
    options: ["bread", "bread's", "breades"], correct: "bread",
    why: "Bread cannot be counted, so it never takes -s." },

  // lesson_31 — gerunds as subjects
  { lessonId: "lesson_31", sentence: "Swim is very good exercise for you.", wrong: "Swim",
    options: ["Swimming", "Swims", "Swam"], correct: "Swimming",
    why: "An action used as a thing takes the -ing form." },
  { lessonId: "lesson_31", sentence: "Read helps you learn many new words.", wrong: "Read",
    options: ["Reading", "Reads", "Readed"], correct: "Reading",
    why: "As the subject of the sentence, read becomes reading." },
  { lessonId: "lesson_31", sentence: "Run every morning keeps him fit.", wrong: "Run",
    options: ["Running", "Runs", "Ran"], correct: "Running",
    why: "The action is the subject here, so use running." },

  // lesson_32 — past continuous
  { lessonId: "lesson_32", sentence: "She was read a book when I arrived.", wrong: "read",
    options: ["reading", "reads", "readed"], correct: "reading",
    why: "After was, the doing word needs -ing." },
  { lessonId: "lesson_32", sentence: "They was playing football in the rain.", wrong: "was",
    options: ["were", "is", "are"], correct: "were",
    why: "They means more than one, so use were." },
  { lessonId: "lesson_32", sentence: "We were watch television all evening.", wrong: "watch",
    options: ["watching", "watches", "watched"], correct: "watching",
    why: "After were, the doing word needs -ing." },

  // lesson_33 — passive with has been
  { lessonId: "lesson_33", sentence: "The window has been break by the ball.", wrong: "break",
    options: ["broken", "broke", "breaking"], correct: "broken",
    why: "After has been, use the past form broken." },
  { lessonId: "lesson_33", sentence: "The letters has been posted this morning.", wrong: "has",
    options: ["have", "is", "was"], correct: "have",
    why: "Letters means more than one, so use have been." },
  { lessonId: "lesson_33", sentence: "The room has been clean by my sister.", wrong: "clean",
    options: ["cleaned", "cleans", "cleaning"], correct: "cleaned",
    why: "After has been, use the past form cleaned." },

  // lesson_34 — irregular plurals
  { lessonId: "lesson_34", sentence: "Two mouses ran under the kitchen door.", wrong: "mouses",
    options: ["mice", "mouse", "mices"], correct: "mice",
    why: "The plural of mouse is mice, with no -s." },
  { lessonId: "lesson_34", sentence: "The farmer keeps three gooses on the pond.", wrong: "gooses",
    options: ["geese", "goose", "geeses"], correct: "geese",
    why: "The plural of goose is geese." },
  { lessonId: "lesson_34", sentence: "Many childs were waiting at the gate.", wrong: "childs",
    options: ["children", "child", "childrens"], correct: "children",
    why: "The plural of child is children." },

  // lesson_35 — adverbs from adjectives
  { lessonId: "lesson_35", sentence: "She ran quick to catch the bus.", wrong: "quick",
    options: ["quickly", "quicker", "quickest"], correct: "quickly",
    why: "It describes how she ran, so it takes -ly." },
  { lessonId: "lesson_35", sentence: "He spoke soft so nobody would hear.", wrong: "soft",
    options: ["softly", "softer", "softest"], correct: "softly",
    why: "It describes how he spoke, so it takes -ly." },
  { lessonId: "lesson_35", sentence: "The children played happy in the garden.", wrong: "happy",
    options: ["happily", "happier", "happiest"], correct: "happily",
    why: "Happy becomes happily when it describes an action." },

  // lesson_36 — some and any
  { lessonId: "lesson_36", sentence: "I do not have some milk left.", wrong: "some",
    options: ["any", "much", "many"], correct: "any",
    why: "After not, some changes to any." },
  { lessonId: "lesson_36", sentence: "She did not buy some apples today.", wrong: "some",
    options: ["any", "a", "much"], correct: "any",
    why: "A sentence with not takes any, not some." },
  { lessonId: "lesson_36", sentence: "There is not some water in the bottle.", wrong: "some",
    options: ["any", "many", "a"], correct: "any",
    why: "After is not, use any instead of some." },

  // lesson_37 — irregular past forms
  { lessonId: "lesson_37", sentence: "The sun shined brightly all afternoon.", wrong: "shined",
    options: ["shone", "shine", "shining"], correct: "shone",
    why: "The past of shine is shone." },
  { lessonId: "lesson_37", sentence: "He drawed a picture of his house.", wrong: "drawed",
    options: ["drew", "drawn", "drawing"], correct: "drew",
    why: "The past of draw is drew, not drawed." },
  { lessonId: "lesson_37", sentence: "The bell ringed at the end of break.", wrong: "ringed",
    options: ["rang", "rung", "ringing"], correct: "rang",
    why: "The past of ring is rang." },

  // lesson_38 — it's vs its
  { lessonId: "lesson_38", sentence: "The cat licked it's paw clean.", wrong: "it's",
    options: ["its", "its'", "it"], correct: "its",
    why: "The paw belongs to it, so use its with no apostrophe." },
  { lessonId: "lesson_38", sentence: "Its raining hard outside today.", wrong: "Its",
    options: ["It's", "Its'", "It"], correct: "It's",
    why: "This means it is raining, so use it's." },
  { lessonId: "lesson_38", sentence: "The dog wagged it's tail happily.", wrong: "it's",
    options: ["its", "its'", "it"], correct: "its",
    why: "The tail belongs to the dog, so use its." },

  // lesson_39 — phrasal verbs
  { lessonId: "lesson_39", sentence: "She dozed on during the long film.", wrong: "on",
    options: ["off", "up", "in"], correct: "off",
    why: "Dozed off means fell lightly asleep." },
  { lessonId: "lesson_39", sentence: "They put on the trip until next month.", wrong: "on",
    options: ["off", "up", "down"], correct: "off",
    why: "Put off means moved it to a later time." },
  { lessonId: "lesson_39", sentence: "Please look at your little brother today.", wrong: "at",
    options: ["after", "up", "for"], correct: "after",
    why: "Look after means take care of someone." },

  // lesson_40 — would you like / I wish I could
  { lessonId: "lesson_40", sentence: "Would you like to drinking some juice?", wrong: "drinking",
    options: ["drink", "drank", "drunk"], correct: "drink",
    why: "After to, use the plain verb: to drink." },
  { lessonId: "lesson_40", sentence: "I wish I can swim as well as you.", wrong: "can",
    options: ["could", "will", "shall"], correct: "could",
    why: "I wish is followed by could, not can." },
  { lessonId: "lesson_40", sentence: "I wish I could swimming in the sea.", wrong: "swimming",
    options: ["swim", "swam", "swum"], correct: "swim",
    why: "After could, use the plain verb swim." },

  // lesson_41 — uncountable nouns take is
  { lessonId: "lesson_41", sentence: "The furniture in this room are new.", wrong: "are",
    options: ["is", "were", "have"], correct: "is",
    why: "Furniture cannot be counted, so it takes is." },
  { lessonId: "lesson_41", sentence: "The sugar are on the top shelf.", wrong: "are",
    options: ["is", "were", "have"], correct: "is",
    why: "Sugar is uncountable, so use is." },
  { lessonId: "lesson_41", sentence: "The dust on the shelves are thick.", wrong: "are",
    options: ["is", "were", "have"], correct: "is",
    why: "Dust is uncountable, so it takes is." },

  // lesson_42 — two subjects
  { lessonId: "lesson_42", sentence: "Ali and Sara is best friends at school.", wrong: "is",
    options: ["are", "was", "has"], correct: "are",
    why: "Two people joined by and take are." },
  { lessonId: "lesson_42", sentence: "My brother and I was late for class.", wrong: "was",
    options: ["were", "is", "are"], correct: "were",
    why: "Two people take the plural verb were." },
  { lessonId: "lesson_42", sentence: "The cat and the dog sleeps in the sun.", wrong: "sleeps",
    options: ["sleep", "sleeping", "slept"], correct: "sleep",
    why: "Two animals take the plural verb sleep." },

  // lesson_43 — used to
  { lessonId: "lesson_43", sentence: "She used to lived in a small village.", wrong: "lived",
    options: ["live", "living", "lives"], correct: "live",
    why: "After used to, use the plain verb live." },
  { lessonId: "lesson_43", sentence: "He used to walking to school every day.", wrong: "walking",
    options: ["walk", "walked", "walks"], correct: "walk",
    why: "Used to is followed by the plain verb walk." },
  { lessonId: "lesson_43", sentence: "We used to played by the river.", wrong: "played",
    options: ["play", "playing", "plays"], correct: "play",
    why: "After used to, the verb stays plain: play." },

  // lesson_44 — plural -es
  { lessonId: "lesson_44", sentence: "She packed two boxs of books.", wrong: "boxs",
    options: ["boxes", "box", "boxies"], correct: "boxes",
    why: "Words ending in x add -es to become plural." },
  { lessonId: "lesson_44", sentence: "There are three churchs in our town.", wrong: "churchs",
    options: ["churches", "church", "churchies"], correct: "churches",
    why: "Words ending in ch add -es to become plural." },
  { lessonId: "lesson_44", sentence: "He sliced two tomatos for the salad.", wrong: "tomatos",
    options: ["tomatoes", "tomato", "tomatoies"], correct: "tomatoes",
    why: "Tomato adds -es to become tomatoes." },

  // lesson_45 — too + adjective + to
  { lessonId: "lesson_45", sentence: "The box is too heavy to lifting alone.", wrong: "lifting",
    options: ["lift", "lifted", "lifts"], correct: "lift",
    why: "After to, use the plain verb lift." },
  { lessonId: "lesson_45", sentence: "The tea is too hot to drinking now.", wrong: "drinking",
    options: ["drink", "drank", "drinks"], correct: "drink",
    why: "Too hot to is followed by the plain verb drink." },
  { lessonId: "lesson_45", sentence: "He was too tired to walking any further.", wrong: "walking",
    options: ["walk", "walked", "walks"], correct: "walk",
    why: "After to, the verb stays plain: to walk." },

  // lesson_46 — a number of
  { lessonId: "lesson_46", sentence: "A number of pupil were absent today.", wrong: "pupil",
    options: ["pupils", "pupil's", "pupiles"], correct: "pupils",
    why: "A number of is always followed by a plural noun." },
  { lessonId: "lesson_46", sentence: "A number of birds was resting on the wire.", wrong: "was",
    options: ["were", "is", "has"], correct: "were",
    why: "A number of means many, so the verb is plural." },
  { lessonId: "lesson_46", sentence: "A number of book are missing from the shelf.", wrong: "book",
    options: ["books", "book's", "bookes"], correct: "books",
    why: "A number of needs the plural noun books." },

  // lesson_47 — with vs of
  { lessonId: "lesson_47", sentence: "She drank a cup with tea after lunch.", wrong: "with",
    options: ["of", "in", "for"], correct: "of",
    why: "What fills the cup takes of: a cup of tea." },
  { lessonId: "lesson_47", sentence: "He bought a bag with rice at the market.", wrong: "with",
    options: ["of", "in", "by"], correct: "of",
    why: "A bag of rice tells you what is inside." },
  { lessonId: "lesson_47", sentence: "The girl of red hair is my cousin.", wrong: "of",
    options: ["with", "in", "on"], correct: "with",
    why: "Having something takes with: a girl with red hair." },

  // lesson_48 — in vs on for time
  { lessonId: "lesson_48", sentence: "My birthday is on January this year.", wrong: "on",
    options: ["in", "at", "by"], correct: "in",
    why: "Months take in: in January." },
  { lessonId: "lesson_48", sentence: "We have sports in Monday afternoon.", wrong: "in",
    options: ["on", "at", "by"], correct: "on",
    why: "Days of the week take on: on Monday." },
  { lessonId: "lesson_48", sentence: "The school was built on 1985.", wrong: "on",
    options: ["in", "at", "by"], correct: "in",
    why: "Years take in: in 1985." },

  // lesson_49 — comparatives vs superlatives
  { lessonId: "lesson_49", sentence: "She is the tallest of the two girls.", wrong: "tallest",
    options: ["taller", "tall", "most tall"], correct: "taller",
    why: "Only two girls, so use taller, not tallest." },
  { lessonId: "lesson_49", sentence: "This is the better book in the whole library.", wrong: "better",
    options: ["best", "good", "gooder"], correct: "best",
    why: "A whole library is many, so use the best." },
  { lessonId: "lesson_49", sentence: "He is the faster runner in his class.", wrong: "faster",
    options: ["fastest", "fast", "most fast"], correct: "fastest",
    why: "A class is more than two, so use fastest." },

  // lesson_50 — passive with was/were
  { lessonId: "lesson_50", sentence: "She was meet at the airport by her uncle.", wrong: "meet",
    options: ["met", "meeting", "meets"], correct: "met",
    why: "After was, use the past form met." },
  { lessonId: "lesson_50", sentence: "The children was taken home early.", wrong: "was",
    options: ["were", "is", "has"], correct: "were",
    why: "Children means more than one, so use were." },
  { lessonId: "lesson_50", sentence: "The cakes were bake by my grandmother.", wrong: "bake",
    options: ["baked", "baking", "bakes"], correct: "baked",
    why: "After were, use the past form baked." },

  // lesson_51 — keen on
  { lessonId: "lesson_51", sentence: "She is keen on paint in her free time.", wrong: "paint",
    options: ["painting", "paints", "painted"], correct: "painting",
    why: "Keen on is always followed by an -ing word." },
  { lessonId: "lesson_51", sentence: "He is keen at football and swimming.", wrong: "at",
    options: ["on", "in", "of"], correct: "on",
    why: "The phrase is keen on, not keen at." },
  { lessonId: "lesson_51", sentence: "They are keen on collect old stamps.", wrong: "collect",
    options: ["collecting", "collects", "collected"], correct: "collecting",
    why: "After keen on, the verb takes -ing." },

  // lesson_52 — -ous adjectives
  { lessonId: "lesson_52", sentence: "That is a danger animal to touch.", wrong: "danger",
    options: ["dangerous", "dangerly", "dangered"], correct: "dangerous",
    why: "Describing the animal needs the -ous form." },
  { lessonId: "lesson_52", sentence: "She felt nerve before the school concert.", wrong: "nerve",
    options: ["nervous", "nerved", "nervely"], correct: "nervous",
    why: "The describing word for that feeling is nervous." },
  { lessonId: "lesson_52", sentence: "He became fame after winning the prize.", wrong: "fame",
    options: ["famous", "famed", "famely"], correct: "famous",
    why: "After became, use the describing word famous." },

  // lesson_53 — -ed vs -ing adjectives
  { lessonId: "lesson_53", sentence: "I was boring by the long film.", wrong: "boring",
    options: ["bored", "bore", "boredom"], correct: "bored",
    why: "You feel bored; the film is boring." },
  { lessonId: "lesson_53", sentence: "The book was very interested to read.", wrong: "interested",
    options: ["interesting", "interest", "interestly"], correct: "interesting",
    why: "A thing is interesting; a person feels interested." },
  { lessonId: "lesson_53", sentence: "She was very exciting about the trip.", wrong: "exciting",
    options: ["excited", "excite", "excitement"], correct: "excited",
    why: "People feel excited; things are exciting." },

  // lesson_54 — -less adjectives
  { lessonId: "lesson_54", sentence: "He is a very careless driver, so we feel safe.", wrong: "careless",
    options: ["careful", "carefully", "caring"], correct: "careful",
    why: "Feeling safe means the driver has care: careful." },
  { lessonId: "lesson_54", sentence: "The old torch was quite useful without a battery.", wrong: "useful",
    options: ["useless", "using", "used"], correct: "useless",
    why: "Without a battery it has no use, so it is useless." },
  { lessonId: "lesson_54", sentence: "There were countful stars in the night sky.", wrong: "countful",
    options: ["countless", "counted", "counting"], correct: "countless",
    why: "Too many to count means countless." },

  // lesson_55 — for + purpose
  { lessonId: "lesson_55", sentence: "This is a bag of carrying books.", wrong: "of",
    options: ["for", "with", "to"], correct: "for",
    why: "What the bag is used for takes for." },
  { lessonId: "lesson_55", sentence: "She goes to the hall of assembly each morning.", wrong: "of",
    options: ["for", "with", "by"], correct: "for",
    why: "The reason she goes there takes for." },
  { lessonId: "lesson_55", sentence: "He saved his money to a new bicycle.", wrong: "to",
    options: ["for", "of", "with"], correct: "for",
    why: "Saving with a purpose in mind takes for." },

  // lesson_56 — looking forward to
  { lessonId: "lesson_56", sentence: "I am looking forward to see you again.", wrong: "see",
    options: ["seeing", "saw", "seen"], correct: "seeing",
    why: "Looking forward to is followed by an -ing word." },
  { lessonId: "lesson_56", sentence: "She is looking forward to meet her cousins.", wrong: "meet",
    options: ["meeting", "met", "meets"], correct: "meeting",
    why: "After looking forward to, use the -ing form." },
  { lessonId: "lesson_56", sentence: "We look forward to visit the museum.", wrong: "visit",
    options: ["visiting", "visited", "visits"], correct: "visiting",
    why: "Look forward to always takes the -ing form." },

  // lesson_57 — one of the + plural
  { lessonId: "lesson_57", sentence: "He is one of my best friend at school.", wrong: "friend",
    options: ["friends", "friend's", "friendes"], correct: "friends",
    why: "One of is always followed by a plural noun." },
  { lessonId: "lesson_57", sentence: "She is one of the tallest girl in class.", wrong: "girl",
    options: ["girls", "girl's", "girles"], correct: "girls",
    why: "After one of the, the naming word is plural." },
  { lessonId: "lesson_57", sentence: "That is one of the oldest building in town.", wrong: "building",
    options: ["buildings", "building's", "buildinges"], correct: "buildings",
    why: "One of the takes a plural noun: buildings." },

  // lesson_58 — good at vs good with
  { lessonId: "lesson_58", sentence: "My aunt is very good at children.", wrong: "at",
    options: ["with", "for", "in"], correct: "with",
    why: "Getting on with people takes good with." },
  { lessonId: "lesson_58", sentence: "She is good with maths and science.", wrong: "with",
    options: ["at", "for", "on"], correct: "at",
    why: "A skill or subject takes good at." },
  { lessonId: "lesson_58", sentence: "He is good in drawing cartoons.", wrong: "in",
    options: ["at", "with", "for"], correct: "at",
    why: "Drawing is a skill, so it takes good at." },

  // lesson_59 — although vs however
  { lessonId: "lesson_59", sentence: "However it rained, we went to the park.", wrong: "However",
    options: ["Although", "Because", "So"], correct: "Although",
    why: "Although joins the two parts of one sentence." },
  { lessonId: "lesson_59", sentence: "It rained hard. Although, we still went out.", wrong: "Although",
    options: ["However", "Because", "And"], correct: "However",
    why: "Starting a new sentence with a contrast takes however." },
  { lessonId: "lesson_59", sentence: "However she was tired, she finished her work.", wrong: "However",
    options: ["Although", "Because", "So"], correct: "Although",
    why: "Two parts in one sentence take although." },

  // lesson_60 — may + base verb
  { lessonId: "lesson_60", sentence: "The colour may fades in strong sunlight.", wrong: "fades",
    options: ["fade", "faded", "fading"], correct: "fade",
    why: "After may, use the plain verb fade." },
  { lessonId: "lesson_60", sentence: "It may rains later this afternoon.", wrong: "rains",
    options: ["rain", "rained", "raining"], correct: "rain",
    why: "May is always followed by the plain verb." },
  { lessonId: "lesson_60", sentence: "She may goes to the party tonight.", wrong: "goes",
    options: ["go", "went", "going"], correct: "go",
    why: "After may, the verb stays plain: go." },

  // lesson_61 — make + someone + base verb
  { lessonId: "lesson_61", sentence: "The sad story makes her to cry.", wrong: "to",
    options: ["cry", "crying", "cried"], correct: "cry",
    why: "After make somebody, drop the to: makes her cry." },
  { lessonId: "lesson_61", sentence: "His jokes make us laughing every time.", wrong: "laughing",
    options: ["laugh", "laughed", "laughs"], correct: "laugh",
    why: "Make somebody is followed by the plain verb." },
  { lessonId: "lesson_61", sentence: "The teacher made him to stay behind.", wrong: "to",
    options: ["stay", "stayed", "staying"], correct: "stay",
    why: "Made somebody takes the plain verb, with no to." },

  // lesson_62 — was/were + past participle
  { lessonId: "lesson_62", sentence: "The books was returned to the library.", wrong: "was",
    options: ["were", "is", "has"], correct: "were",
    why: "Books is plural, so use were." },
  { lessonId: "lesson_62", sentence: "The letter were posted this morning.", wrong: "were",
    options: ["was", "are", "have"], correct: "was",
    why: "One letter is singular, so use was." },
  { lessonId: "lesson_62", sentence: "The windows was cleaned last week.", wrong: "was",
    options: ["were", "is", "has"], correct: "were",
    why: "Windows is plural, so it takes were." },

  // lesson_63 — at the weekends
  { lessonId: "lesson_63", sentence: "We play football on the weekends.", wrong: "on",
    options: ["at", "in", "by"], correct: "at",
    why: "The usual form is at the weekends." },
  { lessonId: "lesson_63", sentence: "She visits her grandmother in the weekends.", wrong: "in",
    options: ["at", "on", "for"], correct: "at",
    why: "Use at the weekends for something that repeats." },
  { lessonId: "lesson_63", sentence: "They go swimming during the weekends sometimes.", wrong: "during",
    options: ["at", "on", "by"], correct: "at",
    why: "At the weekends is the form your paper expects." },

  // lesson_64 — from vs to
  { lessonId: "lesson_64", sentence: "She walked from home until school today.", wrong: "until",
    options: ["to", "at", "by"], correct: "to",
    why: "The end of a journey takes to." },
  { lessonId: "lesson_64", sentence: "The shop is open to Monday to Friday.", wrong: "to", wrongIndex: 4,
    options: ["from", "at", "in"], correct: "from",
    why: "The start of a period takes from." },
  { lessonId: "lesson_64", sentence: "He travelled from Penang until Ipoh by train.", wrong: "until",
    options: ["to", "at", "in"], correct: "to",
    why: "From marks the start and to marks the end." },

  // lesson_65 — become + adjective
  { lessonId: "lesson_65", sentence: "The animal became extinctly many years ago.", wrong: "extinctly",
    options: ["extinct", "extinction", "extincted"], correct: "extinct",
    why: "After became, use the describing word extinct." },
  { lessonId: "lesson_65", sentence: "She became famously after the competition.", wrong: "famously",
    options: ["famous", "fame", "famed"], correct: "famous",
    why: "Become takes a describing word, not an -ly word." },
  { lessonId: "lesson_65", sentence: "The room became quietly when he entered.", wrong: "quietly",
    options: ["quiet", "quieted", "quietness"], correct: "quiet",
    why: "After became, use quiet, not quietly." },

  // lesson_66 — had been + past participle
  { lessonId: "lesson_66", sentence: "The money had been take from the drawer.", wrong: "take",
    options: ["taken", "took", "taking"], correct: "taken",
    why: "After had been, use the past form taken." },
  { lessonId: "lesson_66", sentence: "The window had been break before we arrived.", wrong: "break",
    options: ["broken", "broke", "breaking"], correct: "broken",
    why: "Had been is followed by the past form broken." },
  { lessonId: "lesson_66", sentence: "The work had been finish by lunchtime.", wrong: "finish",
    options: ["finished", "finishing", "finishes"], correct: "finished",
    why: "After had been, use the past form finished." },

  // lesson_67 — past perfect
  { lessonId: "lesson_67", sentence: "She had finish her homework before dinner.", wrong: "finish",
    options: ["finished", "finishing", "finishes"], correct: "finished",
    why: "After had, use the past form finished." },
  { lessonId: "lesson_67", sentence: "They had eat everything before we came.", wrong: "eat",
    options: ["eaten", "ate", "eating"], correct: "eaten",
    why: "After had, the past form of eat is eaten." },
  { lessonId: "lesson_67", sentence: "He had leave the house before it rained.", wrong: "leave",
    options: ["left", "leaving", "leaves"], correct: "left",
    why: "After had, use the past form left." },

  // lesson_68 — possessive pronouns
  { lessonId: "lesson_68", sentence: "That blue bag over there is mine bag.", wrong: "mine",
    options: ["my", "mines", "me"], correct: "my",
    why: "Before a naming word, use my; mine stands alone." },
  { lessonId: "lesson_68", sentence: "This pencil is your, not his.", wrong: "your",
    options: ["yours", "you", "your's"], correct: "yours",
    why: "Standing alone, it becomes yours." },
  { lessonId: "lesson_68", sentence: "The red umbrella is her.", wrong: "her",
    options: ["hers", "her's", "she"], correct: "hers",
    why: "Standing alone at the end, it becomes hers." },

  // lesson_69 — -t past forms
  { lessonId: "lesson_69", sentence: "She learned the whole poem by heart.", wrong: "learned",
    options: ["learnt", "learn", "learning"], correct: "learnt",
    why: "British English usually writes this as learnt." },
  { lessonId: "lesson_69", sentence: "He meaned to say sorry yesterday.", wrong: "meaned",
    options: ["meant", "mean", "meaning"], correct: "meant",
    why: "The past of mean is meant, ending in -t." },
  { lessonId: "lesson_69", sentence: "The toast burned in the hot oven.", wrong: "burned",
    options: ["burnt", "burn", "burning"], correct: "burnt",
    why: "British English usually writes this as burnt." },

  // lesson_70 — specialise in
  { lessonId: "lesson_70", sentence: "That shop specialises to birthday cakes.", wrong: "to",
    options: ["in", "on", "at"], correct: "in",
    why: "Specialise is always followed by in." },
  { lessonId: "lesson_70", sentence: "She specialises on teaching young children.", wrong: "on",
    options: ["in", "to", "for"], correct: "in",
    why: "The phrase is specialise in, not specialise on." },
  { lessonId: "lesson_70", sentence: "The doctor specialises at children's illnesses.", wrong: "at",
    options: ["in", "on", "for"], correct: "in",
    why: "Specialise takes in before the subject." },

  // lesson_71 — there is / there are
  { lessonId: "lesson_71", sentence: "There is five apples in the bowl.", wrong: "is",
    options: ["are", "was", "be"], correct: "are",
    why: "Five apples is more than one, so use there are." },
  { lessonId: "lesson_71", sentence: "There are a cat in the garden.", wrong: "are",
    options: ["is", "were", "be"], correct: "is",
    why: "One cat is just one, so use there is." },
  { lessonId: "lesson_71", sentence: "There are some water left in the jug.", wrong: "are",
    options: ["is", "were", "be"], correct: "is",
    why: "Water cannot be counted, so use there is." },

  // lesson_72 — relative clauses
  { lessonId: "lesson_72", sentence: "The boy which won the race is my friend.", wrong: "which",
    options: ["who", "whose", "whom"], correct: "who",
    why: "A boy is a person, so use who." },
  { lessonId: "lesson_72", sentence: "The book who fell off the shelf is torn.", wrong: "who",
    options: ["which", "whose", "whom"], correct: "which",
    why: "A book is a thing, so use which." },
  { lessonId: "lesson_72", sentence: "The girl which sits beside me is kind.", wrong: "which",
    options: ["who", "whose", "what"], correct: "who",
    why: "A girl is a person, so use who." },

  // lesson_73 — reported speech
  { lessonId: "lesson_73", sentence: "She said that she is very tired.", wrong: "is",
    options: ["was", "are", "be"], correct: "was",
    why: "Reporting what she said moves is back to was." },
  { lessonId: "lesson_73", sentence: "He said that he likes chocolate cake.", wrong: "likes",
    options: ["liked", "liking", "like"], correct: "liked",
    why: "Reported speech moves likes back to liked." },
  { lessonId: "lesson_73", sentence: "They said that they are ready to go.", wrong: "are",
    options: ["were", "is", "be"], correct: "were",
    why: "Reporting it moves are back to were." },

  // lesson_74 — modals
  { lessonId: "lesson_74", sentence: "She can swims across the whole pool.", wrong: "swims",
    options: ["swim", "swimming", "swam"], correct: "swim",
    why: "After can, use the plain verb swim." },
  { lessonId: "lesson_74", sentence: "You must to wear a helmet when cycling.", wrong: "to",
    options: ["wear", "wearing", "wore"], correct: "wear",
    why: "Must is followed by the plain verb, with no to." },
  { lessonId: "lesson_74", sentence: "You should drinking more water each day.", wrong: "drinking",
    options: ["drink", "drank", "drinks"], correct: "drink",
    why: "After should, use the plain verb drink." },

  // lesson_75 — adverbs of frequency
  { lessonId: "lesson_75", sentence: "She sometimes walks to school every single day.", wrong: "sometimes",
    options: ["always", "never", "rarely"], correct: "always",
    why: "Every single day means always, not sometimes." },
  { lessonId: "lesson_75", sentence: "He always eats durian, although he hates the smell.", wrong: "always",
    options: ["never", "often", "usually"], correct: "never",
    why: "Hating the smell means he never eats it." },
  { lessonId: "lesson_75", sentence: "She is often at school on Sundays, when it is closed.", wrong: "often",
    options: ["never", "always", "usually"], correct: "never",
    why: "The school is closed, so she is never there." },

  // lesson_76 — first conditional
  { lessonId: "lesson_76", sentence: "If it will rain, we will stay at home.", wrong: "will", wrongIndex: 2,
    options: ["rains", "rained", "raining"], correct: "rains",
    why: "The if part uses the present: if it rains." },
  { lessonId: "lesson_76", sentence: "If you will study hard, you will pass.", wrong: "will", wrongIndex: 2,
    options: ["study", "studied", "studying"], correct: "study",
    why: "Never use will in the if part of the sentence." },
  { lessonId: "lesson_76", sentence: "If she runs fast, she wins the race.", wrong: "wins",
    options: ["will win", "won", "winning"], correct: "will win",
    why: "The second half looks ahead, so use will win." },

  // lesson_77 — so / such … that
  { lessonId: "lesson_77", sentence: "It was such hot that we stayed inside.", wrong: "such",
    options: ["so", "very", "too"], correct: "so",
    why: "With no naming word after it, use so hot." },
  { lessonId: "lesson_77", sentence: "He is so a kind boy that everyone likes him.", wrong: "so",
    options: ["such", "very", "too"], correct: "such",
    why: "Before a + describing word + thing, use such." },
  { lessonId: "lesson_77", sentence: "She was such tired that she fell asleep.", wrong: "such",
    options: ["so", "very", "much"], correct: "so",
    why: "Tired has no naming word after it, so use so." },

  // lesson_78 — either / neither
  { lessonId: "lesson_78", sentence: "Either Ali nor Sara will win the prize.", wrong: "nor",
    options: ["or", "and", "but"], correct: "or",
    why: "Either always pairs with or." },
  { lessonId: "lesson_78", sentence: "Neither the cat or the dog is hungry.", wrong: "or",
    options: ["nor", "and", "but"], correct: "nor",
    why: "Neither always pairs with nor." },
  { lessonId: "lesson_78", sentence: "You may have either tea nor coffee.", wrong: "nor",
    options: ["or", "and", "with"], correct: "or",
    why: "After either, the second choice takes or." },

  // lesson_79 — collective nouns
  { lessonId: "lesson_79", sentence: "A herd of birds flew over the field.", wrong: "herd",
    options: ["flock", "bunch", "shoal"], correct: "flock",
    why: "Birds together are called a flock." },
  { lessonId: "lesson_79", sentence: "She bought a flock of bananas at the market.", wrong: "flock",
    options: ["bunch", "herd", "shoal"], correct: "bunch",
    why: "Bananas grow together in a bunch." },
  { lessonId: "lesson_79", sentence: "A bunch of cows crossed the quiet road.", wrong: "bunch",
    options: ["herd", "flock", "shoal"], correct: "herd",
    why: "Cows together are called a herd." },

  // lesson_80 — since / for
  { lessonId: "lesson_80", sentence: "She has lived here since six years.", wrong: "since",
    options: ["for", "from", "in"], correct: "for",
    why: "Six years is a length of time, so use for." },
  { lessonId: "lesson_80", sentence: "He has been ill for last Monday.", wrong: "for",
    options: ["since", "from", "at"], correct: "since",
    why: "Monday is when it started, so use since." },
  { lessonId: "lesson_80", sentence: "They have waited since two hours already.", wrong: "since",
    options: ["for", "from", "in"], correct: "for",
    why: "Two hours is how long, so use for." },

  // lesson_81 — sequence words
  { lessonId: "lesson_81", sentence: "Finally, wash the rice before you cook.", wrong: "Finally",
    options: ["First", "Then", "Next"], correct: "First",
    why: "Washing comes at the start, so use first." },
  { lessonId: "lesson_81", sentence: "First, serve the hot rice to everyone.", wrong: "First",
    options: ["Finally", "Next", "Then"], correct: "Finally",
    why: "Serving is the last step, so use finally." },
  { lessonId: "lesson_81", sentence: "Finally, add the water to the pot.", wrong: "Finally",
    options: ["Next", "First", "Lastly"], correct: "Next",
    why: "Adding water is a middle step, so use next." },
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
