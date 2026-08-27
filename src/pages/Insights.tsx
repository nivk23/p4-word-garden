import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAllDayRecords,
  getAllAnswerLogs,
  getSchedulerItems,
  getUserProfile,
  saveUserProfile,
} from "../store/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  calculateMasteredCount,
  calculateLearnedCount,
  calculateBeingLearnedCount,
  calculateSpellingMasteredCount,
  calculateAccuracy,
  calculateAccuracyLastNDays,
  calculateDailyAccuracies,
  calculateDailyQuestionCounts,
  findTroubleWords,
  calculateGrammarAccuracy,
  calculateComprehensionAccuracy,
  calculateSpellingAccuracy,
  calculatePronunciationAccuracy,
  findTrickySpellings,
  findHardToSayWords,
} from "../lib/insights";
import { allWords } from "../content/allWords";

export default function Insights() {
  const navigate = useNavigate();
  const [masteredCount, setMasteredCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [beingLearnedCount, setBeingLearnedCount] = useState(0);
  const [spellingMasteredCount, setSpellingMasteredCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [streak, setStreak] = useState(0);
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [accuracy7d, setAccuracy7d] = useState(0);
  const [accuracy30d, setAccuracy30d] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [dailyAccuracies, setDailyAccuracies] = useState<any[]>([]);
  const [dailyQuestionCounts, setDailyQuestionCounts] = useState<any[]>([]);
  const [troubleWords, setTroubleWords] = useState<any[]>([]);
  const [grammarAccuracy, setGrammarAccuracy] = useState<any[]>([]);
  const [comprehensionAccuracy, setComprehensionAccuracy] = useState(0);
  const [spellingAccuracy, setSpellingAccuracy] = useState(0);
  const [trickySpellings, setTrickySpellings] = useState<any[]>([]);
  const [pronunciationAccuracy, setPronunciationAccuracy] = useState(0);
  const [hardToSayWords, setHardToSayWords] = useState<any[]>([]);
  const [newPin, setNewPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const dayRecords = await getAllDayRecords();
      const logs = await getAllAnswerLogs();
      const items = await getSchedulerItems();
      const profile = await getUserProfile();

      // Calculate all metrics
      const mastered = calculateMasteredCount(items);
      const learned = calculateLearnedCount(items);
      const beingLearned = calculateBeingLearnedCount(items);
      const spellingMastered = calculateSpellingMasteredCount(items);
      const total = allWords.length;

      // Streak and days
      const completed = dayRecords.filter((r) => r.completed).length;
      const streak_val = profile.streak || 0;

      // Accuracies
      const acc = calculateAccuracy(logs);
      const acc7 = calculateAccuracyLastNDays(logs, 7);
      const acc30 = calculateAccuracyLastNDays(logs, 30);

      // Charts
      const daily_acc = calculateDailyAccuracies(logs);
      const daily_counts = calculateDailyQuestionCounts(logs);

      // Details
      const trouble = findTroubleWords(items, 10);
      const grammar_acc = calculateGrammarAccuracy(logs, items.filter((i) => i.type === "grammar").map((i) => i.itemId));
      const comp_acc = calculateComprehensionAccuracy(logs);
      const spell_acc = calculateSpellingAccuracy(items);
      const tricky = findTrickySpellings(items, 10);
      const pron_acc = calculatePronunciationAccuracy(items);
      const hardToSay = findHardToSayWords(items, 10);

      setMasteredCount(mastered);
      setLearnedCount(learned);
      setBeingLearnedCount(beingLearned);
      setSpellingMasteredCount(spellingMastered);
      setTotalWords(total);
      setStreak(streak_val);
      setDaysCompleted(completed);
      setAccuracy7d(acc7);
      setAccuracy30d(acc30);
      setOverallAccuracy(acc);
      setDailyAccuracies(daily_acc);
      setDailyQuestionCounts(daily_counts);
      setTroubleWords(trouble);
      setGrammarAccuracy(grammar_acc);
      setComprehensionAccuracy(comp_acc);
      setSpellingAccuracy(spell_acc);
      setTrickySpellings(tricky);
      setPronunciationAccuracy(pron_acc);
      setHardToSayWords(hardToSay);

      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleChangePIN = async () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinMessage("PIN must be 4 digits");
      return;
    }

    const profile = await getUserProfile();
    // Simple hash (same as in progress.ts)
    let hash = 0;
    for (let i = 0; i < newPin.length; i++) {
      const char = newPin.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    profile.pinHash = Math.abs(hash).toString(16);
    await saveUserProfile(profile);
    setPinMessage("PIN changed successfully!");
    setNewPin("");
    setTimeout(() => setPinMessage(""), 2000);
  };

  const handleExportJSON = () => {
    const data = {
      mastered: masteredCount,
      learned: learnedCount,
      beingLearned: beingLearnedCount,
      spellingMastered: spellingMasteredCount,
      totalWords,
      streak,
      daysCompleted,
      accuracy7d,
      accuracy30d,
      overallAccuracy,
      comprehensionAccuracy,
      spellingAccuracy,
      pronunciationAccuracy,
      troubleWords,
      trickySpellings,
      hardToSayWords,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-buddy-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const noData = masteredCount === 0 && learnedCount === 0;

  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 py-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600">Parent Insights</h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Back to Home
          </button>
        </div>

        {noData ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No data yet. Your child needs to complete some lessons first!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <>
            {/* Main Headline: Words Mastered */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-8 text-white mb-8">
              <h2 className="text-2xl font-bold mb-4">Words Mastered</h2>
              <div className="text-5xl font-bold mb-4">{masteredCount}</div>
              <div className="text-lg mb-4">out of {totalWords} total words</div>
              <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                <div
                  className="bg-white h-4 rounded-full transition-all"
                  style={{
                    width: totalWords > 0 ? `${(masteredCount / totalWords) * 100}%` : "0%",
                  }}
                />
              </div>
              <p className="text-sm opacity-90">
                Mastered = streak ≥ 5, correct on ≥ 3 days, ≥ 2 question types
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                <p className="text-sm text-gray-600">Words Learned</p>
                <p className="text-3xl font-bold text-blue-600">{learnedCount}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <p className="text-sm text-gray-600">Being Learned</p>
                <p className="text-3xl font-bold text-green-600">{beingLearnedCount}</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
                <p className="text-sm text-gray-600">Spelling Mastered</p>
                <p className="text-3xl font-bold text-yellow-600">{spellingMasteredCount}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-3xl font-bold text-orange-600">{streak}</p>
              </div>
            </div>

            {/* Accuracy Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-sm">Overall Accuracy</p>
                <p className="text-4xl font-bold text-purple-600">{overallAccuracy}%</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-sm">7-Day Accuracy</p>
                <p className="text-4xl font-bold text-blue-600">{accuracy7d}%</p>
                <p className="text-xs text-gray-500">Last week</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-sm">30-Day Accuracy</p>
                <p className="text-4xl font-bold text-green-600">{accuracy30d}%</p>
                <p className="text-xs text-gray-500">Last month</p>
              </div>
            </div>

            {/* More Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-sm">Days Completed</p>
                <p className="text-4xl font-bold text-indigo-600">{daysCompleted}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-sm">Comprehension Accuracy</p>
                <p className="text-4xl font-bold text-teal-600">{comprehensionAccuracy}%</p>
                <p className="text-xs text-gray-500">(Understanding)</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-sm">Spelling Accuracy</p>
                <p className="text-4xl font-bold text-pink-600">{spellingAccuracy}%</p>
              </div>
            </div>

            {/* Charts */}
            {dailyAccuracies.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Accuracy Per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyAccuracies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#7C3AED"
                      dot={{ r: 4 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {dailyQuestionCounts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Questions Per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyQuestionCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trouble Words */}
            {troubleWords.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Trouble Words</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2">Word</th>
                        <th className="text-center py-2">Correct</th>
                        <th className="text-center py-2">Wrong</th>
                        <th className="text-left py-2">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {troubleWords.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 font-semibold text-purple-600">{item.itemId}</td>
                          <td className="text-center py-3 text-green-600">{item.correct}</td>
                          <td className="text-center py-3 text-red-600 font-bold">{item.wrong}</td>
                          <td className="py-3 text-gray-600">{item.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grammar Accuracy */}
            {grammarAccuracy.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Grammar Rules</h3>
                <div className="space-y-2">
                  {grammarAccuracy.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        item.accuracy < 60
                          ? "bg-red-50 border-l-4 border-red-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{item.grammarId}</span>
                        <span
                          className={`font-bold ${
                            item.accuracy < 60
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.accuracy}%
                        </span>
                      </div>
                      {item.accuracy < 60 && (
                        <p className="text-xs text-red-600 mt-1">Needs practice</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pronunciation */}
            {pronunciationAccuracy > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Pronunciation Accuracy: {pronunciationAccuracy}%
                </h3>
                {hardToSayWords.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">Hard to Say:</p>
                    <div className="space-y-2">
                      {hardToSayWords.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                          <span className="font-semibold">{item.itemId}</span>
                          <span className="text-gray-600 ml-2">
                            {item.correct}✓ {item.wrong}✗
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tricky Spellings */}
            {trickySpellings.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tricky Spellings</h3>
                <div className="space-y-2">
                  {trickySpellings.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{item.itemId}</span>
                        <span className="text-sm text-gray-600">
                          {item.correct}✓ {item.wrong}✗
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Change PIN */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Change PIN</h3>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="New 4-digit PIN"
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleChangePIN}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Update
                </button>
              </div>
              {pinMessage && (
                <p className={`text-sm mt-2 ${pinMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {pinMessage}
                </p>
              )}
            </div>

            {/* Export Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={handleExportJSON}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                📥 Export Data as JSON
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
