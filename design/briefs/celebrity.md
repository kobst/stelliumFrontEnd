# Task: Ink restyle — public celebrity pages (IN PLACE)

Read design/briefs/_shared.md first and obey every constraint there.

Restyle these four existing public pages to the ink design language, editing IN PLACE (you own them + their css files): src/pages/PublicCelebritiesPage.js, src/pages/PublicCelebrityDashboard.js, src/pages/PublicCelebrityRelationships.js, src/pages/PublicCelebrityRelationship.js. No ink mocks — derive:

- All four: InkNav variant="marketing" (these are logged-out SEO/browse pages), paper background, ink colophon footer, "Get started ✳" conversion CTAs where the pages already have signup prompts.
- /celebrities browser: card grid in the style of the ink My Charts grid and the landing's celebrity cards (portrait or tinted initials, name, "Sun · Moon" line) — reuse the existing fetching/search/filter logic exactly.
- /celebrities/:id detail: mirror the ink birth chart page's structure (header "✳ Name" + birth meta; roman-numeral tabs for whatever sections this page already renders; navy ChartScene medallion with the celebrity's real chart, background="#1b2140"). Import and reuse classes from src/pages/InkBirthChartPage.css rather than re-inventing them (read-only import; page-specific additions go in your own css).
- /celebrity-relationships list: rows/cards in the style of ink My Relationships (duo aesthetic optional — reuse existing imagery fields; archetype label in italic gold).
- /celebrity-relationships/:id detail: mirror the ink relationship page structure (partners strip, tabs, relationship ChartScene medallion) — import InkRelationshipPage.css classes where they fit.

Reuse all existing data logic (these pages already fetch celebs, charts, analyses — do not re-implement). Public pages must render without auth. Preserve any SEO-relevant headings/text semantics. Loading/empty states in ink. Build must pass.
