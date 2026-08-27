import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { allWords } from "../content/allWords";
import { getSchedulerItems, saveSchedulerItem, saveDayRecord } from "../store/progress";
import { getTodayKey } from "../lib/dates";
import { speak } from "../lib/tts";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading words for today...</p>
      </div>
    );
  }

  if (learningWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">No More Words</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-lg text-gray-700 mb-4">You've learned all available words!</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const word = learningWords[currentWord];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 className="text-4xl font-bold text-blue-600">Learn Words</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-600 mb-2">Word {currentWord + 1} of {learningWords.length}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentWord + 1) / learningWords.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{word.emoji}</div>
          <h2 className="text-4xl font-bold text-purple-600 mb-2">{word.word}</h2>
          <p className="text-sm text-gray-600 mb-4 italic">{word.pos}</p>

          <button
            onClick={() => speak(word.word)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg mb-6"
          >
            🔊 Hear
          </button>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">It means:</h3>
          <p className="text-xl text-gray-800">{word.kidMeaning}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Examples:</h3>
          {word.examples.map((example, idx) => (
            <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-800 mb-2">{example}</p>
              <button
                onClick={() => speak(example)}
                className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                🔊
              </button>
            </div>
          ))}
        </div>

        {word.spellingTip && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-500">
            <p className="text-sm font-semibold text-green-700">Spelling tip:</p>
            <p className="text-green-700">{word.spellingTip}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setCurrentWord(Math.max(0, currentWord - 1))}
            disabled={currentWord === 0}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-bold py-3 px-4 rounded-lg text-lg"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
          >
            {currentWord < learningWords.length - 1 ? "Next →" : "Done ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
