import {
  getFirebaseDb,
  isFirebaseAvailable,
  getFirebaseAuth,
} from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import type { SchedulerItem } from "../lib/scheduler";
import { getTodayKey } from "../lib/dates";

export interface UserProfile {
  name: string;
  createdAt: string;
  streak: number;
  lastCompletedDay: string;
  pinHash: string; // hash of PIN (default: hash of "1234")
}

export interface ChildProfile {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  // The child's own 4-digit PIN, guarding entry into their profile from the
  // picker — separate from UserProfile.pinHash, which gates the *parent's*
  // Insights page. Optional so older profiles created before this field
  // existed still type-check; treat a missing value as the same "1234"
  // default a brand-new profile gets.
  profilePinHash?: string;
}

export const DEFAULT_CHILD_PIN = "1234";

export interface DayRecord {
  date: string;
  wordIds: string[];
  grammarId: string;
  completed: boolean;
  quizResults: Array<{
    itemId: string;
    qType: string;
    correct: boolean;
    ts: number;
  }>;
  accuracy: number;
  durationSec: number;
}

export interface AnswerLog {
  day: string;
  itemId: string;
  qType: string;
  correct: boolean;
  ts: number;
}

/**
 * Initialize a new user profile with default PIN hash
 */
export function createUserProfile(): UserProfile {
  return {
    name: "Learner",
    createdAt: new Date().toISOString(),
    streak: 0,
    lastCompletedDay: "",
    pinHash: hashPin("1234"), // default PIN
  };
}

/**
 * Simple hash function for PIN (not cryptographic, just for basic obfuscation)
 */
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// ---------------------------------------------------------------------------
// Child profiles — each signed-in account can have multiple children, each
// with their own independent scheduler/day-record/answer-log history. All
// per-child reads/writes below go through getScopedBasePath(), which is the
// single place that knows how to build `users/{uid}/children/{childId}/...`.
// ---------------------------------------------------------------------------

const ACTIVE_CHILD_KEY = "active_child_id";

export function getActiveChildId(): string | null {
  return localStorage.getItem(ACTIVE_CHILD_KEY);
}

export function setActiveChildId(id: string): void {
  localStorage.setItem(ACTIVE_CHILD_KEY, id);
}

export function clearActiveChild(): void {
  localStorage.removeItem(ACTIVE_CHILD_KEY);
}

/**
 * List the child profiles under the signed-in account.
 */
export async function listChildren(): Promise<ChildProfile[]> {
  if (!isFirebaseAvailable()) return [];
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!uid) return [];

  const db = getFirebaseDb()!;
  try {
    const snap = await getDocs(collection(db, `users/${uid}/children`));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChildProfile, "id">) }));
  } catch (error) {
    console.error("Failed to list children:", error);
    return [];
  }
}

/**
 * The currently-active child's own profile (name/emoji) — not to be
 * confused with UserProfile, which holds streak/PIN and lives *under* the
 * child rather than describing them. Used to show whose progress is being
 * viewed (Home's greeting, the "Switch profile" label).
 */
export async function getActiveChild(): Promise<ChildProfile | null> {
  if (!isFirebaseAvailable()) return null;
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  const childId = getActiveChildId();
  if (!uid || !childId) return null;

  const db = getFirebaseDb()!;
  try {
    const snap = await getDoc(doc(db, `users/${uid}/children/${childId}`));
    if (!snap.exists()) return null;
    // Use the childId we already fetched by, not snap.id — equivalent
    // against real Firestore, but doesn't assume the snapshot's own id
    // field is populated (kept this way after finding the test's minimal
    // Firestore fake didn't set it, which real Firestore always does).
    return { id: childId, ...(snap.data() as Omit<ChildProfile, "id">) };
  } catch (error) {
    console.error("Failed to load the active child profile:", error);
    return null;
  }
}

export interface ChildRawData {
  items: SchedulerItem[];
  dayRecords: DayRecord[];
  logs: AnswerLog[];
  profile: UserProfile;
}

/**
 * Fetch a specific child's full progress data directly by id — not
 * necessarily the active one. Used by the parent-facing "compare children"
 * page. Firestore-only: there's no meaningful local-storage fallback for a
 * child that isn't the one active on this device, so this simply returns
 * empty data rather than reading another child's cache off the current
 * device's localStorage.
 */
