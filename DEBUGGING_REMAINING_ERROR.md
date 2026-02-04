# Debugging "Cannot read properties of undefined (reading 'remaining')" Error

## Error Details
```
TypeError: Cannot read properties of undefined (reading 'remaining')
    at useEntitlements.js:110:48
    at MainDashboard.js:24:24
```

## Root Cause
Components are trying to access old entitlements structure that no longer exists:
```javascript
// OLD API Response (no longer returned):
{
  analyses: { remaining: 2 },
  questions: { remaining: 45 },
  relationships: { remaining: 1 }
}

// NEW API Response:
{
  credits: { total: 185, monthly: 150, pack: 35 }
}
```

---

## Fix Steps

### 1. Search for `.remaining` References

Run in frontend directory:
```bash
grep -r "\.remaining" src/ --include="*.js" --include="*.jsx"
```

Look for patterns like:
```javascript
entitlements?.analyses?.remaining
entitlements?.questions?.remaining
entitlements?.relationships?.remaining
entitlements?.monthlyAnalysesRemaining
entitlements?.questionsRemaining
```

### 2. Update Each Reference

**BEFORE:**
```javascript
// Checking analyses
if (entitlements?.analyses?.remaining > 0) { ... }
if (entitlements?.monthlyAnalysesRemaining > 0) { ... }

// Checking questions
if (entitlements?.questions?.remaining > 0) { ... }
if (entitlements?.questionsRemaining > 0) { ... }

// Displaying
<span>{entitlements?.analyses?.remaining} analyses left</span>
<span>{entitlements?.questionsRemaining} questions left</span>
```

**AFTER:**
```javascript
// Check if enough credits for birth chart (75 credits)
if (entitlements?.credits?.total >= 75) { ... }

// Check if enough credits for question (1 credit)
if (entitlements?.credits?.total >= 1) { ... }

// Display total credits
<span>{entitlements?.credits?.total} credits remaining</span>

// Display breakdown
<span>{entitlements?.credits?.monthly} monthly + {entitlements?.credits?.pack} purchased</span>
```

### 3. Find Components Using Old Indicators

Search for:
```bash
grep -r "AnalysisQuotaCard\|QuestionsIndicator" src/ --include="*.js"
```

Replace with:
```javascript
import { CreditsIndicator } from '../../entitlements';

// OLD
<AnalysisQuotaCard remaining={entitlements?.analysesRemaining} />
<QuestionsIndicator questionsRemaining={entitlements?.questionsRemaining} />

// NEW
<CreditsIndicator
  total={entitlements?.credits?.total || 0}
  monthly={entitlements?.credits?.monthly || 0}
  pack={entitlements?.credits?.pack || 0}
  monthlyLimit={entitlements?.credits?.monthlyLimit || 0}
  resetDate={entitlements?.credits?.resetDate}
  onBuyMore={() => purchaseCreditPack()}
/>
```

### 4. Update Hook Usage

Search for:
```bash
grep -r "useEntitlementsStore" src/ --include="*.js"
```

**BEFORE:**
```javascript
const hasQuestionsRemaining = useEntitlementsStore(state => state.hasQuestionsRemaining);
const analysesRemaining = useEntitlementsStore(state => state.analyses.remaining);
```

**AFTER:**
```javascript
const hasEnoughCredits = useEntitlementsStore(state => state.hasEnoughCredits);
const credits = useEntitlementsStore(state => state.credits);

// Then use:
if (hasEnoughCredits(75)) { /* can unlock birth chart */ }
if (hasEnoughCredits(1)) { /* can ask question */ }
```

---

## Specific File Fixes

### MainDashboard.js (line 24)

Look for code like:
```javascript
// LIKELY BROKEN CODE:
const analysesLeft = entitlements?.analyses?.remaining || 0;
const questionsLeft = entitlements?.questions?.remaining || 0;

// OR
<SomeComponent 
  analysesRemaining={entitlements?.analysesRemaining}
  questionsRemaining={entitlements?.questionsRemaining}
/>
```

**Fix to:**
```javascript
const creditsLeft = entitlements?.credits?.total || 0;
const canUnlockAnalysis = creditsLeft >= 75;
const canAskQuestion = creditsLeft >= 1;

// OR
<SomeComponent 
  creditsTotal={entitlements?.credits?.total}
  creditsMonthly={entitlements?.credits?.monthly}
/>
```

### useEntitlements.js (line 110)

This might be a custom hook. Check if it's accessing:
```javascript
// BROKEN:
return {
  analysesRemaining: entitlements?.analyses?.remaining,
  questionsRemaining: entitlements?.questions?.remaining,
}

// FIX:
return {
  creditsTotal: entitlements?.credits?.total,
  creditsMonthly: entitlements?.credits?.monthly,
  creditsPack: entitlements?.credits?.pack,
}
```

