import { useState, useEffect } from "react";
import { generateSpellingTiles } from "../lib/spelling";
import type { Word } from "../content/words";
import { Button, SpeakButton, FeedbackBanner } from "./ui";

interface Props {
  word: Word;
  onCorrect: () => void;
  onWrong: () => void;
}

const MAX_ATTEMPTS = 3; // first try + up to 2 retries

export default function SpellTiles({ word, onCorrect, onWrong }: Props) {
  const [tiles, setTiles] = useState<string[]>([]);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);

  // Reset all state whenever the word changes, so leftover tiles/feedback
  // from the previous word never bleed into the next one.
  useEffect(() => {
    const generated = generateSpellingTiles(word);
    setTiles(generated.tiles);
    setCorrectOrder(generated.correctOrder);
    setSelected([]);
    setAvailable(generated.tiles);
    setFeedback("");
    setAttemptsLeft(MAX_ATTEMPTS);
  }, [word.word]);

  const handleTapTile = (tile: string, idx: number) => {
    if (feedback) return;
    const newAvailable = available.filter((_, i) => i !== idx);
    const newSelected = [...selected, tile];
    setAvailable(newAvailable);
    setSelected(newSelected);
  };

  const handleUndo = () => {
    if (feedback || selected.length === 0) return;
    const last = selected[selected.length - 1];
    setSelected(selected.slice(0, -1));
    setAvailable([...available, last]);
  };

  const handleClear = () => {
    if (feedback) return;
    setSelected([]);
    setAvailable(tiles);
  };

  const readyToCheck = selected.length > 0;

  const handleCheck = () => {
    if (!readyToCheck) return;

    const isCorrect = selected.join("").toLowerCase() === correctOrder.join("").toLowerCase();
    if (isCorrect) {
      setFeedback("correct");
      setTimeout(onCorrect, 800);
      return;
    }

    setFeedback("wrong");
    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    if (remaining <= 0) {
      setTimeout(onWrong, 2200);
    } else {
      setTimeout(() => {
        setSelected([]);
        setAvailable(tiles);
        setFeedback("");
      }, 2000);
    }
  };

  const handleGiveUp = () => {
    onWrong();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl sm:text-2xl font-bold text-secondary-dark text-center">
        Tap the letters in order
      </h2>

      <div className="flex items-center gap-2 text-lg text-ink/70">
        <span className="text-3xl">{word.emoji}</span>
        <SpeakButton text={word.word} size="sm" />
      </div>

      {/* Selected so far */}
      <div className="bg-secondary-light rounded-2xl p-6 min-h-16 w-full">
        <p className="text-ink/50 text-sm mb-2">Your spelling</p>
        <p className="font-display text-3xl font-semibold tracking-widest text-secondary-dark">
          {selected.length === 0 ? "_".repeat(correctOrder.length) : selected.join("")}
        </p>
      </div>

      {/* Available tiles */}
      <div className="flex flex-wrap gap-3 justify-center">
        {available.map((tile, idx) => (
          <button
            key={idx}
            data-testid="tile"
            onClick={() => handleTapTile(tile, idx)}
            disabled={!!feedback}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-accent hover:bg-accent-dark active:scale-95 transition-transform text-white text-2xl font-bold rounded-2xl disabled:opacity-50"
          >
            {tile.toUpperCase()}
          </button>
        ))}
      </div>

      {feedback === "correct" && <FeedbackBanner tone="correct">Correct!</FeedbackBanner>}
      {feedback === "wrong" && (
        <FeedbackBanner tone="wrong">
          {attemptsLeft > 0
            ? `Not quite. Try again! (${attemptsLeft} left)`
            : `Not quite. The word is "${word.word}".`}
        </FeedbackBanner>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        <Button variant="ghost" full={false} onClick={handleUndo} disabled={selected.length === 0 || !!feedback}>
          ← Undo
        </Button>
        <Button variant="ghost" full={false} onClick={handleClear} disabled={selected.length === 0 || !!feedback}>
          Clear
        </Button>
        <Button
          variant="ghost"
          full={false}
          onClick={handleGiveUp}
          disabled={!!feedback}
          className="ml-auto text-red-500 hover:text-red-600"
        >
          Give up
        </Button>
      </div>

      <Button onClick={handleCheck} disabled={!readyToCheck || !!feedback}>
        Check
      </Button>
    </div>
  );
}
