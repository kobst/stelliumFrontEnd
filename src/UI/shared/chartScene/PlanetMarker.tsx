import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Line, useCursor } from '@react-three/drei'
import { GlyphSprite } from './GlyphSprite'
import { dampFactor, longitudeToPosition } from './utils'
import { ANGLES, BODIES, WHEEL_INNER_RADIUS } from './constants'
import type { Placement } from './types'

// scratch vector reused across frames to avoid per-frame allocation
const scaleVec = new THREE.Vector3()

const BASE_EMISSIVE = 2.2

/** hover/selection visual treatment */
export type MarkerState = 'normal' | 'active' | 'muted'

interface PlanetMarkerProps {
  placement: Placement
  radius: number
  /** shrink factor for secondary-ring markers */
  sizeScale?: number
  /** animates the marker's scale to zero (e.g. synastry layer in helio mode) */
  hidden?: boolean
  /** enlarges glyphs for small/top-down mounts */
  glyphScale?: number
  /** active = hovered/selected; muted = another body is selected */
  state?: MarkerState
  onHover?: (placement: Placement | null) => void
  onSelect?: (placement: Placement) => void
}

/** A glowing sphere + billboarded glyph for a planet placement. */
export function PlanetMarker({
  placement,
  radius,
  sizeScale = 1,
  hidden = false,
  glyphScale = 1,
  state = 'normal',
  onHover,
  onSelect,
}: PlanetMarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const [pointerOver, setPointerOver] = useState(false)
  useCursor(pointerOver && !hidden)

  const target = useMemo(
    () => longitudeToPosition(placement.longitude, radius),
    [placement.longitude, radius],
  )
  const stateScale = state === 'active' ? 1.3 : state === 'muted' ? 0.85 : 1
  const scaleTarget = hidden ? 0 : sizeScale * stateScale
  const emissiveTarget =
    state === 'active' ? 3.4 : state === 'muted' ? 1.1 : BASE_EMISSIVE

  // mount position/scale stay fixed; the lerp below owns them afterwards,
  // so reactive props would snap on every mode change
  const initial = useRef({ position: target, scale: scaleTarget })

  // glide toward the targets so mode switches animate instead of snapping
  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const f = dampFactor(delta)
    group.position.lerp(target, f)
    group.scale.lerp(scaleVec.set(scaleTarget, scaleTarget, scaleTarget), f)
    const mat = materialRef.current
    if (mat) mat.emissiveIntensity += (emissiveTarget - mat.emissiveIntensity) * f
  })

  const info = BODIES[placement.body]
  if (!info) return null

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    if (hidden) return
    e.stopPropagation()
    setPointerOver(true)
    onHover?.(placement)
  }
  const handleOut = () => {
    setPointerOver(false)
    onHover?.(null)
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (hidden) return
    e.stopPropagation()
    onSelect?.(placement)
  }

  return (
    <group
      ref={groupRef}
      position={initial.current.position}
      scale={initial.current.scale}
    >
      <mesh
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[info.size, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={info.color}
          emissive={info.color}
          emissiveIntensity={BASE_EMISSIVE}
          toneMapped={false}
        />
      </mesh>
      <mesh visible={state === 'active'}>
        <ringGeometry args={[info.size * 1.55, info.size * 1.78, 32]} />
        <meshBasicMaterial
          color={info.color}
          transparent
          opacity={0.82}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <GlyphSprite
        char={info.glyph}
        color={info.color}
        position={[0, info.size + 0.28, 0]}
        scale={0.45 * glyphScale}
        opacity={state === 'muted' ? 0.45 : 1}
      />
      {placement.retrograde && (
        <GlyphSprite
          char="℞"
          color="#ff8f8f"
          position={[0.24, info.size + 0.4, 0]}
          scale={0.2 * glyphScale}
          opacity={state === 'muted' ? 0.4 : 0.9}
        />
      )}
    </group>
  )
}

/** Ascendant / MC rendered as a radial line + label instead of a sphere. */
export function AngleMarker({ placement }: { placement: Placement }) {
  const info = ANGLES[placement.body]
  if (!info) return null

  const inner = longitudeToPosition(placement.longitude, 0.4)
  const outer = longitudeToPosition(placement.longitude, WHEEL_INNER_RADIUS)
  const labelPos = longitudeToPosition(placement.longitude, WHEEL_INNER_RADIUS - 0.35, 0.15)

  return (
    <group>
      <Line
        points={[inner, outer]}
        color={info.color}
        lineWidth={1}
        transparent
        opacity={0.5}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
      <GlyphSprite
        char={info.label}
        color={info.color}
        position={[labelPos.x, labelPos.y, labelPos.z]}
        scale={0.32}
        opacity={0.85}
      />
    </group>
  )
}
