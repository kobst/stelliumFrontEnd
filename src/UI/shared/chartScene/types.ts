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
  /**
   * Bodies connected to the controlled selection. In isolated-selection
   * mode they remain visible as secondary context while unrelated bodies
   * recede almost completely.
   */
  relatedBodies?: string[]
  /** use selected → related → suppressed marker hierarchy */
  isolateSelection?: boolean
  /** optional interaction for selecting a rendered aspect line */
  onSelectAspect?: (aspect: Aspect) => void
  /** pointer enters/leaves a rendered aspect line */
  onHoverAspect?: (aspect: Aspect | null) => void
  /** emphasis for the secondary (partner) ring, same semantics */
  highlightSecondaryBodies?: string[]
  /**
   * 0..1: the secondary ring's arrival — 0 gathers the partner's
   * planets at the center (hidden), 1 seats them on the synastry ring.
   * Markers glide via their own damping; cross lines appear late.
   */
  secondaryBlend?: number
  /**
   * relationship mode: the two-wheel choreography (side-by-side wheels
   * → concentric synastry → composite collapse). Replaces the natal /
   * secondary layers entirely while present.
   */
  relationship?: {
    a: Placement[]
    b: Placement[]
    nameA: string
    nameB: string
    colorA?: string
    colorB?: string
    blend: number
    comp: number
    compositePlacements?: Placement[]
    compositeAspects?: Aspect[]
    synastryAspects?: Aspect[]
    highlightA?: string[]
    highlightB?: string[]
    onHoverBody?: (p: Placement | null, side: 'a' | 'b') => void
    onSelectBody?: (p: Placement, side: 'a' | 'b') => void
  }
  /** frame the wheel straight-down (margin/preview mounts) */
  topDown?: boolean
  /**
   * pixels of the canvas covered by docked UI on the right; the scene
   * recenters in the remaining space (animated)
   */
  coveredRightPx?: number
  /**
   * orbit-camera mounts: fit this world radius into the uncovered area
   * on mount/resize/panel-toggle (e.g. 6.4 = wheel + transit ring)
   */
  fitRadius?: number
  /** bump to re-run the OrbitFit framing (a "recenter" control) */
  fitNonce?: number
  /** scroll-narrative mounts: the wheel belongs to the page, not the camera */
  disableZoom?: boolean
  /**
   * Scene clear color. Defaults to parchment; themed mounts may pass a
   * matching paper tone of their own.
   */
  background?: string
  /** retained compatibility hook; ink is the only scene palette */
  theme?: 'ink'
  /**
   * stop the render loop entirely (frameloop "never") — for mounts that
   * hide the scene with CSS while it stays mounted; a hidden WebGL
   * canvas otherwise keeps burning GPU/CPU every frame
   */
  paused?: boolean
  /** pointer enters/leaves a planet marker (null on leave) */
  onHoverBody?: (hover: BodySelection | null) => void
  /** planet selected/deselected (click marker / click empty space) */
  onSelectBody?: (selection: BodySelection | null) => void
  /**
   * controlled selection: when present (including null), the host owns
   * the selected body — clicks only report through onSelectBody and the
   * scene renders whatever the host passes back. Omit for the default
   * uncontrolled behavior (the scene keeps its own selection state).
   * `longitude` is not used for focus matching; pass 0 if unknown.
   */
  selectedBody?: BodySelection | null
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
  /**
   * linear orb→opacity ramp for transit lines (focused/filtered views)
   * instead of the squared de-clutter ramp used for the full sky
   */
  transitLineBoost?: boolean
}
