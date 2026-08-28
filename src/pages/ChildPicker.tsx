import { useEffect, useState } from "react";
import { listChildren, createChild, setActiveChildId, deleteChild } from "../store/progress";
import type { ChildProfile } from "../store/progress";
import { Page, PageTitle, Card, Button, Loading } from "../components/ui";

const EMOJI_OPTIONS = ["🌱", "🌿", "🌸", "🦋", "🐝", "🌻"];

export default function ChildPicker({ onChildSelected }: { onChildSelected: () => void }) {
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [addingName, setAddingName] = useState("");
  const [addingEmoji, setAddingEmoji] = useState(EMOJI_OPTIONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Off by default and behind an explicit "Manage profiles" tap — this
  // screen is what the child taps through every morning, so a delete
  // control can't just sit next to the profile buttons where a stray tap
  // could wipe someone's progress.
  const [manageMode, setManageMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Home's "Switch profile" sets this flag before reloading specifically
    // so this screen shows even with one profile — otherwise there was no
    // way to ever reach "Add profile" again once a first profile existed,
    // since the auto-select-if-only-one-profile behaviour below would
    // always skip straight past this screen.
    const forced = sessionStorage.getItem("force_child_picker") === "1";
    sessionStorage.removeItem("force_child_picker");

    listChildren().then((list) => {
      if (cancelled) return;
      // Exactly one profile and we weren't asked to force the picker:
      // skip it entirely, just use it (the normal post-login case).
      if (list.length === 1 && !forced) {
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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError("");
    try {
      await deleteChild(id);
      setChildren((prev) => (prev || []).filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Failed to delete child profile:", error);
      setError("Couldn't delete the profile. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
          <div className="flex flex-col gap-3 mb-4">
            {children.map((child) =>
              confirmDeleteId === child.id ? (
                <div
                  key={child.id}
                  className="w-full rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3"
                >
                  <p className="text-red-700 font-semibold mb-3">
                    Delete {child.emoji} {child.name} and all their progress? This can't be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      full={false}
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={deletingId === child.id}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      full={false}
                      onClick={() => handleDelete(child.id)}
                      disabled={deletingId === child.id}
                    >
                      {deletingId === child.id ? "Deleting…" : "Yes, delete forever"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={child.id} className="w-full flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePick(child.id)}
                    className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-secondary/25 bg-white/60 px-4 py-3 text-left hover:border-accent transition-colors min-h-[56px]"
                  >
                    <span className="text-3xl">{child.emoji}</span>
                    <span className="font-display font-semibold text-lg text-ink">{child.name}</span>
                  </button>
                  {manageMode && (
                    <button
                      type="button"
                      aria-label={`Delete ${child.name}`}
                      onClick={() => setConfirmDeleteId(child.id)}
                      className="flex-shrink-0 w-11 h-11 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {children.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setManageMode(!manageMode);
              setConfirmDeleteId(null);
            }}
            className="text-sm text-ink/40 underline mb-6"
          >
            {manageMode ? "Done managing" : "Manage profiles"}
          </button>
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
