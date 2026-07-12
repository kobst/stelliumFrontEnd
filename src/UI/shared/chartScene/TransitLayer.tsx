import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { Line2 } from 'three-stdlib'
import { PlanetMarker } from './PlanetMarker'
import { OrbitRings } from './OrbitRings'
import {
  dampFactor,
  frameSpan,
  lerpAngle,
  longitudeToPosition,
} from './utils'
import {
  ASPECT_COLORS,
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
      color={ASPECT_COLORS[aspect.type]}
      lineWidth={lineWidth}
      transparent
      opacity={initialOpacity.current}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      onClick={onSelect ? (event) => {
        event.stopPropagation()
        onSelect(aspect)
      } : undefined}
    />
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

      {tracks.map((track) => {
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
        return (
          <TransitAspectLine
            key={trackKey(track.aspect)}
            aspect={track.aspect}
            from={longitudeToPosition(transitLon, TRANSIT_PLANET_RADIUS)}
            to={longitudeToPosition(natal.longitude, NATAL_PLANET_RADIUS)}
            targetOpacity={targetOpacity}
            lineWidth={1 + weight * 2.5}
            onSelect={onSelectAspect}
          />
        )
      })}
    </group>
  )
}
