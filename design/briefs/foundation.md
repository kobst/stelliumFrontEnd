# Task: build the "ink" design-system foundation

Work ONLY in this directory (/Users/edwardhan/stellium-frontend-ink — a git worktree on branch feature/ink-design, React 18 CRA app). Do not commit.

CONTEXT: We are re-skinning five pages of this app to a new "ink on paper" aesthetic. The design mocks live in design/ink/ (home.html, birth-chart.html, relationship.html, my-charts.html, my-relationships.html). Read them — their <style> blocks are the source of truth for the shared visual language. This task builds ONLY the shared foundation; other agents will build the pages on top of it.

DELIVERABLES:

1. src/styles/ink.css — the shared ink theme:
   - :root tokens exactly from the mocks: --paper:#f4efe5; --paper-2:#f0ebe0; --card:#f6f1e7; --ink:#232840; --ink-soft:rgba(35,40,64,.78); --ink-faint:rgba(35,40,64,.55); --blue:#3437a8; --gold:#b08d3e; --navy:#1b2140; --line:rgba(35,40,64,.16)
   - Reusable primitives replicated faithfully from the mocks' common CSS, namespaced with an `ink-` prefix to avoid colliding with the app's existing dark-theme styles: page background, section band (paper-2), card, hairline rules, eyebrow label, sect-head, navy pill button + ghost button, sticky-note with tape pseudo-element, Caveat annotation text, pmenu/pm-item sub-tab list, sticky roman-numeral tab bar (.ink-tab/.ink-panel with on/show states), modal overlay, chip, asp-row (aspect list row: glyph/label/orb/phase). Match font sizes, letter-spacing, borders and radii from the mocks.

2. Fonts: EB Garamond (400/500/600 + italics) and Caveat via a Google Fonts <link> appended to public/index.html (check what's already there; don't remove existing links).

3. src/UI/ink/InkNav.js + src/UI/ink/InkNav.css — the shared top nav, two variants:
   - variant="marketing" (see home.html nav): wordmark "Stellium ✳" (the mocks say "Iris" — we brand as Stellium), anchor links, navy "Get started" pill linking to /signUp (react-router Link).
   - variant="app" (see my-charts.html / my-relationships.html nav): wordmark linking to "/", centered segmented nav [Horoscope | Charts | Relationships]. Inspect src/UI/dashboard/DashboardNav.js and src/pages/MainDashboard.js to find how the existing app navigates between those sections, and wire the segments to the same targets (design the props API so host pages can mark the active segment and pass callbacks if needed). Right side: gold credits pill "✳ N credits" using the useEntitlements hook (see how existing pages use src/hooks/useEntitlements with the user from src/context/AuthContext), and a user chip (name, tier label, initials avatar).

4. Copy all 12 PNGs from design/ink/assets/ into public/assets/ink/ (bash cp is fine).

CONSTRAINTS: Do not modify any existing page components in this task. Keep everything additive. `npm run build` must pass at the end (node_modules already installed) — run it and fix any errors you introduce.

REPORT AT THE END: files created; the class-name inventory of ink.css (so page builders know what exists); the InkNav props API you settled on.
