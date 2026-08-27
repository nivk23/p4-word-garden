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
import { Card, Button, Loading } from "../components/ui";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm text-ink/50 font-semibold">{label}</p>
      <p className="text-3xl font-extrabold text-secondary-dark">{value}</p>
      {sub && <p className="text-xs text-ink/40 mt-1">{sub}</p>}
    </div>
  );
}

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
    return <Loading />;
  }

  const noData = masteredCount === 0 && learnedCount === 0;

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-dark tracking-tight">
            Parent Insights
          </h1>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => navigate("/compare-children")}
              className="text-secondary-dark/70 hover:text-secondary-dark text-sm font-semibold underline decoration-2 underline-offset-4"
            >
              📊 Compare children
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-secondary-dark/70 hover:text-secondary-dark text-sm font-semibold underline decoration-2 underline-offset-4"
            >
              Back to Home
            </button>
          </div>
        </div>

        {noData ? (
          <Card className="text-center">
            <p className="text-ink/70 text-lg mb-6">
              No data yet. Your child needs to complete some lessons first!
            </p>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </Card>
        ) : (
          <>
            {/* Main Headline: Words Mastered */}
            <div className="rounded-3xl shadow-md p-8 text-white bg-secondary">
              <h2 className="text-lg font-bold mb-3 opacity-90">Words Mastered</h2>
              <div className="text-5xl font-extrabold mb-3">{masteredCount}</div>
              <div className="text-base mb-4 opacity-90">out of {totalWords} total words</div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div
                  className="bg-white h-3 rounded-full transition-all"
                  style={{
                    width: totalWords > 0 ? `${(masteredCount / totalWords) * 100}%` : "0%",
                  }}
                />
              </div>
              <p className="text-sm opacity-80">
                Mastered = streak &ge; 5, correct on &ge; 3 days, &ge; 2 question types
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Words Learned" value={learnedCount} />
              <StatCard label="Being Learned" value={beingLearnedCount} />
              <StatCard label="Spelling Mastered" value={spellingMasteredCount} />
              <StatCard label="Streak" value={streak} sub="days in a row" />
            </div>

            {/* Accuracy Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Overall Accuracy" value={`${overallAccuracy}%`} sub="All time" />
              <StatCard label="7-Day Accuracy" value={`${accuracy7d}%`} sub="Last week" />
              <StatCard label="30-Day Accuracy" value={`${accuracy30d}%`} sub="Last month" />
            </div>

            {/* More Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Days Completed" value={daysCompleted} />
              <StatCard label="Comprehension Accuracy" value={`${comprehensionAccuracy}%`} sub="Understanding" />
              <StatCard label="Spelling Accuracy" value={`${spellingAccuracy}%`} />
            </div>

            {/* Charts */}
            {dailyAccuracies.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-ink mb-4">Accuracy Per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyAccuracies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#4c7a46"
                      dot={{ r: 4 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {dailyQuestionCounts.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-ink mb-4">Questions Per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyQuestionCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#c1602a" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Trouble Words */}
            {troubleWords.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-ink mb-4">Trouble Words</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2">Word</th>
                        <th className="text-center py-2">Correct</th>
                        <th className="text-center py-2">Wrong</th>
                        <th className="text-left py-2">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {troubleWords.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 font-semibold text-secondary-dark">{item.itemId}</td>
                          <td className="text-center py-3 text-green-600">{item.correct}</td>
                          <td className="text-center py-3 text-red-600 font-bold">{item.wrong}</td>
                          <td className="py-3 text-ink/60">{item.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Grammar Accuracy */}
            {grammarAccuracy.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-ink mb-4">Grammar Rules</h3>
                <div className="space-y-2">
                  {grammarAccuracy.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl ${
                        item.accuracy < 60
                          ? "bg-red-50 border-l-4 border-red-400"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-ink">{item.grammarId}</span>
                        <span
                          className={`font-bold ${
                            item.accuracy < 60 ? "text-red-600" : "text-secondary-dark"
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
              </Card>
            )}

            {/* Pronunciation */}
            {pronunciationAccuracy > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-ink mb-4">
                  Pronunciation Accuracy: {pronunciationAccuracy}%
                </h3>
                {hardToSayWords.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-ink/60 mb-3">Hard to Say:</p>
                    <div className="space-y-2">
                      {hardToSayWords.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-lg text-sm">
                          <span className="font-semibold">{item.itemId}</span>
                          <span className="text-ink/60 ml-2">
                            {item.correct}&#10003; {item.wrong}&#10007;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Tricky Spellings */}
            {trickySpellings.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-ink mb-4">Tricky Spellings</h3>
                <div className="space-y-2">
                  {trickySpellings.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-ink">{item.itemId}</span>
                        <span className="text-sm text-ink/60">
                          {item.correct}&#10003; {item.wrong}&#10007;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Change PIN */}
            <Card>
              <h3 className="text-xl font-bold text-ink mb-4">Change PIN</h3>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="New 4-digit PIN"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-accent min-h-[48px]"
                />
                <Button variant="secondary" full={false} onClick={handleChangePIN} className="px-6">
                  Update
                </Button>
              </div>
              {pinMessage && (
                <p className={`text-sm mt-2 ${pinMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {pinMessage}
                </p>
              )}
            </Card>

            {/* Export Button */}
            <Card>
              <Button onClick={handleExportJSON}>📥 Export data as JSON</Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
