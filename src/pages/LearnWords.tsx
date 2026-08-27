import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { allWords } from "../content/allWords";
import { getSchedulerItems, saveSchedulerItem, saveDayRecord } from "../store/progress";
import { getTodayKey } from "../lib/dates";
import { speak } from "../lib/tts";
import { Page, PageTitle, Loading, Card, Chip, Button, SpeakButton, ProgressDots, HighlightedText } from "../components/ui";

export default function LearnWords() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [learningWords, setLearningWords] = useState<typeof allWords>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWordsForToday() {
      const schedulerItems = await getSchedulerItems();
      const taughtWordIds = new Set(schedulerItems.filter(i => i.type === "word").map(i => i.itemId));

      // Find first 3 untaught words from allWords
      const newWords = [];
      for (const word of allWords) {
        if (!taughtWordIds.has(word.word)) {
          newWords.push(word);
          if (newWords.length === 3) break;
        }
      }

      setLearningWords(newWords);
      setIsLoading(false);
    }

    loadWordsForToday();
  }, []);

  const handleNext = async () => {
    if (currentWord < learningWords.length - 1) {
      setCurrentWord(currentWord + 1);
    } else {
      // Create scheduler items for the 3 new words
      const today = getTodayKey();
      for (const word of learningWords) {
        await saveSchedulerItem({
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
          sayCorrect: 0,
          sayWrong: 0,
        });
      }

      // Select next grammar lesson
      const schedulerItems = await getSchedulerItems();
      const taughtGrammarIds = new Set(schedulerItems.filter(i => i.type === "grammar").map(i => i.itemId));
      const grammarId = `lesson_${taughtGrammarIds.size + 1}`; // Next lesson number

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
    }
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
