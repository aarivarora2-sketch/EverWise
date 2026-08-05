import { afterEach, describe, expect, test, vi } from "vitest";

await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LessonPath from "../src/screens/LessonPath.jsx";
import { lessonsByOrder } from "../src/data/lessons.js";

afterEach(cleanup);

// The path measures itself against the viewport.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

const firstLesson = lessonsByOrder[0];
const secondLesson = lessonsByOrder[1];

const renderPath = (overrides = {}) => {
  const props = {
    completedLessons: [],
    onSelectLesson: vi.fn(),
    onTestOutLesson: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
  render(<LessonPath {...props} />);
  return props;
};

const quickCheckFor = (lesson) =>
  screen.queryByRole("button", {
    name: new RegExp(`Already know ${lesson.title}`, "i"),
  });

describe("testing out from the course path", () => {
  test("the lesson you are up to offers a quick check beside it", () => {
    // Lesson 1 has no quiz, so the offer belongs to the next one along.
    const props = renderPath({ completedLessons: [firstLesson.id] });

    const quickCheck = quickCheckFor(secondLesson);
    expect(quickCheck).not.toBeNull();

    fireEvent.click(quickCheck);
    expect(props.onTestOutLesson).toHaveBeenCalledWith(1);
    // Tapping the node itself is untouched: it still just opens the lesson.
    expect(props.onSelectLesson).not.toHaveBeenCalled();
  });

  test("a lesson already finished is not offered a quick check", () => {
    renderPath({ completedLessons: [firstLesson.id, secondLesson.id] });
    expect(quickCheckFor(secondLesson)).toBeNull();
  });

  test("a lesson with no questions is never offered one", () => {
    renderPath({ completedLessons: [] });
    // Lesson 1 is the current one here and carries no quiz.
    expect(firstLesson.quiz?.length ?? 0).toBe(0);
    expect(quickCheckFor(firstLesson)).toBeNull();
  });

  test("locked lessons further along are not offered one", () => {
    renderPath({ completedLessons: [firstLesson.id] });
    const laterLesson = lessonsByOrder[4];
    expect(quickCheckFor(laterLesson)).toBeNull();
  });

  test("nothing is offered when the screen has no test-out handler", () => {
    renderPath({
      completedLessons: [firstLesson.id],
      onTestOutLesson: undefined,
    });
    expect(quickCheckFor(secondLesson)).toBeNull();
  });
});
