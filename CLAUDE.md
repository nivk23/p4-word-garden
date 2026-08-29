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
npx tsc --noEmit                  # quick type check
python scripts/audit_content.py   # content audit → audit_report.json (delete it afterwards)
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
  (e.g. `"re-ceipt"`), `distractorGroup`; optional `spellingTip`, `confusedWith`, `mt`.
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
- Before finishing any content change: run the audit script and get 0 for `sva_error_count`,
  `american_spelling_count`, `examples_missing_word_count`, missing fields and duplicates for
  the files you touched; then `npm test` and `npx tsc --noEmit`.

## Working conventions

- Don't add a backend or an LLM API; content is deterministic and offline-capable by design.
- Keep pages lazy-loaded and content in its own chunk (`vite.config.ts`).
- Don't leave scratch scripts or backup copies in the repo (`words.ts.backup`, `*_temp.ts`).
  Use a temp directory.
- When several agents edit content in parallel, each owns exactly one file; merge/dedupe
  afterwards with a script rather than by hand.
- Prefer small, verifiable steps: build → test → audit after each change.
