# Stellium Frontend — QA Checklist

## Overview
This document covers all major features and recent additions that need validation. Test on both desktop and mobile viewports.

---

## 1. PUBLIC PAGES (No login required)

### Landing Page (`/`)
- [ ] Hero section renders with CTA buttons
- [ ] "Get Started Free" button navigates to `/birthChartEntry`
- [ ] "Start Plus" button triggers Stripe checkout flow (or signup if not logged in)
- [ ] Features section, How It Works, and Objection Buster sections render correctly
- [ ] Celebrity Charts section loads and displays celebrity cards
- [ ] Clicking a celebrity card navigates to `/celebrities/:celebrityId`
- [ ] Pricing section displays Free vs Plus tiers with correct pricing ($0 / $20/mo)
- [ ] A la carte section shows Birth Chart 360° ($20 / $12 Plus), Relationship 360° ($10 / $6 Plus), Question Pack ($10 for 10)
- [ ] Comparison table renders all rows (horoscopes, chart creation, readings, questions, discount)
- [ ] Footer links to Privacy Policy, Terms of Service, Help Center

### Pricing Page (`/pricingTable`)
- [ ] Displays same pricing tiers as landing page
- [ ] "Start Plus" button initiates Stripe checkout
- [ ] "Get Started Free" button navigates to signup

### Celebrity Pages
- [ ] `/celebrities` — gallery of celebrity charts loads
- [ ] `/celebrities/:celebrityId` — individual celebrity dashboard renders with birth chart data, overview, and chart visualization

### Static Pages
- [ ] `/privacy-policy` renders
- [ ] `/terms-of-service` renders
- [ ] `/help` — Help Center renders

---

## 2. AUTHENTICATION & ONBOARDING

### Login (`/login`)
- [ ] Google sign-in button works
- [ ] Email/password sign-in works
- [ ] After login, redirects to dashboard if user has profile, or to onboarding if not

### Onboarding (`/onboarding`)
- [ ] Birth data form renders (name, date, time, location)
- [ ] Google Places autocomplete works for location field
- [ ] Form validation prevents submission with missing fields
- [ ] Successful submission redirects to `/onboarding/confirmation`

### Onboarding Confirmation (`/onboarding/confirmation`)
- [ ] Displays entered birth details for review
- [ ] Confirm button creates profile and redirects to dashboard

### Legacy Routes
- [ ] `/signUp` renders onboarding page
- [ ] `/birthChartEntry` renders onboarding page
- [ ] `/signUpConfirmation` renders confirmation page

---

## 3. MAIN DASHBOARD (`/dashboard/:userId`)

### Layout & Navigation
- [ ] Top header displays user info and plan badge (Free/Plus)
- [ ] Sidebar navigation works on mobile (hamburger menu)
- [ ] Navigation items link to correct sections

### Horoscope Section
- [ ] Horoscope content loads for the current time window
- [ ] Time selector allows switching between daily/weekly/monthly
- [ ] Daily horoscope is locked for Free users, shows upgrade prompt
- [ ] Weekly and Monthly horoscopes are accessible to all users
- [ ] Planetary influences section renders transit data
- [ ] "Ask Stellium" icon in section header opens the slide-in chat panel with horoscope context

### Birth Charts Section
- [ ] User's own chart card displays with name, sun/moon/rising signs
- [ ] Clicking chart card navigates to `/dashboard/:userId/chart/:chartId`
- [ ] Guest chart cards display correctly
- [ ] "Add Chart" functionality works (opens modal, submits birth data)

### Relationships Section
- [ ] Relationship cards display with both people's names and compatibility score
- [ ] Clicking a relationship card navigates to `/dashboard/:userId/relationship/:compositeId`
- [ ] "Create Relationship" navigates to `/dashboard/:userId/relationship/create`

---

## 4. CHART DETAIL PAGE (`/dashboard/:userId/chart/:chartId`)

### Tab Navigation
- [ ] Tabs render: Overview, Chart, Planets, Dominance Patterns, Analysis, Ask Stellium
- [ ] Tab switching works, active tab is highlighted

### Overview Tab
- [ ] Quick summary of the birth chart renders
- [ ] Key elements display correctly
- [ ] "Ask Stellium" icon in header opens slide-in panel with birth chart context

### Chart Tab
- [ ] Birth chart wheel visualization renders (ChartShapeWheel)
- [ ] Planet positions are correctly plotted
- [ ] Aspects table displays below the wheel

### Planets Tab
- [ ] Planet positions table shows all planets with sign, degree, house
- [ ] House positions table renders

### Dominance Patterns Tab
- [ ] Element balance (fire/earth/air/water) displays
- [ ] Modality balance (cardinal/fixed/mutable) displays
- [ ] Quadrant analysis renders
- [ ] Chart pattern identification works

### Analysis Tab (360° Analysis — PREMIUM FEATURE)
- [ ] **Free user with no analysis**: Shows `LockedContent` component with upgrade/purchase options
- [ ] **Plus user with quota**: Shows "Use 1 of your X monthly analyses" button; clicking unlocks
- [ ] **Plus user, no quota**: Shows purchase option at discounted price
- [ ] **Unlocked analysis**: Renders domain tabs (personality, career, relationships, etc.)
- [ ] "Ask Stellium" icon opens slide-in panel with analysis context

### Ask Stellium Tab
- [ ] Chat interface renders
- [ ] Can type and send messages
- [ ] Receives AI responses
- [ ] Chat history persists across page loads
- [ ] Question quota is enforced (shows paywall when depleted)

---

## 5. RELATIONSHIP ANALYSIS PAGE (`/dashboard/:userId/relationship/:compositeId`)

