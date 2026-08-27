import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * A minimal in-memory Firestore fake — just enough of doc/collection/setDoc/
 * getDoc/getDocs to exercise progress.ts's path-building without a real
 * Firestore connection. Paths are the only thing under test here (that
 * per-child data lands under `users/{uid}/children/{childId}/...`), not
 * Firestore's own behaviour.
 */
const { firestoreStore, resetFirestoreStore } = vi.hoisted(() => {
  const store = new Map<string, unknown>();
  let autoIdCounter = 0;
  return {
    firestoreStore: {
      map: store,
      nextAutoId: () => `auto${autoIdCounter++}`,
    },
    resetFirestoreStore: () => {
      store.clear();
      autoIdCounter = 0;
    },
  };
});

vi.mock("firebase/firestore", () => {
  function doc(dbOrCollRef: { path: string }, maybePath?: string) {
    if (maybePath === undefined) {
      const id = firestoreStore.nextAutoId();
      return { path: `${dbOrCollRef.path}/${id}`, id };
    }
    return { path: maybePath, id: maybePath.split("/").pop()! };
  }
  function collection(_db: unknown, path: string) {
    return { path };
  }
  async function setDoc(ref: { path: string }, data: unknown, opts?: { merge?: boolean }) {
    // Real Firestore throws on any field with a literal `undefined` value
    // ("Unsupported field value: undefined") — mirror that here so tests
    // relying on this fake actually catch that class of bug, instead of
    // silently accepting whatever's passed.
    if (data && typeof data === "object") {
      for (const [key, value] of Object.entries(data as object)) {
        if (value === undefined) {
          throw new Error(`Function setDoc() called with invalid data. Unsupported field value: undefined (found in field ${key})`);
        }
      }
    }
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

import {
  listChildren,
  createChild,
  getActiveChild,
  getActiveChildId,
  setActiveChildId,
  clearActiveChild,
  saveSchedulerItem,
  getSchedulerItems,
  saveDayRecord,
  logAnswer,
  saveUserProfile,
  getUserProfile,
  getChildRawData,
} from "../src/store/progress";

describe("child profiles + scoped paths", () => {
  beforeEach(() => {
    resetFirestoreStore();
    localStorage.clear();
    firebaseAvailable = true;
    mockAuthState.currentUser = { uid: "parent-uid" };
  });

  describe("active child id (localStorage)", () => {
    it("is null until set, and persists across get/set/clear", () => {
      expect(getActiveChildId()).toBeNull();
      setActiveChildId("child-1");
      expect(getActiveChildId()).toBe("child-1");
      clearActiveChild();
      expect(getActiveChildId()).toBeNull();
    });
  });

  describe("createChild / listChildren", () => {
    it("creates a child under the signed-in account and lists it back", async () => {
      const child = await createChild("Ava", "🌸");
      expect(child.name).toBe("Ava");
      expect(child.emoji).toBe("🌸");
      expect(child.id).toBeTruthy();

      const list = await listChildren();
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ id: child.id, name: "Ava", emoji: "🌸" });
    });

    it("stores each child under users/{uid}/children/{childId}", async () => {
      const child = await createChild("Ben");
      const stored = firestoreStore.map.get(`users/parent-uid/children/${child.id}`);
      expect(stored).toMatchObject({ name: "Ben" });
    });

    it("throws when there's no signed-in account", async () => {
      mockAuthState.currentUser = null;
      await expect(createChild("Nobody")).rejects.toThrow();
    });

    it("listChildren returns an empty array in local-only mode", async () => {
      firebaseAvailable = false;
      expect(await listChildren()).toEqual([]);
    });
  });

  describe("getActiveChild", () => {
    it("returns the active child's own profile (name/emoji), not another child's", async () => {
      const alice = await createChild("Alice", "🌸");
      const bob = await createChild("Bob", "🐝");

      setActiveChildId(bob.id);
      expect(await getActiveChild()).toMatchObject({ id: bob.id, name: "Bob", emoji: "🐝" });

      setActiveChildId(alice.id);
      expect(await getActiveChild()).toMatchObject({ id: alice.id, name: "Alice", emoji: "🌸" });
    });

    it("returns null when no child is active, or none is signed in, or in local-only mode", async () => {
      expect(await getActiveChild()).toBeNull();

      const child = await createChild("Ava");
      setActiveChildId(child.id);
      mockAuthState.currentUser = null;
      expect(await getActiveChild()).toBeNull();

      mockAuthState.currentUser = { uid: "parent-uid" };
      firebaseAvailable = false;
      expect(await getActiveChild()).toBeNull();
    });
  });

  describe("scoped scheduler item paths", () => {
    it("writes and reads scheduler items under the active child's path, not another child's", async () => {
      const alice = await createChild("Alice");
      const bob = await createChild("Bob");

      setActiveChildId(alice.id);
      await saveSchedulerItem({
        itemId: "huge",
        type: "word",
        introducedOn: "2026-01-01",
        box: 1,
        correct: 1,
        wrong: 0,
        streak: 1,
        lastSeen: "2026-01-01",
        nextDue: "2026-01-02",
      });

      setActiveChildId(bob.id);
      const bobItems = await getSchedulerItems();
      expect(bobItems).toEqual([]);

      setActiveChildId(alice.id);
      const aliceItems = await getSchedulerItems();
      expect(aliceItems).toHaveLength(1);
      expect(aliceItems[0].itemId).toBe("huge");

      expect(firestoreStore.map.has(`users/parent-uid/children/${alice.id}/items/huge`)).toBe(true);
      expect(firestoreStore.map.has(`users/parent-uid/children/${bob.id}/items/huge`)).toBe(false);
    });
  });

  describe("getChildRawData (for comparing children)", () => {
    it("fetches a specific child's data by id, independent of which child is currently active", async () => {
      const alice = await createChild("Alice");
      const bob = await createChild("Bob");

      setActiveChildId(alice.id);
      await saveSchedulerItem({
        itemId: "huge",
        type: "word",
        introducedOn: "2026-01-01",
        box: 1,
        correct: 1,
        wrong: 0,
        streak: 1,
        lastSeen: "2026-01-01",
        nextDue: "2026-01-02",
      });
      await saveDayRecord({
        date: "2026-01-01",
        wordIds: ["huge"],
        grammarId: "lesson_1",
        completed: true,
        quizResults: [],
        accuracy: 100,
        durationSec: 60,
      });
      await logAnswer({ day: "2026-01-01", itemId: "huge", qType: "meaning", correct: true, ts: 1 });
      const aliceProfile = await getUserProfile();
      aliceProfile.streak = 5;
      await saveUserProfile(aliceProfile);

      // Switch active child to Bob — getChildRawData(alice.id) should be
      // unaffected, since it reads by explicit id, not the active one.
      setActiveChildId(bob.id);

      const aliceData = await getChildRawData(alice.id);
      expect(aliceData.items).toHaveLength(1);
      expect(aliceData.items[0].itemId).toBe("huge");
      expect(aliceData.dayRecords).toHaveLength(1);
      expect(aliceData.logs).toHaveLength(1);
      expect(aliceData.profile.streak).toBe(5);

      const bobData = await getChildRawData(bob.id);
      expect(bobData.items).toEqual([]);
      expect(bobData.dayRecords).toEqual([]);
      expect(bobData.logs).toEqual([]);
      expect(bobData.profile.streak).toBe(0);
    });

    it("returns empty data in local-only mode or with no signed-in account", async () => {
      const empty = { items: [], dayRecords: [], logs: [] };

      firebaseAvailable = false;
      expect(await getChildRawData("whatever")).toMatchObject(empty);

      firebaseAvailable = true;
      mockAuthState.currentUser = null;
      expect(await getChildRawData("whatever")).toMatchObject(empty);
    });
  });

  describe("saveSchedulerItem (regression: a literal undefined field must not crash the write)", () => {
    it("saves a grammar item with no spellBox without throwing, and doesn't store an undefined field", async () => {
      const child = await createChild("Ava");
      setActiveChildId(child.id);

      // Mirrors what markCorrect() used to produce for a grammar item
      // before its fix: an explicit `spellBox: undefined` key, which real
      // Firestore's setDoc() rejects outright (see the fake's setDoc
      // above). This should no longer reach Firestore at all.
      await saveSchedulerItem({
        itemId: "lesson_1",
        type: "grammar",
        introducedOn: "2026-01-01",
        box: 1,
        correct: 1,
        wrong: 0,
        streak: 1,
        lastSeen: "2026-01-01",
        nextDue: "2026-01-02",
        spellBox: undefined,
      } as any);

      const stored = firestoreStore.map.get(`users/parent-uid/children/${child.id}/items/lesson_1`);
      expect(stored).toBeTruthy();
      expect("spellBox" in (stored as object)).toBe(false);

      const items = await getSchedulerItems();
      expect(items.find((i) => i.itemId === "lesson_1")).toBeTruthy();
    });
  });
});
