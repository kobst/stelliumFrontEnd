# Phase 1 Design Specification - Stellium Dashboard

## Table of Contents

1. [Layout Architecture](#layout-architecture)
2. [Navigation Sidebar](#navigation-sidebar)
3. [Top Header](#top-header)
4. [Horoscope Section](#horoscope-section)
5. [Component Specifications](#component-specifications)
6. [Visual Hierarchy](#visual-hierarchy)
7. [Spacing & Dimensions](#spacing--dimensions)
8. [Typography](#typography)
9. [Colors & Contrast](#colors--contrast)
10. [Transitions & Animations](#transitions--animations)

---

## Layout Architecture

### Overall Structure
```
┌─────────────────────────────────────────────────────────────┐
│                      TOP HEADER (80px)                      │
│  Logo        User Profile (Avatar + Name + Sun Sign)  Buttons│
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────┐
│              │                                              │
│   SIDEBAR    │             CONTENT AREA                     │
│   (240px)    │                                              │
│              │  ┌──────────┬──────────┬──────────┐          │
│  Navigation  │  │          │          │          │          │
│  Links       │  │ Filters  │ Primary  │Secondary │          │
│              │  │          │ Content  │ Content  │          │
│  Log out     │  │          │          │          │          │
│              │  └──────────┴──────────┴──────────┘          │
└──────────────┴──────────────────────────────────────────────┘
```

### Grid Layout

The main content area uses CSS Grid:
```
grid-template-columns: 140px 1fr 280px;  /* Filter | Content | Context */
gap: 24px;
```

---

## Navigation Sidebar

### Purpose

Persistent left sidebar providing primary navigation and user context. Should be sticky and always accessible on desktop.

### Dimensions

- **Width:** 240px (fixed)
- **Padding:** 24px (vertical), 16px (horizontal)
- **Height:** Fills remaining viewport height (calc(100vh - 80px))
- **Position:** Sticky top (top: 80px, accounting for header height)

### Sections

#### 1. Profile Section (Top)

**Components:**
- User avatar (80px circular)
- Username (headline)
- Sun sign (subtitle)

**Spacing:**
- Gap between elements: 12px
- Padding below section: 16px
- Bottom border: 1px solid var(--color-border)

**Styling:**
```
Text alignment: Center
Avatar border: 3px solid var(--color-primary)
Sun sign color: var(--color-text-secondary)
```

#### 2. Primary Navigation

**Items:**
- Horoscope
- Birth Charts
- Relationships

**Styling:**
- Font size: 14px
- Font weight: 600
- Text transform: uppercase
- Letter spacing: 0.5px
- Padding: 12px 16px
- Border radius: 8px
- Gap between items: 12px

**States:**
- **Inactive:** Transparent background, gray text, subtle border
- **Active:** Purple background (var(--color-primary)), white text
- **Hover:** Text brightens, cursor pointer

#### 3. Secondary Navigation

**Items:**
- Ask Stellium
- Settings

**Styling:**
- Same as primary but smaller font (13px)
- Appears below primary nav with visual separator

#### 4. Logout Button (Footer)

**Positioning:** Margin-top: auto (pushes to bottom)
**Styling:**
- Border: 1px solid var(--color-border)
- Background: transparent
- Color: var(--color-text-secondary)
- Padding: 10px 12px
- Border radius: 8px
- Font size: 13px

**States:**
- **Hover:** Border and text brighten to var(--color-text-primary)

### Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (1024px+) | Full width visible, sticky positioning |
| Tablet (768-1023px) | Visible but condensed (200px width) |
| Mobile (<768px) | Hidden, hamburger menu in header |

---

## Top Header

### Dimensions

- **Height:** 80px
- **Position:** Fixed, z-index: 1000
- **Background:** var(--color-bg-secondary)
- **Border:** 1px solid var(--color-border) (bottom only)

### Left Section

**Hamburger Menu Icon** (mobile only)
- Display: none on desktop
- Display: block on mobile (<768px)
- Font size: 24px
- Color: var(--color-text-primary)

**Branding**
- Text: "Stellium"
- Font size: 20px
- Font weight: 700
- Color: var(--color-primary)

### Right Section

**User Profile Block**
- Display: flex
- Align items: center
- Gap: 12px
- Flex direction: column (avatar above name)
- Text align: center

**Elements:**
- Avatar: 48px circular, 2px border in primary color
- Username: 14px, font-weight 600
- Sun sign: 12px, gray text, italic

**Premium Badge**
- Background: Linear gradient (primary to primary-dark)
- Padding: 6px 16px
- Border radius: 20px
- Font size: 12px, bold
- Cursor: pointer
- Hover: Slight scale transform, shadow glow

**Manage Button**
- Similar styling to logout button
- Padding: 8px 16px
- Border: 1px solid var(--color-border)

---

## Horoscope Section

### Section Container

**Layout:** CSS Grid, three columns
**Spacing:** 24px gap between columns

### Left Column: Time Period Selector

**Width:** 140px
**Content:** Vertical button group

**Buttons:**
- **Label:** "Today", "This Week", "This Month"
- **Styling:** Outlined pill shape
- **Padding:** 10px 12px
- **Font size:** 13px
- **Font weight:** 600
- **Border radius:** 20px
- **Gap between buttons:** 12px

**States:**
- **Active:** Background purple, white text
- **Inactive:** Transparent, gray text, subtle border
- **Hover:** Border color changes to primary

**Positioning:** Sticky (position: sticky; top: 32px;)

**Responsive:**
- At 1200px: Hidden, buttons move above content as horizontal group
- At <768px: Full width horizontal buttons above content

### Center Column: Main Horoscope Content

**Width:** Flexible (1fr)

**Card Container:**
- Background: var(--color-bg-secondary)
- Border: 1px solid var(--color-border)
- Border radius: 12px
- Padding: 32px

**Title: "Your Daily Horoscope"**
- Font size: 28px
- Font weight: 700
- Color: white
- Margin bottom: 24px

**Content Paragraphs:**
- Font size: 16px
- Line height: 1.6
- Color: var(--color-text-secondary)
- Margin bottom: 16px (between paragraphs)
- Last paragraph: margin-bottom 0

**Date Range Separator:**
- Font size: 13px
- Color: gray
- Padding: 16px (top/bottom)
- Border: 1px solid var(--color-border) (top and bottom)
- Margin: 24px 0
- Text align: center

**Action Buttons:**
- Display: flex
- Gap: 12px
- Justify content: center
- Margin top: 24px

**Button Styling:**
- Padding: 8px 16px
- Border: 1px solid var(--color-border)
- Border radius: 20px
- Font size: 13px
- Font weight: 600
- Background: transparent
- Color: var(--color-text-secondary)
- Cursor: pointer

**Button States:**
- **Hover:** Border and text brighten to primary, background tinted

### Right Column: Key Planetary Influences

**Width:** 280px
**Positioning:** Sticky (top: 32px)

**Card Container:**
- Background: var(--color-bg-secondary)
- Border: 1px solid var(--color-border)
- Border radius: 12px
- Padding: 24px

**Title:**
- Font size: 12px
- Font weight: 700
- Text transform: uppercase
- Letter spacing: 0.5px
- Margin bottom: 16px
- Color: white

**Influences List:**
- No bullets (list-style: none)
- Display: flex column
- Gap: 12px

**Influence Item:**
- Padding: 12px
- Border radius: 8px
- Background: rgba(purple, 0.05)
- Border: 1px solid var(--color-border)
- Cursor: pointer

**Item States:**
- **Hover:** Background brightens to 0.1 opacity, border color to primary

**Aspect Name:**
- Font size: 13px
- Font weight: 600
- Color: var(--color-primary)
- Display: inline

**Aspect Type:**
- Font size: 11px
- Color: gray
- Display: inline

**Aspect Date:**
- Font size: 11px
- Color: gray
- Display: block (below aspect)

---

## Component Specifications

### Button Components

All buttons follow this base specification:

**Base Button:**
```
Border: 1px solid
Border radius: 8px or 20px (pill for toggle buttons)
Font weight: 600
Font size: 13px
Padding: 10px 12px
Cursor: pointer
Transition: all 0.3s ease
```

**Primary/Active Button:**
```
Background: var(--color-primary)
Color: white
Border color: var(--color-primary)
```

**Secondary/Inactive Button:**
```
Background: transparent
Color: var(--color-text-secondary)
Border color: var(--color-border)
```

**Button Hover:**
```
All buttons darken or brighten depending on state
Color: var(--color-text-primary) or var(--color-primary)
Border: Becomes more visible
```

### Card Components

**Specification:**
```
Background: var(--color-bg-secondary)
Border: 1px solid var(--color-border)
Border radius: 12px
Padding: 24px or 32px
Shadow: None (flat design)
```

### Input Components

Not specified in Phase 1 (Ask Stellium form fields come in Phase 3).

---

## Visual Hierarchy

### Color Usage

**Primary Content:**
- Headings: white (var(--color-text-primary))
- Body text: light gray (var(--color-text-secondary))
- Accents: purple (var(--color-primary))

**Secondary Content:**
- Dates, metadata: darker gray
- Borders: subtle purple-gray mix

**Interaction States:**
- Active: Purple fill
- Hover: Purple border/color
- Disabled: Grayed out

### Font Hierarchy

**Large (28px):** Section titles ("Your Daily Horoscope")
**Medium (16px):** Body content, paragraphs
**Small (14px):** Navigation items, labels
**XSmall (12px):** Secondary info, date ranges
**XXSmall (11px):** Metadata, timestamps

### Emphasis

**Bold:** Headings, planet names, key terms
**Regular:** Body text, descriptions
**Italic:** (Not used, avoid)

---

## Spacing & Dimensions

### Sizing Variables
```
--sidebar-width: 240px
--header-height: 80px
--max-content-width: 1400px
--border-radius: 12px
```

### Spacing Scale
```
4px   - Tight spacing
8px   - Small gaps
12px  - Standard gaps between elements
16px  - Medium gaps, default padding
24px  - Large gaps, section separation
32px  - Extra large gaps, major sections
```

### Padding Guidelines

**Cards:** 24px or 32px
**Buttons:** 8px-12px (V) × 12px-16px (H)
**Section containers:** 32px
**Header:** 24px horizontal

### Gap Guidelines

**Between columns:** 24px
**Between rows in grid:** 20px
**Between list items:** 12px
**Between sections:** 32px

---

## Typography

### Font Family

Primary font family should be a modern sans-serif (currently applied to entire app). Maintain consistency.

Recommended stacks:
- System fonts: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- Or use a web font like Inter, Poppins, or DM Sans

### Font Sizes
```
28px - Primary titles
20px - Section headings
16px - Body text, paragraphs
14px - Navigation items, labels
13px - Secondary text, buttons
12px - Tertiary info, dates
11px - Metadata, timestamps
```

### Font Weights
```
700 - Bold (headings, emphasis)
600 - Semi-bold (labels, nav items)
400 - Regular (body text, paragraphs)
```

### Line Heights
```
Body text (14px+): 1.6
Labels/Nav: 1.4
Headings: 1.3
```

### Letter Spacing
```
Navigation (uppercase): 0.5px
Body text: 0px (default)
All caps labels: 0.5px
```

---

## Colors & Contrast

### Color Palette

**Purples (Primary):**
- `#a78bfa` - Primary accent (WCAG AAA with white bg)
- `#7c3aed` - Primary dark variant

**Backgrounds:**
- `#1a1b2e` - Main background
- `#2a2d4a` - Secondary background (cards, sidebar)
- `#353852` - Tertiary background (nested elements)

**Text:**
- `#ffffff` - Primary text (white)
- `#b0b0c0` - Secondary text (light gray)
- `#808090` - Tertiary text (darker gray)

**Borders & Accents:**
- `#3d3f5f` - Border color (subtle purple-gray)

### Contrast Ratios

**Minimum Requirements (WCAG AA):**
- White text on purple: 4.5:1 ✓
- White text on dark bg: 14.8:1 ✓
- Gray text on dark bg: 7.2:1 ✓
- Gray text on secondary bg: 3.8:1 (needs review)

### Dark Mode

Phase 1 maintains the existing dark theme. All color variables are designed for dark mode.

### Accessibility Considerations

- Avoid pure black (#000000) on backgrounds; use dark blue-gray
- Purple accent provides sufficient contrast for interactive elements
- Use color + text/icon to indicate state, not color alone
- Test with accessibility tools before launch

---

## Transitions & Animations

### Duration

**Standard transition:** 0.3s ease
**Long transition:** 0.5s ease
**Quick feedback:** 0.15s ease

### Timing Function

**Easing:** cubic-bezier(0.4, 0, 0.2, 1) or ease (default)

### Animated Properties

**Recommended to animate:**
- Opacity (content changes)
- Transform (button scale, slide)
- Color (hover states)
- Border-color (focus states)
- Background-color (state changes)

**Not animated:**
- Layout shifts (use layout-shift: 0)
- Width/height (use transform scale instead)
- Shadows (if necessary, use opacity)

### Content Transitions

**Horoscope Content Change:**
```
1. Current content fades out (200ms)
2. Data loads (loading state visible)
3. New content fades in (300ms)
```

**Button Interactions:**
```
1. Hover: Color/border change (150ms)
2. Active: Background fill (100ms)
3. Release: Return to state (150ms)
```

### Reduced Motion

For users with `prefers-reduced-motion: reduce`:
- Set all transitions to 0ms
- Maintain instant feedback
- Keep all interactive states visible
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Additional Notes

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android latest

### Pixel Perfect

Implement to within ±2px of specifications. Minor adjustments for font rendering are acceptable.

### Future Phases

Phase 1 establishes the navigation and horoscope layout. Phases 2-3 will:
- Redesign Birth Charts section
- Redesign Relationships section
- Enhance Ask Stellium feature

Maintain consistency with Phase 1 design system when implementing future phases.

---