export async function getChildRawData(childId: string): Promise<ChildRawData> {
  const empty: ChildRawData = { items: [], dayRecords: [], logs: [], profile: createUserProfile() };
  if (!isFirebaseAvailable()) return empty;
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!uid) return empty;

  const db = getFirebaseDb()!;
  const basePath = `users/${uid}/children/${childId}`;

  try {
    const [itemsSnap, daysSnap, answersSnap, profileSnap] = await Promise.all([
      getDocs(collection(db, `${basePath}/items`)),
      getDocs(collection(db, `${basePath}/days`)),
      getDocs(collection(db, `${basePath}/answers`)),
      getDoc(doc(db, basePath)),
    ]);

    return {
      items: itemsSnap.docs.map((d) => d.data() as SchedulerItem),
      dayRecords: daysSnap.docs.map((d) => d.data() as DayRecord),
      logs: answersSnap.docs.map((d) => d.data() as AnswerLog),
      profile: (profileSnap.exists() && profileSnap.data().profile) || createUserProfile(),
    };
  } catch (error) {
    console.error(`Failed to load progress for child ${childId}:`, error);
    return empty;
  }
}

/**
 * Create a new child profile under the signed-in account.
 */
export async function createChild(name: string, emoji = "🌱"): Promise<ChildProfile> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!isFirebaseAvailable() || !uid) {
    throw new Error("Cannot create a child profile without a signed-in account.");
  }

  const db = getFirebaseDb()!;
  const newDoc = doc(collection(db, `users/${uid}/children`));
  const child: ChildProfile = {
    id: newDoc.id,
    name,
    emoji,
    createdAt: new Date().toISOString(),
    profilePinHash: hashPin(DEFAULT_CHILD_PIN),
  };
  await setDoc(newDoc, {
    name: child.name,
    emoji: child.emoji,
    createdAt: child.createdAt,
    profilePinHash: child.profilePinHash,
  });
  return child;
}

/**
 * Set (or reset) a child's own profile-entry PIN. Used both for the child's
 * own "My profile" self-service change and for the parent's "reset PIN"
 * control in Manage profiles (called with DEFAULT_CHILD_PIN).
 */
export async function setChildPin(childId: string, pin: string): Promise<void> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!isFirebaseAvailable() || !uid) {
    throw new Error("Cannot set a child's PIN without a signed-in account.");
  }

  const db = getFirebaseDb()!;
  await setDoc(doc(db, `users/${uid}/children/${childId}`), { profilePinHash: hashPin(pin) }, { merge: true });
}

/**
 * Delete every doc in a child's items/days/answers subcollections. Shared by
 * deleteChild (which also removes the child doc itself) and
 * resetChildProgress (which keeps the child doc, just empties its history).
 * The Firestore JS SDK has no recursive delete, so this is doc-by-doc.
 */
async function clearChildSubcollections(db: ReturnType<typeof getFirebaseDb>, basePath: string): Promise<void> {
  const [itemsSnap, daysSnap, answersSnap] = await Promise.all([
    getDocs(collection(db!, `${basePath}/items`)),
    getDocs(collection(db!, `${basePath}/days`)),
    getDocs(collection(db!, `${basePath}/answers`)),
  ]);

  await Promise.all([
    ...itemsSnap.docs.map((d) => deleteDoc(d.ref)),
    ...daysSnap.docs.map((d) => deleteDoc(d.ref)),
    ...answersSnap.docs.map((d) => deleteDoc(d.ref)),
  ]);
}

/**
 * Permanently delete a child profile and all of its progress data
 * (scheduler items, day records, answer logs). If the deleted child was
 * active on this device, clears that so the app falls back to the picker
 * instead of pointing at a child that no longer exists.
 */
export async function deleteChild(childId: string): Promise<void> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!isFirebaseAvailable() || !uid) {
    throw new Error("Cannot delete a child profile without a signed-in account.");
  }

  const db = getFirebaseDb()!;
  const basePath = `users/${uid}/children/${childId}`;

  await clearChildSubcollections(db, basePath);
  await deleteDoc(doc(db, basePath));

  if (getActiveChildId() === childId) {
    clearActiveChild();
  }
}

/**
 * Wipe a child's progress (scheduler items, day records, answer logs, streak)
 * without deleting the profile itself — name, emoji, and PIN are preserved.
 */
