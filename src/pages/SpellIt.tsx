import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { allWords } from "../content/allWords";
import SpellTiles from "../components/SpellTiles";
import {
  getSchedulerItems,
  saveSchedulerItem,
  getDayRecord,
  logAnswer,
} from "../store/progress";
import { getTodayKey } from "../lib/dates";
import { markSpellingCorrect, markSpellingWrong } from "../lib/scheduler";
import type { SchedulerItem } from "../lib/scheduler";
import { Page, PageTitle, Loading, Card, Button, ProgressDots } from "../components/ui";

export default function SpellIt() {
  const navigate = useNavigate();
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [spellingItems, setSpellingItems] = useState<SchedulerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load today's 3 words and their scheduler items
  useEffect(() => {
    async function load() {
      const today = getTodayKey();
      const [dayRecord, items] = await Promise.all([
        getDayRecord(today),
        getSchedulerItems(),
      ]);
      if (dayRecord) {
        const items3 = items.filter((i) =>
          dayRecord.wordIds.includes(i.itemId)
        );
        setSpellingItems(items3);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (spellingItems.length === 0) {
    return (
      <Page>
        <PageTitle>Spell It</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">No words to spell today.</p>
          <Button onClick={() => navigate("/grammar")}>Continue →</Button>
        </Card>
      </Page>
    );
  }

  const item = spellingItems[currentWordIdx];
  const word = allWords.find((w) => w.word === item.itemId);

  if (!word) {
    return (
      <Page>
        <PageTitle>Spell It</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">Word not found.</p>
          <Button onClick={() => navigate("/grammar")}>Continue →</Button>
        </Card>
      </Page>
    );
  }

  const handleSpellingCorrect = async () => {
    const updated = markSpellingCorrect(item);
    await saveSchedulerItem(updated);
    await logAnswer({
      day: getTodayKey(),
      itemId: item.itemId,
      qType: "spell_tiles",
      correct: true,
      ts: Date.now(),
    });

    if (currentWordIdx < spellingItems.length - 1) {
      setCurrentWordIdx(currentWordIdx + 1);
    } else {
      navigate("/grammar");
    }
  };

  const handleSpellingWrong = async () => {
    const updated = markSpellingWrong(item);
    await saveSchedulerItem(updated);
    await logAnswer({
      day: getTodayKey(),
      itemId: item.itemId,
      qType: "spell_tiles",
      correct: false,
      ts: Date.now(),
    });

    if (currentWordIdx < spellingItems.length - 1) {
      setCurrentWordIdx(currentWordIdx + 1);
    } else {
      navigate("/grammar");
    }
  };

  return (
    <Page>
      <PageTitle>Spell It</PageTitle>
      <ProgressDots total={spellingItems.length} current={currentWordIdx} />

      <Card>
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="text-6xl">{word.emoji}</div>
          <p className="text-sm font-semibold text-ink/50">Listen carefully</p>
        </div>

        <SpellTiles
          word={word}
          onCorrect={handleSpellingCorrect}
          onWrong={handleSpellingWrong}
        />

        <p className="text-center text-sm text-ink/40 mt-6">
          Tap the letter tiles in the correct order.
        </p>
      </Card>
    </Page>
  );
}
