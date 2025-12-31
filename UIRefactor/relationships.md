# Phase 3 Specification - Relationships Redesign

## Table of Contents

1. [Overview](#overview)
2. [Current State](#current-state)
3. [Design Goals](#design-goals)
4. [Layout Architecture](#layout-architecture)
5. [Components](#components)
6. [Relationship List View](#relationship-list-view)
7. [Relationship Detail View](#relationship-detail-view)
8. [Synastry Analysis](#synastry-analysis)
9. [Data Structure](#data-structure)
10. [User Flows](#user-flows)
11. [Responsive Design](#responsive-design)
12. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

**Phase:** 3 of 3
**Focus:** Redesign the Relationships section for web browser experience with enhanced synastry analysis
**Scope:** Relationship browsing, detailed synastry analysis, compatibility insights, relationship transits
**Timeline:** 4-5 weeks after Phase 2 launch
**Dependencies:** Phase 1 (DashboardLayout, CSS variables, design system), Phase 2 (Birth Charts reference)

### Key Changes from Current Design

| Aspect | Current | Phase 3 |
|--------|---------|---------|
| Relationship List | Vertical stacked cards | Grid layout with rich previews |
| Detail View | Single tab-based view | Multi-section tabbed interface |
| Synastry Info | Basic compatibility score | In-depth aspect analysis |
| Chart Display | Compatibility radar only | Side-by-side chart comparison |
| Aspects | Summarized | Detailed planet-to-planet breakdown |
| Transits | Not visible | Current transits affecting relationship |
| Layout | Mobile-adapted | Web-optimized with 3-column analysis |

---

## Current State

### Mobile-Adapted Layout
```
Relationships
├── Ed & Andrea (78% overall score)
├── Eva & Timothy (score)
├── Eva & Codey (score)
├── Eva & Aaron (score)
├── Eva & Jake (score)
└── [More relationships...]

Detail View (Single Tab):
├── Overall Score & Status
├── Compatibility Radar Chart
├── Compatibility Dimensions (5 cards)
├── Tabs: Overview, Charts, 360° Analysis, Ask Stellium
```

### Problems with Current Design

- **Vertical stacking** wastes horizontal space
- **List cards don't show compatibility score clearly**
- **Detail view tabs** mixed with different types of content
- **Synastry analysis not prominent** (buried in tabs)
- **Chart comparison missing** (no side-by-side charts)
- **No transit information** for relationship timing
- **Ask Stellium in relationship context** less accessible

---

## Design Goals

### Primary Goals

1. **Easy Relationship Browsing** - Quick view of all relationships with key compatibility info
2. **Detailed Synastry Analysis** - Deep dive into planet-to-planet interactions
3. **Chart Comparison** - View both charts side-by-side in relationship context
4. **Compatibility Insights** - Rich interpretation of dimensions (Harmony, Passion, Connection, Stability, Growth)
5. **Relationship Transits** - Show current transits affecting this relationship
6. **Web-Optimized Layout** - Full use of browser width with multiple columns
7. **Consistent with Phase 1-2** - Uses DashboardLayout and design system

### Secondary Goals

- Beautiful synastry visualization
- Educational (help users understand compatibility)
- Mobile-responsive
- Accessibility compliant
- Foundation for future features (shared transits, anniversary tracking, etc.)

---

## Layout Architecture

### Relationships Section Overview
```
┌──────────────────────────────────────────────────┐
│              SHARED SIDEBAR + HEADER            │
├──────────────────────────────────────────────────┤
│         RELATIONSHIPS SECTION                    │
│                                                  │
│  [Add Relationship] [Filter] [Sort]             │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Ed &     │  │ Eva &    │  │ Eva &    │       │
│  │ Andrea   │  │ Timothy  │  │ Codey    │       │
│  │ 78%      │  │ 72%      │  │ 85%      │       │
│  │ Flourish │  │ Thriving │  │ Thriving │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                  │
│  ┌──────────┐  ┌──────────┐                      │
│  │ Eva &    │  │ Eva &    │                      │
│  │ Aaron    │  │ Jake     │                      │
│  │ 68%      │  │ 75%      │                      │
│  │ Growing  │  │ Thriving │                      │
│  └──────────┘  └──────────┘                      │
└──────────────────────────────────────────────────┘
```

### Relationship Detail View
```
┌──────────────────────────────────────────────────┐
│              SHARED SIDEBAR + HEADER            │
├──────────────────────────────────────────────────┤
│         RELATIONSHIP DETAIL: Ed & Andrea         │
│                                                  │
│  [Back] Ed & Andrea                             │
│  Taurus Sun • Capricorn Moon <--> Cancer Sun... │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ Tabs:                                       ││
│  │ [Scores] [Charts] [Synastry] [360°]        ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────┬──────────────┬──────────────┐  │
│  │ FILTER      │ CONTENT      │ CONTEXT     │  │
│  │ (Left)      │ (Center)     │ (Right)     │  │
│  │             │              │             │  │
│  │ • Scores    │ Main content │ Quick facts │  │
│  │ • Charts    │ per selected │ • Overall   │  │
│  │ • Synastry  │ tab          │   score     │  │
│  │ • 360°      │              │ • Status    │  │
│  │             │              │ • Timing    │  │
│  │             │              │ (Transits)  │  │
│  │             │              │             │  │
│  └─────────────┴──────────────┴──────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Components

### 1. Relationship List View

**Purpose:** Browse all relationships with quick compatibility overview

**Layout:** Grid (3-4 cards per row, responsive)

#### **Relationship Card**

**Dimensions:**
- Desktop: 200px × 240px
- Tablet: 160px × 200px
- Mobile: Full width - padding

**Content:**
```
┌──────────────────────────┐
│                          │
│  Person1 & Person2       │
│                          │
│  ♉ • ♑ <--> ♋ • ♈        │
│  (sun/moon signs)        │
│                          │
│     Overall Score        │
│        78%               │
│                          │
│      [Flourishing]       │
│  (status badge)          │
│                          │
│   [View Details →]       │
│                          │
└──────────────────────────┘
```

**Styling:**
- Background: var(--color-bg-secondary)
- Border: 1px solid var(--color-border)
- Border radius: var(--border-radius-md)
- Padding: var(--spacing-lg)
- Text align: center

**Score Color Coding:**
```
90-100% → #10b981 (green/emerald)   [Thriving]
75-89%  → #a78bfa (purple/primary)  [Flourishing]
60-74%  → #f59e0b (amber/warning)   [Growing]
< 60%   → #ef4444 (red/critical)    [Challenging]
```

**States:**
- **Default:** Subtle border
- **Hover:** Border brightens to primary color, slight scale up
- **Click:** Navigate to detail view

#### **Grid Layout**

**Desktop (1024px+):**
- 4 cards per row
- Grid: `repeat(auto-fill, minmax(200px, 1fr))`

**Tablet (768-1023px):**
- 3 cards per row
- Grid: `repeat(auto-fill, minmax(160px, 1fr))`

**Mobile (<768px):**
- Single column
- Full width cards

#### **Action Bar**

**Above grid:**
- **[+ Add Relationship]** Button (primary style)
- **[Sort By]** Dropdown (Score, Name, Recent)
- **[Filter By]** Options (Thriving, Flourishing, Growing, Challenging)

---

### 2. Relationship Detail View

**Purpose:** In-depth analysis of a specific relationship

**Layout:** Tabbed interface with filter panel

#### **Header Section**

**Content:**
```
[← Back] 
Ed & Andrea
Taurus Sun • Capricorn Moon <--> Cancer Sun • Aquarius Moon
```

**Styling:**
- Padding: var(--spacing-xl)
- Border-bottom: 1px solid var(--color-border)
- Sticky positioning (top of scrollable area)

#### **Tab Navigation**

**Tabs:**
1. **Scores** (default)
2. **Charts** (side-by-side birth charts)
3. **Synastry** (aspect analysis)
4. **360° Analysis** (comprehensive breakdown)

**Styling:**
- Horizontal tab buttons
- Active: Purple background + underline
- Inactive: Subtle text
- Position: Sticky below header

#### **Left Column: Filter Panel**

**Width:** 140px (sticky, top: header height + tabs height)

**Content:**
Matches current tabs, allows quick navigation within same section
```
Filter / Navigate:
- Scores (default)
- Charts
- Synastry
- 360° Analysis
```

**Note:** On desktop, these are tabs. On mobile, this could be a collapsible panel.

#### **Center Column: Content Area**

**Width:** Flexible (1fr)

Displays content based on selected tab.

##### **Tab 1: Scores**
```
COMPATIBILITY OVERVIEW

Overall Score
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
78%
Flourishing
Highly Compatible with Strong Connection

Strongest: 🧠 Connection
Growth Area: 🔥 Passion


COMPATIBILITY DIMENSIONS

[Grid of 5 cards, 2-3 per row]

┌──────────────┐  ┌──────────────┐
│ 💕 Harmony   │  │ 🔥 Passion   │
│ 79%          │  │ 67%          │
│ Easy-going   │  │ Easy-going   │
└──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│ 🧠 Connection│  │ 💎 Stability │
│ 90%          │  │ 77%          │
│ Easy-going   │  │ Easy-going   │
└──────────────┘  └──────────────┘

┌──────────────┐
│ 🌱 Growth    │
│ 74%          │
│ Easy-going   │
└──────────────┘


RADAR CHART VISUALIZATION
(Compatibility radar with 5 dimensions)

[Visual: Pentagon radar chart showing all 5 dimensions]
```

**Card Styling:**
```css
.dimension-card {
  background: rgba(167, 139, 250, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
}

.dimension-score {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.dimension-label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.dimension-status {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

##### **Tab 2: Charts**
```
CHART COMPARISON

Person 1: Ed                Person 2: Andrea
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │
│  [Chart Wheel]  │        │  [Chart Wheel]  │
│   Taurus Sun    │        │   Cancer Sun    │
│                 │        │                 │
└─────────────────┘        └─────────────────┘

Ed's Placements         Andrea's Placements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sun in Taurus           Sun in Cancer
Moon in Capricorn       Moon in Aquarius
Rising: Virgo           Rising: Libra
Venus in Taurus         Venus in Cancer
Mars in Capricorn       Mars in Pisces
```

**Layout:**
- Two-column comparison
- Chart wheels (if available) displayed side-by-side
- Key placements listed below each chart
- Colors differentiate the two people (Person 1 vs Person 2)

##### **Tab 3: Synastry**
```
SYNASTRY ASPECTS (Planet-to-Planet Interactions)

Harmonious Aspects (Trines & Sextiles)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ed's Sun trine Andrea's Venus (Orb: 1°23')
Positive, flowing connection around self-expression and affection.
This is a harmonious aspect indicating mutual admiration and ease...

Ed's Venus sextile Andrea's Moon (Orb: 2°15')
Emotional connection with romantic undertones. Andrea feels understood
by Ed's affection, and Ed appreciates Andrea's emotional depth...

[More harmonious aspects...]


Challenging Aspects (Squares & Oppositions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ed's Mars square Andrea's Saturn (Orb: 3°12')
This challenging aspect suggests friction between assertiveness and
caution. Ed may feel restrained by Andrea's cautious approach, while...

[More challenging aspects...]


Aspects Grid (Visual)
[Table showing: Planet1 | Aspect | Planet2 | Orb | Type | Interpretation]
```

**Aspect Styling:**
```css
.synastry-section {
  margin-bottom: var(--spacing-2xl);
}

.synastry-heading {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-lg);
}

.aspect-item {
  background: var(--color-bg-tertiary);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-primary);
}

.aspect-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.aspect-orb {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: inline-block;
  margin-left: var(--spacing-md);
}

.aspect-interpretation {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}
```

##### **Tab 4: 360° Analysis**
```
COMPREHENSIVE RELATIONSHIP ANALYSIS

Relationship Foundation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on synastry and composite chart analysis, this is a
fundamentally compatible pairing with strong emotional connection...

[Full interpretation paragraph]


Strengths of This Relationship
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Emotional harmony and understanding
- Shared values and life goals
- Strong physical/romantic attraction
- Mutual support and loyalty
- [More strengths...]


Areas for Growth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Communication during conflicts
- Respecting independence and individuality
- Managing different financial approaches
- [More growth areas...]


Timing & Transits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Transits Affecting This Relationship:

Jupiter transiting Person 1's 7th House (through 2025)
This transit is favorable for relationships, bringing optimism and
expansion to partnership matters...

Saturn square Relationship Venus (exact Oct 2025)
A period of testing and maturation. Use this time to strengthen
commitment and address underlying issues...

[More transit information...]


Long-term Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[12-month or longer outlook based on transits, progressions]
```

---

#### **Right Column: Quick Facts Sidebar**

**Width:** 280px (sticky, top: header height + tabs height)

**Content:**
```
RELATIONSHIP OVERVIEW

Overall Score
78%

Status
🌟 Flourishing

Relationship Type
Romantic

Time Together
3 years, 2 months

Sun Sign Pairing
Taurus ♉ & Cancer ♋

Moon Sign Pairing
Capricorn ♑ & Aquarius ♒

Venus Sign Pairing
Taurus ♉ & Cancer ♋

Mars Sign Pairing
Capricorn ♑ & Pisces ♓

Strongest Dimension
🧠 Connection (90%)

Growth Area
🔥 Passion (67%)

Lunar Nodes
Ed: Gemini ← Sagittarius
Andrea: Leo ← Aquarius

Aspects Count
Harmonious: 12
Challenging: 5

Next Notable Transit
Jupiter trine Ed's Venus
(exact: Mar 15, 2025)
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

.fact-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.fact-section:last-child {
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

---

## Synastry Analysis

### What is Synastry?

Synastry is the comparison of two birth charts to understand the interaction between two people. Key elements:

1. **Aspects** - Angular relationships between planets in the two charts
2. **Sign Overlays** - Where one person's planets fall in the other's houses
3. **Dominant Themes** - Repeated aspects or pattern themes
4. **Composite Chart** - A chart created from the midpoints of both charts (the relationship as an entity)

### Aspect Types

**Harmonious:**
- Trine (120°) - Easy flow, natural compatibility
- Sextile (60°) - Supportive, beneficial energy
- Conjunction (0°) - Fusion, blending of energies (can be harmonious or challenging depending on planets)

**Challenging:**
- Square (90°) - Friction, tension, growth catalyst
- Opposition (180°) - Polarity, tension that can evolve into balance

**Neutral:**
- Quincunx (150°) - Adjustment needed, quirky combinations

### Compatibility Dimensions

**1. Harmony** 💕
How easily the two people get along, natural compatibility in communication and values.

**2. Passion** 🔥
Sexual attraction, physical chemistry, excitement in the relationship.

**3. Connection** 🧠
Emotional depth, intellectual understanding, feeling "seen" by the other person.

**4. Stability** 💎
Security, commitment, building something lasting together.

**5. Growth** 🌱
How much the relationship helps each person evolve and develop.

---

## Data Structure

### Relationship Object
```javascript
{
  id: "uuid",
  userId: "uuid", // The user viewing this
  person1: {
    id: "uuid",
    name: "string",
    chartId: "uuid", // Reference to birth chart
    avatar: "string (URL)",
    sunSign: "string",
    moonSign: "string",
    risingSign: "string",
  },
  person2: {
    id: "uuid",
    name: "string",
    chartId: "uuid",
    avatar: "string (URL)",
    sunSign: "string",
    moonSign: "string",
    risingSign: "string",
  },
  relationship: {
    type: "romantic" | "friendship" | "family" | "professional",
    startDate: "ISO 8601 date",
    status: "active" | "ended",
    notes: "string (optional)"
  },
  compatibility: {
    overall: {
      score: 0-100,
      status: "Challenging" | "Growing" | "Flourishing" | "Thriving",
      description: "string"
    },
    dimensions: {
      harmony: {
        score: 0-100,
        status: "Challenging" | "Easy-going" | "Flowing",
        interpretation: "string"
      },
      passion: { ... },
      connection: { ... },
      stability: { ... },
      growth: { ... }
    },
    strongest: "harmony" | "passion" | "connection" | "stability" | "growth",
    growthArea: "harmony" | "passion" | "connection" | "stability" | "growth"
  },
  synastry: {
    aspects: [
      {
        id: "uuid",
        planet1: "string", // Ed's planet
        planet2: "string", // Andrea's planet
        aspect: "trine" | "sextile" | "square" | "opposition" | "conjunction",
        orb: number, // Degrees of orb (0-8 typically)
        type: "harmonious" | "challenging" | "neutral",
        exact: "ISO 8601 date", // When aspect is exact (optional)
        interpretation: "string"
      }
    ],
    harmonious_count: number,
    challenging_count: number,
    dominating_aspects: ["trine", "sextile"], // Most common
  },
  transits: {
    current: [
      {
        date: "ISO 8601 date",
        transitingPlanet: "string",
        aspect: "string",
        affectedPlanet: "string",
        affectedPerson: "person1" | "person2" | "both",
        interpretation: "string",
        strength: "minor" | "moderate" | "major"
      }
    ],
    upcomingImportant: [
      {
        date: "ISO 8601 date",
        description: "string",
        impact: "string"
      }
    ]
  },
  compositeChart: {
    // Optional: if calculated
    sun: { sign: "string", degree: number },
    moon: { sign: "string", degree: number },
    venus: { sign: "string", degree: number },
    // ... other placements
  }
}
```

---

## User Flows

### Flow 1: Browse Relationships
```
User navigates to Relationships section
  → See grid of all relationships
  → Can filter/sort by compatibility score or status
  → Can add new relationship via [+ Add Relationship]
  → Click any relationship card → Detail view
```

### Flow 2: View Relationship Detail
```
User clicks relationship card
  → Navigate to relationship detail view
  → Default tab: Scores
  → See overall compatibility + dimensions breakdown
  → Can switch tabs: Charts, Synastry, 360° Analysis
  → Can go back to list
```

### Flow 3: Analyze Synastry
```
User on detail view → clicks "Synastry" tab
  → See planet-to-planet aspects
  → Aspects grouped by type (Harmonious / Challenging)
  → Can click aspect for more detail
  → Can view aspects grid/table
```

### Flow 4: View Chart Comparison
```
User on detail view → clicks "Charts" tab
  → See both birth charts side-by-side
  → Can view placements for each person
  → Can see sun/moon/venus/mars comparison
  → Can link to individual birth chart detail if needed
```

### Flow 5: Check Relationship Transits
```
User on detail view → clicks "360° Analysis" tab
  → Scroll to "Timing & Transits" section
  → See current transits affecting the relationship
  → See upcoming important dates
  → Get interpretation of current period
```

---

## Responsive Design

### Desktop (1024px+)

**List View:**
```
4 relationship cards per row
Full grid layout with spacing
```

**Detail View:**
```
[140px filter] | [flexible content] | [280px sidebar]
```

### Tablet (768-1023px)

**List View:**
```
3 relationship cards per row
Adjusted spacing
```

**Detail View:**
- Sidebar can collapse to below content if needed
- Flexible columns adjust
- Or: 2-column layout, sidebar below

### Mobile (<768px)

**List View:**
```
1 relationship card per row (full width - padding)
Vertical scrolling
```

**Detail View:**
```
Single column layout
Tabs visible but may need horizontal scroll
Filter panel becomes a collapsible menu
Sidebar content moves below main content
```

---

## State Management

### Global State
```javascript
{
  relationships: {
    list: Relationship[], // all relationships
    selectedRelationship: Relationship, // currently viewed
  },
  relationshipUI: {
    currentTab: "scores" | "charts" | "synastry" | "360",
    isLoading: boolean,
    error: string | null,
    filterBy: "all" | "thriving" | "flourishing" | "growing" | "challenging",
    sortBy: "score" | "name" | "recent",
  },
  view: "relationshipsList" | "relationshipDetail",
}
```

---

## Component Hierarchy
```
DashboardLayout (from Phase 1)
├── TopHeader (shared)
├── Sidebar (shared)
└── ContentArea
    └── RelationshipsSection
        ├── RelationshipsList (when viewing list)
        │   ├── ActionBar ([Add], [Sort], [Filter])
        │   └── RelationshipsGrid
        │       ├── RelationshipCard
        │       ├── RelationshipCard
        │       └── ...
        │
        └── RelationshipDetailView (when viewing detail)
            ├── RelationshipHeader
            ├── TabNavigation (Scores, Charts, Synastry, 360°)
            ├── DetailContent (3-column grid)
            │   ├── FilterPanel (left sticky column)
            │   ├── TabContent (center, dynamic)
            │   │   ├── ScoresTab
            │   │   ├── ChartsTab
            │   │   ├── SynastryTab
            │   │   └── Analysis360Tab
            │   └── QuickFactsSidebar (right sticky column)
            └── BackButton / Navigation
```

---

## Implementation Guidelines

### Phase 3 Development Breakdown

**Week 1: Foundation & List View**
- Create RelationshipsSection component
- Build RelationshipsList view with grid layout
- Create RelationshipCard component with styling
- Implement responsive grid layout
- Connect to existing relationships data
- Build action bar ([Add], [Sort], [Filter])

**Week 2: Detail View & Tabs**
- Build RelationshipDetailView component
- Create tab navigation (Scores, Charts, Synastry, 360°)
- Implement ScoresTab with compatibility dimensions
- Build radar chart visualization
- Create ChartsTab with side-by-side charts
- Create responsive layout (filter | content | sidebar)

**Week 3: Synastry & Analysis**
- Build SynastryTab with aspect breakdown
- Create aspect item styling and interpretation display
- Build Analysis360Tab with comprehensive content
- Implement Transit information display
- Create Quick Facts sidebar

**Week 4: Polish & Refinement**
- CSS variables refactor (all relationship CSS uses design tokens)
- Responsive design testing (tablet, mobile)
- Add loading/error states
- Accessibility audit (WCAG AA)
- Performance optimization
- User testing and feedback

### CSS Changes

**All relationship component CSS should use css-variables.css:**
```css
/* ✅ Good */
.relationship-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
}

/* ❌ Avoid */
.relationship-card {
  background: #2a2d4a;
  border: 1px solid #3d3f5f;
  padding: 16px;
}
```

### File Structure
```
src/
├── components/
│   ├── Relationships/
│   │   ├── RelationshipsSection.jsx
│   │   ├── RelationshipsSection.css
│   │   ├── RelationshipsList/
│   │   │   ├── RelationshipsList.jsx
│   │   │   ├── RelationshipsList.css
│   │   │   ├── RelationshipCard.jsx
│   │   │   ├── RelationshipsGrid.jsx
│   │   │   └── ActionBar.jsx
│   │   ├── RelationshipDetail/
│   │   │   ├── RelationshipDetailView.jsx
│   │   │   ├── RelationshipDetailView.css
│   │   │   ├── RelationshipHeader.jsx
│   │   │   ├── TabNavigation.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── QuickFactsSidebar.jsx
│   │   │   ├── tabs/
│   │   │   │   ├── ScoresTab.jsx
│   │   │   │   ├── ChartsTab.jsx
│   │   │   │   ├── SynastryTab.jsx
│   │   │   │   └── Analysis360Tab.jsx
│   │   │   ├── components/
│   │   │   │   ├── CompatibilityRadar.jsx (chart)
│   │   │   │   ├── AspectItem.jsx
│   │   │   │   ├── DimensionCard.jsx
│   │   │   │   └── TransitInfo.jsx
│   │   │   └── RelationshipDetailView.css
│   │   └── hooks/
│   │       └── useRelationshipData.js
```

### Key Decisions

1. **Side-by-side chart comparison** - Now in Phase 3 where it makes sense (synastry context)
2. **Synastry as primary focus** - This is what distinguishes relationships from other sections
3. **Tab-based organization** - Matches existing design, groups content logically
4. **Three-column detail layout** - Consistent with Phase 1 & 2
5. **Transit information included** - Shows timing and current influences
6. **Uses Phase 1-2 foundation** - DashboardLayout, CSS variables, design system

### Testing Checklist

**Functional:**
- [ ] Relationship list displays grid correctly (responsive)
- [ ] Filter/Sort functionality works
- [ ] Click relationship navigates to detail view
- [ ] All tabs load content correctly (Scores, Charts, Synastry, 360°)
- [ ] Back button returns to list
- [ ] Synastry aspects display correctly
- [ ] Chart comparison shows both charts
- [ ] Transit information displays
- [ ] Quick Facts sidebar accurate

**Visual:**
- [ ] Desktop layout matches spec (3-column on detail)
- [ ] Compatibility radar chart visualizes correctly
- [ ] Cards styled per spec (colors, spacing)
- [ ] Tabs switch smoothly
- [ ] Tablet layout responsive
- [ ] Mobile layout single-column
- [ ] Colors match design system
- [ ] Typography hierarchy correct

**Accessibility:**
- [ ] Keyboard navigation works (Tab through elements)
- [ ] Tab buttons announce state (active/inactive)
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader interprets synastry data
- [ ] Focus states visible

**Performance:**
- [ ] List loads in < 1s
- [ ] Detail view transitions smooth
- [ ] Chart visualizations render quickly
- [ ] No jank when switching tabs

---

## Differences from Phase 1-2 Patterns

**Similarity:** Uses same DashboardLayout (sidebar + header)

**Difference:** Adds tab-based navigation within detail view (new pattern not used in Phase 1-2)

The three-column layout is consistent with Phase 1 horoscope and Phase 2 birth charts, reinforcing design consistency.

---

## Dependencies & Integration

**Depends on:**
- Phase 1 completion (DashboardLayout, CSS variables)
- Phase 2 completion (Birth Charts - referenced in chart comparison)
- Existing relationship data API
- Existing synastry calculation backend

**Enables:**
- Future features (shared transits, anniversary tracking, composite chart display)
- Integration with Ask Stellium (ask about relationship specifically)

---

## Future Enhancements (Post-Phase 3)

- **Composite Charts** - Chart created from midpoints of both charts
- **Composite House Overlays** - How each person's planets fall in the composite chart
- **Lunar Node Connections** - Karmic connections between charts
- **Part of Fortune Compatibility** - Shared destiny themes
- **Relationship History** - Track how compatibility changes over time
- **Anniversary Alerts** - Remind of important dates
- **Shared Transits** - Transits affecting both people simultaneously
- **Progressed Charts** - Secondary progressions for relationship evolution
- **Export Reports** - PDF compatibility reports

---

## Success Metrics

- **Usability:** Users can understand relationship compatibility in < 3 clicks
- **Engagement:** Time spent on relationship analysis increases
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** Detail view loads in < 500ms
- **Satisfaction:** User feedback indicates better understanding of relationship dynamics

---

## Notes

- All interpretation content should be rich, nuanced, and helpful
- Aspect interpretations should consider context (harmonious vs. challenging, strong vs. weak)
- Transits should include realistic timeframes and actionable insights
- Maintain consistency with astrological terminology across all content