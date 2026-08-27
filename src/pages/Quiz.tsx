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
import { buildDailyQuiz, markCorrect, markWrong, markSpellingCorrect, markSpellingWrong } from "../lib/scheduler";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">Quiz</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-lg text-gray-700 mb-4">No quiz available today.</p>
          <button
            onClick={() => navigate("/done")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">Quiz Complete!</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-xl text-gray-700 mb-4">
            Score: {score} / {questions.length}
          </p>
          <button
            onClick={() => navigate("/done", { state: { score, total: questions.length } })}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const word = allWords.find((w) => w.word === currentQuestion.itemId);
  const schedulerItem = schedulerItems.find((i) => i.itemId === currentQuestion.itemId);

  const handleAnswer = async (selectedIdx: number, isCorrect?: boolean) => {
    if (showMeaning) {
      // After showing meaning, move to next
      setShowMeaning(false);
      goToNext();
      return;
    }

    const actuallyCorrect = isCorrect !== undefined ? isCorrect : (selectedIdx === currentQuestion.correctAnswer);

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
          updated = {
            ...updated,
            sayCorrect: (updated.sayCorrect ?? 0) + 1,
          };
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
      speak(word?.kidMeaning || "");

      // Record failure
      if (schedulerItem) {
        let updated = markWrong(schedulerItem, getTodayKey());

        // Handle spelling tracking
        if (currentQuestion.type.includes("spell") && schedulerItem.type === "word") {
          updated = markSpellingWrong(updated);
        }

        // Handle say tracking
        if (currentQuestion.type === "say_word" && schedulerItem.type === "word") {
          updated = {
            ...updated,
            sayWrong: (updated.sayWrong ?? 0) + 1,
          };
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
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8">
      <h1 className="text-4xl font-bold text-blue-600">Quiz</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="text-lg text-gray-600 mb-2">
            Question {currentQuestionIdx + 1} of {questions.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(((currentQuestionIdx + 1) / questions.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {showMeaning && word ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">{word.word}</h2>
            <div className="text-6xl mb-4">{word.emoji}</div>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <p className="text-xl text-gray-800 font-semibold">It means:</p>
              <p className="text-2xl text-purple-600 mt-2">{word.kidMeaning}</p>
            </div>
            <button
              onClick={() => speak(word.kidMeaning)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg mb-4"
            >
              🔊 Hear again
            </button>
            <button
              onClick={() => handleAnswer(0)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              Continue →
            </button>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-8">{currentQuestion.question}</h2>

            <button
              onClick={() => speak(currentQuestion.question)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg mb-6"
            >
              🔊 Hear Question
            </button>

            <div className="space-y-3">
              {shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-4 text-left text-lg font-semibold bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-800 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Score: {score}/{answeredCount}
          </p>
        </div>
      </div>
    </div>
  );
}
