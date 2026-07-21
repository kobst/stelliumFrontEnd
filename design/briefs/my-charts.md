# Task: Ink My Charts page — implement design/ink/my-charts.html

Read design/briefs/_shared.md first and obey every constraint there.

Build src/pages/InkMyChartsPage.js + InkMyChartsPage.css implementing design/ink/my-charts.html with REAL data (this will become the "Charts" segment of the dashboard; build it as a standalone page component, route wiring happens later).

Study first: src/pages/MainDashboard.js + src/UI/dashboard/BirthChartsSection.js + src/UI/dashboard/birthCharts/YourChartCard.js + GuestChartCard.js (where the chart list comes from: the owner's own chart + guest subjects, photos, sun signs, active-chart state) and src/UI/dashboard/AddChartModal.js (the working create-chart flow: name/gender/Google-Places birth location/known-unknown time/datetime; API + validation + credit handling).

Page structure per the mock:
- InkNav variant="app" (activeSegment="charts").
- Page head: eyebrow "Your collection", h1 "My Birth Charts", gold rule, right-aligned count "{N} charts · 1 active".
- Card grid (auto-fill minmax(200px,1fr)): one card per chart — numbered badge, portrait (subject photo when available, else tinted-initials fallback rotating through the mock's four tints), name + sun sign row. The owner's own chart is the "active" card (blue ring + ✳ badge) and sorts first. Each card links to /dashboard/{userId}/chart/{chartId}. Final cell: dashed "＋ Add Birth Chart" tile.
- Add Birth Chart modal: the mock's paper modal (blur overlay, "Included with Plus" note, circular photo slot, First/Last name, Gender, Birth Location, time known/unknown, Birth Date & Time, navy "Create Birth Chart ✳" submit, italic footer). REUSE the existing AddChartModal's logic wholesale — either restyle that component via ink classes applied through your own wrapper, or build the ink markup and lift AddChartModal's handlers/API calls into it (do not re-implement geocoding/validation from scratch; import and reuse). Photo upload only if the existing flow supports it — otherwise render the photo slot as a disabled decorative element.
- Open/close on click, backdrop, and Escape per the mock.

Do not modify BirthChartsSection/AddChartModal in place (import from them). Loading skeleton + empty state required.
