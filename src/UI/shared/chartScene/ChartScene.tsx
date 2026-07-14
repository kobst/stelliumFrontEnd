import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { ZodiacWheel } from './ZodiacWheel'
import { OrbitRings } from './OrbitRings'
import { AspectLines } from './AspectLines'
import { TransitLayer } from './TransitLayer'
import { AngleMarker, PlanetMarker } from './PlanetMarker'
import { RelationshipLayer } from './RelationshipLayer'
import type { MarkerState } from './PlanetMarker'
import { dampFactor, spreadPlacements } from './utils'
import {
  ANGLES,
  HELIO_ORBIT_RADII,
  NATAL_PLANET_RADIUS,
  SECONDARY_PLANET_RADIUS,
} from './constants'
import type {
  BodySelection,
  ChartSceneProps,
  Placement,
  SelectionLayer,
} from './types'

// stable singleton so the synastry OrbitRings geometry never rebuilds
const secondaryRingRadii = [SECONDARY_PLANET_RADIUS]
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Shifts the projection center left by half the covered width, so the
 * chart frames itself in the space docked UI leaves open. Damped, so
 * panel toggles glide instead of snapping.
 */
function ViewOffset({ coveredRightPx }: { coveredRightPx: number }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const current = useRef(0)
  useFrame((_, delta) => {
    const target = coveredRightPx / 2
    current.current += (target - current.current) * dampFactor(delta)
    if (target === 0 && Math.abs(current.current) < 0.5) {
      current.current = 0
      camera.clearViewOffset()
      return
    }
    camera.setViewOffset(size.width, size.height, current.current, 0, size.width, size.height)
  })
  useEffect(() => {
    const cam = camera
    return () => cam.clearViewOffset()
  }, [camera])
  return null
}

// direction of the default orbit camera [0, 7.5, 9], normalized
const ORBIT_DIR = { y: 0.6402, z: 0.7682 }

/**
 * Applies pause/resume through the store: setFrameloop restarts the
 * render loop on resume, which the Canvas frameloop prop alone doesn't.
 */
function FrameloopSync({ paused }: { paused: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    setFrameloop(paused ? 'never' : 'always')
  }, [paused, setFrameloop])
  return null
}

/**
 * Fits `fitRadius` world units into the *uncovered* part of the canvas
 * along the default orbit direction. Reapplies on resize and panel
 * toggles; the user's own orbiting takes over between refits.
 */
function OrbitFit({ fitRadius, coveredRightPx, fitNonce = 0 }: { fitRadius: number; coveredRightPx: number; fitNonce?: number }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useEffect(() => {
    const halfV = Math.tan((45 * Math.PI) / 360)
    const effWidth = Math.max(200, size.width - Math.abs(coveredRightPx))
    const effAspect = effWidth / Math.max(1, size.height)
    const dist = fitRadius / (halfV * Math.min(1, effAspect))
    camera.position.set(0, ORBIT_DIR.y * dist, ORBIT_DIR.z * dist)
    camera.lookAt(0, 0, 0)
  }, [camera, size, fitRadius, coveredRightPx, fitNonce])
  return null
}

/**
 * Straight-down framing that adapts to the container: refits the camera
 * whenever the canvas resizes (margin card and expanded takeover both
 * frame correctly). Keeps ~0.6 units of vertical breathing room and
 * never crops the wheel horizontally.
 */
function TopDownFit() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useEffect(() => {
    const halfV = Math.tan((45 * Math.PI) / 360)
    const aspect = size.width / Math.max(1, size.height)
    const dist = Math.max(5.6, 5.1 / aspect) / halfV
    camera.position.set(0, dist, dist * 0.04)
    camera.lookAt(0, 0, 0)
  }, [camera, size])
  return null
}

/**
 * Self-contained 3D chart renderer. Chart layers are derived from which
 * props are present: natal only = birth chart; + secondary = synastry
 * (Phase 3); + transitFrames = transit animation (Phase 4). The `mode`
 * prop picks the geometry: geocentric wheel or heliocentric orbits.
 * Memoized: hosts re-render on scroll state, the canvas shouldn't.
 */
