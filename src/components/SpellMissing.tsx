import { useState } from "react";
import { generateSpellingMissing, validateSpelling, highlightTricky } from "../lib/spelling";
import type { Word } from "../content/words";
import { Button, Chip, SpeakButton, FeedbackBanner } from "./ui";

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
      <h2 className="text-xl sm:text-2xl font-bold text-secondary-dark text-center">
        Fill in the missing letters
      </h2>

      <div className="flex items-center gap-2 text-lg text-ink/70">
        <span className="text-3xl">{word.emoji}</span>
      </div>

      {word.spellingTip && <Chip tone="accent">✏️ {word.spellingTip}</Chip>}

      {/* Syllables with tricky highlighted */}
      <div className="text-center">
        <p className="text-sm text-ink/50 mb-2">Sound it out</p>
        <p className="text-2xl font-bold text-ink">{word.syllables || word.word}</p>
        <div className="text-sm text-accent-dark font-semibold mt-2">Tricky: {highlighted}</div>
      </div>

      {/* Missing letter template */}
      <div className="bg-secondary-light rounded-2xl p-4 text-center w-full">
        <p className="text-sm text-ink/50 mb-2">Type the missing letters</p>
        <p className="text-2xl font-mono font-bold text-secondary-dark tracking-widest">
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg font-mono min-h-[56px] focus:outline-none focus:border-accent"
      />

      {/* Feedback */}
      {feedback === "correct" && <FeedbackBanner tone="correct">Correct!</FeedbackBanner>}
      {feedback === "wrong" && (
        <div className="w-full flex items-center gap-3">
          <div className="flex-1">
            <FeedbackBanner tone="wrong">{`Not quite. Try again! (${triesLeft} left)`}</FeedbackBanner>
          </div>
          <SpeakButton text={word.word} size="sm" />
        </div>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={!answer || feedback !== ""}>
        Check
      </Button>
    </div>
  );
}
