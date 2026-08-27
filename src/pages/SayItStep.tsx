import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { allWords } from "../content/allWords";
import SayIt from "../components/SayIt";
import {
  getSchedulerItems,
  getDayRecord,
} from "../store/progress";
import { getTodayKey } from "../lib/dates";
import type { SchedulerItem } from "../lib/scheduler";
import { Page, PageTitle, Loading, Card, Button, ProgressDots, SpeakButton } from "../components/ui";

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
    return <Loading />;
  }

  if (sayItems.length === 0) {
    return (
      <Page>
        <PageTitle>Say It</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">No words to practice.</p>
          <Button onClick={() => navigate("/grammar")}>Continue →</Button>
        </Card>
      </Page>
    );
  }

  const item = sayItems[currentWordIdx];
  const word = allWords.find((w) => w.word === item.itemId);

  if (!word) {
    return (
      <Page>
        <PageTitle>Say It</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">Word not found.</p>
          <Button onClick={() => navigate("/grammar")}>Continue →</Button>
        </Card>
      </Page>
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
    <Page>
      <PageTitle>Say It</PageTitle>
      <ProgressDots total={sayItems.length} current={currentWordIdx} />

      <Card>
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="text-6xl">{word.emoji}</div>
          <h2 className="text-4xl font-extrabold text-secondary-dark">{word.word}</h2>
          <p className="text-lg text-ink/70">{word.kidMeaning}</p>
          <div className="mt-2">
            <SpeakButton text={word.word} label={`Hear ${word.word}`} size="lg" />
          </div>
        </div>

        <SayIt
          word={word}
          onCorrect={handleSayCorrect}
          onWrong={handleSayWrong}
        />

        <p className="text-center text-sm text-ink/40 mt-6">
          Up to 3 tries. You can skip if it's hard — it never blocks your progress.
        </p>
      </Card>
    </Page>
  );
}
