import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase
 * If env vars are missing, falls back to local-only mode using localStorage
 */
export async function initFirebase(): Promise<void> {
  if (app) return;

  // Check if Firebase config is complete
  const isConfigComplete = Object.values(firebaseConfig).every((v) => v);

  if (!isConfigComplete) {
    console.warn("Firebase config incomplete. Running in local-only mode.");
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Enable offline persistence
    await enableIndexedDbPersistence(db);

    // Sign in anonymously
    await signInAnonymously(auth);
    console.log("Firebase initialized. Signed in anonymously.");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    app = null;
    auth = null;
    db = null;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  return db;
}

/**
 * Check if Firebase is available
 */
export function isFirebaseAvailable(): boolean {
  return app !== null && auth !== null && db !== null;
}
