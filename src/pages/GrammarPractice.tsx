import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { grammarLessons } from "../content/grammar";
import { editingItems, editingItemsFor, teachingFor } from "../content/grammarPractice";
import type { EditingItem } from "../content/grammarPractice";
import FixSentence from "../components/FixSentence";
import { getAllAnswerLogs, getSchedulerItems, saveSchedulerItem, logAnswer } from "../store/progress";
import { calculateGrammarAccuracy } from "../lib/insights";
import { markCorrect, markWrong } from "../lib/scheduler";
import type { SchedulerItem } from "../lib/scheduler";
import { getTodayKey } from "../lib/dates";
import { Page, PageTitle, Card, Button, Loading, ProgressDots, SpeakButton, Chip } from "../components/ui";

type Mode = "hub" | "fix" | "pick" | "rule";
const SESSION_LENGTH = 5;

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Extra grammar practice, outside the daily flow: her exam's editing format,
 * and targeted drilling of one rule. Nothing here unlocks new material — it
 * only revisits rules the daily lesson has already introduced, so the
 * once-a-day pacing is untouched.
 */
export default function GrammarPractice() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("hub");
  const [items, setItems] = useState<SchedulerItem[]>([]);
  const [accuracy, setAccuracy] = useState<Array<{ itemId: string; accuracy: number; total: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [queue, setQueue] = useState<EditingItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [ruleId, setRuleId] = useState<string | null>(null);
  const [teachingStep, setTeachingStep] = useState(0);
  /** Items she got wrong, re-queued until each one is answered correctly. */
  const [retries, setRetries] = useState<EditingItem[]>([]);
  const [reteach, setReteach] = useState<string | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [asked, setAsked] = useState(0);
  /**
   * Bumped only when she moves on. FixSentence is keyed on it so that answering
   * never remounts the card — an earlier version keyed on the retry count, which
   * wiped her answer and the explanation the moment she got one wrong.
   */
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    async function load() {
      const [schedulerItems, logs] = await Promise.all([getSchedulerItems(), getAllAnswerLogs()]);
      const grammarIds = schedulerItems.filter((i) => i.type === "grammar").map((i) => i.itemId);
      setItems(schedulerItems);
      // calculateGrammarAccuracy gives the percentage; how many times she has been
      // asked is ours to count, so one unlucky answer cannot label a rule "weakest".
      const attempts = new Map<string, number>();
      for (const log of logs) {
        if (grammarIds.includes(log.itemId)) attempts.set(log.itemId, (attempts.get(log.itemId) ?? 0) + 1);
      }
      setAccuracy(
        calculateGrammarAccuracy(logs, grammarIds).map((row) => ({
          itemId: row.grammarId,
          accuracy: row.accuracy,
          total: attempts.get(row.grammarId) ?? 0,
        }))
      );
      setIsLoading(false);
    }
    load();
  }, []);

  /** Rules she has actually been taught; before that, everything is fair game. */
  const learnedRules = useMemo(() => {
    const taught = items.filter((i) => i.type === "grammar").map((i) => i.itemId);
    const withContent = new Set(editingItems.map((e) => e.lessonId));
    const both = taught.filter((id) => withContent.has(id));
    return both.length ? both : [...withContent];
  }, [items]);

  const weakest = useMemo(() => {
    const scored = accuracy
      .filter((a) => a.total >= 2 && editingItemsFor(a.itemId).length > 0)
      .sort((a, b) => a.accuracy - b.accuracy);
    return scored.length ? scored[0] : null;
  }, [accuracy]);

  const titleOf = (id: string) => grammarLessons.find((l) => l.id === id)?.title ?? id;

  const startFixing = (lessonId?: string) => {
    const pool = lessonId
      ? editingItemsFor(lessonId)
      : editingItems.filter((e) => learnedRules.includes(e.lessonId));
    setQueue(shuffle(pool).slice(0, SESSION_LENGTH));
    setIdx(0);
    setScore(0);
    setAnswered(false);
    setRetries([]);
    setReteach(null);
    setFirstTry(0);
    setAsked(0);
    setSeq((s) => s + 1);
    setRuleId(lessonId ?? null);
    setTeachingStep(0);
    setMode(lessonId ? "rule" : "fix");
  };

  const record = async (lessonId: string, correct: boolean, asked: EditingItem) => {
    setAnswered(true);
    setAsked((a) => a + 1);
    if (correct) {
      setScore((s) => s + 1);
      // only count it as known if she had not already missed it this session
      if (!retries.some((r) => r.sentence === asked.sentence)) setFirstTry((f) => f + 1);
      setRetries((r) => r.filter((q) => q.sentence !== asked.sentence));
    } else {
      // she gets the rule taught again, and the sentence comes back before the end
      setReteach(lessonId);
      setRetries((r) => (r.some((q) => q.sentence === asked.sentence) ? r : [...r, asked]));
    }
    const today = getTodayKey();
    await logAnswer({ day: today, itemId: lessonId, qType: "grammar_edit", correct, ts: Date.now() });
    // Practice never introduces a rule the daily flow has not taught yet.
    const item = items.find((i) => i.itemId === lessonId && i.type === "grammar");
    if (item) {
      const updated = correct ? markCorrect(item, today, "grammar_edit") : markWrong(item, today);
      await saveSchedulerItem(updated);
      setItems((prev) => prev.map((i) => (i.itemId === lessonId && i.type === "grammar" ? updated : i)));
    }
  };

  if (isLoading) return <Loading />;

  // ---------------------------------------------------------------- hub
  if (mode === "hub") {
    return (
      <Page>
        <PageTitle>Grammar Practice</PageTitle>
        <div className="space-y-5">
          <Card>
            <h2 className="font-display text-2xl font-semibold text-secondary-dark mb-2">Fix the sentence</h2>
            <p className="text-lg text-ink/70 mb-5">
              Find the word that is wrong and put it right — the way your school paper asks.
            </p>
            <Button onClick={() => startFixing()}>Start fixing →</Button>
          </Card>

          <Card>
            <h2 className="font-display text-2xl font-semibold text-secondary-dark mb-2">Practise one rule</h2>
            <p className="text-lg text-ink/70 mb-5">
              Learn a rule slowly, with examples, then practise just that rule.
            </p>
            {weakest && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Chip tone="accent">Trickiest so far</Chip>
                <span className="text-lg text-ink/80">
                  {titleOf(weakest.itemId)} · {weakest.accuracy}% right
                </span>
              </div>
            )}
            {weakest && (
              <Button variant="secondary" className="mb-3" onClick={() => startFixing(weakest.itemId)}>
                Practise {titleOf(weakest.itemId)} →
              </Button>
            )}
            <Button variant="ghost" onClick={() => setMode("pick")}>
              Choose a different rule
            </Button>
          </Card>

          <Button variant="ghost" onClick={() => navigate("/")}>← Back home</Button>
        </div>
      </Page>
    );
  }

  // --------------------------------------------------------------- picker
  if (mode === "pick") {
    const withContent = [...new Set(editingItems.map((e) => e.lessonId))];
    const byAccuracy = withContent
      .map((id) => ({ id, acc: accuracy.find((a) => a.itemId === id) }))
      .sort((a, b) => (a.acc?.accuracy ?? 101) - (b.acc?.accuracy ?? 101));
    return (
      <Page>
        <PageTitle>Choose a rule</PageTitle>
        <div className="space-y-3">
          {byAccuracy.map(({ id, acc }) => (
            <Card key={id} as="button" onClick={() => startFixing(id)} className="!py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-lg font-semibold text-secondary-dark">{titleOf(id)}</span>
                {acc ? (
                  <Chip tone={acc.accuracy < 60 ? "accent" : "secondary"}>{acc.accuracy}%</Chip>
                ) : (
                  <Chip>new</Chip>
                )}
              </div>
            </Card>
          ))}
          <Button variant="ghost" onClick={() => setMode("hub")}>← Back</Button>
        </div>
      </Page>
    );
  }

  // ------------------------------------------------------- teaching a rule
  if (mode === "rule" && ruleId) {
    const teaching = teachingFor(ruleId);
    const lesson = grammarLessons.find((l) => l.id === ruleId);
    if (teaching && teachingStep < teaching.steps.length) {
      const step = teaching.steps[teachingStep];
      return (
        <Page>
          <PageTitle>{titleOf(ruleId)}</PageTitle>
          <ProgressDots total={teaching.steps.length + 1} current={teachingStep} />
          <Card className="mt-4">
            {lesson && <p className="text-lg text-ink/70 mb-5">{lesson.description}</p>}
            <div className="rounded-2xl bg-secondary-light/60 px-5 py-5 mb-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-2xl text-secondary-dark">{step.show}</p>
                <SpeakButton text={step.show} size="sm" />
              </div>
            </div>
            <p className="text-lg text-ink/80 mb-6">{step.explain}</p>
            <Button onClick={() => setTeachingStep((s) => s + 1)}>
              {teachingStep === teaching.steps.length - 1 ? "Now practise →" : "Next →"}
            </Button>
          </Card>
        </Page>
      );
    }
  }

  // ------------------------------------------------------------- drilling
  // Work through the queue, then keep re-asking anything she missed until it is right.
  const current = queue[idx] ?? retries[0];
  if (!current) {
    return (
      <Page>
        <PageTitle>{mode === "rule" && ruleId ? titleOf(ruleId) : "Fix the sentence"}</PageTitle>
        <Card className="text-center">
          <div className="text-5xl mb-3">{score === queue.length ? "🌟" : "🌱"}</div>
          <p className="font-display text-3xl font-semibold text-secondary-dark mb-1">
            {firstTry} / {queue.length || 0}
          </p>
          <p className="text-lg text-ink/70 mb-6">
            {firstTry === queue.length
              ? "right first time"
              : `right first time — you fixed the rest after another look (${asked} tries in all)`}
          </p>
          <Button onClick={() => setMode("hub")}>Back to practice</Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageTitle>{mode === "rule" && ruleId ? titleOf(ruleId) : "Fix the sentence"}</PageTitle>
      <ProgressDots total={queue.length} current={idx} />
      <div className="mt-4 space-y-5">
        <FixSentence
          key={`${current.sentence}-${seq}`}
          item={current}
          onAnswered={(correct) => record(current.lessonId, correct, current)}
        />

        {reteach && (
          <Card>
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/50 mb-3">
              Let's look at the rule again
            </p>
            {(teachingFor(reteach)?.steps ?? []).slice(0, 2).map((step) => (
              <div key={step.show} className="mb-4">
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-secondary-light/60 px-4 py-3">
                  <p className="font-display text-xl text-secondary-dark">{step.show}</p>
                  <SpeakButton text={step.show} size="sm" />
                </div>
                <p className="text-base text-ink/80 mt-2">{step.explain}</p>
              </div>
            ))}
            <p className="text-base font-semibold text-secondary-dark">
              💡 {teachingFor(reteach)?.tip}
            </p>
            <p className="text-base text-ink/60 mt-3">
              You will see this sentence again before you finish.
            </p>
          </Card>
        )}

        {answered && (
          <Button
            onClick={() => {
              setAnswered(false);
              setReteach(null);
              setSeq((s) => s + 1);
              setIdx((i) => i + 1);
            }}
          >
            {idx >= queue.length - 1 && retries.length === 0
              ? "See how I did →"
              : retries.length > 0 && idx >= queue.length - 1
              ? "Try that one again →"
              : "Next sentence →"}
          </Button>
        )}
      </div>
    </Page>
  );
}
