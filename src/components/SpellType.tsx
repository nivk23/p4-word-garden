import { useState } from "react";
import { validateSpelling } from "../lib/spelling";
import { speak } from "../lib/tts";
import type { Word } from "../content/words";
import { Button, FeedbackBanner } from "./ui";

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
      <h2 className="text-xl sm:text-2xl font-bold text-secondary-dark text-center">
        Listen and type the word
      </h2>

      <div className="text-3xl">{word.emoji}</div>

      {/* Listen section */}
      <div className="bg-secondary-light rounded-2xl p-6 w-full flex flex-col gap-3">
        <Button variant="secondary" onClick={() => speak(word.word)}>
          🔊 Hear word (normal)
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            // Slow syllable-by-syllable (simulated)
            const syllables = (word.syllables || word.word).split("-");
            for (const syl of syllables) {
              setTimeout(() => speak(syl), 200);
            }
          }}
          className="opacity-90"
        >
          🔊 Hear word (slow)
        </Button>
      </div>

      {/* Example sentence */}
      {word.examples.length > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full">
          <p className="text-sm text-ink/50 mb-2">Example</p>
          <p className="text-ink/90 italic mb-3">{word.examples[0]}</p>
          <button
            onClick={() => speak(word.examples[0])}
            className="text-accent-dark font-semibold text-sm"
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] focus:outline-none focus:border-accent"
      />

      {/* Feedback */}
      {feedback === "correct" && <FeedbackBanner tone="correct">Correct!</FeedbackBanner>}
      {feedback === "wrong" && (
        <FeedbackBanner tone="wrong">{`Not quite. Try again! (${triesLeft} left)`}</FeedbackBanner>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={!answer || feedback !== ""}>
        Check
      </Button>
    </div>
  );
}
