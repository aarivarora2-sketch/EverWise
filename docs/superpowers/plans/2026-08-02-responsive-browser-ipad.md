# EverWise Responsive Browser and iPad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the phone-constrained EverWise web app into an adaptive browser experience for desktop and iPad while preserving the existing mobile flow and application behavior.

**Architecture:** Replace `PhoneShell` with a responsive `AppShell` that owns only layout, safe-area, and navigation presentation. `App.jsx` remains the routing and state owner. CSS media queries provide phone, tablet, and desktop layouts; screen components expose semantic class hooks for screen-specific grids without duplicating content.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 3, plain CSS media queries, Node test runner, oxlint.

## Global Constraints

- Phone widths below 768 px retain the current focused, full-height mobile experience.
- iPad widths from 768 px through 1023 px use a wider content surface and compact top navigation.
- Desktop widths of 1024 px and above use a persistent navigation rail and a centered application frame up to approximately 1180 px.
- Learning activities remain focused in a readable column near 760 px.
- EverWise text sizes 7-10 collapse multi-column arrangements before content becomes cramped.
- Do not change Firebase schemas, subscription access, lesson progression, API contracts, native iOS files, or deployment configuration.
- Do not add a responsive framework, viewport-listener dependency, or duplicated breakpoint-specific screen trees.
- Do not push to GitHub.

---

### Task 1: Responsive shell contract

**Files:**
- Create: `tests/responsive-navigation.test.js`
- Create: `src/utils/responsiveNavigation.js`
- Create: `src/components/AppShell.jsx`
- Delete: `src/components/PhoneShell.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `screen: string`, `isAuthenticated: boolean`, and navigation callbacks already owned by `App.jsx`.
- Produces: `primaryNavigationState(screen, isAuthenticated): Array<{ id, label, active }>` and `AppShell({ children, screen, isAuthenticated, onHome, onCourse, onScamChecker, onBadges, onSettings })`.

- [ ] **Step 1: Write the failing responsive shell test**

Test the real navigation model with literal expectations: signed-out screens return no items; signed-in Home returns Home, Course, Scam Checker, Badges, and Settings in that order; Home is active on `home`; Course is active on `path`; learning activity screens return no primary navigation.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/responsive-navigation.test.js`

Expected: FAIL because `src/utils/responsiveNavigation.js` does not exist.

- [ ] **Step 3: Implement the responsive shell**

Create `responsiveNavigation.js` and `AppShell.jsx` with one layout tree:

```jsx
export default function AppShell({
  children,
  screen,
  isAuthenticated,
  onHome,
  onCourse,
  onScamChecker,
  onBadges,
  onSettings,
}) {
  const showNavigation = isAuthenticated && PRIMARY_SCREENS.has(screen);
  return (
    <div className={`app-viewport app-screen-${screen}`}>
      <div className={`app-shell ${showNavigation ? "has-app-navigation" : "is-focus-shell"}`}>
        {showNavigation ? <ResponsiveNavigation activeScreen={screen} {...callbacks} /> : null}
        <main className="app-canvas">{children}</main>
      </div>
    </div>
  );
}
```

Navigation is a compact horizontal bar at 768-1023 px and a persistent left rail at 1024 px and above. Use existing icon components and visible text labels. `aria-current="page"` marks the active screen.

- [ ] **Step 4: Wire `App.jsx` to the shell**

Replace both `PhoneShell` uses with `AppShell`. Pass `screen`, `Boolean(user)`, and existing navigation callbacks. Loading uses focus mode with navigation disabled.

- [ ] **Step 5: Implement viewport and scrolling CSS**

Keep phone `100dvh` and inner scrolling below 768 px. At 768 px and above, allow `body`, `#root`, `.app-viewport`, `.app-shell`, and `.app-canvas` to grow with normal document scrolling. Add tablet width near 920 px and desktop width 1180 px. Make the desktop rail sticky and keep content backgrounds continuous.

- [ ] **Step 6: Run test and verify GREEN**

