import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import Login from "../src/pages/Login";

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));

vi.mock("../src/lib/auth", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  describeAuthError: () => "Email or password is incorrect.",
}));

describe("Login", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onAuthed after a successful sign-in", async () => {
    signIn.mockResolvedValueOnce({ uid: "abc" });
    const onAuthed = vi.fn();
    render(<Login onAuthed={onAuthed} onSwitchToSignUp={vi.fn()} onForgotPassword={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "parent@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "hunter22" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(onAuthed).toHaveBeenCalledTimes(1));
    expect(signIn).toHaveBeenCalledWith("parent@example.com", "hunter22");
  });

  it("shows an error message and does not call onAuthed when sign-in fails", async () => {
    signIn.mockRejectedValueOnce({ code: "auth/wrong-password" });
    const onAuthed = vi.fn();
    render(<Login onAuthed={onAuthed} onSwitchToSignUp={vi.fn()} onForgotPassword={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "parent@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => screen.getByText(/incorrect/i));
    expect(onAuthed).not.toHaveBeenCalled();
  });

  it("switching to sign-up / forgot-password calls the right callback", () => {
    const onSwitchToSignUp = vi.fn();
    const onForgotPassword = vi.fn();
    render(<Login onAuthed={vi.fn()} onSwitchToSignUp={onSwitchToSignUp} onForgotPassword={onForgotPassword} />);

    fireEvent.click(screen.getByText(/create account/i));
    fireEvent.click(screen.getByText(/forgot password/i));

    expect(onSwitchToSignUp).toHaveBeenCalledTimes(1);
    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
