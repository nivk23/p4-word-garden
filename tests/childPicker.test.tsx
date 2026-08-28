import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import ChildPicker from "../src/pages/ChildPicker";

const { listChildren, createChild, setActiveChildId, deleteChild, resetChildProgress, updateChild, setChildPin } = vi.hoisted(() => ({
  listChildren: vi.fn(),
  createChild: vi.fn(),
  setActiveChildId: vi.fn(),
  deleteChild: vi.fn(),
  resetChildProgress: vi.fn(),
  updateChild: vi.fn(),
  setChildPin: vi.fn(),
}));
vi.mock("../src/store/progress", async (importOriginal) => {
  // hashPin/DEFAULT_CHILD_PIN are real, pure logic (no Firebase) — keep the
  // actual implementation so the PIN-entry flow under test does a real hash
  // comparison, not a mock stand-in.
  const actual = await importOriginal<typeof import("../src/store/progress")>();
  return {
    hashPin: actual.hashPin,
    DEFAULT_CHILD_PIN: actual.DEFAULT_CHILD_PIN,
    listChildren: (...args: unknown[]) => listChildren(...args),
    createChild: (...args: unknown[]) => createChild(...args),
    setActiveChildId: (...args: unknown[]) => setActiveChildId(...args),
    deleteChild: (...args: unknown[]) => deleteChild(...args),
    resetChildProgress: (...args: unknown[]) => resetChildProgress(...args),
    updateChild: (...args: unknown[]) => updateChild(...args),
    setChildPin: (...args: unknown[]) => setChildPin(...args),
  };
});

describe("ChildPicker", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("shows tiles for existing children; picking one and entering its (default) PIN selects it and calls onChildSelected", async () => {
    listChildren.mockResolvedValueOnce([
      { id: "child-1", name: "Ava", emoji: "🌸", createdAt: "now" },
      { id: "child-2", name: "Ben", emoji: "🌿", createdAt: "now" },
    ]);
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);

    await waitFor(() => screen.getByText("Ava"));
    fireEvent.click(screen.getByText("Ben"));

    const pinInput = await screen.findByPlaceholderText("Enter 4-digit PIN");
    fireEvent.change(pinInput, { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /^enter$/i }));

    expect(setActiveChildId).toHaveBeenCalledWith("child-2");
    expect(onChildSelected).toHaveBeenCalledTimes(1);
  });

  it("regression: entering the wrong PIN for a profile does not select it", async () => {
    sessionStorage.setItem("force_child_picker", "1"); // reach the tile even with one profile
    listChildren.mockResolvedValueOnce([
      { id: "child-1", name: "Ava", emoji: "🌸", createdAt: "now" },
    ]);
    const onChildSelected = vi.fn();
    render(<ChildPicker onChildSelected={onChildSelected} />);

    await waitFor(() => screen.getByText("Ava"));
    fireEvent.click(screen.getByText("Ava"));

    const pinInput = await screen.findByPlaceholderText("Enter 4-digit PIN");
    fireEvent.change(pinInput, { target: { value: "9999" } });
    fireEvent.click(screen.getByRole("button", { name: /^enter$/i }));

    await waitFor(() => screen.getByText(/wrong pin/i));
    expect(setActiveChildId).not.toHaveBeenCalled();
    expect(onChildSelected).not.toHaveBeenCalled();
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

    // Picking the existing tile still works normally from here, once its PIN is entered.
    fireEvent.click(screen.getByText("Cleo"));
    const pinInput = await screen.findByPlaceholderText("Enter 4-digit PIN");
    fireEvent.change(pinInput, { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /^enter$/i }));

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

  it("regression: 'Reset PIN' resets a child's own profile-entry PIN back to the default, immediately (no separate confirm step needed since it's non-destructive)", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now", profilePinHash: "some-custom-hash" },
    ]);
    setChildPin.mockResolvedValueOnce(undefined);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("Chloe"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/reset pin for chloe/i));

    await waitFor(() => expect(setChildPin).toHaveBeenCalledWith("chloe", "1234"));
    await waitFor(() => screen.getByText(/chloe.*pin was reset to 1234/i));
  });

  it("regression: reset progress requires an explicit confirm step and keeps the profile (name/emoji unchanged)", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" },
    ]);
    resetChildProgress.mockResolvedValueOnce(undefined);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("Chloe"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/reset progress for chloe/i));

    expect(resetChildProgress).not.toHaveBeenCalled();
    await waitFor(() => screen.getByText(/reset all progress for.*chloe/i));

    fireEvent.click(screen.getByRole("button", { name: /yes, reset progress/i }));

    await waitFor(() => expect(resetChildProgress).toHaveBeenCalledWith("chloe"));
    // Profile itself stays — still listed, name/emoji untouched.
    expect(screen.getByText("Chloe")).toBeTruthy();
  });

  it("regression: Cancel on the reset confirmation does not reset anything", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" },
    ]);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("Chloe"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/reset progress for chloe/i));

    await waitFor(() => screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(resetChildProgress).not.toHaveBeenCalled();
  });

  it("regression: editing a profile's name and avatar saves via updateChild and updates the displayed tile", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" },
    ]);
    updateChild.mockResolvedValueOnce(undefined);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("Chloe"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/edit chloe/i));

    await waitFor(() => screen.getAllByPlaceholderText("Child's name"));
    const nameInput = screen.getAllByPlaceholderText("Child's name")[0]; // edit panel's, not the add-new-profile one
    const editPanel = nameInput.closest("div")!;
    fireEvent.change(nameInput, { target: { value: "Chloe Bear" } });
    fireEvent.click(within(editPanel).getByLabelText("Choose 🦋"));
    fireEvent.click(within(editPanel).getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateChild).toHaveBeenCalledWith("chloe", { name: "Chloe Bear", emoji: "🦋" }));
    await waitFor(() => screen.getByText("Chloe Bear"));
  });

  it("regression: Cancel on the edit panel discards changes", async () => {
    sessionStorage.setItem("force_child_picker", "1");
    listChildren.mockResolvedValueOnce([
      { id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" },
    ]);
    render(<ChildPicker onChildSelected={vi.fn()} />);

    await waitFor(() => screen.getByText("Chloe"));
    fireEvent.click(screen.getByText(/manage profiles/i));
    fireEvent.click(screen.getByLabelText(/edit chloe/i));

    await waitFor(() => screen.getAllByPlaceholderText("Child's name"));
    const nameInput = screen.getAllByPlaceholderText("Child's name")[0]; // edit panel's, not the add-new-profile one
    fireEvent.change(nameInput, { target: { value: "Someone Else" } });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(updateChild).not.toHaveBeenCalled();
    expect(screen.getByText("Chloe")).toBeTruthy();
    expect(screen.queryByText("Someone Else")).toBeNull();
  });
});