export async function resetChildProgress(childId: string): Promise<void> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!isFirebaseAvailable() || !uid) {
    throw new Error("Cannot reset progress without a signed-in account.");
  }

  const db = getFirebaseDb()!;
  const basePath = `users/${uid}/children/${childId}`;

  const [, childSnap] = await Promise.all([
    clearChildSubcollections(db, basePath),
    getDoc(doc(db, basePath)),
  ]);

  const existingProfile = (childSnap.exists() && childSnap.data().profile) || createUserProfile();
  const resetProfile: UserProfile = { ...existingProfile, streak: 0, lastCompletedDay: "" };
  await setDoc(doc(db, basePath), { profile: resetProfile }, { merge: true });
}

/**
 * Update a child's own name and/or emoji (not their UserProfile).
 */
export async function updateChild(childId: string, updates: { name?: string; emoji?: string }): Promise<void> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!isFirebaseAvailable() || !uid) {
    throw new Error("Cannot update a child profile without a signed-in account.");
  }

  const db = getFirebaseDb()!;
  await setDoc(doc(db, `users/${uid}/children/${childId}`), updates, { merge: true });
}

/**
 * The Firestore path (or local-mode sentinel) everything below reads/writes
 * under. Firebase-configured + signed-in + a child selected is the only
 * path AuthGate lets any page reach in practice; the "local" fallback exists
 * so this never throws if called out of order (e.g. in a test).
 */
async function getScopedBasePath(): Promise<string> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  const childId = getActiveChildId();
  if (!uid || !childId) {
    return "users/local_user";
  }
  return `users/${uid}/children/${childId}`;
}

/**
 * Local-storage fallback keys are suffixed per child so a transient
 * Firestore error's fallback can't mix up two children's data on the same
 * device. Pure local-only mode (no Firebase configured at all — e.g. `npm
 * run dev` without `.env`) has no children and keeps the original unscoped
 * keys, unchanged from before this file supported multiple profiles.
 */
function localKey(base: string): string {
  if (!isFirebaseAvailable()) return base;
  const childId = getActiveChildId();
  return childId ? `${base}:${childId}` : base;
}

/**
 * Save user profile
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!isFirebaseAvailable()) {
    localStorage.setItem(localKey("user_profile"), JSON.stringify(profile));
    return;
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const userDoc = doc(db!, basePath);

  try {
    await setDoc(userDoc, { profile }, { merge: true });
  } catch (error) {
    console.error("Failed to save user profile:", error);
    localStorage.setItem(localKey("user_profile"), JSON.stringify(profile));
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  if (!isFirebaseAvailable()) {
    const stored = localStorage.getItem(localKey("user_profile"));
    if (stored) {
      return JSON.parse(stored);
    }
    return createUserProfile();
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const userDoc = doc(db!, basePath);

  try {
    const snap = await getDoc(userDoc);
    if (snap.exists() && snap.data().profile) {
      return snap.data().profile;
    }
  } catch (error) {
    console.error("Failed to get user profile:", error);
  }

  return createUserProfile();
}

/**
 * Firestore's setDoc() rejects any field with a literal `undefined` value
 * outright ("Unsupported field value: undefined"), which SchedulerItem's
 * several optional fields (spellBox, spellCorrect, ...) can end up holding
 * after a spread — see markCorrect() in lib/scheduler.ts for the concrete
 * bug this was written for. Applied at the write boundary so any future
 * optional field added to SchedulerItem is covered automatically, instead
 * of relying on every scheduler.ts function to remember to omit the key.
 */
