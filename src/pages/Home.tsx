import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTodayKey } from "../lib/dates";
import { getUserProfile, getDayRecord, calculateStreak } from "../store/progress";
import type { DayRecord } from "../store/progress";
import { Page, Card, Button, Chip } from "../components/ui";

export default function Home() {
  const navigate = useNavigate();
  const [todayRecord, setTodayRecord] = useState<DayRecord | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    }
    loadData();
  }, []);

  const isDone = !!(todayRecord && todayRecord.completed);

  return (
    <Page>
      <div className="text-center mt-4">
        <div className="text-5xl mb-2">🌱</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-dark tracking-tight">
          P4 Word Garden
        </h1>
      </div>

      <Card className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-ink/40 mb-1">Streak</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-6xl">🔥</span>
          <span className="text-6xl font-extrabold text-accent">{streak}</span>
        </div>

        {isLoading ? (
          <p className="text-ink/50 font-semibold">Loading today's plan…</p>
        ) : isDone ? (
          <>
            <Chip tone="secondary" className="mb-4">✓ Today is done</Chip>
            <p className="text-base text-ink/70 mb-6">
              Great work today! You can do extra practice, or come back tomorrow for a new lesson.
            </p>
            <Button variant="primary" onClick={() => navigate("/quiz")}>
              Extra practice
            </Button>
            <p className="text-sm text-ink/50 mt-4">See you tomorrow! 🌙</p>
          </>
        ) : (
          <>
            <p className="text-lg text-ink/70 mb-6">
              Learn 3 new words + 1 grammar step, then take a quiz!
            </p>
            <Button variant="primary" onClick={() => navigate("/learn-words")}>
              Start today
            </Button>
          </>
        )}
      </Card>

      <button
        onClick={() => navigate("/insights")}
        className="text-secondary-dark/70 hover:text-secondary-dark text-sm font-semibold underline decoration-2 underline-offset-4 mt-2"
      >
        🔒 Parent insights
      </button>
    </Page>
  );
}
