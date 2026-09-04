# Handoff — P4 Word Garden (as of 2026-09-04)

Read this first in a new session, then `CLAUDE.md` (rules) and `docs/PLAN.md` (spec).

## What this is
A daily English app for the user's daughter (Primary 4, Singapore, 9–10, can read words but
does not understand them). Each day: 3 new words → spell it → 1 grammar rule →
mini-read → review quiz. Strict anti-guessing mastery, spaced repetition, parent Insights.
A separate **Grammar Practice** module (linked from Home) teaches and drills any single rule
in exam editing format, outside the daily flow.

## Where things live
- Repo: https://github.com/nivk23/p4-word-garden (branch `main`, auto-deploys to GitHub Pages)
- Live (primary): https://p4-word-garden.web.app — Firebase Hosting, deploy with `npm run deploy`
- Mirror: https://nivk23.github.io/p4-word-garden/ (GitHub Actions, `.github/workflows/deploy.yml`)
- Firebase project: `p4-word-garden` (Firestore in asia-southeast1, rules deployed, Email/Password
  + Anonymous auth enabled, `nivk23.github.io` authorised). Web config is committed in
  `.env.production`. A second project `p4-word-garden-ed5de` the user created by mistake was deleted.
- Local dev: `npm run dev` (runs in localStorage mode without `.env`).
- Accounts: one parent email/password login, many child profiles under it (`Login`, `SignUp`,
  `ForgotPassword`, `ChildPicker`, `MyProfile`). All progress is scoped per child in
  `store/progress.ts`, with a one-time legacy localStorage → Firestore/child migration.
- Parent Insights is behind `PinGate`; the PIN is per child, default **1234**, changeable in
  Manage profiles. Whether the user has changed it is not visible from the repo.

## Working agreement the user set
- Haiku subagents implement; Sonnet audits; failures go back to Haiku.
- EXCEPTION (agreed after three failures): vocabulary/sentence CONTENT is written by Sonnet —
  Haiku could not hold "grammatical + British + primary level" over hundreds of entries and
  its self-reports were unreliable. Code work stays on Haiku. See memory `haiku-content-quality`.
- User reviews on a tablet; cannot run a browser for me (Chrome extension not connected).

## State of the build (verified 2026-09-04)
- `npm test` → 274 tests in 30 files, all green. `npm run build` → clean.
  Use `npx tsc -b --noEmit` to type-check: plain `npx tsc --noEmit` checks **nothing**, because
  the root `tsconfig.json` is `"files": []` plus project references. Earlier handoffs called it
  clean; it was a no-op, and it hid three real type errors until `npm run build` caught them.
- Working tree clean; `main` == `origin/main`, nothing unpushed.
- Content: 400 core words (every P4 word from *Editing for Spelling and Grammar Explained! P4*
  worksheets 1–41) + 7 themed bands = **2,565 unique words**; **81 grammar lessons**
  (`grammar.ts`); **81 rule teachings + 245 editing items** (`grammarPractice.ts`); **90
  passages**; one WordNet definition per word in `dictionary.ts`. Every word, lesson and passage
  now carries a **P1–P6 level** (see `src/content/levels.ts` and the Levels section of CLAUDE.md).
- `scripts/audit_content.py` must report 0 SVA/American/missing/duplicate flags before content
  is "done" (a few known false positives in words.ts/band4: "apartment", "Tom and Ali play",
  and in passages.ts: "two hundred years ago" — the number-plural heuristic can't see that
  "hundred" is the plural head).
- Every kid meaning was cross-checked against a dictionary (2026-08-30) and the core 400's
  meanings were re-fixed for dropped inflections on 2026-08-31.

