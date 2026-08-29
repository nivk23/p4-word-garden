# P4 Word Garden — Vocabulary + Grammar app for a 9–10 year-old (weak in English)

## Context
Greenfield project in `C:\Users\Nikk\src\p4_english` (folder is empty). Goal: a short daily English routine
for a 9–10 year-old who is weak in English. Each day = **3 new words + 1 small grammar step**, then a short
quiz of previously-learned material using spaced repetition (wrong answers come back more often). A parent
**Insights** page shows progress. Hosted on **Firebase** (Hosting + Firestore + Auth).

Key fact: she can decode/read words but **does not understand what she reads**. So the app targets
**comprehension**, not word recognition — every word is tied to a picture, a one-line "kid meaning", and
questions that ask her to *use* or *show* the meaning rather than match spellings.

Design principles:
- Content pitched at ~Primary 1–3 reading level but UI styled for a 9–10 y/o (clean, colourful, not babyish).
- **Meaning first**: each word card shows emoji/picture + "It means…" in 5–8 simple words + "You use it when…"
  + 2 example sentences that make the meaning obvious from context. Meanings only use words from a small
  ~500-word "known" list so the explanation itself isn't the barrier.
- **Daily mini-read**: one 2–3 sentence passage using today's/recent words, followed by 2 comprehension
  questions ("Why was Tom sad?", "What did she pick up?") with picture-supported answers.
- Optional per-word translation field (`mt`) in content for the mother tongue, shown on a "hint" tap — left
  empty until the language is confirmed.
- **Every word/sentence has a 🔊 button** (browser `speechSynthesis`) so weak reading never blocks learning.
- A session is ≤ 8–10 minutes: 3 words → 1 grammar step → 6–10 review questions → done screen with streak.
- Deterministic built-in content (no AI API, no cost, works offline after first load).

Assumptions (defaults chosen; easy to change later):
- Single child, one device, Firebase **anonymous auth**; Insights page behind a 4-digit parent PIN.
- Stack: **React 18 + Vite + TypeScript + Tailwind**, Firebase JS SDK v10 (modular), no backend functions needed.

---

## Daily flow (what the child sees)

1. **Home** — "Today" card: shows streak, whether today is done, big "Start" button.
2. **Learn words (3)** — one card per word: word (big) + 🔊, part of speech, kid-simple meaning, 2 example
   sentences + 🔊, an emoji/picture hint. Mini-check on each card: "Which sentence uses *word* correctly?"
   (2 choices) — instant feedback, not scored heavily.
3. **Grammar step (1)** — one micro-lesson (e.g. "A noun is a naming word"), 3–4 tiny examples with 🔊,
   then 2 practice items (tap the noun / pick the right word / put words in order to make a sentence).
4. **Mini-read** — 2–3 sentence passage (🔊 available) using today's words + 2 comprehension questions.
   Wrong answer → the relevant sentence is highlighted and re-read aloud, then she tries again.
5. **Review quiz** — 6–10 items drawn from *yesterday's and earlier* words & grammar via the scheduler below.
   Mixed question types so it's not monotonous.
6. **Done** — stars earned, streak, "See you tomorrow!". Progress written to Firestore.

If she opens the app a second time the same day: only the review quiz is offered (optional "extra practice"),
new content does not advance until the next calendar day.

## Question types (all multiple-choice or tap/drag — no free typing, given her level)
Comprehension-focused types come first and are weighted higher in the quiz mix:
- `picture_pick`: "Which picture shows *gentle*?" → 4 emoji/pictures (meaning without reading).
- `meaning`: "What does *brave* mean?" → 4 short meanings written in known-list words.
- `situation`: "Ali fell and got up and tried again. Which word is Ali?" → brave / tiny / sleepy / wet
  (tests whether she can map a described situation to the word).
- `read_answer`: 2–3 sentence mini-passage + a "who/what/why" question (daily comprehension practice).
- `fill_blank`: "The ___ dog ran fast." → 4 words (word bank).
- `pick_sentence`: which sentence uses the word correctly (3 options).
- `listen_pick`: 🔊 plays the word; pick the matching written word (spelling recognition).
- `grammar_tag`: tap the noun/verb/adjective in a sentence.
- `word_order`: 4–6 word tiles → arrange into a sentence (checks exact order; allows one retry).
- `choose_form`: "She ___ to school every day." → go / goes / going (grammar rule practice).
- `editing` (exam format from her book): a sentence with one misspelled/wrong word underlined →
  pick the correct spelling from 3 options (e.g. *reciept / receipt / receit*). Only introduced once the word's
  meaning is in box ≥ 2, so spelling is practised after understanding, not before.

