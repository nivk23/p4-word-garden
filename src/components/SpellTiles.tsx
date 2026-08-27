import { useState } from "react";
import { generateSpellingTiles } from "../lib/spelling";
import type { Word } from "../content/words";

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
      <h2 className="text-2xl font-bold text-purple-600">Tap the letters in order</h2>

      <div className="text-lg text-gray-700 mb-4">Word: {word.emoji} {word.word}</div>

      {/* Selected so far */}
      <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 min-h-16 w-full max-w-md">
        <p className="text-gray-600 text-sm mb-2">Your spelling:</p>
        <p className="text-3xl font-bold tracking-widest text-green-700">
          {selected.length === 0 ? "_".repeat(correctOrder.length) : selected.join("")}
        </p>
      </div>

      {/* Available tiles */}
      <div className="flex flex-wrap gap-3 justify-center">
        {available.map((tile, idx) => (
          <button
            key={idx}
            onClick={() => handleTapTile(tile, idx)}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-lg"
          >
            {tile.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleUndo}
          disabled={selected.length === 0}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          ← Undo
        </button>
        <button
          onClick={handleClear}
          disabled={selected.length === 0}
          className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          Clear
        </button>
        <button
          onClick={handleGiveUp}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Give Up
        </button>
      </div>
    </div>
  );
}
