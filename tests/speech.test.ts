import { describe, it, expect, vi, afterEach } from "vitest";
import { startListening, describeSpeechError } from "../src/lib/speech";

class MockRecognition {
  lang = "";
  maxAlternatives = 0;
  interimResults = false;
  onstart: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
}

describe("describeSpeechError", () => {
  it("maps known error codes to actionable, distinct messages", () => {
    expect(describeSpeechError("not-allowed")).toMatch(/microphone access/i);
    expect(describeSpeechError("service-not-allowed")).toMatch(/microphone access/i);
    expect(describeSpeechError("audio-capture")).toMatch(/no microphone/i);
    expect(describeSpeechError("no-speech")).toMatch(/didn't hear/i);
    expect(describeSpeechError("network")).toMatch(/internet/i);
  });

  it("falls back to a generic message for unknown error codes", () => {
    expect(describeSpeechError("some-weird-future-code")).toMatch(/something went wrong/i);
  });
});

describe("startListening", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported via onError when no SpeechRecognition constructor exists", () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    const onResult = vi.fn();
    const onError = vi.fn();
    startListening(onResult, onError);

    expect(onError).toHaveBeenCalledWith("Speech recognition not supported");
  });

  it("surfaces a start-failed error via onError instead of throwing when start() throws synchronously", () => {
    class ThrowingRecognition extends MockRecognition {
      start = vi.fn(() => {
        throw new Error("InvalidStateError");
      });
    }
    vi.stubGlobal("SpeechRecognition", ThrowingRecognition);

    const onResult = vi.fn();
    const onError = vi.fn();

    expect(() => startListening(onResult, onError)).not.toThrow();
    expect(onError).toHaveBeenCalledWith("start-failed");
  });

  it("forwards a final transcript to onResult", () => {
    let instance: MockRecognition;
    class CapturingRecognition extends MockRecognition {
      constructor() {
        super();
        instance = this;
      }
    }
    vi.stubGlobal("SpeechRecognition", CapturingRecognition);

    const onResult = vi.fn();
    const onError = vi.fn();
    startListening(onResult, onError);

    const finalResult = Object.assign([{ transcript: "huge" }], { isFinal: true });
    instance!.onresult?.({ resultIndex: 0, results: [finalResult] });

    expect(onResult).toHaveBeenCalledWith("huge", true);
  });

  it("forwards a recognition error via onError", () => {
    let instance: MockRecognition;
    class CapturingRecognition extends MockRecognition {
      constructor() {
        super();
        instance = this;
      }
    }
    vi.stubGlobal("SpeechRecognition", CapturingRecognition);

    const onResult = vi.fn();
    const onError = vi.fn();
    startListening(onResult, onError);

    instance!.onerror?.({ error: "not-allowed" });

    expect(onError).toHaveBeenCalledWith("not-allowed");
  });

  it("swallows a double-stop error from the returned cleanup function", () => {
    class ThrowingStopRecognition extends MockRecognition {
      stop = vi.fn(() => {
        throw new Error("already stopped");
      });
    }
    vi.stubGlobal("SpeechRecognition", ThrowingStopRecognition);

    const stopListening = startListening(vi.fn(), vi.fn());
    expect(() => stopListening()).not.toThrow();
  });
});