## Spelling track (scaffolded, runs alongside meaning)
Each word also carries a separate `spellBox` (0–5) so spelling progress is tracked apart from meaning.
Spelling questions are only offered once the word's meaning box ≥ 1, and difficulty steps up with spellBox:
- `spell_tiles` (spellBox 0–1): 🔊 plays the word; letter tiles (the word's letters + 2 decoys) → tap in order.
- `spell_missing` (spellBox 2–3): word shown with the tricky letters blanked (from `spellingTip`, e.g. rec_ _pt) →
  type only the missing letters. Wrong → show the rule ("i before e except after c") + 🔊 + try again.
- `spell_type` (spellBox 4+): 🔊 plays word + example sentence; type the whole word (on-screen keyboard
  friendly). Exam-style `editing` questions also count toward spellBox.
- Daily flow: after Learn Words, a 1-minute "Spell it" step for today's 3 words (tiles only, untimed).
  The review quiz includes 2–3 spelling items per day chosen by the same wrong-heavy weighting.
- Feedback shows the word split into syllables with the tricky part highlighted (post·PONED, re·CEI·pt).
- Insights: separate spelling accuracy line + "Tricky spellings" list (most-missed words + which letters).

## Pronunciation module ("Say it") — REMOVED 2026-08-29
Built, then dropped at the user's request. The "Say it" step, the microphone/`SpeechRecognition`
check (`src/lib/speech.ts`), the `say_word` question type, the `sayCorrect`/`sayWrong` item
fields and the Insights pronunciation line are all gone. Do not re-add them without being
asked. **Text-to-speech is unaffected** — every word and sentence still gets a 🔊 button; only
the "child speaks into the mic" half was removed.

## Spaced-repetition / scheduler (the core logic)
Each learned item (word or grammar rule) has a Firestore doc with:
`{ itemId, type, introducedOn, box (0–5), correct, wrong, streak, lastSeen, nextDue }`

- Leitner-style boxes. Correct → box+1, nextDue = today + [1, 2, 4, 7, 14, 30][box]. Wrong → box = max(0, box−2),
  nextDue = tomorrow, and `wrong++`.
- Building the daily quiz (`buildDailyQuiz(today)`):
  1. **All of yesterday's items** (3 words + grammar rule) — always tested the next day (the user's rule).
  2. All items with `nextDue <= today`.
  3. Fill remaining slots (cap ~10) with weighted-random picks from everything learned, weight =
     `1 + 3*wrong − correct/2` clamped ≥ 0.5 → wrong items appear far more often; well-known ones still surface.
  4. Question type per item chosen randomly among the types valid for that item; distractors drawn from other
     learned words of the same part of speech.
- **Mastery (anti-guessing rule)**: a word is *mastered* only when `streak ≥ 5` correct in a row AND those
  correct answers span ≥ 3 different days AND ≥ 2 different question types (track `correctDays: string[]`,
  `correctTypes: string[]` on the item; reset all three on any wrong answer). Box level alone is not enough.
  Mastered words stay in the pool at low weight so they can still appear randomly.
- Anti-guessing in questions: options shuffled every time, distractor sets vary between asks, a wrong answer
  shows the meaning + 🔊 and the word is re-asked later in the same session with fresh options (that retry
  does not count toward mastery).
- New words are only unlocked when the child finishes the day's flow; word selection walks the curated list in
  order (graded easy → harder), skipping any already learned.

