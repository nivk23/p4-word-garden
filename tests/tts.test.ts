import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * jsdom doesn't implement the Web Speech API, so these tests stub
 * `speechSynthesis` / `SpeechSynthesisUtterance` directly. tts.ts keeps
 * module-level state (cached voices, pending timeouts), so each test does a
 * fresh dynamic import after vi.resetModules() to avoid cross-test bleed.
 */

class MockUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: { lang: string } | null = null;
  onstart: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function makeSynth(overrides: Record<string, unknown> = {}) {
  return {
    speaking: false,
    pending: false,
    getVoices: vi.fn(() => []),
    speak: vi.fn(),
    cancel: vi.fn(),
    resume: vi.fn(),
    addEventListener: vi.fn(),
    ...overrides,
  };
}

async function freshTts() {
  vi.resetModules();
  return await import("../src/lib/tts");
}

describe("tts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("assigns an exact en-GB voice when one is available", async () => {
    const voices = [{ lang: "zh-CN" }, { lang: "en-US" }, { lang: "en-GB" }];
    const synth = makeSynth({ getVoices: vi.fn(() => voices) });
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    speak("hello");

    const utterance = synth.speak.mock.calls[0][0] as MockUtterance;
    expect(utterance.voice?.lang).toBe("en-GB");
  });

  it("falls back to any en-* voice when no en-GB voice exists", async () => {
    const voices = [{ lang: "zh-CN" }, { lang: "en-US" }];
    const synth = makeSynth({ getVoices: vi.fn(() => voices) });
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    speak("hello");

    const utterance = synth.speak.mock.calls[0][0] as MockUtterance;
    expect(utterance.voice?.lang).toBe("en-US");
  });

  it("still attempts to speak (with no voice assigned) when no English voice is available", async () => {
    const voices = [{ lang: "zh-CN" }];
    const synth = makeSynth({ getVoices: vi.fn(() => voices) });
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    speak("hello");

    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utterance = synth.speak.mock.calls[0][0] as MockUtterance;
    expect(utterance.voice).toBeNull();
  });

  it("speaks immediately and calls resume() when nothing is currently speaking", async () => {
    const synth = makeSynth({ speaking: false, pending: false });
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    speak("hello");

    expect(synth.cancel).not.toHaveBeenCalled();
    expect(synth.resume).toHaveBeenCalledTimes(1);
    expect(synth.speak).toHaveBeenCalledTimes(1);
  });

  it("cancels and waits before speaking again when something is already speaking (Android race workaround)", async () => {
    vi.useFakeTimers();
    const synth = makeSynth({ speaking: true });
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    speak("hello");

    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(synth.speak).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(synth.speak).toHaveBeenCalledTimes(1);
  });

  it("calls onFailure when the utterance reports an error", async () => {
    const synth = makeSynth();
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    const onFailure = vi.fn();
    speak("hello", onFailure);

    const utterance = synth.speak.mock.calls[0][0] as MockUtterance;
    utterance.onerror?.({ error: "synthesis-failed" });

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it("calls onFailure if speech never actually starts (no working voice/engine)", async () => {
    vi.useFakeTimers();
    const synth = makeSynth();
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    const onFailure = vi.fn();
    speak("hello", onFailure);

    vi.advanceTimersByTime(1500);
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it("does not call onFailure if the utterance starts in time", async () => {
    vi.useFakeTimers();
    const synth = makeSynth();
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speak } = await freshTts();
    const onFailure = vi.fn();
    speak("hello", onFailure);

    const utterance = synth.speak.mock.calls[0][0] as MockUtterance;
    utterance.onstart?.();

    vi.advanceTimersByTime(1500);
    expect(onFailure).not.toHaveBeenCalled();
  });

  it("regression: speak() does not cancel other speakAfter-scheduled speech", async () => {
    // Previously speak() unconditionally called cancelPendingTimeouts(),
    // which wiped out later syllables scheduled via speakAfter as soon as
    // the first one fired — only the first syllable of "slow" playback ever
    // played.
    vi.useFakeTimers();
    const synth = makeSynth();
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speakAfter } = await freshTts();
    speakAfter("syl-one", 0);
    speakAfter("syl-two", 400);
    speakAfter("syl-three", 800);

    vi.advanceTimersByTime(0);
    expect(synth.speak).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400);
    expect(synth.speak).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(400);
    expect(synth.speak).toHaveBeenCalledTimes(3);
  });

  it("cancelPendingTimeouts() stops scheduled speakAfter calls from firing", async () => {
    vi.useFakeTimers();
    const synth = makeSynth();
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speakAfter, cancelPendingTimeouts } = await freshTts();
    speakAfter("syl-one", 400);
    cancelPendingTimeouts();

    vi.advanceTimersByTime(400);
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it("stop() cancels current speech and any pending speakAfter schedule", async () => {
    vi.useFakeTimers();
    const synth = makeSynth();
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    const { speakAfter, stop } = await freshTts();
    speakAfter("syl-one", 400);
    stop();

    expect(synth.cancel).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(400);
    expect(synth.speak).not.toHaveBeenCalled();
  });
});
