# Stellium Credit System - QA & User Journey Testing

**Purpose:** Manual QA testing guide for the credit gating system  
**Last Updated:** 2026-02-06  
**Tester:** Claude (Browser)

---

## Prerequisites

Before testing, ensure you have:
- [ ] Access to Stellium dev environment (api.dev.stellium.ai)
- [ ] Test user accounts for each tier (Free, Premium, Pro)
- [ ] Stripe test mode enabled
- [ ] Access to MongoDB to verify credit balances

---

## Credit Costs Reference

| Action | Credit Cost |
|--------|-------------|
| Quick Chart Overview | 10 credits |
| Full Natal Report | 75 credits |
| Relationship Overview | 10 credits |
| Full Relationship Report | 60 credits |
| Ask Stellium (chat question) | 1 credit |

---

## Test Scenarios

### 1. New User Onboarding

**Scenario 1.1: Fresh signup (Free tier)**
```
Steps:
1. Create new account with email/password
2. Complete onboarding (add birth details)
3. Check credit balance

Expected:
- User starts with 10 monthly credits
- Pack credits = 0
- Total = 10
- Can see credit balance somewhere in UI

Verify:
- [ ] Credits shown correctly
- [ ] User understands they have limited credits
```

**Scenario 1.2: First action as free user**
```
Steps:
1. As new free user (10 credits)
2. Try to generate Quick Chart Overview (costs 10)

Expected:
- Action should succeed
- Credits deducted: 10 → 0
- User sees updated balance
- User sees confirmation of credits spent

Verify:
- [ ] Action completes successfully
- [ ] Credit balance updates immediately
- [ ] User notified of credit deduction
```

---

### 2. Insufficient Credits Flow

**Scenario 2.1: Action blocked - not enough credits**
```
Steps:
1. User with 5 credits remaining
2. Try to generate Full Natal Report (costs 75)

Expected:
- Action is BLOCKED before starting
- Clear error message: "You need 75 credits but only have 5"
- Options presented:
  - Upgrade plan
  - Buy credit pack
- No partial charge / no work started

Verify:
- [ ] Action blocked BEFORE any processing
- [ ] Error message is clear and specific
- [ ] Credit cost shown in error
- [ ] Available credits shown in error
- [ ] CTA buttons for upgrade/purchase work
```

**Scenario 2.2: Zero credits - any action**
```
Steps:
1. User with 0 credits
2. Try Ask Stellium (costs 1 credit)

Expected:
- Blocked immediately
- Message: "You're out of credits"
- Prominent CTA to buy/upgrade

Verify:
- [ ] Cannot send chat message
- [ ] UI indicates 0 credits before user tries
- [ ] Easy path to purchase
```

**Scenario 2.3: Insufficient credits - relationship analysis**
```
Steps:
1. User with 30 credits
2. Try Full Relationship Report (costs 60)

Expected:
- Blocked with clear messaging
- Shows: "Need 60, have 30"

Verify:
- [ ] Blocked before processing
- [ ] Message specific to relationship feature
```

---

### 3. Successful Credit Deduction

**Scenario 3.1: Ask Stellium chat (1 credit)**
```
Steps:
1. User with 50 credits (40 monthly, 10 pack)
2. Send a question in Ask Stellium

Expected:
- Question processes successfully
- 1 credit deducted FROM MONTHLY first
- New balance: 49 (39 monthly, 10 pack)
- Response delivered

Verify:
- [ ] Monthly credits deducted first (not pack)
- [ ] Balance updates in UI
- [ ] Transaction logged in backend
```

**Scenario 3.2: Full Natal Report (75 credits)**
```
Steps:
1. User with 100 credits (80 monthly, 20 pack)
2. Generate Full Natal Report

Expected:
- Report generates successfully
- 75 deducted: 80 monthly → 5 monthly, pack unchanged
- New balance: 25 (5 monthly, 20 pack)

Verify:
- [ ] Monthly depleted before pack touched
- [ ] Report content delivered
- [ ] UI shows new balance
```

**Scenario 3.3: Deduction crosses monthly/pack boundary**
```
Steps:
1. User with 50 credits (30 monthly, 20 pack)
2. Generate Full Relationship Report (60 credits)

Expected:
- Succeeds (50 < 60 would fail, but 30+20=50 still < 60)
- WAIT - this should FAIL. User only has 50, needs 60.

Let me recalculate:
- User has 90 credits (30 monthly, 60 pack)
- Generate report (60 credits)
- Deduct: 30 from monthly (now 0), 30 from pack (now 30)
- New balance: 30 (0 monthly, 30 pack)

Verify:
- [ ] Monthly fully depleted first
- [ ] Remainder taken from pack
- [ ] Final balance correct
- [ ] Transaction log shows split deduction
```

