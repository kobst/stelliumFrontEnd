export interface Placement {
  /** "sun", "moon", "mercury", ... "pluto", plus "asc", "mc" */
  body: string
  /** ecliptic longitude 0–360 */
  longitude: number
  retrograde?: boolean
}

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'

export type ChartLayer = 'natal' | 'secondary'

export interface Aspect {
  bodyA: string
  bodyB: string
  type: AspectType
  /** degrees from exact; 0 = exact */
  orb: number
  /** for synastry/transits */
  layerA?: ChartLayer
  layerB?: ChartLayer
}

export interface TransitFrame {
  /** ISO date */
  date: string
  placements: Placement[]
  /** aspects between this frame's transiting bodies and natal */
  aspects: Aspect[]
}

/**
 * "wheel" — geocentric: all planets on one shared radius inside the
 * zodiac band, viewer at center.
 * "heliocentric" — Sun at center, planets (including Earth) on orbit
 * rings scaled from real mean orbital distances. Requires the
 * `heliocentric` placement set — heliocentric longitudes are different
 * numbers than geocentric ones and cannot be derived from them.
 */
export type ChartMode = 'wheel' | 'heliocentric'

/** which rendered layer a pointer event hit */
export type SelectionLayer = 'natal' | 'secondary' | 'transit'

export interface BodySelection {
  body: string
  layer: SelectionLayer
  longitude: number
  retrograde?: boolean
}

export interface ChartSceneProps {
  /** view geometry; defaults to "wheel" */
  mode?: ChartMode
  /**
   * externally driven emphasis (e.g. the chapter being read): named
   * natal bodies glow, everything else recedes. Internal hover/selection
   * takes precedence while active.
   */
  highlightBodies?: string[]
  /** frame the wheel straight-down (margin/preview mounts) */
  topDown?: boolean
  /** pointer enters/leaves a planet marker (null on leave) */
  onHoverBody?: (hover: BodySelection | null) => void
  /** planet selected/deselected (click marker / click empty space) */
  onSelectBody?: (selection: BodySelection | null) => void
  natal: Placement[]
  /**
   * heliocentric ecliptic longitudes: "mercury"…"pluto" plus "earth";
   * no sun/moon/asc/mc. Supplied by the ephemeris engine (SEFLG_HELCTR).
   */
  heliocentric?: Placement[]
  natalAspects: Aspect[]
  /** synastry partner chart (static) */
  secondary?: Placement[]
  /** inter-chart aspects */
  secondaryAspects?: Aspect[]
  /** animated layer; component interpolates between frames */
  transitFrames?: TransitFrame[]
  /**
   * ISO date to display within transitFrames' range (the timeline
   * scrubber lives in the host app). Clamped to the frame range;
   * defaults to the first frame.
   */
  transitDate?: string
  /**
   * transiting bodies whose aspect lines render (markers always show
   * every body). Omit for all. Lines fade when a body is filtered.
   */
  transitAspectBodies?: string[]
}
