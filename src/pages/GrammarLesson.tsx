import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { grammarLessons } from "../content/grammar";
import { getDayRecord, getSchedulerItems, saveSchedulerItem, logAnswer } from "../store/progress";
import { getTodayKey } from "../lib/dates";
import { speak } from "../lib/tts";
import { markCorrect, markWrong } from "../lib/scheduler";
import type { SchedulerItem } from "../lib/scheduler";

export default function GrammarLesson() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<typeof grammarLessons[0] | null>(null);
  const [schedulerItem, setSchedulerItem] = useState<SchedulerItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | "">("");

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

  const handleAnswer = async (_itemIndex: number, selectedOption: string, correctAnswer: string | number) => {
    if (!lesson || !schedulerItem) return;

    const isCorrect = selectedOption === String(correctAnswer);
    const today = getTodayKey();

    if (isCorrect) {
      setFeedbackMessage("✓ Correct!");
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
      }, 1500);
    } else {
      setFeedbackMessage("✗ Not quite right. Try again!");
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
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson || !schedulerItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">Oops</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-lg text-gray-700 mb-4">Lesson not found.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8">
      <h1 className="text-4xl font-bold text-blue-600">Grammar Lesson</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-purple-600 mb-4">{lesson.title}</h2>

        <p className="text-lg text-gray-700 mb-6 bg-blue-50 p-4 rounded-lg">
          {lesson.description}
        </p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Examples:</h3>
          {lesson.examples.map((example, idx) => (
            <div key={idx} className="mb-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-800 mb-2">{example}</p>
              <button
                onClick={() => speak(example)}
                className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                🔊
              </button>
            </div>
          ))}
        </div>

        {feedbackMessage && (
          <div className={`mb-6 p-4 rounded-lg text-center text-lg font-bold ${
            feedbackType === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {feedbackMessage}
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Practice:</h3>
          {lesson.practiceItems.map((item, idx) => (
            <div key={idx} className="mb-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="font-semibold text-gray-800 mb-3">{item.question}</p>
              {item.sentence && (
                <p className="text-lg text-blue-700 mb-3 font-semibold italic">
                  {item.sentence}
                  <button
                    onClick={() => speak(item.sentence || "")}
                    className="ml-2 text-orange-500"
                  >
                    🔊
                  </button>
                </p>
              )}
              {item.options && (
                <div className="space-y-2">
                  {item.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(idx, option, item.correctAnswer)}
                      disabled={feedbackMessage !== ""}
                      className="w-full p-3 text-left bg-white border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/read")}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg"
        >
          Continue to Reading
        </button>
      </div>
    </div>
  );
}
