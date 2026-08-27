import { useState, useRef, useEffect } from "react";
import { speak, cancelPendingTimeouts, speakAfter } from "../lib/tts";
import { isSupported, startListening, matchesWord, homophones, describeSpeechError } from "../lib/speech";
import type { Word } from "../content/words";
import { Button, FeedbackBanner } from "./ui";

interface Props {
  word: Word;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function SayIt({ word, onCorrect, onWrong }: Props) {
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "correct" | "wrong">("idle");
  const [transcript, setTranscript] = useState("");
  const [triesLeft, setTriesLeft] = useState(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setErrorMessage(null);

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
        // Include the raw code — "not-allowed" (mic permission) and
        // "service-not-allowed" (the recognition service itself refused,
        // e.g. unreachable) look identical to a parent otherwise, but need
        // different fixes.
        setErrorMessage(`${describeSpeechError(error)} (${error})`);
      }
    );
  };

  const checkAnswer = (text: string) => {
    setStatus("processing");
    setErrorMessage(null);
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
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-dark">Say It</h2>
        <div className="bg-gray-50 rounded-2xl p-6 text-center text-ink/70">
          <p className="mb-2">Speech recognition is not supported in your browser.</p>
          <p className="text-sm text-ink/50">
            This works in Chrome, Edge, and Safari with microphone permission.
          </p>
          <div className="mt-4">
            <Button variant="secondary" full={false} onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl sm:text-2xl font-bold text-secondary-dark text-center">Say It</h2>

      <div className="flex items-center gap-2 text-lg text-ink/70">
        <span className="text-3xl">{word.emoji}</span>
        <span className="font-display font-semibold text-2xl text-secondary-dark">{word.word}</span>
      </div>

      {/* Model pronunciation */}
      <div className="bg-secondary-light rounded-2xl p-6 w-full flex flex-col gap-3">
        <Button variant="secondary" onClick={() => speak(word.word)}>
          🔊 Hear model (normal)
        </Button>

        <Button
          variant="secondary"
          className="opacity-90"
          onClick={() => {
            cancelPendingTimeouts();
            const syllables = (word.syllables || word.word).split("-");
            for (let i = 0; i < syllables.length; i++) {
              speakAfter(syllables[i], i * 400);
            }
          }}
        >
          🔊 Hear model (slow — each syllable)
        </Button>
      </div>

      {/* Microphone / Recognition */}
      <div className="bg-accent-light/60 rounded-2xl p-6 w-full text-center flex flex-col items-center gap-4">
        <p className="text-sm font-bold text-accent-dark">Now you try</p>

        {status === "idle" || status === "listening" || status === "processing" ? (
          <button
            onClick={handleStartListening}
            disabled={status === "listening" || status === "processing"}
            className={`w-full min-h-[56px] py-4 px-6 rounded-2xl text-lg font-bold text-white transition-colors ${
              status === "listening" || status === "processing"
                ? "bg-red-500"
                : "bg-accent hover:bg-accent-dark"
            }`}
          >
            {status === "listening" ? "🎤 Listening…" : status === "processing" ? "Processing…" : "🎤 Tap to record"}
          </button>
        ) : null}

        {transcript && (
          <div className="w-full p-3 bg-white rounded-xl">
            <p className="text-sm text-ink/50">You said</p>
            <p className="text-lg font-semibold text-ink italic">"{transcript}"</p>
          </div>
        )}

        {status === "correct" && <FeedbackBanner tone="correct">Correct!</FeedbackBanner>}

        {status === "wrong" && (
          <FeedbackBanner tone="wrong">{`Not quite. Try again! (${triesLeft} left)`}</FeedbackBanner>
        )}

        {status === "idle" && errorMessage && (
          <FeedbackBanner tone="wrong">{errorMessage}</FeedbackBanner>
        )}
      </div>

      {/* Skip button */}
      <Button variant="ghost" full={false} onClick={handleSkip}>
        Skip (practice later)
      </Button>

      <p className="text-xs text-ink/40 text-center">
        Tip: Speak clearly and naturally. The app matches words with some flexibility for accents.
      </p>
    </div>
  );
}