Run: `node --test tests/responsive-navigation.test.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tests/responsive-navigation.test.js src/utils/responsiveNavigation.js src/components/AppShell.jsx src/components/PhoneShell.jsx src/App.jsx src/index.css
git commit -m "feat: add adaptive browser application shell"
```

### Task 2: Landing and Home responsive composition

**Files:**
- Modify: `src/screens/Landing.jsx`
- Modify: `src/screens/Home.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing `Landing` and `Home` props unchanged.
- Produces: semantic class hooks `landing-layout`, `landing-intro`, `landing-guide`, `home-dashboard`, `home-primary`, and `home-support`.

- [ ] **Step 1: Capture the failing wide-screen behavior**

At 1280 x 800, capture the current Landing page and measure `.app-shell`. Record that it is constrained to approximately 430 px and lacks a browser-native wide composition.

- [ ] **Step 2: Run the test and verify RED**

Use the Browser plugin at 1280 x 800.

Expected: the rendered shell is approximately 430 px wide, proving the desktop behavior is not yet implemented.

- [ ] **Step 3: Refactor Landing without changing copy or callbacks**

Group brand/heading/description in `landing-intro`; group steps and buttons in `landing-guide`. At desktop use a balanced two-column grid. At phone widths preserve the existing vertical order and full-width buttons.

- [ ] **Step 4: Refactor Home without changing state behavior**

Keep header and install banner full width. Put greeting, suspicious-message action, and Continue Learning in `home-primary`; put text sizing and statistics in `home-support`. On desktop use a two-column grid; on tablet and large text collapse cleanly.

- [ ] **Step 5: Run focused and full tests**

Run: `npm test`, then repeat the Browser check at 390 x 844, 768 x 1024, and 1280 x 800.

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Landing.jsx src/screens/Home.jsx src/index.css
git commit -m "feat: adapt landing and home for larger browsers"
```

### Task 3: Responsive utility and account screens

**Files:**
- Modify: `src/screens/ScamChecker.jsx`
- Modify: `src/screens/Settings.jsx`
- Modify: `src/screens/Badges.jsx`
- Modify: `src/screens/Paywall.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: all existing screen props, API calls, error strings, and legal/subscription handlers unchanged.
- Produces: layout hooks `scam-checker-layout`, `scam-checker-main`, `scam-checker-aside`, `settings-grid`, `badges-grid`, and `paywall-layout`.

- [ ] **Step 1: Capture the failing utility-screen behavior**

At 1280 x 800, inspect each reachable utility screen and record that its content remains constrained to the phone shell. Use source review for authenticated screens that cannot be reached without credentials.

- [ ] **Step 2: Run the test and verify RED**

Use the Browser plugin at 1280 x 800 and inspect current screen containers.

Expected: utility content remains in the phone-width composition.

- [ ] **Step 3: Adapt Scam Checker**

Keep the form and result logic unchanged. Add a desktop support panel with the existing privacy and safety guidance. On success, place verdict/summary and guidance sections in a responsive grid. Stack at tablet portrait, split-screen, and large text.

- [ ] **Step 4: Adapt Settings and Badges**

Wrap Settings sections in a desktop grid while keeping the destructive account confirmation isolated across the full width. Change badge grids to two columns on phone, three on tablet, and four on desktop, with large-text rules reducing the count.

- [ ] **Step 5: Adapt Paywall**

Group benefits and plan choices into `paywall-layout` so desktop and landscape tablet can use two columns. Preserve purchase CTA, reassurance, restore, and legal content order. Keep single-column rules for phone, short viewport, and large text.

- [ ] **Step 6: Run focused and full tests**

Run: `npm test`, then repeat rendered checks for every reachable changed screen.

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/screens/ScamChecker.jsx src/screens/Settings.jsx src/screens/Badges.jsx src/screens/Paywall.jsx src/index.css
git commit -m "feat: adapt utility screens for tablet and desktop"
```

### Task 4: Learning surfaces and large-text resilience