---

## Common Patterns to Find and Replace

### Pattern 1: Conditional Rendering
```javascript
// FIND
{entitlements?.analyses?.remaining > 0 && <AnalyzeButton />}
{entitlements?.questions?.remaining > 0 && <AskButton />}

// REPLACE WITH
{entitlements?.credits?.total >= 75 && <AnalyzeButton />}
{entitlements?.credits?.total >= 1 && <AskButton />}
```

### Pattern 2: Display Text
```javascript
// FIND
You have {entitlements?.analyses?.remaining} analyses left
You have {entitlements?.questionsRemaining} questions left

// REPLACE WITH
You have {entitlements?.credits?.total} credits
({entitlements?.credits?.monthly} monthly, {entitlements?.credits?.pack} purchased)
```

### Pattern 3: Paywalls
```javascript
// FIND
if (!entitlements?.analyses?.remaining && !entitlements?.questionsRemaining) {
  showPaywall();
}

// REPLACE WITH
if (entitlements?.credits?.total < costNeeded) {
  showPaywall();
}
```

### Pattern 4: Feature Gates
```javascript
// FIND
const canCreateAnalysis = entitlements?.analyses?.remaining > 0 || isPlusUser;
const canAskQuestion = entitlements?.questionsRemaining > 0;

// REPLACE WITH
const canCreateAnalysis = entitlements?.credits?.total >= 75;
const canAskQuestion = entitlements?.credits?.total >= 1;
```

---

## Testing After Fix

1. **Console log entitlements:**
   ```javascript
   useEffect(() => {
     console.log('Entitlements:', entitlements);
   }, [entitlements]);
   ```
   
   Should see:
   ```javascript
   {
     plan: "plus",
     credits: {
       total: 200,
       monthly: 200,
       pack: 0,
       monthlyLimit: 200,
       resetDate: "2026-03-01T00:00:00.000Z"
     },
     horoscopeAccess: { daily: true, weekly: true, monthly: true }
   }
   ```

2. **Check for undefined:**
   ```javascript
   console.log('Credits:', entitlements?.credits);
   console.log('Total:', entitlements?.credits?.total);
   ```

3. **Verify API response:**
   Open Network tab in DevTools, find `/entitlements` request, check response structure.

---

## Quick Regex Search & Replace

Use these in your editor (VS Code, etc.):

**Find:**
```regex
entitlements\?\.analyses\?\.remaining
```
**Replace:**
```
entitlements?.credits?.total
```

**Find:**
```regex
entitlements\?\.questions\?\.remaining
```
**Replace:**
```
entitlements?.credits?.total
```

**Find:**
```regex
entitlements\?\.questionsRemaining
```
**Replace:**
```
entitlements?.credits?.total
```

**Find:**
```regex
entitlements\?\.analysesRemaining
```
**Replace:**
```
entitlements?.credits?.total
```

---

## If Still Broken After Fixes

1. **Clear browser cache and localStorage**
2. **Hard refresh** (Cmd+Shift+R / Ctrl+Shift+R)
3. **Check if backend is deployed** with new creditSummaryService
4. **Verify API endpoint** returns new structure
5. **Check for TypeScript errors** if using TS

---

## Complete Example: Fixing MainDashboard

**BEFORE (broken):**
```javascript
function MainDashboard({ entitlements }) {
  const analysesLeft = entitlements?.analyses?.remaining || 0;
  const questionsLeft = entitlements?.questions?.remaining || 0;
  
  return (
    <div>
      <AnalysisQuotaCard remaining={analysesLeft} />
      <QuestionsIndicator questionsRemaining={questionsLeft} />
      
      {analysesLeft > 0 && <UnlockAnalysisButton />}
      {questionsLeft > 0 && <AskQuestionButton />}
    </div>
  );
}
```

**AFTER (fixed):**
```javascript
import { CreditsIndicator } from '../entitlements';
import { useCheckout } from '../../hooks/useCheckout';

function MainDashboard({ entitlements }) {
  const { purchaseCreditPack } = useCheckout();
  const creditsTotal = entitlements?.credits?.total || 0;
  
  return (
    <div>
      <CreditsIndicator
        total={entitlements?.credits?.total || 0}
        monthly={entitlements?.credits?.monthly || 0}
        pack={entitlements?.credits?.pack || 0}
        monthlyLimit={entitlements?.credits?.monthlyLimit || 0}
        resetDate={entitlements?.credits?.resetDate}
        onBuyMore={purchaseCreditPack}
      />
      
      {creditsTotal >= 75 && <UnlockAnalysisButton />}
      {creditsTotal >= 1 && <AskQuestionButton />}
    </div>
  );
}
```
