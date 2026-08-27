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

/**
 * Get user UID
 */
async function getUserId(): Promise<string> {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) {
    return "local_user";
  }
  return auth.currentUser.uid;
}

/**
 * Save user profile
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!isFirebaseAvailable()) {
    // Fall back to localStorage
    localStorage.setItem("user_profile", JSON.stringify(profile));
    return;
  }

  const db = getFirebaseDb();
  const uid = await getUserId();
  const userDoc = doc(db!, `users/${uid}`);

  try {
    await setDoc(userDoc, { profile }, { merge: true });
  } catch (error) {
    console.error("Failed to save user profile:", error);
    localStorage.setItem("user_profile", JSON.stringify(profile));
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  if (!isFirebaseAvailable()) {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      return JSON.parse(stored);
    }
    return createUserProfile();
  }

  const db = getFirebaseDb();
  const uid = await getUserId();
  const userDoc = doc(db!, `users/${uid}`);

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
    localStorage.setItem("scheduler_items", JSON.stringify(items));
    return;
  }

  const db = getFirebaseDb();
  const uid = await getUserId();
  const itemDoc = doc(db!, `users/${uid}/items/${item.itemId}`);

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
    localStorage.setItem("scheduler_items", JSON.stringify(items));
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
  const uid = await getUserId();
  const itemsRef = collection(db!, `users/${uid}/items`);

  try {
    const snap = await getDocs(itemsRef);
    return snap.docs.map((d) => d.data() as SchedulerItem);
  } catch (error) {
    console.error("Failed to get scheduler items:", error);
    return getSchedulerItemsFromLocal();
  }
}

function getSchedulerItemsFromLocal(): SchedulerItem[] {
  const stored = localStorage.getItem("scheduler_items");
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
    localStorage.setItem("day_records", JSON.stringify(records));
    return;
  }

  const db = getFirebaseDb();
  const uid = await getUserId();
  const dayDoc = doc(db!, `users/${uid}/days/${record.date}`);

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
    localStorage.setItem("day_records", JSON.stringify(records));
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
  const uid = await getUserId();
  const dayDoc = doc(db!, `users/${uid}/days/${date}`);

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
  const uid = await getUserId();
  const daysRef = collection(db!, `users/${uid}/days`);

  try {
    const snap = await getDocs(daysRef);
    return snap.docs.map((d) => d.data() as DayRecord);
  } catch (error) {
    console.error("Failed to get day records:", error);
    return getDayRecordsFromLocal();
  }
}

function getDayRecordsFromLocal(): DayRecord[] {
  const stored = localStorage.getItem("day_records");
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
    localStorage.setItem("answer_logs", JSON.stringify(logs));
    return;
  }

  const db = getFirebaseDb();
  const uid = await getUserId();
  const answersRef = collection(db!, `users/${uid}/answers`);

  try {
    const newDoc = doc(answersRef);
    await setDoc(newDoc, log);
  } catch (error) {
    console.error("Failed to log answer:", error);
    // Fall back to localStorage
    const logs = getAnswerLogsFromLocal();
    logs.push(log);
    localStorage.setItem("answer_logs", JSON.stringify(logs));
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
  const uid = await getUserId();
  const answersRef = collection(db!, `users/${uid}/answers`);

  try {
    const snap = await getDocs(answersRef);
    return snap.docs.map((d) => d.data() as AnswerLog);
  } catch (error) {
    console.error("Failed to get answer logs:", error);
    return getAnswerLogsFromLocal();
  }
}

function getAnswerLogsFromLocal(): AnswerLog[] {
  const stored = localStorage.getItem("answer_logs");
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
 * One-time migration: if the child already has progress in localStorage (local-only mode)
 * and this Firebase user has no scheduler items yet, copy everything up to Firestore.
 * Safe to call on every start-up; it no-ops once done.
 */
export async function migrateLocalToCloud(): Promise<boolean> {
  if (!isFirebaseAvailable()) return false;
  const uid = await getUserId();
  const marker = localStorage.getItem("migrated_to_cloud");
  if (marker === uid) return false;

  const localItems: SchedulerItem[] = JSON.parse(localStorage.getItem("scheduler_items") || "[]");
  if (localItems.length === 0) {
    localStorage.setItem("migrated_to_cloud", uid);
    return false;
  }

  const db = getFirebaseDb()!;
  const existing = await getDocs(collection(db, `users/${uid}/items`));
  if (!existing.empty) {
    localStorage.setItem("migrated_to_cloud", uid);
    return false;
  }

  const profileRaw = localStorage.getItem("user_profile");
  if (profileRaw) await setDoc(doc(db, `users/${uid}`), { profile: JSON.parse(profileRaw) }, { merge: true });
  for (const item of localItems) await setDoc(doc(db, `users/${uid}/items/${item.itemId}`), item);
  const days: DayRecord[] = JSON.parse(localStorage.getItem("day_records") || "[]");
  for (const d of days) await setDoc(doc(db, `users/${uid}/days/${d.date}`), d);
  const logs: AnswerLog[] = JSON.parse(localStorage.getItem("answer_logs") || "[]");
  for (const l of logs) await setDoc(doc(db, `users/${uid}/answers/${l.ts}_${l.itemId}`), l);

  localStorage.setItem("migrated_to_cloud", uid);
  console.log(`Migrated ${localItems.length} items, ${days.length} days, ${logs.length} answers to Firestore.`);
  return true;
}
