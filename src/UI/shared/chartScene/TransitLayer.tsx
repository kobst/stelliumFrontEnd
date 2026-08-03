import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { Line2 } from 'three-stdlib'
import { PlanetMarker } from './PlanetMarker'
import { useScenePalette } from './sceneTheme'
import { OrbitRings } from './OrbitRings'
import {
  dampFactor,
  frameSpan,
  lerpAngle,
  longitudeToPosition,
} from './utils'
import {
  ASPECT_MAX_ORB,
  NATAL_PLANET_RADIUS,
  TRANSIT_PLANET_RADIUS,
} from './constants'
import type {
  Aspect,
  BodySelection,
  Placement,
  TransitFrame,
} from './types'
import type { MarkerState } from './PlanetMarker'

const transitRingRadii = [TRANSIT_PLANET_RADIUS]

/**
 * An aspect's identity across frames. Orbs are sampled per frame
 * (null = not within orb that frame), so a line's strength at any
 * scrub position comes from interpolating the track — its lifecycle
 * (fade in → exact → fade out) is continuous in time, never a
 * per-frame visibility toggle.
 */
interface AspectTrack {
  aspect: Aspect
  orbs: (number | null)[]
}

function trackKey(a: Aspect): string {
  return `${a.bodyA}-${a.type}-${a.bodyB}`
}

function buildAspectTracks(frames: TransitFrame[]): AspectTrack[] {
  const tracks = new Map<string, AspectTrack>()
  frames.forEach((frame, i) => {
    for (const aspect of frame.aspects) {
      const key = trackKey(aspect)
      let track = tracks.get(key)
      if (!track) {
        track = { aspect, orbs: new Array<number | null>(frames.length).fill(null) }
        tracks.set(key, track)
      }
      track.orbs[i] = aspect.orb
    }
  })
  return [...tracks.values()]
}

/**
 * Orb at an interpolated position. A null neighbor means the aspect is
 * forming/separating across that boundary — treat it as slightly past
 * max orb so strength reaches zero *before* the track ends and the
 * line never pops.
 */
function trackOrbAt(track: AspectTrack, index: number, frac: number): number | null {
  const a = track.orbs[index]
  const b = track.orbs[Math.min(index + 1, track.orbs.length - 1)]
  if (a === null && b === null) return null
  const edge = ASPECT_MAX_ORB[track.aspect.type] * 1.15
  const from = a ?? edge
  const to = b ?? edge
  return from + (to - from) * frac
}

interface TransitAspectLineProps {
  aspect: Aspect
  from: THREE.Vector3
  to: THREE.Vector3
  targetOpacity: number
  lineWidth: number
  onSelect?: (aspect: Aspect) => void
}

