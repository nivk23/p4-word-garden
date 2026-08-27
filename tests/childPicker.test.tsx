import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import ChildPicker from "../src/pages/ChildPicker";

const { listChildren, createChild, setActiveChildId } = vi.hoisted(() => ({
  listChildren: vi.fn(),
  createChild: vi.fn(),
  setActiveChildId: vi.fn(),
}));
vi.mock("../src/store/progress", () => ({
  listChildren: (...args: unknown[]) => listChildren(...args),
  createChild: (...args: unknown[]) => createChild(...args),
  setActiveChildId: (...args: unknown[]) => setActiveChildId(...args),
}));

describe("ChildPicker", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows tiles for existing children; picking one selects it and calls onChildSelected", async () => {
    listChildren.mockResolvedValueOnce([
      { id: "child-1", name: "Ava", emoji: "🌸", createdAt: "now" },
      { id: "child-2", name: "Ben", emoji: "🌿", createdAt: "now" },
    ]);
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);

    await waitFor(() => screen.getByText("Ava"));
    fireEvent.click(screen.getByText("Ben"));

    expect(setActiveChildId).toHaveBeenCalledWith("child-2");
    expect(onChildSelected).toHaveBeenCalledTimes(1);
  });

  it("auto-selects and skips the picker when there is exactly one child", async () => {
    listChildren.mockResolvedValueOnce([{ id: "only-child", name: "Cleo", emoji: "🐝", createdAt: "now" }]);
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);

    await waitFor(() => expect(onChildSelected).toHaveBeenCalledTimes(1));
    expect(setActiveChildId).toHaveBeenCalledWith("only-child");
  });

  it("creates a new profile and selects it", async () => {
    listChildren.mockResolvedValueOnce([]);
    createChild.mockResolvedValueOnce({ id: "new-child", name: "Dee", emoji: "🌱", createdAt: "now" });
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);

    await waitFor(() => screen.getByPlaceholderText("Child's name"));
    fireEvent.change(screen.getByPlaceholderText("Child's name"), { target: { value: "Dee" } });
    fireEvent.click(screen.getByRole("button", { name: /add profile/i }));

    await waitFor(() => expect(onChildSelected).toHaveBeenCalledTimes(1));
    expect(createChild).toHaveBeenCalledWith("Dee", "🌱");
    expect(setActiveChildId).toHaveBeenCalledWith("new-child");
  });
});