## Content (built into the app, `src/content/`)
- `words.ts`: **exactly 400 words** (all ~250 book words from worksheets 1–41 + ~150 tier-1 easy words) graded in 3 tiers, each with: word, pos, kidMeaning, examples[2],
  emoji, distractorGroup, `spellingTip` (e.g. "silent *p* in re-cei-pt"), `confusedWith` (advise/advice,
  dessert/desert, principal/principle).
  - Tier 1 (days 1–40): concrete everyday words she likely half-knows (*huge, tiny, shout, whisper, gentle,
    brave, collect, repair*) — builds confidence and the "known list".
  - Tier 2–3: the **P4 exam words from her book** (the *Editing for Spelling and Grammar Explained! P4*
    answer-key photos she shared: postponed, advised, reindeer, disappointed, priority, idle, receipt,
    fractured, principal, secluded, pavement, underneath, injured, carried, episodes, aquarium, circus,
    elegant, smuggling, influential, assistant, appropriately, vehicles, dusk, dessert, course, picky,
    stomach, adorable, grieved, stepped, solemn, mayor, pendant, backpack, xylophone, entertainment,
    wrinkles, neighbours, kindergarten, coincidence, junior, priest, difference, minute, camouflage,
    committee, irresponsible, detergent, weaving, efficient, description, pretty, lilies, coax, admiring,
    crouched, interior, eavesdrop, fragile, extraordinary, spiral, muffled, bruise, beige, scratches, luxury,
    chandelier, magnificent, approachable,
    hostility, scrumptious, volunteers, affordable, recipes, inactive, surrounded, scenery, benefits, bath,
    educational, containers, employees, collected, mingling, mask, seated, details, volcanoes, eruption,
    prosperous, ancient, effectively, archaeologists, mischievous, pranks, sneak, refrigerator, held, hidden,
    frustrated, patterns, traditionally, occasions, fascinated, studio, ballet, assembly, inspired, pastime,
    apartment, trend, monthly, variety, environment, particularly, honour, served, comfort, volunteer, loved,
    enthusiastic, organise, bazaar, success, stationery, arrived, graciously, amazing/amazed, unbelievable,
    skeleton, memorable, height, cultural, fascinating, spent, farewell, promised, shriek, household, inches,
    unique, disturbed, challenge, rickety, wooden, creaked, budge, curiosity, favourite, attempt, edible,
    beautifully, experience, wondered/wandered, burst, dazed, anxiously, won, relief, exclaimed,
    measured, towering, teenagers, problems, activities, unfortunately, encourage, learning, exhibition,
    competition, character, countless, achievements, involved, inventor, surgery, resident, stroll, cores,
    dining, obviously, spectacular, quieter, religious, appliances, vary, popular, old-fashioned, joined,
    easier, transferred, lost, programmes, documentaries, natural, live (adjective), cry, films, keeps,
    believe, curious, heavily, puddles, explanation, brought, formed, besides/beside, libraries, guided, spiky,
    nickname, official, orchestras, habitat, resembles, obvious, hidden, sanctuary, gave, enormous, largest,
    parasite, deforestation, rarity, extinct, valuable, stolen, investigators, whereabouts, led, disbelief,
    blurry, nostalgic, delivered, envelopes (vs develop), separated, collectors, past/passed, mine, puzzling/
    puzzled, meant, thrived, withering, needless (vs needles), fragrance, channel, antique, crystal;
    grammar worksheet items: shone, framed, straighten, dozed off) — each re-explained in
    kid language with a picture and example sentences, plus the book's spelling rule as the `spellingTip`.
    The parent can add more from later worksheets by appending to the list.
  - **P4 grammar rules from her book's grammar worksheets 6–10** (each becomes a micro-lesson + choose_form/
    editing items, taught after the basics): question tags (is→isn't, can't→can); where/which/who relative words;
    the vs a (only one Queen); comparatives vs superlatives (taller/tallest, smarter/smartest, richer/richest);
    prepositions in bed / on the bed / in the middle of / on the Internet / on a trip / absent from / died of /
    known for / crazy about / through vs by; countable vs uncountable (a lot of dust *is*, sugar *is*, many coins /
    much soup); gerunds as subjects (Living, Having); possessive 's (bird's, dog's, Rita's); base verb after
    would/to (would meet, to miss); irregular past (shone, drew, built, tore, rang, met); past continuous (was
    writing); passive (has been abandoned); plurals (oxen, buildings, hundred/hundreds); -ly adverbs with y→i
    (happily, politely); any vs some in negatives; word forms: -th noun (warmth), -al adjective (exceptional),
    -en verb (straighten, endangers), -ion noun (ambition), -ence noun (obedience), in-/un- opposites
    (inexpensive), -d adjectives (framed); phrasal verbs (dozed off, put off); reflexive pronouns (himself,
    themselves); whenever vs whatever; it's vs its; has/does with singular subjects (Nobody likes, He has, Does
    David); because/as/since vs although; I wish I could; Would you like…; every + singular (every night);
    sculpture vs sculptor; worksheets 11–26 add: furniture/dust IS (uncountable), plural verb exist / have /
    plural subjects (She and her friend HAVE), used to (past habit), phrasal verbs whip up / died out / put off,
    with vs of (birds with big beaks; a shower of dust; enough of; interest in), have a chat with, looking
    forward to + gerund, in for months / on for days (in January, on Friday, fall on), keen on, never vs ever,
    one of the + plural (volcanoes), plural -es after ch/o (inches, volcanoes, mangoes), taken by surprise,
    Although vs However, Shall (suggestion) vs Will, in the corner vs at the corner, on television, good at vs
    good with, for vs since, did not + base verb, to + base verb (to form, to miss), comparative + than with
    gerund (buying), -ly time adverbs (monthly, yearly), past participle after have/'ve (won, collected),
    passive with is/are (is collected, are disturbed, are surrounded), children's home, as long as = if,
    by (who did it), -ious/-ous adjectives (scrumptious, prosperous, mischievous), -ology/-ologist, -ity nouns
    (hostility, curiosity), -en adjectives (wooden, golden), -ible/-able (edible), fascinated vs fascinating /
    amazed vs amazing (-ed feeling vs -ing thing), noun after preposition (of relief, comfort not comforted),
    other vs another, to (going somewhere) vs in, since + present perfect, as (role: kept as a pet), sit/sat/seated.
    Worksheets 27–33 add: was + past participle passive (was measured, was involved), too + adj + to, a number
    of + plural, fit in with, y→i + -es plurals (activities, parties), for + purpose (for celebrating), signed up
    vs sign off, looking forward to + -ing noun, it's going to BE fun, one of the greatest… of all time, -less
    (countless, tireless), Although/Though vs but, singular series WAS, -ment nouns, -or/-er person nouns
    (inventor, teacher), -ent/-ant (resident), had + past participle in reported speech, encounters with,
    ran away from, leave behind, full of vs filled with, -ious adjectives (religious), may + base verb (may vary),
    old-fashioned (-ed adjective), get used to, felt lost vs at a loss, live (adj) vs life, surrounded by.
    Worksheets 33–41 add: make + someone + base verb (make her cry), schoolwork IS (uncountable), at the
    weekends, from (origin) vs to, were/are + past participle passive (were brought, are formed, are hidden),
    Besides vs beside, specialise in, on the other hand, come across / come over / look into / depend on /
    look in, become + adjective (become extinct), had been + past participle (had been stolen), had + past
    participle past perfect (had delivered), soak in vs by (method), possessive pronoun mine, -ed vs -ing
    (puzzled/puzzling), -t past forms (meant, learnt, dealt), bring back to life, Needless to say, 'is'
    singular → singular noun (difference), y→i plurals (libraries), -er/-or people (investigators, collectors).
  - The book's rules (double consonant before -ed, y→i, i-before-e, drop-e before -able, silent letters)
    become grammar/spelling micro-lessons in `grammar.ts` too.
