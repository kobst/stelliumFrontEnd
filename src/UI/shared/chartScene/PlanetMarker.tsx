import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Line, useCursor } from '@react-three/drei'
import { GlyphSprite } from './GlyphSprite'
import { dampFactor, longitudeToPosition } from './utils'
import { ANGLES, BODIES, WHEEL_INNER_RADIUS } from './constants'
import { useScenePalette } from './sceneTheme'
import type { Placement } from './types'

// scratch vector reused across frames to avoid per-frame allocation
const scaleVec = new THREE.Vector3()

/** hover/selection visual treatment */
export type MarkerState = 'normal' | 'active' | 'related' | 'muted' | 'suppressed'

interface PlanetMarkerProps {
  placement: Placement
  radius: number
  /** shrink factor for secondary-ring markers */
  sizeScale?: number
  /** animates the marker's scale to zero (e.g. synastry layer in helio mode) */
  hidden?: boolean
  /** enlarges glyphs for small/top-down mounts */
  glyphScale?: number
  /** optional layer tint (used to distinguish relationship partners) */
  color?: string
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
  color,
  state = 'normal',
  onHover,
  onSelect,
}: PlanetMarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [pointerOver, setPointerOver] = useState(false)
  useCursor(pointerOver && !hidden)

  const target = useMemo(
    () => longitudeToPosition(placement.longitude, radius),
    [placement.longitude, radius],
  )
  const stateScale =
    state === 'active'
      ? 1.3
      : state === 'related'
        ? 0.92
        : state === 'suppressed'
          ? 0.58
          : state === 'muted'
            ? 0.85
            : 1
  const scaleTarget = hidden ? 0 : sizeScale * stateScale
  const palette = useScenePalette()

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
  })

  const info = BODIES[placement.body]
  const markerColor = color ?? (info ? palette.bodyColor(info.color) : undefined)
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
        {/* Invisible hit target: the ink look is glyph-only, but the sphere
            still carries hover/click raycasting. */}
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh visible={state === 'active'}>
        <ringGeometry args={[info.size * 1.55, info.size * 1.78, 32]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={0.82}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <GlyphSprite
        char={info.glyph}
        color={markerColor as string}
        position={[0, 0.02, 0]}
        scale={0.5 * glyphScale}
        opacity={
          state === 'suppressed'
            ? 0.06
            : state === 'related'
              ? 0.58
              : state === 'muted'
                ? 0.45
                : 1
        }
      />
      {placement.retrograde && (
        <GlyphSprite
          char="℞"
          color={palette.retro}
          position={[0.26, 0.2, 0]}
          scale={0.2 * glyphScale}
          opacity={
            state === 'suppressed'
              ? 0.04
              : state === 'related'
                ? 0.5
                : state === 'muted'
                  ? 0.4
                  : 0.9
          }
        />
      )}
    </group>
  )
}

/** Ascendant / MC rendered as a radial line + interactive label. */
export function AngleMarker({
  placement,
  state = 'normal',
  onHover,
  onSelect,
}: {
  placement: Placement
  state?: MarkerState
  onHover?: (placement: Placement | null) => void
  onSelect?: (placement: Placement) => void
}) {
  const palette = useScenePalette()
  const info = ANGLES[placement.body]
  if (!info) return null

  const inner = longitudeToPosition(placement.longitude, 0.4)
  const outer = longitudeToPosition(placement.longitude, WHEEL_INNER_RADIUS)
  const labelPos = longitudeToPosition(placement.longitude, WHEEL_INNER_RADIUS - 0.35, 0.15)
  const opacity =
    state === 'active'
      ? 1
      : state === 'related'
        ? 0.62
        : state === 'suppressed'
          ? 0.06
          : state === 'muted'
            ? 0.3
            : 0.85
  const labelScale =
    state === 'active'
      ? 0.5
      : state === 'related'
        ? 0.35
        : state === 'suppressed'
          ? 0.2
          : 0.32

  return (
    <group>
      <Line
        points={[inner, outer]}
        color={palette.angleColor(info.color)}
        lineWidth={1}
        transparent
        opacity={state === 'active' ? 0.95 : opacity * 0.55}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
      <GlyphSprite
        char={info.label}
        color={palette.angleColor(info.color)}
        position={[labelPos.x, labelPos.y, labelPos.z]}
        scale={labelScale}
        opacity={opacity}
      />
      {state === 'active' && (
        <GlyphSprite
          char="◯"
          color={palette.edge}
          position={[labelPos.x, labelPos.y + 0.01, labelPos.z]}
          scale={0.82}
          opacity={0.9}
        />
      )}
      <mesh
        position={labelPos}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover?.(placement)
        }}
        onPointerOut={() => onHover?.(null)}
        onClick={(event) => {
          event.stopPropagation()
          onSelect?.(placement)
        }}
      >
        <sphereGeometry args={[0.48, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
