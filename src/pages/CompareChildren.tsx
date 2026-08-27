import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { listChildren, getChildRawData } from "../store/progress";
import type { ChildProfile } from "../store/progress";
import {
  calculateMasteredCount,
  calculateLearnedCount,
  calculateAccuracy,
  calculateComprehensionAccuracy,
  calculateSpellingAccuracy,
  calculatePronunciationAccuracy,
} from "../lib/insights";
import { allWords } from "../content/allWords";
import { Page, PageTitle, Card, Button, Loading } from "../components/ui";

interface ChildRow {
  child: ChildProfile;
  known: number;
  mastered: number;
  streak: number;
  daysCompleted: number;
  accuracy: number;
  comprehension: number;
  spelling: number;
  pronunciation: number;
}

export default function CompareChildren() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ChildRow[] | null>(null);

  useEffect(() => {
    async function load() {
      const children = await listChildren();
      const withStats = await Promise.all(
        children.map(async (child) => {
          const { items, dayRecords, logs, profile } = await getChildRawData(child.id);
          return {
            child,
            // "Words known" = has started learning it at all (box >= 1) —
            // a much lower bar than "mastered" (streak/day/type rule), and
            // the number a parent asking "how many words does she know?"
            // actually means.
            known: calculateLearnedCount(items),
            mastered: calculateMasteredCount(items),
            streak: profile.streak || 0,
            daysCompleted: dayRecords.filter((r) => r.completed).length,
            accuracy: calculateAccuracy(logs),
            comprehension: calculateComprehensionAccuracy(logs),
            spelling: calculateSpellingAccuracy(items),
            pronunciation: calculatePronunciationAccuracy(items),
          };
        })
      );
      setRows(withStats);
    }
    load();
  }, []);

  if (rows === null) {
    return <Loading label="Loading progress…" />;
  }

  const totalWords = allWords.length;

  return (
    <Page>
      <PageTitle>Compare Children</PageTitle>

      {rows.length === 0 ? (
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">No child profiles found.</p>
          <Button onClick={() => navigate("/insights")}>Back to Insights</Button>
        </Card>
      ) : rows.length === 1 ? (
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-2">
            {rows[0].child.emoji} {rows[0].child.name} is the only profile right now.
          </p>
          <p className="text-base text-ink/60 mb-6">
            Add another child profile (Home → Switch profile → Add profile) to compare progress.
          </p>
          <Button onClick={() => navigate("/insights")}>Back to Insights</Button>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-cream pr-4 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50">
                    Child
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Words known
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Words mastered
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Streak
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Days done
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Accuracy
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Comprehension
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Spelling
                  </th>
                  <th className="px-3 pb-3 text-sm font-bold uppercase tracking-wide text-ink/50 whitespace-nowrap">
                    Pronunciation
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ child, known, mastered, streak, daysCompleted, accuracy, comprehension, spelling, pronunciation }) => (
                  <tr key={child.id} className="border-t border-secondary/15">
                    <td className="sticky left-0 bg-cream py-3 pr-4 font-display font-semibold text-ink whitespace-nowrap">
                      {child.emoji} {child.name}
                    </td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">
                      {known} / {totalWords}
                    </td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">
                      {mastered} / {totalWords}
                    </td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">🔥 {streak}</td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">{daysCompleted}</td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">{accuracy}%</td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">{comprehension}%</td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">{spelling}%</td>
                    <td className="px-3 py-3 text-ink/80 whitespace-nowrap">{pronunciation}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Button variant="ghost" full={false} onClick={() => navigate("/insights")}>
        ← Back to Insights
      </Button>
    </Page>
  );
}
