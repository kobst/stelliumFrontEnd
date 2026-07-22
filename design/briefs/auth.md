# Task: Ink restyle — login + onboarding (IN PLACE, styling only)

Read design/briefs/_shared.md first and obey every constraint there.

Restyle these existing pages to the ink design language, editing them IN PLACE (you own these files): src/pages/LoginPage.js (+ its css), src/pages/OnboardingPage.js (+ css), src/pages/OnboardingConfirmation.js (+ css). No ink mock exists — derive from the established system: paper background, EB Garamond, ink-card form panels with hairline borders, navy pill buttons, eyebrow labels, Caveat accents where a human touch fits (e.g. a small sticky-note aside), InkNav variant="marketing" on top, ink colophon footer.

ABSOLUTELY CRITICAL: zero behavioral change. Keep every handler, validation rule, state field, Google Places autocomplete wiring, Firebase/auth call, redirect, and error path exactly as-is. You may restructure JSX wrappers and class names for styling, but the logic must be untouched — if unsure whether something is styling or logic, leave it.

Forms per ink form conventions (see the Add Birth Chart modal in src/pages/InkMyChartsPage.js for field styling reference — import its CSS if useful). Error and loading states restyled to ink (soft red on paper, italic serif). Login/signup mode toggle keeps existing default behavior. Build must pass.
