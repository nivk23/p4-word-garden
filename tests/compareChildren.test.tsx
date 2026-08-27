import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CompareChildren from "../src/pages/CompareChildren";

const { listChildren, getChildRawData } = vi.hoisted(() => ({
  listChildren: vi.fn(),
  getChildRawData: vi.fn(),
}));
vi.mock("../src/store/progress", () => ({
  listChildren: (...args: unknown[]) => listChildren(...args),
  getChildRawData: (...args: unknown[]) => getChildRawData(...args),
}));

function emptyChildData(streak = 0) {
  return {
    items: [],
    dayRecords: [],
    logs: [],
    profile: { name: "Learner", createdAt: "now", streak, lastCompletedDay: "", pinHash: "" },
  };
}

describe("CompareChildren", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a friendly message instead of a table when there's only one profile", async () => {
    listChildren.mockResolvedValueOnce([{ id: "only", name: "Cleo", emoji: "🐝", createdAt: "now" }]);
    getChildRawData.mockResolvedValueOnce(emptyChildData());

    render(
      <MemoryRouter>
        <CompareChildren />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/only profile right now/i));
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("renders a comparison table with each child's own stats, not mixed up", async () => {
    listChildren.mockResolvedValueOnce([
      { id: "alice", name: "Alice", emoji: "🌸", createdAt: "now" },
      { id: "bob", name: "Bob", emoji: "🌿", createdAt: "now" },
    ]);
    getChildRawData.mockImplementation(async (childId: string) =>
      childId === "alice" ? emptyChildData(5) : emptyChildData(2)
    );

    render(
      <MemoryRouter>
        <CompareChildren />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("table"));

    const rows = screen.getAllByRole("row");
    // header + 2 children
    expect(rows).toHaveLength(3);

    expect(screen.getByText(/alice/i)).toBeTruthy();
    expect(screen.getByText(/bob/i)).toBeTruthy();
    expect(screen.getByText("🔥 5")).toBeTruthy();
    expect(screen.getByText("🔥 2")).toBeTruthy();

    expect(getChildRawData).toHaveBeenCalledWith("alice");
    expect(getChildRawData).toHaveBeenCalledWith("bob");
  });

  it("regression: renders a 'Words known' column distinct from 'Words mastered' (the value was computed but never actually rendered in the table)", async () => {
    listChildren.mockResolvedValueOnce([
      { id: "alice", name: "Alice", emoji: "🌸", createdAt: "now" },
      { id: "bob", name: "Bob", emoji: "🌿", createdAt: "now" },
    ]);
    // A word that's started (box >= 1, so it counts as "known") but far
    // short of the mastery bar (streak >= 5, correct on >= 3 days, >= 2
    // question types) — known and mastered must differ for this to be a
    // meaningful check.
    const startedButNotMastered = {
      itemId: "huge",
      type: "word" as const,
      introducedOn: "2026-01-01",
      box: 1,
      correct: 1,
      wrong: 0,
      streak: 1,
      lastSeen: "2026-01-01",
      nextDue: "2026-01-02",
      correctDays: ["2026-01-01"],
      correctTypes: ["meaning"],
    };
    getChildRawData.mockImplementation(async () => ({
      items: [startedButNotMastered],
      dayRecords: [],
      logs: [],
      profile: { name: "Learner", createdAt: "now", streak: 0, lastCompletedDay: "", pinHash: "" },
    }));

    render(
      <MemoryRouter>
        <CompareChildren />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/known/i));
    expect(screen.getByText(/mastered/i)).toBeTruthy();

    const table = screen.getByRole("table");
    expect(table.textContent).toMatch(/1\s*\/\s*\d+/); // "1 / N" (known)
    expect(table.textContent).toMatch(/0\s*\/\s*\d+/); // "0 / N" (mastered)
  });

  it("shows a message when there are no child profiles at all", async () => {
    listChildren.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <CompareChildren />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/no child profiles found/i));
  });
});
