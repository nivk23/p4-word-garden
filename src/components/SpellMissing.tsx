import { useState } from "react";
import { generateSpellingMissing, validateSpelling, highlightTricky } from "../lib/spelling";
import { speak } from "../lib/tts";
import type { Word } from "../content/words";

interface Props {
  word: Word;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function SpellMissing({ word, onCorrect, onWrong }: Props) {
  const spelling = generateSpellingMissing(word);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">();
  const [triesLeft, setTriesLeft] = useState(3);

  const handleSubmit = () => {
    if (validateSpelling(answer, word.word)) {
      setFeedback("correct");
      setTimeout(onCorrect, 1000);
    } else {
      setFeedback("wrong");
      setTriesLeft(triesLeft - 1);
      if (triesLeft <= 1) {
        setTimeout(() => onWrong(), 2000);
      } else {
        setTimeout(() => {
          setAnswer("");
          setFeedback("");
        }, 1500);
      }
    }
  };

  const { highlighted } = highlightTricky(word.syllables || word.word, spelling.tricky);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-purple-600">Fill in the missing letters</h2>

      <div className="text-lg text-gray-700">
        {word.emoji} {word.word}
      </div>

      {/* Spelling tip */}
      {word.spellingTip && (
        <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded-lg">
          <p className="text-sm font-semibold text-blue-700">Tip:</p>
          <p className="text-blue-700">{word.spellingTip}</p>
        </div>
      )}

      {/* Syllables with tricky highlighted */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Sound it out:</p>
        <p className="text-2xl font-bold text-gray-800">
          {word.syllables || word.word}
        </p>
        <div className="text-sm text-red-600 mt-2">Tricky: {highlighted}</div>
      </div>

      {/* Missing letter template */}
      <div className="bg-yellow-50 border-2 border-yellow-500 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600 mb-2">Type the missing:</p>
        <p className="text-2xl font-mono font-bold text-yellow-700 tracking-widest">
          {spelling.blanked}
        </p>
      </div>

      {/* Input */}
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Type the missing letters"
        disabled={feedback !== ""}
        className="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-mono"
      />

      {/* Feedback */}
      {feedback === "correct" && (
        <div className="bg-green-100 border-2 border-green-500 p-4 rounded-lg text-green-700 font-bold">
          ✓ Correct!
        </div>
      )}
      {feedback === "wrong" && (
        <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg text-red-700 font-bold">
          ✗ Wrong. Try again! ({triesLeft} left)
          <button
            onClick={() => speak(word.word)}
            className="ml-2 text-orange-500 hover:text-orange-600"
          >
            🔊
          </button>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!answer || feedback !== ""}
        className="w-full max-w-md bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-lg"
      >
        Check
      </button>
    </div>
  );
}
