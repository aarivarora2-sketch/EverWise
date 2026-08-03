import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBh2YBYirlY1KwuPIUwmxJoNfYHhxfbahQ",
  authDomain: "games-caf0e.firebaseapp.com",
  projectId: "games-caf0e",
  storageBucket: "games-caf0e.firebasestorage.app",
  messagingSenderId: "794556700045",
  appId: "1:794556700045:web:07bba912912e8c98a799c4",
  measurementId: "G-VXZ2QKNLPK",
};

// Warn loudly if the placeholder config hasn't been replaced yet — this is the
// #1 reason auth/Firestore "don't connect".
const isPlaceholderConfig = Object.values(firebaseConfig).some(
  (v) => typeof v === "string" && v.startsWith("YOUR_")
);
if (isPlaceholderConfig) {
  console.error(
    "[Everwise][firebase] Using PLACEHOLDER config in src/firebase.js. " +
      "Auth and Firestore will NOT work until you paste your real Firebase keys."
  );
} else {
  console.log("[Everwise][firebase] Config loaded for project:", firebaseConfig.projectId);
}

const app = initializeApp(firebaseConfig);

// Capacitor runs the app on a custom URL scheme. Explicit persistence avoids
// an indefinite auth startup while preserving sign-in between app launches.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});
// This project's Firestore was created as a named database with id "default"
// (not the special "(default)" database), so reference it by name.
export const db = getFirestore(app, "default");

console.log("[Everwise][firebase] initializeApp complete; auth and db ready.");

export default app;
