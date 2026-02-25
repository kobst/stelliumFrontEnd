# Stellium Backlog

*Ideas, future features, and "someday" items. Not current work.*

---

## High Priority (Next Up)

- [x] Complete Stripe credit system migration ✅
- [x] Test credit purchase flow end-to-end ✅
- [x] Update frontend to use new credit API ✅
- [x] **Add credit costs for new actions:** ✅
  - Birth Chart Overview: 2 credits
  - Relationship Score: 10 credits
- [x] **Fix Firebase auth/unauthorized-domain error** ✅ (fixed in Firebase console)
- [x] **Mobile optimization** ✅ (commit 9a5cae6 on mainDev)
- [x] **Ask Stellium for celeb charts/relationships** ✅ (commits 034f77e mainDev, 7d6db4e main)
- [ ] **Add Medium Credit Pack to Stripe + UI** (200 credits / $24.99) - not urgent
- [ ] **Pronoun handling in reports/Ask Stellium**
  - Use "you" when talking about the user
  - Use 3rd person when talking about celebs or guest charts
  - Note: Module exists (`addressingUtils.ts`), needs database migration to fix celebrity markers

## UI Improvements (Credit Visibility)

- [x] **Credits in header/profile dropdown** ✅ - `TopHeader.js` with credits pill + popover
- [x] **Credit cost on action buttons** ✅ - e.g., `AnalysisTab.js` shows "(75 credits)"
- [x] **Credit deduction toast** ✅ - `entitlementsStore.js` shows "{cost} credits used. {remaining} remaining."
- [x] **Low credit warning banner** ✅ - `TopHeader.js` highlights when ≤20 or ≤25% of limit
- [x] **Credit breakdown in dropdown** ✅ - Shows monthly vs purchased, reset date
- [x] **Insufficient Credits Handling** ✅
  - `InsufficientCreditsModal.js` shows balance, required amount, purchase options
  - Buttons disabled when credits insufficient
  - Backend validation with 402 Payment Required
- [ ] **Pre-action confirmation** - For expensive actions (>50 credits)
- [ ] **Make Ask Stellium logo/button more obvious** - Users not finding it

## Features

- [x] **Detailed Relationship Score Breakdown** ✅ (commits c86fbb0, 1ff2a8d, d126d1d)
  - Expandable cluster tabs (Harmony, Passion, Connection, Stability, Growth)
  - "View All Aspects" button shows full list
  - Support vs challenge aspect lists with toggle
  - ALL aspects included (not just top 3-5)
  - Sortable by strength/points
  - Source filtering (all/synastry/composite/housePlacement)
  - Score badges with star ratings
- [ ] **Interactive Chart Hover** - Hover over planet in ephemeris to:
  - Highlight only aspect lines connected to that planet
  - Show tooltip with planet info (sign, house, degree)
  - Display list of aspects (e.g., "♂ Mars square ♀ Venus 3°")
  - Works for all chart types:
    - Birth charts (hover planet → show aspects to other planets in same chart)
    - Synastry charts (hover Person A planet → show aspects to Person B planets)
    - Transit charts (hover transit planet → show aspects to natal planets)
  - Optional: Click to "pin" the highlight (sticky mode)
- [x] **Credit Transaction History / Receipts** ✅ (commits 2dd6df5 backend, f05b19c frontend)
  - Transactions tab in Settings (`TransactionsSettings.js`)
  - Shows purchases (credit packs) and charges (actions)
  - Filtering: All / Purchases / Charges, date range
  - CSV and PDF export functionality
  - Stripe receipt links with copy button
  - Cursor-based pagination
- [x] **Celebrity Relationship Analysis** ✅ IMPLEMENTED 2026-02-15
  - Created CelebrityRelationshipPage (`/dashboard/:userId/celebrity-analysis`)
  - Browse celebrities with search and pagination
  - Gender filter (All/Male/Female)
  - "Analyze with [Celebrity]" button - creates relationship and navigates to results
  - Shows compatibility scores via existing RelationshipAnalysisPage
  - Added "★ Celebrity Compatibility" button to RelationshipsSection
  - Standard credit cost (5 credits) - same as regular relationship
  - Future enhancements: Save favorites, share results
- [ ] **Celebrity Suggestion Form**
  - Simple form for users to suggest celebrities to add to database
  - Fields:
    - User email (pre-filled from auth)
    - User name (pre-filled from profile)
    - Celebrity name (required)
    - Optional: Celebrity birth details if known (date/time/location)
  - Submit button sends to backend endpoint
  - Success message: "Thanks! We'll review your suggestion."
  - Error handling for failed submissions
  - Rate limiting: Max 5 suggestions per user per day
  - Link accessible from celebrity browse page ("Don't see who you're looking for? Suggest a celebrity")
- [ ] Credit gifting between users
- [ ] Subscription tiers (monthly credit bundles)
- [ ] Usage analytics dashboard
- [ ] Webhook notifications for low credits

## Technical

- [ ] **Robust Polling System for Long Operations**
  - Improve reliability for birth chart generation and relationship analysis
  - Issues to address:
    - Handle network interruptions gracefully (reconnect and resume)
    - Exponential backoff on polling failures
    - Client-side timeout with clear error messages
    - Server-side job status persistence (don't lose progress on Lambda timeout)
    - Progress indicators (% complete, current step)
    - Retry mechanism for failed jobs
    - Fallback to WebSocket/Server-Sent Events for real-time updates?
  - Current pain points: Polling can fail silently, no recovery mechanism
- [ ] Optimize Lambda cold starts
- [ ] Add caching layer for chart calculations
- [ ] Improve error handling and logging

## Ideas (Not Committed)

- Partner/affiliate credit system
- API access tier for developers
- Bulk chart generation for events

---

## Discussions Log

*Capture significant discussions and decisions here*

### 2026-02-04: RevenueCat → Stripe Migration
**Decision:** Migrate from RevenueCat to Stripe credit system after app store rejection.
**Rationale:** More control over payment flow, works for web + mobile.

---

*Update this file when ideas come up. Review periodically to promote items to active work.*
