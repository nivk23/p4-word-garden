import { useEffect, useState } from "react";
import {
  listChildren,
  createChild,
  setActiveChildId,
  deleteChild,
  resetChildProgress,
  updateChild,
  setChildPin,
  hashPin,
  DEFAULT_CHILD_PIN,
} from "../store/progress";
import type { ChildProfile } from "../store/progress";
import { LEVELS, levelLabel, asLevel, DEFAULT_LEVEL } from "../content/levels";
import type { Level } from "../content/levels";
import { Page, PageTitle, Card, Button, Loading } from "../components/ui";

const EMOJI_OPTIONS = ["🌱", "🌿", "🌸", "🦋", "🐝", "🌻"];

/**
 * Which primary level the child is in. This is the parent's answer to "how old
 * is she?" — it decides which words, grammar rules and passages she is taught,
 * from P1 up to the level chosen. Changing it later never loses progress: words
 * she has already learned stay in her scheduler either way.
 */
function LevelPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: Level;
  onChange: (level: Level) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex gap-2 mb-3 flex-wrap" role="group" aria-label="School level">
      {LEVELS.map((level) => (
        <button
          key={`${idPrefix}-${level}`}
          type="button"
          onClick={() => onChange(level)}
          aria-pressed={value === level}
          className={`font-display font-semibold text-base w-12 h-12 rounded-2xl border-2 transition-colors ${
            value === level ? "border-accent bg-accent-light text-ink" : "border-transparent bg-secondary-light/40 text-ink/70"
          }`}
        >
          {levelLabel(level)}
        </button>
      ))}
    </div>
  );
}

