# Final Challenge After Every Phase

## Goal

Every Everwise phase must end with a real, short Final Challenge. The app must
never tell a learner that a Final Challenge is next and then skip directly to
another phase.

The learner flow is:

1. Complete the final lesson in a phase.
2. Complete that phase's ungraded Final Challenge.
3. Complete the existing phase exam when one exists.
4. Continue to the next phase, or finish the course after Phase 17.

## Scope

- Add one Final Challenge to each of the 17 phases.
- Keep each challenge to five short activities, approximately 3–5 minutes.
- Use a shared data shape and the existing `ChallengePlayer`.
- Write phase-specific review content; do not repeat questions verbatim from
  the lessons.
- Keep challenges ungraded. Learners complete the activities but cannot fail
  the phase review.
- Preserve existing exams after the challenge.
- Correct every final lesson's `complete.next` label.
- Correct the challenge completion message so it describes the actual next
  step.
- Make Home consider required challenges and exams before showing the course as
  completely finished.

Out of scope:

- New scoring, XP, streaks, subscriptions, or badges.
- Changes to ordinary lesson content.
- A new visual design for the path or challenge player.

## Chosen Approach

Use one dedicated `src/data/phase-challenges.js` module containing all 17
challenge objects. Each object follows the existing challenge contract:

```js
{
  id: "phase1-challenge",
  track: "literacy",
  phase: 1,
  title: "Phase 1 Final Challenge",
  nextLabel: "Phase 2: Safe Internet Habits",
  blocks: [/* five supported blocks */],
}
```

`src/data/lessons.js` exports the complete ordered challenge collection. This
keeps phase-ending reviews discoverable in one place and prevents another phase
from promising a challenge that was never added to the path.

The existing Phase 4 challenge moves into this shared module. Its unsupported
`match` activity is replaced with a supported activity so no challenge can
render the “Unknown block type” fallback.

## Challenge Format

Every challenge contains five activities in this order:

1. **Quick review** — `multiselect`
2. **Key ideas** — `flashcards`
3. **Recall practice** — `fillblank`
4. **Real-life decision** — `scenario`
5. **Final confidence check** — `truefalse` or `choice`

Only block types already supported by `BlockRenderer` may be used. In
particular, challenges must not use the removed `match` activity.

Controls, progress display, Back behavior, Read Aloud support within supported
blocks, and text-size behavior continue to come from the existing block
components.

## Phase-Specific Review Focus

| Phase | Final Challenge focus |
|---|---|
| 1 — Foundations | Internet, AI, ChatGPT, search, apps, Wi-Fi/VPN, cybersecurity, and personal information |
| 2 — Safe Internet Habits | Passwords, password managers, 2FA, updates, public Wi-Fi, downloads, browsers, privacy, and location |
| 3 — Communication | Calls, video calls, email, blocking, reporting spam, photos, and location sharing |
| 4 — Digital Finance | Banking, cards, payment apps, shopping, refunds, and fake websites |
| 5 — Health & Government | Telehealth, prescriptions, Medicare, IRS/DMV sites, and official government domains |
| 6 — Social Media | Friend requests, giveaways, misinformation, deepfakes, and reporting accounts |
| 7 — Emergency Skills | Stolen money, trusted contacts, credit freezes, password recovery, and official reporting |
| 8 — Becoming Scam-Proof | Control, calm thinking, verification, and deliberate decisions |
| 9 — The Warning Signs | Secrecy, urgency, strange payments, and independent verification |
| 10 — The Masks Scammers Wear | Impersonation of government, banks, support, family, services, deliveries, and healthcare |
| 11 — When AI Enters the Conversation | Voice, image, video, and chatbot deception; checking confident AI answers |
| 12 — Protecting Personal Information | Password strength, reuse, password managers, 2FA, and account recovery |
| 13 — Smart Communication | Links, attachments, trusted helpers, blocking, saving evidence, and reporting |
| 14 — Safe Shopping & Money | Payments, store checks, checkout details, disputes, donations, and investment promises |
| 15 — AI in Everyday Life | Checking AI, clarifying information, practicing conversations, comparing choices, and routines |
| 16 — Helping Others Stay Safe | Explaining concerns calmly, making a safety plan, and knowing when to involve more help |
| 17 — Living Confidently Online | Healthy routines, confident internet use, verification habits, and course-wide safety decisions |

## Navigation and Unlocking

The path order remains:

```text
phase lessons → phase challenge → optional phase exam → next phase
```

- A challenge unlocks only after every lesson in its phase is complete.
- An exam unlocks only after the phase challenge is complete.
- A later phase remains locked until the required challenge and exam before it
  are complete.
- Replaying a completed challenge does not duplicate its completion ID.
- Back exits to the path without marking the challenge complete.
- The completion button saves the challenge ID and returns to the path.

The path already places challenges after a phase's final lesson and before its
exam. The implementation extends the collection from one challenge to all 17
and strengthens the phase-boundary unlock check so learners cannot skip a
phase-ending requirement by entering the next phase.

## Completion Copy

Each final lesson uses:

```text
Next Lesson: Phase N Final Challenge
```

After a challenge:

- If an exam exists: “Review complete. Next: Phase N Final Exam.”
- If no exam exists and another phase follows: “Review complete. Next: Phase
  N+1 — [phase title].”
- After Phase 17: “Final Challenge complete. You completed the Everwise
  course.”

Although the existing component labels the field “Next Lesson,” the challenge
name remains learner-friendly and accurate.

## Data and Progress

- Challenge IDs use the stable pattern `phaseN-challenge`, preserving the
  existing `phase4-challenge` ID.
- Existing Firestore progress storage continues to use the
  `completedLessons` array so no schema migration is required.
- `allDone` is derived from the IDs of lessons, challenges, and exams required
  by the course rather than comparing the raw completion count only to the
  lesson count.
- Duplicate IDs are rejected by automated validation.

## Error Handling

- Empty or unsupported challenge blocks fail automated validation before
  release.
- `ChallengePlayer` receives a safe next-step label from the challenge object;
  it does not assume every challenge is followed by an exam.
- Missing phase metadata falls back to the existing phase helper, but the
  challenge validation test requires phases 1–17 to be present exactly once.
- Progress is saved only after the final activity is completed.

## Testing

Automated tests must prove:

1. There are exactly 17 challenges with unique IDs and phases 1–17.
2. Every challenge contains exactly five non-empty, supported blocks.
3. Every phase's final lesson points to its Final Challenge.
4. Every challenge is ordered after its phase lessons and before its exam.
5. Exams cannot unlock until their challenge is complete.
6. The next phase cannot unlock until the preceding challenge and optional exam
   are complete.
7. Challenge completion copy names an exam, next phase, or course completion
   correctly.
8. `allDone` remains false while a required challenge or exam is incomplete.
9. Existing build and lint checks pass.

Manual checks cover:

- Phase 1, a phase with an exam, a scam-protection phase, and Phase 17.
- Small iPhone and large-text layouts.
- Back navigation, replay, progress saving, and return to the path.

## Acceptance Criteria

- Every phase visibly ends with a tappable “Final Challenge” node.
- No completion screen promises content that is absent.
- Every challenge is phase-specific, ungraded, and completable in 3–5 minutes.
- Existing exams remain reachable only after the challenge.
- Learners cannot skip required phase-ending content.
- Phase 17 ends with a truthful course-completion message.
