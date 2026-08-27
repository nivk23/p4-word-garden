import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTodayKey } from "../lib/dates";
import { getUserProfile, getDayRecord, calculateStreak } from "../store/progress";
import type { DayRecord } from "../store/progress";

export default function Home() {
  const navigate = useNavigate();
  const [todayRecord, setTodayRecord] = useState<DayRecord | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function loadData() {
      await getUserProfile();

      const today = getTodayKey();
      const record = await getDayRecord(today);
      setTodayRecord(record);

      // Load last 30 days in parallel
      const datePromises = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        datePromises.push(getDayRecord(dateStr));
      }

      const results = await Promise.all(datePromises);
      const records = results.filter((r) => r !== null);
      const calculatedStreak = calculateStreak(records);
      setStreak(calculatedStreak);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <h1 className="text-5xl font-bold text-purple-600">P4 Word Garden</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-blue-600">Today's Lesson</h2>

        <div className="mb-6 text-center">
          <div className="text-lg font-semibold text-gray-700 mb-2">Streak</div>
          <div className="text-5xl font-bold text-orange-500">{streak}</div>
          <div className="text-sm text-gray-600">days in a row</div>
        </div>

        {todayRecord && todayRecord.completed ? (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border-2 border-green-500">
            <p className="text-green-700 font-semibold text-lg">✓ Today is done!</p>
            <p className="text-sm text-gray-600 mt-2">You can do extra practice quiz.</p>
            <button
              onClick={() => navigate("/quiz")}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg w-full"
            >
              Extra Practice
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Learn 3 new words + 1 grammar step, then take a quiz!</p>
            <button
              onClick={() => navigate("/learn-words")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-2xl w-full"
            >
              Start Lesson
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/insights")}
        className="text-blue-600 hover:text-blue-800 underline font-semibold"
      >
        📊 Parent Insights
      </button>
    </div>
  );
}
