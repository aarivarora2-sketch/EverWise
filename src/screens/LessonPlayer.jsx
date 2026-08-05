import { useRef, useState } from "react";
import BlockRenderer from "../components/blocks/BlockRenderer";
import BlockShell from "../components/blocks/BlockShell";
import { MultipleChoiceBody } from "../components/blocks/ScenarioBlock";

const MAX_TEST_OUT_QUESTIONS = 5;

// Plays one lesson: every block in order → quiz (one at a time) → signals done.
// Quiz length is not fixed — lessons may have 5, 6, 8, or any number of questions.
export default function LessonPlayer({
  lesson,
  onBack,
  onComplete,
  initialPosition = null,
  onPositionChange,
  onExit,
}) {
  const quiz = lesson.quiz ?? [];
  const quizTotal = quiz.length;
  // A learner who already knows a lesson can prove it instead of sitting
  // through it. Kept short on purpose — the point is to get someone to the
  // material they actually need.
  const testOutQuestions = quiz.slice(0, MAX_TEST_OUT_QUESTIONS);

  // A saved position is only honoured if it still fits this lesson. Lessons
  // change as content is edited, so a stale index must never strand someone on
  // a step that no longer exists.
  const savedQueue = initialPosition?.reviewQueue ?? [];
  const resumed =
    initialPosition &&
    initialPosition.blockIndex < lesson.blocks.length &&
    (initialPosition.phase === "block" || initialPosition.quizIndex < quizTotal) &&
    // A saved review queue must still point at questions this quiz has; the
    // content may have changed since it was written.
    savedQueue.every((index) => index < quizTotal) &&
    (initialPosition.phase !== "review" || savedQueue.length > 0)
      ? initialPosition
      : null;

  // "offer" | "testout" | "block" | "quiz" | "review"
  const [phase, setPhase] = useState(
    resumed?.phase ?? (quizTotal > 0 ? "offer" : "block"),
  );
  const [blockIndex, setBlockIndex] = useState(resumed?.blockIndex ?? 0);
  const [quizIndex, setQuizIndex] = useState(resumed?.quizIndex ?? 0);
  const [selected, setSelected] = useState(null);
  // Questions still owed a correct answer. A question leaves this queue only
  // when it is answered correctly, so the lesson is not finished until every
  // mistake has been put right.
  const [reviewQueue, setReviewQueue] = useState(resumed?.reviewQueue ?? []);
  const [testOutIndex, setTestOutIndex] = useState(0);
  const [testOutFailed, setTestOutFailed] = useState(false);
  const scoreRef = useRef(resumed?.score ?? 0);
  // Scored on the first attempt only, so replaying a question in review cannot
  // inflate the result.
  const wrongFirstPassRef = useRef(resumed?.reviewQueue ?? []);

  const rememberPosition = (next) => {
    onPositionChange?.({
      phase: next.phase,
      blockIndex: next.blockIndex,
      quizIndex: next.quizIndex,
      score: scoreRef.current,
      reviewQueue: next.reviewQueue ?? reviewQueue,
    });
  };
  const totalSteps = lesson.blocks.length + quizTotal;
  const progress =
    phase === "block"
      ? blockIndex + 1
      : lesson.blocks.length + quizIndex + 1;

  const advanceFromBlock = () => {
    if (blockIndex + 1 < lesson.blocks.length) {
      setBlockIndex((i) => i + 1);
      rememberPosition({ phase: "block", blockIndex: blockIndex + 1, quizIndex });
    } else if (quizTotal > 0) {
      setPhase("quiz");
      setQuizIndex(0);
      setSelected(null);
      rememberPosition({ phase: "quiz", blockIndex, quizIndex: 0 });
    } else {
      onComplete(scoreRef.current);
    }
  };

  const answerQuiz = (choice) => {
    if (selected != null) return;
    const q = quiz[quizIndex];
    if (choice === q.correctIndex) {
      scoreRef.current += 1;
    } else if (!wrongFirstPassRef.current.includes(quizIndex)) {
      wrongFirstPassRef.current = [...wrongFirstPassRef.current, quizIndex];
    }
    setSelected(choice);
  };

  const continueQuiz = () => {
    if (quizIndex + 1 < quizTotal) {
      setQuizIndex((i) => i + 1);
      setSelected(null);
      rememberPosition({ phase: "quiz", blockIndex, quizIndex: quizIndex + 1 });
      return;
    }
    const owed = wrongFirstPassRef.current;
    if (owed.length > 0) {
      setPhase("review");
      setReviewQueue(owed);
      setSelected(null);
      rememberPosition({ phase: "review", blockIndex, quizIndex, reviewQueue: owed });
      return;
    }
    onComplete(scoreRef.current);
  };

  const answerReview = (choice) => {
    if (selected != null) return;
    setSelected(choice);
  };

  // Correct clears the question; wrong sends it to the back of the queue so it
  // comes round again. Either way the learner sees why before moving on.
  const continueReview = () => {
    const current = reviewQueue[0];
    const answeredCorrectly = selected === quiz[current]?.correctIndex;
    const remaining = answeredCorrectly
      ? reviewQueue.slice(1)
      : [...reviewQueue.slice(1), current];
    setSelected(null);
    if (remaining.length === 0) {
      onComplete(scoreRef.current);
      return;
    }
    setReviewQueue(remaining);
    rememberPosition({
      phase: "review",
      blockIndex,
      quizIndex,
      reviewQueue: remaining,
    });
  };

  const beginLessonProperly = () => {
    setPhase("block");
    setBlockIndex(0);
    setSelected(null);
    rememberPosition({ phase: "block", blockIndex: 0, quizIndex: 0 });
  };

  const answerTestOut = (choice) => {
    if (selected != null) return;
    // One wrong answer ends the attempt: the point of testing out is to show
    // the lesson is not needed, and a near miss means it is.
    if (choice !== testOutQuestions[testOutIndex].correctIndex) {
      setTestOutFailed(true);
    }
    setSelected(choice);
  };

  const continueTestOut = () => {
    if (testOutFailed) {
      beginLessonProperly();
      return;
    }
    if (testOutIndex + 1 < testOutQuestions.length) {
      setTestOutIndex((i) => i + 1);
      setSelected(null);
      return;
    }
    onComplete(testOutQuestions.length);
  };

  const goToPreviousStep = () => {
    setSelected(null);

    if (phase === "review") {
      onBack();
      return;
    }

    if (phase === "quiz") {
      if (quizIndex > 0) {
        setQuizIndex((i) => i - 1);
        rememberPosition({ phase: "quiz", blockIndex, quizIndex: quizIndex - 1 });
      } else if (lesson.blocks.length > 0) {
        setPhase("block");
        setBlockIndex(lesson.blocks.length - 1);
        rememberPosition({
          phase: "block",
          blockIndex: lesson.blocks.length - 1,
          quizIndex,
        });
      } else {
        onBack();
      }
      return;
    }

    if (blockIndex > 0) {
      setBlockIndex((i) => i - 1);
      rememberPosition({ phase: "block", blockIndex: blockIndex - 1, quizIndex });
    } else {
      onBack();
    }
  };

  if (phase === "offer") {
    return (
      <BlockShell
        label="Lesson"
        progress={0}
        progressTotal={totalSteps}
        onBack={onBack}
        onExit={onExit}
        footer={
          <button className="btn-primary" onClick={beginLessonProperly}>
            Start the lesson
          </button>
        }
      >
        <h1 className="page-title mt-3">{lesson.title}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-soft">
          Take it step by step, or skip ahead if you already know this.
        </p>
        <button
          type="button"
          onClick={() => {
            setPhase("testout");
            setTestOutIndex(0);
            setTestOutFailed(false);
            setSelected(null);
          }}
          className="mt-8 w-full rounded-2xl border-2 border-ink/15 bg-cream-card px-6 py-6 text-left transition-colors hover:border-clay hover:bg-clay/5"
        >
          <span className="block text-2xl font-bold text-ink">
            I already know this
          </span>
          <span className="mt-1 block text-lg leading-snug text-ink-soft">
            Answer {testOutQuestions.length}{" "}
            {testOutQuestions.length === 1 ? "question" : "questions"} correctly
            and we'll mark this lesson done.
          </span>
        </button>
      </BlockShell>
    );
  }

  if (phase === "testout") {
    const testQuestion = testOutQuestions[testOutIndex];
    const isLast = testOutIndex + 1 === testOutQuestions.length;
    return (
      <BlockShell
        key={`testout-${testOutIndex}`}
        label="Quick check"
        progress={testOutIndex + 1}
        progressTotal={testOutQuestions.length}
        onBack={() => setPhase("offer")}
        onExit={onExit}
        scrollKey={testOutIndex}
        footer={
          selected != null ? (
            <button className="btn-primary" onClick={continueTestOut}>
              {testOutFailed
                ? "Go through the lesson"
                : isLast
                  ? "Finish"
                  : "Next"}
            </button>
          ) : null
        }
      >
        <p className="text-lg font-semibold text-ink-faint">
          Question {testOutIndex + 1} of {testOutQuestions.length}
        </p>
        {testOutFailed ? (
          <p className="mt-1 text-lg leading-snug text-ink-soft">
            No problem — we'll go through this one together.
          </p>
        ) : null}
        <MultipleChoiceBody
          text={testQuestion.question}
          options={testQuestion.options}
          correctIndex={testQuestion.correctIndex}
          explanation={testQuestion.explanation}
          selected={selected}
          onSelect={answerTestOut}
        />
      </BlockShell>
    );
  }

  if (phase === "block") {
    return (
      <BlockRenderer
        key={`block-${blockIndex}`}
        block={lesson.blocks[blockIndex]}
        progress={progress}
        progressTotal={totalSteps}
        onContinue={advanceFromBlock}
        onBack={goToPreviousStep}
        onExit={onExit}
      />
    );
  }

  if (phase === "review") {
    const reviewIndex = reviewQueue[0];
    const reviewQuestion = quiz[reviewIndex];
    const answeredCorrectly =
      selected != null && selected === reviewQuestion.correctIndex;
    return (
      <BlockShell
        key={`review-${reviewIndex}-${reviewQueue.length}`}
        label="Second look"
        progress={totalSteps}
        progressTotal={totalSteps}
        onBack={goToPreviousStep}
        onExit={onExit}
        footer={
          selected != null ? (
            <button className="btn-primary" onClick={continueReview}>
              {answeredCorrectly && reviewQueue.length === 1
                ? "Finish lesson"
                : "Next"}
            </button>
          ) : null
        }
      >
        <p className="text-lg font-semibold text-ink-faint">
          {reviewQueue.length === 1
            ? "One to go"
            : `${reviewQueue.length} to go`}
        </p>
        <p className="mt-1 text-lg text-ink-soft">
          Let's take another look at this one.
        </p>
        <MultipleChoiceBody
          text={reviewQuestion.question}
          options={reviewQuestion.options}
          correctIndex={reviewQuestion.correctIndex}
          explanation={reviewQuestion.explanation}
          selected={selected}
          onSelect={answerReview}
        />
      </BlockShell>
    );
  }

  const q = quiz[quizIndex];
  return (
    <BlockShell
      key={`quiz-${quizIndex}`}
      label="Quiz"
      progress={progress}
      progressTotal={totalSteps}
      onBack={goToPreviousStep}
      onSkip={continueQuiz}
      onExit={onExit}
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
        explanation={q.explanation}
        selected={selected}
        onSelect={answerQuiz}
      />
    </BlockShell>
  );
}
