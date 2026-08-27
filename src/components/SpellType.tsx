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

const MAX_ATTEMPTS = 3; // first try + up to 2 retries

export default function SpellType({ word, onCorrect, onWrong }: Props) {
  const [answer, setAnswer] = useState("");
  // Was `useState<"" | "correct" | "wrong">()` with no initial value, so
  // this started as `undefined` — and `disabled={feedback !== ""}` below
  // then evaluated `undefined !== ""` as true, disabling the input before
  // any interaction at all (same bug as SpellMissing.tsx).
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);

  const handleSubmit = () => {
    if (validateSpelling(answer, word.word)) {
      setFeedback("correct");
      setTimeout(onCorrect, 1000);
      return;
    }

    setFeedback("wrong");
    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    if (remaining <= 0) {
      setTimeout(() => onWrong(), 2200);
    } else {
      setTimeout(() => {
        setAnswer("");
        setFeedback("");
      }, 1500);
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
        <FeedbackBanner tone="wrong">
          {attemptsLeft > 0
            ? `Not quite. Try again! (${attemptsLeft} left)`
            : `Not quite. The word is "${word.word}".`}
        </FeedbackBanner>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={!answer || feedback !== ""}>
        Check
      </Button>
    </div>
  );
}