## What shipped since the last handoff (2026-09-01 → 2026-09-04)
- **School levels P1–P6** (2026-09-04): each child profile now has a level, picked when the
  profile is created and editable under Manage profiles. Levels are cumulative and easiest-first
  — a P4 child is taught P1–P4 words starting at P1, because a struggling P4 reader is usually
  missing P2 vocabulary. The level gates new words, quiz distractors, grammar lessons, mini-read
  passages and the Insights denominator. Grading is reproducible: `scripts/grade_levels.py`
  (frequency + syllables + length + POS + concreteness) with hand-reviewed corrections in
  `scripts/level_overrides.json`, hand-mapped `scripts/grammar_levels.json`, and passage levels
  computed from the words used. **50 new passages** were written at the same time (30 at P1–P3,
  20 at P5–P6): the old bank of 40 was almost entirely P4, so a young child would have seen the
  same two passages every day and an older one had nothing above her book words. The bank now
  runs 14 / 28 / 38 / 69 / 80 / 90 cumulative across P1–P6. Grammar lessons are **capped at P4**:
  all 81 come from her P4 book's worksheets or a P4 exam paper (lessons 71–81 were added because
  a P4 paper tests them), so grading reported speech or the passive at P5/P6 by the general MOE
  progression would have silently stopped teaching her 20 rules her own exam asks for. The MOE
  level is still recorded in `scripts/grammar_levels.json` because it gives the right order below
  P4; the cap is `GRAMMAR_LEVEL_CAP` in `grade_levels.py`, and a test enforces it. Existing profiles have no `level` field and keep behaving exactly as before (P4).

## What shipped in the handoff before that (2026-08-27 → 2026-09-01)
- **Accounts & profiles**: real email/password login, multiple child profiles, child picker,
  profile delete/reset/rename/avatar, per-child PIN, a Compare Children page, and the active
  child's name shown on Home.
- **Daily flow fixes**: quiz scoring and stuck-after-wrong-grammar-answer bugs, grammar answers
  not syncing to Firestore, stale spelling state, untypeable/answer-revealing spelling inputs,
  Mini Read highlighting the answer on a wrong tap, the missing "Words known" column, a safer
  "Start today" resume, faster loading.
- **Learning more words**: the 80% accuracy gate was removed; a child may learn beyond 3 new
  words a day, capped at 15.
- **Pronunciation removed** (2026-08-29): the "Say it" step, `say_word` questions and
  `SpeechRecognition` are gone and must not come back. 🔊 TTS stays. Ignore any older note
  in git history that describes `SayItStep` as current — the page no longer exists.
- **Content**: band 7 added (311 words: work, money, media, measurement, civic life); every
  meaning dictionary-checked; band 3 and band 5 meanings rewritten in kid language modelled on
  Merriam-Webster Elementary (`scripts/` has the MW fetcher).
- **Grammar Practice module**: exam-format editing items + per-rule drilling for all 81 rules,
  re-teaching until she answers correctly; reachable from Home at `/grammar-practice`.
- **Visual design**: the garden-journal look (see Gotchas for the Tailwind trap it exposed) and
  a matching rework of Parent Insights.
- CI moved off the deprecated Node 20 Pages actions.

## Open / next asks
- **Deploying is possible from this sandbox** — contrary to what earlier handoffs said, the
  Firebase CLI is installed and logged in as `nivk23@gmail.com` (`~/.config/configstore`), and
  `git push` to GitHub works. `npm run deploy` was last run on 2026-09-02, putting grammar
  practice, the grammar fixes and the core-400 meaning fixes on https://p4-word-garden.web.app.
  GitHub Pages updates by itself on push. Deploying is still a live-systems action: ask first.
  After any deploy, check the live CSS actually contains `.p-6{` (see Gotchas).
- **Tablet review of the garden-journal design.** Only ever verified via local Playwright
  screenshots; still unseen on her actual device.
- **Change the parent PIN** from the default 1234 (Manage profiles).
- Band 8 is possible later but has not been asked for.

## Gotchas
- **Tailwind**: `src/index.css` must use `@import "tailwindcss";`. Do not revert to the legacy
  `@tailwind base/components/utilities` directives — under tailwindcss 4.x they silently drop
  the default spacing/radius/font-size/container scale, so every `p-*`/`gap-*`/`rounded-2xl`/
  `text-lg`/`max-w-2xl` in the app vanishes from the built CSS and every screen renders
  edge-to-edge. After any build-config change, verify `dist/assets/index-*.css` really contains
  e.g. `.p-6{`.
- This sandbox may ship without Node.js; Node 22 + npm were installed via NodeSource (jsdom's
  undici needs Node ≥22). A fresh session may need to redo this before `npm test`/`npm run build`.
- Git Bash mangles `/p4-word-garden/` paths; set `MSYS_NO_PATHCONV=1` when building with `VITE_BASE`.
- `tsc -b` fails on unused imports/params.
- Agents left scratch files in the repo root before — delete anything not in the README layout.
- Content files must be UTF-8 without BOM; mojibake emoji (`ðŸ…`) means a wrong-codepage re-save.
- Firestore CLI: project has no `gcloud`; API enabling/deletes happen in the console.
