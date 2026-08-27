import { useState } from "react";
import { signUp, describeAuthError } from "../lib/auth";
import { createChild, migrateLegacyDataToChild, setActiveChildId } from "../store/progress";
import { Page, PageTitle, Card, Button } from "../components/ui";

export default function SignUp({
  onAuthed,
  onSwitchToSignIn,
}: {
  onAuthed: () => void;
  onSwitchToSignIn: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!childName.trim()) {
      setError("Please enter your child's name.");
      return;
    }

    setBusy(true);
    try {
      await signUp(email, password);
      // Creating the first child right away (rather than a separate step)
      // also lets us carry over any progress already sitting under this
      // account — see migrateLegacyDataToChild.
      const child = await createChild(childName.trim());
      await migrateLegacyDataToChild(child.id);
      setActiveChildId(child.id);
      onAuthed();
    } catch (error) {
      console.error("Sign-up failed:", error);
      setError(describeAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="text-4xl mt-6">🌱</div>
      <PageTitle>Create your account</PageTitle>

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
          placeholder="Password (at least 6 characters)"
          autoComplete="new-password"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Child's name"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />

        {error && <p className="text-red-600 font-semibold mb-3 text-center">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={busy || !email || !password || !confirmPassword || !childName.trim()}
        >
          {busy ? "Creating…" : "Create account"}
        </Button>

        <div className="flex justify-center mt-4 text-sm">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-secondary-dark underline decoration-2 underline-offset-4 font-semibold"
          >
            Already have an account? Sign in
          </button>
        </div>
      </Card>
    </Page>
  );
}
