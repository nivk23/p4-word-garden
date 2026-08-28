import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActiveChild, updateChild, setChildPin, hashPin, DEFAULT_CHILD_PIN } from "../store/progress";
import type { ChildProfile } from "../store/progress";
import { Page, PageTitle, Card, Button, Loading } from "../components/ui";

const EMOJI_OPTIONS = ["🌱", "🌿", "🌸", "🦋", "🐝", "🌻"];

export default function MyProfile() {
  const navigate = useNavigate();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emojiMessage, setEmojiMessage] = useState("");
  const [savingEmoji, setSavingEmoji] = useState(false);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    getActiveChild().then((c) => {
      setChild(c);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <Loading label="Loading your profile…" />;
  }

  if (!child) {
    return (
      <Page>
        <PageTitle>My Profile</PageTitle>
        <Card className="text-center">
          <p className="text-lg text-ink/80 mb-6">No profile is active right now.</p>
          <Button onClick={() => navigate("/")}>Back Home</Button>
        </Card>
      </Page>
    );
  }

  const handleChooseEmoji = async (emoji: string) => {
    if (emoji === child.emoji) return;
    setSavingEmoji(true);
    setEmojiMessage("");
    try {
      await updateChild(child.id, { emoji });
      setChild({ ...child, emoji });
      setEmojiMessage("Saved!");
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setEmojiMessage("Couldn't save — please try again.");
    } finally {
      setSavingEmoji(false);
    }
  };

  const handleChangePin = async () => {
    setPinError("");
    setPinSuccess("");

    const requiredHash = child.profilePinHash || hashPin(DEFAULT_CHILD_PIN);
    if (hashPin(currentPin) !== requiredHash) {
      setPinError("That's not your current PIN.");
      return;
    }
    if (newPin.length !== 4) {
      setPinError("Your new PIN needs 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("The two new PINs don't match.");
      return;
    }

    setSavingPin(true);
    try {
      await setChildPin(child.id, newPin);
      setChild({ ...child, profilePinHash: hashPin(newPin) });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setPinSuccess("Your PIN was changed!");
    } catch (error) {
      console.error("Failed to change PIN:", error);
      setPinError("Couldn't save your new PIN — please try again.");
    } finally {
      setSavingPin(false);
    }
  };

  return (
    <Page>
      <PageTitle>My Profile</PageTitle>

      <Card>
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{child.emoji}</div>
          <p className="font-display font-semibold text-xl text-ink">{child.name}</p>
        </div>

        <p className="font-hand text-2xl text-ink/50 mb-2">choose your avatar</p>
        <div className="flex gap-2 mb-2 flex-wrap">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleChooseEmoji(emoji)}
              aria-label={`Choose ${emoji}`}
              disabled={savingEmoji}
              className={`text-2xl w-12 h-12 rounded-2xl border-2 transition-colors disabled:opacity-50 ${
                child.emoji === emoji ? "border-accent bg-accent-light" : "border-transparent bg-secondary-light/40"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {emojiMessage && <p className="text-secondary-dark text-sm font-semibold mb-4">{emojiMessage}</p>}
      </Card>

      <Card>
        <p className="font-hand text-2xl text-ink/50 mb-3">change my PIN</p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="Current PIN"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg text-center tracking-[0.5em] min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="New PIN"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg text-center tracking-[0.5em] min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && handleChangePin()}
          placeholder="Confirm new PIN"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg text-center tracking-[0.5em] min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />

        {pinError && <p className="text-red-600 font-semibold mb-3 text-center">{pinError}</p>}
        {pinSuccess && <p className="text-secondary-dark font-semibold mb-3 text-center">{pinSuccess}</p>}

        <Button
          onClick={handleChangePin}
          disabled={savingPin || !currentPin || newPin.length !== 4 || !confirmPin}
        >
          {savingPin ? "Saving…" : "Save new PIN"}
        </Button>
        <p className="text-xs text-ink/40 text-center mt-4">
          Forgotten your PIN? Ask a parent to reset it from "Manage profiles".
        </p>
      </Card>

      <div className="flex justify-center mt-2">
        <Button variant="ghost" full={false} onClick={() => navigate("/")}>
          ← Back home
        </Button>
      </div>
    </Page>
  );
}
