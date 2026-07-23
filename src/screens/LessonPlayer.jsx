import { useRef, useState } from "react";
import BlockRenderer from "../components/blocks/BlockRenderer";
import BlockShell from "../components/blocks/BlockShell";
import { MultipleChoiceBody } from "../components/blocks/ScenarioBlock";

// Plays one lesson: every block in order → quiz (one at a time) → signals done.
// Quiz length is not fixed — lessons may have 5, 6, 8, or any number of questions.
export default function LessonPlayer({ lesson, onBack, onComplete }) {
  const [phase, setPhase] = useState("block"); // "block" | "quiz"
  const [blockIndex, setBlockIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const scoreRef = useRef(0);

  const quiz = lesson.quiz ?? [];
  const quizTotal = quiz.length;
  const totalSteps = lesson.blocks.length + quizTotal;
  const progress =
    phase === "block"
      ? blockIndex + 1
      : lesson.blocks.length + quizIndex + 1;

  const advanceFromBlock = () => {
    if (blockIndex + 1 < lesson.blocks.length) {
      setBlockIndex((i) => i + 1);
    } else if (quizTotal > 0) {
      setPhase("quiz");
      setQuizIndex(0);
      setSelected(null);
    } else {
      onComplete(scoreRef.current);
    }
  };

  const answerQuiz = (choice) => {
    if (selected != null) return;
    const q = quiz[quizIndex];
    if (choice === q.correctIndex) scoreRef.current += 1;
    setSelected(choice);
  };

  const continueQuiz = () => {
    if (quizIndex + 1 < quizTotal) {
      setQuizIndex((i) => i + 1);
      setSelected(null);
    } else {
      onComplete(scoreRef.current);
    }
  };

  if (phase === "block") {
    return (
      <BlockRenderer
        key={`block-${blockIndex}`}
        block={lesson.blocks[blockIndex]}
        progress={progress}
        progressTotal={totalSteps}
        onContinue={advanceFromBlock}
        onBack={onBack}
      />
    );
  }

  const q = quiz[quizIndex];
  return (
    <BlockShell
      key={`quiz-${quizIndex}`}
      label="Quiz"
      progress={progress}
      progressTotal={totalSteps}
      onBack={onBack}
      footer={
        selected != null ? (
          <button className="btn-primary" onClick={continueQuiz}>
            {quizIndex + 1 < quizTotal ? "Next" : "See results"}
          </button>
        ) : null
      }
    >
      <p className="text-lg font-semibold text-ink-faint">
        Quiz {quizIndex + 1} of {quizTotal}
      </p>
      <MultipleChoiceBody
        text={q.question}
        options={q.options}
        correctIndex={q.correctIndex}
        selected={selected}
        onSelect={answerQuiz}
      />
    </BlockShell>
  );
}
