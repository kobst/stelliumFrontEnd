# Stellium Credit System - QA Validation Spec

**Version:** 1.0  
**Date:** February 13, 2026  
**Purpose:** Validate credit system user experience, payment flows, and UI consistency

---

## Table of Contents

1. [QA Objectives](#qa-objectives)
2. [Test Environment Setup](#test-environment-setup)
3. [Credit System Fundamentals](#credit-system-fundamentals)
4. [Test Scenarios by User Journey](#test-scenarios-by-user-journey)
5. [Credit Visibility Requirements](#credit-visibility-requirements)
6. [Payment Gating Requirements](#payment-gating-requirements)
7. [UI/UX Consistency Checklist](#uiux-consistency-checklist)
8. [Edge Cases & Error States](#edge-cases--error-states)
9. [Sign-Off Criteria](#sign-off-criteria)

---

## QA Objectives

This spec validates:

✅ **Credit visibility** - Users always know their balance  
✅ **Cost transparency** - Users know what actions cost before committing  
✅ **Payment gating** - Clear upgrade/purchase prompts when credits insufficient  
✅ **Flow consistency** - Upgrade/purchase flows are intuitive and complete  
✅ **Balance updates** - Real-time credit balance updates after actions  
✅ **User education** - Tooltips, help text explain monthly vs pack credits

---

## Test Environment Setup

### Required Test Accounts

Create the following test accounts:

| Account | Tier | Monthly Credits | Pack Credits | Purpose |
|---------|------|-----------------|--------------|---------|
| `qa_free` | Free | 10 | 0 | Test free tier limitations |
| `qa_premium_new` | Premium | 200 | 0 | Test new subscriber flow |
| `qa_premium_used` | Premium | 50 | 0 | Test low monthly credits |
| `qa_premium_packs` | Premium | 150 | 75 | Test mixed credit balance |
| `qa_premium_empty` | Premium | 0 | 0 | Test fully depleted credits |
| `qa_pro` | Pro | 1000 | 0 | Test high-tier experience |

### Test Purchase Credentials

- **Stripe Test Mode Enabled**
- Test card: `4242 4242 4242 4242` (any future expiry, any CVC)
- Use for subscription and credit pack purchases

---

## Credit System Fundamentals

### Credit Types (Must Be Clear to Users)

**Monthly Credits:**
- ✅ Expire monthly (reset on subscription anniversary)
- ✅ Don't accumulate (unused credits lost at month-end)
- ✅ Shown separately from pack credits
- ✅ Visual indicator: badge, pill, or label "Monthly"

**Pack Credits:**
- ✅ Never expire
- ✅ Carry over indefinitely
- ✅ Shown separately from monthly credits
- ✅ Visual indicator: badge, pill, or label "Pack" or "Purchased"

**Deduction Priority:**
- ✅ Monthly credits used first
- ✅ Pack credits used only after monthly depleted
- ✅ User should see breakdown after actions (e.g., "-10 monthly credits")

### Credit Costs (Must Be Displayed)

| Action | Cost | Where Shown |
|--------|------|-------------|
| Quick Chart Overview | 10 | Before generation |
| Full Natal Report | 75 | Before generation |
| Relationship Overview | 10 | Before generation |
| Full Relationship Report | 60 | Before generation |
| Ask Stellium (chat) | 1 | Per message sent |

### Subscription Tiers

| Tier | Monthly Credits | Price |
|------|-----------------|-------|
| Free | 10 | $0 |
| Premium | 200 | $19.99/month |
| Pro | 1000 | $49.99/month |

### Credit Packs

| Pack | Credits | Price |
|------|---------|-------|
| Small | 75 | $9.99 |
| Medium | 200 | $24.99 |
| Large | 500 | $49.99 |

---

## Test Scenarios by User Journey

### 1. New User Onboarding

**Scenario:** First-time user signs up (free tier)

**Test Steps:**

1. **Sign up flow**
   - [ ] Welcome screen mentions free tier includes 10 credits
   - [ ] Initial credit balance visible after account creation
   - [ ] Tooltip/help text explains what credits are for

2. **First action attempt**
   - [ ] User navigates to "Generate Birth Chart"
   - [ ] UI shows cost BEFORE generation: "10 credits"
   - [ ] Button text includes cost: "Generate (10 credits)" or similar
   - [ ] User clicks generate
   - [ ] Success message shows: "Chart generated! -10 credits"
   - [ ] Credit balance updates immediately: 10 → 0

3. **Depleted state**
   - [ ] User at 0 credits sees upgrade prompt
   - [ ] All credit-gated actions show "Upgrade Required" state
   - [ ] Clear CTA buttons: "Upgrade Plan" or "Buy Credits"

**Pass Criteria:**
- User understands credits from first interaction
- Cost shown before every action
- Balance updates immediately
- Clear path to upgrade when depleted

---

### 2. Premium Subscriber - First Month

**Scenario:** User upgrades to Premium ($19.99/month)

**Test Steps:**

1. **Upgrade flow**
   - [ ] User clicks "Upgrade" from free tier
   - [ ] Pricing page shows all tiers with monthly credit allotments
   - [ ] Premium tier shows: "200 credits/month" prominently
   - [ ] Payment screen uses Stripe test mode
   - [ ] Enter test card: `4242 4242 4242 4242`
   - [ ] Payment succeeds

2. **Post-upgrade state**
   - [ ] User redirected to app (not stuck on payment screen)
   - [ ] Success message: "Welcome to Premium! You now have 200 monthly credits"
   - [ ] Credit balance shows: "200 monthly | 0 pack = 200 total"
   - [ ] All previously locked features now accessible

3. **Using monthly credits**
   - [ ] Generate Full Natal Report (75 credits)
   - [ ] UI shows cost: "75 credits" BEFORE generation
   - [ ] Confirm modal: "This will use 75 monthly credits. Continue?"
   - [ ] After generation: "Report generated! -75 monthly credits"
   - [ ] Balance updates: "125 monthly | 0 pack = 125 total"

4. **Credit breakdown visibility**
   - [ ] User can see credit breakdown at all times
   - [ ] Hover/tap on credit balance shows tooltip: "Monthly credits reset on [date]"
   - [ ] Monthly credits show progress bar: 125/200

**Pass Criteria:**
- Upgrade flow seamless (no friction)
- Immediate credit refill after upgrade
- User understands monthly credits reset
- Balance breakdown always visible

---

### 3. Mixed Credit Balance (Monthly + Pack)

**Scenario:** Premium user with 150 monthly + 75 pack credits

**Test Steps:**

1. **Initial state**
   - [ ] Credit balance shows: "150 monthly | 75 pack = 225 total"
   - [ ] Tooltip explains: "Monthly credits used first, pack credits never expire"

2. **Large deduction (depletes monthly, touches pack)**
   - [ ] User generates Full Natal Report (75 credits)
   - [ ] Deduction uses monthly only: 150 → 75 monthly
   - [ ] Balance: "75 monthly | 75 pack = 150 total"
   - [ ] User generates another Full Natal (75 credits)
   - [ ] Deduction uses ALL remaining monthly: 75 → 0 monthly
   - [ ] Balance: "0 monthly | 75 pack = 75 total"
   - [ ] User generates third report (75 credits)
   - [ ] Deduction uses pack: 75 → 0 pack
   - [ ] Balance: "0 monthly | 0 pack = 0 total"

3. **Post-depletion state**
   - [ ] UI shows: "Out of credits"
   - [ ] Two clear CTAs: "Upgrade to Pro" | "Buy Credit Pack"
   - [ ] Tooltip: "Your monthly credits will reset on [date], or buy more now"

**Pass Criteria:**
- Deduction order correct (monthly first, pack second)
- Balance breakdown updates after each action
- User sees which credit type is being used
- Clear guidance when depleted

---

### 4. Credit Pack Purchase Flow

**Scenario:** User buys credit pack while on Premium tier

**Test Steps:**

1. **Navigate to credit shop**
   - [ ] User clicks "Buy Credits" or "Credit Packs"
   - [ ] Credit pack options displayed clearly:
     - Small: 75 credits for $9.99
     - Medium: 200 credits for $24.99
     - Large: 500 credits for $49.99
   - [ ] Each pack shows "Never expires" badge
   - [ ] Current balance shown at top: "50 monthly | 0 pack = 50 total"

2. **Purchase flow**
   - [ ] User selects "Small Pack" (75 credits, $9.99)
   - [ ] Checkout screen shows:
     - Item: "75 credits"
     - Price: $9.99
     - Payment method (Stripe)
   - [ ] Enter test card: `4242 4242 4242 4242`
   - [ ] Payment succeeds

3. **Post-purchase state**
   - [ ] Success message: "75 credits added to your account!"
   - [ ] Balance updates immediately: "50 monthly | 75 pack = 125 total"
   - [ ] Receipt/confirmation sent (check email or in-app notifications)
   - [ ] User returned to app (not stuck on payment screen)

4. **Pack credit persistence**
   - [ ] Fast-forward to next month (or simulate refill)
   - [ ] Monthly credits reset: 200 monthly
   - [ ] Pack credits preserved: 75 pack
   - [ ] New balance: "200 monthly | 75 pack = 275 total"

**Pass Criteria:**
- Pack purchase flow simple (≤3 clicks)
- Credits added immediately after payment
- Pack credits clearly labeled "non-expiring"
- Pack credits preserved across months

---

### 5. Ask Stellium (Chat) Cost Transparency

**Scenario:** User interacts with Ask Stellium chat feature

**Test Steps:**

1. **Chat interface**
   - [ ] Chat input area shows cost: "1 credit per message"
   - [ ] Current balance visible in chat header or sidebar
   - [ ] User types question: "What does my rising sign mean?"

2. **Pre-send confirmation (optional but recommended)**
   - [ ] If enabled: "Send message (1 credit)?" confirm button
   - [ ] If disabled: cost shown but no extra confirmation

3. **Post-send state**
   - [ ] Message sent successfully
   - [ ] Inline feedback: "-1 credit" next to sent message
   - [ ] Balance updates: 225 → 224
   - [ ] Response from Stellium AI received

4. **Depleted during chat**
   - [ ] User with 1 credit sends message (goes to 0)
   - [ ] Next attempt to send blocked
   - [ ] Inline prompt: "Out of credits. Upgrade or buy more to continue chatting."
   - [ ] CTA buttons in chat interface: "Upgrade" | "Buy Credits"

**Pass Criteria:**
- Cost shown before every message
- Balance updates after every message
- Clear blocking when credits run out
- Upgrade/purchase CTAs accessible in-chat

---

### 6. Insufficient Credits - Upgrade Prompts

**Scenario:** User attempts action without enough credits

**Test Steps:**

1. **Free user (10 credits) tries Full Natal Report (75 credits)**
   - [ ] User clicks "Generate Full Natal Report"
   - [ ] Blocked BEFORE generation starts
   - [ ] Modal: "You need 75 credits but only have 10"
   - [ ] Two options:
     - "Upgrade to Premium (200 credits/month)" → leads to subscription page
     - "Buy Credit Pack (75 credits, $9.99)" → leads to pack purchase
   - [ ] Modal shows credit comparison chart (optional but helpful)

2. **Premium user (25 credits) tries Full Natal Report (75 credits)**
   - [ ] User clicks "Generate Full Natal Report"
   - [ ] Blocked BEFORE generation starts
   - [ ] Modal: "You need 75 credits but only have 25"
   - [ ] Two options:
     - "Upgrade to Pro (1000 credits/month)" → subscription page
     - "Buy Credit Pack" → pack purchase page
   - [ ] Message: "Your monthly credits refill on [date]"

3. **Pro user (50 credits) tries Full Natal Report (75 credits)**
   - [ ] User clicks "Generate Full Natal Report"
   - [ ] Blocked BEFORE generation starts
   - [ ] Modal: "You need 75 credits but only have 50"
   - [ ] Primary CTA: "Buy Credit Pack" (no higher tier to upgrade to)
   - [ ] Message: "Your monthly credits refill on [date]"

**Pass Criteria:**
- User NEVER charged credits for failed actions
- Clear messaging: "need X, have Y"
- Contextual upgrade options (appropriate tier suggestions)
- Refill date shown (gives user alternative to purchasing)

---

### 7. Subscription Upgrade (Free → Premium → Pro)

**Scenario:** User upgrades tiers

**Test Steps:**

1. **Free → Premium**
   - [ ] User clicks "Upgrade to Premium"
   - [ ] Pricing page shows: "Get 200 credits/month for $19.99"
   - [ ] Payment flow (Stripe test mode)
   - [ ] Success → redirected to app
   - [ ] Immediate refill: 10 → 200 monthly credits
   - [ ] Message: "Welcome to Premium! Your monthly credits have been upgraded to 200."

2. **Premium → Pro**
   - [ ] User (on Premium with 100 monthly credits) clicks "Upgrade to Pro"
   - [ ] Pricing page shows: "Get 1000 credits/month for $49.99"
   - [ ] Payment flow
   - [ ] Success → redirected to app
   - [ ] Immediate refill: 100 → 1000 monthly credits
   - [ ] Message: "Welcome to Pro! Your monthly credits have been upgraded to 1000."

3. **Pack credits preserved**
   - [ ] If user had 30 pack credits before upgrade
   - [ ] After upgrade: "1000 monthly | 30 pack = 1030 total"
   - [ ] Pack credits NOT lost during upgrade

**Pass Criteria:**
- Immediate refill on upgrade
- Pack credits preserved
- No downtime or confusion
- Clear welcome message with new allotment

---

### 8. Subscription Downgrade (Pro → Premium → Free)

**Scenario:** User downgrades or cancels subscription

**Test Steps:**

1. **Pro → Premium (scheduled downgrade)**
   - [ ] User on Pro clicks "Downgrade to Premium"
   - [ ] Warning modal: "Downgrade takes effect at next billing cycle"
   - [ ] Current state preserved: 800 monthly + 50 pack = 850 total
   - [ ] User continues using Pro benefits until renewal date
   - [ ] On renewal date:
     - Monthly credits reset to 200 (Premium allotment)
     - Old 800 monthly credits lost
     - Pack credits preserved: 50 pack
   - [ ] New balance: "200 monthly | 50 pack = 250 total"

2. **Premium → Free (cancel subscription)**
   - [ ] User on Premium clicks "Cancel Subscription"
   - [ ] Warning modal: "Cancel takes effect at end of billing period"
   - [ ] User has 120 monthly + 75 pack = 195 total
   - [ ] Continue using Premium until expiration
   - [ ] On expiration:
     - Monthly credits reset to 10 (Free allotment)
     - Old 120 monthly credits lost
     - Pack credits preserved: 75 pack
   - [ ] New balance: "10 monthly | 75 pack = 85 total"
   - [ ] Message: "Your subscription has ended. You now have 10 free credits/month. Your purchased credits (75) are still available!"

**Pass Criteria:**
- Clear warning about when downgrade takes effect
- Monthly credits lost, pack credits preserved
- User notified about pack credit preservation
- Free tier still usable with pack credits

---

### 9. Monthly Credit Refill

**Scenario:** User's subscription renews (monthly credits reset)

**Test Steps:**

1. **Pre-refill state**
   - [ ] Premium user with 35 monthly + 50 pack = 85 total
   - [ ] Subscription anniversary: tomorrow
   - [ ] UI shows: "Monthly credits refill in 1 day"

2. **Refill day**
   - [ ] User logs in after renewal
   - [ ] Banner notification: "Your monthly credits have been refilled to 200!"
   - [ ] Balance: "200 monthly | 50 pack = 250 total"
   - [ ] Old 35 monthly credits lost (not 200 + 35)

3. **Refill on upgrade**
   - [ ] User upgrades mid-cycle
   - [ ] Immediate refill (not wait for anniversary)
   - [ ] Anniversary date resets to today

**Pass Criteria:**
- Unused monthly credits lost at refill (not accumulated)
- Pack credits preserved
- User notified of refill
- Refill date visible in UI

---

## Credit Visibility Requirements

### Where Credit Balance Must Be Shown

✅ **Global Navigation/Header**
- [ ] Credit balance visible on every screen
- [ ] Format: "225 credits" or "150 monthly | 75 pack"
- [ ] Tappable/clickable → opens credit breakdown modal

✅ **Credit Breakdown Modal**
- [ ] Monthly credits: "150/200" with progress bar
- [ ] Pack credits: "75 (never expire)"
- [ ] Total: "225 credits available"
- [ ] Next refill date: "Refills on March 13, 2026"
- [ ] CTAs: "Upgrade Plan" | "Buy Credits"

✅ **Before Credit-Gated Actions**
- [ ] Birth chart generation screen: "10 credits" or "75 credits"
- [ ] Relationship report screen: "10 credits" or "60 credits"
- [ ] Ask Stellium chat: "1 credit per message"
- [ ] Confirmation modal: "This action will cost X credits. Continue?"

✅ **After Credit Deduction**
- [ ] Success message: "Report generated! -75 credits"
- [ ] Updated balance shown: "150 monthly | 75 pack = 225 total"

✅ **Settings/Profile Page**
- [ ] Full credit breakdown
- [ ] Transaction history (last 10 transactions)
- [ ] Subscription tier + renewal date
- [ ] Link to "Manage Subscription" and "Buy Credits"

### Credit Balance Format Examples

**Good Examples:**
- "225 credits" (simple, clear)
- "150 monthly + 75 pack" (detailed breakdown)
- "125/200 monthly | 30 pack" (with limit shown)

**Bad Examples:**
- "Credits: 225" (too formal, unnecessarily verbose)
- "You have 225" (ambiguous, doesn't say "credits")
- No balance shown (unacceptable)

---

## Payment Gating Requirements

### When to Show Upgrade/Purchase Prompts

✅ **Insufficient Credits Modal**

Triggered when: User attempts action but lacks credits

**Modal Content:**
- **Headline**: "Not enough credits"
- **Body**: "You need [X] credits but only have [Y]"
- **Option 1**: "Upgrade to [next tier]" (if applicable)
  - Shows: "[Tier name]: [monthly credits] credits/month for [price]"
- **Option 2**: "Buy Credit Pack"
  - Shows: "Small Pack: 75 credits for $9.99" (or similar)
- **Dismiss**: "Cancel" or "Maybe later"

✅ **Soft Prompts (Non-Blocking)**

Triggered when: User has <25% of monthly allotment remaining

**Placement**: Banner at top of screen or subtle notification

**Content**:
- "Running low on credits! You have [X] left. [Upgrade] or [Buy Credits]"

✅ **Zero Credits State**

Triggered when: User has 0 total credits

**Full-screen or modal**:
- **Headline**: "You're out of credits"
- **Body**: "Upgrade your plan or buy more credits to continue using Stellium"
- **CTA**: "View Plans" | "Buy Credits"
- **Note**: "Your monthly credits refill on [date]" (if applicable)

### Where Payment CTAs Must Appear

- [ ] **In insufficient credits modal** (primary)
- [ ] **In credit balance dropdown/modal** (secondary)
- [ ] **In settings page** (always accessible)
- [ ] **In-app banners** (when credits low)
- [ ] **In Ask Stellium chat** (when depleted mid-chat)

---

## UI/UX Consistency Checklist

### Terminology Consistency

✅ **Use consistent terms app-wide:**
- "credits" (lowercase, plural)
- "monthly credits" (not "subscription credits" or "recurring credits")
- "pack credits" (not "purchased credits" or "consumable credits")
- "upgrade" (to go to higher tier)
- "buy credits" (to purchase credit pack)

### Visual Consistency

✅ **Credit balance display:**
- [ ] Same format across all screens
- [ ] Same icon (if using icon)
- [ ] Same color scheme (e.g., green = healthy balance, red = low/depleted)

✅ **Cost indicators:**
- [ ] Consistent placement (e.g., always below action button)
- [ ] Consistent styling (e.g., badge, pill, or inline text)
- [ ] Consistent wording: "[Action name] • [X credits]"

✅ **Buttons/CTAs:**
- [ ] "Generate ([X] credits)" format for action buttons
- [ ] "Upgrade Plan" for tier upgrades
- [ ] "Buy Credits" for credit pack purchases
- [ ] Consistent button colors (primary = action, secondary = upgrade)

### Copy/Messaging Consistency

✅ **Success messages:**
- Format: "[Action completed]! -[X] credits"
- Example: "Birth chart generated! -10 credits"

✅ **Error messages:**
- Format: "You need [X] credits but only have [Y]"
- Always followed by upgrade/purchase CTAs

✅ **Informational tooltips:**
- "Monthly credits reset on [date]"
- "Pack credits never expire"
- Consistent help text across the app

---

## Edge Cases & Error States

### Test These Scenarios

1. **Race Condition: Simultaneous Actions**
   - [ ] User clicks "Generate Report" multiple times rapidly
   - [ ] Only one report generated, credits deducted once
   - [ ] No double-charging

2. **Payment Failure**
   - [ ] User attempts credit pack purchase
   - [ ] Payment fails (use Stripe test card: `4000 0000 0000 0002`)
   - [ ] Error message: "Payment failed. Please try again or use a different card."
   - [ ] Credits NOT added to account
   - [ ] User can retry

3. **Subscription Lapse**
   - [ ] User's subscription expires (payment failed renewal)
   - [ ] Downgraded to free tier automatically
   - [ ] Monthly credits reset to 10
   - [ ] Pack credits preserved
   - [ ] Notification: "Your subscription has lapsed. Upgrade to continue."

4. **Offline/Network Error During Action**
   - [ ] User generates report, network fails mid-process
   - [ ] Report generation fails
   - [ ] Credits NOT deducted (rollback)
   - [ ] Error message: "Network error. Please try again. No credits were charged."

5. **Credit Balance Negative (Should Never Happen)**
   - [ ] If balance goes negative (bug), app should:
     - Display 0 credits (not negative number)
     - Block all credit-gated actions
     - Log error to backend for investigation

6. **Refill During Active Session**
   - [ ] User has app open when monthly refill occurs (midnight or anniversary time)
   - [ ] Balance updates in real-time (no app restart required)
   - [ ] Notification: "Your monthly credits have been refilled!"

7. **Pack Purchase During Depleted State**
   - [ ] User at 0 credits buys credit pack
   - [ ] Credits added immediately
   - [ ] All previously locked features unlocked
   - [ ] No need to refresh/restart app

---

## Sign-Off Criteria

### Critical (Must Pass)

- [ ] **Credit balance visible on every screen**
- [ ] **Cost shown before every credit-gated action**
- [ ] **Balance updates immediately after actions**
- [ ] **Clear upgrade/purchase prompts when credits insufficient**
- [ ] **Monthly vs pack credits clearly differentiated**
- [ ] **Pack credits preserved across months/downgrades**
- [ ] **Upgrade flow completes successfully (Stripe test mode)**
- [ ] **Credit pack purchase flow completes successfully (Stripe test mode)**
- [ ] **Insufficient credits never result in failed action + charged credits**
- [ ] **Terminology consistent across app**

### High Priority (Should Pass)

- [ ] **Credit breakdown modal accessible from header**
- [ ] **Transaction history visible in settings**
- [ ] **Tooltips explain monthly vs pack credits**
- [ ] **Next refill date shown**
- [ ] **Soft prompts when credits low (<25%)**
- [ ] **Success/error messages consistent and helpful**
- [ ] **No double-charging on rapid clicks**
- [ ] **Payment failures handled gracefully**

### Nice-to-Have (Recommended)

- [ ] **Progress bar for monthly credits (X/Y)**
- [ ] **Inline cost confirmation modals (optional "are you sure?" step)**
- [ ] **Credit cost comparison chart in upgrade modal**
- [ ] **Animated balance updates (smooth transitions)**
- [ ] **Push notification when monthly credits refill**
- [ ] **Email receipt for credit pack purchases**

---

## QA Testing Checklist Summary

Use this checklist to track testing progress:

### User Journeys
- [ ] New user onboarding (free tier)
- [ ] Premium subscriber - first month
- [ ] Mixed credit balance (monthly + pack)
- [ ] Credit pack purchase flow
- [ ] Ask Stellium (chat) cost transparency
- [ ] Insufficient credits - upgrade prompts
- [ ] Subscription upgrade (Free → Premium → Pro)
- [ ] Subscription downgrade (Pro → Premium → Free)
- [ ] Monthly credit refill

### Credit Visibility
- [ ] Balance shown in header/navigation
- [ ] Credit breakdown modal
- [ ] Cost shown before actions
- [ ] Balance updates after actions
- [ ] Settings page credit info

### Payment Gating
- [ ] Insufficient credits modal
- [ ] Soft prompts (low credits warning)
- [ ] Zero credits full-screen state
- [ ] Payment CTAs accessible

### Edge Cases
- [ ] Race condition prevention
- [ ] Payment failure handling
- [ ] Subscription lapse
- [ ] Offline/network errors
- [ ] Negative balance prevention
- [ ] Refill during active session
- [ ] Purchase during depleted state

---

## Test Report Template

After completing QA, fill out this report:

```markdown
# Stellium Credit System QA Report

**Date:** [Date]
**Tester:** [Name]
**App Version:** [Version]
**Environment:** [Staging/Production]

## Summary
- Total scenarios tested: [X]
- Passed: [Y]
- Failed: [Z]
- Blocked: [W]

## Critical Issues Found
1. [Issue description] - **Priority: P0**
2. [Issue description] - **Priority: P1**

## High Priority Issues
1. [Issue description]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Sign-Off Status
- [ ] Approved for production
- [ ] Needs fixes before release
- [ ] Blocked (needs design/backend changes)

**Tester Signature:** __________________  
**Product Owner Approval:** __________________
```

---

## Appendix: Quick Reference

### Credit Costs
- Quick Chart: 10 credits
- Full Natal Report: 75 credits
- Relationship Overview: 10 credits
- Full Relationship: 60 credits
- Ask Stellium: 1 credit/message

### Subscription Tiers
- Free: 10 credits/month ($0)
- Premium: 200 credits/month ($19.99)
- Pro: 1000 credits/month ($49.99)

### Credit Packs
- Small: 75 credits ($9.99)
- Medium: 200 credits ($24.99)
- Large: 500 credits ($49.99)

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3DS: `4000 0027 6000 3184`

---

**End of QA Spec**
