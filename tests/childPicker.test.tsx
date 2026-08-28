import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import ChildPicker from "../src/pages/ChildPicker";

const { listChildren, createChild, setActiveChildId, deleteChild } = vi.hoisted(() => ({
  listChildren: vi.fn(),
  createChild: vi.fn(),
  setActiveChildId: vi.fn(),
  deleteChild: vi.fn(),
}));
vi.mock("../src/store/progress", () => ({
  listChildren: (...args: unknown[]) => listChildren(...args),
  createChild: (...args: unknown[]) => createChild(...args),
  setActiveChildId: (...args: unknown[]) => setActiveChildId(...args),
  deleteChild: (...args: unknown[]) => deleteChild(...args),
}));

describe("ChildPicker", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
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

  it("regression: shows the picker (with 'Add profile' reachable) even with one child, when force_child_picker is set — otherwise there was no way back to add a second profile once one existed", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([{ id: "only-child", name: "Cleo", emoji: "🐝", createdAt: "now" }]);
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);

    await waitFor(() => screen.getByText("Cleo"));
    expect(onChildSelected).not.toHaveBeenCalled();
    expect(setActiveChildId).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /add profile/i })).toBeTruthy();

    // Picking the existing tile still works normally from here.
    fireEvent.click(screen.getByText("Cleo"));
    expect(setActiveChildId).toHaveBeenCalledWith("only-child");
    expect(onChildSelected).toHaveBeenCalledTimes(1);
  });

  it("consumes the force_child_picker flag — a later normal load with one child still auto-selects", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([{ id: "only-child", name: "Cleo", emoji: "🐝", createdAt: "now" }]);
    const { unmount } = render(<ChildPicker onChildSelected={vi.fn()} />);
    await waitFor(() => screen.getByText("Cleo"));
    unmount();
    cleanup();
    vi.clearAllMocks();

    listChildren.mockResolvedValueOnce([{ id: "only-child", name: "Cleo", emoji: "🐝", createdAt: "now" }]);
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);
    await waitFor(() => expect(onChildSelected).toHaveBeenCalledTimes(1));
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

  it("regression: a delete control is hidden until 'Manage profiles' is tapped, so a stray tap on the picker can't wipe a profile", async () => {
    sessionStorage.setItem("force_child_picker", "1"); // reach the picker even with one child
    listChildren.mockResolvedValueOnce([
      { id: "qa-bot", name: "QA Bot", emoji: "🌱", createdAt: "now" },
    ]);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("QA Bot"));
    expect(screen.queryByLabelText(/delete qa bot/i)).toBeNull();

    fireEvent.click(screen.getByText(/manage profiles/i));
    expect(screen.getByLabelText(/delete qa bot/i)).toBeTruthy();
  });

  it("regression: deleting a profile requires an explicit confirm step, and only removes that one profile", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "qa-bot", name: "QA Bot", emoji: "🌱", createdAt: "now" },
      { id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" },
    ]);
    deleteChild.mockResolvedValueOnce(undefined);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("QA Bot"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/delete qa bot/i));

    // Tapping the trash icon only arms a confirmation — nothing is deleted yet.
    expect(deleteChild).not.toHaveBeenCalled();
    await waitFor(() => screen.getByText(/delete .*qa bot.*and all their progress/i));

    fireEvent.click(screen.getByRole("button", { name: /yes, delete forever/i }));

    await waitFor(() => expect(deleteChild).toHaveBeenCalledWith("qa-bot"));
    await waitFor(() => expect(screen.queryByText("QA Bot")).toBeNull());
    expect(screen.getByText("Chloe")).toBeTruthy(); // untouched
  });

  it("regression: Cancel on the delete confirmation leaves the profile alone", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "qa-bot", name: "QA Bot", emoji: "🌱", createdAt: "now" },
    ]);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("QA Bot"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/delete qa bot/i));

    await waitFor(() => screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(deleteChild).not.toHaveBeenCalled();
    expect(screen.getByText("QA Bot")).toBeTruthy();
  });
});