---

### 4. Credit Purchase Flow

**Scenario 4.1: Buy Small Credit Pack (75 credits / $9.99)**
```
Steps:
1. User with 10 credits (10 monthly, 0 pack)
2. Navigate to buy credits
3. Select Small Pack
4. Complete Stripe checkout

Expected:
- Stripe checkout opens
- Payment processes
- 75 credits added to PACK balance (not monthly)
- New balance: 85 (10 monthly, 75 pack)
- Confirmation shown

Verify:
- [ ] Credits added to pack (not monthly)
- [ ] Balance updates immediately after payment
- [ ] Receipt/confirmation shown
- [ ] Can immediately use new credits
```

**Scenario 4.2: Buy credits when at zero**
```
Steps:
1. User with 0 credits
2. Try action → blocked → click "Buy Credits"
3. Purchase Medium Pack (200 credits)

Expected:
- Smooth flow from error to purchase
- After purchase: 200 pack credits
- Can immediately retry blocked action

Verify:
- [ ] Purchase flow accessible from error state
- [ ] Credits available immediately
- [ ] Can complete previously blocked action
```

---

### 5. Subscription Tier Changes

**Scenario 5.1: Upgrade Free → Premium**
```
Steps:
1. Free user with 3 credits remaining (3 monthly, 0 pack)
2. Subscribe to Premium ($19.99/mo)

Expected:
- Immediate credit refill to 200 monthly
- Pack credits preserved (still 0)
- New balance: 200 (200 monthly, 0 pack)
- Plan badge updates

Verify:
- [ ] Monthly credits RESET to new tier (not added)
- [ ] Pack credits unchanged
- [ ] Plan badge shows "Plus Member"
- [ ] New tier features unlocked
```

**Scenario 5.2: Upgrade with existing pack credits**
```
Steps:
1. Free user with 5 monthly + 50 pack credits
2. Upgrade to Premium

Expected:
- Monthly: 5 → 200 (reset to new tier)
- Pack: 50 (preserved)
- Total: 250

Verify:
- [ ] Pack credits not touched
- [ ] Monthly fully reset
```

**Scenario 5.3: Downgrade Premium → Free**
```
Steps:
1. Premium user with 150 monthly + 30 pack
2. Cancel subscription (downgrade to Free)

Expected:
- At cancellation: schedule downgrade for end of billing period
- At period end: Monthly resets to 10 (free tier)
- Pack: 30 (preserved)
- Total: 40

Verify:
- [ ] Downgrade happens at period end (not immediate)
- [ ] Pack credits preserved
- [ ] User informed of upcoming change
```

---

### 6. Monthly Credit Refresh

**Scenario 6.1: Normal monthly refresh**
```
Steps:
1. Premium user, 15 days into billing cycle
2. 45 monthly credits remaining (used 155)
3. Wait for anniversary date

Expected:
- At anniversary: Monthly resets to 200
- Unused 45 credits LOST (no rollover)
- Pack credits unchanged

Verify:
- [ ] Monthly resets (not accumulates)
- [ ] Pack preserved
- [ ] User notified of refresh
```

**Scenario 6.2: Refresh with pack credits**
```
Steps:
1. User with 0 monthly + 100 pack
2. Anniversary date arrives

Expected:
- Monthly: 0 → 200 (tier allotment)
- Pack: 100 (unchanged)
- Total: 300

Verify:
- [ ] Refresh doesn't touch pack
- [ ] Monthly fully restored
```

---

### 7. UI Credit Visibility

**Scenario 7.1: Credit balance in header/profile**
```
Check:
1. Is credit balance visible in main app header?
2. Is it visible in profile dropdown?
3. Is it visible on dashboard?

Current State:
- Credits only shown in Settings > Subscription
- NOT visible in header or profile dropdown

Expected (after improvements):
- Always-visible credit count in header
- Breakdown in dropdown on hover/click

Issues to Flag:
- [ ] Credits not visible enough - users don't know their balance
- [ ] Must navigate to settings to see credits
```

**Scenario 7.2: Credit cost shown before action**
```
Check for each action:
- [ ] Full Natal Report button shows "75 credits" cost
- [ ] Relationship Report shows "60 credits" cost  
- [ ] Ask Stellium shows "1 credit per question"
- [ ] Quick overview shows "10 credits"

Issues to Flag:
- [ ] Costs not shown upfront
- [ ] User surprised by deduction
```

**Scenario 7.3: Post-action credit feedback**
```
After each credit-consuming action:
- [ ] Toast/notification showing credits spent
- [ ] Updated balance visible
- [ ] Transaction recorded

Issues to Flag:
- [ ] No confirmation of credits spent
- [ ] Balance doesn't update immediately
```

---

### 8. Edge Cases

