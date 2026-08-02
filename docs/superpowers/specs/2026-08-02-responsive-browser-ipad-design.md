# EverWise Responsive Browser and iPad Design

## Objective

Make the existing EverWise React web app feel intentional and comfortable in desktop browsers and on iPads while preserving its proven phone experience, calm visual language, and accessibility priorities.

The approved direction is **Adaptive Focus**: use available width for navigation and supporting context, but keep the active learning task in one clear, readable column.

## Success Criteria

- Phone widths below 768 px retain the current focused, full-height mobile experience.
- iPad widths from 768 px through 1023 px use a wider content surface and compact top navigation without unnecessary empty margins.
- Desktop widths of 1024 px and above use a persistent navigation rail and a generous main content area inside a centered application frame.
- The application supports normal browser scrolling on iPad and desktop instead of trapping all content in a phone-sized inner scroller.
- Primary content lines remain readable, generally no wider than 65-75 characters.
- Interactive controls remain at least 44 px high and support keyboard focus, hover, touch, and reduced motion.
- EverWise text sizes 1-10 remain functional. Large text collapses multi-column arrangements before content becomes cramped.
- Existing authentication, learning progression, subscription, Firebase, and scam-checker behavior remains unchanged.

## Responsive Layout System

### Phone: below 768 px

- Preserve the current edge-to-edge application shell and safe-area behavior.
- Keep existing screen-level scrolling and current navigation patterns.
- Do not add a persistent navigation rail or compact browser header.

### iPad: 768-1023 px

- Expand the application surface to a maximum width near 920 px with comfortable outer margins.
- Replace the phone-frame appearance with a light application surface and a compact top navigation bar for signed-in primary screens.
- Use two columns only where the secondary column provides useful supporting context, such as Home, Landing, Settings, Scam Checker, and Paywall.
- Keep the course path and learning players centered in a focused column.
- Collapse to one column in narrow split-screen or Stage Manager widths.

### Desktop: 1024 px and above

- Use a centered application frame up to approximately 1180 px wide.
- Show a persistent left navigation rail on signed-in primary screens: Home, Course, Scam Checker, Badges, and Settings.
- Highlight the current destination and use real buttons with clear labels, icons, hover states, and visible keyboard focus.
- Keep the content canvas flexible. Do not stretch prose merely because space exists.
- Allow the browser page to scroll naturally while keeping the navigation rail available with sticky positioning.

## Shell Architecture

Refactor the phone-only shell into a responsive application shell with three responsibilities:

1. Apply viewport, safe-area, and scrolling behavior appropriate to the current breakpoint.
2. Render signed-in responsive navigation when the current screen supports it.
3. Provide a centered content canvas with screen-specific width variants: `standard`, `wide`, and `focus`.

The shell receives the active screen and navigation callbacks from `App.jsx`; it does not own application state or duplicate routing logic.

Primary navigation is available on Home, Course Path, Scam Checker, Badges, and Settings. On lesson, challenge, exam, completion, onboarding, authentication, and paywall screens, the shell uses focus mode and relies on the screen's existing back or continue controls.

## Screen Adaptations

### Landing and onboarding

- Desktop and landscape iPad: brand promise and explanation on the left; steps and actions on the right.
- Portrait iPad and phone: stack in the current logical order.
- Forms remain a single readable column even when the surrounding page is wider.

### Home

- Desktop: two-column composition. The greeting, scam-check action, and learning CTA form the primary column; progress statistics and text controls form a supporting column.
- iPad: the same areas use a balanced grid when space permits and stack in split-screen.
- Phone: preserve the current order and density.

### Course path and badges

- Increase usable canvas width without stretching labels beyond readable limits.
- Keep the learning path centered and preserve its collision-safe layout calculations.
- Allow badge grids to grow from two columns on phones to three or four columns when text size and available width permit.

### Lesson, challenge, exam, and completion

- Remain focused single-column experiences with a maximum readable width near 760 px.
- Use the full browser height when content is short and normal page scrolling when content is long.
- Keep primary progression controls easy to find at the end of the content; use sticky behavior only where it does not hide content or conflict with large text.

### Scam Checker

- Desktop idle state: explanation/safety guidance beside the message form.
- Result state: verdict and summary in the primary column, warning signs and next steps in a supporting column.
- iPad and large-text modes collapse to one column.
- Do not change message handling, privacy text, API calls, or error behavior.

### Settings

- Desktop groups use a two-column section grid while each setting row remains internally readable.
- Destructive account controls remain visually separated and never move next to routine actions in a way that encourages accidental activation.

### Paywall

- Desktop and landscape iPad may place benefits beside plan choices.
- Purchase terms, restore controls, legal links, and reassurance remain complete and prominent.
- Phone and large-text modes retain a single-column, vertically ordered purchase flow.

## Accessibility and Browser Behavior

- Preserve the existing warm cream, clay, sage, high-contrast palette and Source Sans typography.
- Preserve current text-size controls and reduced-motion rules.
- Introduce responsive layouts with CSS media and container rules rather than reading viewport width during render.
- At EverWise text sizes 7-10, multi-column content collapses to one column regardless of viewport width where necessary.
- Avoid horizontal scrolling at all supported widths.
- Keep browser zoom functional and avoid disabling text selection globally on desktop content; selection remains available for normal text and form fields.
- Maintain semantic landmarks and give responsive navigation an accessible label.

## Data and State Flow

`App.jsx` remains the owner of the active screen and all navigation callbacks. The responsive shell receives those values and renders navigation controls that call the existing callbacks. Screen components continue to receive the same data and mutation handlers. No Firebase schema, subscription rule, lesson data, API contract, or saved-progress format changes.

## Error Handling

- Responsive layout must not alter existing request or authentication errors.
- The shell must render its content even if optional navigation callbacks are unavailable.
- Long labels, large text, and localization-like expansion wrap rather than clip.
- Split-screen widths fall back to the phone/tablet stacked layout rather than forcing a desktop rail.

## Performance

- Use CSS breakpoints and existing components; do not add a responsive framework or viewport-listener dependency.
- Keep icons imported directly and avoid duplicating screen content for different breakpoints.
- Use `content-visibility` only for long, off-screen lists where it does not interfere with accessibility or path measurements.
- Address the existing large JavaScript bundle only where safe, such as deferring screen modules, without mixing risky application-architecture changes into the responsive pass.

## Testing Strategy

### Automated

- Add a failing responsive-shell contract test before implementation.
- Run the full existing Node test suite after each responsive milestone.
- Run lint and a production build.

### Rendered browser QA

Verify at minimum:

- 390 x 844 phone
- 768 x 1024 portrait iPad
- 1024 x 768 landscape iPad
- 1280 x 800 laptop
- 1440 x 900 desktop

For each class of screen, check page identity, meaningful content, lack of framework overlays, console health, visible focus, no horizontal overflow, and one real interaction. Repeat key checks at EverWise text size 10 and with reduced motion.

Primary flows:

1. Landing to onboarding/log-in navigation.
2. Home to Course and back.
3. Home to Scam Checker and back.
4. Home to Badges and Settings.
5. Course Path to a learning activity and back.

## Scope Boundaries

This work changes responsive presentation and browser interaction only. It does not redesign the curriculum, authentication, subscription access, Firebase persistence, AI verdict behavior, native iOS project, or deployment configuration. No GitHub push or production deployment is included.