- `words-extra/band1..band6.ts`: the **2,000–3,000 most frequent English content words** (~350 per band,
  frequency rank 1–500, 501–1000, … 2501–3000), same `Word` shape, generated in parallel. `words/index.ts`
  exports `allWords = [...words (400 core), ...band1, …, ...band6]` — the core 400 are taught first, then bands in
  frequency order. Total ≈ 2,400 words (~2+ years at 3/day). Tests: no duplicates across all files, all fields
  filled, examples contain the word.
- `passages.ts`: ~120 mini-passages (2–3 sentences each, known-list vocabulary + target words) with 2
  questions each; the daily passage is picked to include at least one of today's/yesterday's words.
- `knownWords.ts`: the ~500-word base list used to write meanings, passages and distractors.
- `grammar.ts`: ~40 ordered micro-lessons, one per day, cycling with review days in between:
  1. Naming words (nouns) 2. Doing words (verbs) 3. Describing words (adjectives) 4. Capital letters
  5. Full stops 6. a / an 7. Singular & plural (-s) 8. Plural -es / irregular 9. I / you / he / she / it / they
  10. is / are 11. was / were 12. has / have 13. Simple present (-s with he/she) 14. Present continuous (-ing)
  15. Simple past (-ed) 16. Irregular past (went, ate…) 17. Question words (who/what/where) 18. Question marks
  19. and / but / because 20. Commas in lists 21. Prepositions (in/on/under) 22. Adverbs (-ly)
  23. Comparatives (-er) 24. Superlatives (-est) 25. Subject + verb + object 26. Contractions (don't, can't)
  27. Possessives ('s) 28. Articles the vs a 29. Pronouns (him/her/them) 30. Future (will) … + review lessons.
  Each lesson: title, 2–3 sentence explanation (kid language), examples[], practice items[], and a generator
  spec for review questions.
- Content is plain TS data so the parent can edit/add words without touching logic.

## Insights page (parent, behind PIN)
- **Headline: WORDS MASTERED** — big number (per the mastery rule: 5 correct in a row over ≥3 days, ≥2 types) out of total words available, progress bar;
  plus words learned so far, words being learned (box 1–3), words mastered in spelling too (spellBox ≥ 4).
- Streak, days completed, overall accuracy (last 7 / 30 days).
- Line chart: accuracy per day; bar: questions answered per day.
- **Trouble words** table: sorted by `wrong`, with correct/wrong counts and last seen — most actionable view.
- Grammar progress: list of lessons with accuracy per rule; flags rules < 60%.
- **Comprehension score**: accuracy on `read_answer` / `situation` / `picture_pick` questions over time,
  shown separately from recognition-type questions so you can see whether *understanding* is improving.
- Simple tools: reset PIN, "re-teach word tomorrow" toggle, export data as JSON.
- Charts: lightweight (Recharts).

## Firestore data model
```
users/{uid}
  profile: { name, createdAt, streak, lastCompletedDay, pinHash, settings }
  items/{itemId}        // one per learned word/grammar rule — scheduler state (see above)
  days/{YYYY-MM-DD}     // { wordIds[3], grammarId, completed, quizResults[], accuracy, durationSec }
  answers/{autoId}      // { day, itemId, qType, correct, ts }   (raw log for insights)
```
Security rules: a user can read/write only `users/{request.auth.uid}/**`. Anonymous auth enabled.

## Project structure
```
p4_english/
  firebase.json, .firebaserc, firestore.rules, firestore.indexes.json
  src/
    main.tsx, App.tsx (router)
    firebase.ts                 // init, anonymous sign-in
    content/words.ts, grammar.ts
    lib/scheduler.ts            // Leitner + weighted random + buildDailyQuiz
    lib/questions.ts            // generators for each question type + distractors
    lib/tts.ts                  // speechSynthesis wrapper (en-GB voice, slow rate)
    lib/dates.ts                // local-day key helpers
    store/progress.ts           // Firestore read/write, in-memory cache, offline persistence
    pages/Home, LearnWords, GrammarLesson, Quiz, Done, Insights, PinGate
    components/WordCard, SpeakButton, QuestionRenderer (one per type), ProgressBar, StarBurst
  tests/scheduler.test.ts, questions.test.ts (Vitest)
```

## Implementation steps
1. Scaffold: `npm create vite@latest` (react-ts), Tailwind, react-router, firebase, recharts, vitest.
2. `firebase.ts` + anonymous auth + Firestore offline persistence; `firestore.rules`.
3. Content: write `words.ts` (first 120 words, extend later) and `grammar.ts` (first 15 lessons, extend later).
4. `scheduler.ts` + `questions.ts` with unit tests (yesterday's items always included; wrong items weighted
   higher; no duplicate items in a quiz; distractors never equal the answer).
5. Pages in flow order: Home → LearnWords → GrammarLesson → Quiz → Done. TTS everywhere.
6. Progress store: persist day results, update items, streak logic (streak breaks after a missed day).
7. Insights page + PIN gate.
8. Polish: large touch targets, big readable font (e.g. Nunito/Lexend), confetti on done, PWA manifest so it
   installs on a tablet/phone.
9. `firebase init hosting` → `npm run build` → `firebase deploy`.

## Verification
- `npm test` — scheduler/question generator unit tests pass.
- `npm run dev` — walk a full day: 3 words → grammar → quiz → done; check Firestore docs appear in the emulator
  or console.
- Simulate day 2 (override date helper via `?day=2026-08-28` dev param): confirm yesterday's 3 words + rule all
  appear in the quiz, and an item answered wrong on day 1 appears again.
- Insights shows correct counts/charts; PIN blocks the page.
- Deploy with `firebase deploy` and open the hosted URL on a phone/tablet; test 🔊 works (Chrome/Safari).
