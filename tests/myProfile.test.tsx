import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyProfile from "../src/pages/MyProfile";

const { getActiveChild, updateChild, setChildPin } = vi.hoisted(() => ({
  getActiveChild: vi.fn(),
  updateChild: vi.fn(),
  setChildPin: vi.fn(),
}));
vi.mock("../src/store/progress", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/store/progress")>();
  return {
    hashPin: actual.hashPin,
    DEFAULT_CHILD_PIN: actual.DEFAULT_CHILD_PIN,
    getActiveChild: (...args: unknown[]) => getActiveChild(...args),
    updateChild: (...args: unknown[]) => updateChild(...args),
    setChildPin: (...args: unknown[]) => setChildPin(...args),
  };
});

describe("MyProfile", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the active child's current name and avatar", async () => {
    getActiveChild.mockResolvedValueOnce({ id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" });
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Chloe"));
  });

  it("changing the avatar calls updateChild with the new emoji", async () => {
    getActiveChild.mockResolvedValueOnce({ id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" });
    updateChild.mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Chloe"));
    fireEvent.click(screen.getByLabelText("Choose 🦋"));

    await waitFor(() => expect(updateChild).toHaveBeenCalledWith("chloe", { emoji: "🦋" }));
    await waitFor(() => screen.getByText(/saved/i));
  });

  it("regression: changing the PIN requires the correct current PIN first", async () => {
    getActiveChild.mockResolvedValueOnce({ id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" }); // no profilePinHash -> default 1234
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByPlaceholderText("Current PIN"));
    fireEvent.change(screen.getByPlaceholderText("Current PIN"), { target: { value: "9999" } });
    fireEvent.change(screen.getByPlaceholderText("New PIN"), { target: { value: "5678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm new PIN"), { target: { value: "5678" } });
    fireEvent.click(screen.getByRole("button", { name: /save new pin/i }));

    expect(screen.getByText(/not your current pin/i)).toBeTruthy();
    expect(setChildPin).not.toHaveBeenCalled();
  });

  it("regression: the two new-PIN entries must match", async () => {
    getActiveChild.mockResolvedValueOnce({ id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" });
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByPlaceholderText("Current PIN"));
    fireEvent.change(screen.getByPlaceholderText("Current PIN"), { target: { value: "1234" } });
    fireEvent.change(screen.getByPlaceholderText("New PIN"), { target: { value: "5678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm new PIN"), { target: { value: "0000" } });
    fireEvent.click(screen.getByRole("button", { name: /save new pin/i }));

    expect(screen.getByText(/don't match/i)).toBeTruthy();
    expect(setChildPin).not.toHaveBeenCalled();
  });

  it("changing the PIN with the correct current PIN and matching new PINs saves via setChildPin", async () => {
    getActiveChild.mockResolvedValueOnce({ id: "chloe", name: "Chloe", emoji: "🌸", createdAt: "now" });
    setChildPin.mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByPlaceholderText("Current PIN"));
    fireEvent.change(screen.getByPlaceholderText("Current PIN"), { target: { value: "1234" } });
    fireEvent.change(screen.getByPlaceholderText("New PIN"), { target: { value: "5678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm new PIN"), { target: { value: "5678" } });
    fireEvent.click(screen.getByRole("button", { name: /save new pin/i }));

    await waitFor(() => expect(setChildPin).toHaveBeenCalledWith("chloe", "5678"));
    await waitFor(() => screen.getByText(/pin was changed/i));
  });
});
