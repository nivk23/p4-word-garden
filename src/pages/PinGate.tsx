import { useState } from "react";
import { getUserProfile } from "../store/progress";
import type { ReactNode } from "react";

function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

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
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 className="text-4xl font-bold text-purple-600">Parent Access</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <p className="text-gray-700 mb-6 text-center">
          Enter the 4-digit PIN to access parent insights.
        </p>

        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="****"
          className="w-full text-4xl text-center tracking-widest p-4 border-2 border-gray-300 rounded-lg mb-4 font-mono"
        />

        {error && <p className="text-red-600 font-semibold mb-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={pin.length !== 4}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg text-lg"
        >
          Unlock
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">Default PIN: 1234</p>
      </div>
    </div>
  );
}
