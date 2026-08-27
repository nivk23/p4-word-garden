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
}

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
function hashPin(pin: string): string {
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
  };
  await setDoc(newDoc, { name: child.name, emoji: child.emoji, createdAt: child.createdAt });
  return child;
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
    await setDoc(itemDoc, item, { merge: true });
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
  const today = getTodayKey();
  let currentDate = new Date(today + "T00:00:00");

  for (const record of sorted) {
    const recordDate = new Date(record.date + "T00:00:00");
    const dayDiff =
      (currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
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
