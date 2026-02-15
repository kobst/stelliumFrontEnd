# Stellium Backlog

*Ideas, future features, and "someday" items. Not current work.*

---

## High Priority (Next Up)

- [ ] Complete Stripe credit system migration
- [ ] Test credit purchase flow end-to-end
- [ ] Update frontend to use new credit API
- [ ] **Add Medium Credit Pack to Stripe + UI** (200 credits / $24.99)
- [ ] **Add credit costs for new actions:**
  - Birth Chart Overview: 2 credits
  - Relationship Score: 10 credits

## UI Improvements (Credit Visibility)

- [ ] **Credits in header/profile dropdown** - Always visible, show `[⚡ 150]` next to profile
- [ ] **Credit cost on action buttons** - e.g., `[Generate Report - 75 ⚡]`
- [ ] **Credit deduction toast** - "✓ Report generated (-75 credits), 150 remaining"
- [ ] **Low credit warning banner** - Show when < 20 credits
- [ ] **Credit breakdown in dropdown** - Monthly vs purchased, reset date
- [ ] **Pre-action confirmation** - For expensive actions (>50 credits)
- [ ] **Make Ask Stellium logo/button more obvious** - Users not finding it
- [ ] **Transaction history page** - Show all credit charges and purchases

## Features

- [ ] **Interactive Chart Hover** - Hover over planet in ephemeris to:
  - Highlight only aspect lines connected to that planet
  - Show tooltip with planet info (sign, house, degree)
  - Display list of aspects (e.g., "♂ Mars square ♀ Venus 3°")
  - Works for all chart types:
    - Birth charts (hover planet → show aspects to other planets in same chart)
    - Synastry charts (hover Person A planet → show aspects to Person B planets)
    - Transit charts (hover transit planet → show aspects to natal planets)
  - Optional: Click to "pin" the highlight (sticky mode)
- [ ] Credit gifting between users
- [ ] Subscription tiers (monthly credit bundles)
- [ ] Usage analytics dashboard
- [ ] Webhook notifications for low credits

## Technical

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
