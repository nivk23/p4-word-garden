import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getSchedulerItems,
  getDayRecord,
  saveSchedulerItem,
  logAnswer,
  saveDayRecord,
  getUserProfile,
  saveUserProfile,
} from "../store/progress";
import { getTodayKey, getYesterdayKey } from "../lib/dates";
import { buildDailyQuiz, markCorrect, markWrong, markSpellingCorrect, markSpellingWrong, markSayCorrect, markSayWrong } from "../lib/scheduler";
import { buildDailyQuizWithSpelling, shuffleOptionsWithCorrect, createPracticeOnlyRetry, generateWordQuestions, generateGrammarQuestions } from "../lib/questions";
import { allWords } from "../content/allWords";
import { grammarLessons } from "../content/grammar";
import { speak } from "../lib/tts";
import SpellTiles from "../components/SpellTiles";
import SpellMissing from "../components/SpellMissing";
import SpellType from "../components/SpellType";
import SayIt from "../components/SayIt";
import type { Question } from "../lib/questions";
import type { SchedulerItem } from "../lib/scheduler";
import { Page, PageTitle, Loading, Card, Button, SpeakButton, FeedbackBanner } from "../components/ui";

export default function Quiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schedulerItems, setSchedulerItems] = useState<SchedulerItem[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [dayRecord, setDayRecord] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      const today = getTodayKey();
      const record = await getDayRecord(today);
      const allItems = await getSchedulerItems();

      if (!record) {
        // No day started yet
        navigate("/");
        return;
      }

      setDayRecord(record);
      setStartTime(Date.now());

      // Build the quiz
      let schedulerItemsForQuiz: SchedulerItem[] = [];

      if (record.completed) {
        // Extra practice quiz: random 6-10 items
        schedulerItemsForQuiz = buildDailyQuiz(today, allItems, [], 6);
      } else {
        // Regular daily quiz: yesterday's items + due items + random
        const yesterday = getYesterdayKey();
        const yesterdayRecord = await getDayRecord(yesterday);
        const yesterdayItemIds = yesterdayRecord ? yesterdayRecord.wordIds : [];
        schedulerItemsForQuiz = buildDailyQuiz(today, allItems, yesterdayItemIds, 10);
      }

      // Generate real questions for each scheduler item
      const realQuestions: Question[] = [];
      for (let askIdx = 0; askIdx < schedulerItemsForQuiz.length; askIdx++) {
        const item = schedulerItemsForQuiz[askIdx];
        if (item.type === "word") {
          const word = allWords.find(w => w.word === item.itemId);
          if (word) {
            // Use askIdx as seed for reproducible distractor selection
            const wordQuestions = generateWordQuestions(word, askIdx);
            if (wordQuestions.length > 0) {
              realQuestions.push(wordQuestions[0]); // Pick first question type
            }
          }
        } else if (item.type === "grammar") {
          const lesson = grammarLessons.find(l => l.id === item.itemId);
          if (lesson) {
            const grammarQuestions = generateGrammarQuestions(lesson);
            if (grammarQuestions.length > 0) {
              realQuestions.push(grammarQuestions[0]);
            }
          }
        }
      }

      // Add spelling and say_word items
      const quizWithSpelling = buildDailyQuizWithSpelling(realQuestions, allItems);

      setQuestions(quizWithSpelling);
      setSchedulerItems(allItems);
      setIsLoading(false);
    }

    loadQuiz();
  }, [navigate]);

  // Reset the tapped-option state whenever we move to a new question
  useEffect(() => {
    setSelectedIdx(null);
  }, [currentQuestionIdx, showMeaning]);

  if (isLoading) {
    return <Loading label="Loading quiz…" />;
  }

  if (questions.length === 0) {
    return (
      <Page>
        <PageTitle>Quiz</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">No quiz available today.</p>
          <Button onClick={() => navigate("/done")}>Continue →</Button>
        </Card>
      </Page>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  if (!currentQuestion) {
    return (
      <Page>
        <PageTitle>Quiz Complete!</PageTitle>
        <Card className="text-center">
          <p className="text-xl text-ink/80 mb-6">
            Score: {score} / {questions.length}
          </p>
          <Button onClick={() => navigate("/done", { state: { score, total: questions.length } })}>
            Done
          </Button>
        </Card>
      </Page>
    );
  }

  const word = allWords.find((w) => w.word === currentQuestion.itemId);
  const schedulerItem = schedulerItems.find((i) => i.itemId === currentQuestion.itemId);
  const isWordHeroType = !showMeaning && !!word && [
    "spell_tiles", "spell_missing", "spell_type", "say_word"
  ].indexOf(currentQuestion.type) === -1;

  const handleAnswer = async (selectedIdxArg: number, isCorrect?: boolean, skipSpeak?: boolean) => {
    if (showMeaning) {
      // After showing meaning, move to next
      setShowMeaning(false);
      goToNext();
      return;
    }

    const actuallyCorrect = isCorrect !== undefined ? isCorrect : (selectedIdxArg === currentQuestion.correctAnswer);

    if (actuallyCorrect && !currentQuestion.practiceOnly) {
      setScore(score + 1);
      setAnsweredCount(answeredCount + 1);

      // Record success
      if (schedulerItem) {
        const today = getTodayKey();
        let updated = markCorrect(schedulerItem, today, currentQuestion.type);

        // Handle spelling tracking
        if (currentQuestion.type.includes("spell") && schedulerItem.type === "word") {
          updated = markSpellingCorrect(updated);
        }

        // Handle say tracking
        if (currentQuestion.type === "say_word" && schedulerItem.type === "word") {
          updated = markSayCorrect(updated);
        }

        await saveSchedulerItem(updated);
      }

      // Log answer
      await logAnswer({
        day: getTodayKey(),
        itemId: currentQuestion.itemId,
        qType: currentQuestion.type,
        correct: true,
        ts: Date.now(),
      });

      goToNext();
    } else if (!actuallyCorrect && !currentQuestion.practiceOnly) {
      // Wrong answer: show meaning + audio, then re-queue as practiceOnly
      setShowMeaning(true);
      if (!skipSpeak) speak(word?.kidMeaning || "");

      // Record failure
      if (schedulerItem) {
        let updated = markWrong(schedulerItem, getTodayKey());

        // Handle spelling tracking
        if (currentQuestion.type.includes("spell") && schedulerItem.type === "word") {
          updated = markSpellingWrong(updated);
        }

        // Handle say tracking
        if (currentQuestion.type === "say_word" && schedulerItem.type === "word") {
          updated = markSayWrong(updated);
        }

        await saveSchedulerItem(updated);
      }

      // Log failure
      await logAnswer({
        day: getTodayKey(),
        itemId: currentQuestion.itemId,
        qType: currentQuestion.type,
        correct: false,
        ts: Date.now(),
      });

      // Re-queue as practice-only later in quiz
      const practiceQuestion = createPracticeOnlyRetry(currentQuestion);
      setQuestions([...questions, practiceQuestion]);
    } else if (currentQuestion.practiceOnly) {
      // Practice-only retry: don't record, just move on
      setAnsweredCount(answeredCount + 1);
      goToNext();
    }
  };

  // Tap an option: show its correct/wrong state briefly, then run the real
  // answer logic (which may show the meaning panel or advance). The meaning
  // audio for a wrong answer is fired synchronously here — inside the click
  // handler — because iOS only allows speechSynthesis to start as a direct
  // result of a user gesture, not from inside a setTimeout callback.
  const handleOptionTap = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    const justCorrect = idx === currentQuestion.correctAnswer;
    if (!justCorrect) {
      speak(word?.kidMeaning || "");
    }
    setTimeout(() => handleAnswer(idx, undefined, !justCorrect), justCorrect ? 500 : 900);
  };

  const handleSayCorrect = async () => {
    handleAnswer(0, true);
  };

  const handleSayWrong = async () => {
    handleAnswer(0, false);
  };

  const goToNext = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Quiz finished - mark day as completed and update streak
      const today = getTodayKey();

      if (dayRecord) {
        const durationSec = Math.floor((Date.now() - startTime) / 1000);
        const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;

        await saveDayRecord({
          ...dayRecord,
          completed: true,
          quizResults: [],
          accuracy,
          durationSec,
        });

        // Update user profile with streak
        const profile = await getUserProfile();

        // Only increment streak once per calendar day
        if (profile.lastCompletedDay !== today) {
          const newStreak = profile.streak + 1;
          await saveUserProfile({
            ...profile,
            streak: newStreak,
            lastCompletedDay: today,
          });
        }
      }

      navigate("/done", { state: { score, total: answeredCount } });
    }
  };

  // Shuffle options for this render (anti-guessing)
  const { options: shuffledOptions } =
    currentQuestion.options.length > 0
      ? shuffleOptionsWithCorrect(currentQuestion.options, currentQuestion.correctAnswer)
      : { options: [] };

  return (
    <Page>
      <PageTitle>Quiz</PageTitle>

      <div className="w-full max-w-2xl">
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-1">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-sm text-ink/40 font-semibold">
          Question {currentQuestionIdx + 1} of {questions.length} &middot; Score {score}/{answeredCount}
        </p>
      </div>

      <Card>
        {showMeaning && word ? (
          <div className="text-center">
            <div className="text-6xl mb-3">{word.emoji}</div>
            <h2
              className="font-extrabold text-secondary-dark mb-4"
              style={{ fontSize: "clamp(2.5rem, 6vw + 1rem, 3.5rem)" }}
            >
              {word.word}
            </h2>
            <div className="rounded-2xl bg-secondary-light p-6 mb-6">
              <p className="text-sm font-bold uppercase tracking-wide text-secondary-dark mb-2">It means</p>
              <p className="text-2xl font-semibold text-ink">{word.kidMeaning}</p>
            </div>
            <div className="flex justify-center mb-6">
              <SpeakButton text={word.kidMeaning} label="Hear again" size="lg" />
            </div>
            <Button onClick={() => handleAnswer(0)}>Continue →</Button>
          </div>
        ) : currentQuestion.type === "spell_tiles" && word ? (
          <SpellTiles
            word={word}
            onCorrect={() => handleAnswer(0, true)}
            onWrong={() => handleAnswer(0, false)}
          />
        ) : currentQuestion.type === "spell_missing" && word ? (
          <SpellMissing
            word={word}
            onCorrect={() => handleAnswer(0, true)}
            onWrong={() => handleAnswer(0, false)}
          />
        ) : currentQuestion.type === "spell_type" && word ? (
          <SpellType
            word={word}
            onCorrect={() => handleAnswer(0, true)}
            onWrong={() => handleAnswer(0, false)}
          />
        ) : currentQuestion.type === "say_word" && word ? (
          <SayIt
            word={word}
            onCorrect={handleSayCorrect}
            onWrong={handleSayWrong}
          />
        ) : (
          <div>
            {isWordHeroType && word && (
              <div className="flex flex-col items-center text-center gap-1 mb-6">
                <div className="text-5xl mb-1">{word.emoji}</div>
                <h2
                  className="font-extrabold text-secondary-dark leading-tight"
                  style={{ fontSize: "clamp(2.25rem, 6vw + 0.8rem, 3rem)" }}
                >
                  {word.word}
                </h2>
              </div>
            )}

            <div className="flex items-start gap-3 mb-6">
              <p className="flex-1 text-xl font-bold text-ink leading-snug">{currentQuestion.question}</p>
              <SpeakButton text={currentQuestion.question} label="Hear question" size="sm" />
            </div>

            <div className="space-y-3">
              {shuffledOptions.map((option, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrectOption = idx === currentQuestion.correctAnswer;
                let stateClass =
                  "bg-white border-2 border-gray-200 text-ink hover:border-accent hover:bg-accent-light/30";
                if (selectedIdx !== null) {
                  if (isSelected && isCorrectOption) {
                    stateClass = "bg-green-50 border-2 border-green-500 text-green-700";
                  } else if (isSelected && !isCorrectOption) {
                    stateClass = "bg-red-50 border-2 border-red-500 text-red-700";
                  } else {
                    stateClass = "bg-white border-2 border-gray-200 text-ink/40";
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionTap(idx)}
                    disabled={selectedIdx !== null}
                    className={`w-full min-h-[56px] p-4 text-left text-lg font-semibold rounded-2xl transition-colors disabled:cursor-not-allowed flex items-center gap-2 ${stateClass}`}
                  >
                    {isSelected && isCorrectOption && <span>✓</span>}
                    {isSelected && !isCorrectOption && <span>✗</span>}
                    {option}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <div className="mt-5">
                <FeedbackBanner tone={selectedIdx === currentQuestion.correctAnswer ? "correct" : "wrong"}>
                  {selectedIdx === currentQuestion.correctAnswer ? "Nice one!" : "Not quite — let's look at it together."}
                </FeedbackBanner>
              </div>
            )}
          </div>
        )}
      </Card>
    </Page>
  );
}
