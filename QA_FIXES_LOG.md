# QA Fixes Log

Fixes applied in response to the QA Checklist Report.

---

## Fix 1: Missing "Ask Stellium" tab on Chart Detail page

**QA Report:** "Only Overview tab visible — Missing tabs: Chart, Planets, Dominance Patterns, Analysis, Ask Stellium"

**Verification:** 5 of 6 tabs were actually rendering (Overview, Chart, Patterns, Planets, 360 Analysis). Only the "Ask Stellium" tab was missing from the navigation. The section content existed in `ChartDetailPage.js` but the hardcoded `SECTIONS` array in `SectionNav.js` did not include it.

**Fix:** Added `{ id: 'chat', label: 'Ask Stellium' }` to the `SECTIONS` array in `SectionNav.js`.

**File changed:** `src/UI/dashboard/chartDetail/SectionNav.js`

---

## Fix 2: Horoscope locking was inverted

**QA Report:** "Daily: Accessible to Free users (doc says should be LOCKED). Weekly: LOCKED for Free users (doc says should be ACCESSIBLE)."

**Verification:** Confirmed. The entitlements store defaults were correct (`daily: false, weekly: true, monthly: true`) but `HoroscopeSection.js` was checking `canAccessWeekly` to lock the Weekly tab, and had no lock check for Daily at all. This contradicted the pricing page which states Free users get "Weekly & Monthly" and Plus users get "Daily, Weekly & Monthly".

**Fix:**
- Changed the fetch guard from checking `canAccessWeekly` to checking `canAccessDaily`
- Changed the lock check from `isWeeklyLocked` to `isDailyLocked` (locks Daily for free users)
- Removed the Weekly lock entirely (Weekly is always accessible per pricing)

**Files changed:** `src/UI/dashboard/HoroscopeSection.js`

---

## Fix 3: Locked horoscope replaces entire view (tabs disappear)

**QA Report:** "When clicking a locked horoscope, the entire page replaces with the locked content view — the Daily/Weekly/Monthly tabs disappear with no way to return."

**Verification:** Confirmed. The component did an early `return` with only `LockedContent`, skipping the `TimeSelector` tabs entirely.

**Fix:**
- Instead of early-returning, the locked content is now passed as a `lockedContent` prop to `HoroscopeContent`
- `HoroscopeContent` renders the `TimeSelector` tabs first, then shows the locked content below — so users can always switch between periods
- Added `lockedContent` prop support to `HoroscopeContent`

**Files changed:** `src/UI/dashboard/HoroscopeSection.js`, `src/UI/dashboard/horoscope/HoroscopeContent.js`

---

## Fix 4: Footer missing Help Center link

**QA Report:** "Footer missing Help Center link — only has Privacy Policy and Terms of Service."

**Verification:** Confirmed. The `/help` route exists but was not linked from the footer.

**Fix:** Added `<li><a href="/help">Help Center</a></li>` to the Legal column in the footer.

**File changed:** `src/pages/LandingPage.js`

---

## Fix 5: Footer copyright year is 2024

**QA Report:** "Footer copyright says '2024' — should be updated."

**Verification:** Confirmed.

**Fix:** Updated from "© 2024" to "© 2026".

**File changed:** `src/pages/LandingPage.js`

---

## Fix 6: Celebrity table shows raw ISO date format

**QA Report:** "Date format in table shows raw ISO format (e.g., '1997-03-14T12:00:00') — not user-friendly."

**Verification:** Confirmed. The `CelebritiesTable` component rendered `celebrity.dateOfBirth` directly without formatting.

**Fix:** Added a `formatDateOfBirth()` helper that converts ISO dates to readable format (e.g., "March 14, 1997"). Applied to the date column in the table.

**File changed:** `src/UI/prototype/CelebritiesTable.js`

---

## Previously Fixed (before QA report was filed)

### Sidebar nav disappears on horizontal compression
The chart detail and relationship analysis layouts collapsed to single-column at tablet widths, hiding the sidebar navigation. Fixed by keeping the two-column grid at tablet widths with a narrower sidebar, only collapsing to single-column on mobile (767px).

**Files changed:** `ChartDetailLayout.css`, `SectionNav.css`, `RelationshipDetailLayout.css`, `RelationshipSidebar.css`, `RelationshipSectionNav.css`

### Back to Dashboard button stretches full width
The back button's parent had `display: flex; flex-direction: column` causing the button to stretch. Fixed with `align-self: flex-start` and removing the full-width background/border.

**Files changed:** `ChartDetailHeader.css`, `ChartDetailPage.css`

---

## Issues Not Fixed (not bugs)

| QA Report Claim | Verdict |
|---|---|
| "Celebrity cards on landing page are NOT clickable" | FALSE — Cards use `GuestChartCard` with `onClick` that navigates to `/celebrities/:id`. Working as intended. |
| "Dashboard only shows Horoscope — Birth Charts and Relationships are on separate pages" | FALSE — `MainDashboard.js` renders all three inline via section switching. Header nav items switch sections, not pages. |
| "Chart detail page missing 5 of 6 tabs" | PARTIALLY FALSE — Only Ask Stellium was missing. Other tabs show `LockedContent` for free users, which QA may have mistaken for missing. |
| "No sidebar/hamburger navigation on dashboard" | FALSE — Top header nav IS the navigation. Sidebar only appears on detail pages by design. |
| "Create Relationship page doesn't have a birth data entry form" | BY DESIGN — Users create guest charts from Birth Charts section first, then select for relationships. |
| Hero CTA says "Get My Quick Chart Overview" instead of "Get Started Free" | COPY DECISION — Needs product confirmation on intended wording. Not changed. |
