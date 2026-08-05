import { afterEach, describe, expect, test, vi } from "vitest";

// JSX here compiles to the classic runtime, so React has to be global before
// any component module is imported. Same pattern as the other UI suites.
await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LessonPlayer from "../src/screens/LessonPlayer.jsx";

// ReadAloud reaches for the network and audio; neither is the subject here.
vi.mock("../src/components/ReadAloud.jsx", () => ({
  default: () => null,
}));

// jsdom elements have no scrollTo; BlockShell scrolls each new question into
// view, which is not what these tests are about.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

afterEach(cleanup);

const LESSON = {
  id: "internet",
  blocks: [{ type: "learn", heading: "Learn", text: "Some teaching." }],
  quiz: [
    {
      question: "What is the internet?",
      options: ["A phone", "A worldwide network"],
      correctIndex: 1,
      explanation: "A phone is one device; the internet is what devices connect to.",
    },
    {
      question: "What is a website?",
      options: ["A page you visit online", "A charger"],
      correctIndex: 0,
    },
  ],
};

// Start straight in the quiz; the blocks are not what these tests are about.
const AT_QUIZ = {
  phase: "quiz",
  blockIndex: 0,
  quizIndex: 0,
  score: 0,
  reviewQueue: [],
};

function renderPlayer(overrides = {}) {
  const props = {
    lesson: LESSON,
    onBack: vi.fn(),
    onComplete: vi.fn(),
    onPositionChange: vi.fn(),
    initialPosition: AT_QUIZ,
    ...overrides,
  };
  render(<LessonPlayer {...props} />);
  return props;
}

const answer = (label) =>
  fireEvent.click(screen.getByRole("button", { name: label }));
const advance = (label) =>
  fireEvent.click(screen.getByRole("button", { name: label }));

describe("wrong answers come back before a lesson can finish", () => {
  test("a lesson answered perfectly never enters review", () => {
    const props = renderPlayer();

    answer("A worldwide network");
    advance("Next");
    answer("A page you visit online");
    advance("See results");

    expect(props.onComplete).toHaveBeenCalledWith(2);
    expect(screen.queryByText("Second look")).not.toBeInTheDocument();
  });

  test("a question answered wrongly is asked again and blocks completion", () => {
    const props = renderPlayer();

    answer("A phone"); // wrong
    advance("Next");
    answer("A page you visit online"); // right
    advance("See results");

    // The lesson is not over: the missed question comes back.
    expect(props.onComplete).not.toHaveBeenCalled();
    expect(screen.getByText("Second look")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What is the internet?" }),
    ).toBeVisible();

    // Getting it right now finishes, and the score still reflects the first
    // attempt only — replaying cannot inflate it.
    answer("A worldwide network");
    advance("Finish lesson");
    expect(props.onComplete).toHaveBeenCalledWith(1);
  });

  test("getting it wrong again keeps it in the queue rather than letting it pass", () => {
    const props = renderPlayer();

    answer("A phone"); // wrong
    advance("Next");
    answer("A page you visit online");
    advance("See results");

    // Wrong a second time: it must not be the last question standing.
    answer("A phone");
    expect(
      screen.queryByRole("button", { name: "Finish lesson" }),
    ).not.toBeInTheDocument();
    advance("Next");

    expect(props.onComplete).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "What is the internet?" }),
    ).toBeVisible();

    answer("A worldwide network");
    advance("Finish lesson");
    expect(props.onComplete).toHaveBeenCalledWith(1);
  });

  test("the explanation is shown so the learner is told why", () => {
    renderPlayer();

    answer("A phone");
    expect(
      screen.getByText(
        "A phone is one device; the internet is what devices connect to.",
      ),
    ).toBeVisible();
  });

  test("leaving during review saves the questions still owed", () => {
    const props = renderPlayer();

    answer("A phone");
    advance("Next");
    answer("A page you visit online");
    advance("See results");

    const saved = props.onPositionChange.mock.calls.at(-1)[0];
    expect(saved.phase).toBe("review");
    expect(saved.reviewQueue).toEqual([0]);
  });

  test("a saved review place resumes instead of replaying the whole quiz", () => {
    const props = renderPlayer({
      initialPosition: {
        phase: "review",
        blockIndex: 0,
        quizIndex: 1,
        score: 1,
        reviewQueue: [0],
      },
    });

    expect(screen.getByText("Second look")).toBeInTheDocument();
    answer("A worldwide network");
    advance("Finish lesson");
    expect(props.onComplete).toHaveBeenCalledWith(1);
  });

  test("a saved queue pointing outside this quiz is discarded, not trusted", () => {
    renderPlayer({
      initialPosition: {
        phase: "review",
        blockIndex: 0,
        quizIndex: 0,
        score: 0,
        // Lesson content changed since this was written.
        reviewQueue: [99],
      },
    });

    // Falls back to the start of the lesson rather than a missing question.
    expect(screen.queryByText("Second look")).not.toBeInTheDocument();
  });
});

describe("testing out of a lesson you already know", () => {
  const openOffer = (overrides = {}) =>
    renderPlayer({ initialPosition: null, ...overrides });

  test("a fresh lesson offers the choice between working through it and testing out", () => {
    openOffer();
    expect(
      screen.getByRole("button", { name: "Start the lesson" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /I already know this/ }),
    ).toBeVisible();
  });

  test("answering every question correctly marks the lesson done without doing it", () => {
    const props = openOffer();

    fireEvent.click(screen.getByRole("button", { name: /I already know this/ }));
    answer("A worldwide network");
    advance("Next");
    answer("A page you visit online");
    advance("Finish");

    expect(props.onComplete).toHaveBeenCalledTimes(1);
  });

  test("one wrong answer ends the attempt and starts the lesson properly", () => {
    const props = openOffer();

    fireEvent.click(screen.getByRole("button", { name: /I already know this/ }));
    answer("A phone"); // wrong
    // No way to carry on testing out; the only route forward is the lesson.
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    advance("Go through the lesson");

    expect(props.onComplete).not.toHaveBeenCalled();
    // Lands at the first teaching block, not the quiz.
    expect(screen.getByRole("heading", { name: "Learn" })).toBeVisible();
  });

  test("a lesson with no quiz cannot be tested out", () => {
    renderPlayer({
      initialPosition: null,
      lesson: { ...LESSON, quiz: [] },
    });
    expect(
      screen.queryByRole("button", { name: /I already know this/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Learn" })).toBeVisible();
  });

  test("resuming a part-done lesson goes back to the saved place, not the offer", () => {
    renderPlayer({
      initialPosition: { ...AT_QUIZ, quizIndex: 1 },
    });
    expect(
      screen.queryByRole("button", { name: /I already know this/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What is a website?" }),
    ).toBeVisible();
  });

  test("the quick check never asks more than five questions", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      question: `Question ${i}?`,
      options: ["Right", "Wrong"],
      correctIndex: 0,
    }));
    renderPlayer({ initialPosition: null, lesson: { ...LESSON, quiz: many } });

    fireEvent.click(screen.getByRole("button", { name: /I already know this/ }));
    expect(screen.getByText("Question 1 of 5")).toBeVisible();
  });
});
