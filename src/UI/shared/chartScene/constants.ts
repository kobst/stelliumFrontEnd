import type { AspectType } from './types'

export interface SignInfo {
  name: string
  glyph: string
  /** element tint for the glyph */
  color: string
}

/** index 0 = Aries (0°–30°), proceeding through the zodiac */
export const SIGNS: readonly SignInfo[] = [
  { name: 'Aries', glyph: '♈', color: '#ff6b5e' },
  { name: 'Taurus', glyph: '♉', color: '#7ed491' },
  { name: 'Gemini', glyph: '♊', color: '#ffd76e' },
  { name: 'Cancer', glyph: '♋', color: '#6ea8ff' },
  { name: 'Leo', glyph: '♌', color: '#ff6b5e' },
  { name: 'Virgo', glyph: '♍', color: '#7ed491' },
  { name: 'Libra', glyph: '♎', color: '#ffd76e' },
  { name: 'Scorpio', glyph: '♏', color: '#6ea8ff' },
  { name: 'Sagittarius', glyph: '♐', color: '#ff6b5e' },
  { name: 'Capricorn', glyph: '♑', color: '#7ed491' },
  { name: 'Aquarius', glyph: '♒', color: '#ffd76e' },
  { name: 'Pisces', glyph: '♓', color: '#6ea8ff' },
]

export interface BodyInfo {
  glyph: string
  color: string
  /** sphere radius */
  size: number
}

export const BODIES: Record<string, BodyInfo> = {
  sun: { glyph: '☉', color: '#ffc94d', size: 0.16 },
  moon: { glyph: '☽', color: '#d8dcee', size: 0.14 },
  mercury: { glyph: '☿', color: '#ffa94d', size: 0.09 },
  venus: { glyph: '♀', color: '#7ee8a2', size: 0.11 },
  mars: { glyph: '♂', color: '#ff5e4d', size: 0.11 },
  jupiter: { glyph: '♃', color: '#ff9e6e', size: 0.14 },
  saturn: { glyph: '♄', color: '#d9b98a', size: 0.13 },
  uranus: { glyph: '♅', color: '#6ee8e8', size: 0.11 },
  neptune: { glyph: '♆', color: '#6e8eff', size: 0.11 },
  pluto: { glyph: '♇', color: '#c98aff', size: 0.08 },
  node: { glyph: '☊', color: '#8fd36f', size: 0.09 },
  earth: { glyph: '♁', color: '#5fb7ff', size: 0.12 },
}

/** chart angles get axis-line treatment instead of a sphere */
export const ANGLES: Record<string, { label: string; color: string }> = {
  asc: { label: 'AC', color: '#9be8ff' },
  mc: { label: 'MC', color: '#ffc9f0' },
}


/** red for tension, blue for flow, gold for fusion */
export const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#e9c349',
  opposition: '#ff6f6f',
  square: '#ff6f6f',
  trine: '#5e8eff',
  sextile: '#5e8eff',
}

/** widest orb still counted per aspect type; drives line strength */
export const ASPECT_MAX_ORB: Record<AspectType, number> = {
  conjunction: 8,
  opposition: 8,
  square: 6,
  trine: 6,
  sextile: 4,
}

/** zodiac band */
export const WHEEL_OUTER_RADIUS = 5
export const WHEEL_INNER_RADIUS = 4.2
export const SIGN_GLYPH_RADIUS = (WHEEL_OUTER_RADIUS + WHEEL_INNER_RADIUS) / 2

/** orbit radius for natal planets */
export const NATAL_PLANET_RADIUS = 3.5

/**
 * Mean orbital distances (AU) for "heliocentric" mode. Real distances
 * span 100× (Mercury 0.39 → Pluto 39.5), so scene radii are mapped on a
 * log scale below — display mapping only, no astronomy computed here.
 */
const HELIO_MEAN_AU: Record<string, number> = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1.0,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.069,
  pluto: 39.482,
}

const HELIO_RING_MIN = 1.1
const HELIO_RING_MAX = 4.0

/** log-scaled scene radius per body for "heliocentric" mode */
export const HELIO_ORBIT_RADII: Record<string, number> = (() => {
  const logs = Object.values(HELIO_MEAN_AU).map(Math.log)
  const min = Math.min(...logs)
  const span = Math.max(...logs) - min
  return Object.fromEntries(
    Object.entries(HELIO_MEAN_AU).map(([body, au]) => [
      body,
      HELIO_RING_MIN + ((Math.log(au) - min) / span) * (HELIO_RING_MAX - HELIO_RING_MIN),
    ]),
  )
})()
/** orbit radius for the secondary (synastry) ring — Phase 3 */
export const SECONDARY_PLANET_RADIUS = 2.4

/** transiting bodies orbit just outside the zodiac band — Phase 4 */
export const TRANSIT_PLANET_RADIUS = 5.6
