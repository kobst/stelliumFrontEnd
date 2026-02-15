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
- [ ] **Insufficient Credits Handling**
  - Frontend: Check user credit balance before allowing action
  - Block action button when credits < required amount
  - Show modal when user tries action with insufficient credits:
    - "You need X more credits for this action"
    - Current balance display
    - Credit cost breakdown
    - "Purchase Credits" button → redirect to credit store
    - Option to dismiss and return
  - Visual state: Disabled/grayed out buttons with tooltip explaining credit requirement
  - Backend validation: Return 402 Payment Required if credits insufficient (don't trust frontend)
  - Handle edge case: Credits depleted during long-running operation (refund partial work?)
- [ ] **Make Ask Stellium logo/button more obvious** - Users not finding it

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
- [ ] **Credit Transaction History / Receipts**
  - Dedicated section in account/profile for reviewing all credit activity
  - Show two types of transactions:
    - **Purchases:** Credit packs bought (date, amount, price, payment method)
    - **Charges:** Credits spent on actions (date, action type, cost, remaining balance)
  - Transaction details include:
    - Timestamp
    - Description (e.g., "Birth Chart Report for John Doe", "100 Credit Pack Purchase")
    - Credits added/deducted
    - Balance after transaction
    - Receipt/invoice ID
  - Filtering options: All / Purchases / Charges, Date range
  - Export as CSV or PDF for record-keeping
  - Link to Stripe receipts for purchases
  - Searchable by action type or description
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
