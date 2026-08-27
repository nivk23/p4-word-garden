/**
 * Real email/password accounts, replacing the anonymous-per-device auth
 * this app used before. See docs/HANDOFF.md and the design behind
 * signUp()'s linking behaviour below.
 */
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase";

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase auth isn't available.");
  return auth;
}

/**
 * Create a real account. Every device signs in anonymously behind the
 * scenes (or did, under the old code) with progress written under that
 * anonymous uid — if the current session is still that anonymous user,
 * *link* the new credential onto it instead of creating a separate account.
 * Linking keeps the same uid, so anything already in Firestore under it
 * stays reachable; a fresh createUserWithEmailAndPassword would silently
 * orphan that data under a uid nobody can sign back into.
 */
export async function signUp(email: string, password: string): Promise<User> {
  const auth = requireAuth();
  const credential = EmailAuthProvider.credential(email, password);
  if (auth.currentUser?.isAnonymous) {
    const result = await linkWithCredential(auth.currentUser, credential);
    return result.user;
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const auth = requireAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = requireAuth();
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = requireAuth();
  await sendPasswordResetEmail(auth, email);
}

/** Wraps onAuthStateChanged; returns the unsubscribe function. */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = requireAuth();
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUserEmail(): string | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser?.email ?? null;
}

/**
 * Turn a Firebase Auth error into a message a parent can act on, instead of
 * a raw "auth/invalid-credential" style code.
 */
export function describeAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
      return "That email already has an account — try signing in instead.";
    case "auth/weak-password":
      return "Please choose a password with at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts — please wait a bit and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
