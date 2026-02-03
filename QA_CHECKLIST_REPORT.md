Stellium Frontend QA Report
1. PUBLIC PAGES
Landing Page (/)

✅ Hero section renders with logo, tagline, and description
❌ CTA button text mismatch: Hero shows "GET MY QUICK CHART OVERVIEW" instead of "Get Started Free"
❌ Missing "Start Plus" button in the hero section (only exists in the pricing section further down)
✅ Features section renders (Birth Chart, Compatibility, Smart Horoscopes, Ask Anything)
✅ How It Works section renders (3 steps)
⚠️ No clearly labeled "Objection Buster" section found (though "As deep as a one-on-one reading…" text could serve this purpose)
✅ Celebrity Charts section loads with 4 celebrity cards
❌ Celebrity cards on landing page are NOT clickable — they're <div> elements without links or click handlers. The QA doc expects them to navigate to /celebrities/:celebrityId
✅ "View All Celebrity Charts →" link works and navigates to /celebrities
✅ Pricing section: Free ($0) and Plus ($20/mo) with correct pricing
✅ A la carte: Birth Chart 360° ($20/$12), Relationship 360° ($10/$6), Question Pack ($10 for 10) — all correct
✅ Comparison table renders all rows
❌ Footer missing Help Center link — only has Privacy Policy and Terms of Service
⚠️ Footer copyright says "© 2024" — should be updated

Pricing Page (/pricingTable)

✅ Renders correctly with same pricing tiers
✅ "Start Plus" button present
✅ "Get Started Free" button present

Celebrity Pages

✅ /celebrities — gallery loads with search, filtering (ALL/MALE/FEMALE), and table
⚠️ Date format in table shows raw ISO format (e.g., "1997-03-14T12:00:00") — not user-friendly
✅ /celebrities/:celebrityId — individual celebrity page renders with overview

Static Pages

✅ /privacy-policy renders
✅ /terms-of-service renders
✅ /help — Help Center renders with categories


2. AUTHENTICATION & ONBOARDING

✅ Login page renders with Google sign-in and email/password
✅ Google sign-in works and redirects to dashboard
✅ Sign out works and redirects to /login
⚠️ /signUp and /birthChartEntry redirect to dashboard (if logged in) or /login (if logged out) — QA doc says they should render the onboarding page
Could not test onboarding flow since user already has a profile (redirects to dashboard)


3. MAIN DASHBOARD

✅ Header displays user info ("Eva Hanson") and plan badge ("FREE")
❌ No sidebar navigation / hamburger menu — uses top header navigation instead
❌ Dashboard only shows Horoscope section — Birth Charts and Relationships are on separate pages (via header nav), not sections on the dashboard as the QA doc describes
✅ Horoscope content loads with transit data and Key Planetary Influences
✅ Time selector (Daily/Weekly/Monthly) tabs visible
❌ Horoscope lock/unlock is REVERSED from QA doc spec:

Daily: Accessible to Free users (doc says should be LOCKED)
Weekly: LOCKED for Free users (doc says should be ACCESSIBLE)
Monthly: Accessible to Free users ✅


⚠️ When clicking a locked horoscope (Weekly), the entire page replaces with the locked content view — the Daily/Weekly/Monthly tabs disappear with no way to return to Daily except clicking "Home"
✅ "Ask Stellium" icon in horoscope header opens slide-in panel with horoscope context


4. CHART DETAIL PAGE

❌ Only "Overview" tab visible — Missing tabs: Chart, Planets, Dominance Patterns, Analysis, Ask Stellium (major gap)
✅ Overview tab renders with birth chart summary text
✅ "Ask Stellium" icon in Overview header opens panel with birth chart context
Cannot test Chart wheel, Planets table, Dominance Patterns, or Analysis tab since they don't exist


5. RELATIONSHIP ANALYSIS PAGE

✅ Relationship summary with scores renders (top section with compatibility %, dimensions, synastry aspects)
✅ Tab navigation renders: OVERVIEW, SCORE, CHARTS, 360 ANALYSIS, ASK STELLIUM
✅ Tab switching works
✅ Overview tab renders with relationship insights and Ask Stellium icon
✅ Score tab renders with detailed compatibility breakdowns and bar charts
✅ Charts tab renders with Synastry/Composite sub-tabs and aspect table
✅ 360 Analysis tab renders with dimension breakdowns (Harmony, Passion, Connection, etc.)
✅ Ask Stellium tab renders with relationship-specific context and suggestions


6. ASK STELLIUM SLIDE-IN PANEL

✅ Icon appears in horoscope section header (dashboard)
✅ Icon appears in Overview tab header (chart detail page)
✅ Panel slides in from the right
✅ Backdrop overlay appears
✅ Close (X) button works
✅ Escape key closes panel
✅ Context label shows appropriate content ("About your horoscope", "About your birth chart")
✅ Suggested questions appear and populate input on click
✅ When questions depleted: paywall message "You've used all your questions for this month" appears
✅ "Upgrade to Plus for more questions" link visible


7. ENTITLEMENTS & PAYMENT

✅ Free user sees "FREE" badge in header
✅ Upgrade modal renders with Plus Subscription details ($20/month)
✅ "Subscribe Now" button present (Stripe checkout not tested to avoid actual purchases)
✅ Locked content displays for Weekly horoscope with "Available with Plus" CTA


8. CREATE RELATIONSHIP PAGE

✅ Page renders with user card and partner selection
⚠️ No form to enter new person's birth data — only allows selecting from existing guest charts. QA doc expects a birth data form with Google Places autocomplete.


9. RESPONSIVE

⚠️ Unable to fully test mobile/tablet viewports due to browser window minimum size constraints, but the desktop layout works correctly.


10. ERROR HANDLING

✅ Non-existent chart shows "Chart not found" with "Back to Dashboard" link
✅ Non-existent relationship shows "Relationship not found" with "Back to Dashboard" link
✅ No console errors detected on dashboard


Additional Issues Found (Not in QA Doc)

"Add Birth Chart" modal works correctly — opens with proper form fields (name, gender, location, date, time) and Google Places autocomplete works
User dropdown menu works with Purchases, Settings, Sign Out options
The comparison table lists "Weekly & Monthly" as Free tier horoscopes but the actual behavior gives Free users Daily access (inconsistency between marketing copy and implementation)


Summary of Critical Issues
PriorityIssue🔴 HighHoroscope locking is reversed: Daily is unlocked (should be locked), Weekly is locked (should be accessible)🔴 HighChart detail page missing 5 of 6 tabs (Chart, Planets, Dominance, Analysis, Ask Stellium)🔴 HighCelebrity cards on landing page are not clickable🟡 MediumDashboard doesn't show Birth Charts or Relationships sections inline — they're on separate pages🟡 MediumNo sidebar/hamburger navigation on dashboard🟡 MediumHelp Center link missing from footer🟡 MediumCreate Relationship page doesn't have a birth data entry form🟡 MediumWeekly locked view replaces entire dashboard with no back navigation to Daily🟠 LowHero CTA says "Get My Quick Chart Overview" instead of "Get Started Free"🟠 LowCelebrity table shows raw ISO date format🟠 LowFooter copyright year is 2024