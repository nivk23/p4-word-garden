import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { allWords } from "../content/allWords";
import { speak } from "../lib/tts";
import SayIt from "../components/SayIt";
import {
  getSchedulerItems,
  getDayRecord,
} from "../store/progress";
import { getTodayKey } from "../lib/dates";
import type { SchedulerItem } from "../lib/scheduler";

export default function SayItStep() {
  const navigate = useNavigate();
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [sayItems, setSayItems] = useState<SchedulerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load today's 3 words and their scheduler items
  useEffect(() => {
    async function load() {
      const today = getTodayKey();
      const dayRecord = await getDayRecord(today);
      if (dayRecord) {
        const items = await getSchedulerItems();
        const items3 = items.filter((i) => dayRecord.wordIds.includes(i.itemId));
        setSayItems(items3);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (sayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">Say It</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-lg text-gray-700 mb-4">No words to practice.</p>
          <button
            onClick={() => navigate("/grammar")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const item = sayItems[currentWordIdx];
  const word = allWords.find((w) => w.word === item.itemId);

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">Say It</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-lg text-gray-700">Word not found.</p>
          <button
            onClick={() => navigate("/grammar")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const handleSayCorrect = async () => {
    if (currentWordIdx < sayItems.length - 1) {
      setCurrentWordIdx(currentWordIdx + 1);
    } else {
      navigate("/grammar");
    }
  };

  const handleSayWrong = async () => {
    if (currentWordIdx < sayItems.length - 1) {
      setCurrentWordIdx(currentWordIdx + 1);
    } else {
      navigate("/grammar");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8">
      <h1 className="text-4xl font-bold text-blue-600">Say It</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-600 mb-2">
            Word {currentWordIdx + 1} of {sayItems.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(((currentWordIdx + 1) / sayItems.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{word.emoji}</div>
          <h2 className="text-3xl font-bold text-purple-600 mb-4">{word.word}</h2>
          <button
            onClick={() => speak(word.word)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg mb-4"
          >
            🔊 Listen
          </button>
          <p className="text-lg text-gray-600 mb-4">{word.kidMeaning}</p>
        </div>

        <div className="mb-6">
          <SayIt
            word={word}
            onCorrect={handleSayCorrect}
            onWrong={handleSayWrong}
          />
        </div>

        <div className="text-center text-sm text-gray-600 mt-6">
          <p>Up to 3 tries. You can skip if it's hard — it never blocks your progress.</p>
        </div>
      </div>
    </div>
  );
}
