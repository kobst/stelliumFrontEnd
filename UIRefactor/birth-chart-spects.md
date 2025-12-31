# Phase 2 Specification - Birth Charts Redesign

## Table of Contents

1. [Overview](#overview)
2. [Current State](#current-state)
3. [Design Goals](#design-goals)
4. [Layout Architecture](#layout-architecture)
5. [Components](#components)
6. [Chart Detail View](#chart-detail-view)
7. [Data Structure](#data-structure)
8. [User Flows](#user-flows)
9. [Responsive Design](#responsive-design)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

**Phase:** 2 of 4
**Focus:** Redesign the Birth Charts section for web browser experience
**Scope:** Single-chart detailed analysis (no side-by-side comparison)
**Timeline:** 3-4 weeks after Phase 1 launch
**Dependencies:** Phase 1 (DashboardLayout, CSS variables, design system)

### Key Changes from Current Design

| Aspect | Current | Phase 2 |
|--------|---------|---------|
| Chart List | Vertical stacked cards | Grid layout with previews |
| Your Chart | Same card as guests | Prominent, featured position |
| Detail View | Basic card layout | Multi-section detailed breakdown |
| Chart Info | Minimal (sun sign only) | Rich preview (sun, moon, rising) |
| Sections | Single view | Planets \\| Houses \\| Aspects tabs |
| Comparison | None | Removed (belongs in Phase 4) |

---

## Current State

### Mobile-Adapted Layout
```
Birth Charts
├── Your Chart
│   └── Single card, click to view details
├── Guest Charts
│   ├── Codey Birk (Capricorn Sun • Scorpio Moon)
│   ├── Richard Berger (Taurus Sun • Scorpio Moon)
│   └── [List continues]
```

### Problems with Current Design

- **Vertical stacking** wastes horizontal browser space
- **"Your Chart" not distinguished** from guest charts
- **Limited preview info** (only sun sign visible)
- **Detail view is minimal** (no interpretation, no depth)
- **No visual hierarchy** between user's chart and others

---

## Design Goals

### Primary Goals

1. **Prominent User Chart** - User's chart featured and distinct
2. **Rich Chart Previews** - Show sun, moon, rising at a glance
3. **Deep Chart Analysis** - Multi-section breakdown with interpretation
4. **Web-Optimized Layout** - Full use of browser width
5. **Fast Chart Lookup** - Quick access to any chart
6. **Consistent with Phase 1** - Uses DashboardLayout and design system

### Secondary Goals

- Beautiful visual presentation of astrological data
- Educational (help users understand their chart)
- Mobile-responsive
- Accessibility compliant
- Prepare foundation for Phase 4 (Relationships synastry)

---

## Layout Architecture

### Main Birth Charts View
```
┌──────────────────────────────────────────────────┐
│              SHARED SIDEBAR + HEADER            │
├──────────────────────────────────────────────────┤
│         BIRTH CHARTS SECTION                     │
│                                                  │
│  ┌────────────────┐  ┌────────────────┐         │
│  │  YOUR CHART    │  │ GUEST CHARTS   │         │
│  │ (Prominent,    │  │ (Grid layout)  │         │
│  │  larger size)  │  │                │         │
│  │                │  │ ┌──────┐┌─────┐         │
│  │ Avatar         │  │ │Chart ││Chart │         │
│  │ Name           │  │ │  1   ││  2   │         │
│  │ Sun • Moon     │  │ └──────┘└─────┘         │
│  │ • Rising       │  │                │         │
│  │                │  │ ┌──────┐┌─────┐         │
│  │ [View Details] │  │ │Chart ││Chart │         │
│  └────────────────┘  │ │  3   ││  4   │         │
│                      │ └──────┘└─────┘         │
│                      └────────────────┘         │
│                                                  │
│  [Add Guest Chart] [Manage Charts]              │
└──────────────────────────────────────────────────┘
```

### Chart Detail View
```
┌──────────────────────────────────────────────────┐
│              SHARED SIDEBAR + HEADER            │
├──────────────────────────────────────────────────┤
│         CHART DETAIL: Eva Hanson                 │
│                                                  │
│  [Back] Scorpio Sun • Gemini Moon • Virgo Rising│
│                                                  │
│  ┌─────────────┬──────────────┬──────────────┐  │
│  │  SECTIONS   │  CONTENT     │  CONTEXT    │  │
│  │  (Sticky)   │  (Main)      │  (Sidebar)  │  │
│  │             │              │             │  │
│  │ Planets     │ Detailed     │ Quick Facts │  │
│  │ [Active]    │ planetary    │ • Birth     │  │
│  │             │ breakdown    │   Time      │  │
│  │ Houses      │              │ • Location  │  │
│  │             │ [Rich text + │ • Coordinates  │
│  │ Aspects     │  icons]      │             │  │
│  │             │              │ Chart Rules │  │
│  │ Summary     │              │ (dominants, │  │
│  │             │              │  elements)  │  │
│  │             │              │             │  │
│  └─────────────┴──────────────┴──────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Components

### 1. Birth Charts List View

**Purpose:** Display all available charts (user's + guests)

**Layout:** Two-section grid
- Left: User's chart (featured, larger)
- Right: Guest charts (grid, 2-4 per row depending on screen)

**Component:** `ChartsList`
```
ChartsList
├── YourChartCard (featured, prominent)
└── GuestChartsGrid
    ├── ChartCard
    ├── ChartCard
    ├── ChartCard
    └── ...
```

#### **Your Chart Card**

**Dimensions:**
- Desktop: 300px × 400px (larger than guest cards)
- Tablet: 280px × 380px
- Mobile: Full width - padding

**Content:**
```
┌─────────────────────────────┐
│                             │
│   [Avatar - 120px circular] │
│                             │
│       Eva Hanson            │
│                             │
│  Scorpio Sun                │
│  Gemini Moon                │
│  Virgo Rising               │
│                             │
│     [View Details →]        │
│                             │
└─────────────────────────────┘
```

**Styling:**
- Background: var(--color-bg-secondary)
- Border: 2px solid var(--color-primary) (premium/featured indicator)
- Border radius: var(--border-radius-md)
- Padding: var(--spacing-xl)
- Text align: center

**States:**
- **Default:** Border solid purple
- **Hover:** Slight scale transform, shadow glow
- **Click:** Navigate to detail view

#### **Guest Chart Card**

**Dimensions:**
- Desktop: 160px × 200px
- Tablet: 140px × 180px
- Mobile: Full width - padding (one per row)

**Content:**
```
┌──────────────────┐
│ [Avatar - 60px]  │
│                  │
│  Codey Birk      │
│                  │
│ ♑ • ♏            │
│                  │
│  [View →]        │
└──────────────────┘
```

**Styling:**
- Background: var(--color-bg-secondary)
- Border: 1px solid var(--color-border)
- Border radius: var(--border-radius-md)
- Padding: var(--spacing-lg)
- Text align: center

**Symbols:**
- Sun sign: Astrological glyph (♑ = Capricorn)
- Moon sign: Astrological glyph (♏ = Scorpio)
- Rising: Omitted in preview (available in detail)

**States:**
- **Default:** Border subtle
- **Hover:** Border brightens to var(--color-primary), slight lift
- **Click:** Navigate to detail view

#### **Grid Layout**

**Desktop (1024px+):**
```
┌──────────────┐  ┌────┐ ┌────┐ ┌────┐
│ Your Chart   │  │G-1 │ │G-2 │ │G-3 │
│ (larger)     │  └────┘ └────┘ └────┘
│              │
│              │  ┌────┐ ┌────┐ ┌────┐
│              │  │G-4 │ │G-5 │ │G-6 │
└──────────────┘  └────┘ └────┘ └────┘
```

**Grid CSS:**
```css
display: grid;
grid-template-columns: 300px repeat(auto-fill, minmax(160px, 1fr));
gap: var(--spacing-xl);
```

**Tablet (768-1023px):**
- Your chart: 280px
- Guest cards: 140px
- 2-3 guests per row

**Mobile (<768px):**
- Your chart: Full width - 2×padding
- Guest cards: Stack vertically (full width each)

### 2. Chart Detail View

**Purpose:** Deep dive into a single birth chart

**Layout:** Three-column (matching Phase 1 pattern)

#### **Left Column: Section Navigation**

**Width:** 140px (sticky)

**Sections:**
- Planets (active by default)
- Houses
- Aspects
- Summary

**Styling:**
- Vertical button group (pill-shaped)
- Active: Purple background
- Inactive: Subtle border, hover effect
- Spacing: 12px between buttons
```css
.section-nav {
  position: sticky;
  top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
```

#### **Center Column: Chart Details**

**Width:** Flexible (1fr)

**Header:**
```
[Back Button] 
Eva Hanson
Scorpio Sun • Gemini Moon • Virgo Rising
Born: October 30, 1995 • 2:15 PM • New York, NY
```

**Content Sections:**

**1. Planets Tab (Default)**
```
YOUR PLANETS & PLACEMENTS

Sun in Scorpio
━━━━━━━━━━━━━━━━━━━━━━
You are naturally drawn to power, intimacy, and truth...
[Full interpretation paragraph]

🌙 Moon in Gemini
━━━━━━━━━━━━━━━━━━━━━━
Emotionally curious and expressive, you need mental stimulation...
[Full interpretation paragraph]

⬆️ Rising in Virgo
━━━━━━━━━━━━━━━━━━━━━━
Others perceive you as analytical, helpful, and detail-oriented...
[Full interpretation paragraph]

♀️ Venus in Libra
━━━━━━━━━━━━━━━━━━━━━━
In relationships, you value balance, harmony, and aesthetic beauty...
[Full interpretation paragraph]

[+ 8 more planets and points...]
```

**Styling:**
- Each planet gets its own card/section
- Planet symbol (glyph) + sign name as heading
- Rich interpretation text (2-3 sentences)
- Visual separator between planets
- Icon for each planet (♀️ Venus, ♂️ Mars, etc.)

**2. Houses Tab**
```
YOUR HOUSES

House 1 (Virgo)
━━━━━━━━━━━━━━
House of Self and Identity
Cusp Ruler: Mercury

Your first house in Virgo places emphasis on critical thinking...
[Interpretation]

House 2 (Libra)
━━━━━━━━━━━━━━
House of Resources and Values
Cusp Ruler: Venus

[Interpretation]

[+ 10 more houses...]
```

**3. Aspects Tab**
```
PLANETARY ASPECTS

Harmonious Aspects (Trines & Sextiles)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sun trine Jupiter (Orb: 2°15')
This is a harmonious, beneficial aspect indicating luck, optimism...
[Detailed interpretation]

Moon sextile Venus (Orb: 1°43')
[Interpretation]

Challenging Aspects (Squares & Oppositions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Venus square Mars (Orb: 3°21')
This aspect suggests tension between desires for harmony and assertion...
[Detailed interpretation]
```

**4. Summary Tab**
```
CHART OVERVIEW

Element Distribution
Fire:  25% ▓░░░░
Earth: 35% ▓▓░░░
Air:   28% ▓▓░░░
Water: 12% ▓░░░░

Quality Distribution
Cardinal: 38%
Fixed: 32%
Mutable: 30%

Planetary Dominants
1. Mercury (5 influences)
2. Venus (4 influences)
3. Sun (3 influences)

Signature Sign: Capricorn
(Most planets/points in this sign)
```

**Card Styling (all sections):**
```css
.chart-detail-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.section-heading {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-md);
}

.planet-item {
  margin-bottom: var(--spacing-lg);
}

.planet-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.planet-sign {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.planet-interpretation {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}
```

#### **Right Column: Quick Facts**

**Width:** 280px (sticky, top: var(--spacing-xl))

**Content:**
```
Quick Facts

Birth Date
October 30, 1995

Birth Time
2:15 PM

Birth Location
New York, NY
40.7128° N, 74.0060° W

Astrological Age
Scorpio ♏

Chart Rulers
Ascendant: Mercury
Sun: Pluto

Lunar Node
Taurus (North Node)
Scorpio (South Node)

Chiron
Capricorn 11°24'
House 8

Part of Fortune
Gemini 27°15'
House 12
```

**Styling:**
```css
.facts-sidebar {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  position: sticky;
  top: var(--spacing-xl);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.fact-item {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.fact-item:last-child {
  border-bottom: none;
}

.fact-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.fact-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}
```

### 3. Chart Detail Header

**Contains:**
- Back button (returns to chart list)
- Chart name (Eva Hanson)
- Key placements (Sun • Moon • Rising)
- Birth info (date, time, location) - optional, can expand on click
```
[← Back] Eva Hanson
Scorpio Sun • Gemini Moon • Virgo Rising
Born: October 30, 1995 • 2:15 PM • New York, NY
```

**Styling:**
- Padding: var(--spacing-xl)
- Border-bottom: 1px solid var(--color-border)
- Background: var(--color-bg-secondary)
- Position: sticky or separate section

---

## Data Structure

### Chart Object
```javascript
{
  id: "uuid",
  userId: "uuid",
  type: "natal" | "guest",
  subject: {
    name: "string",
    avatar: "string (URL)",
    birthDate: "ISO 8601 date",
    birthTime: "HH:MM (24-hour)",
    birthLocation: {
      city: "string",
      country: "string",
      latitude: "number",
      longitude: "number"
    }
  },
  placements: {
    sun: {
      sign: "Scorpio",
      degree: 6,
      minutes: 23,
      house: 4
    },
    moon: {
      sign: "Gemini",
      degree: 12,
      minutes: 45,
      house: 9
    },
    // ... 8+ more planets/points
  },
  houses: [
    {
      house: 1,
      sign: "Virgo",
      cusp: 3.42,
      ruler: "Mercury"
    },
    // ... 12 houses total
  ],
  aspects: [
    {
      planet1: "Sun",
      planet2: "Jupiter",
      aspect: "trine",
      orb: 2.25,
      interpretation: "string"
    },
    // ... many aspects
  ],
  chartRulers: {
    ascendant: "Mercury",
    sun: "Pluto"
  },
  lunarNode: {
    northNode: "Taurus",
    southNode: "Scorpio"
  },
  elementDistribution: {
    fire: 25,
    earth: 35,
    air: 28,
    water: 12
  },
  qualityDistribution: {
    cardinal: 38,
    fixed: 32,
    mutable: 30
  },
  planetaryDominants: [
    { planet: "Mercury", count: 5 },
    { planet: "Venus", count: 4 },
    { planet: "Sun", count: 3 }
  ]
}
```

---

## User Flows

### Flow 1: Browse Charts
```
User lands on Birth Charts section
  → See "Your Chart" (featured left)
  → See "Guest Charts" (grid right)
  → Can scroll through guest charts
  → Can click any chart → Detail view
```

### Flow 2: View Chart Details
```
User clicks on any chart card
  → Navigate to ChartDetailView
  → See chart header (name, placements, birth info)
  → Default section: Planets
  → User can click other sections (Houses, Aspects, Summary)
  → Content updates smoothly
  → Can go back to chart list
```

### Flow 3: Add Guest Chart (Future)
```
User clicks [Add Guest Chart]
  → Form to add new person's birth data
  → Input name, birth date, birth time, location
  → Chart calculation happens
  → New card appears in guest charts grid
```

### Flow 4: Manage Charts (Future)
```
User clicks [Manage Charts]
  → Sidebar or modal showing all charts
  → Options: Edit, Delete, Set as Primary, etc.
  → Changes reflected in list view
```

---

## Responsive Design

### Desktop (1024px+)

**Chart List View:**
```
Your Chart (300×400)  | Guest Cards (160×200 each, 3 per row)
                      | Guest Cards (160×200 each, 3 per row)
```

**Chart Detail View:**
```
[140px nav] | [flexible content] | [280px sidebar]
```

### Tablet (768-1023px)

**Chart List View:**
- Your Chart: 280px
- Guest Cards: 140px (2-3 per row)
- Grid adjusts as needed

**Chart Detail View:**
```
[130px nav] | [flexible content] | [250px sidebar]
```

**Or collapse to 2-column:**
```
[flexible content + sidebar below] (if too cramped)
```

### Mobile (<768px)

**Chart List View:**
- Your Chart: Full width - 2×padding
- Guest Cards: Stack vertically
- Single column layout

**Chart Detail View:**
- **Single column layout**
- Navigation buttons (Planets | Houses | Aspects | Summary) at top (horizontal scroll if needed)
- Content full width
- Quick Facts sidebar below content
```css
@media (max-width: 768px) {
  .chart-detail {
    grid-template-columns: 1fr;
  }
  
  .section-nav {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    margin-bottom: var(--spacing-lg);
  }
  
  .facts-sidebar {
    position: static;
    margin-top: var(--spacing-xl);
  }
}
```

---

## State Management

### Global State (managed in Dashboard or context)
```javascript
{
  charts: {
    yourChart: Chart, // current user's chart
    guestCharts: Chart[], // array of guest charts
    selectedChart: Chart, // currently viewed chart
  },
  chartUI: {
    currentSection: "planets" | "houses" | "aspects" | "summary",
    isLoading: boolean,
    error: string | null,
  },
  view: "chartsList" | "chartDetail", // current view
}
```

### Component-Level State

**ChartsList Component:**
- None (presentation, receives props)

**ChartDetailView Component:**
- `currentSection` - which tab is active
- `autoScroll` - smooth scroll to section

---

## Component Hierarchy
```
DashboardLayout (from Phase 1)
├── TopHeader (shared)
├── Sidebar (shared)
└── ContentArea
    └── BirthChartsSection
        ├── ChartsList (when viewing list)
        │   ├── YourChartCard
        │   ├── GuestChartsGrid
        │   │   ├── ChartCard
        │   │   ├── ChartCard
        │   │   └── ...
        │   └── ActionButtons ([Add] [Manage])
        │
        └── ChartDetailView (when viewing detail)
            ├── ChartHeader
            ├── ChartDetailContent (3-column grid)
            │   ├── SectionNav (left sticky column)
            │   ├── DetailContent (center, dynamic)
            │   │   ├── PlanetsSection
            │   │   ├── HousesSection
            │   │   ├── AspectsSection
            │   │   └── SummarySection
            │   └── QuickFactsSidebar (right sticky column)
            └── BackButton / Navigation
```

---

## Implementation Guidelines

### Phase 2 Development Breakdown

**Week 1: Foundation**
- Create BirthChartsSection component
- Build ChartsList view with grid layout
- Create ChartCard components (Your Chart + Guest Chart variants)
- Implement responsive grid layout
- Connect to existing data (charts list)

**Week 2: Detail View**
- Build ChartDetailView component
- Create three-column layout
- Build SectionNav (Planets, Houses, Aspects, Summary buttons)
- Create PlanetsSection with rich interpretation display
- Implement section switching

**Week 3: Additional Sections + Polish**
- Build HousesSection
- Build AspectsSection
- Build SummarySection
- Style all sections consistently
- Add loading/error states
- Implement back navigation

**Week 3-4: Refinement**
- Responsive design testing (tablet, mobile)
- CSS variables refactor (update all chart CSS to use design tokens)
- Accessibility audit (WCAG AA)
- Performance optimization
- User testing and feedback integration

### CSS Changes

**All chart component CSS should use css-variables.css:**
```css
/* ✅ Good - uses variables */
.chart-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
}

/* ❌ Avoid - hardcoded values */
.chart-card {
  background: #2a2d4a;
  padding: 16px;
  border-radius: 12px;
}
```

### File Structure
```
src/
├── components/
│   ├── BirthCharts/
│   │   ├── BirthChartsSection.jsx
│   │   ├── BirthChartsSection.css
│   │   ├── ChartsList/
│   │   │   ├── ChartsList.jsx
│   │   │   ├── ChartsList.css
│   │   │   ├── YourChartCard.jsx
│   │   │   ├── ChartCard.jsx
│   │   │   └── GuestChartsGrid.jsx
│   │   ├── ChartDetail/
│   │   │   ├── ChartDetailView.jsx
│   │   │   ├── ChartDetailView.css
│   │   │   ├── ChartHeader.jsx
│   │   │   ├── SectionNav.jsx
│   │   │   ├── DetailContent.jsx
│   │   │   ├── sections/
│   │   │   │   ├── PlanetsSection.jsx
│   │   │   │   ├── HousesSection.jsx
│   │   │   │   ├── AspectsSection.jsx
│   │   │   │   └── SummarySection.jsx
│   │   │   ├── QuickFactsSidebar.jsx
│   │   │   └── ChartDetailView.css
│   │   └── hooks/
│   │       └── useChartData.js
```

### Key Decisions

1. **No side-by-side chart comparison** - This feature belongs in Phase 4 (Relationships synastry)
2. **Single-chart focus** - Phase 2 is about deepening understanding of individual charts
3. **Rich interpretation** - Each planet, house, aspect gets detailed explanation (content from AI or astrological library)
4. **Uses Phase 1 layout** - DashboardLayout (sidebar + header) provides consistent structure
5. **CSS variables throughout** - All new chart CSS uses design tokens for consistency

### Testing Checklist

**Functional:**
- [ ] Chart list displays correctly (Your Chart featured, guests in grid)
- [ ] Clicking any chart navigates to detail view
- [ ] Section buttons switch content smoothly
- [ ] Back button returns to chart list
- [ ] All sections load data correctly (Planets, Houses, Aspects, Summary)
- [ ] Quick Facts sidebar displays correctly
- [ ] No data errors or missing fields

**Visual:**
- [ ] Desktop layout matches spec (3-column on detail view)
- [ ] Tablet layout responsive (grid adjusts)
- [ ] Mobile layout single-column, readable
- [ ] Colors match design system (uses css-variables)
- [ ] Typography hierarchy correct
- [ ] Spacing and alignment consistent

**Accessibility:**
- [ ] Keyboard navigation works (Tab through buttons)
- [ ] Section buttons announce state (active/inactive)
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader interprets chart data
- [ ] Focus states visible

**Performance:**
- [ ] Chart list loads in < 1s
- [ ] Detail view transitions smooth (no jank)
- [ ] Images optimized (avatars, any icons)
- [ ] CSS is minified

---

## Differences from Phase 1 Layout Pattern

**Similarity:** Uses same DashboardLayout (sidebar + header)

**Difference in content area:**
- **Phase 1 Horoscope:** Filters (left) | Content (center) | Context (right)
- **Phase 2 Birth Charts (list):** Featured item (left) | Grid items (right)
- **Phase 2 Birth Charts (detail):** Sections (left sticky) | Content (center) | Facts (right sticky)

The detail view follows the same three-column pattern as Phase 1 horoscope, reinforcing design consistency.

---

## Dependencies & Integration

**Depends on:**
- Phase 1 completion (DashboardLayout, CSS variables, design system)
- Existing chart data API
- Existing chart calculation backend

**Enables:**
- Phase 3 (Ask Stellium - can reference user's chart)
- Phase 4 (Relationships - uses chart detail foundation for synastry)

---

## Future Enhancements (Post-Phase 2)

- **Chart calculation** - Allow users to add new guest charts with birth data entry
- **Chart comparison** - Reserved for Phase 4 (Relationships synastry)
- **Transit tracking** - Show current transits affecting the chart
- **Progressed charts** - Display secondary progressions
- **Solar returns** - Upcoming solar return chart
- **Export as PDF** - Print-friendly chart report
- **Chart history** - Track previous chart versions
- **Composite charts** - Create composite charts with other people (Phase 4+)

---

## Success Metrics

- **Usability:** Users can view any chart's details in < 2 clicks
- **Engagement:** Time spent viewing charts increases vs. current design
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** Detail view loads in < 500ms
- **Satisfaction:** User feedback positive on clarity and depth

---

## Notes

- This specification does NOT include side-by-side chart comparison (belongs in Phase 4)
- All interpretation content should be rich, educational, and helpful
- Maintain astrology terminology consistency with glossary
- Icons/glyphs for planets should be Unicode or SVG for accessibility