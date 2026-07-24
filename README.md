# Everwise

> Get wiser online — one short lesson a day.

A mobile-first web app that helps older adults (65+) build everyday digital
skills and spot scams, in about two minutes a day. Think Duolingo, calmed down:
a gentle winding path of short lessons that alternate between **skills** (how to
do things online) and **protection** (how to spot the tricks).

Built with **React + Vite**, **Tailwind CSS**, and **Firebase** (Authentication
+ Cloud Firestore) for real accounts and saved progress.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build
```

### Firebase setup

Real accounts and progress require a Firebase project:

1. Create a project at the [Firebase console](https://console.firebase.google.com/).
2. Enable **Authentication → Email/Password** and create a **Cloud Firestore**
   database.
3. Copy your web app's config into `src/firebase.js`, replacing the placeholder
   values. It exports the initialized `auth` and `db`.

User data is stored in Firestore at `users/{uid}`:

| field               | meaning                                        |
| ------------------- | ---------------------------------------------- |
| `name`              | the person's name (for the greeting)           |
| `email`             | account email                                  |
| `streak`            | consecutive days with a completed lesson       |
| `scamsCaught`       | lessons answered correctly (counted once each) |
| `completedLessons`  | array of completed lesson `id`s                |
| `lastCompletedDate` | `YYYY-MM-DD` of the last completion, or `null` |

## The six screens

Auth and navigation live in `src/App.jsx`. `onAuthStateChanged` sends a
logged-in user straight to Home (skipping Landing) and shows a loading state
while it checks. The entry flow is **Landing → Sign Up / Log In**, then the
six lesson screens.

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
| `id`          | stable unique id (tracks completion)        |
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
- **Natural read-aloud** on every lesson screen via GPT‑4o mini text-to-speech,
  with the browser's speech synthesis as an automatic fallback.
- **Color is never alone** — every state pairs color with an icon and words.
- Visible keyboard focus rings and `prefers-reduced-motion` support.

### Natural narration

Natural narration runs in an authenticated Firebase callable function so the
OpenAI API key is never included in the browser or iOS app. The function uses
`gpt-4o-mini-tts` with a calm, respectful reading style and returns MP3 audio.

To deploy it, use the Firebase project in `.firebaserc`, configure the
`OPENAI_API_KEY` Functions secret, and deploy `narrateLesson`. If the function
is unavailable, Everwise automatically uses the device's built-in voice.

## Design

Warm and editorial, not techy or childish: a bookish serif (Fraunces) for
headings, a calm cream background, clay/terracotta for the main action, green
for done/safe, and muted red for scam warnings. The theme lives in
`tailwind.config.js`.
