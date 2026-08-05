import { expect, test } from "vitest";
import { lessonsByOrder } from "../src/data/lessons.js";

const quizQuestions = lessonsByOrder.flatMap((lesson) =>
  (lesson.quiz ?? []).map((question) => ({ lesson: lesson.id, question })),
);

// Explaining why a chosen answer is wrong is what turns a correction into a
// lesson. Writing them is ongoing content work, so this ratchets: coverage may
// go up, never down. Raise the number as more are written.
const EXPLAINED_AT_LEAST = 32;

test("quiz explanation coverage never goes backwards", () => {
  const explained = quizQuestions.filter(
    ({ question }) => typeof question.explanation === "string",
  ).length;

  expect(
    explained,
    `Explained ${explained} of ${quizQuestions.length}. If you added some, raise EXPLAINED_AT_LEAST.`,
  ).toBeGreaterThanOrEqual(EXPLAINED_AT_LEAST);
});

test("every explanation actually explains something", () => {
  for (const { lesson, question } of quizQuestions) {
    const { explanation } = question;
    if (explanation === undefined) continue;
    expect(typeof explanation, `${lesson}: explanation must be text`).toBe("string");
    // Guards against placeholder filler being dropped in to raise the count.
    expect(
      explanation.trim().length,
      `${lesson}: "${question.question}" has a too-short explanation`,
    ).toBeGreaterThan(40);
    expect(
      explanation,
      `${lesson}: explanation should not just restate the question`,
    ).not.toBe(question.question);
  }
});
