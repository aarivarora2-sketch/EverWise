import { useState } from "react";
import { lessons } from "./data/lessons";
import PhoneShell from "./components/PhoneShell";
import Home from "./screens/Home";
import LessonPath from "./screens/LessonPath";
import Learn from "./screens/Learn";
import Quiz from "./screens/Quiz";
import Result from "./screens/Result";
import Complete from "./screens/Complete";

const STARTING_STREAK = 6;
const STARTING_SCAMS_CAUGHT = 40;

// Every completed protection lesson is one more scam the learner can catch.
function scamsCaughtFor(completedCount) {
  const caught = lessons
    .slice(0, completedCount)
    .filter((l) => l.type === "protection").length;
  return STARTING_SCAMS_CAUGHT + caught;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [completedCount, setCompletedCount] = useState(2); // matches the design's mid-path state
  const [activeIndex, setActiveIndex] = useState(2);
  const [selected, setSelected] = useState(null);

  const activeLesson = lessons[activeIndex];
  const allDone = completedCount >= lessons.length;

  const goHome = () => setScreen("home");
  const goPath = () => setScreen("path");

  const startLesson = (index) => {
    setActiveIndex(index);
    setSelected(null);
    setScreen("learn");
  };

  const answer = (choice) => {
    setSelected(choice);
    setScreen("result");
  };

  const finishLesson = () => {
    // Advance progress only when finishing the current (next) lesson.
    setCompletedCount((prev) => Math.max(prev, activeIndex + 1));
    setScreen("complete");
  };

  let content;
  switch (screen) {
    case "home":
      content = (
        <Home
          streak={STARTING_STREAK}
          scamsCaught={scamsCaughtFor(completedCount)}
          allDone={allDone}
          onStart={goPath}
        />
      );
      break;
    case "path":
      content = (
        <LessonPath
          completedCount={completedCount}
          streak={STARTING_STREAK}
          scamsCaught={scamsCaughtFor(completedCount)}
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
          streak={STARTING_STREAK}
          scamsCaught={scamsCaughtFor(completedCount)}
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
