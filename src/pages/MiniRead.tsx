import { useNavigate } from "react-router-dom";
import { passages } from "../content/passages";
import { getDayRecord } from "../store/progress";
import { getTodayKey, getYesterdayKey } from "../lib/dates";
import { speak } from "../lib/tts";
import { useState, useEffect } from "react";
import type { Passage } from "../content/passages";
import { Page, PageTitle, Loading, Card, Button, ProgressDots, SpeakButton, FeedbackBanner } from "../components/ui";

export default function MiniRead() {
  const navigate = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wrongAnswerText, setWrongAnswerText] = useState("");

  useEffect(() => {
    async function selectPassage() {
      const today = getTodayKey();
      const yesterday = getYesterdayKey();

      const todayRecord = await getDayRecord(today);
      const yesterdayRecord = await getDayRecord(yesterday);

      const targetWordIds = new Set<string>();

      if (todayRecord) {
        todayRecord.wordIds.forEach(w => targetWordIds.add(w));
      }
      if (yesterdayRecord) {
        yesterdayRecord.wordIds.forEach(w => targetWordIds.add(w));
      }

      // Find passage with at least one target word
      let selectedPassage = passages.find(p =>
        p.targetWords.some(w => targetWordIds.has(w))
      );

      // Fallback: pick a passage that hasn't been used recently
      if (!selectedPassage) {
        selectedPassage = passages[Math.floor(Math.random() * passages.length)];
      }

      setPassage(selectedPassage || passages[0]);
      setIsLoading(false);
    }

    selectPassage();
  }, []);

  if (isLoading) {
    return <Loading label="Loading passage…" />;
  }

  if (!passage) {
    return (
      <Page>
        <PageTitle>Oops</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">No passage found.</p>
          <Button onClick={() => navigate("/")}>Back Home</Button>
        </Card>
      </Page>
    );
  }

  const question = passage.questions[selectedQuestion];

  const handleAnswer = (idx: number) => {
    if (idx === question.correctAnswer) {
      // Correct answer
      setWrongAnswer(false);
      setWrongAnswerText("");
      if (selectedQuestion < passage.questions.length - 1) {
        setSelectedQuestion(selectedQuestion + 1);
      } else {
        navigate("/quiz");
      }
    } else {
      // Wrong answer - show feedback but keep buttons enabled for retry
      setWrongAnswer(true);
      setWrongAnswerText("Listen to the relevant part...");

      // Re-read the passage aloud to help the child find the answer
      setTimeout(() => {
        speak(passage.text);
        setWrongAnswerText("Try again!");
      }, 500);
    }
  };

  return (
    <Page>
      <PageTitle>Mini Reading</PageTitle>
      <ProgressDots total={passage.questions.length} current={selectedQuestion} />

      <Card>
        <div className="mb-8 rounded-2xl bg-secondary-light p-6">
          <p className="text-xl leading-relaxed text-ink font-semibold mb-4">{passage.text}</p>
          <SpeakButton text={passage.text} label="Read aloud" size="md" />
        </div>

        <div className="mb-6">
          <p className="text-2xl font-bold text-secondary-dark mb-6">{question.question}</p>

          {wrongAnswer && (
            <div className="mb-6">
              <FeedbackBanner tone="wrong">{wrongAnswerText}</FeedbackBanner>
            </div>
          )}

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const showAsCorrect = wrongAnswer && idx === question.correctAnswer;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full min-h-[56px] p-4 text-left text-lg font-semibold rounded-2xl border-2 transition-colors ${
                    showAsCorrect
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-white border-gray-200 text-ink hover:border-accent hover:bg-accent-light/30"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selectedQuestion === passage.questions.length - 1 && !wrongAnswer && (
            <div className="flex justify-center mt-6">
              <Button variant="ghost" full={false} onClick={() => navigate("/quiz")}>
                Skip to quiz →
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}
