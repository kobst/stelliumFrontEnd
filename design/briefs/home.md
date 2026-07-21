# Task: Ink landing page — implement design/ink/home.html

Read design/briefs/_shared.md first and obey every constraint there.

Build src/pages/InkLandingPage.js + InkLandingPage.css implementing design/ink/home.html section-for-section (marketing page, logged-out):

1. InkNav variant="marketing" (anchor links can target section ids on this page).
2. Hero: two-column, copy left (eyebrow / h1 "The stars, read just for you." / lede / navy CTA "Get started" → /signUp + ghost CTA "See how it works" → anchor / micro line "No credit card · 25 welcome credits"), art right. NOTE: the mock's hero image (hero-moon-mountain.png) could not be exported — build the hero art region as a composition instead: navy rounded medallion card containing a static top-down ChartScene rendering a hardcoded sample chart (see src/pages/Chart3DPage.js for a labeled sample-chart data pattern; paused={false}, topDown, disableZoom), with the mock's rotated Caveat sticky note overlapping its corner. Keep the mix-blend/paper aesthetic.
3. "Ask Stellium" band (paper-2): headline left; right rotated sticky-note sample question + sample answer + "— Stellium ✳" signature; full-width ask-bar beneath (italic input + "Ask Stellium ✳" button). The ask-bar is a teaser: submitting routes to /signUp.
4. "Three ways" cards using /assets/ink/ill-wheel.png, ill-venn.png, ill-road.png with the mock's copy.
5. Celebrities band (paper-2): fetch REAL featured celebrities via the existing public API (see src/pages/PublicCelebritiesPage.js for getCelebs usage and photo fields) — show 4 cards (photo or initials fallback, name, "Sun · Moon" line) linking to /celebrities. Then celebrity couples: see src/pages/PublicCelebrityRelationships.js for the API — 3 cards (image or initials pair, names, italic gold archetype label from the record) linking to /celebrity-relationships. Fall back to the mock's static PNG cards (celeb-1..4.png, couple-1..3.png with the mock's names) if either fetch fails or returns empty.
6. Assurances 4-column bordered grid card (mock copy verbatim).
7. Footer colophon: wordmark, links to /privacy-policy and /terms-of-service, © 2026.

Do not modify the existing src/pages/LandingPage.js. Match the mock's type scale, spacing, and paper texture faithfully.
