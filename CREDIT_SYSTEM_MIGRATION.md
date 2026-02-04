# Credit System Migration - Changes Documentation

## Overview
Migrated from Entitlements V2 system (separate quotas for analyses/questions) back to unified Credit System for simplicity and flexibility.

---

## Backend Changes

### 1. Type System Updates

**File:** `types/subscription.ts`
- Changed `SubscriptionTier = 'free' | 'premium' | 'pro'` → `'free' | 'plus'`
- Updated `TIER_CREDITS`:
  ```typescript
  free: { monthlyCredits: 10 }
  plus: { monthlyCredits: 200 }
  ```

**File:** `types/entitlements.ts`
- Added `CREDIT_PACK` to `ProductType`
- Updated `PLUS_BENEFITS`:
  ```typescript
  MONTHLY_CREDITS: 200,
  DAILY_HOROSCOPE: true,
  SUBSCRIPTION_PRICE_CENTS: 2000
  ```
- Updated `PRODUCT_PRICING`:
  ```typescript
  CREDIT_PACK: {
    PRICE: 1000,      // $10
    QUANTITY: 100,    // 100 credits
  }
  ```

### 2. New Service: Credit Summary

**File:** `services/creditSummaryService.ts` (NEW)
Returns credit-based entitlements instead of separate quotas:
```typescript
{
  plan: 'free' | 'plus',
  planActiveUntil: Date | null,
  isSubscriptionActive: boolean,
  hasEverSubscribed: boolean,
  credits: {
    total: number,        // monthly + pack
    monthly: number,      // from monthly allotment
    pack: number,         // purchased credits
    monthlyLimit: number, // tier's monthly allotment
    resetDate: Date | null
  },
  horoscopeAccess: {
    daily: boolean,
    weekly: boolean,
    monthly: boolean
  }
}
```

### 3. API Changes

**Endpoint:** `GET /users/:userId/entitlements`
**Before:**
```json
{
  "plan": "plus",
  "analysesRemaining": 2,
  "questionsRemaining": 45,
  "purchasedQuestions": 10
}
```

**After:**
```json
{
  "plan": "plus",
  "credits": {
    "total": 185,
    "monthly": 150,
    "pack": 35,
    "monthlyLimit": 200,
    "resetDate": "2026-02-28"
  },
  "horoscopeAccess": {
    "daily": true,
    "weekly": true,
    "monthly": true
  }
}
```

### 4. Purchase Flow

**File:** `services/purchaseServiceV2.ts`
- Added `handleCreditPackPurchase()` function
- Calls `addPackCredits(userId, 100, 'CREDIT_PACK_PURCHASE')`

**File:** `controllers/entitlementControllerV2.ts`
- Updated `getEntitlementsHandler()` to use `getCreditSummary()` instead of `getEntitlementsSummary()`

### 5. Credit Costs (Unchanged)

**File:** `constants/creditCosts.ts`
```typescript
FULL_NATAL_ANALYSIS: 75 credits
FULL_RELATIONSHIP_ANALYSIS: 60 credits
ASK_STELLIUM_QUESTION: 1 credit
DAILY_HOROSCOPE: 1 credit (0 for Plus users)
```

### 6. Configuration

**File:** `serverless.yml`
```yaml
creditGatingEnabled: 'true'  # Enabled in both dev and prod
```

---

## Frontend Changes

### 1. Entitlements Store

**File:** `src/Utilities/entitlementsStore.js`

**Removed state:**
```javascript
analyses: { remaining, resetDate }
questions: { monthly, purchased, total, resetDate }
relationships: { remaining, resetDate }
```

**New state:**
```javascript
credits: {
  total: 0,        // monthly + pack
  monthly: 0,      // from monthly allotment
  pack: 0,         // purchased credits
  monthlyLimit: 0, // tier's monthly allotment
  resetDate: null
}
```

**New methods:**
```javascript
hasEnoughCredits: (cost) => state.credits.total >= cost
getCredits: () => state.credits
getCreditsBreakdown: () => { total, monthly, pack, monthlyLimit, resetDate }
```

**Removed methods:**
```javascript
hasQuestionsRemaining()  // REMOVED
getAnalysesAvailable()   // REMOVED
```

### 2. New Component: CreditsIndicator

**File:** `src/UI/entitlements/CreditsIndicator.js` (NEW)

Replaces `QuestionsIndicator` and `AnalysisQuotaCard`.

**Props:**
```javascript
{
  total: number,
  monthly: number,
  pack: number,
  monthlyLimit: number,
  resetDate: Date,
  compact: boolean,
  onBuyMore: function
}
```

**Features:**
- Shows total credits with breakdown (monthly + pack)
- Usage hints (birth chart: 75, relationship: 60, question: 1)
- "Buy More" button when low/empty

### 3. Updated Components

**File:** `src/UI/askStellium/AskStelliumPanel.js`
```javascript
// BEFORE
const hasQuestionsRemaining = useEntitlementsStore(state => state.hasQuestionsRemaining);
if (!hasQuestionsRemaining()) { ... }

// AFTER
const hasEnoughCredits = useEntitlementsStore(state => state.hasEnoughCredits);
const credits = useEntitlementsStore(state => state.credits);
if (!hasEnoughCredits(1)) { ... }
```

**Paywall updated:**
- Shows current credit balance
- Two CTAs: "Upgrade to Plus (200 credits/mo)" and "Buy Credit Pack (100 for $10)"

