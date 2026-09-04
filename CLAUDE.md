# CLAUDE.md — P4 Word Garden

Guidance for AI agents working in this repo. Read `README.md` for the human overview and
`docs/PLAN.md` for the full product spec (the plan the app was built from — it is the
source of truth for requirements).

## Who this is for

A Primary 4 (9–10-year-old) Singapore child who is **weak in English: she can decode words
but does not understand them**. Every design decision favours comprehension over recognition,
short sessions (≤10 min), audio everywhere, and simple language. Content must be
child-safe, British English, grammatically correct, and pitched no higher than a strong P5
reader.

## Commands

```bash
npm run dev                       # dev server (local-only mode without .env)
npm run build                     # tsc -b && vite build — must stay green
npm test                          # vitest run — must stay green
npx tsc -b --noEmit               # quick type check (plain `tsc --noEmit` checks NOTHING:
                                  #   the root tsconfig is `"files": []` + project references)
python scripts/audit_content.py   # content audit → audit_report.json (delete it afterwards)
python scripts/grade_levels.py    # re-grade P1–P6 levels; --write to apply, --sample N to review
```

`tsc -b` treats unused imports/params as errors — remove them, don't suppress.

## Architecture in one paragraph

Pages under `src/pages/` implement the daily flow in this fixed order:
`Home → LearnWords → SpellIt → GrammarLesson → MiniRead → Quiz → Done`.
`store/progress.ts` is the only persistence layer (Firestore with automatic localStorage
fallback; always `await` writes before navigating). `lib/scheduler.ts` owns Leitner boxes,
the **mastery rule** and `buildDailyQuiz`; `lib/questions.ts` turns items into questions;
`lib/insights.ts` holds pure aggregation functions for the parent page. Content is plain data
under `src/content/`; `allWords.ts` merges `words.ts` (400 core, taught first) with
`words-extra/band1..7.ts` and de-duplicates case-insensitively.

## Levels (P1–P6)

Every child profile has a `level` (`ChildProfile.level`, default P4). `src/content/levels.ts`
is the only place that turns a level into content: `wordsForLevel`, `grammarForLevel`,
`passagesForLevel`. Pages read the level with `getActiveLevel()` from `store/progress.ts`.

- Levels are **cumulative and easiest-first**: a P4 child gets P1–P4 words starting at P1.
  Never assume a child knows the levels below hers — she is weak in English, that is the point.
- Every `Word`, `GrammarLesson` and `Passage` has a required `level`. Don't hand-write it:
  run `python scripts/grade_levels.py --write`, which is idempotent and re-grades everything.
  Word levels come from the scoring formula plus `scripts/level_overrides.json`; grammar
  levels are hand-mapped in `scripts/grammar_levels.json` (add an entry or the script exits);
  passage levels are computed from the words the passage uses.
- Words in `words.ts` are her P4 book words and **may never grade above P4** — the cap is
  applied last in the script, after overrides, and `tests/levels.test.ts` enforces it.
- Quiz distractors must come from `wordsForLevel(level)`, not `allWords`: offering a P1 child
  three P6 meanings makes the answer guessable by elimination. Pass the level into
  `generateWordQuestions`. Looking a *scheduled* item back up still uses `allWords`, so a word
  learned before a level change never goes missing.
- Insights and Compare show progress out of the child's own level total, never out of 2,565.
- The frequency corpus (`scripts/data/en_50k.txt`) is downloaded, not committed — the
  one-line curl is in the script header.

## Rules that must not regress

- **Mastery** = `streak ≥ 5` AND `correctDays.length ≥ 3` AND `correctTypes.length ≥ 2`;
  any wrong answer resets all three. Box level alone never means "mastered".
- **Yesterday's items are always in today's quiz**; wrong items are weighted heavier;
  quiz capped at 10; no duplicate items.
- **Anti-guessing**: shuffle options on every render, vary distractors between asks, and a
  wrong answer is re-asked later in the same session as `practiceOnly` (never written to the
  scheduler). Always pass `qType` to `markCorrect`.
- New words unlock only once per calendar day; a second visit offers extra practice only.
- Spelling questions only when the word's meaning box ≥ 1; type chosen by `spellBox`.
- No pronunciation/microphone feature: the "Say it" step, `say_word` questions and
  `SpeechRecognition` were removed on 2026-08-29 — don't reintroduce them. 🔊 TTS stays.
- Every word/sentence rendered for the child gets a 🔊 button.
- Insights headline is **Words mastered / total** using the mastery rule above.

## Content rules (enforced by `tests/words.test.ts` and `scripts/audit_content.py`)

- `words.ts` has **exactly 400** entries, no duplicates, every P4 book word present.
- Every entry: `word`, `pos` (noun|verb|adjective|adverb|preposition|pronoun), `kidMeaning`
  (5–10 words, all simpler than the headword), `examples` (exactly 2, each containing the
  headword or an inflected form), `emoji` (literal UTF-8, prefer single-codepoint), `syllables`
  (e.g. `"re-ceipt"`), `distractorGroup`, `level` (written by `grade_levels.py`, not by hand);
  optional `spellingTip`, `confusedWith`, `mt`.
- Correct Standard **British** English: 3rd-person singular verbs take -s, plurals take -s/-es,
  correct past tense; colour/favourite/mum/maths/grey/organise/realise/centre/cosy.
- No word may appear in more than one content file (the merge dedupes, but keep files clean).
- After adding or renaming any word, regenerate `src/content/dictionary.ts` (one real
  dictionary definition per word, from WordNet):
  `python scripts/build_dictionary.py --wordnet ./dict` — see the script header for the
  one-line WordNet download. `tests/dictionary.test.ts` fails if a word has no definition.
- Nothing sexual, no reproductive anatomy, no drugs/alcohol, no violence-glorifying words.
- Save content files as UTF-8 **without BOM**; mojibake (`ðŸ…`) means the file was re-saved
  in the wrong codepage — fix the emoji, don't escape it.
- Bands have themes to avoid overlap: 1 = most common everyday words; 2 = people, places,
  transport, shopping, time; 3 = school, home, family, daily life; 4 = general mid-frequency;
  5 = nature & simple science; 6 = feelings, character, story words; 7 = work, money,
  media, measurement and civic life.
- After adding or renaming any word, lesson or passage, also run
  `python scripts/grade_levels.py --write` so the new entries get a level.
- Before finishing any content change: run the audit script and get 0 for `sva_error_count`,
  `american_spelling_count`, `examples_missing_word_count`, missing fields and duplicates for
  the files you touched; then `npm test` and `npx tsc -b --noEmit`.

## Working conventions

- Don't add a backend or an LLM API; content is deterministic and offline-capable by design.
- Keep pages lazy-loaded and content in its own chunk (`vite.config.ts`).
- Don't leave scratch scripts or backup copies in the repo (`words.ts.backup`, `*_temp.ts`).
  Use a temp directory.
- When several agents edit content in parallel, each owns exactly one file; merge/dedupe
  afterwards with a script rather than by hand.
- Prefer small, verifiable steps: build → test → audit after each change.
