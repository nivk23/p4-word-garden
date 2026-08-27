/**
 * Text-to-speech wrapper using browser speechSynthesis API.
 *
 * Hardened against known Android WebView/Chromium issues that can make
 * speech silently do nothing on a phone while working fine on desktop:
 *   - calling cancel() immediately before speak() in the same tick can drop
 *     the new utterance too (Chrome and Edge on Android share the same
 *     underlying bridge to the system TTS engine);
 *   - speechSynthesis can get stuck "paused" after the tab is backgrounded;
 *   - Chromium's automatic voice-matching by `utterance.lang` string can
 *     fail to pick up a valid installed voice even when one exists —
 *     explicitly reading speechSynthesis.getVoices() and assigning
 *     `utterance.voice` directly is more reliable than lang alone.
 * None of this helps if the device's selected TTS engine has no English
 * voice at all, so `speak()` takes an optional `onFailure` callback that
 * fires if speech never actually starts, letting callers show a fallback
 * hint instead of failing silently.
 */

let pendingTimeouts: ReturnType<typeof setTimeout>[] = [];
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerAttached = false;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechAvailable()) return [];
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  if (!voicesListenerAttached) {
    voicesListenerAttached = true;
    speechSynthesis.addEventListener("voiceschanged", () => {
      cachedVoices = speechSynthesis.getVoices();
    });
  }
  return cachedVoices;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = refreshVoices();
  return (
    voices.find((v) => v.lang?.toLowerCase() === "en-gb") ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
    null
  );
}

/**
 * Speak text aloud. `onFailure` fires once if speech never actually starts
 * within ~1.5s — no matching voice, no TTS engine, or the browser silently
 * dropped it — so callers can show a fallback hint instead of doing nothing.
 */
export function speak(text: string, onFailure?: () => void): void {
  if (!isSpeechAvailable()) {
    onFailure?.();
    return;
  }

  const runSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.8; // slow rate
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = pickEnglishVoice();
    if (voice) utterance.voice = voice;

    let started = false;
    utterance.onstart = () => {
      started = true;
    };
    utterance.onerror = (event) => {
      console.warn("speechSynthesis error:", event.error);
      onFailure?.();
    };

    if (onFailure) {
      const failureCheck = setTimeout(() => {
        if (!started) onFailure();
      }, 1500);
      pendingTimeouts.push(failureCheck);
    }

    // Android can leave speechSynthesis stuck "paused" after the tab was
    // backgrounded; resume() is a harmless no-op otherwise.
    speechSynthesis.resume();
    speechSynthesis.speak(utterance);
  };

  if (speechSynthesis.speaking || speechSynthesis.pending) {
    // Cancelling and speaking in the same tick can silently drop the new
    // utterance on Android — give the cancellation a moment to land first.
    speechSynthesis.cancel();
    const timeout = setTimeout(runSpeak, 50);
    pendingTimeouts.push(timeout);
  } else {
    runSpeak();
  }
}

/**
 * Schedule a speech with a delay — used for syllable-by-syllable playback.
 */
export function speakAfter(text: string, delayMs: number): void {
  const timeout = setTimeout(() => {
    speak(text);
  }, delayMs);

  pendingTimeouts.push(timeout);
}

/**
 * Stop current speech and cancel anything scheduled via speakAfter.
 */
export function stop(): void {
  cancelPendingTimeouts();
  if (isSpeechAvailable()) {
    speechSynthesis.cancel();
  }
}

/**
 * Cancel all pending timeouts (speakAfter schedules and internal retries).
 */
export function cancelPendingTimeouts(): void {
  pendingTimeouts.forEach(timeout => clearTimeout(timeout));
  pendingTimeouts = [];
}

/**
 * Check whether the speechSynthesis API exists at all. Note this can be
 * true on a device that still can't actually produce sound (e.g. a TTS
 * engine with no usable English voice) — see the onFailure callback above.
 */
export function isSpeechAvailable(): boolean {
  return "speechSynthesis" in window;
}
