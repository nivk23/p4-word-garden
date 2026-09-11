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
    expect(screen.queryByText(/words mastered/i)).toBeNull();
  });

  it("renders each child's own stats, not mixed up", async () => {
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

    await waitFor(() => screen.getByText(/alice/i));

    // One card per child, each with the full set of measures.
    expect(screen.getAllByText(/words mastered/i)).toHaveLength(2);

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

    await waitFor(() => screen.getAllByText(/words known/i));
    expect(screen.getAllByText(/words mastered/i).length).toBeGreaterThan(0);

    expect(screen.getAllByText(/^1 \/ \d+$/).length).toBeGreaterThan(0); // known
    expect(screen.getAllByText(/^0 \/ \d+$/).length).toBeGreaterThan(0); // mastered
  });

  it("regression: shows every measure for seven children, including ones named with a wall of emoji", async () => {
    // This page used to be a table: one nowrap column per measure inside a
    // horizontal scroller, with the child column stuck to the left. With seven
    // profiles — two of them named with a long run of emoji a child had typed
    // in — the name column filled a phone screen and every number sat off it,
    // so the page appeared to list names and nothing else.
    const children = [
      { id: "c1", name: "NIKK EH", emoji: "🌿", createdAt: "now", level: 4 },
      { id: "c2", name: "QUEK SHUWEN 😗😙😚😘🥰😍🤩🥳😊", emoji: "🌱", createdAt: "now", level: 2 },
      { id: "c3", name: "CHLOE EH MIN HUI", emoji: "🌱", createdAt: "now", level: 3 },
      { id: "c4", name: "🐬🐬🐬🐬🐬🐬", emoji: "🌿", createdAt: "now", level: 1 },
      { id: "c5", name: "Charizard 🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯", emoji: "🐝", createdAt: "now", level: 5 },
      { id: "c6", name: "CHARLOTTE EH EN HUI", emoji: "🦋", createdAt: "now", level: 6 },
      { id: "c7", name: "KYLER EH JUN RONG", emoji: "🐝", createdAt: "now" },
    ];
    listChildren.mockResolvedValueOnce(children);
    getChildRawData.mockImplementation(async () => emptyChildData(3));

    render(
      <MemoryRouter>
        <CompareChildren />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("NIKK EH"));

    // Every child gets every measure, however long their name is.
    for (const label of [
      "Words known",
      "Words mastered",
      "Streak",
      "Days done",
      "Accuracy",
      "Comprehension",
      "Spelling",
    ]) {
      expect(screen.getAllByText(new RegExp(`^${label}$`, "i"))).toHaveLength(children.length);
    }

    // Each child's level is shown, since her word totals depend on it. The one
    // profile saved before levels existed falls back to the P4 default.
    for (const label of ["P1", "P2", "P3", "P5", "P6"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getAllByText("P4")).toHaveLength(2); // c1, plus c7's default

    // Nothing is inside a horizontal scroller any more.
    expect(document.querySelector(".overflow-x-auto")).toBeNull();
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
