import { useNavigate } from "react-router-dom";
import { passages } from "../content/passages";
import { getDayRecord } from "../store/progress";
import { getTodayKey, getYesterdayKey } from "../lib/dates";
import { speak } from "../lib/tts";
import { useState, useEffect } from "react";
import type { Passage } from "../content/passages";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading passage...</p>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-4xl font-bold text-blue-600">Oops</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <p className="text-lg text-gray-700 mb-4">No passage found.</p>
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
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8">
      <h1 className="text-4xl font-bold text-blue-600">Mini Reading</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-500">
          <p className="text-xl text-gray-800 leading-relaxed mb-4">{passage.text}</p>
          <button
            onClick={() => speak(passage.text)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            🔊 Read Aloud
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">Question {selectedQuestion + 1}:</h2>
          <p className="text-xl font-semibold text-gray-800 mb-6">{question.question}</p>

          {wrongAnswer && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-2 border-red-500 text-center font-semibold">
              ✗ {wrongAnswerText}
            </div>
          )}

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 text-left text-lg font-semibold rounded-lg border-2 transition-all ${
                  wrongAnswer && idx === question.correctAnswer
                    ? "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-400"
                    : wrongAnswer && idx !== question.correctAnswer
                    ? "bg-white border-gray-300 text-gray-800"
                    : "bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {selectedQuestion < passage.questions.length - 1 && !wrongAnswer && (
          <p className="text-sm text-gray-600 text-center">
            {selectedQuestion + 1} of {passage.questions.length} questions answered
          </p>
        )}

        {selectedQuestion === passage.questions.length - 1 && !wrongAnswer && (
          <button
            onClick={() => navigate("/quiz")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg"
          >
            Start Quiz
          </button>
        )}
      </div>
    </div>
  );
}
