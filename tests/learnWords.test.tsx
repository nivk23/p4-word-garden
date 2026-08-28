import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LearnWords from "../src/pages/LearnWords";
import { getSchedulerItems, getAllDayRecords } from "../src/store/progress";

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

  it("creates exactly 3 scheduler items and a matching DayRecord after clicking through all 3 words and stopping there", async () => {
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

    await waitFor(() => screen.getByText(/you're doing great/i));
    fireEvent.click(screen.getByRole("button", { name: /that's enough/i }));

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

  it("regression: the offer to learn more words is never gated on quiz performance — it's shown regardless, and it's the child's choice", async () => {
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

    // Offered on a brand-new account with no quiz history at all — there's
    // no 80%-or-better gate to clear.
    await waitFor(() => screen.getByText(/you're doing great/i));
    fireEvent.click(screen.getByRole("button", { name: /learn 3 more/i }));

    // Extended batch: 3 more Next/Continue taps to get through the new
    // words, landing back on the same prompt (still words left) — the
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

  it("regression: a child can stop at the very first prompt instead of learning more, saving just the default batch", async () => {
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
