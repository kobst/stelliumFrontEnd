# Stellium.ai Design Review

**Date:** March 28, 2026  
**Reviewed by:** Esh (AI Agent)  
**Method:** Headless browser analysis (desktop + mobile viewports)

---

## Overall Assessment: 7/10

The site is clean, professional, and the dark theme works well for astrology. Copy is strong and the value proposition is clear. Below are prioritized opportunities for improvement.

---

## ✅ What's Working Well

- **Dark theme** — Fits the astrology aesthetic, feels premium
- **Clear value prop** — "Personalized Astrology, Powered by AI" is immediately understood
- **Feature sections** — The 4 pillars (Birth Chart, Compatibility, Horoscopes, Ask Anything) are well-explained with example questions
- **Pricing clarity** — Credit system is transparent and easy to understand
- **Celebrity charts** — Great for social proof and SEO
- **Mobile responsive** — Scales well to mobile viewports

---

## 🎯 Quick Wins (Priority 1)

### 1. Hero CTA Button
**Current:** Plain outlined button "Get Started Free"  
**Issue:** Blends into the page, doesn't command attention  
**Recommendation:** 
- Add gradient fill (purple → blue fits brand)
- Slightly larger size
- Subtle glow or pulse animation on hover
- Consider adding micro-copy below: "No credit card required"

**Effort:** 15 minutes

### 2. Zodiac Sign Picker
**Current:** 12 identical flat buttons in a row  
**Issue:** Feels static, missed engagement opportunity  
**Recommendation:**
- Add hover state with constellation pattern or glow
- Show zodiac symbol on hover
- Consider subtle scale animation (1.05x)

**Effort:** 30 minutes

### 3. Lazy Load Placeholder
**Current:** "Loading celebrity charts..." text visible during load  
**Issue:** Feels unfinished/unpolished  
**Recommendation:**
- Use skeleton loaders (animated gray boxes)
- Or fade-in animation when content loads

**Effort:** 30 minutes

### 4. Celebrity Photo Consistency
**Current:** Mix of color/B&W, different cropping, varied quality  
**Issue:** Looks like unprocessed stock photos  
**Recommendation:**
- Apply consistent filter (slight desaturation or duotone)
- Uniform circular crop with consistent border
- Same aspect ratio and size

**Effort:** 1 hour

---

## 🔧 Medium Effort Improvements (Priority 2)

### 5. Feature Card Icons
**Current:** Text-heavy feature descriptions  
**Issue:** Hard to scan quickly  
**Recommendation:**
- Add simple icons next to each feature title:
  - Birth Chart → Chart wheel icon
  - Compatibility → Two circles/hearts overlapping
  - Horoscopes → Calendar with stars
  - Ask Anything → Chat bubble with sparkle

**Effort:** 1 hour

### 6. Micro-interactions Throughout
**Current:** Site feels static  
**Recommendation:**
- Hover effects on all cards (subtle lift/shadow)
- Smooth scroll between sections
- Button press feedback (scale down slightly)
- Page section fade-in on scroll

**Effort:** 2 hours

### 7. Footer Polish
**Current:** Minimal — just links and copyright  
**Recommendation:**
- Add Stellium logo
- Add tagline
- Add social links (if applicable)
- Consider newsletter signup

**Effort:** 30 minutes

### 8. Social Proof
**Current:** No testimonials or user count visible  
**Recommendation:**
- Add user count: "Join 10,000+ users" (or actual number)
- 2-3 short testimonials
- Or: "Trusted by astrology enthusiasts worldwide"

**Effort:** 1 hour (copy + design)

---

## 🚀 Future Considerations (Priority 3)

### Animated Hero Background
- Subtle starfield or constellation animation
- Adds premium feel without being distracting
- Could use CSS particles or simple canvas animation

### "Ask Stellium" Demo Animation
- Animate the chat preview to show typing/response
- Demonstrates the core product in action
- More engaging than static screenshot

### Trust Badges
- "Powered by Claude" or similar AI credibility
- "Accurate birth data from Swiss Ephemeris"
- Helps skeptics trust the product

### Plan Comparison Table
- Side-by-side feature comparison
- Clearer than current stacked cards for quick comparison

---

## Summary

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Hero CTA button polish | 15 min | High |
| 1 | Zodiac picker hover states | 30 min | Medium |
| 1 | Skeleton loaders | 30 min | Medium |
| 1 | Celebrity photo treatment | 1 hr | Medium |
| 2 | Feature card icons | 1 hr | Medium |
| 2 | Micro-interactions | 2 hr | High |
| 2 | Footer polish | 30 min | Low |
| 2 | Social proof | 1 hr | High |

**Total estimated effort:** ~7 hours for full Priority 1 + 2 implementation

---

## Screenshots

Desktop and mobile screenshots captured during review are available in the workspace at:
- `~/.openclaw/workspace/screenshots/stellium-full.png`
- `~/.openclaw/workspace/screenshots/stellium-mobile.png`
- `~/.openclaw/workspace/screenshots/stellium-celebrities.png`
