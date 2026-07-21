# Everwise

> Get wiser online — one short lesson a day.

A mobile-first web app that helps older adults (65+) build everyday digital
skills and spot scams, in about two minutes a day. Think Duolingo, calmed down:
a gentle winding path of short lessons that alternate between **skills** (how to
do things online) and **protection** (how to spot the tricks).

Built with **React + Vite** and **Tailwind CSS**.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build
```

## The six screens

The whole app is a small React state machine in `src/App.jsx` — no router, no
backend, no `localStorage`. Progress lives in React state.

1. **Home** (`screens/Home.jsx`) — "Today's lesson is ready." with streak and
   scams-caught stats and one clay call-to-action.
2. **Lesson Path** (`screens/LessonPath.jsx`) — the winding "snake" trail.
   Green = done, clay = current (labeled **START**), grey = locked.
3. **Learn** (`screens/Learn.jsx`) — one idea in plain language, with a
   read-aloud button.
4. **Quiz** (`screens/Quiz.jsx`) — one scenario, one question, two big options.
5. **Result** (`screens/Result.jsx`) — the "why", with the answer and what to
   remember.
6. **Complete** (`screens/Complete.jsx`) — a small win; the streak grows.

## Lessons

Lessons live in `src/data/lessons.js` as an array of objects. Five lessons ship
by default, alternating `protection` and `skill`. Each lesson has:

| field         | meaning                                     |
| ------------- | ------------------------------------------- |
| `type`        | `"skill"` or `"protection"`                 |
| `title`       | short lesson name                           |
| `learn`       | plain-language teaching text (read aloud)   |
| `question`    | the one-tap quiz question                   |
| `scenario`    | the situation being judged                  |
| `options`     | exactly two answer options                  |
| `correct`     | index (0 or 1) of the correct option        |
| `explanation` | the "why" — what to remember                |

Add a lesson by appending another object to that array.

## Accessibility

Designed for older eyes and hands — accessibility is the top priority:

- **Large text** and a bumped-up base font size (18px).
- **Big tap targets** (buttons are 60–68px+ tall).
- **High contrast** near-black text on a calm cream background.
- **One action per screen** — a single obvious next step every time.
- **Read-aloud** on every lesson screen via the browser's speech synthesis.
- **Color is never alone** — every state pairs color with an icon and words.
- Visible keyboard focus rings and `prefers-reduced-motion` support.

## Design

Warm and editorial, not techy or childish: a bookish serif (Fraunces) for
headings, a calm cream background, clay/terracotta for the main action, green
for done/safe, and muted red for scam warnings. The theme lives in
`tailwind.config.js`.
