import { useState, useRef, useEffect } from "react";
import { speak, cancelPendingTimeouts, speakAfter } from "../lib/tts";
import { isSupported, startListening, matchesWord, homophones } from "../lib/speech";
import type { Word } from "../content/words";

interface Props {
  word: Word;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function SayIt({ word, onCorrect, onWrong }: Props) {
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "correct" | "wrong">("idle");
  const [transcript, setTranscript] = useState("");
  const [triesLeft, setTriesLeft] = useState(3);
  const stopListeningRef = useRef<() => void>(() => {});
  const supported = isSupported();

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    return () => {
      cancelPendingTimeouts();
    };
  }, []);

  const handleStartListening = () => {
    if (!supported) {
      setStatus("wrong");
      return;
    }

    setStatus("listening");
    setTranscript("");

    stopListeningRef.current = startListening(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          checkAnswer(text);
        }
      },
      (error) => {
        console.error("Speech error:", error);
        setStatus("idle");
      }
    );
  };

  const checkAnswer = (text: string) => {
    setStatus("processing");
    const isCorrect = matchesWord(text, word.word, homophones);

    if (isCorrect) {
      setStatus("correct");
      setTimeout(onCorrect, 1500);
    } else {
      setStatus("wrong");
      setTriesLeft(triesLeft - 1);
      if (triesLeft <= 1) {
        setTimeout(() => onWrong(), 2000);
      } else {
        setTimeout(() => {
          setStatus("idle");
          setTranscript("");
        }, 1500);
      }
    }
  };

  const handleSkip = () => {
    onWrong();
  };

  if (!supported) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="text-2xl font-bold text-purple-600">Say It</h2>
        <div className="bg-gray-100 border-2 border-gray-400 p-6 rounded-lg text-center text-gray-700">
          <p className="mb-2">Speech recognition is not supported in your browser.</p>
          <p className="text-sm text-gray-600">
            This works in Chrome, Edge, and Safari with microphone permission.
          </p>
          <button
            onClick={handleSkip}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-purple-600">Say It</h2>

      <div className="text-lg text-gray-700 mb-4">
        {word.emoji} {word.word}
      </div>

      {/* Model pronunciation */}
      <div className="bg-blue-50 border-2 border-blue-500 p-6 rounded-lg w-full max-w-md">
        <button
          onClick={() => speak(word.word)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-lg mb-4"
        >
          🔊 Hear Model (Normal)
        </button>

        <button
          onClick={() => {
            cancelPendingTimeouts();
            const syllables = (word.syllables || word.word).split("-");
            for (let i = 0; i < syllables.length; i++) {
              speakAfter(syllables[i], i * 400);
            }
          }}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg text-lg"
        >
          🔊 Hear Model (Slow - each syllable)
        </button>
      </div>

      {/* Microphone / Recognition */}
      <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg w-full max-w-md text-center">
        <p className="text-sm font-semibold text-green-700 mb-3">Now you try:</p>

        {status === "idle" || status === "listening" || status === "processing" ? (
          <button
            onClick={handleStartListening}
            disabled={status === "listening" || status === "processing"}
            className={`w-full py-4 px-6 rounded-lg text-lg font-bold text-white ${
              status === "listening" || status === "processing"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {status === "listening" ? "🎤 Listening..." : status === "processing" ? "Processing..." : "🎤 Tap to Record"}
          </button>
        ) : null}

        {transcript && (
          <div className="mt-4 p-3 bg-white border border-green-300 rounded">
            <p className="text-sm text-gray-600">You said:</p>
            <p className="text-lg font-semibold text-gray-800 italic">"{transcript}"</p>
          </div>
        )}

        {status === "correct" && (
          <div className="mt-4 p-3 bg-green-200 border-2 border-green-600 rounded">
            <p className="text-lg font-bold text-green-700">✓ Correct!</p>
          </div>
        )}

        {status === "wrong" && (
          <div className="mt-4 p-3 bg-red-200 border-2 border-red-600 rounded">
            <p className="text-lg font-bold text-red-700">✗ Not quite. Try again! ({triesLeft} left)</p>
          </div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded text-lg"
      >
        Skip (Practice Later)
      </button>

      <p className="text-xs text-gray-500 text-center max-w-md">
        Tip: Speak clearly and naturally. The app matches words with some flexibility for accents.
      </p>
    </div>
  );
}
