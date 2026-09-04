import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { wordsForLevel, grammarForLevel } from "../content/levelContent";
import { DEFAULT_LEVEL } from "../content/levels";
import type { Level } from "../content/levels";
import type { Word } from "../content/words";
import { getSchedulerItems, saveSchedulerItem, saveDayRecord, getActiveLevel } from "../store/progress";
import { getTodayKey } from "../lib/dates";
import { speak } from "../lib/tts";
import { NEW_WORDS_PER_BATCH, MAX_NEW_WORDS_PER_DAY } from "../lib/scheduler";
import { Page, PageTitle, Loading, Card, Chip, Button, SpeakButton, ProgressDots, HighlightedText } from "../components/ui";

export default function LearnWords() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [learningWords, setLearningWords] = useState<Word[]>([]);
  // Everything this child's level can be taught, easiest first (P1 up to her
  // level). Held in state because the level comes from her profile, so the pool
  // isn't known until after the first load.
  const [wordPool, setWordPool] = useState<Word[]>([]);
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL);
  const [isLoading, setIsLoading] = useState(true);
  const [taughtWordIds, setTaughtWordIds] = useState<Set<string>>(new Set());
  const [showMorePrompt, setShowMorePrompt] = useState(false);

  useEffect(() => {
    async function loadWordsForToday() {
      const [schedulerItems, childLevel] = await Promise.all([
        getSchedulerItems(),
        getActiveLevel(),
      ]);
      const taught = new Set(schedulerItems.filter(i => i.type === "word").map(i => i.itemId));
      const pool = wordsForLevel(childLevel);

      const newWords = [];
      for (const word of pool) {
        if (!taught.has(word.word)) {
          newWords.push(word);
          if (newWords.length === NEW_WORDS_PER_BATCH) break;
        }
      }

      setLearningWords(newWords);
      setTaughtWordIds(taught);
      setWordPool(pool);
      setLevel(childLevel);
      setIsLoading(false);
    }

    loadWordsForToday();
  }, []);

  const finishLearning = async () => {
    // Create scheduler items for every new word learned today (whether
    // that's the default 3 or several extended batches). These writes plus
    // the read below are all independent of each other (the read is
    // counting existing *grammar* items, unrelated to the *word* items
    // being written) — run them concurrently instead of one at a time,
    // which was 4 sequential Firestore round-trips on this exact transition
    // (the reported ~2.7s delay after tapping the final "Continue").
    const today = getTodayKey();
    const [, schedulerItems] = await Promise.all([
      Promise.all(
        learningWords.map((word) =>
          saveSchedulerItem({
            itemId: word.word,
            type: "word",
            introducedOn: today,
            box: 0,
            spellBox: 0,
            correct: 0,
            wrong: 0,
            spellCorrect: 0,
            spellWrong: 0,
            streak: 0,
            lastSeen: today,
            nextDue: today,
            correctDays: [],
            correctTypes: [],
          })
        )
      ),
      getSchedulerItems(),
    ]);

    // Select next grammar lesson. Once every lesson has been taught, the day
    // becomes a revision day on the rule she is weakest at, rather than asking
    // for a lesson number that does not exist — which used to send her back to
    // Home from the grammar step, with no way to finish the day.
    const lessonsForLevel = grammarForLevel(level);
    const taughtGrammarIds = new Set(schedulerItems.filter(i => i.type === "grammar").map(i => i.itemId));
    // Teach the next untaught rule she's old enough for, rather than counting
    // lessons off by number — the pool depends on her level now, so lesson N
    // isn't necessarily the Nth rule she should meet.
    let grammarId = lessonsForLevel.find(l => !taughtGrammarIds.has(l.id))?.id;
    if (!grammarId) {
      // Every rule at her level has been taught: revise the weakest one rather
      // than asking for a lesson that doesn't exist, which used to send her
      // back to Home with no way to finish the day.
      const taught = schedulerItems.filter(
        i => i.type === "grammar" && lessonsForLevel.some(l => l.id === i.itemId)
      );
      const weakest = [...taught].sort(
        (a, b) => a.box - b.box || a.lastSeen.localeCompare(b.lastSeen)
      )[0];
      grammarId = weakest?.itemId ?? lessonsForLevel[0].id;
    }

    // Save DayRecord
    await saveDayRecord({
      date: today,
      wordIds: learningWords.map(w => w.word),
      grammarId,
      completed: false,
      quizResults: [],
      accuracy: 0,
      durationSec: 0,
    });

    navigate("/spell-it");
  };

  const hasMoreWordsAvailable = () =>
    wordPool.some(w => !taughtWordIds.has(w.word) && !learningWords.some(lw => lw.word === w.word));

  const handleNext = async () => {
    if (currentWord < learningWords.length - 1) {
      setCurrentWord(currentWord + 1);
      return;
    }

    // Finished the current batch. Always offer another one if there's
    // anything left to teach and today's hard ceiling hasn't been hit —
    // no performance gate, since pacing below that ceiling is the child's
    // (or parent's) choice, not something to restrict. Never automatic:
    // this still asks rather than just piling on more words.
    if (learningWords.length < MAX_NEW_WORDS_PER_DAY && hasMoreWordsAvailable()) {
      setShowMorePrompt(true);
      return;
    }

    await finishLearning();
  };

  const handleLearnMore = () => {
    const nextBatch = [];
    for (const word of wordPool) {
      if (!taughtWordIds.has(word.word) && !learningWords.some(lw => lw.word === word.word)) {
        nextBatch.push(word);
        if (nextBatch.length === NEW_WORDS_PER_BATCH) break;
      }
    }
    setLearningWords([...learningWords, ...nextBatch]);
    setCurrentWord(currentWord + 1);
    setShowMorePrompt(false);
  };

  if (isLoading) {
    return <Loading label="Loading words for today…" />;
  }

  if (learningWords.length === 0) {
    return (
      <Page>
        <PageTitle>No More Words</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">You've learned all available words!</p>
          <Button onClick={() => navigate("/")}>Back Home</Button>
        </Card>
      </Page>
    );
  }

  if (showMorePrompt) {
    return (
      <Page>
        <PageTitle>Learn Words</PageTitle>
        <Card className="text-center">
          <div className="text-6xl mb-3">🌟</div>
          <p className="text-xl font-bold text-ink mb-2">You're doing great!</p>
          <p className="text-ink/70 mb-6">
            Want to learn {NEW_WORDS_PER_BATCH} more words now, or stop here for today?
            You can always pick up more tomorrow.
          </p>
          <Button onClick={handleLearnMore}>📚 Learn {NEW_WORDS_PER_BATCH} more</Button>
          <div className="flex justify-center mt-3">
            <Button variant="ghost" full={false} onClick={finishLearning}>
              ✅ That's enough for today →
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  const word = learningWords[currentWord];
  const syllableDisplay = (word.syllables || word.word).split("-").join(" · ");

  return (
    <Page>
      <PageTitle>Learn Words</PageTitle>
      <ProgressDots total={learningWords.length} current={currentWord} />

      <Card>
        {/* Hero word — remounted per word so the grow-in animation replays */}
        <div key={word.word} className="grow-in flex flex-col items-center text-center gap-1">
          <div className="text-6xl mb-1">{word.emoji}</div>
          <h2
            className="font-display font-semibold text-secondary-dark leading-tight"
            style={{ fontSize: "clamp(3.5rem, 8vw + 1.2rem, 5rem)", wordBreak: "break-word", overflowWrap: "anywhere" }}
          >
            {word.word}
          </h2>
          <p className="font-hand text-2xl sm:text-3xl text-ink/50 tracking-wide">{syllableDisplay}</p>
        </div>

        <div className="flex justify-center mt-4 mb-8">
          <SpeakButton text={word.word} label={`Hear ${word.word}`} size="lg" />
        </div>

        {/* Meaning */}
        <div className="mb-6 rounded-2xl bg-secondary-light p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-secondary-dark mb-2">It means</p>
          <p className="text-[22px] sm:text-2xl leading-snug text-ink font-semibold">{word.kidMeaning}</p>
        </div>

        {/* Examples */}
        <div className="flex flex-col gap-3 mb-6">
          {word.examples.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => speak(example)}
              className="w-full flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4 text-left hover:bg-accent-light/40 transition-colors"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-base">
                🔊
              </span>
              <span className="text-base sm:text-lg text-ink/90 leading-snug">
                <HighlightedText text={example} word={word.word} />
              </span>
            </button>
          ))}
        </div>

        {/* Spelling tip — subtle chip */}
        {word.spellingTip && (
          <div className="mb-6 flex justify-center">
            <Chip tone="accent">✏️ Tip: {word.spellingTip}</Chip>
          </div>
        )}

        {/* Navigation */}
        <Button onClick={handleNext}>
          {currentWord < learningWords.length - 1 ? "Next →" : "Continue →"}
        </Button>
        {currentWord > 0 && (
          <div className="flex justify-center mt-3">
            <Button
              variant="ghost"
              full={false}
              onClick={() => setCurrentWord(Math.max(0, currentWord - 1))}
            >
              ← Previous
            </Button>
          </div>
        )}
      </Card>
    </Page>
  );
}
