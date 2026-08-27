/**
 * Text-to-speech wrapper using browser speechSynthesis API
 * en-GB voice with slow rate
 */

let pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

export function speak(text: string): void {
  // Cancel any ongoing speech and pending timeouts
  speechSynthesis.cancel();
  cancelPendingTimeouts();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.8; // slow rate
  utterance.pitch = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);
}

/**
 * Schedule a speech with a delay
 */
export function speakAfter(text: string, delayMs: number): void {
  const timeout = setTimeout(() => {
    speak(text);
  }, delayMs);

  pendingTimeouts.push(timeout);
}

/**
 * Stop current speech
 */
export function stop(): void {
  speechSynthesis.cancel();
  cancelPendingTimeouts();
}

/**
 * Cancel all pending timeouts
 */
export function cancelPendingTimeouts(): void {
  pendingTimeouts.forEach(timeout => clearTimeout(timeout));
  pendingTimeouts = [];
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  return "speechSynthesis" in window;
}