**Scenario 8.1: Concurrent actions**
```
Steps:
1. User with exactly 75 credits
2. Initiate Full Natal Report
3. While processing, try Ask Stellium in another tab

Expected:
- First action succeeds (75 → 0)
- Second action fails (insufficient credits)
- No double-charging or race condition

Verify:
- [ ] Atomic credit deduction
- [ ] No negative balance possible
```

**Scenario 8.2: Action fails mid-processing**
```
Steps:
1. User initiates report generation (75 credits)
2. Backend fails mid-generation (API error)

Expected:
- Credits NOT deducted if action incomplete
- OR credits refunded if already deducted
- User informed of failure
- Can retry

Verify:
- [ ] Credits not lost on failed action
- [ ] Clear error message
- [ ] Retry possible
```

**Scenario 8.3: Session expires during action**
```
Steps:
1. Start long-running action
2. Session/token expires

Expected:
- Action completes if already started
- Credits handled correctly
- User can see results after re-login

Verify:
- [ ] Action not orphaned
- [ ] Credits correctly charged (once)
```

---

## UI Improvement Recommendations

### High Priority

1. **Add credits to header/profile dropdown**
   ```
   Current: [Profile Name] [Plan Badge]
   Proposed: [Profile Name] [⚡ 150] [Plan Badge]
   ```
   - Show total credits always visible
   - Click/hover shows breakdown (monthly vs pack)

2. **Show credit cost on action buttons**
   ```
   Current: [Generate Full Report]
   Proposed: [Generate Full Report - 75 ⚡]
   ```
   - User knows cost before clicking
   - Prevents surprise deductions

3. **Credit deduction toast/notification**
   ```
   After action: "✓ Full Report generated (-75 credits)"
   With balance: "150 credits remaining"
   ```

4. **Low credit warning banner**
   ```
   When < 20 credits: 
   "⚠️ Running low on credits (15 remaining) - Buy More"
   ```

### Medium Priority

5. **Credit breakdown in profile dropdown**
   ```
   ┌─────────────────────┐
   │ John Smith          │
   │ Plus Member         │
   ├─────────────────────┤
   │ ⚡ 150 Credits       │
   │   120 monthly       │
   │   30 purchased      │
   │ Resets Feb 15       │
   ├─────────────────────┤
   │ [Buy More Credits]  │
   └─────────────────────┘
   ```

6. **Pre-action confirmation for expensive actions**
   ```
   "Generate Full Natal Report?"
   "This will use 75 of your 150 credits"
   [Cancel] [Generate]
   ```

7. **Credit history/transaction log**
   - Accessible from settings
   - Shows all charges and purchases
   - Helps users understand usage

### Low Priority

8. **Credit usage analytics**
   - "You've used 85 credits this month"
   - "Most used: Ask Stellium (45 questions)"

9. **Credit gifting UI** (future feature)

---

## Backend Verification Queries

```javascript
// Check user credit balance
db.subjects.findOne(
  { _id: ObjectId("USER_ID") },
  { 
    "subscription.monthlyRemaining": 1, 
    "subscription.packBalance": 1,
    "subscription.monthlyAllotment": 1,
    "subscription.tier": 1
  }
)

// Check recent transactions
db.credit_transactions.find(
  { userId: ObjectId("USER_ID") }
).sort({ timestamp: -1 }).limit(10)

// Verify deduction logic
db.credit_transactions.findOne(
  { userId: ObjectId("USER_ID"), type: "deduction" },
  { metadata: 1, balanceBefore: 1, balanceAfter: 1 }
)
```

---

## Test Accounts Needed

| Account | Tier | Starting Credits | Purpose |
|---------|------|------------------|---------|
| test-free@stellium.ai | Free | 10 monthly, 0 pack | Test free tier limits |
| test-premium@stellium.ai | Premium | 200 monthly, 50 pack | Test premium features |
| test-zero@stellium.ai | Free | 0 monthly, 0 pack | Test empty state |
| test-low@stellium.ai | Free | 5 monthly, 0 pack | Test low credit warnings |

---

## Known Issues / Gaps

1. **Credits not visible in header** - Must go to settings
2. **No cost shown on buttons** - User doesn't know before clicking
3. **No deduction confirmation** - Silent credit spend
4. **No low credit warning** - User surprised when blocked

---

## Sign-off

| Test Section | Pass/Fail | Notes | Tester | Date |
|--------------|-----------|-------|--------|------|
| 1. New User | | | | |
| 2. Insufficient Credits | | | | |
| 3. Successful Deduction | | | | |
| 4. Purchase Flow | | | | |
| 5. Tier Changes | | | | |
| 6. Monthly Refresh | | | | |
| 7. UI Visibility | | | | |
| 8. Edge Cases | | | | |
