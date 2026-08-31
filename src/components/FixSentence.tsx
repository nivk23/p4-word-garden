import { useState } from "react";
import type { EditingItem } from "../content/grammarPractice";
import { Card, FeedbackBanner, SpeakButton } from "./ui";

/**
 * One exam-format editing item: find the wrong word in the sentence, then
 * choose the correction.
 *
 * Tapping a *word* first (rather than jumping straight to the choices) is the
 * skill her paper actually tests — spotting that something is wrong is the hard
 * part, and multiple choice alone lets her skip it. A wrong tap costs nothing
 * but a nudge; after two, the word is pointed out so she still gets to practise
 * the correction.
 */
export default function FixSentence({
  item,
  onAnswered,
}: {
  item: EditingItem;
  onAnswered: (correct: boolean) => void;
}) {
  const [foundWord, setFoundWord] = useState(false);
  const [taps, setTaps] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [nudge, setNudge] = useState("");

  const words = item.sentence.split(" ");
  const strip = (w: string) => w.replace(/[.,!?;:]+$/, "");
  const revealed = taps >= 2;

  const tapWord = (word: string) => {
    if (foundWord) return;
    if (strip(word) === strip(item.wrong)) {
      setFoundWord(true);
      setNudge("");
      return;
    }
    const next = taps + 1;
    setTaps(next);
    setNudge(
      next >= 2
        ? `Not that one. The word that is wrong is "${item.wrong}" — now pick what it should be.`
        : "That word is fine. Look again for the one that is wrong."
    );
    if (next >= 2) setFoundWord(true);
  };

  const choose = (option: string) => {
    if (chosen) return;
    setChosen(option);
    // Finding the word unaided and then correcting it is what counts as correct.
    onAnswered(option === item.correct && !revealed);
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          {foundWord ? "Now choose the right word" : "Tap the word that is wrong"}
        </p>
        <SpeakButton text={item.sentence} size="sm" />
      </div>

      <p className="text-2xl leading-relaxed mb-4">
        {words.map((word, i) => {
          const isWrong = strip(word) === strip(item.wrong);
          return (
            <button
              key={i}
              type="button"
              onClick={() => tapWord(word)}
              disabled={foundWord}
              className={`inline-block mr-2 mb-2 rounded-xl px-2 py-1 transition-colors ${
                foundWord && isWrong
                  ? "bg-red-100 text-red-700 line-through decoration-2"
                  : foundWord
                  ? "text-ink/70"
                  : "hover:bg-secondary-light active:bg-secondary-light"
              }`}
            >
              {word}
            </button>
          );
        })}
      </p>

      {nudge && !chosen && (
        <p className="text-base text-ink/70 mb-4">{nudge}</p>
      )}

      {foundWord && (
        <div className="space-y-3">
          {item.options.map((option) => {
            const isRight = option === item.correct;
            const picked = chosen === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                disabled={!!chosen}
                className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition-colors ${
                  chosen && isRight
                    ? "border-green-500 bg-green-50 text-green-800"
                    : picked
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-secondary/20 bg-white"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {chosen && (
        <div className="mt-5 space-y-4">
          <FeedbackBanner tone={chosen === item.correct && !revealed ? "correct" : "wrong"}>
            {chosen === item.correct
              ? revealed
                ? "Right correction — next time try to spot the word too."
                : "Correct!"
              : `It should be "${item.correct}".`}
          </FeedbackBanner>
          <div className="flex items-start gap-3 rounded-2xl bg-secondary-light/60 px-5 py-4">
            <span aria-hidden="true" className="text-xl">💡</span>
            <p className="text-lg text-ink/80">{item.why}</p>
            <SpeakButton text={item.why} size="sm" />
          </div>
        </div>
      )}
    </Card>
  );
}
