import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { speak } from "../lib/tts";

/**
 * Shared visual system for P4 Word Garden — a child's garden journal, not a
 * generic dashboard. Two signature moves carry the whole app:
 *   1. Cards are seed packets: warm paper, a dashed "perforated" edge, a
 *      soil-toned shadow (not the default flat grey card shadow).
 *   2. Buttons are chunky plant-stake tabs: a solid colour slab shadow you
 *      visibly press down on tap, instead of a soft box-shadow.
 * Everything else (chips, banners, dots) stays quiet and just inherits the
 * rust/moss palette. Feedback colours (green/red) are reserved for
 * correct/wrong states only, never decoration.
 */

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Page({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center px-4 py-6 sm:py-10 ${className}`}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-5">
        {children}
      </div>
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-secondary-dark text-center tracking-tight">
      {children}
    </h1>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <Page>
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-xl font-semibold text-ink/60">{label}</p>
      </div>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card({
  children,
  className = "",
  as: Tag = "div",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
}) {
  const base = `relative bg-cream border-2 border-dashed border-secondary/25 rounded-[28px] shadow-[0_10px_0_-4px_rgba(107,66,41,0.18),0_14px_28px_-10px_rgba(107,66,41,0.35)] w-full p-6 sm:p-8 ${className}`;
  const flourish = (
    <span
      aria-hidden="true"
      className="absolute -top-3 -right-2 text-2xl rotate-12 select-none pointer-events-none"
    >
      🌿
    </span>
  );
  if (Tag === "button") {
    return (
      <button type="button" onClick={onClick} className={`${base} text-left`}>
        {flourish}
        {children}
      </button>
    );
  }
  return (
    <div className={base}>
      {flourish}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chip — small subtle callout, not a big bordered box
// ---------------------------------------------------------------------------

export function Chip({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "secondary";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-gray-100 text-gray-700",
    accent: "bg-accent-light text-accent-dark",
    secondary: "bg-secondary-light text-secondary-dark",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-sm font-semibold text-center ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  full?: boolean;
}

export function Button({
  variant = "primary",
  full = true,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  // Plant-stake tab: a solid colour slab sits under the button; pressing it
  // pushes the button down into the slab, like pressing a tab into soil.
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none";
  const variantClass: Record<ButtonVariant, string> = {
    primary:
      "bg-accent text-white shadow-[0_4px_0_0_var(--color-accent-dark)] active:translate-y-1 active:shadow-none text-lg px-6 py-4 min-h-[56px]",
    secondary:
      "bg-secondary text-white shadow-[0_4px_0_0_var(--color-secondary-dark)] active:translate-y-1 active:shadow-none text-lg px-6 py-4 min-h-[56px]",
    ghost:
      "bg-transparent text-secondary-dark underline decoration-2 underline-offset-4 hover:text-secondary text-base px-3 py-2 min-h-[44px]",
    danger:
      "bg-white text-red-600 border-2 border-red-200 shadow-[0_4px_0_0_var(--color-red-200)] active:translate-y-1 active:shadow-none text-base px-5 py-3 min-h-[48px]",
  };
  return (
    <button
      className={`${base} ${variantClass[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// SpeakButton — always a user-gesture click, never auto-fires
// ---------------------------------------------------------------------------

export function SpeakButton({
  text,
  label = "Listen",
  size = "md",
  className = "",
  stopPropagation = true,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  stopPropagation?: boolean;
}) {
  const sizeClass = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  }[size];

  // If speech never actually starts (no working voice on this device — seen
  // on some Android phones with a non-Google TTS engine), show a clear "no
  // sound" signal instead of the button silently doing nothing.
  const [failed, setFailed] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) e.stopPropagation();
    setFailed(false);
    speak(text, () => {
      setFailed(true);
      resetTimeoutRef.current = setTimeout(() => setFailed(false), 3000);
    });
  };

  return (
    <button
      type="button"
      aria-label={failed ? "Sound isn't available on this device" : label}
      onClick={handleClick}
      className={`flex-shrink-0 flex items-center justify-center rounded-full text-white shadow-sm active:scale-95 transition-transform ${
        failed ? "bg-red-400" : "bg-accent hover:bg-accent-dark"
      } ${sizeClass} ${className}`}
    >
      {failed ? "🔇" : "🔊"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ProgressDots — three dots/segments instead of a thin bar + "X of Y" text
// ---------------------------------------------------------------------------

export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  if (total <= 1) return null;
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 rounded-full transition-all ${
            i === current
              ? "w-8 bg-accent"
              : i < current
              ? "w-2.5 bg-accent/50"
              : "w-2.5 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback banner — shared correct/wrong states with icon
// ---------------------------------------------------------------------------

export function FeedbackBanner({
  tone,
  children,
}: {
  tone: "correct" | "wrong";
  children: ReactNode;
}) {
  const isCorrect = tone === "correct";
  return (
    <div
      className={`w-full flex items-center gap-3 rounded-2xl px-5 py-4 font-bold text-lg ${
        isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${
          isCorrect ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {isCorrect ? "✓" : "✗"}
      </span>
      <span>{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HighlightedText — bolds the target word (and simple inflections) in text
// ---------------------------------------------------------------------------

export function HighlightedText({ text, word }: { text: string; word: string }) {
  if (!word) return <>{text}</>;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped}\\w*)`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-extrabold text-accent-dark">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