function ChartSceneImpl({
  natal,
  natalAspects,
  secondary,
  secondaryAspects,
  transitFrames,
  transitDate,
  transitAspectBodies,
  transitLineBoost = false,
  heliocentric,
  mode = 'wheel',
  highlightBodies,
  relatedBodies,
  isolateSelection = false,
  highlightSecondaryBodies,
  secondaryBlend = 1,
  relationship,
  selectedBody,
  topDown = false,
  coveredRightPx = 0,
  fitRadius,
  fitNonce = 0,
  disableZoom = false,
  paused = false,
  onHoverBody,
  onSelectBody,
  onSelectAspect,
  onHoverAspect,
}: ChartSceneProps) {
  const planets = useMemo(() => natal.filter((p) => !(p.body in ANGLES)), [natal])
  const angles = useMemo(() => natal.filter((p) => p.body in ANGLES), [natal])

  // stelliums fan out for display so markers stay distinct and
  // clickable; lines/transits resolve against the same displayed
  // positions so everything stays attached
  const displayPlanets = useMemo(() => spreadPlacements(planets, 5), [planets])
  const lineEndpoints = useMemo(
    () => [...displayPlanets, ...angles],
    [displayPlanets, angles],
  )

  // synastry partner layer — inner ring; angles don't render there
  const secondaryPlanets = (secondary ?? []).filter((p) => !(p.body in ANGLES))

  // heliocentric mode needs its own placement set; fall back to the wheel
  const helioMode = mode === 'heliocentric' && !!heliocentric?.length
  // the synastry layer is geocentric; it hides in heliocentric mode
  const synastryVisible = secondaryPlanets.length > 0 && !helioMode

  // ── hover / selection ──────────────────────────────────────────────
  // controlled when `selectedBody` is present (including null): clicks
  // only report through onSelectBody and the host passes the state back
  const controlled = selectedBody !== undefined
  const [internalSelection, setInternalSelection] = useState<BodySelection | null>(null)
  const selection = controlled ? (selectedBody ?? null) : internalSelection
  const [hovered, setHovered] = useState<BodySelection | null>(null)

  const select = useCallback(
    (next: BodySelection | null) => {
      // clicking the selected body again deselects
      const toggle = (prev: BodySelection | null) =>
        next && prev && prev.body === next.body && prev.layer === next.layer
          ? null
          : next
      if (controlled) {
        onSelectBody?.(toggle(selectedBody ?? null))
        return
      }
      setInternalSelection((prev) => {
        const resolved = toggle(prev)
        onSelectBody?.(resolved)
        return resolved
      })
    },
    [controlled, selectedBody, onSelectBody],
  )

  const hover = useCallback(
    (next: BodySelection | null) => {
      setHovered(next)
      onHoverBody?.(next)
    },
    [onHoverBody],
  )

  // per-layer handler factories so markers report which layer they're in
  const handlersFor = (layer: SelectionLayer) => ({
    onHover: (p: Placement | null) =>
      hover(p ? { body: p.body, layer, longitude: p.longitude, retrograde: p.retrograde } : null),
    onSelect: (p: Placement) =>
      select({ body: p.body, layer, longitude: p.longitude, retrograde: p.retrograde }),
  })

  // external emphasis (chapter being read); internal interaction wins
  // small top-down mounts need bigger glyphs to stay legible
  const glyphScale = topDown ? 1.6 : 1

  const highlightSet = useMemo(
    () => (highlightBodies?.length ? new Set(highlightBodies) : null),
    [highlightBodies],
  )

  const relatedSet = useMemo(
    () => (relatedBodies?.length ? new Set(relatedBodies) : null),
    [relatedBodies],
  )

  const isolatedAspectBodies = useMemo(() => {
    if (!isolateSelection || !selection) return undefined
    if (
      hovered &&
      hovered.layer === selection.layer &&
      hovered.body !== selection.body
    ) {
      return [selection.body, hovered.body]
    }
    if (
      highlightBodies?.length &&
      highlightBodies.length > 1 &&
      highlightBodies.includes(selection.body)
    ) {
      return highlightBodies
    }
    return [selection.body]
  }, [highlightBodies, hovered, isolateSelection, selection])

  const transitFilterSet = useMemo(
    () => (transitAspectBodies ? new Set(transitAspectBodies) : null),
    [transitAspectBodies],
  )

  const secondaryHighlightSet = useMemo(
    () => (highlightSecondaryBodies?.length ? new Set(highlightSecondaryBodies) : null),
    [highlightSecondaryBodies],
  )

  const stateFor = (body: string, layer: SelectionLayer): MarkerState => {
    const matches = (s: BodySelection | null) =>
      !!s && s.body === body && s.layer === layer
    if (matches(selection) || matches(hovered)) return 'active'
    if (selection) {
      if (isolateSelection && layer === selection.layer) {
        if (highlightSet?.has(body)) return 'active'
        if (relatedSet?.has(body)) return 'related'
        return 'suppressed'
      }
      return 'muted'
    }
    if (highlightSet && layer === 'natal') {
      return highlightSet.has(body) ? 'active' : 'muted'
    }
    if (secondaryHighlightSet && layer === 'secondary') {
      return secondaryHighlightSet.has(body) ? 'active' : 'muted'
    }
    // when only the other layer is emphasized, this one recedes
    if (layer === 'natal' && secondaryHighlightSet && !highlightSet) return 'muted'
    if (layer === 'secondary' && highlightSet && !secondaryHighlightSet) return 'muted'
    return 'normal'
  }

  const natalHandlers = handlersFor('natal')
  const secondaryHandlers = handlersFor('secondary')
  const transitHandlers = handlersFor('transit')

  // markers keyed by body, so bodies present in both sets (mercury…pluto)
  // glide between their geocentric and heliocentric positions. The sun
  // stays mounted and glides to radius 0 — the center of the system.
  const sun = planets.find((p) => p.body === 'sun')
  const markers: { placement: Placement; radius: number }[] = helioMode
    ? [
        ...heliocentric.map((p) => ({
          placement: p,
          radius: HELIO_ORBIT_RADII[p.body] ?? NATAL_PLANET_RADIUS,
        })),
        ...(sun ? [{ placement: sun, radius: 0 }] : []),
      ]
    : displayPlanets.map((p) => ({ placement: p, radius: NATAL_PLANET_RADIUS }))

  // stable identity so OrbitRings doesn't rebuild geometry on mode toggles
  const orbitRadii = useMemo(
    () =>
      (heliocentric ?? [])
        .map((p) => HELIO_ORBIT_RADII[p.body])
        .filter((r): r is number => r !== undefined),
    [heliocentric],
  )

  return (
    <Canvas
      camera={{ position: topDown ? [0, 12.2, 0.5] : [0, 7.5, 9], fov: 45 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      frameloop={paused ? 'never' : 'always'}
      onPointerMissed={() => select(null)}
    >
      <FrameloopSync paused={paused} />
      {topDown && <TopDownFit />}
      {!topDown && fitRadius ? <OrbitFit fitRadius={fitRadius} coveredRightPx={coveredRightPx} fitNonce={fitNonce} /> : null}
      <ViewOffset coveredRightPx={coveredRightPx} />
      <color attach="background" args={['#030308']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 6, 0]} intensity={20} color="#8888ff" />

      <Stars radius={60} depth={40} count={3000} factor={3} saturation={0.4} fade speed={0.4} />

      <ZodiacWheel
        dimmed={helioMode}
        glyphScale={glyphScale}
        visible={!relationship || relationship.blend > 0.5}
      />
      <OrbitRings radii={orbitRadii} visible={helioMode} />

      {/* natal web hides entirely while the transit layer has the view.
          Angles are included as endpoints: aspects to asc/mc are real
          data and draw toward the angle's axis on the planet ring. */}
      <AspectLines
        aspects={natalAspects}
        natal={{ placements: lineEndpoints, radius: NATAL_PLANET_RADIUS }}
        visible={!helioMode && !transitFrames?.length && !relationship}
        focus={selection}
        highlightBodies={highlightBodies}
        isolateBodies={isolatedAspectBodies}
        onSelectAspect={onSelectAspect}
        onHoverAspect={onHoverAspect}
      />

      {!relationship && markers.map(({ placement, radius }) => (
        <PlanetMarker
          key={placement.body}
          placement={placement}
          radius={radius}
          glyphScale={glyphScale}
          state={stateFor(placement.body, 'natal')}
          onHover={natalHandlers.onHover}
          onSelect={natalHandlers.onSelect}
        />
      ))}
      {!helioMode && !relationship &&
        angles.map((p) => (
          <AngleMarker
            key={p.body}
            placement={p}
            state={stateFor(p.body, 'natal')}
            onHover={natalHandlers.onHover}
            onSelect={natalHandlers.onSelect}
          />
        ))}

      {/* transit layer: moving sky over the fixed natal wheel (Phase 4);
          geocentric, so it hides in heliocentric mode */}
      {!!transitFrames?.length && (
        <TransitLayer
          frames={transitFrames}
          date={transitDate}
          natalPlacements={displayPlanets}
          visible={!helioMode}
          aspectBodies={transitAspectBodies}
          lineBoost={transitLineBoost}
          focus={selection}
          markerStateFor={(body) => {
            const base = stateFor(body, 'transit')
            if (base !== 'normal') return base
            return transitFilterSet && !transitFilterSet.has(body) ? 'muted' : 'normal'
          }}
          onHoverBody={transitHandlers.onHover}
          onSelectBody={transitHandlers.onSelect}
          onSelectAspect={onSelectAspect}
        />
      )}

      {/* synastry: partner chart on an inner concentric ring, with
          emphasized inter-chart aspect lines — the point of this view */}
      {secondaryPlanets.length > 0 && (
        <>
          <OrbitRings
            radii={secondaryRingRadii}
            visible={synastryVisible && clamp01(secondaryBlend) > 0.96}
          />
          {secondaryPlanets.map((p) => (
            <PlanetMarker
              key={`secondary-${p.body}`}
              placement={p}
              radius={SECONDARY_PLANET_RADIUS * clamp01(secondaryBlend)}
              glyphScale={glyphScale}
              sizeScale={0.8}
              hidden={!synastryVisible || clamp01(secondaryBlend) < 0.04}
              state={stateFor(p.body, 'secondary')}
              onHover={secondaryHandlers.onHover}
              onSelect={secondaryHandlers.onSelect}
            />
          ))}
          <AspectLines
            aspects={secondaryAspects ?? []}
            natal={{ placements: displayPlanets, radius: NATAL_PLANET_RADIUS }}
            secondary={{
              placements: secondaryPlanets,
              radius: SECONDARY_PLANET_RADIUS * clamp01(secondaryBlend),
            }}
            defaultLayers={['natal', 'secondary']}
            visible={synastryVisible && clamp01(secondaryBlend) > 0.65}
            emphasized
            focus={selection}
            highlightBodies={highlightBodies || highlightSecondaryBodies ? [
              ...(highlightBodies ?? []),
              ...(highlightSecondaryBodies ?? []),
            ] : undefined}
          />
        </>
      )}

      {relationship && (
        <>
          <RelationshipLayer {...relationship} />
          {/* synastry cross lines: alive once merged, gone in composite */}
          <AspectLines
            aspects={relationship.synastryAspects ?? []}
            natal={{ placements: relationship.a, radius: NATAL_PLANET_RADIUS }}
            secondary={{ placements: relationship.b, radius: SECONDARY_PLANET_RADIUS }}
            defaultLayers={['natal', 'secondary']}
            visible={relationship.blend > 0.75 && relationship.comp < 0.35}
            emphasized
            focus={selection}
            highlightBodies={
              relationship.highlightA || relationship.highlightB
                ? [...(relationship.highlightA ?? []), ...(relationship.highlightB ?? [])]
                : undefined
            }
            onSelectAspect={onSelectAspect}
          />
          {/* composite web: the relationship's own aspects */}
          <AspectLines
            aspects={relationship.compositeAspects ?? []}
            natal={{
              placements: relationship.compositePlacements ?? [],
              radius: NATAL_PLANET_RADIUS,
            }}
            visible={relationship.comp > 0.6}
            focus={selection}
            highlightBodies={relationship.highlightA}
            onSelectAspect={onSelectAspect}
          />
        </>
      )}

      <EffectComposer>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        enableZoom={!disableZoom}
        minDistance={4}
        maxDistance={25}
        maxPolarAngle={Math.PI * 0.85}
        makeDefault
      />
    </Canvas>
  )
}

export const ChartScene = memo(ChartSceneImpl)
