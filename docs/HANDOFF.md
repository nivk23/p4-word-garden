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

## In flight when this handoff was written
A Sonnet agent is doing a FULL VISUAL REDESIGN ("word garden" brief: mist/soil/leaf/marigold/
sky/petal palette, Fredoka 600 for the word + titles, Atkinson Hyperlegible for body, the
SVG Garden bed on Home as the signature where each learned word is a seed/sprout/flower by
mastery). Folded into the same pass, from user reports:
1. Spelling step: add a "Check" button (+ Enter), reset state between words, show ✓/✗ with
   the correct spelling and up to 2 retries (also for spelling items in the quiz), with tests.
2. Exactly one speaker button per spoken thing (there were two on the word screen).
3. Record daily-step results for Insights: SpellIt → logAnswer("spell_tiles");
   SayItStep → sayCorrect/sayWrong + logAnswer("say_word"); MiniRead → logAnswer("read_answer").
If that agent's work is not in git, check `git status` — it may be uncommitted. After it
lands: `npm run build && npx vitest run`, commit, `git push` (Pages), `npm run deploy` (Firebase).

## Likely next asks
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
