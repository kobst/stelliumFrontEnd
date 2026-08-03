import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { GlyphSprite } from './GlyphSprite'
import { circlePoints, longitudeToPosition } from './utils'
import {
  SIGNS,
  SIGN_GLYPH_RADIUS,
  WHEEL_INNER_RADIUS,
  WHEEL_OUTER_RADIUS,
} from './constants'
import { useScenePalette } from './sceneTheme'

/** Small tick marks every 10° along the inner edge, as one LineSegments. */
function DegreeTicks() {
  const palette = useScenePalette()
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (let deg = 0; deg < 360; deg += 10) {
      if (deg % 30 === 0) continue // sign dividers cover these
      const inner = longitudeToPosition(deg, WHEEL_INNER_RADIUS)
      const outer = longitudeToPosition(deg, WHEEL_INNER_RADIUS + 0.18)
      positions.push(inner.x, inner.y, inner.z, outer.x, outer.y, outer.z)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={palette.tick} transparent opacity={0.8} />
    </lineSegments>
  )
}

interface ZodiacWheelProps {
  /** enlarges glyphs for small/top-down mounts */
  glyphScale?: number
  /**
   * In heliocentric mode the band is still a valid ecliptic direction
   * dial, but it no longer shows sign *placements* — dim the glyphs to a
   * neutral tint so it reads as a reference frame.
   */
  dimmed?: boolean
  visible?: boolean
}

export function ZodiacWheel({ dimmed = false, glyphScale = 1, visible = true }: ZodiacWheelProps) {
  const palette = useScenePalette()
  const outerCircle = useMemo(() => circlePoints(WHEEL_OUTER_RADIUS), [])
  const innerCircle = useMemo(() => circlePoints(WHEEL_INNER_RADIUS), [])

  return (
    <group visible={visible}>
      {/* translucent band on the ecliptic plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[WHEEL_INNER_RADIUS, WHEEL_OUTER_RADIUS, 96]} />
        <meshBasicMaterial
          color={palette.band}
          transparent
          opacity={palette.bandOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* glowing edge rings */}
      <Line points={outerCircle} color={palette.edge} lineWidth={1.5} />
      <Line points={innerCircle} color={palette.edge} lineWidth={1} />

      {/* 12 sign dividers */}
      {SIGNS.map((_, i) => {
        const deg = i * 30
        return (
          <Line
            key={deg}
            points={[
              longitudeToPosition(deg, WHEEL_INNER_RADIUS),
              longitudeToPosition(deg, WHEEL_OUTER_RADIUS),
            ]}
            color={palette.divider}
            lineWidth={1}
          />
        )
      })}

      <DegreeTicks />

      {/* sign glyphs at mid-sign, floating just above the band; the
          element-colored and neutral variants cross-fade with `dimmed` */}
      {SIGNS.map((sign, i) => {
        const midDeg = i * 30 + 15
        // Lift glyphs well above the band so transparent-object sort order
        // can never draw them underneath the parchment fill.
        const pos = longitudeToPosition(midDeg, SIGN_GLYPH_RADIUS, 0.35)
        return (
          <group key={sign.name}>
            <GlyphSprite
              char={sign.glyph}
              color={palette.signColor(sign.color)}
              position={[pos.x, pos.y, pos.z]}
              scale={0.42 * glyphScale}
              opacity={dimmed ? 0 : 0.9}
            />
            <GlyphSprite
              char={sign.glyph}
              color={palette.neutralGlyph}
              position={[pos.x, pos.y, pos.z]}
              scale={0.42 * glyphScale}
              opacity={dimmed ? 0.55 : 0}
            />
          </group>
        )
      })}
    </group>
  )
}
