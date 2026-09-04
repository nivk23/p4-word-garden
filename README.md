# P4 Word Garden

A short daily English routine for a Primary 4 child who can read words but struggles to
understand them. Every day: **3 new words → spell them → 1 grammar rule →
a mini-read → a review quiz**. About 10 minutes. Progress is tracked with spaced repetition
and a parent **Insights** page shows what she has mastered.

Built with React 19 + Vite + TypeScript + Tailwind, hosted on Firebase (Hosting + Firestore +
Email/Password and anonymous Auth). Works fully offline in local-only mode if Firebase is not configured.

## Features

- **Meaning first** – each word has an emoji, a 5–10-word "kid meaning", two example sentences
  and 🔊 audio on everything (browser text-to-speech, en-GB).
- **Word bank** – 2,565 words in total: 400 core words (all P4 words from *Editing for Spelling and Grammar
  Explained! P4*, worksheets 1–41, plus easy everyday words) followed by ~2,165 more
  high-frequency words in seven themed bands. Core words are taught first.
- **Grammar** – 81 one-rule-per-day micro-lessons (nouns → tenses → prepositions → P4 exam
  rules like question tags, comparatives, passive, uncountable nouns…).
- **Grammar Practice** – a separate module off Home that teaches any one rule step by step and
  drills it in her exam's editing format (81 rule teachings, 245 editing sentences), re-teaching
  until she gets it right.
- **Spelling track** – letter tiles → missing letters → type-from-audio, unlocked only after
  the meaning is known.
- **Review quiz** – 6–10 items: yesterday's items always included, everything due today, then
  weighted random picks where wrongly-answered words appear far more often. 11 question types
  (picture pick, meaning, situation, read-and-answer, fill blank, pick sentence, listen pick,
  grammar tag, word order, choose form, exam-style editing) plus spelling items.
- **Anti-guessing mastery** – a word is *mastered* only after 5 correct in a row across at
  least 3 different days and 2 different question types; any wrong answer resets it. Options
  are reshuffled and distractors vary every time; a wrong answer is re-asked later in the same
  session as practice (not scored).
- **Insights (parent, PIN-protected)** – words mastered / learning / spelling-mastered,
  streak, 7- and 30-day accuracy, charts, trouble words, grammar accuracy per rule,
  comprehension vs recognition, tricky spellings, JSON export, change PIN.
  Default PIN: `1234`.

**Live:** https://p4-word-garden.web.app (Firebase Hosting, deploy with `npm run deploy`). Mirror: https://nivk23.github.io/p4-word-garden/ (auto-deployed from `main` by GitHub Actions). Both use the Firebase backend for progress.



```bash
npm install
npm run dev        # http://localhost:5173 – runs in local-only mode (localStorage)
```

### Firebase (optional, for syncing across devices)

1. Create a Firebase project; enable **Firestore** and **Authentication → Anonymous**.
2. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values from
   Project settings → Your apps.
