import test from "node:test";
import assert from "node:assert/strict";
import { phaseChallenges } from "../src/data/phase-challenges.js";

const expectedNextLabels = new Map([
  [1, "Phase 2 — Safe Internet Habits"],
  [2, "Phase 3 — Communication"],
  [3, "Phase 3 Final Exam"],
  [4, "Phase 4 Final Exam"],
  [5, "Phase 5 Final Exam"],
  [6, "Phase 6 Final Exam"],
  [7, "Phase 7 Final Exam"],
  [8, "Phase 9 — The Warning Signs"],
  [9, "Phase 10 — The Masks Scammers Wear"],
  [10, "Phase 11 — When AI Enters the Conversation"],
  [11, "Phase 12 — Protecting Your Personal Information"],
  [12, "Phase 13 — Smart Communication"],
  [13, "Phase 14 — Safe Online Shopping & Money"],
  [14, "Phase 15 — AI in Everyday Life"],
  [15, "Phase 16 — Helping Others Stay Safe"],
  [16, "Phase 17 — Living Confidently Online"],
  [17, "Course complete"],
]);

function assertNonEmptyText(value, label) {
  assert.equal(typeof value, "string", `${label} must be text`);
  assert.notEqual(value.trim(), "", `${label} must not be empty`);
}

function assertMultipleChoiceBlock(block, label) {
  assertNonEmptyText(block.text, `${label}.text`);
  assert.ok(block.options.length >= 3, `${label} needs at least 3 options`);
  block.options.forEach((option, index) =>
    assertNonEmptyText(option, `${label}.options[${index}]`),
  );
  assert.ok(
    Number.isInteger(block.correctIndex) &&
      block.correctIndex >= 0 &&
      block.correctIndex < block.options.length,
    `${label}.correctIndex must point to an option`,
  );
  assertNonEmptyText(block.explanation, `${label}.explanation`);
}

test("catalog contains exactly one stable challenge for every phase", () => {
  assert.equal(phaseChallenges.length, 17);
  assert.deepEqual(
    phaseChallenges.map((challenge) => challenge.phase),
    Array.from({ length: 17 }, (_, index) => index + 1),
  );
  assert.equal(
    new Set(phaseChallenges.map((challenge) => challenge.id)).size,
    17,
  );

  phaseChallenges.forEach((challenge) => {
    assert.equal(challenge.id, `phase${challenge.phase}-challenge`);
    assert.equal(challenge.order, challenge.phase);
    assert.equal(challenge.title, `Phase ${challenge.phase} Final Challenge`);
    assert.equal(
      challenge.track,
      challenge.phase <= 7 ? "literacy" : "scam",
    );
  });
});

test("every challenge uses the same five supported activity slots", () => {
  phaseChallenges.forEach((challenge) => {
    const label = `Phase ${challenge.phase}`;
    assert.equal(challenge.blocks.length, 5, `${label} must have five blocks`);
    assert.deepEqual(
      challenge.blocks.slice(0, 4).map((block) => block.type),
      ["multiselect", "flashcards", "fillblank", "scenario"],
    );
    assert.ok(
      ["truefalse", "choice"].includes(challenge.blocks[4].type),
      `${label} final block must be truefalse or choice`,
    );
    assert.equal(
      challenge.blocks.some((block) => ["match", "sort"].includes(block.type)),
      false,
      `${label} contains a removed block type`,
    );
  });
});

test("every block contains all data required by its renderer", () => {
  phaseChallenges.forEach((challenge) => {
    const label = `Phase ${challenge.phase}`;
    const [quickReview, flashcards, fillBlank, scenario, finalCheck] =
      challenge.blocks;

    assertNonEmptyText(quickReview.prompt, `${label}.quickReview.prompt`);
    assert.ok(quickReview.options.length >= 3);
    assert.ok(quickReview.options.some((option) => option.correct));
    assert.ok(quickReview.options.some((option) => !option.correct));
    quickReview.options.forEach((option, index) => {
      assertNonEmptyText(
        option.text,
        `${label}.quickReview.options[${index}].text`,
      );
      assert.equal(typeof option.correct, "boolean");
    });
    assertNonEmptyText(quickReview.feedback, `${label}.quickReview.feedback`);
    assertNonEmptyText(
      quickReview.incorrectFeedback,
      `${label}.quickReview.incorrectFeedback`,
    );

    assert.equal(flashcards.cards.length, 3);
    flashcards.cards.forEach((card, index) => {
      assertNonEmptyText(card.front, `${label}.cards[${index}].front`);
      assertNonEmptyText(card.back, `${label}.cards[${index}].back`);
    });

    assert.ok(fillBlank.wordBank.length >= 3);
    fillBlank.wordBank.forEach((word, index) =>
      assertNonEmptyText(word, `${label}.wordBank[${index}]`),
    );
    assert.ok(fillBlank.questions.length >= 1);
    assert.ok(fillBlank.questions.length <= 2);
    fillBlank.questions.forEach((question, index) => {
      assertNonEmptyText(question.text, `${label}.questions[${index}].text`);
      assert.ok(question.text.includes("______"));
      assertNonEmptyText(
        question.answer,
        `${label}.questions[${index}].answer`,
      );
      assert.ok(fillBlank.wordBank.includes(question.answer));
    });

    assertMultipleChoiceBlock(scenario, `${label}.scenario`);

    if (finalCheck.type === "truefalse") {
      assert.ok(finalCheck.questions.length >= 1);
      finalCheck.questions.forEach((question, index) => {
        assertNonEmptyText(
          question.text,
          `${label}.finalCheck.questions[${index}].text`,
        );
        assert.equal(typeof question.answer, "boolean");
        assertNonEmptyText(
          question.explanation,
          `${label}.finalCheck.questions[${index}].explanation`,
        );
      });
    } else {
      assertMultipleChoiceBlock(finalCheck, `${label}.finalCheck`);
    }
  });
});

test("every challenge names its actual next step", () => {
  phaseChallenges.forEach((challenge) => {
    const expectedKind =
      challenge.phase === 17
        ? "course"
        : challenge.phase >= 3 && challenge.phase <= 7
          ? "exam"
          : "phase";
    assert.equal(challenge.nextKind, expectedKind);
    assert.equal(challenge.nextLabel, expectedNextLabels.get(challenge.phase));
  });
});
