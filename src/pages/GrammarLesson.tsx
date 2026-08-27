import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { grammarLessons } from "../content/grammar";
import { getDayRecord, getSchedulerItems, saveSchedulerItem, logAnswer } from "../store/progress";
import { getTodayKey } from "../lib/dates";
import { speak } from "../lib/tts";
import { markCorrect, markWrong } from "../lib/scheduler";
import type { SchedulerItem } from "../lib/scheduler";
import { Page, PageTitle, Loading, Card, Button, SpeakButton, FeedbackBanner } from "../components/ui";

/**
 * `correctAnswer` is a 0-based index into `options` for multiple-choice
 * items (pick_word/choose_form), but a literal word for sentence-tap items
 * (tag_noun/tag_verb/tag_adjective, which have no `options`). Resolve both
 * shapes to the actual expected string once, instead of comparing an option
 * *string* against a stringified *index* (which never matches).
 */
function resolvePracticeAnswer(item: { options?: string[]; correctAnswer: string | number }): string {
  if (item.options && typeof item.correctAnswer === "number") {
    return item.options[item.correctAnswer];
  }
  return String(item.correctAnswer);
}

/** Strip leading/trailing punctuation so a tapped word like "mat." matches "mat". */
function stripPunctuation(word: string): string {
  return word.replace(/^[.,!?;:"'()]+|[.,!?;:"'()]+$/g, "");
}

export default function GrammarLesson() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<typeof grammarLessons[0] | null>(null);
  const [schedulerItem, setSchedulerItem] = useState<SchedulerItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | "">("");
  const [answered, setAnswered] = useState<{ idx: number; option: string } | null>(null);

  useEffect(() => {
    async function loadLesson() {
      const today = getTodayKey();
      const dayRecord = await getDayRecord(today);

      if (!dayRecord) {
        navigate("/");
        return;
      }

      const grammarId = dayRecord.grammarId;
      const lessonData = grammarLessons.find(l => l.id === grammarId);

      if (!lessonData) {
        navigate("/");
        return;
      }

      setLesson(lessonData);

      // Get or create scheduler item for this grammar lesson
      const items = await getSchedulerItems();
      let item = items.find(i => i.type === "grammar" && i.itemId === grammarId);

      if (!item) {
        item = {
          itemId: grammarId,
          type: "grammar",
          introducedOn: today,
          box: 0,
          correct: 0,
          wrong: 0,
          streak: 0,
          lastSeen: today,
          nextDue: today,
          correctDays: [],
          correctTypes: [],
        };
        await saveSchedulerItem(item);
      }

      setSchedulerItem(item);
      setIsLoading(false);
    }

    loadLesson();
  }, [navigate]);

  const handleAnswer = async (itemIndex: number, selectedOption: string, expectedAnswer: string) => {
    if (!lesson || !schedulerItem) return;

    const isCorrect = selectedOption === expectedAnswer;
    const today = getTodayKey();
    setAnswered({ idx: itemIndex, option: selectedOption });

    if (isCorrect) {
      setFeedbackMessage("Correct!");
      setFeedbackType("correct");

      // Mark as correct and save
      const updated = markCorrect(schedulerItem, today, "grammar_practice");
      await saveSchedulerItem(updated);
      setSchedulerItem(updated);

      // Log answer
      await logAnswer({
        day: today,
        itemId: lesson.id,
        qType: "grammar_practice",
        correct: true,
        ts: Date.now(),
      });

      // Auto-advance after a short delay
      setTimeout(() => {
        setFeedbackMessage("");
        setFeedbackType("");
        setAnswered(null);
      }, 1500);
    } else {
      setFeedbackMessage("Not quite right. Try again!");
      setFeedbackType("wrong");

      // Mark as wrong and save
      const updated = markWrong(schedulerItem, today);
      await saveSchedulerItem(updated);
      setSchedulerItem(updated);

      // Log answer
      await logAnswer({
        day: today,
        itemId: lesson.id,
        qType: "grammar_practice",
        correct: false,
        ts: Date.now(),
      });

      // Auto-advance after delay
      setTimeout(() => {
        setFeedbackMessage("");
        setFeedbackType("");
        setAnswered(null);
      }, 1500);
    }
  };

  if (isLoading) {
    return <Loading label="Loading lesson…" />;
  }

  if (!lesson || !schedulerItem) {
    return (
      <Page>
        <PageTitle>Oops</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">Lesson not found.</p>
          <Button onClick={() => navigate("/")}>Back Home</Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageTitle>{lesson.title}</PageTitle>

      <Card>
        <div className="mb-6 rounded-2xl bg-secondary-light/60 px-5 py-4">
          <p className="text-base text-ink/90 leading-snug">{lesson.description}</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {lesson.examples.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => speak(example)}
              className="w-full flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4 text-left hover:bg-accent-light/40 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm">
                🔊
              </span>
              <span className="text-base text-ink/90 leading-snug">{example}</span>
            </button>
          ))}
        </div>

        {feedbackMessage && (
          <div className="mb-6">
            <FeedbackBanner tone={feedbackType === "correct" ? "correct" : "wrong"}>
              {feedbackMessage}
            </FeedbackBanner>
          </div>
        )}

        <div className="flex flex-col gap-5 mb-8">
          {lesson.practiceItems.map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-secondary-light/40 p-5">
              <p className="font-bold text-ink mb-3">{item.question}</p>
              {item.sentence && (
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-lg text-secondary-dark font-semibold italic">{item.sentence}</p>
                  <SpeakButton text={item.sentence} size="sm" />
                </div>
              )}
              {item.options && (
                <div className="space-y-2.5">
                  {item.options.map((option, i) => {
                    const expected = resolvePracticeAnswer(item);
                    const isThisAnswered = answered && answered.idx === idx;
                    const isSelected = isThisAnswered && answered.option === option;
                    const isCorrectOption = option === expected;
                    let stateClass =
                      "bg-white border-2 border-gray-200 text-ink hover:border-accent hover:bg-accent-light/30";
                    if (isThisAnswered) {
                      if (isSelected && isCorrectOption) {
                        stateClass = "bg-green-50 border-2 border-green-500 text-green-700";
                      } else if (isSelected && !isCorrectOption) {
                        stateClass = "bg-red-50 border-2 border-red-500 text-red-700";
                      } else if (isCorrectOption) {
                        stateClass = "bg-green-50 border-2 border-green-300 text-green-700";
                      } else {
                        stateClass = "bg-white border-2 border-gray-200 text-ink/50";
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(idx, option, expected)}
                        disabled={feedbackMessage !== ""}
                        className={`w-full min-h-[56px] p-4 text-left text-lg font-semibold rounded-2xl transition-colors disabled:cursor-not-allowed flex items-center gap-2 ${stateClass}`}
                      >
                        {isThisAnswered && isSelected && isCorrectOption && <span>✓</span>}
                        {isThisAnswered && isSelected && !isCorrectOption && <span>✗</span>}
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {item.sentence && !item.options && (
                <div className="flex flex-wrap gap-2">
                  {item.sentence.split(" ").map((token, i) => {
                    const cleaned = stripPunctuation(token);
                    const expected = resolvePracticeAnswer(item);
                    const isThisAnswered = answered && answered.idx === idx;
                    const isSelected = isThisAnswered && answered.option === cleaned;
                    const isCorrectToken = cleaned.toLowerCase() === expected.toLowerCase();
                    let stateClass =
                      "bg-white border-2 border-gray-200 text-ink hover:border-accent hover:bg-accent-light/30";
                    if (isThisAnswered) {
                      if (isSelected && isCorrectToken) {
                        stateClass = "bg-green-50 border-2 border-green-500 text-green-700";
                      } else if (isSelected && !isCorrectToken) {
                        stateClass = "bg-red-50 border-2 border-red-500 text-red-700";
                      } else if (isCorrectToken) {
                        stateClass = "bg-green-50 border-2 border-green-300 text-green-700";
                      } else {
                        stateClass = "bg-white border-2 border-gray-200 text-ink/50";
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(idx, cleaned, expected)}
                        disabled={feedbackMessage !== ""}
                        className={`px-4 py-2.5 text-lg font-semibold rounded-xl transition-colors disabled:cursor-not-allowed ${stateClass}`}
                      >
                        {token}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button onClick={() => navigate("/read")}>Continue to Reading</Button>
      </Card>
    </Page>
  );
}
