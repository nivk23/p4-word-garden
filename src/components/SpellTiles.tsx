import { useState } from "react";
import { generateSpellingTiles } from "../lib/spelling";
import type { Word } from "../content/words";
import { Button, SpeakButton } from "./ui";

interface Props {
  word: Word;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function SpellTiles({ word, onCorrect, onWrong }: Props) {
  const { tiles, correctOrder } = generateSpellingTiles(word);
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(tiles);

  const handleTapTile = (tile: string, idx: number) => {
    const newAvailable = available.filter((_, i) => i !== idx);
    const newSelected = [...selected, tile];
    setAvailable(newAvailable);
    setSelected(newSelected);

    if (newSelected.join("").toLowerCase() === correctOrder.join("").toLowerCase()) {
      setTimeout(onCorrect, 500);
    }
  };

  const handleUndo = () => {
    if (selected.length > 0) {
      const last = selected[selected.length - 1];
      setSelected(selected.slice(0, -1));
      setAvailable([...available, last]);
    }
  };

  const handleClear = () => {
    setSelected([]);
    setAvailable(tiles);
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
        <p className="text-3xl font-extrabold tracking-widest text-secondary-dark">
          {selected.length === 0 ? "_".repeat(correctOrder.length) : selected.join("")}
        </p>
      </div>

      {/* Available tiles */}
      <div className="flex flex-wrap gap-3 justify-center">
        {available.map((tile, idx) => (
          <button
            key={idx}
            onClick={() => handleTapTile(tile, idx)}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-accent hover:bg-accent-dark active:scale-95 transition-transform text-white text-2xl font-bold rounded-2xl"
          >
            {tile.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full">
        <Button variant="ghost" full={false} onClick={handleUndo} disabled={selected.length === 0}>
          ← Undo
        </Button>
        <Button variant="ghost" full={false} onClick={handleClear} disabled={selected.length === 0}>
          Clear
        </Button>
        <Button variant="ghost" full={false} onClick={handleGiveUp} className="ml-auto text-red-500 hover:text-red-600">
          Give up
        </Button>
      </div>
    </div>
  );
}
