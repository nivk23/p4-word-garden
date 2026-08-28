import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LearnWords from "../src/pages/LearnWords";
import { getSchedulerItems, getAllDayRecords, saveDayRecord } from "../src/store/progress";

async function seedStrongPriorDay(accuracy = 90) {
  await saveDayRecord({
    date: "2020-01-01",
    wordIds: ["placeholder"],
    grammarId: "lesson_0",
    completed: true,
    quizResults: [],
    accuracy,
    durationSec: 60,
  });
}

vi.mock("../src/lib/tts", () => ({
  speak: vi.fn(),
  speakAfter: vi.fn(),
  stop: vi.fn(),
  cancelPendingTimeouts: vi.fn(),
  isSpeechAvailable: () => false,
}));

describe("LearnWords (regression: parallelizing the 3 word saves + grammar-count read shouldn't change the outcome)", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("creates exactly 3 scheduler items and a matching DayRecord after clicking through all 3 words", async () => {
    render(
      <MemoryRouter>
        <LearnWords />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    const continueBtn = await screen.findByRole("button", { name: /continue/i });
    fireEvent.click(continueBtn);

    await waitFor(async () => {
      const items = await getSchedulerItems();
      const wordItems = items.filter((i) => i.type === "word");
      expect(wordItems).toHaveLength(3);
    });

    const dayRecords = await getAllDayRecords();
    expect(dayRecords).toHaveLength(1);
    expect(dayRecords[0].wordIds).toHaveLength(3);
    expect(dayRecords[0].grammarId).toBe("lesson_1");
    expect(dayRecords[0].completed).toBe(false);

    const items = await getSchedulerItems();
    const wordIds = items.filter((i) => i.type === "word").map((i) => i.itemId);
    expect(new Set(wordIds).size).toBe(3); // no duplicate/dropped writes from the parallel save
  });

  it("does not offer extra words with no prior completed day (safe default pace on day one)", async () => {
    render(
      <MemoryRouter>
        <LearnWords />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(await screen.findByRole("button", { name: /continue/i }));

    // Goes straight to finishing — no "learn more" prompt for a first-ever day.
    expect(screen.queryByText(/you're doing great/i)).toBeNull();
    await waitFor(async () => {
      const dayRecords = await getAllDayRecords();
      expect(dayRecords.some((d) => d.wordIds.length === 3)).toBe(true);
    });
  });

  it("regression: a child with >=80% recent accuracy is offered — never forced — an extra batch of new words beyond the default 3", async () => {
    await seedStrongPriorDay(90);

    render(
      <MemoryRouter>
        <LearnWords />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(await screen.findByRole("button", { name: /continue/i }));

    await waitFor(() => screen.getByText(/you're doing great/i));
    fireEvent.click(screen.getByRole("button", { name: /learn 3 more/i }));

    // Extended batch: 3 more Next/Continue taps to get through the new words,
    // landing back on the same prompt (still >=80%, still words left) — the
    // offer isn't a one-shot, so this time choose to stop.
    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(await screen.findByRole("button", { name: /continue/i }));

    await waitFor(() => screen.getByText(/you're doing great/i));
    fireEvent.click(screen.getByRole("button", { name: /that's enough/i }));

    await waitFor(async () => {
      const items = await getSchedulerItems();
      const wordItems = items.filter((i) => i.type === "word");
      expect(wordItems).toHaveLength(6);
    });

    const dayRecords = await getAllDayRecords();
    const todayRecord = dayRecords.find((d) => d.wordIds.length === 6);
    expect(todayRecord).toBeTruthy();
  });

  it("regression: a child can stop at the prompt instead of learning more, saving just the default batch", async () => {
    await seedStrongPriorDay(90);

    render(
      <MemoryRouter>
        <LearnWords />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(await screen.findByRole("button", { name: /continue/i }));

    await waitFor(() => screen.getByText(/you're doing great/i));
    fireEvent.click(screen.getByRole("button", { name: /that's enough/i }));

    await waitFor(async () => {
      const items = await getSchedulerItems();
      const wordItems = items.filter((i) => i.type === "word");
      expect(wordItems).toHaveLength(3);
    });
  });
});