function stripUndefinedFields<T extends object>(obj: T): T {
  const result = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Save scheduler item
 */
export async function saveSchedulerItem(item: SchedulerItem): Promise<void> {
  if (!isFirebaseAvailable()) {
    const items = getSchedulerItemsFromLocal();
    const idx = items.findIndex((i) => i.itemId === item.itemId);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(localKey("scheduler_items"), JSON.stringify(items));
    return;
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const itemDoc = doc(db!, `${basePath}/items/${item.itemId}`);

  try {
    await setDoc(itemDoc, stripUndefinedFields(item), { merge: true });
  } catch (error) {
    console.error("Failed to save scheduler item:", error);
    // Fall back to localStorage
    const items = getSchedulerItemsFromLocal();
    const idx = items.findIndex((i) => i.itemId === item.itemId);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(localKey("scheduler_items"), JSON.stringify(items));
  }
}

/**
 * Get all scheduler items
 */
export async function getSchedulerItems(): Promise<SchedulerItem[]> {
  if (!isFirebaseAvailable()) {
    return getSchedulerItemsFromLocal();
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const itemsRef = collection(db!, `${basePath}/items`);

  try {
    const snap = await getDocs(itemsRef);
    return snap.docs.map((d) => d.data() as SchedulerItem);
  } catch (error) {
    console.error("Failed to get scheduler items:", error);
    return getSchedulerItemsFromLocal();
  }
}

function getSchedulerItemsFromLocal(): SchedulerItem[] {
  const stored = localStorage.getItem(localKey("scheduler_items"));
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Save day record
 */
export async function saveDayRecord(record: DayRecord): Promise<void> {
  if (!isFirebaseAvailable()) {
    const records = getDayRecordsFromLocal();
    const idx = records.findIndex((r) => r.date === record.date);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(localKey("day_records"), JSON.stringify(records));
    return;
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const dayDoc = doc(db!, `${basePath}/days/${record.date}`);

  try {
    await setDoc(dayDoc, record, { merge: true });
  } catch (error) {
    console.error("Failed to save day record:", error);
    // Fall back to localStorage
    const records = getDayRecordsFromLocal();
    const idx = records.findIndex((r) => r.date === record.date);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(localKey("day_records"), JSON.stringify(records));
  }
}

/**
 * Get day record
 */
export async function getDayRecord(date: string): Promise<DayRecord | null> {
  if (!isFirebaseAvailable()) {
    const records = getDayRecordsFromLocal();
    return records.find((r) => r.date === date) || null;
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const dayDoc = doc(db!, `${basePath}/days/${date}`);

  try {
    const snap = await getDoc(dayDoc);
    if (snap.exists()) {
      return snap.data() as DayRecord;
    }
  } catch (error) {
    console.error("Failed to get day record:", error);
  }

  return null;
}

/**
 * Get all day records
 */
export async function getAllDayRecords(): Promise<DayRecord[]> {
  if (!isFirebaseAvailable()) {
    return getDayRecordsFromLocal();
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const daysRef = collection(db!, `${basePath}/days`);

  try {
    const snap = await getDocs(daysRef);
    return snap.docs.map((d) => d.data() as DayRecord);
  } catch (error) {
    console.error("Failed to get day records:", error);
    return getDayRecordsFromLocal();
  }
}

function getDayRecordsFromLocal(): DayRecord[] {
  const stored = localStorage.getItem(localKey("day_records"));
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Log an answer
 */
export async function logAnswer(log: AnswerLog): Promise<void> {
  if (!isFirebaseAvailable()) {
    const logs = getAnswerLogsFromLocal();
    logs.push(log);
    localStorage.setItem(localKey("answer_logs"), JSON.stringify(logs));
    return;
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const answersRef = collection(db!, `${basePath}/answers`);

  try {
    const newDoc = doc(answersRef);
    await setDoc(newDoc, log);
  } catch (error) {
    console.error("Failed to log answer:", error);
    // Fall back to localStorage
    const logs = getAnswerLogsFromLocal();
    logs.push(log);
    localStorage.setItem(localKey("answer_logs"), JSON.stringify(logs));
  }
}

/**
 * Get all answer logs
 */
export async function getAllAnswerLogs(): Promise<AnswerLog[]> {
  if (!isFirebaseAvailable()) {
    return getAnswerLogsFromLocal();
  }

  const db = getFirebaseDb();
  const basePath = await getScopedBasePath();
  const answersRef = collection(db!, `${basePath}/answers`);

  try {
    const snap = await getDocs(answersRef);
    return snap.docs.map((d) => d.data() as AnswerLog);
  } catch (error) {
    console.error("Failed to get answer logs:", error);
    return getAnswerLogsFromLocal();
  }
}

function getAnswerLogsFromLocal(): AnswerLog[] {
  const stored = localStorage.getItem(localKey("answer_logs"));
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Calculate streak
 */
export function calculateStreak(dayRecords: DayRecord[]): number {
  const sorted = dayRecords
    .filter((r) => r.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date(getTodayKey() + "T00:00:00");

  // dayDiff for the i-th (0-indexed) most-recent completed day should be
  // exactly i if the streak is unbroken (today=0, yesterday=1, ...).
  // Previously this also decremented a separate "current date" pointer
  // inside the loop on top of incrementing `streak` — a double-decrement
  // that made every streak longer than 1 day compare against the wrong
  // date and break immediately, capping every real streak at 1.
  for (const record of sorted) {
    const recordDate = new Date(record.date + "T00:00:00");
    const dayDiff = (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * One-time import: pulls a child's pre-existing progress into their new
 * child-scoped path, from either (or both) of two legacy sources:
 *   1. Flat Firestore data at `users/{uid}/items|days|answers` — this is
 *      where progress lived before multiple child profiles existed, back
 *      when every device just had one anonymous uid. Reachable here only
 *      because sign-up links the credential onto that same anonymous
 *      account (see lib/auth.ts signUp) instead of creating a new uid.
 *   2. Pure localStorage data — a device that was ever in local-only mode
 *      (Firebase unavailable) before this account existed.
 * Safe to call once per new child; no-ops on repeat calls (keyed by
 * childId, so creating a second child doesn't re-trigger it for the first).
 */
export async function migrateLegacyDataToChild(childId: string): Promise<boolean> {
  if (!isFirebaseAvailable()) return false;
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!uid) return false;

  const marker = localStorage.getItem("migrated_to_child");
  if (marker === childId) return false;

  const db = getFirebaseDb()!;
  const childBasePath = `users/${uid}/children/${childId}`;

  const existingTarget = await getDocs(collection(db, `${childBasePath}/items`));
  if (!existingTarget.empty) {
    localStorage.setItem("migrated_to_child", childId);
    return false;
  }

  let migratedAny = false;

  // Source 1: legacy flat Firestore data under this same (linked) uid.
  try {
    const legacyItemsSnap = await getDocs(collection(db, `users/${uid}/items`));
    if (!legacyItemsSnap.empty) {
      for (const d of legacyItemsSnap.docs) {
        await setDoc(doc(db, `${childBasePath}/items/${d.id}`), d.data());
      }
      const legacyDaysSnap = await getDocs(collection(db, `users/${uid}/days`));
      for (const d of legacyDaysSnap.docs) {
        await setDoc(doc(db, `${childBasePath}/days/${d.id}`), d.data());
      }
      const legacyAnswersSnap = await getDocs(collection(db, `users/${uid}/answers`));
      for (const d of legacyAnswersSnap.docs) {
        await setDoc(doc(db, `${childBasePath}/answers/${d.id}`), d.data());
      }
      const legacyUserDoc = await getDoc(doc(db, `users/${uid}`));
      if (legacyUserDoc.exists() && legacyUserDoc.data().profile) {
        await setDoc(doc(db, childBasePath), { profile: legacyUserDoc.data().profile }, { merge: true });
      }
      migratedAny = true;
      console.log(
        `Migrated ${legacyItemsSnap.size} legacy items, ${legacyDaysSnap.size} days, ${legacyAnswersSnap.size} answers into child ${childId}.`
      );
    }
  } catch (error) {
    console.error("Failed to migrate legacy Firestore data:", error);
  }

  // Source 2: pure localStorage data (device was local-only before this
  // account existed). Uses the unscoped legacy key names — the same ones
  // `localKey()` falls back to for pure local-only mode.
  const localItems: SchedulerItem[] = JSON.parse(localStorage.getItem("scheduler_items") || "[]");
  if (localItems.length > 0) {
    for (const item of localItems) {
      await setDoc(doc(db, `${childBasePath}/items/${item.itemId}`), item, { merge: true });
    }
    const days: DayRecord[] = JSON.parse(localStorage.getItem("day_records") || "[]");
    for (const d of days) {
      await setDoc(doc(db, `${childBasePath}/days/${d.date}`), d, { merge: true });
    }
    const logs: AnswerLog[] = JSON.parse(localStorage.getItem("answer_logs") || "[]");
    for (const l of logs) {
      await setDoc(doc(db, `${childBasePath}/answers/${l.ts}_${l.itemId}`), l, { merge: true });
    }
    const profileRaw = localStorage.getItem("user_profile");
    if (profileRaw) {
      await setDoc(doc(db, childBasePath), { profile: JSON.parse(profileRaw) }, { merge: true });
    }
    migratedAny = true;
    console.log(`Migrated ${localItems.length} local items, ${days.length} days, ${logs.length} answers into child ${childId}.`);
  }

  localStorage.setItem("migrated_to_child", childId);
  return migratedAny;
}
