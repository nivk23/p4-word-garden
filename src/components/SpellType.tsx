import { useState } from "react";
import { validateSpelling } from "../lib/spelling";
import { speak } from "../lib/tts";
import type { Word } from "../content/words";

interface Props {
  word: Word;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function SpellType({ word, onCorrect, onWrong }: Props) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">();
  const [triesLeft, setTriesLeft] = useState(2);

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

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-purple-600">Listen and type the word</h2>

      <div className="text-lg text-gray-700 mb-4">
        {word.emoji} {word.word}
      </div>

      {/* Listen section */}
      <div className="bg-blue-50 border-2 border-blue-500 p-6 rounded-lg w-full max-w-md">
        <button
          onClick={() => speak(word.word)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-lg mb-4"
        >
          🔊 Hear Word (Normal)
        </button>

        <button
          onClick={() => {
            // Slow syllable-by-syllable (simulated)
            const syllables = (word.syllables || word.word).split("-");
            for (const syl of syllables) {
              setTimeout(() => speak(syl), 200);
            }
          }}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg text-lg"
        >
          🔊 Hear Word (Slow)
        </button>
      </div>

      {/* Example sentence */}
      {word.examples.length > 0 && (
        <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg w-full max-w-md">
          <p className="text-sm text-gray-600 mb-2">Example:</p>
          <p className="text-gray-800 italic mb-2">{word.examples[0]}</p>
          <button
            onClick={() => speak(word.examples[0])}
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            🔊 Hear example
          </button>
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Type the word"
        disabled={feedback !== ""}
        autoComplete="off"
        className="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg text-lg"
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
