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
} from "../lib/insights";
import { wordsForLevel } from "../content/levelContent";
import { levelLabel, asLevel, DEFAULT_LEVEL } from "../content/levels";
import { Page, PageTitle, Card, Button, Loading } from "../components/ui";

interface ChildRow {
  child: ChildProfile;
  known: number;
  mastered: number;
  // Each child's totals are out of *her own* level's word list, so the two
  // columns below aren't comparable across children without seeing the level.
  total: number;
  streak: number;
  daysCompleted: number;
  accuracy: number;
  comprehension: number;
  spelling: number;
}

/**
 * The measures shown on every child's card, in the order a parent reads them.
 * Kept as data rather than markup so each card is guaranteed the same set.
 */
const METRICS: Array<{ label: string; value: (row: ChildRow) => string }> = [
  { label: "Words known", value: (r) => `${r.known} / ${r.total}` },
  { label: "Words mastered", value: (r) => `${r.mastered} / ${r.total}` },
  { label: "Streak", value: (r) => `🔥 ${r.streak}` },
  { label: "Days done", value: (r) => `${r.daysCompleted}` },
  { label: "Accuracy", value: (r) => `${r.accuracy}%` },
  { label: "Comprehension", value: (r) => `${r.comprehension}%` },
  { label: "Spelling", value: (r) => `${r.spelling}%` },
];

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
            total: wordsForLevel(asLevel(child.level) ?? DEFAULT_LEVEL).length,
            streak: profile.streak || 0,
            daysCompleted: dayRecords.filter((r) => r.completed).length,
            accuracy: calculateAccuracy(logs),
            comprehension: calculateComprehensionAccuracy(logs),
            spelling: calculateSpellingAccuracy(items),
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
        <div className="w-full flex flex-col gap-3">
          {/* A card per child, not a table.
              A table needed one nowrap column per measure inside a horizontal
              scroller, and with seven profiles — several of them named with a
              long run of emoji a child typed in — the sticky name column filled
              the screen and pushed every number out of sight. Transposing it
              only moves the problem to the headers. Cards never scroll
              sideways, however many children there are and whatever they are
              called. */}
          {rows.map((row) => (
            <Card key={row.child.id} className="text-left">
              <div className="flex items-baseline gap-2 mb-3 pb-3 border-b border-secondary/15">
                {/* min-w-0 lets the name actually truncate inside the flex row,
                    so a wall of emoji can't push the level badge off-screen. */}
                <span className="text-xl flex-shrink-0">{row.child.emoji}</span>
                <span className="font-display font-semibold text-ink text-lg truncate min-w-0 flex-1">
                  {row.child.name}
                </span>
                <span className="flex-shrink-0 text-sm font-bold text-secondary-dark bg-secondary-light/60 rounded-full px-3 py-1">
                  {levelLabel(asLevel(row.child.level) ?? DEFAULT_LEVEL)}
                </span>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                {METRICS.map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs font-bold uppercase tracking-wide text-ink/40">{label}</dt>
                    <dd className="text-base text-ink/80 truncate">{value(row)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
          <p className="text-sm text-ink/40 px-2">
            Words are counted out of each child's own level, so the totals differ by level.
          </p>
        </div>
      )}

      <Button variant="ghost" full={false} onClick={() => navigate("/insights")}>
        ← Back to Insights
      </Button>
    </Page>
  );
}
