import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import SignUp from "../src/pages/SignUp";

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));
vi.mock("../src/lib/auth", () => ({
  signUp: (...args: unknown[]) => signUp(...args),
  describeAuthError: () => "Something went wrong. Please try again.",
}));

const { createChild, migrateLegacyDataToChild, setActiveChildId } = vi.hoisted(() => ({
  createChild: vi.fn(),
  migrateLegacyDataToChild: vi.fn(),
  setActiveChildId: vi.fn(),
}));
vi.mock("../src/store/progress", () => ({
  createChild: (...args: unknown[]) => createChild(...args),
  migrateLegacyDataToChild: (...args: unknown[]) => migrateLegacyDataToChild(...args),
  setActiveChildId: (...args: unknown[]) => setActiveChildId(...args),
}));

function fillAndSubmit({
  email = "parent@example.com",
  password = "hunter22",
  confirm = "hunter22",
  childName = "Ava",
}: Partial<Record<"email" | "password" | "confirm" | "childName", string>> = {}) {
  fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/^Password/), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("Confirm password"), { target: { value: confirm } });
  fireEvent.change(screen.getByPlaceholderText("Child's name"), { target: { value: childName } });
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
}

describe("SignUp", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("signs up, creates the first child, migrates legacy data, and calls onAuthed — in that order", async () => {
    signUp.mockResolvedValueOnce({ uid: "abc" });
    createChild.mockResolvedValueOnce({ id: "child-1", name: "Ava", emoji: "🌱", createdAt: "now" });
    migrateLegacyDataToChild.mockResolvedValueOnce(true);
    const onAuthed = vi.fn();

    render(<SignUp onAuthed={onAuthed} onSwitchToSignIn={vi.fn()} />);
    fillAndSubmit();

    await waitFor(() => expect(onAuthed).toHaveBeenCalledTimes(1));

    expect(signUp).toHaveBeenCalledWith("parent@example.com", "hunter22");
    expect(createChild).toHaveBeenCalledWith("Ava");
    expect(migrateLegacyDataToChild).toHaveBeenCalledWith("child-1");
    expect(setActiveChildId).toHaveBeenCalledWith("child-1");

    const signUpOrder = signUp.mock.invocationCallOrder[0];
    const createChildOrder = createChild.mock.invocationCallOrder[0];
    const migrateOrder = migrateLegacyDataToChild.mock.invocationCallOrder[0];
    expect(signUpOrder).toBeLessThan(createChildOrder);
    expect(createChildOrder).toBeLessThan(migrateOrder);
  });

  it("rejects mismatched passwords without calling signUp", async () => {
    render(<SignUp onAuthed={vi.fn()} onSwitchToSignIn={vi.fn()} />);
    fillAndSubmit({ confirm: "different" });

    await waitFor(() => screen.getByText(/don't match/i));
    expect(signUp).not.toHaveBeenCalled();
  });

  it("requires a child name before submitting", async () => {
    render(<SignUp onAuthed={vi.fn()} onSwitchToSignIn={vi.fn()} />);
    // Button stays disabled with no child name, so signUp is never reachable.
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "parent@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^Password/), { target: { value: "hunter22" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), { target: { value: "hunter22" } });

    const submitButton = screen.getByRole("button", { name: /create account/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
    expect(signUp).not.toHaveBeenCalled();
  });
});
