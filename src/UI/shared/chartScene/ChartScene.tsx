import { useCallback, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { ZodiacWheel } from './ZodiacWheel'
import { OrbitRings } from './OrbitRings'
import { AspectLines } from './AspectLines'
import { TransitLayer } from './TransitLayer'
import { AngleMarker, PlanetMarker } from './PlanetMarker'
import type { MarkerState } from './PlanetMarker'
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

/**
 * Self-contained 3D chart renderer. Chart layers are derived from which
 * props are present: natal only = birth chart; + secondary = synastry
 * (Phase 3); + transitFrames = transit animation (Phase 4). The `mode`
 * prop picks the geometry: geocentric wheel or heliocentric orbits.
 */
export function ChartScene({
  natal,
  natalAspects,
  secondary,
  secondaryAspects,
  transitFrames,
  transitDate,
  transitAspectBodies,
  heliocentric,
  mode = 'wheel',
  onHoverBody,
  onSelectBody,
}: ChartSceneProps) {
  const planets = natal.filter((p) => !(p.body in ANGLES))
  const angles = natal.filter((p) => p.body in ANGLES)

  // synastry partner layer — inner ring; angles don't render there
  const secondaryPlanets = (secondary ?? []).filter((p) => !(p.body in ANGLES))

  // heliocentric mode needs its own placement set; fall back to the wheel
  const helioMode = mode === 'heliocentric' && !!heliocentric?.length
  // the synastry layer is geocentric; it hides in heliocentric mode
  const synastryVisible = secondaryPlanets.length > 0 && !helioMode

  // ── hover / selection ──────────────────────────────────────────────
  const [selection, setSelection] = useState<BodySelection | null>(null)
  const [hovered, setHovered] = useState<BodySelection | null>(null)

  const select = useCallback(
    (next: BodySelection | null) => {
      // clicking the selected body again deselects
      setSelection((prev) => {
        const resolved =
          next && prev && prev.body === next.body && prev.layer === next.layer
            ? null
            : next
        onSelectBody?.(resolved)
        return resolved
      })
    },
    [onSelectBody],
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

  const stateFor = (body: string, layer: SelectionLayer): MarkerState => {
    const matches = (s: BodySelection | null) =>
      !!s && s.body === body && s.layer === layer
    if (matches(selection) || matches(hovered)) return 'active'
    if (selection) return 'muted'
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
    : planets.map((p) => ({ placement: p, radius: NATAL_PLANET_RADIUS }))

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
      camera={{ position: [0, 7.5, 9], fov: 45 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#030308']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 6, 0]} intensity={20} color="#8888ff" />

      <Stars radius={60} depth={40} count={3000} factor={3} saturation={0.4} fade speed={0.4} />

      <ZodiacWheel dimmed={helioMode} />
      <OrbitRings radii={orbitRadii} visible={helioMode} />

      {/* natal web hides entirely while the transit layer has the view */}
      <AspectLines
        aspects={natalAspects}
        natal={{ placements: planets, radius: NATAL_PLANET_RADIUS }}
        visible={!helioMode && !transitFrames?.length}
        focus={selection}
      />

      {markers.map(({ placement, radius }) => (
        <PlanetMarker
          key={placement.body}
          placement={placement}
          radius={radius}
          state={stateFor(placement.body, 'natal')}
          onHover={natalHandlers.onHover}
          onSelect={natalHandlers.onSelect}
        />
      ))}
      {!helioMode &&
        angles.map((p) => <AngleMarker key={p.body} placement={p} />)}

      {/* transit layer: moving sky over the fixed natal wheel (Phase 4);
          geocentric, so it hides in heliocentric mode */}
      {!!transitFrames?.length && (
        <TransitLayer
          frames={transitFrames}
          date={transitDate}
          natalPlacements={planets}
          visible={!helioMode}
          aspectBodies={transitAspectBodies}
          focus={selection}
          markerStateFor={(body) => stateFor(body, 'transit')}
          onHoverBody={transitHandlers.onHover}
          onSelectBody={transitHandlers.onSelect}
        />
      )}

      {/* synastry: partner chart on an inner concentric ring, with
          emphasized inter-chart aspect lines — the point of this view */}
      {secondaryPlanets.length > 0 && (
        <>
          <OrbitRings
            radii={secondaryRingRadii}
            visible={synastryVisible}
          />
          {secondaryPlanets.map((p) => (
            <PlanetMarker
              key={`secondary-${p.body}`}
              placement={p}
              radius={SECONDARY_PLANET_RADIUS}
              sizeScale={0.8}
              hidden={!synastryVisible}
              state={stateFor(p.body, 'secondary')}
              onHover={secondaryHandlers.onHover}
              onSelect={secondaryHandlers.onSelect}
            />
          ))}
          <AspectLines
            aspects={secondaryAspects ?? []}
            natal={{ placements: planets, radius: NATAL_PLANET_RADIUS }}
            secondary={{
              placements: secondaryPlanets,
              radius: SECONDARY_PLANET_RADIUS,
            }}
            defaultLayers={['natal', 'secondary']}
            visible={synastryVisible}
            emphasized
            focus={selection}
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
        minDistance={4}
        maxDistance={25}
        maxPolarAngle={Math.PI * 0.85}
        makeDefault
      />
    </Canvas>
  )
}
