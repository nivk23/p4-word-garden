import { useState } from "react";
import { resetPassword, describeAuthError } from "../lib/auth";
import { Page, PageTitle, Card, Button } from "../components/ui";

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      console.error("Password reset failed:", error);
      setError(describeAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="text-4xl mt-6">🔑</div>
      <PageTitle>Reset your password</PageTitle>

      <Card>
        {sent ? (
          <p className="text-center text-ink/80 mb-4">
            Check your email for a link to reset your password.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
            />

            {error && <p className="text-red-600 font-semibold mb-3 text-center">{error}</p>}

            <Button onClick={handleSubmit} disabled={busy || !email}>
              {busy ? "Sending…" : "Send reset link"}
            </Button>
          </>
        )}

        <div className="flex justify-center mt-4 text-sm">
          <button
            type="button"
            onClick={onBack}
            className="text-secondary-dark underline decoration-2 underline-offset-4 font-semibold"
          >
            Back to sign in
          </button>
        </div>
      </Card>
    </Page>
  );
}
