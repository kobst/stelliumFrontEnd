import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { Line2 } from 'three-stdlib'
import { dampFactor, longitudeToPosition } from './utils'
import { ASPECT_COLORS, ASPECT_MAX_ORB } from './constants'
import type {
  Aspect,
  BodySelection,
  ChartLayer,
  Placement,
} from './types'

/** 0 (at max orb) → 1 (exact); drives opacity and thickness */
function orbStrength(aspect: Aspect): number {
  const maxOrb = ASPECT_MAX_ORB[aspect.type]
  return Math.min(1, Math.max(0, 1 - aspect.orb / maxOrb))
}

interface Endpoint {
  placement: Placement
  radius: number
}

interface AspectLineProps {
  aspect: Aspect
  from: Endpoint
  to: Endpoint
  visible: boolean
  /** inter-chart (synastry) lines render brighter with additive glow */
  emphasized: boolean
  /** a selection exists somewhere in the scene */
  focusMode: boolean
  /** this line touches the selected body */
  involved: boolean
  /** external highlight set exists (chapter emphasis) */
  highlightMode: boolean
  /** both endpoints are in the external highlight set */
  highlighted: boolean
  onSelect?: (aspect: Aspect) => void
}

function AspectLine({
  aspect,
  from,
  to,
  visible,
  emphasized,
  focusMode,
  involved,
  highlightMode,
  highlighted,
  onSelect,
}: AspectLineProps) {
  const lineRef = useRef<Line2>(null)

  const strength = orbStrength(aspect)
  const baseOpacity = emphasized ? 0.35 + strength * 0.6 : 0.12 + strength * 0.55
  const targetOpacity = !visible
    ? 0
    : focusMode
      ? involved
        ? Math.min(0.95, baseOpacity + 0.3)
        : 0.04
      : highlightMode
        ? highlighted
          ? Math.min(0.95, baseOpacity + 0.3)
          : 0.05
        : baseOpacity

  const points = useMemo(
    () => [
      longitudeToPosition(from.placement.longitude, from.radius),
      longitudeToPosition(to.placement.longitude, to.radius),
    ],
    [from.placement.longitude, from.radius, to.placement.longitude, to.radius],
  )

  // opacity is animated here, so mode toggles fade rather than pop
  const initialOpacity = useRef(targetOpacity)
  useFrame((_, delta) => {
    const mat = lineRef.current?.material
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <Line
      ref={lineRef}
      points={points}
      color={ASPECT_COLORS[aspect.type]}
      lineWidth={(emphasized ? 1.5 : 1) + strength * (emphasized ? 2.5 : 2)}
      transparent
      opacity={initialOpacity.current}
      depthWrite={false}
      blending={emphasized ? THREE.AdditiveBlending : THREE.NormalBlending}
      onClick={onSelect ? (event) => {
        event.stopPropagation()
        onSelect(aspect)
      } : undefined}
    />
  )
}

interface LayerDef {
  placements: Placement[]
  radius: number
}

interface AspectLinesProps {
  aspects: Aspect[]
  natal: LayerDef
  secondary?: LayerDef
  /** layer assumed when an aspect omits layerA/layerB */
  defaultLayers?: [ChartLayer, ChartLayer]
  visible: boolean
  emphasized?: boolean
  /** selected body; lines touching it boost, the rest fade back */
  focus?: BodySelection | null
  /** external emphasis set; lines between highlighted bodies boost */
  highlightBodies?: string[]
  /** only render aspects touching one body, or connecting a supplied pair */
  isolateBodies?: string[]
  onSelectAspect?: (aspect: Aspect) => void
}

/**
 * Aspect lines: color-coded by type, opacity/thickness scaled by orb
 * tightness. Endpoints resolve through chart layers so the same
 * component draws natal-only webs and inter-chart (synastry) lines.
 * Faded out in heliocentric mode — these are geocentric angles.
 */
export function AspectLines({
  aspects,
  natal,
  secondary,
  defaultLayers = ['natal', 'natal'],
  visible,
  emphasized = false,
  focus = null,
  highlightBodies,
  isolateBodies,
  onSelectAspect,
}: AspectLinesProps) {
  const highlightSet = useMemo(
    () => (highlightBodies?.length ? new Set(highlightBodies) : null),
    [highlightBodies],
  )

  const isolateSet = useMemo(
    () => (isolateBodies?.length ? new Set(isolateBodies) : null),
    [isolateBodies],
  )

  const byLayer = useMemo(() => {
    const index = (layer?: LayerDef) =>
      new Map((layer?.placements ?? []).map((p) => [p.body, p]))
    return {
      natal: { byBody: index(natal), radius: natal.radius },
      secondary: { byBody: index(secondary), radius: secondary?.radius ?? 0 },
    }
  }, [natal, secondary])

  const resolve = (body: string, layer: ChartLayer): Endpoint | null => {
    const { byBody, radius } = byLayer[layer]
    const placement = byBody.get(body)
    return placement ? { placement, radius } : null
  }

  return (
    <group>
      {aspects.map((aspect) => {
        if (
          isolateSet &&
          (isolateSet.size === 1
            ? !isolateSet.has(aspect.bodyA) && !isolateSet.has(aspect.bodyB)
            : !isolateSet.has(aspect.bodyA) || !isolateSet.has(aspect.bodyB))
        ) {
          return null
        }
        const layerA = aspect.layerA ?? defaultLayers[0]
        const layerB = aspect.layerB ?? defaultLayers[1]
        const from = resolve(aspect.bodyA, layerA)
        const to = resolve(aspect.bodyB, layerB)
        if (!from || !to) return null
        const involved =
          !!focus &&
          ((focus.layer === layerA && focus.body === aspect.bodyA) ||
            (focus.layer === layerB && focus.body === aspect.bodyB))
        // group emphasis boosts lines *within* the group; a single-body
        // emphasis boosts that body's whole web
        const highlighted =
          !!highlightSet &&
          (highlightSet.size === 1
            ? highlightSet.has(aspect.bodyA) || highlightSet.has(aspect.bodyB)
            : highlightSet.has(aspect.bodyA) && highlightSet.has(aspect.bodyB))
        const key = `${layerA}:${aspect.bodyA}-${aspect.type}-${layerB}:${aspect.bodyB}`
        return (
          <AspectLine
            key={key}
            aspect={aspect}
            from={from}
            to={to}
            visible={visible}
            emphasized={emphasized}
            focusMode={!!focus}
            involved={involved}
            highlightMode={!!highlightSet}
            highlighted={highlighted}
            onSelect={onSelectAspect}
          />
        )
      })}
    </group>
  )
}
