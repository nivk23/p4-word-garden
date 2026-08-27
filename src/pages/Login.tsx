import { useState } from "react";
import { signIn, describeAuthError } from "../lib/auth";
import { Page, PageTitle, Card, Button } from "../components/ui";

export default function Login({
  onAuthed,
  onSwitchToSignUp,
  onForgotPassword,
}: {
  onAuthed: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setBusy(true);
    try {
      await signIn(email, password);
      onAuthed();
    } catch (error) {
      console.error("Sign-in failed:", error);
      setError(describeAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="text-4xl mt-6">🌱</div>
      <PageTitle>Welcome back</PageTitle>

      <Card>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />

        {error && <p className="text-red-600 font-semibold mb-3 text-center">{error}</p>}

        <Button onClick={handleSubmit} disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>

        <div className="flex justify-between mt-4 text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-secondary-dark underline decoration-2 underline-offset-4 font-semibold"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-secondary-dark underline decoration-2 underline-offset-4 font-semibold"
          >
            Create account
          </button>
        </div>
      </Card>
    </Page>
  );
}