3. Deploy rules and hosting:

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # pick your project (writes .firebaserc)
npm run build
firebase deploy               # hosting (dist/) + firestore.rules
```

`firestore.rules` restricts every user to `users/{uid}/**`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest (unit + page-level integration tests) |
| `npm run lint` | oxlint |
| `python scripts/audit_content.py` | Content audit: grammar heuristic, American spellings, missing fields, duplicates across all word files (writes `audit_report.json`) |
| `python scripts/grade_levels.py` | Re-grade every word, grammar lesson and passage into levels P1–P6 (`--write` to apply, `--sample N` to review) |

Dev helper: append `?day=YYYY-MM-DD` to the URL to simulate a different calendar day.

## Project layout

```
src/
  App.tsx              routes (pages are lazy-loaded)
  firebase.ts          Firebase init + auth (no-op without env vars)
  content/
    words.ts           400 core words (taught first)
    words-extra/       band1..band7 – further high-frequency words by theme
    dictionary.ts      one WordNet definition per word (generated, see scripts/)
    allWords.ts        merged + de-duplicated word list used by the app
    grammar.ts         micro-lessons
    grammarPractice.ts rule teachings + exam-format editing items
    passages.ts        mini-read passages with comprehension questions
    knownWords.ts      simple base vocabulary allowed in meanings
    levels.ts          P1–P6 levels: the word/grammar/passage list per level
  lib/
    scheduler.ts       Leitner boxes, mastery rule, daily quiz builder
    questions.ts       question generators + distractors
    spelling.ts        tiles / missing-letter / type generators
    tts.ts             speechSynthesis wrapper
    insights.ts        pure aggregation functions for the Insights page
    dates.ts           local day keys, ?day= override
  store/progress.ts    Firestore with localStorage fallback
  pages/               Home, LearnWords, SpellIt, GrammarLesson, MiniRead,
                       Quiz, Done, PinGate, Insights, GrammarPractice,
                       Login, SignUp, ForgotPassword, ChildPicker, MyProfile,
                       CompareChildren
  components/          AuthGate, SpellTiles, SpellMissing, SpellType,
                       FixSentence, GardenBed, ui
tests/                 Vitest suites
scripts/               content audit + dictionary and level grading scripts
```

## School levels (P1–P6)

Each child profile has a level from **P1 to P6**, chosen when the profile is created and
changeable any time under *Manage profiles*. Levels are **cumulative**: a P4 child is taught
every word graded P1–P4, easiest first. A child can be in P4 and still be missing P2
vocabulary — that is the whole reason this app exists — so nothing below her level is assumed
to be known, and a child who does know the early words clears them in a few days.

The level decides four things: which words she is taught, which distractors the quiz offers
(a P1 child is never asked to choose between four P6 meanings), which grammar rules she meets,
and which mini-read passages she can be given. It also sets the denominator on the Insights
page — *words mastered out of the words at her level*, not out of all 2,565.

| Level | Words at this level | Cumulative | Grammar lessons | Passages |
|---|---|---|---|---|
| P1 | 327 | 327 | 12 | 14 |
| P2 | 328 | 655 | 27 | 28 |
| P3 | 388 | 1,043 | 43 | 38 |
| P4 | 737 | 1,780 | 81 | 69 |
| P5 | 380 | 2,160 | 81 | 80 |
| P6 | 405 | 2,565 | 81 | 90 |

Grammar lesson counts are cumulative and stop growing at P4 on purpose: all 81 lessons come
from her P4 book's grammar worksheets or from a P4 exam paper, so none may be graded above P4
even where the general MOE progression would put it later (reported speech, the passive voice).
The levels below P4 still control the *order* — a P1 child starts on nouns, not relative clauses.

Word levels are produced by `scripts/grade_levels.py` from word frequency, syllable count,
length, part of speech and how concrete the word is, then corrected by a hand-reviewed
`scripts/level_overrides.json` (an adult corpus rates "career" as common; a nine-year-old
does not). Grammar levels are hand-mapped in `scripts/grammar_levels.json`; passage levels
are computed from the words each passage uses. Re-run the script after adding content.

Changing a child's level never loses progress — words she has already learned stay in her
scheduler and keep coming back for review either way.

## Editing content

All content is plain TypeScript data. To add words, append `Word` objects to a band file (or
`words.ts` for high-priority words). Each entry needs `word`, `pos`, `kidMeaning`, two
`examples` that contain the word, `emoji`, `syllables`, `distractorGroup`, `level`, and
optionally `spellingTip`, `confusedWith`, `mt` (mother-tongue hint). Leave `level` to
`python scripts/grade_levels.py --write` rather than guessing it by hand. Use British spelling and correct
subject–verb agreement — run `python scripts/audit_content.py` and `npm test` afterwards;
`tests/words.test.ts` enforces the core list (exactly 400, no duplicates, all book words
present).

## Data model (Firestore / localStorage)

```
users/{uid}/children/{childId}
  profile            streak, lastCompletedDay, pinHash, settings
  items/{itemId}     scheduler state per word/rule: box, spellBox, streak, correct, wrong,
                     correctDays[], correctTypes[], nextDue, lastSeen
  days/{YYYY-MM-DD}  wordIds[3], grammarId, completed, accuracy
  answers/{id}       raw answer log (day, itemId, qType, correct) – feeds Insights
```

## Browser support

Every modern browser gets the full experience — the app needs only `speechSynthesis` for the
🔊 buttons, which Chrome, Edge, Safari and Firefox all support. Installable as a PWA.