### Tab Navigation
- [ ] Tabs render: Overview, Charts, Analysis, Scores, Ask Stellium
- [ ] Tab switching works

### Overview Tab
- [ ] Relationship summary renders with both people's details
- [ ] Key compatibility factors display
- [ ] "Ask Stellium" icon opens slide-in panel with relationship context

### Charts Tab
- [ ] Synastry chart comparison renders
- [ ] Composite chart renders

### Analysis Tab (360° Analysis — PREMIUM FEATURE)
- [ ] Same paywall/unlock behavior as birth chart analysis (see Section 4)
- [ ] Unlocked analysis renders relationship-specific insights

### Scores Tab
- [ ] Compatibility scores display across categories

### Ask Stellium Tab
- [ ] Chat works with relationship-specific context
- [ ] Uses correct API endpoint (relationship chat, not birth chart)

---

## 6. ASK STELLIUM SLIDE-IN PANEL (New Feature)

This panel can be triggered from multiple locations via icons in section headers.

### Triggering
- [ ] Icon appears in Overview tab header (chart detail page)
- [ ] Icon appears in Analysis tab header (chart detail page)
- [ ] Icon appears in Horoscope section header (main dashboard)
- [ ] Icon appears in Relationship Overview tab header

### Panel Behavior
- [ ] Panel slides in from the right side
- [ ] Backdrop overlay appears behind panel
- [ ] Clicking backdrop closes panel
- [ ] Escape key closes panel
- [ ] Close (X) button closes panel
- [ ] Body scroll is locked when panel is open

### Chat Functionality
- [ ] Context label shows what content you're asking about
- [ ] Suggested questions appear on empty chat
- [ ] Clicking a suggestion populates the input
- [ ] Sending a message shows optimistic user bubble
- [ ] AI response appears with typing indicator
- [ ] Enter sends message, Shift+Enter adds newline
- [ ] Chat history loads when panel opens
- [ ] Switching between different content IDs resets and reloads history

### Paywall in Panel
- [ ] When questions are depleted, paywall message appears
- [ ] "Upgrade to Plus for more questions" button navigates to `/pricingTable`
- [ ] 403 errors from API also trigger paywall display

---

## 7. ENTITLEMENTS & PAYMENT SYSTEM

### Plan Badge Display
- [ ] Free users see "Free" badge in header
- [ ] Plus users see "Plus" badge in header

### Stripe Checkout — Subscription
- [ ] "Start Plus" buttons on landing page and pricing page redirect to Stripe
- [ ] After successful checkout, redirects back with `?upgraded=true`
- [ ] Success toast displays: "Welcome to Plus! Your subscription is now active."
- [ ] URL params are cleaned up after processing
- [ ] Entitlements refresh after 2-second delay (webhook processing)
- [ ] Plan badge updates to "Plus"

### Stripe Checkout — A La Carte Purchase
- [ ] Purchase button on LockedContent redirects to Stripe
- [ ] After successful purchase, redirects back with `?purchased=true&type=BIRTH_CHART` (or RELATIONSHIP / QUESTION_PACK)
- [ ] Correct success toast message per type
- [ ] Purchased analysis becomes unlocked immediately after entitlements refresh

### Stripe Customer Portal
- [ ] Plus users can access billing portal to manage subscription
- [ ] Portal opens correctly and returns to the same page

### Quota Enforcement
- [ ] Analysis quota: Plus users get 3/month, displayed correctly
- [ ] Question quota: Plus users get 50/month, displayed correctly
- [ ] Quota decrements correctly after use
- [ ] Reset date displays for both quotas

### Locked Content Component
- [ ] **Free user**: Shows lock icon, description, features list, "Upgrade to Plus" CTA, and optional purchase price
- [ ] **Plus user with quota**: Shows "Use 1 of X monthly analyses" button
- [ ] **Plus user, no quota**: Shows "You've used all your monthly analyses" with purchase fallback
- [ ] **Plus user, purchase option**: Shows discounted price
- [ ] Upgrade modal opens with subscribe and/or purchase options

---

## 8. CREATE RELATIONSHIP PAGE (`/dashboard/:userId/relationship/create`)

- [ ] Form to enter second person's birth data renders
- [ ] Google Places autocomplete works
- [ ] Submission creates relationship and redirects to relationship analysis page

---

## 9. RESPONSIVE / CROSS-BROWSER

- [ ] All pages render correctly on mobile (375px width)
- [ ] All pages render correctly on tablet (768px width)
- [ ] All pages render correctly on desktop (1280px+ width)
- [ ] Sidebar collapses to hamburger on mobile
- [ ] AskStellium panel renders full-width on mobile
- [ ] Pricing cards stack vertically on mobile
- [ ] Chart wheel scales appropriately on smaller screens

---

## 10. ERROR HANDLING & EDGE CASES

- [ ] API errors display user-friendly error messages (not raw errors)
- [ ] Loading states show spinners/skeletons during data fetch
- [ ] Empty states render gracefully (no charts, no relationships, no chat history)
- [ ] Session expiry: user is redirected to login
- [ ] Navigating to a chart/relationship that doesn't exist shows appropriate error
- [ ] Stripe checkout cancel: user returns to app with no changes applied
- [ ] Network failure during chat: optimistic message is rolled back, input is restored

---

## Notes
- **Stripe is in test mode** — use Stripe test cards (e.g., `4242 4242 4242 4242`) for checkout testing
- **Entitlements refresh has a 2-second delay** after Stripe checkout return to allow webhook processing
- Legacy routes (`/synastry`, `/compositeDashboard`) still exist but are not part of the main navigation flow
