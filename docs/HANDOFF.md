# Handoff — P4 Word Garden (as of 2026-08-27)

Read this first in a new session, then `CLAUDE.md` (rules) and `docs/PLAN.md` (spec).

## What this is
A daily English app for the user's daughter (Primary 4, Singapore, 9–10, can read words but
does not understand them). Each day: 3 new words → spell it → say it → 1 grammar rule →
mini-read → review quiz. Strict anti-guessing mastery, spaced repetition, parent Insights.

## Where things live
- Repo: https://github.com/nivk23/p4-word-garden (branch `main`, auto-deploys to GitHub Pages)
- Live (primary): https://p4-word-garden.web.app — Firebase Hosting, deploy with `npm run deploy`
- Mirror: https://nivk23.github.io/p4-word-garden/ (GitHub Actions, `.github/workflows/deploy.yml`)
- Firebase project: `p4-word-garden` (Firestore in asia-southeast1, rules deployed, Anonymous
  auth enabled, `nivk23.github.io` authorised). Web config is committed in `.env.production`.
  A second project `p4-word-garden-ed5de` the user created by mistake was deleted.
- Local dev: `npm run dev` (runs in localStorage mode without `.env`).
- Parent Insights PIN: 1234 (user has not changed it yet).

## Working agreement the user set
- Haiku subagents implement; Sonnet audits; failures go back to Haiku.
- EXCEPTION (agreed after three failures): vocabulary/sentence CONTENT is written by Sonnet —
  Haiku could not hold "grammatical + British + primary level" over hundreds of entries and
  its self-reports were unreliable. Code work stays on Haiku. See memory `haiku-content-quality`.
- User reviews on a tablet; cannot run a browser for me (Chrome extension not connected).

## State of the build
- Build, `tsc`, 85+ tests green at last check. Content: 400 core words (every P4 word from
  *Editing for Spelling and Grammar Explained! P4* worksheets 1–41) + 6 themed bands ≈ 2,250
  unique words; 71 grammar lessons; 41 passages. `scripts/audit_content.py` must report 0
  SVA/American/missing/duplicate flags before content is "done" (a few known false positives
  in words.ts/band4: "apartment", "Tom and Ali play").
- Two Sonnet audits done (reports in the session scratchpad, not in repo). All 19 + 12 fix
  items were addressed; remaining known false-positive flags only.

## In flight when this handoff was written (update: 2026-08-27)
A prior Sonnet agent was reported to be doing a FULL VISUAL REDESIGN ("word garden" brief:
mist/soil/leaf/marigold/sky/petal palette, Fredoka 600 for the word + titles, Atkinson
Hyperlegible for body, an SVG Garden bed on Home as the signature where each learned word is
a seed/sprout/flower by mastery) plus 3 bug fixes. On resuming this session, `git status` was
clean and none of that work — visual or functional — was present in the code, so it was lost
(never committed) rather than merely uncommitted. The 3 functional fixes have now been
re-implemented from scratch and committed (not yet pushed/deployed — see below); the full
visual redesign has **not** been done and is still open (see "Likely next asks").

Fixes re-implemented (commit "Fix daily-flow bugs: spelling reset/retries, duplicate
speakers, Insights logging"):
1. Spelling step: `SpellTiles` now resets tiles/feedback per word (was stale across words),
   has a Check button, and up to 2 retries revealing the correct spelling on final failure.
   `SpellType`/`SpellMissing` (used in Quiz) got the same 3-attempt/reveal treatment for
   consistency.
2. Removed duplicate speaker buttons on LearnWords (hero word was click-to-speak *and* had a
   SpeakButton) and on SpellIt/SayItStep (page-level SpeakButton duplicated the one already
   inside SpellTiles/SayIt).
3. Insights logging wired up: SpellIt → `logAnswer("spell_tiles")`; SayItStep → new
   `markSayCorrect`/`markSayWrong` scheduler helpers + `logAnswer("say_word")`; MiniRead →
   `logAnswer("read_answer")`. Quiz.tsx now reuses the new scheduler helpers instead of
   inlining the sayCorrect/sayWrong bump.

All covered by new tests (`tests/spellTiles.test.tsx`, `tests/spellItLogging.test.tsx`,
`tests/sayItStepLogging.test.tsx`, `tests/miniReadLogging.test.tsx`, plus additions to
`tests/scheduler.test.ts`). 97 tests green, `tsc --noEmit` clean, `npm run build` clean.

Environment note: this sandbox had no Node.js preinstalled; Node 22 + npm were installed via
NodeSource (jsdom's undici needs Node ≥22). A fresh session may need to redo this before
`npm test`/`npm run build` will work.

## Likely next asks
- First pass of the "word garden" redesign landed (commit "Word Garden redesign:
  Fredoka/Atkinson typography + SVG garden bed on Home"): new mist/soil/leaf/marigold/sky/
  petal theme tokens in `src/index.css`, Fredoka 600 for headings + hero word displays,
  Atkinson Hyperlegible for body text app-wide, and a new `GardenBed` component on Home
  (each learned word is a seed/sprout/flower plant, stage read from the existing
  `isMastered`/box mastery rule, capped+scaled for large word counts). Verified with a
  local-only Playwright screenshot pass (no visual-review channel in this session) — screens
  looked coherent and on-brief in that check, but this is a scoped first pass, **not** a full
  re-skin of every screen's colours (most pages still use the pre-existing accent/secondary
  palette from the "word-as-hero redesign" commit). Real next step: get the user's eyes on it
  on the actual tablet and decide whether/how far to extend the palette further.
- Push the current commits (`git push`, GitHub Pages) and deploy (`npm run deploy`, Firebase)
  once the user's happy for this to go live — not done automatically since these affect
  shared/live systems, and this sandbox has no GitHub/Firebase credentials configured anyway
  (push/deploy will need to happen from an environment that has them).
- User feedback from the tablet on the new design.
- Change PIN; optional Google sign-in for cross-device sync (currently anonymous per device,
  with a one-time localStorage→Firestore migration in `store/progress.ts`).
- Possibly a band 7 (rank 3,001–3,500) much later; user chose to stop at ~2,500 for now.

## Gotchas
- Git Bash mangles `/p4-word-garden/` paths; set `MSYS_NO_PATHCONV=1` when building with `VITE_BASE`.
- `tsc -b` fails on unused imports/params.
- Agents left scratch files in the repo root before — delete anything not in the README layout.
- Content files must be UTF-8 without BOM; mojibake emoji (`ðŸ…`) means a wrong-codepage re-save.
- Firestore CLI: project has no `gcloud`; API enabling/deletes happen in the console.
