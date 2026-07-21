# Task: Ink My Relationships page — implement design/ink/my-relationships.html

Read design/briefs/_shared.md first and obey every constraint there.

Build src/pages/InkMyRelationshipsPage.js + InkMyRelationshipsPage.css implementing design/ink/my-relationships.html with REAL data (this becomes the "Relationships" dashboard segment; standalone component, no route wiring).

Study first: src/UI/dashboard/RelationshipsSection.js (how the user's relationships list loads — getUserCompositeCharts, partner names/dates, navigation to the detail page) and the existing create-relationship flow (route /dashboard/:userId/relationship/create — find its page component and reuse its handlers: partner selection from the user's saved charts, celebrity roster via the celebs API with search + gender filter, credit cost display, the create API call and post-create navigation).

Page structure per the mock:
- InkNav variant="app" (activeSegment="relationships").
- Page head: eyebrow "Your connections", h1 "My Relationships", "＋ Add New Relationship ✳" navy button that toggles the inline create panel (button becomes "← Back to relationships").
- Relationships list: one row-card per relationship → /dashboard/{userId}/relationship/{compositeId}. Each row: the mock's generated "duo" SVG (two interlocking mini chart wheels joined by ♥ — port the mock's inline seeded-PRNG generator into a small React component, seeding deterministically from the compositeId so each pairing gets a stable unique graphic), "{A} & {B}" with italic blue ampersand, partner birth date, "Open reading →".
- Inline create panel (replaces the list when toggled): centered "Who are we reading together?"; navy you-chip (user name + sun sign) + ♡; "Your Charts" pick-card = chip grid of the user's saved subjects (name + sun sign); "Or Choose a Celebrity" pick-card = search input + All/Male/Female filter + celebrity chips (initials medallion, name, sun sign) — wire search/filter like the mock. Selecting any chip reveals the sticky bottom CTA bar: "{user} ♡ {selection}", the real credit cost from the existing flow (the mock says 5 CREDITS — use whatever the current flow charges), "Create Relationship ✳" calling the real create API then navigating to the new relationship page.
- Empty state for zero relationships ("start your first reading" invitation in the ink voice).

Do not modify RelationshipsSection or the existing create page (import/reuse). Loading states required.
