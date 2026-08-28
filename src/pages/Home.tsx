import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTodayKey } from "../lib/dates";
import { getDayRecord, getAllDayRecords, calculateStreak, getSchedulerItems, clearActiveChild, getActiveChild } from "../store/progress";
import type { DayRecord, ChildProfile } from "../store/progress";
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
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      const today = getTodayKey();

      // Every read here is independent — fetch all of them concurrently
      // instead of one at a time. This used to be ~34 separate Firestore
      // reads (an unused getUserProfile() call whose result was never even
      // read, today's record, then 30 *individual* getDayRecord calls just
      // to compute the streak, then scheduler items) — now 4 concurrent
      // reads total. getAllDayRecords() also incidentally fixes a latent
      // correctness bug: a streak longer than 30 days would have been
      // silently capped by the old date-window loop.
      const [child, record, allDayRecords, schedulerItems] = await Promise.all([
        getActiveChild(),
        getDayRecord(today),
        getAllDayRecords(),
        getSchedulerItems(),
      ]);

      setActiveChild(child);
      setTodayRecord(record);
      setStreak(calculateStreak(allDayRecords));

      // Every learned word is a plant in the garden bed, growth stage
      // mirroring the scheduler's own mastery rule.
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
  // A DayRecord for today already exists (LearnWords already ran and
  // created it + today's scheduler items) but the quiz hasn't finished it
  // yet — e.g. she closed the tab partway through. Routing back to
  // "Start today" → /learn-words in this state would pick a *new* set of 3
  // words and overwrite today's DayRecord (saveDayRecord keys by date), so
  // this needs its own "continue" path instead of re-running Learn Words.
  const inProgress = !!todayRecord && !todayRecord.completed;

  return (
    <Page>
      <div className="text-center mt-4">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-secondary-dark tracking-tight">
          P4 Word Garden
        </h1>
        {activeChild && (
          <p className="font-hand text-2xl text-ink/50 mt-1">
            {activeChild.emoji} hi, {activeChild.name}!
          </p>
        )}
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
        ) : inProgress ? (
          <>
            <p className="text-lg text-ink/70 mb-6">
              You're partway through today's lesson — pick up where you left off!
            </p>
            <Button variant="primary" onClick={() => navigate("/spell-it")}>
              Continue today
            </Button>
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

      {activeChild && (
        <button
          onClick={() => navigate("/my-profile")}
          className="text-secondary-dark/70 hover:text-secondary-dark text-sm font-semibold underline decoration-2 underline-offset-4 mt-1"
        >
          👤 My profile
        </button>
      )}

      {isFirebaseAvailable() && (
        <div className="flex gap-4 mt-1">
          <button
            onClick={() => {
              // Switching profiles doesn't change auth state, so AuthGate's
              // onAuthStateChanged subscription won't re-fire on its own —
              // a reload is the simplest way to make it re-check which
              // child is active. force_child_picker tells ChildPicker to
              // show itself even if there's only one profile (otherwise
              // there'd be no way back to "Add profile").
              sessionStorage.setItem("force_child_picker", "1");
              clearActiveChild();
              window.location.reload();
            }}
            className="text-secondary-dark/50 hover:text-secondary-dark text-xs font-semibold underline decoration-2 underline-offset-4"
          >
            {activeChild ? `${activeChild.emoji} ${activeChild.name} · Switch profile` : "👤 Switch profile"}
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