**Files:**
- Modify: `src/screens/LessonPath.jsx`
- Modify: `src/screens/LessonPlayer.jsx`
- Modify: `src/screens/ChallengePlayer.jsx`
- Modify: `src/screens/ExamPlayer.jsx`
- Modify: `src/screens/Complete.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing lesson, challenge, exam, completion data and callbacks unchanged.
- Produces: `learning-focus`, `course-path-canvas`, and responsive path/badge CSS contracts.

- [ ] **Step 1: Capture the failing learning-surface behavior**

At desktop width, verify the current learning shell is still 430 px. Confirm existing `tests/path-layout.test.js` passes before changing path layout.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/path-layout.test.js`, then inspect the current desktop rendering.

Expected: path tests PASS, while the desktop rendering remains phone-constrained.

- [ ] **Step 3: Add focused learning wrappers**

Add `learning-focus` to the main content containers of Lesson, Challenge, Exam, and Complete. Do not change block rendering, answers, scoring, completion, or navigation.

- [ ] **Step 4: Widen Course Path safely**

Add `course-path-canvas` to the measured path container. Allow more horizontal breathing room on tablet/desktop but retain the existing ResizeObserver-driven layout and label-width limits so nodes and labels remain collision-safe.

- [ ] **Step 5: Run focused and full tests**

Run: `node --test tests/responsive-navigation.test.js tests/path-layout.test.js && npm test`

Expected: all tests PASS, including path-layout tests.

- [ ] **Step 6: Commit**

```bash
git add src/screens/LessonPath.jsx src/screens/LessonPlayer.jsx src/screens/ChallengePlayer.jsx src/screens/ExamPlayer.jsx src/screens/Complete.jsx src/index.css
git commit -m "feat: improve responsive learning surfaces"
```

### Task 5: Performance, accessibility, and rendered QA

**Files:**
- Modify only files required by defects discovered during verification.

**Interfaces:**
- Consumes: completed responsive implementation.
- Produces: verified app behavior at phone, iPad, laptop, and desktop sizes.

- [ ] **Step 1: Run static verification**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: zero test failures, zero lint errors, successful production build, and no whitespace errors. Record the existing large-bundle warning separately if it remains.

- [ ] **Step 2: Run Browser QA at required viewports**

Use the Browser plugin viewport capability at 390 x 844, 768 x 1024, 1024 x 768, 1280 x 800, and 1440 x 900. For each representative screen verify page identity, nonblank content, no framework overlay, console health, no horizontal overflow, and visible controls.

- [ ] **Step 3: Exercise real interactions**

Verify Landing -> Get Started -> Back, Landing -> Log In -> Back, and any signed-in navigation available in the local session. If authentication prevents signed-in flows, use source-backed checks and report those flows as unverified rather than inventing credentials.

- [ ] **Step 4: Verify large text and reduced motion**

At desktop and iPad widths, set EverWise text size 10 through the existing controls where available. Confirm grid collapse, wrapped labels, no clipping, and no horizontal overflow. Confirm reduced-motion CSS still disables animations.

- [ ] **Step 5: Repair any observed responsive defects test-first**

For each logic defect, extend `tests/responsive-navigation.test.js` or the relevant existing utility test, verify RED, make the smallest production change, and rerun the failing test plus the full suite. For layout-only defects, capture the failing viewport state, apply the smallest CSS or markup correction, and repeat the same rendered check.

- [ ] **Step 6: Final verification and status**

Rerun the full static commands after all repairs. Inspect `git status`, `git log`, and the final diff. Keep the development server running for user review. Do not push.

- [ ] **Step 7: Commit verified repairs**

```bash
git add tests/responsive-navigation.test.js src/utils/responsiveNavigation.js src/index.css src/components/AppShell.jsx src/App.jsx src/screens/Landing.jsx src/screens/Home.jsx src/screens/ScamChecker.jsx src/screens/Settings.jsx src/screens/Badges.jsx src/screens/Paywall.jsx src/screens/LessonPath.jsx src/screens/LessonPlayer.jsx src/screens/ChallengePlayer.jsx src/screens/ExamPlayer.jsx src/screens/Complete.jsx
git commit -m "fix: harden responsive browser layouts"
```