**File:** `src/UI/dashboard/settings/SubscriptionSettings.js`
```javascript
// BEFORE
<AnalysisQuotaCard remaining={...} />
<QuestionsIndicator questionsRemaining={...} />

// AFTER
<CreditsIndicator
  total={entitlements?.credits?.total}
  monthly={entitlements?.credits?.monthly}
  pack={entitlements?.credits?.pack}
  onBuyMore={purchaseCreditPack}
/>
```

### 4. Purchase Hook

**File:** `src/hooks/useCheckout.js`
```javascript
// RENAMED
purchaseQuestionPack() → purchaseCreditPack()

// Calls API with productType: 'CREDIT_PACK'
// Success message: "100 credits added to your account!"
```

---

## Stripe Configuration

### Products Created:

1. **Stellium Plus** (Subscription)
   - Product ID: `prod_TquBHpZ8gx9lb5`
   - Price ID: `price_1StCMgKqmyfPG5waG3UATO6v`
   - Price: $20/month
   - Description: "200 credits per month + daily horoscopes..."

2. **Stellium Credit Pack** (One-time)
   - Product ID: `prod_TujSvYSc6NW3Hg`
   - Price ID: `price_1SwtzBKqmyfPG5wa9dASe36k`
   - Price: $10
   - Metadata:
     - `productType`: `CREDIT_PACK`
     - `credits`: `100`

### AWS Secrets Manager

**Secrets to add:**
```
stellium/dev/api-keys:
  STRIPE_PLUS_PRICE_ID: price_1StCMgKqmyfPG5waG3UATO6v
  STRIPE_SECRET_KEY: sk_live_...
  STRIPE_WEBHOOK_SECRET: whsec_...

stellium/prod/api-keys:
  STRIPE_PLUS_PRICE_ID: price_1StCMgKqmyfPG5waG3UATO6v
  STRIPE_SECRET_KEY: sk_live_...
  STRIPE_WEBHOOK_SECRET: whsec_...
```

---

## Breaking Changes

### API Response Structure Changed

Components expecting old structure will break:
```javascript
// WILL BREAK - old structure
entitlements?.analysesRemaining
entitlements?.questionsRemaining
entitlements?.questions?.total

// USE INSTEAD - new structure
entitlements?.credits?.total
entitlements?.credits?.monthly
entitlements?.credits?.pack
```

### Store Methods Removed

```javascript
// REMOVED
hasQuestionsRemaining()
getAnalysesAvailable()
getRelationshipsRemaining()

// USE INSTEAD
hasEnoughCredits(cost)
getCredits()
```

---

## Current Error Analysis

**Error:** `Cannot read properties of undefined (reading 'remaining')`
**Location:** `useEntitlements.js:110` / `MainDashboard.js:24`

**Likely Cause:**
Component is trying to access old structure that no longer exists in API response:
```javascript
// This will fail now:
entitlements?.analyses?.remaining
entitlements?.questions?.remaining
entitlements?.relationships?.remaining
```

**Fix Required:**
1. Find components accessing `.remaining` on old properties
2. Update to use `credits.total` or `credits.monthly` instead
3. Update any logic that checks quotas to check credits instead

**Files to Check:**
- `src/UI/dashboard/MainDashboard.js` (line 24)
- `src/Utilities/useEntitlements.js` (line 110)
- Any component importing `AnalysisQuotaCard` or `QuestionsIndicator`

---

## Migration Checklist

### Backend
- [x] Update type system (remove pro, rename premium → plus)
- [x] Create creditSummaryService
- [x] Update entitlements API endpoint
- [x] Add credit pack purchase handling
- [x] Enable credit gating
- [x] Update Stripe checkout descriptions

### Frontend
- [x] Update entitlementsStore (credits instead of quotas)
- [x] Create CreditsIndicator component
- [x] Update AskStelliumPanel
- [x] Update SubscriptionSettings
- [x] Update useCheckout hook
- [ ] **FIX: Update MainDashboard to use credits**
- [ ] **FIX: Search and replace all `.remaining` references**
- [ ] **FIX: Remove imports of AnalysisQuotaCard/QuestionsIndicator**

### Infrastructure
- [x] Create Stripe Plus product
- [x] Create Stripe Credit Pack product
- [ ] Add STRIPE_PLUS_PRICE_ID to AWS Secrets (both dev/prod)
- [ ] Deploy backend
- [ ] Deploy frontend

---

## Testing Checklist

- [ ] Free user sees 10 credits
- [ ] Plus user sees 200 credits
- [ ] Credit pack purchase adds 100 to pack balance
- [ ] Ask Stellium deducts 1 credit
- [ ] Birth chart unlock deducts 75 credits
- [ ] Relationship analysis deducts 60 credits
- [ ] Credits display correctly in settings
- [ ] Paywall shows correct messaging
- [ ] Plus subscription checkout works
- [ ] Credit pack checkout works

---

## Key Files Changed

### Backend
- types/subscription.ts
- types/entitlements.ts
- services/creditSummaryService.ts (NEW)
- services/purchaseServiceV2.ts
- services/entitlementService.ts
- services/entitlementDbService.ts
- services/stripeCheckoutService.ts
- controllers/entitlementControllerV2.ts
- controllers/horoscopeController.ts
- utilities/subscriptionErrors.ts
- utilities/subscriptionHelpers.ts
- serverless.yml

### Frontend
- src/Utilities/entitlementsStore.js
- src/UI/entitlements/CreditsIndicator.js (NEW)
- src/UI/entitlements/CreditsIndicator.css (NEW)
- src/UI/entitlements/index.js
- src/UI/askStellium/AskStelliumPanel.js
- src/UI/askStellium/AskStelliumPanel.css
- src/UI/dashboard/settings/SubscriptionSettings.js
- src/UI/dashboard/settings/SubscriptionSettings.css
- src/hooks/useCheckout.js
