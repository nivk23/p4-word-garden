import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTodayKey } from "../lib/dates";
import { getUserProfile, getDayRecord, calculateStreak, getSchedulerItems, clearActiveChild } from "../store/progress";
import type { DayRecord } from "../store/progress";
import { isMastered } from "../lib/scheduler";
import { isFirebaseAvailable } from "../firebase";
import { signOutUser } from "../lib/auth";
import { Page, Card, Button, Chip } from "../components/ui";
import GardenBed from "../components/GardenBed";

export default function Home() {
  const navigate = useNavigate();
  const [todayRecord, setTodayRecord] = useState<DayRecord | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [garden, setGarden] = useState({ seeds: 0, sprouts: 0, flowers: 0 });

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

      // Every learned word is a plant in the garden bed, growth stage
      // mirroring the scheduler's own mastery rule.
      const schedulerItems = await getSchedulerItems();
      const words = schedulerItems.filter((i) => i.type === "word");
      let seeds = 0;
      let sprouts = 0;
      let flowers = 0;
      for (const item of words) {
        if (isMastered(item)) flowers++;
        else if (item.box >= 1) sprouts++;
        else seeds++;
      }
      setGarden({ seeds, sprouts, flowers });

      setIsLoading(false);
    }
    loadData();
  }, []);

  const isDone = !!(todayRecord && todayRecord.completed);

  return (
    <Page>
      <div className="text-center mt-4">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-secondary-dark tracking-tight">
          P4 Word Garden
        </h1>
      </div>

      {!isLoading && (garden.seeds + garden.sprouts + garden.flowers > 0) && (
        <GardenBed seeds={garden.seeds} sprouts={garden.sprouts} flowers={garden.flowers} />
      )}

      <Card className="text-center">
        <p className="font-hand text-2xl text-ink/50 -mb-1">my growing streak</p>
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

      {isFirebaseAvailable() && (
        <div className="flex gap-4 mt-1">
          <button
            onClick={() => {
              // Switching profiles doesn't change auth state, so AuthGate's
              // onAuthStateChanged subscription won't re-fire on its own —
              // a reload is the simplest way to make it re-check which
              // child is active.
              clearActiveChild();
              window.location.reload();
            }}
            className="text-secondary-dark/50 hover:text-secondary-dark text-xs font-semibold underline decoration-2 underline-offset-4"
          >
            👤 Switch profile
          </button>
          <button
            onClick={async () => {
              clearActiveChild();
              await signOutUser();
            }}
            className="text-secondary-dark/50 hover:text-secondary-dark text-xs font-semibold underline decoration-2 underline-offset-4"
          >
            Sign out
          </button>
        </div>
      )}
    </Page>
  );
}
