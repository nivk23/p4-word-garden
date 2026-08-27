/**
 * Speech recognition and text-to-speech utilities
 */

export interface SpeechOptions {
  lang?: string;
  maxAlternatives?: number;
}

/**
 * Check if browser supports Web Speech API
 */
export function isSupported(): boolean {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

/**
 * Start listening with Web Speech API
 */
export function startListening(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  options: SpeechOptions = {}
): () => void {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported");
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.lang = options.lang || "en-GB";
  recognition.maxAlternatives = options.maxAlternatives || 5;
  recognition.interimResults = true;

  recognition.onstart = () => {};
  recognition.onresult = (event: any) => {
    let transcript = "";
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      isFinal = event.results[i].isFinal;
    }
    onResult(transcript, isFinal);
  };
  recognition.onerror = (event: any) => {
    onError(event.error || "Recognition error");
  };
  recognition.onend = () => {};

  try {
    recognition.start();
  } catch (e) {
    // start() throws synchronously (InvalidStateError) if a recognition
    // session is already active — surface it the same way as any other
    // failure instead of leaving the caller hanging.
    onError("start-failed");
    return () => {};
  }

  return () => {
    try {
      recognition.stop();
    } catch (e) {
      // Already stopped
    }
  };
}

/**
 * Turn a SpeechRecognition error code into a message a parent/child can act
 * on, instead of the mic button just silently doing nothing (which is what
 * happened before this existed — errors only ever reached the console).
 */
export function describeSpeechError(error: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Please allow microphone access for this site, then try again.";
    case "audio-capture":
      return "No microphone was found on this device.";
    case "no-speech":
      return "Didn't hear anything — try again and speak clearly.";
    case "network":
      return "No internet connection — this needs the internet to work.";
    default:
      return "Something went wrong with the microphone. Try again.";
  }
}

/**
 * Fuzzy match using Levenshtein distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const aMay = a.toLowerCase();
  const b2 = b.toLowerCase();

  const matrix: number[][] = [];
  for (let i = 0; i <= b2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aMay.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b2.length; i++) {
    for (let j = 1; j <= aMay.length; j++) {
      if (b2[i - 1] === aMay[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b2.length][aMay.length];
}

/**
 * Check if transcript matches word (fuzzy match <= 1 for len >= 5)
 */
export function matchesWord(
  transcript: string,
  word: string,
  homophones: Map<string, string[]> = new Map()
): boolean {
  const clean = transcript.toLowerCase().trim();
  const target = word.toLowerCase();

  // Exact match
  if (clean === target) return true;

  // Homophones
  const homos = homophones.get(target) || [];
  if (homos.some((h) => clean === h.toLowerCase())) return true;

  // Fuzzy match (Levenshtein <= 1 for longer words)
  if (word.length >= 5) {
    return levenshteinDistance(clean, target) <= 1;
  }

  return false;
}

/**
 * Homophones map (common confusable words)
 */
export const homophones = new Map<string, string[]>([
  ["be", ["bee"]],
  ["blue", ["blew"]],
  ["buy", ["by", "bye"]],
  ["for", ["four", "fore"]],
  ["hear", ["here"]],
  ["knight", ["night"]],
  ["meet", ["meat"]],
  ["one", ["won"]],
  ["pair", ["pear", "pare"]],
  ["right", ["write", "rite"]],
  ["son", ["sun"]],
  ["their", ["there", "they're"]],
  ["to", ["too", "two"]],
  ["waste", ["waist"]],
  ["wear", ["where"]],
]);