function TransitAspectLine({
  aspect,
  from,
  to,
  targetOpacity,
  lineWidth,
  onSelect,
}: TransitAspectLineProps) {
  const palette = useScenePalette()
  const lineRef = useRef<Line2>(null)
  const initialOpacity = useRef(0) // always fades in from nothing

  useFrame((_, delta) => {
    const mat = lineRef.current?.material
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={palette.aspectColor(aspect.type)}
      lineWidth={lineWidth}
      transparent
      opacity={initialOpacity.current}
      depthWrite={false}
      blending={THREE.NormalBlending}
      onClick={onSelect ? (event) => {
        event.stopPropagation()
        onSelect(aspect)
      } : undefined}
    />
  )
}

interface TransitLeaderLineProps {
  from: THREE.Vector3
  to: THREE.Vector3
  targetOpacity: number
}

/** Dashed radial connector from a transiting body down to the aspect circle.
 *  Radial by construction, so it cannot misstate the longitude. */
function TransitLeaderLine({ from, to, targetOpacity }: TransitLeaderLineProps) {
  const palette = useScenePalette()
  const lineRef = useRef<Line2>(null)
  const initialOpacity = useRef(0)

  useFrame((_, delta) => {
    const mat = lineRef.current?.material
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={palette.leader}
      lineWidth={1}
      dashed
      dashSize={0.12}
      gapSize={0.09}
      transparent
      opacity={initialOpacity.current}
      depthWrite={false}
    />
  )
}

interface AspectEndpointDotProps {
  position: THREE.Vector3
  targetOpacity: number
}

/** Small filled dot anchoring a chord endpoint on the shared aspect circle. */
function AspectEndpointDot({ position, targetOpacity }: AspectEndpointDotProps) {
  const palette = useScenePalette()
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((_, delta) => {
    const mat = materialRef.current
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[palette.endpointDotRadius, 20]} />
      <meshBasicMaterial
        ref={materialRef}
        color={palette.endpointDot}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  )
}

interface TransitLayerProps {
  frames: TransitFrame[]
  /** ISO date; clamped to the frame range */
  date?: string
  natalPlacements: Placement[]
  visible: boolean
  /** bodies whose aspect lines render; undefined = all */
  aspectBodies?: string[]
  /** linear ramp (focused views) instead of the squared de-clutter ramp */
  lineBoost?: boolean
  /** selected body anywhere in the scene */
  focus?: BodySelection | null
  markerStateFor?: (body: string) => MarkerState
  onHoverBody?: (placement: Placement | null) => void
  onSelectBody?: (placement: Placement) => void
  onSelectAspect?: (aspect: Aspect) => void
}

/**
 * Transiting planets as a moving layer just outside the zodiac band,
 * over the fixed natal wheel. Positions interpolate between frames
 * (shortest-arc, so 360°→0° wraps correctly); transit→natal aspect
 * lines derive their lifecycle from orb tracks across frames.
 */
export function TransitLayer({
  frames,
  date,
  natalPlacements,
  visible,
  aspectBodies,
  lineBoost = false,
  focus = null,
  markerStateFor,
  onHoverBody,
  onSelectBody,
  onSelectAspect,
}: TransitLayerProps) {
  const palette = useScenePalette()
  const enabledBodies = useMemo(
    () => (aspectBodies ? new Set(aspectBodies) : null),
    [aspectBodies],
  )
  const times = useMemo(() => frames.map((f) => Date.parse(f.date)), [frames])
  const tracks = useMemo(() => buildAspectTracks(frames), [frames])
  const natalByBody = useMemo(
    () => new Map(natalPlacements.map((p) => [p.body, p])),
    [natalPlacements],
  )

  if (frames.length === 0) return null

  const timeMs = date ? Date.parse(date) : times[0]
  const { index, frac } = frameSpan(times, timeMs)
  const frameA = frames[index]
  const frameB = frames[Math.min(index + 1, frames.length - 1)]
  const byBodyB = new Map(frameB.placements.map((p) => [p.body, p]))

  // interpolated transiting placements (shortest arc)
  const placements: Placement[] = frameA.placements.map((pa) => {
    const pb = byBodyB.get(pa.body)
    return pb
      ? { ...pa, longitude: lerpAngle(pa.longitude, pb.longitude, frac) }
      : pa
  })
  const transitLonByBody = new Map(placements.map((p) => [p.body, p.longitude]))

  return (
    <group>
      <OrbitRings radii={transitRingRadii} visible={visible} />

      {placements.map((p) => (
        <PlanetMarker
          key={`transit-${p.body}`}
          placement={p}
          radius={TRANSIT_PLANET_RADIUS}
          sizeScale={0.7}
          hidden={!visible}
          state={markerStateFor?.(p.body) ?? 'normal'}
          onHover={onHoverBody}
          onSelect={onSelectBody}
        />
      ))}

      {(() => {
        const chords = tracks
          .map((track) => {
            const orb = trackOrbAt(track, index, frac)
            if (orb === null) return null
            const maxOrb = ASPECT_MAX_ORB[track.aspect.type]
            const strength = Math.min(1, Math.max(0, 1 - orb / maxOrb))
            // squared ramp de-clutters the full sky; focused views use the
            // honest linear ramp so anything in orb is actually visible
            const weight = lineBoost ? strength : strength * strength
            const transitLon = transitLonByBody.get(track.aspect.bodyA)
            const natal = natalByBody.get(track.aspect.bodyB)
            if (transitLon === undefined || !natal) return null
            const enabled = !enabledBodies || enabledBodies.has(track.aspect.bodyA)
            // transit lines run transit body (bodyA) → natal body (bodyB)
            const involved =
              !!focus &&
              ((focus.layer === 'transit' && focus.body === track.aspect.bodyA) ||
                (focus.layer === 'natal' && focus.body === track.aspect.bodyB))
            const baseOpacity = weight * 0.85
            const targetOpacity = !(visible && enabled)
              ? 0
              : focus
                ? involved
                  ? Math.min(0.95, baseOpacity + 0.3)
                  : 0.03
                : baseOpacity
            return { track, transitLon, natalLon: natal.longitude, weight, targetOpacity }
          })
          .filter((chord): chord is NonNullable<typeof chord> => chord !== null)

        // One dashed leader per transiting body and one dot per projected
        // endpoint, each following the strongest opacity among its chords so a
        // filtered/dimmed unit fades as one.
        const leaderByBody = new Map<string, { lon: number; opacity: number }>()
        const dotByKey = new Map<string, { lon: number; opacity: number }>()
        for (const chord of chords) {
          const leader = leaderByBody.get(chord.track.aspect.bodyA)
          if (!leader || chord.targetOpacity > leader.opacity) {
            leaderByBody.set(chord.track.aspect.bodyA, { lon: chord.transitLon, opacity: chord.targetOpacity })
          }
          for (const [key, lon] of [
            [`t-${chord.track.aspect.bodyA}`, chord.transitLon],
            [`n-${chord.track.aspect.bodyB}`, chord.natalLon],
          ] as Array<[string, number]>) {
            const dot = dotByKey.get(key)
            if (!dot || chord.targetOpacity > dot.opacity) {
              dotByKey.set(key, { lon, opacity: chord.targetOpacity })
            }
          }
        }

        return (
          <>
            {chords.map((chord) => (
              <TransitAspectLine
                key={trackKey(chord.track.aspect)}
                aspect={chord.track.aspect}
                from={longitudeToPosition(chord.transitLon, NATAL_PLANET_RADIUS)}
                to={longitudeToPosition(chord.natalLon, NATAL_PLANET_RADIUS)}
                targetOpacity={chord.targetOpacity}
                lineWidth={1 + chord.weight * 2.5}
                onSelect={onSelectAspect}
              />
            ))}
            {[...leaderByBody.entries()].map(([body, leader]) => (
              <TransitLeaderLine
                key={`leader-${body}`}
                from={longitudeToPosition(leader.lon, TRANSIT_PLANET_RADIUS - 0.15)}
                to={longitudeToPosition(leader.lon, NATAL_PLANET_RADIUS)}
                targetOpacity={leader.opacity * palette.leaderOpacity}
              />
            ))}
            {[...dotByKey.entries()].map(([key, dot]) => (
              <AspectEndpointDot
                key={`dot-${key}`}
                position={longitudeToPosition(dot.lon, NATAL_PLANET_RADIUS, 0.02)}
                targetOpacity={Math.min(1, dot.opacity * 1.1)}
              />
            ))}
          </>
        )
      })()}
    </group>
  )
}
