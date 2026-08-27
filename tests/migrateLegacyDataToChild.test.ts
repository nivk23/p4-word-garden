import { describe, it, expect, vi, beforeEach } from "vitest";

const { firestoreStore, resetFirestoreStore } = vi.hoisted(() => {
  const store = new Map<string, unknown>();
  return {
    firestoreStore: { map: store },
    resetFirestoreStore: () => store.clear(),
  };
});

vi.mock("firebase/firestore", () => {
  function doc(dbOrCollRef: { path: string }, maybePath?: string) {
    if (maybePath === undefined) {
      throw new Error("auto-id doc() not used by migrateLegacyDataToChild");
    }
    return { path: maybePath, id: maybePath.split("/").pop()! };
  }
  function collection(_db: unknown, path: string) {
    return { path };
  }
  async function setDoc(ref: { path: string }, data: unknown, opts?: { merge?: boolean }) {
    const existing = firestoreStore.map.get(ref.path);
    firestoreStore.map.set(
      ref.path,
      opts?.merge && existing && typeof existing === "object"
        ? { ...(existing as object), ...(data as object) }
        : data
    );
  }
  async function getDoc(ref: { path: string }) {
    const data = firestoreStore.map.get(ref.path);
    return { exists: () => data !== undefined, data: () => data };
  }
  async function getDocs(ref: { path: string }) {
    const prefix = ref.path + "/";
    const docs: Array<{ id: string; data: () => unknown }> = [];
    for (const [path, data] of firestoreStore.map.entries()) {
      if (path.startsWith(prefix) && !path.slice(prefix.length).includes("/")) {
        docs.push({ id: path.slice(prefix.length), data: () => data });
      }
    }
    return { empty: docs.length === 0, size: docs.length, docs };
  }
  return { doc, collection, setDoc, getDoc, getDocs };
});

const mockAuthState: { currentUser: { uid: string } | null } = { currentUser: { uid: "parent-uid" } };
let firebaseAvailable = true;

vi.mock("../src/firebase", () => ({
  isFirebaseAvailable: () => firebaseAvailable,
  getFirebaseAuth: () => ({ currentUser: mockAuthState.currentUser }),
  getFirebaseDb: () => ({}),
}));

import { migrateLegacyDataToChild } from "../src/store/progress";

describe("migrateLegacyDataToChild", () => {
  beforeEach(() => {
    resetFirestoreStore();
    localStorage.clear();
    firebaseAvailable = true;
    mockAuthState.currentUser = { uid: "parent-uid" };
  });

  it("copies legacy flat Firestore data (from a linked anonymous account) into the child's path", async () => {
    firestoreStore.map.set("users/parent-uid/items/huge", { itemId: "huge", box: 2 });
    firestoreStore.map.set("users/parent-uid/days/2026-01-01", { date: "2026-01-01", completed: true });
    firestoreStore.map.set("users/parent-uid/answers/1_huge", { itemId: "huge", correct: true });

    const migrated = await migrateLegacyDataToChild("child-1");

    expect(migrated).toBe(true);
    expect(firestoreStore.map.get("users/parent-uid/children/child-1/items/huge")).toEqual({
      itemId: "huge",
      box: 2,
    });
    expect(firestoreStore.map.get("users/parent-uid/children/child-1/days/2026-01-01")).toBeTruthy();
    expect(firestoreStore.map.get("users/parent-uid/children/child-1/answers/1_huge")).toBeTruthy();
  });

  it("copies legacy pure-localStorage data into the child's path", async () => {
    localStorage.setItem(
      "scheduler_items",
      JSON.stringify([{ itemId: "tiny", type: "word", box: 0, correct: 0, wrong: 0, streak: 0 }])
    );
    localStorage.setItem("day_records", JSON.stringify([{ date: "2026-02-01", completed: true }]));
    localStorage.setItem("answer_logs", JSON.stringify([{ itemId: "tiny", ts: 5, correct: true }]));

    const migrated = await migrateLegacyDataToChild("child-2");

    expect(migrated).toBe(true);
    expect(firestoreStore.map.get("users/parent-uid/children/child-2/items/tiny")).toMatchObject({
      itemId: "tiny",
    });
    expect(firestoreStore.map.get("users/parent-uid/children/child-2/days/2026-02-01")).toBeTruthy();
    expect(firestoreStore.map.get("users/parent-uid/children/child-2/answers/5_tiny")).toBeTruthy();
  });

  it("is a no-op with nothing to migrate", async () => {
    const migrated = await migrateLegacyDataToChild("child-3");
    expect(migrated).toBe(false);
  });

  it("does not run twice for the same child (marker-based)", async () => {
    localStorage.setItem(
      "scheduler_items",
      JSON.stringify([{ itemId: "tiny", type: "word", box: 0, correct: 0, wrong: 0, streak: 0 }])
    );

    const first = await migrateLegacyDataToChild("child-4");
    expect(first).toBe(true);

    // Simulate new legacy data appearing after the fact — should still be
    // ignored, since this child was already migrated once.
    localStorage.setItem(
      "scheduler_items",
      JSON.stringify([
        { itemId: "tiny", type: "word", box: 0, correct: 0, wrong: 0, streak: 0 },
        { itemId: "huge", type: "word", box: 0, correct: 0, wrong: 0, streak: 0 },
      ])
    );
    const second = await migrateLegacyDataToChild("child-4");
    expect(second).toBe(false);
    expect(firestoreStore.map.has("users/parent-uid/children/child-4/items/huge")).toBe(false);
  });

  it("does not overwrite a child that already has data in Firestore", async () => {
    firestoreStore.map.set("users/parent-uid/children/child-5/items/existing", { itemId: "existing" });
    localStorage.setItem(
      "scheduler_items",
      JSON.stringify([{ itemId: "should-not-appear", type: "word", box: 0, correct: 0, wrong: 0, streak: 0 }])
    );

    const migrated = await migrateLegacyDataToChild("child-5");

    expect(migrated).toBe(false);
    expect(firestoreStore.map.has("users/parent-uid/children/child-5/items/should-not-appear")).toBe(false);
  });

  it("returns false in local-only mode", async () => {
    firebaseAvailable = false;
    expect(await migrateLegacyDataToChild("child-6")).toBe(false);
  });
});
