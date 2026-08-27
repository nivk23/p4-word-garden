import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = { currentUser: null as { isAnonymous: boolean } | null };

vi.mock("../src/firebase", () => ({
  getFirebaseAuth: () => mockAuth,
}));

const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  credentialFn,
} = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(async () => ({ user: { uid: "new-uid" } })),
  signInWithEmailAndPassword: vi.fn(async () => ({ user: { uid: "signed-in-uid" } })),
  linkWithCredential: vi.fn(async () => ({ user: { uid: "linked-uid" } })),
  signOut: vi.fn(async () => {}),
  sendPasswordResetEmail: vi.fn(async () => {}),
  onAuthStateChanged: vi.fn(() => () => {}),
  credentialFn: vi.fn((email: string, password: string) => ({ email, password, providerId: "password" })),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider: { credential: credentialFn },
}));

import { signUp, signIn, signOutUser, resetPassword, onAuthChange, describeAuthError } from "../src/lib/auth";

describe("lib/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  describe("signUp", () => {
    it("links the credential onto the current session when it's anonymous, preserving the uid", async () => {
      mockAuth.currentUser = { isAnonymous: true };

      const user = await signUp("parent@example.com", "hunter22");

      expect(linkWithCredential).toHaveBeenCalledTimes(1);
      expect(linkWithCredential).toHaveBeenCalledWith(mockAuth.currentUser, expect.anything());
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
      expect(user.uid).toBe("linked-uid");
    });

    it("creates a fresh account when there's no anonymous session to preserve", async () => {
      mockAuth.currentUser = null;

      const user = await signUp("parent@example.com", "hunter22");

      expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(linkWithCredential).not.toHaveBeenCalled();
      expect(user.uid).toBe("new-uid");
    });

    it("creates a fresh account rather than linking when the current session is already a real (non-anonymous) account", async () => {
      mockAuth.currentUser = { isAnonymous: false };

      await signUp("parent@example.com", "hunter22");

      expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(linkWithCredential).not.toHaveBeenCalled();
    });
  });

  it("signIn calls signInWithEmailAndPassword", async () => {
    const user = await signIn("parent@example.com", "hunter22");
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(user.uid).toBe("signed-in-uid");
  });

  it("signOutUser calls signOut", async () => {
    await signOutUser();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("resetPassword calls sendPasswordResetEmail", async () => {
    await resetPassword("parent@example.com");
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, "parent@example.com");
  });

  it("onAuthChange wraps onAuthStateChanged and returns its unsubscribe", () => {
    const cb = vi.fn();
    onAuthChange(cb);
    expect(onAuthStateChanged).toHaveBeenCalledWith(mockAuth, cb);
  });
});

describe("describeAuthError", () => {
  it("maps known Firebase Auth error codes to actionable messages", () => {
    expect(describeAuthError({ code: "auth/email-already-in-use" })).toMatch(/already has an account/i);
    expect(describeAuthError({ code: "auth/weak-password" })).toMatch(/6 characters/i);
    expect(describeAuthError({ code: "auth/invalid-email" })).toMatch(/valid email/i);
    expect(describeAuthError({ code: "auth/wrong-password" })).toMatch(/incorrect/i);
    expect(describeAuthError({ code: "auth/too-many-requests" })).toMatch(/wait/i);
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(describeAuthError({ code: "auth/some-new-code" })).toMatch(/something went wrong/i);
    expect(describeAuthError(new Error("network down"))).toMatch(/something went wrong/i);
  });
});
