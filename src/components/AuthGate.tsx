import { lazy, Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { isFirebaseAvailable } from "../firebase";
import { onAuthChange } from "../lib/auth";
import { getActiveChildId } from "../store/progress";
import { Loading } from "./ui";

// Lazy, same as every other page in App.tsx — most sessions never see any
// of these (Firebase disconnected, or already signed in with a child
// picked), so they shouldn't cost anything in the main bundle.
const LazyLogin = lazy(() => import("../pages/Login"));
const LazySignUp = lazy(() => import("../pages/SignUp"));
const LazyForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const LazyChildPicker = lazy(() => import("../pages/ChildPicker"));

type Status = "loading" | "needsAuth" | "needsChild" | "ready";
type AuthMode = "signin" | "signup" | "forgot";

/**
 * Gates every route behind a real signed-in account + a selected child
 * profile, when Firebase is configured. In local-only mode (no `.env`,
 * e.g. `npm run dev`) this renders straight through unchanged — there's no
 * multi-child/account concept without Firebase to hold it.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  useEffect(() => {
    if (!isFirebaseAvailable()) {
      setStatus("ready");
      return;
    }
    const unsubscribe = onAuthChange((user: User | null) => {
      if (!user || user.isAnonymous) {
        setStatus("needsAuth");
        setAuthMode("signin");
        return;
      }
      setStatus(getActiveChildId() ? "ready" : "needsChild");
    });
    return unsubscribe;
  }, []);

  const handleAuthed = () => {
    setStatus(getActiveChildId() ? "ready" : "needsChild");
  };

  if (status === "loading") return <Loading />;

  if (status === "needsAuth") {
    return (
      <Suspense fallback={<Loading />}>
        {authMode === "signup" ? (
          <LazySignUp onAuthed={handleAuthed} onSwitchToSignIn={() => setAuthMode("signin")} />
        ) : authMode === "forgot" ? (
          <LazyForgotPassword onBack={() => setAuthMode("signin")} />
        ) : (
          <LazyLogin
            onAuthed={handleAuthed}
            onSwitchToSignUp={() => setAuthMode("signup")}
            onForgotPassword={() => setAuthMode("forgot")}
          />
        )}
      </Suspense>
    );
  }

  if (status === "needsChild") {
    return (
      <Suspense fallback={<Loading />}>
        <LazyChildPicker onChildSelected={() => setStatus("ready")} />
      </Suspense>
    );
  }

  return <>{children}</>;
}
