# Task: Ink restyle — weekly horoscopes + legal/help pages (IN PLACE)

Read design/briefs/_shared.md first and obey every constraint there.

Restyle IN PLACE (you own these + their css): src/pages/PublicWeeklyHoroscopesPage.js, src/pages/PrivacyPolicy.js, src/pages/TermsOfService.js, src/pages/HelpCenter.js. No mocks — derive from the ink system.

1. PublicWeeklyHoroscopesPage (/horoscopes/weekly and /horoscopes/weekly/:sign — public SEO surface): InkNav variant="marketing"; paper page; sign picker restyled as ink chips/cards (keep existing routing per sign and any SVG sign icons); the weekly reading as a serif article in an ink card with an uppercase date-range strip (like the ink horoscope reading pane); conversion CTA to /signUp ("Get your personal reading ✳"); ink colophon. Preserve all existing data fetching, sign routing, and SEO semantics (h1/meta text stays meaningful).
2. PrivacyPolicy + TermsOfService: typography-first ink treatment — InkNav marketing, centered readable measure (~70ch), EB Garamond body, eyebrow + serif headings, hairline rules between sections, colophon. Content text unchanged.
3. HelpCenter: same treatment; if it has FAQ/accordion behavior, keep the logic, restyle to ink cards.

Zero behavioral change anywhere. Build must pass.
