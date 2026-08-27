import { useEffect, useState } from "react";
import { listChildren, createChild, setActiveChildId } from "../store/progress";
import type { ChildProfile } from "../store/progress";
import { Page, PageTitle, Card, Button, Loading } from "../components/ui";

const EMOJI_OPTIONS = ["🌱", "🌿", "🌸", "🦋", "🐝", "🌻"];

export default function ChildPicker({ onChildSelected }: { onChildSelected: () => void }) {
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [addingName, setAddingName] = useState("");
  const [addingEmoji, setAddingEmoji] = useState(EMOJI_OPTIONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listChildren().then((list) => {
      if (cancelled) return;
      // Exactly one profile: skip the picker entirely, just use it.
      if (list.length === 1) {
        setActiveChildId(list[0].id);
        onChildSelected();
        return;
      }
      setChildren(list);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = (id: string) => {
    setActiveChildId(id);
    onChildSelected();
  };

  const handleAdd = async () => {
    if (!addingName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const child = await createChild(addingName.trim(), addingEmoji);
      setActiveChildId(child.id);
      onChildSelected();
    } catch (error) {
      console.error("Failed to create child profile:", error);
      setError("Couldn't create the profile. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (children === null) {
    return <Loading label="Loading profiles…" />;
  }

  return (
    <Page>
      <div className="text-4xl mt-6">🧺</div>
      <PageTitle>Who's learning today?</PageTitle>

      <Card>
        {children.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => handlePick(child.id)}
                className="w-full flex items-center gap-3 rounded-2xl border-2 border-secondary/25 bg-white/60 px-4 py-3 text-left hover:border-accent transition-colors min-h-[56px]"
              >
                <span className="text-3xl">{child.emoji}</span>
                <span className="font-display font-semibold text-lg text-ink">{child.name}</span>
              </button>
            ))}
          </div>
        )}

        <p className="font-hand text-2xl text-ink/50 mb-2">add a new profile</p>

        <div className="flex gap-2 mb-3 flex-wrap">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAddingEmoji(emoji)}
              aria-label={`Choose ${emoji}`}
              className={`text-2xl w-12 h-12 rounded-2xl border-2 transition-colors ${
                addingEmoji === emoji ? "border-accent bg-accent-light" : "border-transparent bg-secondary-light/40"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={addingName}
          onChange={(e) => setAddingName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Child's name"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
        />

        {error && <p className="text-red-600 font-semibold mb-3 text-center">{error}</p>}

        <Button onClick={handleAdd} disabled={busy || !addingName.trim()}>
          {busy ? "Adding…" : "＋ Add profile"}
        </Button>
      </Card>
    </Page>
  );
}
