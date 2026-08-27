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
});