export default function ChildPicker({ onChildSelected }: { onChildSelected: () => void }) {
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [addingName, setAddingName] = useState("");
  const [addingEmoji, setAddingEmoji] = useState(EMOJI_OPTIONS[0]);
  const [addingLevel, setAddingLevel] = useState<Level>(DEFAULT_LEVEL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Off by default and behind an explicit "Manage profiles" tap — this
  // screen is what a child taps through, so these controls can't just sit
  // next to the profile buttons where a stray tap could rename, wipe, or
  // delete someone's progress.
  const [manageMode, setManageMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState(EMOJI_OPTIONS[0]);
  const [editLevel, setEditLevel] = useState<Level>(DEFAULT_LEVEL);
  const [savingEdit, setSavingEdit] = useState(false);
  const [resettingPinId, setResettingPinId] = useState<string | null>(null);
  const [pinResetMessage, setPinResetMessage] = useState("");
  // Entering a profile (picking its tile) asks for that child's own PIN —
  // separate from the parent's Insights PIN — so one sibling can't just tap
  // into another's profile from the picker.
  const [pinEntryId, setPinEntryId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

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
      // skip it entirely, just use it (the normal post-login case) — this
      // is effectively still "this device's own child", not a switch
      // between siblings, so it doesn't need a PIN prompt.
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

  const closeAllPanels = () => {
    setConfirmDeleteId(null);
    setConfirmResetId(null);
    setEditingId(null);
    setPinEntryId(null);
    setPinInput("");
    setPinError("");
    setPinResetMessage("");
  };

  const startPinEntry = (child: ChildProfile) => {
    closeAllPanels();
    setPinEntryId(child.id);
  };

  const submitPin = (child: ChildProfile) => {
    const requiredHash = child.profilePinHash || hashPin(DEFAULT_CHILD_PIN);
    if (hashPin(pinInput) === requiredHash) {
      setActiveChildId(child.id);
      onChildSelected();
      return;
    }
    setPinError("Wrong PIN — try again.");
    setPinInput("");
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

  const handleReset = async (id: string) => {
    setResettingId(id);
    setError("");
    try {
      await resetChildProgress(id);
      setConfirmResetId(null);
    } catch (error) {
      console.error("Failed to reset child progress:", error);
      setError("Couldn't reset progress. Please try again.");
    } finally {
      setResettingId(null);
    }
  };

  const handleResetPin = async (child: ChildProfile) => {
    setResettingPinId(child.id);
    setError("");
    setPinResetMessage("");
    try {
      await setChildPin(child.id, DEFAULT_CHILD_PIN);
      setChildren((prev) =>
        (prev || []).map((c) => (c.id === child.id ? { ...c, profilePinHash: hashPin(DEFAULT_CHILD_PIN) } : c))
      );
      setPinResetMessage(`${child.name}'s PIN was reset to ${DEFAULT_CHILD_PIN}.`);
    } catch (error) {
      console.error("Failed to reset child PIN:", error);
      setError("Couldn't reset the PIN. Please try again.");
    } finally {
      setResettingPinId(null);
    }
  };

  const startEdit = (child: ChildProfile) => {
    closeAllPanels();
    setEditingId(child.id);
    setEditName(child.name);
    setEditEmoji(child.emoji);
    setEditLevel(asLevel(child.level) ?? DEFAULT_LEVEL);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSavingEdit(true);
    setError("");
    try {
      await updateChild(id, { name: editName.trim(), emoji: editEmoji, level: editLevel });
      setChildren((prev) =>
        (prev || []).map((c) =>
          c.id === id ? { ...c, name: editName.trim(), emoji: editEmoji, level: editLevel } : c
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update child profile:", error);
      setError("Couldn't save changes. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAdd = async () => {
    if (!addingName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const child = await createChild(addingName.trim(), addingEmoji, addingLevel);
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
            {children.map((child) => {
              if (pinEntryId === child.id) {
                return (
                  <div key={child.id} className="w-full rounded-2xl border-2 border-accent bg-accent-light/30 px-4 py-3">
                    <p className="font-display font-semibold text-lg text-ink mb-3">
                      {child.emoji} {child.name}'s PIN
                    </p>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setPinError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitPin(child)}
                      placeholder="Enter 4-digit PIN"
                      autoFocus
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg text-center tracking-[0.5em] min-h-[56px] mb-3 focus:outline-none focus:border-accent"
                    />
                    {pinError && <p className="text-red-600 font-semibold mb-3 text-center">{pinError}</p>}
                    <div className="flex gap-2">
                      <Button variant="ghost" full={false} onClick={closeAllPanels}>
                        Cancel
                      </Button>
                      <Button full={false} onClick={() => submitPin(child)} disabled={pinInput.length !== 4}>
                        Enter
                      </Button>
                    </div>
                  </div>
                );
              }

              if (confirmDeleteId === child.id) {
                return (
                  <div
                    key={child.id}
                    className="w-full rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3"
                  >
                    <p className="text-red-700 font-semibold mb-3">
                      Delete {child.emoji} {child.name} and all their progress? This can't be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" full={false} onClick={() => setConfirmDeleteId(null)} disabled={deletingId === child.id}>
                        Cancel
                      </Button>
                      <Button variant="danger" full={false} onClick={() => handleDelete(child.id)} disabled={deletingId === child.id}>
                        {deletingId === child.id ? "Deleting…" : "Yes, delete forever"}
                      </Button>
                    </div>
                  </div>
                );
              }

              if (confirmResetId === child.id) {
                return (
                  <div
                    key={child.id}
                    className="w-full rounded-2xl border-2 border-accent/40 bg-accent-light/40 px-4 py-3"
                  >
                    <p className="text-secondary-dark font-semibold mb-3">
                      Reset all progress for {child.emoji} {child.name}? This clears their streak, words
                      learned, and quiz history — the profile itself stays.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" full={false} onClick={() => setConfirmResetId(null)} disabled={resettingId === child.id}>
                        Cancel
                      </Button>
                      <Button variant="secondary" full={false} onClick={() => handleReset(child.id)} disabled={resettingId === child.id}>
                        {resettingId === child.id ? "Resetting…" : "Yes, reset progress"}
                      </Button>
                    </div>
                  </div>
                );
              }

              if (editingId === child.id) {
                return (
                  <div key={child.id} className="w-full rounded-2xl border-2 border-secondary/40 bg-white/70 px-4 py-3">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditEmoji(emoji)}
                          aria-label={`Choose ${emoji}`}
                          className={`text-2xl w-11 h-11 rounded-2xl border-2 transition-colors ${
                            editEmoji === emoji ? "border-accent bg-accent-light" : "border-transparent bg-secondary-light/40"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(child.id)}
                      placeholder="Child's name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg min-h-[56px] mb-3 focus:outline-none focus:border-accent"
                    />
                    <LevelPicker value={editLevel} onChange={setEditLevel} idPrefix={`edit-${child.id}`} />
                    <div className="flex gap-2">
                      <Button variant="ghost" full={false} onClick={() => setEditingId(null)} disabled={savingEdit}>
                        Cancel
                      </Button>
                      <Button full={false} onClick={() => handleSaveEdit(child.id)} disabled={savingEdit || !editName.trim()}>
                        {savingEdit ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={child.id}>
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startPinEntry(child)}
                      className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-secondary/25 bg-white/60 px-4 py-3 text-left hover:border-accent transition-colors min-h-[56px]"
                    >
                      <span className="text-3xl">{child.emoji}</span>
                      <span className="font-display font-semibold text-lg text-ink">{child.name}</span>
                      <span className="ml-auto text-sm font-semibold text-ink/40">
                        {levelLabel(asLevel(child.level) ?? DEFAULT_LEVEL)}
                      </span>
                    </button>
                    {manageMode && (
                      <>
                        <button
                          type="button"
                          aria-label={`Edit ${child.name}`}
                          onClick={() => startEdit(child)}
                          className="flex-shrink-0 w-11 h-11 rounded-2xl border-2 border-secondary/30 text-secondary-dark hover:bg-secondary-light/40 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          aria-label={`Reset PIN for ${child.name}`}
                          onClick={() => handleResetPin(child)}
                          disabled={resettingPinId === child.id}
                          className="flex-shrink-0 w-11 h-11 rounded-2xl border-2 border-secondary/30 text-secondary-dark hover:bg-secondary-light/40 transition-colors disabled:opacity-50"
                        >
                          🔑
                        </button>
                        <button
                          type="button"
                          aria-label={`Reset progress for ${child.name}`}
                          onClick={() => {
                            closeAllPanels();
                            setConfirmResetId(child.id);
                          }}
                          className="flex-shrink-0 w-11 h-11 rounded-2xl border-2 border-accent/40 text-secondary-dark hover:bg-accent-light/40 transition-colors"
                        >
                          🔄
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${child.name}`}
                          onClick={() => {
                            closeAllPanels();
                            setConfirmDeleteId(child.id);
                          }}
                          className="flex-shrink-0 w-11 h-11 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                  {manageMode && pinResetMessage.startsWith(child.name) && (
                    <p className="text-secondary-dark text-sm font-semibold mt-1 ml-1">{pinResetMessage}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {children.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setManageMode(!manageMode);
              closeAllPanels();
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

        <p className="text-sm text-ink/50 mb-2">Which level is she in?</p>
        <LevelPicker value={addingLevel} onChange={setAddingLevel} idPrefix="add" />

        {error && <p className="text-red-600 font-semibold mb-3 text-center">{error}</p>}

        <Button onClick={handleAdd} disabled={busy || !addingName.trim()}>
          {busy ? "Adding…" : "＋ Add profile"}
        </Button>
      </Card>
    </Page>
  );
}
