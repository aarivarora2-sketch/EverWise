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
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            setProfile(snap.data());
            setScreen("home");
          }
        } catch {
          // ignore — a fresh sign-up populates the profile explicitly below
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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const initial = {
      name,
      email,
      streak: 0,
      scamsCaught: 0,
      completedLessons: [],
      lastCompletedDate: null,
    };
    await setDoc(doc(db, "users", cred.user.uid), initial);
    setUser(cred.user);
    setProfile(initial);
    setScreen("home");
  };

  const logIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (snap.exists()) setProfile(snap.data());
    setUser(cred.user);
    setScreen("home");
  };

  const logOut = async () => {
    await signOut(auth);
    // onAuthStateChanged clears profile and returns to Landing.
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
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch {
        // Keep the optimistic local update even if the write fails offline.
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
