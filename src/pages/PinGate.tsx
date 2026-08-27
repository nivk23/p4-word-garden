import { useState } from "react";
import { getUserProfile, hashPin } from "../store/progress";
import type { ReactNode } from "react";
import { Page, PageTitle, Card, Button } from "../components/ui";

export default function PinGate({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const profile = await getUserProfile();
    if (hashPin(pin) === profile.pinHash) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Invalid PIN");
      setPin("");
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <Page>
      <div className="text-4xl mt-6">🔒</div>
      <PageTitle>Parent Access</PageTitle>

      <Card>
        <p className="text-ink/70 mb-6 text-center">
          Enter the 4-digit PIN to access parent insights.
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && handleSubmit()}
          placeholder="****"
          className="w-full text-4xl text-center tracking-[0.5em] p-4 border-2 border-gray-200 rounded-2xl mb-4 font-mono min-h-[56px] focus:outline-none focus:border-accent"
        />

        {error && <p className="text-red-600 font-semibold mb-4 text-center">{error}</p>}

        <Button onClick={handleSubmit} disabled={pin.length !== 4}>
          Unlock
        </Button>

        <p className="text-xs text-ink/40 text-center mt-4">Default PIN: 1234</p>
      </Card>
    </Page>
  );
}
