import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { lessons } from "./data/lessons";
import PhoneShell from "./components/PhoneShell";
import Landing from "./screens/Landing";
import SignUp from "./screens/SignUp";
import LogIn from "./screens/LogIn";
import Loading from "./screens/Loading";
import Home from "./screens/Home";
import LessonPath from "./screens/LessonPath";
import Learn from "./screens/Learn";
import Quiz from "./screens/Quiz";
import Result from "./screens/Result";
import Complete from "./screens/Complete";

// Local calendar-day string (YYYY-MM-DD) so streaks track the user's own day.
function dayString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Given the last completed day, decide the new streak value for a completion today.
function nextStreak(prevStreak, lastCompletedDate, today) {
  if (lastCompletedDate === today) return prevStreak; // already counted today
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastCompletedDate === dayString(yesterday)) return prevStreak + 1;
  return 1; // first ever, or the streak was broken
}

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Firestore users/{uid} data
  const [screen, setScreen] = useState("landing");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  // Watch auth state: a returning, logged-in user skips Landing and lands on Home.
  useEffect(() => {
    console.log("[Everwise][auth] Subscribing to onAuthStateChanged…");
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log(
        "[Everwise][auth] state changed:",
        u ? `logged in (uid: ${u.uid})` : "no user logged in"
      );
      setUser(u);
      if (u) {
        try {
          console.log("[Everwise][firestore] getDoc users/", u.uid);
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            console.log("[Everwise][firestore] profile loaded:", snap.data());
            setProfile(snap.data());
            setScreen("home");
          } else {
            console.warn(
              "[Everwise][firestore] No profile doc for this user yet (uid:",
              u.uid + ")."
            );
          }
        } catch (err) {
          console.error("[Everwise][firestore] Failed to load profile:", err);
        }
      } else {
        setProfile(null);
        setScreen("landing");
      }
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  const activeLesson = lessons[activeIndex];
  const completedLessons = profile?.completedLessons ?? [];
  const allDone = completedLessons.length >= lessons.length;

  const goHome = () => setScreen("home");
  const goPath = () => setScreen("path");

  // --- Auth actions (screens await these and surface any error) ---

  const signUp = async (name, email, password) => {
    try {
      console.log("[Everwise][auth] createUserWithEmailAndPassword:", email);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[Everwise][auth] account created, uid:", cred.user.uid);

      const initial = {
        name,
        email,
        streak: 0,
        scamsCaught: 0,
        completedLessons: [],
        lastCompletedDate: null,
      };
      console.log("[Everwise][firestore] setDoc users/", cred.user.uid, initial);
      await setDoc(doc(db, "users", cred.user.uid), initial);
      console.log("[Everwise][firestore] profile document created.");

      setUser(cred.user);
      setProfile(initial);
      setScreen("home");
    } catch (err) {
      console.error("[Everwise][auth] Sign up failed:", err.code, err.message);
      throw err; // let the Sign Up screen show a friendly message
    }
  };

  const logIn = async (email, password) => {
    try {
      console.log("[Everwise][auth] signInWithEmailAndPassword:", email);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("[Everwise][auth] signed in, uid:", cred.user.uid);

      console.log("[Everwise][firestore] getDoc users/", cred.user.uid);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        console.log("[Everwise][firestore] profile loaded:", snap.data());
        setProfile(snap.data());
      } else {
        console.warn("[Everwise][firestore] Signed in but no profile doc found.");
      }
      setUser(cred.user);
      setScreen("home");
    } catch (err) {
      console.error("[Everwise][auth] Log in failed:", err.code, err.message);
      throw err; // let the Log In screen show a friendly message
    }
  };

  const logOut = async () => {
    try {
      console.log("[Everwise][auth] signOut");
      await signOut(auth);
      console.log("[Everwise][auth] signed out.");
      // onAuthStateChanged clears profile and returns to Landing.
    } catch (err) {
      console.error("[Everwise][auth] Sign out failed:", err);
    }
  };

  // --- Lesson flow ---

  const startLesson = (index) => {
    setActiveIndex(index);
    setSelected(null);
    setScreen("learn");
  };

  const answer = (choice) => {
    setSelected(choice);
    setScreen("result");
  };

  const finishLesson = async () => {
    if (user && profile) {
      const correct = selected === activeLesson.correct;
      const already = completedLessons.includes(activeLesson.id);
      const today = dayString(new Date());

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeLesson.id],
        // Count a caught scam once per lesson, only on a correct answer.
        scamsCaught: profile.scamsCaught + (correct && !already ? 1 : 0),
        streak: nextStreak(profile.streak, profile.lastCompletedDate, today),
        lastCompletedDate: today,
      };

      setProfile((p) => ({ ...p, ...updates }));
      try {
        console.log("[Everwise][firestore] updateDoc users/", user.uid, updates);
        await updateDoc(doc(db, "users", user.uid), updates);
        console.log("[Everwise][firestore] progress saved.");
      } catch (err) {
        // Keep the optimistic local update even if the write fails offline.
        console.error("[Everwise][firestore] Failed to save progress:", err);
      }
    }
    setScreen("complete");
  };

  if (!authChecked) {
    return (
      <PhoneShell>
        <Loading />
      </PhoneShell>
    );
  }

  let content;
  switch (screen) {
    case "landing":
      content = (
        <Landing
          onGetStarted={() => setScreen("signup")}
          onLogIn={() => setScreen("login")}
        />
      );
      break;
    case "signup":
      content = (
        <SignUp
          onSignUp={signUp}
          onGoToLogIn={() => setScreen("login")}
          onBack={() => setScreen("landing")}
        />
      );
      break;
    case "login":
      content = (
        <LogIn
          onLogIn={logIn}
          onGoToSignUp={() => setScreen("signup")}
          onBack={() => setScreen("landing")}
        />
      );
      break;
    case "home":
      content = (
        <Home
          name={profile?.name ?? ""}
          streak={profile?.streak ?? 0}
          scamsCaught={profile?.scamsCaught ?? 0}
          allDone={allDone}
          onStart={goPath}
          onLogOut={logOut}
        />
      );
      break;
    case "path":
      content = (
        <LessonPath
          completedLessons={completedLessons}
          streak={profile?.streak ?? 0}
          scamsCaught={profile?.scamsCaught ?? 0}
          onSelectLesson={startLesson}
          onBack={goHome}
        />
      );
      break;
    case "learn":
      content = (
        <Learn
          lesson={activeLesson}
          onContinue={() => setScreen("quiz")}
          onBack={goPath}
        />
      );
      break;
    case "quiz":
      content = (
        <Quiz
          lesson={activeLesson}
          onAnswer={answer}
          onBack={() => setScreen("learn")}
        />
      );
      break;
    case "result":
      content = (
        <Result
          lesson={activeLesson}
          selected={selected}
          onContinue={finishLesson}
          onBack={() => setScreen("quiz")}
        />
      );
      break;
    case "complete":
      content = (
        <Complete
          streak={profile?.streak ?? 0}
          scamsCaught={profile?.scamsCaught ?? 0}
          wasProtection={activeLesson.type === "protection"}
          allDone={allDone}
          onDone={goPath}
        />
      );
      break;
    default:
      content = null;
  }

  return (
    <PhoneShell>
      {/* key on screen so entrance animations replay on each navigation */}
      <div key={screen} className="flex flex-1 flex-col">
        {content}
      </div>
    </PhoneShell>
  );
}
