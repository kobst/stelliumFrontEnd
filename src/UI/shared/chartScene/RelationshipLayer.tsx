import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PlanetMarker } from './PlanetMarker'
import type { MarkerState } from './PlanetMarker'
import { OrbitRings } from './OrbitRings'
import { lerpAngle, dampFactor } from './utils'
import { NATAL_PLANET_RADIUS, TRANSIT_PLANET_RADIUS } from './constants'
import type { Placement } from './types'

// two-wheel layout (ratios from the design mock, scaled to scene units)
export const PAIR_X = 6.5 // side-by-side wheel centers at ±x
export const PAIR_R = 3.8 // each partner wheel's planet radius
const PAIR_RING_R = PAIR_R + 0.55
const pairRingRadii = [PAIR_RING_R]
const MERGED_A_R = NATAL_PLANET_RADIUS // partner A → natal ring
const MERGED_B_R = TRANSIT_PLANET_RADIUS // partner B → transit ring
const COMPOSITE_R = NATAL_PLANET_RADIUS

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

/** letterspaced partner name floating behind a wheel while separated */
function NameSprite({
  text,
  color,
  opacity,
  position,
}: {
  text: string
  color: string
  opacity: number
  position: [number, number, number]
}) {
  const matRef = useRef<THREE.SpriteMaterial>(null)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 40px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.toUpperCase().split('').join('  '), 256, 48)
    const t = new THREE.CanvasTexture(canvas)
    t.anisotropy = 4
    return t
  }, [text])
  useFrame((_, delta) => {
    const mat = matRef.current
    if (mat) mat.opacity += (opacity - mat.opacity) * dampFactor(delta)
  })
  return (
    <sprite position={position} scale={[5.2, 0.98, 1]}>
      <spriteMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        color={color}
      />
    </sprite>
  )
}

export interface RelationshipLayerProps {
  a: Placement[]
  b: Placement[]
  nameA: string
  nameB: string
  colorA?: string
  colorB?: string
  /** 0 = two separate wheels · 1 = concentric synastry */
  blend: number
  /** 0 = synastry · 1 = pairs collapsed to the composite */
  comp: number
  /** composite chart longitudes (fallback: circular midpoints) */
  compositePlacements?: Placement[]
  highlightA?: string[]
  highlightB?: string[]
  /** enlarges glyphs for small/top-down mounts (matches ChartScene) */
  glyphScale?: number
  onHoverBody?: (p: Placement | null, side: 'a' | 'b') => void
  onSelectBody?: (p: Placement, side: 'a' | 'b') => void
}

/**
 * The relationship choreography, verbatim from the design mock: at
 * blend 0 the two charts are full wheels side by side, each ringed in
 * its partner's color with a name floating behind it. Scroll drives
 * blend → the wheels glide together, A settling on the natal ring and
 * B on the transit's outer ring. Comp then collapses every same-name
 * pair toward its midpoint (the composite's real longitudes when
 * supplied): A's copy carries the merged identity, B's fades out en route.
 */
export function RelationshipLayer({
  a,
  b,
  nameA,
  nameB,
  colorA = '#39445a',
  colorB = '#3437a8',
  blend,
  comp,
  compositePlacements,
  highlightA,
  highlightB,
  glyphScale = 1,
  onHoverBody,
  onSelectBody,
}: RelationshipLayerProps) {
  const eb = smooth(blend)
  const ec = smooth(comp)

  const compLonByBody = useMemo(() => {
    const map = new Map<string, number>()
    if (compositePlacements?.length) {
      compositePlacements.forEach((p) => map.set(p.body, p.longitude))
    } else {
      const bByBody = new Map(b.map((p) => [p.body, p.longitude]))
      a.forEach((p) => {
        const lonB = bByBody.get(p.body)
        if (lonB === undefined) return
        const d = (((lonB - p.longitude) % 360) + 360) % 360
        map.set(
          p.body,
          d > 180
            ? (((lonB + (360 - d) / 2) % 360) + 360) % 360
            : (p.longitude + d / 2) % 360
        )
      })
    }
    return map
  }, [a, b, compositePlacements])

  const setA = useMemo(() => (highlightA?.length ? new Set(highlightA) : null), [highlightA])
  const setB = useMemo(() => (highlightB?.length ? new Set(highlightB) : null), [highlightB])
  const anyHighlight = !!(setA || setB)
  const stateFor = (body: string, side: 'a' | 'b'): MarkerState => {
    if (!anyHighlight) return 'normal'
    const own = side === 'a' ? setA : setB
    return own?.has(body) ? 'active' : 'muted'
  }

  // side positions: wheels slide from ±PAIR_X to the shared center
  const groupAX = -PAIR_X * (1 - eb)
  const groupBX = PAIR_X * (1 - eb)
  const radiusA = PAIR_R + (MERGED_A_R - PAIR_R) * eb + (COMPOSITE_R - MERGED_A_R) * ec
  const radiusB = PAIR_R + (MERGED_B_R - PAIR_R) * eb

  const markerFor = (p: Placement, side: 'a' | 'b') => {
    const compLon = compLonByBody.get(p.body)
    const longitude =
      ec > 0 && compLon !== undefined ? lerpAngle(p.longitude, compLon, ec) : p.longitude
    const radius = side === 'a' ? radiusA : radiusB + (COMPOSITE_R - radiusB) * ec
    return (
      <PlanetMarker
        key={`${side}-${p.body}`}
        placement={{ ...p, longitude }}
        radius={radius}
        color={side === 'a' ? colorA : colorB}
        sizeScale={side === 'b' ? 0.8 : 1}
        glyphScale={glyphScale}
        hidden={side === 'b' && ec > 0.5}
        state={stateFor(p.body, side)}
        onHover={(hp) => onHoverBody?.(hp, side)}
        onSelect={(sp) => onSelectBody?.(sp, side)}
      />
    )
  }

  const ringScaleA = radiusA / PAIR_R
  const ringRadiusB = PAIR_RING_R + (MERGED_B_R - PAIR_RING_R) * eb
  const ringScaleB =
    (ringRadiusB + (COMPOSITE_R - ringRadiusB) * ec) / PAIR_RING_R

  return (
    <group>
      {/* partner A wheel */}
      <group position={[groupAX, 0, 0]}>
        <group scale={[ringScaleA, 1, ringScaleA]}>
          <OrbitRings radii={pairRingRadii} visible={eb < 0.92} />
        </group>
        <NameSprite
          text={nameA}
          color={colorA}
          opacity={0.8 * (1 - eb)}
          position={[0, 0.2, -(PAIR_R + 1.6)]}
        />
        {a.map((p) => markerFor(p, 'a'))}
      </group>

      {/* partner B wheel */}
      <group position={[groupBX, 0, 0]}>
        <group scale={[ringScaleB, 1, ringScaleB]}>
          <OrbitRings radii={pairRingRadii} visible={ec < 0.5} />
        </group>
        <NameSprite
          text={nameB}
          color={colorB}
          opacity={0.8 * (1 - eb)}
          position={[0, 0.2, -(PAIR_R + 1.6)]}
        />
        {b.map((p) => markerFor(p, 'b'))}
      </group>
    </group>
  )
}
