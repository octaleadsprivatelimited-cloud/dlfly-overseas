import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);
let clients: ReturnType<typeof initializeClients> | undefined;

function initializeClients() {
  if (!firebaseConfigured)
    throw new Error(
      "Firebase is not configured. Add the Firebase web app configuration before signing in.",
    );
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const isWebKit =
    typeof navigator !== "undefined" &&
    /AppleWebKit/.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
  // WebKit can reject the streaming WebChannel transport. Long polling keeps
  // the same realtime subscriptions through a compatible transport.
  const db = initializeFirestore(app, isWebKit ? { experimentalForceLongPolling: true } : {});
  const storage = getStorage(app);
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  }
  return { app, auth, db, storage };
}

export function getFirebaseClients() {
  clients ??= initializeClients();
  return clients;
}
