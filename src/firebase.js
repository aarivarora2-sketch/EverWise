import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxAaPSwB1XO5Gun80Oo-d9B7Zg6QjSWuI",
  authDomain: "everwise-46cf0.firebaseapp.com",
  projectId: "everwise-46cf0",
  storageBucket: "everwise-46cf0.firebasestorage.app",
  messagingSenderId: "690378000885",
  appId: "1:690378000885:web:6c93ab4e894f051449f8bc"
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

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("[Everwise][firebase] initializeApp complete; auth and db ready.");

export default app;