import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { lessonsByOrder } from "./data/lessons";
import { getPhase } from "./data/phases";
import PhoneShell from "./components/PhoneShell";
import Landing from "./screens/Landing";
import SignUp from "./screens/SignUp";
import LogIn from "./screens/LogIn";
import Loading from "./screens/Loading";
import Home from "./screens/Home";
import LessonPath from "./screens/LessonPath";
import LessonPlayer from "./screens/LessonPlayer";
import ChallengePlayer from "./screens/ChallengePlayer";
import ExamPlayer from "./screens/ExamPlayer";
import Complete from "./screens/Complete";

function dayString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextStreak(prevStreak, lastCompletedDate, today) {
  if (lastCompletedDate === today) return prevStreak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastCompletedDate === dayString(yesterday)) return prevStreak + 1;
  return 1;
}

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeExam, setActiveExam] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);

  useEffect(() => {
    console.log("speech supported:", "speechSynthesis" in window);
  }, []);

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

  const activeLesson = lessonsByOrder[activeIndex];
  const completedLessons = profile?.completedLessons ?? [];
  const allDone = completedLessons.length >= lessonsByOrder.length;

  const goHome = () => setScreen("home");
  const goPath = () => {
    setActiveExam(null);
    setActiveChallenge(null);
    setScreen("path");
  };

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
        totalXp: 0,
        badges: [],
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
      throw err;
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
      throw err;
    }
  };

  const logOut = async () => {
    try {
      console.log("[Everwise][auth] signOut");
      await signOut(auth);
      console.log("[Everwise][auth] signed out.");
    } catch (err) {
      console.error("[Everwise][auth] Sign out failed:", err);
    }
  };

  const startLesson = (index) => {
    setActiveExam(null);
    setActiveChallenge(null);
    setActiveIndex(index);
    setScreen("lesson");
  };

  const startChallenge = (challenge) => {
    setActiveExam(null);
    setActiveChallenge(challenge);
    setScreen("challenge");
  };

  const startExam = (exam) => {
    setActiveChallenge(null);
    setActiveExam(exam);
    setScreen("exam");
  };

  const finishChallenge = async () => {
    if (user && profile && activeChallenge) {
      const already = completedLessons.includes(activeChallenge.id);
      if (!already) {
        const updates = {
          completedLessons: [...completedLessons, activeChallenge.id],
        };
        setProfile((p) => ({ ...p, ...updates }));
        try {
          console.log(
            "[Everwise][firestore] challenge complete users/",
            user.uid,
            updates
          );
          await updateDoc(doc(db, "users", user.uid), updates);
          console.log("[Everwise][firestore] challenge progress saved.");
        } catch (err) {
          console.error(
            "[Everwise][firestore] Failed to save challenge:",
            err
          );
        }
      }
    }
    goPath();
  };

  const finishLesson = async () => {
    if (user && profile && activeLesson) {
      const already = completedLessons.includes(activeLesson.id);
      const today = dayString(new Date());
      const prevBadges = profile.badges ?? [];
      const prevXp = profile.totalXp ?? 0;

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeLesson.id],
        totalXp: already ? prevXp : prevXp + (activeLesson.xp ?? 20),
        badges:
          already || prevBadges.includes(activeLesson.badge)
            ? prevBadges
            : [...prevBadges, activeLesson.badge],
        streak: nextStreak(
          profile.streak ?? 0,
          profile.lastCompletedDate,
          today
        ),
        lastCompletedDate: today,
      };

      setProfile((p) => ({ ...p, ...updates }));
      try {
        console.log("[Everwise][firestore] updateDoc users/", user.uid, updates);
        await updateDoc(doc(db, "users", user.uid), updates);
        console.log("[Everwise][firestore] progress saved.");
      } catch (err) {
        console.error("[Everwise][firestore] Failed to save progress:", err);
      }
    }
    setScreen("complete");
  };

  const finishExam = async ({
    score,
    tier,
    earnedPhaseBadge,
    phaseBadge,
    phaseBadgeXp = 0,
  }) => {
    if (user && profile && activeExam && tier) {
      const already = completedLessons.includes(activeExam.id);
      const today = dayString(new Date());
      const prevBadges = profile.badges ?? [];
      const prevXp = profile.totalXp ?? 0;

      let nextBadges = [...prevBadges];
      if (!already && tier.title && !nextBadges.includes(tier.title)) {
        nextBadges.push(tier.title);
      }
      if (
        earnedPhaseBadge &&
        phaseBadge &&
        !nextBadges.includes(phaseBadge)
      ) {
        nextBadges.push(phaseBadge);
      }

      const xpGain = already
        ? 0
        : (tier.xp ?? 0) + (earnedPhaseBadge ? phaseBadgeXp : 0);

      const updates = {
        completedLessons: already
          ? completedLessons
          : [...completedLessons, activeExam.id],
        totalXp: prevXp + xpGain,
        badges: nextBadges,
        streak: nextStreak(
          profile.streak ?? 0,
          profile.lastCompletedDate,
          today
        ),
        lastCompletedDate: today,
      };

      setProfile((p) => ({ ...p, ...updates }));
      try {
        console.log(
          "[Everwise][firestore] exam pass update users/",
          user.uid,
          { score, ...updates }
        );
        await updateDoc(doc(db, "users", user.uid), updates);
        console.log("[Everwise][firestore] exam progress saved.");
      } catch (err) {
        console.error("[Everwise][firestore] Failed to save exam:", err);
      }
    }
    goPath();
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
          onSelectChallenge={startChallenge}
          onSelectExam={startExam}
          onBack={goHome}
        />
      );
      break;
    case "lesson":
      content = (
        <LessonPlayer
          key={activeLesson.id}
          lesson={activeLesson}
          onBack={goPath}
          onComplete={() => finishLesson()}
        />
      );
      break;
    case "challenge":
      content = (
        <ChallengePlayer
          key={activeChallenge.id}
          challenge={activeChallenge}
          onBack={goPath}
          onComplete={finishChallenge}
        />
      );
      break;
    case "exam":
      content = (
        <ExamPlayer
          key={activeExam.id}
          exam={activeExam}
          phaseColor={getPhase(activeExam.phase).accent}
          onBack={goPath}
          onPass={finishExam}
        />
      );
      break;
    case "complete":
      content = <Complete lesson={activeLesson} onDone={goPath} />;
      break;
    default:
      content = null;
  }

  return (
    <PhoneShell>
      <div key={screen} className="flex flex-1 flex-col">
        {content}
      </div>
    </PhoneShell>
  );
}
